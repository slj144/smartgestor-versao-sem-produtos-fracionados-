import { Injectable } from "@angular/core";
import { EventEmitter } from 'events';
import { iTools } from '../../../../../../../../../assets/tools/iTools';

// Services
import { IToolsService } from '@shared/services/iTools.service';
import { SystemLogsService } from '@shared/services/system-logs.service';
import { NotificationService } from '@shared/services/notification.service';

// Translate
import { CollaboratorsTranslate } from "../../../../../collaborators.translate";

// Interfaces
import { ICollection } from '@itools/interfaces/ICollection';
import { ENotificationStatus } from '@shared/interfaces/ISystemNotification';
import { ESystemLogType, ESystemLogAction } from '@shared/interfaces/ISystemLog';

// Types
import { query } from "@shared/types/query";

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { DateTime } from '@shared/utilities/dateTime';
import { Dispatch } from "@shared/utilities/dispatch";
import { AuthService } from "../../../../../../../../auth/auth.service";

@Injectable({ providedIn: 'root' })
export class CollaboratorProfilesService { 

  public translate = CollaboratorsTranslate.get();

  private data: any = {};

  private settings: any = {
    start: 0,
    limit: 30,
    snapshotRef: null
  };

  private _checkProcess: boolean = false;

  private _checkRequest: boolean = false;
  private _dataMonitor: EventEmitter = new EventEmitter();

  private currentUser: any;

  constructor(
    private iToolsService: IToolsService,
    private systemLogsService: SystemLogsService,
    private notificationService: NotificationService
  ) {

    this.query().catch(()=>{});
  }
  
  public query(where?: query['where'], flex: boolean = false, strict: boolean = true){
    return (new Promise<any | void>((resolve, reject) => {

      const queryObject: query = {
        start: (this.settings.start * this.settings.limit),
        limit: this.settings.limit 
      };

      if (where) {

        if (strict){

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


      this.requestData(queryObject, strict).then((res) => {

        if (strict){ this.settings.start += 1; }
        resolve(res);
      }).catch(()=>{

        if (strict){ this.settings.start -= 1; }
        reject();
      });
    }));
  }

  // CRUD Methods

  public getProfiles(listenerId: string, listener: ((status: any)=>void)) {
       
    const emitterId = 'records';

    Utilities.onEmitterListener(this._dataMonitor, emitterId, listenerId, listener);
    
    if (this._checkRequest) {
      this._dataMonitor.emit(emitterId, this.treatData("records"));
    } 
  }

  public async updateProfile(data: any){
    return new Promise<any>((resolve, reject)=>{

      Utilities.loading();

      const type = data.code ? "update" : "add";
      const code = data.code ? data.code : iTools.FieldValue.control("SystemControls", "common", "RegistersCollaboratorProfiles.code");
      const batch = this.iToolsService.database().batch();
      data.owner = Utilities.storeID;
      data.code = code;


      if (type == "add"){

        this.systemLogsService.registerLogs({
          data: [{
            type: ESystemLogType.RegistersCollaborators,
            note: CollaboratorsTranslate.get().systemLogNotes.registerCollaboratorProfile,
            action: ESystemLogAction.REGISTER,
          }],
          operator: Utilities.operator,
          registerDate: DateTime.getDate()
        }, batch);

        batch.update({collName: "RegistersCollaboratorProfiles"}, data);
      }else{
  
        this.systemLogsService.registerLogs({
          data: [{
            type: ESystemLogType.RegistersCollaborators,
            note: CollaboratorsTranslate.get().systemLogNotes.updateCollaboratorProfile,
            action: ESystemLogAction.UPDATE,
            referenceCode: data.code
          }],
          operator: Utilities.operator,
          owner: Utilities.storeID,
          registerDate: iTools.FieldValue.date(Utilities.timezone)
        }, batch);

        batch.update({collName: "RegistersCollaboratorProfiles", where: [data._id ? {field: "_id", operator: "=", value: data._id} : {field: "code", operator: "=", value: code}]}, data, {merge: false});
      }
      
      batch.commit().then((r) => {
  
        Utilities.loading(false);    
        resolve(data);
        this.notification(CollaboratorsTranslate.get().mainModal.collaboratorProfilesTitle, CollaboratorsTranslate.get().notifications.updateCollaboratorProfileWithSuccess, true);
      }).catch((error) => {
  
        console.log(error);

        Utilities.loading(false);    
        reject();
        this.notification(CollaboratorsTranslate.get().mainModal.collaboratorProfilesTitle, CollaboratorsTranslate.get().notifications.updateCollaboratorProfileWithError, false);
      });
    });
  }

  private notification(title: string, description: string, status: boolean){
    
    this.notificationService.create({
      title: title,
      description: description,
      status: status ? ENotificationStatus.success : ENotificationStatus.danger,
      icon: 'close-outline'
    }, false);
  }

  public deleteProfile(data: any, callback: ((status: boolean)=>void) = ()=>{}) {
    return new Promise<void>((resolve, reject)=>{
      Utilities.loading();

      const batch = this.iToolsService.database().batch();
  
      this.systemLogsService.registerLogs({
        data: [{
          type: ESystemLogType.RegistersCollaboratorProfiles,
          note: CollaboratorsTranslate.get().systemLogNotes.deleteCollaboratorProfile,
          action: ESystemLogAction.DELETION,
        }],
        operator: Utilities.operator,
        owner: Utilities.storeID,
        registerDate: iTools.FieldValue.date(Utilities.timezone)
      }, batch);
  
      batch.delete(this.collRef().doc(data._id));
  
      batch.commit().then(() => {
      
        Utilities.loading(false);    
        resolve();
        this.notification(CollaboratorsTranslate.get().mainModal.collaboratorProfilesTitle, CollaboratorsTranslate.get().notifications.deleteCollaboratorProfileWithSuccess, true);
      }).catch(() => {
  
        Utilities.loading(false);    
        reject();
        this.notification(CollaboratorsTranslate.get().mainModal.collaboratorProfilesTitle, CollaboratorsTranslate.get().notifications.deleteCollaboratorProfileWithError, false);
      });
    });
  }

  // Auxiliary Methods

  private collRef(settings: any = {}, strict: boolean = true): ICollection {

    const collection = this.iToolsService.database().collection('RegistersCollaboratorProfiles');

    if (settings) {

      if (settings.orderBy) {
        collection.orderBy(settings.orderBy);
      }else{

        collection.orderBy({code: -1});
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

      collection.or(Utilities.storeID == "matrix" ? [ {field: "owner", operator: "=", value: "matrix"} ] :  [ {field: "owner", operator: "=", value: "matrix"}, {field: "owner", operator: "=", value: Utilities.storeID} ]);
    }else{

      collection.or(Utilities.storeID == "matrix" ? [ {field: "owner", operator: "=", value: "matrix"} ] :  [ {field: "owner", operator: "=", value: "matrix"}, {field: "owner", operator: "=", value: Utilities.storeID} ]).orderBy({code: -1});
    }

    return collection;
  }

  // Data Processing

  public removeListeners(emitterId: string = null, listenerId: string | string[] = null) {
    Utilities.offEmitterListener(this._dataMonitor, emitterId, listenerId);
  }

  private async requestData(settings: any = {}, strict: boolean) {
    return new Promise<any | void>((resolve, reject)=>{

      if (!this.settings.snapshotRef){
        Dispatch.onCurrentUserChange("CollaboratorProfilesService", (data)=>{  this.currentUser = data; });
      }

      if (strict){
        
        this._checkProcess = true;

        if (this.settings.snapshotRef){ this.collRef(settings, strict).clearSnapshot(this.settings.snapshotRef); }

        this.collRef(settings, strict).onSnapshot((res) => {   
          
          if (res.changes().length == 0) {
            for (const doc of res.docs) {
              const docData = doc.data();
              this.data[docData._id] = docData;
              this.checkCurrentProfile(docData);
            }
          } else {
    
            for (const doc of res.changes()) {
    
              const docData = doc.data();
    
              if (doc.type == 'ADD' || doc.type == 'UPDATE') {       
               
                this.data[docData._id] = docData;
                this.checkCurrentProfile(docData);
              }
    
              if (doc.type == 'DELETE') {
                if (this.data[docData._id]) {
                  delete this.data[docData._id];

                  if (this.currentUser.data.permissions && this.currentUser.data.permissions.code == docData._id){

                    setTimeout(()=>{
    
                      this.notificationService.create({
                        title: this.translate.titles.main,
                        description: this.translate.notifications.profileRevoked,
                        status: ENotificationStatus.danger,
                        path: "",
                      }, false);

                      AuthService.clearAuthData();
      
                    }, 500);
                  }
                }
              }
            }
          }

          this._dataMonitor.emit('records', this.treatData("records")); 
          this._checkRequest = true;
          this._checkProcess = false;
        });
      }else{

        if (settings.start != undefined && settings.start >= 0) {
          delete settings.start;
        }
  
        if (settings.limit != undefined && settings.limit > 0) {
          delete settings.limit;
        }
  
        this.collRef(settings, strict).get().then((res) => {

          const data = [];
  
          for (const doc of res.docs) {
            const docData = doc.data();
            data.push(docData);
          }
  
          resolve(this.treatData("records", data));
        }).catch((e) => {
          reject(e);
        });
      }

    });
    
  }


  private checkCurrentProfile(profile: any){
    if (this.currentUser && !Utilities.isAdmin){

      if (profile.code == this.currentUser.data.permissions.code){
        
        Utilities.localStorage("usertype", profile.name);

        function sortAlphabet(str) { return [...str].sort((a, b) => a.localeCompare(b)); }

        if (sortAlphabet(JSON.stringify(profile.permissions).trim().toLowerCase()).join() != sortAlphabet(JSON.stringify(Utilities.permissions("permissions")).trim().toLowerCase()).join()){
  
          Utilities.localStorage("permissions", profile.permissions);

          setTimeout(()=>{

            this.notificationService.create({
              title: this.translate.titles.main,
              description: this.translate.notifications.profileChange,
              status: ENotificationStatus.success,
              path: "",
            }, false);

            Dispatch.emit("refresh-menu", {});
          }, 500);
        }else if (profile.name != Utilities.operator.username){

          setTimeout(()=>{

            this.notificationService.create({
              title: this.translate.titles.main,
              description: this.translate.notifications.profileChange,
              status: ENotificationStatus.success,
              path: "",
            }, false);

            Dispatch.emit("refresh-menu", {});
          }, 500);
        }
      }
    }
  }


  public treatData(id: "records", data: any = null): any{
    if (id == "records"){

      const sort = (a: any, b: any)=>{ return ((a.code < b.code) ? 1 : ((a.code > b.code) ? -1 : 0)); };
      const result =  Object.values(data ? data : this.data).sort(sort).map((value: any)=>{
        if (value.owner == "matrix" && Utilities.storeID != "matrix"){
          value.onlyRead = true;
        }
        return value;
      })

      return Utilities.deepClone(result);
    }
  }

}
