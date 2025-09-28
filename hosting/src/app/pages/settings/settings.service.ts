import { Injectable } from "@angular/core";
import { EventEmitter } from 'events';

// Services
import { IToolsService } from "@shared/services/iTools.service";
import { NotificationService } from '@shared/services/notification.service';

// Translate
import { SettingsTranslate } from "./settings.translate";

// Interfaces
import { ICollection } from "@itools/interfaces/ICollection";
import { ENotificationStatus } from '@shared/interfaces/ISystemNotification';

// Utilities
import { Utilities } from '@shared/utilities/utilities';
import { Dispatch } from "@shared/utilities/dispatch";

@Injectable({ providedIn: 'root' })
export class SettingsService {

  public translate = SettingsTranslate.get();

  private data: any = {};
  private matrixData: any = {};
  private generalSOSettings: any = {};

  private _checkRequest: boolean = false;
  private _checkSORequest: boolean = false;
  private _dataMonitors: EventEmitter = new EventEmitter();

  constructor(
    private iToolsService: IToolsService,
    private notificationService: NotificationService
  ) {
    this.requestData();
  }

  // CRUD Methods

  public getSettings(listenerId: string, listener: ((_: any)=>void)) {

    const emitterId = 'settings';

    Utilities.onEmitterListener(this._dataMonitors, emitterId, listenerId, listener);

    if (this._checkRequest) {
      this._dataMonitors.emit(emitterId, this.treatData(emitterId));
    }
  }

  public getSOSettings(listenerId: string, listener: ((_: any)=>void)) {

    const emitterId = 'service-orders-settings';

    Utilities.onEmitterListener(this._dataMonitors, emitterId, listenerId, listener);

    if (this._checkSORequest) {
      this._dataMonitors.emit(emitterId, this.treatData(emitterId));
    }
  }

  // General Settings Methods

  public async updateGeneralLanguage(value: string, save: boolean = false) {

    return (new Promise<void>((resolve, reject) => {

      try {
        
        Utilities.loading();

        if (save) {          

          const updateObject: any = { general: {} };
          updateObject.general.language = value;
      
          this.collRef().doc(Utilities.storeID).update(updateObject, { merge: true }).then(() => {
 
            Utilities.loading(false);
            resolve();            

            this.notifications('General/Language', 'success');
          }).catch((error) => {
      
            Utilities.loading(false);
            reject(error);

            this.notifications('General/Language', 'error');
            console.error(`Error: ${error.message}`);
          });
        } else {

          setTimeout(() => {

            Utilities.loading(false);
            resolve();

            window.localStorage.setItem('Language', value);
            Dispatch.emit('refresh-menu', {});

            this.notifications('General/Language', 'success');           
          }, 1000);         
        }
      } catch(error) {

        Utilities.loading(false);
        reject(error);

        this.notifications('General/Language', 'error');
        console.error(`Error: ${error.message}`);
      }      
    }));
  }

  public async updateGeneralCurrency(value: string, save: boolean = false) {
    
    return (new Promise<void>((resolve, reject) => {

      try {

        Utilities.loading();

        if (save) {

          const updateObject: any = { general: {} };
          updateObject.general.currency = value;
      
          this.collRef().doc(Utilities.storeID).update(updateObject, { merge: true }).then(() => {
      
            Utilities.loading(false);
            resolve();

            this.notifications('General/Currency', 'success');
          }).catch((error) => {
      
            Utilities.loading(false);
            reject(error);

            this.notifications('General/Currency', 'error');
            console.error(`Error: ${error.message}`);
          });
        } else {

          setTimeout(() => {

            Utilities.loading(false);
            resolve();      

            window.localStorage.setItem('Currency', value);

            this.notifications('General/Currency', 'success');
          }, 1000);
        }
      } catch(error) {

        Utilities.loading(false);
        reject(error);

        this.notifications('General/Currency', 'error');
        console.error(`Error: ${error.message}`);
      }     
    }));
  }

  // Cashier Settings Methods

  public async updateCashierOperationalMode(value: string) {

    return (new Promise<void>((resolve, reject) => {

      try {

        Utilities.loading();

        const updateObject: any = { cashier: {} };
        updateObject.cashier.operationalMode = value;
    
        this.collRef().doc(Utilities.storeID).update(updateObject, { merge: true }).then(() => {
    
          Utilities.loading(false);
          resolve();
    
          this.notifications('Cashier/OperationalMode', 'success');
        }).catch((error) => {
    
          Utilities.loading(false);
          reject(error);

          this.notifications('Cashier/OperationalMode', 'error');
          console.error(`Error: ${error.message}`);
        });
      } catch(error) {

        Utilities.loading(false);
        reject(error);

        this.notifications('Cashier/OperationalMode', 'error');
        console.error(`Error: ${error.message}`);
      }
    }));
  }

  public async updateCashierWarrantyTerm(value: string) {

    return (new Promise<void>((resolve, reject) => {

      try {

        Utilities.loading();

        const updateObject: any = { cashier: {} };
        updateObject.cashier.warrantyTerm = value;

        this.collRef().doc(Utilities.storeID).update(updateObject, { merge: true }).then(() => {
    
          Utilities.loading(false);
          resolve();
    
          this.notifications('Cashier/WarrantyTerm', 'success');
        }).catch((error) => {
    
          Utilities.loading(false);
          reject(error);

          this.notifications('Cashier/WarrantyTerm', 'error');
          console.error(`Error: ${error.message}`);
        });
      } catch(error) {
        
        Utilities.loading(false);
        reject(error);

        this.notifications('Cashier/WarrantyTerm', 'error');
        console.error(`Error: ${error.message}`);
      }
    }));
  }

  // Service Orders Settings Methods

  public async updateServiceOrdersChecklist(value: any) {

    return (new Promise<void>((resolve, reject) => {

      try {

        Utilities.loading();

        const updateObject: any = { serviceOrders: {} };
        updateObject.serviceOrders.checklist = value;
    
        this.collRef().doc(Utilities.storeID).update(updateObject, { merge: true }).then(() => {
    
          Utilities.loading(false);
          resolve();

          this.notifications('ServiceOrder/Checklist', 'success');   
        }).catch((error) => {
    
          Utilities.loading(false);
          reject(error);

          this.notifications('ServiceOrder/Checklist', 'error');
          console.error(`Error: ${error.message}`);
        });
      } catch(error) {

        Utilities.loading(false);
        reject(error);

        this.notifications('ServiceOrder/Checklist', 'error');
        console.error(`Error: ${error.message}`);
      }
    }));
  }

  public async updateServiceOrdersWarrantyTerm(value: string) {

    return (new Promise<void>((resolve, reject) => {

      try {

        Utilities.loading();

        const updateObject: any = { serviceOrders: {} };
        updateObject.serviceOrders.warrantyTerm = value;

    
        this.collRef().doc(Utilities.storeID).update(updateObject, { merge: true }).then(() => {
    
          Utilities.loading(false);
          resolve();

          this.notifications('ServiceOrder/WarrantyTerm', 'success');   
        }).catch((error) => {
    
          Utilities.loading(false);
          reject(error);

          this.notifications('ServiceOrder/WarrantyTerm', 'error');
          console.error(`Error: ${error.message}`);
        });
      } catch(error) {

        Utilities.loading(false);
        reject(error);

        this.notifications('ServiceOrder/WarrantyTerm', 'error');
        console.error(`Error: ${error.message}`);
      }
    }));
  }

  public async updateServiceOrdersDeliveryTerm(value: string) {

    return (new Promise<void>((resolve, reject) => {

      try {

        Utilities.loading();
        
        const updateObject: any = { serviceOrders: {} };
        updateObject.serviceOrders.deliveryTerm = value;
    
        this.collRef().doc(Utilities.storeID).update(updateObject, { merge: true }).then(() => {
    
          Utilities.loading(false);
          resolve();

          this.notifications('ServiceOrder/DeliveryTerm', 'success');   
        }).catch((error) => {
    
          Utilities.loading(false);
          reject(error);

          this.notifications('ServiceOrder/DeliveryTerm', 'error');
          console.error(`Error: ${error.message}`);
        });
      } catch(error) {

        Utilities.loading(false);
        reject(error);

        this.notifications('ServiceOrder/DeliveryTerm', 'error');
        console.error(`Error: ${error.message}`);
      }
    }));
  }

  // Stock Settings Methods

  public async updateStockAveragePurchaseCost(value: string) {

    return (new Promise<void>((resolve, reject) => {

      try {
        
        Utilities.loading();       

        const updateObject: any = { stock: {} };
        updateObject.stock.averagePurchaseCost = value;

        console.log(updateObject);
    
        this.collRef().doc(Utilities.storeID).update(updateObject, { merge: true }).then(() => {

          Utilities.loading(false);
          resolve();            

          this.notifications('Stock/AveragePurchaseCost', 'success');
        }).catch((error) => {
    
          Utilities.loading(false);
          reject(error);

          this.notifications('Stock/AveragePurchaseCost', 'error');
          console.error(`Error: ${error.message}`);
        });
      } catch(error) {

        Utilities.loading(false);
        reject(error);

        this.notifications('Stock/AveragePurchaseCost', 'error');
        console.error(`Error: ${error.message}`);
      }      
    }));
  }

  public async updateStockAllowNegativeSale(value: boolean) {

    return (new Promise<void>((resolve, reject) => {

      try {

        Utilities.loading();

        const updateObject: any = { stock: {} };
        updateObject.stock.allowNegativeSale = !!value;

        this.collRef().doc(Utilities.storeID).update(updateObject, { merge: true }).then(() => {

          Utilities.loading(false);
          resolve();

          // Mirror to local storage for fast client checks
          Utilities.localStorage('StockAllowNegativeSale', !!value);
          this.notifications('Stock/AllowNegativeSale', 'success');
        }).catch((error) => {

          Utilities.loading(false);
          reject(error);

          this.notifications('Stock/AllowNegativeSale', 'error');
          console.error(`Error: ${error.message}`);
        });
      } catch(error) {

        Utilities.loading(false);
        reject(error);

        this.notifications('Stock/AllowNegativeSale', 'error');
        console.error(`Error: ${error.message}`);
      }
    }));
  }

  public async updateStockAverageTransfersCost(value: string) {

    return (new Promise<void>((resolve, reject) => {

      try {
        
        Utilities.loading();       

        const updateObject: any = { stock: {} };
        updateObject.stock.averageTransfersCost = value;
    
        this.collRef().doc(Utilities.storeID).update(updateObject, { merge: true }).then(() => {

          Utilities.loading(false);
          resolve();            

          this.notifications('Stock/AverageTransfersCost', 'success');
        }).catch((error) => {
    
          Utilities.loading(false);
          reject(error);

          this.notifications('Stock/AverageTransfersCost', 'error');
          console.error(`Error: ${error.message}`);
        });
      } catch(error) {

        Utilities.loading(false);
        reject(error);

        this.notifications('Stock/AverageTransfersCost', 'error');
        console.error(`Error: ${error.message}`);
      }      
    }));
  }

  // Registers Settings Methods

  public async updateRegistersRestrictCustomerRegistration(data: any) {

    return (new Promise<void>((resolve, reject) => {

      try {
        
        Utilities.loading();       

        const updateObject: any = { registers: {} };
        updateObject.registers.restrictCustomerRegistration = data;
            
        this.collRef().doc(Utilities.storeID).update(updateObject, { merge: true }).then(() => {

          Utilities.loading(false);
          resolve();            

          this.notifications('Registers/RestrictCustomerRegistration', 'success');
        }).catch((error) => {
    
          Utilities.loading(false);
          reject(error);

          this.notifications('Registers/RestrictCustomerRegistration', 'error');
          console.error(`Error: ${error.message}`);
        });
      } catch(error) {

        Utilities.loading(false);
        reject(error);

        this.notifications('Registers/RestrictCustomerRegistration', 'error');
        console.error(`Error: ${error.message}`);
      }      
    }));
  }

  // Fiscal

  public async updateFiscalSettings(data: any) {

    return (new Promise<void>((resolve, reject) => {

      try {
        
        Utilities.loading();       

        const updateObject: any = { fiscal: {} };
        updateObject.fiscal = data;
            
        this.collRef().doc(Utilities.storeID).update(updateObject, { merge: true }).then(() => {

          Utilities.loading(false);
          resolve();            

          // this.notifications('Registers/Fiscal', 'success');
        }).catch((error) => {
    
          Utilities.loading(false);
          reject(error);

          // this.notifications('Registers/Fiscal', 'error');
          console.error(`Error: ${error.message}`);
        });
      } catch(error) {

        Utilities.loading(false);
        reject(error);

        // this.notifications('Registers/RestrictCustomerRegistration', 'error');
        console.error(`Error: ${error.message}`);
      }      
    }));
  }

  // Checklist Controls Methods

  public async addChecklist(data: any) {

    return new Promise<void>((resolve, reject) => {

      const timer = setInterval(() => {

        if (this._checkSORequest) {

          clearInterval(timer);

          const checklist = this.treatData("service-orders-settings").checklist || [];
          let isAdded = true;
      
          checklist.forEach((checklistItem, key) => {
            if (checklistItem.name == data.name){ isAdded = false; }
          });

          if (!isAdded) {

            this.notifications('ServiceOrder/Checklist', 'error');
            reject({status: false, type: "hasItem"});

            return;
          }
          
          checklist.push(data);
      
          this.collRef().doc("serviceOrders").update({checklist: checklist}, { merge: true }).then(() => {
      
            this.notifications('ServiceOrder/Checklist', 'success');
            resolve();
          }).catch(() => {

            this.notifications('ServiceOrder/Checklist', 'error');
            reject({status: false, type: "error"});
          });
        }
      }, 0);    
    });
  }

  public async updateChecklist(data: any, oldData: any) {

    return new Promise<void>((resolve, reject)=>{

      const timer = setInterval(() => {

        if (this._checkSORequest) {

          clearInterval(timer);

          const checklist = this.treatData("service-orders-settings").checklist || [];

          let isUpdate: boolean = false;
          let hasItem: boolean = false;
          let keyItem: number = -1;
      
          checklist.forEach((checklistItem, key) => {

            if (checklistItem.name == oldData.name) {
              keyItem = key;
              isUpdate = true;
            }
          });
      
          if (!isUpdate || hasItem) {
      
            this.notifications('ServiceOrder/Checklist', 'error');
            reject({status: false, type: hasItem ? "hasItem" : "error"});

            return;
          }
      
          checklist[keyItem] = data;

          this.collRef().doc("serviceOrders").update({checklist: checklist}, { merge: true }).then(() => {
            
            this.notifications('ServiceOrder/Checklist', 'success');
            resolve();
          }).catch(()=>{
            
            this.notifications('ServiceOrder/Checklist', 'error');
            reject({status: false, type: "error"});
          });
        }
      }, 0);
    });
  }

  public async deleteChecklist(data: any) {

    return new Promise<void>((resolve, reject) => {

      const timer = setInterval(()=>{

        if (this._checkSORequest){

          clearInterval(timer);

          const checklist = this.treatData("service-orders-settings").checklist || [];

          let isDelete = false;
      
          checklist.forEach((checklistItem, key) => {

            if (checklistItem.name == data.name) {      
              checklist.splice(key, 1);
              isDelete = true;
            }
          });
      
          if (!isDelete){
      
            this.notifications('ServiceOrder/Checklist', 'error');
            reject(false);

            return;
          }
      
          this.collRef().doc("serviceOrders").update({checklist: checklist}, { merge: true }).then(() => {
            
            this.notifications('ServiceOrder/Checklist', 'success');
            resolve();
          }).catch(() => {
            
            this.notifications('ServiceOrder/Checklist', 'error');
            reject(false);
          });
        }
      }, 0);
    });
  }

  // Auxiliary Methods

  private collRef(): ICollection {
    return this.iToolsService.database().collection('Settings');
  }

  private notifications(target: string, result: ('success'|'error'), storage: boolean = false) {

    const settings: any = {
      title: this.translate.notification[target].title  
    };

    if (result == 'success') {      
      settings.description = this.translate.notification[target].description;
      settings.status = ENotificationStatus.success;
    }

    if (result == 'error') {
      settings.description = this.translate.notification.error;
      settings.status = ENotificationStatus.danger;
    }

    this.notificationService.create(settings, storage);
  }

  // Data Processing

  public removeListeners(listenerId: (string | string[]) = null, emitterId: "settings" | "service-orders-settings" = "settings") {
    Utilities.offEmitterListener(this._dataMonitors, emitterId, listenerId);
  }

  private requestData() {

    this.collRef().doc("serviceOrders").onSnapshot((doc) => {

      this.generalSOSettings = (doc.data() || {});

      this._dataMonitors.emit('service-orders-settings', this.treatData('service-orders-settings'));
      this._checkSORequest = true;
    });

    let matrixSnapshot;

    this.collRef().doc(Utilities.storeID).onSnapshot((doc) => {

      this.data = (doc.data() || {});

      if (!this._checkRequest && !Utilities.isMatrix) {
        
        this.collRef().doc("matrix").clearSnapshot(matrixSnapshot);
        
        matrixSnapshot = this.collRef().doc("matrix").onSnapshot((doc) => {
          this.matrixData = (doc.data() || {});
          this._dataMonitors.emit('settings', this.treatData('settings'));
        });
      } else {
        this.matrixData = Utilities.deepClone(this.data);
        this._dataMonitors.emit('settings', this.treatData('settings'));
      }

      this._checkRequest = true;
    });
  }

  private treatData(id: string) {

    if (id == 'settings') {

      const data = Utilities.deepClone(Utilities.isMatrix ? this.matrixData : this.data);

      if (!data.serviceOrders ) {
        data.serviceOrders = this.matrixData.serviceOrders;
      }

      if(data?.serviceOrders?.warrantyTerm?.trim()?.length ==  0){
        data.serviceOrders = data.serviceOrders || {};
        data.serviceOrders.warrantyTerm = this.matrixData?.serviceOrders?.warrantyTerm || "";
      }

      // console.log(data);

      if (!data.cashier) {
        data.cashier = this.matrixData.cashier;
      }

      if(data?.cashier?.warrantyTerm?.trim()?.length ==  0){
        data.cashier = data.cashier || {};
        data.cashier.warrantyTerm = this.matrixData.cashier?.warrantyTerm || "";
      }

      if (!data.general || data.general && Object.values(data.general).length > 0) {
        data.general = this.matrixData.general;
      }

      // Ensure stock section exists and mirror key flags to local storage for quick access
      if (!data.stock) {
        data.stock = this.matrixData.stock || {};
      }
      if (data.stock && (data.stock.allowNegativeSale !== undefined)) {
        Utilities.localStorage('StockAllowNegativeSale', !!data.stock.allowNegativeSale);
      }

      return Utilities.deepClone(data);
    }

    if (id == 'service-orders-settings') {
      return Utilities.deepClone(this.generalSOSettings);
    }
  }

}
