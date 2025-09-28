import { Injectable } from '@angular/core';
import { EventEmitter } from 'events';
import { iTools } from '../../../../../../assets/tools/iTools';

// Services
import { IToolsService } from '@shared/services/iTools.service';
import { NotificationService } from '@shared/services/notification.service';
import { SystemLogsService } from '@shared/services/system-logs.service';

// Translate
import { CashierFrontControlTranslate } from './cashier-control.translate';

// Interfaces
import { IBatch } from '@itools/interfaces/IBatch';
import { ICollection } from '@itools/interfaces/ICollection';
import { ICashierControl, ECashierControlStatus } from '@shared/interfaces/ICashierControl';
import { ESystemLogType, ESystemLogAction, ISystemLog } from '@shared/interfaces/ISystemLog';
import { ENotificationStatus } from '@shared/interfaces/ISystemNotification';

// Types
import { query } from '@shared/types/query';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';

@Injectable({ providedIn: 'root' })
export class CashierFrontControlService {

  public translate = CashierFrontControlTranslate.get();

  private data: any = {};

  private _checkRequest: boolean = false;
  private _dataMonitors: EventEmitter = new EventEmitter();

  constructor(
    private iToolsService: IToolsService,
    private notificationService: NotificationService,
    private systemLogsService: SystemLogsService
  ) {
    this.requestData();
  }

  // CRUD Methods

  public getControl(listenerId: string, listener: ((_: any)=>void)) {

    const emitterId = 'control';

    Utilities.onEmitterListener(this._dataMonitors, emitterId, listenerId, listener);

    if (this._checkRequest) {
      this._dataMonitors.emit(emitterId, this.treatData(emitterId));
    }
  }

  // Commands Methods

  public async openCashier(data: ICashierControl, batch?: IBatch) {

    return (new Promise<void>(async (resolve, reject) => {

      const checkBatch = (batch != undefined);

      try {

        if (!batch) { Utilities.loading() }

        batch = (batch || this.iToolsService.database().batch());

        data.code = iTools.FieldValue.control('SystemControls', Utilities.storeID, 'CashierControls.code');
        data.status = ECashierControlStatus.OPENED;
        data.owner = Utilities.storeID;
        data.operator = Utilities.operator;
        data.registerDate = iTools.FieldValue.date(Utilities.timezone);
        data.modifiedDate = iTools.FieldValue.date(Utilities.timezone);

        const batchRef = batch.update(this.collRef().doc(data._id), data, { merge: true });

        await this.systemLogs(data, 'open', batch, batchRef);

        if (!checkBatch) {

          batch.commit().then(() => {

            Utilities.loading(false);
            resolve();

            this.notifications('open', 'success');
          }).catch((error) => {
            
            Utilities.loading(false);
            reject(error);

            this.notifications('open', 'fail');
            console.error(`Error: ${error.message}`);
          });
        } else {
          
          Utilities.loading(false);
          resolve();
        }
      } catch(error) {

        Utilities.loading(false);

        if (!checkBatch) {
          this.notifications('open', 'fail');
          console.error(`Error: ${error.message}`);
        }

        reject(error);
      }
    }));
  }

  public async closeCashier(data: any, batch?: IBatch) {

    return (new Promise<void>(async (resolve, reject) => {

      const checkBatch = (batch != undefined);

      try {

        if (!batch) { Utilities.loading() }

        batch = (batch || this.iToolsService.database().batch());

        data.code = parseInt(data.code);
        data.status = ECashierControlStatus.CLOSED;
        data.modifiedDate = iTools.FieldValue.date(Utilities.timezone);

        const batchRef = batch.update(this.collRef().doc(data._id), data, { merge: true });

        await this.systemLogs(data, 'close', batch, batchRef);

        if (!checkBatch) {

          batch.commit().then(() => {

            Utilities.loading(false);
            resolve();

            this.notifications('close', 'success');
          }).catch((error) => {
            
            Utilities.loading(false);
            reject(error);

            this.notifications('close', 'fail');
            console.error(`Error: ${error.message}`);
          });
        } else {
          
          Utilities.loading(false);
          resolve();
        }
      } catch(error) {

        Utilities.loading(false);

        if (!checkBatch) {
          this.notifications('close', 'fail');
          console.error(`Error: ${error.message}`);
        }

        reject(error);
      }
    }));
  }

  // Auxiliary Methods

  private async systemLogs(data: any, action: string, batch: IBatch, batchRef?: number): Promise<void> {

    const settings: ISystemLog = {
      data: [<any>{}]
    };    
    
    settings.data[0].referenceCode = (action == 'open' ? iTools.FieldValue.bindBatchData(batchRef, 'code') : parseInt(<string>data.code));
    settings.data[0].type = ESystemLogType.CashierControls;

    if (action == 'open') {
      settings.data[0].action = ESystemLogAction.REGISTER;
      settings.data[0].note = this.translate.systemLog.open;
    }

    if (action == 'close') {
      settings.data[0].action = ESystemLogAction.REGISTER;
      settings.data[0].note = this.translate.systemLog.close;
    }    

    return this.systemLogsService.registerLogs(settings, batch); 
  } 

  // Utility Methods

  private collRef(): ICollection {

    const collection = this.iToolsService.database().collection('CashierControls');

    const settings: query = { limit: 1 };

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
    

    if (Utilities.localStorage('CashierOperationalMode') == 'individual') {
      settings.where.push({ field: 'operator.code', operator: '=', value: Utilities.operator.code });
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
      title: this.translate.componentTitle
    };

    if (result == 'success') {

      if (action == 'open') {
        settings.description = this.translate.notification.open;
      }

      if (action == 'close') {
        settings.description = this.translate.notification.close;
      }     

      settings.status = ENotificationStatus.success;
    }

    if (result == 'fail') {
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

    this.collRef().onSnapshot((response) => {    
      
      this.data = {};

      if (response.changes().length == 0) {

        for (const doc of response.docs) {
          const docData = doc.data();
          this.data[docData._id] = docData;
        }
      } else {

        for (const doc of response.changes()) {

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

      this._dataMonitors.emit('control', this.treatData('control'));    
      this._checkRequest = true;
    });
  }

  private treatData(emitterId: string): any {
  
    if (emitterId == 'control') {
      
      const records = [];

      $$(Utilities.deepClone(this.data)).map((_, item) => {
        item.code = Utilities.prefixCode(item.code);
        records.push(item);
      });

      return records;
    }
  }

}