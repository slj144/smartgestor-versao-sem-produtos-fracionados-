import { Injectable } from "@angular/core";
import { EventEmitter } from 'events';
import { iTools } from "@itools/index";

// Services
import { IToolsService } from '@shared/services/iTools.service';
import { StorageService } from "@shared/services/storage.service";
import { ProductsService } from "../products/products.service";
import { BillsToPayService } from "@pages/financial/bills-to-pay/bills-to-pay.service";
import { BillsToReceiveService } from "@pages/financial/bills-to-receive/bills-to-receive.service";
import { SystemLogsService } from '@shared/services/system-logs.service';
import { NotificationService } from '@shared/services/notification.service';

// Translate
import { TransfersTranslate } from "./transfers.translate";

// Interfaces
import { IBatch } from '@itools/interfaces/IBatch';
import { ICollection } from '@itools/interfaces/ICollection';
import { IStockTransfer, EStockTransferStatus, EStockTransferPaymentStatus } from '@shared/interfaces/IStockTransfer';
import { IFinancialBillToPay, EFinancialBillToPayStatus, EFinancialBillToPayOrigin, EFinancialBillToPayInstallmentStatus, EFinancialBillToPayBeneficiaryType } from '@shared/interfaces/IFinancialBillToPay';
import { IFinancialBillToReceive, EFinancialBillToReceiveStatus, EFinancialBillToReceiveOrigin, EFinancialBillToReceiveInstallmentStatus, EFinancialBillToReceiveDebtorType } from '@shared/interfaces/IFinancialBillToReceive';
import { EStockLogAction } from '@shared/interfaces/IStockLog';
import { ISystemLog, ESystemLogType, ESystemLogAction,  } from '@shared/interfaces/ISystemLog';
import { ENotificationStatus } from '@shared/interfaces/ISystemNotification';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';

// Types
import { query } from "@shared/types/query";

@Injectable({ providedIn: 'root' })
export class TransfersService {

  public translate = TransfersTranslate.get();
  
  private data: { [_id: string]: IStockTransfer } = {};

  private _checkProcess: boolean = false;
  private _checkRequest: boolean = false;
  private _dataMonitors: EventEmitter = new EventEmitter();

  private firstScrolling = false;
  private settings: any = { start: 0, limit: 60, snapshotRef: null };

  constructor(
    private iToolsService: IToolsService,
    private productsService: ProductsService,
    private billsToPayService: BillsToPayService,
    private billsToReceiveService: BillsToReceiveService,
    private systemLogsService: SystemLogsService,
    private notificationService: NotificationService
  ) {
    this.query();
  }

  // Getter Methods

  public get limit(): number {
    return this.settings.limit;
  }

  // Query Methods
  
  public query(where?: query['where'], reset: boolean = true, flex: boolean = false, scrolling: boolean = false, strict: boolean = true): Promise<IStockTransfer[]> {

    return (new Promise((resolve) => {

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

      if (reset) {
        this.data = {};
        this.firstScrolling = false;
        this.settings.start = queryObject.start = 0;
      }
      
      if (!reset && !this.firstScrolling) {
        this.settings.start = 1;
        this.firstScrolling = true;
        queryObject.start = (this.settings.start * this.settings.limit);
      }

      this.requestData(queryObject, strict).then((data) => {
        if (!reset) { this.settings.start += 1 }
        resolve(data);
      });
    }));
  }

  // CRUD Methods - Transfers

  public getTransfers(listenerId: string, listener: ((_: any)=>void)): void {
       
    const emitterId = 'records';

    Utilities.onEmitterListener(this._dataMonitors, emitterId, listenerId, listener);

    if (this._checkRequest) {
      this._dataMonitors.emit(emitterId, this.treatData(emitterId));
    }
  }

  public async registerTransfer(data: IStockTransfer, batch?: IBatch): Promise<any> {

    return (new Promise(async (resolve, reject) => {

      const checkBatch = (batch != undefined);
      const operation = (!data.code ? 'register' : 'update');

      try {

        if (!batch) { Utilities.loading() }        

        batch = (batch || this.iToolsService.database().batch());

        let docRef: any = this.collRef().doc(data._id);

        if (!data.code) {
          data.code = iTools.FieldValue.control('SystemControls', 'common', `${this.collRef().id}.code`);
          data.owner = Utilities.storeID;
          data.operator = Utilities.operator;
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

        await this.uploadAttachment(data);
        await this.checkProducts(data, operation, batch, batchRef);
        await this.registerAccountReceivable(data, operation, batch, batchRef);
        await this.registerAccountPayable(data, operation, batch, batchRef);
        await this.systemLogs(data, operation, batch, batchRef);

        if (!checkBatch) {

          batch.commit().then((response) => { 

            Utilities.loading(false);
            resolve(response);

            this.notifications(operation, 'success');
          }).catch((error) => {

            Utilities.loading(false);
            reject(error);

            this.notifications(operation, 'error');
            console.error(`Error: ${error.message}`);
          });
        } else {
          resolve({ batchRef });
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

  public async cancelTransfer(data: IStockTransfer, batch?: IBatch): Promise<any> {

    return (new Promise(async (resolve, reject) => {

      const checkBatch = (batch != undefined);

      try {

        if (!batch) { Utilities.loading() }        

        batch = (batch || this.iToolsService.database().batch());

        let docRef: any = this.collRef().doc(data._id);

        if (!data._id) {
          docRef = { collName: this.collRef().id, where: [{ field: 'code', operator: '=', value: parseInt(<string>data.code) }] };
        }

        const updateObject: any = {
          transferStatus: EStockTransferStatus.CANCELED,
          paymentStatus: EStockTransferPaymentStatus.CANCELED
        }

        const batchRef = batch.update(docRef, updateObject, { merge: true });

        // console.log(data);

        // return;

        await this.checkProducts(data, 'cancel', batch, batchRef);
        await this.cancelAccountReceivable(data, batch);
        await this.cancelAccountPayable(data, batch);
        await this.systemLogs(data, 'cancel', batch);

        if (!checkBatch) {

          batch.commit().then((response) => { 

            Utilities.loading(false);
            resolve(response);

            this.notifications('cancel', 'success');
          }).catch((error) => {

            Utilities.loading(false);
            reject(error);

            this.notifications('cancel', 'error');
            console.error(`Error: ${error.message}`);
          });
        } else {
          resolve(null);
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

  public async deleteTransfer(data: IStockTransfer, batch?: IBatch): Promise<any> {

    return (new Promise(async (resolve, reject) => {

      const checkBatch = (batch != undefined);
      const type = 'delete';

      try {

        if (!batch) { Utilities.loading() }

        batch = (batch || this.iToolsService.database().batch());

        let docRef: any = this.collRef().doc(data._id);

        if (!data._id) {
          docRef = { collName: this.collRef().id, where: [{ field: 'code', operator: '=', value: parseInt(<string>data.code) }] };
        }

        const batchRef = batch.delete(docRef);

        await this.deleteAccountReceivable(data, batch);
        await this.deleteAccountPayable(data, batch);
        await this.cleanAttachment(data);
        await this.systemLogs(data, type, batch);

        if (!checkBatch) {

          batch.commit().then((response) => { 

            Utilities.loading(false);
            resolve(response);

            this.notifications(type, 'success');
          }).catch((error) => {

            Utilities.loading(false);
            reject(error);

            this.notifications(type, 'error');
            console.error(`Error: ${error.message}`);
          });
        } else {
          resolve(null);
        }
      } catch(error) {

        Utilities.loading(false);

        if (!checkBatch) {
          this.notifications(type, 'error');
          console.error(`Error: ${error.message}`);
        }

        reject(error);
      }
    }));
  }

  public async acceptTransfer(data: IStockTransfer, batch?: IBatch): Promise<any> {

    return (new Promise(async (resolve, reject) => {   

      const checkBatch = (batch != undefined);

      try {

        if (!batch) { Utilities.loading() }        

        batch = (batch || this.iToolsService.database().batch());

        let docRef: any = this.collRef().doc(data._id);

        if (!data._id) {
          docRef = { collName: this.collRef().id, where: [{ field: 'code', operator: '=', value: parseInt(<string>data.code) }] };
        }

        const updateObject: any = {
          receiptDate: iTools.FieldValue.date(Utilities.timezone),
          transferStatus: EStockTransferStatus.CONCLUDED
        };

        const batchRef = batch.update(docRef, updateObject, { merge: true });

        await this.acceptProducts(data, batch);
        await this.systemLogs(data, 'accept', batch);

        if (!checkBatch) {

          batch.commit().then((response) => { 

            Utilities.loading(false);
            resolve(response);

            this.notifications('accept', 'success');
          }).catch((error) => {

            Utilities.loading(false);
            reject(error);

            this.notifications('accept', 'error');
            console.error(`Error: ${error.message}`);
          });
        } else {
          resolve(null);
        }
      } catch(error) {

        Utilities.loading(false);

        if (!checkBatch) {
          this.notifications('accept', 'error');
          console.error(`Error: ${error.message}`);
        }

        reject(error);
      }
    }));
  }

  // Count Methods

  public getTransfersCount(listenerId: string, listener: ((_: any)=>void)): void {
    
    const emitterId = 'count';

    Utilities.onEmitterListener(this._dataMonitors, emitterId, listenerId, listener);

    if (this._checkRequest) {
      this._dataMonitors.emit(emitterId, this.treatData(emitterId));
    }
  }

  // Auxiliary Methods - Products

  private async checkProducts(data: IStockTransfer, operation: ('register'|'update'|'cancel'), batch: IBatch, batchRef): Promise<any> {
      
    return (new Promise((resolve, reject) => {

      try {

        const source = this.data[data._id];
        const arrProducts: any = [];

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

        if (!source || (operation == 'cancel')) {

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

            const data = sourceData[item.code];

            if (data) {

              if (item.quantity != data.quantity) {
                arrProducts.push(componseObject(item.code, (data.quantity - item.quantity)));
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

        const referenceCode: any = (operation == 'register' ? iTools.FieldValue.bindBatchData(batchRef, 'code') : parseInt(<string>data.code));
        
        this.productsService.registerProducts(arrProducts, batch, {action: EStockLogAction.TRANSFER, originReferenceCode: referenceCode})
          .then((response) => { resolve(response) }).catch((error) => { reject(error) });
      } catch(error) {
        reject(error);
      }
    }));    
  }

  private async acceptProducts(data: IStockTransfer, batch: IBatch): Promise<any> {
 
    return (new Promise((resolve, reject) => {

      try {

        const updateArray = [];

        for (const item of data.products) {

          const obj: any = {
            code: item.code
          };

          if (data.destination._id == 'matrix') {
            
            obj.costPrice = item.costPrice;
            obj.salePrice = item.salePrice;
            obj.quantity = iTools.FieldValue.inc(item.quantity);         
          } else {

            obj.branches = {};
            obj.branches[data.destination._id] = {
              costPrice: item.costPrice,
              salePrice: item.salePrice,
              quantity: iTools.FieldValue.inc(item.quantity)
            }
          }

          updateArray.push(obj);
        }

        this.productsService.registerProducts(updateArray, batch, {action: EStockLogAction.TRANSFER, originReferenceCode: data.code})
          .then((response) => { resolve(response) }).catch((error) => { reject(error) });
      } catch(error) {
        reject(error);
      }
    }));    
  }

  // Auxiliary Methods - Bill To Receive

  private async registerAccountReceivable(data: IStockTransfer, action: string, batch: IBatch, batchRef: number): Promise<any> {

    return (new Promise((resolve, reject) => {   

      try { 

        if (action == 'register') {
          data.billToReceive.referenceCode = iTools.FieldValue.bindBatchData(batchRef, 'code');
        }

        this.billsToReceiveService.registerBill(data.billToReceive, batch)
          .then((response) => { 
            delete data.billToReceive;
            data.billToReceiveCode = iTools.FieldValue.bindBatchData(response.batchRef, 'code');
            resolve(response) 
          }).catch((error) => { reject(error) });
      } catch(error) {
        reject(error);
      }
    }));
  } 
  
  private async cancelAccountReceivable(data: IStockTransfer, batch: IBatch): Promise<any> {

    return (new Promise((resolve, reject) => {
    
      try {

        console.log({ code: data.billToReceiveCode, owner: data.origin._id }, batch);

        this.billsToReceiveService.cancelBill(<any>{ code: data.billToReceiveCode, owner: data.origin._id }, batch)
          .then((response) => { resolve(response) }).catch((error) => { reject(error) });
      } catch(error) {
        reject(error);
      }
    }));
  }

  private async deleteAccountReceivable(data: IStockTransfer, batch: IBatch): Promise<any> {

    return (new Promise((resolve, reject) => {
    
      try {
        this.billsToReceiveService.deleteBill(<any>{ code: data.billToReceiveCode }, batch)
          .then((response) => { resolve(response) }).catch((error) => { reject(error) });
      } catch(error) {
        reject(error);
      }
    }));   
  }

  // Auxiliary Methods - Bill To Pay

  private async registerAccountPayable(data: IStockTransfer, action: string, batch: IBatch, batchRef: number): Promise<any> {

    return (new Promise((resolve, reject) => {   

      try { 

        if (action == 'register') {
          data.billToPay.referenceCode = iTools.FieldValue.bindBatchData(batchRef, 'code');
        }

        this.billsToPayService.registerBill(data.billToPay, batch)
          .then((response) => { 
            delete data.billToPay;
            data.billToPayCode = iTools.FieldValue.bindBatchData(response.batchRef, 'code');
            resolve(response)
          }).catch((error) => { reject(error) });
      } catch(error) {
        reject(error);
      }     
    }));   
  } 
  
  private async cancelAccountPayable(data: IStockTransfer, batch: IBatch): Promise<any> {

    return (new Promise((resolve, reject) => {
    
      try {

        // console.log({ code: data.billToPayCode, owner: data.destination._id }, batch);

        this.billsToPayService.cancelBill(<any>{ code: data.billToPayCode, owner: data.destination._id }, batch)
          .then((response) => { resolve(response) }).catch((error) => { reject(error) });
      } catch(error) {
        reject(error);
      }
    }));
  }

  private async deleteAccountPayable(data: IStockTransfer, batch: IBatch): Promise<any> {

    return (new Promise((resolve, reject) => {
    
      try {
        this.billsToPayService.deleteBill(<any>{ code: data.billToPayCode }, batch)
          .then((response) => { resolve(response) }).catch((error) => { reject(error) });
      } catch(error) {
        reject(error);
      }
    }));
  }

  // Auxiliary Methods - Attachment

  private async uploadAttachment(data: IStockTransfer): Promise<void> {

    return (new Promise((resolve, reject) => {

      if (data.attachment && (typeof data.attachment.url == 'object')) {
        
        const newFile = data.attachment.url.newFile;
        const oldFile = data.attachment.url.oldFile;

        StorageService.uploadFile({
          settings: [{
            file: newFile,
            sourceUrl: oldFile,
            name: `${Utilities.uuid()}`,
            path: `Transfers`
          }],
          storageRef: this.iToolsService.storage()
        }).then((response) => {
          data.attachment.url = response[0];
          resolve();
        }).catch((error) => {
          reject(error);
        });
      } else {
        resolve();
      }
    }));  
  }

  private async cleanAttachment(data: IStockTransfer): Promise<void> {

    return (new Promise((resolve, reject) => {

      if (data.attachment && (typeof data.attachment.url == 'string')) {
        
        const fileUrl = data.attachment.url;

        StorageService.removeFile({
          url: fileUrl,
          storageRef: this.iToolsService.storage()
        }).then(() => {
          resolve();
        }).catch((error) => {
          reject(error);
        });
      } else {
        resolve();
      }
    }));    
  }

  // Auxiliary Methods - Logs

  private async systemLogs(data: IStockTransfer, action: string, batch: IBatch, batchRef?: number): Promise<any> {

    const settings: ISystemLog = {
      data: [<any>{}]
    };    
    
    settings.data[0].referenceCode = (action == 'register' ? iTools.FieldValue.bindBatchData(batchRef, 'code') : data.code);
    settings.data[0].type = ESystemLogType.StockTransfers;

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

    if (action == 'accept') {
      settings.data[0].action = ESystemLogAction.DELETION;
      settings.data[0].note = this.translate.systemLog.accept;
    }

    return this.systemLogsService.registerLogs(settings, batch);
  }

  // Utility Methods

  private collRef(settings?: query): ICollection {

    const collection = this.iToolsService.database().collection('StockTransfers');

    settings = Utilities.deepClone(settings || {});

    if (settings.orderBy) {
      settings.orderBy.code = -1;
    } else {
      settings.orderBy = { code: -1 };      
    }
    
    collection.orderBy(settings.orderBy);

    if (settings.or) {
      settings.or.push({ field: 'origin._id', operator: '=', value: Utilities.storeID });
      settings.or.push({ field: 'destination._id', operator: '=', value: Utilities.storeID });
    } else {
      settings.or = [
        { field: 'origin._id', operator: '=', value: Utilities.storeID },
        { field: 'destination._id', operator: '=', value: Utilities.storeID }
      ];
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

  private notifications(action: string, result: string, storage: boolean = false): void {

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

      if (action == 'accept') {
        settings.description = this.translate.notification.accept;
      }

      settings.status = ENotificationStatus.success;
    }

    if (result == 'error') {
      settings.description = this.translate.notification.error;
      settings.status = ENotificationStatus.danger;
    }

    this.notificationService.create(settings, storage);
  }

  // Data processing

  public removeListeners(emitterId: string = null, listenerId: string = null): void {
    Utilities.offEmitterListener(this._dataMonitors, emitterId, listenerId);
  }

  private requestData(settings: query, strict: boolean): Promise<IStockTransfer[]> {

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
            
            resolve(this.treatData('records', Object.values(this.data)));
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

  private treatData(id: string, data?: IStockTransfer[]): any {

    if (id == 'count') {

      const result: any = { 
        current: $$(data || this.data).length, total: this.settings.count
      };

      return result;
    }

    if (id == 'records') {

      const records = [];

      $$(Utilities.deepClone(data || this.data)).map((_: any, item: any) => {

        item.code = Utilities.prefixCode(item.code);

        if (item.billToPayCode) {
          item.billToPayCode = Utilities.prefixCode(item.billToPayCode);
        }

        if (item.billToReceiveCode) {
          item.billToReceiveCode = Utilities.prefixCode(item.billToReceiveCode);
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
