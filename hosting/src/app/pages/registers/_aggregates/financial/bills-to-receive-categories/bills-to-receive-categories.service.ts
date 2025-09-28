import { Injectable } from "@angular/core";
import { EventEmitter } from 'events';
import { iTools } from '../../../../../../assets/tools/iTools';

// Services
import { IToolsService } from '@shared/services/iTools.service';
import { SystemLogsService } from '@shared/services/system-logs.service';
import { NotificationService } from '@shared/services/notification.service';

// Translate
import { BillsToReceiveCategoriesTranslate } from "./bills-to-receive-categories.translate";

// Interfaces
import { IBatch } from '@itools/interfaces/IBatch';
import { ICollection } from '@itools/interfaces/ICollection';
import { IFinancialBillToReceiveCategory } from '@shared/interfaces/IFinancialBillToReceiveCategory';
import { ISystemLog, ESystemLogType, ESystemLogAction } from '@shared/interfaces/ISystemLog';
import { ENotificationStatus } from '@shared/interfaces/ISystemNotification';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';

@Injectable({ providedIn: 'root' })
export class BillsToReceiveCategoriesService {

  public translate = BillsToReceiveCategoriesTranslate.get();

  private data: any;

  private _checkRequest: boolean = false;
  private _dataMonitors: EventEmitter = new EventEmitter();

  constructor(
    private iToolsService: IToolsService,
    private systemLogsService: SystemLogsService,
    private notificationService: NotificationService
  ) {
    this.requestData();
  }  

  // CRUD Methods

  public getCategories(listenerId: string, listener: ((_: any)=>void)) {
       
    const emitterId = 'records';
    
    Utilities.onEmitterListener(this._dataMonitors, emitterId, listenerId, listener);  

    if (this._checkRequest) {
      this._dataMonitors.emit(emitterId, this.treatData(emitterId));
    }      
  }

  public async registerCategory(data: IFinancialBillToReceiveCategory, batch?: IBatch): Promise<void> {

    return (new Promise(async (resolve, reject) => {
      
      const checkBatch = (batch != undefined);
      const operation = (!data.code ? 'register' : 'update');

      let docRef: any = this.collRef().doc(data._id);

      try {

        if (!batch) { Utilities.loading() }

        batch = (batch || this.iToolsService.database().batch());
   
        if (!data.code) {
          data.code = iTools.FieldValue.control('SystemControls', Utilities.storeID, `${this.collRef().id}.code`);          
          data.owner = Utilities.storeID;
          data.registerDate = iTools.FieldValue.date(Utilities.timezone);
        } else {

          data.code = parseInt(<string>data.code);

          if (!data._id) {
            docRef = { collName: this.collRef().id, where: [{ field: 'code', operator: '=', value: data.code }] };
          }
        }
        
        data.modifiedDate = iTools.FieldValue.date(Utilities.timezone);

        const batchRef = batch.update(docRef, data, { merge: true });

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

  public async deleteCategory(data: IFinancialBillToReceiveCategory, batch?: IBatch): Promise<void> {

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

  // Auxiliary Methods - Logs

  private async systemLogs(data: IFinancialBillToReceiveCategory, action: string, batch: IBatch, batchRef?: number) {

    const settings: ISystemLog = {
      data: [<any>{}]
    };    
    
    settings.data[0].referenceCode = (action == 'register' ? iTools.FieldValue.bindBatchData(batchRef, 'code') : data.code);
    settings.data[0].type = ESystemLogType.FinancialBillsToReceiveCategories;

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

  private collRef(): ICollection {
    return this.iToolsService.database().collection('FinancialBillToReceiveCategories');
  }

  private notifications(action: string, result: string, storage: boolean = false) {

    const settings: any = {
      title: this.translate.title
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

  // Data Processing

  public removeListeners(emitterId: string = null, listenerId: string | string[] = null) {
    Utilities.offEmitterListener(this._dataMonitors, emitterId, listenerId);
  }

  private requestData() {

    this.data = {};

    this.collRef().limit(100).onSnapshot((res) => {

      if (!this._checkRequest) {

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
        
      this._dataMonitors.emit('records', this.treatData('records'));
      this._checkRequest = true;
    });  
  }

  private treatData(emitterId: string) {

    if (emitterId == 'records') {
    
      const records = [];

      $$(Utilities.deepClone(this.data)).map((_, item) => {
        item.code = Utilities.prefixCode(item.code);
        records.push(item);
      });     
      
      records.sort((a, b) => {
        return ((a.code < b.code) ? -1 : ((a.code > b.code) ? 1 : 0));
      });

      return records;
    }
  }

}