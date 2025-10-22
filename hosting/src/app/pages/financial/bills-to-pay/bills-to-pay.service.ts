import { Injectable } from "@angular/core";
import { EventEmitter } from 'events';
import { iTools } from "@itools/index";

// Services
import { IToolsService } from '@shared/services/iTools.service';
import { BankAccountsService } from "../bank-accounts/bank-accounts.service";
import { SystemLogsService } from '@shared/services/system-logs.service';
import { NotificationService } from '@shared/services/notification.service';

// Translate
import { BillsToPayTranslate } from "./bills-to-pay.translate";

// Interfaces
import { IBatch } from '@itools/interfaces/IBatch';
import { ICollection } from '@itools/interfaces/ICollection';
import { IFinancialBillToReceive } from "@shared/interfaces/IFinancialBillToReceive";
import { EFinancialBankTransactionType } from "@shared/interfaces/IFinancialBankTransaction";
import { IFinancialBillToPay, EFinancialBillToPayStatus, EFinancialBillToPayOrigin } from '@shared/interfaces/IFinancialBillToPay';
import { ESystemLogAction, ESystemLogType, ISystemLog } from '@shared/interfaces/ISystemLog';
import { ENotificationStatus } from '@shared/interfaces/ISystemNotification';

// Types
import { query } from "@shared/types/query";

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { ECashierInflowOrigin, ECashierInflowStatus, ICashierInflow } from "@shared/interfaces/ICashierInflow";
import { ECashierOutflowOrigin, ECashierOutflowStatus, ICashierOutflow } from "@shared/interfaces/ICashierOutflow";
import { CashierFrontOutflowService } from "@pages/cashier/cashier-front/components/cashier-outflow/cashier-outflow.service";
import { CashierFrontInflowService } from "@pages/cashier/cashier-front/components/cashier-inflow/cashier-inflow.service";

@Injectable({ providedIn: 'root' })
export class BillsToPayService {

  public translate = BillsToPayTranslate.get();

  private data: { [_id: string]: IFinancialBillToPay } = {};

  private _checkProcess: boolean = false;
  private _checkRequest: boolean = false;
  private _dataMonitors: EventEmitter = new EventEmitter();

  private firstScrolling = false;
  private settings: any = { start: 0, limit: 60, count: 0, snapshotRef: null };

  constructor(
    private iToolsService: IToolsService,
    private systemLogsService: SystemLogsService,
    private notificationService: NotificationService,
    private bankAccountsService: BankAccountsService,
    private cashierInflowService: CashierFrontInflowService,
    private cashierOutflowService: CashierFrontOutflowService,
  ) {
    this.query();
  }

  // Getter Methods

  public get limit() {
    return this.settings.limit;
  }  

  // Query Methods

  public query(where?: query['where'], reset: boolean = true, flex: boolean = false, scrolling: boolean = false, strict: boolean = true, limit: number = 0) {

    return (new Promise<IFinancialBillToPay[]>((resolve) => {

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

  // CRUD Methods - Bills

  public getBills(listenerId: string, listener: ((_: any)=>void)) {
       
    const emitterId = 'records';

    Utilities.onEmitterListener(this._dataMonitors, emitterId, listenerId, listener);

    if (this._checkRequest) {
      this._dataMonitors.emit(emitterId, this.treatData(emitterId));
    }
  }

  public async registerBill(data: IFinancialBillToPay, batch?: IBatch) {

    return (new Promise<any>(async (resolve, reject) => {

      const checkBatch = (batch != undefined);
      const operation = (!data.code ? 'register' : 'update');

      try {

        if (!batch) { Utilities.loading() }

        batch = (batch || this.iToolsService.database().batch());

        let docRef: any = this.collRef().doc(data._id);
        let source: any;

        const owner = data.owner || Utilities.storeID;

        if (!data.code) {

          data.code = iTools.FieldValue.control('SystemControls', owner, `${this.collRef().id}.code`);
          data.owner = owner;
          data.operator = Utilities.operator;
          data.registerDate = iTools.FieldValue.date(Utilities.timezone);
        } else {

          data.code = parseInt(<string>data.code);

          if (!data._id) {

            docRef = { collName: this.collRef().id, where: [
              { field: 'code', operator: '=', value: parseInt(<any>data.code) },
              { field: 'owner', operator: '=', owner }
            ] };
          }

          source = (await this.query([
            { field: (data._id ? "_id" : "code"), operator: "=", value: (data._id ? data._id : parseInt(<any>data.code)) },
            { field: "owner", operator: "=", value: owner }
          ], false, false, false, false))[0];

          if (!source) {
  
            reject({message: "Source data is undefined."});
            Utilities.loading(false);

            return;
          }
        }
        
        data.modifiedDate = iTools.FieldValue.date(Utilities.timezone);

        const batchRef = batch.update(docRef, data, { merge: true });

        await this.updateReference(data, batch);
        await this.checkBankAccount(data, source, operation, batch, batchRef);
        await this.systemLogs(data, operation, batch, batchRef);

        
        // console.log(batch);
      
        // return;

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

  public async cancelBill(data: IFinancialBillToPay, batch?: IBatch) {

    return (new Promise<any>(async (resolve, reject) => {

      const checkBatch = (batch != undefined);

      try {

        if (!batch) { Utilities.loading() }        

        batch = (batch || this.iToolsService.database().batch());

        let docRef: any = this.collRef().doc(data._id);

        data.owner = data.owner || Utilities.storeID;

        if (!data._id) {

          data.code = parseInt(<string>data.code);

          docRef = {
            collName: this.collRef().id, 
            where: [
              { field: 'code', operator: '=', value: data.code },
              {field: "owner", operator: "=", value: data.owner}
            ] 
          };
        }

        let source = (await this.query([
          {field: data._id ? "_id" : "code", operator: "=", value: data._id ? data._id : data.code},
          {field: "owner", operator: "=", value: data.owner}
        ], false, false, false, false))[0];

        if (!source) {

          reject({message: "Source data is undefined."});
          Utilities.loading(false);

          return;
        }

        const updateObject: any = {
          status: EFinancialBillToPayStatus.CANCELED
        };

        batch.update(docRef, updateObject, { merge: true });

        await this.updateReference(data, batch);
        await this.checkBankAccount(data, source, 'cancel', batch);
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

  public async deleteBill(data: IFinancialBillToPay, batch?: IBatch) {

    return (new Promise<any>(async (resolve, reject) => {

      const checkBatch = (batch != undefined);

      try {

        if (!batch) { Utilities.loading() }        

        batch = (batch || this.iToolsService.database().batch());

        let docRef: any = this.collRef().doc(data._id);

        if (!data._id) {
          docRef = { collName: this.collRef().id, where: [{ field: 'code', operator: '=', value: parseInt(<string>data.code) }] };
        }

        batch.delete(docRef);

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

  public getBillsCount(listenerId: string, listener: ((_: any)=>void)) {
      
    const emitterId = 'count';

    Utilities.onEmitterListener(this._dataMonitors, emitterId, listenerId, listener);

    if (this._checkRequest) {
      this._dataMonitors.emit(emitterId, this.treatData(emitterId));
    }
  }

  // Auxiliary Methods

  private async updateReference(data: IFinancialBillToPay, batch: IBatch) {

    return (new Promise<any>(async (resolve, reject) => {

      if (data.status == EFinancialBillToPayStatus.CONCLUDED) {

        const obj: any = {
          code: parseInt(<string>data.referenceCode),
          modifiedDate: iTools.FieldValue.date(Utilities.timezone)
        };

        let batchRef = null;
    
        if (data.origin == EFinancialBillToPayOrigin.CASHIER) {
    
        }
        else if (data.origin == EFinancialBillToPayOrigin.PURCHASE) {

          obj.paymentStatus = data.status;

          batchRef = batch.update({
            collName: 'StockPurchases',
            where: [
              { field: 'code', operator: '=', value: parseInt(data.referenceCode.toString()) },
              { field: 'owner', operator: '=', value: Utilities.storeID }
            ]
          }, obj, { merge: true });
        }
        else if (data.origin == EFinancialBillToPayOrigin.TRANSFER) {

          obj.paymentStatus = data.status;

          batchRef = batch.update({
            collName: 'StockTransfers',
            where: [
              { field: 'code', operator: '=', value: parseInt(data.referenceCode.toString()) },
              { field: 'owner', operator: '=', value: Utilities.storeID }
            ]
          }, obj, { merge: true });
        }

        resolve({ batchRef });
      }

      resolve(null);      
    }));
  }

  private async checkBankAccount(data: IFinancialBillToPay, source: IFinancialBillToPay, operation: ('register'|'update'|'cancel'), batch: IBatch, batchRef?: any) {

    return (new Promise<void>(async (resolve, reject) => {

      try {

        const defaultAccount: any = (await this.bankAccountsService.query([{field: "code", operator: "=", value: "@0001"}], false, false, false, false))[0];

        const bankTransitions: any = [];

        let inflows = 0;
        let outflows = 0;

        const componseObject = ((method: any, installmentIndex?: number, paymentIndex?: number, removed?: boolean) => {

          if (!method.bankAccount && !defaultAccount || method.bankAccount && !method.bankAccount.code && !defaultAccount){
            throw new Error("Meio de pagamento não possui Conta Bancária configurada!");
          }

          method.bankAccount = method.bankAccount && method.bankAccount.code ? method.bankAccount : {
            _id: defaultAccount._id,
            code: defaultAccount.code,
            agency: defaultAccount.agency,
            account: defaultAccount.account,
            name: defaultAccount.name
          };

          const isMoney = method.code == 1000;

          const obj: any = { 
            code: method.bankAccount.code,
            transaction: {
              bankAccount: method.bankAccount,
              type: (()=>{
                if(operation == 'cancel' || removed ){
                  return EFinancialBankTransactionType.DEPOSIT;
                }
                if(method.value > 0){
                  return EFinancialBankTransactionType.WITHDRAW
                }else{
                  return EFinancialBankTransactionType.DEPOSIT;
                }
              })(),
                            
              value: method.value,
              uninvoiced: !!method.uninvoiced
            }
          };

          // console.log((source && source.installments && source.installments[installmentIndex] && source.installments[installmentIndex].paymentMethods && source.installments[installmentIndex].paymentMethods[paymentIndex] && !removed), source.installments, installmentIndex, paymentIndex, removed)

          if(source && source.installments && source.installments[installmentIndex] && source.installments[installmentIndex].paymentMethods && source.installments[installmentIndex].paymentMethods[paymentIndex] && !removed && operation != 'cancel'){
            const remoteValue = (<any>source).installments[installmentIndex].paymentMethods[paymentIndex].value;
            obj.transaction.value = method.value;

            // console.log(obj.transaction.value, method.value, remoteValue)

            if(obj.transaction.value < 0){
              obj.transaction.type =  (()=>{
                obj.transaction.value = Math.abs(obj.transaction.value);
                return  EFinancialBankTransactionType.DEPOSIT; 
              })();
            }
          }

          if(obj.transaction.type == EFinancialBankTransactionType.DEPOSIT && isMoney){
            inflows += obj.transaction.value
          }

          if(obj.transaction.type == EFinancialBankTransactionType.WITHDRAW && isMoney){
            outflows += Math.abs(obj.transaction.value);
          }

          if(operation != 'cancel' && data && data.installments || operation == 'cancel' && data && data.installments){
            if (paymentIndex >= 0 && obj.transaction.value != 0 && !removed) {

              if (!data?.installments[installmentIndex].paymentMethods[paymentIndex].history) {
                data.installments[installmentIndex].paymentMethods[paymentIndex].history = [];
              }
  
              data.installments[installmentIndex].paymentMethods[paymentIndex].history.push({
                date: iTools.FieldValue.date(Utilities.timezone),
                value: method.value
              });
            }
          }

          return obj;
        });

        if (!source && (operation != 'cancel')) {

          $$(Utilities.deepClone(data.installments)).map((installmentIndex, installmentData) => {

            $$(Utilities.deepClone(installmentData.paymentMethods)).map((paymentIndex, paymentData) => {

              const obj = componseObject(paymentData, installmentIndex, paymentIndex);
              if(obj.transaction.value != 0){
                bankTransitions.push(obj);
              }

            });
          });
        } else {
          
          if(operation == 'cancel'){
            if(source){
              $$(Utilities.deepClone(source.installments)).map((installmentIndex, installmentData) => {
                $$(Utilities.deepClone(installmentData.paymentMethods)).map((paymentIndex, paymentData) => {
                  const obj = componseObject(paymentData, installmentIndex, paymentIndex);
                  if(obj.transaction.value != 0){
                    bankTransitions.push(obj);
                  }
                });
              });
            }
          }else{
            const sourceInstalmentsData = Utilities.deepClone(source.installments || []);

            $$(Utilities.deepClone(data.installments)).map((installmentIndex, installmentData) => {
  
              sourceInstalmentsData.splice(0, 1);
  
              const sourcePaymentMethodsData = Utilities.parseArrayToObject(Utilities.deepClone(source.installments[installmentIndex] ? source.installments[installmentIndex].paymentMethods : []), 'code');
  
              ( source.installments[installmentIndex]?.paymentMethods || []).forEach((remotePaymentData)=>{
  
                let has = false;
  
                Utilities.deepClone(installmentData.paymentMethods || []).forEach((currentPaymentData)=>{
                  if(parseInt(remotePaymentData.code) == parseInt(currentPaymentData.code)){ has = true; }
                });
  
                if(!has){
  
                  const obj = componseObject(remotePaymentData, installmentIndex, null, true);
                  if(obj.transaction.value != 0){
                    bankTransitions.push(obj);
                  }
                }
              });
  
  
              $$(Utilities.deepClone(installmentData.paymentMethods)).map((paymentIndex, paymentData) => {
                
                const sourceData = sourcePaymentMethodsData[paymentData.code];
  
                if (sourceData) {
  
                  if (paymentData.value != sourceData.value) {
                    paymentData.value = (paymentData.value - sourceData.value);
  
                    const obj = componseObject(paymentData, installmentIndex, paymentIndex);
                    if(obj.transaction.value != 0){
                      bankTransitions.push(obj);
                    }
                  }
    
                  delete sourcePaymentMethodsData[paymentData.code];
                } else {
  
                  const obj = componseObject(paymentData, installmentIndex, paymentIndex);
                  if(obj.transaction.value != 0){
                    bankTransitions.push(obj);
                  }
                }
  
              });
  
            });  
  
            sourceInstalmentsData.forEach((item)=>{
              ( item.paymentMethods || []).forEach((remotePaymentData)=>{
  
                const obj = componseObject(remotePaymentData, -1, null, true);
  
                if(obj.transaction.value != 0){
                  bankTransitions.push(obj);
                }
              });
            });
          }
        }

        if (bankTransitions.length > 0) {

          $$(bankTransitions).map((_, data) => {
            this.bankAccountsService.registerAccount(data, batch);
          });
        }

        const billToPayCodeRef: any = (operation == 'register' ? iTools.FieldValue.bindBatchData(batchRef, 'code') : parseInt(<string>data.code));

        if(inflows > 0){

          const inflow: ICashierInflow = {
            origin: ECashierInflowOrigin.BILLSTOPAY,
            referenceCode: billToPayCodeRef,
            category: {
              code: "@0001",
              name: "CONTAS A PAGAR",
              _id: ""
            },
            value: inflows,
            status: ECashierInflowStatus.CONCLUDED,
            note: `Entrada Proveniente de conta a pagar`,
          };

          this.cashierInflowService.registerInflow(inflow, batch);
        }

        if(outflows > 0){

          const outflow: ICashierOutflow = {
            origin: ECashierOutflowOrigin.BILLSTOPAY,
            referenceCode: billToPayCodeRef,
            category: {
              code: "@0001",
              name: "CONTAS A PAGAR",
              _id: ""
            },
            value: outflows,
            status: ECashierOutflowStatus.CONCLUDED,
            note: `Saída Proveniente de conta a pagar`,
          };

          this.cashierOutflowService.registerOutflow(outflow, batch);
        }

        resolve();
      } catch(error) {
        reject(error);
      }
    }));
  }

  private async systemLogs(data: IFinancialBillToPay, action: string, batch: IBatch, batchRef?: number) {

    const settings: ISystemLog = {
      data: [<any>{}]
    };    
    
    settings.data[0].referenceCode = (action == 'register' ? iTools.FieldValue.bindBatchData(batchRef, 'code') : data.code);
    settings.data[0].type = ESystemLogType.FinancialBillsToPay;

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

    const collection = this.iToolsService.database().collection('FinancialBillsToPay');
    
    settings = Utilities.deepClone(settings || {});

    if (settings.orderBy) {
      settings.orderBy.code = -1;
    } else {
      settings.orderBy = { code: -1 };      
    }
    
    collection.orderBy(settings.orderBy);

    const hasOwner = (()=>{
      let has = false;
      (settings.where || []).forEach((item)=>{
        if (item.field.toLowerCase() == "owner"){
          has = true;
        }
      });
      return has;
    })();

    if (settings.where && !hasOwner) {
      settings.where.push({ field: 'owner', operator: '=', value: Utilities.storeID });
    } else if (!hasOwner){
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

  // Data processing

  public removeListeners(emitterId: string = null, listenerId: string | string[] = null) {
    Utilities.offEmitterListener(this._dataMonitors, emitterId, listenerId);
  }

  private requestData(settings: query, strict: boolean) {

    return (new Promise<IFinancialBillToPay[]>((resolve, reject) => {

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

  private treatData(id: string, data?: IFinancialBillToPay[]) {

    if (id == 'count') {

      const result: any = { 
        current: $$(data || this.data).length, total: this.settings.count
      };

      return result;
    }

    if (id == 'records') {      
    
      const records = [];

      $$(data ? data : Utilities.deepClone(this.data)).map((_, item) => {

        item.code = Utilities.prefixCode(item.code);

        if (item.department && item.department.code !== undefined && item.department.code !== null) {
          const raw = item.department.code;
          const stringCode = String(raw);
          if (stringCode.startsWith('@')) {
            item.department.code = stringCode;
          } else {
            const numeric = parseInt(stringCode, 10);
            if (!isNaN(numeric)) {
              item.department.code = Utilities.prefixCode(numeric);
            } else {
              item.department.code = stringCode;
            }
          }
        }

        if (item.referenceCode) {

          item.referenceCode = Utilities.prefixCode(item.referenceCode);

          if (item.origin != EFinancialBillToPayOrigin.FINANCIAL) {
            item.description = (item.description || "").replace("$RPC('referenceCode')", item.referenceCode);
          }
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
