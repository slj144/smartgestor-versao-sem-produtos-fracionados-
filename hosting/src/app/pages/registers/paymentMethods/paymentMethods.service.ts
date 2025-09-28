import { Injectable } from "@angular/core";
import { EventEmitter } from 'events';
import { iTools } from '../../../../assets/tools/iTools';

// Services
import { IToolsService } from '@shared/services/iTools.service';
import { SystemLogsService } from '@shared/services/system-logs.service';
import { NotificationService } from '@shared/services/notification.service';

// Translate
import { PaymentMethodsTranslate } from "./paymentMethods.translate";

// Interfaces
import { IBatch } from '@itools/interfaces/IBatch';
import { ICollection } from '@itools/interfaces/ICollection';
import { IRegistersPaymentMethod } from '@shared/interfaces/IRegistersPaymentMethod';
import { ESystemLogType, ESystemLogAction, ISystemLog } from '@shared/interfaces/ISystemLog';
import { ENotificationStatus } from '@shared/interfaces/ISystemNotification';

// Types
import { query } from "@shared/types/query";

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';

@Injectable({ providedIn: 'root' })
export class PaymentMethodsService {

  public translate = PaymentMethodsTranslate.get();

  private data: { [_id: string]: IRegistersPaymentMethod } = {};

  private _checkProcess: boolean = false;
  private _checkRequest: boolean = false;
  private _dataMonitors: EventEmitter = new EventEmitter();

  private firstScrolling = false;
  private settings: any = { start: 0, limit: 60, count: 0, snapshotRef: null };

  constructor(
    private iToolsService: IToolsService,
    private systemLogsService: SystemLogsService,
    private notificationService: NotificationService
  ) {
    this.query();
  }

  // Getter Methods

  public get limit() {
    return this.settings.limit;
  }

  // Query Methods

  public query(where?: query['where'], reset: boolean = true, flex: boolean = false, scrolling: boolean = false, strict: boolean = true) {

    return (new Promise<IRegistersPaymentMethod[]>((resolve) => {

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

      if (reset && strict) {
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

  public getPaymentMethods(listenerId: string, listener: ((_: any) => void)) {

    const emitterId = 'records';

    Utilities.onEmitterListener(this._dataMonitors, emitterId, listenerId, listener);

    if (this._checkRequest) {
      this._dataMonitors.emit(emitterId, this.treatData(emitterId));
    }
  }

  public async registerPaymentMethod(data: IRegistersPaymentMethod, isProvider?: boolean, batch?: IBatch) {

    return (new Promise<void>(async (resolve, reject) => {

      const checkBatch = (batch != undefined);
      const operation = (!data.code ? 'register' : 'update');

      try {

        if (!batch) { Utilities.loading() }

        batch = (batch || this.iToolsService.database().batch());

        let docRef: any = this.collRef().doc(data._id);

        if (!data.code) {
          data.code = iTools.FieldValue.control('SystemControls', 'common', `${this.collRef().id}.code`, 1000);
          data.owner = Utilities.storeID;
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
        }

        data.modifiedDate = iTools.FieldValue.date(Utilities.timezone);

        const batchRef = batch.update(docRef, data, { merge: true });

        if (isProvider) {
          batch.getOperations()[batchRef].data = await this.checkProviders(data);
        }

        await this.systemLogs(data, operation, batch, batchRef);

        if (!checkBatch) {

          batch.commit().then(() => {

            Utilities.loading(false);
            resolve();

            this.notifications(operation, 'success');
          }).catch((error) => {

            Utilities.loading(false);
            reject(error);

            this.notifications(operation, 'error');
            console.error(`Error: ${typeof error == 'object' && error.message ? error.message : 'No message was reported'}`);
          });
        } else {
          resolve();
        }
      } catch (error) {

        Utilities.loading(false);

        if (!checkBatch) {
          this.notifications(operation, 'error');
          console.error(`Error: ${typeof error == 'object' && error.message ? error.message : 'No message was reported'}`);
        }

        reject(error);
      }
    }));
  }

  public async deletePaymentMethod(data: IRegistersPaymentMethod, isProvider?: boolean, batch?: IBatch) {

    return (new Promise<void>(async (resolve, reject) => {

      const checkBatch = (batch != undefined);

      try {

        if (!batch) { Utilities.loading() }

        batch = (batch || this.iToolsService.database().batch());

        if (!isProvider) {
          batch.delete(this.collRef().doc(data._id));
        } else {

          const obj = { providers: {} };
          obj.providers[data.code] = iTools.FieldValue.unset();

          batch.update(this.collRef().doc(data._id), obj);
        }

        await this.systemLogs(data, 'delete', batch);

        if (!checkBatch) {

          batch.commit().then(() => {

            Utilities.loading(false);
            resolve();

            this.notifications('delete', 'success');
          }).catch((error) => {

            Utilities.loading(false);
            reject(error);

            this.notifications('delete', 'error');
            console.error(`Error: ${typeof error == 'object' && error.message ? error.message : 'No message was reported'}`);
          });
        } else {
          resolve();
        }
      } catch (error) {

        Utilities.loading(false);

        if (!checkBatch) {
          this.notifications('delete', 'error');
          console.error(`Error: ${typeof error == 'object' && error.message ? error.message : 'No message was reported'}`);
        }

        reject(error);
      }
    }));
  }

  // Count Methods

  public getPaymentMethodsCount(listenerId: string, listener: ((_: any) => void)) {

    const emitterId = 'count';

    Utilities.onEmitterListener(this._dataMonitors, emitterId, listenerId, listener);

    if (this._checkRequest) {
      this._dataMonitors.emit(emitterId, this.treatData(emitterId));
    }
  }

  // Auxiliary Methods - Sub Methods

  public checkProviders(data: IRegistersPaymentMethod) {

    return (new Promise<any>((resolve, reject) => {

      if (data.providers[data.code]) {

        const source: IRegistersPaymentMethod = this.data[data._id];

        data._lastProviderCode = (source._lastProviderCode || <number>source.code);
        data._lastProviderCode += 1;

        data.providers[data._lastProviderCode] = data.providers[data.code];
        data.providers[data._lastProviderCode].code = data._lastProviderCode;

        delete data.providers[data.code];
      }

      resolve(data);
    }));
  }

  // Auxiliary Methods - Logs

  private async systemLogs(data: IRegistersPaymentMethod, action: string, batch: IBatch, batchRef?: number) {

    const settings: ISystemLog = {
      data: [<any>{}]
    };

    settings.data[0].referenceCode = (action == 'register' ? iTools.FieldValue.bindBatchData(batchRef, 'code') : data.code);
    settings.data[0].type = ESystemLogType.RegistersPaymentMethods;

    if (action == 'register') {
      settings.data[0].action = ESystemLogAction.REGISTER;
      settings.data[0].note = this.translate.systemLog.register;
    }

    if (action == 'update') {
      settings.data[0].action = ESystemLogAction.UPDATE;
      settings.data[0].note = this.translate.systemLog.update;
    }

    if (action == 'delete') {
      settings.data[0].action = ESystemLogAction.DELETION;
      settings.data[0].note = this.translate.systemLog.delete;
    }

    return this.systemLogsService.registerLogs(settings, batch);
  }

  // Utility Methods

  private collRef(settings?: query): ICollection {

    const collection = this.iToolsService.database().collection('RegistersPaymentMethods');
    collection.orderBy({ code: 1 });

    if (settings) {

      if (settings.orderBy) {
        collection.orderBy(settings.orderBy);
      }

      if (settings.or) {
        settings.or.push({ field: 'owner', operator: '=', value: 'matrix' });
      } else {
        settings.or = [{ field: 'owner', operator: '=', value: 'matrix' }];
      }

      if (Utilities.storeID != 'matrix') {
        settings.or.push({ field: 'owner', operator: '=', value: Utilities.storeID });
      }

      if (settings.where) {
        collection.where(settings.where);
      }

      if (settings.or) {
        collection.or(settings.or);
      }

      if (settings.start != undefined && settings.start >= 0) {
        collection.startAfter(settings.start);
      }

      if (settings.limit != undefined && settings.limit > 0) {
        collection.limit(settings.limit);
      }
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

  // Data processing

  public removeListeners(emitterId: string = null, listenerId: string | string[] = null) {
    Utilities.offEmitterListener(this._dataMonitors, emitterId, listenerId);
  }

  private requestData(settings: query, strict: boolean) {

    return (new Promise<IRegistersPaymentMethod[]>((resolve, reject) => {

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

  private treatData(id: string, data?: IRegistersPaymentMethod[]) {

    if (id == 'count') {

      const result: any = {
        current: $$(data || this.data).length, total: this.settings.count
      };

      return result;
    }

    if (id == 'records') {

      const records = [];

      const extractBankAccount = (item) => {

        if (!Utilities.isMatrix) {

          delete item.bankAccount;

          if (item.branches) {
            const data = (item.branches[Utilities.storeID] || {});
            item.bankAccount = data.bankAccount;
          }
        } else {
          delete item.branches;
        }
      };

      $$(Utilities.deepClone(data || this.data)).map((_, item) => {

        item.code = Utilities.prefixCode(item.code);

        if (item.providers) {

          for (let [key, value] of Object.entries(item.providers)) {

            const provider: any = value;

            if (Utilities.storeID == 'matrix') {

              if (provider.owner != 'matrix') {
                delete item.providers[key];
              }
            } else {

              if (provider.owner != Utilities.storeID && provider.owner != 'matrix') {
                delete item.providers[key];
              }
            }

            extractBankAccount(provider);
          }

          item.providers = Object.values(item.providers);

          // Ensure default "Crediário" (9000) is selectable even when providers are empty
          if (String(item.code) === '9000' && item.providers.length === 0) {
            delete item.providers;
          }
        } else {
          extractBankAccount(item);
        }

        records.push(item);
      });

      records.sort((a, b) => {
        return ((a.code < b.code) ? -1 : ((a.code > b.code) ? 1 : 0));
      });
      // ➕ Add default payment method "Crediário" if not present
      const credExists = records.some(m => String(m.code) === '9000');
      if (!credExists) {
        records.push({
          code: '9000',
          name: 'CREDIÁRIO',
          _isDefault: true
        } as any);
      }
      return records;
    }
  }

}
