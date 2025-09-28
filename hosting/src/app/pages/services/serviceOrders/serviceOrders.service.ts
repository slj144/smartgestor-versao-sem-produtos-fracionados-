import { Injectable } from "@angular/core";
import { EventEmitter } from 'events';
import { iTools } from "@itools/index";

// Services
import { IToolsService } from '@shared/services/iTools.service';
import { ServicesService } from "@pages/registers/services/services.service";
import { ProductsService } from '@pages/stock/products/products.service';
import { CashierFrontPDVService } from '@pages/cashier/cashier-front/components/cashier-pdv/cashier-pdv.service';
import { NotificationService } from '@shared/services/notification.service';
import { SystemLogsService } from '@shared/services/system-logs.service';

// Translate
import { ServiceOrdersTranslate } from "./serviceOrders.translate";

// Interfaces
import { IPermissions } from "@shared/interfaces/_auxiliaries/IPermissions";
import { IBatch } from "@itools/interfaces/IBatch";
import { ICollection } from "@itools/interfaces/ICollection";
import { IStockProduct } from '@shared/interfaces/IStockProduct';
import { IServiceOrder, CServiceScheme, EServiceOrderStatus, EServiceOrderPaymentStatus } from '@shared/interfaces/IServiceOrder';

import { ECashierSaleOrigin, ECashierSaleStatus, ICashierSale } from '@shared/interfaces/ICashierSale';
import { ESystemLogAction, ESystemLogType } from '@shared/interfaces/ISystemLog';
import { EStockLogAction } from '@shared/interfaces/IStockLog';
import { ENotificationStatus } from '@shared/interfaces/ISystemNotification';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { DateTime } from '@shared/utilities/dateTime';
import { Dispatch } from "@shared/utilities/dispatch";

// Types
import { query } from '@shared/types/query';

@Injectable({ providedIn: 'root' })
export class ServiceOrdersService {

  public translate = ServiceOrdersTranslate.get();
  
  private data: { [_id: string]: IServiceOrder } = {};

  private settingsData: any = {};
  private servicesTypes: any = [];

  private _checkRequest: boolean = false;
  private _checkProcess: boolean = false;
  private _dataMonitors: EventEmitter = new EventEmitter();

  private _checkSettingsData: boolean = false;
  
  private firstScrolling = false;
  private settings: any = { start: 0, limit: 60, count: 0, snapshotRef: null };

  private permissions: any;

  constructor(
    private notificationService: NotificationService,
    private systemLogsService: SystemLogsService,
    private iToolsService: IToolsService,
    private servicesTypesService: ServicesService,
    private productsService: ProductsService,
    private cashierFrontPDVService: CashierFrontPDVService
  ) {
    this.permissionsSettings();
    this.query([], true, false, false, true, 0, {filterDataPerOperator: this.permissions.filterDataPerOperator});
  }

  // Getter and Setter Methods

  public get limit() {
    return this.settings.limit;
  }

  // Query Methods

  public query(where?: query['where'], reset: boolean = true, flex: boolean = false, scrolling: boolean = false, strict: boolean = true, limit: number = 0, others?: {filterDataPerOperator?: boolean}) {

    return (new Promise<IServiceOrder[]>((resolve) => {

      const queryObject: query = {
        start: (this.settings.start * this.settings.limit),
        limit: limit > 0 ? limit : this.settings.limit 
      };

      where = where || [];

      if (!Utilities.isAdmin && others && others.filterDataPerOperator){
        where.push({field: "operator.username", operator: "=", value: Utilities.operator.username});
      }

      if (where) {

       if (strict && !scrolling) {
          this.data = {};
          this.settings.start = 0;
          queryObject.start = 0
        }else if (!scrolling){
          queryObject.start = 0;
        }

        if (!flex) {
          queryObject.where = where;
        } else {
          queryObject.or = where;
        }
        
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
        if (!reset) { this.settings.start++; }
        resolve(data);
      });
    }));
  } 

  // CRUD Methods - Service Orders

  public getServices(listenerId: string, listener: (_: any)=> void) {

    const emitterId = 'records';

    Utilities.onEmitterListener(this._dataMonitors, emitterId, listenerId, listener);

    if (this._checkRequest) {
      this._dataMonitors.emit(emitterId, this.treatData(emitterId));
    }
  }  

  public deleteService(data: IServiceOrder, callback: ((_: boolean)=>void)) {
    this.allocProducts([], data.products, (_, updatedProducts)=>{

      const batch = this.iToolsService.database().batch();

      batch.delete(this.collRef().doc(data._id));

      this.productsService.registerProducts(updatedProducts, batch, {action: EStockLogAction.SERVICE, originReferenceCode: data.code}).then((status)=>{

        this.systemLogs([{
          type: ESystemLogType.ServiceOrders,
          note: ServiceOrdersTranslate.get().systemLog["delete"],
          action: ESystemLogAction.DELETION,
          referenceCode: data.code,
        }], batch);

        batch.commit().then(()=>{ 

          this.notifications("delete", "success");
          callback(true); 
        }).catch(()=>{ 

          this.notifications("delete", "error");
          callback(false);
        });
      }).catch(()=>{

        this.notifications("delete", "error");
        callback(false);
      });
    });
  }

  
  private async checkProducts(data: IServiceOrder, source: IServiceOrder, operation: ('register'|'update'|'cancel'), batch: IBatch, batchRef?: any) {
    return (new Promise<any>(async (resolve, reject) => {

      const arrProducts: any = [];

      const componseObject = ((code: string, quantity: number) => {

        const obj: any = { code: code };

        if (Utilities.isMatrix) {
          obj.quantity = iTools.FieldValue.inc(quantity);
        } else {

          obj.branches = {};
          obj.branches[Utilities.storeID] = { 
            quantity: iTools.FieldValue.inc(quantity)
          };
        }

        return obj;
      });

      if (!source || operation == 'register') {

        $$(data.products).map((_, item) => {

          let quantity: number = item.quantity;

          if (operation == 'register') {
            quantity = (quantity * -1);
          }       

          arrProducts.push(componseObject(item.code, quantity));
        });
      } else {
        
        const updateData = Utilities.parseArrayToObject(data.products, 'code');
        const sourceData = Utilities.parseArrayToObject(source.products, 'code');

        $$(updateData).map((_, item) => {          

          const data = sourceData[item.code];

          if (data) {

            if (item.quantity != data.quantity) {
              arrProducts.push(componseObject(item.code, (data.quantity - item.quantity)));
            }

            delete sourceData[item.code];
          } else {
            arrProducts.push(componseObject(item.code, (item.quantity * -1)));
          }
        });

        if (Object.values(sourceData).length > 0) {
          $$(sourceData).map((_, item) => {
            arrProducts.push(componseObject(item.code, item.quantity));
          });
        }
      }



      // Filtra Produtos Excluidos do estoque

      const query = (()=>{
        return arrProducts.map((item)=>{
          return {field: "code", operator: "=", value: parseInt(item.code)}
        })
      })();

      await this.productsService.query(query, false, true, false, false).then((searchedProducts)=>{

        arrProducts.forEach((localProduct, index)=>{
          let find = false;
          searchedProducts.forEach((remoteProduct)=>{
            if(parseInt(localProduct.code) == parseInt(remoteProduct.code.toString())){
              find = true;
            }
          });

          if(!find){
            arrProducts.splice(index, 1);
          }
        })
      });

      if (arrProducts.length > 0) {

        const referenceCode: any = (operation == 'register' ? iTools.FieldValue.bindBatchData(batchRef, 'code') : parseInt(<string>data.code));

        this.productsService.registerProducts(arrProducts, batch, {action: EStockLogAction.SERVICE, originReferenceCode: referenceCode})
          .then((response) => { resolve(response) }).catch((error) => { reject(error) });
      } else {
        resolve(null);
      }
    }));
  }

  public async registerService(
    options: {data: IServiceOrder | any, isAllocProducts?: boolean, isCancel?: boolean, isDelete?: boolean}, 
    batch: IBatch = null
  ) {
    return new Promise<any>(async(resolve, reject)=>{
      options.data = options.data;
      options.isAllocProducts = options.isAllocProducts != undefined ? options.isAllocProducts : false;
      options.isCancel = options.isCancel != undefined ? options.isCancel : false;
  
      let source;
      let data = options.data;

      const action: "add" | "update" = !data.code ? "add" : "update";
      options.isAllocProducts = action == "add" ? false : options.isAllocProducts;
      const isCancel = !!(options.isCancel);
      const isAllocProducts = !!(options.data.isAllocProducts ? options.data.isAllocProducts : options.isAllocProducts);
      let currentScheme = data.scheme;
      data.code = action == "update" ? parseInt(data.code.toString()) : null;

      const where = [];

      if (isCancel){
        data.serviceStatus = "CANCELED";

        if (!data._id && !data.code){

          reject({message: "_id and code is undefied."});
          return;
        }
      }

      for (const product of data.products ? data.products : []) {

        product.code = parseInt(product.code.toString());
        product.quantity = parseInt((product.quantity || 0).toString());
      }

      if (action == "update"){ 

        source = (await this.query([
          {field: data._id ? "_id" : "code", operator: "=", value: data._id ? data._id : data.code},
          {field: "owner", operator: "=", value: Utilities.storeID}
        ], false, false, false, false))[0];

        if (!source){

          reject({message: "Source data is undefined."});
          Utilities.loading(false);
          return;
        }
      }else{ 

        currentScheme = await this.getScheme().catch((error)=>{
          reject(error);
          this.notifications(action, "error");
          Utilities.loading(false);
        });

        if (!currentScheme){

          Utilities.loading(false);
          this.notifications(action, "error");
          return;
        }
      }

      if (data.code) {
        if (data._id){
          where.push({field: "_id", operator: "=", value: data._id});
        }else{
          where.push({field: "code", operator: "=", value: data.code});
        }

        where.push({field: "owner", operator: "=", value: Utilities.storeID});
      }

      this.checkData(data, action, currentScheme);

      if (!data.code){
  
        reject({message: "Code is undefined." });
        Utilities.loading(false);
        return;
      }      
  
      if (isAllocProducts){

        const isExternalBatch = !!batch;
        batch = batch ? batch : this.iToolsService.database().batch();
        
        data.products = data.serviceStatus == EServiceOrderStatus.CANCELED ? [] : data.products;
        const batchItemId = batch.update({ collName: "ServiceOrders", where: where }, data);

        this.checkProducts(data, source, isCancel ? "cancel" :(!source.isAllocProducts) ? "register" : "update", batch, batchItemId).then((res)=>{

          data.isAllocProducts = true;
         
          if (isCancel && options.isDelete){
            batch.delete({ collName: "ServiceOrders", where: where });
          }

          this.systemLogs([{
            referenceCode: action == "add" ? iTools.FieldValue.bindBatchData(batchItemId, "code") : data.code,
            type: ESystemLogType.ServiceOrders,
            note: action == "add" ? ServiceOrdersTranslate.get().systemLog["register"] :  ServiceOrdersTranslate.get().systemLog["update"],
            action: action == "add" ? ESystemLogAction.REGISTER : ESystemLogAction.UPDATE
          }], batch);
       
          if (isExternalBatch){
  
            resolve({ batchItemId });
          }else{
            batch.commit().then(()=>{ 
              
              this.notifications(action, "success");
              resolve(null);
            }).catch((error)=>{ 
              
              this.notifications(action, "error");
              reject(error);
            });
          }
        });
      }else{
  
        if (!isAllocProducts){
          if (action == "add"){
            data.isAllocProducts = false;
          }
        }
  
        const isExternalBatch = !!batch;
        batch = batch ? batch : this.iToolsService.database().batch();
        const batchItemId = batch.update({ collName: 'ServiceOrders', where: where }, data);

        if (isCancel && options.isDelete){

          batch.delete({ collName: "ServiceOrders", where: where });
        }

        if (isExternalBatch){  
  
          resolve({ batchItemId });
        }else{

          this.systemLogs([{
            type: ESystemLogType.ServiceOrders,
            note: action == "add" ? ServiceOrdersTranslate.get().systemLog["register"] :  ServiceOrdersTranslate.get().systemLog["update"],
            action: action == "add" ? ESystemLogAction.REGISTER : ESystemLogAction.UPDATE,
            referenceCode: action == "add" ? iTools.FieldValue.bindBatchData(batchItemId, "code") : data.code,
          }], batch);

          batch.commit().then(()=>{
            
            this.notifications(action, "success");
            resolve(null);
          }).catch((error)=>{
            console.log(error);
            this.notifications(action, "error");
            reject();
          });
        }
      }
    });
  }

  public async updateStatus(data: any, isAllocProducts: boolean, updatedData: any){
    return new Promise<void>((resolve, reject)=>{

      const batch = this.iToolsService.database().batch();

      Utilities.loading(true);

      if (data.saleCode){
        reject({message: "Sale already registered."});
        Utilities.loading(false);
        return;
      }

      this.registerService({
        data: data,
        isAllocProducts: isAllocProducts,
        isCancel: false
      }, batch).then(async(response) => {

        const batchItemId = response.batchItemId;  
  
        // Register Sale if service has concluded

        const indexConcluded = data.scheme.data.status.length - 1;
        const currentStatusIndex = data.scheme.data.status.indexOf(data.scheme.status);
        
        if (currentStatusIndex == indexConcluded) {       
          
          const source = (await this.query([
            {field: data._id ? "_id" : "code", operator: "=", value: data._id ? data._id : data.code},
            {field: "owner", operator: "=", value: Utilities.storeID}
          ], false, false, false, false))[0];
  
          if (!source){
  
            reject({message: "Source data is undefined."});
            Utilities.loading(false);
            return;
          }

          if (source.saleCode){
            reject({message: "Sale already registered."});
            Utilities.loading(false);
            return;
          }
          
          const sale: ICashierSale = {
            code: null,
            service: <any>{
              _id: data._id,
              code: data.code,
              types: data.services
            },
            services: data.services, // ← ADICIONADO: serviços diretamente na sale para relatórios
            customer: data.customer,
            products: (()=>{
              return data.products.map((item)=>{
                item.code = Utilities.prefixCode(parseInt(item.code.toString()));
                return item;
              })
            })(),
            paymentMethods: (<any>[]),
            balance: data.balance,
            status: ECashierSaleStatus.PENDENT,
            origin: ECashierSaleOrigin.SERVICE_ORDER,
            operator: Utilities.operator,
            owner: Utilities.storeID,
            registerDate: iTools.FieldValue.date(Utilities.timezone)
          };

          this.cashierFrontPDVService.registerSale(sale, null, false, batch).then((response)=>{
  
            batch.getOperations()[batchItemId].data.saleCode = iTools.FieldValue.bindBatchData(response.batchRef, 'code');

            batch.commit().then(()=>{
  
              Utilities.loading(false);
              this.notifications("update", "success");

              resolve();
            }).catch((error)=>{
  
              console.error(error.message);
              Utilities.loading(false);
              this.notifications("update", "error");

              reject();
            });
          }).catch((error) => {

            Utilities.loading(false);
            this.notifications("update", "error");

            reject(error);
          });
        } else {
  
          // Send all Changes

          batch.commit().then(() => {
  
            Utilities.loading(false);
            this.notifications("update", "success");
            resolve();
          }).catch((error) => {

            console.error(error.message);
            Utilities.loading(false);
            this.notifications("update", "error");
            reject();
         });
        }
      }).catch((error)=>{

        console.error(error.message);
        this.notifications("update", "error");
        reject();
      });
    });
  }

  public async cancelService(data: any){

    Utilities.loading(true);
    return this.registerService({data: data, isCancel: true, isAllocProducts: true})
  }

  // CRUD Methods - Schemec

  public async getScheme() {
    return new Promise<any>((resolve, reject)=>{
      const timer = setInterval(()=>{
        if (this._checkSettingsData) {
          
          clearInterval(timer);

          if (this.settingsData) {
  
            const scheme = CServiceScheme[this.settingsData.scheme || "technicalAssistance"];

            if (!scheme) {
              reject({message: "scheme is undefined."});
            } else {
              resolve(Utilities.deepClone(scheme));
            }
          } else {  
            reject({message: "scheme is undefined."});
          }
        }
      });
    });
  }

  // Count Methods

  public getServicesCount(listenerId: string, listener: ((_: any)=>void)) {
  
    const emitterId = 'count';

    Utilities.onEmitterListener(this._dataMonitors, emitterId, listenerId, listener);

    if (this._dataMonitors) {
      this._dataMonitors.emit(emitterId, this.treatData(emitterId));
    }
  }

  // Auxiliary Methods - Products

  private allocProducts(products: Array<any>, sourceProducts: Array<any>,  callback: (serviceProducts: Array<any>, updateProducts: Array<any>)=> void){

    products = products ? products : [];
    sourceProducts = sourceProducts ? sourceProducts : [];
    const oldProductsCode = [];
    const newProductsCode = [];
    let removedProductsCode = [];
    const productsQuery = [];

    if (sourceProducts.length > 0){

      let allProductsIds = [];
      sourceProducts = Utilities.deepClone(sourceProducts);
      sourceProducts.forEach((product)=>{
         oldProductsCode.push(product.code); 
         if (allProductsIds.indexOf(product._id) == -1){ allProductsIds.push(product._id); }
      });

      products.forEach((product)=>{ 
        newProductsCode.push(product.code); 
        if (allProductsIds.indexOf(product._id) == -1){ allProductsIds.push(product._id); }
      });

      if (newProductsCode.length === 0){
  
        removedProductsCode = oldProductsCode;
      }else{
        oldProductsCode.forEach(productId=>{
          const index = newProductsCode.indexOf(productId);
          if (index === -1){ removedProductsCode.push(productId); }
        });
      }

      allProductsIds.forEach((id)=>{
        productsQuery.push({
          field: "_id",
          operator: "=",
          value: id,
        });
      });
      allProductsIds = [];
    }else{
     
      products.forEach((product)=>{
        productsQuery.push({
          field: "_id",
          operator: "=",
          value: product._id,
        });
      });
    }


    const finalServiceProductsData = [];
    const finalProductsData = [];

    const getProduct = (products: Array<any> = null, code)=>{
      let p: IStockProduct;
      if (products){products.forEach((product)=>{ if (parseInt(product.code) === parseInt(code)){ p = product; }});}
      return p;
    };


    console.log(products);

    const exec = (serverProducts: any[] = [])=>{

      const alloc = (product: IStockProduct, type: "auto" | "realloc")=>{
        const newProduct = getProduct(products, product.code);
        const oldp = getProduct(sourceProducts, product.code);

        // console.log(newProduct)

        if (newProduct){
          const oldItemsQty: any = oldp ? oldp["quantity"] : 0;
          const updatedItemsQty: any = newProduct["quantity"] ? newProduct["quantity"] : 0;

          if (type == "auto") {


            // console.log(oldItemsQty, updatedItemsQty)

            // let itemsToAlloc = updatedItemsQty - oldItemsQty >= 0 ? updatedItemsQty - oldItemsQty : oldItemsQty - updatedItemsQty;
            // itemsToAlloc = itemsToAlloc >= 0 ? itemsToAlloc : 0;

            // if (itemsToAlloc > 0){
            //   finalProductsData.push({ _id: product._id, code: product.code, quantity: iTools.FieldValue.inc(-itemsToAlloc)});
            // }
          } else {

            finalProductsData.push({ _id: product._id, code: product.code, quantity: iTools.FieldValue.inc(oldItemsQty)});
          }

          product.quantity = newProduct.quantity;
          if (Number(product["quantity"]) > 0){ finalServiceProductsData.push(product); }          
        } else {
          if (oldp) {
            
            product["quantity"] = oldp["quantity"];
            finalServiceProductsData.push(product);
          }
        }
      };

      products.forEach((product: IStockProduct) => { alloc(product, "auto"); });
      removedProductsCode.forEach((productCode: String) => { alloc(getProduct(sourceProducts, productCode), "realloc"); });
      callback(finalServiceProductsData, finalProductsData);
    };

    if (productsQuery.length){
      this.productsService.query(productsQuery, false, false, false, false).then((serverProducts) => {

        exec(serverProducts);
      });
    }else{

      exec();
    }

  }

  // Utlity Methods
  
  public getServiceTypesBy(services: any[], getData: "value" | "name" | "other" | "costPrice" | string, type: string = "string"): any{

    getData = getData.toLowerCase();
    const servicesTypes: any[] = [];
    let valuesStr: number = 0;
    let namesStr: String = "";
    let namesArr: string[] = [];
    let valuesArr: string[] = [];
    let costPrice: number[] = [];

    if (this.servicesTypes){
      this.servicesTypes.forEach((data)=> {
        services.forEach((service)=>{
          if (service.code == data.code){
            valuesStr += data.executionPrice;
            valuesArr.push(data.executionPrice);
            namesStr += ", "+ data.name;
            namesArr.push(data.name);
            costPrice.push(data.costPrice);
            servicesTypes.push(data);
          }
        });
      });
    }

    if (getData == "value"){
      if (type == "string"){

        return valuesStr;
      }else{

        return valuesArr;
      }
    }else if (getData == "name"){
      if (namesStr.length > 1 && type == "string"){

        namesStr = namesStr.substring(1);
        return namesStr;
      }else{

        return namesArr;
      }
    }else if (getData == "costprice"){

      return costPrice;
    }else{

      return servicesTypes;
    }
  }

  private collRef(settings?: query, filterPendents: boolean = false): ICollection {

    const collection = this.iToolsService.database().collection('ServiceOrders');
    collection.where(filterPendents ? [{field: "owner", operator: "=", value: Utilities.storeID}, {field: "serviceStatus", operator: "=", value: "PENDENT"}] : [{field: "owner", operator: "=", value: Utilities.storeID}]);

    settings = (settings || {});

    if (settings.orderBy) {
      settings.orderBy.serviceStatus = -1;
      settings.orderBy.code = -1;
    } else {
      settings.orderBy = { serviceStatus: -1, code: -1 };      
    }
    
    collection.orderBy(settings.orderBy);

    if (settings.where) {
      collection.where(settings.where);
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

  private systemLogs(data: any[], batch: IBatch) {

    this.systemLogsService.registerLogs({
      data: data,
      registerDate: DateTime.getDate("DH"),
      owner: Utilities.storeID,
      operator: Utilities.operator,
    }, batch);
  }

  // Data processing

  public removeListeners(emitterId: ("records" | "count") , listernId: string | string[] = "") {
    Utilities.offEmitterListener(this._dataMonitors, emitterId, listernId);
  }

  public reset(){
    // this.settings.start = 0;
    // this.settings.count = 0;
    // this.data = {};
  }

  private requestData(settings: any = {}, strict: boolean) {

    return new Promise<any | void>((resolve, reject)=>{

      if (!this.settings.snapshotRef){

        this.iToolsService.database().collection('Settings').doc("serviceOrders").onSnapshot((doc) => {
        
          this.settingsData = doc.data();
          this._checkSettingsData = true;
    
        },null, true);
  
        this.servicesTypesService.getServices("servicesOrdersService",(servicesTypes)=>{
          this.servicesTypes = servicesTypes;
        });
      }
  
      if (strict) {

        if (!this._checkProcess) {

          this._checkProcess = true;

          if (this.settings.snapshotRef) {
            this.collRef(settings).clearSnapshot(this.settings.snapshotRef);
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

            resolve(this.treatData('records', Object.values(this.data)));
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
    });
  }

  private treatData(id: string, data?: IServiceOrder[]) {

    if (id == 'count') {

      const result: any = { 
        current: $$(data || this.data).length, total: this.settings.count
      };

      return result;
    }

    if (id == 'records') {

      let records = [];

      $$(Utilities.deepClone(data || this.data)).map((_: any, item: any) => {

        item.code = Utilities.prefixCode(item.code);

        if (item.saleCode) {
          item.saleCode = Utilities.prefixCode(item.saleCode);
        }

        records.push(item);
      });

      JSON.stringify(records);

      records.sort((a, b) => {
        return ((a.serviceStatus <= b.serviceStatus && a.code < b.code) ? 1 : ((a.serviceStatus >= b.serviceStatus && a.code > b.code) ? -1 : 0));
      });

      return records;
    }
  }

  private checkData(data: IServiceOrder, action: string, scheme: any){

    if (action == "add"){

      data.deliveryDate = data.deliveryDate ? data.deliveryDate : '';
      data.entryDate = data.entryDate ? data.entryDate : '';
      data.owner = Utilities.storeID;
      data.registerDate = iTools.FieldValue.date(Utilities.timezone),
      data.operator = Utilities.operator,
      data.paymentStatus = EServiceOrderPaymentStatus.PENDENT,
      data.scheme = scheme;
      data.hasChecklist = (!!data.hasChecklist);
      data.serviceStatus = EServiceOrderStatus.PENDENT;
      data.isAllocProducts = false;
      data.code = iTools.FieldValue.control("SystemControls", Utilities.storeID, "ServiceOrders.code");
    }
    
    data.modifiedDate = iTools.FieldValue.date(Utilities.timezone);

    return data;
  }

  private permissionsSettings() {

    const setupPermissions = () => {

      if (!Utilities.currentLoginData && Object.values(Utilities.currentLoginData).length == 0){ return; }

      if (Utilities.isAdmin) {
        this.permissions = {
          add: true,
          edit: true,
          delete: true,
          cancel: true,
          filterDataPerOperator: true,
        };
      } else {

        const permissions = Utilities.permissions("serviceOrders") as IPermissions["serviceOrders"];

        if (permissions){

          permissions.actions = permissions.actions || [];

          this.permissions = {
            filterDataPerOperator:(permissions.actions.indexOf('filterDataPerOperator') !== -1),
            add: permissions.actions.indexOf("add") !== -1,
            edit: permissions.actions.indexOf("edit") !== -1,
            delete: permissions.actions.indexOf("delete") !== -1,
            cancel: permissions.actions.indexOf("cancel") !== -1
          };
        }
      }
    };

    Dispatch.onRefreshCurrentUserPermissions("ServiceOrdersComponent", ()=>{
      setupPermissions();
    });

    setupPermissions();
  }

}