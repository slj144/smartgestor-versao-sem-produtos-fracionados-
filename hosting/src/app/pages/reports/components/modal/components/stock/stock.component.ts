import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';

// Components
import { FiltersComponent } from '@shared/components/filters/filters.component';

// Services
import { StockReportsService } from './stock.service';

// Translate
import { StockReportsTranslate } from './stock.translate';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { DateTime } from '@shared/utilities/dateTime';
import { FieldMask } from '@shared/utilities/fieldMask';
import { ProductCategoriesService } from '@pages/registers/_aggregates/stock/product-categories/product-categories.service';
import { ProductDepartmentsService } from '@pages/registers/_aggregates/stock/product-departments/product-departments.service';
import { query } from '@shared/types/query';

@Component({
  selector: 'stock-report',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss']
})
export class StockReportsComponent implements OnInit {

  @Output() callback: EventEmitter<any> = new EventEmitter();
  @Input() settings: any = {};

  public translate = StockReportsTranslate.get();

  public loading: boolean = true;
  public isAdmin: boolean = Utilities.isAdmin;

  public typeActived: string = '';
  public filtersData: any = [];
  public categories: any = [];
  public departments: any = [];

  public formFilters: FormGroup;
  public formControls: any;

  public isMatrix = Utilities.isMatrix;

  public get useDepartments(): boolean {
    return Utilities.stockDepartmentsEnabled;
  }

  private modalComponent: any;
  private layerComponent: any;

  constructor(
    private formBuilder: FormBuilder,
    private stockReportsService: StockReportsService,
    private productsCategoriesService: ProductCategoriesService,
    private productDepartmentsService: ProductDepartmentsService
  ) { }

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // Initialize Method

  public bootstrap() {

    if (this.settings.model.id == 'products') {

      this.onGetCategories();
      this.onGetDepartments();

      const translate = this.translate.products;

      this.settings.model.filter = {
        weekly: Utilities.isAdmin ? true : !!this.checkPermissions("default", null, "filterWeek"),
        monthly: Utilities.isAdmin ? true : !!this.checkPermissions("default", null, "filterMonth"),
        lastMonth: Utilities.isAdmin ? true : !!this.checkPermissions("default", null, "filterLastMonth"),
        custom: Utilities.isAdmin ? true : !!this.checkPermissions("default", null, "filterPersonalized")
      };

      this.settings['fields'] = {
        default: [
          { label: translate.fields['default'].category.external, field: 'category', disabled: this.checkPermissions('default', 'category') },
          ...(this.useDepartments ? [{ label: translate.fields['default'].department.external, field: 'department', disabled: this.checkPermissions('default', 'department') }] : []),
          { label: translate.fields['default'].provider.external, field: 'provider', disabled: this.checkPermissions('default', 'provider') },
          { label: translate.fields['default'].quantity.external, field: 'quantity', disabled: this.checkPermissions('default', 'quantity') },
          { label: translate.fields['default'].alert.external, field: 'alert', disabled: this.checkPermissions('default', 'alert') },
          { label: translate.fields['default'].costPrice.external, field: 'costPrice', disabled: this.checkPermissions('default', 'costPrice') },
          { label: translate.fields['default'].salePrice.external, field: 'salePrice', disabled: this.checkPermissions('default', 'salePrice') },
          { label: translate.fields['default'].totalCost.external, field: 'totalCost', disabled: this.checkPermissions('default', 'totalCost') },
          { label: translate.fields['default'].totalSale.external, field: 'totalSale', disabled: this.checkPermissions('default', 'totalSale') },
          { label: translate.fields['default'].contributionMargin.external, field: 'contributionMargin', disabled: this.checkPermissions('default', 'contributionMargin') }
        ]
      };
    }
    if (this.settings.model.id == 'validity') {

      const translate = this.translate.validity;

      this.settings.model.filter = {
        weekly: true,
        monthly: true,
        lastMonth: true,
        custom: true
      };

      this.settings['fields'] = {
        default: [
          { label: translate.fields['default'].code.external, field: 'code', disabled: this.checkPermissions('default', 'code') },
          { label: translate.fields['default'].name.external, field: 'name', disabled: this.checkPermissions('default', 'name') },
          { label: translate.fields['default'].batch.external, field: 'batch', disabled: this.checkPermissions('default', 'batch') },
          { label: translate.fields['default'].expirationDate.external, field: 'expirationDate', disabled: this.checkPermissions('default', 'expirationDate') },
          { label: translate.fields['default'].quantity.external, field: 'quantity', disabled: this.checkPermissions('default', 'quantity') }
        ]
      };
    }

    if (this.settings.model.id == 'purchases') {

      const translate = this.translate.purchases;

      this.settings['types'] = [
        { id: 'completedPurchases', label: translate.types.completedPurchases },
        { id: 'pendingPurchases', label: translate.types.pendingPurchases },
        { id: 'purchasedProducts', label: translate.types.purchasedProducts }
      ];


      this.settings.model.filter = {
        weekly: Utilities.isAdmin ? true : !!this.checkPermissions(this.settings['types'][0].id, null, "filterWeek"),
        monthly: Utilities.isAdmin ? true : !!this.checkPermissions(this.settings['types'][0].id, null, "filterMonth"),
        lastMonth: Utilities.isAdmin ? true : !!this.checkPermissions(this.settings['types'][0].id, null, "filterLastMonth"),
        custom: Utilities.isAdmin ? true : !!this.checkPermissions(this.settings['types'][0].id, null, "filterPersonalized")
      };

      this.settings['fields'] = {
        completedPurchases: [
          { label: translate.fields['completedPurchases'].provider.external, field: 'provider', disabled: this.checkPermissions('completedPurchases', 'provider') },
          { label: translate.fields['completedPurchases'].products.external, field: 'products', disabled: this.checkPermissions('completedPurchases', 'products') },
          { label: translate.fields['completedPurchases'].purchaseAmount.external, field: 'purchaseAmount', disabled: this.checkPermissions('completedPurchases', 'purchaseAmount') },
          { label: translate.fields['completedPurchases'].totalCost.external, field: 'totalCost', disabled: this.checkPermissions('completedPurchases', 'totalCost') },
          { label: translate.fields['completedPurchases'].totalSale.external, field: 'totalSale', disabled: this.checkPermissions('completedPurchases', 'totalSale') },
          { label: translate.fields['completedPurchases'].contributionMargin.external, field: 'contributionMargin', disabled: this.checkPermissions('completedPurchases', 'contributionMargin') }
        ],
        pendingPurchases: [
          { label: translate.fields['pendingPurchases'].provider.external, field: 'provider', disabled: this.checkPermissions('pendingPurchases', 'provider') },
          { label: translate.fields['pendingPurchases'].products.external, field: 'products', disabled: this.checkPermissions('pendingPurchases', 'products') },
          { label: translate.fields['pendingPurchases'].purchaseAmount.external, field: 'purchaseAmount', disabled: this.checkPermissions('pendingPurchases', 'purchaseAmount') },
          { label: translate.fields['pendingPurchases'].totalCost.external, field: 'totalCost', disabled: this.checkPermissions('pendingPurchases', 'totalCost') },
          { label: translate.fields['pendingPurchases'].totalSale.external, field: 'totalSale', disabled: this.checkPermissions('pendingPurchases', 'totalSale') },
          { label: translate.fields['pendingPurchases'].contributionMargin.external, field: 'contributionMargin', disabled: this.checkPermissions('pendingPurchases', 'contributionMargin') }
        ],
        purchasedProducts: [
          { label: translate.fields['purchasedProducts'].provider.external, field: 'provider', disabled: this.checkPermissions('purchasedProducts', 'provider') },
          { label: translate.fields['purchasedProducts'].category.external, field: 'category', disabled: this.checkPermissions('purchasedProducts', 'category') },
          ...(this.useDepartments ? [{ label: translate.fields['purchasedProducts'].department.external, field: 'department', disabled: this.checkPermissions('purchasedProducts', 'department') }] : []),
          { label: translate.fields['purchasedProducts'].quantity.external, field: 'quantity', disabled: this.checkPermissions('purchasedProducts', 'quantity') },
          { label: translate.fields['purchasedProducts'].costPrice.external, field: 'costPrice', disabled: this.checkPermissions('purchasedProducts', 'costPrice') },
          { label: translate.fields['purchasedProducts'].salePrice.external, field: 'salePrice', disabled: this.checkPermissions('purchasedProducts', 'salePrice') },
          { label: translate.fields['purchasedProducts'].totalCost.external, field: 'totalCost', disabled: this.checkPermissions('purchasedProducts', 'totalCost') },
          { label: translate.fields['purchasedProducts'].totalSale.external, field: 'totalSale', disabled: this.checkPermissions('purchasedProducts', 'totalSale') },
          { label: translate.fields['purchasedProducts'].contributionMargin.external, field: 'contributionMargin', disabled: this.checkPermissions('purchasedProducts', 'contributionMargin') }
        ]
      };
    }

    if (this.settings.model.id == 'transfers') {

      const translate = this.translate.transfers;

      this.settings['types'] = [
        { id: 'completedTransfers', label: translate.types.completedTransfers },
        { id: 'pendingTransfers', label: translate.types.pendingTransfers },
        { id: 'transferedProducts', label: translate.types.transferedProducts }
      ];

      this.settings.model.filter = {
        weekly: Utilities.isAdmin ? true : !!this.checkPermissions(this.settings['types'][0].id, null, "filterWeek"),
        monthly: Utilities.isAdmin ? true : !!this.checkPermissions(this.settings['types'][0].id, null, "filterMonth"),
        lastMonth: Utilities.isAdmin ? true : !!this.checkPermissions(this.settings['types'][0].id, null, "filterLastMonth"),
        custom: Utilities.isAdmin ? true : !!this.checkPermissions(this.settings['types'][0].id, null, "filterPersonalized")
      };

      this.settings['fields'] = {
        completedTransfers: [
          { label: translate.fields['completedTransfers'].origin.external, field: 'origin', disabled: this.checkPermissions('completedTransfers', 'origin') },
          { label: translate.fields['completedTransfers'].destination.external, field: 'destination', disabled: this.checkPermissions('completedTransfers', 'destination') },
          { label: translate.fields['completedTransfers'].products.external, field: 'products', disabled: this.checkPermissions('completedTransfers', 'products') },
          { label: translate.fields['completedTransfers'].transferAmount.external, field: 'transferAmount', disabled: this.checkPermissions('completedTransfers', 'transferAmount') },
          { label: translate.fields['completedTransfers'].totalCost.external, field: 'totalCost', disabled: this.checkPermissions('completedTransfers', 'totalCost') },
          { label: translate.fields['completedTransfers'].totalSale.external, field: 'totalSale', disabled: this.checkPermissions('completedTransfers', 'totalSale') }
        ],
        pendingTransfers: [
          { label: translate.fields['pendingTransfers'].origin.external, field: 'origin', disabled: this.checkPermissions('pendingTransfers', 'origin') },
          { label: translate.fields['pendingTransfers'].destination.external, field: 'destination', disabled: this.checkPermissions('pendingTransfers', 'destination') },
          { label: translate.fields['pendingTransfers'].products.external, field: 'products', disabled: this.checkPermissions('pendingTransfers', 'products') },
          { label: translate.fields['pendingTransfers'].transferAmount.external, field: 'transferAmount', disabled: this.checkPermissions('pendingTransfers', 'transferAmount') },
          { label: translate.fields['pendingTransfers'].totalCost.external, field: 'totalCost', disabled: this.checkPermissions('pendingTransfers', 'totalCost') },
          { label: translate.fields['pendingTransfers'].totalSale.external, field: 'totalSale', disabled: this.checkPermissions('pendingTransfers', 'totalSale') }
        ],
        transferedProducts: [
          { label: translate.fields['transferedProducts'].origin.external, field: 'origin', disabled: this.checkPermissions('transferedProducts', 'origin') },
          { label: translate.fields['transferedProducts'].destination.external, field: 'destination', disabled: this.checkPermissions('transferedProducts', 'destination') },
          { label: translate.fields['transferedProducts'].name.external, field: 'name', disabled: this.checkPermissions('transferedProducts', 'name') },
          { label: translate.fields['transferedProducts'].category.external, field: 'category', disabled: this.checkPermissions('transferedProducts', 'category') },
          ...(this.useDepartments ? [{ label: translate.fields['transferedProducts'].department.external, field: 'department', disabled: this.checkPermissions('transferedProducts', 'department') }] : []),
          { label: translate.fields['transferedProducts'].quantity.external, field: 'quantity', disabled: this.checkPermissions('transferedProducts', 'quantity') },
          { label: translate.fields['transferedProducts'].costPrice.external, field: 'costPrice', disabled: this.checkPermissions('transferedProducts', 'costPrice') },
          { label: translate.fields['transferedProducts'].salePrice.external, field: 'salePrice', disabled: this.checkPermissions('transferedProducts', 'salePrice') },
          { label: translate.fields['transferedProducts'].totalCost.external, field: 'totalCost', disabled: this.checkPermissions('transferedProducts', 'totalCost') },
          { label: translate.fields['transferedProducts'].totalSale.external, field: 'totalSale', disabled: this.checkPermissions('transferedProducts', 'totalSale') }
        ]
      };
    }

    if (this.settings.model.id == 'stockLogs') {

      const translate = this.translate.stockLogs;

      this.settings.model.filter = {
        weekly: Utilities.isAdmin ? true : !!this.checkPermissions("default", null, "filterWeek"),
        monthly: Utilities.isAdmin ? true : !!this.checkPermissions("default", null, "filterMonth"),
        lastMonth: Utilities.isAdmin ? true : !!this.checkPermissions("default", null, "filterLastMonth"),
        custom: Utilities.isAdmin ? true : !!this.checkPermissions("default", null, "filterPersonalized")
      };

      this.settings['fields'] = {
        default: [
          { label: translate.fields['default'].productCode.external, field: 'productCode', disabled: this.checkPermissions('default', 'productCode') },
          { label: translate.fields['default'].collaborator.external, field: 'collaborator', disabled: this.checkPermissions('default', 'collaborator') },
          { label: translate.fields['default'].type.external, field: 'type', disabled: this.checkPermissions('default', 'type') },
          { label: translate.fields['default'].note.external, field: 'note', disabled: this.checkPermissions('default', 'note') },
          { label: translate.fields['default'].operation.external, field: 'operation', disabled: this.checkPermissions('default', 'operation') },
          { label: translate.fields['default'].quantity.external, field: 'quantity', disabled: this.checkPermissions('default', 'quantity') },
          { label: translate.fields['default'].action.external, field: 'action', disabled: this.checkPermissions('default', 'action') }
        ]
      };
    }

    if (this.settings.model.id == 'curveABC') {

      const translate = this.translate.curveABC;

      this.settings.model.filter = {
        weekly: Utilities.isAdmin ? true : !!this.checkPermissions("default", null, "filterWeek"),
        monthly: Utilities.isAdmin ? true : !!this.checkPermissions("default", null, "filterMonth"),
        lastMonth: Utilities.isAdmin ? true : !!this.checkPermissions("default", null, "filterLastMonth"),
        custom: Utilities.isAdmin ? true : !!this.checkPermissions("default", null, "filterPersonalized")
      };

      this.settings['fields'] = {
        default: [
          { label: translate.fields['default'].averageCost.external, field: 'averageCost', disabled: this.checkPermissions('default', 'averageCost') },
          { label: translate.fields['default'].averagePrice.external, field: 'averagePrice', disabled: this.checkPermissions('default', 'averagePrice') },
          { label: translate.fields['default'].revenue.external, field: 'revenue', disabled: this.checkPermissions('default', 'revenue') }
        ]
      };
    }

    this.formSettings();

    setTimeout(() => { this.loading = false }, 1000);
  }

  // User Interface Actions

  public onTypesChange(id: string) {

    this.settings.model.filter = {
      weekly: Utilities.isAdmin ? true : !!this.checkPermissions(id, null, "filterWeek"),
      monthly: Utilities.isAdmin ? true : !!this.checkPermissions(id, null, "filterMonth"),
      lastMonth: Utilities.isAdmin ? true : !!this.checkPermissions(id, null, "filterLastMonth"),
      custom: Utilities.isAdmin ? true : !!this.checkPermissions(id, null, "filterPersonalized")
    };

    this.typeActived = id;
    this.toggleFields();
  }

  public onGenerateReport() {

    this.loading = true;

    const model = this.settings.model;
    const filter = this.captureFilters();
    const category = this.formFilters.value.category;
    const department = this.formFilters.value.department;

    this.settings.model.download = Utilities.isAdmin ? true : !!this.checkPermissions(this.typeActived, null, "downloadReport");

    if (model.id == 'products') {

      const where = Utilities.composeClausures(this.filtersData);

      if (category != "##all##") {
        where.push({
          field: "category.code",
          operator: "=",
          value: category["0"] != "@" ? parseInt(category) : category
        });
      }

      if (this.useDepartments && department != "##all##") {
        where.push({
          field: "department.code",
          operator: "=",
          value: department["0"] != "@" ? parseInt(department) : department
        });
      }

      if (filter.status) {
        where.push(filter.status);
      }

      this.stockReportsService.getProducts({
        where: where,
        orderBy: { code: 1 },
        data: { storeID: filter.store._id }
      }).then((data) => {
        this.launchReport('Produtos', model, filter, data);
      });
    }
    if (model.id == 'validity') {

      const where: query['where'] = [
        { field: 'expirationDate', operator: '>=', value: filter.period.start },
        { field: 'expirationDate', operator: '<=', value: filter.period.end }
      ];

      this.stockReportsService.getProducts({
        where,
        orderBy: { expirationDate: 1 },
        data: { storeID: filter.store._id }
      }).then((data) => {
        this.launchReport('Validade', model, filter, data);
      });
    }

    if (model.id == 'purchases') {

      this.stockReportsService.getPurchases({
        where: [
          { field: 'registerDate', operator: '>=', value: filter.period.start },
          { field: 'registerDate', operator: '<=', value: filter.period.end },
          { field: 'owner', operator: '=', value: filter.store._id }
        ],
        orderBy: { code: -1 },
        data: { type: this.typeActived }
      }).then((data) => {
        this.launchReport('Compras', model, filter, data);
      });
    }

    if (model.id == 'transfers') {

      this.stockReportsService.getTransfers({
        where: [
          { field: 'registerDate', operator: '>=', value: filter.period.start },
          { field: 'registerDate', operator: '<=', value: filter.period.end },
          { field: 'owner', operator: '=', value: filter.store.id }
        ],
        orderBy: { code: -1 },
        data: { type: this.typeActived }
      }).then((data) => {
        this.launchReport('Transferências', model, filter, data);
      });
    }

    if (model.id == 'stockLogs') {

      const where: any = [
        { field: 'registerDate', operator: '>=', value: filter.period.start },
        { field: 'registerDate', operator: '<=', value: filter.period.end },
        { field: 'owner', operator: '=', value: filter.store._id }
      ];

      if (!Utilities.isAdmin && this.checkPermissions(this.typeActived, null, "filterDataPerOperator")) {
        where.push({ field: 'operator.username', operator: '=', value: Utilities.operator.username })
      }

      this.stockReportsService.getStockLogs({
        where: where,
        orderBy: { code: 1 }
      }).then((data) => {
        this.launchReport('Movimentação de Estoque', model, filter, data);
      });
    }

    if (model.id == 'curveABC') {

      this.stockReportsService.getCurveABC({
        where: [
          { field: 'status', operator: '=', value: 'CONCLUDED' },
          { field: 'registerDate', operator: '>=', value: filter.period.start },
          { field: 'registerDate', operator: '<=', value: filter.period.end },
          { field: 'owner', operator: '=', value: filter.store._id }
        ],
        orderBy: { code: 1 },
        data: { storeID: filter.store.id }
      }).then((data) => {
        this.launchReport('Curva ABC', model, filter, data);
      });
    }
  }

  public onGetCategories() {

    const timer = setInterval(() => {

      if (this.formFilters) {

        clearInterval(timer);

        this.productsCategoriesService.getCategories("ReportsStockProducts", ((res) => {
          this.productsCategoriesService.removeListeners("records", "ReportsStockProducts");
          this.categories = res;
          this.formFilters.get("category").setValue("##all##");
        }));

      }
    })
  }

  public onGetDepartments() {

    if (!this.useDepartments) {
      this.departments = [];
      return;
    }

    const timer = setInterval(() => {

      if (this.formFilters) {

        clearInterval(timer);

        this.productDepartmentsService.getDepartments("ReportsStockDepartments", ((res) => {
          this.productDepartmentsService.removeListeners("records", "ReportsStockDepartments");
          this.departments = res;

          if (this.formFilters.get("department")) {
            this.formFilters.get("department").setValue("##all##");
          }
        }));

      }
    })
  }

  // Filter Actions

  public onAddFilter(event: any) {

    let fieldSet = [];

    if (this.settings.model.id == 'products') {

      fieldSet = [
        { label: 'Nome', property: 'name', combination: 'partial', type: 'text', checked: false },

        { label: 'Quantidade', property: 'quantity', combination: 'full', type: 'number/integer', checked: false },
        { label: 'Alerta', property: 'alert', combination: 'full', type: 'number/integer', checked: false },

        {
          label: 'Categoria', property: 'category', options: [
            { label: 'Código', property: 'category.code', combination: 'full', path: 'Categoria/Código', type: 'text', nested: true, checked: false },
            { label: 'Nome', property: 'category.name', combination: 'partial', path: 'Categoria/Nome', type: 'text', nested: true, checked: false }
          ], checked: false, collapsed: false
        },

        {
          label: 'Unidade Comercial', property: 'type', options: [
            { label: 'Código', property: 'type.code', combination: 'full', path: 'Unidade Comercial/Código', type: 'text', nested: true, checked: false },
            { label: 'Nome', property: 'type.name', combination: 'partial', path: 'Unidade Comercial/Nome', type: 'text', nested: true, checked: false }
          ], checked: false, collapsed: false
        },

        {
          label: 'Fornecedor', property: 'provider', options: [
            { label: 'Código', property: 'provider.code', combination: 'full', path: 'Fornecedor/Código', type: 'text', nested: true, checked: false },
            { label: 'Nome', property: 'provider.name', combination: 'partial', path: 'Fornecedor/Nome', type: 'text', nested: true, checked: false }
          ], checked: false, collapsed: false
        },

        { label: 'Preço de Custo', property: 'costPrice', combination: 'full', type: 'number/float', checked: false },
        { label: 'Preço de Venda', property: 'salePrice', combination: 'full', type: 'number/float', checked: false }
      ]
    }

    this.modalComponent.onOpen({
      title: 'Filtros',
      activeComponent: 'ReportsStock/Filters',
      fields: fieldSet,
      callback: (filters: any[]) => {
        this.filtersData = filters;
      }
    });
  }

  public onRemoveFilter(index: number) {
    FiltersComponent.shared.onRemoveFilter(index);
  }

  // Event Listeners

  public onModalResponse(event: any) {

    if (event.instance) {
      this.modalComponent = event.instance;
    }
  }

  public onLayerResponse(event: any) {

    if (event.instance) {
      this.layerComponent = event.instance;
    }
  }

  // Mask Methods

  public onApplyDateMask(event: Event) {

    $$(event.target)[0].value = FieldMask.dateFieldMask($$(event.target)[0].value);

    if ($$(event.target)[0].value.length == 10) {
      $$(event.target)[0].blur();
    }
  }

  // Setting Methods

  private formSettings() {

    this.typeActived = '';

    this.formFilters = this.formBuilder.group({
      store: [Utilities.storeID],
      period: ['today'],
      startDate: [`${DateTime.getCurrentYear()}-${DateTime.getCurrentMonth()}-01`],
      endDate: [`${DateTime.getCurrentYear()}-${DateTime.getCurrentMonth()}-${DateTime.getCurrentDay()}`],
      fields: this.formBuilder.array([]),
      status: ["##all##"],
      category: ["##all##"],
      department: ["##all##"]
    });


    if (this.settings.types) {
      this.typeActived = this.settings.types[0].id;
      this.formFilters.addControl('types', new FormControl(this.settings.types[0].id, Validators.required));
    }

    if (this.typeActived == '' && this.settings.fields['default']) {
      this.typeActived = 'default';
    }

    this.formControls = this.formFilters.controls;

    this.toggleFields();
  }

  // Utility Methods

  private checkPermissions(type: string, field: string = null, action = null) {

    if (!action) {
      return (this.settings.permissions && this.settings.permissions[type] ? (this.settings.permissions[type].fields.indexOf(field) == -1) : false);
    } else {

      if (Utilities.isAdmin) {
        return false;
      }

      return (this.settings.permissions && this.settings.permissions[type] && this.settings.permissions[type].actions ? this.settings.permissions[type].actions.includes(action) : false);
    }

  }

  private launchReport(title: string, model: any, filter: any, data: any) {

    this.layerComponent.onOpen({
      id: model.id,
      title: title,
      store: filter.store,
      download: this.settings.model.download,
      period: {
        start: filter.period.start,
        end: filter.period.end
      },
      type: this.typeActived,
      fields: filter.fields,
      data: data,
      date: DateTime.formatDate(DateTime.getDateObject().toISOString(), 'string')
    });

    setTimeout(() => this.loading = false, 500);
  }

  private captureFilters() {

    const filter = this.formFilters.value;

    filter.store = (() => {

      const store = (this.isMatrix ? filter.store : Utilities.storeID);

      for (const item of this.settings.stores) {
        if (item._id == store) {
          return item;
        }
      }
    })();

    filter.period = (() => {

      let period: any = {};
      let startDate: string = '';
      let endDate: string = '';

      if (filter.period == 'today') {
        startDate = DateTime.getDate('D');
        endDate = DateTime.getDate('D');
      }
      else if (filter.period == 'currentWeek') {
        startDate = DateTime.formatDate(DateTime.getStartWeek(new Date(DateTime.getDate())).toISOString()).date;
        endDate = DateTime.formatDate(DateTime.getEndWeek(new Date(DateTime.getDate())).toISOString()).date;
      }
      else if (filter.period == 'currentMonth') {
        startDate = `${DateTime.getCurrentYear()}-${DateTime.getCurrentMonth()}-01`;
        endDate = `${DateTime.getCurrentYear()}-${DateTime.getCurrentMonth()}-${DateTime.getCurrentDay()}`;
      }
      else if (filter.period == 'lastMonth') {

        let year = DateTime.getCurrentYear();
        let month = DateTime.getCurrentMonth();

        if (month == 1) {
          month = 12;
          year -= 1;
        } else {
          month = (parseInt(month.toString()) - 1) > 9 ? (parseInt(month.toString()) - 1) : `0${(parseInt(month.toString()) - 1)}`;
        }

        let lastDayOfMonth = (new Date(year, (<number>month), 0)).getDate();

        startDate = `${year}-${month}-01`;
        endDate = `${year}-${month}-${lastDayOfMonth}`;
      }

      period.start = (() => {
        const date = (filter.period == 'custom' ? filter.startDate : startDate);
        return DateTime.formatDate(date instanceof Date ? (<Date>date).toISOString() : date).date + ' 00:00:00';
      })();

      period.end = (() => {
        const date = (filter.period == 'custom' ? filter.endDate : endDate);
        return DateTime.formatDate(date instanceof Date ? (<Date>date).toISOString() : date).date + ' 23:59:59';
      })();

      delete filter.startDate;
      delete filter.endDate;

      return period;
    })();

    filter.fields = (() => {

      const arr = [];

      for (const i in filter.fields) {

        if (filter.fields[i]) {

          arr.push(this.settings.fields[this.typeActived][i].field);

          $$(this.settings.fields[this.typeActived][i].sub).map((_, item) => {
            if (!item.disabled) {
              arr.push(`${this.settings.fields[this.typeActived][i].field}/${item.field}`);
            }
          });
        }
      }

      return arr;
    })();

    if (filter.status != "##all##") {
      if (filter.status == 'in_stock') {
        filter.status = { field: 'quantity', operator: ">", value: 0 };
      } else if (filter.status == 'negative_stock') {
        filter.status = { field: 'quantity', operator: "<", value: 0 };
      } else if (filter.status == 'zero_or_negative') {
        filter.status = { field: 'quantity', operator: "<=", value: 0 };
      } else {
        // out_stock (exactly zero)
        filter.status = { field: 'quantity', operator: "=", value: 0 };
      }
    } else {
      delete filter.status;
    }

    return filter;
  }

  private toggleFields() {

    (this.formControls.fields as FormArray).clear();

    if (this.settings.fields && this.settings.fields[this.typeActived]) {

      let fields = [];

      for (const field of this.settings.fields[this.typeActived]) {

        if (!field.disabled) {
          (this.formControls.fields as FormArray).push(new FormControl(field.value || true));
          fields.push(field);
        }
      }

      this.settings.fields[this.typeActived] = fields;
    }
  }

}
