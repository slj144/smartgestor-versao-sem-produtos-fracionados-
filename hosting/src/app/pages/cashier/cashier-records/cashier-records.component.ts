import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';

// Components
import { CashierFrontPDVComponent } from '../cashier-front/components/cashier-pdv/cashier-pdv.component';
import { CashierFrontReceiptsComponent } from '../cashier-front/components/cashier-receipts/cashier-receipts.component';

// Services
import { CashierRecordsService } from './cashier-records.service';
import { AlertService } from '@shared/services/alert.service';

// Translate
import { CashierRecordsTranslate } from './cashier-records.translate';

// Interfaces
import { IPermissions } from '@shared/interfaces/_auxiliaries/IPermissions';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { DateTime } from '@shared/utilities/dateTime';
import { Dispatch } from '@shared/utilities/dispatch';
import { ScrollMonitor } from '@shared/utilities/scrollMonitor';
import { ECashierSaleOrigin, ICashierSale } from '@shared/interfaces/ICashierSale';

@Component({
  selector: 'cashier-records',
  templateUrl: './cashier-records.component.html',
  styleUrls: ['./cashier-records.component.scss']
})
export class CashierRecordsComponent implements OnInit, OnDestroy {

  @Output() callback: EventEmitter<any> = new EventEmitter();
  @Input() embed: boolean = false;

  public translate = CashierRecordsTranslate.get();

  public loading: boolean = true;
  public loadingOperators: boolean = true;

  public filtersBadge: number = 0;
  public recordsData: any = [];
  public queryClauses: any = [];
  public permissions: any = {};
  private operators = {};

  public period: any = {};

  private modalComponent: any;
  private tabsComponent: any;

  private isFiscal = Utilities.isFiscal;
  private isAdmin = Utilities.isAdmin;

  constructor(
    private cashierRecordsService: CashierRecordsService,
    private alertService: AlertService
  ) {

    ScrollMonitor.reset();

    DateTime.context(() => {
      this.periodSettings();
    });
  }

  public ngOnInit() {

    this.permissionsSettings();
    this.getOperators();
    this.scrollSettings();
    this.callback.emit({ instance: this });
  }

  // User Interface Actions - Filters

  public onFilter(event: any) {

    let fieldSet = [];

    if (this.tabsComponent.activeTab == 'sales') {

      const translate = this.translate.modal.filters.segment.sale.field;

      fieldSet = [
        { label: translate.saleCode.label, property: 'code', combination: 'full', type: 'text', checked: false },
        { label: translate.serviceCode.label, property: 'service.code', combination: 'full', type: 'number/integer', checked: false },
        {
          label: translate.customer.label, property: 'customer', options: [
            { label: translate.customer.option.code.label, property: 'customer.code', combination: 'full', path: translate.customer.option.code.path, type: 'text', nested: true, checked: false },
            { label: translate.customer.option.name.label, property: 'customer.name', combination: 'partial', path: translate.customer.option.name.path, type: 'text', nested: true, checked: false },
            { label: translate.customer.option.cpf.label, property: 'customer.personalDocument.value', combination: 'partial', path: translate.customer.option.cpf.path, type: 'cpf', nested: true, checked: false },
            { label: translate.customer.option.cnpj.label, property: 'customer.businessDocument.value', combination: 'partial', path: translate.customer.option.cnpj.path, type: 'cnpj', nested: true, checked: false },
            { label: translate.customer.option.phone.label, property: 'customer.phone', combination: 'partial', path: translate.customer.option.phone.path, type: 'phone', nested: true, checked: false }
          ], checked: false, collapsed: false
        },
        {
          label: translate.services.label, property: 'service.types', options: [
            { label: translate.services.option.code.label, property: 'service.types.code', combination: 'full', path: translate.services.option.code.path, type: 'text', nested: true, checked: false },
            { label: translate.services.option.name.label, property: 'service.types.name', combination: 'partial', path: translate.services.option.name.path, type: 'text', nested: true, checked: false }
          ], checked: false, collapsed: false
        },
        {
          label: translate.products.label, property: 'products', options: [
            { label: translate.products.option.code.label, property: 'products.code', combination: 'full', path: translate.products.option.code.path, type: 'text', nested: true, checked: false },
            { label: translate.products.option.name.label, property: 'products.name', combination: 'partial', path: translate.products.option.name.path, type: 'text', nested: true, checked: false }
          ], checked: false, collapsed: false
        },
        {
          label: translate.paymentMethods.label, property: 'payment', options: [
            { label: translate.paymentMethods.option.code.label, property: 'paymentMethods.code', combination: 'full', path: translate.paymentMethods.option.code.path, type: 'text', nested: true, checked: false },
            { label: translate.paymentMethods.option.name.label, property: 'paymentMethods.name', combination: 'partial', path: translate.paymentMethods.option.name.path, type: 'text', nested: true, checked: false }
          ], checked: false, collapsed: false
        },
        {
          label: translate.status.label, property: 'status', combination: 'full', type: 'select', list: [
            { label: translate.status.list.pendent.label, value: 'PENDENT' },
            { label: translate.status.list.concluded.label, value: 'CONCLUDED' },
            { label: translate.status.list.canceled.label, value: 'CANCELED' }
          ], checked: false
        },
        //{ label: translate.saleDate.label, property: 'saleDate', combination: 'partial', type: 'date', checked: false }
        { label: translate.saleDate.label, property: 'registerDate', combination: 'partial', type: 'date', checked: false }
      ];

      if (Utilities.isAdmin || !Utilities.isAdmin && !this.permissions.filterDataPerOperator) {
        fieldSet.push({
          label: translate.operator.label, property: 'operator', options: [
            { label: translate.operator.option.name.label, property: 'operator.name', combination: 'partial', path: translate.operator.option.name.path, type: 'text', nested: true, checked: false }
          ], checked: false, collapsed: false
        });
      }
    }

    if (this.tabsComponent.activeTab == 'inflows') {

      const translate = this.translate.modal.filters.segment.inflow.field;

      fieldSet = [
        { label: translate.code.label, property: 'code', combination: 'full', type: 'text', checked: false },
        { label: translate.date.label, property: 'registerDate', combination: 'partial', type: 'date', checked: false }
      ];

      if (Utilities.isAdmin || !Utilities.isAdmin && !this.permissions.filterDataPerOperator) {
        fieldSet.push({
          label: translate.operator.label, property: 'operator', options: [
            { label: translate.operator.option.name.label, property: 'operator.name', combination: 'partial', path: translate.operator.option.name.path, type: 'text', nested: true, checked: false }
          ], checked: false, collapsed: false
        });
      }
    }

    if (this.tabsComponent.activeTab == 'outflows') {

      const translate = this.translate.modal.filters.segment.outflow.field;

      fieldSet = [
        { label: translate.code.label, property: 'code', combination: 'full', type: 'text', checked: false },
        { label: translate.date.label, property: 'datetime', combination: 'partial', type: 'date', checked: false },
      ];

      if (Utilities.isAdmin || !Utilities.isAdmin && !this.permissions.filterDataPerOperator) {
        fieldSet.push({
          label: translate.operator.label, property: 'operator', options: [
            { label: translate.operator.option.name.label, property: 'operator.name', combination: 'partial', path: translate.operator.option.name.path, type: 'text', nested: true, checked: false }
          ], checked: false, collapsed: false
        });
      }
    }

    this.modalComponent.onOpen({
      activeComponent: 'CashierRecords/Filters',
      fields: fieldSet,
      callback: (filters: any[]) => {

        this.filtersBadge = (filters.length || 0);

        if (filters.length > 0) {

          const query = Utilities.composeClausures(filters);


          this.queryClauses = query;

          if (!Utilities.isAdmin && this.permissions.filterDataPerOperator) {
            query.push({ field: "operator.username", operator: "=", value: Utilities.operator.username });
          }

          this.cashierRecordsService.query(this.tabsComponent.activeTab, this.queryClauses, true);
        } else {
          this.queryClauses = [];
          this.cashierRecordsService.query(this.tabsComponent.activeTab, null, true);
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
        this.queryClauses.push({ field: 'customer.name', operator: 'like', value: new RegExp(value, 'gi') });
        this.queryClauses.push({ field: 'member.name', operator: 'like', value: new RegExp(value, 'gi') });
      }

      this.cashierRecordsService.query(this.tabsComponent.activeTab, this.queryClauses, true, true);
    } else {

      this.queryClauses = [];

      if (!Utilities.isAdmin && this.permissions.filterDataPerOperator) {
        this.queryClauses.push({ field: "operator.username", operator: "=", value: Utilities.operator.username });
      }

      this.cashierRecordsService.query(this.tabsComponent.activeTab, this.queryClauses, true);
    }
  }

  public onStatus(event: Event) {

    const value = $$(event.currentTarget).val();
    const tab = this.tabsComponent.activeTab;

    if (value != 'ALL') {

      const filter = [{
        filter: { status: value },
        settings: { operator: '=' }
      }];

      const query = Utilities.composeClausures(filter);

      this.queryClauses = query;

      if (!Utilities.isAdmin && this.permissions.filterDataPerOperator) {
        query.push({ field: "operator.username", operator: "=", value: Utilities.operator.username });
      }

      this.cashierRecordsService.query(tab, query, true, false);
    } else {

      const query = [];

      this.queryClauses = [];

      if (!Utilities.isAdmin && this.permissions.filterDataPerOperator) {
        query.push({ field: "operator.username", operator: "=", value: Utilities.operator.username });
      }

      this.cashierRecordsService.query(tab, query, true, false);
    }
  }

  // User Interface Actions - CRUD

  public onRead(event: Event, data: any, type: string) {

    event.stopPropagation();

    this.modalComponent.onOpen({
      activeComponent: `CashierRecords/Read`,
      type: type,
      data: Utilities.deepClone(data)
    });
  }

  public onUpdate(event: Event, data: any, type: string) {

    event.stopPropagation();

    data = Utilities.deepClone(data);

    if (type == 'Sale') {
      CashierFrontPDVComponent.shared.onOpenSale(data);
    }

    if (type == 'Inflow') {
      // CashierFrontPDVComponent.shared.onOpenInflow(data);
    }

    if (type == 'OutFlow') {
      // CashierFrontPDVComponent.shared.onOpenOutflow(data);
    }

    this.callback.emit({ close: true });
  }

  public onCancel(event: Event, data: any, type: string) {

    event.stopPropagation();

    this.modalComponent.onOpen({
      activeComponent: `CashierRecords/Cancel`,
      type: type,
      data: Utilities.deepClone(data)
    });
  }

  public onDelete(event: Event, data: any, type: string) {

    event.stopPropagation();

    this.modalComponent.onOpen({
      activeComponent: `CashierRecords/Delete`,
      type: type,
      data: Utilities.deepClone(data)
    });
  }

  public onChangeOperator(event: Event, data) {

    event.stopPropagation();
    Utilities.loading();

    const timer = setInterval(() => {
      if (!this.loadingOperators) {
        clearInterval(timer);

        let select: HTMLSelectElement = null;

        this.alertService.custom({
          title: 'Operador',
          html: `
            <div class="swal-container-select">
              <select class="form-select custom-select custom-select-green no-validation mx-auto" style="max-width: 320px">
                ${Object.values(this.operators).map((user: any) => {
            return '<option value="' + user.code + '">' + user.name + '</option>';
          })}
              </select>
            </div>
          `,
          showCancelButton: true,
          showConfirmButton: true,
          cancelButtonText: 'Cancelar',
          confirmButtonText: 'Alterar operador',
          reverseButtons: true,
          didOpen: () => {

            select = document.querySelectorAll<HTMLSelectElement>('.swal-container-select .custom-select')[0];
            select.value = String(Utilities.operator.code);
            Utilities.loading(false);
          }
        }).then((res) => {

          if (res.isConfirmed) {

            const userCode = select.value.indexOf("@") != -1 ? select.value : parseInt(select.value);
            const operator = this.operators[userCode];

            const updateData = {
              _id: data._id,
              code: data.code,
              operator: operator
            };

            Dispatch.cashierFrontPDVService.changeSaleOperator(updateData).then(() => {

            }).catch(() => {
              this.alertService.error('Ocorreu um erro ao tentar alterar o operador.');
            });
          }

        });
      }
    }, 0);


  }

  public onDuplicate(event: Event, data: ICashierSale) {

    event.stopPropagation();

    this.alertService.confirm('Deseja DUPLICAR a venda?', `#${data.code} - ${data.customer?.name}`).then((res) => {

      if (res.isConfirmed) {

        const sale = Utilities.deepClone(data);

        delete sale._id;
        delete sale.code;
        delete sale.registerDate;
        delete sale.modifiedDate;
        delete sale.nf;
        delete sale.requestCode;

        sale.origin = ECashierSaleOrigin.CASHIER;

        sale.paymentMethods.forEach((method) => {
          delete method.history;
        });

        Dispatch.cashierFrontPDVService.registerSale(sale, null, false).then((response) => {
          this.alertService.alert('A venda foi duplicada com sucesso!', 'success');
        });
      }
    });
  }

  public onPrint(event: Event, data: any, type: string) {
    event.stopPropagation();
    CashierFrontReceiptsComponent.shared.onOpen({ data, type, nf: data.nf });
  }

  // Método para abrir modal de emissão de nota fiscal
  // FIX: Agora funciona corretamente após mover RegisterNfComponent para SharedModule
  public onEmitNf(event: Event, data: any) {

    event.stopPropagation();

    this.modalComponent.onOpen({
      activeComponent: `Fiscal/Add`,
      type: "fiscal",
      data: Utilities.deepClone(data)
    });
  }

  // Event Listeners

  public onModalResponse(event: any) {

    if (event.instance) {
      this.modalComponent = event.instance;
    }
  }

  public async onTabsResponse(event: any) {

    if (event.instance) {

      this.tabsComponent = event.instance;

      const tabs = [];

      if (this.permissions.sections.sales) {
        tabs.push({ id: 'sales', name: this.translate.tabs.option.sales });
      }

      if (this.permissions.sections.inputs) {
        tabs.push({ id: 'inflows', name: this.translate.tabs.option.inflows });
      }

      if (this.permissions.sections.outputs) {
        tabs.push({ id: 'outflows', name: this.translate.tabs.option.outflows });
      }

      if (tabs.length == 0) {
        tabs.push({ id: 'sales', name: this.translate.tabs.option.sales });
      }

      this.tabsComponent.initialize({
        items: tabs,
        activate: tabs[0].id
      });
    }

    if (event.activeTab) {

      this.loading = true;
      this.filtersBadge = 0;
      this.recordsData = [];

      Promise.resolve().then(() => {

        this.cashierRecordsService.removeListeners('sales', 'CashierRecordsComponent');
        this.cashierRecordsService.removeListeners('inflows', 'CashierRecordsComponent');
        this.cashierRecordsService.removeListeners('outflows', 'CashierRecordsComponent');

        const query = [];

        if (!Utilities.isAdmin && this.permissions.filterDataPerOperator) {
          query.push({ field: "operator.username", operator: "=", value: Utilities.operator.username });
        }

        this.cashierRecordsService.query(event.activeTab, query, true).then(() => {

          const callback = (data) => {
            this.recordsData = data;
            setTimeout(() => { this.loading = false }, 1000);
          };

          if (event.activeTab == 'sales') {
            this.cashierRecordsService.getSales('CashierRecordsComponent', callback);
          }

          if (event.activeTab == 'inflows') {
            this.cashierRecordsService.getInflows('CashierRecordsComponent', callback);
          }

          if (event.activeTab == 'outflows') {
            this.cashierRecordsService.getOutflows('CashierRecordsComponent', callback);
          }
        });
      });
    }
  }

  // User Interface Predicate Methods

  public checkFiscal(item) {

    if (this.isFiscal) {

      return true;

      if (this.permissions.emitNf && !item.nf || this.permissions.emitNf && item.nf) {

        const hasService = item.service && item.service.types ? item.service.types.length > 0 : false;
        const hasProducts = item.products ? item.products.length > 0 : false;

        if (!item.nf) {
          return true;
        }

        if (typeof item.nf.status == "object") {

          if (item.nf && item.nf.status.nf && item.nf.status.nf != "CONCLUIDO") {
            return true;
          }

          if (item.nf && item.nf.status.nfse && item.nf.status.nfse != "CONCLUIDO" && !item.nf.conjugated && hasService) {
            return true;
          }

          if (item.nf && item.nf.status.nfse && item.nf.status.nfse == "CONCLUIDO" && item.nf.status.nf && item.nf.status.nf == "CONCLUIDO") {
            return false;
          }

          if (item.nf && !item.nf.conjugated && hasService && !item.nf.id.nfse) {
            return true
          }
        } else {
          return false;
        }

      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  // Get Auxiliary Data

  private getOperators() {

    Dispatch.collaboratorsService.query([{ field: "owner", operator: "=", value: Utilities.storeID }], false, false, false, false).then((data) => {

      const map = {};

      data.forEach((item) => {

        item.permissions = item.permissions || {};

        map[item.code] = {
          code: item.code,
          username: item.username,
          name: item.name,
          usertype: item.usertype == 'admin' ? "admin" : item.permissions.name
        };
      });

      this.operators = map;
      this.loadingOperators = false;
    });

  }

  // Utility Methods

  private periodSettings() {

    const date = DateTime.getDateObject();
    date.setDate(date.getDate() - 3);

    const startDate = DateTime.formatDate(date.toISOString(), "string", "D").split(" ")[0];

    this.period.start = `${startDate} 00:00:00`;
    this.period.end = `${DateTime.getDate('D')} 23:59:59`;
  }

  private permissionsSettings() {

    const setupPermissions = () => {

      if (Utilities.isAdmin) {

        this.permissions = {
          filterDataPerOperator: false,
          sections: {
            sales: true,
            inputs: true,
            outputs: true,
          },
          editSales: true, cancelSales: true, emitNf: true, changeOperator: true, duplicateSales: true
        };
      } else {

        const permissions = (Utilities.permissions('cashier') as IPermissions['cashier']);

        // console.log(permissions);

        // Regra de visualização:
        // - Se a ação 'viewAll' estiver presente em cashierRegisters.actions → não filtra por operador (visualiza tudo)
        // - Caso contrário, respeita a flag legacy em fields: 'filterDataPerOperator'
        const viewAll = !!(permissions.cashierRegisters && permissions.cashierRegisters.actions && permissions.cashierRegisters.actions.indexOf('viewAll') !== -1);
        const filterByOperatorFlag = !!(permissions.cashierRegisters && permissions.cashierRegisters.fields && permissions.cashierRegisters.fields.indexOf('filterDataPerOperator') !== -1);

        this.permissions = {
          filterDataPerOperator: (viewAll ? false : filterByOperatorFlag),
          sections: {
            sales: (permissions.cashierRegisters && permissions.cashierRegisters.sections && permissions.cashierRegisters.sections.indexOf('sales') !== -1),
            inputs: (permissions.cashierRegisters && permissions.cashierRegisters.sections && permissions.cashierRegisters.sections.indexOf('inputs') !== -1),
            outputs: (permissions.cashierRegisters && permissions.cashierRegisters.sections && permissions.cashierRegisters.sections.indexOf('outputs') !== -1),
          },
          changeOperator: (
            permissions.cashierRegisters && permissions.cashierRegisters.actions && permissions.cashierRegisters.actions.indexOf('changeOperator') !== -1),
          duplicateSales: (
            permissions.cashierRegisters && permissions.cashierRegisters.actions && permissions.cashierRegisters.actions.indexOf('duplicateSales') !== -1),
          // Edição/fechamento da venda pode ser concedida diretamente em cashierRegisters.actions
          // ou herdada das ações de sales no módulo cashierFront (legado)
          editSales: (
            (permissions.cashierRegisters && permissions.cashierRegisters.actions && permissions.cashierRegisters.actions.indexOf('editSales') !== -1) ||
            (permissions.cashierFront && permissions.cashierFront.sections &&
              permissions.cashierFront.sections.sales && permissions.cashierFront.sections.sales.actions &&
              permissions.cashierFront.sections.sales.actions.indexOf('edit') !== -1)
          ),
          cancelSales: (
            (permissions.cashierRegisters && permissions.cashierRegisters.actions && permissions.cashierRegisters.actions.indexOf('closeSales') !== -1) ||
            (permissions.cashierFront && permissions.cashierFront.sections &&
              permissions.cashierFront.sections.sales && permissions.cashierFront.sections.sales.actions &&
              permissions.cashierFront.sections.sales.actions.indexOf('cancel') !== -1)
          )
        }

      }
    };

    Dispatch.onRefreshCurrentUserPermissions('CashierPDVRecordsComponent', () => {
      setupPermissions();
    });

    setupPermissions();
  }

  private scrollSettings() {

    ScrollMonitor.start({
      target: '#infiniteScroll',
      bottom: () => {

        Utilities.loading();

        const type = this.tabsComponent.activeTab;
        const query: any = (this.queryClauses.length > 0 ? this.queryClauses : []);
        const reset: boolean = false;
        const flex: boolean = false;//(this.filtersBadge == 0);

        if ((query.length) == 0) {
          if (!Utilities.isAdmin && this.permissions.filterDataPerOperator) {
            query.push({ field: "operator.username", operator: "=", value: Utilities.operator.username });
          }
        }

        const scrolling: boolean = true;

        this.cashierRecordsService.query(type, query, reset, flex, scrolling, true).then(() => {
          Utilities.loading(false);
        }).catch(() => {
          Utilities.loading(false);
        });
      }
    });

  }

  // Destruction Method

  public ngOnDestroy() {
    this.cashierRecordsService.removeListeners();
    ScrollMonitor.reset();
  }

}
