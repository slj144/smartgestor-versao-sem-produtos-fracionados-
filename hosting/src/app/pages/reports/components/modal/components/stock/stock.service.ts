import { Injectable } from "@angular/core";

// Services
import { IToolsService } from '@shared/services/iTools.service';

// Interfaces
import { ICollection } from "@itools/interfaces/ICollection";

// Types
import { query } from '@shared/types/query';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';

@Injectable({ providedIn: 'root' })
export class StockReportsService {

  constructor(
    private iToolsService: IToolsService
  ) {}
  
  public async getProducts(settings: { where: query['where'], orderBy: query['orderBy'], start?: number, limit?: number, data?: any }) {

    return (new Promise<any>((resolve, reject) => {      

      const collection = this.iToolsService.database().collection('StockProducts');
      collection.orderBy(settings.orderBy);

      collection.where((() => {
        settings.where.push({ field: '_id', operator: '!=', value: '_blacklist' });
        return settings.where;
      })());

      this.batchDataSearch(collection, settings).then((result) => {

        const products = [];
    
        for (const item of result) {

          if (item.isDisabled) { continue }

          item.code = Utilities.prefixCode(item.code);

          if (item.category && item.category.code) {
            item.category.code = Utilities.prefixCode(item.category.code);
          }

          if (item.type && item.type.code) {
            item.type.code = Utilities.prefixCode(item.type.code);
          }

          if (item.provider && item.provider.code) {
            item.provider.code = Utilities.prefixCode(item.provider.code);
          }

          if (settings.data.storeID != 'matrix') {

            if (item.branches) {

              const branchData = (item.branches[settings.data.storeID] || {});
              
              item.quantity = (branchData.quantity || 0);
              item.costPrice = (branchData.costPrice || item.costPrice);
              item.salePrice = (branchData.salePrice || item.salePrice);
              item.alert = (branchData.alert || item.alert);
            } else {
              item.quantity = 0;
            }
          }
          
          item.totalCost = (item.quantity * item.costPrice);
          item.totalSale = (item.quantity * item.salePrice);
          item.contributionMargin = (item.totalSale - item.totalCost);

          products.push(Utilities.deepClone(item));
        }

        
        // const prods = [];
        // const batch = this.iToolsService.database().batch();

        // products.forEach((prod)=>{
        //   // prods.push(Utilities.deepClone(prod));

        //   let obj;

        //   // if(!prod.tribites?.icms){
        //     obj = {
        //       code: parseInt(prod.code),
        //       alert: 0
        //       // tributes: {
        //       //   icms: {
        //       //     origem: "0",
        //       //     cst: "102"
        //       //   },
        //       //   pis: {
        //       //     cst: "49"
        //       //   },
        //       //   cofins: {
        //       //     cst: "49"
        //       //   }
        //       // }
        //     }
        //   // }
            
        //   batch.update(this.iToolsService.database().collection("StockProducts").doc(prod._id), obj);
        //   prods.push(obj);
        // });

        // console.log(batch);

        // batch.commit().then((res)=>{
        //   console.log(res);
        // });

        // console.log(prods);

        resolve(products);
      }).catch((error) => {
        reject(error);
      });
    }));
  }

  public async getPurchases(settings: { where: query['where'], orderBy: query['orderBy'], start?: number, limit?: number, data?: any }) {

    return (new Promise<any>((resolve, reject) => {

      const collection = this.iToolsService.database().collection('StockPurchases');
      collection.orderBy(settings.orderBy);
      collection.where(settings.where);

      this.batchDataSearch(collection, settings).then((result) => {

        const purchases = [];

        for (const item of result) {

          item.code = Utilities.prefixCode(item.code);

          const obj = {
            totalCost: 0, totalSale: 0, purchaseAmount: 0
          };           
          
          for (const product of item.products) {
            obj.totalCost += (product.costPrice * product.quantity);
            obj.totalSale += (product.salePrice * product.quantity);
            obj.purchaseAmount += (product.costPrice * product.quantity);
          }

          item.totalCost = obj.totalCost;
          item.totalSale = obj.totalSale;
          item.purchaseAmount = obj.purchaseAmount;
          item.contributionMargin = (obj.totalSale - obj.totalCost);          
         
          purchases.push(item);
        }

        resolve(this.treatPurchases(purchases, settings));
      }).catch((error) => {
        reject(error);
      });
    }));
  }

  public async getTransfers(settings: { where: query['where'], orderBy: query['orderBy'], start?: number, limit?: number, data?: any }) {

    return (new Promise<any>((resolve, reject) => {

      const collection = this.iToolsService.database().collection('StockTransfers');
      collection.orderBy(settings.orderBy);
      collection.where(settings.where);

      this.batchDataSearch(collection, settings).then((result) => {

        const transfers = [];

        for (const item of result) {

          item.code = Utilities.prefixCode(item.code);

          const obj = {
            totalCost: 0, totalSale: 0, transferAmount: 0
          };           
          
          for (const product of item.products) {
            obj.totalCost += (product.costPrice * product.quantity);
            obj.totalSale += (product.salePrice * product.quantity);
            obj.transferAmount += (product.costPrice * product.quantity);
          }

          item.totalCost = obj.totalCost;
          item.totalSale = obj.totalSale;
          item.transferAmount = obj.transferAmount;
         
          transfers.push(item);
        }

        resolve(this.treatTransfers(transfers, settings));
      }).catch((error) => {
        reject(error);
      });
    }));
  }

  public async getStockLogs(settings: { where: query['where'], orderBy: query['orderBy'], start?: number, limit?: number, data?: any }) {

    return (new Promise<any>((resolve, reject) => {

      const collection = this.iToolsService.database().collection('StockLogs');
      collection.orderBy(settings.orderBy);
      collection.where(settings.where);

      this.batchDataSearch(collection, settings).then((result) => {

        const logs = [];

        for (const item of result) {

          if (item.data) {

            item.code = Utilities.prefixCode(item.code);
            item.action = item.action;
  
            if (item.data) {
  
              for (const info of item.data) {
  
                item.referenceCode = Utilities.prefixCode(info.referenceCode);
                item.quantity = info.quantity;
                item.operation = info.operation;
                item.note = info.note;
  
                logs.push(Utilities.deepClone(item));
              }
            }
          }        
        }

        logs.sort((a, b) => a.registerDate > b.registerDate ? 1 : a.registerDate < b.registerDate ? -1 : 0);

        resolve(logs);
      }).catch((error) => {
        reject(error);
      });
    }));
  }

  public async getCurveABC(settings: { where: query['where'], orderBy: query['orderBy'], data?: any }) {

    return (new Promise<any>((resolve, reject) => {

      const collection = this.iToolsService.database().collection('CashierSales');
      collection.orderBy(settings.orderBy);
      collection.where(settings.where);

      this.batchDataSearch(collection, settings).then((result) => {

        const objData = {};

        for (const item of result) {

          item.code = Utilities.prefixCode(item.code);

          const uninvoiced = this.hasUninvoicedPaymentMethods(item);

          if (!uninvoiced.status || uninvoiced.status && uninvoiced.value > 0){
            if (item.products && (item.products.length > 0)) {

              for (const product of item.products) {              
  
                const code = Utilities.prefixCode(product.code);
  
                if (!objData[code]) {
  
                  objData[code] = {
                    code: code,                  
                    costPrice: [],
                    salePrice: [],
                    quantity: 0,
                    contributionMargin: 0
                  };
                }
  
                objData[code].name = product.name;
                objData[code].costPrice.push(parseFloat(parseFloat(String(product.costPrice * product.quantity)).toFixed(2)));
                objData[code].salePrice.push(parseFloat(parseFloat(String(product.unitaryPrice * product.quantity)).toFixed(2)));
  
                objData[code].quantity += product.quantity;
              }
            }
          }
         
        }

        let revenues = 0;

        for (const [code, value] of Object.entries(objData)) {

          const item = (value as any);

          const totalCostPrice = (<Array<number>>item.costPrice).reduce((t, v) => t + v);
          const toalSalePrice = (<Array<number>>item.salePrice).reduce((t, v) => t + v);

          objData[code].averageCost = parseFloat(parseFloat(String(totalCostPrice / item.costPrice.length)).toFixed(2));
          objData[code].averagePrice = parseFloat(parseFloat(String(toalSalePrice / item.salePrice.length)).toFixed(2));
          objData[code].contributionMargin += parseFloat(parseFloat(String(toalSalePrice - totalCostPrice)).toFixed(2));

          delete objData[code].costPrice;
          delete objData[code].salePrice;

          revenues += objData[code].contributionMargin;
        }

        revenues = parseFloat(parseFloat(String(revenues)).toFixed(2));

        const data: any = Utilities.deepClone(Object.values(objData));

        data.sort((a, b) => {
          return ((a.contributionMargin < b.contributionMargin) ? -1 : ((a.contributionMargin > b.contributionMargin) ? 1 : 0));
        });        

        const r80 = parseFloat(parseFloat(String(revenues * 0.80)).toFixed(2));
        const r15 = parseFloat(parseFloat(String(revenues * 0.15)).toFixed(2));
        const r05  = parseFloat(parseFloat(String(revenues * 0.05)).toFixed(2));
        
        let c = 0;
        let curve = 'C';
        let sum = 0;

        for (const item of data) {
          
          if (data.length <= 3) {            
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

        data.sort((a, b) => {
          return ((a.contributionMargin < b.contributionMargin) ? 1 : ((a.contributionMargin > b.contributionMargin) ? -1 : 0));
        });

        resolve(data);
      }).catch((error) => {
        reject(error);
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

  private hasUninvoicedPaymentMethods(item: any){
    let uninvoiced = false;
    let amount = 0;
    item.paymentMethods.forEach((method)=>{
      if (method.uninvoiced){
        uninvoiced = true;
      }else{
        amount += method.value;
      }
    });

    return {status: uninvoiced, value: amount};
  }

  // Utility Methods

  private treatPurchases(data: any[], settings: any) {

    let arrData = (!settings ? data : []);
    let auxData = {};

    if (settings) {

      for (const item of data) {

        if (settings.data.type == 'completedPurchases') {
          if (item.purchaseStatus == 'CONCLUDED') {
            arrData.push(item);
          }            
        }

        if (settings.data.type == 'pendingPurchases') {
          if (item.purchaseStatus == 'PENDENT') {
            arrData.push(item);
          }            
        }

        if (settings.data.type == 'purchasedProducts') {

          if (item.purchaseStatus == 'CONCLUDED') {

            $$(item.products).map((_, record) => {

              if (!auxData[record.code]) {

                auxData[record.code] = {
                  purchaseCode: item.code,
                  provider: item.provider,
                  productCode: record.code,                  
                  name: record.name,                  
                  category: record.category,
                  costPrice: record.costPrice,
                  salePrice: record.salePrice,
                  quantity: 0, totalCost: 0,
                  totalSale: 0, contributionMargin: 0,
                  registerDate: item.registerDate
                };
              }
              
              auxData[record.code].quantity += record.quantity;              
              auxData[record.code].totalCost += (record.quantity * record.costPrice);
              auxData[record.code].totalSale += (record.quantity * record.salePrice);
              auxData[record.code].contributionMargin += (auxData[record.code].totalSale - auxData[record.code].totalCost);
            });
          }
        }
      }
    }

    if (settings && settings.data.type == 'purchasedProducts') {
      arrData = Object.values(auxData);      
    }
    
    arrData.sort((a, b) => {
      return ((a.code < b.code) ? -1 : ((a.code > b.code) ? 1 : 0));
    });
    
    return arrData;
  }

  private treatTransfers(data: any[], settings: any) {

    let arrData = (!settings ? data : []);
    let auxData = {};

    if (settings) {

      for (const item of data) {

        if (settings.data.type == 'completedTransfers') {
          if (item.transferStatus == 'CONCLUDED') {
            arrData.push(item);
          }            
        }

        if (settings.data.type == 'pendingTransfers') {
          if (item.transferStatus == 'PENDENT') {
            arrData.push(item);
          }            
        }

        if (settings.data.type == 'transferedProducts') {

          if (item.transferStatus == 'CONCLUDED') {

            $$(item.products).map((_, record) => {

              if (!auxData[record.code]) {

                auxData[record.code] = {
                  transferCode: item.code,
                  origin: item.origin,
                  destination: item.destination,
                  productCode: record.code,
                  name: record.name,
                  category: record.category,
                  costPrice: record.costPrice,
                  salePrice: record.salePrice,
                  quantity: 0, totalCost: 0,
                  totalSale: 0,
                  registerDate: item.registerDate
                };
              }
              
              auxData[record.code].quantity += record.quantity;              
              auxData[record.code].totalCost += (record.quantity * record.costPrice);
              auxData[record.code].totalSale += (record.quantity * record.salePrice);

              console.log(auxData);
            });
          }
        }
      }
    }

    if (settings && settings.data.type == 'transferedProducts') {
      arrData = Object.values(auxData);      
    }
    
    arrData.sort((a, b) => {
      return ((a.code < b.code) ? -1 : ((a.code > b.code) ? 1 : 0));
    });
    
    return arrData;
  }

}