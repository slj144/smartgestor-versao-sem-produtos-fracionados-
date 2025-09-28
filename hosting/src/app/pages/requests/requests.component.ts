import { Component, OnDestroy, OnInit } from '@angular/core';

// Services
import { RequestsService } from './requests.service';

// Translate
import { RequestsTranslate } from './requests.translate';

// Interfaces
import { ERequestStatus, IRequest } from '@shared/interfaces/IRequest';
import { IPermissions } from '@shared/interfaces/_auxiliaries/IPermissions';

// Utilities
import { Utilities } from '@shared/utilities/utilities';
import { Dispatch } from '@shared/utilities/dispatch';
import { ScrollMonitor } from '@shared/utilities/scrollMonitor';
import { AlertService } from '@shared/services/alert.service';
import { ECashierSaleStatus } from '@shared/interfaces/ICashierSale';

@Component({
  selector: 'requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.scss']
})
export class RequestsComponent implements OnInit, OnDestroy {

  public translate = RequestsTranslate.get();

  public loading: boolean = true;
  public filtersBadge: number = 0;
  public countData: any = {};
  public recordsData: IRequest[] = [];
  public queryClauses: any = [];
  public permissions: any = {};

  public isMatrix: boolean = Utilities.isMatrix;
  public isAdmin: boolean = Utilities.isAdmin;

  private modalComponent: any;

  constructor(
    private requestsService: RequestsService,
    private alertService: AlertService
  ) {
    ScrollMonitor.reset();
    this.permissionsSettings();
  }

  public ngOnInit(): void {

    this.requestsService.getRequests('RequestsComponent', (data) => {
      this.recordsData = data;
      // data.forEach(item => {

      //   // if(item.code == "0060"){
      //   //   console.log(item.code, item);
      //   // }
      // });
      this.loading = false;
    });

    this.requestsService.getRequestsCount('RequestsComponent', (data) => {
      this.countData = data;
    });

    this.scrollSettings();
  }

  // Filters

  public onFilter(event: any): void {

    const translate = this.translate.modal.filters.field;

    this.modalComponent.onOpen({
      activeComponent: 'Requests/filters',
      fields: [
        { label: translate.requestCode.label, property: 'code', combination: 'full', type: 'text', checked: false },
        { label: translate.saleCode.label, property: 'saleCode', combination: 'full', type: 'text', checked: false },

        {
          label: translate.customer.label, property: 'customer', options: [
            { label: translate.customer.option.code.label, property: 'customer.code', combination: 'full', path: translate.customer.option.code.path, type: 'text', nested: true, checked: false },
            { label: translate.customer.option.name.label, property: 'customer.name', combination: 'partial', path: translate.customer.option.name.path, type: 'text', nested: true, checked: false }
          ], checked: false, collapsed: false
        },

        {
          label: translate.products.label, property: 'products', options: [
            { label: translate.products.option.code.label, property: 'products.code', combination: 'full', path: translate.products.option.code.path, type: 'text', nested: true, checked: false },
            { label: translate.products.option.name.label, property: 'products.name', combination: 'partial', path: translate.products.option.name.path, type: 'text', nested: true, checked: false }
          ], checked: false, collapsed: false
        },

        {
          label: translate.operator.label, property: 'operator', options: [
            { label: translate.operator.option.name.label, property: 'operator.name', combination: 'partial', path: translate.operator.option.name.path, type: 'text', nested: true, checked: false }
          ], checked: false, collapsed: false
        },

        {
          label: translate.requestStatus.label, property: 'requestStatus', combination: 'full', type: 'select', list: [
            { label: translate.requestStatus.list.pendent.label, value: 'PENDENT' },
            { label: translate.requestStatus.list.concluded.label, value: 'CONCLUDED' },
            { label: translate.requestStatus.list.canceled.label, value: 'CANCELED' }
          ], checked: false
        },

        {
          label: translate.paymentStatus.label, property: 'paymentStatus', combination: 'full', type: 'select', list: [
            { label: translate.paymentStatus.list.pendent.label, value: 'PENDENT' },
            { label: translate.paymentStatus.list.concluded.label, value: 'CONCLUDED' },
            { label: translate.paymentStatus.list.canceled.label, value: 'CANCELED' }
          ], checked: false
        },

        { label: translate.requestDate.label, property: 'registerDate', combination: 'partial', type: 'date', checked: false }
      ],
      callback: (filters: any[]) => {

        this.filtersBadge = (filters.length || 0);

        if (filters.length > 0) {
          this.queryClauses = Utilities.composeClausures(filters);
          this.requestsService.query(this.queryClauses, true);
        } else {
          this.queryClauses = [];
          this.requestsService.query(null, true);
        }
      }
    });
  }

  public onSearch(event: any): void {

    const value = event.value;

    if (value != '') {

      this.queryClauses = [];

      if (!isNaN(parseInt(value))) {
        this.queryClauses.push({ field: 'code', operator: '=', value: parseInt(value) });
      } else {
        this.queryClauses.push({ field: 'customer.name', operator: 'like', value: new RegExp(value, 'gi') });
      }

      this.requestsService.query(this.queryClauses, true, true);
    } else {
      this.queryClauses = [];
      this.requestsService.query(null, true);
    }
  }

  // Actions CRUD

  public onAction(type: ('create' | 'read' | 'edit' | 'cancel'), data: IRequest = null): void {

    if (
      (type == 'edit' && !this.checkPermissionToEdit(data)) ||
      (type == 'cancel' && !this.checkPermissionToCancel(data))
    ) return;

    this.modalComponent.onOpen({
      activeComponent: `Requests/${type}`,
      data: Utilities.deepClone(data ?? {})
    });
  }

  public onDuplicate(data: IRequest) {

    this.alertService.confirm('Deseja DUPLICAR o pedido?', `#${data.code} - ${data.customer?.name}`).then((res) => {

      if (res.isConfirmed) {

        const request = Utilities.deepClone(data);

        delete request._id;
        delete request.code;
        delete request.saleCode;
        request.saleStatus = ERequestStatus.PENDENT;
        request.requestStatus = ECashierSaleStatus.PENDENT;

        this.requestsService.registerRequest(request).then(() => {
          this.alertService.alert('O peidido foi duplicado com sucesso!', 'success');
        });
      }
    });
  }

  public onOpenScheme() {
    this.modalComponent.onOpen({
      activeComponent: `Requests/Schemes`,
      data: {}
    });
  }

  // Check Actions

  public checkPermissionToEdit(data: IRequest): boolean {
    return ((data.requestStatus == 'PENDENT') && this.permissions.actions.edit);
  }

  public checkPermissionToCancel(data: IRequest): boolean {
    return (((data.requestStatus != 'CANCELED') && (data.saleStatus == 'PENDENT')) && this.permissions.actions.cancel);
  }

  // Event Listeners

  public onModalResponse(event: any): void {

    if (event.instance) {
      this.modalComponent = event.instance;
    }
  }

  // Utility Methods

  private permissionsSettings(): void {

    const setupPermissions = () => {

      if (Utilities.isAdmin) {

        this.permissions = {
          actions: { add: true, edit: true, cancel: true, delete: true },
          sections: { schemes: true }
        }
      } else {

        const permissions = (Utilities.permissions('requests') as IPermissions['requests']);

        this.permissions = {
          actions: {
            add: (permissions.actions.indexOf('add') !== -1),
            edit: (permissions.actions.indexOf('edit') !== -1),
            delete: (permissions.actions.indexOf('delete') !== -1)
          },
          sections: { schemes: true }
        }
      }
    };

    Dispatch.onRefreshCurrentUserPermissions('RequestsComponent', () => {
      setupPermissions();
    });

    setupPermissions();
  }

  private scrollSettings(): void {

    ScrollMonitor.start({
      target: '#infiniteScroll',
      bottom: () => {

        if (this.countData.total > this.requestsService.limit) {

          Utilities.loading();

          const query: any = (this.queryClauses.length > 0 ? this.queryClauses : null);
          const reset: boolean = false;
          const flex: boolean = (this.filtersBadge == 0);
          const scrolling: boolean = (this.queryClauses.length > 0);

          this.requestsService.query(query, reset, flex, scrolling).then(() => {
            Utilities.loading(false);
          });
        }
      }
    });
  }

  // Destrution Methods

  public ngOnDestroy(): void {

    this.requestsService.query([]);
    this.requestsService.removeListeners('records', 'RequestsComponent');
    this.requestsService.removeListeners('count', 'RequestsComponent');

    Dispatch.removeListeners('refreshCurrentUserPermissions', 'RequestsComponent');
  }

}
