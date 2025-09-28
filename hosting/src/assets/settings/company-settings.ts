/**
 * Arquivo: company-settings.ts
 * Localização: src/assets/settings/company-settings.ts
 * 
 * Descrição: Configurações centralizadas da empresa
 * - Define estrutura de perfis e módulos do sistema
 * - Controla ativação/desativação de funcionalidades
 * - Gerencia configurações regionais (moeda, idioma, timezone)
 * - Normaliza estruturas de dados para compatibilidade
 * - Suporta múltiplos projetos/empresas
 * - Inclui configurações do CRM e demais módulos
 */

export class ProjectSettings {

  // Flag estática para evitar loops
  private static crmAdded = false;

  public static companyID() {
    const logins = window.localStorage.getItem("logins") ? JSON.parse(window.localStorage.getItem("logins")) : {};
    const currentLoginData = logins[(<any>window).id] ? logins[(<any>window).id] : {};

    // Ajuste para rotas de registro público: /registro/<tenantId>
    const pathParts = window.location.pathname.split("/").filter(Boolean);
    let defaultProject = pathParts[0];
    if (defaultProject === 'registro') {
      // quando estiver acessando o link público o tenantId fica na segunda posição
      defaultProject = pathParts[1] || defaultProject;
    }
    let subdomain = currentLoginData ? currentLoginData.projectId : defaultProject;
    subdomain = subdomain || defaultProject;
    // Quando estivermos em rotas administrativas (ex: super-admin),
    // o path não representa um projectId válido. Nestes casos devemos
    // retornar o projeto padrão utilizado para operações globais.
    const adminRoutes = ['super-admin', 'admin'];
    if (adminRoutes.includes(subdomain)) {
      return 'bm-iparttsdev';
    }

    return (subdomain != 'localhost' ? subdomain : 'bm-iparttsdev');
  }

  public static companySettings() {
    const logins = window.localStorage.getItem("logins") ? JSON.parse(window.localStorage.getItem("logins")) : {};
    const currentLoginData = logins[(<any>window).id] ? logins[(<any>window).id] : {};

    let info = currentLoginData.projectInfo;

    if (!info) {
      info = {
        companyName: "",
        projectId: ProjectSettings.companyID(),
        country: "BR",
        currency: 'BRL',
        language: "pt_BR",
        timezone: "America/Sao_Paulo",
        profile: {
          dashboard: { active: true },
          crm: {
            active: false,  // ⬅️ Desativado por padrão
            components: {
              dashboard: { active: true },
              leads: { active: true },
              pipeline: { active: true },
              activities: { active: true }
            }
          },
          requests: { active: true },
          cashier: {
            active: true,
            components: {
              cashierFront: { active: true },
              cashierRegisters: { active: true }
            }
          },
          serviceOrders: { active: true },
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
          fiscal: { active: true },
          reports: { active: true },
          informations: { active: true },
          settings: { active: true }
        }
      };
    }

    // ⭐ CRM agora é opcional e controlado pelo Super Admin

    // Verificar CRM em ambos os lugares possíveis
    if (info && info.profile) {
      // Priorizar profile.data.crm (local correto)
      if (info.profile.data?.crm !== undefined) {
        info.profile.crm = info.profile.data.crm;
      }
      // Se não existir em data, mas existir direto no profile (legado)
      else if (info.profile.crm === undefined && info.profile?.data?.crm !== undefined) {
        info.profile.crm = info.profile.data.crm;
      }
    }

    // Normalizar estrutura do profile antes de retornar
    if (info && info.profile) {
      // Se o CRM está em profile.data, copiar para profile diretamente
      if (info.profile.data?.crm && !info.profile.crm) {
        info.profile.crm = info.profile.data.crm;
      }

      // Fazer o mesmo para outros módulos se necessário
      if (info.profile.data) {
        Object.keys(info.profile.data).forEach(key => {
          if (!info.profile[key]) {
            info.profile[key] = info.profile.data[key];
          }
        });
      }
    }
    // Garante que instâncias com ordens de serviço possuam o registro de serviços
    // ativo nos cadastros. O único perfil que não utiliza este recurso é o
    // distribuidor.
    if (info && info.profile) {
      const hasServiceOrders = info.profile.serviceOrders?.active;
      const isDistributor = info.profile.name?.toLowerCase()?.includes('distributor');

      if (hasServiceOrders && !isDistributor) {
        info.profile.registers = info.profile.registers || { active: true, components: {} };
        info.profile.registers.components = info.profile.registers.components || {};

        if (!info.profile.registers.components.services) {
          info.profile.registers.components.services = { active: true };
        } else {
          info.profile.registers.components.services.active = true;
        }
      }
    }

    return info || {};
  }

  // Método para resetar a flag (útil após logout)
  public static resetFlags() {
    this.crmAdded = false;
  }
}