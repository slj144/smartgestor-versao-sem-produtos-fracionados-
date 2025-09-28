// company-profiles.ts
// ARQUIVO: src/functions/project-instance/company-profiles.ts
// FUNÇÃO: Define os módulos disponíveis para cada tipo de empresa

export const CompanyProfile = {
  'Commerce': {
    dashboard: { active: true },
    cashier: { active: true },
    requests: { active: true },
    serviceOrders: { active: true },
    // ❌ CRM REMOVIDO - agora é opcional
    stock: {
      active: true,
      components: {
        products: { active: true },
        purchases: { active: true },
        transfers: { active: true }
      }
    },
    financial: {
      active: true,
      components: {
        billsToPay: { active: true },
        billsToReceive: { active: true },
        bankAccounts: { active: true }
      }
    },
    registers: {
      active: true,
      components: {
        customers: { active: true },
        collaborators: { active: true },
        providers: { active: true },
        carriers: { active: true },
        partners: { active: true },
        paymentMethods: { active: true },
        services: { active: true },
        vehicles: { active: false },
        branches: { active: true }
      }
    },
    reports: { active: true },
    informations: { active: true },
    settings: { active: true }
  },

  'Distributor': {
    dashboard: { active: true },
    cashier: { active: true },
    requests: { active: true },
    serviceOrders: { active: false },
    // ❌ CRM REMOVIDO - agora é opcional
    stock: {
      active: true,
      components: {
        products: { active: true },
        purchases: { active: true },
        transfers: { active: true }
      }
    },
    financial: {
      active: true,
      components: {
        billsToPay: { active: true },
        billsToReceive: { active: true },
        bankAccounts: { active: true }
      }
    },
    registers: {
      active: true,
      components: {
        customers: { active: true },
        collaborators: { active: true },
        providers: { active: true },
        carriers: { active: true },
        partners: { active: true },
        paymentMethods: { active: true },
        services: { active: false },
        vehicles: { active: false },
        branches: { active: true }
      }
    },
    reports: { active: true },
    informations: { active: true },
    settings: { active: true }
  },

  'Church': {
    dashboard: { active: true },
    cashier: { active: true },
    requests: { active: true },
    agenda: { active: true },
    events: { active: true },
    groups: { active: true },
    classrooms: { active: false },
    tithes: { active: true },
    donations: { active: true },
    // ❌ CRM REMOVIDO - agora é opcional
    stock: {
      active: true,
      components: {
        products: { active: true },
        purchases: { active: true }
      }
    },
    financial: {
      active: true,
      components: {
        billsToPay: { active: true },
        billsToReceive: { active: true },
        bankAccounts: { active: true }
      }
    },
    registers: {
      active: true,
      components: {
        members: { active: true },
        collaborators: { active: true },
        providers: { active: true },
        paymentMethods: { active: true }
      }
    },
    reports: { active: true },
    informations: { active: true },
    settings: { active: true }
  },

  'Cabinet': {
    dashboard: { active: true },
    socialDemands: { active: true },
    projects: { active: true },
    crafts: { active: true },
    requirements: { active: true },
    agenda: { active: true },
    events: { active: true },
    // ❌ CRM REMOVIDO - agora é opcional
    registers: {
      active: true,
      components: {
        voters: { active: true },
        collaborators: { active: true }
      }
    },
    messages: { active: true },
    reports: { active: true },
    informations: { active: true },
    settings: { active: true }
  },

  'Restaurant': {
    dashboard: { active: true },
    cashier: { active: true },
    requests: { active: true },
    kitchen: { active: true },
    menu: { active: true },
    events: { active: true },
    // ❌ CRM REMOVIDO - agora é opcional
    stock: {
      active: true,
      components: {
        products: { active: true },
        ingredients: { active: true },
        purchases: { active: true },
        transfers: { active: true }
      }
    },
    financial: {
      active: true,
      components: {
        billsToPay: { active: true },
        billsToReceive: { active: true },
        bankAccounts: { active: true }
      }
    },
    registers: {
      active: true,
      components: {
        customers: { active: true },
        collaborators: { active: true },
        providers: { active: true },
        carriers: { active: true },
        paymentMethods: { active: true },
        services: { active: true },
        branches: { active: true }
      }
    },
    fiscal: { active: true },
    reports: { active: true },
    informations: { active: true },
    settings: { active: true }
  },

  'School': {
    dashboard: { active: true },
    cashier: { active: true },
    requests: { active: true },
    agenda: { active: true },
    events: { active: true },
    // ❌ CRM REMOVIDO - agora é opcional
    stock: {
      active: true,
      components: {
        products: { active: true },
        purchases: { active: true },
        transfers: { active: true }
      }
    },
    financial: {
      active: true,
      components: {
        billsToPay: { active: true },
        billsToReceive: { active: true },
        bankAccounts: { active: true }
      }
    },
    registers: {
      active: true,
      components: {
        students: { active: true },
        collaborators: { active: true },
        providers: { active: true },
        carriers: { active: true },
        partners: { active: true },
        paymentMethods: { active: true },
        branches: { active: true }
      }
    },
    reports: { active: true },
    informations: { active: true },
    settings: { active: true }
  },

  'Mechanics': {
    dashboard: { active: true },
    cashier: { active: true },
    requests: { active: true },
    serviceOrders: { active: true },
    // ❌ CRM REMOVIDO - agora é opcional
    stock: {
      active: true,
      components: {
        products: { active: true },
        purchases: { active: true },
        transfers: { active: true }
      }
    },
    financial: {
      active: true,
      components: {
        billsToPay: { active: true },
        billsToReceive: { active: true },
        bankAccounts: { active: true }
      }
    },
    registers: {
      active: true,
      components: {
        customers: { active: true },
        collaborators: { active: true },
        providers: { active: true },
        carriers: { active: true },
        partners: { active: true },
        paymentMethods: { active: true },
        services: { active: true },
        vehicles: { active: true },
        branches: { active: true }
      }
    },
    reports: { active: true },
    informations: { active: true },
    settings: { active: true }
  }
};

// Adicionar perfis com Fiscal (sem CRM por padrão)
CompanyProfile['Commerce/Fiscal'] = {
  ...CompanyProfile['Commerce'],
  fiscal: { active: true }
};

CompanyProfile['Distributor/Fiscal'] = {
  ...CompanyProfile['Distributor'],
  fiscal: { active: true }
};

CompanyProfile['Mechanics/Fiscal'] = {
  ...CompanyProfile['Mechanics'],
  fiscal: { active: true }
};

// ⭐ PERFIL CRM ONLY - Sistema focado apenas em CRM ⭐
CompanyProfile['CRMOnly'] = {
  dashboard: { active: true }, // Dashboard simplificado para CRM

  // CRM é o módulo principal - sempre ativo
  crm: {
    active: true,
    components: {
      dashboard: { active: true },
      leads: { active: true },
      pipeline: { active: true },
      activities: { active: true }
    }
  },

  // Módulos essenciais desativados
  cashier: { active: false },
  requests: { active: false },
  serviceOrders: { active: false },

  // Estoque completamente desativado
  stock: { active: false },

  // Financeiro desativado (CRM não precisa)
  financial: { active: false },

  // Cadastros - apenas o essencial para CRM funcionar
  registers: {
    active: true,
    components: {
      customers: { active: true }, // Essencial para CRM
      collaborators: { active: true }, // Para gerenciar usuários
      providers: { active: false },
      carriers: { active: false },
      partners: { active: false },
      paymentMethods: { active: false },
      services: { active: false },
      vehicles: { active: false },
      branches: { active: false }
    }
  },

  // Fiscal desativado
  fiscal: { active: false },

  // Relatórios ativos (mas só do CRM)
  reports: { active: true },

  // Informações e configurações sempre necessárias
  informations: { active: true },
  settings: { active: true }
};