import { Injectable } from "@angular/core";

// Services
import { IToolsService } from "@shared/services/iTools.service";

// Interfaces
import { ICollection } from "@itools/interfaces/ICollection";

// Types
import { query } from "@shared/types/query";

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from "@shared/utilities/utilities";
import { DateTime } from "@shared/utilities/dateTime";

@Injectable({ providedIn: 'root' })
export class ServiceOrdersReportsService {

  private dataResume: any = {};

  constructor(
    private iToolsService: IToolsService
  ) {}

  public async getResume(settings: { where: query['where'], orderBy: query['orderBy'], start?: number, limit?: number, data?: any }, callback?: ((_: any)=>void)) {

    return (new Promise<any>(async (resolve) => {

      this.dataResume = { internal: {}, external: {} };

      await this.getServicesInternal(Utilities.deepClone({...settings, data: { type: 'servicesInternalReportSynthetic' }}), (data) => {

        this.dataResume.internal = data;

        if (callback) {
          callback(this.treatResume(this.dataResume, settings));
        }
      });
      
      await this.getServicesExternal(Utilities.deepClone({...settings, data: { type: 'servicesExternalReportSynthetic' }}), (data) => {

        this.dataResume.external = data;

        if (callback) {
          callback(this.treatResume(this.dataResume, settings));
        }
      });

      resolve(this.treatResume(this.dataResume, settings));
    }));
  }

  public async getServicesInternal(settings: { where: query['where'], orderBy: query['orderBy'], start?: number, limit?: number, data?: any }, callback?: ((_: any)=>void)) {

    return (new Promise<any>((resolve) => {

      const collection = this.iToolsService.database().collection('ServiceOrders');
      collection.orderBy(settings.orderBy);

      if (settings.where && settings.where.length > 0) {
        settings.where.push({ field: 'execution.type', operator: '=', value: 'INTERNAL' });
      } else {
        settings.where = [{ field: 'execution.type', operator: '=', value: 'INTERNAL' }];
      }

      collection.where(settings.where);

      const handler = ((response) => {

        let objData: any = {};

        for (const doc of response.docs) {

          const item = doc.data();
          item.code = Utilities.prefixCode(item.code);

          const date = DateTime.formatDate(item.registerDate).date

          if (!objData[date]) {

            objData[date] = {
              date: date,
              records: [],
              balance: {
                discount: 0, fee: 0,
                servicesCosts: 0, productsCosts: 0,
                totalCosts: 0, partialRevenue: 0,
                finalRevenue: 0
              }
            };
          }

          item.balance = item.balance ?? {};
          
          item.balance.fee = 0;
          item.balance.servicesCosts = 0;
          item.balance.productsCosts = 0;
          item.balance.paymentsCosts = 0;

          if (item.services && item.services.length > 0) {

            let amount = 0;
            let paymentAmount = (item.balance?.subtotal?.services ?? 0);

            for (const service of item.services) {

              service.discount = 0;
              service.fee = 0;

              amount += service.customPrice;

              const costPrice = service.customCostPrice != undefined ?  service.customCostPrice : service.costPrice; 
              item.balance.servicesCosts += costPrice;
            }

            if (amount > paymentAmount) {
              for (const type of item.services) {
                type.discount = ((amount - paymentAmount) / item.services.length);
              }
            }

            if (amount < paymentAmount) {
              for (const type of item.services) {
                type.fee = ((paymentAmount - amount) / item.services.length);
              }
            }
            

            objData[date].balance.servicesCosts += item.balance.servicesCosts;            
          }

          if (item.products) {

            for (const product of item.products) {

              product.discount = 0;
              product.fee = 0;

              if (product.salePrice > product.unitaryPrice) {
                product.discount = ((product.salePrice - product.unitaryPrice) * product.quantity);
              } 
              
              if (product.salePrice < product.unitaryPrice) {
                product.fee = ((product.unitaryPrice - product.salePrice) * product.quantity);
              }              
              
              item.balance.fee += product.fee;
              item.balance.productsCosts += (product.costPrice * product.quantity);                  
            }
            
            objData[date].balance.productsCosts += item.balance.productsCosts;
          }

          // Individual Balance
          item.balance.discount = (item.balance.subtotal && item.balance.subtotal.discount ? item.balance.subtotal.discount : 0);
          item.balance.fee = ((item.balance.subtotal && item.balance.subtotal.fee ? item.balance.subtotal.fee.total : 0) + item.balance.fee);
          item.balance.totalCosts = (item.balance.servicesCosts + item.balance.productsCosts);
          item.balance.partialRevenue = item.balance.total;
          item.balance.finalRevenue = (item.balance.partialRevenue - (item.balance.servicesCosts + item.balance.productsCosts));

          // Period Balance
          objData[date].balance.discount += item.balance.discount;
          objData[date].balance.fee += item.balance.fee;
          objData[date].balance.totalCosts += item.balance.totalCosts;
          objData[date].balance.partialRevenue += item.balance.total;

          const record: any = {
            date: item.registerDate,
            code: item.code,
            operator: item.operator,
            customer: item.customer,
            services: item.services,
            products: item.products,
            balance: item.balance
          };

          objData[date].balance.finalRevenue = (objData[date].balance.partialRevenue - objData[date].balance.totalCosts);
          objData[date].records.push(record);
        }

        const result = this.treatServicesInternal(Object.values(objData), settings);

        if (callback) {
          callback(result);
        }

        resolve(result);
      });

      if (!callback) {
        collection.get().then(handler);
      } else {
        collection.onSnapshot(handler);
      }
    }));
  }

  public async getServicesExternal(settings: { where: query['where'], orderBy: query['orderBy'], start?: number, limit?: number, data?: any }, callback?: ((_: any)=>void)) {

    return (new Promise<any>((resolve) => {

      const collection = this.iToolsService.database().collection('ServiceOrders');
      collection.orderBy(settings.orderBy);

      if (settings.where && settings.where.length > 0) {          
        settings.where.push({ field: 'execution.type', operator: '=', value: 'EXTERNAL' });
      } else {
        settings.where = [{ field: 'execution.type', operator: '=', value: 'EXTERNAL' }];
      }

      collection.where(settings.where);

      const handler = ((response) => {

        let objData: any = {};

        for (const doc of response.docs) {

          const item = doc.data();
          item.code = Utilities.prefixCode(item.code);

          const date = DateTime.formatDate(item.registerDate).date

          if (!objData[date]) {

            objData[date] = {
              date: date,
              records: [],
              balance: {
                discount: 0, fee: 0,
                servicesCosts: 0, productsCosts: 0,
                totalCosts: 0, partialRevenue: 0,
                finalRevenue: 0
              }
            };
          }

          item.balance.fee = 0;
          item.balance.servicesCosts = 0;
          item.balance.productsCosts = 0;
          item.balance.paymentsCosts = 0;

          if (item.services && item.services.length > 0) {

            let amount = 0;
            let paymentAmount = (item.balance.subtotal.services || 0);

            for (const service of item.services) {

              service.discount = 0;
              service.fee = 0;

              amount += service.customPrice;
              const costPrice = service.customCostPrice != undefined ?  service.customCostPrice : service.costPrice; 
              item.balance.servicesCosts += costPrice;
            }

            if (amount > paymentAmount) {
              for (const type of item.services) {
                type.discount = ((amount - paymentAmount) / item.service.types.length);
              }
            }

            if (amount < paymentAmount) {
              for (const type of item.service.types) {
                type.fee = ((paymentAmount - amount) / item.service.types.length);
              }
            }

            objData[date].balance.servicesCosts += item.balance.servicesCosts;            
          }

          if (item.products) {

            for (const product of item.products) {

              product.discount = 0;
              product.fee = 0;

              if (product.salePrice > product.unitaryPrice) {
                product.discount = ((product.salePrice - product.unitaryPrice) * product.quantity);
              } 
              
              if (product.salePrice < product.unitaryPrice) {
                product.fee = ((product.unitaryPrice - product.salePrice) * product.quantity);
              }              
              
              item.balance.fee += product.fee;
              item.balance.productsCosts += (product.costPrice * product.quantity);                  
            }
            
            objData[date].balance.productsCosts += item.balance.productsCosts;
          }

          // Individual Balance
          item.balance.discount = (item.balance.subtotal && item.balance.subtotal.discount ? item.balance.subtotal.discount : 0);
          item.balance.fee = ((item.balance.subtotal && item.balance.subtotal.fee ? item.balance.subtotal.fee.total : 0) + item.balance.fee);
          item.balance.totalCosts = (item.balance.servicesCosts + item.balance.productsCosts);
          item.balance.partialRevenue = item.balance.total;
          item.balance.finalRevenue = (item.balance.partialRevenue - (item.balance.servicesCosts + item.balance.productsCosts));

          // Period Balance
          objData[date].balance.discount += item.balance.discount;
          objData[date].balance.fee += item.balance.fee;
          objData[date].balance.totalCosts += item.balance.totalCosts;
          objData[date].balance.partialRevenue += item.balance.total;

          const record: any = {
            date: item.registerDate,
            code: item.code,
            operator: item.operator,
            customer: item.customer,
            services: item.services,
            products: item.products,
            balance: item.balance
          };

          objData[date].balance.finalRevenue = (objData[date].balance.partialRevenue - objData[date].balance.totalCosts);
          objData[date].records.push(record);
        }

        const result = this.treatServicesExternal(Object.values(objData), settings);

        if (callback) {
          callback(result);
        }

        resolve(result);
      });

      if (!callback) {
        collection.get().then(handler);
      } else {
        collection.onSnapshot(handler);
      }
    }));
  }

  public async getCurveABC(settings: { where: query['where'], orderBy: query['orderBy'], start?: number, limit?: number, data?: any }) {

    return (new Promise<any>((resolve) => {

      const collection = this.iToolsService.database().collection('ServiceOrders');
      collection.orderBy(settings.orderBy);
      collection.where(settings.where);

      collection.get().then((response) => {

        const objData = {};        

        for (const doc of response.docs) {

          const data = doc.data();
          data.code = Utilities.prefixCode(data.code);
          
          if (data.services && (data.services.length > 0)) {

            for (const service of data.services) {              

              const code = Utilities.prefixCode(service.code);

              if (!objData[code]) {

                objData[code] = {
                  code: code,                  
                  costPrice: [],
                  customPrice: [],
                  quantity: 0,
                  contributionMargin: 0
                };
              }

              const costPrice = service.customCostPrice != undefined ?  service.customCostPrice : service.costPrice; 

              objData[code].name = service.name;
              objData[code].costPrice.push(parseFloat(parseFloat(String(costPrice)).toFixed(2)));
              objData[code].customPrice.push(parseFloat(parseFloat(String(service.customPrice * 1)).toFixed(2)));

              objData[code].quantity += 1;
            }
          }
        }

        let revenue = 0;

        for (const [code, value] of Object.entries(objData)) {

          const item = (value as any);

          const totalCostPrice = (<Array<number>>item.costPrice).reduce((t, v) => t + v);
          const toatlCustomPrice = (<Array<number>>item.customPrice).reduce((t, v) => t + v);

          objData[code].averageCost = parseFloat(parseFloat(String(totalCostPrice / item.costPrice.length)).toFixed(2));
          objData[code].averagePrice = parseFloat(parseFloat(String(toatlCustomPrice / item.customPrice.length)).toFixed(2));
          objData[code].contributionMargin += parseFloat(parseFloat(String(toatlCustomPrice - totalCostPrice)).toFixed(2));

          delete objData[code].costPrice;
          delete objData[code].customPrice;

          revenue += objData[code].contributionMargin;
        }

        revenue = parseFloat(parseFloat(String(revenue)).toFixed(2));

        const arrData: any = Utilities.deepClone(Object.values(objData));

        arrData.sort((a, b) => {
          return ((a.contributionMargin < b.contributionMargin) ? -1 : ((a.contributionMargin > b.contributionMargin) ? 1 : 0));
        });        

        const r80 = parseFloat(parseFloat(String(revenue * 0.80)).toFixed(2));
        const r15 = parseFloat(parseFloat(String(revenue * 0.15)).toFixed(2));
        const r05  = parseFloat(parseFloat(String(revenue * 0.05)).toFixed(2));
        
        let c = 0;
        let curve = 'C';
        let sum = 0;

        for (const item of arrData) {
          
          if (arrData.length <= 3) {
            item.classification = (c == 0 ? 'C' : (c == 1 ? 'B' : 'A'));
          } else {

            sum += item.contributionMargin;

            if ((curve == 'C') && (sum <= r05)) {
              item.classification = 'C';
            } else if ((curve == 'C') && (sum > r05)) {
              curve = 'B';
            }

            if ((curve == 'B') && (sum <= r15)) {
              item.classification = 'B';
            } else if ((curve == 'B') && (sum > r15)) {
              curve = 'A';
            }

            if (curve == 'A') {
              item.classification = 'A';
            }            
          }

          c++;
        }

        arrData.sort((a, b) => {
          return ((a.contributionMargin < b.contributionMargin) ? 1 : ((a.contributionMargin > b.contributionMargin) ? -1 : 0));
        });

        resolve(arrData);
      });
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

  // Auxiliary Methods

  private treatResume(data: any, settings: any) {

    const result: any = {};

    const objBase: any = {
      date: '',
      records: {
        internal: [],
        external: [],
      },
      balance: {
        quantity: 0,
        servicesCosts: 0,
        productsCosts: 0,
        totalCosts: 0,
        partialRevenue: 0,
        finalRevenue: 0
      }
    };

    if (data.internal) {

      $$(Utilities.objectSorter(data.internal.records, { orderBy: 'code' })).map((_, item) => {

        if (!result[item.date]) {
          result[item.date] = Utilities.deepClone(objBase);
          result[item.date].date = item.date;          
        }
        
        result[item.date].records.internal = item.items;

        result[item.date].balance.quantity += item.quantity;
        result[item.date].balance.servicesCosts += item.servicesCosts;
        result[item.date].balance.productsCosts += item.productsCosts;
        result[item.date].balance.totalCosts += item.totalCosts;
        result[item.date].balance.partialRevenue += item.partialRevenue;
        result[item.date].balance.finalRevenue += item.finalRevenue;
      });
    }

    if (data.external) {

      $$(Utilities.objectSorter(data.external.records, { orderBy: 'code' })).map((_, item) => {
        
        if (!result[item.date]) {
          result[item.date] = Utilities.deepClone(objBase);
          result[item.date].date = item.date;          
        }

        result[item.date].records.external = item.items;
        
        result[item.date].balance.quantity += item.quantity;
        result[item.date].balance.servicesCosts += item.servicesCosts;
        result[item.date].balance.productsCosts += item.productsCosts;
        result[item.date].balance.totalCosts += item.totalCosts;
        result[item.date].balance.partialRevenue += item.partialRevenue;
        result[item.date].balance.finalRevenue += item.finalRevenue;
      });
    }

    const arrData: any = Object.values(result);    

    if (settings && settings.data && settings.data.type == 'resumeReportSynthetic') {

      let obj = {
        synthetic: {
          records: [],
          balance: {
            quantity: 0,
            servicesCosts: 0,
            productsCosts: 0,
            totalCosts: 0,
            partialRevenue: 0,
            finalRevenue: 0
          }
        },     
      };

      $$(arrData).map((_, item) => {

        obj.synthetic.balance.quantity += item.balance.quantity;
        obj.synthetic.balance.servicesCosts += item.balance.servicesCosts;
        obj.synthetic.balance.productsCosts += item.balance.productsCosts;
        obj.synthetic.balance.totalCosts += item.balance.totalCosts;
        obj.synthetic.balance.partialRevenue += item.balance.partialRevenue;
        obj.synthetic.balance.finalRevenue += item.balance.finalRevenue;

        obj.synthetic.records.push(item);
      });   

      obj.synthetic.records.sort((a, b) => {
        return ((a.date < b.date) ? 1 : ((a.date > b.date) ? -1 : 0));
      });

      return obj.synthetic;  
    } else {
      
      arrData.sort((a, b) => {
        return ((a.date < b.date) ? 1 : ((a.date > b.date) ? -1 : 0));
      });

      return arrData;
    }
  }

  private treatServicesInternal(data: any[], settings: any) {

    let obj = {
      synthetic: {
        records: [],
        balance: {
          quantity: 0,
          servicesCosts: 0,
          productsCosts: 0,
          totalCosts: 0,
          partialRevenue: 0,
          finalRevenue: 0
        }
      },
      analytical: {
        records: [],
        balance: { 
          servicesCosts: 0,
          productsCosts: 0,
          totalCosts: 0,
          partialRevenue: 0,
          finalRevenue: 0
        }
      }
    };    

    $$(data).map((_, item) => {

      if (settings.data.type == 'servicesInternalReportSynthetic') {
        
        const auxData: any = {
          date: item.date,
          quantity: (item.records).length,
          servicesCosts: (item.balance.servicesCosts || 0),
          productsCosts: (item.balance.productsCosts || 0),
          partialRevenue: item.balance.partialRevenue,
          items: item.records     
        };

        auxData.totalCosts = (auxData.servicesCosts + auxData.productsCosts);
        auxData.finalRevenue = (auxData.partialRevenue - auxData.totalCosts);

        obj.synthetic.balance.quantity += auxData.quantity;
        obj.synthetic.balance.servicesCosts += auxData.servicesCosts;
        obj.synthetic.balance.productsCosts += auxData.productsCosts;
        obj.synthetic.balance.totalCosts += auxData.totalCosts;
        obj.synthetic.balance.partialRevenue += auxData.partialRevenue;
        obj.synthetic.balance.finalRevenue += auxData.finalRevenue;

        obj.synthetic.records.push(auxData);
      }

      if (settings.data.type == 'servicesInternalReportAnalytical') {

        $$(item.records).map((_, item) => {

          obj.analytical.balance.servicesCosts += item.balance.servicesCosts;
          obj.analytical.balance.productsCosts += item.balance.productsCosts;
          obj.analytical.balance.totalCosts += item.balance.totalCosts;
          obj.analytical.balance.partialRevenue += item.balance.partialRevenue;
          obj.analytical.balance.finalRevenue += item.balance.finalRevenue;
   
          obj.analytical.records.push(item);
        });
      }
    });

    // Ordering and returning

    if (settings.data.type == 'servicesInternalReportSynthetic') {

      obj.synthetic.records.sort((a, b) => {
        return ((a.date < b.date) ? 1 : ((a.date > b.date) ? -1 : 0));
      });

      return obj.synthetic;
    }

    if (settings.data.type == 'servicesInternalReportAnalytical') {

      obj.analytical.records.sort((a, b) => {
        return ((a.registerDate < b.registerDate) ? 1 : ((a.registerDate > b.registerDate) ? -1 : 0));
      });

      return obj.analytical;
    }
  }

  private treatServicesExternal(data: any[], settings: any) {

    let obj = {
      synthetic: {
        records: [],
        balance: {
          quantity: 0,
          servicesCosts: 0,
          productsCosts: 0,
          totalCosts: 0,
          partialRevenue: 0,
          finalRevenue: 0
        }
      },
      analytical: {
        records: [],
        balance: { 
          servicesCosts: 0,
          productsCosts: 0,
          totalCosts: 0,
          partialRevenue: 0,
          finalRevenue: 0
        }
      }
    };    

    $$(data).map((_, item) => {

      if (settings.data.type == 'servicesExternalReportSynthetic') {
        
        const auxData: any = {
          date: item.date,
          quantity: (item.records).length,
          servicesCosts: (item.balance.servicesCosts || 0),
          productsCosts: (item.balance.productsCosts || 0),
          partialRevenue: item.balance.partialRevenue,
          items: item.records
        };

        auxData.totalCosts = (auxData.servicesCosts + auxData.productsCosts);
        auxData.finalRevenue = (auxData.partialRevenue - auxData.totalCosts);

        obj.synthetic.balance.quantity += auxData.quantity;
        obj.synthetic.balance.servicesCosts += auxData.servicesCosts;
        obj.synthetic.balance.productsCosts += auxData.productsCosts;
        obj.synthetic.balance.totalCosts += auxData.totalCosts;
        obj.synthetic.balance.partialRevenue += auxData.partialRevenue;
        obj.synthetic.balance.finalRevenue += auxData.finalRevenue;

        obj.synthetic.records.push(auxData);
      }

      if (settings.data.type == 'servicesExternalReportAnalytical') {

        $$(item.records).map((_, item) => {

          obj.analytical.balance.servicesCosts += item.balance.servicesCosts;
          obj.analytical.balance.productsCosts += item.balance.productsCosts;
          obj.analytical.balance.totalCosts += item.balance.totalCosts;
          obj.analytical.balance.partialRevenue += item.balance.partialRevenue;
          obj.analytical.balance.finalRevenue += item.balance.finalRevenue;

          obj.analytical.records.push(item);
        });
      }
    });

    // Ordering and returning

    if (settings.data.type == 'servicesExternalReportSynthetic') {

      obj.synthetic.records.sort((a, b) => {
        return ((a.date < b.date) ? 1 : ((a.date > b.date) ? -1 : 0));
      });

      return obj.synthetic;
    }

    if (settings.data.type == 'servicesExternalReportAnalytical') {

      obj.analytical.records.sort((a, b) => {
        return ((a.registerDate < b.registerDate) ? 1 : ((a.registerDate > b.registerDate) ? -1 : 0));
      });

      return obj.analytical;
    }
  }

}