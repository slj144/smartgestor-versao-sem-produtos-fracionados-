import { Injectable } from '@angular/core';
import * as cryptojs  from "crypto-js";
import { ProjectSettings } from '@assets/settings/company-settings';
import { iTools } from '../../../assets/tools/iTools';
import { IBatch } from '@itools/interfaces/IBatch';
import { ICollection } from '@itools/interfaces/ICollection';
import { EDonationStatus, IDonation } from '@shared/interfaces/IDonation';
import { ESystemLogAction, ESystemLogType, ISystemLog } from '@shared/interfaces/ISystemLog';
import { IToolsService } from '@shared/services/iTools.service';
import { NotificationService } from '@shared/services/notification.service';
import { SystemLogsService } from '@shared/services/system-logs.service';
import { query } from '@shared/types/query';
import { Utilities } from '@shared/utilities/utilities';
import { PublicDonationsTranslate } from './donations.translate';

// Services

// Utilities

// Settings

@Injectable({ providedIn: 'root' })
export class PublicDonationsService {

  constructor(
    private iToolsService: IToolsService,
    private systemLogsService: SystemLogsService,
    private notificationService: NotificationService
  ) {

  }

  
  private get translate() {
    return PublicDonationsTranslate.get();
  }


  public async makeDonation(data: IDonation, batch?: IBatch){
    return (new Promise<void>(async (resolve, reject) => {
      
      const checkBatch = (batch != undefined);
      const operation = (!data.code ? 'register' : 'update');

      try {

        if (!batch) { Utilities.loading() }

        batch = (batch || this.iToolsService.database().batch());

        let docRef: any = this.collRef().doc(data._id);

        if (!data.code) {
          data.code = iTools.FieldValue.control('SystemControls', "common", `${this.collRef().id}.code`);          
          data.registerDate = iTools.FieldValue.date(Utilities.timezone);
          data.status = EDonationStatus.PENDENT;

          if (data.origin == "INTERNAL"){
            data.operator = Utilities.operator;
          }
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
          }).catch((error) => {

            Utilities.loading(false);
            reject(error);
            console.error(`Error: ${error.message}`);
          });
        } else {
          resolve();
        }
      } catch(error) {

        Utilities.loading(false);

        if (!checkBatch) {
          // this.notifications(operation, 'error');
          console.error(`Error: ${error.message}`);
        }

        reject(error);
      }
    }));
  }

  
  // Auxiliary Methods - Logs

  private async systemLogs(data: IDonation, action: string, batch: IBatch, batchRef?: number) {

    const settings: ISystemLog = {
      data: [<any>{}]
    };    
    
    settings.data[0].referenceCode = (action == 'register' ? iTools.FieldValue.bindBatchData(batchRef, 'code') : data.code);
    settings.data[0].type = ESystemLogType.Donations;

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

    const collection = this.iToolsService.database().collection('Donations');
    collection.orderBy({ code: 1 });

    if (settings) {

      if (settings.orderBy) {
        collection.orderBy(settings.orderBy);
      }

      if (settings.where) {
        collection.where(settings.where);
      }

      if (settings.or) {
        collection.or(settings.or);
      }

      if (settings.start != undefined && settings.start >= 0) {
        collection.startAfter(settings.start);
      }

      if (settings.limit != undefined && settings.limit > 0) {
        collection.limit(settings.limit);
      }
    }

    return collection;
  }

}
