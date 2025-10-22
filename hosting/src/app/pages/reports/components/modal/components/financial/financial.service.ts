import { Injectable } from "@angular/core";
import { IToolsService } from "@shared/services/iTools.service";

// Services
import { CashierReportsService } from "../cashier/cashier.service";

// Interfaces
import { IFinancialBillToPay, EFinancialBillToPayStatus } from '@shared/interfaces/IFinancialBillToPay';
import { IFinancialBillToReceive, EFinancialBillToReceiveStatus } from '@shared/interfaces/IFinancialBillToReceive';
import { ICollection } from "@itools/interfaces/ICollection";

// Types
import { query } from "@shared/types/query";

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { DateTime } from '@shared/utilities/dateTime';

@Injectable({ providedIn: 'root' })
export class FinancialReportsService {

  constructor(
    private iToolsService: IToolsService,
    private cashierReportsService: CashierReportsService
  ) { }

  // Helper to compute amount received for a sale (fallbacks for different flows)
  private computeReceived(item: any): number {
    let received = Number(item?.billToReceive?.config?.received || 0);
    if (!received && Array.isArray(item?.paymentMethods)) {
      received = item.paymentMethods.reduce((sum: number, m: any) => sum + Number(m?.value || 0), 0);
    }
    if (!received && item?.balance?.partialRevenue) {
      received = Number(item.balance.partialRevenue || 0);
    }
    return received || 0;
  }

  public async getCashFlow(settings: { data?: { period: { start: string, end: string }, store: { id: string } } }): Promise<any> {
    try {
      const data: any = {};

      data.cashier = await this.cashierReportsService.getResume({
        where: [
          { field: 'date', operator: '>=', value: settings.data.period.start },
          { field: 'date', operator: '<=', value: settings.data.period.end },
          { field: 'owner', operator: '=', value: settings.data.store.id }
        ],
        orderBy: { code: 1 }
      });


      return this.treatCashFlow(data);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public async getBillsToPay(settings: { where: query['where'], orderBy: query['orderBy'], data: { type: string } }): Promise<any> {
    try {
      this.addStatusClausesForAccountsPayable({ where: settings.where, data: settings.data })

      const collection = this.iToolsService.database().collection('FinancialBillsToPay');
      collection.orderBy(settings.orderBy);
      collection.where(settings.where);

      const result = await this.batchDataSearch(collection, settings);
      return this.treatBillsToPay(result, { type: settings.data.type });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public async getBillsToReceive(settings: { where: query['where'], orderBy: query['orderBy'], data: { type: string } }) {
    return (new Promise<any>((resolve) => {
      // LOG PARA VER O TIPO RECEBIDO
      console.log('🎯 getBillsToReceive - tipo recebido:', settings.data?.type);

      this.addStatusClausesForAccountsReceivable({ where: settings.where, data: settings.data });

      const collection = this.iToolsService.database().collection('FinancialBillsToReceive');
      collection.orderBy(settings.orderBy);
      collection.where(settings.where);

      const allData = [];

      collection.limit(5000).get().then((res) => {
        if (res && res.docs && Array.isArray(res.docs)) {
          res.docs.forEach((doc) => {
            if (doc && typeof doc.data === 'function') {
              const docData = doc.data();
              allData.push(docData);
            }
          });
        }

        console.log(`✅ Total de contas a receber encontradas: ${allData.length}`);

        // GARANTIR QUE O TIPO SEJA PASSADO
        const type = settings.data?.type || 'pendingAccounts'; // Default para pendingAccounts
        console.log('🎯 Tipo usado para processar:', type);

        const result = this.treatBillsToReceive(allData, { type: type });
        console.log('📈 Resultado processado:', result);

        resolve(result);
      }).catch((error) => {
        console.error('❌ Erro ao buscar contas a receber:', error);
        resolve({ records: [], balance: {} });
      });
    }));
  }

  public async getBankTransactions(settings: { where: query['where'], orderBy: query['orderBy'], data: { type: string } }): Promise<any> {
    try {
      const collection = this.iToolsService.database().collection('FinancialBankTransactions');
      collection.orderBy(settings.orderBy);
      collection.where(settings.where);

      const response = await collection.get();
      const data: any = [];
      response.docs.forEach((doc) => {
        data.push(doc.data());
      });

      return this.treatBankTransactions(data, null);
    } catch (error) {
      return Promise.reject(error);
    }
  }
  public async getCommissions(settings: { where: query['where'], orderBy: query['orderBy'], data: { type: string, collaborator?: { username?: string, code?: any, name?: string } | null } }): Promise<any> {
    console.debug('[FinancialReportsService] getCommissions settings:', settings);
    try {
      const collection = this.iToolsService.database().collection('CashierSales');
      collection.orderBy(settings.orderBy);
      collection.where(settings.where);

      const records = await this.batchDataSearch(collection, settings);
      console.debug('[FinancialReportsService] getCommissions received records:', records.length);
      let result: any;
      switch (settings.data.type) {
        case 'commissionReportAnalytical':
          result = this.treatCommissionAnalytical(records);
          break;
        case 'commissionReportSynthetic':
        default:
          result = this.treatCommissionSynthetic(records);
          break;
      }
      // Optional post-filter by collaborator (operator or executor attribution)
      if (settings.data?.collaborator && result && Array.isArray(result.records)) {
        const username = (settings.data.collaborator.username || '').toString().toLowerCase();
        const code = (settings.data.collaborator.code || '').toString().toLowerCase();
        const name = (settings.data.collaborator.name || '').toString().toLowerCase();
        result.records = result.records.filter((r: any) => {
          const rid = (r.collaboratorId || '').toString().toLowerCase();
          const rname = (r.collaborator || '').toString().toLowerCase();
          return (rid === username || rid === code || rname === username || rname === name);
        });
        // Recompute balances after filter
        if (settings.data.type === 'commissionReportSynthetic') {
          const total = result.records.reduce((sum: number, it: any) => sum + (Number(it.commission) || 0), 0);
          const salesTotal = result.records.reduce((sum: number, it: any) => sum + (Number(it.salesTotal) || 0), 0);
          result.balance = { total, salesTotal };
        } else {
          const total = result.records.reduce((sum: number, it: any) => sum + (Number(it.commissionValue) || 0), 0);
          const totalSalesValue = result.records.reduce((sum: number, it: any) => sum + (Number(it.saleValue) || 0), 0);
          result.balance = { total, totalCommissionValue: total, totalSalesValue };
        }
      }
      return result;
    } catch (error) {
      return Promise.reject(error);
    }
  }
  // Auxiliaries Methods

  private addStatusClausesForAccountsPayable(settings: { where: query['where'], data: { type: string } }) {

    settings.where = (() => {

      const clauses: query['where'] = (settings.where || []);

      switch (settings.data.type) {
        case 'paidAccounts':
          clauses.push({ field: 'installments.paidAmount', operator: '>', value: 0 });
          clauses.push({ field: 'status', operator: '!=', value: EFinancialBillToPayStatus.CANCELED });
          break;
        case 'pendingAccounts':
        case 'overdueAccounts':
          clauses.push({ field: 'status', operator: '=', value: EFinancialBillToPayStatus.PENDENT });
          break;
        case 'canceledAccounts':
          clauses.push({ field: 'status', operator: '=', value: EFinancialBillToPayStatus.CANCELED });
          break;
      }

      return clauses;
    })();
  }

  private addStatusClausesForAccountsReceivable(settings: { where: query['where'], data: { type: string } }) {

    settings.where = (() => {

      const clauses: query['where'] = (settings.where || []);

      switch (settings.data.type) {
        case 'receivedAccounts':
          clauses.push({ field: 'status', operator: '=', value: EFinancialBillToReceiveStatus.CONCLUDED });
          clauses.push({ field: 'installments.receivedAmount', operator: '>', value: 0 });
          break;
        case 'pendingAccounts':
        case 'overdueAccounts':
          clauses.push({ field: 'status', operator: '=', value: EFinancialBillToReceiveStatus.PENDENT });
          break;
        case 'canceledAccounts':
          clauses.push({ field: 'status', operator: '=', value: EFinancialBillToReceiveStatus.CANCELED });
          break;
      }

      return clauses;
    })();
  }

  private batchDataSearch(collection: ICollection, settings: query) {

    return (new Promise<any>((resolve, reject) => {

      settings.where = (settings.where.length > 0 ? settings.where : []);
      settings.start = (settings.start >= 0 ? settings.start : 0);
      settings.limit = (settings.limit > 0 ? settings.limit : 500);
      console.debug('[FinancialReportsService] batchDataSearch query:', settings);

      collection.count().get().then((res) => {

        const count = (res.docs.length > 0 ? res.docs[0].data().count : 0);
        console.debug('[FinancialReportsService] batchDataSearch count:', count);
        const requestsCount = Math.ceil(count / 500);

        let data = [];
        let control = 1;
        let success = null;
        let error = null;

        const requestRecursive = (settings: query) => {

          try {

            collection.where(settings.where);
            collection.startAfter(settings.start);
            collection.limit(settings.limit);

            collection.get().then((res) => {

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
          } catch (e) {
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
            console.debug('[FinancialReportsService] batchDataSearch fetched records:', data.length);
            resolve(data);
          }

          if (error) {
            clearInterval(timer);
            reject(error);
          }
        }, 200);
      }).catch(reject);
    }));
  }

  // Utility Methods

  private treatCashFlow(data: any[]) {

    const obj: any = {}

    const balance = {
      cashier: 0, billsToPay: 0,
      billsToReceive: 0, productsCosts: 0,
      servicesCosts: 0, costs: 0,
      paymentsCosts: 0, revenue: 0,
      grossProfit: 0
    };

    $$(data).map((type, value) => {

      if (type == 'cashier') {

        $$(value).map((_, item) => {

          const billsToPay = item.balance.billsToPay ?? 0;
          const billsToReceive = item.balance.billsToReceive ?? 0;

          const cashierPartialResult = ((item.balance.sales + item.balance.inflows) - item.balance.outflows);

          obj[item.date] = {
            cashier: cashierPartialResult,
            productsCosts: item.balance.productsCosts,
            servicesCosts: item.balance.servicesCosts,
            paymentsCosts: item.balance.paymentsCosts,
            billsToPay: billsToPay,
            billsToReceive: billsToReceive
          }
        });
      }

      // if (type == 'billsToPay') {

      //   $$(value.records || []).map((_, item) => {

      //     console.log(item);
      //     const date = item.paymentDate || item.registerDate;

      //     if (!obj[date]) {
      //       obj[date] = {};
      //     }

      //     if (!obj[date].billsToPay) {             
      //       obj[date].billsToPay = 0;
      //     }

      //     obj[date].billsToPay += item.paid;
      //   });
      // }

      // if (type == 'billsToReceive') {

      //   $$(value.records || []).map((_, item) => {

      //     if (!obj[item.registerDate]) {
      //       obj[item.registerDate] = {};             
      //     }

      //     if (!obj[item.registerDate].billsToReceive) {
      //       obj[item.registerDate].billsToReceive = 0;
      //     }

      //     obj[item.registerDate].billsToReceive += item.received;
      //   });
      // }        
    });

    // console.log(obj);

    $$(obj).map((date, item) => {

      item.date = date;
      item.cashier = (item.cashier || 0);
      item.billsToPay = (item.billsToPay || 0);
      item.billsToReceive = (item.billsToReceive || 0);
      item.productsCosts = (item.productsCosts || 0);
      item.servicesCosts = (item.servicesCosts || 0);
      item.paymentsCosts = (item.paymentsCosts || 0);
      item.costs = (item.productsCosts + item.servicesCosts + item.paymentsCosts);
      item.revenue = ((item.cashier + item.billsToReceive) - item.billsToPay);
      item.grossProfit = (item.revenue - item.costs);

      balance.cashier += item.cashier;
      balance.billsToPay += item.billsToPay;
      balance.billsToReceive += item.billsToReceive;
      balance.productsCosts += item.productsCosts;
      balance.servicesCosts += item.servicesCosts;
      balance.paymentsCosts += item.paymentsCosts;
      balance.costs += item.costs;
      balance.revenue += item.revenue;
      balance.grossProfit += item.grossProfit;
    });

    const records: any = Object.values(obj);

    records.sort((a, b) => {
      return ((a.date < b.date) ? -1 : ((a.date > b.date) ? 1 : 0));
    });

    return { records, balance };
  }

  private treatBillsToPay(data: IFinancialBillToPay[], settings: { type: string }) {

    const result: any = { records: [], balance: {} };

    if (settings.type == 'paidAccounts') {

      const records = [];
      const balance = { amountPaid: 0, accountValue: 0 };

      for (let item of data) {

        const obj: any = {};

        const isZero = item.installments.length == 0;

        obj.code = Utilities.prefixCode(item.code);
        obj.referenceCode = item.referenceCode;
        obj.beneficiary = item.beneficiary;
        obj.category = item.category;
        obj.department = this.composeDepartmentLabel(item.department);
        obj.registerDate = item.registerDate;
        obj.dischargeDate = isZero ? item.modifiedDate : item.installments[item.currentInstallment].dueDate;
        obj.installments = isZero ? "0 / 0" : (item.paidInstallments + ' / ' + item.totalInstallments);
        obj.discount = 0;
        obj.interest = 0;
        obj.amountPaid = item.paid;
        obj.accountValue = item.amount;

        balance.amountPaid += obj.amountPaid;
        balance.accountValue += obj.accountValue;

        records.push(obj);
      }

      result.records = records;
      result.balance = balance;
    }

    if (settings.type == 'pendingAccounts') {

      const records = [];
      const balance = { amountPaid: 0, pendingAmount: 0, accountValue: 0 };

      for (let item of data) {

        const obj: any = {};

        obj.code = Utilities.prefixCode(item.code);
        obj.referenceCode = item.referenceCode;
        obj.beneficiary = item.beneficiary;
        obj.category = item.category;
        obj.department = this.composeDepartmentLabel(item.department);
        obj.registerDate = item.registerDate;
        obj.dueDate = item.installments[item.currentInstallment].dueDate;
        obj.installmentsState = (item.paidInstallments + ' / ' + item.totalInstallments);
        obj.installmentValue = item.installments[item.currentInstallment].amount;
        obj.amountPaid = item.paid;
        obj.pendingAmount = (item.amount - item.paid);
        obj.accountValue = item.amount;

        balance.amountPaid += obj.amountPaid;
        balance.pendingAmount += obj.pendingAmount;
        balance.accountValue += obj.accountValue;

        records.push(obj);
      }

      result.records = records;
      result.balance = balance;
    }

    if (settings.type == 'overdueAccounts') {

      const records = [];
      const balance = { amountPaid: 0, pendingAmount: 0, accountValue: 0 };

      for (let item of data) {

        if (DateTime.getDate('D') > item.installments[item.currentInstallment].dueDate) {

          const obj: any = {};

          const isZero = item.installments.length == 0;

          obj.code = Utilities.prefixCode(item.code);
          obj.referenceCode = item.referenceCode;
          obj.beneficiary = item.beneficiary;
          obj.category = item.category;
          obj.department = this.composeDepartmentLabel(item.department);
          obj.registerDate = item.registerDate;
          obj.dueDate = item.installments[item.currentInstallment]?.dueDate;
          obj.installmentsState = isZero ? "0 / 0" : (item.paidInstallments + ' / ' + item.totalInstallments);
          obj.installmentValue = item.installments[item.currentInstallment]?.amount || 0;
          obj.amountPaid = item.paid;
          obj.pendingAmount = (item.amount - item.paid);
          obj.accountValue = item.amount;

          balance.amountPaid += obj.amountPaid;
          balance.pendingAmount += obj.pendingAmount;
          balance.accountValue += obj.accountValue;

          records.push(obj);
        }
      }

      result.records = records;
      result.balance = balance;
    }

    if (settings.type == 'canceledAccounts') {

      const records = [];
      const balance = { amountPaid: 0, pendingAmount: 0, accountValue: 0 };

      for (let item of data) {

        const obj: any = {};


        const isZero = item.installments.length == 0;

        obj.code = Utilities.prefixCode(item.code);
        obj.referenceCode = item.referenceCode;
        obj.beneficiary = item.beneficiary;
        obj.category = item.category;
        obj.department = this.composeDepartmentLabel(item.department);
        obj.registerDate = item.registerDate;
        obj.dueDate = item.installments[item.currentInstallment]?.dueDate;
        obj.installmentsState = isZero ? "0 / 0" : (item.paidInstallments + ' / ' + item.totalInstallments);
        obj.installmentValue = item.installments[item.currentInstallment]?.amount || 0;
        obj.amountPaid = item.paid;
        obj.pendingAmount = (item.amount - item.paid);
        obj.accountValue = item.amount;

        balance.amountPaid += obj.amountPaid;
        balance.pendingAmount += obj.pendingAmount;
        balance.accountValue += obj.accountValue;

        records.push(obj);
      }

      result.records = records;
      result.balance = balance;
    }

    return result;
  }

  private treatBillsToReceive(data: IFinancialBillToReceive[], settings: { type: string }) {
    console.log('🔍 treatBillsToReceive - tipo:', settings.type);
    console.log('🔍 treatBillsToReceive - dados recebidos:', data);

    const result: any = { records: [], balance: {} };

    if (settings.type == 'pendingAccounts') {
      const records = [];
      const balance = { amountReceived: 0, pendingAmount: 0, accountValue: 0 };

      for (let item of data) {
        // Adicione validação para evitar erros
        if (!item || !item.installments) {
          console.warn('⚠️ Item sem dados necessários:', item);
          continue;
        }

        const obj: any = {};

        // Adicione logs para debug
        console.log('📝 Processando item:', item);

        obj.code = Utilities.prefixCode(item.code);
        obj.referenceCode = item.referenceCode;
        obj.debtor = item.debtor;
        obj.category = item.category;
        obj.registerDate = item.registerDate;
        obj.dueDate = item.installments[item.currentInstallment]?.dueDate;
        obj.installmentsState = (item.receivedInstallments + ' / ' + item.totalInstallments);
        obj.installmentValue = item.installments[item.currentInstallment]?.amount || 0;
        obj.amountReceived = item.received || 0;
        obj.pendingAmount = (item.amount - item.received) || 0;
        obj.accountValue = item.amount || 0;

        balance.amountReceived += obj.amountReceived;
        balance.pendingAmount += obj.pendingAmount;
        balance.accountValue += obj.accountValue;

        records.push(obj);
      }

      result.records = records;
      result.balance = balance;
    }

    if (settings.type == 'pendingAccounts') {

      const records = [];
      const balance = { amountReceived: 0, pendingAmount: 0, accountValue: 0 };

      for (let item of data) {

        const obj: any = {};

        obj.code = Utilities.prefixCode(item.code);
        obj.referenceCode = item.referenceCode;
        obj.debtor = item.debtor;
        obj.category = item.category;
        obj.registerDate = item.registerDate;
        obj.dueDate = item.installments[item.currentInstallment]?.dueDate;
        obj.installmentsState = (item.receivedInstallments + ' / ' + item.totalInstallments);
        obj.installmentValue = item.installments[item.currentInstallment]?.amount;
        obj.amountReceived = item.received;
        obj.pendingAmount = (item.amount - item.received);
        obj.accountValue = item.amount;

        balance.amountReceived += obj.amountReceived;
        balance.pendingAmount += obj.pendingAmount;
        balance.accountValue += obj.accountValue;

        records.push(obj);
      }

      result.records = records;
      result.balance = balance;
    }

    if (settings.type == 'overdueAccounts') {

      const records = [];
      const balance = { amountReceived: 0, pendingAmount: 0, accountValue: 0 };

      for (let item of data) {

        if (DateTime.getDate('D') > item.installments[item.currentInstallment].dueDate) {

          const obj: any = {};

          obj.code = Utilities.prefixCode(item.code);
          obj.referenceCode = item.referenceCode;
          obj.debtor = item.debtor;
          obj.category = item.category;
          obj.registerDate = item.registerDate;
          obj.dueDate = item.installments[item.currentInstallment]?.dueDate;
          obj.installmentsState = (item.receivedInstallments + ' / ' + item.totalInstallments);
          obj.installmentValue = item.installments[item.currentInstallment]?.amount;
          obj.amountReceived = item.received;
          obj.pendingAmount = (item.amount - item.received);
          obj.accountValue = item.amount;

          balance.amountReceived += obj.amountReceived;
          balance.pendingAmount += obj.pendingAmount;
          balance.accountValue += obj.accountValue;

          records.push(obj);
        }
      }

      result.records = records;
      result.balance = balance;
    }

    if (settings.type == 'canceledAccounts') {

      const records = [];
      const balance = { amountReceived: 0, pendingAmount: 0, accountValue: 0 };

      for (let item of data) {

        const obj: any = {};

        obj.code = Utilities.prefixCode(item.code);
        obj.referenceCode = item.referenceCode;
        obj.debtor = item.debtor;
        obj.category = item.category;
        obj.registerDate = item.registerDate;
        obj.dueDate = item.installments[item.currentInstallment]?.dueDate;
        obj.installmentsState = (item.receivedInstallments + ' / ' + item.totalInstallments);
        obj.installmentValue = item.installments[item.currentInstallment]?.amount;
        obj.amountReceived = item.received;
        obj.pendingAmount = (item.amount - item.received);
        obj.accountValue = item.amount;

        balance.amountReceived += obj.amountReceived;
        balance.pendingAmount += obj.pendingAmount;
        balance.accountValue += obj.accountValue;

        records.push(obj);
      }

      result.records = records;
      result.balance = balance;
    }

    return result;
  }

  private composeDepartmentLabel(department?: IFinancialBillToPay['department']): string {
    if (!department) {
      return '';
    }

    const stringCode = String(department.code ?? '').trim();

    if (!stringCode) {
      return department.name || '';
    }

    if (stringCode.startsWith('@')) {
      return `${stringCode} - ${department.name}`;
    }

    const numeric = parseInt(stringCode, 10);
    const formatted = isNaN(numeric) ? stringCode : Utilities.prefixCode(numeric);
    return `${formatted} - ${department.name}`;
  }

  private treatBankTransactions(data: any[], setting: any) {

    const arrData = (!setting ? data : []);

    const obj = {
      balance: {
        total: 0
      },
      records: []
    }

    arrData.forEach((item) => {
      item.date = item.registerDate;
      item.code = Utilities.prefixCode(item.code);
      obj.balance.total += item.type == "DEPOSIT" ? item.value : (item.value * -1);
      obj.records.push(item);
      // delete item.registerDate;
    });

    obj.records.sort((a, b) => {
      return ((a.code < b.code) ? -1 : ((a.code > b.code) ? 1 : 0));
    });

    return obj;
  }
  private treatCommissionSynthetic(data: any[]) {
    console.debug('[FinancialReportsService] treatCommissionSynthetic records:', data.length);
    const result: Record<string, any> = {};
    let total = 0;
    // removed partial revenue from commission synthetic report

    // Filtra apenas vendas concluídas
    data = data.filter(item => !item.canceled && item.status === 'CONCLUDED');

    data.forEach((item: any) => {
      const operatorId = item.operator?.code || item.operator?.username || 'unknown';
      const operatorName = item.operator?.name || item.operator?.username || operatorId;

      const ensureBucket = (id: string, name: string) => {
        if (!result[id]) {
          result[id] = {
            collaborator: name,
            salesQuantity: 0,
            salesTotal: 0,
            commission: 0,
            commissionPercentage: 0,
            partialRevenue: 0,
            paymentDate: null
          };
        }
        return result[id];
      };

      let perSaleCommissionById: Record<string, number> = {};
      let perSaleSalesBaseById: Record<string, number> = {};
      // Split by origin
      let perSaleProductsBaseById: Record<string, number> = {};
      let perSaleServicesBaseById: Record<string, number> = {};
      let perSaleProductsCommissionById: Record<string, number> = {};
      let perSaleServicesCommissionById: Record<string, number> = {};

      // Produtos: comissão sempre atribuída ao operador da venda
      (item.products || []).forEach((p: any) => {
        if (p.commission && p.commission.enabled) {
          const q = Number(p.quantity || 1);
          const lineTotal = (p.paymentAmount != null && p.paymentAmount !== undefined)
            ? Number(p.paymentAmount)
            : Number(p.salePrice || p.unitaryPrice || 0) * q;
          const value = p.commission.type === 'percentage'
            ? (lineTotal * Number(p.commission.value || 0)) / 100
            : Number(p.commission.value || 0) * q;
          perSaleCommissionById[operatorId] = (perSaleCommissionById[operatorId] || 0) + value;
          const base = (p.paymentAmount != null && p.paymentAmount !== undefined)
            ? Number(p.paymentAmount)
            : Number(p.salePrice || p.unitaryPrice || 0) * q;
          perSaleSalesBaseById[operatorId] = (perSaleSalesBaseById[operatorId] || 0) + base;
          perSaleProductsBaseById[operatorId] = (perSaleProductsBaseById[operatorId] || 0) + base;
          perSaleProductsCommissionById[operatorId] = (perSaleProductsCommissionById[operatorId] || 0) + value;
        }
      });

      // Serviços: comissão atribuída ao executor específico, se houver; senão, ao operador
      const services: any[] = (item.services && Array.isArray(item.services))
        ? item.services
        : (item.service && item.service.types ? item.service.types : []);

      services.forEach((s: any) => {
        if (s.commission && s.commission.enabled) {
          const serviceTotal = Number(s.customPrice || s.executionPrice || 0);
          const value = s.commission.type === 'percentage'
            ? (serviceTotal * Number(s.commission.value || 0)) / 100
            : Number(s.commission.value || 0);
          const execId = s.executor?.code || s.executor?.username || operatorId;
          const execName = s.executor?.name || s.executor?.username || operatorName;
          perSaleCommissionById[execId] = (perSaleCommissionById[execId] || 0) + value;
          perSaleSalesBaseById[execId] = (perSaleSalesBaseById[execId] || 0) + serviceTotal;
          perSaleServicesBaseById[execId] = (perSaleServicesBaseById[execId] || 0) + serviceTotal;
          perSaleServicesCommissionById[execId] = (perSaleServicesCommissionById[execId] || 0) + value;
          // marca participação para o bucket
          ensureBucket(execId, execName);
        }
      });

      // Atualiza buckets (operador e executores) a partir do mapa
      const partial = item.billToReceive?.config?.received || 0;
      const totalBase = Object.values(perSaleSalesBaseById).reduce((a: number, b: number) => a + (Number(b) || 0), 0);
      Object.keys(perSaleCommissionById).forEach((id) => {
        const name = (id === operatorId) ? operatorName : (result[id]?.collaborator || id);
        const bucket = ensureBucket(id, name);
        bucket.commission += perSaleCommissionById[id];
        // Para estatísticas: considera a venda para quem recebeu alguma comissão nela
        bucket.salesQuantity += 1;
        // Attribute only the sales base corresponding to this collaborator
        const prodBase = perSaleProductsBaseById[id] || 0;
        const servBase = perSaleServicesBaseById[id] || 0;
        bucket.salesTotal += (perSaleSalesBaseById[id] || 0);
        bucket.productsBase = (bucket.productsBase || 0) + prodBase;
        bucket.servicesBase = (bucket.servicesBase || 0) + servBase;
        bucket.productsCommission = (bucket.productsCommission || 0) + (perSaleProductsCommissionById[id] || 0);
        bucket.servicesCommission = (bucket.servicesCommission || 0) + (perSaleServicesCommissionById[id] || 0);
        // Rateio do recebido proporcional à base desse colaborador na venda
        const allocatedPartial = totalBase > 0 ? partial * ((perSaleSalesBaseById[id] || 0) / totalBase) : 0;
        // removed partial revenue aggregation from commission synthetic
        if (!bucket.paymentDate || (item.paymentDate && item.paymentDate > bucket.paymentDate)) {
          bucket.paymentDate = item.paymentDate;
        }
        total += perSaleCommissionById[id];
      });

      // no partial aggregation
    });

    // Percentual relativo ao total de vendas associado a cada colaborador
    Object.values(result).forEach((record: any) => {
      if (record.salesTotal > 0) {
        record.commissionPercentage = (record.commission * 100) / record.salesTotal;
      }
    });

    // Attach collaboratorId to each record (the key used in aggregation)
    const outRecords = Object.entries(result).map(([id, rec]: [string, any]) => ({ ...rec, collaboratorId: id }));

    // Build balance splits
    const balance = {
      total,
      salesTotal: outRecords.reduce((s, r: any) => s + (Number(r.salesTotal) || 0), 0),
      productsCommission: outRecords.reduce((s, r: any) => s + (Number(r.productsCommission) || 0), 0),
      servicesCommission: outRecords.reduce((s, r: any) => s + (Number(r.servicesCommission) || 0), 0)
    };

    return { records: outRecords, balance };
  }

  private treatCommissionAnalytical(data: any[]) {
    console.debug('[FinancialReportsService] treatCommissionAnalytical records:', data.length);
    const records: any[] = [];
    let total = 0;

    // Filtra apenas vendas concluídas
    data = data.filter(item => !item.canceled && item.status === 'CONCLUDED');

    data.forEach((item: any) => {
      const operatorId = item.operator?.code || item.operator?.username || 'unknown';
      const operatorName = item.operator?.username || item.operator?.name || operatorId;
      const saleValue = item.balance?.total || 0;
      const partialRevenue = this.computeReceived(item);

      // Produtos -> um registro para o operador, se houver comissão
      let productCommission = 0;
      let productSalesBase = 0;
      (item.products || []).forEach((p: any) => {
        if (p.commission && p.commission.enabled) {
          const q = Number(p.quantity || 1);
          const lineTotal = (p.paymentAmount != null && p.paymentAmount !== undefined)
            ? Number(p.paymentAmount)
            : Number(p.salePrice || p.unitaryPrice || 0) * q;
          const value = p.commission.type === 'percentage'
            ? (lineTotal * Number(p.commission.value || 0)) / 100
            : Number(p.commission.value || 0) * q;
          productCommission += value;
          productSalesBase += lineTotal;
        }
      });
      if (productCommission > 0) {
        total += productCommission;
        records.push({
          date: item.registerDate,
          saleCode: Utilities.prefixCode(item.code),
          collaborator: operatorName,
          collaboratorId: operatorId,
          customer: item.customer?.name || '',
          saleValue: productSalesBase,
          partialRevenue: (() => {
            // calculado mais abaixo após termos totalBase
            return 0;
          })(),
          commissionPercentage: productSalesBase ? (productCommission * 100) / productSalesBase : 0,
          commissionValue: productCommission,
          origin: 'Produto',
          paymentDate: item.paymentDate ? (typeof item.paymentDate === 'object' ? item.paymentDate.toDate?.() || '' : item.paymentDate) : '',
          observation: item.observation || ''
        });
      }

      // Serviços -> um registro por executor (ou operador se não houver)
      const services: any[] = (item.services && Array.isArray(item.services))
        ? item.services
        : (item.service && item.service.types ? item.service.types : []);

      const commissionByExecutor: Record<string, { name: string, value: number, base: number }> = {};
      services.forEach((s: any) => {
        if (s.commission && s.commission.enabled) {
          const serviceTotal = Number(s.customPrice || s.executionPrice || 0);
          const value = s.commission.type === 'percentage'
            ? (serviceTotal * Number(s.commission.value || 0)) / 100
            : Number(s.commission.value || 0);
          const execId = s.executor?.code || s.executor?.username || operatorId;
          const execName = s.executor?.name || s.executor?.username || operatorName;
          if (!commissionByExecutor[execId]) {
            commissionByExecutor[execId] = { name: execName, value: 0, base: 0 };
          }
          commissionByExecutor[execId].value += value;
          commissionByExecutor[execId].base += serviceTotal;
        }
      });

      // Agora que temos bases de produtos e serviços, calculamos rateio do recebido
      const totalBase = productSalesBase + Object.values(commissionByExecutor).reduce((sum, it) => sum + (it.base || 0), 0);

      Object.keys(commissionByExecutor).forEach((id) => {
        const cval = commissionByExecutor[id].value;
        const base = commissionByExecutor[id].base;
        total += cval;
        records.push({
          date: item.registerDate,
          saleCode: Utilities.prefixCode(item.code),
          collaborator: commissionByExecutor[id].name,
          collaboratorId: id,
          customer: item.customer?.name || '',
          saleValue: base,
          commissionPercentage: base ? (cval * 100) / base : 0,
          commissionValue: cval,
          origin: 'Serviço',
          paymentDate: item.paymentDate ? (typeof item.paymentDate === 'object' ? item.paymentDate.toDate?.() || '' : item.paymentDate) : '',
          observation: item.observation || ''
        });
      });

      // Ajusta o registro de produtos (operador) com seu rateio calculado
      if (productCommission > 0) {
        const idx = records.findIndex(r => r.saleCode === Utilities.prefixCode(item.code) && r.collaborator === operatorName && r.commissionValue === productCommission);
        if (idx >= 0) {
          // no partial revenue in commission analytical
        }
      }

      // no partial revenue aggregation
    });

    // Total de vendas para rodapé (soma simples dos registros)
    const totalSalesValue = records.reduce((sum, record) => sum + (record.saleValue || 0), 0);

    return {
      records,
      balance: {
        total,
        totalCommissionValue: total,
        totalSalesValue: totalSalesValue
      }
    };
  }
}
