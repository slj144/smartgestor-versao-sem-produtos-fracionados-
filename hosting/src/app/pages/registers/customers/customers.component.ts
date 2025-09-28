import { Component, OnDestroy, OnInit } from '@angular/core';

// Services
import { CustomersService } from './customers.service';

// Translate
import { CustomersTranslate } from './customers.translate';

// Interfaces
import { IPermissions } from '@shared/interfaces/_auxiliaries/IPermissions';

// Utilities
import { Utilities } from '@shared/utilities/utilities';
import { Dispatch } from '@shared/utilities/dispatch';
import { ScrollMonitor } from '@shared/utilities/scrollMonitor';

// Settings
import { ProjectSettings } from '@assets/settings/company-settings';

@Component({
  selector: 'registers-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit, OnDestroy {

  public translate = CustomersTranslate.get();

  public loading: boolean = true;
  public filtersBadge: number = 0;
  public countData: any = {};
  public recordsData: any = [];
  public queryClauses: any = [];
  public permissions: any = {};
  public order = 1;

  public isBrazil = (ProjectSettings.companySettings().country == 'BR');
  public isAdmin = Utilities.isAdmin;

  private modalComponent: any;

  constructor(
    private customersService: CustomersService
  ) {
    ScrollMonitor.reset();
    this.permissionsSettings();
  }

  public ngOnInit() {

    this.customersService.getCustomers('CustomersComponent', (data) => {
      this.recordsData = data;
      this.loading = false;
    });

    this.customersService.getCustomersCount('CustomersComponent', (data) => {
      this.countData = data;
    });

    this.scrollSettings();
  }

  // User Interface Actions - Filters

  public onFilter(event: any) {

    const translate = this.translate.modal.filters.field;

    this.modalComponent.onOpen({
      activeComponent: 'Customers/Filters',
      fields: [
        { label: translate.code.label, property: 'code', combination: 'full', type: 'text', checked: false },
        { label: translate.name.label, property: 'name', combination: 'partial', type: 'text', checked: false },
        { label: translate.personalDocument.label, property: 'personalDocument.value', combination: 'full', type: 'cpf', checked: false },
        { label: translate.businessDocument.label, property: 'businessDocument.value', combination: 'full', type: 'cnpj', checked: false }
      ],
      callback: (filters: any[]) => {

        this.filtersBadge = (filters.length || 0);

        if (filters.length > 0) {
          this.queryClauses = Utilities.composeClausures(filters);
          this.customersService.query(this.queryClauses, true);
        } else {
          this.queryClauses = [];
          this.customersService.query(null, true);
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

      this.customersService.query(this.queryClauses, true, true);
    } else {
      this.queryClauses = [];
      this.customersService.query(null, true);
    }
  }

  public onChangeOrderBy(event) {
    this.order = event.order;
    this.customersService.query(null, true, false, true, true, 0, { orderBy: this.order });
  }

  // User Interface Actions - CRUD

  public onCreate() {

    this.modalComponent.onOpen({
      activeComponent: 'Customers/Create'
    });
  }

  public onRead(data: any) {

    this.modalComponent.onOpen({
      activeComponent: 'Customers/Read',
      data: Utilities.deepClone(data)
    });
  }

  public onUpdate(data: any) {

    this.modalComponent.onOpen({
      activeComponent: 'Customers/Update',
      data: Utilities.deepClone(data)
    });
  }

  public onDelete(data: any) {

    this.modalComponent.onOpen({
      activeComponent: 'Customers/Delete',
      data: Utilities.deepClone(data)
    });
  }

  // User Interface Actions - Others
  public onDataImport() {

    this.modalComponent.onOpen({
      activeComponent: 'Customers/DataImport'
    });
  }
  public onDataExport() {

    this.modalComponent.onOpen({
      activeComponent: 'Customers/DataExport'
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
        }
      } else {

        const permissions = (Utilities.permissions('registers')['customers'] as IPermissions['registers']['customers']);

        this.permissions = {
          actions: {
            add: (permissions.actions.indexOf("add") !== -1),
            edit: (permissions.actions.indexOf("edit") !== -1),
            delete: (permissions.actions.indexOf("delete") !== -1)
          }
        }
      }
    };

    Dispatch.onRefreshCurrentUserPermissions('CustomersComponent', () => {
      setupPermissions();
    });

    setupPermissions();
  }

  private scrollSettings() {

    ScrollMonitor.start({
      target: '#infiniteScroll',
      bottom: () => {

        if (this.countData.total > this.customersService.limit) {

          Utilities.loading();

          const query: any = (this.queryClauses.length > 0 ? this.queryClauses : null);
          const reset: boolean = false;
          const flex: boolean = (this.filtersBadge == 0);
          const scrolling: boolean = (this.queryClauses.length > 0);

          const orderBy = query && query.length > 0 ? null : { orderBy: this.order };

          this.customersService.query(query, reset, flex, scrolling, true, 0, orderBy).then(() => {
            Utilities.loading(false);
          });
        }
      }
    });
  }

  // Destruction Method

  public ngOnDestroy() {

    this.customersService.query([]);
    this.customersService.removeListeners('records', 'CustomersComponent');
    this.customersService.removeListeners('count', 'CustomersComponent');
    ScrollMonitor.reset();
    Dispatch.removeListeners('refeshCurrentUserPermissions', 'CustomersComponent');
  }

}
