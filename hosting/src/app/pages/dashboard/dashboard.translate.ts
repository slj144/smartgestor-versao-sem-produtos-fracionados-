import { ProjectSettings } from "../../../assets/settings/company-settings";
import { Utilities } from "@shared/utilities/utilities";

export class DashboardTranslate {

  private static obj = {
    'pt_BR': {
      blocks: {
        first_section: {
          products: {
            registered: 'Produtos Registrados',
            alert: 'Produtos em Alerta'
          },
          requests: {
            pending: 'Pedidos Pendentes'
          },
          serviceOrders: {
            pending: "OS's Pendentes"
          },
          customers: {
            registered: 'Clientes Registrados'
          },
        },
        second_section: {
          cashier: {
            summary: {
              title: 'Resumo de Caixa',
              subtitle: 'Balanço do período',
              buttons: {
                currentDay: 'Hoje',
                currentWeek: 'Semana',
                currentMonth: 'Mês'
              },
              labels: {
                revenue: 'Receita Total',
                salesTotal: "Total",
                sales: 'Vendas',
                inflows: 'Entradas',
                outflows: 'Saídas',
                costs: 'Custos'
              }
            }
          },
          bestSellers: {
            title: 'Mais vendidos',
            subtitle: 'Os 10 produtos mais vendidos',
            label: {
              code: 'Código',
              quantity: 'Quantidade Vendida'
            },
            notice: 'Não há mais vendidos no momento.'
          },
          stockAlert: {
            title: 'Alerta de Estoque',
            subtitle: 'Lista com produtos em alerta',
            label: {
              code: 'Código',
              quantity: 'Quantidade'
            },
            notice: 'Não há produtos em alerta.'
          },
          serviceOrders: {
            title: 'Ordens de Serviço',
            subtitle: 'Lista das ordens de serviço pendentes',
            label: {
              code: 'Código',
              status: {
                title: 'Status',
                enum: {
                  PENDENT: 'PENDENTE'
                }
              }
            },
            notice: 'Não há ordens de serviço pendente.'
          },
          requests: {
            title: 'Pedidos',
            subtitle: 'Últimos pedidos pendentes',
            label: {
              number: 'Pedido Nº',
              customer: 'Cliente',
              status: {
                title: 'Status',
                enum: {
                  PENDENT: 'PENDENTE'
                }
              }
            },
            notice: 'Não há pedidos pendente.'
          },
          billsToPay: {
            title: 'Contas a Pagar',
            subtitle: 'Vencimento nos próximos 15 dias',
            label: {
              code: 'Código',
              dueDate: 'Vencimento',
              value: `Valor (${Utilities.currencySymbol})`
            },
            notice: 'Não há contas a pagar.'
          },
          billsToReceive: {
            title: 'Contas a Receber',
            subtitle: 'Vencimento nos próximos 15 dias',
            label: {
              code: 'Código',
              dueDate: 'Vencimento',
              value: `Valor (${Utilities.currencySymbol})`
            },
            notice: 'Não há contas a receber.'
          },
          birthdayCustomers: {
            title: 'Clientes Aniversariantes',
            subtitle: 'Aniversariantes da semana',
            notice: 'Não há clientes aniversariantes.'
          },
        }
      }
    },
    'en_US': {
      blocks: {
        first_section: {
          products: {
            registered: 'Registered Products',
            alert: 'Alert Products'
          },
          requests: {
            pending: 'Pending Orders'
          },
          serviceOrders: {
            pending: "Pending SO"
          },
          customers: {
            registered: 'Registered Customers'
          }
        },
        second_section: {
          cashier: {
            summary: {
              title: 'Cash Summary',
              subtitle: 'Period balance',
              buttons: {
                currentDay: 'Today',
                currentWeek: 'This Week',
                currentMonth: 'This Month'
              },
              labels: {
                revenue: 'Total Revenue',
                salesTotal: "Sales Total",
                sales: 'Sales',
                inflows: 'Inputs',
                outflows: 'Outputs',
                costs: 'Costs'
              }
            }
          },
          bestSellers: {
            title: 'Best Sellers',
            subtitle: 'Top 10 products',
            label: {
              code: 'Code',
              quantity: 'Sold amount'
            },
            notice: 'There is no best sellers at the moment.'
          },
          stockAlert: {
            title: 'Stock Alert',
            subtitle: 'List with products on alert',
            label: {
              code: 'Code',
              quantity: 'Quantity'
            },
            notice: 'There are no products on alert.'
          },
          serviceOrders: {
            title: 'Service Orders',
            subtitle: 'List of pending work orders',
            label: {
              code: 'Code',
              status: {
                title: 'Status',
                enum: {
                  PENDENT: 'PENDENT'
                }
              }
            },
            notice: 'There are no pending service orders.'
          },
          requests: {
            title: 'Requests',
            subtitle: 'Last pending orders',
            label: {
              number: 'Order Nº',
              customer: 'Customer',
              status: {
                title: 'Status',
                enum: {
                  PENDENT: 'PENDENT'
                }
              }
            },
            notice: 'There are no pending orders.'
          },
          billsToPay: {
            title: 'Bills to Pay',
            subtitle: 'Expiration in the next 15 days',
            label: {
              code: 'Code',
              dueDate: 'Due date',
              value: `Amount (${Utilities.currencySymbol})`
            },
            notice: 'There are no bills to pay.'
          },
          billsToReceive: {
            title: 'Bills to Receive',
            subtitle: 'Expiration in the next 15 days',
            label: {
              code: 'Code',
              dueDate: 'Due date',
              value: `Amount (${Utilities.currencySymbol})`
            },
            notice: 'There are no bills to receive.'
          },
          birthdayCustomers: {
            title: 'Birthday Clients',
            subtitle: 'Birthdays of the week',
            notice: 'There are no birthday clients.'
          },
        }
      }
    }
  };

  public static get(language?: string) {
    return DashboardTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
