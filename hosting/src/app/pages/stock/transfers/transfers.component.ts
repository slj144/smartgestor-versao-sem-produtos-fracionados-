import { Component, OnInit, OnDestroy } from '@angular/core';

// Services
import { TransfersService } from './transfers.service';

// Transalate
import { TransfersTranslate } from './transfers.translate';

// Interfaces
import { IPermissions } from '@shared/interfaces/_auxiliaries/IPermissions';

// Utilities
import { Utilities } from '@shared/utilities/utilities';
import { Dispatch } from '@shared/utilities/dispatch';
import { ScrollMonitor } from '@shared/utilities/scrollMonitor';

@Component({
  selector: 'transfers',
  templateUrl: './transfers.component.html',
  styleUrls: ['./transfers.component.scss']
})
export class TransfersComponent implements OnInit, OnDestroy {

  public translate = TransfersTranslate.get();

  public loading: boolean = true;
  public filtersBadge: number = 0;
  public countData: any = {};
  public recordsData: any = [];
  public queryClauses: any = [];
  public permissions: any = {};

  private modalComponent: any;

  public storeID = Utilities.storeID;

  constructor(
    private transfersService: TransfersService
  ) {
    ScrollMonitor.reset();
    this.permissionsSettings();
  }  
  
  public ngOnInit() {
    
    this.transfersService.getTransfers('TransfersComponent', (data) => {     
      this.recordsData = data;
      this.loading = false;
    });

    this.transfersService.getTransfersCount('TransfersComponent', (data) => {     
      this.countData = data;
    });

    this.scrollSettings();
  }

  // User Interface Actions - Filters

  public onFilter(event) {

    const translate = this.translate.modal.filters.field;

    this.modalComponent.onOpen({
      activeComponent: 'Transfers/Filters',
      fields: [
        { label: translate.code.label, property: 'code', combination: 'full', type: 'text', checked: false },

        { label: translate.origin.label, property: 'origin', options: [
          { label: translate.origin.option.code.label, property: 'origin.code', combination: 'full', path: translate.origin.option.code.path, type: 'text', nested: true, checked: false },
          { label: translate.origin.option.name.label, property: 'origin.name', combination: 'partial', path: translate.origin.option.name.path, type: 'text', nested: true, checked: false }
        ], checked: false, collapsed: false },

        { label: translate.destination.label, property: 'destination', options: [
          { label: translate.destination.option.code.label, property: 'destination.code', combination: 'full', path: translate.destination.option.code.path, type: 'text', nested: true, checked: false },
          { label: translate.destination.option.name.label, property: 'destination.name', combination: 'partial', path: translate.destination.option.name.path, type: 'text', nested: true, checked: false }
        ], checked: false, collapsed: false },

        { label: translate.transferStatus.label, property: 'transferStatus', combination: 'full', type: 'select', list: [
          { label: translate.transferStatus.list.pendent.label, value: 'PENDENT' },
          { label: translate.transferStatus.list.concluded.label, value: 'CONCLUDED' },
          { label: translate.transferStatus.list.canceled.label, value: 'CANCELED' }
        ], checked: false },

        { label: translate.paymentStatus.label, property: 'paymentStatus', combination: 'full', type: 'select', list: [
          { label: translate.paymentStatus.list.pendent.label, value: 'PENDENT' },
          { label: translate.paymentStatus.list.concluded.label, value: 'CONCLUDED' },
          { label: translate.paymentStatus.list.canceled.label, value: 'CANCELED' }
        ], checked: false },

        { label: translate.transferDate.label, property: 'sendDate', combination: 'partial', type: 'date', checked: false },                
        { label: translate.value.label, property: 'billAmount', combination: 'full', type: 'number/float', checked: false }
      ],
      callback: (filters: any[]) => {
        
        this.filtersBadge = (filters.length || 0);

        if (filters.length > 0) {
          this.queryClauses = Utilities.composeClausures(filters);
          this.transfersService.query(this.queryClauses, true);
        } else {
          this.queryClauses = [];
          this.transfersService.query(null, true);
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
        where.push({ field: 'origin.name', operator: 'like', value: new RegExp(value, 'gi') });
        where.push({ field: 'destination.name', operator: 'like', value: new RegExp(value, 'gi') });
      }

      this.transfersService.query(where, true);
    } else {
      this.transfersService.query();
    }
  } 

  // User Interface Actions - CRUD

  public onCreate() {

    this.modalComponent.onOpen({
      activeComponent: 'Transfers/Create'
    });
  }
  
  public onRead(data: any) {
    
    this.modalComponent.onOpen({
      activeComponent: 'Transfers/Read',
      permissions: this.permissions,
      data: Utilities.deepClone(data)
    });
  }

  public onUpdate(data: any) {

    this.modalComponent.onOpen({
      activeComponent: 'Transfers/Update',
      permissions: this.permissions,
      data: Utilities.deepClone(data) 
    });
  }

  public onCancel(data: any) {

    this.modalComponent.onOpen({
      activeComponent: 'Transfers/Cancel',
      permissions: this.permissions,
      data: Utilities.deepClone(data)
    });
  }

  public onDelete(data: any) {

    this.modalComponent.onOpen({
      activeComponent: 'Transfers/Delete',
      permissions: this.permissions,
      data: Utilities.deepClone(data)
    });
  }

  public onAccept(data: any) {

    this.modalComponent.onOpen({
      activeComponent: 'Transfers/Accept',
      permissions: this.permissions,
      data: Utilities.deepClone(data)
    });
  }

  // User Interface Actions - Others

  public onPriceList() {

    this.modalComponent.onOpen({
      activeComponent: 'Transfers/PriceList'
    });
  }

  // Auxiliary Methods
  
  public checkDestination(data: any) {
    return (data.destination._id == Utilities.storeID);
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
          actions: { add: true, edit: true, cancel: true, delete: true, accept: true },
          fields: { costPrice: true }
        } 
      } else {

        const permissions = ((<any>Utilities.permissions('stock'))["transfers"] as IPermissions['stock']['transfers']);

        this.permissions = {
          actions: {
            add: (permissions.actions.indexOf('add') !== -1),
            edit: (permissions.actions.indexOf('edit') !== -1),
            accept: (permissions.actions.indexOf('accept') !== -1),
            cancel: (permissions.actions.indexOf('cancel') !== -1),
            delete: (permissions.actions.indexOf('delete') !== -1)
          },
          fields: {
            costPrice: (permissions.fields.indexOf('costPrice') !== -1)
          }
        }
      }
    };

    Dispatch.onRefreshCurrentUserPermissions('TransfersComponent', () => {
      setupPermissions();
    });

    setupPermissions();
  }
  
  private scrollSettings() {

    ScrollMonitor.start({
      target: '#infiniteScroll',
      bottom: () => {

        if (this.countData.total > this.transfersService.limit) {
          
          Utilities.loading();

          const query: any = (this.queryClauses.length > 0 ? this.queryClauses : null);
          const reset: boolean = false;
          const flex: boolean = (this.filtersBadge == 0);
          const scrolling: boolean = (this.queryClauses.length > 0);

          this.transfersService.query(query, reset, flex, scrolling).then(() => {
            Utilities.loading(false);
          });
        }
      }
    });
  }

  // Destruction Method

  public ngOnDestroy() {

    this.transfersService.query([]);
    this.transfersService.removeListeners('records', 'TransfersComponent');
    this.transfersService.removeListeners('count', 'TransfersComponent');
    ScrollMonitor.reset();
    Dispatch.removeListeners('refreshCurrentUserPermissions', 'TransfersComponent');
  }

}
