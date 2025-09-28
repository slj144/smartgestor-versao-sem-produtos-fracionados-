import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';

// Services
import { ServiceOrdersService } from './serviceOrders.service';

// Translate
import { ServiceOrdersTranslate } from './serviceOrders.translate';

// Interfaces
import { IPermissions } from '@shared/interfaces/_auxiliaries/IPermissions';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { Dispatch } from '@shared/utilities/dispatch';
import { ScrollMonitor } from '@shared/utilities/scrollMonitor';

@Component({
  selector: 'service-orders',
  templateUrl: './serviceOrders.component.html',
  styleUrls: ['./serviceOrders.component.scss']
})
export class ServiceOrdersComponent implements OnInit, OnDestroy{  

  public translate = ServiceOrdersTranslate.get();

  public loading: boolean = true;
  public filtersBadge: number = 0;
  public countData: any = {};
  public recordsData: any = [];
  public queryClauses: any = [];
  public permissions: any = {};
  // Evita requisições duplicadas ao puxar mais itens no virtual scroll
  private pagingBusy = false;
  // Altura aproximada da linha para o Virtual Scroll (px)
  public rowSize = 88;
  
  private modalComponent: any;

  constructor(
    private serviceOrdersService: ServiceOrdersService
  ) {
    ScrollMonitor.reset();
    this.permissionsSettings();
  }

  public ngOnInit() {
    // Ajusta tamanho da linha conforme o viewport (mantém virtual scroll estável)
    this.rowSize = this.computeRowSize();

    this.serviceOrdersService.getServices("ServiceOrdersComponent", (data) => {
      this.recordsData = data;
      this.loading = false;
    });

    this.serviceOrdersService.getServicesCount('ServiceOrdersComponent', (data) => {     
      this.countData = data;
    });

    this.scrollSettings();
  }

  @HostListener('window:resize')
  public onResize() {
    this.rowSize = this.computeRowSize();
  }

  private computeRowSize(): number {
    const width = window.innerWidth || 1024;
    // Linhas um pouco mais altas em telas pequenas por causa de quebras
    if (width < 768) { return 120; }
    if (width < 1200) { return 100; }
    return 88;
  }

  public trackByServiceOrder(index: number, item: any) {
    return item._id || item.code;
  }
  
  // User Interface Actions - Search

  public onFilter(event) {

    const translate = this.translate.modal.filters.field;

    const fields = [
      { label: translate.code.label, property: 'code', combination: 'full', type: 'text', checked: false },        

      { label: translate.customer.label, property: 'customer', options: [
        { label: translate.customer.option.code.label, property: 'customer.code', combination: 'full', path: translate.customer.option.code.path, type: 'text', nested: true, checked: false },
        { label: translate.customer.option.name.label, property: 'customer.name', combination: 'partial', path: translate.customer.option.name.path, type: 'text', nested: true, checked: false }
      ], checked: false, collapsed: false },

      ...[  ...( Utilities.isAdmin || !Utilities.isAdmin && !this.permissions.filterDataPerOperator ?  
          [{ label: translate.operator.label, property: 'operator', options: [
          { label: translate.operator.option.name.label, property: 'operator.name', combination: 'partial', path: translate.operator.option.name.path, type: 'text', nested: true, checked: false }
          ], checked: false, collapsed: false }] : []) 
        ],

      { label: translate.equipment.label, property: 'equipment', options: [          
        { label: translate.equipment.option.name.label, property: 'equipment.name', combination: 'partial', path: translate.equipment.option.name.path, type: 'text', nested: true, checked: false },
        { label: translate.equipment.option.model.label, property: 'equipment.model', combination: 'partial', path: translate.equipment.option.model.path, type: 'text', nested: true, checked: false },
        { label: translate.equipment.option.serialNumber.label, property: 'equipment.mei', combination: 'full', path: translate.equipment.option.serialNumber.path, type: 'text', nested: true, checked: false }
      ], checked: false, collapsed: false },

      { label: translate.product.label, property: 'products', options: [
        { label: translate.product.option.code.label, property: 'products.code', combination: 'full', path: translate.product.option.code.path, type: 'text', nested: true, checked: false },
        { label: translate.product.option.name.label, property: 'products.name', combination: 'partial', path: translate.product.option.name.path, type: 'text', nested: true, checked: false },
      ], checked: false, collapsed: false },

      { label: translate.service.label, property: 'services', options: [
        { label: translate.service.option.code.label, property: 'services.code', combination: 'full', path: translate.service.option.code.path, type: 'text', nested: true, checked: false },
        { label: translate.service.option.name.label, property: 'services.name', combination: 'partial', path: translate.service.option.name.path, type: 'text', nested: true, checked: false },
      ], checked: false, collapsed: false },

      { label: translate.serviceOrderStatus.label, property: 'serviceStatus', combination: 'full', type: 'select', list: [
        { label: translate.serviceOrderStatus.list.pendent.label, value: 'PENDENT' },
        { label: translate.serviceOrderStatus.list.concluded.label, value: 'CONCLUDED' },
        { label: translate.serviceOrderStatus.list.canceled.label, value: 'CANCELED' }
      ], checked: false },

      { label: translate.paymentStatus.label, property: 'paymentStatus', combination: 'full', type: 'select', list: [
        { label: translate.paymentStatus.list.pendent.label, value: 'PENDENT' },
        { label: translate.paymentStatus.list.concluded.label, value: 'CONCLUDED' }
      ], checked: false },

      { label: translate.entryDate.label, property: 'entryDate', combination: 'partial', type: 'date', checked: false },
      { label: translate.deliveryDate.label, property: 'deliveryDate', combination: 'partial', type: 'date', checked: false },

      { label:  translate.value.label, property: 'balance.total', combination: 'full', type: 'number/float', checked: false }
    ]

    this.modalComponent.onOpen({
      activeComponent: 'ServiceOrders/Filters',
      fields: fields,
      callback: (filters: any[]) => {

        this.filtersBadge = (filters.length || 0);

        if (filters.length > 0) {
          this.queryClauses = Utilities.composeClausures(filters);
          this.serviceOrdersService.query(this.queryClauses, true);
        } else {
          this.queryClauses = [];
          this.serviceOrdersService.query(null, true);
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
        where.push({ field: 'customer.name', operator: 'like', value: new RegExp(value, 'gi') });
      }

      this.serviceOrdersService.query(where, true, false, false, true, 0);
    } else {
      this.serviceOrdersService.query([]);
    }
  }

  // User Interface Actions - CRUD

  public onCreate() {

    this.modalComponent.onOpen({
      activeComponent: 'ServiceOrders/Create'
    });
  }
  
  public onRead(data: any) {

    this.modalComponent.onOpen({
      activeComponent: 'ServiceOrders/Read',
      data: Utilities.deepClone(data)
    });
  }

  public onUpdate(data: any) {

    this.modalComponent.onOpen({
      activeComponent: 'ServiceOrders/Update',
      data: Utilities.deepClone(data) 
    });
  }

  public onCancel(data: any) {

    this.modalComponent.onOpen({
      activeComponent: 'ServiceOrders/Cancel',
      data: Utilities.deepClone(data)
    });
  }

  // Event Listeners

  public onModalResponse(event: any) {

    if (event.instance) {
      this.modalComponent = event.instance;
    }   
  }

  public onStatusResponse(event: any) {

    if (event.open) {

      const instance = event.open.instance;
      delete event.open.instance;

      this.modalComponent.onOpen({
        activeComponent: 'ServiceOrders/UpdateStatus',
        instance: instance,
        data: event.open
      });
    }
  }

  // Axiliary Methods

  public checkCancel(item: any) {

    const indexConcluded = item.scheme.data.status.indexOf("CONCLUDED");
    const currentStatusIndex = item.scheme.data.status.indexOf(item.scheme.status);

    if (item.serviceStatus == "CONCLUDED" && item.scheme.data.status[item.scheme.data.status.length - 1] == "CONCLUDED") {
      return false; 
    } else if (currentStatusIndex < indexConcluded) {      
      return true;
    }

    return item.scheme.status == "CONCLUDED" && item.scheme.data.status[item.scheme.data.status.length - 1] != "CONCLUDED";
  }

  // Utility Methods

  private permissionsSettings() {

    const setupPermissions = () => {
     
      if (Utilities.isAdmin) {
        this.permissions = {
          add: true,
          edit: true,
          delete: true,
          cancel: true,
          filterDataPerOperator: false
        };
      } else {

        const permissions = Utilities.permissions("serviceOrders") as IPermissions["serviceOrders"];

        if (permissions){
          this.permissions = {
            filterDataPerOperator:(permissions.actions.indexOf('filterDataPerOperator') !== -1),
            add: permissions.actions.indexOf("add") !== -1,
            edit: permissions.actions.indexOf("edit") !== -1,
            delete: permissions.actions.indexOf("delete") !== -1,
            cancel: permissions.actions.indexOf("cancel") !== -1
          };
        }
      }
    };

    Dispatch.onRefreshCurrentUserPermissions("ServiceOrdersComponent", ()=>{
      setupPermissions();
    });

    setupPermissions();
  }

  private scrollSettings() {
    
    ScrollMonitor.start({
      target: '#infiniteScroll',
      bottom: () => {

        if (this.countData.total > this.serviceOrdersService.limit) {
          
          Utilities.loading();

          const query: any = (this.queryClauses.length > 0 ? this.queryClauses : null);
          const reset: boolean = false;
          const flex: boolean = false//(this.filtersBadge == 0);
          const scrolling: boolean = true;//(!!this.queryClauses.length);

          this.serviceOrdersService.query(query, reset, flex, scrolling, true, 0, {filterDataPerOperator: this.permissions.filterDataPerOperator}).then(() => {
            Utilities.loading(false);
          });
        }
      }
    });
  }

  // Virtual Scroll index change: ao se aproximar do final, buscamos mais usando a mesma lógica
  public onIndexChange(index: number) {
    try {
      // Sem dados suficientes ou já buscando, não faz nada
      if (this.pagingBusy) { return; }
      if (!this.recordsData || this.recordsData.length === 0) { return; }

      const threshold = Math.max(0, this.recordsData.length - 10); // quando faltar ~10 itens
      const hasMore = this.countData?.total > this.serviceOrdersService.limit && this.recordsData.length < this.countData?.total;

      if (hasMore && index >= threshold) {
        this.pagingBusy = true;
        Utilities.loading();

        const query: any = (this.queryClauses.length > 0 ? this.queryClauses : null);
        const reset: boolean = false;
        const flex: boolean = false;
        const scrolling: boolean = true;

        this.serviceOrdersService
          .query(query, reset, flex, scrolling, true, 0, { filterDataPerOperator: this.permissions.filterDataPerOperator })
          .then(() => {
            this.pagingBusy = false;
            Utilities.loading(false);
          })
          .catch(() => {
            this.pagingBusy = false;
            Utilities.loading(false);
          });
      }
    } catch(_) { /* noop */ }
  }

  // Destruction Method

  public ngOnDestroy() {

    this.serviceOrdersService.query([]);
    this.serviceOrdersService.removeListeners('records', 'ServiceOrdersComponent');
    this.serviceOrdersService.removeListeners('count', 'ServiceOrdersComponent');
    ScrollMonitor.reset();
    Dispatch.removeListeners('refreshCurrentUserPermissions', 'ServiceOrdersComponent');
  }

}
