import { Injectable } from "@angular/core";
import { EventEmitter } from 'events';

// Services
import { IToolsService } from "@shared/services/iTools.service";

// Interfaces
import { ICollection } from "@itools/interfaces/ICollection";
import { ICashierSale } from "@shared/interfaces/ICashierSale";
import { ICashierInflow } from "@shared/interfaces/ICashierInflow";
import { ICashierOutflow } from "@shared/interfaces/ICashierOutflow";

// Types
import { query } from "@shared/types/query";

// Utilities
import { $$ } from "@shared/utilities/essential";
import { Utilities } from "@shared/utilities/utilities";

@Injectable({ providedIn: 'root' })
export class CashierRecordsService {

  private data: any = {};

  private _checkProcess: boolean = false;
  private _checkRequest: boolean = false;
  private _dataMonitors: EventEmitter = new EventEmitter();

  private firstScrolling = false;
  private settings: any = { start: 0, limit: 50, snapshotRef: null };

  constructor(
    private iToolsService: IToolsService
  ) {

    // this._dataMonitors.setMaxListeners(1000000);

  }

  // Query Methods  

  public query(type: ('sales' | 'inflows' | 'outflows'), where?: query['where'], reset: boolean = false, flex: boolean = false, scrolling: boolean = false, strict: boolean = true, back: boolean = false, limit: number = 0) {

    return (new Promise<ICashierSale[] | ICashierInflow[] | ICashierOutflow[]>((resolve) => {

      let queryObject: query;

      if (back) {

        queryObject = {
          start: this.settings.start > 1 ? ((this.settings.start - 2) * this.settings.limit) : 0,
          limit: limit > 0 ? limit : this.settings.limit
        };

      } else {
        queryObject = {
          start: (this.settings.start * this.settings.limit),
          limit: limit > 0 ? limit : this.settings.limit
        };
      }

      if (where) {

        if (strict && !scrolling) {
          this.data = {};
          this.settings.start = 0;
          queryObject.start = 0
        } else if (!scrolling) {
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
        // this.settings.start = 1;
        // this.firstScrolling = true;
        // queryObject.start = (this.settings.start * this.settings.limit);

        if (!back) {
          this.firstScrolling = true;
          this.settings.start = this.settings.back ? 2 : 1;
          queryObject.start = (this.settings.start * this.settings.limit);
        }
      }



      // console.log(this.settings.back,"... ",this.settings ,' ---- ',  queryObject);

      this.requestData(type, queryObject, strict).then((data) => {
        if (!reset) {
          if (back) {
            this.settings.back = true;
            this.settings.start = this.settings.start > 0 ? this.settings.start - 1 : 0;
          } else {
            this.settings.back = false;
            this.settings.start += 1;
          }

          // console.log("...END... ",this.settings ,' ---- ', back);
        }
        resolve(data);
      });
    }));
  }

  // CRUD Methods

  public getSales(listenerId: string, listener: ((_: any) => void)) {

    const emitterId = 'sales';

    Utilities.onEmitterListener(this._dataMonitors, emitterId, listenerId, listener);

    if (this._checkRequest) {
      this._dataMonitors.emit(emitterId, this.treatData(emitterId));
    }
  }

  public getInflows(listenerId: string, listener: ((_: any) => void)) {

    const emitterId = 'inflows';

    Utilities.onEmitterListener(this._dataMonitors, emitterId, listenerId, listener);

    if (this._checkRequest) {
      this._dataMonitors.emit(emitterId, this.treatData(emitterId));
    }
  }

  public getOutflows(listenerId: string, listener: ((_: any) => void)) {

    const emitterId = 'outflows';

    Utilities.onEmitterListener(this._dataMonitors, emitterId, listenerId, listener);

    if (this._checkRequest) {
      this._dataMonitors.emit(emitterId, this.treatData(emitterId));
    }
  }

  // Utility Methods 

  private collRef(type: ('sales' | 'inflows' | 'outflows'), settings?: query): ICollection {

    const collection = this.iToolsService.database().collection((() => {
      switch (type) {
        case 'sales': return 'CashierSales';
        case 'inflows': return 'CashierInflows';
        case 'outflows': return 'CashierOutflows';
      };
    })());

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

  // Data Processing

  public removeListeners(emitterId: string = null, listenerId: string | string[] = null) {
    Utilities.offEmitterListener(this._dataMonitors, emitterId, listenerId);
  }

  private requestData(type: ('sales' | 'inflows' | 'outflows'), settings: query, strict: boolean) {

    return (new Promise<any[]>((resolve, reject) => {

      if (strict) {

        if (!this._checkProcess) {

          this._checkProcess = true;

          if (this.settings.snapshotRef) {
            this.collRef(type).clearSnapshot(this.settings.snapshotRef);
          }

          // this.data = {};

          this.settings.snapshotRef = this.collRef(type, settings).onSnapshot((res) => {

            if (res.changes().length == 0) {

              for (const doc of res.docs) {
                const docData = doc.data();
                this.data[docData._id] = docData;
                // console.log(docData);
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

            this._dataMonitors.emit(type, this.treatData(type));
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

        this.collRef(type, settings).get().then((res) => {

          const data = [];

          for (const doc of res.docs) {
            const docData = doc.data();
            data.push(docData);
          }

          resolve(this.treatData(type, data));
        }).catch((e) => {
          reject(e);
        });
      }
    }));
  }

  private treatData(emitterId: string, data?: any) {

    if ((emitterId == 'sales') || (emitterId == 'inflows') || (emitterId == 'outflows')) {

      const records = [];

      $$(Utilities.deepClone(data || this.data)).map((_, item) => {

        item.code = Utilities.prefixCode(item.code);

        if (item.requestCode) {
          item.requestCode = Utilities.prefixCode(item.requestCode);
        }

        if (item.service && item.service.code) {
          item.service.code = Utilities.prefixCode(item.service.code);
        }

        records.push(item);
      });

      // Ordena pelos registros mais recentes primeiro
      records.sort((a, b) => {
        const aDate = new Date(a.paymentDate || a.registerDate || a.date || 0).getTime();
        const bDate = new Date(b.paymentDate || b.registerDate || b.date || 0).getTime();

        if (aDate !== bDate) {
          return bDate - aDate; // datas mais recentes primeiro
        }

        // Caso datas iguais ou ausentes, ordena pelo código decrescente para manter consistência
        const aCode = parseInt(a.code as any) || 0;
        const bCode = parseInt(b.code as any) || 0;
        return bCode - aCode;
      });

      return records;
    }
  }

}
