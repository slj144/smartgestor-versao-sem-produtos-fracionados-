import { Injectable } from "@angular/core";

// Services
import { IToolsService } from '@shared/services/iTools.service';
import { PaymentMethodsService } from "@pages/registers/paymentMethods/paymentMethods.service";

// Interfaces
import { ICollection } from '@itools/interfaces/ICollection';

// Types
import { query } from '@shared/types/query';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { DateTime } from "@shared/utilities/dateTime";

@Injectable({ providedIn: 'root' })
export class CashierReportsService {

  private dataResume: any = {};

  constructor(
    private iToolsService: IToolsService,
    private paymentMethodsService: PaymentMethodsService
  ) { }

  public async getResume(settings: query, callback?: ((_: any) => void)): Promise<any> {

    return (new Promise(async (resolve) => {

      this.dataResume = { sales: {}, inflows: {}, outflows: {} };

      await this.getSales(Utilities.deepClone({ ...settings, data: { type: 'salesReportSynthetic' } }), (data) => {

        this.dataResume.sales = data;

        if (callback) {
          callback(this.treatResume(this.dataResume, settings));
        }
      });

      await this.getInflows(Utilities.deepClone({ ...settings, data: { type: 'inflowsReportSynthetic' } }), (data) => {

        this.dataResume.inflows = data;

        if (callback) {
          callback(this.treatResume(this.dataResume, settings));
        }
      });

      await this.getOutflows(Utilities.deepClone({ ...settings, data: { type: 'outflowsReportSynthetic' } }), (data) => {

        this.dataResume.outflows = data;

        if (callback) {
          callback(this.treatResume(this.dataResume, settings));
        }
      });

      // await this.getBillsToPay(Utilities.deepClone({...settings, data: { type: 'billsToPayReportSynthetic' }}), (data)=>{
      //   this.dataResume.billsToPay = data;
      // });

      // await this.getBillsToReceive(Utilities.deepClone({...settings, data: { type: 'billsToReceiveReportSynthetic' }}), (data)=>{
      //   this.dataResume.billsToReceive = data;
      // });


      // console.log(this.dataResume);

      // await this.getBillsToReceive(Utilities.deepClone({...settings, data: { type: 'outflowsReportSynthetic' }}), (data) => {



      //   if (callback) {
      //     callback(this.treatResume(this.dataResume, settings));
      //   }
      // });

      resolve(this.treatResume(this.dataResume, settings));
    }));
  }


  public async getBillsToPay(settings: { where: query['where'], orderBy: query['orderBy'], data: { type: string } }, callback: (data) => void) {

    return (new Promise<any>((resolve) => {

      settings.where.push({
        field: "status",
        operator: "!=",
        value: "CANCELED"
      });

      settings.where.push({
        field: "installments.paymentMethods.code",
        operator: "=",
        value: 1000
      });

      const dateRange = {
        ">=": "",
        "<=": ""
      };

      settings.where.map((item) => {
        if (item.field == "date") {
          item.field = "installments.paymentMethods.history.date";
          dateRange[item.operator] = item.value;
        }
      });

      // this.addStatusClausesForAccountsPayable({ where: settings.where, data: settings.data });

      const collection = this.iToolsService.database().collection('FinancialBillsToPay');
      collection.orderBy(settings.orderBy);
      collection.where(settings.where);

      (<any>settings).dateFilter = dateRange;

      this.batchDataSearch(collection, settings).then((result) => {
        result = this.treatBillsToPay(result, settings);
        callback(result);
        resolve(result);
      });
    }));
  }

  public async getBillsToReceive(settings: { where: query['where'], orderBy: query['orderBy'], data: { type: string } }, callback: (data) => void) {

    return (new Promise<any>((resolve) => {

      settings.where.push({
        field: "status",
        operator: "!=",
        value: "CANCELED"
      });

      settings.where.push({
        field: "installments.paymentMethods.code",
        operator: "=",
        value: 1000
      });

      const dateRange = {
        ">=": "",
        "<=": ""
      };

      settings.where.map((item) => {
        if (item.field == "date") {
          item.field = "installments.paymentMethods.history.date";
          dateRange[item.operator] = item.value;
        }
      });

      const collection = this.iToolsService.database().collection('FinancialBillsToReceive');
      collection.orderBy(settings.orderBy);
      collection.where(settings.where);

      (<any>settings).dateFilter = dateRange;

      this.batchDataSearch(collection, settings).then((result) => {
        result = this.treatBillsToReceive(result, settings);
        callback(result);
        resolve(result);
      });
    }));
  }


  public async getSales(settings: query, callback?: ((_: any) => void)): Promise<any> {

    return (new Promise((resolve) => {

      const filteredProducts = (item) => {
        if (item.field == 'products.code') {
          settings.productReport = settings.productReport || {};
          settings.productReport.products = settings.productReport.products || [];
          settings.productReport.products.push(item.value);
        }
        if (item.field == 'products.category.code') {
          settings.productReport = settings.productReport || {};
          settings.productReport.category = item.value;
        }

        if (item.field == 'products.provider.code') {
          settings.productReport = settings.productReport || {};
          settings.productReport.provider = item.value;
        }
      }

      settings.where.forEach((item) => {
        if (item.field == 'date') {
          item.field = "paymentDate"
        }
        filteredProducts(item);
      });

      settings.where.push({
        field: "status",
        operator: "!=",
        value: "CANCELED"
      });

      (settings.or || []).forEach((item) => {
        if (item.field == 'date') {
          item.field = "paymentDate"
        }
        filteredProducts(item);
      });

      const collection = this.iToolsService.database().collection('CashierSales');
      collection.orderBy(settings.orderBy);
      collection.where(settings.where);

      const handler = (async (response) => {

        const objData: any = {};
        const paymentData = await this.getPaymentMethods();
        const docs: any = (Utilities.isArray(response) ? response : response.docs);

        let test = false;

        for (const doc of docs) {

          const item = (Utilities.isArray(response) ? doc : doc.data());
          this.normalizeCommissionBases(item);
          const date = DateTime.formatDate((<any>settings).groupBy == "paymentDate" ? item.paymentDate : item.registerDate).date;
          const paymentDate = DateTime.formatDate(item.paymentDate).date;

          item.code = Utilities.prefixCode(item.code);

          if (item.service && item.service.code) {
            item.service.code = Utilities.prefixCode(item.service.code);
          }

          if (!objData[date]) {

            objData[date] = {
              date: date,
              paymentDate: paymentDate,
              records: [],
              balance: {
                totalSales: 0,
                quantityBilled: 0, discount: 0,
                fee: 0, additional: 0, servicesCosts: 0,
                productsCosts: 0, paymentsCosts: 0,
                totalCosts: 0, totalTaxes: 0,
                totalUnbilled: 0, partialRevenue: 0,
                finalRevenue: 0,
                commission: 0,
                productCommission: 0,
                serviceCommission: 0
              }
            };
          }

          let totalAmountBilled = item.balance.total;
          let totalCommission = 0;
          let productCommissionTotal = 0;
          let serviceCommissionTotal = 0;

          item.balance.additional = 0;
          item.balance.fee = 0;
          item.balance.servicesCosts = 0;
          item.balance.productsCosts = 0;
          item.balance.paymentsCosts = 0;

          if (item.service) {

            if (item.service.types) {

              for (const type of item.service.types) {

                type.paymentAmount = type.customPrice;

                if (type.paymentAmount < type.executionPrice) {
                  type.discount = (type.executionPrice - type.paymentAmount);
                }

                if (type.paymentAmount > type.executionPrice) {
                  type.additional = (type.paymentAmount - type.executionPrice);
                }

                // O custo do serviço é igual à comissão (customCostPrice ou costPrice)
                // Isso aparecerá como "Custo de Serviços" no relatório
                const serviceCost = type.customCostPrice != undefined ? type.customCostPrice : type.costPrice;
                item.balance.servicesCosts += serviceCost || 0;

                // Service commission (attribute value only; attribution by collaborator happens in FinancialReportsService)
                if (type.commission && type.commission.enabled) {
                  const serviceTotal = Number(type.customPrice || type.executionPrice || 0);
                  const commissionBase = type.__commissionBase != null && type.__commissionBase !== undefined
                    ? Number(type.__commissionBase)
                    : serviceTotal;
                  const commissionValue = type.commission.type === 'percentage'
                    ? (commissionBase * Number(type.commission.value || 0)) / 100
                    : Number(type.commission.value || 0);
                  totalCommission += commissionValue;
                  serviceCommissionTotal += commissionValue;
                }
              }

              objData[date].balance.servicesCosts += parseFloat(item.balance.servicesCosts || 0);
            }
          }

          if (item.products) {

            for (const product of item.products) {

              product.discount = 0;
              product.additional = 0;

              if (product.salePrice > product.unitaryPrice) {
                product.discount = ((product.salePrice - product.unitaryPrice) * product.quantity);
              }

              if (product.salePrice < product.unitaryPrice) {
                product.additional = ((product.unitaryPrice - product.salePrice) * product.quantity);
              }

              product.paymentAmount = (product.unitaryPrice * product.quantity);
              // paymentAmount já representa o valor líquido cobrado ao cliente,
              // pois unitaryPrice é ajustado após descontos. O relatório usa
              // este campo para exibir "Pago", evitando diferenças quando há desconto.

              item.balance.additional += product.additional;
              item.balance.productsCosts += (product.costPrice * product.quantity);

              // Commission calculation (fix double counting)
              if (product.commission && product.commission.enabled) {
                const quantity = product.quantity || 1;
                // paymentAmount (if present) already reflects quantity.
                // Otherwise, build line total from unit price.
                const lineTotal = (product.__commissionBase != null && product.__commissionBase !== undefined)
                  ? Number(product.__commissionBase)
                  : (product.paymentAmount != null && product.paymentAmount !== undefined)
                    ? Number(product.paymentAmount)
                    : Number(product.salePrice || product.unitaryPrice || 0) * quantity;

                const commissionValue = product.commission.type === 'percentage'
                  ? (lineTotal * Number(product.commission.value || 0)) / 100
                  : Number(product.commission.value || 0) * quantity;
                totalCommission += commissionValue;
                productCommissionTotal += commissionValue;
              }
            }
            objData[date].balance.productsCosts += parseFloat(item.balance.productsCosts || 0);
            item.balance.productCommission = productCommissionTotal;
            item.balance.serviceCommission = serviceCommissionTotal;
            item.balance.commission = totalCommission;
            objData[date].balance.commission += totalCommission;
            objData[date].balance.productCommission = (objData[date].balance.productCommission || 0) + productCommissionTotal;
            objData[date].balance.serviceCommission = (objData[date].balance.serviceCommission || 0) + serviceCommissionTotal;
          }

          if (item.paymentMethods) {

            let checkUnbilled = 0;

            for (const method of item.paymentMethods) {

              const value = parseFloat(method.value);
              const fee = parseFloat(method.fee ? method.fee : ((method.fees && method.fees.fee) ? method.fees.fee : 0));
              const cost = ((value * (fee / 100)) || 0);

              method.code = method.code;
              method.saleCode = item.code;
              method.name = method.name;
              method.fee = fee;
              method.cost = cost;
              method.value = value;


              if (method.code > 4000 && method.code < 5000) {
                method.parcel = parseFloat(method.fees ? method.fees.parcel : 1);
              }

              if (paymentData[method.code] && paymentData[method.code].uninvoiced) {
                totalAmountBilled -= value;
                checkUnbilled += 1;
              }

              item.balance.paymentsCosts += (value * (fee / 100));
            }

            if (checkUnbilled == item.paymentMethods.length && item.paymentMethods.length > 0) {
              item.isUnbilled = true;
            }

            objData[date].balance.paymentsCosts += parseFloat(item.balance.paymentsCosts || 0);
          }

          // Individual Balance
          item.balance.discount = (item.balance.subtotal && item.balance.subtotal.discount ? item.balance.subtotal.discount : 0);
          item.balance.fee = ((item.balance.subtotal && item.balance.subtotal.fee ? item.balance.subtotal.fee : 0));
          item.balance.additional = (item.balance.additional ?? 0);


          item.balance.totalCosts = (
            item.balance.servicesCosts +
            item.balance.productsCosts +
            item.balance.paymentsCosts
          );
          item.balance.totalTaxes = (() => {
            let value = 0;
            if (item.nf && item.nf.taxes) {
              value = item.nf.taxes.total + (item.nf.taxes.iss || 0);
            }
            return value;
          })();
          item.balance.unbilledValue = (item.balance.total - totalAmountBilled);
          item.balance.partialRevenue = totalAmountBilled;
          // Apenas as comissões de produtos são abatidas aqui; as de serviço já foram somadas em servicesCosts
          const commissionValue = Number(item.balance.productCommission || 0);
          item.balance.finalRevenue = (
            Number(item.balance.partialRevenue || 0) -
            (
              Number(item.balance.servicesCosts || 0) +
              Number(item.balance.productsCosts || 0) +
              Number(item.balance.paymentsCosts || 0) +
              Number(item.balance.totalTaxes || 0) +
              commissionValue
            )
          );

          item.balance.taxes = item.nf && item.nf.taxes ? item.nf.taxes : { icms: 0, pis: 0, cofins: 0, iss: 0, total: 0 };

          objData[date].balance.totalSales += parseFloat(item.balance.total || 0);
          objData[date].balance.totalUnbilled += parseFloat(item.balance.unbilledValue || 0);
          objData[date].balance.quantityBilled += (item.isUnbilled ? 0 : 1);
          objData[date].balance.discount += parseFloat(item.balance.discount || 0);
          objData[date].balance.fee += parseFloat(item.balance.fee || 0);
          objData[date].balance.additional += parseFloat(item.balance.additional || 0);
          objData[date].balance.totalCosts += parseFloat(item.balance.totalCosts || 0);
          objData[date].balance.totalTaxes += parseFloat(item.balance.totalTaxes || 0);
          objData[date].balance.partialRevenue += parseFloat(String(totalAmountBilled || 0));
          //objData[date].balance.finalRevenue += parseFloat(item.balance.finalRevenue || 0);

          const record: any = {
            date: item.registerDate,
            code: item.code,
            operator: item.operator,
            customer: item.customer,
            service: item.service,
            products: item.products,
            paymentMethods: item.paymentMethods,
            balance: item.balance,
            nf: item.nf,
            paymentDate: item.paymentDate
          };

          objData[date].balance.finalRevenue += parseFloat(item.balance.finalRevenue || 0);
          objData[date].records.push(record);
        }

        const result = this.treatSales(Object.values(objData), settings);

        if (callback) {
          callback(result);
        }

        resolve(result);
      });

      if (!callback) {
        this.batchDataSearch(collection, settings).then(handler);
      } else {
        collection.limit(5000);
        collection.onSnapshot(handler);
      }
    }));
  }

  public async getInflows(settings: query, callback?: ((_: any) => void)): Promise<any> {

    return (new Promise((resolve) => {

      settings.where.forEach((item) => {
        if (item.field == 'date') {
          item.field = "registerDate"
        }
      });

      const collection = this.iToolsService.database().collection('CashierInflows');
      collection.orderBy(settings.orderBy);
      collection.where(settings.where);

      const handler = ((response) => {

        const objData: any = {};
        const docs: any = (Utilities.isArray(response) ? response : response.docs);

        for (const doc of docs) {

          const data = (Utilities.isArray(response) ? doc : doc.data());
          data.code = Utilities.prefixCode(data.code);

          const date = DateTime.formatDate(data.registerDate).date

          if (!objData[date]) {
            objData[date] = { date: date, records: [], total: 0 };
          }

          objData[date].total += data.value;
          objData[date].records.push(data);
        }

        const result = this.treatInflows(Object.values(objData), settings);

        if (callback) {
          callback(result);
        }

        resolve(result);
      });

      if (!callback) {
        this.batchDataSearch(collection, settings).then(handler);
      } else {
        collection.limit(5000);
        collection.onSnapshot(handler);
      }
    }));
  }

  public async getOutflows(settings: query, callback?: ((_: any) => void)): Promise<any> {

    return (new Promise((resolve) => {

      settings.where.forEach((item) => {
        if (item.field == 'date') {
          item.field = "registerDate"
        }
      });

      const collection = this.iToolsService.database().collection('CashierOutflows');
      collection.orderBy(settings.orderBy);
      collection.where(settings.where);

      const handler = ((response) => {

        const objData: any = {};
        const docs: any = (Utilities.isArray(response) ? response : response.docs);

        for (const doc of docs) {

          const data = (Utilities.isArray(response) ? doc : doc.data());
          data.code = Utilities.prefixCode(data.code);

          const date = DateTime.formatDate(data.registerDate).date

          if (!objData[date]) {
            objData[date] = { date: date, records: [], total: 0 };
          }

          objData[date].total += data.value;
          objData[date].records.push(data);
        }

        const result = this.treatOutflows(Object.values(objData), settings);

        if (callback) {
          callback(result);
        }

        resolve(result);
      });

      if (!callback) {
        this.batchDataSearch(collection, settings).then(handler);
      } else {
        collection.limit(5000);
        collection.onSnapshot(handler);
      }
    }));
  }

  public async getAfterSales(settings: query, callback?: ((_: any) => void)): Promise<any> {

    return (new Promise((resolve) => {

      settings.where.forEach((item) => {
        if (item.field == 'date') {
          item.field = "paymentDate"
        }
      });

      const collection = this.iToolsService.database().collection('CashierSales');
      collection.orderBy(settings.orderBy);
      collection.where(settings.where);

      const handler = ((response) => {

        const arrData = [];
        const docs: any = (Utilities.isArray(response) ? response : response.docs);

        for (const doc of docs) {

          const data = (Utilities.isArray(response) ? doc : doc.data());
          data.code = Utilities.prefixCode(data.code);

          for (const method of (data.paymentMethods || [])) {

            const value = parseFloat(method.value);
            const fee = parseFloat(method.fee ? method.fee : ((method.fees && method.fees.fee) ? method.fees.fee : 0));
            const cost = ((value * (fee / 100)) || 0);

            method.code = method.code;
            method.saleCode = data.code;
            method.name = method.name;
            method.fee = fee;
            method.cost = cost;
            method.value = value;

            if (method.code > 4000 && method.code < 5000) {
              method.parcel = parseFloat(method.fees ? method.fees.parcel : 1);
            }
          }

          const obj: any = {
            date: data.registerDate,
            code: data.code,
            customer: data.customer,
            service: {},
            paymentMethods: data.paymentMethods,
            operator: data.operator,
            products: data.products,
            value: data.balance.total
          };

          if (data.service) {
            data.service.code = Utilities.prefixCode(data.service.code);
            obj.service = data.service;
          }

          arrData.push(obj);
        }


        arrData.sort((a, b) => {
          return ((a.date > b.date) ? 1 : ((a.date < b.date) ? -1 : 0));
        });

        if (callback) {
          callback(arrData);
        }

        resolve(arrData);
      });

      if (!callback) {
        this.batchDataSearch(collection, settings).then(handler);
      } else {
        collection.limit(5000);
        collection.onSnapshot(handler);
      }
    }));
  }

  public async getHistoric(settings: query, callback?: ((_: any) => void)): Promise<any> {

    return (new Promise((resolve) => {

      settings.where.forEach((item) => {
        if (item.field == 'date') {
          item.field = "modifiedDate"
        }
      });

      const collection = this.iToolsService.database().collection('CashierControls');
      collection.orderBy(settings.orderBy);
      collection.where(settings.where);

      const handler = ((response) => {

        const arrData = [];
        const docs: any = (Utilities.isArray(response) ? response : response.docs);

        for (const doc of docs) {

          const data = (Utilities.isArray(response) ? doc : doc.data());
          data.code = Utilities.prefixCode(data.code);

          if (data.opening) {

            arrData.push({
              code: data.code,
              type: 'OPENING',
              operator: data.operator,
              value: data.opening.value,
              date: data.opening.date
            });
          }

          if (data.closing) {

            arrData.push({
              code: data.code,
              type: 'CLOSING',
              operator: data.operator,
              value: data.closing.value,
              date: data.closing.date
            });
          }
        }

        const result = this.treatHistoric(arrData, settings);

        if (callback) {
          callback(result);
        }

        resolve(result);
      });

      if (!callback) {
        this.batchDataSearch(collection, settings).then(handler);
      } else {
        collection.limit(3000);
        collection.onSnapshot(handler);
      }
    }));
  }

  // Auxiliaries Methods

  private async batchDataSearch(collection: ICollection, settings: query) {

    return (new Promise<any>((resolve, reject) => {

      settings.where = (settings.where.length > 0 ? settings.where : []);
      settings.start = (settings.start >= 0 ? settings.start : 0);
      settings.limit = (settings.limit > 0 ? settings.limit : 500);

      collection.count().get().then((res) => {

        const count = (res.docs.length > 0 ? res.docs[0].data().count : 0);
        const requestsCount = Math.ceil(count / settings.limit);

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
            resolve(data);
          }

          if (error) {
            clearInterval(timer);
            reject(error);
          }
        }, 200);
      });
    }));
  }

  // Utilitary Methods

  private async getPaymentMethods() {

    return (new Promise<any>((resolve) => {

      this.paymentMethodsService.getPaymentMethods('CashierReportsService/getPaymentMethods', (data) => {
        this.paymentMethodsService.removeListeners('records', 'CashierReportsService/getPaymentMethods');

        const obj = {};

        $$(data).map((_, item) => {
          if (item.providers) {
            $$(item.providers).map((_, provider) => {
              obj[provider.code] = provider;
            });
          } else {
            obj[item.code] = item;
          }
        });

        resolve(obj);
      });
    }));
  }

  // Auxiliries Methods

  private treatResume(data: any, settings: any) {

    const result: any = {};

    const objBase: any = {
      date: '',
      records: {
        sales: [],
        inflows: [],
        outflows: [],
      },
      balance: {
        sales: 0,
        inflows: 0,
        outflows: 0,
        servicesCosts: 0,
        productsCosts: 0,
        paymentsCosts: 0,
        totalCosts: 0,
        partialRevenue: 0,
        finalRevenue: 0,
        commission: 0
      }
    };

    if (data.sales) {

      $$(Utilities.objectSorter(data.sales.records, { orderBy: 'code' })).map((_, item) => {

        if (!result[item.date]) {
          result[item.date] = Utilities.deepClone(objBase);
          result[item.date].date = item.date;
          result[item.date].paymentDate = item.paymentDate;
        }

        result[item.date].records.sales = item.items;

        result[item.date].balance.sales += (item.balance.totalSales - item.balance.totalUnbilled);
        result[item.date].balance.servicesCosts += item.balance.servicesCosts;
        result[item.date].balance.productsCosts += item.balance.productsCosts;
        result[item.date].balance.paymentsCosts += item.balance.paymentsCosts;
        result[item.date].balance.totalCosts += item.balance.totalCosts;
        result[item.date].balance.partialRevenue += item.balance.partialRevenue;
        result[item.date].balance.finalRevenue += item.balance.finalRevenue;
        result[item.date].balance.commission += item.balance.commission || 0;
      });
    }

    if (data.inflows) {

      $$(Utilities.objectSorter(data.inflows.records, { orderBy: 'code' })).map((_, item) => {

        if (!result[item.date]) {
          result[item.date] = Utilities.deepClone(objBase);
          result[item.date].date = item.date;
        }

        result[item.date].records.inflows = item.items;

        result[item.date].balance.inflows += item.balance.total;
        result[item.date].balance.partialRevenue += item.balance.total;
        result[item.date].balance.finalRevenue += item.balance.total;
      });
    }

    if (data.outflows) {

      $$(Utilities.objectSorter(data.outflows.records, { orderBy: 'code' })).map((_, item) => {

        if (!result[item.date]) {
          result[item.date] = Utilities.deepClone(objBase);
          result[item.date].date = item.date;
        }

        result[item.date].records.outflows = item.items;

        result[item.date].balance.outflows += item.balance.total;
        result[item.date].balance.partialRevenue -= item.balance.total;
        result[item.date].balance.finalRevenue -= item.balance.total;
      });
    }


    if (data.billsToPay) {

      $$(Utilities.objectSorter(data.billsToPay.records, { orderBy: 'code' })).map((_, item) => {

        if (!result[item.date]) {
          result[item.date] = Utilities.deepClone(objBase);
          result[item.date].date = item.date;
        }

        result[item.date].records.billsToPay = item.items;
        result[item.date].balance.billsToPay = result[item.date].balance.billsToPay ?? 0;

        result[item.date].balance.billsToPay += item.balance.total;
        result[item.date].balance.partialRevenue -= item.balance.total;
        result[item.date].balance.finalRevenue -= item.balance.total;
      });
    }


    if (data.billsToReceive) {

      $$(Utilities.objectSorter(data.billsToReceive.records, { orderBy: 'code' })).map((_, item) => {

        if (!result[item.date]) {
          result[item.date] = Utilities.deepClone(objBase);
          result[item.date].date = item.date;
        }

        result[item.date].records.billsToReceive = item.items;
        result[item.date].balance.billsToReceive = result[item.date].balance.billsToReceive ?? 0;

        result[item.date].balance.billsToReceive += item.balance.total;
        result[item.date].balance.partialRevenue += item.balance.total;
        result[item.date].balance.finalRevenue += item.balance.total;
      });
    }


    const arrData: any = Object.values(result);

    if (settings && settings.data && settings.data.type == 'resumeReportSynthetic') {

      let obj = {
        synthetic: {
          records: [],
          balance: {
            sales: 0, inflows: 0, outflows: 0,
            billsToPay: 0, billsToReceive: 0,
            servicesCosts: 0, productsCosts: 0,
            paymentsCosts: 0, totalCosts: 0,
            partialRevenue: 0, finalRevenue: 0,
            commission: 0
          }
        },
      };

      $$(arrData).map((_, item) => {

        obj.synthetic.balance.sales += item.balance.sales;
        obj.synthetic.balance.inflows += item.balance.inflows;
        obj.synthetic.balance.outflows += item.balance.outflows;
        obj.synthetic.balance.billsToPay += item.balance.billsToPay;
        obj.synthetic.balance.billsToReceive += item.balance.billsToReceive;

        obj.synthetic.balance.servicesCosts += item.balance.servicesCosts;
        obj.synthetic.balance.productsCosts += item.balance.productsCosts;
        obj.synthetic.balance.paymentsCosts += item.balance.paymentsCosts;
        obj.synthetic.balance.totalCosts += item.balance.totalCosts;
        obj.synthetic.balance.partialRevenue += item.balance.partialRevenue;
        obj.synthetic.balance.finalRevenue += item.balance.finalRevenue;
        obj.synthetic.balance.commission += item.balance.commission || 0;

        obj.synthetic.records.push(item);
      });

      if (settings.data.type == 'resumeReportSynthetic') {

        obj.synthetic.records.sort((a, b) => {
          return ((a.date < b.date) ? -1 : ((a.date > b.date) ? 1 : 0));
        });

        return obj.synthetic;
      }
    } else {

      arrData.sort((a, b) => {
        return ((a.date < b.date) ? -1 : ((a.date > b.date) ? 1 : 0));
      });

      return arrData;
    }
  }

  private treatSales(data: any[], settings: any) {

    const records = (() => {

      const arrData = [];

      $$(data).map((_, item) => {
        $$(item.records).map((_, item) => {
          arrData.push(item);
        });
      });

      return arrData;
    })();

    if (settings.data && settings.data.type) {

      if (settings.data.type == 'salesReportSynthetic' || settings.data.type == 'salesReportAnalytical') {

        let obj = {
          synthetic: {
            records: [],
            balance: {
              number: 0, billed: 0,
              totalSales: 0, servicesCosts: 0,
              paymentsCosts: 0, productsCosts: 0,
              totalCosts: 0, totalUnbilled: 0,
              partialRevenue: 0, finalRevenue: 0,
              totalTaxes: 0, totalAdditional: 0,
              commission: 0
            }
          },
          analytical: {
            records: [],
            balance: {
              discount: 0, fee: 0,
              saleValue: 0, unbilledValue: 0,
              servicesCosts: 0, productsCosts: 0,
              paymentsCosts: 0, totalCosts: 0,
              partialRevenue: 0, finalRevenue: 0,
              totalAdditional: 0,
              commission: 0,
              taxes: {
                icms: 0,
                pis: 0,
                cofins: 0,
                iss: 0
              }
            }
          }
        };

        $$(data).map((_, item) => {

          if (settings.data.type == 'salesReportSynthetic') {

            const auxData = {
              date: item.date,
              paymentDate: item.paymentDate,
              items: item.records,
              balance: {
                number: (item.records).length,
                billed: item.balance.quantityBilled,
                totalSales: item.balance.totalSales,
                servicesCosts: item.balance.servicesCosts,
                productsCosts: item.balance.productsCosts,
                paymentsCosts: item.balance.paymentsCosts,
                totalCosts: item.balance.totalCosts,
                totalUnbilled: item.balance.totalUnbilled,
                partialRevenue: item.balance.partialRevenue,
                finalRevenue: item.balance.finalRevenue,
                totalTaxes: item.balance.totalTaxes || 0,
                totalAdditional: item.balance.additional || 0,
                commission: item.balance.commission || 0
              }
            };

            obj.synthetic.balance.number += auxData.balance.number;
            obj.synthetic.balance.billed += auxData.balance.billed;
            obj.synthetic.balance.totalSales += auxData.balance.totalSales;
            obj.synthetic.balance.servicesCosts += auxData.balance.servicesCosts;
            obj.synthetic.balance.paymentsCosts += auxData.balance.paymentsCosts;
            obj.synthetic.balance.productsCosts += auxData.balance.productsCosts;
            obj.synthetic.balance.totalCosts += auxData.balance.totalCosts;
            obj.synthetic.balance.totalUnbilled += auxData.balance.totalUnbilled;
            obj.synthetic.balance.partialRevenue += auxData.balance.partialRevenue;
            obj.synthetic.balance.finalRevenue += auxData.balance.finalRevenue;
            obj.synthetic.balance.totalTaxes += auxData.balance.totalTaxes || 0;
            obj.synthetic.balance.totalAdditional += auxData.balance.totalAdditional || 0;  // Note o +=
            obj.synthetic.balance.commission += auxData.balance.commission || 0;

            obj.synthetic.records.push(auxData);
          }

          if (settings.data.type == 'salesReportAnalytical') {

            $$(item.records).map((_, item) => {

              obj.analytical.balance.discount += item.balance.discount;
              obj.analytical.balance.fee += item.balance.fee;
              obj.analytical.balance.saleValue += item.balance.total;
              obj.analytical.balance.unbilledValue += item.balance.unbilledValue;
              obj.analytical.balance.servicesCosts += item.balance.servicesCosts;
              obj.analytical.balance.productsCosts += item.balance.productsCosts;
              obj.analytical.balance.paymentsCosts += item.balance.paymentsCosts;
              obj.analytical.balance.totalCosts += item.balance.totalCosts;
              obj.analytical.balance.partialRevenue += item.balance.partialRevenue;
              obj.analytical.balance.finalRevenue += item.balance.finalRevenue;
              obj.analytical.balance.commission += item.balance.commission || 0;

              if (item.balance.taxes) {
                obj.analytical.balance.taxes.icms += item.balance.taxes.icms || 0;
                obj.analytical.balance.taxes.pis += item.balance.taxes.pis || 0;
                obj.analytical.balance.taxes.cofins += item.balance.taxes.cofins || 0;
                obj.analytical.balance.taxes.iss += item.balance.taxes.iss || 0;
              }

              obj.analytical.records.push(item);
            });
          }
        });

        if (settings.data.type == 'salesReportSynthetic') {

          obj.synthetic.records.sort((a, b) => {
            return ((a.date < b.date) ? -1 : ((a.date > b.date) ? 1 : 0));
          });

          return obj.synthetic;
        }

        if (settings.data.type == 'salesReportAnalytical') {

          obj.analytical.records.sort((a, b) => {
            return ((a.date < b.date) ? -1 : ((a.date > b.date) ? 1 : 0));
          });

          return obj.analytical;
        }
      }

      if (settings.data.type == 'paymentMethodsSynthetic' || settings.data.type == 'paymentMethodsAnalytical') {

        let auxData = {};

        let obj = {
          synthetic: {
            records: [],
            balance: { value: 0, cost: 0, revenue: 0 }
          },
          analytical: {
            records: [],
            balance: { value: 0, cost: 0, revenue: 0 }
          }
        };

        $$(records).map((_, item) => {

          $$(item.paymentMethods).map((_, data: any) => {

            data.date = item.date;
            data.revenue = (data.value - data.cost);

            obj.analytical.balance.cost += data.cost;
            obj.analytical.balance.value += data.value;
            obj.analytical.balance.revenue += data.revenue;
            obj.analytical.records.push(data);

            if (!auxData[data.code]) {
              auxData[data.code] = [];
            }

            auxData[data.code].push(data);
          });
        });

        $$(auxData).map((_, data) => {

          const auxMethod: any = { value: 0, cost: 0, revenue: 0 };

          $$(data).map((_, item) => {
            auxMethod.code = item.code;
            auxMethod.name = item.name;
            auxMethod.value += item.value;
            auxMethod.cost += item.cost;
          });

          auxMethod.revenue = (auxMethod.value - auxMethod.cost);

          obj.synthetic.balance.value += auxMethod.value;
          obj.synthetic.balance.cost += auxMethod.cost;
          obj.synthetic.balance.revenue += auxMethod.revenue;
          obj.synthetic.records.push(auxMethod);
        });

        if (settings.data.type == 'paymentMethodsSynthetic') {

          obj.synthetic.records.sort((a, b) => {
            return ((a.date < b.date) ? -1 : ((a.date > b.date) ? 1 : 0));
          });

          return obj.synthetic;
        }

        if (settings.data.type == 'paymentMethodsAnalytical') {

          obj.analytical.records.sort((a, b) => {
            return ((a.date < b.date) ? -1 : ((a.date > b.date) ? 1 : 0));
          });

          return obj.analytical;
        }
      }

      if (settings.data.type == 'salesPerUserSynthetic' || settings.data.type == 'salesPerUserAnalytical') {

        let auxData = {};

        let obj = {
          synthetic: {
            records: [],
            balance: { contributionMargin: 0, number: 0, productsQuantity: 0, partialRevenue: 0, finalRevenue: 0, totalDiscount: 0, totalTax: 0, totalPaid: 0, salePrice: 0, totalSalePrice: 0, unitaryCosts: 0, totalCosts: 0 },
            products: []
          },
          analytical: {
            records: [],
            balance: { contributionMargin: 0, productsQuantity: 0, partialRevenue: 0, finalRevenue: 0, totalDiscount: 0, totalTax: 0, totalPaid: 0, salePrice: 0, totalSalePrice: 0, unitaryCosts: 0, totalCosts: 0 }
          }
        };

        $$(records).map((_, item) => {

          const uninvoiced = this.hasUninvoicedPaymentMethods(item);

          if (!uninvoiced.status || (uninvoiced.status && uninvoiced.value > 0)) {

            // console.log(settings);

            const productCategory = settings.productReport?.category;
            const productProvider = settings.productReport?.provider;
            const filterProducts = !!(productCategory || settings.productReport?.products?.length > 0 || productProvider);
            let allProductsValue = 0;
            let filteredProductsValue = 0;
            let filteredProductsCosts = 0;
            let filteredProductsUnitaryCosts = 0;

            let salePrice = 0;
            let totalSalePrice = 0;

            let totalDiscount = 0;
            let totalTax = 0;
            let totalPaid = 0;

            const data = item.operator;
            data.date = item.date;
            data.saleCode = item.code;
            // data.finalRevenue = uninvoiced.value;
            data.paymentMethods = item.paymentMethods;
            data.totalProductsQuantity = 0;
            data.partialRevenue = item.balance?.partialRevenue || 0;
            const commissionValue = Number(item.balance?.productCommission || 0);
            const totalCostsWithTaxes = (item.balance?.totalCosts || 0) + (item.balance?.totalTaxes || 0);
            data.totalCosts = totalCostsWithTaxes;
            data.finalRevenue = data.partialRevenue - totalCostsWithTaxes - commissionValue;
            data.unbilledValue = item.balance?.unbilledValue || 0;
            // console.log(settings.productReport, filterProducts)

            if (filterProducts) {
              data.products = (() => {
                return item.products.filter((prod) => {

                  const hasProductCode = settings.productReport.products?.length > 0;

                  let status = false;

                  if (hasProductCode || productCategory || productProvider) {

                    (settings.productReport?.products || [null]).forEach((filterProductCode) => {

                      const productCode = filterProductCode;

                      let category = !!productCategory;
                      let product = !!hasProductCode;
                      let provider = !!productProvider;
                      let cond = false;

                      if (category && product && provider) {
                        cond = parseInt(prod.code) == parseInt(productCode) && prod.category?.code == productCategory && prod.provider?.code == productProvider;
                      } else if (category && product) {
                        cond = parseInt(prod.code) == parseInt(productCode) && prod.category?.code == productCategory;
                      } else if (category && provider) {
                        cond = prod.category?.code == productCategory && prod.provider?.code == productProvider;
                      } else if (category) {
                        cond = prod.category?.code == productCategory;
                      } else if (product && provider) {
                        cond = parseInt(prod.code) == parseInt(productCode) && prod.provider?.code == productProvider;
                      } else if (product) {
                        cond = parseInt(prod.code) == parseInt(productCode);
                      } else if (provider) {
                        cond = prod.provider?.code == productProvider;
                      }

                      // console.log(cond, ' ===> category: ', category, ' -- provider: ', provider, ' --- product: ', product)

                      if (cond) {
                        filteredProductsValue += prod.unitaryPrice * prod.quantity;
                        filteredProductsCosts += (prod.costPrice * prod.quantity);
                        filteredProductsUnitaryCosts += prod.costPrice;
                        totalDiscount += prod.discount;
                        totalTax += prod.additional;
                        totalPaid += prod.paymentAmount;
                        salePrice += prod.salePrice;
                        totalSalePrice += prod.salePrice * prod.quantity;
                        status = true;
                        data.totalProductsQuantity += prod.quantity;
                      }
                    });

                    allProductsValue += prod.unitaryPrice * prod.quantity;

                    return status;
                  } else {
                    return false;
                  }
                });
              })();
            }

            if (filterProducts) {
              const proportion = item.balance?.partialRevenue ? filteredProductsValue / item.balance.partialRevenue : 0;
              const additionalCosts = (((item.balance?.totalCosts || 0) - (item.balance?.productsCosts || 0)) + (item.balance?.totalTaxes || 0)) * proportion;
              data.partialRevenue = filteredProductsValue;
              // data.totalCosts = filteredProductsCosts;
              // data.finalRevenue = filteredProductsValue - filteredProductsCosts;
              // data.unbilledValue = item.balance.unbilledValue || 0;
              data.totalCosts = filteredProductsCosts + additionalCosts;
              const commissionShare = Number(item.balance?.productCommission || 0) * proportion;
              data.finalRevenue = data.partialRevenue - data.totalCosts - commissionShare;
              data.unbilledValue = (item.balance?.unbilledValue || 0) * proportion;
              data.contributionMargin = data.finalRevenue > 0 ? parseFloat(((data.finalRevenue / data.partialRevenue) * 100).toFixed(4)) : 0;

              // console.log(data);
            } else {
              totalDiscount = item.balance?.discount || 0;
              totalTax = item.balance?.totalTaxes || 0;
              totalPaid = item.balance?.totalPaid || 0;
              salePrice = item.balance?.salePrice || 0;
              totalSalePrice = item.balance?.totalSalePrice || 0;
              filteredProductsUnitaryCosts = item.balance?.unitaryCosts || 0;
              data.totalProductsQuantity = (item.products || []).reduce((sum, prod) => sum + (prod.quantity || 0), 0);
              data.contributionMargin = data.finalRevenue > 0 ? parseFloat(((data.finalRevenue / data.partialRevenue) * 100).toFixed(4)) : 0;
            }

            const setupBalance = () => {
              obj.analytical.balance.totalDiscount += totalDiscount;
              obj.analytical.balance.totalTax += totalTax;
              obj.analytical.balance.totalPaid += totalPaid;
              obj.analytical.balance.salePrice += salePrice;
              obj.analytical.balance.totalSalePrice += totalSalePrice;
              obj.analytical.balance.unitaryCosts += filteredProductsUnitaryCosts;
              obj.analytical.balance.totalCosts += data.totalCosts;

              obj.analytical.balance.productsQuantity += data.totalProductsQuantity;
              obj.analytical.balance.partialRevenue += data.partialRevenue;
              obj.analytical.balance.finalRevenue += data.finalRevenue;


              obj.analytical.records.push(data);
            };

            if (!auxData[data.code]) {
              auxData[data.code] = [];
            }

            if (filterProducts) {
              if (data.products.length > 0) {
                setupBalance();
                auxData[data.code].push(data);
              }
            } else {
              setupBalance();
              auxData[data.code].push(data);
            }

          }
        });

        obj.analytical.balance.contributionMargin = obj.analytical.balance.finalRevenue > 0 ? parseFloat((obj.analytical.balance.finalRevenue / obj.analytical.balance.partialRevenue * 100).toFixed(4)) : 0;

        $$(auxData).map((user, data) => {

          const auxMethod: any = { unbilledValue: 0, contributionMargin: 0, totalProductsQuantity: 0, number: 0, finalRevenue: 0, partialRevenue: 0, totalDiscount: 0, totalTax: 0, totalPaid: 0, salePrice: 0, totalSalePrice: 0, unitaryCosts: 0, totalCosts: 0 };

          const products = {};

          $$(data).map((_, item) => {
            auxMethod.code = item.code;
            auxMethod.name = item.name;
            auxMethod.number += 1;
            auxMethod.partialRevenue += item.partialRevenue;
            auxMethod.finalRevenue += item.finalRevenue;
            auxMethod.totalDiscount += item.totalDiscount || 0;
            auxMethod.totalTax += item.totalTax || 0;
            auxMethod.totalCosts += item.totalCosts;
            auxMethod.totalProductsQuantity += item.totalProductsQuantity || 0;
            auxMethod.unbilledValue += item.unbilledValue || 0;

            (item.products || []).forEach((prod) => {
              if (products[prod.code]) {

                const product = products[prod.code];

                if (settings.data.type == 'salesPerUserSynthetic') {
                  products[prod.code].discount += prod.discount;
                  products[prod.code].paymentAmount += prod.paymentAmount;
                  products[prod.code].additional += prod.additional;
                  products[prod.code].salePrice = ((product.salePrice * product.quantity) + prod.salePrice) / (product.quantity + prod.quantity);
                  products[prod.code].unitaryPrice = ((product.unitaryPrice * products[prod.code].quantity) + prod.unitaryPrice) / (product.quantity + prod.quantity);
                  products[prod.code].quantity += prod.quantity;
                }
              } else {
                products[prod.code] = prod;
              }
            });

          });

          auxMethod.contributionMargin = auxMethod.finalRevenue > 0 ? parseFloat((auxMethod.finalRevenue / auxMethod.partialRevenue * 100).toFixed(4)) : 0;
          auxMethod.products = Object.values(products);
          obj.synthetic.balance.number += auxMethod.number;
          obj.synthetic.balance.partialRevenue += auxMethod.partialRevenue;
          obj.synthetic.balance.finalRevenue += auxMethod.finalRevenue;
          obj.synthetic.balance.totalCosts += auxMethod.totalCosts;
          obj.synthetic.balance.productsQuantity += auxMethod.totalProductsQuantity;
          obj.synthetic.records.push(auxMethod);
        });

        obj.synthetic.balance.contributionMargin = obj.synthetic.balance.finalRevenue > 0 ? parseFloat((obj.synthetic.balance.finalRevenue / obj.synthetic.balance.partialRevenue * 100).toFixed(4)) : 0;

        // console.log(Utilities.deepClone(obj));
        // console.log(obj.synthetic.records);

        if (settings.data.type == 'salesPerUserSynthetic') {

          obj.synthetic.records.sort((a, b) => {
            return ((a.value < b.value) ? 1 : ((a.value > b.value) ? -1 : 0));
          });

          return obj.synthetic;
        }

        if (settings.data.type == 'salesPerUserAnalytical') {

          obj.analytical.records.sort((a, b) => {
            return ((a.date < b.date) ? -1 : ((a.date > b.date) ? 1 : 0));
          });

          return obj.analytical;
        }
      }
    }
  }

  private treatInflows(data: any[], settings: any) {

    let obj = {
      synthetic: {
        records: [],
        balance: { number: 0, total: 0 }
      },
      analytical: {
        records: [],
        balance: { total: 0 }
      }
    };

    if (settings.data && settings.data.type) { //#REMOVE IN ANGULAR 13

      $$(data).map((_, item) => {

        if (settings.data.type == 'inflowsReportSynthetic') {

          const auxData = {
            date: item.date,
            items: item.records,
            balance: {
              number: (item.records).length,
              total: item.total
            }
          };

          obj.synthetic.balance.number += auxData.balance.number;
          obj.synthetic.balance.total += auxData.balance.total;

          obj.synthetic.records.push(auxData);
        }

        if (settings.data.type == 'inflowsReportAnalytical') {

          $$(item.records).map((_, item) => {
            obj.analytical.balance.total += item.value;
            obj.analytical.records.push(item);
          });
        }
      });

      if (settings.data.type == 'inflowsReportSynthetic') {

        obj.synthetic.records.sort((a, b) => {
          return ((a.date < b.date) ? -1 : ((a.date > b.date) ? 1 : 0));
        });

        return obj.synthetic;
      }

      if (settings.data.type == 'inflowsReportAnalytical') {

        obj.analytical.records.sort((a, b) => {
          return ((a.registerDate < b.registerDate) ? -1 : ((a.registerDate > b.registerDate) ? 1 : 0));
        });

        return obj.analytical;
      }
    } else {
      return obj;
    }
  }

  private treatOutflows(data: any[], settings: any) {

    let obj = {
      synthetic: {
        records: [],
        balance: { number: 0, total: 0 }
      },
      analytical: {
        records: [],
        balance: { total: 0 }
      }
    };

    if (settings.data && settings.data.type) { //#REMOVE IN ANGULAR 13

      $$(data).map((_, item) => {

        if (settings.data.type == 'outflowsReportSynthetic') {

          const auxData = {
            date: item.date,
            items: item.records,
            balance: {
              number: (item.records).length,
              total: item.total
            }
          };

          obj.synthetic.balance.number += auxData.balance.number;
          obj.synthetic.balance.total += auxData.balance.total;

          obj.synthetic.records.push(auxData);
        }

        if (settings.data.type == 'outflowsReportAnalytical') {

          $$(item.records).map((_, item) => {
            obj.analytical.balance.total += item.value;
            obj.analytical.records.push(item);
          });
        }
      });

      if (settings.data.type == 'outflowsReportSynthetic') {

        obj.synthetic.records.sort((a, b) => {
          return ((a.date < b.date) ? -1 : ((a.date > b.date) ? 1 : 0));
        });

        return obj.synthetic;
      }

      if (settings.data.type == 'outflowsReportAnalytical') {

        obj.analytical.records.sort((a, b) => {
          return ((a.registerDate < b.registerDate) ? -1 : ((a.registerDate > b.registerDate) ? 1 : 0));
        });

        return obj.analytical;
      }
    } else {
      return obj;
    }
  }

  private treatHistoric(data: any[], settings: any) {

    $$(data).map((k, item) => {
      if (!(item.date >= settings.data.period.start && item.date <= settings.data.period.end)) {
        data.splice(k, 1);
      }
    });

    data.sort((a, b) => {
      return ((a.date < b.date) ? 1 : ((a.date > b.date) ? -1 : 0));
    });

    return { records: data };
  }

  private treatBillsToPay(data: any[], settings: any) {

    let obj = {
      synthetic: {
        records: [],
        balance: { number: 0, total: 0 }
      },
      analytical: {
        records: [],
        balance: { total: 0 }
      }
    };

    if (settings?.data?.type) { //#REMOVE IN ANGULAR 13

      const auxDataObj = {};

      $$(data).map((_, item) => {

        const date = item.registerDate.split(" ")[0];

        auxDataObj[date] = auxDataObj[date] ?? { date: date, items: [], balance: { number: 0, total: 0 } };
        auxDataObj[date].items.push(item)
        auxDataObj[date].balance.number += 1;

        const auxData = auxDataObj[date];

        let total = 0;

        if (settings?.data?.type == 'billsToPayReportSynthetic') {
          item?.installments?.forEach((installment) => {
            installment?.paymentMethods?.forEach((method) => {
              if (method.code == 1000) {
                method.history.forEach((history) => {
                  if (history.date >= (<any>settings).dateFilter[">="] && history.date <= (<any>settings).dateFilter["<="]) {
                    auxData.balance.total += history.value;
                    total += history.value;
                  }
                });
              }
            });
          });

          obj.synthetic.balance.total += total;
          obj.synthetic.balance.number += 1;
        }

        obj.synthetic.records = Object.values(auxDataObj);

        // if (settings?.data?.type == 'billsToPayReportAnalytical') {

        //   $$(item.records).map((_, item) => {
        //     obj.analytical.balance.total += item.value;
        //     obj.analytical.records.push(item);
        //   });
        // }

      });


      // console.log(auxDataObj);


      if (settings?.data?.type == 'billsToPayReportSynthetic') {

        obj.synthetic.records.sort((a, b) => {
          return ((a.date < b.date) ? -1 : ((a.date > b.date) ? 1 : 0));
        });

        return obj.synthetic;
      }

      // if (settings?.data?.type == 'billsToPayReportAnalytical') {

      //   obj.analytical.records.sort((a, b) => {
      //     return ((a.registerDate < b.registerDate) ? -1 : ((a.registerDate > b.registerDate) ? 1 : 0));
      //   });

      //   return obj.analytical;
      // }

      // console.log(obj.synthetic);
    } else {
      return obj;
    }
  }

  private treatBillsToReceive(data: any[], settings: any) {

    let obj = {
      synthetic: {
        records: [],
        balance: { number: 0, total: 0 }
      },
      analytical: {
        records: [],
        balance: { total: 0 }
      }
    };

    if (settings?.data?.type) { //#REMOVE IN ANGULAR 13

      const auxDataObj = {};

      $$(data).map((_, item) => {

        const date = item.registerDate.split(" ")[0];

        auxDataObj[date] = auxDataObj[date] ?? { date: date, items: [], balance: { number: 0, total: 0 } };
        auxDataObj[date].items.push(item)
        auxDataObj[date].balance.number += 1;

        const auxData = auxDataObj[date];
        let total = 0;

        if (settings?.data?.type == 'billsToReceiveReportSynthetic') {
          item?.installments?.forEach((installment) => {
            installment?.paymentMethods?.forEach((method) => {
              if (method.code == 1000) {
                method.history.forEach((history) => {
                  if (history.date >= (<any>settings).dateFilter[">="] && history.date <= (<any>settings).dateFilter["<="]) {
                    auxData.balance.total += history.value;
                    total += history.value;
                  }
                });
              }
            });
          });

          obj.synthetic.balance.total += total;
          obj.synthetic.balance.number += 1;
        }

        obj.synthetic.records = Object.values(auxDataObj);

        // if (settings?.data?.type == 'billsToReceiveReportAnalytical') {

        //   $$(item.records).map((_, item) => {
        //     obj.analytical.balance.total += item.value;
        //     obj.analytical.records.push(item);
        //   });
        // }
      });


      if (settings?.data?.type == 'billsToReceiveReportSynthetic') {

        obj.synthetic.records.sort((a, b) => {
          return ((a.date < b.date) ? -1 : ((a.date > b.date) ? 1 : 0));
        });

        return obj.synthetic;
      }

      // if (settings?.data?.type == 'billsToReceiveReportAnalytical') {

      //   obj.analytical.records.sort((a, b) => {
      //     return ((a.registerDate < b.registerDate) ? -1 : ((a.registerDate > b.registerDate) ? 1 : 0));
      //   });

      //   return obj.analytical;
      // }

      // console.log(obj.synthetic);
    } else {
      return obj;
    }
  }

  private normalizeCommissionBases(item: any): void {
    try {
      if (!item || !item.balance) {
        return;
      }

      const products: any[] = Array.isArray(item.products) ? item.products : [];
      const services: any[] = (item.services && Array.isArray(item.services))
        ? item.services
        : (item.service && Array.isArray(item.service.types) ? item.service.types : []);

      const safeNumber = (value: any): number => {
        const num = Number(value);
        return Number.isFinite(num) ? num : 0;
      };

      const totalDiscount = safeNumber(item.balance?.subtotal?.discount ?? item.balance?.discount ?? 0);

      const productGross = products.reduce((sum, prod) => {
        const quantity = safeNumber(prod?.quantity || prod?.selectedItems || 1);
        const salePrice = safeNumber(prod?.salePrice ?? 0);
        const unitaryPrice = safeNumber(prod?.unitaryPrice ?? 0);
        const effectiveBasePrice = (() => {
          if (salePrice > 0 && unitaryPrice > 0) {
            return Math.max(salePrice, unitaryPrice);
          }
          return unitaryPrice > 0 ? unitaryPrice : salePrice;
        })();
        return sum + Math.max(0, effectiveBasePrice * quantity);
      }, 0);

      const serviceGross = services.reduce((sum, svc) => {
        const basePrice = safeNumber(svc?.executionPrice ?? svc?.customPrice ?? 0);
        return sum + Math.max(0, basePrice);
      }, 0);

      const productDirectDiscount = products.reduce((sum, prod) => sum + Math.max(0, safeNumber(prod?.discount)), 0);
      const serviceDirectDiscount = services.reduce((sum, svc) => sum + Math.max(0, safeNumber(svc?.discount)), 0);

      const directDiscountTotal = productDirectDiscount + serviceDirectDiscount;
      const globalDiscount = Math.max(0, totalDiscount - directDiscountTotal);

      const totalGross = productGross + serviceGross;
      const productGlobalShareTotal = totalGross > 0 ? globalDiscount * (productGross / totalGross) : 0;
      const serviceGlobalShareTotal = totalGross > 0 ? globalDiscount * (serviceGross / totalGross) : 0;

      products.forEach((prod) => {
        const quantity = safeNumber(prod?.quantity || prod?.selectedItems || 1);
        const salePrice = safeNumber(prod?.salePrice ?? 0);
        const unitaryPrice = safeNumber(prod?.unitaryPrice ?? 0);
        const effectiveBasePrice = (() => {
          if (salePrice > 0 && unitaryPrice > 0) {
            return Math.max(salePrice, unitaryPrice);
          }
          return unitaryPrice > 0 ? unitaryPrice : salePrice;
        })();
        const gross = Math.max(0, effectiveBasePrice * quantity);
        const directDiscount = Math.max(0, safeNumber(prod?.discount));
        const baseAfterDirect = Math.max(0, gross - directDiscount);
        const globalShare = productGross > 0 ? productGlobalShareTotal * (gross / productGross) : 0;
        const cappedShare = Math.min(baseAfterDirect, globalShare);
        const net = Math.max(0, baseAfterDirect - cappedShare);
        prod.__commissionBase = net;
        prod.__commissionGross = gross;
        prod.__commissionGlobalDiscount = cappedShare;
      });

      services.forEach((svc) => {
        const gross = Math.max(0, safeNumber(svc?.executionPrice ?? svc?.customPrice ?? 0));
        const directDiscount = Math.max(0, safeNumber(svc?.discount));
        const baseAfterDirect = Math.max(0, gross - directDiscount);
        const globalShare = serviceGross > 0 ? serviceGlobalShareTotal * (gross / serviceGross) : 0;
        const cappedShare = Math.min(baseAfterDirect, globalShare);
        const net = Math.max(0, baseAfterDirect - cappedShare);
        svc.__commissionBase = net;
        svc.__commissionGross = gross;
        svc.__commissionGlobalDiscount = cappedShare;
      });
    } catch (error) {
      console.warn('[CashierReportsService] normalizeCommissionBases error:', error);
    }
  }

  private hasUninvoicedPaymentMethods(item: any) {

    let uninvoiced = false;
    let amount = 0;

    item.paymentMethods.forEach((method) => {
      if (method.uninvoiced) {
        uninvoiced = true;
      } else {
        amount += method.value;
      }
    });

    return { status: uninvoiced, value: amount };
  }

}
