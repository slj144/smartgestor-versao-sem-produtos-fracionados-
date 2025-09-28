import { Injectable } from "@angular/core";

// Services
import { IToolsService } from '@shared/services/iTools.service';
import { CashierReportsService } from "@pages/reports/components/modal/components/cashier/cashier.service";
import { StockReportsService } from "@pages/reports/components/modal/components/stock/stock.service";
import { ProductsService } from "@pages/stock/products/products.service";
import { ServiceOrdersService } from "@pages/services/serviceOrders/serviceOrders.service";
import { RequestsService } from "@pages/requests/requests.service";
import { BillsToPayService } from "@pages/financial/bills-to-pay/bills-to-pay.service";
import { BillsToReceiveService } from "@pages/financial/bills-to-receive/bills-to-receive.service";
import { CustomersService } from "@pages/registers/customers/customers.service";

// Translate
import { DashboardTranslate } from './dashboard.translate';

// Utilities
import { Utilities } from '@shared/utilities/utilities';
import { DateTime } from '@shared/utilities/dateTime';

@Injectable({ providedIn: 'root' })
export class DashboardService {

  public translate = DashboardTranslate.get();

  constructor(
    private iToolsService: IToolsService,
    private cashierReportsService: CashierReportsService,
    private stockReportsService: StockReportsService,
    private productsService: ProductsService,
    private serviceOrdersService: ServiceOrdersService,
    private requestsService: RequestsService,
    private billsToPayService: BillsToPayService,
    private billsToReceiveService: BillsToReceiveService,
    private customersService: CustomersService,
  ) { }

  // First Section Methods

  public getProductsCount(callback: ((data: any) => void)) {

    this.iToolsService.database().collection('StockProducts').count().get().then((res) => {
      callback(res.docs.length > 0 ? res.docs[0].data().count : 0);
    });
  }

  public getRequestsCount(callback: ((data: any) => void)) {

    this.iToolsService.database().collection('Requests').where([
      { field: 'owner', operator: '=', value: Utilities.storeID },
      { field: 'requestStatus', operator: '=', value: 'PENDENT' }
    ]).count().get().then((res) => {
      callback(res.docs.length > 0 ? res.docs[0].data().count : 0);
    });
  }

  public getServiceOrdersCount(callback: ((data: any) => void), permissions: any) {

    const where: any[] = [
      { field: 'owner', operator: '=', value: Utilities.storeID },
      { field: 'serviceStatus', operator: '=', value: 'PENDENT' }
    ];

    if (!Utilities.isAdmin && permissions.filterDataPerOperator) {
      where.push({ field: 'operator.username', operator: "=", value: Utilities.currentLoginData.username });
    }

    this.iToolsService.database().collection('ServiceOrders').where(where).count().get().then((res) => {
      callback(res.docs.length > 0 ? res.docs[0].data().count : 0);
    });
  }

  public getCustomersCount(callback: ((data: any) => void)) {

    this.iToolsService.database().collection('RegistersCustomers').where([
      { field: 'owner', operator: '=', value: Utilities.storeID }
    ]).count().get().then((res) => {
      callback(res.docs.length > 0 ? res.docs[0].data().count : 0);
    });
  }

  // Second Section Methods

  public getCashSummary(callback: ((data: any) => void), permissions) {

    const where: any = [
      { field: 'date', operator: '>=', value: `${DateTime.getCurrentYear()}-${DateTime.getCurrentMonth()}-01 00:00:00` },
      { field: 'owner', operator: '=', value: Utilities.storeID },
      { field: 'status', operator: '=', value: 'CONCLUDED' },
    ];

    if (permissions.filterDataPerOperator) {
      where.push({ field: 'operator.username', operator: "=", value: Utilities.currentLoginData.username });
    }

    this.cashierReportsService.getResume({
      where: where,
      orderBy: { code: 1 }
    }, (data) => {

      data = Utilities.objectSorter(Utilities.grupByPaymentDate(data), { orderBy: "date" });


      const getStatistics = (type: ('day' | 'week' | 'month')) => {

        const enterCost = permissions.costs;

        const obj: any = {
          sales: { value: 0, percentage: 0 },
          inflows: { value: 0, percentage: 0 },
          outflows: { value: 0, percentage: 0 },
          total: 0
        };

        const period: any = (() => {
          switch (type) {
            case 'day':
              return { start: DateTime.getDate('D'), end: DateTime.getDate('D') }
            case 'week':
              return {
                start: DateTime.formatDate(DateTime.getStartWeek().toISOString()).date,
                end: DateTime.formatDate(DateTime.getEndWeek().toISOString()).date
              };
            case 'month':
              return {
                start: `${DateTime.getCurrentYear()}-${DateTime.getCurrentMonth()}-01`,
                end: DateTime.getDate('D')
              };
          }
        })();

        if (enterCost) {
          obj.costs = { value: 0, percentage: 0 };
        }

        for (const item of data) {

          // const date = item.paymentDate || item.date;
          const date = item.date;

          if (date >= period.start && date <= period.end) {

            // console.log(date, period.start, period.end);

            obj.sales.value += item.balance.sales || 0;
            obj.inflows.value += item.balance.inflows || 0;
            obj.outflows.value += item.balance.outflows || 0;

            // console.log(obj);

            if (enterCost) {

              const servicesCosts = item.balance.servicesCosts || 0;
              const productsCosts = item.balance.productsCosts || 0;
              const paymentsCosts = item.balance.paymentsCosts || 0;

              // IMPORTANTE: servicesCosts já inclui a comissão, não somar novamente
              // Comissão está em servicesCosts desde a correção no cashier.service.ts

              obj.costs.value += (servicesCosts + productsCosts + paymentsCosts);
            }
          }
        }

        const baseValue = (((obj.sales.value + obj.inflows.value) + obj.outflows.value) + (obj.costs ? obj.costs.value : 0));

        obj.sales.percentage = Math.round((obj.sales.value * 100) / baseValue);
        obj.inflows.percentage = Math.round((obj.inflows.value * 100) / baseValue);
        obj.outflows.percentage = Math.round((obj.outflows.value * 100) / baseValue);

        if (enterCost) {
          obj.costs.percentage = Math.round((obj.costs.value * 100) / baseValue);
        }

        obj.total = (((obj.sales.value + obj.inflows.value) - obj.outflows.value) - (obj.costs ? obj.costs.value : 0));

        const items = [
          { name: this.translate.blocks.second_section.cashier.summary.labels.sales, value: (baseValue > 0 ? obj.sales.value : 0.001), percentage: obj.sales.percentage },
          { name: this.translate.blocks.second_section.cashier.summary.labels.inflows, value: (baseValue > 0 ? obj.inflows.value : 0.001), percentage: obj.inflows.percentage },
          { name: this.translate.blocks.second_section.cashier.summary.labels.outflows, value: (baseValue > 0 ? obj.outflows.value : 0.001), percentage: obj.outflows.percentage }
        ];

        const settings = {
          results: [],
          total: obj.total,
          fake: !baseValue
        };

        if (Utilities.isAdmin) {
          settings.results = items;
        } else {

          if (!permissions.revenue) {
            settings.total = items[0].value;
          }

          settings.results.push(items[0]);

          if (permissions.inputs) {
            settings.results.push(items[1]);
          }

          if (permissions.outputs) {
            settings.results.push(items[2]);
          }

        }

        if (enterCost) {
          settings.results.push({
            name: this.translate.blocks.second_section.cashier.summary.labels.costs, value: (baseValue > 0 ? obj.costs.value : 0.001), percentage: obj.costs.percentage
          });
        }

        return settings;
      };

      callback({
        currentDay: getStatistics('day'),
        currentWeek: getStatistics('week'),
        currentMonth: getStatistics('month')
      });
    });
  }

  // Calcula comissões diretamente dos registros de vendas (produtos e serviços)
  // para uso exclusivo do Dashboard, sem impactar relatórios.
  private computeCommissionsFromSalesRecords(records: any[]): number {
    let total = 0;

    for (const sale of (records || [])) {

      // Produtos
      for (const p of (sale.products || [])) {
        if (p?.commission && p.commission.enabled) {
          const quantity = Number(p.quantity || 1);
          const lineTotal = (p.paymentAmount != null && p.paymentAmount !== undefined)
            ? Number(p.paymentAmount)
            : Number(p.salePrice || p.unitaryPrice || 0) * quantity;

          if (p.commission.type === 'percentage') {
            total += (lineTotal * Number(p.commission.value || 0)) / 100;
          } else {
            total += Number(p.commission.value || 0) * quantity;
          }
        }
      }

      // Serviços
      const service = sale.service;
      if (service && Array.isArray(service.types)) {
        for (const s of service.types) {
          if (s?.commission && s.commission.enabled) {
            const serviceTotal = Number(s.customPrice || s.executionPrice || 0);
            if (s.commission.type === 'percentage') {
              total += (serviceTotal * Number(s.commission.value || 0)) / 100;
            } else {
              total += Number(s.commission.value || 0);
            }
          }
        }
      }
    }

    return total;
  }

  public getBestSellers(callback: ((data: any) => void)) {

    const startPeriod = `${DateTime.getCurrentYear()}-${DateTime.getCurrentMonth()}-01 00:00:01`;
    const endPeriod = `${DateTime.getCurrentYear()}-${DateTime.getCurrentMonth()}-${DateTime.getCurrentDay()} 23:59:59`;

    const where: any[] = [
      { field: 'status', operator: '=', value: 'CONCLUDED' },
      { field: 'registerDate', operator: '>=', value: startPeriod },
      { field: 'registerDate', operator: '<=', value: endPeriod },
      { field: 'owner', operator: '=', value: Utilities.storeID }
    ];

    this.stockReportsService.getCurveABC({
      where: where,
      orderBy: { code: 1 }
    }).then((data) => {

      data.sort((a, b) => {
        return ((a.quantity < b.quantity) ? 1 : ((a.quantity > b.quantity) ? -1 : 0));
      });

      callback(data.slice(0, 10));
    });
  }

  public getProducts(callback: ((data: any) => void)) {

    this.productsService.getStockAlert().then((data) => {

      let result = [];

      for (const item of data) {

        result.push({
          code: Utilities.prefixCode(item.code),
          name: item.name,
          quantity: item.quantity,
          commercialUnit: item.commercialUnit
        });
      }

      callback(result);
    });
  }

  public getServicesOrders(callback: ((data: any) => void), permissions: any) {

    const where: any = [
      { field: 'serviceStatus', operator: '=', value: 'PENDENT' }
    ];

    if (!Utilities.isAdmin && permissions.filterDataPerOperator) {
      where.push({ field: 'operator.username', operator: "=", value: Utilities.currentLoginData.username });
    }

    this.serviceOrdersService.query(where, false, false, false, false).then((data) => {

      let result = [];

      for (const item of data) {

        result.push({
          code: Utilities.prefixCode(item.code),
          customer: item.customer,
          status: item.serviceStatus
        });
      }

      callback(result);
    });
  }

  public getRequests(callback: ((data: any) => void)) {

    const where: any = [
      { field: 'requestStatus', operator: '=', value: 'PENDENT' }
    ];

    if (!Utilities.isAdmin) {
      where.push({ field: 'operator.username', operator: "=", value: Utilities.currentLoginData.username });
    }

    this.requestsService.query(where, false, false, false, false).then((data) => {

      const result = [];

      for (const item of data) {

        const obj: any = {
          code: Utilities.prefixCode(item.code),
          status: item.requestStatus
        }

        if (item.customer) {
          obj.customer = item.customer;
        }

        if (item.member) {
          obj.member = item.member;
        }

        result.push(obj);
      }

      callback(result);
    });
  }

  public getBillsToPay(callback: ((data: any) => void)) {

    const currentDate = new Date(DateTime.getDate());
    const finalDate = new Date(DateTime.getDate());

    finalDate.setDate(finalDate.getDate() + 15);

    this.billsToPayService.query([
      { field: 'status', operator: '=', value: 'PENDENT' },
      { field: 'installments.dueDate', operator: '>=', value: currentDate.toISOString().substring(0, 10) },
      { field: 'installments.dueDate', operator: '<=', value: finalDate.toISOString().substring(0, 10) }
    ], false, false, false, false, 25).then((data) => {

      let result = [];

      for (const item of data) {

        const currentParcel = item.installments[item.currentInstallment];

        result.push({
          code: Utilities.prefixCode(item.code),
          beneficiary: item.beneficiary?.name,
          dueDate: currentParcel.dueDate,
          value: (currentParcel.amount - currentParcel.paidAmount)
        });
      }

      callback(result);
    });
  }

  public getBillsToReceive(callback: ((data: any) => void)) {

    const currentDate = new Date(DateTime.getDate());
    const finalDate = new Date(DateTime.getDate());

    finalDate.setDate(finalDate.getDate() + 15);

    this.billsToReceiveService.query([
      { field: 'status', operator: '=', value: 'PENDENT' },
      { field: 'installments.dueDate', operator: '>=', value: currentDate.toISOString().substring(0, 10) },
      { field: 'installments.dueDate', operator: '<=', value: finalDate.toISOString().substring(0, 10) }
    ], false, false, false, false, 25).then((data) => {

      let result = [];

      for (const item of data) {

        const currentParcel = item.installments[item.currentInstallment];

        result.push({
          code: Utilities.prefixCode(item.code),
          debtor: item.debtor?.name,
          dueDate: currentParcel.dueDate,
          value: (currentParcel.amount - currentParcel.receivedAmount)
        });
      }

      callback(result);
    });
  }

  public getBirthdayCustomers(callback: ((data: any) => void)) {

    const queries = this.composeQueryForBirthDate();

    this.customersService.query(queries, false, true, false, false, 25).then((data) => {

      const result = [];

      for (const item of data) {

        result.push({
          thumbnail: item.name.substring(0, 1),
          name: item.name,
          phone: item?.contacts?.phone || "",
          birthDate: DateTime.formatDate(item.birthDate, 'object', 'BR').date
        });
      }

      result.sort((a, b) => {
        return ((a.birthDate < b.birthDate) ? 1 : ((a.birthDate > b.birthDate) ? -1 : 0));
      });

      callback(result);
    });
  }

  // Auxiliary Methods

  private composeQueryForBirthDate() {

    const startWeek = DateTime.getStartWeek().toISOString().substring(0, 10);
    const endWeek = DateTime.getEndWeek().toISOString().substring(0, 10);

    let stop = true;
    let queries = [];

    let sWeek = new Date(`${startWeek} 00:00:00`);

    while (stop) {

      let currentDate = sWeek.toISOString().substring(0, 10);

      if (currentDate <= endWeek) {
        queries.push({
          field: 'birthDate',
          operator: 'like',
          value: new RegExp(`\\d{4}\-${currentDate.substring(5, 10)}`, 'gi')
        });
      }

      if (currentDate == endWeek) {
        stop = false;
      }

      sWeek.setDate(sWeek.getDate() + 1);
    }

    return queries;
  }

}
