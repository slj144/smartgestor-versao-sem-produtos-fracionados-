import { Injectable } from "@angular/core";
import { EventEmitter } from 'events';
import { iTools } from '../../../../assets/tools/iTools';

// Services
import { IToolsService } from '@shared/services/iTools.service';
import { BankTransactionsService } from "../../registers/_aggregates/financial/bank-transactions/bank-transactions.service";
import { SystemLogsService } from '@shared/services/system-logs.service';
import { NotificationService } from '@shared/services/notification.service';

// Translate
import { BankAccountsTranslate } from "./bank-accounts.translate";

// Interfaces
import { IBatch } from '@itools/interfaces/IBatch';
import { ICollection } from '@itools/interfaces/ICollection';
import { IFinancialBankAccount } from '@shared/interfaces/IFinancialBankAccount';
import { IFinancialBankTransaction, EFinancialBankTransactionType,  } from '@shared/interfaces/IFinancialBankTransaction';
import { ISystemLog, ESystemLogAction, ESystemLogType } from '@shared/interfaces/ISystemLog';
import { ENotificationStatus } from '@shared/interfaces/ISystemNotification';

// Types
import { query } from "@shared/types/query";

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';

@Injectable({ providedIn: 'root' })
export class BankAccountsService {

  public translate = BankAccountsTranslate.get();
  
  private data: any = {};
  
  private _checkProcess: boolean = false;
  private _checkRequest: boolean = false;
  private _dataMonitors: EventEmitter = new EventEmitter(); 
  
  private firstScrolling = false;
  private settings: any = { start: 0, limit: 60, count: 0, snapshotRef: null };

  constructor(
    private iToolsService: IToolsService,
    private bankTransaction: BankTransactionsService,
    private systemLogsService: SystemLogsService,
    private notificationService: NotificationService
  ) {
    this.query();    
  }

  // Ensure default vault account (@0002) exists — safe for existing instances
  public async ensureDefaultVaultAccount(): Promise<void> {
    const language = (window.localStorage.getItem('Language') || 'pt_BR');
    const cofreName = (language === 'en_US' ? 'COMPANY VAULT' : 'Cofre da Empresa');

    // 1) If there is already an account named "Cofre da Empresa" or "COMPANY VAULT", do nothing.
    const coll = this.iToolsService.database().collection('FinancialBankAccounts');
    coll.where([
      { field: 'owner', operator: '=', value: Utilities.storeID },
      { field: 'name', operator: '=', value: cofreName }
    ]);
    coll.limit(1);
    const byName = await coll.get();
    if (byName.docs.length > 0) { return; }

    // 2) If @0002 exists and is already the vault, done. If exists but not vault, pick next available code.
    const exists0002 = await this.getAccount('@0002');
    let code = '@0002';
    if (exists0002 && (exists0002.name !== cofreName)) {
      const pad = (n: number) => '@' + String(n).padStart(4, '0');
      for (let i = 3; i <= 20; i++) {
        const tryCode = pad(i);
        const ex = await this.getAccount(tryCode);
        if (!ex) { code = tryCode; break; }
      }
    }

    // 3) Create the vault account
    const batch = this.iToolsService.database().batch();
    const data: IFinancialBankAccount = {
      _id: iTools.ObjectId(),
      code,
      name: cofreName,
      agency: '0000',
      account: '000000',
      balance: 0,
      owner: Utilities.storeID,
      registerDate: iTools.FieldValue.date(Utilities.timezone),
      modifiedDate: iTools.FieldValue.date(Utilities.timezone),
      _isDefault: true
    };

    await this.registerAccount(data, batch);
    await batch.commit();
  }

  // Find the vault account by translated name; fallback to @0002 if found
  public async getVaultAccount(): Promise<IFinancialBankAccount|null> {
    const language = (window.localStorage.getItem('Language') || 'pt_BR');
    const cofreName = (language === 'en_US' ? 'COMPANY VAULT' : 'Cofre da Empresa');

    const collection = this.iToolsService.database().collection('FinancialBankAccounts');
    collection.where([
      { field: 'owner', operator: '=', value: Utilities.storeID },
      { field: 'name', operator: '=', value: cofreName }
    ]);
    collection.limit(1);
    const res = await collection.get();
    if (res.docs.length > 0) { return res.docs[0].data(); }

    // Fallback attempts for legacy codes
    const tryCodes = ['@0002','@0003','@0004','@0005'];
    for (const code of tryCodes) {
      const acc = await this.getAccount(code);
      if (acc && (acc.name === cofreName)) { return acc; }
    }
    return null;
  }

  // Getter Methods

  public get limit() {
    return this.settings.limit;
  }

  // Query Methods

  public query(where?: query['where'], reset: boolean = true, flex: boolean = false, scrolling: boolean = false, strict: boolean = true) {

    return (new Promise<IFinancialBankAccount[]>((resolve) => {

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

  // CRUD Methods - Accounts

  public getAccounts(listenerId: string, listener: ((_: any)=>void)) {
       
    const emitterId = 'records';

    Utilities.onEmitterListener(this._dataMonitors, emitterId, listenerId, listener);

    if (this._checkRequest) {
      this._dataMonitors.emit(emitterId, this.treatData(emitterId));
    }
  }

  public async getAccount(code: string | number) {

    return (new Promise<any>((resolve, reject) => {

      const collection = this.iToolsService.database().collection('FinancialBankAccounts');

      // Ensure matching by correct type: default codes start with '@', custom are numeric
      const normalized = ((): (string | number) => {
        const str = String(code);
        return (str.substring(0,1) == '@' ? str : parseInt(str));
      })();

      collection.where([
        { field: 'code', operator: '=', value: normalized },
        { field: 'owner', operator: '=', value: Utilities.storeID }
      ]);

      collection.limit(1);

      collection.get().then((res) => {
        resolve(res.docs.length > 0 ? res.docs[0].data() : null);
      });
    }));
  }

  public async registerAccount(data: IFinancialBankAccount, batch?: IBatch) {

    return (new Promise<any>(async (resolve, reject) => {

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

          // Ensure safe string check to avoid runtime error when code is number
          if (String(data.code).substring(0,1) != '@') {
            data.code = parseInt(String(data.code));
          }
          
          if (!data._id) {

            docRef = { collName: this.collRef().id, where: [
              { field: 'code', operator: '=', value: data.code },
              { field: 'owner', operator: '=', value: Utilities.storeID }
            ] };
          }
        }
        
        data.modifiedDate = iTools.FieldValue.date(Utilities.timezone);

        const batchRef = batch.update(docRef, data, { merge: true });

        await this.checkTransation(data, batch);
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
          resolve(null);
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

  public async deleteAccount(data: IFinancialBankAccount, batch?: IBatch) {

    return (new Promise<any>(async (resolve, reject) => {

      const checkBatch = (batch != undefined);

      try {

        if (!batch) { Utilities.loading() }

        batch = (batch || this.iToolsService.database().batch());
        batch.delete(this.collRef().doc(data._id));

        await this.systemLogs(data, 'delete', batch);

        if (!checkBatch) {

          batch.commit().then((response) => { 

            Utilities.loading(false);
            resolve(response);

            this.notifications('delete', 'success');
          }).catch((error) => {

            Utilities.loading(false);
            reject(error);

            this.notifications('delete', 'error');
            console.error(`Error: ${error.message}`);
          });
        } else {
          resolve(null);
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

  public getAccountsCount(listenerId: string, listener: ((_: any)=>void)) {
    
    const emitterId = 'count';

    Utilities.onEmitterListener(this._dataMonitors, emitterId, listenerId, listener);

    if (this._checkRequest) {
      this._dataMonitors.emit(emitterId, this.treatData(emitterId));
    }
  }

  // Transactions Methods

  public async checkTransation(data: IFinancialBankAccount, batch: IBatch) {

    return (new Promise<void>(async (resolve, reject) => {

      try {

        if (data.transaction) {

          const transaction: IFinancialBankTransaction = data.transaction;

          delete data.transaction;

          if(isNaN(transaction.value)){
            reject({
              message: "Transaction Value is NaN"
            });
            return;
          }

          switch (transaction.type) {
            case EFinancialBankTransactionType.DEPOSIT:{
              const value = transaction.value;
              data.balance = iTools.FieldValue.inc(value);
              break;
            }
            case EFinancialBankTransactionType.WITHDRAW: {
              const value = transaction.value * -1;
              data.balance = iTools.FieldValue.inc(value);
              break;
            }
            case EFinancialBankTransactionType.TRANSFER: {
              const value = transaction.value * -1; 
              data.balance = iTools.FieldValue.inc(value);
              break;
            }
          }

          this.bankTransaction.registerTransaction(transaction, batch)
            .then((response) => { resolve(response) }).catch((error) => { reject(error) });
        } else {
          resolve(null);
        }        
      } catch(error) {
        reject(error);
      }     
    }));
  }

  /**
   * Transfer value between two bank accounts atomically.
   * - Debits the source account using a TRANSFER transaction
   * - Credits the destination account using a DEPOSIT transaction
   * - Creates two FinancialBankTransactions in the same batch for audit
   * - Emits standard notifications via existing flows
   *
   * Notes:
   * - Backward-compatible: does not change existing methods/signatures
   * - Uses existing registerAccount + checkTransation to ensure logs and balances
   */
  public async transferBetweenAccounts(
    fromCode: string | number,
    toCode: string | number,
    value: number,
    description?: string
  ): Promise<void> {

    return new Promise<void>(async (resolve, reject) => {

      try {
        // Basic validations (non-invasive, do not alter existing behavior)
        if (!fromCode || !toCode) {
          return reject(new Error('Parâmetros inválidos: contas de origem e destino são obrigatórias.'));
        }

        if (String(fromCode) === String(toCode)) {
          return reject(new Error('A conta de origem deve ser diferente da conta de destino.'));
        }

        if (!value || isNaN(value) || value <= 0) {
          return reject(new Error('Valor de transferência inválido.'));
        }

        Utilities.loading();

        // Resolve complete account documents by code (to keep registerAccount semantics intact)
        const normalizeCode = (c: string | number): (string | number) => {
          const str = String(c);
          return (str.substring(0,1) == '@' ? str : parseInt(str));
        };

        const [fromAccount, toAccount] = await Promise.all([
          this.getAccount(normalizeCode(fromCode)),
          this.getAccount(normalizeCode(toCode))
        ]);

        if (!fromAccount || !toAccount) {
          Utilities.loading(false);
          return reject(new Error('Conta de origem ou destino não encontrada.'));
        }

        // Optional safeguard: prevent negative source balance
        // If the business allows overdraft, this check can be relaxed or removed.
        const currentFromBalance = parseFloat((fromAccount.balance || 0) as any);
        if ((currentFromBalance - value) < 0) {
          Utilities.loading(false);
          return reject(new Error('Saldo insuficiente na conta de origem.'));
        }

        // Compose transactions
        const batch = this.iToolsService.database().batch();

        // Source account: TRANSFER (debit)
        const fromData: IFinancialBankAccount = {
          _id: fromAccount._id,
          code: fromAccount.code,
          name: fromAccount.name,
          account: fromAccount.account,
          agency: fromAccount.agency,
          balance: fromAccount.balance,
          owner: Utilities.storeID,
          modifiedDate: iTools.FieldValue.date(Utilities.timezone),
          transaction: {
            type: EFinancialBankTransactionType.TRANSFER,
            bankAccount: { code: String(fromAccount.code), name: fromAccount.name },
            value: value,
            // Annotation for traceability in statements
            // (extra field is optional and backward-compatible)
            // @ts-ignore - description is not required by interface
            description: description || `Transferência para ${Utilities.prefixCode(String(toAccount.code))} - ${toAccount.name}`
          } as any
        };

        // Destination account: DEPOSIT (credit)
        const toData: IFinancialBankAccount = {
          _id: toAccount._id,
          code: toAccount.code,
          name: toAccount.name,
          account: toAccount.account,
          agency: toAccount.agency,
          balance: toAccount.balance,
          owner: Utilities.storeID,
          modifiedDate: iTools.FieldValue.date(Utilities.timezone),
          transaction: {
            type: EFinancialBankTransactionType.DEPOSIT,
            bankAccount: { code: String(toAccount.code), name: toAccount.name },
            value: value,
            // @ts-ignore - description is not required by interface
            description: description || `Transferência de ${Utilities.prefixCode(String(fromAccount.code))} - ${fromAccount.name}`
          } as any
        };

        // Use existing flow to ensure balance updates + transaction logs + system logs
        await this.registerAccount(fromData, batch);
        await this.registerAccount(toData, batch);

        // Commit single atomic batch
        await batch.commit();

        Utilities.loading(false);

        // Unified success notification for transfer
        this.notificationService.create({
          title: this.translate.pageTitle,
          description: 'Transferência realizada com sucesso.',
          status: ENotificationStatus.success
        }, false);

        resolve();
      } catch (error) {
        Utilities.loading(false);
        // Error notification remains consistent
        this.notificationService.create({
          title: this.translate.pageTitle,
          description: 'Não foi possível realizar a transferência.',
          status: ENotificationStatus.danger
        }, false);
        reject(error);
      }
    });
  }

  // Auxiliary Methods - Logs

  private async systemLogs(data: IFinancialBankAccount, action: string, batch: IBatch, batchRef?: number) {

    const settings: ISystemLog = {
      data: [<any>{}]
    };    
    
    settings.data[0].referenceCode = (action == 'register' ? iTools.FieldValue.bindBatchData(batchRef, 'code') : data.code);
    settings.data[0].type = ESystemLogType.FinancialBankAccount;

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

    const collection = this.iToolsService.database().collection('FinancialBankAccounts');

    settings = (settings || {});

    if (settings.orderBy) {
      settings.orderBy.code = 1;
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

  // Data processing

  public removeListeners(emitterId: string = null, listenerId: string | string[] = null) {
    Utilities.offEmitterListener(this._dataMonitors, emitterId, listenerId);
  }

  private requestData(settings: query, strict: boolean) {

    return (new Promise<IFinancialBankAccount[]>((resolve, reject) => {

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

  private treatData(id: string, data?: IFinancialBankAccount[]) {
    
    if (id == 'count') {

      const result: any = {
        current: $$(data || this.data).length, total: this.settings.count
      };

      return result;
    }

    if (id == 'records') {
    
      let records = [];

      const accountsDefault = [];
      const accountsCustom = [];      

      $$(data ? data : Utilities.deepClone(this.data)).map((_, item) => {

        item.code = Utilities.prefixCode(item.code);

        if (item.code[0] == '@') {
          accountsDefault.push(item);
        } else {
          accountsCustom.push(item);
        }
      });

      accountsDefault.sort((a, b) => {
        return ((a.code < b.code) ? -1 : ((a.code > b.code) ? 1 : 0));
      });

      accountsCustom.sort((a, b) => {
        return ((a.code < b.code) ? -1 : ((a.code > b.code) ? 1 : 0));
      });

      records = [...accountsDefault, ...accountsCustom];

      return records;
    }    
  }

}
