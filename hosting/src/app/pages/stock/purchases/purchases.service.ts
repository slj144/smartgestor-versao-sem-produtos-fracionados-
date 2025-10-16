import { Injectable } from "@angular/core";
import { EventEmitter } from 'events';
import { iTools } from "@itools/index";

// Services
import { IToolsService } from '@shared/services/iTools.service';
import { StorageService } from "@shared/services/storage.service";
import { ProductsService } from '../products/products.service';
import { BillsToPayService } from '../../financial/bills-to-pay/bills-to-pay.service';
import { SystemLogsService } from '@shared/services/system-logs.service';
import { NotificationService } from '@shared/services/notification.service';

// Translate
import { PurchasesTranslate } from "./purchases.translate";

// Interfaces
import { IBatch } from '@itools/interfaces/IBatch';
import { ICollection } from '@itools/interfaces/ICollection';
import { IStockPurchase, EStockPurchaseStatus, EStockPurchasePaymentStatus } from '@shared/interfaces/IStockPurchase';
import { EStockLogAction } from '@shared/interfaces/IStockLog';
import { ISystemLog, ESystemLogAction, ESystemLogType } from '@shared/interfaces/ISystemLog';
import { ENotificationStatus } from '@shared/interfaces/ISystemNotification';

// Types
import { query } from "@shared/types/query";

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';


@Injectable({ providedIn: 'root' })
export class PurchasesService {

  public translate = PurchasesTranslate.get();

  private data: { [_id: string]: IStockPurchase } = {};

  private _checkProcess: boolean = false;
  private _checkRequest: boolean = false;
  private _dataMonitors: EventEmitter = new EventEmitter();

  private firstScrolling = false;
  private settings: any = { start: 0, limit: 60, count: 0, snapshotRef: null };
  // Límite seguro de produtos para usar uma única transação
  private readonly MAX_PRODUCTS_BATCH = 400;

  constructor(
    private iToolsService: IToolsService,
    private productsService: ProductsService,
    private billsToPayService: BillsToPayService,
    private systemLogsService: SystemLogsService,
    private notificationService: NotificationService
  ) {
    this.query();
  }

  // Getter Methods

  public get limit(): number {
    return this.settings.limit;
  }

  // Query Methods

  public query(where?: query['where'], reset: boolean = true, flex: boolean = false, scrolling: boolean = false, strict: boolean = true): Promise<IStockPurchase[]> {

    return (new Promise<IStockPurchase[]>((resolve) => {

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

  // CRUD Methods

  public getPurchases(listenerId: string, listener: ((_: any) => void)): void {

    const emitterId = 'records';

    Utilities.onEmitterListener(this._dataMonitors, emitterId, listenerId, listener);

    if (this._checkRequest) {
      this._dataMonitors.emit(emitterId, this.treatData(emitterId));
    }
  }

  public async registerPurchase(data: IStockPurchase, batch?: IBatch): Promise<any> {

    return (new Promise(async (resolve, reject) => {

      const checkBatch = (batch != undefined);
      const operation = (!data.code ? 'register' : 'update');

      try {

        if (!batch) { Utilities.loading() }

        batch = (batch || this.iToolsService.database().batch());

        let docRef: any = this.collRef().doc(data._id);
        let source: any;

        if (!data.code) {
          data.code = iTools.FieldValue.control('SystemControls', Utilities.storeID, `${this.collRef().id}.code`);
          data.owner = Utilities.storeID;
          data.operator = Utilities.operator;
          data.registerDate = iTools.FieldValue.date(Utilities.timezone);
        } else {

          data.code = parseInt(<string>data.code);

          if (!data._id) {

            docRef = {
              collName: this.collRef().id, where: [
                { field: 'code', operator: '=', value: data.code },
                { field: 'owner', operator: '=', value: Utilities.storeID }
              ]
            };
          }

          source = (await this.query([{ field: "code", operator: "=", value: data.code }], false, false, false, false))[0];
        }

        data.modifiedDate = iTools.FieldValue.date(Utilities.timezone);

        const batchRef = batch.update(docRef, data, { merge: true });

        await this.uploadAttachment(data);
        await this.checkProducts(data, source, batch, operation, batchRef);
        await this.systemLogs(data, operation, batch, batchRef);

        const registerAccountPayableResponse = await this.registerAccountPayable(data, operation, batch, batchRef);
        data.billToPayCode = iTools.FieldValue.bindBatchData(registerAccountPayableResponse.batchRef, 'code');

        // console.log(batch);

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
      } catch (error) {

        Utilities.loading(false);

        if (!checkBatch) {
          this.notifications(operation, 'error');
          console.error(`Error: ${error.message}`);
        }

        reject(error);
      }
    }));
  }

  public async cancelPurchase(data: IStockPurchase, batch?: IBatch): Promise<any> {

    return (new Promise(async (resolve, reject) => {

      const checkBatch = (batch != undefined);

      try {

        if (!batch) { Utilities.loading() }

        batch = (batch || this.iToolsService.database().batch());

        let docRef: any = this.collRef().doc(data._id);

        if (!data._id) {
          docRef = { collName: this.collRef().id, where: [{ field: 'code', operator: '=', value: parseInt(<string>data.code) }] };
        }

        const updateObject: any = {
          purchaseStatus: EStockPurchaseStatus.CANCELED,
          paymentStatus: EStockPurchasePaymentStatus.CANCELED
        };

        const batchRef = batch.update(docRef, updateObject, { merge: true });

        if (data.purchaseStatus == EStockPurchaseStatus.CONCLUDED) {
          await this.withdrawProducts(data, batch, 'cancel', batchRef);
        }

        await this.cancelAccountPayable(data, batch);
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
      } catch (error) {

        Utilities.loading(false);

        if (!checkBatch) {
          this.notifications('cancel', 'error');
          console.error(`Error: ${error.message}`);
        }

        reject(error);
      }
    }));
  }

  public async deletePurchase(data: IStockPurchase, batch?: IBatch): Promise<any> {

    return (new Promise(async (resolve, reject) => {

      const checkBatch = (batch != undefined);

      try {

        if (!batch) { Utilities.loading() }

        batch = (batch || this.iToolsService.database().batch());

        let docRef: any = this.collRef().doc(data._id);

        if (!data._id) {
          docRef = { collName: this.collRef().id, where: [{ field: 'code', operator: '=', value: parseInt(<string>data.code) }] };
        }

        batch.delete(docRef);

        await this.cleanAttachment(data);
        await this.deleteAccountPayable(data, batch);
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
      } catch (error) {

        Utilities.loading(false);

        if (!checkBatch) {
          this.notifications('delete', 'error');
          console.error(`Error: ${error.message}`);
        }

        reject(error);
      }
    }));
  }

  public async acceptPurchase(data: IStockPurchase, batch?: IBatch): Promise<any> {

    return (new Promise(async (resolve, reject) => {

      const checkBatch = (batch != undefined);

      try {

        // safe guardian para nao duplicar produtos apos aceitar vendas 
        if (data.purchaseStatus == EStockPurchaseStatus.CONCLUDED) {
          resolve(null);
          return;
        }


        if (!batch) { Utilities.loading() }

        batch = (batch || this.iToolsService.database().batch());

        let docRef: any = this.collRef().doc(data._id);

        if (!data._id) {
          docRef = { collName: this.collRef().id, where: [{ field: 'code', operator: '=', value: parseInt(<string>data.code) }] };
        }

        const updateObject: any = {
          receiptDate: iTools.FieldValue.date(Utilities.timezone),
          purchaseStatus: EStockPurchaseStatus.CONCLUDED
        };

        batch.update(docRef, updateObject, { merge: true });

        const responseProducts = await this.acceptProducts(data, batch, 'update');
        await this.systemLogs(data, 'accept', batch);

        if (responseProducts.hasRegisteredProducts) {
          (<any>batch).operations[0].data.products = data.products;
        }

        if (!checkBatch) {

          batch.commit().then((response) => {

            Utilities.loading(false);
            resolve(response);

            this.notifications('accept', 'success');
          }).catch((error) => {

            Utilities.loading(false);
            reject(error);

            this.notifications('accept', 'error');
            console.error(`Error: ${error.message}`);
          });
        } else {
          resolve(null);
        }
      } catch (error) {

        Utilities.loading(false);

        if (!checkBatch) {
          this.notifications('accept', 'error');
          console.error(`Error: ${error.message}`);
        }

        reject(error);
      }
    }));
  }

  // Count Methods

  public getPurchasesCount(listenerId: string, listener: ((_: any) => void)): void {

    const emitterId = 'count';

    Utilities.onEmitterListener(this._dataMonitors, emitterId, listenerId, listener);

    if (this._checkRequest) {
      this._dataMonitors.emit(emitterId, this.treatData(emitterId));
    }
  }

  // Auxiliary Methods - Products

  private async checkProducts(data: IStockPurchase, source: IStockPurchase, batch: IBatch, operation?: any, batchRef?: any): Promise<void> {

    return (new Promise(async (resolve, reject) => {

      try {
        const batchToUse = (data.products?.length || 0) > this.MAX_PRODUCTS_BATCH ? null : batch;
        if (data.purchaseStatus == EStockPurchaseStatus.CONCLUDED) {
          if (source && source.purchaseStatus == EStockPurchaseStatus.CONCLUDED) {
            await this.checkChangeProducts(data, source, operation, batchToUse, batchRef);
          } else {
            await this.depositProducts(data, batchToUse, operation, batchRef);
          }
        }

        if (data.purchaseStatus == EStockPurchaseStatus.CANCELED) {
          await this.withdrawProducts(data, batchToUse, operation, batchRef);
        }

        resolve();
      } catch (error) {
        reject(error);
      }
    }));
  }

  private async depositProducts(data: IStockPurchase, batch: IBatch, operation?: any, batchRef?: any): Promise<any> {

    return (new Promise((resolve, reject) => {

      try {

        const updateArray = [];
        const registerProductsIndex: any[] = [];

        for (const index in data.products) {

          const item = data.products[index];

          const obj: any = {
            code: item.code
          };

          if (Utilities.isMatrix) {

            obj.costPrice = item.costPrice;
            obj.salePrice = item.salePrice;
            obj.quantity = iTools.FieldValue.inc(item.quantity);
          } else {

            obj.branches = {};
            obj.branches[Utilities.storeID] = {
              costPrice: item.costPrice,
              salePrice: item.salePrice,
              quantity: iTools.FieldValue.inc(item.quantity)
            };
          }

          if (item.department) {
            obj.department = {
              _id: item.department._id,
              code: (typeof item.department.code === 'string' ? parseInt(<string>item.department.code, 10) : item.department.code),
              name: item.department.name
            };
          }

          if (!item.code) {
            registerProductsIndex.push(index);
          }

          updateArray.push(obj);
        }

        const referenceCode: any = (operation == 'register' ? iTools.FieldValue.bindBatchData(batchRef, 'code') : parseInt(<string>data.code));

        this.productsService.registerProducts(updateArray, batch, { action: EStockLogAction.PURCHASE, originReferenceCode: referenceCode })
          .then((response) => {
            this.bindRefRegisteredProducts(data, response.batchRefs, registerProductsIndex);
            resolve(response)
          }).catch((error) => { reject(error) });
      } catch (error) {
        reject(error);
      }
    }));
  }

  private async withdrawProducts(data: IStockPurchase, batch: IBatch, operation?: any, batchRef?: any): Promise<any> {

    return (new Promise((resolve, reject) => {

      try {

        const updateArray = [];

        for (const item of data.products) {

          const obj: any = {
            code: item.code
          };

          if (Utilities.isMatrix) {
            obj.quantity = iTools.FieldValue.inc(item.quantity * -1);
          } else {

            obj.branches = {};
            obj.branches[Utilities.storeID] = {
              quantity: iTools.FieldValue.inc(item.quantity * -1)
            };
          }

          updateArray.push(obj);
        }

        const referenceCode: any = (operation == 'register' ? iTools.FieldValue.bindBatchData(batchRef, 'code') : parseInt(<string>data.code));

        this.productsService.registerProducts(updateArray, batch, { action: EStockLogAction.PURCHASE, originReferenceCode: referenceCode })
          .then((response) => { resolve(response) }).catch((error) => { reject(error) });
      } catch (error) {
        reject(error);
      }
    }));
  }

  private async acceptProducts(data: IStockPurchase, batch: IBatch, operation?: any, batchRef?: any): Promise<any> {

    return (new Promise(async (resolve, reject) => {

      try {

        const updateArray = [];
        const registerProductsIndex: any[] = [];

        for (const index in data.products) {

          const item = data.products[index];
          let product = (await this.productsService.query([{ field: "code", operator: "=", value: parseInt(item.code) }], false, true, false, false))[0];


          let obj: any = (product ? {
            code: item.code
          } : item);

          obj = obj.code ? obj : Utilities.deepClone(obj);

          const hasProductRegistered = !!product;
          product = hasProductRegistered ? product : Utilities.deepClone(item);

          // const quantityToBuy = parseInt((item.quantity || 0).toString());
          // const quantityStock = obj.code ? parseInt((product.quantity || 0).toString()) : 0;

          // const totalPurchaseCost = (item.costPrice * quantityToBuy);
          // const totalStockCost = obj.code ? (product.costPrice * quantityStock) : 0;

          // const averageCost = ((totalPurchaseCost + totalStockCost) / (quantityToBuy + quantityStock) || 0);


          // console.log(product, quantityStock, quantityToBuy, totalStockCost, totalPurchaseCost);

          // console.log(averageCost, ((item.costPrice * item.quantity) + (product.costPrice * (<number>product.quantity))) / (item.quantity + (<number>product.quantity)));

          if (Utilities.storeID == 'matrix') {

          if (!hasProductRegistered) {
            product.costPrice = 0;
            product.quantity = 0;
          }

          obj.costPrice = ((item.costPrice * item.quantity) + (product.costPrice * (<number>product.quantity))) / (item.quantity + (<number>product.quantity));
          obj.salePrice = item.salePrice;
          obj.quantity = iTools.FieldValue.inc(item.quantity);

          // console.log(hasProductRegistered, obj);
        } else {

          product.branches = product.branches ?? {};
          product.branches[Utilities.storeID] = <any>(product.branches[Utilities.storeID] ?? { costPrice: item.costPrice, quantity: 0 });

          const productInBranch = product.branches[Utilities.storeID];

          obj.branches = {};
          obj.branches[Utilities.storeID] = {
            costPrice: ((item.costPrice * item.quantity) + (productInBranch.costPrice * (<number>productInBranch.quantity))) / (item.quantity + (<number>productInBranch.quantity)),
            salePrice: item.salePrice,
            quantity: iTools.FieldValue.inc(item.quantity)
          }
        }

        if (item.department) {
          obj.department = {
            _id: item.department._id,
            code: (typeof item.department.code === 'string' ? parseInt(<string>item.department.code, 10) : item.department.code),
            name: item.department.name
          };
        }

        if (!item.code) {
          registerProductsIndex.push(index);
        }

        updateArray.push(obj);
        }

        // console.log(updateArray)

        const referenceCode: any = (operation == 'register' ? iTools.FieldValue.bindBatchData(batchRef, 'code') : parseInt(<string>data.code));

        this.productsService.registerProducts(updateArray, batch, { action: EStockLogAction.PURCHASE, originReferenceCode: referenceCode })
          .then((response) => {
            this.bindRefRegisteredProducts(data, response.batchRefs, registerProductsIndex);
            resolve({ ...response, hasRegisteredProducts: registerProductsIndex.length > 0 })
          }).catch((error) => { reject(error) });
      } catch (error) {
        reject(error);
      }
    }));
  }

  // Auxiliary Methods - Bill To Pay

  private async registerAccountPayable(data: IStockPurchase, action: string, batch: IBatch, batchRef: number): Promise<any> {

    return (new Promise((resolve, reject) => {

      try {

        if (action == 'register') {
          data.billToPay.referenceCode = iTools.FieldValue.bindBatchData(batchRef, 'code');
          data.billToPay.description = data.billToPay.description;
        }

        this.billsToPayService.registerBill(data.billToPay, batch)
          .then((response) => {
            delete data.billToPay;
            resolve(response)
          }).catch((error) => { reject(error) });
      } catch (error) {
        reject(error);
      }
    }));
  }

  private async cancelAccountPayable(data: IStockPurchase, batch: IBatch): Promise<any> {

    return (new Promise((resolve, reject) => {

      try {
        this.billsToPayService.cancelBill(<any>{ code: data.billToPayCode }, batch)
          .then((response) => { resolve(response) }).catch((error) => { reject(error) });
      } catch (error) {
        reject(error)
      }
    }));
  }

  private async deleteAccountPayable(data: IStockPurchase, batch: IBatch): Promise<any> {

    return (new Promise((resolve, reject) => {

      try {
        this.billsToPayService.deleteBill(<any>{ code: data.billToPayCode }, batch)
          .then((response) => { resolve(response) }).catch((error) => { reject(error) });
      } catch (error) {
        reject(error);
      }
    }));
  }

  // Auxiliary Methods - Attachment

  private async uploadAttachment(data: IStockPurchase): Promise<void> {

    return (new Promise((resolve, reject) => {

      if (data.attachment && (typeof data.attachment.url == 'object')) {

        const newFile = data.attachment.url.newFile;
        const oldFile = data.attachment.url.oldFile;

        StorageService.uploadFile({
          settings: [{
            file: newFile,
            sourceUrl: oldFile,
            //name: `${Utilities.uuid()}`,
            name: `${Utilities.uuid()}.${newFile.name.split('.').pop()}`,
            path: `Purchases`
          }],
          storageRef: this.iToolsService.storage()
        }).then((response) => {
          data.attachment.url = response[0];
          resolve();
        }).catch((error) => {
          reject(error);
        });
      } else {
        resolve();
      }
    }));
  }

  private async cleanAttachment(data: IStockPurchase): Promise<void> {

    return (new Promise((resolve, reject) => {

      if (data.attachment && (typeof data.attachment.url == 'string')) {

        const fileUrl = data.attachment.url;

        StorageService.removeFile({
          url: fileUrl,
          storageRef: this.iToolsService.storage()
        }).then(() => {
          resolve();
        }).catch((error) => {
          reject(error);
        });
      } else {
        resolve();
      }
    }));
  }

  // Auxiliary Methods - Logs

  private async systemLogs(data: IStockPurchase, action: string, batch: IBatch, batchRef?: number): Promise<any> {

    const settings: ISystemLog = {
      data: [<any>{}]
    };

    settings.data[0].referenceCode = (action == 'register' ? iTools.FieldValue.bindBatchData(batchRef, 'code') : data.code);
    settings.data[0].type = ESystemLogType.StockPurchases;

    if (action == 'register') {
      settings.data[0].action = ESystemLogAction.REGISTER;
      settings.data[0].note = this.translate.systemLog.register;
    }

    if (action == 'update') {
      settings.data[0].action = ESystemLogAction.UPDATE;
      settings.data[0].note = this.translate.systemLog.update;
    }

    if (action == 'accept') {
      settings.data[0].action = ESystemLogAction.UPDATE;
      settings.data[0].note = this.translate.systemLog.accept;
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

    const collection = this.iToolsService.database().collection('StockPurchases');

    settings = (settings || {});

    if (settings.orderBy) {
      settings.orderBy.code = -1;
    } else {
      settings.orderBy = { code: -1 };
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

  private notifications(action: string, result: string, storage: boolean = false): void {

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

      if (action == 'accept') {
        settings.description = this.translate.notification.accept;
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

  private bindRefRegisteredProducts(data, batchRefs: any[], registerProductsIndex) {

    let batchRefIndex = 0;

    batchRefs = batchRefs || [];

    registerProductsIndex.forEach((index) => {
      data.products[index].code = iTools.FieldValue.bindBatchData(batchRefs[batchRefIndex], 'code');
      data.products[index]._id = iTools.FieldValue.bindBatchData(batchRefs[batchRefIndex], '_id');
      batchRefIndex++;
    });

    // console.log(registerProductsIndex, batchRefs, data.products);
  };

  // Data processing

  public removeListeners(emitterId: string = null, listenerId: string = null): void {
    Utilities.offEmitterListener(this._dataMonitors, emitterId, listenerId);
  }

  private requestData(settings: query, strict: boolean): Promise<IStockPurchase[]> {

    return (new Promise((resolve, reject) => {

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

  private treatData(id: string, data?: IStockPurchase[]): any {

    if (id == 'count') {

      const result: any = {
        current: $$(data || this.data).length, total: this.settings.count
      };

      return result;
    }

    if (id == 'records') {

      const records = [];

      $$(Utilities.deepClone(data || this.data)).map((_: any, item: any) => {

        item.code = Utilities.prefixCode(item.code);

        if (item.billToPayCode) {
          item.billToPayCode = Utilities.prefixCode(item.billToPayCode);
        }

        records.push(item);
      });

      records.sort((a, b) => {
        return ((a.code < b.code) ? 1 : ((a.code > b.code) ? -1 : 0));
      });

      return records;
    }
  }

  private async checkChangeProducts(data: IStockPurchase, source: IStockPurchase, operation: ('register' | 'update' | 'cancel'), batch: IBatch, batchRef?: any) {

    return (new Promise<any>(async (resolve, reject) => {

      const arrProducts: any[] = [];
      const registerProductsIndex: any[] = [];

      const componseObject = ((code: string, quantity: number) => {

        const obj: any = { code: parseInt(code?.toString()) };

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

      const hasSource = Object.values(source || {}).length > 0;

      if (!hasSource) {

        $$(data.products).map((index, item) => {

          let quantity: number = item.quantity;

          if (!isNaN(quantity)) {

            if (operation == 'register') {
              quantity = (quantity * -1);
              arrProducts.push(componseObject(item.code, quantity));
            }

            if (operation == 'cancel') {
              arrProducts.push(componseObject(item.code, quantity));
            }

            if (!item.code) {
              registerProductsIndex.push(index);
            }
          } else {
            throw new Error();
          }
        });
      } else {

        const updateData = Utilities.deepClone(Utilities.parseArrayToObject(data.products || [].map((item) => { item.code = item.code ? parseInt(item.code.toString()) : item.code; return item }), 'code', true));
        const sourceData = Utilities.deepClone(Utilities.parseArrayToObject(source.products || [].map((item) => { item.code = parseInt(item.code.toString()); return item }), 'code'));

        // console.log(ud, " - data.products:",data.products, "updateData: ", updateData, " -- sourceData: ", source, sourceData);
        // console.log('-----');

        $$(updateData).map((index, item) => {

          const data = sourceData[item.code] || sourceData[parseInt(item.code?.toString())];

          if (data) {

            if (!isNaN(data.quantity)) {
              if (item.quantity != data.quantity) {
                if (!isNaN(item.quantity)) {
                  arrProducts.push(componseObject(item.code, (item.quantity - data.quantity)));
                } else {
                  throw new Error();
                }
              }
            } else {
              throw new Error();
            }

            delete sourceData[item.code];
            delete sourceData[parseInt(item.code.toString())];
          } else {
            if (item.code) {

              arrProducts.push(componseObject(item.code, Math.abs(item.quantity)));
            } else {

              const obj = Utilities.deepClone(item);
              delete obj.isRegister;
              arrProducts.push(obj);
              registerProductsIndex.push(index.split("_")[1]);
            }
          }
        });

        if (Object.values(sourceData).length > 0) {

          $$(sourceData).map((_, item) => {
            arrProducts.push(componseObject(item.code, item.quantity * -1));
          });
        }
      }

      const query: any[] = (() => {
        return arrProducts.map((item) => {
          return { field: "code", operator: "=", value: parseInt(item.code) }
        }).filter((item) => { return item.value != undefined });
      })();

      await this.productsService.query(query, false, true, false, false).then((searchedProducts) => {

        arrProducts.forEach((localProduct, index) => {
          let find = false;
          searchedProducts.forEach((remoteProduct) => {
            if (parseInt(localProduct.code) == parseInt(remoteProduct.code.toString())) {
              find = true;
            }
          });

          if (localProduct.code == undefined) {
            find = true;
          } else if (!find) {
            arrProducts.splice(index, 1);
          }
        });
      });

      // console.log(arrProducts, registerProductsIndex);

      if (arrProducts.length > 0) {

        const referenceCode: any = (operation == 'register' ? iTools.FieldValue.bindBatchData(batchRef, 'code') : parseInt(<string>data.code));

        this.productsService.registerProducts(arrProducts, batch, { action: EStockLogAction.PURCHASE, originReferenceCode: referenceCode })
          .then((response) => {
            this.bindRefRegisteredProducts(data, response.batchRefs, registerProductsIndex);
            resolve(response);
          }).catch((error) => { reject(error); });
      } else {
        resolve(null);
      }
    }));
  }

}
