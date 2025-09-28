import { ProjectSettings } from "../../../../../../assets/settings/company-settings";
import { Utilities } from "@shared/utilities/utilities";

export class CashierFrontReportsTranslate {

  private static obj = {
    'pt_BR': {
      modalTitle: 'Resumo de Caixa',
      tabs: {
        option: {
          general: 'Geral',
          sales: 'Vendas',
          inflows: 'Entradas',
          outflows: 'Saídas'
        },
        segment: {
          general: {
            synthetic_report: {
              result: {
                title: 'Relatório Sintético - Resultado do Dia',
                label: {
                  opening: `Valor de Abertura (${Utilities.currencySymbol})`,
                  current: `Valor em Caixa (${Utilities.currencySymbol})`
                }
              },
              operations: {
                title: 'Relatório Sintético - Operações de Caixa',
                label: {
                  date: 'Data',
                  opening: `Valor Abertura (${Utilities.currencySymbol})`,
                  sales: `Valor Vendas (${Utilities.currencySymbol})`,
                  inflow: `Valor Entradas (${Utilities.currencySymbol})`,
                  outflow: `Valor Saídas (${Utilities.currencySymbol})`,
                  total: `Total (${Utilities.currencySymbol})`,
                  result: 'Resultado'
                }
              },
              billed_payment_methods: {
                title: 'Relatório Sintético - Meios de Pagamento (Faturados)',
                label: {
                  code: 'Código',
                  method: 'Meio de Pagamento',
                  cost: `Custo (${Utilities.currencySymbol})`,
                  value: `Valor (${Utilities.currencySymbol})`,
                  revenue: `Receita (${Utilities.currencySymbol})`,
                  result: 'Resultado'
                },
                notice: {
                  message: 'Não foi gerado nenhum dado até o momento!'
                }
              },
              unbilled_payment_methods: {
                title: 'Relatório Sintético - Meios de Pagamento (Não Faturados)',
                label: {
                  code: 'Código',
                  method: 'Meio de Pagamento',
                  cost: `Custo (${Utilities.currencySymbol})`,
                  value: `Valor (${Utilities.currencySymbol})`,
                  revenue: `Receita (${Utilities.currencySymbol})`,
                  result: 'Resultado'
                },
                notice: {
                  message: 'Não foi gerado nenhum dado até o momento!'
                }
              },
              sales_by_employee: {
                title: 'Relatório Sintético - Vendas por Colaborador',
                label: {
                  name: 'Nome do Colaborador',
                  quantity: 'Quantidade de Vendas',
                  value: `Valor em Vendas (${Utilities.currencySymbol})`,
                },
                notice: {
                  message: 'Não foi gerado nenhum dado até o momento!'
                }
              }
            }
          },
          sales: {
            analytical_report: {
              main: {
                title: 'Relatório Analítico - Vendas',
                label: {
                  date: 'Data',
                  saleCode: 'Ref. Venda',
                  serviceCode: 'Ref. OS',
                  customer: 'Cliente',
                  collaborator: 'Colaborador',
                  products: 'Produtos',
                  paymentMethods: 'Meios de Pagamento',
                  cost: `Custo (${Utilities.currencySymbol})`,
                  discount: `Desconto (${Utilities.currencySymbol})`,
                  fee: `Taxa (${Utilities.currencySymbol})`,
                  value: `Valor (${Utilities.currencySymbol})`,
                  revenue: `Receita (${Utilities.currencySymbol})`,
                  total: 'Total'
                },
                notice: {
                  message: 'Não foi gerado nenhum dado até o momento!'
                }
              },
              billed_payment_methods: {
                title: 'Relatório Analítico - Meios de Pagamento (Faturados)',
                label: {
                  methodCode: 'Código',
                  saleCode: 'Ref. Venda',
                  method: 'Meio de Pagamento',
                  cost: `Custo (${Utilities.currencySymbol})`,
                  value: `Valor (${Utilities.currencySymbol})`,
                  revenue: `Receita (${Utilities.currencySymbol})`,
                  total: 'Total'
                },
                notice: {
                  message: 'Não foi gerado nenhum dado até o momento!'
                }
              },
              unbilled_payment_methods: {
                title: 'Relatório Analítico - Meios de Pagamento (Não Faturados)',
                label: {
                  methodCode: 'Código',
                  saleCode: 'Ref. Venda',
                  method: 'Meio de Pagamento',
                  cost: `Custo (${Utilities.currencySymbol})`,
                  value: `Valor (${Utilities.currencySymbol})`,
                  revenue: `Receita (${Utilities.currencySymbol})`,
                  total: 'Total'
                },
                notice: {
                  message: 'Não foi gerado nenhum dado até o momento!'
                }
              }
            }
          },
          inflows: {
            analytical_report: {
              main: {
                title: 'Relatório Analítico - Entradas',
                label: {
                  date: 'Data',
                  reference: 'Ref. Entrada',
                  category: 'Categoria',
                  note: 'Observação',
                  value: `Valor (${Utilities.currencySymbol})`,
                  total: 'Total'
                },
                notice: {
                  message: 'Não foi gerado nenhum dado até o momento!'
                }
              }
            }
          },
          outflows: {
            analytical_report: {
              main: {
                title: 'Relatório Analítico - Saídas',
                label: {
                  date: 'Data',
                  reference: 'Ref. Saída',
                  category: 'Categoria',
                  note: 'Observação',
                  value: `Valor (${Utilities.currencySymbol})`,
                  total: 'Total'
                },
                notice: {
                  message: 'Não foi gerado nenhum dado até o momento!'
                }
              }
            }
          }
        }
      },
      print: {
        header: {
          phone: { label: 'Telefone' }
        }
      },
      _common: {
        payment: {
          debitCard: { label: 'Cartão de Débito' },
          creditCard: { label: 'Cartão de Crédito' }
        },
        button: {
          print: { label: 'Imprimir Relatório' }
        }
      }
    },
    'en_US': {
      modalTitle: 'Cash Summary',
      tabs: {
        option: {
          general: 'General',
          sales: 'Sales',
          inflows: 'Inputs',
          outflows: 'Outputs'
        },
        segment: {
          general: {
            synthetic_report: {
              result: {
                title: 'Synthetic Report - Result of the Day',
                label: {
                  opening: `Opening Value (${Utilities.currencySymbol})`,
                  current: `Cash Value (${Utilities.currencySymbol})`
                }
              },
              operations: {
                title: 'Synthetic Report - Cash Operations',
                label: {
                  date: 'Date',
                  opening: `Opening Value (${Utilities.currencySymbol})`,
                  sales: `Sales Value (${Utilities.currencySymbol})`,
                  inflow: `Input Value (${Utilities.currencySymbol})`,
                  outflow: `Output Value (${Utilities.currencySymbol})`,
                  total: `Total (${Utilities.currencySymbol})`,
                  result: 'Result'
                }
              },
              billed_payment_methods: {
                title: 'Synthetic Report - Means of Payment (Billed)',
                label: {
                  code: 'Code',
                  method: 'Payment method',
                  cost: `Cost (${Utilities.currencySymbol})`,
                  value: `Value (${Utilities.currencySymbol})`,
                  revenue: `Revenue (${Utilities.currencySymbol})`,
                  result: 'Result'
                },
                notice: {
                  message: 'No data has been generated so far!'
                }
              },
              unbilled_payment_methods: {
                title: 'Synthetic Report - Means of Payment (Not Billed)',
                label: {
                  code: 'Code',
                  method: 'Payment method',
                  cost: `Cost (${Utilities.currencySymbol})`,
                  value: `Value (${Utilities.currencySymbol})`,
                  revenue: `Revenue (${Utilities.currencySymbol})`,
                  result: 'Result'
                },
                notice: {
                  message: 'No data has been generated so far!'
                }
              },
              sales_by_employee: {
                title: 'Synthetic Report - Sales by Employee',
                label: {
                  name: 'Employee Name',
                  quantity: 'Quantity of Sales',
                  value: `Sales Value (${Utilities.currencySymbol})`
                },
                notice: {
                  message: 'No data has been generated so far!'
                }
              }
            }
          },
          sales: {
            analytical_report: {
              main: {
                title: 'Analytical Report - Sales',
                label: {
                  date: 'Date',
                  saleCode: 'Sale Reference',
                  serviceCode: 'Service Order Reference',
                  customer: 'Customer',
                  collaborator: 'Collaborator',
                  products: 'Products',
                  paymentMethods: 'Payment Methods',
                  cost: `Cost (${Utilities.currencySymbol})`,
                  discount: `Discounto (${Utilities.currencySymbol})`,
                  fee: `Fee (${Utilities.currencySymbol})`,
                  value: `Value (${Utilities.currencySymbol})`,
                  revenue: `Revenue (${Utilities.currencySymbol})`,
                  total: 'Total'
                },
                notice: {
                  message: 'No data has been generated so far!'
                }
              },
              billed_payment_methods: {
                title: 'Analytical Report - Means of Payment (Billed)',
                label: {
                  methodCode: 'Code',
                  saleCode: 'Sale Reference',
                  method: 'Payment method',
                  cost: `Cost (${Utilities.currencySymbol})`,
                  value: `Value (${Utilities.currencySymbol})`,
                  revenue: `Revenue (${Utilities.currencySymbol})`,
                  total: 'Total'
                },
                notice: {
                  message: 'No data has been generated so far!'
                }
              },
              unbilled_payment_methods: {
                title: 'Analytical Report - Means of Payment (Not Billed)',
                label: {
                  methodCode: 'Code',
                  saleCode: 'Sale Reference',
                  method: 'Payment method',
                  cost: `Cost (${Utilities.currencySymbol})`,
                  value: `Value (${Utilities.currencySymbol})`,
                  revenue: `Revenue (${Utilities.currencySymbol})`,
                  total: 'Total'
                },
                notice: {
                  message: 'No data has been generated so far!'
                }
              }
            }
          },
          inflows: {
            analytical_report: {
              main: {
                title: 'Analytical Report - Inputs',
                label: {
                  date: 'Date',
                  reference: 'Input Reference',
                  category: 'Category',
                  note: 'Note',
                  value: `Value (${Utilities.currencySymbol})`,
                  total: 'Total'
                },
                notice: {
                  message: 'No data has been generated so far!'
                }
              }
            }
          },
          outflows: {
            analytical_report: {
              main: {
                title: 'Analytical Report - Outputs',
                label: {
                  date: 'Date',
                  reference: 'Output Reference',
                  category: 'Category',
                  note: 'Note',
                  value: `Value (${Utilities.currencySymbol})`,
                  total: 'Total'
                },
                notice: {
                  message: 'No data has been generated so far!'
                }
              }
            }
          }
        }
      },
      print: {
        header: {
          phone: { label: 'Phone' }
        }
      },
      _common: {
        payment: {
          debitCard: { label: 'Debit Card' },
          creditCard: { label: 'Credit Card' }
        },
        button: {
          print: { label: 'Print Report' }
        }
      }
    }
  };

  public static get(language?: string) {
    return CashierFrontReportsTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
