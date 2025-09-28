import { Injectable } from "@angular/core";
import { EventEmitter } from 'events';
import { iTools } from '../../../../assets/tools/iTools';

// Services
import { IToolsService } from '@shared/services/iTools.service';
import { StoreService } from '../../informations/informations.service';
import { CollaboratorProfilesService } from './components/modal/components/others/profiles/profiles.service';
import { StorageService } from "@shared/services/storage.service";
import { AuthService } from "@auth/auth.service";
import { SystemLogsService } from '@shared/services/system-logs.service';
import { NotificationService } from '@shared/services/notification.service';

// Translate
import { CollaboratorsTranslate } from "./collaborators.translate";

// Interfaces
import { IBatch } from "@itools/interfaces/IBatch";
import { ICollection } from "@itools/interfaces/ICollection";
import { IStore } from '@shared/interfaces/IStore';
import { IRegistersCollaborator } from '@shared/interfaces/IRegistersCollaborator';
import { ESystemLogType, ESystemLogAction } from '@shared/interfaces/ISystemLog';
import { ENotificationStatus } from '@shared/interfaces/ISystemNotification';

// Types
import { query } from "@shared/types/query";

// Utilities
import { $$ } from "@shared/utilities/essential";
import { Utilities } from '@shared/utilities/utilities';
import { Dispatch } from "@shared/utilities/dispatch";

@Injectable({ providedIn: 'root' })
export class CollaboratorsService {

  private settings: any = {
    start: 0,
    limit: 60,
    snapshotRef: null
  };

  private firstScrolling: boolean = false;

  private _checkProcess: boolean = false;

  public static shared: CollaboratorsService;

  private data: any = {};
  private currentUserData: any;
  private collaboratorProfiles: any[] = [];
  private _checkRequest: boolean = false;  
  private _checkRequestCurrentUser: boolean = false;
  private _checkProfilesRequest: boolean = false;
  private _dataMonitors: EventEmitter = new EventEmitter();
  private limitCollaborators: number = 0;
  private currentUsersCount: number = -1;

  constructor(
    private iToolsService: IToolsService,
    private notificationService: NotificationService,
    private storeService: StoreService,
    private systemLogsService: SystemLogsService,
    private collaboratorProfilesService: CollaboratorProfilesService
  ) {
    this.query().catch(()=>{});
  }

  public get limit() {
    return this.settings.limit;
  }

  private collRef(settings: any = null, strict: boolean = true): ICollection {

    const collection = this.iToolsService.database().collection('RegistersCollaborators');

    if (settings) {

      if (settings.orderBy) {
        collection.orderBy(settings.orderBy);
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

      collection.orderBy({code: -1});
      if (strict){

        collection.where([{field: "owner", operator: "=", value: Utilities.storeID}, {field: "source", operator: "!=", value: "root"}]).orderBy({code: -1});
      }
    }else{

      collection.where([{field: "owner", operator: "=", value: Utilities.storeID}, {field: "source", operator: "!=", value: "root"}]).orderBy({code: -1});
    }

    return collection;
  }

  public query(where?: query['where'], reset: boolean = true, flex: boolean = false, scrolling: boolean = false, strict: boolean = true) {
    return (new Promise<any | void>(async (resolve, reject) => {

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

      await this.requestData(queryObject, strict).then((res) => {
        if (strict){ this.settings.start += 1; }
        resolve(res);
      }).catch(()=>{
        if (strict){ this.settings.start -= 1; }
        reject();
      });
    }));
  }

  private async requestData(settings: any = {}, strict: boolean){
    return new Promise<any | void>((resolve, reject)=>{

      if (!this.settings.snapshotRef){
        this.collaboratorProfilesService.getProfiles("CollaboratorsModalComponent", (data)=>{

          this.collaboratorProfiles = Utilities.deepClone(data);
          this._checkProfilesRequest = true;
        });
    
        this.storeService.getMatrixStore("CollaboratorsComponent", (data: IStore)=>{
    
          this.limitCollaborators = data.limitUsers ? data.limitUsers : 0;
          this.iToolsService.database().collection("RegistersCollaborators").where([
            // {field: "owner", operator: "=", value: Utilities.storeID},
            // {field: "source", operator: "!=", value: "root"}
          ]).count().get().then((data)=>{

            const count = data.docs.length > 0 ? data.docs[0].data().count : 0;
            this.currentUsersCount = count > 0 ? count : 0;
          });
        });
    
        this.iToolsService.database().collection("RegistersCollaborators").where([
          {field: "owner", operator: "=", value: Utilities.storeID},
          {field: "source", operator: "=", value: "root"}
        ]).onSnapshot((snapshot)=>{
          if (snapshot.id){
            const data = snapshot.docs.length > 0 ? snapshot.docs[0].data() : {};
            Dispatch.emit("user-root", {data: Utilities.deepClone(data), status: true});
          }else{
          
            Dispatch.emit("user-root", {data: {permissions: {}}, status: false});
          }
        });

        this.iToolsService.database().collection("RegistersCollaborators").where([
          {field: "owner", operator: "=", value: Utilities.storeID},
          {field: "code", operator: "=", value: Utilities.operator.code}
        ]).onSnapshot((snapshot)=>{
    
          const user = snapshot.docs.length ? snapshot.docs[0].data() : null;
    
          if (user){
            const userData = {
              status: true,
              data: {...user, id: user._id},
              usertype: user.usertype
            };

            if (!userData.data.allowAccess){

              this.notificationService.create({
                title: CollaboratorsTranslate.get().notifications.lockedAccess.title,
                description: CollaboratorsTranslate.get().notifications.lockedAccess.description,
                status: ENotificationStatus.danger
              }, false);

              setTimeout(()=>{
                this.iToolsService.auth().logout().then(() => {
                  AuthService.clearAuthData();
                }).catch(()=>{
                  AuthService.clearAuthData();
                });
              }, 10000);
            }

    
            if (user.usertype == "admin"){

              Utilities.localStorage("usertype", "admin");
              Utilities.localStorage("permissions", null);
    
              const it = setInterval(()=>{
                if (this._checkProfilesRequest){
      
                  $$(this.data).map((_, collaborator)=>{
                    if (collaborator.permissions){
                      this.collaboratorProfiles.forEach((profile)=>{
                        if (collaborator.permissions == profile.code){
      
                          collaborator.permissions = profile;
                        }
                      });
                    }
                  });
      
                  this.currentUserData = userData;
                  this._dataMonitors.emit("current-user", Utilities.deepClone(this.currentUserData));
                  Dispatch.emit("current-user",Utilities.deepClone(this.currentUserData))
                  this._checkRequestCurrentUser = true;
    
                  clearInterval(it);
                }
              }, 0);
            }else{
    
              const timer = setInterval(()=>{
                if (this._checkProfilesRequest){
    
                  this.collaboratorProfiles.forEach((profile)=>{
                    if (userData.data.permissions == profile.code){
    
                      userData.data.permissions = profile;
                    }
                  });


                  Utilities.localStorage("usertype", userData.data.permissions.name);
                  Utilities.localStorage("permissions", userData.data.permissions.permissions);
                  
                  this.currentUserData = userData;
                  this._dataMonitors.emit("current-user", Utilities.deepClone(this.currentUserData));
                  Dispatch.emit("current-user",Utilities.deepClone(this.currentUserData))
                  this._checkRequestCurrentUser = true;
    
                  clearInterval(timer);
                }
              }, 0);
            }
          }else{
    
            this._dataMonitors.emit("current-user",{data: {permissions: {}}, status: false});
            this._checkRequestCurrentUser = true;
          }
        });
      }
  
      if (strict){
        if (!this._checkProcess){

          this._checkProcess = true;

          if (this.settings.snapshotRef){ this.collRef(settings).clearSnapshot(this.settings.snapshotRef); }

          this.settings.snapshotRef = this.collRef(settings).onSnapshot((res)=>{

            const timer = setInterval(()=>{
              if (this._checkProfilesRequest){
      
                clearInterval(timer);

                if (res.changes().length == 0) {
                  for (const doc of res.docs) {
                    const docData = doc.data();

                    if (docData.permissions != "admin"){
                      this.collaboratorProfiles.forEach((profile)=>{
                        if (docData.permissions == profile.code){
            
                          docData.permissions = profile;
                        }
                      });
                    }
                
                    this.data[docData._id] = docData;
                  }
                } else {
          
                  for (const doc of res.changes()) {
          
                    const docData = doc.data();
          
                    if (doc.type == 'ADD' || doc.type == 'UPDATE') {       
                      if (docData.permissions != "admin"){
                        this.collaboratorProfiles.forEach((profile)=>{
                          if (docData.permissions == profile.code){
              
                            docData.permissions = profile;
                          }
                        });
                      }
                     
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

                  if (Object.values(this.data).length > 0 &&  this.settings.count == 0){
                    this.settings.count = $$(this.data).length;
                  }

                  this._dataMonitors.emit('count', this.treatData('count'));
                });

                this._dataMonitors.emit("collaborators", this.treatData());
                this._checkRequest = true;
                this._checkProcess = false;
  
                if (res.docs.length){
  
                  resolve(this.treatData());
                }else{
  
                  reject();
                }
              }
            });
          });

        }
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

            this.collaboratorProfiles.forEach((profile)=>{
              if (docData.permissions == profile.code){
  
                docData.permissions = profile;
              }
            });

            data.push(docData);
          }

          resolve(data);
        }).catch((e) => {
          reject(e);
        });
      }
    });
  }

  public getCurrentUser(listernId: string, listener: (_: any)=> void){

    const emitterId = 'current-user';

    Utilities.onEmitterListener(this._dataMonitors, emitterId, listernId, listener);
    
    if (this.currentUserData && this._checkRequestCurrentUser){ 
      this._dataMonitors.emit(emitterId, Utilities.deepClone(this.currentUserData)); 
    }
  }

  public getCollaborators(listernId: string, listener: (_: any)=> void){

    const emitterId = 'collaborators';

    Utilities.onEmitterListener(this._dataMonitors, emitterId, listernId, listener);

    if (this._checkRequest) {
      this._dataMonitors.emit(emitterId, this.treatData()); 
    }
  }

  public getCollaboratorsCount(listenerId: string, listener: ((_: any)=>void)) {
      
    const emitterId = 'count';

    Utilities.onEmitterListener(this._dataMonitors, emitterId, listenerId, listener);

    if (this._checkRequest) {
      this._dataMonitors.emit(emitterId, this.treatData(emitterId));
    }
  }

  public getUsersWithAccessCount(){
    let i = 0;
    $$(this.data).map((_, user)=>{
      if (user.allowAccess){

        i++;
      }
    });

    return i;
  }

  public async sendCredentials(data){

    const message = `<!doctype html>
    <html>
      <body style="background-color: black;color: white; padding: 100px 20px; box-sizing: border-box;">
        <header style="background-color: black; padding: 10px; margin-bottom: 60px;">
          <img src="cid:logo" style="display: table;margin: 0 auto;width: 200px; max-width: 100%;"/>
        </header>
        <main>
          <div style="display: block; width: 500px; max-width: 100%; margin: 0 auto;">
            <table style="display: block; width: 100%;">
              <thead style="display: block; width: 100%;">
                <tr style="display: block; width: 100%;">
                  <td style="display: block; width: 100%;">
                    <b style="font: 21px 'Arial';">${ CollaboratorsTranslate.get().notifications.email.yourCredentials }</b>
                  </td>
                </tr>
              </thead>
              <tbody style="display: block; width: 100%;">
                <tr style="display: block; width: 100%;">
                  <td style="display: block; width: 100%;">
                    <p style="font: 12px 'Arial'">USERNAME: ${data.username}</p>
                  </td>
                </tr>
                <tr style="display: block; width: 100%;">
                  <td style="display: block; width: 100%;">
                    <p style="font: 12px 'Arial'">PASSWORD: ${data.password}</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </main>
      <body>
    <html>`;

    return new Promise<void>((resolve, reject)=>{
      this.iToolsService.functions().call("sendEmail",{
        email: data.email,
        html: message, 
        subject: CollaboratorsTranslate.get().notifications.email.title,
        attachments: [
          {
            filename: 'logo.png',
            path: 'https://localhost:3001/src/assets/images/logo.png',
            cid: 'logo'
          }
        ]
      }).then((res)=>{

        console.log(res);

        if (res.status){

          resolve();
        }else{

          reject(res);
        }
      }).catch((error)=>{

        console.log(error);
        reject(error);
      });
    });
  }

  public async updateCollaborator(data: IRegistersCollaborator, isNotification: boolean = true, batch: IBatch = null, storeId: string = null){
    return new Promise<any | void>(async(resolve, reject)=>{

      let source: any = {};
      storeId = storeId ? storeId : Utilities.storeID;
      const id = data._id ? data._id : null;
      const type: string = id ? "update" : "add";
      const isExternalBactch = (!!batch);
      batch = batch ? batch : this.iToolsService.database().batch();

      data.owner = storeId;
      data.code = type == "add" && !data.code ? iTools.FieldValue.control("SystemControls", storeId, "RegistersCollaborators.code") : data.code;

      
      if (type == "update"){ 

        data._id = id; 
        source = (await this.query([
          {field: data._id ? "_id" : "code", operator: "=", value: data._id ? data._id : data.code},
          { field: 'owner', operator: '=', value: data.owner || Utilities.storeID }
        ], false, false, false, false))[0];

        if (!source){

          reject({message: "Source data is undefined."});
          return;
        }
      }else{ delete data._id; }

      const password = this.generateCode(6);

      if (data.email){
        data.email = data.email.toLowerCase();
      }

      const notification = (title: string, description: string, status: boolean)=>{
        this.notificationService.create({
          title: title,
          description: description,
          status: status ? ENotificationStatus.success : ENotificationStatus.danger,
          path: "",
        }, false);
      };

      const notifyPassword = (username: string, email: string, password: string, exists = false)=>{

        const originEmail = email;

        const receiveEmail = data.isSendEmailToStore ? Utilities.storeInfo.contacts.email : email;

        this.sendCredentials({
          email: receiveEmail,
          username: username,
          password: exists ? CollaboratorsTranslate.get().notifications.email.message(originEmail) : password,
          subject: CollaboratorsTranslate.get().notifications.email.title,
        }).then(()=>{
    
          notification(CollaboratorsTranslate.get().titles.main, CollaboratorsTranslate.get().notifications.credentialsSendedWithSuccess(receiveEmail), true);
        }).catch(()=>{

          notification(CollaboratorsTranslate.get().titles.main, CollaboratorsTranslate.get().notifications.credentialsSendedWithError, false);
        });
      };

      const exec = (notify: boolean = true, exists = false)=>{


        const batchItemId = batch.update(this.iToolsService.database().collection("RegistersCollaborators").doc(data._id), data);

        // return;

        this.systemLogsService.registerLogs({
          data: [{
            type: ESystemLogType.RegistersCollaborators,
            note: type == "add" ? CollaboratorsTranslate.get().systemLogNotes.registerCollaborator : CollaboratorsTranslate.get().systemLogNotes.updateCollaborator,
            action: type == "add" ? ESystemLogAction.REGISTER : ESystemLogAction.UPDATE,
            referenceCode: type == "add" ? iTools.FieldValue.bindBatchData(batchItemId, "code") : data.code
          }],
          owner: Utilities.storeID,
          operator: Utilities.operator,
          registerDate: iTools.FieldValue.date(Utilities.timezone)
        }, batch).then(()=>{
          if (isExternalBactch){

            resolve(batch);
          }else{
  
            batch.commit().then(()=>{
              if (Utilities.operator.username === data.username){
      
                Utilities.localStorage("permissions", data.permissions ? data.permissions : null);
              }
      
              if (notify){ notifyPassword(data.username, data.email, password, exists); }
      
              if (isNotification){
                notification(CollaboratorsTranslate.get().titles.main, type == "add" ? CollaboratorsTranslate.get().notifications.registerCollaboratorWithSuccess : CollaboratorsTranslate.get().notifications.updateCollaboratorWithSuccess, true);
              }
              resolve(null);
            }).catch(()=>{
              if (isNotification){
    
                notification(CollaboratorsTranslate.get().titles.main, type == "add" ? CollaboratorsTranslate.get().notifications.registerCollaboratorWithError : CollaboratorsTranslate.get().notifications.updateCollaboratorWithError, false);
                reject();
              }
            });
          }
        });
      };


      if (this.getUsersWithAccessCount() < this.limitCollaborators && type == "add" || type == "update"){
        if (data.name != source.name || type == "add"){

          this.generateUserName(data.name, source.username, data.owner).then((username)=>{
            if (username){
              data.username = username;

              if (data.email != source.email){
                this.iToolsService.auth().createUser({email: data.email, password: password}).then(()=>{

                  exec();
                }).catch((err)=>{
                  if (err.code === "user-already-registered"){
    
                    exec(true,true);
                  }
                });
              }else{
        
                exec(true, true);
              }
            }else{
    
              reject();
            }
          });
        }else{
          if (data.email != source.email || <any>type == "add"){
            this.iToolsService.auth().createUser({email: data.email,password: password}).then(()=>{
    
              exec(true);
            }).catch((err)=>{
              if (err.code === "user-already-registered"){
    
                exec(true,true);
              }
            });
          }else{
    
            exec(false);
          }
        }
      }else{

        this.notificationService.create({
          title: CollaboratorsTranslate.get().titles.main,
          description: CollaboratorsTranslate.get().notifications.registerLimit,
          status: ENotificationStatus.danger,
          path: "",
        }, false);
        
        reject({messgae: CollaboratorsTranslate.get().notifications.registerLimit});
      }
    });
  }

  public async removeCollaborator(data: any, isNotification: boolean = true, batch: IBatch = null){
    return new Promise<void>((resolve, reject)=>{

      const isExternalBatch = (!!batch);
      batch = batch ? batch : this.iToolsService.database().batch();

      const notification = (title: string, description: string, status: boolean)=>{
        this.notificationService.create({
          title: title,
          description: description,
          status: status ? ENotificationStatus.success : ENotificationStatus.danger,
          path: "",
        }, false);
      };

      this.systemLogsService.registerLogs({
        data: [{
          type: ESystemLogType.RegistersCollaborators,
          note: CollaboratorsTranslate.get().systemLogNotes.deleteCollaborator,
          action: ESystemLogAction.DELETION,
          referenceCode: data.code
        }],
        owner: Utilities.storeID,
        operator: Utilities.operator,
        registerDate: iTools.FieldValue.date(Utilities.timezone)
      }, batch).then(()=>{

        batch.delete(this.iToolsService.database().collection("RegistersCollaborators").doc(data._id));

        if (isExternalBatch){

          resolve();
        }else{
          batch.commit().then(()=>{
            if (isNotification){
              notification(CollaboratorsTranslate.get().titles.main, CollaboratorsTranslate.get().notifications.deleteCollaboratorWithSuccess, true);
            }
            resolve();
          }).catch((err)=>{
            if (isNotification){
              notification(CollaboratorsTranslate.get().titles.main, CollaboratorsTranslate.get().notifications.deleteCollaboratorWithError, false);
              reject(err);
            }
          });
        }
      });
    });
  }


  public async saveChanges(event, newData: IRegistersCollaborator, source: IRegistersCollaborator = null, action: string, modal: any,){
    
    if (modal.model.invalid){ return; }
    
    Utilities.loading(true);

     let form = $$(event.target);
     let hasChangesInText = false;
     let hasChangesInFile = false;
     let uploadCount = 0;
     let input = form.find("input[type=file]");

     if (newData.image && newData.image != source.image){

      hasChangesInFile = true;
      StorageService.uploadFile({
        storageRef: this.iToolsService.storage(),
        settings: [{
          sourceUrl: source.image,
          bindData: {
            img: form.find(".image-container img"),
          },
          dataFile: newData.image,
          file: (input.pos(0) as HTMLInputElement).files[0],
          path: "Collaborators"
        }]
      }).then((data)=>{

        newData.image = data[0];
        uploadCount++;
      }).catch(()=>{

        Utilities.loading(false);
      });
    }else{

      newData.image = newData.image ? newData.image : "";
    }

 
    if (action === "add"){

      hasChangesInText = true;
    }else if (action === "update"){

      if (
        source.email != newData.email || source.name != newData.name ||
        source.allowAccess != newData.allowAccess ||
        source.isSendEmailToStore != newData.isSendEmailToStore ||
        source.address.addressLine != newData.address.addressLine || source.address.city != newData.address.city || source.address.country != newData.address.country || source.address.state != newData.address.state || source.address.postalCode != newData.address.postalCode ||
        source.contacts.phone != newData.contacts.phone || source.contacts.whatsapp != newData.contacts.whatsapp || 
        source.permissions != newData.permissions
      ){

        hasChangesInText = true;
      }
    } 


     if (hasChangesInFile){
       const it = setInterval(()=>{
          if (uploadCount === 1){
            clearInterval(it);
            this.updateCollaborator(newData).then((status)=>{
  
              modal.onClose();
              Utilities.loading(false);
           }).catch((err)=>{

            modal.onClose();
            Utilities.loading(false);
           });
         }
       },0);
     }else if (hasChangesInText){
 
        this.updateCollaborator(newData).then((status)=>{
          modal.onClose();
          Utilities.loading(false);
        }).catch((err)=>{

          modal.onClose();
          Utilities.loading(false);
         });
     }else{

      Utilities.loading(false);
      modal.onClose();
    }
  }

  //// Utilities

  private treatData(id: string = "records", data: any = null): any{

    if (id == 'count') {

      const result: any = { 
        current: $$(data || this.data).length, total: this.settings.count
      };

      return result;
    }

    if (id == "records"){

      const sort = (a: any, b: any)=>{ return ((a.code < b.code) ? 1 : ((a.code > b.code) ? -1 : 0)); };
      const result =  Object.values(data ? data : this.data).sort(sort);
      return Utilities.deepClone(result);
    }
    
  }


  public async generateUserName(name: string, oldUsername: string = null, store = null){
    return new Promise<any>((res, rej)=>{

      name = name.trim().replace(/[ ]+/ig, " ");
      const firstName = name.split(" ")[0];
      const lastName = name.split(" ")[1] ? name.split(" ")[name.split(" ").length - 1] : "";
      const usernames = [];

      store = store || Utilities.storeID;
  
      const items = 10000;
      let suffix = 1;
      let storeId = store === "matrix" ? '' : store.split("-")[1];
      let username = store === "matrix" ?  (firstName+lastName).toLowerCase() : (firstName+lastName+"-"+storeId).toLowerCase();
      username = username.replace(/[ ]*/g,"").toLowerCase();

      if (username == oldUsername){

        res(username);
        return;
      }

      this.iToolsService.database().collection("RegistersCollaborators").where([
        // {field: "owner", operator: "=", value: Utilities.storeID},
        {field: "username", operator: "=", value: username}
      ]).limit(items).get().then((data)=>{
        if (data.docs.length){

          if (this.currentUsersCount == -1){

            rej({message: "Can't count users"});
            return;
          }

          // this.currentUsersCount = 30000;
          this.currentUsersCount / items;
          let maxStep = this.currentUsersCount / items > parseInt(new String(this.currentUsersCount / items).valueOf()) ? parseInt(new String(this.currentUsersCount / items).valueOf()) + 1 : parseInt(new String(this.currentUsersCount / items).valueOf()); 
          const orginalMaxSetp = maxStep;
          let currenStep = 0;

          const timer = setInterval(async()=>{

            if (maxStep == 0){

              clearInterval(timer);
              return;
            }

            await this.iToolsService.database().collection("RegistersCollaborators").where([
              // {field: "username", operator: "=", value: username}
              // {field: "owner", operator: "=", value: Utilities.storeID}
            ]).startAfter(currenStep * items).limit(((currenStep + 1) * items)).get().then((data)=>{
              if (data.docs.length){
                data.docs.forEach((doc)=>{
                  const username = doc.data().username;
                  if (username){ usernames.push(username); }
                });
              }else{}
            });

            maxStep--;
            currenStep++;
          }, orginalMaxSetp > 1 ? 500 : 0);

          const timerFinish = setInterval(()=>{
            if (maxStep == 0){
              clearInterval(timerFinish);

              while(usernames.indexOf(username) !== -1){
                username = store === "matrix" ? (firstName+lastName+suffix).toLowerCase() : (firstName+lastName+suffix +"-"+ storeId).toLowerCase();
                username = username.replace(/[ ]*/g,"").toLowerCase();
                suffix++;
              }

              res(username);
            }
          }, 0);
        }else{
         
          res(username);
        }
      });
    });
  }

  public generateCode(length: number = 4){
    
    let randOrd = ()=>{ return (Math.round(Math.random())-0.5); };
    
    let hexDec = ["0","1","2","3","4","5","6","7","8","9",'a','b','c','d','e','f'];
    let code = "";
    
    for (let i = 0; i < length; i++){

      hexDec = hexDec.sort(randOrd);
      code += hexDec[0];
    }

    return code;
  }

  // Clear Listenter Utility

  public removeListeners(emitterId: "collaborators" | "currentUser" | "count", listernId: string | string[] = ""){

    Utilities.offEmitterListener(this._dataMonitors, emitterId, listernId);
  }

}