// Arquivo: cashier.component.ts
// Localização: src/app/pages/reports/components/modal/components/cashier/
// Finalidade: Tela de Relatórios de Caixa (vendas, entradas, saídas, etc.)
// Nota (2025-08): Correção no filtro de produtos para o relatório
// "Vendas por Colaborador (Analítico/Sintético)" respeitar o período.
// Problema: ao informar códigos de produtos, o período era ignorado em alguns cenários
// por conta de um array aninhado indevidamente dentro do "where". Ajuste: não inserir
// a lista de produtos (array) diretamente no where; usamos apenas o array "or" e a
// filtragem detalhada no tratamento em cashier.service.ts.
import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';

// Services
import { CashierReportsService } from './cashier.service';
import { CollaboratorsService } from '@pages/registers/collaborators/collaborators.service';

// Translate
import { ReportsCashierTranslate } from './cashier.translate';

// Settings
import { ProjectSettings } from '@assets/settings/company-settings';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { DateTime } from '@shared/utilities/dateTime';
import { ProductCategoriesService } from '@pages/registers/_aggregates/stock/product-categories/product-categories.service';
import { ProvidersService } from '@pages/registers/providers/providers.service';

@Component({
  selector: 'cashier-report',
  templateUrl: './cashier.component.html',
  styleUrls: ['./cashier.component.scss']
})
export class CashierReportsComponent implements OnInit {

  @Input() settings: any = {};
  @Output() callback: EventEmitter<any> = new EventEmitter();

  public translate = ReportsCashierTranslate.get();

  public loading: boolean = true;
  public typeActived: string = '';
  public collaborators: any = [];
  public productCategories: any = [];
  public productProviders: any = [];

  public formFilters: FormGroup;
  public formControls: any;

  public isAdmin = Utilities.isAdmin;
  public isMatrix = Utilities.isMatrix;

  private layerComponent: any;

  constructor(
    private formBuilder: FormBuilder,
    private cashierReportsService: CashierReportsService,
    private collaboratorsService: CollaboratorsService,
    private productsCategoriesService: ProductCategoriesService,
    private providersService: ProvidersService
  ) { }

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // Initialize Method

  public bootstrap() {

    const checkOS = !!(ProjectSettings.companySettings().profile['serviceOrders'] && ProjectSettings.companySettings().profile['serviceOrders'].active);

    this.onGetCollaborators(Utilities.storeID);
    this.onGetProductsCategories();
    this.onGetProductsProviders();

    if (this.settings.model.id == 'resume') {

      const translate = this.translate.resume;

      this.settings.model.filter = {
        lastMonth: Utilities.isAdmin ? true : !!this.checkPermissions("default", null, "filterLastMonth"),
        weekly: Utilities.isAdmin ? true : !!this.checkPermissions('default', null, "filterWeek"),
        monthly: Utilities.isAdmin ? true : !!this.checkPermissions('default', null, "filterMonth"),
        custom: Utilities.isAdmin ? true : !!this.checkPermissions('default', null, "filterPersonalized")
      };

      this.settings['fields'] = {
        default: [
          { label: translate.fields['default'].sales.external, field: 'sales', disabled: this.checkPermissions('default', 'sales') },
          { label: translate.fields['default'].inputs.external, field: 'inputs', disabled: this.checkPermissions('default', 'inputs') },
          { label: translate.fields['default'].outputs.external, field: 'outputs', disabled: this.checkPermissions('default', 'outputs') },
          { label: translate.fields['default'].servicesCosts.external, field: 'servicesCosts', disabled: !(checkOS && !this.checkPermissions('default', 'servicesCosts')) },
          { label: translate.fields['default'].productsCosts.external, field: 'productsCosts', disabled: this.checkPermissions('default', 'productsCosts') },
          { label: translate.fields['default'].paymentsCosts.external, field: 'paymentsCosts', disabled: this.checkPermissions('default', 'paymentsCosts') },
          { label: translate.fields['default'].totalCosts.external, field: 'totalCosts', disabled: this.checkPermissions('default', 'totalCosts') },
          { label: translate.fields['default'].totalTaxes.external, field: 'totalTaxes', disabled: this.checkPermissions('default', 'totalTaxes') },
          { label: translate.fields['default'].partialRevenue.external, field: 'partialRevenue', disabled: this.checkPermissions('default', 'partialRevenue') },
          { label: translate.fields['default'].commission.external, field: 'commission', disabled: this.checkPermissions('default', 'commission') },
          { label: translate.fields['default'].finalRevenue.external, field: 'finalRevenue', disabled: this.checkPermissions('default', 'finalRevenue') },

        ]
      };

    }

    if (this.settings.model.id == 'sales') {

      const translate = this.translate.sales;

      this.settings['types'] = [];

      const permissionsTypes = [
        { status: this.checkPermissions('salesReportSynthetic'), data: { id: 'salesReportSynthetic', label: translate.types.salesReportSynthetic } },
        { status: this.checkPermissions('salesReportAnalytical'), data: { id: 'salesReportAnalytical', label: translate.types.salesReportAnalytical } },
        { status: this.checkPermissions('paymentMethodsSynthetic'), data: { id: 'paymentMethodsSynthetic', label: translate.types.paymentMethodsSynthetic } },
        { status: this.checkPermissions('paymentMethodsAnalytical'), data: { id: 'paymentMethodsAnalytical', label: translate.types.paymentMethodsAnalytical } },
        { status: this.checkPermissions('salesPerUserSynthetic'), data: { id: 'salesPerUserSynthetic', label: translate.types.salesPerUserSynthetic } },
        { status: this.checkPermissions('salesPerUserAnalytical'), data: { id: 'salesPerUserAnalytical', label: translate.types.salesPerUserAnalytical } },
      ];

      permissionsTypes.forEach((value) => {
        if (value.status) {
          this.settings['types'].push(value.data);
        }
      });

      this.settings.model.filter = {
        weekly: Utilities.isAdmin ? true : !!this.checkPermissions(this.settings['types'][0].id, null, "filterWeek"),
        monthly: Utilities.isAdmin ? true : !!this.checkPermissions(this.settings['types'][0].id, null, "filterMonth"),
        lastMonth: Utilities.isAdmin ? true : !!this.checkPermissions(this.settings['types'][0].id, null, "filterLastMonth"),
        custom: Utilities.isAdmin ? true : !!this.checkPermissions(this.settings['types'][0].id, null, "filterPersonalized"),
        perCategory: Utilities.isAdmin ? true : !!this.checkPermissions(this.settings['types'][0].id, null, "filterPerCategory"),
        perProducts: Utilities.isAdmin ? true : !!this.checkPermissions(this.settings['types'][0].id, null, "filterPerProducts"),
        perProvider: Utilities.isAdmin ? true : !!this.checkPermissions(this.settings['types'][0].id, null, "filterPerProvider")
      };

      this.settings['fields'] = {

        salesReportSynthetic: [
          { label: translate.fields['salesReportSynthetic'].number.external, field: 'number', disabled: this.checkPermissions('salesReportSynthetic', 'number') },
          { label: translate.fields['salesReportSynthetic'].billed.external, field: 'billed', disabled: this.checkPermissions('salesReportSynthetic', 'billed') },
          { label: translate.fields['salesReportSynthetic'].salesTotal.external, field: 'salesTotal', disabled: this.checkPermissions('salesReportSynthetic', 'salesTotal') },
          { label: translate.fields['salesReportSynthetic'].servicesCosts.external, field: 'servicesCosts', disabled: !(checkOS && !this.checkPermissions('salesReportSynthetic', 'servicesCosts')) },
          { label: translate.fields['salesReportSynthetic'].productsCosts.external, field: 'productsCosts', disabled: this.checkPermissions('salesReportSynthetic', 'productsCosts') },
          { label: translate.fields['salesReportSynthetic'].paymentsCosts.external, field: 'paymentsCosts', disabled: this.checkPermissions('salesReportSynthetic', 'paymentsCosts') },
          { label: translate.fields['salesReportSynthetic'].totalCosts.external, field: 'totalCosts', disabled: this.checkPermissions('salesReportSynthetic', 'totalCosts') },
          { label: translate.fields['salesReportSynthetic'].totalTaxes.external, field: 'totalTaxes', disabled: this.checkPermissions('salesReportSynthetic', 'totalTaxes') },
          { label: translate.fields['salesReportSynthetic'].totalUnbilled.external, field: 'totalUnbilled', disabled: this.checkPermissions('salesReportSynthetic', 'totalUnbilled') },
          { label: translate.fields['salesReportSynthetic'].partialRevenue.external, field: 'partialRevenue', disabled: this.checkPermissions('salesReportSynthetic', 'partialRevenue') },
          { label: translate.fields['salesReportSynthetic'].commission.external, field: 'commission', disabled: this.checkPermissions('salesReportSynthetic', 'commission') },
          { label: translate.fields['salesReportSynthetic'].finalRevenue.external, field: 'finalRevenue', disabled: this.checkPermissions('salesReportSynthetic', 'finalRevenue') }
        ],

        salesReportAnalytical: [
          { label: translate.fields['salesReportAnalytical'].serviceCode.external, field: 'serviceCode', disabled: this.checkPermissions('salesReportAnalytical', 'serviceCode') },
          { label: translate.fields['salesReportAnalytical'].customer.external, field: 'customer', disabled: this.checkPermissions('salesReportAnalytical', 'customer') },
          { label: translate.fields['salesReportAnalytical'].collaborator.external, field: 'collaborator', disabled: this.checkPermissions('salesReportAnalytical', 'collaborator') },
          {
            label: translate.fields['salesReportAnalytical'].services.external, field: 'services', sub: [
              { field: 'code', disabled: false },
              { field: 'description', disabled: false },
              { field: 'cost', disabled: !Utilities.isAdmin },
              // { field: 'toalCost', disabled: !Utilities.isAdmin },
              { field: 'value', disabled: false },
              // { field: 'totalValue', disabled: false },
              { field: 'discount', disabled: false },
              { field: 'fee', disabled: false },
              { field: 'paid', disabled: false }
            ], disabled: this.checkPermissions('salesReportAnalytical', 'services')
          },
          {
            label: translate.fields['salesReportAnalytical'].products.external, field: 'products', sub: [
              { field: 'code', disabled: false },
              { field: 'description', disabled: false },
              { field: 'quantity', disabled: false },
              { field: 'cost', disabled: !Utilities.isAdmin },
              { field: 'totalCost', disabled: !Utilities.isAdmin },
              { field: 'price', disabled: false },
              { field: 'totalPrice', disabled: false },
              { field: 'discount', disabled: false },
              { field: 'fee', disabled: false },
              { field: 'paid', disabled: false }
            ], disabled: this.checkPermissions('salesReportAnalytical', 'products')
          },
          {
            label: translate.fields['salesReportAnalytical'].paymentMethods.external, field: 'paymentMethods', sub: [
              { field: 'code', disabled: false },
              { field: 'description', disabled: false },
              { field: 'note', disabled: false },
              { field: 'cost', disabled: !Utilities.isAdmin },
              { field: 'value', disabled: false }
            ], disabled: this.checkPermissions('salesReportAnalytical', 'paymentMethods')
          },
          {
            label: translate.fields['salesReportAnalytical'].taxes.external, field: 'taxes', sub: [
              { field: 'icms', disabled: false },
              { field: 'pis', disabled: false },
              { field: 'cofins', disabled: false },
              { field: 'iss', disabled: false },
              { field: 'total', disabled: false }
            ], disabled: this.checkPermissions('salesReportAnalytical', 'taxes')
          },
          { label: translate.fields['salesReportAnalytical'].discount.external, field: 'discount', disabled: this.checkPermissions('salesReportAnalytical', 'discount') },
          { label: translate.fields['salesReportAnalytical'].fee.external, field: 'fee', disabled: this.checkPermissions('salesReportAnalytical', 'fee') },
          { label: translate.fields['salesReportAnalytical'].additional.external, field: 'additional', disabled: this.checkPermissions('salesReportAnalytical', 'additional') },
          { label: translate.fields['salesReportAnalytical'].saleValue.external, field: 'saleValue', disabled: this.checkPermissions('salesReportAnalytical', 'saleValue') },
          { label: translate.fields['salesReportAnalytical'].unbilledValue.external, field: 'unbilledValue', disabled: this.checkPermissions('salesReportAnalytical', 'unbilledValue') },
          { label: translate.fields['salesReportAnalytical'].servicesCosts.external, field: 'servicesCosts', disabled: !(checkOS && !this.checkPermissions('salesReportAnalytical', 'servicesCosts')) },
          { label: translate.fields['salesReportAnalytical'].productsCosts.external, field: 'productsCosts', disabled: this.checkPermissions('salesReportAnalytical', 'productsCosts') },
          { label: translate.fields['salesReportAnalytical'].paymentsCosts.external, field: 'paymentsCosts', disabled: this.checkPermissions('salesReportAnalytical', 'paymentsCosts') },
          { label: translate.fields['salesReportAnalytical'].totalCosts.external, field: 'totalCosts', disabled: this.checkPermissions('salesReportAnalytical', 'totalCosts') },
          { label: translate.fields['salesReportAnalytical'].totalTaxes.external, field: 'totalTaxes', disabled: this.checkPermissions('salesReportAnalytical', 'totalTaxes') },
          { label: translate.fields['salesReportAnalytical'].partialRevenue.external, field: 'partialRevenue', disabled: this.checkPermissions('salesReportAnalytical', 'partialRevenue') },
          { label: translate.fields['salesReportAnalytical'].finalRevenue.external, field: 'finalRevenue', disabled: this.checkPermissions('salesReportAnalytical', 'finalRevenue') },
          { label: translate.fields['salesReportAnalytical'].commission.external, field: 'commission', disabled: this.checkPermissions('salesReportAnalytical', 'commission') }],

        paymentMethodsSynthetic: [
          { label: translate.fields['paymentMethodsSynthetic'].paymentMethod.external, field: 'paymentMethod', disabled: this.checkPermissions('paymentMethodsSynthetic', 'paymentMethod') },
          { label: translate.fields['paymentMethodsSynthetic'].cost.external, field: 'cost', disabled: this.checkPermissions('paymentMethodsSynthetic', 'cost') },
          { label: translate.fields['paymentMethodsSynthetic'].value.external, field: 'value', disabled: this.checkPermissions('paymentMethodsSynthetic', 'value') },
          { label: translate.fields['paymentMethodsSynthetic'].revenue.external, field: 'revenue', disabled: this.checkPermissions('paymentMethodsSynthetic', 'revenue') }
        ],

        paymentMethodsAnalytical: [
          { label: translate.fields['paymentMethodsAnalytical'].saleCode.external, field: 'saleCode', disabled: this.checkPermissions('paymentMethodsAnalytical', 'saleCode') },
          { label: translate.fields['paymentMethodsAnalytical'].paymentMethod.external, field: 'paymentMethod', disabled: this.checkPermissions('paymentMethodsAnalytical', 'paymentMethod') },
          { label: translate.fields['paymentMethodsAnalytical'].note.external, field: 'note', disabled: this.checkPermissions('paymentMethodsAnalytical', 'note') },
          { label: translate.fields['paymentMethodsAnalytical'].fee.external, field: 'fee', disabled: this.checkPermissions('paymentMethodsAnalytical', 'fee') },
          { label: translate.fields['paymentMethodsAnalytical'].cost.external, field: 'cost', disabled: this.checkPermissions('paymentMethodsAnalytical', 'cost') },
          { label: translate.fields['paymentMethodsAnalytical'].value.external, field: 'value', disabled: this.checkPermissions('paymentMethodsAnalytical', 'value') },
          { label: translate.fields['paymentMethodsAnalytical'].revenue.external, field: 'revenue', disabled: this.checkPermissions('paymentMethodsAnalytical', 'revenue') }
        ]

      };
    }

    if (this.settings.model.id == 'inflows') {

      const translate = this.translate.inflows;

      this.settings['types'] = [];

      const permissionsTypes = [
        { status: this.checkPermissions('inflowsReportSynthetic'), data: { id: 'inflowsReportSynthetic', label: translate.types.inflowsReportSynthetic } },
        { status: this.checkPermissions('inflowsReportAnalytical'), data: { id: 'inflowsReportAnalytical', label: translate.types.inflowsReportAnalytical } },
      ];

      permissionsTypes.forEach((value) => {
        if (value.status) {
          this.settings['types'].push(value.data);
        }
      });

      this.settings.model.filter = {
        lastMonth: Utilities.isAdmin ? true : !!this.checkPermissions(this.settings['types'][0].id, null, "filterLastMonth"),
        weekly: Utilities.isAdmin ? true : !!this.checkPermissions(this.settings['types'][0].id, null, "filterWeek"),
        monthly: Utilities.isAdmin ? true : !!this.checkPermissions(this.settings['types'][0].id, null, "filterMonth"),
        custom: Utilities.isAdmin ? true : !!this.checkPermissions(this.settings['types'][0].id, null, "filterPersonalized")
      };

      this.settings['fields'] = {
        inflowsReportSynthetic: [
          { label: translate.fields['inflowsReportSynthetic'].inputsQuantity.external, field: 'inputsQuantity', disabled: this.checkPermissions('inflowsReportSynthetic', 'inputsQuantity') },
          { label: translate.fields['inflowsReportSynthetic'].total.external, field: 'total', disabled: this.checkPermissions('inflowsReportSynthetic', 'total') }
        ],
        inflowsReportAnalytical: [
          { label: translate.fields['inflowsReportAnalytical'].code.external, field: 'code', disabled: this.checkPermissions('inflowsReportAnalytical', 'code') },
          { label: translate.fields['inflowsReportAnalytical'].code.external, field: 'referenceCode', disabled: this.checkPermissions('inflowsReportAnalytical', 'referenceCode') },
          { label: translate.fields['inflowsReportAnalytical'].collaborator.external, field: 'collaborator', disabled: this.checkPermissions('inflowsReportAnalytical', 'collaborator') },
          { label: translate.fields['inflowsReportAnalytical'].category.external, field: 'category', disabled: this.checkPermissions('inflowsReportAnalytical', 'category') },
          { label: translate.fields['inflowsReportAnalytical'].note.external, field: 'note', disabled: this.checkPermissions('inflowsReportAnalytical', 'note') },
          { label: translate.fields['inflowsReportAnalytical'].value.external, field: 'value', disabled: this.checkPermissions('inflowsReportAnalytical', 'value') }
        ]
      };


    }

    if (this.settings.model.id == 'outflows') {

      const translate = this.translate.outflows;

      this.settings['types'] = [];

      const permissionsTypes = [
        { status: this.checkPermissions('outflowsReportSynthetic'), data: { id: 'outflowsReportSynthetic', label: translate.types.outflowsReportSynthetic } },
        { status: this.checkPermissions('outflowsReportAnalytical'), data: { id: 'outflowsReportAnalytical', label: translate.types.outflowsReportAnalytical } },
      ];

      permissionsTypes.forEach((value) => {
        if (value.status) {
          this.settings['types'].push(value.data);
        }
      });

      this.settings.model.filter = {
        weekly: Utilities.isAdmin ? true : !!this.checkPermissions(this.settings['types'][0].id, null, "filterWeek"),
        monthly: Utilities.isAdmin ? true : !!this.checkPermissions(this.settings['types'][0].id, null, "filterMonth"),
        lastMonth: Utilities.isAdmin ? true : !!this.checkPermissions(this.settings['types'][0].id, null, "filterLastMonth"),
        custom: Utilities.isAdmin ? true : !!this.checkPermissions(this.settings['types'][0].id, null, "filterPersonalized")
      };

      this.settings['fields'] = {
        outflowsReportSynthetic: [
          { label: translate.fields['outflowsReportSynthetic'].outputsQuantity.external, field: 'outputsQuantity', disabled: this.checkPermissions('outflowsReportSynthetic', 'outputsQuantity') },
          { label: translate.fields['outflowsReportSynthetic'].total.external, field: 'total', disabled: this.checkPermissions('outflowsReportSynthetic', 'total') }
        ],
        outflowsReportAnalytical: [
          { label: translate.fields['outflowsReportAnalytical'].code.external, field: 'code', disabled: this.checkPermissions('outflowsReportAnalytical', 'code') },
          { label: translate.fields['outflowsReportAnalytical'].code.external, field: 'referenceCode', disabled: this.checkPermissions('outflowsReportAnalytical', 'referenceCode') },
          { label: translate.fields['outflowsReportAnalytical'].collaborator.external, field: 'collaborator', disabled: this.checkPermissions('outflowsReportAnalytical', 'collaborator') },
          { label: translate.fields['outflowsReportAnalytical'].category.external, field: 'category', disabled: this.checkPermissions('outflowsReportAnalytical', 'category') },
          { label: translate.fields['outflowsReportAnalytical'].note.external, field: 'note', disabled: this.checkPermissions('outflowsReportAnalytical', 'note') },
          { label: translate.fields['outflowsReportAnalytical'].value.external, field: 'value', disabled: this.checkPermissions('outflowsReportAnalytical', 'value') }
        ]
      };
    }

    if (this.settings.model.id == 'afterSales') {

      const translate = this.translate.afterSales;

      this.settings.model.filter = {
        weekly: Utilities.isAdmin ? true : !!this.checkPermissions('default', null, "filterWeek"),
        monthly: Utilities.isAdmin ? true : !!this.checkPermissions('default', null, "filterMonth"),
        lastMonth: Utilities.isAdmin ? true : !!this.checkPermissions("default", null, "filterLastMonth"),
        custom: Utilities.isAdmin ? true : !!this.checkPermissions('default', null, "filterPersonalized")
      };

      this.settings['fields'] = {
        default: [
          { label: translate.fields['default'].saleCode.external, field: 'saleCode', disabled: this.checkPermissions('default', 'saleCode') },
          { label: translate.fields['default'].serviceCode.external, field: 'serviceCode', disabled: this.checkPermissions('default', 'serviceCode') },
          { label: translate.fields['default'].customer.external, field: 'customer', disabled: this.checkPermissions('default', 'customer') },
          { label: translate.fields['default'].collaborator.external, field: 'collaborator', disabled: this.checkPermissions('default', 'collaborator') },
          { label: translate.fields['default'].phone.external, field: 'phone', disabled: this.checkPermissions('default', 'phone') },
          { label: translate.fields['default'].email.external, field: 'email', disabled: this.checkPermissions('default', 'email') },
          {
            label: translate.fields['default'].services.external, field: 'services', sub: [
              { field: 'code', disabled: false },
              { field: 'name', disabled: false },
              { field: 'value', disabled: false }
            ], disabled: this.checkPermissions('default', 'services')
          },
          {
            label: translate.fields['default'].products.external, field: 'products', sub: [
              { field: 'code', disabled: false },
              { field: 'name', disabled: false },
              { field: 'quantity', disabled: false },
              { field: 'value', disabled: false }
            ], disabled: this.checkPermissions('default', 'products')
          },
          {
            label: translate.fields['default'].paymentMethods.external, field: 'paymentMethods', sub: [
              { field: 'description', disabled: false },
              { field: 'value', disabled: false }
            ], disabled: false
          },
          { label: translate.fields['default'].value.external, field: 'value', disabled: this.checkPermissions('default', 'value') }
        ]
      };
    }

    if (this.settings.model.id == 'historic') {

      const translate = this.translate.historic;

      this.settings.model.filter = {
        lastMonth: Utilities.isAdmin ? true : !!this.checkPermissions("default", null, "filterLastMonth"),
        weekly: Utilities.isAdmin ? true : !!this.checkPermissions("default", null, "filterWeek"),
        monthly: Utilities.isAdmin ? true : !!this.checkPermissions("default", null, "filterMonth"),
        custom: Utilities.isAdmin ? true : !!this.checkPermissions("default", null, "filterPersonalized")
      };

      this.settings['fields'] = {
        default: []
      };
    }

    this.formSettings();

    setTimeout(() => { this.loading = false }, 1000);
  }

  // User Interface Actions  

  public onGenerateReport() {

    this.loading = true;

    const model = this.settings.model;
    const filter = this.captureFilters();
    const groupBy = this.settings.model.id == "sales" && this.typeActived == "salesReportSynthetic" || this.settings.model.id == 'resume' ? "paymentDate" : "registerDate";

    const where: any = [
      { field: 'status', operator: '=', value: 'CONCLUDED' },
      { field: 'date', operator: '>=', value: filter.period.start },
      { field: 'date', operator: '<=', value: filter.period.end },
      { field: 'owner', operator: '=', value: filter.store._id }
    ];

    const or: any = [];


    this.settings.model.download = Utilities.isAdmin ? true : !!this.checkPermissions(this.typeActived, null, "downloadReport");

    // Ajuste: A permissão "filterDataPerOperator" deve habilitar o filtro por operador,
    // não aplicá-lo automaticamente. Só filtra quando o usuário escolhe um colaborador.
    if (!Utilities.isAdmin && this.checkPermissions(this.typeActived, null, "filterDataPerOperator")) {
      const coll = filter.collaborator;
      if (coll && coll !== "##all##") {
        const username = (typeof coll === 'object' && coll.username) ? coll.username : coll;
        where.push({ field: 'operator.username', operator: '=', value: username });
      }
    }

    if (Utilities.isAdmin && filter.collaborator && filter.collaborator !== "##all##") {
      where.push({ field: 'operator.username', operator: '=', value: filter.collaborator.username })
    }

    if (model.id == 'resume') {

      this.cashierReportsService.getResume({
        where: where,
        groupBy: groupBy,
        orderBy: { code: 1 },
        data: { type: 'resumeReportSynthetic' }
      }).then((data) => {
        this.launchReport('Resumo de Caixa', model, filter, data);
      });
    }

    if (model.id == 'sales') {

      if (filter.productCategory) {
        where.push(filter.productCategory);
      }

      if (filter.productProvider) {
        where.push(filter.productProvider);
      }


      if (filter.products?.length) {
        // Não inserir o array de produtos diretamente no "where" para evitar
        // corromper as demais clausulas (ex.: período). Usar apenas em "or" e
        // deixar a filtragem detalhada ocorrer no tratamento dos registros.
        filter.products.forEach((cond) => { or.push(cond); });
      }

      // console.log(filter, where, or)
      // console.log(where, or);

      this.cashierReportsService.getSales({
        where: where,
        or: or,
        groupBy: groupBy,
        orderBy: { code: 1 },
        data: { type: this.typeActived }
      }).then((data) => {
        this.launchReport('Vendas', model, filter, data);
      });

    }

    if (model.id == 'inflows') {

      this.cashierReportsService.getInflows({
        where: where,
        orderBy: { code: 1 },
        data: { type: this.typeActived }
      }).then((data) => {
        this.launchReport('Entradas', model, filter, data);
      });
    }

    if (model.id == 'outflows') {

      this.cashierReportsService.getOutflows({
        where: where,
        orderBy: { code: 1 },
        data: { type: this.typeActived }
      }).then((data) => {
        this.launchReport('Saídas', model, filter, data);
      });
    }

    if (model.id == 'afterSales') {

      this.cashierReportsService.getAfterSales({
        where: where,
        orderBy: { code: 1 },
        data: { type: this.typeActived }
      }).then((data) => {
        this.launchReport('Pós-venda', model, filter, data)
      });
    }

    if (model.id == 'historic') {

      this.cashierReportsService.getHistoric({
        where: [
          { field: 'date', operator: '>=', value: filter.period.start },
          { field: 'date', operator: '<=', value: filter.period.end },
          { field: 'owner', operator: '=', value: filter.store._id }
        ],
        orderBy: { code: -1 },
        data: {
          period: filter.period
        }
      }).then((data) => {
        this.launchReport('Histórico', model, filter, data)
      });
    }

  }

  public onTypesChange(id: string) {

    this.settings.model.filter = {
      weekly: Utilities.isAdmin ? true : !!this.checkPermissions(id, null, "filterWeek"),
      monthly: Utilities.isAdmin ? true : !!this.checkPermissions(id, null, "filterMonth"),
      lastMonth: Utilities.isAdmin ? true : !!this.checkPermissions(id, null, "filterLastMonth"),
      custom: Utilities.isAdmin ? true : !!this.checkPermissions(id, null, "filterPersonalized"),
      perCategory: Utilities.isAdmin ? true : !!this.checkPermissions(id, null, "filterPerCategory"),
      perProducts: Utilities.isAdmin ? true : !!this.checkPermissions(id, null, "filterPerProducts"),
      perProvider: Utilities.isAdmin ? true : !!this.checkPermissions(id, null, "filterPerProvider")
    };

    this.typeActived = id;
    this.toggleFields();
  }

  public onGetCollaborators(store: string = null) {

    const timer = setInterval(() => {

      if (this.formFilters) {

        clearInterval(timer);

        store = store ?? this.formFilters.value.store;

        this.collaboratorsService.query([
          { field: "owner", "operator": "=", value: store }
        ], false, false, false, false).then((res) => {
          this.collaborators = res;
          this.formFilters.get("collaborator").setValue("##all##");
        });
      }
    })
  }

  public onGetProductsCategories() {
    const timer = setInterval(() => {
      if (this.formFilters) {

        clearInterval(timer);

        this.productsCategoriesService.getCategories("CashierReportsComponent", (res) => {
          this.productsCategoriesService.removeListeners("records", 'CashierReportsComponent');
          this.productCategories = res;
          this.formFilters.get("productCategory").setValue("##all##");
        });
      }
    })
  }

  public onGetProductsProviders() {
    const timer = setInterval(() => {
      if (this.formFilters) {

        clearInterval(timer);

        this.providersService.getProviders("CashierReportsComponent", (res) => {
          this.providersService.removeListeners("records", 'CashierReportsComponent');
          this.productProviders = res;
          this.formFilters.get("productProvider").setValue("##all##");
        });
      }
    })
  }

  // Event Listeners

  public onLayerResponse(event: any) {

    if (event.instance) {
      this.layerComponent = event.instance;
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
      collaborator: ["##all##"],
      productCategory: ["##all##"],
      productProvider: ["##all##"],
      products: [""],
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

      if (type && field) {
        return (this.settings.permissions && this.settings.permissions[type] ? (this.settings.permissions[type].fields.indexOf(field) == -1) : false);
      } else if (Utilities.isAdmin) {
        return true;
      } else {
        return (this.settings.permissions && this.settings.permissions[type] ? !!(this.settings.permissions[type]) : false);
      }

    } else {

      if (Utilities.isAdmin) {
        return false;
      }

      return (this.settings.permissions && this.settings.permissions[type] && this.settings.permissions[type].actions ? this.settings.permissions[type].actions.includes(action) : false);
    }

  }

  private launchReport(title: string, model: any, filter: any, data: any) {

    if (filter.productReport?.category) {
      const cat = this.productCategories.filter((cat) => {
        return filter.productReport?.category == cat.code;
      })[0];

      if (cat) {
        filter.productReport.category = `${filter.productReport?.category} - ${cat.name}`;
      }
    }

    this.layerComponent.onOpen({
      id: model.id,
      title: title,
      store: filter.store,
      download: this.settings.model.download,
      period: {
        start: filter.period.start,
        end: filter.period.end
      },
      productReport: filter.productReport,
      type: this.typeActived,
      fields: filter.fields,
      data: data,
      date: DateTime.formatDate(DateTime.getDateObject().toISOString(), 'string')
    });

    setTimeout(() => this.loading = false, 500);
  }

  private captureFilters() {

    const filter = this.formFilters.value;

    if (this.typeActived == "salesPerUserSynthetic" && filter.collaborator != "##all##" || this.typeActived == "salesPerUserAnalytical" && filter.collaborator != "##all##") {
      filter.collaborator = { username: filter.collaborator };
    }

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

    filter.productReport = {}

    if (filter.productCategory != "##all##") {
      const category = filter.productCategory[0] == "@" ? filter.productCategory : Utilities.prefixCode(parseInt(filter.productCategory));
      filter.productCategory = { field: "products.category.code", operator: "=", value: category };
      filter.productReport.category = category;
    } else {
      delete filter.productCategory;
    }

    if (filter.productProvider != "##all##") {
      const provider = Utilities.prefixCode(parseInt(filter.productProvider));
      filter.productProvider = { field: "products.provider.code", operator: "=", value: provider };
      filter.productReport.provider = provider;
    } else {
      delete filter.productProvider;
    }

    if (filter.products.trim() && !isNaN(parseInt(filter.products.split(";")[0]))) {

      const codes = filter.products.split(";");
      filter.products = [];

      codes.forEach((code) => {
        code = Utilities.prefixCode(parseInt(code));
        filter.products.push({ field: "products.code", operator: "=", value: code });
      })

      filter.productReport.products = filter.products;
    } else {
      delete filter.product;
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
