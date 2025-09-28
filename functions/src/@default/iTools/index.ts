import { EventEmitter } from 'events';
import { IAggregate } from './interfaces/IAggregate';
import { ICollectionResult, ICollection } from './interfaces/ICollection';
import { IDocument, IDocumentChange, IDocumentResult } from './interfaces/IDocument';
import { IInitializateAppSettings } from './interfaces/IInitializateAppSettings';
import { EOperationDB } from './enums/EOperation';
import { IDatabase } from './interfaces/IDatabase';
import { IBatch } from './interfaces/IBatch';
import { Utilities } from './utilities/utilities';
import { IGroupBy } from './interfaces/IGroupBy';
import { IUpdateOptions } from './interfaces/IUpdateOptions';

import * as cryptojs from "crypto-js";
import { IAuthenticate, IAuthenticateData } from './interfaces/IAuthenticate';
import { EServiceTypes } from './enums/EServiceTypes';
import { IFunctions } from './interfaces/IFunctions';
import { IStorage } from './interfaces/IStorage';
import { IUploadResult } from './interfaces/IUploadResult';
import { IPath } from './interfaces/IPath';
import { IConnectionData } from './interfaces/IconnectionData';
import { TTimezone } from './types/TTimezones';
import { IBatchOperations } from './interfaces/IBatchOperations';
import { IOrderBy } from './interfaces/IOrderBy';
import { TDeleteMode } from './types/TDeleteMode';
import { ISCheme } from './interfaces/IDocumentScheme';
import { IIndex } from './interfaces/IIndex';
import { IUpload } from './interfaces/IUpload';
import { TLanguage } from './types/TLanguage';
import IWS from 'ws';
import { ICommitResult } from './interfaces/ICommitResult';

if(Utilities.isServer) {   
  var WS: any = <any>IWS;
} else {
  var WS: any = WebSocket;
}

export class iTools {

  private connection: any = null;

  public static initializedApps: {[key: string]: iTools} = {};

  private CRPYPTO_SECRET_KEY = ()=>{ return null }; //this.currentToken ? cryptojs.SHA256(this.currentToken).toString() : null; };

  private connectTryCount: number = 0;
  private initializeAppOptions: any;
  private isLocalMachine: boolean = false;
  private isConnected: boolean = false;
  private isConnecting: boolean = false;

  private _database: IDatabase;
  private _authenticate: IAuthenticate;
  private _functions: IFunctions;
  private _storage: IStorage;

  private currentUser: any = null;
  private currentToken: string = null;

  private initializeAppPromise: any = {
    promise: null,
    resolve: null,
    reject: null,
    data: null
  };

  // Utilities for check and notify app state

  private NOT_INITIALIZED_APP_MESSAGE: string = "APP NOT INITIALIZED."

  constructor(){ 
    if(!Utilities.isServer) { 
      this.checkSuspendedTime();
    }
  }

  public app(appName: string = null, initializeAppOptions: any = null): iTools{
    if(iTools.initializedApps[appName ? appName : "__default__"]){

      return iTools.initializedApps[appName ? appName : "__default__"];
    }else if(initializeAppOptions){

      this.initializeApp(initializeAppOptions, appName).catch(()=>{});
    }
  }

  public initializeAppMesageHandler(event){
    
    (<any>this).root.connection.removeEventListener("message", (<any>this).root.initializeAppMesageHandler);

    let eventData: any = null;

    try{

      eventData = typeof JSON.parse(event.data) == "object" ? JSON.parse(event.data) : JSON.parse(JSON.parse(event.data));
    }catch(e){

      console.error("Invalid Data");
      return;
    }

    (<any>this).root.initializeAppPromise.data = eventData.connection;
    (<any>this).root.isConnected = eventData.connection.status;


    if(eventData.connection.status){

      if(eventData.connection.email){
        (<any>this).root.currentUser = {
          email: eventData.connection.email,
          password: eventData.connection.password,
          _id: eventData.connection.userId,
          encrypted: true
        };

        if(!Utilities.isServer){

          const users = localStorage.getItem("itoolsAuthenticate") ? JSON.parse(localStorage.getItem("itoolsAuthenticate")) : {};
          users[(<any>this).root.currentUser.email] = (<any>this).root.currentUser;
          localStorage.setItem("itoolsAuthenticate", JSON.stringify(users));
        }
      }
      
      (<any>this).root.currentToken = eventData.connection.token;
      (<any>this).root.isConnecting = false;

      if((<any>this).root._database){

        ((<any>this).root._database).config();
      }

      (<any>this).root.connectTryCount = 0;

      (<any>this).root.initializeAppPromise.resolve({
        status: true,
        message: eventData.connection.message
      });
    }else{

      (<any>this).root.connection.close(3000);
      (<any>this).root.isConnecting = false;
      (<any>this).root.initializeAppPromise.reject({
        status: false,
        message: eventData.connection.message
      });
    }
  }

  public async initializeApp(settings: IInitializateAppSettings, appName: string = null){
    return this.initializeAppPromise.promise = new Promise<any>((resolve, reject)=>{

      const self = appName ? new iTools() : this;

      settings = Utilities.deepClone(settings);
      settings.encrypted = settings.encrypted != undefined ? settings.encrypted : false;
      self.currentUser = null;
      self.currentToken = null;
      self.isLocalMachine = (<any>settings).developerMode != undefined ? (<any>settings).developerMode : false;
      self.isLocalMachine = false;
      self.isConnecting = true;
      self.initializeAppOptions = settings;
      const host = self.isLocalMachine ? 'localhost:2000' : 'itools.ipartts.com';
      const protocol = self.isLocalMachine ? "ws://" : "wss://";

      try{
        self.connection = new WS(protocol+host);
      }catch(error){
        self.isConnecting = false;
        reject({
          status: false,
          message: error.message
        });
        return;
      }

      self.initializeAppPromise = {
        promise: null,
        resolve: null,
        data: null
      };
  
      iTools.initializedApps[appName ? appName : "__default__"] = self;
  
      const obj = { connection: self.connectionObject({isAuthenticate: true, token: null}) };
  
      self.connection.addEventListener("open", ()=>{ Utilities.sendRequest(self.connection, obj, null, false); });
  
      (<any>self.connection).handler = self.initializeAppMesageHandler;
      (<any>self.connection).root = self;
  
      self.connection.removeEventListener("message",  self.initializeAppMesageHandler);
      self.connection.addEventListener("message",  self.initializeAppMesageHandler);
  
      self.connection.onclose = (event)=>{
  
        console.log(event);

        self.isConnected = false;
        self.isConnecting = false;
        // self.connectTryCount <= 50 && 
        if(self.connectTryCount <= 50 && self.connection.readyState > 1){


          // console.log(self.connectTryCount);

          if(!event.code || event.code === 1000 || event.code === 1006){
            setTimeout(()=>{    
              this.reconnect(self, settings);
            }, 3000);
          }
          self.connectTryCount++;
        }
      }

      self.connection.onerror = (event)=>{
  
        console.log(event);

      }

      self.initializeAppPromise.resolve = resolve;
      self.initializeAppPromise.reject = reject;
    });
  }

  public close(appName: string = null){
    try{
      iTools.initializedApps[appName ? appName : "__default__"].connection.close();
    }catch(e){}
  }


  public database(){

    if(this._database){ return this._database; }

    const root = this;

    return this._database =  new class Database implements IDatabase{

      public onChangesEmitter: EventEmitter  = new EventEmitter();
      public onSnapshotCollectionCallbacks = {};
      public onSnapshotDocCallbacks = {};
      public onSnapshotReleaseCallbacks = {};
      
      private static shared: Database = null;

      private handlerRouterChanger(event: any){

        // if(Utilities.isAuthResponse(event)){ return; }

        let data: any = null;

        try{

          // Crypto
          // data = cryptojs.AES.decrypt(event.data, root.CRPYPTO_SECRET_KEY()).toString(cryptojs.enc.Utf8);
          data = event.data;
        }catch(e){

          console.error("Invalid Secret Key");
          return;
        }

        data = JSON.parse(data);

        Database.shared.onChangesEmitter.setMaxListeners(10000000);

        if(data.connection.status){

          if(data.releaseInfo){
            Object.values(Database.shared.onSnapshotReleaseCallbacks ? Database.shared.onSnapshotReleaseCallbacks : {}).forEach((item: any)=>{
              if(data.releaseInfo.data._id == item.variation){
                Database.shared.onChangesEmitter.emit(item.listenerID, data.releaseInfo);
              }
            });
          }
  
          if(data.changes){

            data.changes.data.forEach(change => {
              Database.shared.onChangesEmitter.emit(change.listenerID, [change.data]);
            });
          }
  
          if(data.actionResult){
  
            Database.shared.onChangesEmitter.emit(data.connection.requestId, data);
          }
  
          if(data.snapshotActionResult){
  
            Database.shared.onChangesEmitter.emit(data.connection.requestId, data);
          }
        }
      }

      constructor(){

        Database.shared = this;
        this.config();
      }

      public config(){
        if(root.connection){
          root.connection.removeEventListener("message", this.handlerRouterChanger);
          root.connection.addEventListener("message", this.handlerRouterChanger);
        }
      }


      // LIST DATABASES

      public async getDatabases(){
        return new Promise<any>((resolve, reject)=>{
          root.execAfterConnecting(()=>{
            const obj = {
              connection: root.connectionObject(),
              action:{
                type: EOperationDB.LISTDATABASES,
                service: EServiceTypes.DATABASE,
              }
            };
    
            const handler = (data)=>{

              this.onChangesEmitter.removeListener(obj.connection.requestId, handler);
              
              if(!data.actionResult.status){
    
                reject(data.actionResult);
                return;
              }
    
              data = data.actionResult;
              resolve(data);
            };
    
            this.onChangesEmitter.on(obj.connection.requestId, handler);
            Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
          });
        });
      }

      public async deleteDatabase(dbName: string = null){
        return new Promise<any>((resolve, reject)=>{
          root.execAfterConnecting(()=>{
            const obj = {
              connection: root.connectionObject(),
              action:{
                type: EOperationDB.DELETEDATABASE,
                service: EServiceTypes.DATABASE,
                data: {
                  dbName: dbName
                }
              }
            };
    
            const handler = (data)=>{

              this.onChangesEmitter.removeListener(obj.connection.requestId, handler);
              
              if(!data.actionResult.status){
    
                reject(data.actionResult);
                return;
              }
    
              data = data.actionResult;
              resolve(data);
            };
    
            this.onChangesEmitter.on(obj.connection.requestId, handler);
            Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
          });
        });
      }

      // LIST COLLECTIONS

      public async getCollections(): Promise<any>{
        return new Promise<any>((resolve, reject)=>{
          root.execAfterConnecting(()=>{

            if(!root.isConnected){

              reject({
                message: root.NOT_INITIALIZED_APP_MESSAGE
              });
              return;
            }

            const obj = {
              connection: root.connectionObject(),
              action:{
                type: EOperationDB.LISTCOLLECTIONS,
                service: EServiceTypes.DATABASE
              }
            };

            const handler =  (data)=>{

              this.onChangesEmitter.removeListener(obj.connection.requestId, handler);

              if(!data.actionResult.status){ return reject(data.actionResult); }

              data = data.actionResult.data;
              resolve(data);
            };


            this.onChangesEmitter.on(obj.connection.requestId, handler);
            Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
          });
        });
      }


      // SYSTEM LOGS

      public async registerLog(data: any){
        return new Promise<any>((resolve, reject)=>{
          root.execAfterConnecting(()=>{

            if(!root.isConnected){

              reject({
                message: root.NOT_INITIALIZED_APP_MESSAGE
              });
              return;
            }

            const obj = {
              connection: root.connectionObject(),
              action:{
                type: EOperationDB.SYSTEMLOGS,
                service: EServiceTypes.DATABASE,
                mode: "add",
                data: data
              }
            };

            const handler =  (data)=>{

              this.onChangesEmitter.removeListener(obj.connection.requestId, handler);

              if(!data.actionResult.status){ return reject(data.actionResult); }

              data = data.actionResult.data;
              resolve(data);
            };

            this.onChangesEmitter.on(obj.connection.requestId, handler);
            Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
          });
        });
      }


      // TRANSACTIONS

      public batch(){

        return new class Batch implements IBatch{

          private operations: any[] = [];

          public read(settings: IBatchOperations["read"]): void{

            (<any>settings).operation = EOperationDB.READ;
            this.operations.push(settings);
          }

          public update(settings: IBatchOperations["update"] | IDocument, data: any, options: IUpdateOptions = null): number{

            const type = (<any>settings).collection && (<any>settings).collection.id ? "document" : "query";

            options = options && Object.values(options).length > 0 ? options : {merge: true, returnData: false};
            options.merge = options.merge == undefined ? true : options.merge;

            return this.operations.push({
              collName: type == "document" ? (<any>settings).collection.id : (<any>settings).collName,
              docName: type == "document" ? (<any>settings).id : (<any>settings).docName,
              operation: EOperationDB.UPSERT,
              query: (<any>settings).where && type == "query" ? Utilities.mountMatchAggregate((<any>settings).where) : null,
              data: data,
              options: options
            }) - 1;
          }

          public delete(settings: IBatchOperations["delete"] | IDocument): void{

            (<any>settings).mode = (<any>settings).mode ? (<any>settings).mode : "document";
            const type = (<any>settings).collection && (<any>settings).collection.id ? "document" : "query";

            if(!(<any>settings).where && type == "query" && (<any>settings).mode == "document" || (<any>settings).where && Object.values((<any>settings).where).length == 0 && type == "query" && (<any>settings).mode == "document"){

              console.error("where can't be undefined.");
              return;
            }

            if((<any>settings).mode == "collection"){

              if(type == "document"){

                console.error("Document is not valid object for delete collection.");
                return;
              }

              if(!(<any>settings).collName){

                console.error("collName not defined.");
                return;
              }
        
              this.operations.push({
                collName: (<any>settings).collName,
                docName: null,
                query: null,
                operation: EOperationDB.DELETECOLLECTION
              });
            }else{

              this.operations.push({
                collName: type == "document" ? (<any>settings).collection.id : (<any>settings).collName,
                docName: type == "document" ? (<any>settings).id : (<any>settings).docName,
                query: (<any>settings).where && type == "query" ? Utilities.mountMatchAggregate((<any>settings).where) : null,
                operation: EOperationDB.DELETE
              });
            }
          }

          public async commit(): Promise<ICommitResult>{
            return new Promise<ICommitResult>((resolve, reject)=>{
              root.execAfterConnecting(()=>{

                if(!root.isConnected){

                  reject({
                    message: root.NOT_INITIALIZED_APP_MESSAGE
                  });
                  return;
                }

                if(this.operations.length == 0){
    
                  reject({
                    message: "Not has operatios to commit."
                  });
                }else{
    
                  const obj = {
                    connection: root.connectionObject(),
                    action: {
                      data: this.operations,
                      type: EOperationDB.TRANSACTION,
                      service: EServiceTypes.DATABASE
                    }
                  };

                  // console.log(obj);


                  this.operations = [];

                  const handler = (data)=>{

                    Database.shared.onChangesEmitter.removeListener(obj.connection.requestId, handler);

                    if(data.actionResult.status){

                      resolve({
                        places: data.actionResult.places ? data.actionResult.places : {},
                        controls: data.actionResult.controls ? data.actionResult.controls : {},
                        duration: data.actionResult.duration,
                        data: {
                          return: data.actionResult.returnData ? data.actionResult.returnData : {},
                          query: data.actionResult.queryData ? data.actionResult.queryData : {},
                        }
                      });
                    }else{
    
                      reject({
                        message: data.actionResult.message
                      });
                    }
                  };
    
                  Database.shared.onChangesEmitter.on(obj.connection.requestId, handler);
                  Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
                }
              });
            });
          }

          public commitsLength(): number{

            return this.operations.length;
          }

          public getOperations(){

            return this.operations;
          }
        }
      }


      // BACKUP

      public async backup(){
        return await new Promise<any>((resolve, reject)=>{
          root.execAfterConnecting(()=>{
            const obj = {
              connection: root.connectionObject(),
              action:{
                type: EOperationDB.BACKUP,
                service: EServiceTypes.DATABASE,
                data: {
                  type: "ADD"
                }
              }
            };

            const handler = (data)=>{

              this.onChangesEmitter.removeListener(obj.connection.requestId, handler);

              if(!data.actionResult.status){

                reject(data.actionResult);
                return;
              }

              data = data.actionResult;
              resolve(data);
            };

            this.onChangesEmitter.on(obj.connection.requestId, handler);
            Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
          });
        });
      }

      public async deleteBackup(){
        return await new Promise<any>((resolve, reject)=>{
          root.execAfterConnecting(()=>{
            const obj = {
              connection: root.connectionObject(),
              action:{
                type: EOperationDB.BACKUP,
                service: EServiceTypes.DATABASE,
                data: {
                  type: "DELETE"
                }
              }
            };
    
            const handler = (data)=>{

              this.onChangesEmitter.removeListener(obj.connection.requestId, handler);
    
              if(!data.actionResult.status){
    
                reject(data.actionResult);
                return;
              }
    
              data = data.actionResult;
              resolve(data);
            };
    
            this.onChangesEmitter.on(obj.connection.requestId, handler);
            Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
          });
        });
      }

      public async importData(collectionsData: {[key: string]: any[]}, collections: string[] = []){
        return await new Promise<any>((resolve, reject)=>{
          root.execAfterConnecting(()=>{
            const obj = {
              connection: root.connectionObject(),
              action:{
                type: EOperationDB.BACKUP,
                service: EServiceTypes.DATABASE,
                data: {
                  type: "IMPORT",
                  collections: collections ? collections : [],
                  collectionsData: collectionsData ? collectionsData : {},
                }
              }
            };
    
            const handler = (data)=>{

              this.onChangesEmitter.removeListener(obj.connection.requestId, handler);
              
              if(!data.actionResult.status){
    
                reject(data.actionResult);
                return;
              }
    
              data = data.actionResult;
              resolve(data);
            };
    
            this.onChangesEmitter.on(obj.connection.requestId, handler);
            Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
          });
        });

      }

      public async restoreBackup(mode: "manual" | "system", collections: string[] = []){
        return await new Promise<any>((resolve, reject)=>{
          root.execAfterConnecting(()=>{
            const obj = {
              connection: root.connectionObject(),
              action:{
                type: EOperationDB.BACKUP,
                service: EServiceTypes.DATABASE,
                data: {
                  type: "RESTORE",
                  mode: mode,
                  collections: collections ? collections : [],
                }
              }
            };
    
            const handler = (data)=>{
    
              if(!data.actionResult.status){
    
                reject(data.actionResult);
                return;
              }
    
              this.onChangesEmitter.removeListener(obj.connection.requestId, handler);
              data = data.actionResult;
              resolve(data);
            };
    
            this.onChangesEmitter.on(obj.connection.requestId, handler);
            Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
          });
        });
      }

      // ReleaseInfo

      public async getReleaseInfo(variation: string, callback: (_: any)=> void = null){
        return new Promise<any>((resolve, reject)=>{
          root.execAfterConnecting(()=>{

            const obj = {
              connection: root.connectionObject(),
              action:{
                type: EOperationDB.RELEASEINFO,
                service: EServiceTypes.DATABASE,
                variation: variation,
              }
            };
    
            const handler = (data)=>{

              this.onChangesEmitter.removeListener(obj.connection.requestId, handler);
              
              if(!data.actionResult.status){

                reject(data.actionResult);
                return;
              }
    
              data = data.actionResult;
              resolve(data);
            };
    
            this.onChangesEmitter.on(obj.connection.requestId, handler);
            Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
          });
        });
      }

      public onReleaseInfo(variation: string, callback: (_: any)=> void = null): string{

        const listenerId = "release-lid-"  + iTools.requestId();

        this.getReleaseInfo(variation).then((res)=>{ Database.shared.onChangesEmitter.emit(listenerId, res.data); });

        this.onSnapshotReleaseCallbacks[listenerId] = {
          callback: callback,
          status: false,
          listenerID: listenerId,
          variation: variation,
          collName: "Releases",
          aggregate: {$match: {$and: [{_id: variation}]}}
        };

        this.onChangesEmitter.addListener(listenerId, callback);

        return listenerId;
      }

      public clearReleaseInfo(listenerId: string){
        this.onChangesEmitter.removeAllListeners(listenerId);
      }


      // COLLECTION

      public collection(collName: string, scheme: ISCheme = null){
        return new class Collection implements ICollection{

          private database = Database.shared;
          private _aggregate: IAggregate = {};
          private _filterFn: string;
          private scheme: ISCheme = scheme;
          private schemeResult: {status: boolean, message: string};

          get id(){ return collName; }

          constructor(){ 

            this.setupScheme(this.scheme);
          }

          // Utilities

          private setupScheme(scheme: any){

            if(!scheme){ 
              
              this.schemeResult = {
                message: "No scheme",
                status: true
              }
              return;
            }

            root.execAfterConnecting(()=>{
              const exec = ()=>{

                const obj = {
                  connection: root.connectionObject(),
                  action: {
                    collName: this.id,
                    type: EOperationDB.SETUPCOLLECTIONSCHEME,
                    service: EServiceTypes.DATABASE,
                    data: scheme
                  }
                };

                const handler = (data)=>{
                  this.database.onChangesEmitter.removeListener(obj.connection.requestId, handler);
                  this.schemeResult = data.actionResult;
                };

                this.database.onChangesEmitter.on(obj.connection.requestId, handler);
                Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
              };
              
              if(!root.isConnected){
  
              }else{

                exec();
              }
            });
          }

          public execAfterSetupScheme(callback: ()=> void){
            const timer = setInterval(()=>{
              if(this.schemeResult){
                clearInterval(timer);

                if(this.schemeResult.status){

                  callback();
                }else{

                  console.error("Error in scheme setup: ", this.schemeResult.message);
                }
              }
            }, 0);
          }


          // Collection Actions

          public async get(): Promise<ICollectionResult>{
            return new Promise<any>((resolve, reject)=>{
              root.execAfterConnecting(()=>{

                if(!root.isConnected){

                  reject({
                    message: root.NOT_INITIALIZED_APP_MESSAGE
                  });
                  return;
                }


                if((<any>this._aggregate).test){

                  console.log(Utilities.getAggregateObject(this._aggregate, true));
                  return;
                }
  
                const obj = {
                  connection: root.connectionObject(),
                  action:{
                    collName: this.id,
                    type: "READ",
                    service: EServiceTypes.DATABASE,
                    filterFn: this._filterFn,
                    aggregate: this._filterFn ? null : Utilities.getAggregateObject(this._aggregate)
                  }
                };

                const handler =  (data)=>{
  
                  this.database.onChangesEmitter.removeListener(obj.connection.requestId, handler);
    
                  if(!data.actionResult.status){ return reject(data.actionResult); }
    
                  data = data.actionResult.data;
    
                  const result = [];
    
                  data.forEach((item)=>{
                    result.push({
                      data: ()=>{ return item; },
                      ref: this.doc(item._id),
                      id: item._id
                    });
                  });
      
                  resolve({
                    docs: result,
                    changes: ()=>{ return [];},
                    ref: this
                  });
                };
  
                this._filterFn = null;
                this._aggregate = {};
  
                this.database.onChangesEmitter.on(obj.connection.requestId, handler);
                Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
              });
            });
          }

          public onSnapshot(callback: (_: ICollectionResult)=> void, error: (_: any)=>void = ()=>{}): string{

            const aggregate = Utilities.getAggregateObject(this._aggregate);
            const filterFn = this._filterFn;
            const snapshotId: string = "listener-"+iTools.requestId();

            root.execAfterConnecting(()=>{
              if(!root.isConnected){ return null; }
              
              const obj = {
                connection: root.connectionObject(),
                action:{
                  collName: this.id,
                  type: "READ",
                  service: EServiceTypes.DATABASE,
                  filterFn: filterFn,
                  aggregate: filterFn ? null : aggregate
                }
              };

              const objSnapshot = {
                connection: root.connectionObject(),
                action:{
                  collName: this.id,
                  type: "SNAPSHOT",
                  service: EServiceTypes.DATABASE,
                  data: {
                    on: {
                      id: snapshotId,
                      filterFn: filterFn,
                      aggregate: filterFn ? null : aggregate
                    }
                  }
                }
              };

              this.database.onSnapshotCollectionCallbacks[snapshotId].requestObject = Utilities.deepClone(objSnapshot);

              const handler = (data)=>{

                this.database.onChangesEmitter.removeListener(obj.connection.requestId, handler);
                
                if(!data.actionResult.status){
  
                  if(error){ error(data.actionResult); }
                  return;
                }

                const handlerSnapshotActionResult = (data: any)=>{

                  this.database.onChangesEmitter.removeListener(objSnapshot.connection.requestId, handlerSnapshotActionResult);
                  data = data.snapshotActionResult;

                  if(!data){ return; }

                  if(data.status){

                    data.listenerID = objSnapshot.action.data.on.id;
                    this.database.onSnapshotCollectionCallbacks[data.listenerID].status = true;
                  }
                };


                data = data.actionResult.data;
  
                const docs = [];

                data.forEach((item)=>{
  
                  docs.push({
                    data: ()=>{ return item; },
                    ref: this.doc(item._id),
                    id: item._id
                  });
                });
  
                this.database.onChangesEmitter.on(objSnapshot.action.data.on.id, handlerChanges);
                this.database.onChangesEmitter.on(objSnapshot.connection.requestId, handlerSnapshotActionResult);
                Utilities.sendRequest(root.connection, objSnapshot, root.CRPYPTO_SECRET_KEY());
  
                callback({
                  id: this.id,
                  changes: ()=>{ return []; },
                  docs: docs,
                  ref: this
                });
              };
  
              const handlerChanges = (data)=>{
                
                const changes = [];

                data.forEach((change)=>{
                  if(change.operationType == "invalidate" || change.operationType == "drop"){ return; }

                  const changeType = change.operationType == "insert" ? "ADD" :(change.operationType == "replace" || change.operationType == "update") ? "UPDATE" : "DELETE";

                  if(changeType == "UPDATE" || changeType == "ADD"){
                    if(!change.fullDocument){ return; }
                  }

                  changes.push({
                    id: change.operationType == "delete" ? change.documentKey._id : change.fullDocument._id,
                    data: ()=>{ return  change.operationType == "delete" ? change.documentKey : change.fullDocument; },
                    ref: this,
                    type: change.operationType == "insert" ? "ADD" :(change.operationType == "replace" || change.operationType == "update") ? "UPDATE" : "DELETE"
                  });
                });

                if(!changes.length){ return; }

                const obj = {
                  connection: root.connectionObject(),
                  action:{
                    collName: this.id,
                    type: "READ",
                    service: EServiceTypes.DATABASE,
                    aggregate: aggregate
                  }
                };

                const handler = (data)=>{

                  this.database.onChangesEmitter.removeListener(obj.connection.requestId, handler);
                  
                  if(!data.actionResult.status){
    
                    if(error){ error(data.actionResult); }
                    return;
                  }
    
                  data = data.actionResult.data;
                  const docs = [];

                  // console.log("...... ",changes, data);
  
                  data.forEach((item)=>{
    
                    docs.push({
                      data: ()=>{ return item; },
                      ref: this.doc(item._id),
                      id: item._id
                    });
                  });
    
                  callback({
                    id: this.id,
                    changes: ()=> { 
                      return changes;
                    },
                    docs: docs,
                    ref: this
                  });
                };

                this.database.onChangesEmitter.on(obj.connection.requestId, handler);
                Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
              }
  
              this.database.onChangesEmitter.on(obj.connection.requestId, handler,);
              Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
            });

            // this.database.onChangesEmitter.on("");

            this._filterFn = null;
            this._aggregate = {};

            this.database.onSnapshotCollectionCallbacks[snapshotId] = {
              callback: callback,
              status: false,
              listenerID: snapshotId,
              aggregate: aggregate,
            };

            return snapshotId;
          }

          public clearSnapshot(id: string){            

            root.execAfterConnecting(()=>{
              if(!root.isConnected){ return null; }

              const exec = ()=>{
                const objSnapshot = {
                  connection: root.connectionObject(),
                  action:{
                    collName: this.id,
                    type: "SNAPSHOT",
                    service: EServiceTypes.DATABASE,
                    data: {
                      off: {
                        id: id
                      }
                    }
                  }
                };

                const handler = (data)=>{
    
                  data = data.snapshotActionResult;
                  const watchInfo = this.database.onSnapshotCollectionCallbacks[id];
    
                  if(watchInfo){
    
                    this.database.onChangesEmitter.removeListener(objSnapshot.connection.requestId, watchInfo.callback);
                    delete this.database.onSnapshotCollectionCallbacks[data.listenerID];
                  }
                };
    
                this.database.onChangesEmitter.on(objSnapshot.connection.requestId, handler);
                Utilities.sendRequest(root.connection, objSnapshot, root.CRPYPTO_SECRET_KEY());
              };

              if(this.database.onSnapshotCollectionCallbacks){
                const timer = setInterval(()=>{
                  if(this.database.onSnapshotCollectionCallbacks[id]){
                    if(this.database.onSnapshotCollectionCallbacks[id].status){
  
                      exec();
                      clearInterval(timer);
                    }
                  }else{
  
                    clearInterval(timer);
                  }
                }, 200);
              }
              
            });
          }


          // Aggregate Params

          public limit(limit: any){

            if(limit <= 0){ console.error("Limit must be great than 0."); }

            if(!this._aggregate){

              this._aggregate = {
                limit: limit
              };  
            }else{

              this._aggregate.limit = limit;
            }

            return this;
          }

          public startAt(startAt: number){

            if(startAt <= 0){ console.error("StartAt must be great than 0."); }

            this._aggregate["skip"] = startAt == 1 ? 0 : startAt;
            return this;
          }

          public startAfter(startAfter: number){

            if(startAfter < 0){ console.error("StartAfter must be great than or equal 0."); }
            
            this._aggregate["skip"] = startAfter;
            return this;
          }

          public endAt(endAt: number){

            if(this._aggregate["skip"] == null){

              console.error("StartAt or StartAfter must be defined before endAt.");
              return;
            }

            this._aggregate["limit"] = endAt - this._aggregate["skip"] + 1;
            return this;
          }

          public orderBy(orderBy: IOrderBy){

            if(!orderBy && Object.entries(orderBy).length == 0){

              console.error("Define some column to order.");
              return this;
            }

            this._aggregate['sort'] = orderBy;
            return this;
          }

          public where(and: IAggregate["match"]["$and"], test: any = null){

            if(and && Object.values(and).length == 0){ return this; }

            if(!this._aggregate['match']){ this._aggregate['match'] = {$and: []}; }

            if(!this._aggregate['match']["$and"]){this._aggregate["match"]["$and"] = []; }

            if(test){

              (<any>this._aggregate).test = true;
            }

            for(let i in and){

              this._aggregate["match"]["$and"].push(and[i]);
            }
            return this;
          }

          public or(or: IAggregate["match"]["$or"]){

            if(or && Object.values(or).length == 0){ return this; }

            if(!this._aggregate['match']){ this._aggregate['match'] = {$and: []}; }

            if(!this._aggregate['match']["$or"]){this._aggregate["match"]["$or"] = []; }

            for(let i in or){
            
              this._aggregate["match"]["$or"].push(or[i]);
            }
            
            return this;
          }

          public groupBy(groupBy: IGroupBy, project: any = {}){

            if(this._aggregate["count"]){

              console.error("Can only define one these: group or count.");
            }

            if(project && Object.values(project).length){

              for(let i in project){

                project[i] = project[i] ? 1 : 0;
              }

              this._aggregate["project"] = project;
            }

            this._aggregate["group"] = groupBy;
            return this;
          }

          public count(){

            if(this._aggregate["count"]){

              console.error("Can only define one these: group or count.");
            }

            this._aggregate["count"] = "count";
            return this;
          }

          public filter(fn: ()=> boolean){

            this._filterFn = fn.toString();
            return this;
          }


          // Rename

          public async rename(newName: string){
            return new Promise<any>((resolve, reject)=>{
              root.execAfterConnecting(()=>{
                const obj = {
                  connection: root.connectionObject(),
                  action:{
                    type: EOperationDB.RENAMECOLLECTION,
                    service: EServiceTypes.DATABASE,
                    collName: this.id,
                    data: {
                      newName: newName
                    }
                  }
                };

                if(!this.id || this.id && !this.id.trim()){

                  reject({
                    status: false,
                    message: "CollName is undefined."
                  });
                  return;
                }

                if(!newName || newName && !newName.trim()){

                  reject({
                    status: false,
                    message: "Collection new name is undefined."
                  });
                  return;
                }
        
                const handler = (data)=>{
    
                  this.database.onChangesEmitter.removeListener(obj.connection.requestId, handler);
                  
                  if(!data.actionResult.status){
        
                    reject(data.actionResult);
                    return;
                  }
        
                  data = data.actionResult;
                  resolve(data);
                };
        
                this.database.onChangesEmitter.on(obj.connection.requestId, handler);
                Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
              });
            });
          }

          // Delete

          public async delete(mode: TDeleteMode = "document"){
            return new Promise<any>((resolve, reject)=>{              
              root.execAfterConnecting(()=>{
                if(!root.isConnected){

                  reject({
                    message: root.NOT_INITIALIZED_APP_MESSAGE
                  });
                  return;
                }
  
                const obj = {
                  connection: root.connectionObject(),
                  action:{
                    collName: this.id,
                    docName: null,
                    type: "DELETE",
                    service: EServiceTypes.DATABASE,
                    mode: mode,
                    query: mode == "document" ? Utilities.getAggregateObject(this._aggregate).match : null
                  }
                };

  
                if(!obj.action.query && mode == "document"){
  
                  reject({
                    message: "Deletion condition not defined."
                  });
                  return;
                }

  
                const handler =  (data)=>{
                  Database.shared.onChangesEmitter.removeListener(obj.connection.requestId, handler);
                  if(data.actionResult.status){
  
                    resolve(data.actionResult);
                  }else{
  
                    reject(data.actionResult);
                  }
                };
  
                Database.shared.onChangesEmitter.on(obj.connection.requestId, handler);
                Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
              });
            });
          }


          // INDEXES

          public async getIndexes(){
            return new Promise<any>((resolve, reject)=>{              
              root.execAfterConnecting(()=>{
                if(!root.isConnected){

                  reject({
                    message: root.NOT_INITIALIZED_APP_MESSAGE
                  });
                  return;
                }
  
                const obj = {
                  connection: root.connectionObject(),
                  action:{
                    collName: this.id,
                    docName: null,
                    type: EOperationDB.INDEXES,
                    mode: "read",
                    service: EServiceTypes.DATABASE
                  }
                };
  
                const handler =  (data)=>{
                  Database.shared.onChangesEmitter.removeListener(obj.connection.requestId, handler);
                  if(data.actionResult.status){
  
                    resolve(data.actionResult);
                  }else{
  
                    reject(data.actionResult);
                  }
                };
  
                Database.shared.onChangesEmitter.on(obj.connection.requestId, handler);
                Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
              });
            });
          }

          public async createIndexes(data: IIndex[]){
            return new Promise<any>((resolve, reject)=>{              
              root.execAfterConnecting(()=>{
                if(!root.isConnected){

                  reject({
                    message: root.NOT_INITIALIZED_APP_MESSAGE
                  });
                  return;
                }
  
                const obj = {
                  connection: root.connectionObject(),
                  action:{
                    collName: this.id,
                    docName: null,
                    type: EOperationDB.INDEXES,
                    mode: "add",
                    service: EServiceTypes.DATABASE,
                    data: {
                      indexes: data
                    }
                  }
                };
  
                const handler =  (data)=>{
                  Database.shared.onChangesEmitter.removeListener(obj.connection.requestId, handler);
                  if(data.actionResult.status){
  
                    resolve(data.actionResult);
                  }else{
  
                    reject(data.actionResult);
                  }
                };
  
                Database.shared.onChangesEmitter.on(obj.connection.requestId, handler);
                Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
              });
            });
          }

          public async deleteIndex(name: string){
            return new Promise<any>((resolve, reject)=>{              
              root.execAfterConnecting(()=>{
                if(!root.isConnected){

                  reject({
                    message: root.NOT_INITIALIZED_APP_MESSAGE
                  });
                  return;
                }
  
                const obj = {
                  connection: root.connectionObject(),
                  action:{
                    collName: this.id,
                    docName: null,
                    type: EOperationDB.INDEXES,
                    mode: "delete",
                    service: EServiceTypes.DATABASE,
                    data: {
                      name: name
                    }
                  }
                };
  
                const handler =  (data)=>{
                  Database.shared.onChangesEmitter.removeListener(obj.connection.requestId, handler);
                  if(data.actionResult.status){
  
                    resolve(data.actionResult);
                  }else{
  
                    reject(data.actionResult);
                  }
                };
  
                Database.shared.onChangesEmitter.on(obj.connection.requestId, handler);
                Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
              });
            });
          }


          // DOCUMENT

          public doc(docName: string = null){

            const collection = this;

            return new class Document implements IDocument{

              get collection(){ return collection };
              get id(){ return docName && docName.trim() ? docName.trim() : null; }

              constructor(){ }

              // Document Actions

              public async get(): Promise<IDocumentResult>{
                return new Promise<any>((resolve, reject)=>{
                  root.execAfterConnecting(()=>{
                    if(!root.isConnected){

                      reject({
                        message: root.NOT_INITIALIZED_APP_MESSAGE
                      });
                      return;
                    }
  
                    if(this.id == undefined){
                      setTimeout(()=>{
    
                        reject({
                          message: "DocumentId is not defined."
                        });
                      }, 200);
                    }else{
    
                      const handler = (data)=>{

                        this.collection.database.onChangesEmitter.removeListener(obj.connection.requestId, handler);
    
                        if(!data.actionResult.status){ return reject(data.actionResult); }
    
                        const result =  data.actionResult.data ?  data.actionResult.data[0] : null;
  
                        resolve({
                          data: ()=>{ return result; },
                          ref: this,
                          id: result ? result._id : result
                        });
                      };
    
                      const obj = {
                        connection: root.connectionObject(),
                        action: {
                          collName: this.collection.id,
                          docName: this.id,
                          type: "READ",
                          service: EServiceTypes.DATABASE,
                        }
                      };

                      this.collection.database.onChangesEmitter.on(obj.connection.requestId, handler);
                      Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
                    }
                  });
                });
              }
    
              public onSnapshot(callback: (_: IDocumentChange)=> void, error: (_: any)=> void = ()=> {}, test: any = null): string{

                const snapshotId: string = "listener-"+iTools.requestId();

        
                root.execAfterConnecting(()=>{
                  if(!root.isConnected || !this.id){ return null; }

                  const obj = {
                    connection: root.connectionObject(),
                    action:{
                      collName: this.collection.id,
                      docName: this.id,
                      service: EServiceTypes.DATABASE,
                      type: "READ"
                    }
                  };

                  const objSnapshot = {
                    connection: root.connectionObject(),
                    action:{
                      collName: this.collection.id,
                      type: "SNAPSHOT",
                      service: EServiceTypes.DATABASE,
                      data: {
                        on: {
                          id: snapshotId,
                          aggregate: {
                            match: {"_id": this.id}
                          }
                        }
                      }
                    }
                  };

                  this.collection.database.onSnapshotDocCallbacks[snapshotId].requestObject = Utilities.deepClone(objSnapshot);
            
                  const handler = (data)=>{

                    this.collection.database.onChangesEmitter.removeListener(obj.connection.requestId, handler);
                    
                    if(!data.actionResult.status){
  
                      if(error){ error(data.actionResult); }
                      return;
                    }
  
                    data = data.actionResult.data;

                    const result = data[0];

                    const handlerSnapshotActionResult = (data: any)=>{

                      this.collection.database.onChangesEmitter.removeListener(objSnapshot.connection.requestId, handlerSnapshotActionResult);
                      data = data.snapshotActionResult;
    
                      if(data.status){
    
                        data.listenerID = objSnapshot.action.data.on.id;
                        this.collection.database.onSnapshotDocCallbacks[data.listenerID].status = true;
                      }
                    };

                    this.collection.database.onChangesEmitter.on(objSnapshot.action.data.on.id, handlerChanges);
                    this.collection.database.onChangesEmitter.on(objSnapshot.connection.requestId, handlerSnapshotActionResult);
                    Utilities.sendRequest(root.connection, objSnapshot, root.CRPYPTO_SECRET_KEY());
  
                    callback({
                      id: result ? result._id : undefined,
                      data: ()=>{ return result; },
                      ref: this,
                      type: "ADD"
                    });
                  };
  
                  const handlerChanges = (data)=>{

                    const change = data[0];

                    if(!change){ return; }

                    if(change.operationType == "invalidate" || change.operationType == "drop"){ return; }

                    callback({
                      id: change.operationType == "delete" ? change.documentKey._id : change.fullDocument._id,
                      data: ()=>{ return  change.operationType == "delete" ? change.documentKey : change.fullDocument; },
                      ref: this,
                      type: change.operationType == "insert" ? "ADD" :(change.operationType == "replace" || change.operationType == "update") ? "UPDATE" : "DELETE"
                    });
                  }
  
                  this.collection.database.onChangesEmitter.on(obj.connection.requestId, handler);
                  Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
                });
                
                this.collection.database.onSnapshotDocCallbacks[snapshotId] = {
                  callback: callback,
                  snapshotId: snapshotId,
                  docName: this.id,
                };

                return snapshotId;
              }
    
              public clearSnapshot(id: string){
                root.execAfterConnecting(()=>{
                  if(!root.isConnected){ return null; }

                  const exec = ()=>{

                    const objSnapshot = {
                      connection: root.connectionObject(),
                      action:{
                        collName: this.collection.id,
                        type: "SNAPSHOT",
                        service: EServiceTypes.DATABASE,
                        data: {
                          off: {
                            id: id
                          }
                        }
                      }
                    };
        
                    const handler = (data)=>{
        
                      data = data.snapshotActionResult;
                      const watchInfo = this.collection.database.onSnapshotDocCallbacks[id];

                      if(watchInfo){
        
                        this.collection.database.onChangesEmitter.removeListener(objSnapshot.connection.requestId, watchInfo.callback);
                        delete this.collection.database.onSnapshotDocCallbacks[data.listenerID];
                      }
                    };
      
                    this.collection.database.onChangesEmitter.on(objSnapshot.connection.requestId, handler);
                    Utilities.sendRequest(root.connection, objSnapshot, root.CRPYPTO_SECRET_KEY());
                  };

                  if(this.collection.database.onSnapshotDocCallbacks){
                    const timer = setInterval(()=>{
                      if(this.collection.database.onSnapshotDocCallbacks[id]){
                        if(this.collection.database.onSnapshotDocCallbacks[id].status){

                          exec();
                          clearInterval(timer);
                        }
                      }else{
      
                        clearInterval(timer);
                      }
                    }, 200);
                  }

                });
              }

              public update(data: any, options: IUpdateOptions = null){
                return new Promise<any>((resolve, reject)=>{
                  root.execAfterConnecting(()=>{
                    const exec = ()=>{

                      if(!data && !options || data && Object.entries(data).length == 0 && !options){
                        reject({
                          status: false,
                          message: "Data is null"
                        });
                        return;
                      }

                      if(this.collection.id.toLowerCase().trim() === "authenticate"){
      
                        reject({
                          message: "Entity reserved to the system."
                        });
                        return;
                      }

                      const obj = {
                        connection: root.connectionObject(),
                        action: {
                          collName: this.collection.id,
                          docName: this.id && this.id.trim() ? this.id.trim() : null,
                          type: "UPDATE",
                          service: EServiceTypes.DATABASE,
                          data: data,
                          options: options
                        }
                      };
      
                      const handler = (data)=>{
                        this.collection.database.onChangesEmitter.removeListener(obj.connection.requestId, handler);
                        if(data.actionResult.status){

                          resolve(data.actionResult);
                        }else{
                          
                          reject(data.actionResult);
                        }
                      };
      
                      this.collection.database.onChangesEmitter.on(obj.connection.requestId, handler);
                      Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
                    };
  
                    if(!root.isConnected){
  
                      reject({
                        message: root.NOT_INITIALIZED_APP_MESSAGE
                      });
                    }else{

                      this.collection.execAfterSetupScheme(()=>{

                        exec();
                      });    
                    }
                  });
                });
              }

              public async delete(){
                return new Promise<any>((resolve, reject)=>{
                  root.execAfterConnecting(()=>{

                    if(!root.isConnected){
  
                      reject({
                        message: root.NOT_INITIALIZED_APP_MESSAGE
                      });
                      return;
                    }

                    const exec = ()=>{
                      if(this.collection.id.toLowerCase().trim() === "authenticate"){
  
                        reject({
                          message: "Entity reserved to the system."
                        });
                        return;
                      }

                      if(!this.id || this.id && !this.id.trim()){

                        reject({
                          message: "DocumentId is not defined."
                        });
                        return;
                      }
      
                      const obj = {
                        connection: root.connectionObject(),
                        action:{
                          collName: this.collection.id,
                          docName: this.id,
                          service: EServiceTypes.DATABASE,
                          mode: "document",
                          type: "DELETE"
                        }
                      };

                      const handler =  (data)=>{
                        Database.shared.onChangesEmitter.removeListener(obj.connection.requestId, handler);
                        if(data.actionResult.status){
                          resolve(data.actionResult);
                        }else{
                          reject(data.actionResult);
                        }
                      };
      
                      Database.shared.onChangesEmitter.on(obj.connection.requestId, handler);
                      Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
                    };
                    exec();
                  });
                });
              }
            }
          }
        }
      }
      
    };
  }

  public auth(){

    if(this._authenticate){ return this._authenticate; }

    const root = this;

    return this._authenticate = new class implements IAuthenticate{

      constructor(){ }

      public async createUser(user: IAuthenticateData = null, secretKey: string = null){
        return new Promise<any>((resolve, reject)=>{
          root.execAfterConnecting(()=>{

            if(!user || user && Object.values(user).length == 0){

              reject({
                status: false,
                message: "User data can't be empty."
              });
            }

            user.password = cryptojs.SHA256(user.password).toString();

            if(!root.isConnected){

              reject({
                message: root.NOT_INITIALIZED_APP_MESSAGE
              });
              return;
            }

            const obj = {
              connection: root.connectionObject(),
              action: {
                type: "VALIDATE_SECRET_KEY",
                service: EServiceTypes.DATABASE,
                secretKey: secretKey
              }
            };

            user.email = user.email.toLowerCase();
  
            const callback = (data)=>{
  
              if(secretKey){
                if(!data.status){ reject(data); return; }
                (<any>user).type = "root";
              }
  
              root.database().collection("#SYSTEM_AUTHENTICATE#").where([
                {field: "email", operator: "=", "value": user.email}
              ]).get().then((data)=>{
                if(data.docs.length > 0){
  
                  reject({
                    status: false,
                    message: "User already registered.",
                    code: "user-already-registered"
                  });
                }else{
                  this.update(null,user).then(()=>{
  
                    resolve({
                      status: true,
                      message: "User was created with success."
                    });
                  }).catch((error)=>{
  
                    reject({
                      status: false,
                      message: "Error in create user.",
                      code: "user-can-not-register"
                    });
                  });
                }
              }).catch((data)=>{
  
                reject({
                  status: false,
                  message: "Error in read users.",
                  code: "can-not-read-users"
                });
              });
            };
  
            const handler = (event)=>{

              // if(Utilities.isAuthResponse(event)){ return; }
  

              let data: any = null;
    
              try{
      
                // data = cryptojs.AES.decrypt(event.data, root.CRPYPTO_SECRET_KEY()).toString(cryptojs.enc.Utf8);
                data = event.data;
              }catch(e){
      
                console.error("Invalid projectId");
                return;
              }
      
              data = JSON.parse(data);
  
              if(data.actionResult && data.connection.requestId === obj.connection.requestId){
                if(data.actionResult.status){
                  
                  callback(data.actionResult);
                }else{
    
                  callback(data.actionResult);
                }
    
                root.connection.removeEventListener("message", handler);
              }
            };
            
            root.connection.addEventListener("message", handler);
            Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
          });
        });
      }

      public async updateUser(user: IAuthenticateData = null){
        return new Promise<any>((resolve, reject)=>{
          root.execAfterConnecting(()=>{

            if(!root.isConnected){

              reject({
                message: root.NOT_INITIALIZED_APP_MESSAGE
              });
              return;
            }

            user = user ? user : root.currentUser;

            if(!user || user && Object.values(user).length == 0 || !user && !root.currentUser || user && Object.values(user).length == 0 && !root.currentUser){
  
              reject({
                status: false,
                message: "User data can't be empty.",
                code: "user-data-is-empty"
              });
            }
  
            if(!user._id && !user.email){
    
              reject({
                status: false,
                message: "_id and email can't be undefined.",
                code: "email-is-undefined"
              });
            }
  
            if(user.password){
              user.password = cryptojs.SHA256(user.password).toString();
            }

            user.email = user.email.toLowerCase();
  
            root.database().collection("#SYSTEM_AUTHENTICATE#").where([
              {field: "email", "operator": "=", "value": user.email}
            ]).get().then((data)=>{
              if(data.docs.length > 0){
                this.update(data.docs[0].data()._id, user).then(()=>{
  
                  resolve({
                    status: true,
                    message: "User was updated with success."
                  });
                }).catch(()=>{
      
                  reject({
                    status: false,
                    message: "Error in updated user.",
                    code: "can-not-update-user"
                  });
                });
              }else{
  
                reject({
                  status: false,
                  message: "User not found.",
                  code: "can-not-find-user"
                });
              }
            });
          });
        });
      }

      public async deleteUser(user: IAuthenticateData = null){
        return new Promise<any>((resolve, reject)=>{
          root.execAfterConnecting(()=>{

            if(!root.isConnected){

              reject({
                message: root.NOT_INITIALIZED_APP_MESSAGE
              });
              return;
            }

            user = user ? user : root.currentUser;

            if(!user || user && Object.values(user).length == 0){
  
              reject({
                status: false,
                message: "User data can't be empty."
              });
            }
    
            if(!user._id && !user.email){
    
              reject({
                status: false,
                message: "_id and email can't be undefined."
              });
            }
  
            root.database().collection("#SYSTEM_AUTHENTICATE#").where([
              {field: "email", operator: "=", "value": user.email}
            ]).get().then((data)=>{
              if(data.docs.length > 0){
                this.delete(data.docs[0].data()._id).then((data)=>{
  
                  resolve({
                    status: true,
                    message: "User was deleted with success."
                  });
                }).catch(()=>{
      
                  reject({
                    status: false,
                    message: "Error in delete user."
                  });
                });
              }else{
  
                reject({
                  status: false,
                  message: "User already deleted."
                });
              }
            });
          });
        });
      }

      public async login(email: string, password: string, adminKey: string = null){
        return new Promise<any>((resolve, reject)=>{

          if(!email || email && !email.trim() || !password || password && !password.trim()){

            reject({
              status: false,
              message: "The fields: email and password can't be null."
            });
            return;
          }

          root.initializeApp(<any>{
            email: email,
            password: password,
            projectId: root.initializeAppOptions.projectId,
            adminKey: adminKey,
            encrypted: false
          }).then((data)=>{
            if(data.status){

              resolve({
                status: true,
                message: "User was logged with success."
              });
            }else{

              reject({
                status: false,
                message: "Error in realized user login."
              });
            }
          }).catch((error)=>{

            reject({
              status: false,
              message: error.message
            });
          })
        });
      }

      public async logout(){
        return new Promise<any>((resolve, reject)=>{
          root.execAfterConnecting(()=>{

            if(!root.isConnected){

              reject({
                message: root.NOT_INITIALIZED_APP_MESSAGE
              });
              return;
            }

            if(!root.currentUser){

              reject({
                status: false,
                message: "No has user logged."
              });
              return;
            }
  
            const obj = { connection: root.connectionObject({isLogout: true}) };
  
            const handler = (event)=>{
  
              // if(Utilities.isAuthResponse(event)){ return; }

              let data: any = null;
  
              try{
      
                // data = cryptojs.AES.decrypt(event.data, root.CRPYPTO_SECRET_KEY()).toString(cryptojs.enc.Utf8);
                data = event.data;
              }catch(e){
      
                console.error("Invalid projectId");
                return;
              }
      
              data = JSON.parse(data);

              if(data.actionResult && data.connection.requestId === obj.connection.requestId){
                if(data.actionResult.status){
                  
                  root.currentUser = null;
                  root.currentToken = null;
                  resolve(data.actionResult);
                }else{
  
                  reject(data.actionResult);
                }
  
                root.connection.removeEventListener("message", handler);
              }
            };
  
            root.connection.addEventListener("message", handler);
            Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
          });
        });
      }

      public async recoverPassword(email: string = null, receiveEmail: string = null, language: TLanguage = "en_US"){
        return new Promise<any>((resolve, reject)=>{
          root.execAfterConnecting(()=>{
            
            if(!root.isConnected){

              reject({ message: root.NOT_INITIALIZED_APP_MESSAGE });
              return;
            }

            email = email ? email : root.currentUser.email;
            receiveEmail = receiveEmail ? receiveEmail : email;

            const obj = {
              connection: root.connectionObject(),
              action: {
                type: "RESETPASSWORD",
                data: {email: email, receiveEmail: receiveEmail},
                language: language,
                service: EServiceTypes.DATABASE
              }
            };
    
            const handler = (event)=>{

              // if(Utilities.isAuthResponse(event)){ return; }
      
              let data: any = null;
    
              try{
      
                // data = cryptojs.AES.decrypt(event.data, root.CRPYPTO_SECRET_KEY()).toString(cryptojs.enc.Utf8);
                data = event.data;
                data = JSON.parse(data);
              }catch(e){
                try{ data = JSON.parse(event.data); }catch(e){
    
                  console.error("Invalid Data");
                }
                return;
              }
    
              if(data.actionResult && data.connection.requestId === obj.connection.requestId){
                if(data.actionResult.status){
                  
                  resolve(data.actionResult);
                }else{
    
                  reject(data.actionResult);
                }
    
                root.connection.removeEventListener("message", handler);
              }
            };
    
            root.connection.addEventListener("message", handler);
            Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
          });
        });
      }

      private update(id: string = null, data: any, options: IUpdateOptions = null){
        return new Promise<any>((resolve, reject)=>{
          root.execAfterConnecting(()=>{

            if(!root.isConnected){
              reject({ message: root.NOT_INITIALIZED_APP_MESSAGE });
            }
    
            if(!data && !options || data && Object.entries(data).length == 0 && !options){
    
              reject({
                status: false,
                message: "Data is null"
              });
              return;
            }
  
            const obj = {
              connection: root.connectionObject(),
              action: {
                collName: "#SYSTEM_AUTHENTICATE#",
                docName: id,
                type: "UPDATE",
                service: EServiceTypes.DATABASE,
                data: data,
                options: options
              }
            };
  
            const handler = (event)=>{

              // if(Utilities.isAuthResponse(event)){ return; }
  
              let data: any = null;
    
              try{
      
                // data = cryptojs.AES.decrypt(event.data, root.CRPYPTO_SECRET_KEY()).toString(cryptojs.enc.Utf8);
                data = event.data;
              }catch(e){
      
                console.error("Invalid projectId");
                return;
              }
      
              data = JSON.parse(data);
  
              if(data.actionResult && data.connection.requestId === obj.connection.requestId){
                if(data.actionResult.status){
                  
                  resolve(data.actionResult);
                }else{
    
                  reject(data.actionResult);
                }
    
                root.connection.removeEventListener("message", handler);
              }
            };
  
            root.connection.addEventListener("message", handler);
            Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
          });
        });
      }

      private async delete(id: string){
        return new Promise<any>((resolve, reject)=>{
          root.execAfterConnecting(()=>{

            if(!root.isConnected){

              reject({ message: root.NOT_INITIALIZED_APP_MESSAGE });
              return;
            }
  
            const obj = {
              connection: root.connectionObject(),
              action:{
                collName: "#SYSTEM_AUTHENTICATE#",
                docName: id,
                mode: "document",
                type: "DELETE",
                service: EServiceTypes.DATABASE
              }
            };
  
            const handler = (event)=>{

              // if(Utilities.isAuthResponse(event)){ return; }
  
              let data: any = null;
    
              try{
      
                // data = cryptojs.AES.decrypt(event.data, root.CRPYPTO_SECRET_KEY()).toString(cryptojs.enc.Utf8);
                data = event.data;
              }catch(e){
      
                console.error("Invalid projectId");
                return;
              }
      
              data = JSON.parse(data);
      
              if(data.actionResult && data.connection.requestId === obj.connection.requestId){
                if(data.actionResult.status){
                  
                  resolve(data.actionResult);
                }else{
    
                  reject(data.actionResult);
                }
                root.connection.removeEventListener("message", handler);
              }
            };
    
            root.connection.addEventListener("message", handler);
            Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
          });
        });
      }

    };

  }

  public functions(){
    
    if(this._functions){  return this._functions; }

    const root = this;

    return this._functions = new class implements IFunctions{
      
      public async call(fn: string, data: any = null){
        return new Promise<any>((resolve, reject)=>{

          root.execAfterConnecting(()=>{
            if(!fn || fn && !fn.trim()){
  
              reject({
                status: false,
                message: "Function name can't be null."
              });
              return;
            }
  
            const obj = {
              connection: root.connectionObject(),
              action: {
                functionName: fn,
                service: EServiceTypes.FUNCTIONS,
                data: data ? data : null
              }
            };
  
            const handler = (event)=>{
  
              // if(Utilities.isAuthResponse(event)){ return; }

              let data: any = null;

              try{
      
                // data = cryptojs.AES.decrypt(event.data, root.CRPYPTO_SECRET_KEY()).toString(cryptojs.enc.Utf8);
                data = event.data;
                data = JSON.parse(data);
              }catch(e){
                try{ data = JSON.parse(event.data); }catch(e){
  
                  console.error("Invalid Data");
                }
                return;
              }
  
              if(data.actionResult && data.connection.requestId === obj.connection.requestId){

                if(typeof data.actionResult.data == "string"){
                  try{
                    const response = JSON.parse(data.actionResult.data);
                    if(response){
                      data.actionResult.data = response;
                    }
                  }catch(error){}
                }

                if(data.actionResult.status){
                  
                  resolve(data.actionResult);
                }else{
    
                  reject(data.actionResult);
                }
                root.connection.removeEventListener("message", handler);
              }
            };
  
            root.connection.addEventListener("message", handler);

            Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
          });
        });
      }
    };
  }

  public storage(){

    if(this._storage){ return this._storage; }

    const root = this;

    return this._storage = new class implements IStorage{

      private host: string = root.isLocalMachine ? "localhost:3003" : "storage.ipartts.com";

      public async delete(paths: string[]){
        return new Promise<any>((resolve, reject)=>{
          root.execAfterConnecting(()=>{

            if(!root.isConnected){

              reject({ message: root.NOT_INITIALIZED_APP_MESSAGE });
              return;
            }

            this.getAthorization((data)=>{
              if(data.status){
                const objStorage = {
                  connection: {...data.data.connection,secretKey: data.data.secretKey},
                  paths: paths
                };
  
                Utilities.request({
                  url: `https://${this.host}/delete`,
                  type: "POST",
                  data: objStorage,
                  formData: false,
                  success: (data)=>{
  
                    data = JSON.parse(data);
                    resolve(data);
                  },
                  error: (data)=>{
        
                    reject({
                      status: false,
                      message: "Error in send Request"
                    });
                  }
                })  
              }else{
  
                reject(data);
              }
            });
          });
        });
      }

      public async upload(data: IUpload[]): Promise<IUploadResult>{
        return new Promise<any>((resolve, reject)=>{
          root.execAfterConnecting(()=>{
          
            if(!root.isConnected){

              reject({ message: root.NOT_INITIALIZED_APP_MESSAGE });
              return;
            }

            const settings = data;

            const handlerFile = async (data: any)=>{
              return new Promise<any>((resolve, reject)=>{
                const file = data.file instanceof FileList ? data.file[0] : data.file;
                const name = (()=>{

                  if(data.name && data.name.lastIndexOf(".") == -1){
                    const ext = data.file.name ? data.file.name.substring(data.file.name.lastIndexOf(".") - 1) : "";
                    data.name = data.name + ext;
                  }

                  return data.name ? data.name : data.file.name;
                })();
                const reader = new FileReader();
                
                reader.onloadend = ()=>{ 
                  resolve({
                    data: reader.result,
                    name: name,
                  });
                };
                reader.readAsArrayBuffer(file);
              });
            };
  
            const handlerStorage = (data: any)=>{

              let fileCount = settings.length;
  
              const objStorage = {
                connection: {...data.data.connection,secretKey: data.data.secretKey},
                $files: []
              };
  
              settings.forEach((file)=>{
                if(file.file){
                  handlerFile(file).then((res)=>{
                    objStorage.$files.push({
                      name: res.name,
                      data: res.data
                    });
                    fileCount--;
                  });
                }else{
                  objStorage.$files.push({
                    name: file.name,
                    data: file.data
                  });
                  fileCount--;
                }
              });

              const timer = setInterval(()=>{
                if(fileCount <= 0){

                  clearInterval(timer);

                  Utilities.request({
                    url: `https://${this.host}/upload`,
                    type: "POST",
                    data: objStorage,
                    formData: true,
                    success: (data)=>{
    
                      data = JSON.parse(data);
                      const files = [];
    
                      data.uploadedUrls.forEach((file)=>{
                        files.push({
                          path: file,
                          getDownloadUrl: async ()=>{ return this.getDownloadUrl(file); }
                        });
                      });
    
                      resolve({
                        status: true,
                        uploadedUrls: files,
                        notUploadedUrls: data.notUploadedUrls
                      });
                    },
                    error: (data)=>{
                      reject({
                        status: false,
                        message: "Error in send Request"
                      });
                    }
                  });
                }
              }, 0);
            };
            
            this.getAthorization((data)=>{
              if(data.status){

                handlerStorage(data);
              }else{
                
                reject(data);
              }
            });
  
          });
        });
      }

      public async listDir(dir: string){
        return new Promise<any>((res, rej)=>{
          root.execAfterConnecting(()=>{

            if(!root.isConnected){

              rej({ message: root.NOT_INITIALIZED_APP_MESSAGE });
              return;
            }

            this.getAthorization((data)=>{
              if(data.status){
                const objStorage = {
                  connection: {...data.data.connection,secretKey: data.data.secretKey},
                  dir: dir
                };

                Utilities.request({
                  url: `https://${this.host}/listDir`,
                  type: "POST",
                  data: objStorage,
                  formData: false,
                  success: (data)=>{

                    data = JSON.parse(data);
                    res(data);
                  },
                  error: (data)=>{
        
                    rej({
                      status: false,
                      message: "Error in send Request"
                    });
                  }
                });  
              }else{
  
                rej(data);
              }
            });
          });
        });
      }

      public path(path): IPath{
        return {
          path: path,
          getDownloadUrl: async ()=> { return this.getDownloadUrl(path)},
          delete: async ()=>{ return this.delete([path]) },
          upload: async (data: ArrayBuffer | File | FileList)=>{ 

            data = (()=>{
              if(data instanceof ArrayBuffer){ return data; }
              else if(data instanceof File){ return data; }
              else if(data instanceof FileList){ return data[0]; }
            })();

            return this.upload([data instanceof File ? {file: data, name: path} : {data: data, name: path}]); 
          }
        };
      }

      /// UTILITIES

      private getAthorization(callback: (_: any)=>void){

        const obj = {
          connection: root.connectionObject(),
          action: {
            type: "AUTHORIZATION",
            service: EServiceTypes.STORAGE
          }
        };

        const handler = (event)=>{
  
          // if(Utilities.isAuthResponse(event)){ return; }

          let data: any = null;

          try{
  
            // data = cryptojs.AES.decrypt(event.data, root.CRPYPTO_SECRET_KEY()).toString(cryptojs.enc.Utf8);
            data = event.data;
            data = JSON.parse(data);
          }catch(e){
  
            try{

              data = JSON.parse(event.data);
            }catch(e){

              console.error("Invalid Data");
            }
            return;
          }

          if(data.actionResult && data.connection.requestId === obj.connection.requestId){
            if(data.actionResult.status){
              
              callback(data.actionResult);
            }else{

              callback(data.actionResult);
            }

            root.connection.removeEventListener("message", handler);
          }
        };

        root.connection.addEventListener("message", handler);
        Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
      }

      private async getDownloadUrl(path: string){
        return new Promise<any>((res, rej)=>{
          root.execAfterConnecting(()=>{
            
            if(!root.isConnected){

              rej({ message: root.NOT_INITIALIZED_APP_MESSAGE });
              return;
            }

            this.getAthorization((data)=>{
              if(data.status){
                Utilities.request({
                  url: `https://${this.host}/getDownloadUrl`,
                  type: "POST",
                  data: {path: path,connection: {...data.data.connection,secretKey: data.data.secretKey}},
                  formData: false,
                  headers: 'Content-Type: apllication/json',
                  success: (data)=>{

                    data = JSON.parse(data);
                    res(data);
                  },
                  error: (data)=>{
        
                    rej({
                      status: false,
                      message: "Error in send Request"
                    });
                  }
                });
              }else{
  
                rej(data);
              }
            });
          })
        });
      }

    };
  }


  // Utilities

  private reconnect(self: any, settings: any){
    self.initializeApp(settings).then(()=>{ 
      console.clear();
      // console.log("***** recconected *****");
      const cs = [];

      (<any>settings).auoReconnect = true;

      Object.values((<any>self.database()).onSnapshotCollectionCallbacks).forEach((item: any) => { cs.push(item.requestObject); });
      Object.values((<any>self.database()).onSnapshotDocCallbacks).forEach((item: any) => { cs.push(item.requestObject); });

      const objSnapshot = {
        connection: self.connectionObject(),
        action:{
          type: "SNAPSHOT",
          service: EServiceTypes.DATABASE,
          mode: "RECONNECT",
          data: cs
        }
      };

      (<any>self.database()).onChangesEmitter.emit("recconect", {});

      Utilities.sendRequest(self.connection, objSnapshot, self.CRPYPTO_SECRET_KEY());
    });
  }

  private checkSuspendedTime() {

    let last = (new Date()).getTime();
    let isStart: boolean = true;
    let hasFocus: boolean = false;

    window.addEventListener("load", (event)=>{ hasFocus = true; });
    window.addEventListener("blur", (event)=>{ hasFocus = false; });
    window.addEventListener("focus", (event)=>{ hasFocus = true; });

    const _ = setInterval(() => {

      let current = (new Date()).getTime();

      // 120000
      // && hasFocus

      if(((current - last) > 120000) && !isStart) {
        isStart = true;
        
        window.location.href = window.location.href;
        // console.log("--------");
        // this.reconnect(this, this.initializeAppOptions);
      } else {
        isStart = false;
      }

      last = current;
    }, 500);
  }
  
  private static requestId() {
    return ('xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    }) + new Date().getTime().toString());
  }

  private connectionObject: any = (options: IConnectionData = {})=>{

    const email = ()=>{
      if(this.currentUser){

        return this.currentUser.email;
      }else{

        return this.initializeAppOptions.email && this.initializeAppOptions.email.trim()? this.initializeAppOptions.email : null;
      }
    };

    const password = ()=>{
      if(this.currentUser){

        return this.currentUser.password;
      }else{
        if(this.initializeAppOptions.encrypted){
          return this.initializeAppOptions.password && this.initializeAppOptions.password.trim() ? this.initializeAppOptions.password.trim() : null;
        }else{
          return this.initializeAppOptions.password && this.initializeAppOptions.password.trim() ? cryptojs.SHA256(this.initializeAppOptions.password).toString() : null;
        }
      }
    };

    const obj = {
      requestId: this.initializeAppOptions.requestId ? this.initializeAppOptions.requestId : iTools.requestId(),
      email: email(),
      password: password(),
      projectId: this.initializeAppOptions.projectId ? this.initializeAppOptions.projectId : null,
      isAuthenticate: false,
      isLogout: false,
      adminKey: this.initializeAppOptions.adminKey ? this.initializeAppOptions.adminKey : null,
      token: this.currentToken,
      ...options
    };

    // console.log(obj);

    return obj;
  };

  private execAfterConnecting = (callback: ()=>void)=>{
    const timer = setInterval(()=>{
      if(!this.isConnecting){

        clearInterval(timer);

        if(!this.isConnected){

          this.reconnect(this, this.initializeAppOptions);
          const timer2 = setInterval(()=>{
            if(!this.isConnecting){
              clearInterval(timer2);
              callback();
            }
          });
        }else{

          callback();
        }
      }
    });
  };

  public static ObjectId(){
    let timestamp = (new Date().getTime() / 1000 | 0).toString(16);
    return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function() {
      return (Math.random() * 16 | 0).toString(16);
    }).toLowerCase();
  };
  
  public static FieldValue = new class{
    
    public control(collName: string, docName: string, propertyName: string = null, step: number = 1,){

      if(!step || step <= 0){

        console.error("step must be great than 0.");
        return undefined;
      }

      return propertyName && propertyName.trim() ? `$control(${collName},${docName},${step},${propertyName.trim()})` : `$control(${collName},${docName},${step})`;
    }

    public bindBatchData(index: number, propertyName: string){

      return `$bindBatchData(${index},${propertyName})`;
    }

    public date(timezone?: TTimezone, format?: "DH" | "D" | "H"){

      let str = "$date(";

      if(timezone){ str += timezone.trim(); }

      str += ", ";

      if(format && format.trim()){ 
        
        str += format.trim(); 
      }else{

        str+= timezone ? "DH" : "";
      }

      str += ")";

      return timezone ? str.trim() : `$date()`;
    }

    public inc(value: number = 1){
      
      return `$inc(${value != undefined ? value : 0})`;
    }

    public unset(){

      return "$unset()";
    }

  }


}










