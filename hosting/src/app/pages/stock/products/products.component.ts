import { Component, OnInit, OnDestroy } from '@angular/core';

// Services
import { ProductsService } from './products.service';
import { AlertService } from '@shared/services/alert.service';
import { FiscalService } from '@pages/fiscal/fiscal.service';

// Translate
import { ProductsTranslate } from './products.translate';

// Interfaces
import { IStockProduct } from '@shared/interfaces/IStockProduct';
import { IPermissions } from '@shared/interfaces/_auxiliaries/IPermissions';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { Dispatch } from '@shared/utilities/dispatch';
import { ScrollMonitor } from '@shared/utilities/scrollMonitor';
import { EStockLogAction } from '@shared/interfaces/IStockLog';
import { ScannerService } from '@shared/services/scanner.service';
@Component({
  selector: 'products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit, OnDestroy {

  public translate = ProductsTranslate.get();

  public loading: boolean = true;
  public filtersBadge: number = 0;
  public countData: any = {};
  public recordsData: any = [];
  public queryClauses: any = [];
  public permissions: any = {};
  public order = 1;

  public isMatrix = Utilities.isMatrix;
  public isAdmin = Utilities.isAdmin;
  public isFiscal: boolean = Utilities.isFiscal;
  public fiscalConfigured: boolean = false;

  private modalComponent: any;

  constructor(
    private productsService: ProductsService,
    private fiscalService: FiscalService,
    private alertService: AlertService,
    private scannerService: ScannerService
  ) {
    ScrollMonitor.reset();
    this.permissionsSettings();
  }

  public ngOnInit() {

    // Forçar refresh dos dados ao inicializar o componente
    this.refreshProductData();

    this.fiscalService.getStoreSettings("ProductsComponent", (fiscalSettings) => {
      if (Object.values(fiscalSettings).length > 0) {
        this.fiscalConfigured = true;
      }
    });

    this.scrollSettings();
    this.scannerSettings();
  }

  private refreshProductData() {
    // Limpar qualquer cache ou filtro anterior
    this.recordsData = [];
    this.countData = {};
    this.loading = true;

    // Resetar query para garantir dados limpos
    this.productsService.query(null, true, false, true, true, { orderBy: this.order });

    this.productsService.getProducts('ProductsComponent', (data) => {
      this.recordsData = data;
      this.loading = false;
    });

    this.productsService.getProductsCount('ProductsComponent', (data) => {
      this.countData = data;
    });
  }

  // User Interface Actions - Filters

  public onFilter(event: any) {

    const translate = this.translate.modal.filters.field;

    this.modalComponent.onOpen({
      activeComponent: 'Products/Filters',
      fields: [
        // { label: translate.code.label, property: 'code', combination: 'full', type: 'text', checked: false },
        // 🛠️ CORREÇÃO: code deve ser número para evitar prefixCode indevido
        { label: translate.code.label, property: 'code', combination: 'full', type: 'number/integer', checked: false },
        { label: translate.name.label, property: 'name', combination: 'partial', type: 'text', checked: false },
        { label: translate.serialNumber.label, property: 'serialNumber', combination: 'partial', type: 'text', checked: false },
        { label: translate.quantity.label, property: 'quantity', combination: 'full', type: 'number/integer', checked: false },
        { label: translate.alert.label, property: 'alert', combination: 'full', type: 'number/integer', checked: false },
        {
          label: translate.category.label, property: 'category', options: [
            { label: translate.category.option.code.label, property: 'category.code', combination: 'full', path: translate.category.option.code.path, type: 'number/integer', nested: true, checked: false },
            { label: translate.category.option.name.label, property: 'category.name', combination: 'partial', path: translate.category.option.name.path, type: 'text', nested: true, checked: false }
          ], checked: false, collapsed: false
        },
        {
          label: translate.commercialUnit.label, property: 'commercialUnit', options: [
            { label: translate.commercialUnit.option.code.label, property: 'commercialUnit.code', combination: 'full', path: translate.commercialUnit.option.code.path, type: 'text', nested: true, checked: false },
            { label: translate.commercialUnit.option.name.label, property: 'commercialUnit.name', combination: 'partial', path: translate.commercialUnit.option.code.path, type: 'text', nested: true, checked: false }
          ], checked: false, collapsed: false
        },
        {
          label: translate.provider.label, property: 'provider', options: [
            { label: translate.provider.option.code.label, property: 'provider.code', combination: 'full', path: translate.provider.option.code.path, type: 'text', nested: true, checked: false },
            { label: translate.provider.option.name.label, property: 'provider.name', combination: 'partial', path: translate.provider.option.name.path, type: 'text', nested: true, checked: false }
          ], checked: false, collapsed: false
        },
        { label: translate.costPrice.label, property: 'costPrice', combination: 'full', type: 'number/float', checked: false },
        { label: translate.salePrice.label, property: 'salePrice', combination: 'full', type: 'number/float', checked: false }
      ],
      callback: (filters: any[]) => {

        this.filtersBadge = (filters.length || 0);

        if (filters.length > 0) {
          this.queryClauses = Utilities.composeClausures(filters);
          this.productsService.query(this.queryClauses, true);
        } else {
          this.queryClauses = [];
          this.productsService.query(null, true);
        }
      }
    });
  }

  public onSearch(event: any) {

    const value = event.value;

    if (value != '') {

      this.queryClauses = [];

      let values = [];
      let flex = false;

      value.split(';').map((v) => {
        if (v.trim()) {
          values.push(v.trim().toLowerCase());
        }
      });

      $$(values).map((_, value) => {

        if (/^\d+$/.test(value)) {

          flex = true;

          const raw = String(value);

          // Tenta por múltiplos campos para reconhecer etiquetas antigas
          this.queryClauses.push({ field: 'barcode', operator: '=', value: raw });
          this.queryClauses.push({ field: 'code', operator: '=', value: parseInt(raw, 10) });
          this.queryClauses.push({ field: 'internalCode', operator: '=', value: raw });
          this.queryClauses.push({ field: 'serialNumber', operator: '=', value: raw });
          this.queryClauses.push({ field: 'batch', operator: '=', value: raw });
          this.queryClauses.push({ field: 'provider.code', operator: '=', value: raw });

          // AutoBarcode: remove 4 últimos dígitos e tenta como code
          if (raw.length >= 8 && raw.length < 13) {
            const truncated = raw.substring(0, raw.length - 4);
            if (/^\d+$/.test(truncated)) {
              this.queryClauses.push({ field: 'code', operator: '=', value: parseInt(truncated, 10) });
            }
          }

        } else {

          let parts = value.split("*")
          const startString = parts[0].trim();
          parts.shift();

          let queryString = "";

          queryString += startString;

          parts.forEach((str) => {
            str = str.trim()
              .replace(/\-/g, "\-")
              .replace(/\\/g, "\\")
              .replace(/\//g, "\/")
              .replace(/\_/g, "\_")
              .replace(/\%/g, "\%")
              .replace(/\$/g, "\$")
              .replace(/\@/g, "\@")
              .replace(/\!/g, "\!")
              .replace(/\(/g, "\(")
              .replace(/\)/g, "\)")
              .replace(/\[/g, "\[")
              .replace(/\]/g, "\_")
              .replace(/\{/g, "\{")
              .replace(/\}/g, "\}")
              .replace(/\:/g, "\:")
              .replace(/\,/g, "\,")
              .replace(/\./g, "\.");
            queryString += "[\\w\\W\\s]*" + `${str}`
          });

          if (queryString.length > 0) {
            queryString += "[\\w\\W\\s]*";
            this.queryClauses.push({ field: 'name', operator: 'like', value: new RegExp(queryString, 'gi') });
          }
        }
      });

      this.productsService.query(this.queryClauses, true, true);
    } else {
      this.queryClauses = [];
      this.productsService.query(null, true, false, true, true, { orderBy: this.order });
    }
  }

  public onChangeOrderBy(event) {
    this.order = event.order;
    this.productsService.query(null, true, false, true, true, { orderBy: this.order });
  }

  // User Interface Actions - CRUD

  public onCreate() {

    this.modalComponent.onOpen({
      activeComponent: 'Products/Create'
    });
  }

  public onRead(data: IStockProduct) {

    this.modalComponent.onOpen({
      activeComponent: 'Products/Read',
      permissions: this.permissions,
      data: Utilities.deepClone(data)
    });
  }

  public onUpdate(data: IStockProduct) {

    this.modalComponent.onOpen({
      activeComponent: 'Products/Update',
      data: Utilities.deepClone(data)
    });
  }

  public onDelete(data: IStockProduct) {

    this.alertService.confirm('Deseja DELETAR o produto?', `#${data.code} - ${data.name}`).then((res) => {

      if (res.isConfirmed) {

        this.productsService.deleteProducts([data]).then(() => {
          this.alertService.alert('O produto foi deletado com sucesso!', 'success');
        });
      }
    });
  }

  public onDuplicate(data: IStockProduct) {

    this.alertService.confirm('Deseja DUPLICAR o produto?', `#${data.code} - ${data.name}`).then((res) => {

      if (res.isConfirmed) {

        const product = Utilities.deepClone(data);

        delete product._id;
        delete product.code;
        delete product.serialNumber;
        delete product.barcode;

        product.name = `${product.name} - Cópia`;
        product.quantity = 0;

        this.productsService.registerProducts([product], null, { action: EStockLogAction.ADJUSTMENT }).then(() => {
          this.alertService.alert('O produto foi duplicado com sucesso!', 'success');
        });
      }
    });
  }

  // User Interface Actions - Others

  public onStockAdjustment() {

    this.modalComponent.onOpen({
      activeComponent: 'Products/StockAdjustment'
    });
  }

  public onGenerateTickets() {

    this.modalComponent.onOpen({
      activeComponent: 'Products/GenerateTickets'
    });
  }

  public onDataImport() {

    this.modalComponent.onOpen({
      activeComponent: 'Products/DataImport'
    });
  }

  public onXmlImport() {
    this.modalComponent.onOpen({
      activeComponent: 'Products/XMLImport'
    });
  }

  public onDataExport() {

    this.modalComponent.onOpen({
      activeComponent: 'Products/DataExport'
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
          actions: { add: true, edit: true, delete: true },
          fields: { costPrice: true },
          sections: { stockAdjustment: true, generateTickets: true, dataImport: true, dataExport: true }
        }
      } else {

        const permissions = (Utilities.permissions('stock')['products'] as IPermissions['stock']['products']);

        this.permissions = {
          actions: {
            add: (permissions.actions.indexOf('add') !== -1),
            edit: (permissions.actions.indexOf('edit') !== -1),
            delete: (permissions.actions.indexOf('delete') !== -1)
          },
          fields: {
            costPrice: (permissions.fields.indexOf('costPrice') !== -1)
          },
          sections: {
            stockAdjustment: (permissions.sections.indexOf('stockAdjustment') !== -1),
            generateTickets: (permissions.sections.indexOf('generateTickets') !== -1),
            dataImport: (permissions.sections.indexOf('dataImport') !== -1)
          }
        }
      }
    };

    Dispatch.onRefreshCurrentUserPermissions('ProductsComponent', () => {
      setupPermissions();
    });

    setupPermissions();
  }

  private scrollSettings() {

    ScrollMonitor.start({
      target: '#infiniteScroll',
      bottom: () => {

        if (this.countData.total > this.productsService.limit) {

          Utilities.loading();

          const query: any = (this.queryClauses.length > 0 ? this.queryClauses : null);
          const reset: boolean = false;
          const flex: boolean = (this.filtersBadge == 0);
          const scrolling: boolean = (this.queryClauses.length > 0);

          const orderBy = query && query.length > 0 ? null : { orderBy: this.order };

          this.productsService.query(query, reset, flex, scrolling, true, orderBy).then(() => {
            Utilities.loading(false);
          }).catch(() => {
            Utilities.loading(false);
          });
        }
      }
    });
  }
  private scannerSettings() {
    this.scannerService.getShot('ProductsComponent', (barcode) => {
      this.onSearch({ value: barcode });
    });
  }

  // Destruction Method

  public ngOnDestroy() {

    this.productsService.query([]);

    this.productsService.removeListeners('records', 'ProductsComponent');
    this.productsService.removeListeners('count', 'ProductsComponent');
    this.fiscalService.removeListeners("store-settings", "ProductsComponent");
    this.scannerService.removeListeners('ProductsComponent');
    ScrollMonitor.reset();
    Dispatch.removeListeners('refreshCurrentUserPermissions', 'ProductsComponent');
  }

}
