import { ProjectSettings } from "../../../assets/settings/company-settings";

export class ReportsTranslate {

  private static obj = {
    'pt_BR': {
      pageTitle: 'Relatórios',
      section: {
        cashier: {
          title: 'Caixa',
          option: {
            resume: 'Resumo',
            sales: 'Vendas',
            inflows: 'Entradas',
            outflows: 'Saídas',
            afterSales: 'Pós-Vendas',
            historic: 'Histórico',
            commissions: 'Comissões'
          }
        },
        stock: {
          title: 'Estoque',
          option: {
            curveABC: 'Curva ABC',
            products: 'Produtos',
            validity: 'Validade',
            purchases: 'Compras',
            transfers: 'Transferências',
            stockLogs: 'Movimentação de Estoque'
          }
        },
        serviceOrders: {
          title: 'Ordens de Serviço',
          option: {
            resume: 'Resumo',
            internal: 'Internas',
            external: 'Externas',
            curveABC: 'Curva ABC'
          }
        },
        projects: {
          title: 'Projetos',
          option: {
            resume: 'Resumo',
          }
        },
        financial: {
          title: 'Financeiro',
          option: {
            cashFlow: 'Fluxo de Caixa',
            billsToPay: 'Contas a Pagar',
            billsToReceive: 'Contas a Receber',
            bankTransactions: 'Transações Bancárias',
            commissions: 'Comissões'
          }
        },
        customers: {
          title: 'Clientes',
          option: {
            curveABC: 'Curva ABC'
          }
        },
        others: {
          title: 'Diversos',
          option: {
            systemLogs: 'Logs do Sistema'
          }
        }
      },
      modal: {
        help: {
          title: 'Ajuda'
        },
        section: {
          cashier: { title: 'Relatórios de Caixa' },
          stock: { title: 'Relatórios de Estoque' },
          serviceOrders: { title: 'Relatórios de Ordens de Serviço' },
          projects: { title: 'Relatórios de Projetos' },
          financial: { title: 'Relatórios Financeiros' },
          customers: { title: 'Relatórios de Clientes' },
          others: { title: 'Relatórios Diversos' }
        }
      }
    },
    'en_US': {
      pageTitle: 'Reports',
      section: {
        cashier: {
          title: 'Cashier',
          option: {
            resume: 'Resume',
            sales: 'Sales',
            inflows: 'Inputs',
            outflows: 'Outputs',
            afterSales: 'After Sales',
            historic: 'Historic',
            commissions: 'Commissions'
          }
        },
        stock: {
          title: 'Stock',
          option: {
            curveABC: 'Curve ABC',
            products: 'Products',
            validity: 'Expiration',
            purchases: 'Purchases',
            transfers: 'Transfers',
            stockLogs: 'Stock Movement'
          }
        },
        serviceOrders: {
          title: 'Service Orders',
          option: {
            resume: 'Resume',
            internal: 'Internal',
            external: 'External',
            curveABC: 'Curve ABC'
          }
        },
        projects: {
          title: 'Projects',
          option: {
            resume: 'Resume',
          }
        },
        financial: {
          title: 'Financial',
          option: {
            cashFlow: 'Cash Flow',
            billsToPay: 'Bills to Pay',
            billsToReceive: 'Bills to Receive',
            bankTransactions: 'Bank Transactions',
            commissions: 'Commissions'
          }
        },
        customers: {
          title: 'Customers',
          option: {
            curveABC: 'Curve ABC'
          }
        },
        others: {
          title: 'Miscellaneous',
          option: {
            systemLogs: 'System Logs'
          }
        }
      },
      modal: {
        help: {
          title: 'Help'
        },
        section: {
          cashier: { title: 'Cash Reports' },
          stock: { title: 'Stock Reports' },
          serviceOrders: { title: 'Orders Service Reports' },
          projects: { title: 'Projects Reports' },
          financial: { title: 'Financial Reports' },
          customers: { title: 'Customer Reports' },
          others: { title: 'Miscellaneous Reports' }
        }
      }
    }
  }

  public static get(language?: string) {
    return ReportsTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
