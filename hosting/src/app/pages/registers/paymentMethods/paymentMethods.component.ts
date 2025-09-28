import { Component, OnInit, OnDestroy } from '@angular/core';

// Services
import { PaymentMethodsService } from './paymentMethods.service';

// Translate
import { PaymentMethodsTranslate } from './paymentMethods.translate';

// Interfaces
import { IPermissions } from '@shared/interfaces/_auxiliaries/IPermissions';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { Dispatch } from '@shared/utilities/dispatch';
import { ScrollMonitor } from '@shared/utilities/scrollMonitor';

@Component({
  selector: 'registers-payment-methods',
  templateUrl: './paymentMethods.component.html',
  styleUrls: ['./paymentMethods.component.scss']
})
export class PaymentMethodsComponent implements OnInit, OnDestroy {

  public translate = PaymentMethodsTranslate.get();

  public loading: boolean = true;
  public filtersBadge: number = 0;
  public countData: any = {};
  public recordsData: any = [];
  public searchData: any = [];
  public queryClauses: any = [];
  public permissions: any = {};

  private modalComponent: any;

  constructor(
    private paymentMethodsService: PaymentMethodsService
  ) {
    ScrollMonitor.reset();
    this.permissionsSettings();
  }

  public ngOnInit() {

    this.paymentMethodsService.getPaymentMethods('PaymentsComponent', (data) => {
      this.recordsData = data;
      this.loading = false;
    });

    this.paymentMethodsService.getPaymentMethodsCount('PaymentsComponent', (data) => {
      this.countData = data;
    });

    this.scrollSettings();
  }

  // User Interface Actions - Filters

  public onFilter(event: any) {

  }

  public onSearch(event: any) {

    const value = event.value;
    const searchResult = [];    

    if (value != '') {      
      
      $$(this.recordsData).map((_, method) => {        

        if (String(method.name).toLowerCase().search(value) != -1) {
          searchResult.push(method);
        }

        if (method.providers) {

          method = Utilities.deepClone(method);

          $$(method.providers).map((_, provider) => {

            if (String(provider.name).toLowerCase().search(value) != -1) {
              method.providers = [ provider ];
              searchResult.push(method);
            }
          });
        }
      });
    }
    
    this.searchData = searchResult; 
  }

  // User Interface Actions - CRUD

  public onCreate(event: Event, type: string, data?: any) {
     
    event.stopPropagation();

    this.modalComponent.onOpen({
      activeComponent: 'PaymentMethods/Create',
      source: (data ? Utilities.deepClone(data) : null),
      data: (data ? Utilities.deepClone(data) : null),
      methodCode: (data ? data.code : null),
      methodName: (data ? data.name : null),
      type: type
    });
  }

  public onRead(event: Event, data: any) {
    
    event.stopPropagation();

    if (data.code == '3000' || data.code == '4000') {
      return;
    }

    this.modalComponent.onOpen({
      activeComponent: 'PaymentMethods/Read',
      data: Utilities.deepClone(data)
    });
  }    

  public onUpdate(event: Event, type: string, method: any, provider?: any) {

    event.stopPropagation(); 

    this.modalComponent.onOpen({
      activeComponent: 'PaymentMethods/Update',
      source: Utilities.deepClone(method),
      data: (method && !provider ? Utilities.deepClone(method) : Utilities.deepClone(provider)),
      methodCode: (method && provider ? method.code : null),
      methodName: (method && provider ? method.name: null),
      type: type
    });
  }

  public onDelete(event: Event, type: string, method: any, provider?: any) {

    event.stopPropagation();

    if (provider) {
      provider._id = method._id;
    }

    this.modalComponent.onOpen({
      activeComponent: 'PaymentMethods/Delete', 
      data: (method && !provider ? Utilities.deepClone(method) : Utilities.deepClone(provider)),     
      methodCode: (method && provider ? method.code : null),
      type: type
    }); 
  }  

  // User Interface Actions - Others

  public onDataExport() {

    this.modalComponent.onOpen({
      activeComponent: 'PaymentMethods/DataExport'
    });
  }

  // Event Listeners 

  public onModalResponse(event: any) {

    if (event.instance) {
      this.modalComponent = event.instance;
    }   
  }

  // Utility Methods

  private permissionsSettings() {

    const setupPermissions = () => {

      if (Utilities.isAdmin) {
      
        this.permissions = {
          actions: { add: true, edit: true, delete: true }
        };
      } else {
  
        const permissions = Utilities.permissions('registers')['paymentMethods'] as IPermissions['registers']['paymentMethods'];

        this.permissions = {
          actions: {
            add: (permissions.actions ? (permissions.actions.indexOf("add") !== -1) : false),
            edit: (permissions.actions ? (permissions.actions.indexOf("edit") !== -1) : false),
            delete: (permissions.actions ? (permissions.actions.indexOf("delete") !== -1) : false)
          }
        };        
      }
    };

    Dispatch.onRefreshCurrentUserPermissions('PaymentMethodsComponent', () => {
      setupPermissions();
    });

    setupPermissions();
  }

  private scrollSettings() {

    ScrollMonitor.start({
      target: '#infiniteScroll',
      bottom: () => {

        if (this.countData.total > this.paymentMethodsService.limit) {
          
          Utilities.loading();

          const query: any = (this.queryClauses.length > 0 ? this.queryClauses : null);
          const reset: boolean = false;
          const flex: boolean = (this.filtersBadge == 0);
          const scrolling: boolean = (this.queryClauses.length > 0);

          this.paymentMethodsService.query(query, reset, flex, scrolling).then(() => {
            Utilities.loading(false);
          });
        }
      }
    });
  }

  // Destruction Method

  public ngOnDestroy() {

    this.paymentMethodsService.query([]);
    this.paymentMethodsService.removeListeners('records', 'PaymentsComponent');
    this.paymentMethodsService.removeListeners('count', 'PaymentsComponent');
    ScrollMonitor.reset();
    Dispatch.removeListeners('refeshCurrentUserPermissions', 'PaymentsComponent');
  }

}
