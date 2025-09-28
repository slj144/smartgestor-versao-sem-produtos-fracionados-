import { Injectable } from '@angular/core';
import { EventEmitter } from 'events';
import { iTools } from '../../../assets/tools/iTools';

// Services
import { IToolsService } from './iTools.service';

// Interfaces
import { IBatch } from '@itools/interfaces/IBatch';
import { ICollection } from '@itools/interfaces/ICollection';
import { IStockLog, EStockLogAction } from '../interfaces/IStockLog';

// Types
import { query } from '../types/query';

// Utilities
import { $$ } from '../utilities/essential';
import { Utilities } from '../utilities/utilities';

@Injectable({ providedIn: 'root' })
export class StockLogsService {

  private data: any = {};

  private _checkProcess: boolean = false;
  private _checkRequest: boolean = false;
  private _dataMonitors: EventEmitter = new EventEmitter();

  private firstScrolling = false;
  private settings: any = { start: 0, limit: 60, count: 0, snapshotRef: null };

  constructor(
    private iToolsService: IToolsService,
  ) {
    this.query();
  }
  
  // Getter Methods

  public get limit(): number {
    return this.settings.limit;
  }

  // Query Methods

  public query(where?: query['where'], reset: boolean = true, flex: boolean = false, scrolling: boolean = false, strict: boolean = true): Promise<IStockLog[]> {

    return (new Promise((resolve) => {

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

  public getLogs(listenerId: string, listener: ((_: any)=>void)): void {
       
    const emitterId = 'records';

    Utilities.onEmitterListener(this._dataMonitors, emitterId, listenerId, listener);

    if (this._checkRequest) {
      this._dataMonitors.emit(emitterId, this.treatData(emitterId));
    }
  }

  public registerLogs(data: IStockLog, batch: IBatch): Promise<void> {
    
    return (new Promise((resolve, reject) => {
  
      if (data && batch) {

        data.code = iTools.FieldValue.control('SystemControls', Utilities.storeID, 'StockLogs.code');        
        data.owner = Utilities.storeID;
        data.operator = Utilities.operator;
        data.registerDate = iTools.FieldValue.date(Utilities.timezone);

        batch.update(this.collRef().doc(), data);     

        resolve();
      } else {
        reject();
      }
    }));
  }

  // Count Methods

  public getLogsCount(listenerId: string, listener: ((_: any)=>void)): void {
      
    const emitterId = 'count';

    Utilities.onEmitterListener(this._dataMonitors, emitterId, listenerId, listener);

    if (this._checkRequest) {
      this._dataMonitors.emit(emitterId, this.treatData(emitterId));
    }
  }

  // Auxiliary Methods

  private collRef(settings?: query): ICollection {

    const collection = this.iToolsService.database().collection('StockLogs');

    settings = (settings || {});

    if (settings.orderBy) {
      settings.orderBy.code = -1;
    } else {
      settings.orderBy = { code: -1 };
    }
    
    collection.orderBy(settings.orderBy);

    if (settings.where) {
      settings.where.push({ field: 'action', operator: '=', value: EStockLogAction.ADJUSTMENT });
      settings.where.push({ field: 'owner', operator: '=', value: Utilities.storeID });
    } else {
      settings.where = [
        { field: 'action', operator: '=', value: EStockLogAction.ADJUSTMENT },
        { field: 'owner', operator: '=', value: Utilities.storeID }
      ];      
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

  // Data processing

  public removeListeners(emitterId: string = null, listenerId: string = null): void {
    Utilities.offEmitterListener(this._dataMonitors, emitterId, listenerId);
  }

  private requestData(settings: query, strict: boolean): Promise<IStockLog[]> {

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
            
            resolve(this.treatData('records'));
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
              reject(error);
            }
          }, 200);
        });
      }
    }));
  }  

  private treatData(id: string, data?: IStockLog[]): any {
    
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

        if (item.data) {

          for (const info of item.data) {

            item.referenceCode = Utilities.prefixCode(info.referenceCode);
            item.quantity = info.quantity;
            item.adjustmentType = info.adjustmentType;
            item.operation = info.operation;
            item.note = info.note;

            records.push(Utilities.deepClone(item));
          }
        }
      });

      records.sort((a, b) => {
        return ((a.code < b.code) ? 1 : ((a.code > b.code) ? -1 : 0));
      });

      return records;
    }
  }

}
