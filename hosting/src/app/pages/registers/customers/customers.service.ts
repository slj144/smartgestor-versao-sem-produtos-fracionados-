import { Injectable } from "@angular/core";
import { EventEmitter } from 'events';
import { iTools } from '../../../../assets/tools/iTools';

// Services
import { IToolsService } from '@shared/services/iTools.service';
import { SystemLogsService } from '@shared/services/system-logs.service';
import { NotificationService } from '@shared/services/notification.service';

// Translate
import { CustomersTranslate } from "./customers.translate";

// Interfaces
import { IBatch } from '@itools/interfaces/IBatch';
import { ICollection } from '@itools/interfaces/ICollection';
import { IRegistersCustomer } from '@shared/interfaces/IRegistersCustomer';
import { ISystemLog, ESystemLogType, ESystemLogAction } from '@shared/interfaces/ISystemLog';
import { ENotificationStatus } from '@shared/interfaces/ISystemNotification';

// Types
import { query } from "@shared/types/query";

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';

@Injectable({ providedIn: 'root' })
export class CustomersService { 

  public translate = CustomersTranslate.get();

  private data: { [_id: string]: IRegistersCustomer } = {};

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

  // Getter Methods

  public get limit() {
    return this.settings.limit;
  }

  // Query Methods

  public query(where?: query['where'], reset: boolean = true, flex: boolean = false, scrolling: boolean = false, strict: boolean = true, limit: number = 0, others?: {back?: boolean, orderBy?: any } ) {

    return (new Promise<IRegistersCustomer[]>((resolve) => {

      const queryObject: query = {
        start: (this.settings.start * this.settings.limit),
        limit: limit > 0 ? limit : this.settings.limit 
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

      if (reset) {
        this.data = {};
        this.firstScrolling = false;
        this.settings.start = queryObject.start = 0;
      }
      
      if (!reset && !this.firstScrolling) {
        this.settings.start = 1;
        this.firstScrolling = true;
        queryObject.start = (this.settings.start * queryObject.limit);
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

  public getCustomers(listenerId: string, listener: ((status: any)=>void)) {
       
    const emitterId = 'records';

    Utilities.onEmitterListener(this._dataMonitors, emitterId, listenerId, listener);
    
    if (this._checkRequest) {
      this._dataMonitors.emit(emitterId, this.treatData(emitterId));
    } 
  }

  public async registerCustomer(data: IRegistersCustomer, batch?: IBatch) {

    return (new Promise<void>(async (resolve, reject) => {
      
      const checkBatch = (batch != undefined);
      const operation = (!data.code ? 'register' : 'update');

      try {

        if (!batch) { Utilities.loading() }

        batch = (batch || this.iToolsService.database().batch());

        let docRef: any = this.collRef().doc(data._id);
   
        if (!data.code) {
          data.code = iTools.FieldValue.control('SystemControls', Utilities.storeID, `${this.collRef().id}.code`);
          data.owner = Utilities.storeID;
          data.registerDate = iTools.FieldValue.date(Utilities.timezone);
        } else {

          data.code = parseInt(<string>data.code);

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
          await this.checkRelatedCollections(data, batch, batchRef);
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

  public async deleteCustomer(data: IRegistersCustomer, batch?: IBatch) {

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

  public getCustomersCount(listenerId: string, listener: ((_: any)=>void)) {
      
    const emitterId = 'count';

    Utilities.onEmitterListener(this._dataMonitors, emitterId, listenerId, listener);

    if (this._checkRequest) {
      this._dataMonitors.emit(emitterId, this.treatData(emitterId));
    }
  }

  // Check Documents

  public async checkDocument(value: string, userCode: string, type: ('personalDocument'|'businessDocument'|'foreignerDocument')) {

    return (new Promise<any>(async (resolve, reject) => {
      
      const settings: query = {
        where: [
          { field: `${type}.value`, operator: '=', value: value }
        ]
      };

      if (userCode) {
        settings.where.push(
          { field: `code`, operator: '!=', value: parseInt(<string>userCode) }
        );
      }

      this.collRef(settings).count().get().then((res) => {
        resolve({ result: (res.docs.length > 0 ? res.docs[0].data().count : 0) });
      }).catch((error) => {
        reject(error);
      });
    }));      
  }

  // Auxiliary Methods - Logs

  private async systemLogs(data: IRegistersCustomer, action: string, batch: IBatch, batchRef?: number) {

    const settings: ISystemLog = {
      data: [<any>{}]
    };    
    
    settings.data[0].referenceCode = (action == 'register' ? iTools.FieldValue.bindBatchData(batchRef, 'code') : data.code);
    settings.data[0].type = ESystemLogType.RegistersCustomers;

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

    const collection = this.iToolsService.database().collection('RegistersCustomers');

    settings = Utilities.deepClone(settings || {});

    if (settings.orderBy) {
      settings.orderBy = {code: <any>settings.orderBy };
    } else {
      settings.orderBy = { code: 1 };
    }

    collection.orderBy(settings.orderBy);

    if (settings.where) {
      settings.where.push({ field: 'owner', operator: '=', value: Utilities.storeID });
    } else {
      settings.where = [{ field: 'owner', operator: '=', value: Utilities.storeID }];
    }

    collection.where(settings.where);
    
    if (settings.or) {
      collection.or(settings.or);
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

  private async checkRelatedCollections(data, batch, batchRef){

    const serviceOrders = (await this.iToolsService.database().collection("ServiceOrders").where([
      {field: "customer.code", operator: "=", value: Utilities.prefixCode(data.code)},
      {field: "paymentStatus", operator: "=", value: "PENDENT"}
    ]).get());

    const cashierSales = (await this.iToolsService.database().collection("CashierSales").where([
      {field: "customer.code", operator: "=", value: Utilities.prefixCode(data.code)},
      {field: "status", operator: "=", value: "PENDENT"}
    ]).get());

    const financialBillsToReceive = (await this.iToolsService.database().collection("FinancialBillsToReceive").where([
      {field: "debtor.code", operator: "=", value: Utilities.prefixCode(data.code)},
      {field: "status", operator: "=", value: "PENDENT"}
    ]).get());

    const registerVehicles = (await this.iToolsService.database().collection("RegistersVehicles").where([
      {field: "proprietary.code", operator: "=", value: Utilities.prefixCode(data.code)},
    ]).get());

    registerVehicles?.docs?.forEach((item)=>{
      batch.update(item.ref, {proprietary: Utilities.mountCustomerObject(data, "RegistersVehicles")}, {merge: true})
    });

    serviceOrders?.docs?.forEach((item)=>{
      batch.update(item.ref, {customer: Utilities.mountCustomerObject(data, "serviceOrders")}, {merge: true})
    });

    cashierSales?.docs?.forEach((item)=>{
      batch.update(item.ref, {customer: Utilities.mountCustomerObject(data, "cashierSales")}, {merge: true})
    });

    financialBillsToReceive?.docs?.forEach((item)=>{
      batch.update(item.ref, {debtor: Utilities.mountCustomerObject(data, "financialBillsToReceive")}, {merge: true})
    });

  }

  // Data Processing

  public removeListeners(emitterId: string = null, listenerId: string | string[] = null) {
    Utilities.offEmitterListener(this._dataMonitors, emitterId, listenerId);
  }

  private requestData(settings: query, strict: boolean) {

    return (new Promise<IRegistersCustomer[]>((resolve, reject) => {

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

            this._dataMonitors.emit('records', this.treatData('records', null,  (<any>settings.orderBy) || 1));
            this._checkRequest = true;          
            this._checkProcess = false;
            
            resolve(this.treatData('records', null,  (<any>settings.orderBy) || 1));
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

  private treatData(id: string, data?: IRegistersCustomer[], order: 1 | -1 = 1) {

    if (id == 'count') {

      const result: any = { 
        current: $$(data || this.data).length, total: this.settings.count
      };

      return result;
    }

    if (id == 'records') {
    
      const records = [];

      $$(Utilities.deepClone(data || this.data)).map((_, item) => {
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
