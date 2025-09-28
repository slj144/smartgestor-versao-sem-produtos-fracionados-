import { Component, OnInit, OnDestroy } from '@angular/core';

// Services
import { PurchasesService } from './purchases.service';

// Translate
import { PurchasesTranslate } from './purchases.translate';

// Interfaces
import { IPermissions } from '@shared/interfaces/_auxiliaries/IPermissions';

// Utilities
import { Utilities } from '@shared/utilities/utilities';
import { Dispatch } from '@shared/utilities/dispatch';
import { ScrollMonitor } from '@shared/utilities/scrollMonitor';
import { DateTime } from '@shared/utilities/dateTime';

@Component({
  selector: 'purchases',
  templateUrl: './purchases.component.html',
  styleUrls: ['./purchases.component.scss']
})
export class PurchasesComponent implements OnInit, OnDestroy {

  public translate = PurchasesTranslate.get();

  public loading: boolean = true;
  public isAdmin: boolean = true;
  public filtersBadge: number = 0;
  public countData: any = {};
  public recordsData: any = [];
  public queryClauses: any = [];
  public permissions: any = {};
  public period: any = {};

  private modalComponent: any;

  constructor(
    private purchasesService: PurchasesService
  ) {
    ScrollMonitor.reset();
    DateTime.context(() => {
      this.periodSettings();
    });
    this.permissionsSettings();
  }

  public ngOnInit() {

    this.purchasesService.getPurchases('PurchasesComponent', (data) => {
      this.recordsData = data;
      this.loading = false;
    });

    this.purchasesService.getPurchasesCount('PurchasesComponent', (data) => {
      this.countData = data;
    });

    this.scrollSettings();
  }

  // User Interface Actions - Filters

  public onFilter(event) {

    const translate = this.translate.modal.filters.field;

    this.modalComponent.onOpen({
      activeComponent: 'Purchases/Filters',
      fields: [
        { label: translate.code.label, property: 'code', combination: 'full', type: 'text', checked: false },

        { label: translate.provider.label, property: 'provider', options: [
          { label: translate.provider.option.code.label, property: 'provider.code', combination: 'full', path: translate.provider.option.code.path, type: 'text', nested: true, checked: false },
          { label: translate.provider.option.name.label, property: 'provider.name', combination: 'partial', path: translate.provider.option.name.path, type: 'text', nested: true, checked: false }
        ], checked: false, collapsed: false },

        { label: translate.product.label, property: 'products', options: [
          { label: translate.product.option.code.label, property: 'products.code', combination: 'full', path: translate.provider.option.code.path, type: 'text', nested: true, checked: false },
          { label: translate.product.option.name.label, property: 'products.name', combination: 'partial', path: translate.provider.option.name.path, type: 'text', nested: true, checked: false }
        ], checked: false, collapsed: false },

        { label: translate.purchaseStatus.label, property: 'purchaseStatus', combination: 'full', type: 'select', list: [
          { label: translate.purchaseStatus.list.pendent.label, value: 'PENDENT' },
          { label: translate.purchaseStatus.list.concluded.label, value: 'CONCLUDED' },
          { label: translate.purchaseStatus.list.canceled.label, value: 'CANCELED' }
        ], checked: false },

        { label: translate.paymentStatus.label, property: 'paymentStatus', combination: 'full', type: 'select', list: [
          { label: translate.paymentStatus.list.pendent.label, value: 'PENDENT' },
          { label: translate.paymentStatus.list.concluded.label, value: 'CONCLUDED' },
          { label: translate.paymentStatus.list.canceled.label, value: 'CANCELED' }
        ], checked: false },

        { label: translate.purchaseDate.label, property: 'dueDate', combination: 'partial', type: 'date', checked: false },                
        { label: translate.value.label, property: 'billAmount', combination: 'full', type: 'number/float', checked: false }
      ],
      callback: (filters: any[]) => {
        
        this.filtersBadge = (filters.length || 0);

        if (filters.length > 0) {
          this.queryClauses = Utilities.composeClausures(filters);
          this.purchasesService.query(this.queryClauses, true);
        } else {
          this.queryClauses = [];
          this.purchasesService.query(null, true);
        }        
      }
    });
  }

  public onSearch(event) {

    const value = event.value;    

    if (value != '') {

      const where = [];

      if (!isNaN(parseInt(value))) {
        where.push({ field: 'code', operator: '=', value: parseInt(value) });
      } else {
        where.push({ field: 'name', operator: 'like', value: new RegExp(value, 'gi') });
      }

      this.purchasesService.query(where, true);
    } else {
      this.purchasesService.query();
    }
  }

  // User Interface Actions - CRUD  
  
  public onCreate() {

    this.modalComponent.onOpen({
      activeComponent: 'Purchases/Create'
    });
  }

  public onRead(data: any) {
    
    this.modalComponent.onOpen({
      activeComponent: 'Purchases/Read',
      data: data
    });
  }  

  public onUpdate(data: any) {

    this.modalComponent.onOpen({
      activeComponent: 'Purchases/Update',
      data: Utilities.deepClone(data)
    });
  }

  public onCancel(data: any) {

    this.modalComponent.onOpen({
      activeComponent: 'Purchases/Cancel',      
      data: Utilities.deepClone(data)
    });
  }

  public onDelete(data: any) {

    this.modalComponent.onOpen({
      activeComponent: 'Purchases/Delete',
      data: Utilities.deepClone(data)
    }); 
  }  

  public onAccept(data: any) {

    this.modalComponent.onOpen({
      activeComponent: 'Purchases/Accept',
      data: Utilities.deepClone(data)
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
          actions: { add: true, edit: true, accept: true, cancel: true, delete: true }
        }
      } else {

        const permissions = ((<any>Utilities.permissions('stock'))["purchases"] as IPermissions['stock']['purchases']);

        this.permissions = {
          actions: {
            add: (permissions.actions.indexOf('add') !== -1),
            edit: (permissions.actions.indexOf('edit') !== -1),
            accept: (permissions.actions.indexOf('edit') !== -1),
            cancel: (permissions.actions.indexOf('cancel') !== -1),
            delete: (permissions.actions.indexOf('delete') !== -1)
          }
        }
      }
    };

    Dispatch.onRefreshCurrentUserPermissions('PurchasesComponent', () => {
      setupPermissions();
    });

    setupPermissions();
  }

  private scrollSettings() {

    ScrollMonitor.start({
      target: '#infiniteScroll',
      bottom: () => {

        if (this.countData.total > this.purchasesService.limit) {
          
          Utilities.loading();

          const query: any = (this.queryClauses.length > 0 ? this.queryClauses : null);
          const reset: boolean = false;
          const flex: boolean = (this.filtersBadge == 0);
          const scrolling: boolean = (this.queryClauses.length > 0);

          this.purchasesService.query(query, reset, flex, scrolling).then(() => {
            Utilities.loading(false);
          });
        }
      }
    });
  }

  private periodSettings() {

    const date = DateTime.getDateObject();
    date.setDate(date.getDate() - 6);

    const startDate = DateTime.formatDate(date.toISOString(),"string", "D").split(" ")[0];
    
    this.period.start = `${startDate} 00:00:00`;
    this.period.end = `${DateTime.getDate('D')} 23:59:59`;
  }

  // Destruction Method

  public ngOnDestroy() {

    this.purchasesService.query([]);
    this.purchasesService.removeListeners('records', 'PurchasesComponent');
    this.purchasesService.removeListeners('count', 'PurchasesComponent');
    ScrollMonitor.reset();
    Dispatch.removeListeners('refreshCurrentUserPermissions', 'PurchasesComponent');
  }

}
