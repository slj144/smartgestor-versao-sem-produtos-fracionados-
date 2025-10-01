/**
 * Arquivo: pages.menu.ts
 * Localização: src/app/pages/pages.menu.ts
 * 
 * Descrição: Gerador dinâmico de menu principal do sistema
 * - Configura itens do menu baseado no perfil da empresa
 * - Aplica controle de permissões por usuário
 * - Suporta submenus e roteamento dinâmico
 * - Integra com sistema de traduções
 * - Verifica privilégios de administrador
 * - Controla visibilidade de módulos como CRM, Estoque, Financeiro, etc.
 */

// Translate
import { menuTranslation } from './pages.translation';

// Interfaces
import { IMenuOptions } from '@shared/interfaces/IMenuOptions';

// Utilities
import { Utilities } from '@shared/utilities/utilities';

// Settings
import { ProjectSettings } from '@assets/settings/company-settings';

export const setupMenu = (): IMenuOptions[] => {
  console.log('🏗️ Construindo menu...');
  // Traduções atualizadas conforme idioma atual
  const t = menuTranslation();
  // 🆕 VERIFICAÇÃO ESPECIAL PARA CRM ONLY
  const projectSettings = ProjectSettings.companySettings();
  const profile = projectSettings.profile;

  // Verificar se é CRM Only de forma mais robusta
  // Tratamento: null é considerado false
  const crmActiveCheck = profile?.data?.crm?.active === true || profile?.crm?.active === true;
  const isCRMOnly = (
    crmActiveCheck === true &&
    profile?.cashier?.active === false &&
    profile?.stock?.active === false &&
    profile?.financial?.active === false &&
    profile?.serviceOrders?.active === false &&
    profile?.requests?.active === false
  );

  // Se for CRM Only, retorna menu simplificado
  if (isCRMOnly) {

    // Constrói subitens do CRM dinamicamente
    const crmSubItems = [
      {
        id: 'crmDashboard',
        title: t.crm.subItems.dashboard.title,
        icon: 'activity-outline',
        route: `/${Utilities.currentLoginData.projectId}/crm/dashboard`
      },
      {
        id: 'crmLeads',
        title: t.crm.subItems.leads.title,
        icon: 'people-outline',
        route: `/${Utilities.currentLoginData.projectId}/crm/leads`
      },
      {
        id: 'crmPipeline',
        title: t.crm.subItems.pipeline.title,
        icon: 'funnel-outline',
        route: `/${Utilities.currentLoginData.projectId}/crm/pipeline`
      },
      {
        id: 'crmActivities',
        title: t.crm.subItems.activities.title,
        icon: 'calendar-outline',
        route: `/${Utilities.currentLoginData.projectId}/crm/atividades`
      },
      {
        id: 'crmSalesAnalysis',
        title: t.crm.subItems.salesAnalysis.title,
        icon: 'bar-chart-2-outline',
        route: `/${Utilities.currentLoginData.projectId}/crm/analise-vendas`
      },
      {
        id: 'crmBirthdays',
        title: t.crm.subItems.birthdays?.title || '🎂 Aniversários',
        icon: 'gift-outline',
        route: `/${Utilities.currentLoginData.projectId}/crm/aniversarios`
      }
    ];

    // Adiciona itens baseado em permissões (mesmo no CRM Only)
    // Link Público - para admins ou usuários com leads
    if (Utilities.isAdmin || (Utilities.permissions().crm?.modules?.includes('leads'))) {
      crmSubItems.push({
        id: 'crmPublicLink',
        title: '🔗 Link Público',
        icon: 'external-link-outline',
        route: `/${Utilities.currentLoginData.projectId}/crm/link-publico`
      });
    }


    const MENU_CRM_ONLY: IMenuOptions[] = [
      {
        id: 'crm',
        title: '🚀 ' + t.crm.title,
        icon: 'trending-up-outline',
        subItems: crmSubItems
      },
      {
        id: 'registers',
        title: t.registers.title,
        subItems: [
          {
            id: 'customers',
            title: t.registers.subItems.customers.title,
            icon: 'people-outline',
            route: `/${Utilities.currentLoginData.projectId}/registros/clientes`
          },
          {
            id: 'collaborators',
            title: t.registers.subItems.collaborators.title,
            icon: 'person-outline',
            route: `/${Utilities.currentLoginData.projectId}/registros/colaboradores`
          }
        ]
      },
      {
        id: 'reports',
        title: t.reports.title,
        icon: 'file-text-outline',
        route: `/${Utilities.currentLoginData.projectId}/relatorios`
      },
      {
        id: 'informations',
        title: t.informations.title,
        icon: 'info-outline',
        route: `/${Utilities.currentLoginData.projectId}/informacoes`
      },
      {
        id: 'settings',
        title: t.settings.title,
        icon: 'settings-2-outline',
        route: `/${Utilities.currentLoginData.projectId}/configuracoes`
      }
    ];

    return MENU_CRM_ONLY;
  }

  const MENU_ITEMS: IMenuOptions[] = [];

  const companySettings = ProjectSettings.companySettings();
  const companyProfile = companySettings.profile;
  const loginData = Utilities.currentLoginData; // Esta declaração permanece aqui
  const isDistributor = companyProfile?.name?.toLowerCase()?.includes('distributor');

  // Helper to validate CRM module permissions. Returns true when:
  // - The user is an admin
  // - No specific CRM modules are defined in permissions
  // - The requested module exists in the permission list
  const hasCrmModulePermission = (module: string): boolean => {
    const crmModules = Utilities.permissions().crm?.modules;
    return Utilities.isAdmin || crmModules == null || crmModules.includes(module as any);
  };
  if (companyProfile?.dashboard?.active && (Utilities.isAdmin || (Utilities.permissions().dashboard != null))) {
    MENU_ITEMS.push({ id: 'dashboard', title: t.dashboard.title, icon: 'pie-chart-outline', route: `/${loginData.projectId}/dashboard` });
  }

  if (companyProfile?.requests?.active && (Utilities.isAdmin || (Utilities.permissions().requests != null))) {
    MENU_ITEMS.push({ id: 'requests', title: t.requests.title, icon: 'shopping-bag-outline', route: `/${loginData.projectId}/pedidos` });
  }

  if (companyProfile?.cashier?.active && (Utilities.isAdmin || (Utilities.permissions().cashier != null))) {

    const item = {
      id: 'cashier',
      title: t.cashier.title,
      icon: 'layout-outline',
      subItems: (() => {

        const subMenu = [];

        if (Utilities.isAdmin || (Utilities.permissions().cashier?.cashierFront != null)) {
          subMenu.push({ id: 'cashierFront', title: t.cashier.subItems.cashierFront.title, icon: 'browser-outline', route: `/${loginData.projectId}/caixa/pdv` });
        }

        if (Utilities.isAdmin || (Utilities.permissions().cashier?.cashierRegisters != null)) {
          subMenu.push({ id: 'cashierRegisters', title: t.cashier.subItems.cashierRegisters.title, icon: 'inbox-outline', route: `/${loginData.projectId}/caixa/registros-de-caixa` });
        }

        return subMenu;
      })()
    };

    if (item.subItems.length > 0) {
      MENU_ITEMS.push(item);
    }
  }

  if (companyProfile?.serviceOrders?.active && !isDistributor) {

    const item = {
      id: 'services',
      title: t.services.title,
      icon: 'bar-chart-outline',
      subItems: (() => {

        const subMenu = [];

        subMenu.push({ id: 'serviceOrders', title: t.services.subItems.serviceOrders.title, icon: 'layers-outline', route: `/${loginData.projectId}/servicos/ordens-de-servico` });

        return subMenu;
      })()
    };

    if (item.subItems.length > 0) {
      MENU_ITEMS.push(item);
    }
  }

  if (companyProfile?.stock?.active && (Utilities.isAdmin || (Utilities.permissions().stock != null))) {

    const item = {
      id: 'stock',
      title: t.stock.title,
      icon: 'grid-outline',
      subItems: (() => {

        const subMenu = [];

        if (companyProfile?.stock?.components?.products?.active && (Utilities.isAdmin || (Utilities.permissions().stock?.products != null))) {
          subMenu.push({ id: 'products', title: t.stock.subItems.products.title, icon: 'grid-outline', route: `/${loginData.projectId}/estoque/produtos` });

        }

        if (companyProfile?.stock?.components?.purchases?.active && (Utilities.isAdmin || (Utilities.permissions().stock?.purchases != null))) {
          subMenu.push({ id: 'purchases', title: t.stock.subItems.purchases.title, icon: 'shopping-cart-outline', route: `/${loginData.projectId}/estoque/compras` });
        }

        if (companyProfile?.stock?.components?.transfers?.active && (Utilities.isAdmin || (Utilities.permissions().stock?.transfers != null))) {
          subMenu.push({ id: 'transfers', title: t.stock.subItems.transfers.title, icon: 'flip-2-outline', route: `/${loginData.projectId}/estoque/transferencias` });
        }

        return subMenu;
      })()
    };

    if (item.subItems.length > 0) {
      MENU_ITEMS.push(item);
    }
  }

  if (companyProfile?.financial?.active && (Utilities.isAdmin || (Utilities.permissions().financial != null))) {

    const item = {
      id: 'financial',
      title: t.financial.title,
      icon: 'bar-chart-outline',
      subItems: (() => {

        const subMenu = [];

        if (companyProfile?.financial?.components?.billsToPay?.active && (Utilities.isAdmin || (Utilities.permissions().financial?.billsToPay != null))) {
          subMenu.push({ id: 'billsToPay', title: t.financial.subItems.billsToPay.title, icon: 'log-out-outline', route: `/${loginData.projectId}/financeiro/contas-pagar` });
        }

        if (companyProfile?.financial?.components?.billsToReceive?.active && (Utilities.isAdmin || (Utilities.permissions().financial?.billsToReceive != null))) {
          subMenu.push({ id: 'billsRoReceive', title: t.financial.subItems.billsToReceive.title, icon: 'log-in-outline', route: `/${loginData.projectId}/financeiro/contas-receber` });
        }

        if (companyProfile?.financial?.components?.bankAccounts?.active && (Utilities.isAdmin || (Utilities.permissions().financial?.bankAccounts != null))) {
          subMenu.push({ id: 'bankAccounts', title: t.financial.subItems.bankAccounts.title, icon: 'bookmark-outline', route: `/${loginData.projectId}/financeiro/contas-bancarias` });
        }

        return subMenu;
      })()
    };

    if (item.subItems.length > 0) {
      MENU_ITEMS.push(item);
    }
  }

  if (companyProfile?.registers?.active) {

    const item = {
      id: 'retgisters',
      title: t.registers.title,
      icon: 'clipboard-outline',
      subItems: (() => {

        const subMenu = [];

        if (companyProfile?.registers.components.customers?.active && (Utilities.isAdmin || (Utilities.permissions().registers?.customers != null))) {
          subMenu.push({ id: 'customers', title: t.registers.subItems.customers.title, icon: 'people-outline', route: `/${loginData.projectId}/registros/clientes` });
        }

        if (companyProfile?.registers.components.collaborators?.active && (Utilities.isAdmin || (Utilities.permissions().registers?.collaborators != null))) {
          subMenu.push({ id: 'collaborators', title: t.registers.subItems.collaborators.title, icon: 'person-outline', route: `/${loginData.projectId}/registros/colaboradores` });
        }

        if (companyProfile?.registers.components.providers?.active && (Utilities.isAdmin || (Utilities.permissions().registers?.providers != null))) {
          subMenu.push({ id: 'providers', title: t.registers.subItems.providers.title, icon: 'cube-outline', route: `/${loginData.projectId}/registros/fornecedores` });
        }

        if (companyProfile?.registers.components.carriers?.active && (Utilities.isAdmin || (Utilities.permissions().registers?.carriers != null))) {
          subMenu.push({ id: 'carriers', title: t.registers.subItems.carriers.title, icon: 'car-outline', route: `/${loginData.projectId}/registros/transportadoras` });
        }

        if (companyProfile?.registers.components.partners?.active && (Utilities.isAdmin || (Utilities.permissions().registers?.partners != null))) {
          subMenu.push({ id: 'partners', title: t.registers.subItems.partners.title, icon: 'star-outline', route: `/${loginData.projectId}/registros/parceiros` });
        }
        if (companyProfile?.registers.components.services?.active && companyProfile?.serviceOrders?.active && !isDistributor) {
          subMenu.push({ id: 'services', title: t.registers.subItems.services.title, icon: 'briefcase-outline', route: `/${loginData.projectId}/registros/servicos` });
        }

        if (companyProfile?.registers.components.paymentMethods?.active && (Utilities.isAdmin || (Utilities.permissions().registers?.paymentMethods != null))) {
          subMenu.push({ id: 'paymentsMethods', title: t.registers.subItems.paymentMethods.title, icon: 'credit-card-outline', route: `/${loginData.projectId}/registros/meios-pagamento` });
        }

        if (companyProfile?.registers.components.vehicles?.active && (Utilities.isAdmin || (Utilities.permissions().registers?.vehicles != null))) {
          subMenu.push({ id: 'vehicles', title: t.registers.subItems.vehicles.title, icon: 'car-outline', route: `/${loginData.projectId}/registros/veiculos` });
        }

        // if (companyProfile?.registers.components.vehicles?.active && (Utilities.isAdmin || (Utilities.permissions().registers?.vehicles != null))) {
        //   subMenu.push({ id: 'vehicles', title: menuTranslation.registers.subItems.vehicles.title, icon: 'car-outline', route: `/${loginData.projectId}/registros/veiculos` });
        // }

        if (companyProfile?.registers.components.branches?.active && Utilities.isMatrix && (Utilities.isAdmin || (Utilities.permissions().registers?.branches != null))) {
          subMenu.push({ id: 'branches', title: t.registers.subItems.branches.title, icon: 'home-outline', route: `/${loginData.projectId}/registros/filiais` });
        }

        return subMenu;
      })()
    };

    if (item.subItems.length > 0) {
      MENU_ITEMS.push(item);
    }
  }

  if (companyProfile?.fiscal?.active && (Utilities.isAdmin || (Utilities.permissions().fiscal != null))) {
    MENU_ITEMS.push({ id: 'fiscalNotes', title: t.fiscal.title, icon: 'copy-outline', route: `/${loginData.projectId}/notas-fiscais` });
  }

  if (companyProfile?.reports?.active && (Utilities.isAdmin || (Utilities.permissions().reports != null))) {
    MENU_ITEMS.push({ id: 'reports', title: t.reports.title, icon: 'file-text-outline', route: `/${loginData.projectId}/relatorios` });
  }

  if (companyProfile?.informations?.active && (Utilities.isAdmin || (Utilities.permissions().informations != null))) {
    MENU_ITEMS.push({ id: 'informations', title: t.informations.title, icon: 'info-outline', route: `/${loginData.projectId}/informacoes` });
  }

  if (companyProfile?.settings?.active && (Utilities.isAdmin || (Utilities.permissions().settings != null))) {
    MENU_ITEMS.push({ id: 'settings', title: t.settings.title, icon: 'settings-2-outline', route: `/${loginData.projectId}/configuracoes` });
  }

  // ⭐ CRM COM SUBMENU - VERSÃO SEGURA
  // Verificar CRM em ambos os lugares (profile.data.crm tem prioridade)
  // Tratamento especial: se crm for null, considera como false
  const crmActive = (companyProfile?.data?.crm?.active === true) || (companyProfile?.crm?.active === true);
  const hasCrmPermission = Utilities.isAdmin || (Utilities.permissions().crm != null);

  if (crmActive && hasCrmPermission) {

    const item = {
      id: 'crm',
      title: '🚀 ' + t.crm.title,
      icon: 'trending-up-outline',
      subItems: (() => {
        const subMenu = [];

        // Dashboard CRM
        const crmComponents = companyProfile?.data?.crm?.components || companyProfile?.crm?.components;
        if (crmComponents?.dashboard?.active) {
          subMenu.push({
            id: 'crmDashboard',
            title: t.crm.subItems.dashboard.title,
            icon: 'activity-outline',
            route: `/${loginData.projectId}/crm/dashboard`
          });
        }

        // Leads
        if (crmComponents?.leads?.active && hasCrmModulePermission('leads')) {
          subMenu.push({
            id: 'crmLeads',
            title: t.crm.subItems.leads.title,
            icon: 'people-outline',
            route: `/${loginData.projectId}/crm/leads`
          });
        }

        // Pipeline
        if (crmComponents?.pipeline?.active && hasCrmModulePermission('pipeline')) {
          subMenu.push({
            id: 'crmPipeline',
            title: t.crm.subItems.pipeline.title,
            icon: 'funnel-outline',
            route: `/${loginData.projectId}/crm/pipeline`
          });
        }

        // Atividades
        if (crmComponents?.activities?.active && hasCrmModulePermission('activities')) {
          subMenu.push({
            id: 'crmActivities',
            title: t.crm.subItems.activities.title,
            icon: 'calendar-outline',
            route: `/${loginData.projectId}/crm/atividades`
          });
        }
        // Análise de Vendas
        if (
          crmComponents?.salesAnalysis?.active ||
          (crmComponents?.dashboard?.active && hasCrmModulePermission('salesAnalysis'))
        ) {
          subMenu.push({
            id: 'crmSalesAnalysis',
            title: t.crm.subItems.salesAnalysis.title,
            icon: 'bar-chart-2-outline',
            route: `/${loginData.projectId}/crm/analise-vendas`
          });
        }
        // 🎂 ANIVERSÁRIOS - VERSÃO SEGURA COM 'as any'
        // Usando 'as any' para evitar erro de TypeScript sem quebrar o sistema de permissões
        if ((crmComponents?.birthdays?.active || Utilities.isAdmin) &&
          hasCrmModulePermission('aniversarios')) {
          subMenu.push({
            id: 'crmBirthdays',
            title: t.crm.subItems.birthdays?.title || '🎂 Aniversários',
            icon: 'gift-outline',
            route: `/${loginData.projectId}/crm/aniversarios`
          });
        }
        // 🆕 LINK PÚBLICO - Disponível para admins ou usuários com permissão de leads (para gerenciar captação)
        if (Utilities.isAdmin || hasCrmModulePermission('leads')) {
          subMenu.push({
            id: 'crmPublicLink',
            title: '🔗 Link Público',
            icon: 'external-link-outline',
            route: `/${loginData.projectId}/crm/link-publico`
          });
        }


        return subMenu;
      })()
    };

    if (item.subItems.length > 0) {
      MENU_ITEMS.push(item);
    }
  }


  return MENU_ITEMS;
}

export const MENU_ITEMS = setupMenu();

// 🆕 Forçar atualização do menu quando mudar de página
export const refreshMenu = () => setupMenu();