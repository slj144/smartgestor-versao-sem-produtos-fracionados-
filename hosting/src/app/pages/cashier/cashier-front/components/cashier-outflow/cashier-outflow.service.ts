import { Injectable } from "@angular/core";
import { iTools } from '../../../../../../assets/tools/iTools';

// Services
import { IToolsService } from '@shared/services/iTools.service';
import { BankAccountsService } from "../../../../financial/bank-accounts/bank-accounts.service";
import { NotificationService } from '@shared/services/notification.service';
import { SystemLogsService } from '@shared/services/system-logs.service';

// Transfer
import { CashierFrontOutflowTranslate } from "./cashier-outflow.translate";

// Interfaces
import { IBatch } from '@itools/interfaces/IBatch';
import { ICollection } from '@itools/interfaces/ICollection';
import { ICashierOutflow, ECashierOutflowStatus, ECashierOutflowOrigin } from '@shared/interfaces/ICashierOutflow';
import { EFinancialBankTransactionType } from "@shared/interfaces/IFinancialBankTransaction";
import { ESystemLogType, ESystemLogAction, ISystemLog } from '@shared/interfaces/ISystemLog';
import { ENotificationStatus } from '@shared/interfaces/ISystemNotification';

// Utilities
import { $$ } from "@shared/utilities/essential";
import { Utilities } from '@shared/utilities/utilities';

@Injectable({ providedIn: 'root' })
export class CashierFrontOutflowService {

  public translate = CashierFrontOutflowTranslate.get();

  constructor(
    private iToolsService: IToolsService,
    private bankAccountsService: BankAccountsService,
    private notificationService: NotificationService,
    private systemLogsService: SystemLogsService
  ) {}

  // CRUD Methods

  public async registerOutflow(data: ICashierOutflow, batch?: IBatch): Promise<void> {

    return (new Promise(async (resolve, reject) => {
      
      const checkBatch = (batch != undefined);

      try {

        if (!batch) { Utilities.loading() }

        batch = (batch || this.iToolsService.database().batch());

        let docRef: any = this.collRef().doc(data._id);

        if (!data.code) {
          data.code = iTools.FieldValue.control('SystemControls', Utilities.storeID, 'CashierOutflows.code');          
          data.owner = Utilities.storeID;
          data.operator = Utilities.operator;
          data.origin = ECashierOutflowOrigin.CASHIER;
          data.registerDate = iTools.FieldValue.date(Utilities.timezone);
        } else {

          data.code = parseInt(<string>data.code);

          if (!data._id) {

            docRef = { collName: 'CashierOutflows', where: [
              { field: 'code', operator: '=', value: data.code },
              { field: 'owner', operator: '=', value: Utilities.storeID }
            ] };
          }
        }

        data.modifiedDate = iTools.FieldValue.date(Utilities.timezone);

        const batchRef = batch.update(docRef, data, { merge: true });

        await this.checkBankAccount(data, 'register', batch);
        await this.systemLogs(data, 'register', batch, batchRef);

        if (!checkBatch) {

          batch.commit().then(() => { 

            Utilities.loading(false);
            resolve();

            this.notifications('register', 'success');
          }).catch((error) => {

            Utilities.loading(false);
            reject(error);

            this.notifications('register', 'error');
            console.error(`Error: ${error.message}`);
          });
        } else {
          resolve();
        }
      } catch(error) {

        Utilities.loading(false);

        if (!checkBatch) {
          this.notifications('register', 'error');
          console.error(`Error: ${error.message}`);
        }

        reject(error);
      }
    }));
  }

  public async cancelOutflow(data: ICashierOutflow, batch?: IBatch): Promise<void> {

    return (new Promise(async (resolve, reject) => {
      
      const checkBatch = (batch != undefined);

      try {

        if (!batch) { Utilities.loading() }

        batch = (batch || this.iToolsService.database().batch());

        batch.update(this.collRef().doc(data._id), {
          status: ECashierOutflowStatus.CANCELED
        }, { merge: true });

        await this.checkBankAccount(data, 'cancel', batch);
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

  public async deleteOutflow(data: ICashierOutflow, batch?: IBatch): Promise<void> {

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

  // Auxiliary Methods - Bank Account

  private async checkBankAccount(data: ICashierOutflow, operation: ('register'|'cancel'), batch: IBatch) {

    return (new Promise<void>(async (resolve, reject) => {

      try {

        this.bankAccountsService.getAccount('@0001').then((account) => {

          if (account) {          

            const bankTransitions: any = [{
              code: account.code,
              transaction: {
                bankAccount: {
                  _id: account._id,
                  code: account.code,
                  name: account.name
                },
                type: (operation != 'cancel' ? EFinancialBankTransactionType.WITHDRAW : EFinancialBankTransactionType.DEPOSIT),
                value: (data.value > 0 ? data.value : (data.value * -1))
              }
            }];

            $$(bankTransitions).map((_, data) => {
              this.bankAccountsService.registerAccount(data, batch);
            });
          }

          resolve();
        });        
      } catch(error) {
        reject(error);
      }
    }));
  }

  // Auxiliary Methods - Logs

  private async systemLogs(data: ICashierOutflow, action: string, batch: IBatch, batchRef?: number) {

    const settings: ISystemLog = {
      data: [<any>{}]
    };    
    
    settings.data[0].referenceCode = (action == 'register' ? iTools.FieldValue.bindBatchData(batchRef, 'code') : parseInt(<string>data.code));
    settings.data[0].type = ESystemLogType.CashierOutflows;

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

  private collRef(): ICollection {
    return this.iToolsService.database().collection('CashierOutflows');
  }

  private notifications(action: string, result: string, storage: boolean = false) {

    const settings: any = {
      title: this.translate.modalTitle
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

}
