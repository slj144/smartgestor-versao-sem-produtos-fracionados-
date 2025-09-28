import { Component, OnInit, OnDestroy } from '@angular/core';

// Services
import { BillsToReceiveService } from './bills-to-receive.service';

// Translate
import { BillsToReceiveTranslate } from './bills-to-receive.translate';

// Interfaces
import { IFinancialBillToReceive, EFinancialBillToReceiveStatus } from '@shared/interfaces/IFinancialBillToReceive';
import { IPermissions } from '@shared/interfaces/_auxiliaries/IPermissions';

// Utilities
import { Utilities } from '@shared/utilities/utilities';
import { Dispatch } from '@shared/utilities/dispatch';
import { ScrollMonitor } from '@shared/utilities/scrollMonitor';

@Component({
  selector: 'bills-to-receive',
  templateUrl: './bills-to-receive.component.html',
  styleUrls: ['./bills-to-receive.component.scss']
})
export class BillsToReceiveComponent implements OnInit, OnDestroy {

  public translate = BillsToReceiveTranslate.get();

  public loading: boolean = true;
  public filtersBadge: number = 0;
  public countData: any = {};
  public recordsData: any = [];
  public queryClauses: any = [];
  public permissions: any = {};

  private modalComponent: any;

  constructor(
    private billsToReceiveService: BillsToReceiveService
  ) {
    ScrollMonitor.reset();
    this.permissionsSettings();
  }

  public ngOnInit() {

    this.billsToReceiveService.getBills('BillsToReceiveComponent', (data) => {
      this.recordsData = data;
      this.loading = false;
    });
            
    this.billsToReceiveService.getBillsCount('BillsToReceiveComponent', (data) => {
      this.countData = data;
    });

    this.scrollSettings();
  }

  // User Interface Actions - Filters

  public onFilter(event: any) {

    const translate = this.translate.modal.filters.field;

    this.modalComponent.onOpen({
      activeComponent: 'BillsToReceive/Filters',
      fields: [
        { label: translate.accountCode.label, property: 'code', combination: 'full', type: 'text', checked: false },
        { label: translate.referenceCode.label, property: 'referenceCode', combination: 'full', type: 'text', checked: false },

        { label: translate.debtor.label, property: 'debtor', options: [
          { label: translate.debtor.option.code.label, property: 'debtor.code', combination: 'full', path: translate.debtor.option.code.path, type: 'text', nested: true, checked: false },
          { label: translate.debtor.option.name.label, property: 'debtor.name', combination: 'partial', path: translate.debtor.option.name.path, type: 'text', nested: true, checked: false }
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
          this.billsToReceiveService.query(this.queryClauses, true);
        } else {
          this.queryClauses = [];
          this.billsToReceiveService.query(null, true);
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
        this.queryClauses.push({ field: 'debtor.name', operator: 'like', value: new RegExp(value, 'gi') });
      }

      this.billsToReceiveService.query(this.queryClauses, true, true);
    } else {
      this.queryClauses = [];
      this.billsToReceiveService.query(null, true);
    }
  }

  // User Interface Actions - CRUD

  public onAction(type: ('Create' | 'Read' | 'Update' | 'Cancel' | 'Delete'), data: IFinancialBillToReceive = null): void {

    if (
      (type == 'Update' && !this.checkPermissionToUpdate(data)) ||
      (type == 'Cancel' && !this.checkPermissionToCancel(data)) ||
      (type == 'Delete' && !this.checkPermissionToDelete(data))
    ) return;

    this.modalComponent.onOpen({
      activeComponent: `BillsToReceive/${type}`,
      data: Utilities.deepClone(data ?? {})
    });
  }

  // Permission checkers

  public checkPermissionToUpdate(data: IFinancialBillToReceive): boolean {
    return data.status == EFinancialBillToReceiveStatus.PENDENT;
  }

  public checkPermissionToCancel(data: IFinancialBillToReceive): boolean {
    return data.status != EFinancialBillToReceiveStatus.CANCELED;
  }

  public checkPermissionToDelete(data: IFinancialBillToReceive): boolean {
    return data.status == EFinancialBillToReceiveStatus.CANCELED;
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

        const permissions = (Utilities.permissions('financial')['billsToReceive'] as IPermissions['financial']['billsToReceive']);
        
        this.permissions = {
          actions: {
            add: (permissions.actions.indexOf('add') !== -1),
            edit: (permissions.actions.indexOf('edit') !== -1),
            delete: (permissions.actions.indexOf('delete') !== -1)
          }
        }
      }
    };

    Dispatch.onRefreshCurrentUserPermissions('BillsToReceiveComponent', () => {
      setupPermissions();
    });

    setupPermissions();
  }

  private scrollSettings() {

    ScrollMonitor.start({
      target: '#infiniteScroll',
      bottom: () => {

        if (this.countData.total > this.billsToReceiveService.limit) {

          Utilities.loading();

          const query: any = (this.queryClauses.length > 0 ? this.queryClauses : null);
          const reset: boolean = false;
          const flex: boolean = (this.filtersBadge == 0);
          const scrolling: boolean = true;//(this.queryClauses.length > 0);

          this.billsToReceiveService.query(query, reset, flex, scrolling).then(() => {
            Utilities.loading(false);
          });
        }
      }
    });
  }

  // Destruction Method

  public ngOnDestroy() {

    this.billsToReceiveService.query([]);
    this.billsToReceiveService.removeListeners('records', 'BillsToReceiveComponent');
    this.billsToReceiveService.removeListeners('count', 'BillsToReceiveComponent');
    ScrollMonitor.reset();
    Dispatch.removeListeners('refreshCurrentUserPermissions', 'BillsToReceiveComponent');
  }

}
