import { Injectable } from "@angular/core";
import { EventEmitter } from 'events';
import { iTools } from '@itools/index';

// Services
import { IToolsService } from '@shared/services/iTools.service';
import { StockLogsService } from '@shared/services/stock-logs.service';
import { StorageService } from '@shared/services/storage.service';
import { SystemLogsService } from '@shared/services/system-logs.service';
import { NotificationService } from '@shared/services/notification.service';

// Translate
import { ProductsTranslate } from "./products.translate";

// Interfaces
import { IBatch } from "@itools/interfaces/IBatch";
import { ICollection } from '@itools/interfaces/ICollection';
import { IStockProduct } from '@shared/interfaces/IStockProduct';
import { IStockLog, EStockLogAction, EStockLogOperation } from '@shared/interfaces/IStockLog';
import { ISystemLog, ESystemLogAction, ESystemLogType } from '@shared/interfaces/ISystemLog';
import { ENotificationStatus } from '@shared/interfaces/ISystemNotification';

// Types
import { query } from '@shared/types/query';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';

@Injectable({ providedIn: 'root' })
export class ProductsService {

  public translate = ProductsTranslate.get();

  private data: { [_id: string]: IStockProduct } = {};

  private _checkProcess: boolean = false;
  private _checkRequest: boolean = false;
  private _dataMonitors: EventEmitter = new EventEmitter();

  private firstScrolling = false;
  private settings: any = { start: 0, limit: 50, count: 0, back: false, snapshotRef: null };

  constructor(
    private iToolsService: IToolsService,
    private stockLogsService: StockLogsService,
    private systemLogsService: SystemLogsService,
    private notificationService: NotificationService
  ) {
    this.query();


    // this.iToolsService.database().collection("StockProducts").get().then((res)=>{

    //   const batch = this.iToolsService.database().batch();

    //   res.docs.forEach((doc)=>{

    //     const data = doc.data();


    //     const updateObj = {
    //       tributes: {
    //         pis: {
    //           cst: "49"
    //         },
    //         cofins: {
    //           cst: "49"
    //         }
    //       }
    //     }

    //     batch.update(doc.ref, updateObj);

    //     // console.log(data);

    //   });


    //   // console.log(batch)
    //   // batch.commit().then(()=>{
    //   //   console.log("okk")
    //   // });

    // });
  }

  // Getter Methods

  public get limit(): number {
    return this.settings.limit;
  }

  // Query Methods

  public query(where?: query['where'], reset: boolean = true, flex: boolean = false, scrolling: boolean = false, strict: boolean = true, others?: { back?: boolean, orderBy?: any }): Promise<IStockProduct[]> {

    return (new Promise((resolve) => {

      let queryObject: query = {}

      if (others && others.back) {
        queryObject = {
          start: this.settings.start > 1 ? ((this.settings.start - 2) * this.settings.limit) : 0,
          limit: this.settings.limit
        };
      } else {
        queryObject = {
          start: (this.settings.start * this.settings.limit),
          limit: this.settings.limit
        };
      }

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

      if (reset && strict) {
        this.data = {};
        this.firstScrolling = false;
        this.settings.start = queryObject.start = 0;
      }

      if (!reset && !this.firstScrolling) {
        if (!others || others && !others.back) {
          this.firstScrolling = true;
          this.settings.start = this.settings.back ? 2 : 1;
          queryObject.start = (this.settings.start * this.settings.limit);
        }
      }

      if (others && others.orderBy) {
        queryObject.orderBy = others.orderBy;
      }

      this.requestData(queryObject, strict).then((data) => {

        if (!reset) {

          if (others && others.back) {
            this.settings.back = true;
            this.settings.start = this.settings.start > 0 ? this.settings.start - 1 : 0;
          } else {
            this.settings.back = false;
            this.settings.start += 1;
          }
        }

        resolve(data);
      });
    }));
  }

  // CRUD Methods - Products

  public getProducts(listenerId: string, listener: ((_: any) => void)): void {

    const emitterId = 'records';

    Utilities.onEmitterListener(this._dataMonitors, emitterId, listenerId, listener);

    if (this._checkRequest) {
      this._dataMonitors.emit(emitterId, this.treatData(emitterId));
    }
  }

  public async registerProducts(data: IStockProduct[], batch?: IBatch, stockLogs: { action?: EStockLogAction, originReferenceCode?: number | string, data?: any } = {}): Promise<any> {

    return (new Promise(async (resolve, reject) => {

      const checkBatch = (batch != undefined);
      let operation = '';

      try {

        if (!batch) { Utilities.loading() }

        const arrStockLogs: IStockLog['data'] = [];
        const arrSystemLogs: ISystemLog['data'] = [];

        batch = (batch || this.iToolsService.database().batch());
        const productsBatchRef = [];

        for (let item of data) {

          let docRef: any = this.collRef().doc(item._id);

          operation = (!item.code ? 'register' : 'update');

          if (!item.code) {

            item.code = iTools.FieldValue.control('SystemControls', Utilities.storeID, `${this.collRef().id}.code`);
            item.registerDate = iTools.FieldValue.date(Utilities.timezone);
          } else {

            item.code = parseInt(<string>item.code);

            if (!item._id) {
              docRef = { collName: this.collRef().id, where: [{ field: 'code', operator: '=', value: item.code }] };
            }
          }

          item.modifiedDate = iTools.FieldValue.date(Utilities.timezone);

          // Ensure image upload completes before batching data so that the
          // persisted document always contains the final download URL.
          await this.uploadThumbnail(item);

          const batchRef = batch.update(docRef, item, { merge: true, returnData: operation == 'register' ? true : false });

          if (operation == 'register' && !item.barcode) {
            item.barcode = iTools.FieldValue.bindBatchData(batchRef, "code");
            productsBatchRef.push(batchRef);
          }

          // await this.uploadThumbnail(item);

          const updateQuantity = Utilities.isMatrix ? item.quantity : item.branches[Utilities.storeID].quantity;
          const quantity = this.parseQuantity(updateQuantity);

          if (
            (((operation == 'register') || (operation == 'update')) && (stockLogs && stockLogs.action == EStockLogAction.ADJUSTMENT)) && (!isNaN(quantity)) ||
            ((operation == 'register') && (typeof updateQuantity == 'number')) ||
            ((operation == 'update') && (typeof quantity == 'number') && !isNaN(quantity) && quantity != 0)
          ) {

            arrStockLogs.push((() => {

              const code = (operation != 'register' ? item.code : iTools.FieldValue.bindBatchData(batchRef, 'code'));

              const obj: any = {
                referenceCode: code,
                quantity: (quantity > 0 ? quantity : (quantity * -1)),
                operation: (quantity > 0 ? EStockLogOperation.INPUT : EStockLogOperation.OUTPUT),
                note: (item.stockAdjustment && item.stockAdjustment.data ? item.stockAdjustment.data[0].note : this.translate.stockLog[stockLogs.action.toLowerCase()])
              }

              if (item.stockAdjustment && item.stockAdjustment.data) {
                obj.adjustmentType = item.stockAdjustment.data[0].adjustmentType;
              }

              if (item.stockAdjustment) {
                delete item.stockAdjustment;
                batch.getOperations()[batchRef].data = item;
              }

              return obj;
            })());

          }

          arrSystemLogs.push((() => {

            const code = (operation != 'register' ? item.code : iTools.FieldValue.bindBatchData(batchRef, 'code'));

            return {
              referenceCode: code,
              type: ESystemLogType.StockProducts,
              action: (operation == 'register' ? ESystemLogAction.REGISTER : ESystemLogAction.UPDATE),
              note: (operation == 'register' ? this.translate.systemLog.register : this.translate.systemLog.update)
            };
          })());
        }

        await this.stockLogs(arrStockLogs, stockLogs.action, batch, stockLogs.originReferenceCode);
        await this.systemLogs(arrSystemLogs, batch);

        if (!checkBatch) {

          batch.commit().then(async (response) => {

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
          resolve({ batchRefs: productsBatchRef });
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

  public async deleteProducts(data: IStockProduct[], batch?: IBatch): Promise<any> {

    return (new Promise(async (resolve, reject) => {

      const checkBatch = (batch != undefined);

      try {

        if (!batch) { Utilities.loading() }

        batch = (batch || this.iToolsService.database().batch());

        const arrSystemLogs: ISystemLog['data'] = [];

        for (const item of data) {

          batch.delete(this.collRef().doc(item._id));

          arrSystemLogs.push({
            referenceCode: item.code,
            type: ESystemLogType.StockProducts,
            action: ESystemLogAction.DELETION,
            note: this.translate.systemLog.delete
          });

          await this.cleanThumbnail(item);
        }

        await this.updateBlacklist(data, batch);
        await this.systemLogs(arrSystemLogs, batch);

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

  // CRUD Methods - Blacklist

  public async checkBlacklist(codes: string[]): Promise<any> {

    return (new Promise(async (resolve) => {

      const collRef: ICollection = this.iToolsService.database().collection('StockProducts');
      collRef.where([{ field: '_id', operator: '=', value: '_blacklist' }]);

      collRef.get().then((res) => {

        const data = (res.docs.length > 0 ? res.docs[0].data() : null);
        const response = { count: 0, blacklist: [] };

        if (data) {

          for (const code of codes) {

            if (data.codes[parseInt(<string>code)]) {
              response.count += 1;
              response.blacklist.push(code);
            }
          }
        }

        resolve(response);
      });
    }));
  }

  private async updateBlacklist(data: IStockProduct[], batch: IBatch): Promise<void> {

    return (new Promise(async (resolve) => {

      const updateObject: any = {};

      updateObject.codes = {};
      updateObject.count = iTools.FieldValue.inc(data.length);
      updateObject.modifiedDate = iTools.FieldValue.date(Utilities.timezone);

      for (const item of data) {
        updateObject.codes[parseInt(<string>item.code)] = '*';
      }

      batch.update(this.collRef().doc('_blacklist'), updateObject);

      resolve();
    }));
  }

  // Stock Alert

  public async getStockAlert(limit: number = 0): Promise<any> {

    return (new Promise(async (resolve) => {

      this.collRef().filter(function () {
        return (this.quantity <= this.alert);
      }).get().then((res) => {

        let data = [];

        for (const doc of res.docs) {
          data.push(doc.data());
        }

        resolve(data);
      });
    }));
  }

  // Count Methods

  public getProductsCount(listenerId: string, listener: ((_: any) => void)): void {

    const emitterId = 'count';

    Utilities.onEmitterListener(this._dataMonitors, emitterId, listenerId, listener);

    if (this._checkRequest) {
      this._dataMonitors.emit(emitterId, this.treatData(emitterId));
    }
  }

  // Auxiliary Methods - Thumbnail

  private async uploadThumbnail(data: IStockProduct): Promise<void> {

    return (new Promise((resolve, reject) => {

      if (data.thumbnail && (typeof data.thumbnail.url == 'object')) {

        const newFile = data.thumbnail.url.newFile;
        const oldFile = data.thumbnail.url.oldFile;

        StorageService.uploadFile({
          settings: [{
            file: newFile,
            sourceUrl: oldFile,
            name: `${Utilities.uuid()}`,
            path: `Products`
          }],
          storageRef: this.iToolsService.storage()
        }).then((response) => {
          data.thumbnail.url = response[0];
          resolve();
        }).catch((error) => {
          reject(error);
        });
      } else {
        resolve();
      }
    }));
  }

  private async cleanThumbnail(data: IStockProduct): Promise<void> {

    return (new Promise((resolve, reject) => {

      if (data.thumbnail && (typeof data.thumbnail.url == 'string')) {

        const fileUrl = data.thumbnail.url;

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

  // Auxiliary Methods

  private async stockLogs(data: IStockLog['data'], action: EStockLogAction, batch: IBatch, originReferenceCode?: number | string): Promise<void> {

    return (new Promise(async (resolve) => {

      const arrData = [];

      for (const i in data) {
        if (data[i].quantity != 0) {
          arrData.push(data[i]);
        }
      }

      if (arrData.length > 0) {
        await this.stockLogsService.registerLogs({ action, data: arrData, originReferenceCode: originReferenceCode }, batch);
      }

      resolve();
    }));
  }

  private async systemLogs(data: ISystemLog['data'], batch: IBatch): Promise<any> {
    return this.systemLogsService.registerLogs({ data }, batch);
  }

  // Utility Methods

  private collRef(settings?: query): ICollection {

    const collection = this.iToolsService.database().collection('StockProducts');

    settings = Utilities.deepClone(settings || {});

    if (settings.orderBy) {
      settings.orderBy = { code: <any>settings.orderBy };
    } else {
      settings.orderBy = { code: 1 };
    }

    collection.orderBy(settings.orderBy);

    if (settings.where) {
      settings.where.push({ field: '_id', operator: '!=', value: '_blacklist' });
    } else {
      settings.where = [{ field: '_id', operator: '!=', value: '_blacklist' }];
    }

    collection.where(settings.where);

    if (settings.or) {
      collection.or(settings.or);
    }

    if (settings.start != undefined && settings.start >= 0) {
      collection.startAfter(settings.start);
    }

    if (settings.limit != undefined && settings.limit > 0) {
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

  private parseQuantity(value: (number | string)): number {

    let quantity = value;

    if ((typeof quantity == 'string') && (/\$inc\([-]?[0-9]+\)/g.test(quantity))) {
      quantity = parseInt(quantity.match(/[-]?[0-9]+/g)[0]);
    }

    return (<number>quantity);
  }

  // Data Processing

  public removeListeners(emitterId: string = null, listenerId: string | string[] = null): void {
    Utilities.offEmitterListener(this._dataMonitors, emitterId, listenerId);
  }

  private requestData(settings: query, strict: boolean): Promise<IStockProduct[]> {

    return (new Promise((resolve, reject) => {

      if (strict) {

        const timer = setInterval(() => {

          if (!this._checkProcess) {

            clearInterval(timer);

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

              this._dataMonitors.emit('records', this.treatData('records', null, (<any>settings.orderBy) || 1));
              this._checkRequest = true;
              this._checkProcess = false;

              resolve(this.treatData('records', null, (<any>settings.orderBy) || 1));
            });
          }
        });

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
              reject(error);
            }
          }, 200);
        });
      }
    }));
  }

  private treatData(id: string, data?: IStockProduct[], order: 1 | -1 = 1): any {

    if (id == 'count') {

      const result: any = {
        current: $$(data || this.data).length, total: this.settings.count
      };

      return result;
    }

    if (id == 'records') {

      const records = [];

      $$(Utilities.deepClone(data || this.data)).map((_: any, item: any) => {
        if (item.name) {
          if (item.barcode === item.code || !item.barcode && item.code) {
            // console.log(item);

            if (item.registerDate) {
              item.barcode = `${Utilities.prefixCode(item.code)}${item.registerDate.split(" ")[0].split("-")[0]}`;
            }
          }

          item.code = Utilities.prefixCode(item.code);

          if (item.category && item.category.code) {
            item.category.code = Utilities.prefixCode(item.category.code);
          }

          if (item.commercialUnit && item.commercialUnit.code) {
            item.commercialUnit.code = Utilities.prefixCode(item.commercialUnit.code);
          }

          if (item.provider && item.provider.code) {
            item.provider.code = Utilities.prefixCode(item.provider.code);
          }

          if (!Utilities.isMatrix) {

            if (item.branches) {

              const data = (item.branches[Utilities.storeID] || {});

              item.matrix = {
                costPrice: item.costPrice,
                salePrice: item.salePrice
              };

              item.quantity = (data.quantity || 0);
              item.costPrice = (!isNaN(data.costPrice) ? data.costPrice : item.costPrice);
              item.salePrice = (!isNaN(data.salePrice) ? data.salePrice : item.salePrice);
              item.alert = (!isNaN(data.alert) ? data.alert : item.alert);

              const matrixTributes = item.tributes;
              const branchTributes = data.tributes;

              item.tributes = branchTributes ? branchTributes : matrixTributes;
            } else {
              item.quantity = 0;
            }
          } else {
            delete item.branches;
          }

          item.unitaryPrice = item.salePrice;
          item.unitaryCost = item.costPrice;

          records.push(item);
        }
      });

      records.sort((a, b) => {
        return order == 1 ? ((a.code < b.code) ? -1 : ((a.code > b.code) ? 1 : 0)) : ((a.code < b.code) ? 1 : ((a.code > b.code) ? -1 : 0));
      });

      return records;
    }
  }

}
