import { Injectable } from "@angular/core";
import { EventEmitter } from 'events';
import { iTools } from '../../../assets/tools/iTools';

// Services
import { IToolsService } from '@shared/services/iTools.service';
import { ProductsService } from "../stock/products/products.service";
import { CashierFrontPDVService } from "../cashier/cashier-front/components/cashier-pdv/cashier-pdv.service";
import { SystemLogsService } from '@shared/services/system-logs.service';
import { NotificationService } from '@shared/services/notification.service';

// Translate
import { RequestsTranslate } from "./requests.translate";

// Interfaces
import { IBatch } from '@itools/interfaces/IBatch';
import { ICollection } from '@itools/interfaces/ICollection';
import { IRequest, ERequestStatus } from '@shared/interfaces/IRequest';
import { ECashierSaleOrigin, ECashierSaleStatus } from "@shared/interfaces/ICashierSale";
import { ENotificationStatus } from '@shared/interfaces/ISystemNotification';
import { EStockLogAction } from "@shared/interfaces/IStockLog";
import { ESystemLogType, ESystemLogAction, ISystemLog } from '@shared/interfaces/ISystemLog';

// Types
import { query } from "@shared/types/query";

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';

@Injectable({ providedIn: 'root' })
export class RequestsService {

  public translate = RequestsTranslate.get();

  private data: { [_id: string]: IRequest } = {};

  private _checkProcess: boolean = false;
  private _checkRequest: boolean = false;
  private _dataMonitors: EventEmitter = new EventEmitter();
  
  private firstScrolling = false;
  private settings: any = { start: 0, limit: 60, count: 0, snapshotRef: null };

  constructor(
    private iToolsService: IToolsService,
    private productsService: ProductsService,
    private cashierFrontPDVService: CashierFrontPDVService,
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

  public query(where?: query['where'], reset: boolean = true, flex: boolean = false, scrolling: boolean = false, strict: boolean = true, limit: number = 0) {

    return (new Promise<IRequest[]>((resolve) => {

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

      this.requestData(queryObject, strict).then((data) => {
        if (!reset) { this.settings.start += 1 }
        resolve(data);
      });
    }));
  }

  // CRUD Methods

  public getRequests(listenerId: string, listener: ((_: any)=>void)) {
       
    const emitterId = 'records';

    Utilities.onEmitterListener(this._dataMonitors, emitterId, listenerId, listener);
    
    if (this._checkRequest) {
      this._dataMonitors.emit(emitterId, this.treatData(emitterId));
    }     
  }

  public async registerRequest(data: IRequest, batch?: IBatch): Promise<void> {

    return (new Promise(async (resolve, reject) => {
      
      const checkBatch = (batch != undefined);
      const operation = (!data.code ? 'register' : 'update');

      try {

        if (!batch) { Utilities.loading() }

        batch = (batch || this.iToolsService.database().batch());

        let docRef: any = this.collRef().doc(data._id);

        if (!data.code) {
          data.code = iTools.FieldValue.control('SystemControls', Utilities.storeID, 'Requests.code');
          data.owner = Utilities.storeID;
          data.operator = Utilities.operator;
          data.registerDate = iTools.FieldValue.date(Utilities.timezone);
        } else {

          data.code = parseInt(<string>data.code);

          if (!data._id) {
            
            docRef = { collName: 'Requests', where: [
              { field: 'code', operator: '=', value: data.code },
              { field: 'owner', operator: '=', value: Utilities.storeID }
            ] };
          }
        }

        data.modifiedDate = iTools.FieldValue.date(Utilities.timezone);

        const batchRef = batch.update(docRef, data, { merge: true });

        if (!data.saleCode && (data.requestStatus == ERequestStatus.CONCLUDED)) {
          const cashierResponse = await this.checkSale(data, operation, batch, batchRef);
          batch.getOperations()[batchRef].data.saleCode = iTools.FieldValue.bindBatchData(cashierResponse.batchRef, 'code');
        }

        await this.checkProducts(data, operation, batch);
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

  public async cancelRequest(data: IRequest, batch?: IBatch): Promise<void> {

    return (new Promise(async (resolve, reject) => {
      
      const checkBatch = (batch != undefined);

      try {

        if (!batch) { Utilities.loading() }

        batch = (batch || this.iToolsService.database().batch());

        batch.update(this.collRef().doc(data._id), {
          requestStatus: ERequestStatus.CANCELED
        }, { merge: true });    
        
        if (data.saleCode) {
          await this.checkSale(data, 'cancel', batch);
        }
        
        await this.checkProducts(data, 'cancel', batch);
        await this.systemLogs(data, 'cancel', batch);

        if (!checkBatch) {

          batch.commit().then(() => { 

            Utilities.loading(false);
            resolve();

            this.notifications('cancel', 'success');
          }).catch((error) => {

            Utilities.loading(false);
            reject(error);

            this.notifications('cancel', 'error');
            console.error(`Error: ${error.message}`);
          });
        } else {
          resolve();
        }
      } catch(error) {

        Utilities.loading(false);

        if (!checkBatch) {
          this.notifications('cancel', 'error');
          console.error(`Error: ${error.message}`);
        }

        reject(error);
      }
    }));    
  } 

  public async deleteRequest(data: IRequest, batch?: IBatch): Promise<void> {

    return (new Promise(async (resolve, reject) => {
      
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

  public getRequestsCount(listenerId: string, listener: ((_: any)=>void)) {
      
    const emitterId = 'count';

    Utilities.onEmitterListener(this._dataMonitors, emitterId, listenerId, listener);

    if (this._checkRequest) {
      this._dataMonitors.emit(emitterId, this.treatData(emitterId));
    }
  }

  // Auxiliary Methods - Products

  private async checkProducts(data: IRequest, operation: ('register'|'update'|'cancel'), batch: IBatch): Promise<void> {
      
    const arrProducts: any = [];
    const source = this.data[data._id];

    const componseObject = ((code: string, quantity: number) => {

      const obj: any = { code: code };

      if (Utilities.isMatrix) {
        obj.quantity = iTools.FieldValue.inc(quantity);
      } else {

        obj.branches = {};
        obj.branches[Utilities.storeID] = { 
          quantity: iTools.FieldValue.inc(quantity)
        };
      }

      return obj;
    });

    if (!source) {

      $$(data.products).map((_, item) => {

        let quantity: number = item.quantity;

        if (operation == 'register') {
          quantity = (quantity * -1);
        }       

        arrProducts.push(componseObject(item.code, quantity));
      });
    } else {
      
      const updateData = Utilities.parseArrayToObject(data.products, 'code');
      const sourceData = Utilities.parseArrayToObject(source.products, 'code');

      $$(updateData).map((_, item) => {

        const product = sourceData[item.code];

        if (product) {

          if (operation == 'update') {
            if (item.quantity != product.quantity) {
              arrProducts.push(componseObject(item.code, (product.quantity - item.quantity)));
            }            
          }

          if ((operation == 'cancel') && (data.requestStatus != ERequestStatus.CONCLUDED)) {
            arrProducts.push(componseObject(item.code, product.quantity));
          }
          
          delete sourceData[item.code];
        } else {
          arrProducts.push(componseObject(item.code, (item.quantity * -1)));
        }
      });

      if (Object.values(sourceData).length > 0) {
        $$(sourceData).map((_, item) => {
          arrProducts.push(componseObject(item.code, item.quantity));
        });
      }
    }
    
    return this.productsService.registerProducts(arrProducts, batch, {action: EStockLogAction.REQUEST});
  }

  // Auxiliary Methods - Cashier

  private async checkSale(data: IRequest, operation: ('register'|'update'|'cancel'), batch: IBatch, batchRef?: number) {

    return (new Promise<any>((resolve, reject) => {

      try {

        if ((operation == 'register') || (operation == 'update')) {

          const obj: any = {    
            requestCode: (operation == 'update' ? data.code : iTools.FieldValue.bindBatchData(batchRef, 'code')),
            products: data.products,
            paymentMethods: (<any>[]),
            status: ECashierSaleStatus.PENDENT,
            origin: ECashierSaleOrigin.REQUEST,
            balance: data.balance
          };

          if (data.customer) {
            obj.customer = data.customer;
          }

          if (data.member) {
            obj.member = data.member;
          }

          this.cashierFrontPDVService.registerSale(obj, null, false, batch)
            .then((response) => { resolve(response) }).catch((error) => { reject(error) });
        } else if (operation == 'cancel') {

          this.cashierFrontPDVService.getSale(Number(data.saleCode)).then((data) => {

            if (data) {
              this.cashierFrontPDVService.cancelSale(data, batch)
                .then((response) => { resolve(response) }).catch((error) => { reject(error) });
            }
          });
        }
      } catch(error) {
        reject(error);
      }
    }));   
  }

  // Auxiliary Methods - Logs

  private async systemLogs(data: IRequest, action: string, batch: IBatch, batchRef?: number) {

    const settings: ISystemLog = {
      data: [<any>{}]
    };    
    
    settings.data[0].referenceCode = (action == 'register' ? iTools.FieldValue.bindBatchData(batchRef, 'code') : data.code);
    settings.data[0].type = ESystemLogType.Requests;

    if (action == 'register') {
      settings.data[0].action = ESystemLogAction.REGISTER;
      settings.data[0].note = this.translate.systemLog.register;
    }

    if (action == 'update') {
      settings.data[0].action = ESystemLogAction.UPDATE;
      settings.data[0].note = this.translate.systemLog.update;
    }

    if (action == 'cancel') {
      settings.data[0].action = ESystemLogAction.CANCELLATION;
      settings.data[0].note = this.translate.systemLog.cancel;
    }
    
    if (action == 'delete') {
      settings.data[0].action = ESystemLogAction.DELETION;
      settings.data[0].note = this.translate.systemLog.delete;
    }

    return this.systemLogsService.registerLogs(settings, batch);
  }

  // Utility Methods

  private collRef(settings?: query): ICollection {

    const collection = this.iToolsService.database().collection('Requests');

    settings = (settings || {});

    if (settings.orderBy) {
      settings.orderBy.code = -1;
    } else {
      settings.orderBy = { code: -1 };      
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

      if (action == 'cancel') {
        settings.description = this.translate.notification.cancel;
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

  // Data Processing

  public removeListeners(emitterId: string = null, listenerId: string | string[] = null) {
    Utilities.offEmitterListener(this._dataMonitors, emitterId, listenerId);
  }

  private requestData(settings: query, strict: boolean): Promise<IRequest[]> {

    return (new Promise((resolve, reject) => {

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

            this._dataMonitors.emit('records', this.treatData('records'));
            this._checkRequest = true;
            this._checkProcess = false;
            
            resolve(Object.values(this.data));
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

  private treatData(id: string, data?: IRequest[]) {
    
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

        if (item.saleCode) {
          item.saleCode = Utilities.prefixCode(item.saleCode);
        }

        if (item.scheme) {
          item.scheme = Utilities.prefixCode(item.scheme);
        }

        records.push(item);
      });     
      
      records.sort((a, b) => {
        return ((a.code < b.code) ? 1 : ((a.code > b.code) ? -1 : 0));
      });

      return records;
    }
  }

}
