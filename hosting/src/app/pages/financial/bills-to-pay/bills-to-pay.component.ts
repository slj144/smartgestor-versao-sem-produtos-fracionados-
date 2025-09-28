import { Component, OnInit, OnDestroy } from '@angular/core';

// Services
import { BillsToPayService } from './bills-to-pay.service';

// Translate
import { BillsToPayTranslate } from './bills-to-pay.translate';

// Interfaces
import { IFinancialBillToPay, EFinancialBillToPayStatus } from '@shared/interfaces/IFinancialBillToPay';
import { IPermissions } from '@shared/interfaces/_auxiliaries/IPermissions';

// Utilities
import { Utilities } from '@shared/utilities/utilities';
import { Dispatch } from '@shared/utilities/dispatch';
import { ScrollMonitor } from '@shared/utilities/scrollMonitor';

@Component({
  selector: 'bills-to-pay',
  templateUrl: './bills-to-pay.component.html',
  styleUrls: ['./bills-to-pay.component.scss']
})
export class BillsToPayComponent implements OnInit, OnDestroy {

  public translate = BillsToPayTranslate.get();

  public loading: boolean = true;
  public filtersBadge: number = 0;
  public countData: any = {};
  public recordsData: any = [];
  public queryClauses: any = [];
  public permissions: any = {};

  private modalComponent: any;

  constructor(
    private billsToPayService: BillsToPayService
  ) {
    ScrollMonitor.reset();
    this.permissionsSettings();
  }

  public ngOnInit() {

    this.billsToPayService.getBills('BillsToPayComponent', (data) => {
      this.recordsData = data;
      this.loading = false;     
    });
        
    this.billsToPayService.getBillsCount('BillsToPayComponent', (data) => {
      this.countData = data;
    });

    this.scrollSettings();
  }

  // User Interface Actions - Filters

  public onFilter(event: any) {

    const translate = this.translate.modal.filters.field;

    this.modalComponent.onOpen({
      activeComponent: 'BillsToPay/Filters',
      fields: [
        { label: translate.accountCode.label, property: 'code', combination: 'full', type: 'text', checked: false },
        { label: translate.referenceCode.label, property: 'referenceCode', combination: 'full', type: 'text', checked: false },

        { label: translate.beneficiary.label, property: 'beneficiary', options: [
          { label: translate.beneficiary.option.code.label, property: 'beneficiary.code', combination: 'full', path: translate.beneficiary.option.code.path, type: 'text', nested: true, checked: false },
          { label: translate.beneficiary.option.name.label, property: 'beneficiary.name', combination: 'partial', path: translate.beneficiary.option.name.path, type: 'text', nested: true, checked: false }
        ], checked: false, collapsed: false },

        { label: translate.category.label, property: 'category', options: [
          { label: translate.category.option.code.label, property: 'category.code', combination: 'full', path: translate.category.option.code.path, type: 'text', nested: true, checked: false },
          { label: translate.category.option.name.label, property: 'category.name', combination: 'partial', path: translate.category.option.name.path, type: 'text', nested: true, checked: false }
        ], checked: false, collapsed: false },

        { label: translate.billStatus.label, property: 'status', combination: 'full', type: 'select', list: [
          { label: translate.billStatus.list.pendent.label, value: 'PENDENT' },
          { label: translate.billStatus.list.concluded.label, value: 'CONCLUDED' },
          { label: translate.billStatus.list.canceled.label, value: 'CANCELED' }
        ], checked: false },

        { label: translate.dueDate.label, property: 'dueDate', combination: 'partial', type: 'date', checked: false },
        { label: translate.billAmount.label, property: 'billAmount', combination: 'full', type: 'number/float', checked: false }
      ],
      callback: (filters: any[]) => {
        
        this.filtersBadge = (filters.length || 0);

        if (filters.length > 0) {
          this.queryClauses = Utilities.composeClausures(filters);
          this.billsToPayService.query(this.queryClauses, true);
        } else {
          this.queryClauses = [];
          this.billsToPayService.query(null, true);
        }
      }
    });
  }

  public onSearch(event: any) {

    const value = event.value;    
    
    if (value != '') {

      this.queryClauses = [];
      
      if (!isNaN(parseInt(value))) {
        this.queryClauses.push({ field: 'code', operator: '=', value: parseInt(value) });
      } else {
        this.queryClauses.push({ field: 'beneficiary.name', operator: 'like', value: new RegExp(value, 'gi') });
      }

      this.billsToPayService.query(this.queryClauses, true, true);
    } else {
      this.queryClauses = [];
      this.billsToPayService.query([], true);
    }
  }

  // User Interface Actions - CRUD

  public onAction(type: ('Create' | 'Read' | 'Update' | 'Cancel' | 'Delete'), data: IFinancialBillToPay = null): void {

    if (
      (type == 'Update' && !this.checkPermissionToUpdate(data)) ||
      (type == 'Cancel' && !this.checkPermissionToCancel(data)) ||
      (type == 'Delete' && !this.checkPermissionToDelete(data))
    ) return;

    this.modalComponent.onOpen({
      activeComponent: `BillsToPay/${type}`,
      data: Utilities.deepClone(data ?? {})
    });
  }

  // Permission checkers

  public checkPermissionToUpdate(data: IFinancialBillToPay): boolean {
    return data.status == EFinancialBillToPayStatus.PENDENT;
  }

  public checkPermissionToCancel(data: IFinancialBillToPay): boolean {
    return data.status != EFinancialBillToPayStatus.CANCELED;
  }

  public checkPermissionToDelete(data: IFinancialBillToPay): boolean {
    return data.status == EFinancialBillToPayStatus.CANCELED;
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
        } 
      } else {

        const permissions = (Utilities.permissions('financial')['billsToPay'] as IPermissions['financial']['billsToPay']);
        
        this.permissions = {
          actions: {
            add: (permissions.actions.indexOf('add') !== -1),
            edit: (permissions.actions.indexOf('edit') !== -1),
            delete: (permissions.actions.indexOf('delete') !== -1)
          }
        }
      }
    };

    Dispatch.onRefreshCurrentUserPermissions('BillsToPayComponent', () => {
      setupPermissions();
    });

    setupPermissions();
  }

  private scrollSettings() {

    ScrollMonitor.start({
      target: '#infiniteScroll',
      bottom: () => {

        if (this.countData.total > this.billsToPayService.limit) {

          Utilities.loading();

          const query: any = (this.queryClauses.length > 0 ? this.queryClauses : null);
          const reset: boolean = false;
          const flex: boolean = (this.filtersBadge == 0);
          const scrolling: boolean = true;//(this.queryClauses.length > 0);

          this.billsToPayService.query(query, reset, flex, scrolling).then(() => {
            Utilities.loading(false);
          });
        }
      }
    });
  }
 
  // Destruction Method

  public ngOnDestroy() {

    this.billsToPayService.query([]);
    this.billsToPayService.removeListeners('records', 'BillsToPayComponent');
    this.billsToPayService.removeListeners('count', 'BillsToPayComponent');
    ScrollMonitor.reset();
    Dispatch.removeListeners('refreshCurrentUserPermissions', 'BillsToPayComponent');
  }

}
