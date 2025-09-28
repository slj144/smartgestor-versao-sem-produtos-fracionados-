// Arquivo: pages.translation.ts
// Localização: src/app/pages/pages.translation.ts


import { ProjectSettings } from '@assets/settings/company-settings';
/**
 * Retorna o código de idioma corrente. Busca primeiro no localStorage e,
 * caso não exista, utiliza a configuração do projeto como padrão.
 */
const getLanguage = () => {
  return (
    window.localStorage.getItem('Language') ??
    ProjectSettings.companySettings().language ??
    'pt_BR'
  );
};

export const menuTranslation = (language?: string): { [key: string]: { id: string, title: string, route: string, subItems: any } } => {

  const obj: any = {
    'pt_BR': {
      dashboard: { title: 'Dashboard', route: '/dashboard' },
      crm: {
        title: 'CRM',
        route: '/crm',
        subItems: {
          dashboard: { title: 'Dashboard', route: '/crm/dashboard' },
          leads: { title: 'Leads', route: '/crm/leads' },
          pipeline: { title: 'Pipeline', route: '/crm/pipeline' },
          activities: { title: 'Atividades', route: '/crm/atividades' },
          salesAnalysis: { title: 'Análise de Vendas', route: '/crm/analise-vendas' },
          birthdays: { title: 'Aniversários', route: '/crm/aniversarios' }, // 🎂 NOVA LINHA
          //salesAnalysis: { title: 'Análise de Vendas', route: '/crm/analise-vendas' }
        }
      },
      requests: { title: 'Pedidos', route: '/caixa/pedidos' },
      cashier: {
        title: 'Caixa',
        subItems: {
          cashierFront: { title: 'PDV', route: '/caixa/pdv' },
          cashierRegisters: { title: 'Registros de caixa', route: '/caixa/registros-de-vendas' },
        }
      },
      services: {
        title: 'Serviços',
        subItems: {
          serviceOrders: { title: 'Ordens de serviço', route: '/servicos/ordens-de-servico' },
        }
      },
      stock: {
        title: 'Estoque',
        subItems: {
          products: { title: 'Produtos', route: '/estoque/produtos' },
          purchases: { title: 'Compras', route: '/estoque/compras' },
          transfers: { title: 'Transferências', route: '/estoque/transferencias' },
        }
      },
      financial: {
        title: 'Financeiro',
        subItems: {
          billsToPay: { title: 'Contas a pagar', route: '/financeiro/contas-a-pagar' },
          billsToReceive: { title: 'Contas a receber', route: '/financeiro/contas-a-receber' },
          bankAccounts: { title: 'Contas bancárias', route: '/financeiro/contas-bancarias' },
        }
      },
      registers: {
        title: 'Registros',
        subItems: {
          customers: { title: 'Clientes', route: '/registros/clientes' },
          members: { title: 'Membros', route: '/registros/membros' },
          voters: { title: 'Eleitores', route: '/registros/eleitores' },
          collaborators: { title: 'Colaboradores', route: '/registros/colaboradores' },
          providers: { title: 'Fornecedores', route: '/registros/fornecedores' },
          carriers: { title: 'Transportadoras', route: '/registros/transportadoras' },
          branches: { title: 'Filiais', route: '/registros/filiais' },
          partners: { title: 'Empresas Parceiras', route: '/registros/empresas-parceiras' },
          services: { title: 'Serviços', route: '/registros/servicos' },
          vehicles: { title: 'Veículos', route: '/registros/veiculos' },
          paymentMethods: { title: 'Formas de pagamento', route: '/registros/formas-de-pagamento' }
        }
      },
      socialDemands: { title: 'Demandas sociais', route: '/demandas-sociais' },
      projects: { title: 'Projetos', route: '/projetos' },
      crafts: { title: 'Oficios', route: '/oficios' },
      requirements: { title: 'Requerimentos', route: '/requerimentos' },
      messaging: { title: 'Mensageria', route: '/messaging' },
      fiscal: { title: 'Notas Fiscais', route: '/fiscal' },
      reports: { title: 'Relatórios', route: '/relatorios' },
      profile: { title: 'Perfil', route: '/perfil' },
      informations: { title: 'Informações', route: '/informacoes' },
      support: { title: 'Suporte', route: '/suporte' },
      settings: { title: 'Configurações', route: '/configuracoes' },
      tithes: { title: 'Dízimos', route: '/dizimos' }
    },
    'en_US': {
      dashboard: { title: 'Dashboard', route: '/dashboard' },
      crm: {
        title: 'CRM',
        route: '/crm',
        subItems: {
          dashboard: { title: 'Dashboard', route: '/crm/dashboard' },
          leads: { title: 'Leads', route: '/crm/leads' },
          pipeline: { title: 'Pipeline', route: '/crm/pipeline' },
          activities: { title: 'Activities', route: '/crm/activities' },
          salesAnalysis: { title: 'Sales Analysis', route: '/crm/sales-analysis' },
          birthdays: { title: 'Birthdays', route: '/crm/birthdays' }, // ← ADICIONAR
        }
      },
      requests: { title: 'Requests', route: '/cashier/requests' },
      cashier: {
        title: 'Cashier',
        subItems: {
          cashierFront: { title: 'Cashier front', route: '/cashier/cashier-front' },
          cashierRegisters: { title: 'Cashier registers', route: '/cashier/sales-registers' },
        }
      },
      services: {
        title: 'Services',
        subItems: {
          serviceOrders: { title: 'Service Orders', route: '/services/service-orders' },
        }
      },
      stock: {
        title: 'Stock',
        subItems: {
          products: { title: 'Products', route: '/stock/products' },
          purchases: { title: 'Purchases', route: '/stock/purchases' },
          transfers: { title: 'Transfers', route: '/stock/transfers' },
        }
      },
      financial: {
        title: 'Financial',
        subItems: {
          billsToPay: { title: 'Bills to pay', route: '/financial/bills-to-pay' },
          billsToReceive: { title: 'Bills to receive', route: '/financial/bills-to-receive' },
          bankAccounts: { title: 'Bank accounts', route: '/financial/bank-accounts' },
        }
      },
      registers: {
        title: 'Registers',
        subItems: {
          customers: { title: 'Customers', route: '/registers/customers' },
          members: { title: 'Members', route: '/registers/members' },
          voters: { title: 'Voters', route: '/registers/voters' },
          collaborators: { title: 'Collaborators', route: '/registers/collaborators' },
          providers: { title: 'Providers', route: '/registers/providers' },
          carriers: { title: 'Carriers', route: '/registers/carriers' },
          branches: { title: 'Branches', route: '/registers/branches' },
          partners: { title: 'Partners', route: '/registers/partners' },
          services: { title: 'Services', route: '/registers/services' },
          vehicles: { title: 'Vehicles', route: '/registers/vehicles' },
          paymentMethods: { title: 'Payment methods', route: '/registers/payment-methods' }
        }
      },
      socialDemands: { title: 'Social demands', route: '/social-demands' },
      projects: { title: 'Projects', route: '/projects' },
      crafts: { title: 'Crafts', route: '/crafts' },
      requirements: { title: 'Requirements', route: '/requirements' },
      messaging: { title: 'Messaging', route: '/messaging' },
      fiscal: { title: 'Fiscal Notes', route: '/fiscal' },
      reports: { title: 'Reports', route: '/reports' },
      profile: { title: 'Profile', route: '/profile' },
      informations: { title: 'Informations', route: '/informations' },
      support: { title: 'Support', route: '/support' },
      settings: { title: 'Settings', route: '/settings' },
    }
  };

  const lang = language ?? getLanguage();
  return obj[lang];
};

export const routingTranslation = (language?: string): { [key: string]: string } => {

  const obj = {
    'pt_BR': {
      login: 'login',
      recoverPassword: 'recuperar-senha',
      dashboard: 'dashboard',
      crm: 'crm',
      requests: 'pedidos',
      service: 'servicos',
      cashier: 'caixa',
      stock: 'estoque',
      financial: 'financeiro',
      registers: 'registros',
      socialDemands: 'demandas-sociais',
      messaging: "mensageria",
      fiscal: 'notas-fiscais',
      reports: 'relatorios',
      profile: 'perfil',
      informations: 'informacoes',
      support: 'suporte',
      settings: 'configuracoes',
      salesAnalysis: 'sales-analysis'
    },
    'en_US': {
      login: 'login',
      recoverPassword: 'recover-password',
      dashboard: 'dashboard',
      crm: 'crm',
      requests: 'requests',
      service: 'service',
      cashier: 'cashier',
      stock: 'stock',
      financial: 'financial',
      registers: 'registers',
      socialDemands: 'social-demands',
      messaging: "messaging",
      fiscal: 'fiscal',
      reports: 'reports',
      profile: 'profile',
      informations: 'informations',
      support: 'support',
      settings: 'settings',
      salesAnalysis: 'sales-analysis'
    }
  };

  const lang = language ?? getLanguage();
  return obj[lang];
};