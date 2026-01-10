// ARQUIVO: src/app/pages/reports/components/modal/components/cashier/cashier.translate.ts
// CAMINHO: src/app/pages/reports/components/modal/components/cashier/
// FUNCIONALIDADE: Arquivo de tradução dos relatórios de caixa com suporte a comissões
// CORREÇÃO: Adicionados campos faltantes em salesPerUserAnalytical (product, category, provider, totalQuantity, costs, contributionMargin)

import { ProjectSettings } from "../../../../../../../assets/settings/company-settings";
import { Utilities } from "@shared/utilities/utilities";

export class ReportsCashierTranslate {

  private static obj = {
    'pt_BR': {
      _general: {
        form: {
          store: {
            title: 'Loja'
          },
          period: {
            title: 'Período',
            label: {
              option: {
                today: 'Hoje',
                currentWeek: 'Esta semana',
                currentMonth: 'Este mês',
                lastMonth: "Mês anterior",
                custom: 'Personalizado'
              },
              start: 'Início',
              end: 'Fim'
            }
          },
          reportType: {
            title: 'Tipo de Relatório'
          },
          reportFields: {
            title: 'Campos do Relatório'
          },
          button: {
            generate: 'Gerar Relatório'
          },
          collaborator: {
            title: "Colaborador",
            list: {
              all: "Todos Os Colaboradores"
            }
          },
          products: {
            code: { label: 'Código de Produto' },
            provider: {
              title: "Fornecedor de Produto",
              list: {
                all: "Todos"
              }
            },
            categories: {
              title: "Categoria de Produto",
              list: {
                all: "Todas"
              }
            }
          }
        },
        layer: {
          titleBar: {
            generated: ['Gerado em', 'às'],
            button: {
              exportXLS: 'Exportar XLS'
            }
          },
          information: {
            label: {
              address: 'Endereço',
              phone: 'Telefone',
              period: ['Período', 'à']
            }
          },
          warning: {
            noData: 'Nenhum registro foi encontrado para o período selecionado.'
          }
        }
      },
      resume: {
        fields: {
          default: {
            date: { external: 'Data', internal: 'Data' },
            sales: { external: 'Valor de Vendas', internal: `Valor de Vendas (${Utilities.currencySymbol})` },
            inputs: { external: 'Valor de Entradas', internal: `Valor de Entradas (${Utilities.currencySymbol})` },
            outputs: { external: 'Valor de Saídas', internal: `Valor de Saídas (${Utilities.currencySymbol})` },
            servicesCosts: { external: 'Custos de Serviços', internal: `Custos de Serviços (${Utilities.currencySymbol})` },
            productsCosts: { external: 'Custos de Produtos', internal: `Custos de Produtos (${Utilities.currencySymbol})` },
            paymentsCosts: { external: 'Custos de Pagamentos', internal: `Custos de Pagamentos (${Utilities.currencySymbol})` },
            totalCosts: { external: 'Total de Custo', internal: `Total de Custo (${Utilities.currencySymbol})` },
            totalTaxes: { external: 'Total de Impostos', internal: `Total de Impostos (${Utilities.currencySymbol})` },
            partialRevenue: { external: 'Receita Parcial', internal: `Receita Parcial (${Utilities.currencySymbol})` },
            commission: { external: 'Comissão', internal: `Comissão (${Utilities.currencySymbol})` },
            finalRevenue: { external: 'Receita Final', internal: `Receita Final (${Utilities.currencySymbol})` }
          }
        },
        label: {
          total: 'Total'
        }
      },
      sales: {
        types: {
          salesReportSynthetic: 'Relatório de Vendas (Sintético)',
          salesReportAnalytical: 'Relatório de Vendas (Analítico)',
          paymentMethodsSynthetic: 'Relatório de Meios de Pagamento (Sintético)',
          paymentMethodsAnalytical: 'Relatório de Meios de Pagamento (Analítico)',
          salesPerUserSynthetic: 'Relatório de Vendas por Colaborador (Sintético)',
          salesPerUserAnalytical: 'Relatório de Vendas por Colaborador (Analítico)'
        },
        fields: {
          salesReportSynthetic: {
            date: { external: 'Data', internal: 'Data' },
            number: { external: 'Número de Vendas', internal: 'Número de Vendas' },
            billed: { external: 'Vendas Faturadas', internal: 'Vendas Faturadas' },
            salesTotal: { external: 'Valor de Vendas', internal: `Valor de Vendas (${Utilities.currencySymbol})` },
            servicesCosts: { external: 'Custo de Serviços', internal: `Custo de Serviços (${Utilities.currencySymbol})` },
            productsCosts: { external: 'Custo de Produtos', internal: `Custo de Produtos (${Utilities.currencySymbol})` },
            paymentsCosts: { external: 'Custo de Pagamentos', internal: `Custo de Pagamentos (${Utilities.currencySymbol})` },
            totalCosts: { external: 'Total de Custos', internal: `Total de Custos (${Utilities.currencySymbol})` },
            totalTaxes: { external: 'Total de Impostos', internal: `Total de Impostos (${Utilities.currencySymbol})` },
            totalUnbilled: { external: 'Total Não Faturado', internal: `Total Não Faturado (${Utilities.currencySymbol})` },
            partialRevenue: { external: 'Receita Parcial', internal: `Receita Parcial (${Utilities.currencySymbol})` },
            finalRevenue: { external: 'Receita Final', internal: `Receita Final (${Utilities.currencySymbol})` },
            commission: { external: 'Comissão', internal: `Comissão (${Utilities.currencySymbol})` } // ✅ CORRIGIDO: Adicionado campo commission
          },
          salesReportAnalytical: {
            date: { external: 'Data', internal: 'Data' },
            saleCode: { external: 'Referência de Venda', internal: 'Ref. Venda' },
            serviceCode: { external: 'Referência de OS', internal: 'Ref. OS' },
            customer: { external: 'Cliente', internal: 'Cliente' },
            collaborator: { external: 'Colaborador', internal: 'Colaborador' },
            services: {
              external: 'Serviços', internal: {
                label: 'Serviços',
                sub: {
                  code: 'Código',
                  description: 'Descrição',
                  value: `Valor (${Utilities.currencySymbol})`,
                  cost: `Custo Unitário (${Utilities.currencySymbol})`,
                  totalCost: `Custo Total (${Utilities.currencySymbol})`,
                  unitaryPrice: `Preço Unitário (${Utilities.currencySymbol})`,
                  totalPrice: `Preço Total (${Utilities.currencySymbol})`,
                  discount: `Desconto (${Utilities.currencySymbol})`,
                  fee: `Taxa (${Utilities.currencySymbol})`,
                  paid: `Pago (${Utilities.currencySymbol})`
                }
              }
            },
            products: {
              external: 'Produtos', internal: {
                label: 'Produtos',
                sub: {
                  code: 'Código',
                  description: 'Descrição',
                  quantity: 'Quantidade',
                  cost: `Custo (${Utilities.currencySymbol})`,
                  totalCost: `Custo Total (${Utilities.currencySymbol})`,
                  price: `Preço (${Utilities.currencySymbol})`,
                  totalPrice: `Preço Total (${Utilities.currencySymbol})`,
                  discount: `Desconto (${Utilities.currencySymbol})`,
                  fee: `Taxa (${Utilities.currencySymbol})`,
                  paid: `Pago (${Utilities.currencySymbol})`
                }
              }
            },
            paymentMethods: {
              external: 'Meios de Pagamento', internal: {
                label: 'Meios de Pagamento',
                sub: {
                  code: 'Código',
                  description: 'Descrição',
                  note: 'Observação',
                  cost: `Custo (${Utilities.currencySymbol})`,
                  value: `Valor (${Utilities.currencySymbol})`
                }
              }
            },
            taxes: {
              external: 'Impostos', internal: {
                label: 'Impostos',
                sub: {
                  icms: `ICMS (${Utilities.currencySymbol})`,
                  pis: `PIS (${Utilities.currencySymbol})`,
                  cofins: `COFINS (${Utilities.currencySymbol})`,
                  iss: `ISS (${Utilities.currencySymbol})`,
                  total: `TOTAL (${Utilities.currencySymbol})`
                }
              }
            },
            discount: { external: 'Desconto', internal: `Desconto (${Utilities.currencySymbol})` },
            fee: { external: 'Taxa', internal: `Taxa (${Utilities.currencySymbol})` },
            additional: { external: 'Adicional', internal: `Adicional (${Utilities.currencySymbol})` },
            saleValue: { external: 'Valor de Venda', internal: `Valor de Venda (${Utilities.currencySymbol})` },
            unbilledValue: { external: 'Valor Não Faturado', internal: `Valor Não Faturado (${Utilities.currencySymbol})` },
            servicesCosts: { external: 'Custo de Serviços', internal: `Custo de Serviços (${Utilities.currencySymbol})` },
            productsCosts: { external: 'Custo de Produtos', internal: `Custo de Produtos (${Utilities.currencySymbol})` },
            paymentsCosts: { external: 'Custo de Pagamento', internal: `Custo de Pagamento (${Utilities.currencySymbol})` },
            totalCosts: { external: 'Total de Custos', internal: `Total de Custos (${Utilities.currencySymbol})` },
            totalTaxes: { external: 'Total de Impostos', internal: `Total de Impostos (${Utilities.currencySymbol})` },
            partialRevenue: { external: 'Receita Parcial', internal: `Receita Parcial (${Utilities.currencySymbol})` },
            finalRevenue: { external: 'Receita Final', internal: `Receita Final (${Utilities.currencySymbol})` },
            commission: { external: 'Comissão', internal: `Comissão (${Utilities.currencySymbol})` } // ✅ CORRIGIDO: Adicionado campo commission
          },
          paymentMethodsSynthetic: {
            code: { external: 'Código', internal: `Código` },
            paymentMethod: { external: 'Meio de Pagamento', internal: `Meio de Pagamento` },
            cost: { external: 'Custo', internal: `Custo (${Utilities.currencySymbol})` },
            value: { external: 'Valor', internal: `Valor (${Utilities.currencySymbol})` },
            revenue: { external: 'Receita', internal: `Receita (${Utilities.currencySymbol})` }
          },
          paymentMethodsAnalytical: {
            date: { external: 'Data', internal: `Data` },
            code: { external: 'Código', internal: `Código` },
            saleCode: { external: 'Referência de Venda', internal: `Referência de Venda` },
            paymentMethod: { external: 'Meio de Pagamento', internal: `Meio de Pagamento` },
            note: { external: 'Observação', internal: `Observação` },
            fee: { external: 'Taxa', internal: `Taxa (${Utilities.currencySymbol})` },
            cost: { external: 'Custo', internal: `Custo (${Utilities.currencySymbol})` },
            value: { external: 'Valor', internal: `Valor (${Utilities.currencySymbol})` },
            revenue: { external: 'Receita', internal: `Receita (${Utilities.currencySymbol})` }
          },
          salesPerUserSynthetic: {
            collaborator: { external: 'Colaborador', internal: 'Colaborador' }, // ✅ CORRIGIDO: era "extenal"
            salesQuantity: { external: 'Quantidade de Vendas', internal: 'Quantidade de Vendas' }, // ✅ CORRIGIDO: era "extenal"
            product: { external: 'Código de Produto', internal: 'Produto' }, // ✅ CORRIGIDO: era "extenal"
            category: { external: 'Categoria de Produto', internal: 'Categoria' }, // ✅ CORRIGIDO: era "extenal"
            provider: { external: 'Fornecedor', internal: 'Fornecedor' }, // ✅ CORRIGIDO: era "extenal" e "Forcecedor"
            totalQuantity: { external: 'Quantidade', internal: 'Quantidade' }, // ✅ CORRIGIDO: era "extenal"
            revenue: { external: 'Total de Vendas', internal: `Total de Vendas (${Utilities.currencySymbol})` }, // ✅ CORRIGIDO: era "extenal"
            partialRevenue: { external: 'Receita Parcial', internal: `Receita Parcial (${Utilities.currencySymbol})` }, // ✅ CORRIGIDO: era "extenal"
            netRevenue: { external: 'Receita Líquida (s/ Taxas)', internal: `Receita Líquida (${Utilities.currencySymbol})` },
            finalRevenue: { external: 'Receita Final', internal: `Receita Final (${Utilities.currencySymbol})` }, // ✅ CORRIGIDO: era "extenal"
            costs: { external: 'Custos', internal: `Custos (${Utilities.currencySymbol})` }, // ✅ CORRIGIDO: era "extenal"
            contributionMargin: { external: 'Margem de Lucro', internal: `Margem de Lucro %` }, // ✅ CORRIGIDO: era "extenal"
            products: {
              external: 'Produtos', internal: {
                label: 'Produtos',
                sub: {
                  code: 'Código',
                  description: 'Descrição',
                  category: "Categoria",
                  provider: "Fornecedor",
                  quantity: 'Quantidade',
                  cost: `Custo Unitário (${Utilities.currencySymbol})`,
                  totalCost: `Custo Total (${Utilities.currencySymbol})`,
                  unitaryPrice: `Preço Unitário (${Utilities.currencySymbol})`,
                  totalPrice: `Preço Total (${Utilities.currencySymbol})`,
                  discount: `Desconto (${Utilities.currencySymbol})`,
                  fee: `Taxa (${Utilities.currencySymbol})`,
                  paid: `Pago (${Utilities.currencySymbol})`
                }
              }
            }
          },
          salesPerUserAnalytical: {
            date: { external: 'Data', internal: 'Data' },
            saleCode: { external: 'Ref. Venda', internal: 'Ref. Venda' },
            collaborator: { external: 'Colaborador', internal: 'Colaborador' },
            customer: { external: 'Cliente', internal: 'Cliente' },
            // ✅ CORREÇÃO: CAMPOS QUE ESTAVAM FALTANDO - INÍCIO
            product: { external: 'Produto', internal: 'Produto' },
            category: { external: 'Categoria', internal: 'Categoria' },
            provider: { external: 'Fornecedor', internal: 'Fornecedor' },
            totalQuantity: { external: 'Quantidade', internal: 'Quantidade' },
            costs: { external: 'Custos', internal: `Custos (${Utilities.currencySymbol})` },
            contributionMargin: { external: 'Margem de Contribuição', internal: 'Margem de Contribuição %' },
            netRevenue: { external: 'Receita Líquida (s/ Taxas)', internal: `Receita Líquida (${Utilities.currencySymbol})` },
            // ✅ CORREÇÃO: CAMPOS QUE ESTAVAM FALTANDO - FIM
            products: {
              external: 'Produtos', internal: {
                label: 'Produtos',
                sub: {
                  code: 'Código',
                  description: 'Descrição',
                  category: 'Categoria',
                  provider: 'Fornecedor',
                  quantity: 'Quantidade',
                  cost: `Custo (${Utilities.currencySymbol})`,
                  totalCost: `Custo Total (${Utilities.currencySymbol})`,
                  price: `Preço (${Utilities.currencySymbol})`,
                  totalPrice: `Preço Total (${Utilities.currencySymbol})`,
                  discount: `Desconto (${Utilities.currencySymbol})`,
                  fee: `Taxa (${Utilities.currencySymbol})`,
                  paid: `Pago (${Utilities.currencySymbol})`
                }
              }
            },
            paymentMethods: {
              external: 'Meios de Pagamento', internal: {
                label: 'Meios de Pagamento',
                sub: {
                  code: 'Código',
                  description: 'Descrição',
                  note: 'Observação',
                  cost: `Custo (${Utilities.currencySymbol})`,
                  value: `Valor (${Utilities.currencySymbol})`
                }
              }
            },
            discount: { external: 'Desconto', internal: `Desconto (${Utilities.currencySymbol})` },
            fee: { external: 'Taxa', internal: `Taxa (${Utilities.currencySymbol})` },
            saleValue: { external: 'Valor de Venda', internal: `Valor de Venda (${Utilities.currencySymbol})` },
            servicesCosts: { external: 'Custo de Serviços', internal: `Custo de Serviços (${Utilities.currencySymbol})` },
            productsCosts: { external: 'Custo de Produtos', internal: `Custo de Produtos (${Utilities.currencySymbol})` },
            paymentsCosts: { external: 'Custo de Pagamento', internal: `Custo de Pagamento (${Utilities.currencySymbol})` },
            totalCosts: { external: 'Total de Custos', internal: `Total de Custos (${Utilities.currencySymbol})` },
            partialRevenue: { external: 'Receita Parcial', internal: `Receita Parcial (${Utilities.currencySymbol})` },
            finalRevenue: { external: 'Receita Final', internal: `Receita Final (${Utilities.currencySymbol})` },
            commission: { external: 'Comissão', internal: `Comissão (${Utilities.currencySymbol})` } // ✅ CORRIGIDO: Adicionado campo commission
          }
        },
        label: {
          total: 'Total'
        }
      },
      inflows: {
        types: {
          inflowsReportSynthetic: 'Relatório de Entradas (Sintético)',
          inflowsReportAnalytical: 'Relatório de Entradas (Analítico)'
        },
        fields: {
          inflowsReportSynthetic: {
            date: { external: 'Data', internal: 'Data' },
            inputsQuantity: { external: 'Quantidade de Entradas', internal: 'Quantidade de Entradas' },
            total: { external: 'Total', internal: `Total (${Utilities.currencySymbol})` }
          },
          inflowsReportAnalytical: {
            date: { external: 'Data', internal: 'Data' },
            code: { external: 'Código', internal: 'Código' },
            referenceCode: { external: 'Código de Referência', internal: 'Código de Referência' },
            collaborator: { external: 'Colaborador', internal: `Colaborador` },
            category: { external: 'Categoria', internal: `Categoria` },
            note: { external: 'Observação', internal: 'Observação' },
            value: { external: 'Valor', internal: `Valor (${Utilities.currencySymbol})` }
          }
        },
        label: {
          total: 'Total'
        }
      },
      outflows: {
        types: {
          outflowsReportSynthetic: 'Relatório de Saídas (Sintético)',
          outflowsReportAnalytical: 'Relatório de Saídas (Analítico)'
        },
        fields: {
          outflowsReportSynthetic: {
            date: { external: 'Data', internal: 'Data' },
            outputsQuantity: { external: 'Número de Saídas', internal: 'Número de Saídas' },
            total: { external: 'Total de Saídas', internal: `Total de Saídas (${Utilities.currencySymbol})` }
          },
          outflowsReportAnalytical: {
            date: { external: 'Data', internal: 'Data' },
            code: { external: 'Código', internal: 'Código' },
            referenceCode: { external: 'Código de Referência', internal: 'Código de Referência' },
            collaborator: { external: 'Colaborador', internal: `Colaborador` },
            category: { external: 'Categoria', internal: `Categoria` },
            note: { external: 'Observação', internal: 'Observação' },
            value: { external: 'Valor', internal: `Valor (${Utilities.currencySymbol})` }
          }
        },
        label: {
          total: 'Total'
        }
      },
      afterSales: {
        fields: {
          default: {
            date: { external: 'Data', internal: 'Data' },
            saleCode: { external: 'Ref. Venda', internal: 'Ref. Venda' },
            serviceCode: { external: 'Ref. OS', internal: 'Ref. OS' },
            customer: { external: 'Cliente', internal: 'Cliente' },
            collaborator: { external: 'Colaborador', internal: 'Colaborador' },
            phone: { external: 'Telefone', internal: 'Telefone' },
            email: { external: 'E-mail', internal: 'E-mail' },
            services: {
              external: 'Serviços', internal: {
                label: 'Serviços',
                sub: {
                  code: 'Código',
                  name: 'Nome',
                  value: `Valor (${Utilities.currencySymbol})`
                }
              }
            },
            products: {
              external: 'Produtos', internal: {
                label: 'Produtos',
                sub: {
                  code: 'Código',
                  name: 'Nome',
                  quantity: 'Quantidade',
                  value: `Valor (${Utilities.currencySymbol})`
                }
              }
            },
            paymentMethods: {
              external: 'Meios de Pagamento', internal: {
                label: 'Meios de Pagamento',
                sub: {
                  code: 'Código',
                  description: 'Descrição',
                  note: 'Observação',
                  cost: `Custo (${Utilities.currencySymbol})`,
                  value: `Valor (${Utilities.currencySymbol})`
                }
              }
            },
            value: { external: 'Valor', internal: `Valor (${Utilities.currencySymbol})` }
          }
        },
        label: {
          total: 'Total'
        }
      },
      historic: {
        fields: {
          default: {
            date: { external: 'Data', internal: 'Data' },
            code: { external: 'Código', internal: 'Código' },
            operator: { external: 'Colaborador', internal: 'Colaborador' },
            value: { external: `Valor (${Utilities.currencySymbol})`, internal: `Valor (${Utilities.currencySymbol})` },
            type: {
              external: 'Tipo', internal: {
                label: 'Tipo',
                enum: {
                  'OPENING': 'ABERTURA',
                  'CLOSING': 'FECHAMENTO'
                }
              }
            }
          }
        }
      }
    },
    'en_US': {
      _general: {
        form: {
          store: {
            title: 'Store'
          },
          period: {
            title: 'Period',
            label: {
              option: {
                today: 'Today',
                currentWeek: 'This week',
                currentMonth: 'This month',
                lastMonth: 'Last month',
                custom: 'Custom'
              },
              start: 'Start',
              end: 'End'
            }
          },
          reportType: {
            title: 'Report Type'
          },
          reportFields: {
            title: 'Report Fields'
          },
          button: {
            generate: 'Generate Report'
          },
          collaborator: {
            title: "Collaborator",
            list: {
              all: "All Collaborators"
            }
          },
          products: {
            code: { label: 'Product Code' },
            provider: {
              title: "Product Provider",
              list: {
                all: "All"
              }
            },
            categories: {
              title: "Product Category",
              list: {
                all: "All"
              }
            }
          }
        },
        layer: {
          titleBar: {
            generated: ['Generated on', 'at'],
            button: {
              exportXLS: 'Export XLS'
            }
          },
          information: {
            label: {
              address: 'Address',
              phone: 'Phone',
              period: ['Period', 'to']
            }
          },
          warning: {
            noData: 'No records were found for the selected period.'
          }
        }
      },
      resume: {
        fields: {
          default: {
            date: { external: 'Date', internal: 'Date' },
            sales: { external: 'Sales Value', internal: `Sales Value (${Utilities.currencySymbol})` },
            inputs: { external: 'Inputs Value', internal: `Inputs Value (${Utilities.currencySymbol})` },
            outputs: { external: 'Outputs Value', internal: `Outputs Value (${Utilities.currencySymbol})` },
            servicesCosts: { external: 'Service Costs', internal: `Service Costs (${Utilities.currencySymbol})` },
            productsCosts: { external: 'Product Costs', internal: `Product Costs (${Utilities.currencySymbol})` },
            paymentsCosts: { external: 'Payment Costs', internal: `Payment Costs (${Utilities.currencySymbol})` },
            totalCosts: { external: 'Total Costs', internal: `Total Costs (${Utilities.currencySymbol})` },
            totalTaxes: { external: 'Total Taxes', internal: `Total Taxes (${Utilities.currencySymbol})` },
            partialRevenue: { external: 'Partial Revenue', internal: `Partial Revenue (${Utilities.currencySymbol})` },
            commission: { external: 'Commission', internal: `Commission (${Utilities.currencySymbol})` },
            finalRevenue: { external: 'Final Revenue', internal: `Final Revenue (${Utilities.currencySymbol})` }
          }
        },
        label: {
          total: 'Total'
        }
      },
      sales: {
        types: {
          salesReportSynthetic: 'Sales Report (Synthetic)',
          salesReportAnalytical: 'Sales Report (Analytical)',
          paymentMethodsSynthetic: 'Payment Methods Report (Synthetic)',
          paymentMethodsAnalytical: 'Payment Methods Report (Analytical)',
          salesPerUserSynthetic: 'Sales Report by User (Synthetic)',
          salesPerUserAnalytical: 'Sales Report by User (Analytical)'
        },
        fields: {
          salesReportSynthetic: {
            date: { external: 'Date', internal: 'Date' },
            number: { external: 'Sales Number', internal: 'Sales Number' },
            billed: { external: 'Sales Billed', internal: 'Sales Billed' },
            salesTotal: { external: 'Sales Value', internal: `Sales Value (${Utilities.currencySymbol})` },
            servicesCosts: { external: 'Cost of Services', internal: `Cost of Services (${Utilities.currencySymbol})` },
            productsCosts: { external: 'Cost of Products', internal: `Cost of Products (${Utilities.currencySymbol})` },
            paymentsCosts: { external: 'Cost of Payments', internal: `Cost of Payments (${Utilities.currencySymbol})` },
            totalCosts: { external: 'Total Costs', internal: `Total Costs (${Utilities.currencySymbol})` },
            totalTaxes: { external: 'Total Taxes', internal: `Total Taxes (${Utilities.currencySymbol})` },
            totalUnbilled: { external: 'Total Unbilled', internal: `Total Unbilled (${Utilities.currencySymbol})` },
            partialRevenue: { external: 'Partial Revenue', internal: `Partial Revenue (${Utilities.currencySymbol})` },
            finalRevenue: { external: 'Final Revenue', internal: `Final Revenue (${Utilities.currencySymbol})` },
            commission: { external: 'Commission', internal: `Commission (${Utilities.currencySymbol})` }
          },
          salesReportAnalytical: {
            date: { external: 'Date', internal: 'Date' },
            saleCode: { external: 'Sale Reference', internal: 'Sale Reference' },
            serviceCode: { external: 'Service Order Reference', internal: 'Service Order Reference' },
            customer: { external: 'Customer', internal: 'Customer' },
            collaborator: { external: 'Collaborator', internal: 'Collaborator' },
            services: {
              external: 'Services', internal: {
                label: 'Services',
                sub: {
                  code: 'Code',
                  description: 'Description',
                  value: `Amount (${Utilities.currencySymbol})`,
                  cost: `Unitary Cost (${Utilities.currencySymbol})`,
                  totalCost: `Total Cost (${Utilities.currencySymbol})`,
                  unitaryPrice: `UnitaryPrice (${Utilities.currencySymbol})`,
                  totalPrice: `Total Price (${Utilities.currencySymbol})`,
                  discount: `Discount (${Utilities.currencySymbol})`,
                  fee: `Fee (${Utilities.currencySymbol})`,
                  paid: `Paid (${Utilities.currencySymbol})`
                }
              }
            },
            products: {
              external: 'Products',
              internal: {
                label: 'Products',
                sub: {
                  code: 'Code',
                  description: 'Description',
                  provider: 'Provider',
                  category: 'Category',
                  quantity: 'Quantity',
                  cost: `Unit Cost (${Utilities.currencySymbol})`,
                  totalCost: `Total Cost (${Utilities.currencySymbol})`,
                  unitaryPrice: `Unit Price (${Utilities.currencySymbol})`,
                  totalPrice: `Total Price (${Utilities.currencySymbol})`,
                  discount: `Discount (${Utilities.currencySymbol})`,
                  fee: `Fee (${Utilities.currencySymbol})`,
                  paid: `Paid (${Utilities.currencySymbol})`
                }
              }
            },
            paymentMethods: {
              external: 'Payment Methods', internal: {
                label: 'Payment Methods',
                sub: {
                  code: 'Code',
                  description: 'Description',
                  note: 'Note',
                  cost: `Cost (${Utilities.currencySymbol})`,
                  value: `Amount (${Utilities.currencySymbol})`
                }
              }
            },
            taxes: {
              external: 'Taxes', internal: {
                label: 'Taxes',
                sub: {
                  icms: `ICMS (${Utilities.currencySymbol})`,
                  pis: `PIS (${Utilities.currencySymbol})`,
                  cofins: `COFINS (${Utilities.currencySymbol})`,
                  iss: `ISS (${Utilities.currencySymbol})`,
                  total: `TOTAL (${Utilities.currencySymbol})`
                }
              }
            },
            discount: { external: 'Discount', internal: `Discount (${Utilities.currencySymbol})` },
            fee: { external: 'Fee', internal: `Fee (${Utilities.currencySymbol})` },
            additional: { external: 'Additional', internal: `Additional (${Utilities.currencySymbol})` },
            saleValue: { external: 'Sale Value', internal: `Sale Value (${Utilities.currencySymbol})` },
            unbilledValue: { external: 'Unbilled Value', internal: `Unbilled Value (${Utilities.currencySymbol})` },
            servicesCosts: { external: 'Cost of Services', internal: `Cost of Services (${Utilities.currencySymbol})` },
            productsCosts: { external: 'Cost of Products', internal: `Cost of Products (${Utilities.currencySymbol})` },
            paymentsCosts: { external: 'Cost of Payment', internal: `Cost of Payment (${Utilities.currencySymbol})` },
            totalCosts: { external: 'Total Costs', internal: `Total Costs (${Utilities.currencySymbol})` },
            totalTaxes: { external: 'Total Taxes', internal: `Total Taxes (${Utilities.currencySymbol})` },
            partialRevenue: { external: 'Partial Revenue', internal: `Partial Revenue (${Utilities.currencySymbol})` },
            finalRevenue: { external: 'Final Revenue', internal: `Final Revenue (${Utilities.currencySymbol})` },
            commission: { external: 'Commission', internal: `Commission (${Utilities.currencySymbol})` }
          },
          paymentMethodsSynthetic: {
            code: { external: 'Code', internal: `Code` },
            paymentMethod: { external: 'Payment Methods', internal: `Payment Methods` },
            cost: { external: 'Cost', internal: `Cost (${Utilities.currencySymbol})` },
            value: { external: 'Amount', internal: `Amount (${Utilities.currencySymbol})` },
            revenue: { external: 'Revenue', internal: `Revenue (${Utilities.currencySymbol})` }
          },
          paymentMethodsAnalytical: {
            date: { external: 'Date', internal: `Date` },
            code: { external: 'Code', internal: `Code` },
            saleCode: { external: 'Reference Sale', internal: `Reference Sale` },
            paymentMethod: { external: 'Payment Methods', internal: `Payment Methods` },
            note: { external: 'Note', internal: `Note` },
            fee: { external: 'Fee', internal: `Fee (${Utilities.currencySymbol})` },
            cost: { external: 'Cost', internal: `Cost (${Utilities.currencySymbol})` },
            value: { external: 'Amount', internal: `Amount (${Utilities.currencySymbol})` },
            revenue: { external: 'Revenue', internal: `Revenue (${Utilities.currencySymbol})` }
          },
          salesPerUserSynthetic: {
            collaborator: { external: 'Collaborator', internal: 'Collaborator' },
            salesQuantity: { external: 'Sales Quantity', internal: 'Sales Quantity' },
            product: { external: 'Product Code', internal: 'Product' },
            category: { external: 'Product Category', internal: 'Category' },
            provider: { external: 'Provider', internal: 'Provider' },
            totalCost: { external: 'Costs', internal: 'Costs' },
            totalQuantity: { external: 'Quantity', internal: 'Quantity' },
            partialRevenue: { external: 'Revenue', internal: `Partial Revenue (${Utilities.currencySymbol})` },
            netRevenue: { external: 'Net Revenue (no fees)', internal: `Net Revenue (${Utilities.currencySymbol})` },
            finalRevenue: { external: 'Revenue', internal: `Final Revenue (${Utilities.currencySymbol})` },
            costs: { external: 'Costs', internal: `Costs (${Utilities.currencySymbol})` },
            contributionMargin: { external: 'Profit Margin', internal: `Profit Margin %` },
            products: {
              external: 'Products', internal: {
                label: 'Products',
                sub: {
                  code: 'Code',
                  description: 'Description',
                  category: 'Category',
                  provider: 'Provider',
                  quantity: 'Quantity',
                  cost: `Unit Cost (${Utilities.currencySymbol})`,
                  totalCost: `Total Cost (${Utilities.currencySymbol})`,
                  unitaryPrice: `Unit Price (${Utilities.currencySymbol})`,
                  totalPrice: `Total Price (${Utilities.currencySymbol})`,
                  discount: `Discount (${Utilities.currencySymbol})`,
                  fee: `Fee (${Utilities.currencySymbol})`,
                  paid: `Paid (${Utilities.currencySymbol})`
                }
              }
            }
          },
          salesPerUserAnalytical: {
            date: { external: 'Date', internal: 'Date' },
            saleCode: { external: 'Sale Ref.', internal: 'Sale Ref.' },
            collaborator: { external: 'Collaborator', internal: 'Collaborator' },
            customer: { external: 'Customer', internal: 'Customer' },
            // ✅ CORREÇÃO: CAMPOS QUE ESTAVAM FALTANDO - INÍCIO
            product: { external: 'Product', internal: 'Product' },
            category: { external: 'Category', internal: 'Category' },
            provider: { external: 'Provider', internal: 'Provider' },
            totalQuantity: { external: 'Quantity', internal: 'Quantity' },
            costs: { external: 'Costs', internal: `Costs (${Utilities.currencySymbol})` },
            contributionMargin: { external: 'Contribution Margin', internal: 'Contribution Margin %' },
            netRevenue: { external: 'Net Revenue (no fees)', internal: `Net Revenue (${Utilities.currencySymbol})` },
            // ✅ CORREÇÃO: CAMPOS QUE ESTAVAM FALTANDO - FIM
            products: {
              external: 'Products', internal: {
                label: 'Products',
                sub: {
                  code: 'Code',
                  description: 'Description',
                  category: 'Category',
                  provider: 'Provider',
                  quantity: 'Quantity',
                  cost: `Cost (${Utilities.currencySymbol})`,
                  totalCost: `Total Cost (${Utilities.currencySymbol})`,
                  price: `Price (${Utilities.currencySymbol})`,
                  totalPrice: `Total Price (${Utilities.currencySymbol})`,
                  discount: `Discount (${Utilities.currencySymbol})`,
                  fee: `Fee (${Utilities.currencySymbol})`,
                  paid: `Paid (${Utilities.currencySymbol})`
                }
              }
            },
            paymentMethods: {
              external: 'Payment Methods', internal: {
                label: 'Payment Methods',
                sub: {
                  code: 'Code',
                  description: 'Description',
                  note: 'Note',
                  cost: `Cost (${Utilities.currencySymbol})`,
                  value: `Amount (${Utilities.currencySymbol})`
                }
              }
            },
            discount: { external: 'Discount', internal: `Discount (${Utilities.currencySymbol})` },
            fee: { external: 'Fee', internal: `Fee (${Utilities.currencySymbol})` },
            saleValue: { external: 'Sale Value', internal: `Sale Value (${Utilities.currencySymbol})` },
            servicesCosts: { external: 'Cost of Services', internal: `Cost of Services (${Utilities.currencySymbol})` },
            productsCosts: { external: 'Cost of Products', internal: `Cost of Products (${Utilities.currencySymbol})` },
            paymentsCosts: { external: 'Cost of Payment', internal: `Cost of Payment (${Utilities.currencySymbol})` },
            totalCosts: { external: 'Total Costs', internal: `Total Costs (${Utilities.currencySymbol})` },
            partialRevenue: { external: 'Partial Revenue', internal: `Partial Revenue (${Utilities.currencySymbol})` },
            finalRevenue: { external: 'Final Revenue', internal: `Final Revenue (${Utilities.currencySymbol})` },
            commission: { external: 'Commission', internal: `Commission (${Utilities.currencySymbol})` }
          }
        },
        label: {
          total: 'Total'
        }
      },
      inflows: {
        types: {
          inflowsReportSynthetic: 'Inputs Report (Synthetic)',
          inflowsReportAnalytical: 'Inputs Report (Analytical)'
        },
        fields: {
          inflowsReportSynthetic: {
            date: { external: 'Date', internal: 'Date' },
            inputsQuantity: { external: 'Inputs Quantity', internal: 'Inputs Quantity' },
            total: { external: 'Total', internal: `Total (${Utilities.currencySymbol})` }
          },
          inflowsReportAnalytical: {
            date: { external: 'Date', internal: 'Date' },
            code: { external: 'Code', internal: 'Code' },
            referenceCode: { external: 'Reference Code', internal: 'Reference Code' },
            collaborator: { external: 'Collaborator', internal: `Collaborator` },
            category: { external: 'Category', internal: `Category` },
            note: { external: 'Note', internal: 'Note' },
            value: { external: 'Amount', internal: `Amount (${Utilities.currencySymbol})` }
          }
        },
        label: {
          total: 'Total'
        }
      },
      outflows: {
        types: {
          outflowsReportSynthetic: 'Outputs Report (Synthetic)',
          outflowsReportAnalytical: 'Outputs Report (Analytical)'
        },
        fields: {
          outflowsReportSynthetic: {
            date: { external: 'Date', internal: 'Date' },
            outputsQuantity: { external: 'Outputs Quantity', internal: 'Outputs Quantity' },
            total: { external: 'Total', internal: `Total (${Utilities.currencySymbol})` }
          },
          outflowsReportAnalytical: {
            date: { external: 'Date', internal: 'Date' },
            code: { external: 'Code', internal: 'Code' },
            referenceCode: { external: 'Reference Code', internal: 'Reference Code' },
            collaborator: { external: 'Collaborator', internal: `Collaborator` },
            category: { external: 'Category', internal: `Category` },
            note: { external: 'Note', internal: 'Note' },
            value: { external: 'Amount', internal: `Amount (${Utilities.currencySymbol})` }
          }
        },
        label: {
          total: 'Total'
        }
      },
      afterSales: {
        fields: {
          default: {
            date: { external: 'Date', internal: 'Date' },
            saleCode: { external: 'Sale Reference', internal: 'Sale Reference' },
            serviceCode: { external: 'Service Order Reference', internal: 'Service Order Reference' },
            customer: { external: 'Customer', internal: 'Customer' },
            collaborator: { external: 'Collaborator', internal: 'Collaborator' },
            phone: { external: 'Phone', internal: 'Phone' },
            email: { external: 'Email', internal: 'Email' },
            services: {
              external: 'Services', internal: {
                label: 'Services',
                sub: {
                  code: 'Code',
                  name: 'Name',
                  value: `Amount (${Utilities.currencySymbol})`
                }
              }
            },
            products: {
              external: 'Products', internal: {
                label: 'Products',
                sub: {
                  code: 'Code',
                  name: 'Name',
                  quantity: 'Quantity',
                  value: `Amount (${Utilities.currencySymbol})`
                }
              }
            },
            paymentMethods: {
              external: 'Payment Methods', internal: {
                label: 'Payment Methods',
                sub: {
                  code: 'Code',
                  description: 'Description',
                  note: 'Note',
                  cost: `Cost (${Utilities.currencySymbol})`,
                  value: `Amount (${Utilities.currencySymbol})`
                }
              }
            },
            value: { external: 'Amount', internal: `Amount (${Utilities.currencySymbol})` }
          }
        },
        label: {
          total: 'Total'
        }
      },
      historic: {
        fields: {
          default: {
            date: { external: 'Date', internal: 'Date' },
            code: { external: 'Code', internal: 'Code' },
            operator: { external: 'Collaborator', internal: 'Collaborator' },
            value: { external: `Value (${Utilities.currencySymbol})`, internal: `Value (${Utilities.currencySymbol})` },
            type: {
              external: 'Type', internal: {
                label: 'Type',
                enum: {
                  'OPENING': 'OPENING',
                  'CLOSING': 'CLOSING'
                }
              }
            }
          }
        }
      }
    }
  }

  public static get(language?: string) {
    return ReportsCashierTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
