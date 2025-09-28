import { Injectable } from '@angular/core';

// Services
import { CashierReportsService } from '../../../../reports/components/modal/components/cashier/cashier.service';
import { PaymentMethodsService } from '../../../../registers/paymentMethods/paymentMethods.service';

// Interfaces
import { ICashierControl } from '@shared/interfaces/ICashierControl';
import { ECashierInflowStatus } from '@shared/interfaces/ICashierInflow';
import { ECashierOutflowStatus } from '@shared/interfaces/ICashierOutflow';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { DateTime } from '@shared/utilities/dateTime';
import { ECashierSaleStatus } from '@shared/interfaces/ICashierSale';

@Injectable({ providedIn: 'root' })
export class CashierFrontReportsService {

  private _cashierControl: ICashierControl = null;

  constructor(
    private cashierReportsService: CashierReportsService,
    private paymentMethodsService: PaymentMethodsService
  ) {}

  // Setter and Getter Methods

  public set cashierControl(data: any) {
    this._cashierControl = data;
  }

  // Common Methods

  public async getData(callback?: ((_: any)=>void)) {

    return (new Promise<any>((resolve) => {

      const result = (async (data) => {
        
        const obj = {
          sales: {}, inflows: {}, outflows: {}, resume: {}
        };

        obj.sales = await this.getSales(data);
        obj.inflows = await this.getInflows(data);
        obj.outflows = await this.getOutflows(data);
        obj.resume = await this.getResume(data);

        return obj;
      });

      // this.cashierReportsService.getSales({
      //   data: {
      //     type: 'salesReportAnalytical'
      //   },
      //   where: [
      //     { field: 'paymentDate', operator: '>=', value: `${this._cashierControl.opening.date}` },
      //     { field: 'status', operator: '=', value: ECashierSaleStatus.PENDENT },
      //     { field: 'owner', operator: '=', value: Utilities.storeID }
      //   ],
      //   orderBy: { code: 1 }        
      // }).then(async (data) => {
      //   console.log(data);
      //   // resolve(await result(data));
      // });
      // console.log(this._cashierControl);

      this.cashierReportsService.getResume({
        where: [
          { field: 'date', operator: '>=', value: `${this._cashierControl.opening.date}` },
          { field: 'status', operator: '=', value: ECashierSaleStatus.CONCLUDED },
          { field: 'owner', operator: '=', value: Utilities.storeID }
        ],
        orderBy: { code: 1 }
      }, async (data) => {

        // console.log(data);

        if (callback) { 
          callback(await result(data));
        }
      }).then(async (data) => {
        resolve(await result(data));
      });
    }));
  } 

  private async getResume(data: any) {

    data = Utilities.deepClone(data);

    let records = data;//Utilities.objectSorter(data, { orderBy: 'date' });
    const paymentData = await this.getPaymentMethods();
    
    return (new Promise((resolve) => {

      const result: any = {
        cashier: {
          date: this._cashierControl.opening.date,
          value: this._cashierControl.opening.value
        },
        salesPerUser: [],
        paymentMethods: {
          sales: []
        },
        balance: {}
      };
      
      let openingValueTotal = result.cashier.value;
      let currentValueTotal = openingValueTotal;

      let c = 0;
      let hasRecordsToday = false;
      
      $$(data).map((_, record: any) => {

        if (record.date == DateTime.getDate('D')) {
          hasRecordsToday = true;
        }             
      });  
      
      if (!hasRecordsToday) {
        records.push({ date: DateTime.getDate('D'), data: {} });
      }


     

      records = Utilities.objectSorter(Utilities.grupByPaymentDate(records), {orderBy: "date"});

      // console.log(records);

      // return;

      // return;

      if (records.length == 0){

      }

      $$(records).map((_, item) => {

        // item.date = item.paymentDate;
        // const date = item.paymentDate;
        const date = item.date;

        result.balance[date] = {
          openingValue: 0, currentValue: 0,
          sales: 0, inflows: 0,
          outflows: 0, total: 0
        };

        $$(item.records).map((type, records: any) => {

          if (type == 'sales') {

            $$(Utilities.objectSorter(records, { orderBy: 'code' })).map((_, item) => {
                
              let totalAmountBilled = item.balance.total;

              if (item.paymentMethods && (item.paymentMethods).length > 0) {

                for (const method of item.paymentMethods) {

                  let value = 0;

                  $$(method.history).map((_, register) => {
              
                    if (register.date >= this._cashierControl.opening.date) {
                      value += parseFloat(register.value);
                    }
                  });

                  const fee = parseFloat(method.fee ? method.fee : ((method.fees && method.fees.fee) ? method.fees.fee : 0));
                  const cost = ((value * (fee / 100)) || 0);

                  const obj: any = {
                    code: method.code,
                    saleCode: item.code,
                    name: method.name,
                    value: value,
                    cost: cost
                  }

                  if (method.code > 4000 && method.code < 5000) {
                    obj.parcel = parseFloat(method.fees ? method.fees.parcel : 1);
                  }

                  if (paymentData[method.code] && paymentData[method.code].uninvoiced) {
                    totalAmountBilled -= value;
                  }

                  result.paymentMethods.sales.push(obj);
                }
              }

              result.salesPerUser.push({
                operator: item.operator,
                value: totalAmountBilled
              });

              result.balance[date].sales += totalAmountBilled;        
            });

            result.balance[date].total += result.balance[date].sales;
          }

          if (type == 'inflows') {

            $$(Utilities.objectSorter(records, { orderBy: 'code' })).map((_, item) => {
              if (item.status == ECashierInflowStatus.CONCLUDED) {
                result.balance[date].inflows += item.value;
              }
            });

            result.balance[date].total += result.balance[date].inflows;
          }
    
          if (type == 'outflows') {

            $$(Utilities.objectSorter(records, { orderBy: 'code' })).map((_, item) => {

              if (item.status == ECashierOutflowStatus.CONCLUDED) {
                result.balance[date].outflows += item.value;
              }
            });   
                      
            result.balance[date].total -= result.balance[date].outflows;
          }          
        });

        // Cashier state calculation

        if ((c++) > 0) {
          openingValueTotal = currentValueTotal;
        }

    
        
        currentValueTotal += result.balance[date].total;

        // console.log(currentValueTotal, result);

        // Cashier state application

        result.balance[date].openingValue = openingValueTotal;
        result.balance[date].currentValue = currentValueTotal;
      });

      result.paymentMethods = (() => {

        const obj = {        
          sales: {
            invoiced: { records: [], total: { value: 0, cost: 0, revenue: 0 } },
            uninvoiced: { records: [], total: { value: 0, cost: 0, revenue: 0 } }
          },
          balance: {
            invoiced: { records: [], total: { value: 0, cost: 0, revenue: 0 } },
            uninvoiced: { records: [], total: { value: 0, cost: 0, revenue: 0 } }
          }
        }

        // console.log(result.paymentMethods);
            
        $$(result.paymentMethods).map((type: string, data: any) => {

          const auxBalance = {};

          if (type == 'sales') {
          
            $$(data).map((_, item) => {

              if (paymentData[item.code] && paymentData[item.code].uninvoiced) {
                obj.sales.uninvoiced.total.value += item.value;
                obj.sales.uninvoiced.total.cost += item.cost;
                obj.sales.uninvoiced.total.revenue += (item.value - item.cost);
                obj.sales.uninvoiced.records.push(item);
              } else {
                obj.sales.invoiced.total.value += item.value;
                obj.sales.invoiced.total.cost += item.cost;
                obj.sales.invoiced.total.revenue += (item.value - item.cost);                
                obj.sales.invoiced.records.push(item);
              }

              if (!auxBalance[item.code]) { auxBalance[item.code] = [] }

              auxBalance[item.code].push(item);
            });
          }

          $$(auxBalance).map((_, data) => {

            const invoiced: any = { value: 0, cost: 0, revenue: 0 };
            const uninvoiced: any = { value: 0, cost: 0, revenue: 0 };

            let checkType = '';

            $$(data).map((_, item) => {

              if (paymentData[item.code] && paymentData[item.code].uninvoiced) {

                uninvoiced.code = item.code;
                uninvoiced.name = item.name;
                uninvoiced.value += item.value;
                uninvoiced.cost += item.cost;

                checkType = 'uninvoiced';
              } else {

                invoiced.code = item.code;
                invoiced.name = item.name;
                invoiced.value += item.value;
                invoiced.cost += item.cost;

                checkType = 'invoiced';
              }            
            });

            if (checkType == 'invoiced') {              

              invoiced.revenue = (invoiced.value - (invoiced.cost || 0));

              // console.log(invoiced);

              obj.balance.invoiced.total.value += invoiced.value;
              obj.balance.invoiced.total.cost += invoiced.cost;
              obj.balance.invoiced.total.revenue += invoiced.revenue;

              // console.log(invoiced);

              obj.balance.invoiced.records.push(Utilities.deepClone(invoiced));
            }

            if (checkType == 'uninvoiced') {

              uninvoiced.revenue = (uninvoiced.value - (uninvoiced.cost || 0));

              // console.log(uninvoiced);

              obj.balance.uninvoiced.total.value += uninvoiced.value;
              obj.balance.uninvoiced.total.cost += uninvoiced.cost;
              obj.balance.uninvoiced.total.revenue += uninvoiced.revenue;          

              // console.log(uninvoiced);
              obj.balance.uninvoiced.records.push(Utilities.deepClone(uninvoiced));
            }
          });
        });     

        // const objCopy = Utilities.deepClone(obj);


        // console.log(objCopy);

        return obj;
      })();
      
      result.salesPerUser = (() => {

        const obj = {
          records: [], 
          total: { quantity: 0, value: 0 }
        }

        const auxOperator = {};

        $$(result.salesPerUser).map((_, item) => {

          if (!auxOperator[item.operator.username]) {
            auxOperator[item.operator.username] = {
              name: item.operator.name, quantity: 0, value: 0
            };
          }

          auxOperator[item.operator.username].quantity += 1;
          auxOperator[item.operator.username].value += item.value;        
        });

        $$(auxOperator).map((_, item) => {
          
          obj.records.push({
            name: item.name,
            quantity: item.quantity,
            value: item.value
          });

          obj.total.quantity += item.quantity;
          obj.total.value += item.value;
        });

        return obj
      })();    

      result.overallBalance = (() => {

        const obj = { 
          records: [], 
          total: { 
            openingValue: 0, currentValue: 0,
            sales: 0, inflows: 0, outflows: 0
          }
        }

        $$(result.balance).map((date: string, data: any) => {

          data.date = date;          

          obj.total.openingValue = result.cashier.value;
          obj.total.sales += data.sales;
          obj.total.inflows += data.inflows;
          obj.total.outflows += data.outflows;
          obj.total.currentValue = data.currentValue;

          obj.records.push(data);
        });

        return obj;
      })();
      
      result.dailyBalance = (() => {

        const balance = result.overallBalance.total; 

        let grossAmount = balance.openingValue;

        $$(result.paymentMethods.balance.invoiced.records).map((_, item) => {
          if (item.code == '1000') { 
            grossAmount += item.value
           }
        });

        grossAmount = ((grossAmount + balance.inflows) - balance.outflows);

        return { 
          total: { 
            openingValue: balance.openingValue, 
            currentValue: grossAmount
          }
        };
      })();

      
      (result.paymentMethods.balance.invoiced.records).map((item, index)=>{
        item.revenue = (item.value - item.cost);
        // result.paymentMethods.balance.invoiced.records[index] = item;
        return item;
      });

      (result.paymentMethods.balance.uninvoiced.records).map((item, index)=>{
        item.revenue = (item.value - item.cost);
        // console.log(item);
        return item;
        // result.paymentMethods.balance.uninvoiced.records[index] = item;
      });

      // objCopy.balance.invoiced.records.forEach((item)=>{
      //   item.revenue = (item.value - item.cost);
      //   // console.log(item);
      // });

      // objCopy.balance.uninvoiced.records.forEach((item)=>{
      //   item.revenue = (item.value - item.cost);

      //   // console.log(item);
      // });

      // console.log(result)

      resolve(result);
    }));
  }

  private async getSales(data: any) {
    
    return (new Promise<any>((resolve, _) => {
      
      const result = {
        records: [],
        balance: {
          discount: 0, fee: 0, value: 0, revenue: 0
        }
      };

      $$(data).map((_, item) => {

        $$(item.records.sales).map((_, sale) => {
          
          result.balance.discount += sale.balance.discount;
          result.balance.fee += sale.balance.fee;

          $$(sale.paymentMethods).map((_, method) => {

            $$(method.history).map((_, register) => {
              
              if (register.date >= this._cashierControl.opening.date) {
                result.balance.value += register.value;
              }
            });
          });

          sale.balance.revenue = sale.balance.finalRevenue
          
          result.balance.revenue += sale.balance.revenue;

          result.records.push(sale);
        });
      });

      result.records.sort((a, b) => { 
        return ((a.code < b.code) ? -1 : ((a.code > b.code) ? 1 : 0 ));
      });
        
      resolve(result);
    }));
  }

  private async getInflows(data: any) {

    return (new Promise<any>((resolve, _) => {
      
      const result = {
        records: [],
        balance: { value: 0 }
      };

      $$(data).map((_, item) => {

        $$(item.records.inflows).map((_, inflow) => {          
          result.balance.value += inflow.value;
          result.records.push(inflow);
        });
      });

      result.records.sort((a, b) => { 
        return ((a.code < b.code) ? -1 : ((a.code > b.code) ? 1 : 0 ));
      });
        
      resolve(result);
    }));
  }

  private async getOutflows(data: any) {

    return (new Promise<any>((resolve, _) => {
      
      const result = {
        records: [],
        balance: { value: 0 }
      };

      $$(data).map((_, item) => {

        $$(item.records.outflows).map((_, outflow) => {          
          result.balance.value += outflow.value;
          result.records.push(outflow);
        });
      });

      result.records.sort((a, b) => { 
        return ((a.code < b.code) ? -1 : ((a.code > b.code) ? 1 : 0 ));
      });
        
      resolve(result);
    }));
  }

  // Utilitary Methods

  private async getPaymentMethods(): Promise<any> {

    return (new Promise((resolve) => {
          
      this.paymentMethodsService.getPaymentMethods('CashierReportsService/getResume/getPayments', (data) => {

        this.paymentMethodsService.removeListeners('records', 'CashierReportsService/getResume/getPayments');

        const obj = {};

        $$(data).map((_, item) => {

          if (item.providers) {
            $$(item.providers).map((_, provider) => {
              obj[provider.code] = provider;
            })
          } else {
            obj[item.code] = item;
          }
        });

        resolve(obj);
      });
    })); 
  }

}