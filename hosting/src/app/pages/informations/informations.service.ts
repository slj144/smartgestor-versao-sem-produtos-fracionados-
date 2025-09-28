import { Injectable } from "@angular/core";
import { EventEmitter } from 'events';
import { iTools } from "../../../assets/tools/iTools";

// Services
import { IToolsService } from '@shared/services/iTools.service';
import { SystemLogsService } from '@shared/services/system-logs.service';
import { NotificationService } from '@shared/services/notification.service';

// Interfaces
import { IStore } from '@shared/interfaces/IStore';
import { ENotificationStatus } from '@shared/interfaces/ISystemNotification';
import { ESystemLogType, ESystemLogAction } from '@shared/interfaces/ISystemLog';

// Settings
import { ProjectSettings } from '../../../assets/settings/company-settings';

// Utilities
import { $$ } from "@shared/utilities/essential";
import { Utilities } from '@shared/utilities/utilities';
import { Dispatch } from "@shared/utilities/dispatch";
import { IBatch } from "@itools/interfaces/IBatch";
import { StorageService } from "@shared/services/storage.service";
import { InformationsTranslate } from "./informations.translate";
import { AuthService } from "../../auth/auth.service";

@Injectable({  providedIn: 'root'})
export class StoreService {

  public static shared: StoreService;

  private allStores: any = {};
  private data: any;
  private matrixData: any;
  private _checkData: boolean = false;
  private _checkStoresData: boolean = false;
  private _checkDataMatrix: boolean = false;
  private currentUsersCount = 0;
  private _emitter: EventEmitter = new EventEmitter();

  constructor(
    private iToolsService: IToolsService,
    private notificationService: NotificationService,
    private systemLogsService: SystemLogsService,
    private authService: AuthService
  ) {

    StoreService.shared = this;
    this.requestData();

    // branch-7a53
    // branch-9e99
    // branch-99c6

    // this.iToolsService.database().collection("CashierSales").where([{field: 'owner', operator: '=', value: 'branch-99c6'}]).delete("document").then((res)=>{

    //   console.log(res);
    // });


  }

  // GetData

  public getCurrentStore(listenerID: string, listener: (_: any)=> void) {

    Utilities.onEmitterListener(this._emitter, "store",listenerID, listener);
    if (this.data && this._checkData) { this._emitter.emit("store", Utilities.deepClone(this.data)); }
  } 

  public getStores(listenerID: string, listener: (_: any)=> void) {

    Utilities.onEmitterListener(this._emitter, "stores",listenerID, listener);
    if (this._checkStoresData) { this._emitter.emit("stores", Utilities.deepClone(this.treatData(this.allStores))); }
  } 


  public getMatrixStore(listenerID: string, listener: (_: any)=> void) {
   
    Utilities.onEmitterListener(this._emitter, "matrix",listenerID, listener);
    if (this.matrixData && this._checkDataMatrix) { this._emitter.emit("matrix", Utilities.deepClone(this.matrixData)); }
  } 
  

  // CRUD

  public async updateStore(data: IStore) {
    return new Promise<void>(async (resolve, reject)=>{

      const source = Utilities.deepClone(this.data);

      const sourceAdminUser = (await Dispatch.collaboratorsService.query([
        {field: "owner", operator: "=", value: source._id},
        {field: "source", operator: "=", value: "root"},
      ], false, false, false, false))[0];

      if (!source){
        
        reject({message: "Source Data is undefined."});
        return;
      }

      if (!sourceAdminUser){

        reject({message: "Admin User is undefined."});
        return;
      }

      source.rootUser = sourceAdminUser;

      const password = this.generateCode(6);
  
      const adminUser: any = {
        _id: data.rootUser._id,
        owner: Utilities.storeID,
        name: data.rootUser.name,
        email: data.rootUser.email,
        username: data.rootUser.username,
        image: data.rootUser.image,
        usertype: "admin",
        source: "root",
        code: "@1",
        allowAccess: true
      };

      const notifyPassword = (email: string, username: string, password: string,exists = false)=>{
        const originEmail = email;
        email = Utilities.storeInfo.contacts.email ? Utilities.storeInfo.contacts.email : email;

        // console.log(Utilities.storeInfo.contacts);

        this.sendCredentials({
          email: email,
          username: username,
          password: exists ? InformationsTranslate.get().notifications.email.message(originEmail) : password,
          subject: InformationsTranslate.get().notifications.email.title,
        }).then(()=>{
    
          this.notificationService.create({
            title: InformationsTranslate.get().notifications.email.collaborators,
            description: InformationsTranslate.get().notifications.credentialsSendedWithSuccess(email),
            status: ENotificationStatus.success,
            path: "",
          }, false);
        }).catch(()=>{

          this.notificationService.create({
            title: InformationsTranslate.get().notifications.email.collaborators,
            description: InformationsTranslate.get().notifications.credentialsSendedWithError,
            status: ENotificationStatus.danger,
            path: "",
          }, false);
        });
      };

      const exec = (notify: boolean = true, exists = false, updateCollaborator: boolean = false)=>{
  
        const batch = this.iToolsService.database().batch();
        delete data.rootUser;

        this.systemLogsService.registerLogs({
          data: [{
            type: ESystemLogType.Informations,
            note: InformationsTranslate.get().systemLogs.updateInformations,
            action: ESystemLogAction.UPDATE
          }],
          operator: Utilities.operator,
          owner: Utilities.storeID,
          registerDate: iTools.FieldValue.date(Utilities.timezone)
        }, batch).then(()=>{

          batch.update(this.iToolsService.database().collection("Stores").doc(data._id), data);

          const commit = (batch: IBatch)=>{
            batch.commit().then(()=>{

              Utilities.localStorage("username", adminUser.username);
              Utilities.localStorage("storeInfo", data);
    
              if (notify){ notifyPassword(adminUser.email, adminUser.username, password, exists); }
      
              this.notificationService.create({
                title: InformationsTranslate.get().titles.main,
                description: InformationsTranslate.get().notifications.updateStoreWithSuccess,
                status: ENotificationStatus.success,
                path: "",
              }, false);
      
              resolve();
            }).catch((error)=>{
  
              this.notificationService.create({
                title: InformationsTranslate.get().titles.main,
                description: InformationsTranslate.get().notifications.updateStoreWithError,
                status: ENotificationStatus.danger,
                path: "",
              }, false);
      
              reject(error);
            });
          };
  
          if (updateCollaborator){
            Dispatch.collaboratorsService.query([
              {field: "owner", operator: "=", value: Utilities.storeID}
              ,{field: "_id", operator: "=", value: adminUser._id},
            ], false, false, false, false).then((data)=>{
              if (data && data.length){
    
                data = data[0];
                Dispatch.collaboratorsService.updateCollaborator(adminUser, false, batch).then(()=>{
    
                  commit(batch);
                }).catch((error)=>{
              
                  reject(error);
                });
              }else{
    
                reject({message: "rootuser not found."});
              }
            }).catch((error)=>{
    
              reject(error);
            });
          }else{
  
            commit(batch);
          }
        });
      };

  
      if (source.rootUser.email != data.rootUser.email){
        this.iToolsService.auth().createUser({
          email: data.rootUser.email,
          password: password,
        }).then(()=>{
          if (data.rootUser.name != source.rootUser.name){
            Dispatch.collaboratorsService.generateUserName(data.rootUser.name, source.rootUser.name, data._id).then((username)=>{
              if (username){
  
                data.rootUser.username = username;
                exec(true, false, true);
              }else{
  
                reject();
              }
            });
          }else{
            
            exec(true, false, data.rootUser.image != source.rootUser.image);
          }
        }).catch((err)=>{
          if (err.code === "user-already-registered"){
            if (data.rootUser.name != source.rootUser.name){
              Dispatch.collaboratorsService.generateUserName(data.rootUser.name, source.rootUser.name, data._id).then((username)=>{
                if (username){
  
                  data.rootUser.username = username;
                  exec(true,true, true);
                }else{
  
                  reject();
                }
              });
            }else{
             
              exec(true, true, true);
            }
          }else{
  
            reject();
          }
        });
      }else{
        if (data.rootUser.name != source.rootUser.name){
          Dispatch.collaboratorsService.generateUserName(data.rootUser.name, source.rootUser.name, data._id).then((username)=>{
            if (username){
  
              data.rootUser.username = username;
              exec(true, true, true);
            }else{
  
              reject();
            }
          });
        }else{
  
          exec(false, true, data.rootUser.image != source.rootUser.image);
        }
      }
    });
  }

  public async saveChanges(event: Event, source: IStore, newData: IStore, action: string, modal: any){
     
    if (modal.model.invalid){ return; }

    Utilities.loading(true);

    action = action.trim().toLowerCase();
    let form = $$(event.target);
    let hasChangesInText = false;
    let hasChangesInFile = false;
    let uploadCount = 0;

    if (newData.image  && newData.image != source.image){

      const input = form.find(".inpfile");
      hasChangesInFile = true;

      StorageService.uploadFile({
        storageRef: this.iToolsService.storage(),
        settings: [{
          sourceUrl: source.image,
          dataFile: newData.image,
          name: Utilities.uuid(),
          bindData: {
            img: form.find(".image-container .storeImage")
          },
          file: (input.pos(0) as HTMLInputElement).files[0],
          path: "Stores"
        }]
      }).then((data)=>{

        // console.log(data);

        newData.image = data[0];
        uploadCount++;
      }).catch(()=>{

        this.notificationService.create({
          title: "Loja",
          description: "Ocorreu um erro ao realizar upload de imagem da loja.",
          status: ENotificationStatus.success,
          path: "",
        }, false);

        Utilities.loading(false);
      });
    }else{

      uploadCount++;
      newData.image = newData.image ? newData.image : "";
    }

    if (newData.rootUser.image && newData.rootUser.image != source.rootUser.image){

      const input = form.find(".inpfileAdmin");
      hasChangesInFile = true;

      StorageService.uploadFile({
        storageRef: this.iToolsService.storage(),
        settings: [{
          sourceUrl: source.rootUser.image,
          bindData: {
            img: form.find(".imgc-admin .adminImage")
          },
          name: Utilities.uuid(),
          dataFile: newData.rootUser.image,
          file: (input.pos(0) as HTMLInputElement).files[0],
          path: "Collaborators"
        }]
      }).then((data)=>{

        newData.rootUser.image = data[0];
        uploadCount++;
      }).catch((error)=>{

        // Error Upload Image

        this.notificationService.create({
          title: InformationsTranslate.get().titles.main,
          description: InformationsTranslate.get().notifications.updateStoreWithError,
          status: ENotificationStatus.danger,
          path: "",
        }, false);
            
        this.notificationService.create({
          title: InformationsTranslate.get().titles.main,
          description: InformationsTranslate.get().notifications.upload.error,
          status: ENotificationStatus.success,
          path: "",
        }, false);

        modal.submited = false;
        Utilities.loading(false);
      });
    }else{

      uploadCount++;
      newData.rootUser.image = newData.rootUser.image ? newData.rootUser.image : "";
    }

    if (action === "update"){
      // if (
      //   source.cnpj != newData.cnpj || source.cnpjFiscal != newData.cnpjFiscal || newData.rootUser.name != source.rootUser.name || source.rootUser.email != newData.rootUser.email || source.name != newData.name && newData.name || source.billingName != newData.billingName ||
      //   source.address.addressLine != newData.address.addressLine || source.address.city != newData.address.city || source.address.country != newData.address.country || source.address.state != newData.address.state || source.address.postalCode != newData.address.postalCode ||
      //   source.contacts.email != newData.contacts.email || source.contacts.phone != newData.contacts.phone || source.contacts.whatsapp != newData.contacts.whatsapp
      // ){

      //   hasChangesInText = true;
      // }
      hasChangesInText = true;
    }

    if (hasChangesInFile){
      const it = setInterval(()=>{
        if (uploadCount === 2){
          clearInterval(it);

          this.updateStore(newData).then(()=>{
           
            Utilities.loading(false);
            modal.onClose();
            modal.submited = false;
          }).catch(()=>{

            Utilities.loading(false);
            modal.onClose();
            modal.submited = false;
          });
        }
      },0);
    }else if (hasChangesInText){
      this.updateStore(newData).then(()=>{
     
        Utilities.loading(false);
        modal.onClose();
      }).catch((error)=>{

        console.log(error);

        Utilities.loading(false);
        modal.onClose();
      });
    }else{

      Utilities.loading(false);
      modal.onClose();
    }
  }

  public async requestNewPassword(username){
    return new Promise<any>((resolve, reject)=>{
      this.authService.requestPassword(username, true).then((data)=>{
        this.notificationService.create({
          title: InformationsTranslate.get().titles.main,
          description: InformationsTranslate.get().notifications.requestPassword.success(data.email),
          status:  ENotificationStatus.success,
          path: "",
        }, false);
        resolve(null);
      }).catch((data)=>{
        this.notificationService.create({
          title:  InformationsTranslate.get().titles.main,
          description: InformationsTranslate.get().notifications.requestPassword.error,
          status:  ENotificationStatus.danger,
          path: "",
        });
        reject(data);
      });
    });
  }

  // Data processing

  public removeListeners(emitterId: "store" | "matrix" | "stores", listernId: string | string[] = "") {
    Utilities.offEmitterListener(this._emitter, emitterId, listernId);
  }

  private requestData() {

    if (Utilities.storeID != "matrix"){
      this.iToolsService.database().collection("Stores").doc("matrix").onSnapshot((snapshot)=>{
        if (snapshot.id){
  
          this.matrixData = snapshot.data();
          this._emitter.emit("matrix", Utilities.deepClone(this.matrixData));

          if (!this.matrixData.isPaid){
            this.notificationService.create({
              title: InformationsTranslate.get().titles.main,
              description: InformationsTranslate.get().notifications.revokedAccess,
              status: ENotificationStatus.info,
              path: "",
            }, false);

            setTimeout(()=>{
              this.authService.logout().then(()=>{

                window.location.href = window.location.href;
              });
            }, 5000);
          }
        }else{
  
          this._emitter.emit("matrix",{});
        }

        this._checkDataMatrix = true;
      });
    }

    this.iToolsService.database().collection("RegistersCollaborators").where([
      {field: "owner", operator: "=", value: Utilities.storeID},
      {field: "id", operator: "!=", value: "root"}
    ]).count().get().then((data)=>{

      const count = data.docs.length ? data.docs[0].data().count : 0;
      this.currentUsersCount = count ? count : 0;
    });


    this.iToolsService.database().collection("Stores").doc(Utilities.storeID).onSnapshot((snapshot)=>{
      if (snapshot.id){

        this.data = snapshot.data();

        Dispatch.removeListeners("user-root","StoreService");
        Dispatch.onUserRootChange("StoreService", (rootUserData)=>{
    
          if (!rootUserData.status){ return; }
    
          if (Utilities.storeID == "matrix"){
    
            this.matrixData = Utilities.deepClone(this.data);
            this.matrixData.rootUser = rootUserData.data;
            this._checkDataMatrix = true;
            this._emitter.emit("matrix", Utilities.deepClone(this.matrixData));
    
            if (!this.matrixData.isPaid){
              this.notificationService.create({
                title: InformationsTranslate.get().titles.main,
                description: InformationsTranslate.get().notifications.revokedAccess,
                status: ENotificationStatus.info,
                path: "",
              }, false);

              setTimeout(()=>{
                this.authService.logout().then(()=>{
  
                  window.location.href = window.location.href;
                });
              }, 5000);
            }
          }

          Utilities.localStorage("storeInfo", this.data);
          this.data.rootUser = rootUserData.data;
          this._emitter.emit("store", Utilities.deepClone(this.data));
          this._checkData = true;
        });
      }else{

        this._emitter.emit("matrix", {});
        this._emitter.emit("store",{});
        this._checkData = true;
      }
    });

    this.iToolsService.database().collection("Stores").onSnapshot((res)=>{
      if (res.changes().length == 0) {
        for (const doc of res.docs) {
          const docData = doc.data();
          this.allStores[docData._id] = docData;
        }
      } else {
        for (const doc of res.changes()) {

          const docData = doc.data();

          if (doc.type == 'ADD' || doc.type == 'UPDATE') {       
            this.data[docData._id] = docData;
          }

          if (doc.type == 'DELETE') {
            if (this.data[docData._id]) {
              delete this.allStores[docData._id];
            }
          }
        }
      }

      this._emitter.emit("stores", this.treatData(this.allStores));
      this._checkStoresData = true;
    });


  }
 
  // Utilities

  
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
                    <b style="font: 21px 'Arial';">${ InformationsTranslate.get().notifications.email.yourCredentials }</b>
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
        subject: InformationsTranslate.get().notifications.email.title,
        attachments: [
          {
            filename: 'logo.png',
            path: 'https://localhost:3001/src/assets/images/logo.png',
            cid: 'logo'
          }
        ]
      }).then((res)=>{
        if (res.status){

          resolve();
        }else{

          reject(res);
        }
      }).catch((error)=>{

        reject(error);
      });
    });
  }
 
  public async generateUserName(name: string, oldUsername: string = null, store = null){

    return new Promise<any>((res, rej)=>{
      name = name.trim().replace(/[ ]+/ig, " ");
      const firstName = name.split(" ")[0];
      const lastName = name.split(" ")[1] ? name.split(" ")[name.split(" ").length - 1] : "";
      const usernames = [];
  
      const items = 10000;
      let suffix = 1;
      const storeId = store || Utilities.storeID;
      const storeCode = storeId == "matrix" ? "" : "-"+storeId.split("-")[1];
      let username = (firstName+lastName+storeCode).toLowerCase();
      username = username.replace(/[ ]*/g,"").toLowerCase();

      if (username == oldUsername){

        res(username);
        return;
      }

      this.iToolsService.database().collection("RegistersCollaborators").where([
        {field: "owner", operator: "=", value: storeId},
        {field: "username", operator: "=", value: username}
      ]).limit(items).get().then(async (data)=>{
        if (data.docs.length){

          await this.iToolsService.database().collection("RegistersCollaborators").where([{field: "owner", operator: "=", value: storeId}]).count().get().then((allCollaborators)=>{
            const count = data.docs.length ? data.docs[0].data().count : 0;
            this.currentUsersCount = count ? count : 0;
          });

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
              {field: "owner", operator: "=", value: storeId}
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
                username = (firstName+lastName+suffix + storeCode).toLowerCase();
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
 
  private generateCode(length: number = 4) {
    
    let randOrd = ()=>{ return (Math.round(Math.random())-0.5); };
    
    let hexDec = ["0","1","2","3","4","5","6","7","8","9",'a','b','c','d','e','f'];
    let code = "";
    
    for (let i = 0; i < length; i++){

      hexDec = hexDec.sort(randOrd);
      code += hexDec[0];
    }

    return code;
  }

  private treatData(data: any): any{

    const sort = (a: any, b: any)=>{ return ((a.registerDate < b.registerDate) ? 1 : ((a.registerDate > b.registerDate) ? -1 : 0)); };
    const result = data ? Object.values(data).sort(sort) : [];
    return Utilities.deepClone(result);
  }
  
}