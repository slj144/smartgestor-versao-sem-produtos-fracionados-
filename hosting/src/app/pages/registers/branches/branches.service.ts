import { Injectable } from "@angular/core";
import { EventEmitter } from 'events';
import { iTools } from "../../../../assets/tools/iTools";

// Services
import { IToolsService } from "@shared/services/iTools.service";
import { StoreService } from '../../informations/informations.service';
import { CollaboratorsService } from "../collaborators/collaborators.service";
import { NotificationService } from '@shared/services/notification.service';
import { SystemLogsService } from '@shared/services/system-logs.service';

// Interfaces
import { IStore } from '@shared/interfaces/IStore';
import { ENotificationStatus } from '@shared/interfaces/ISystemNotification';
import { ESystemLogAction, ESystemLogType } from '@shared/interfaces/ISystemLog';

// Utilities
import { $$ } from "@shared/utilities/essential";
import { Utilities } from '@shared/utilities/utilities';
import { query } from "@shared/types/query";
import { ICollection } from "@itools/interfaces/ICollection";
import { IBatch } from "@itools/interfaces/IBatch";
import { StorageService } from "@shared/services/storage.service";
import { BranchesTranslate } from "./branches.translate";
import { ProjectSettings } from "../../../../assets/settings/company-settings";

@Injectable({  providedIn: 'root'})
export class BranchesService{

  private settings: any = {
    start: 0,
    limit: 30,
    snapshotRef: null
  };

  private firstScrolling: boolean = false;

  private _checkProcess: boolean = false;

  private data: any = {};
  private _checkRequest: boolean = false;
  private _dataMonitors: EventEmitter = new EventEmitter();

  private currentUsersCount: number = 0;
  private _checkMatrixRequest: boolean = false;
  private limitBranches: number = 0;
  private currentBranchesCount: number = 0;

  constructor(
    private iToolsService: IToolsService,
    private collaboratorsService: CollaboratorsService,
    private notificationService: NotificationService,
    private systemLogsService: SystemLogsService,
    private storeService: StoreService
  ){

    this.query().catch(()=>{});
  }

  public get limit() {
    return this.settings.limit;
  }

  private collRef(settings: any = null): ICollection {
    const collection = this.iToolsService.database().collection('Stores').where([{field: "_id", operator: "!=", value: "matrix"}]).orderBy({datetime: -1});

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
    }

    return collection;
  }

  public query(where?: query['where'], reset: boolean = true, flex: boolean = false, scrolling: boolean = false, strict: boolean = true) {
    return (new Promise<any>((resolve, reject) => {

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

      this.requestData(queryObject, strict).then((res) => {
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
        this.storeService.getMatrixStore("BrachesComponent", (data: IStore)=>{

          this.limitBranches = data.limitBranches ? data.limitBranches : 0;
          this._checkMatrixRequest = true;
        });
      }
      
      if (strict){
        if (!this._checkProcess){
  
          this._checkProcess = true;

          if (this.settings.snapshotRef){
            this.collRef(settings).clearSnapshot(this.settings.snapshotRef);
          }

          this.settings.snapshotRef = this.collRef(settings).onSnapshot((res)=>{

            let request = 0;

            if (res.changes().length == 0) {

              request = res.docs.length;

              for (const doc of res.docs) {
                const docData = doc.data();
                this.collaboratorsService.query([{field: "owner", operator: "=", value: docData._id},{field: "source", operator: "=", value: "root"}], false, false, false, false).then((data)=>{
                  if (data.length){
                    docData.rootUser = data[0];
                    this.data[docData._id] = docData;
                  }
                  request--;
                }).catch((err)=>{
      
                  request--;
                }); 
              }
            } else {

              request = res.changes().length;

              for (const doc of res.changes()) {
      
                const docData = doc.data();
      
                if (doc.type == 'ADD' || doc.type == 'UPDATE') {       
                  this.collaboratorsService.query([{field: "owner", operator: "=", value: docData._id},{field: "source", operator: "=", value: "root"}], false, false, false, false).then((data)=>{
                    if (data.length){
                      docData.rootUser = data[0];
                      this.data[docData._id] = docData;
                    }
                    request--;
                  }).catch((err)=>{
                    
                    request--;
                  });
                }
      
                if (doc.type == 'DELETE') {
                  if (this.data[docData._id]) {
                    delete this.data[docData._id];
                    request--;
                  }
                }
              }
            }

            const timer = setInterval(()=>{
              if (request == 0){
                clearInterval(timer);
                
                this.collRef(settings).count().get().then((res) => {

                  this.settings.count = (res.docs.length > 0 ? res.docs[0].data().count : 0);
                  if (Object.values(this.data).length > 0 &&  this.settings.count == 0){
                    this.settings.count = $$(this.data).length;
                  }
                  this._dataMonitors.emit('count', this.treatData('count'));
                });
      
                this._dataMonitors.emit("branches", this.treatData());
                this._checkRequest = true;
                this._checkProcess = false;
                resolve(null);
              }
            }, 0);
          });
        }
      }else{
  
        if (settings.start != undefined && settings.start >= 0) {
          delete settings.start;
        }
  
        if (settings.limit != undefined && settings.limit > 0) {
          delete settings.limit;
        }

        this.collRef(settings).get().then((res) => {

          let request = res.docs.length;
          const data = [];

          for (const doc of res.docs) {
            const docData = doc.data();

            this.collaboratorsService.query([{field: "owner", operator: "=", value: docData._id},{field: "source", operator: "=", value: "root"}], false, false, false, false).then((collaborator)=>{
              if (collaborator.length){
                docData.rootUser = collaborator[0];
                data.push(docData);
              }
              request--;
            }).catch((err)=>{
  
              request--;
            }); 
          }

          const timer = setInterval(()=>{
            if (request == 0){
              clearInterval(timer);
              resolve(data);
            }
          }, 0);
  
        }).catch((e) => {
          reject(e);
        });
      }
    });
  }

  public getBranches(listenerId: string, listener: (_: any)=> void){
    
    Utilities.onEmitterListener(this._dataMonitors, "branches", listenerId, listener);

    if (this._checkRequest) {
      this._dataMonitors.emit("branches", this.treatData());
    }
  }

  public getBranchesCount(listenerId: string, listener: ((_: any)=>void)) {
      
    const emitterId = 'count';

    Utilities.onEmitterListener(this._dataMonitors, emitterId, listenerId, listener);

    if (this._checkRequest) {
      this._dataMonitors.emit(emitterId, this.treatData(emitterId));
    }
  }

  public async updateBranch(data: IStore){
    return new Promise<void>((resolve, reject)=>{
      const timer = setInterval(async ()=>{
        if (this._checkMatrixRequest){
          clearInterval(timer);

          Utilities.loading(true);

          await this.iToolsService.database().collection("Stores").where([{field: "_id", operator: "!=", value: "matrix"}]).count().get().then((allBraches)=>{
            const count = allBraches.docs.length ? allBraches.docs[0].data().count : 0;
            this.currentBranchesCount = count ? count : 0;
          });
    
          if (this.currentBranchesCount + 1 > this.limitBranches){
    
            this.notificationService.create({
              title: BranchesTranslate.get().titles.main,
              description: BranchesTranslate.get().notifications.registerLimit,
              status: ENotificationStatus.danger,
              path: "",
            }, false);
            return;
          }
    
          let source: any = null;
          const type: "add" | "update" = data._id ? "update" : "add";
          let id = type == "update" ? data._id : null;
    
          if (type == "add"){
      
            data.datetime = iTools.FieldValue.date(Utilities.timezone);
          }else{

            source = (await this.iToolsService.database().collection("Stores").doc(data._id).get()).data();

            const sourceAdminUser = (await this.collaboratorsService.query([
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
          }

          data.updateTime = iTools.FieldValue.date(Utilities.timezone);
      
          const password = this.generateCode(6);
      
          const adminUser: any = {
            _id: data.rootUser._id,
            owner: data._id,
            name: data.rootUser.name,
            email: data.rootUser.email,
            username: data.rootUser.username,
            image: data.rootUser.image,
            usertype: "admin",
            source: "root",
            code: "@1",
            allowAccess: true
          };

    
          const notifyPassword = (username: string, email: string, password: string, exists = false)=>{

            const originEmail = email;
            email = data.contacts.email ? data.contacts.email : email;
    
            this.collaboratorsService.sendCredentials({
              username: username,
              email: email,
              password: exists ? BranchesTranslate.get().notifications.email.message(originEmail) : password,
              subject: BranchesTranslate.get().notifications.email.title,
            }).then(()=>{
              
              this.notificationService.create({
                title: BranchesTranslate.get().titles.main,
                description: BranchesTranslate.get().notifications.credentialsSendedWithSuccess(email),
                status: ENotificationStatus.success,
                path: "",
              }, false);
            }).catch((e)=>{
    
              console.log(e);
              
              this.notificationService.create({
                title: BranchesTranslate.get().titles.main,
                description: BranchesTranslate.get().notifications.credentialsSendedWithError,
                status: ENotificationStatus.danger,
                path: "",
              }, false);
            });
          };
      
          const exec = (notify: boolean = true, exists = false, adminUser: any)=>{
      
            const batch = this.iToolsService.database().batch();
            const rootUser = data.rootUser;
            adminUser = Utilities.deepClone(adminUser);
            adminUser.username = rootUser.username;
            adminUser.owner = rootUser.owner;
            adminUser = Utilities.deepClone(adminUser)
            delete data.rootUser;
    
            const commit = (batch: IBatch)=>{
              batch.commit().then(()=>{

                Utilities.localStorage("username", adminUser.username);
                Utilities.localStorage("storeInfo", data);
      
                if (notify){ notifyPassword(adminUser.username, adminUser.email, password, exists); }
        
                notification(true);
                Utilities.loading(false);
                resolve();
              }).catch(()=>{
        
                Utilities.localStorage("username", source.rootUser.username);
                notification(false);
                Utilities.loading(false);
                reject(false);
              });
            };
    
            data._id = id;
            batch.update(this.iToolsService.database().collection("Stores").doc(id), data);

    
            this.systemLogsService.registerLogs({
              data: [{
                referenceCode: id,
                type: ESystemLogType.RegistersBranches,
                note: BranchesTranslate.get().systemLogNotes.updateBranch,
                action: ESystemLogAction.UPDATE
              }],
              owner: Utilities.storeID,
              operator: Utilities.operator,
              registerDate: iTools.FieldValue.date(Utilities.timezone)
            }, batch);
      
            const notification = (status: boolean)=>{
              this.notificationService.create({
                title: BranchesTranslate.get().titles.main,
                description: status ? BranchesTranslate.get().notifications.updateBranchWithSuccess : BranchesTranslate.get().notifications.updateBranchWithError,
                status: status ? ENotificationStatus.success : ENotificationStatus.danger,
                path: "",
              }, false);
            };
      
            if (type == "add"){
              adminUser;batch;

              this.configCreateBranch(data._id, batch);

              this.collaboratorsService.updateCollaborator(adminUser, false, batch, id).then(()=>{
    
                commit(batch);
              }).catch((err)=>{
    
                Utilities.loading(false);
                reject(err);
              });
            }else{
              this.collaboratorsService.query([
                {field: "owner", operator: "=", value: adminUser.owner}
                ,{field: "_id", operator: "=", value: adminUser._id},
              ], false, false, false, false).then((data)=>{


                if (data && data.length){
    
                  data = data[0];

                  this.collaboratorsService.updateCollaborator(adminUser, false, batch, id).then(()=>{
    
                    commit(batch);
                  }).catch((err)=>{

                    Utilities.loading(false);
                    reject(err);
                  });
                }else{
    
                  Utilities.loading(false);
                  reject({message: "rootUser not found."});
                }
              }).catch((err)=>{
    
                Utilities.loading(false);
                reject(err);
              });
            }
          };

          if (source && source.rootUser.email != data.rootUser.email || !source){
            this.iToolsService.auth().createUser({
              email: data.rootUser.email,
              password: password,
            }).then(()=>{
              if (source && data.rootUser.name != source.rootUser.name || !source){
                this.generateBrancheCode().then((code)=>{
                  this.generateUserName(data.rootUser.name, type == "add" ? "" : source.rootUser.username, type == "add" ? code : data._id).then((username)=>{
                    if (username){
        
                      id = code;
                      data._id = code;
                      data.rootUser.username = username;
                      data.rootUser.owner = type == "add" ? code : data._id;
                      adminUser.owner = data.rootUser.owner;
                      adminUser.username = username;
                      exec(true, false, adminUser);
                    }else{
        
                      reject(false);
                    }
                  });
                });
              }else{
                
                exec(true, false, adminUser);
              }
            }).catch((err)=>{
              if (err.code === "user-already-registered"){
                if (source && data.rootUser.name != source.rootUser.name || !source){
                  this.generateBrancheCode().then((code)=>{
                    this.generateUserName(data.rootUser.name, type == "add" ? "" : source.rootUser.username, type == "add" ? code : data._id).then((username)=>{
                      if (username){
        
                        id = type == "add" ? code : data._id;
                        data.rootUser.username = username;
                        data.rootUser.owner = id;
                        adminUser.owner = data.rootUser.owner;
                        adminUser.username = username;
                        exec(true,true, adminUser);
                      }else{
        
                        Utilities.loading(false);
                        reject(false);
                      }
                    });
                  });
                }else{
                 
                  exec(true, true, adminUser);
                  reject(true);
                }
              }else{
      
                Utilities.loading(false);
                reject(false);
              }
            });
          }else{
            if (source && data.rootUser.name != source.rootUser.name){
              this.generateUserName(data.rootUser.name, source.rootUser.username, data._id).then((username)=>{
                if (username){
    
                  data.rootUser.owner = data._id;
                  data.rootUser.username = username;
                  adminUser.username = username;
                  adminUser.owner = data._id;

                  exec(true, true, adminUser);
                }else{
      
                  Utilities.loading(false);
                  reject(false);
                }
              });
            }else{
      
              exec(false, false, adminUser);
            }
          }
        }
      }, 0);
    });
  }

  private clearBranchData(id, batch: IBatch){

    const entities = [
      "Annotations",
      "ServiceOrders",
      "SystemLogs",
      "FinancialBankAccounts",
      "FinancialBillsToReceive",
      "CashierSales",
      "CashierInflows",
      "StockPurchases",
      "SystemControls",
      "RegistersCustomers",
      "RegistersCollaborators",
      "Events",
      "Agenda",
      "Donations",
      "Tithes",
      "Crafts",
      "RegistersPaymentMethods",
      "FinancialBillToReceiveCategories",
      "FinancialBillToPayCategories",
      "FinancialBankTransactions",
      "SocialDemands",
      "RegistersPartners",
      "RegistersMembers",
      "RegistersVoters",
      "RegistersCarriers",
      "Requests",
      "RegistersProviders",
      "CashierControls",
      "ServiceOrders",
      "StockLogs",
      "SystemLogs"
    ];

    entities.forEach((entity)=>{
      batch.delete({
        collName: entity,
        mode: "document",
        where: [{
          field: "owner",
          operator: "=",
          value: id
        }]
      });
    });

    const updateObj = {branches: {}};
    updateObj.branches[id] = "$unset()";

    // batch.update({
    //   collName: "StockProducts",
    //   where: [
    //     {field: `branches.${id}`, operator: "exists", value: true }
    //   ],
    // }, updateObj, {merge: true, upsert: false});
  }

  private configCreateBranch(storeId, batch: IBatch){

    let language = window.localStorage.getItem('Language') || ProjectSettings.companySettings().language;

    const FinancialBillToPayCategories = [
      {"_id": iTools.ObjectId(),"code":"@0002","name": language == "en" ? "TRANSFER" : "TRANSFERÊNCIA","owner":storeId,"registerDate":iTools.FieldValue.date("America/Sao_Paulo"),"modifiedDate":iTools.FieldValue.date("America/Sao_Paulo"),"_isDefault":true},
      {"_id": iTools.ObjectId(),"name": language == "en" ? "PURCHASE OF MERCHANDISE" : "COMPRA DE MERCADORIA","code":"@0001","owner":storeId,"registerDate":iTools.FieldValue.date("America/Sao_Paulo"),"modifiedDate":iTools.FieldValue.date("America/Sao_Paulo"),"_isDefault":true}
    ];

    const FinancialBillToReceiveCategories = [
      {"_id": iTools.ObjectId(),"name": language == "en" ? "PAYMENT METHOD" : "MEIO DE PAGAMENTO","code":"@0002","owner":storeId,"registerDate":iTools.FieldValue.date("America/Sao_Paulo"),"modifiedDate":iTools.FieldValue.date("America/Sao_Paulo"),"_isDefault":true},
      {"_id": iTools.ObjectId(),"name": language == "en" ? "TRANSFER" : "TRANSFERÊNCIA","code":"@0003","owner":storeId,"registerDate":iTools.FieldValue.date("America/Sao_Paulo"),"modifiedDate":iTools.FieldValue.date("America/Sao_Paulo"),"_isDefault":true},
      {"_id": iTools.ObjectId(),"allowSelection":false,"allowModification":false,"code":"@0001","name": language == "en" ? "PENDENT SALE" : "VENDA PENDENTE","owner":storeId,"registerDate":iTools.FieldValue.date("America/Sao_Paulo"),"modifiedDate":iTools.FieldValue.date("America/Sao_Paulo"),"_isDefault":true}
    ];

    const FinancialBankAccounts = [
      {"_id": iTools.ObjectId(),"_isDefault" : true, "account" : "000000", "agency" : "0000", "balance" : 0, "code" : "@0001", "modifiedDate" : iTools.FieldValue.date("America/Sao_Paulo"), "name" : language == "en" ? "COMPANY CASHIER" : "Caixa da Empresa", "owner" : storeId, "registerDate" : iTools.FieldValue.date("America/Sao_Paulo")},
      {"_id": iTools.ObjectId(),"_isDefault" : true, "account" : "000000", "agency" : "0000", "balance" : 0, "code" : "@0002", "modifiedDate" : iTools.FieldValue.date("America/Sao_Paulo"), "name" : language == "en" ? "COMPANY VAULT" : "Cofre da Empresa", "owner" : storeId, "registerDate" : iTools.FieldValue.date("America/Sao_Paulo")}
    ];

    FinancialBillToPayCategories.forEach((item)=>{
      batch.update({docName: item._id, collName: "FinancialBillToPayCategories"}, item);
    });

    FinancialBillToReceiveCategories.forEach((item)=>{
      batch.update({docName: item._id, collName: "FinancialBillToReceiveCategories"}, item);
    });

    FinancialBankAccounts.forEach((item)=>{
      batch.update({docName: item._id, collName: "FinancialBankAccounts"}, item);
    });

  }

  public async removeBranch(id: string){
    return new Promise<void>((resolve, reject)=>{

      const notification = (status: boolean)=>{
        this.notificationService.create({
          title: "Filiais",
          description: status ? BranchesTranslate.get().notifications.deleteBranchWithSuccess : BranchesTranslate.get().notifications.deleteBranchWithError,
          status: status ? ENotificationStatus.success : ENotificationStatus.danger,
          path: "",
        }, false);
      };
      
      const batch = this.iToolsService.database().batch();
      batch.delete(this.iToolsService.database().collection("Stores").doc(id));

      this.clearBranchData(id, batch);

      this.systemLogsService.registerLogs({
        data: [{
          referenceCode: id,
          action: ESystemLogAction.DELETION,
          type: ESystemLogType.RegistersBranches,
          note: BranchesTranslate.get().systemLogNotes.deleteBranch
        }],
        owner: Utilities.storeID,
        operator: Utilities.operator,
        registerDate: iTools.FieldValue.date(Utilities.timezone)
      }, batch).then(()=>{

        batch.commit().then((res)=>{

          notification(true);
          resolve();
        }).catch((err)=>{


          console.log(err);

          notification(false);
          reject(err);
        });
      });
    });
  }

  public async saveChanges(event: Event, oldData: IStore, newData: IStore, action: string, modal: any){
    if (modal.model.invalid){ return; }

    Utilities.loading(true);

    action = action.trim().toLowerCase();
    let form  = $$(event.target);
    let hasChangesInText = false;
    let hasChangesInFile = false;
    let uploadCount = 0;
    let input = form.find("input[type=file]");

    if (newData.image && newData.image != oldData.image){

      hasChangesInFile = true;

      StorageService.uploadFile({
        storageRef: this.iToolsService.storage(),
        settings: [{
          bindData: {
            img: form.find(".image-container img")
          },
          dataFile: newData.image,
          file: (input.pos(0) as HTMLInputElement).files[0],
          path: "Stores"
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
      // if (
      //   oldData.cnpj != newData.cnpj || oldData.rootUser.email != newData.rootUser.email || oldData.rootUser.name != newData.rootUser.name || oldData.name != newData.name || oldData.billingName != newData.billingName ||
      //   oldData.address.addressLine != newData.address.addressLine || oldData.address.city != newData.address.city || oldData.address.country != newData.address.country || oldData.address.state != newData.address.state || oldData.address.postalCode != newData.address.postalCode ||
      //   oldData.contacts.email != newData.contacts.email || oldData.contacts.phone != newData.contacts.phone || oldData.contacts.whatsapp != newData.contacts.whatsapp
      // ){

        hasChangesInText = true;
      // }


      // console.log(newData);
    }

    if (hasChangesInFile){
      const it = setInterval(()=>{
        if (uploadCount === 1){
          clearInterval(it);
          this.updateBranch(newData).then(()=>{

            Utilities.loading(false);
            modal.onCloseModal();
          }).catch(()=>{

            Utilities.loading(false);
            modal.onCloseModal();
          });
        }
      },0);
    }else if (hasChangesInText){
      this.updateBranch(newData).then(()=>{

        Utilities.loading(false);
        modal.onCloseModal();
      }).catch((error)=>{

        Utilities.loading(false);
        modal.onCloseModal();
      });
    }else{

      Utilities.loading(false);
      modal.onCloseModal();
    }
  }


  /// Utilities

  private treatData(id: string = "records", data: any = null): any{

    if (id == 'count') {

      const result: any = { 
        current: $$(data || this.data).length, total: this.settings.count
      };

      return result;
    }

    if (id == "records"){

      const sort = (a: any, b: any)=>{ return ((a.registerDate < b.registerDate) ? 1 : ((a.registerDate > b.registerDate) ? -1 : 0)); };
      const result =  Object.values(data ? data : this.data).sort(sort);
      return Utilities.deepClone(result);
    }
    
  }

  private async generateBrancheCode(){
    return new Promise<string>((resolve)=>{

      const codes: Array<string> = [];

      this.iToolsService.database().collection("Stores").get().then((data)=>{
        if (data.docs.length){
          $$(data.docs).map((_,doc)=>{ codes.push(doc.id); });
        }
      });
  
      let code = "branch-"+this.generateCode(4);
  
      while(codes.indexOf(code) !== -1){
  
        code = "branch-"+this.generateCode(4);
      }

      resolve(code);
    });
  }

  public async generateUserName(name: string, oldUsername: string = null, storeId: string = ""){

    return new Promise<any>((res, rej)=>{
      name = name.trim().replace(/[ ]+/ig, " ");
      const firstName = name.split(" ")[0];
      const lastName = name.split(" ")[1] ? name.split(" ")[name.split(" ").length - 1] : "";
      const usernames = [];
  
      const items = 30000;
      let suffix = 1;
      storeId = storeId;
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

  public removeListeners(emitterId: string = null, listenerId: string | string[] = null) {
    Utilities.offEmitterListener(this._dataMonitors, emitterId, listenerId);
  }

}
