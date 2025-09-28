import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';

// Services
import { FinancialReportsService } from './financial.service';

// Translate
import { ReportsFinancesTranslate } from './financial.translate';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { DateTime } from '@shared/utilities/dateTime';
import { BillsToPayCategoriesService } from '@pages/registers/_aggregates/financial/bills-to-pay-categories/bills-to-pay-categories.service';
import { BillsToReceiveCategoriesService } from '@pages/registers/_aggregates/financial/bills-to-receive-categories/bills-to-receive-categories.service';
import { CollaboratorsService } from '@pages/registers/collaborators/collaborators.service';

@Component({
  selector: 'financial-report',
  templateUrl: './financial.component.html',
  styleUrls: ['./financial.component.scss']
})
export class FinancialReportsComponent implements OnInit {

  @Input() settings: any = {};
  @Output() callback: EventEmitter<any> = new EventEmitter();

  public translate = ReportsFinancesTranslate.get();

  public loading: boolean = true;
  public typeActived: string = '';

  public formFilters: FormGroup;
  public formControls: any;

  public billsToPayCategories: any[] = [];
  public billsToReceiveCategories: any[] = [];
  public collaborators: any[] = []; // 🎯 ADICIONADO: Array para armazenar colaboradores
  public isMatrix = Utilities.isMatrix;

  private layerComponent: any;


  constructor(
    private formBuilder: FormBuilder,
    private financialReportsService: FinancialReportsService,
    private billsToPayCategoriesService: BillsToPayCategoriesService,
    private billsToReceiveCategoriesService: BillsToReceiveCategoriesService,
    private collaboratorsService: CollaboratorsService, // Já estava importado
  ) { }

  public ngOnInit() {
    console.log('🔍 FinancialReportsComponent iniciado');
    console.log('🔍 Settings:', this.settings);

    this.callback.emit({ instance: this });
  }

  // 🎯 NOVO MÉTODO: Busca colaboradores para o filtro
  public onGetCollaborators(store: string = null) {
    if (!this.formFilters) {
      return;
    }

    store = store ?? this.formFilters.value.store;

    // Limpa a lista antes de buscar novos
    this.collaborators = [];

    this.collaboratorsService.query([
      { field: "owner", "operator": "=", value: store },
      { field: "allowAccess", "operator": "=", value: true }
    ], false, false, false, false).then((res) => {
      this.collaborators = res;

      // Mantém o colaborador selecionado se ainda existir na lista
      const currentCollaborator = this.formFilters.get("collaborator").value;
      const collaboratorExists = res.some(c => c.code === currentCollaborator);
      if (!collaboratorExists) {
        this.formFilters.get("collaborator").setValue("##all##");
      }
    }).catch((error) => {
      console.error('Erro ao buscar colaboradores:', error);
      this.collaborators = [];
    });
  }

  // Initialize Method
  public bootstrap() {



    if (this.settings.model.id == 'cashFlow') {

      const translate = this.translate.cashFlow;

      this.settings.model.filter = {
        weekly: Utilities.isAdmin ? true : !!this.checkPermissions('default', null, "filterWeek"),
        monthly: Utilities.isAdmin ? true : !!this.checkPermissions('default', null, "filterMonth"),
        lastMonth: Utilities.isAdmin ? true : !!this.checkPermissions('default', null, "filterLastMonth"),
        custom: Utilities.isAdmin ? true : !!this.checkPermissions('default', null, "filterPersonalized")
      };

      this.settings['fields'] = {
        default: [
          { label: translate.fields['default'].cashierResult.external, field: 'cashierResult', disabled: this.checkPermissions('default', 'cashierResult') },
          {
            label: translate.fields['default'].costs.external,
            field: 'costs',
            disabled: this.checkPermissions('default', 'costs'),
            sub: [
              { label: translate.fields['default'].costs.internal.sub.products, field: 'products', disabled: this.checkPermissions('default', 'costs/products') },
              { label: translate.fields['default'].costs.internal.sub.services, field: 'services', disabled: this.checkPermissions('default', 'costs/services') },
              { label: translate.fields['default'].costs.internal.sub.payments, field: 'payments', disabled: this.checkPermissions('default', 'costs/payments') },
              { label: translate.fields['default'].costs.internal.sub.total, field: 'total', disabled: this.checkPermissions('default', 'costs/total') }
            ]
          },
          { label: translate.fields['default'].billing.external, field: 'billing', disabled: this.checkPermissions('default', 'billing') },
          { label: translate.fields['default'].grossProfit.external, field: 'grossProfit', disabled: this.checkPermissions('default', 'grossProfit') }
        ]
      };
    }

    if (this.settings.model.id == 'billsToPay') {
      // Define os tipos disponíveis caso não venham nas configurações
      if (!this.settings.types) {
        this.settings.types = [
          { id: 'paidAccounts', label: this.translate.billsToPay.types.paidAccounts },
          { id: 'pendingAccounts', label: this.translate.billsToPay.types.pendingAccounts },
          { id: 'overdueAccounts', label: this.translate.billsToPay.types.overdueAccounts },
          { id: 'canceledAccounts', label: this.translate.billsToPay.types.canceledAccounts }
        ];
      }

      const translate = this.translate.billsToPay;

      this.settings.model.filter = {
        weekly: Utilities.isAdmin ? true : !!this.checkPermissions(this.settings['types'][0].id, null, "filterWeek"),
        monthly: Utilities.isAdmin ? true : !!this.checkPermissions(this.settings['types'][0].id, null, "filterMonth"),
        lastMonth: Utilities.isAdmin ? true : !!this.checkPermissions(this.settings['types'][0].id, null, "filterLastMonth"),
        custom: Utilities.isAdmin ? true : !!this.checkPermissions(this.settings['types'][0].id, null, "filterPersonalized")
      };

      this.settings['fields'] = {
        paidAccounts: [
          { label: translate.fields['paidAccounts'].referenceCode.external, field: 'referenceCode', disabled: this.checkPermissions('paidAccounts', 'referenceCode') },
          { label: translate.fields['paidAccounts'].beneficiary.external, field: 'beneficiary', disabled: this.checkPermissions('paidAccounts', 'beneficiary') },
          { label: translate.fields['paidAccounts'].category.external, field: 'category', disabled: this.checkPermissions('paidAccounts', 'category') },
          { label: translate.fields['paidAccounts'].registerDate.external, field: 'registerDate', disabled: this.checkPermissions('paidAccounts', 'registerDate') },
          { label: (translate.fields['paidAccounts'].paymentDate || translate.fields['paidAccounts'].dischargeDate).external, field: 'paymentDate', disabled: this.checkPermissions('paidAccounts', 'paymentDate') },
          { label: translate.fields['paidAccounts'].installmentsState.external, field: 'installmentsState', disabled: this.checkPermissions('paidAccounts', 'installmentsState') },
          { label: translate.fields['paidAccounts'].accountValue.external, field: 'accountValue', disabled: this.checkPermissions('paidAccounts', 'accountValue') }
        ],
        pendingAccounts: [
          { label: translate.fields['pendingAccounts'].referenceCode.external, field: 'referenceCode', disabled: this.checkPermissions('pendingAccounts', 'referenceCode') },
          { label: translate.fields['pendingAccounts'].beneficiary.external, field: 'beneficiary', disabled: this.checkPermissions('pendingAccounts', 'beneficiary') },
          { label: translate.fields['pendingAccounts'].category.external, field: 'category', disabled: this.checkPermissions('pendingAccounts', 'category') },
          { label: translate.fields['pendingAccounts'].registerDate.external, field: 'registerDate', disabled: this.checkPermissions('pendingAccounts', 'registerDate') },
          { label: translate.fields['pendingAccounts'].dueDate.external, field: 'dueDate', disabled: this.checkPermissions('pendingAccounts', 'dueDate') },
          { label: translate.fields['pendingAccounts'].installmentsState.external, field: 'installmentsState', disabled: this.checkPermissions('pendingAccounts', 'installmentsState') },
          { label: translate.fields['pendingAccounts'].installmentValue.external, field: 'installmentValue', disabled: this.checkPermissions('pendingAccounts', 'installmentValue') },
          { label: translate.fields['pendingAccounts'].amountPaid.external, field: 'amountPaid', disabled: this.checkPermissions('pendingAccounts', 'amountPaid') },
          { label: translate.fields['pendingAccounts'].pendingAmount.external, field: 'pendingAmount', disabled: this.checkPermissions('pendingAccounts', 'pendingAmount') },
          { label: translate.fields['pendingAccounts'].accountValue.external, field: 'accountValue', disabled: this.checkPermissions('pendingAccounts', 'accountValue') }
        ],
        overdueAccounts: [
          { label: translate.fields['overdueAccounts'].referenceCode.external, field: 'referenceCode', disabled: this.checkPermissions('overdueAccounts', 'referenceCode') },
          { label: translate.fields['overdueAccounts'].beneficiary.external, field: 'beneficiary', disabled: this.checkPermissions('overdueAccounts', 'beneficiary') },
          { label: translate.fields['overdueAccounts'].category.external, field: 'category', disabled: this.checkPermissions('overdueAccounts', 'category') },
          { label: translate.fields['overdueAccounts'].registerDate.external, field: 'registerDate', disabled: this.checkPermissions('overdueAccounts', 'registerDate') },
          { label: translate.fields['overdueAccounts'].dueDate.external, field: 'dueDate', disabled: this.checkPermissions('overdueAccounts', 'dueDate') },
          { label: translate.fields['overdueAccounts'].daysOverdue.external, field: 'daysOverdue', disabled: this.checkPermissions('overdueAccounts', 'daysOverdue') },
          { label: translate.fields['overdueAccounts'].installmentsState.external, field: 'installmentsState', disabled: this.checkPermissions('overdueAccounts', 'installmentsState') },
          { label: translate.fields['overdueAccounts'].installmentValue.external, field: 'installmentValue', disabled: this.checkPermissions('overdueAccounts', 'installmentValue') },
          { label: translate.fields['overdueAccounts'].amountPaid.external, field: 'amountPaid', disabled: this.checkPermissions('overdueAccounts', 'amountPaid') },
          { label: translate.fields['overdueAccounts'].pendingAmount.external, field: 'pendingAmount', disabled: this.checkPermissions('overdueAccounts', 'pendingAmount') },
          { label: translate.fields['overdueAccounts'].accountValue.external, field: 'accountValue', disabled: this.checkPermissions('overdueAccounts', 'accountValue') }
        ],
        canceledAccounts: [
          { label: translate.fields['canceledAccounts'].referenceCode.external, field: 'referenceCode', disabled: this.checkPermissions('canceledAccounts', 'referenceCode') },
          { label: translate.fields['canceledAccounts'].beneficiary.external, field: 'beneficiary', disabled: this.checkPermissions('canceledAccounts', 'beneficiary') },
          { label: translate.fields['canceledAccounts'].category.external, field: 'category', disabled: this.checkPermissions('canceledAccounts', 'category') },
          { label: translate.fields['canceledAccounts'].registerDate.external, field: 'registerDate', disabled: this.checkPermissions('canceledAccounts', 'registerDate') },
          { label: translate.fields['canceledAccounts'].installmentsState.external, field: 'installmentsState', disabled: this.checkPermissions('canceledAccounts', 'installmentsState') },
          { label: translate.fields['canceledAccounts'].accountValue.external, field: 'accountValue', disabled: this.checkPermissions('canceledAccounts', 'accountValue') }
        ]
      };
    }

    if (this.settings.model.id == 'billsToReceive') {
      // Garante que os tipos estejam definidos para o relatório
      if (!this.settings.types) {
        this.settings.types = [
          { id: 'receivedAccounts', label: this.translate.billsToReceive.types.receivedAccounts },
          { id: 'pendingAccounts', label: this.translate.billsToReceive.types.pendingAccounts },
          { id: 'overdueAccounts', label: this.translate.billsToReceive.types.overdueAccounts },
          { id: 'canceledAccounts', label: this.translate.billsToReceive.types.canceledAccounts }
        ];
      }

      const translate = this.translate.billsToReceive;

      this.settings.model.filter = {
        weekly: Utilities.isAdmin ? true : !!this.checkPermissions(this.settings['types'][0].id, null, "filterWeek"),
        monthly: Utilities.isAdmin ? true : !!this.checkPermissions(this.settings['types'][0].id, null, "filterMonth"),
        lastMonth: Utilities.isAdmin ? true : !!this.checkPermissions(this.settings['types'][0].id, null, "filterLastMonth"),
        custom: Utilities.isAdmin ? true : !!this.checkPermissions(this.settings['types'][0].id, null, "filterPersonalized")
      };

      this.settings['fields'] = {
        receivedAccounts: [
          { label: translate.fields['receivedAccounts'].referenceCode.external, field: 'referenceCode', disabled: this.checkPermissions('receivedAccounts', 'referenceCode') },
          { label: translate.fields['receivedAccounts'].debtor.external, field: 'debtor', disabled: this.checkPermissions('receivedAccounts', 'debtor') },
          { label: translate.fields['receivedAccounts'].category.external, field: 'category', disabled: this.checkPermissions('receivedAccounts', 'category') },
          { label: translate.fields['receivedAccounts'].registerDate.external, field: 'registerDate', disabled: this.checkPermissions('receivedAccounts', 'registerDate') },
          { label: (translate.fields['receivedAccounts'].paymentDate || translate.fields['receivedAccounts'].dischargeDate).external, field: 'paymentDate', disabled: this.checkPermissions('receivedAccounts', 'paymentDate') },
          { label: translate.fields['receivedAccounts'].installmentsState.external, field: 'installmentsState', disabled: this.checkPermissions('receivedAccounts', 'installmentsState') },
          { label: translate.fields['receivedAccounts'].accountValue.external, field: 'accountValue', disabled: this.checkPermissions('receivedAccounts', 'accountValue') }
        ],
        pendingAccounts: [
          { label: translate.fields['pendingAccounts'].referenceCode.external, field: 'referenceCode', disabled: this.checkPermissions('pendingAccounts', 'referenceCode') },
          { label: translate.fields['pendingAccounts'].debtor.external, field: 'debtor', disabled: this.checkPermissions('pendingAccounts', 'debtor') },
          { label: translate.fields['pendingAccounts'].category.external, field: 'category', disabled: this.checkPermissions('pendingAccounts', 'category') },
          { label: translate.fields['pendingAccounts'].registerDate.external, field: 'registerDate', disabled: this.checkPermissions('pendingAccounts', 'registerDate') },
          { label: translate.fields['pendingAccounts'].dueDate.external, field: 'dueDate', disabled: this.checkPermissions('pendingAccounts', 'dueDate') },
          { label: translate.fields['pendingAccounts'].installmentsState.external, field: 'installmentsState', disabled: this.checkPermissions('pendingAccounts', 'installmentsState') },
          { label: translate.fields['pendingAccounts'].installmentValue.external, field: 'installmentValue', disabled: this.checkPermissions('pendingAccounts', 'installmentValue') },
          { label: translate.fields['pendingAccounts'].amountReceived.external, field: 'amountReceived', disabled: this.checkPermissions('pendingAccounts', 'amountReceived') },
          { label: translate.fields['pendingAccounts'].pendingAmount.external, field: 'pendingAmount', disabled: this.checkPermissions('pendingAccounts', 'pendingAmount') },
          { label: translate.fields['pendingAccounts'].accountValue.external, field: 'accountValue', disabled: this.checkPermissions('pendingAccounts', 'accountValue') }
        ],
        overdueAccounts: [
          { label: translate.fields['overdueAccounts'].referenceCode.external, field: 'referenceCode', disabled: this.checkPermissions('overdueAccounts', 'referenceCode') },
          { label: translate.fields['overdueAccounts'].debtor.external, field: 'debtor', disabled: this.checkPermissions('overdueAccounts', 'debtor') },
          { label: translate.fields['overdueAccounts'].category.external, field: 'category', disabled: this.checkPermissions('overdueAccounts', 'category') },
          { label: translate.fields['overdueAccounts'].registerDate.external, field: 'registerDate', disabled: this.checkPermissions('overdueAccounts', 'registerDate') },
          { label: translate.fields['overdueAccounts'].dueDate.external, field: 'dueDate', disabled: this.checkPermissions('overdueAccounts', 'dueDate') },
          { label: translate.fields['overdueAccounts'].daysOverdue.external, field: 'daysOverdue', disabled: this.checkPermissions('overdueAccounts', 'daysOverdue') },
          { label: translate.fields['overdueAccounts'].installmentsState.external, field: 'installmentsState', disabled: this.checkPermissions('overdueAccounts', 'installmentsState') },
          { label: translate.fields['overdueAccounts'].installmentValue.external, field: 'installmentValue', disabled: this.checkPermissions('overdueAccounts', 'installmentValue') },
          { label: translate.fields['overdueAccounts'].amountReceived.external, field: 'amountReceived', disabled: this.checkPermissions('overdueAccounts', 'amountReceived') },
          { label: translate.fields['overdueAccounts'].pendingAmount.external, field: 'pendingAmount', disabled: this.checkPermissions('overdueAccounts', 'pendingAmount') },
          { label: translate.fields['overdueAccounts'].accountValue.external, field: 'accountValue', disabled: this.checkPermissions('overdueAccounts', 'accountValue') }
        ],
        canceledAccounts: [
          { label: translate.fields['canceledAccounts'].referenceCode.external, field: 'referenceCode', disabled: this.checkPermissions('canceledAccounts', 'referenceCode') },
          { label: translate.fields['canceledAccounts'].debtor.external, field: 'debtor', disabled: this.checkPermissions('canceledAccounts', 'debtor') },
          { label: translate.fields['canceledAccounts'].category.external, field: 'category', disabled: this.checkPermissions('canceledAccounts', 'category') },
          { label: translate.fields['canceledAccounts'].registerDate.external, field: 'registerDate', disabled: this.checkPermissions('canceledAccounts', 'registerDate') },
          { label: translate.fields['canceledAccounts'].dueDate.external, field: 'dueDate', disabled: this.checkPermissions('canceledAccounts', 'dueDate') },
          { label: translate.fields['canceledAccounts'].installmentsState.external, field: 'installmentsState', disabled: this.checkPermissions('canceledAccounts', 'installmentsState') },
          { label: translate.fields['canceledAccounts'].installmentValue.external, field: 'installmentValue', disabled: this.checkPermissions('canceledAccounts', 'installmentValue') },
          { label: translate.fields['canceledAccounts'].amountReceived.external, field: 'amountReceived', disabled: this.checkPermissions('canceledAccounts', 'amountReceived') },
          { label: translate.fields['canceledAccounts'].pendingAmount.external, field: 'pendingAmount', disabled: this.checkPermissions('canceledAccounts', 'pendingAmount') },
          { label: translate.fields['canceledAccounts'].accountValue.external, field: 'accountValue', disabled: this.checkPermissions('canceledAccounts', 'accountValue') }
        ]
      };
    }

    if (this.settings.model.id == 'bankTransactions') {

      this.settings.model.filter = {
        weekly: Utilities.isAdmin ? true : !!this.checkPermissions('default', null, "filterWeek"),
        monthly: Utilities.isAdmin ? true : !!this.checkPermissions('default', null, "filterMonth"),
        lastMonth: Utilities.isAdmin ? true : !!this.checkPermissions('default', null, "filterLastMonth"),
        custom: Utilities.isAdmin ? true : !!this.checkPermissions('default', null, "filterPersonalized")
      };

      this.settings['fields'] = {
        default: []
      };
    }

    if (this.settings.model.id == 'commissions') {

      const translate = this.translate.commissions;

      // Configurar filtros disponíveis
      this.settings.model.filter = {
        weekly: Utilities.isAdmin ? true : !!this.checkPermissions('default', null, "filterWeek"),
        monthly: Utilities.isAdmin ? true : !!this.checkPermissions('default', null, "filterMonth"),
        lastMonth: Utilities.isAdmin ? true : !!this.checkPermissions('default', null, "filterLastMonth"),
        custom: Utilities.isAdmin ? true : !!this.checkPermissions('default', null, "filterPersonalized"),
        perCollaborator: Utilities.isAdmin ? true : !!this.checkPermissions('default', null, "filterPerCollaborator")
      };

      // Tipos disponíveis para comissões (necessário para o layer escolher o template correto)
      this.settings['types'] = [
        { id: 'commissionReportSynthetic', label: translate.types.commissionReportSynthetic },
        { id: 'commissionReportAnalytical', label: translate.types.commissionReportAnalytical }
      ];

      this.settings['fields'] = {
        commissionReportSynthetic: [
          { label: translate.fields['commissionReportSynthetic'].collaborator.external, field: 'collaborator', disabled: this.checkPermissions('commissionReportSynthetic', 'collaborator') },
          { label: 'Venda', field: 'salesTotal', disabled: false },
          { label: translate.fields['commissionReportSynthetic'].commissionValue.external, field: 'commissionValue', disabled: this.checkPermissions('commissionReportSynthetic', 'commissionValue') }
        ],
        commissionReportAnalytical: [
          { label: translate.fields['commissionReportAnalytical'].date.external, field: 'date', disabled: this.checkPermissions('commissionReportAnalytical', 'date') },
          { label: translate.fields['commissionReportAnalytical'].saleCode.external, field: 'saleCode', disabled: this.checkPermissions('commissionReportAnalytical', 'saleCode') },
          { label: translate.fields['commissionReportAnalytical'].collaborator.external, field: 'collaborator', disabled: this.checkPermissions('commissionReportAnalytical', 'collaborator') },
          { label: translate.fields['commissionReportAnalytical'].customer.external, field: 'customer', disabled: this.checkPermissions('commissionReportAnalytical', 'customer') },
          { label: translate.fields['commissionReportAnalytical'].saleValue.external, field: 'saleValue', disabled: this.checkPermissions('commissionReportAnalytical', 'saleValue') },
          { label: translate.fields['commissionReportAnalytical'].commissionPercentage.external, field: 'commissionPercentage', disabled: this.checkPermissions('commissionReportAnalytical', 'commissionPercentage') },
          { label: translate.fields['commissionReportAnalytical'].commissionValue.external, field: 'commissionValue', disabled: this.checkPermissions('commissionReportAnalytical', 'commissionValue') },
          { label: (translate.fields['commissionReportAnalytical'].paymentDate || translate.fields['commissionReportAnalytical'].date).external, field: 'paymentDate', disabled: this.checkPermissions('commissionReportAnalytical', 'paymentDate') },
          { label: translate.fields['commissionReportAnalytical'].observation.external, field: 'observation', disabled: this.checkPermissions('commissionReportAnalytical', 'observation') }
        ]
      };
    }

    this.formSettings();
    // Após montar o formulário, carrega as categorias necessárias
    this.onGetBillsToPayCategories();
    this.onGetBillsToReceiveCategories();
    if (this.settings.model.id == 'commissions') {
      this.onGetCollaborators();
    }

    setTimeout(() => { this.loading = false }, 1000);
  }

  // User Interface Actions  

  public onTypesChange(id: string) {

    this.settings.model.filter = {
      weekly: Utilities.isAdmin ? true : !!this.checkPermissions(id, null, "filterWeek"),
      monthly: Utilities.isAdmin ? true : !!this.checkPermissions(id, null, "filterMonth"),
      lastMonth: Utilities.isAdmin ? true : !!this.checkPermissions(id, null, "filterLastMonth"),
      custom: Utilities.isAdmin ? true : !!this.checkPermissions(id, null, "filterPersonalized"),
      // 🎯 MANTÉM O FILTRO DE COLABORADOR AO MUDAR DE TIPO
      perCollaborator: Utilities.isAdmin ? true : !!this.checkPermissions(id, null, "filterPerCollaborator")
    };

    this.typeActived = id;
    this.toggleFields();
  }

  public onGenerateReport() {

    this.loading = true;

    const model = this.settings.model;
    const filter = this.captureFilters();

    this.settings.model.download = Utilities.isAdmin ? true : !!this.checkPermissions(this.typeActived, null, "downloadReport");

    if (model.id == 'cashFlow') {

      this.financialReportsService.getCashFlow({
        data: {
          period: {
            start: filter.period.start,
            end: filter.period.end
          },
          store: {
            id: filter.store._id
          }
        }
      }).then((data) => {
        this.launchReport('Fluxo de Caixa', model, filter, data);
      });
    }

    if (model.id == 'billsToPay') {

      if (filter.filterDateType == "installments.dueDate") {
        filter.period.start = filter.period.start.split(" ")[0];
        filter.period.end = filter.period.end.split(" ")[0];
      }

      const where: any[] = [
        { field: filter.filterDateType || 'registerDate', operator: '>=', value: filter.period.start },
        { field: filter.filterDateType || 'registerDate', operator: '<=', value: filter.period.end },
        { field: 'owner', operator: '=', value: filter.store._id }
      ];

      if (filter.billCategory) {
        where.push(filter.billCategory);
      }

      this.financialReportsService.getBillsToPay({
        where: where,
        orderBy: { code: 1 },
        data: { type: this.typeActived }
      }).then((data) => {
        this.launchReport('Contas à Pagar', model, filter, data);
      });
    }

    if (model.id == 'billsToReceive') {
      // LOG PARA VER O TIPO
      console.log('🎯 Tipo ativo:', this.typeActived);

      if (filter.filterDateType == "installments.dueDate") {
        filter.period.start = filter.period.start.split(" ")[0];
        filter.period.end = filter.period.end.split(" ")[0];
      }

      const where: any[] = [
        { field: filter.filterDateType || 'registerDate', operator: '>=', value: filter.period.start },
        { field: filter.filterDateType || 'registerDate', operator: '<=', value: filter.period.end },
        { field: 'owner', operator: '=', value: filter.store._id }
      ];

      if (filter.billCategory) {
        where.push(filter.billCategory);
      }

      this.financialReportsService.getBillsToReceive({
        where: where,
        orderBy: { code: 1 },
        data: { type: this.typeActived }
      }).then((data) => {
        console.log('✅ Dados recebidos do serviço:', data);
        this.launchReport('Contas à Receber', model, filter, data);
      }).catch((error) => {
        console.error('Erro ao gerar relatório de contas a receber:', error);
        this.loading = false;
      });
    }

    if (model.id == 'bankTransactions') {

      this.financialReportsService.getBankTransactions({
        where: [
          { field: 'registerDate', operator: '>=', value: filter.period.start },
          { field: 'registerDate', operator: '<=', value: filter.period.end },
          { field: 'owner', operator: '=', value: filter.store._id }
        ],
        orderBy: { code: 1 },
        data: { type: this.typeActived }
      }).then((data) => {
        this.launchReport('Transações Bancárias', model, filter, data);
      });
    }

    if (model.id == 'commissions') {
      /**
       * NOTE:
       * Alguns registros de venda não possuem o campo `paymentDate` definido,
       * resultando em consultas vazias. Para garantir que todos os registros
       * sejam recuperados, utilizamos `registerDate` como campo padrão de
       * filtragem.
       */

      const where: any[] = [
        { field: 'registerDate', operator: '>=', value: filter.period.start },
        { field: 'registerDate', operator: '<=', value: filter.period.end },
        { field: 'owner', operator: '=', value: filter.store._id }
      ];

      this.financialReportsService.getCommissions({
        where: where,
        orderBy: { code: 1 },
        data: {
          type: this.typeActived,
          collaborator: (() => {
            const c = this.formFilters.get('collaborator')?.value;
            if (!c || c === '##all##') { return null; }
            const selected = this.collaborators.find(x => x.code == c || x.username == c);
            return selected ? { username: selected.username, code: selected.code, name: selected.name } : null;
          })()
        }
      }).then((data) => {
        // 🔍 DEBUG TEMPORÁRIO
        console.log('=== DEBUG COMISSÕES ===');
        console.log('Tipo de relatório:', this.typeActived);
        console.log('Dados originais:', JSON.parse(JSON.stringify(data)));
        console.log('Colaboradores disponíveis:', this.collaborators.map(c => ({ code: c.code, name: c.name, username: c.username })));

        // 🎯 CORREÇÃO: Substitui usernames pelos nomes completos
        if (data && data.records && this.collaborators.length > 0) {
          data.records.forEach(record => {
            // Procura o colaborador pelo username no registro
            const collaborator = this.collaborators.find(c =>
              c.username === record.collaborator ||
              c.name === record.collaborator
            );
            if (collaborator && collaborator.name) {
              record.collaborator = collaborator.name;
            }
          });

          console.log('Dados após conversão:', data);
        }
        console.log('=== FIM DEBUG ===');

        this.launchReport('Comissões', model, filter, data);
      }).catch((error) => {
        console.error('Erro ao gerar relatório de comissões:', error);
        this.loading = false;
      });
    }

  }

  // Event Listeners

  public onLayerResponse(event: any) {
    console.log('🎯 onLayerResponse chamado:', event);

    if (event && event.instance) {
      this.layerComponent = event.instance;
      console.log('✅ layerComponent definido:', this.layerComponent);
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
      billCategory: ["##all##"],
      filterDateType: ["registerDate"]
    });

    // 🎯 Campo de colaborador para relatório de comissões
    if (this.settings.model.id == 'commissions') {
      this.formFilters.addControl('collaborator', new FormControl("##all##"));
    }

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

  public onGetBillsToPayCategories() {
    const timer = setInterval(() => {
      if (this.formFilters) {

        clearInterval(timer);

        this.billsToPayCategoriesService.getCategories("FinancialReportsComponent", (res) => {
          this.billsToPayCategoriesService.removeListeners("records", 'FinancialReportsComponent');
          this.billsToPayCategories = res;
          this.formFilters.get("billCategory").setValue("##all##");
        });
      }
    });
  }

  public onGetBillsToReceiveCategories() {
    const timer = setInterval(() => {
      if (this.formFilters) {

        clearInterval(timer);

        this.billsToReceiveCategoriesService.getCategories("FinancialReportsComponent", (res) => {
          this.billsToReceiveCategoriesService.removeListeners("records", 'FinancialReportsComponent');
          this.billsToReceiveCategories = res;
          this.formFilters.get("billCategory").setValue("##all##");
        });
      }
    });
  }

  // Utility Methods

  private checkPermissions(type: string, field: string, action = null) {

    if (!action) {
      return (this.settings.permissions && this.settings.permissions[type] ? (this.settings.permissions[type].fields.indexOf(field) == -1) : false);
    } else {
      return (this.settings.permissions && this.settings.permissions[type] && this.settings.permissions[type].actions ? (this.settings.permissions[type].actions.indexOf(action) == -1) : false);
    }
  }

  private launchReport(title: string, model: any, filter: any, data: any) {
    console.log('🚀 launchReport chamado com:', {
      title,
      model,
      filter,
      data,
      layerComponent: this.layerComponent
    });

    // Verificar se o layerComponent existe
    if (!this.layerComponent) {
      console.error('❌ layerComponent não está definido!');
      this.loading = false;
      return;
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
      type: this.typeActived,
      fields: filter.fields,
      data: data,
      date: DateTime.formatDate(DateTime.getDateObject().toISOString(), 'string')
    });

    console.log('✅ layerComponent.onOpen chamado');

    setTimeout(() => {
      this.loading = false;
      console.log('✅ Loading desativado');
    }, 500);
  }

  private captureFilters() {

    const filter = this.formFilters.value;

    filter.store = (() => {
      const store = (this.isMatrix ?
        this.settings.stores.filter((item) => {
          return item._id == filter.store;
        })[0] : this.settings.stores[0]);

      // 🎯 CORREÇÃO: Retorna o objeto store completo ao invés de apenas _id e name
      return store || {
        _id: filter.store || Utilities.storeID,
        name: 'Loja',
        billingName: 'Loja',
        address: {
          addressLine: '',
          city: '',
          state: ''
        },
        contacts: {
          phone: ''
        }
      };
    })();

    filter.period = (() => {

      const period: any = {};

      let startDate = DateTime.getDateObject();
      let endDate = DateTime.getDateObject();

      if (filter.period == 'currentWeek') {
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() - startDate.getDay());
      }

      if (filter.period == 'currentMonth') {
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      }

      if (filter.period == 'lastMonth') {
        startDate = new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1);
        endDate = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
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

    if (filter.billCategory && filter.billCategory != "##all##") {
      const billCategory = isNaN(parseInt(filter.billCategory)) ? filter.billCategory : Utilities.prefixCode(parseInt(filter.billCategory));
      filter.billCategory = { field: "category.code", operator: "=", value: billCategory };
    } else {
      delete filter.billCategory;
    }

    if (this.typeActived == 'pendingAccounts' || this.typeActived == 'overdueAccounts') {
      if (filter.filterDateType == "registerDate") {
        filter.filterDateType = "registerDate";
      }

      if (filter.filterDateType == "expireDate") {
        filter.filterDateType = "installments.dueDate";
      }
    } else {
      delete filter.filterDateType;
    }

    // 🎯 IMPORTANTE: Não processar collaborator se for "##all##"
    if (filter.collaborator === "##all##") {
      delete filter.collaborator;
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
