import { Injectable } from "@angular/core";
import { iTools } from '../../../../../../assets/tools/iTools';

// Services
import { IToolsService } from '@shared/services/iTools.service';
import { SystemLogsService } from '@shared/services/system-logs.service';

// Translate
import { BankTransactionsTranslate } from "./bank-transactions.translate";

// Interfaces
import { IBatch } from '@itools/interfaces/IBatch';
import { ICollection } from '@itools/interfaces/ICollection';
import { EFinancialBankTransactionType, IFinancialBankTransaction } from "@shared/interfaces/IFinancialBankTransaction";
import { ESystemLogType, ESystemLogAction, ISystemLog } from '@shared/interfaces/ISystemLog';

// Types
import { query } from "@shared/types/query";

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';

@Injectable({ providedIn: 'root' })
export class BankTransactionsService {

  public translate = BankTransactionsTranslate.get();

  constructor(
    private iToolsService: IToolsService,
    private systemLogsService: SystemLogsService
  ) {}

  // CRUD Methods

  public async getTransactions(accountCode: (string | string[]), period?: { start: string, end: string }, limit?: number, orderBy?: ('ASC'|'DESC')) {
       
    return (new Promise<IFinancialBankTransaction[]>(async (resolve, reject) => {

      try {

        const settings: any = {};

        settings.where = [
          { field: 'bankAccount.code', operator: '=', value: Utilities.prefixCode(String(accountCode)) }
        ];

        if (period) {
          settings.where.push({ field: 'registerDate', operator: '>=', value: period.start });
          settings.where.push({ field: 'registerDate', operator: '<=', value: period.end });
        }

        if (limit) {
          settings.limit = limit;
        }

        settings.orderBy = { code: (orderBy ? (orderBy == 'ASC' ? 1 : -1) : 1) };

        const records = await this.requestData(settings);

        resolve(records);
      } catch(error) {
        reject(error);
      }
    }));
  }

  public async registerTransaction(data: IFinancialBankTransaction, batch: IBatch): Promise<void> {

    return (new Promise(async (resolve, reject) => {

      try {

        if (!batch) { Utilities.loading() }

        batch = (batch || this.iToolsService.database().batch());

        data.code = iTools.FieldValue.control('SystemControls', Utilities.storeID, `${this.collRef().id}.code`);          
        data.owner = Utilities.storeID;
        data.operator = Utilities.operator;
        data.registerDate = iTools.FieldValue.date(Utilities.timezone);

        const batchRef = batch.update(this.collRef().doc(data._id), data, { merge: true });

        await this.systemLogs(data, 'register', batch, batchRef);

        resolve();
      } catch(error) {
        reject(error);
      }
    }));
  }

  public async deleteTransactions(accountCode: string, batch: IBatch): Promise<void> {

    return (new Promise(async (resolve, reject) => {

      try {
        batch.delete({ collName: 'FinancialBankTransactions', where: [{ field: 'bankAccount.code', operator: '=', value: parseInt(accountCode) }] });
        resolve();
      } catch(error) {
        reject(error);
      }      
    }));
  }

  // Auxiliary Methods - Logs

  private async systemLogs(data: IFinancialBankTransaction, action: string, batch: IBatch, batchRef?: number) {

    const settings: ISystemLog = {
      data: [<any>{}]
    };    
    
    settings.data[0].referenceCode = (action == 'register' ? iTools.FieldValue.bindBatchData(batchRef, 'code') : data.code);
    settings.data[0].type = ESystemLogType.FinancialBankAccountTransaction;

    if (action == 'register') {
      settings.data[0].action = ESystemLogAction.REGISTER;
      settings.data[0].note = this.translate.systemLog.register;
    }

    return this.systemLogsService.registerLogs(settings, batch);
  }

  // Utility Methods

  private collRef(settings?: query): ICollection {

    const collection = this.iToolsService.database().collection('FinancialBankTransactions');

    settings = (settings || {});    

    if (settings.where) {
      settings.where.push({ field: 'owner', operator: '=', value: Utilities.storeID });
    } else {
      settings.where = [{ field: 'owner', operator: '=', value: Utilities.storeID }];      
    }
    
    collection.where(settings.where);

    if ((settings.limit != undefined) && (settings.limit > 0)) {
      collection.limit(settings.limit);
    }
    
    if (settings.orderBy) {
      collection.orderBy(settings.orderBy);  
    }      

    return collection;
  }

  // Data Processing

  private requestData(settings: query) {

    return (new Promise<IFinancialBankTransaction[]>((resolve, reject) => {

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
    }));
  }

  private treatData(emitterId: string, data?: IFinancialBankTransaction[]) {

    if (emitterId == 'records') {
    
      const records = [];

      $$(Utilities.deepClone(data)).map((_, item) => {
        
        item.code = Utilities.prefixCode(item.code);

        if (item.type == EFinancialBankTransactionType.DEPOSIT) {
          item.type = { value: item.type, parsed: this.translate.data.type.deposit };
        }

        if (item.type == EFinancialBankTransactionType.WITHDRAW) {
          item.type = { value: item.type, parsed: this.translate.data.type.withdraw };
        }

        if (item.type == EFinancialBankTransactionType.TRANSFER) {
          item.type = { value: item.type, parsed: (this.translate.data.type.transfer || 'Transferência') };
        }

        records.push(item);
      });

      return records;
    }
  }

}
