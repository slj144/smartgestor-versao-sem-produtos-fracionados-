import { Injectable } from "@angular/core";
import { EventEmitter } from 'events';
import { iTools } from "@itools/index";

// Services
import { IToolsService } from '@shared/services/iTools.service';
import { SystemLogsService } from '@shared/services/system-logs.service';
import { NotificationService } from '@shared/services/notification.service';

// Translate
import { SchemesTranslate } from "./schemes.translate";

// Interfaces
import { IBatch } from '@itools/interfaces/IBatch';
import { ICollection } from '@itools/interfaces/ICollection';
import { IRegistersScheme } from '@shared/interfaces/IRegistersScheme';
import { ISystemLog, ESystemLogType, ESystemLogAction } from '@shared/interfaces/ISystemLog';
import { ENotificationStatus } from '@shared/interfaces/ISystemNotification';

// Types
import { query } from "@shared/types/query";

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';

@Injectable({ providedIn: 'root' })
export class SchemesService {
  
  public translate = SchemesTranslate.get();

  private data: { [_id: string]: IRegistersScheme } = {};

  private _checkProcess: boolean = false;
  private _checkRequest: boolean = false;
  private _dataMonitors: EventEmitter = new EventEmitter();

  private firstScrolling = false;
  private settings: any = { start: 0, limit: 60, count: 0, snapshotRef: null };

  constructor(
    private iToolsService: IToolsService,
    private systemLogsService: SystemLogsService,
    private notificationService: NotificationService
  ) {
    this.query();
  }

  // Getter and Setter Methods

  public get limit() {
    return this.settings.limit;
  }

  // Query Methods

  public query(where?: query['where'], reset: boolean = true, flex: boolean = false, scrolling: boolean = false, strict: boolean = true, others?: {back?: boolean, orderBy?: any }) {

    return (new Promise<IRegistersScheme[]>((resolve) => {

      const queryObject: query = {
        start: (this.settings.start * this.settings.limit),
        limit: this.settings.limit 
      };

      if (where) {
        
        if (strict && !scrolling) {
          this.data = {};
          this.settings.start = 0;
        }

        if (!flex) {
          queryObject.where = where;
        } else {
          queryObject.or = where;
        }
        
        queryObject.start = 0;
      }

      if (reset && strict) {
        this.data = {};
        this.firstScrolling = false;
        this.settings.start = queryObject.start = 0;
      }
      
      if (!reset && !this.firstScrolling) {
        this.settings.start = 1;
        this.firstScrolling = true;
        queryObject.start = (this.settings.start * this.settings.limit);
      }


      if (others && others.orderBy){
        queryObject.orderBy = others.orderBy;
      }

      this.requestData(queryObject, strict).then((data) => {
        if (!reset) { this.settings.start += 1 }
        resolve(data);
      });
    }));
  }

  // CRUD Methods

  public getSchemes(listenerId: string, listener: ((_: any)=>void)) {
       
    const emitterId = 'records';
    
    Utilities.onEmitterListener(this._dataMonitors, emitterId, listenerId, listener);  

    if (this._checkRequest) {
      this._dataMonitors.emit(emitterId, this.treatData(emitterId));
    }
  }

  public async registerScheme(data: IRegistersScheme, batch?: IBatch) {

    return (new Promise<void>(async (resolve, reject) => {
      
      const checkBatch = (batch != undefined);
      const operation = (!data.code ? 'register' : 'update');

      try {

        if (!batch) { Utilities.loading() }

        batch = (batch || this.iToolsService.database().batch());
   
        let docRef: any = this.collRef().doc(data._id);
        let remoteData: any;

        if (!data.code) {
          data.code = iTools.FieldValue.control('SystemControls', 'common', `${this.collRef().id}.code`);
          data.owner = Utilities.storeID;
          data.registerDate = iTools.FieldValue.date(Utilities.timezone);
        } else {

          data.code = parseInt(<string>data.code);

          remoteData = (<any>(await this.query([{field: "code", operator: "=", value: data.code}], false, false, false, false))[0]);

          if (!data._id) {

            docRef = { collName: this.collRef().id, where: [
              { field: 'code', operator: '=', value: data.code },
              { field: 'owner', operator: '=', value: Utilities.storeID }
            ] };
          }
        }
        
        data.modifiedDate = iTools.FieldValue.date(Utilities.timezone);

        const batchRef = batch.update(docRef, data, { merge: true });

        if(operation == "update"){
          // await this.checkRelatedCollections(remoteData, data, batch, batchRef);
        }

        await this.systemLogs(data, operation, batch, batchRef);

        if (!checkBatch) {

          batch.commit().then(() => { 

            Utilities.loading(false);
            resolve();

            this.notifications(operation, 'success');
          }).catch((error) => {

            Utilities.loading(false);
            reject(error);

            this.notifications(operation, 'error');
            console.error(`Error: ${error.message}`);
          });
        } else {
          resolve();
        }
      } catch(error) {

        Utilities.loading(false);

        if (!checkBatch) {
          this.notifications(operation, 'error');
          console.error(`Error: ${error.message}`);
        }

        reject(error);
      }
    }));     
  } 

  public async deleteScheme(data: IRegistersScheme, batch?: IBatch) {

    return (new Promise<void>(async (resolve, reject) => {

      const checkBatch = (batch != undefined);

      try {

        if (!batch) { Utilities.loading() }

        batch = (batch || this.iToolsService.database().batch());
        batch.delete(this.collRef().doc(data._id));

        await this.systemLogs(data, 'delete', batch);

        if (!checkBatch) {

          batch.commit().then(() => { 

            Utilities.loading(false);
            resolve();

            this.notifications('delete', 'success');
          }).catch((error) => {

            Utilities.loading(false);
            reject(error);

            this.notifications('delete', 'error');
            console.error(`Error: ${error.message}`);
          });
        } else {
          resolve();
        }
      } catch(error) {

        Utilities.loading(false);

        if (!checkBatch) {
          this.notifications('delete', 'error');
          console.error(`Error: ${error.message}`);
        }

        reject(error);
      }
    }));
  }

  // Count Methods

  public getSchemesCount(listenerId: string, listener: ((_: any)=>void)) {
    
    const emitterId = 'count';

    Utilities.onEmitterListener(this._dataMonitors, emitterId, listenerId, listener);

    if (this._checkRequest) {
      this._dataMonitors.emit(emitterId, this.treatData(emitterId));
    }
  }

  // Auxiliary Methods - Logs

  private async systemLogs(data: IRegistersScheme, action: string, batch: IBatch, batchRef?: number) {

    const settings: ISystemLog = {
      data: [<any>{}]
    };    
    
    settings.data[0].referenceCode = (action == 'register' ? iTools.FieldValue.bindBatchData(batchRef, 'code') : data.code);
    settings.data[0].type = ESystemLogType.RegistersServices;

    if (action == 'register') {
      settings.data[0].action = ESystemLogAction.REGISTER;
      settings.data[0].note = this.translate.systemLog.register;
    }

    if (action == 'update') {
      settings.data[0].action = ESystemLogAction.UPDATE;
      settings.data[0].note = this.translate.systemLog.update;
    }
    
    if (action == 'delete') {
      settings.data[0].action = ESystemLogAction.DELETION;
      settings.data[0].note = this.translate.systemLog.delete;
    }

    return this.systemLogsService.registerLogs(settings, batch);
  }

  // Utility Methods
  
  private collRef(settings?: query): ICollection {

    const collection = this.iToolsService.database().collection('RegistersRequestSchemes');

    settings = Utilities.deepClone(settings || {});

    if (settings.orderBy) {
      settings.orderBy = {code: <any>settings.orderBy};
    } else {
      settings.orderBy = { code: 1 };
    }
    
    collection.orderBy(settings.orderBy);

    if (!settings.or) {
      settings.or = [{ field: 'owner', operator: '=', value: 'matrix' }];
      if (Utilities.storeID != 'matrix') {
        settings.or.push({ field: 'owner', operator: '=', value: Utilities.storeID });
      }   
    } else {
      if (Utilities.storeID != 'matrix') {
        settings.or.push({ field: 'owner', operator: '=', value: Utilities.storeID });
      }    
    }

    collection.or(settings.or);

    if (settings.where) {
      collection.where(settings.where);
    }

    if ((settings.start != undefined) && (settings.start >= 0)) {
      collection.startAfter(settings.start);
    }

    if ((settings.limit != undefined) && (settings.limit > 0)) {
      collection.limit(settings.limit);
    }

    return collection;
  }

  private notifications(action: string, result: string, storage: boolean = false) {

    const settings: any = {
      title: this.translate.pageTitle
    };

    if (result == 'success') {

      if (action == 'register') {
        settings.description = this.translate.notification.register;
      }

      if (action == 'update') {
        settings.description = this.translate.notification.update;
      }

      if (action == 'delete') {
        settings.description = this.translate.notification.delete;
      }

      settings.status = ENotificationStatus.success;
    }

    if (result == 'error') {
      settings.description = this.translate.notification.error;
      settings.status = ENotificationStatus.danger;
    }

    this.notificationService.create(settings, storage);
  } 

  private async checkRelatedCollections(remoteData, newData, batch, batchRef){

    const serviceOrders = (await this.iToolsService.database().collection("ServiceOrders").where([
      {field: "customer.code", operator: "=", value: Utilities.prefixCode(remoteData.proprietary.code)},
      {field: "paymentStatus", operator: "=", value: "PENDENT"}
    ]).get());

    const obj: any = {};

    if(newData.color){ obj.color = newData.color; }
    if(newData.mileage){ obj.mileage = newData.mileage; }
    if(newData.model){ obj.model = newData.model; }
    if(newData.chassis){ obj.chassis = newData.chassis; }
    if(newData.plate){ obj.plate = newData.plate; }

    serviceOrders?.docs?.forEach((item)=>{
      batch.update(item.ref, {
        customer: Utilities.mountCustomerObject(newData.proprietary, "serviceOrders"),
        vehicle: obj
      }, {merge: true})
    });

  }

  // Data Processing

  public removeListeners(emitterId: string = null, listenerId: string | string[] = null) {
    Utilities.offEmitterListener(this._dataMonitors, emitterId, listenerId);
  }

  private requestData(settings: query, strict: boolean) {

    return (new Promise<IRegistersScheme[]>((resolve, reject) => {

      if (strict) {

        if (!this._checkProcess) {

          this._checkProcess = true;
          
          if (this.settings.snapshotRef) {
            this.collRef().clearSnapshot(this.settings.snapshotRef);
          }

          this.settings.snapshotRef = this.collRef(settings).onSnapshot((res) => {

            if (res.changes().length == 0) {
      
              for (const doc of res.docs) {
                const docData = doc.data();
                this.data[docData._id] = docData;
              }      
            } else {
      
              for (const doc of res.changes()) {

                const docData = doc.data();
      
                if (doc.type == 'ADD' || doc.type == 'UPDATE') {            
                  this.data[docData._id] = docData;
                }
      
                if (doc.type == 'DELETE') {
                  if (this.data[docData._id]) {
                    delete this.data[docData._id];
                  }
                }
              }
            }

            this.collRef(settings).count().get().then((res) => {
              this.settings.count = (res.docs.length > 0 ? res.docs[0].data().count : 0);
              this._dataMonitors.emit('count', this.treatData('count'));
            });

            this._dataMonitors.emit('records', this.treatData('records', null, (<any>settings.orderBy) || 1));
            this._checkRequest = true;          
            this._checkProcess = false;
            
            resolve(this.treatData('records', null, (<any>settings.orderBy) || 1));
          });
        }
      } else {

        if (settings.start != undefined && settings.start >= 0) {
          delete settings.start;
        }

        if (settings.limit != undefined && settings.limit > 0) {
          delete settings.limit;
        }

        this.collRef(settings).count().get().then((res) => {

          const count = (res.docs.length > 0 ? res.docs[0].data().count : 0);
          const requestsCount = Math.ceil(count / 500);

          let data = [];
          let control = 1;          
          let success = null;
          let error = null;
          
          settings.start = 0;
          settings.limit = 500;

          const requestRecursive = (settings: query) => {

            try {              

              this.collRef(settings).get().then((res) => {
    
                for (const doc of res.docs) {
                  data.push(doc.data());
                }         
                
                if (requestsCount > 1) {

                  if (control <= requestsCount) {
      
                    settings.start = (settings.limit * control);
                    control++;
      
                    setTimeout(() => {
                      if (control < (requestsCount + 1)) {
                        requestRecursive(settings);
                      }
                    }, 200);
                  }
      
                  if (control == (requestsCount + 1)) {
                    success = true;
                  }
                } else {
                  success = true;
                }
              }).catch((e) => {
                throw new Error(e);
              });
            } catch(e) {
              error = e;
            }                      
          };

          if (count > 0) {
            requestRecursive(settings);
          } else {
            success = true;
          }
          
          const timer = setInterval(() => {

            if (success) {
              clearInterval(timer);
              resolve(this.treatData('records', data));  
            }

            if (error) {
              clearInterval(timer);
            }
          }, 200);
        });
      }
    }));
  }

  private treatData(id: string, data?: IRegistersScheme[], order: 1 | -1 = 1) {

    if (id == 'count') {

      const result: any = { 
        current: $$(data || this.data).length, total: this.settings.count
      };

      return result;
    }

    if (id == 'records') {
    
      const records = [];

      $$(Utilities.deepClone(data || this.data)).map((_, item) => {

        if (!Utilities.isAdmin) {
          $$(data).map((key, item) => {
            if (item._isDisabled) { data.splice(key, 1) }
          });
        }

        if (!Utilities.isMatrix){
          if (item.branches) {
            const data = (item.branches[Utilities.storeID] || {});
            item.costPrice = (data.costPrice != undefined ? data.costPrice : item.costPrice) || 0;
            item.executionPrice = (data.executionPrice != undefined ? data.executionPrice : item.executionPrice) || 0;
            item.tributes = data.tributes || item.tributes;
            delete item.branches;
          }
        }

        item.code = Utilities.prefixCode(item.code);
        records.push(item);
      });     
      
      records.sort((a, b) => {
        return order == 1 ? ((a.code < b.code) ? -1 : ((a.code > b.code) ? 1 : 0)) : ((a.code < b.code) ? 1 : ((a.code > b.code) ? -1 : 0));
      });

      return records;
    }
  }

}
