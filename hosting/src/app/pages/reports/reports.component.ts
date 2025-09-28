// ARQUIVO: src/app/pages/reports/reports.component.ts
// FUNCIONALIDADE: Componente principal da página de Relatórios
// Este arquivo controla a exibição e permissões de todos os relatórios do sistema
// incluindo Caixa, Estoque, Ordens de Serviço, Financeiro e Diversos

import { Component, OnInit, OnDestroy, Compiler } from '@angular/core';

// Services
import { StoreService } from '../informations/informations.service';

// Translate
import { ReportsTranslate } from './reports.translate';

// Interfaces
import { IPermissions } from '@shared/interfaces/_auxiliaries/IPermissions';

// Utilties
import { Utilities } from '@shared/utilities/utilities';
import { Dispatch } from '@shared/utilities/dispatch';

// Settings
import { ProjectSettings } from '../../../assets/settings/company-settings';
import { ScrollMonitor } from '@shared/utilities/scrollMonitor';

@Component({
  selector: 'reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit, OnDestroy {

  public companyProfile = ProjectSettings.companySettings().profile;
  public translate = ReportsTranslate.get();

  public loading: boolean = true;
  public permissions: any = {};

  private storesData: any = [];
  private modalComponent: any;

  constructor(
    private storeService: StoreService
  ) {
    ScrollMonitor.reset();
    this.permissionsSettings();
  }

  public ngOnInit() {

    this.storeService.getStores('ReportsComponent', (data) => {
      this.storesData = data;
      this.loading = false;
    });
  }

  // User Interface Actions - Support

  public onHelp() {

  }

  // Modal Actions

  public onOpenModal(type: string, section: string = null) {

    let title = '';
    let permissions: any = {};
    let model: any = { id: section };

    if (type == 'Cashier') {

      title = this.translate.modal.section.cashier.title;
      permissions = (this.permissions.cashier || {}).sections[model.id];

      switch (section) {
        case 'resume': model.name = this.translate.section.cashier.option.resume; break;
        case 'sales': model.name = this.translate.section.cashier.option.sales; break;
        case 'inflows': model.name = this.translate.section.cashier.option.inflows; break;
        case 'outflows': model.name = this.translate.section.cashier.option.outflows; break;
        case 'afterSales': model.name = this.translate.section.cashier.option.afterSales; break;
        case 'historic': model.name = this.translate.section.cashier.option.historic; break;
        case 'commissions': model.name = this.translate.section.cashier.option.commissions; break;
      }
    }

    if (type == 'ServiceOrders') {

      title = this.translate.modal.section.serviceOrders.title;
      permissions = (this.permissions.serviceOrders || {}).sections[model.id];

      switch (section) {
        case 'resume': model.name = this.translate.section.serviceOrders.option.resume; break;
        case 'internal': model.name = this.translate.section.serviceOrders.option.internal; break;
        case 'external': model.name = this.translate.section.serviceOrders.option.external; break;
        case 'curveABC': model.name = this.translate.section.serviceOrders.option.curveABC; break;
      }
    }

    if (type == 'Stock') {

      title = this.translate.modal.section.stock.title;
      permissions = (this.permissions.stock || {}).sections[model.id];

      switch (section) {
        case 'curveABC': model.name = this.translate.section.stock.option.curveABC; break;
        case 'products': model.name = this.translate.section.stock.option.products; break;
        case 'validity': model.name = this.translate.section.stock.option.validity; break;
        case 'purchases': model.name = this.translate.section.stock.option.purchases; break;
        case 'transfers': model.name = this.translate.section.stock.option.transfers; break;
        case 'stockLogs': model.name = this.translate.section.stock.option.stockLogs; break;
      }
    }

    if (type == 'Projects') {

      title = this.translate.modal.section.projects.title;
      permissions = (this.permissions.projects || {}).sections[model.id];

      switch (section) {
        case 'resume': model.name = this.translate.section.projects.option.resume; break;
      }
    }

    if (type == 'Financial') {

      title = this.translate.modal.section.financial.title;
      permissions = (this.permissions.financial || {}).sections[model.id];

      switch (section) {
        case 'cashFlow': model.name = this.translate.section.financial.option.cashFlow; break;
        case 'billsToPay': model.name = this.translate.section.financial.option.billsToPay; break;
        case 'billsToReceive': model.name = this.translate.section.financial.option.billsToReceive; break;
        case 'bankTransactions': model.name = this.translate.section.financial.option.bankTransactions; break;
        case 'commissions': model.name = this.translate.section.cashier.option.commissions; break;
      }
    }

    if (type == 'Customers') {

      title = this.translate.modal.section.customers.title;
      permissions = (this.permissions.customers || {}).sections[model.id];

      switch (section) {
        case 'curveABC': model.name = this.translate.section.customers.option.curveABC; break;
      }
    }

    if (type == 'Several') {

      title = this.translate.modal.section.others.title;

      permissions = (this.permissions.several || {}).sections[model.id];

      switch (section) {
        case 'systemLogs': model.name = this.translate.section.others.option.systemLogs; break;
      }
    }

    this.modalComponent.onOpen({
      title: title,
      activeComponent: `Reports/${type}`,
      settings: {
        stores: this.storesData,
        permissions: permissions.types,
        model: model
      }
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

      // VERIFICAÇÃO DE PERMISSÕES PARA USUÁRIOS ADMIN
      if (Utilities.isAdmin) {

        this.permissions = {
          cashier: {
            active: true,
            sections: {
              resume: { active: true },
              sales: { active: true },
              inflows: { active: true },
              outflows: { active: true },
              afterSales: { active: true },
              historic: { active: true },
              commissions: { active: true }
            }
          },
          serviceOrders: {
            active: true,
            sections: {
              resume: { active: true },
              internal: { active: true },
              external: { active: true },
              curveABC: { active: true }
            }
          },
          stock: {
            active: true,
            sections: {
              products: { active: true },
              validity: { active: true },    // ⭐ CORREÇÃO: Adicionado relatório de validade para admin
              purchases: { active: true },
              transfers: { active: true },
              stockLogs: { active: true },
              curveABC: { active: true }
            }
          },
          financial: {
            active: true,
            sections: {
              cashFlow: { active: true },
              billsToPay: { active: true },
              billsToReceive: { active: true },
              bankTransactions: { active: true },
              commissions: { active: true }
            }

          },
          several: {
            active: true,
            sections: {
              systemLogs: { active: true }
            }
          }
        }
      } else {

        // VERIFICAÇÃO DE PERMISSÕES PARA USUÁRIOS NORMAIS
        const permissions = (Utilities.permissions('reports') as IPermissions['reports']);

        if (permissions.cashier && permissions.cashier.sections && (Object.keys(permissions.cashier.sections).length > 0)) {

          this.permissions['cashier'] = { active: true, sections: {} };

          if (
            (permissions.cashier.sections.resume && permissions.cashier.sections.resume.default)
          ) {
            this.permissions['cashier']['sections']['resume'] = { active: true, types: permissions.cashier.sections.resume };
          }

          if (
            (permissions.cashier.sections.sales && permissions.cashier.sections.sales.salesReportSynthetic) ||
            (permissions.cashier.sections.sales && permissions.cashier.sections.sales.salesReportAnalytical) ||
            (permissions.cashier.sections.sales && permissions.cashier.sections.sales.paymentMethodsSynthetic) ||
            (permissions.cashier.sections.sales && permissions.cashier.sections.sales.paymentMethodsAnalytical) ||
            (permissions.cashier.sections.sales && typeof permissions.cashier.sections.sales.salesPerUserSynthetic == "object") ||
            (permissions.cashier.sections.sales && typeof permissions.cashier.sections.sales.salesPerUserAnalytical == "object")
          ) {
            this.permissions['cashier']['sections']['sales'] = { active: true, types: permissions.cashier.sections.sales };
          }

          if (
            (permissions.cashier.sections.inflows && permissions.cashier.sections.inflows.inflowsReportSynthetic) ||
            (permissions.cashier.sections.inflows && permissions.cashier.sections.inflows.inflowsReportAnalytical)
          ) {
            this.permissions['cashier']['sections']['inflows'] = { active: true, types: permissions.cashier.sections.inflows };
          }

          if (
            (permissions.cashier.sections.outflows && permissions.cashier.sections.outflows.outflowsReportSynthetic) ||
            (permissions.cashier.sections.outflows && permissions.cashier.sections.outflows.outflowsReportAnalytical)
          ) {
            this.permissions['cashier']['sections']['outflows'] = { active: true, types: permissions.cashier.sections.outflows };
          }

          if (
            (permissions.cashier.sections.afterSales && permissions.cashier.sections.afterSales.default)
          ) {
            this.permissions['cashier']['sections']['afterSales'] = { active: true, types: permissions.cashier.sections.afterSales };
          }

          if (permissions.cashier.sections.historic) {
            this.permissions['cashier']['sections']['historic'] = { active: true };
          }
          if (
            permissions.cashier.sections.commissions &&
            permissions.cashier.sections.commissions.default
          ) {
            this.permissions['cashier']['sections']['commissions'] = { active: true, types: permissions.cashier.sections.commissions };
          }
        }


        if (permissions.servicesOrders && permissions.servicesOrders.sections && (Object.keys(permissions.servicesOrders.sections).length > 0)) {

          this.permissions['servicesOrders'] = { active: true, sections: {} };

          if (
            (permissions.servicesOrders.sections.resume && permissions.servicesOrders.sections.resume.default)
          ) {
            this.permissions['servicesOrders']['sections']['resume'] = { active: true, types: permissions.servicesOrders.sections.resume };
          }

          if (
            (permissions.servicesOrders.sections.internal && permissions.servicesOrders.sections.internal.servicesInternalReportSynthetic) ||
            (permissions.servicesOrders.sections.internal && permissions.servicesOrders.sections.internal.servicesInternalReportAnalytical)
          ) {
            this.permissions['servicesOrders']['sections']['internal'] = { active: true, types: permissions.servicesOrders.sections.internal };
          }

          if (
            (permissions.servicesOrders.sections.external && permissions.servicesOrders.sections.external.servicesExternalReportSynthetic) ||
            (permissions.servicesOrders.sections.external && permissions.servicesOrders.sections.external.servicesExternalReportAnalytical)
          ) {
            this.permissions['servicesOrders']['sections']['external'] = { active: true, types: permissions.servicesOrders.sections.external };
          }

          if (
            (permissions.servicesOrders.sections.curveABC && permissions.servicesOrders.sections.curveABC.default)
          ) {
            this.permissions['servicesOrders']['sections']['curveABC'] = { active: true, types: permissions.servicesOrders.sections.curveABC };
          }
        }

        // VERIFICAÇÃO DE PERMISSÕES PARA RELATÓRIOS DE ESTOQUE
        if (permissions.stock && permissions.stock.sections && (Object.keys(permissions.stock.sections).length > 0)) {

          this.permissions['stock'] = { active: true, sections: {} };

          if (
            (permissions.stock.sections.products && permissions.stock.sections.products.default)
          ) {
            this.permissions['stock']['sections']['products'] = { active: true, types: permissions.stock.sections.products };
          }

          // ⭐ CORREÇÃO: Adicionado verificação para relatório de validade
          // Usando verificação segura para evitar erro de TypeScript
          const validitySection = (permissions.stock.sections as any)?.validity;
          if (validitySection && validitySection.default) {
            this.permissions['stock']['sections']['validity'] = { active: true, types: validitySection };
          }

          if (
            (permissions.stock.sections.purchases && permissions.stock.sections.purchases.completedPurchases) ||
            (permissions.stock.sections.purchases && permissions.stock.sections.purchases.pendingPurchases) ||
            (permissions.stock.sections.purchases && permissions.stock.sections.purchases.purchasedProducts)
          ) {
            this.permissions['stock']['sections']['purchases'] = { active: true, types: permissions.stock.sections.purchases };
          }

          if (
            (permissions.stock.sections.transfers && permissions.stock.sections.transfers.completedTransfers) ||
            (permissions.stock.sections.transfers && permissions.stock.sections.transfers.pendingTransfers) ||
            (permissions.stock.sections.transfers && permissions.stock.sections.transfers.transferedProducts)
          ) {
            this.permissions['stock']['sections']['transfers'] = { active: true, types: permissions.stock.sections.transfers };
          }

          if (
            (permissions.stock.sections.stockLogs && permissions.stock.sections.stockLogs.default)
          ) {
            this.permissions['stock']['sections']['stockLogs'] = { active: true, types: permissions.stock.sections.stockLogs };
          }

          if (
            (permissions.stock.sections.curveABC && permissions.stock.sections.curveABC.default)
          ) {
            this.permissions['stock']['sections']['curveABC'] = { active: true, types: permissions.stock.sections.curveABC };
          }
        }

        if (permissions.financial && permissions.financial.sections && (Object.keys(permissions.financial.sections).length > 0)) {

          this.permissions['financial'] = { active: true, sections: {} };

          if (
            (permissions.financial.sections.cashFlow && permissions.financial.sections.cashFlow.default)
          ) {
            this.permissions['financial']['sections']['cashFlow'] = { active: true, types: permissions.financial.sections.cashFlow };
          }

          if (
            (permissions.financial.sections.billsToPay && permissions.financial.sections.billsToPay.paidAccounts) ||
            (permissions.financial.sections.billsToPay && permissions.financial.sections.billsToPay.pendentAccounts) ||
            (permissions.financial.sections.billsToPay && permissions.financial.sections.billsToPay.expireAccounts)
          ) {
            this.permissions['financial']['sections']['billsToPay'] = { active: true, types: permissions.financial.sections.billsToPay };
          }

          if (
            (permissions.financial.sections.billsToReceive && permissions.financial.sections.billsToReceive.receivedAccounts) ||
            (permissions.financial.sections.billsToReceive && permissions.financial.sections.billsToReceive.pendentAccounts) ||
            (permissions.financial.sections.billsToReceive && permissions.financial.sections.billsToReceive.expireAccounts)
          ) {
            this.permissions['financial']['sections']['billsToReceive'] = { active: true, types: permissions.financial.sections.billsToReceive };
          }

          if (
            (permissions.financial.sections.bankTransactions && permissions.financial.sections.bankTransactions.default)
          ) {
            this.permissions['financial']['sections']['bankTransactions'] = { active: true, types: permissions.financial.sections.bankTransactions };
          }

          if (
            (permissions.financial.sections.commissions && permissions.financial.sections.commissions.default)
          ) {
            this.permissions['financial']['sections']['commissions'] = { active: true, types: permissions.financial.sections.commissions };
          }
        }

        if (permissions.several && permissions.several.sections && (Object.keys(permissions.several.sections).length > 0)) {

          this.permissions['several'] = { active: true, sections: {} };

          if (
            (permissions.several.sections.systemLogs && permissions.several.sections.systemLogs.default)
          ) {
            this.permissions['several']['sections']['systemLogs'] = { active: true, types: permissions.several.sections.systemLogs };
          }
        }
      }
    };

    Dispatch.onRefreshCurrentUserPermissions('ProductsComponent', () => {
      setupPermissions();
    });

    setupPermissions();
  }

  // Destruction Method

  public ngOnDestroy() {
    this.storeService.removeListeners('stores', 'ReportsComponent');
  }

}