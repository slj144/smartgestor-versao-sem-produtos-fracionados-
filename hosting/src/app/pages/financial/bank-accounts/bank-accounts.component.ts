import { Component, OnInit, OnDestroy } from '@angular/core';

// Services
import { BankAccountsService } from './bank-accounts.service';

// Translate
import { BankAccountsTranslate } from './bank-accounts.translate';

// Interfaces
import { IFinancialBankAccount } from '@shared/interfaces/IFinancialBankAccount';
import { IPermissions } from '@shared/interfaces/_auxiliaries/IPermissions';

// Utilities
import { Utilities } from '@shared/utilities/utilities';
import { Dispatch } from '@shared/utilities/dispatch';
import { ScrollMonitor } from '@shared/utilities/scrollMonitor';

@Component({
  selector: 'bank-accounts',
  templateUrl: './bank-accounts.component.html',
  styleUrls: ['./bank-accounts.component.scss']
})
export class BankAccountsComponent implements OnInit, OnDestroy {

  public translate = BankAccountsTranslate.get();

  public loading: boolean = true;
  public filtersBadge: number = 0;
  public countData: any = {};
  public recordsData: any = [];
  public queryClauses: any = [];
  public permissions: any = {};  

  private modalComponent: any;

  constructor(
    private bankAccountsService: BankAccountsService
  ) {
    ScrollMonitor.reset();
    this.permissionsSettings();
  }

  public ngOnInit() {
    
    this.bankAccountsService.getAccounts('BankAccountsComponent', (data) => {
      this.recordsData = data;
      this.loading = false;
    });

    this.bankAccountsService.getAccountsCount('BankAccountsComponent', (data) => {
      this.countData = data;
    });

    this.scrollSettings();
  }

  // User Interface Actions - Filters

  public onFilter(event: any) {

    const translate = this.translate.modal.filters.field;

    this.modalComponent.onOpen({
      activeComponent: 'BankAccounts/Filters',
      fields: [
        { label: translate.accountCode.label, property: 'code', combination: 'partial', type: 'text', checked: false },
        { label: translate.name.label, property: 'name', combination: 'partial', type: 'text', checked: false },
        { label: translate.balance.label, property: 'balance', combination: 'full', type: 'number/float', checked: false }
      ],
      callback: (filters: any[]) => {
        
        this.filtersBadge = (filters.length || 0);
       
        if (filters.length > 0) {
          this.queryClauses = Utilities.composeClausures(filters);
          this.bankAccountsService.query(this.queryClauses, true);
        } else {
          this.queryClauses = [];
          this.bankAccountsService.query(null, true);
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
        this.queryClauses.push({ field: 'name', operator: 'like', value: new RegExp(value, 'gi') });
      }

      this.bankAccountsService.query(this.queryClauses, true, true);
    } else {
      this.queryClauses = [];
      this.bankAccountsService.query(null, true);
    }
  }

  // User Interface Actions - CRUD

  public onAction(type: ('Create' | 'Read' | 'Update' | 'Delete'), data: IFinancialBankAccount = null): void {

    this.modalComponent.onOpen({
      activeComponent: `BankAccounts/${type}`,
      data: Utilities.deepClone(data ?? {})
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

        const permissions = (Utilities.permissions('financial') as IPermissions['financial']['bankAccounts']);
        
        this.permissions = {
          actions: {
            add: (permissions.actions && (permissions.actions.indexOf('add') !== -1)),
            edit: (permissions.actions && (permissions.actions.indexOf('edit') !== -1)),
            delete: (permissions.actions && (permissions.actions.indexOf('delete') !== -1))
          }
        };
      }
    };

    Dispatch.onRefreshCurrentUserPermissions('BankAccountsComponent', () => {
      setupPermissions();
    });

    setupPermissions();
  }

  private scrollSettings() {

    ScrollMonitor.start({
      target: '#infiniteScroll',
      bottom: () => {

        if (this.countData.total > this.bankAccountsService.limit) {

          Utilities.loading();

          const query: any = (this.queryClauses.length > 0 ? this.queryClauses : null);
          const reset: boolean = false;
          const flex: boolean = (this.filtersBadge == 0);
          const scrolling: boolean = (this.queryClauses.length > 0);

          this.bankAccountsService.query(query, reset, flex, scrolling).then(() => {
            Utilities.loading(false);
          });
        }
      }
    });
  }

  // Destruction Method

  public ngOnDestroy() {

    this.bankAccountsService.query([]);
    this.bankAccountsService.removeListeners('records', 'BankAccountsComponent');
    this.bankAccountsService.removeListeners('count', 'BankAccountsComponent');
    ScrollMonitor.reset();
    Dispatch.removeListeners('refreshCurrentUserPermissions', 'BankAccountsComponent');
  }

}
