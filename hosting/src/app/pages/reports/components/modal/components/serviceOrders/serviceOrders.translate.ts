import { ProjectSettings } from "../../../../../../../assets/settings/company-settings";
import { Utilities } from "@shared/utilities/utilities";

export class ServiceOrdersReportsTranslate {

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
              all: "Todos os colaboradores"
            }
          },
          executor: {
            title: "Responsável",
            list: {
              all: "Todos os Responsáveis"
            }
          }
        },
        layer: {
          titleBar: {
            generated: [ 'Gerado em', 'às' ],
            button: {
              exportXLS: 'Exportar XLS'
            }
          },
          information: {
            label: {
              address: 'Endereço',
              phone: 'Telefone',
              period: [ 'Período', 'à' ]
            }
          },
          warning: {
            noData: 'Nenhum registro foi encontrado para o período selecionado.'
          },
          label: {
            total: 'Total'
          }
        },
        warning: {
          noData: "Nenhum registro foi encontrado para o período selecionado."
        }
      },
      resume: {
        fields: {
          default: {
            date: { external: 'Data', internal: 'Data' },
            quantity: { external: 'Quantidade', internal: 'Quantidade' },
            servicesCosts: { external: 'Custo dos Serviços', internal: `Custo dos Serviço (${Utilities.currencySymbol})` },
            productsCosts: { external: 'Custo dos Produtos', internal: `Custo dos Produtos (${Utilities.currencySymbol})` },
            totalCosts: { external: 'Total de Custos', internal: `Total de Custos (${Utilities.currencySymbol})` },
            partialRevenue: { external: 'Receita Parcial', internal: `Receita Parcial (${Utilities.currencySymbol})` },
            finalRevenue: { external: 'Receita Final', internal: `Receita Final (${Utilities.currencySymbol})` }
          }
        }
      },
      internal: {
        types: {
          servicesInternalReportSynthetic: 'Relatório Sintético',
          servicesInternalReportAnalytical: 'Relatório Analítico'
        },
        fields: {
          servicesInternalReportSynthetic: {
            date: { external: 'Data', internal: 'Data' },
            quantity: { external: 'Quantidade', internal: 'Quantidade' },
            servicesCosts: { external: 'Custo dos Serviços', internal: `Custo dos Serviço (${Utilities.currencySymbol})` },
            productsCosts: { external: 'Custo dos Produtos', internal: `Custo dos Produtos (${Utilities.currencySymbol})` },
            totalCosts: { external: 'Total de Custos', internal: `Total de Custos (${Utilities.currencySymbol})` },
            partialRevenue: { external: 'Receita Parcial', internal: `Receita Parcial (${Utilities.currencySymbol})` },
            finalRevenue: { external: 'Receita Final', internal: `Receita Final (${Utilities.currencySymbol})` }
          },
          servicesInternalReportAnalytical: {
            date: { external: 'Data', internal: 'Data' },
            code: { external: 'Código', internal: 'Código' },
            customer: { external: 'Cliente', internal: 'Cliente' },
            collaborator: { external: 'Colaborador', internal: 'Colaborador' },
            services: { external: 'Serviços', internal: {
              label: 'Serviços',
              sub: {
                code: 'Código',
                name: 'Nome',
                cost: `Custo (${Utilities.currencySymbol})`,
                price: `Preço (${Utilities.currencySymbol})`,
                discount: `Desconto (${Utilities.currencySymbol})`,
                fee: `Taxa (${Utilities.currencySymbol})`
              }
            }},
            products: { external: 'Produtos', internal: {
              label: 'Produtos',
              sub: {
                code: 'Código',
                name: 'Nome',
                quantity: 'Quantidade',
                cost: `Custo (${Utilities.currencySymbol})`,
                price: `Preço (${Utilities.currencySymbol})`,
                discount: `Desconto (${Utilities.currencySymbol})`,
                fee: `Taxa (${Utilities.currencySymbol})`
              }
            }},
            discount: { external: 'Desconto', internal: `Desconto (${Utilities.currencySymbol})` },
            fee: { external: 'Taxa', internal: `Taxa (${Utilities.currencySymbol})` },
            servicesCosts: { external: 'Custo dos Serviços', internal: `Custo dos Serviço (${Utilities.currencySymbol})` },
            productsCosts: { external: 'Custo dos Produtos', internal: `Custo dos Produtos (${Utilities.currencySymbol})` },
            totalCosts: { external: 'Total de Custos', internal: `Total de Custos (${Utilities.currencySymbol})` },
            partialRevenue: { external: 'Receita Parcial', internal: `Receita Parcial (${Utilities.currencySymbol})` },
            finalRevenue: { external: 'Receita Final', internal: `Receita Final (${Utilities.currencySymbol})` }
          }
        }
      },
      external: {
        types: {
          servicesExternalReportSynthetic: 'Relatório Sintético',
          servicesExternalReportAnalytical: 'Relatório Analítico'
        },
        fields: {
          servicesExternalReportSynthetic: {
            date: { external: 'Data', internal: 'Data' },
            quantity: { external: 'Quantidade', internal: 'Quantidade' },
            servicesCosts: { external: 'Custo dos Serviços', internal: `Custo dos Serviço (${Utilities.currencySymbol})` },
            productsCosts: { external: 'Custo dos Produtos', internal: `Custo dos Produtos (${Utilities.currencySymbol})` },
            totalCosts: { external: 'Total de Custos', internal: `Total de Custos (${Utilities.currencySymbol})` },
            partialRevenue: { external: 'Receita Parcial', internal: `Receita Parcial (${Utilities.currencySymbol})` },
            finalRevenue: { external: 'Receita Final', internal: `Receita Final (${Utilities.currencySymbol})` }
          },
          servicesExternalReportAnalytical: {
            date: { external: 'Data', internal: 'Data' },
            code: { external: 'Código', internal: 'Código' },
            collaborator: { external: 'Colaborador', internal: 'Colaborador' },
            customer: { external: 'Cliente', internal: 'Cliente' },
            services: { external: 'Serviços', internal: {
              label: 'Serviços',
              sub: {
                code: 'Código',
                name: 'Nome',
                cost: `Custo (${Utilities.currencySymbol})`,
                price: `Preço (${Utilities.currencySymbol})`,
                discount: `Desconto (${Utilities.currencySymbol})`,
                fee: `Taxa (${Utilities.currencySymbol})`
              }
            }},
            products: { external: 'Produtos', internal: {
              label: 'Produtos',
              sub: {
                code: 'Código',
                name: 'Nome',
                quantity: 'Quantidade',
                cost: `Custo (${Utilities.currencySymbol})`,
                price: `Preço (${Utilities.currencySymbol})`,
                discount: `Desconto (${Utilities.currencySymbol})`,
                fee: `Taxa (${Utilities.currencySymbol})`
              }
            }},
            discount: { external: 'Desconto', internal: `Desconto (${Utilities.currencySymbol})` },
            fee: { external: 'Taxa', internal: `Taxa (${Utilities.currencySymbol})` },
            servicesCosts: { external: 'Custo dos Serviços', internal: `Custo dos Serviço (${Utilities.currencySymbol})` },
            productsCosts: { external: 'Custo dos Produtos', internal: `Custo dos Produtos (${Utilities.currencySymbol})` },
            totalCosts: { external: 'Total de Custos', internal: `Total de Custos (${Utilities.currencySymbol})` },
            partialRevenue: { external: 'Receita Parcial', internal: `Receita Parcial (${Utilities.currencySymbol})` },
            finalRevenue: { external: 'Receita Final', internal: `Receita Final (${Utilities.currencySymbol})` }
          }
        }
      },
      curveABC: {
        fields: {
          default: {
            code: { external: 'Código', internal: 'Código' },
            name: { external: 'Nome', internal: 'Nome' },
            quantity: { external: 'Quantidade', internal: 'Quantidade' },
            averageCost: { external: 'Custo Médio', internal: `Custo Médio (${Utilities.currencySymbol})` },
            averagePrice: { external: 'Preço Médio', internal: `Preço Médio (${Utilities.currencySymbol})` },
            revenue: { external: 'Faturamento', internal: `Faturamento (${Utilities.currencySymbol})` }
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
                currentWeek: 'Current Week',
                currentMonth: 'Current Month',
                lastMonth: "Last Month",
                custom: 'Personalizado'
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
            title: "Colaborator",
            list: {
              all: "All Colaborators"
            }
          },
          executor: {
            title: "Responsible",
            list: {
              all: "All Responsibles"
            }
          }
        },
        layer: {
          titleBar: {
            generated: [ 'Generated on', 'at' ],
            button: {
              exportXLS: 'Export XLS'
            }
          },
          information: {
            label: {
              address: 'Address',
              phone: 'Phone',
              period: [ 'Period', 'to' ]
            }
          },
          warning: {
            noData: 'No records were found for the selected period.'
          },
          label: {
            total: 'Total'
          }
        },
        warning: {
          noData: "No records were found for the selected period."
        }
      },
      resume: {
        fields: {
          default: {
            date: { external: 'Date', internal: 'Date' },
            quantity: { external: 'Quantity', internal: 'Quantity' },
            servicesCosts: { external: 'Services Costs', internal: `Services Costs (${Utilities.currencySymbol})` },
            productsCosts: { external: 'Products Costs', internal: `Products Costs (${Utilities.currencySymbol})` },
            totalCosts: { external: 'Total Costs', internal: `Total Costs (${Utilities.currencySymbol})` },
            partialRevenue: { external: 'Partial Revenue', internal: `Partial Revenue (${Utilities.currencySymbol})` },
            finalRevenue: { external: 'Final Revenue', internal: `Final Revenue (${Utilities.currencySymbol})` }
          }
        }
      },
      internal: {
        types: {
          servicesInternalReportSynthetic: 'Synthetic Report',
          servicesInternalReportAnalytical: 'Analytical report'
        },
        fields: {
          servicesInternalReportSynthetic: {
            date: { external: 'Date', internal: 'Date' },
            quantity: { external: 'Quantity', internal: 'Quantity' },
            servicesCosts: { external: 'Services Costs', internal: `Services Costs (${Utilities.currencySymbol})` },
            productsCosts: { external: 'Products Costs', internal: `Products Costs (${Utilities.currencySymbol})` },
            totalCosts: { external: 'Total Costs', internal: `Total Costs (${Utilities.currencySymbol})` },
            partialRevenue: { external: 'Partial Revenue', internal: `Partial Revenue (${Utilities.currencySymbol})` },
            finalRevenue: { external: 'Final Revenue', internal: `Final Revenue (${Utilities.currencySymbol})` }
          },
          servicesInternalReportAnalytical: {
            date: { external: 'Date', internal: 'Date' },
            code: { external: 'Code', internal: 'Code' },
            customer: { external: 'Customer', internal: 'Customer' },
            collaborator: { external: 'Collaborator', internal: 'Collaborator' },
            services: { external: 'Services', internal: {
              label: 'Services',
              sub: {
                code: 'Code',
                name: 'Name',
                cost: `Cost (${Utilities.currencySymbol})`,
                price: `Price (${Utilities.currencySymbol})`,
                discount: `Discount (${Utilities.currencySymbol})`,
                fee: `Fee (${Utilities.currencySymbol})`
              }          
            }},
            products: { external: 'Products', internal: {
              label: 'Products',
              sub: {
                code: 'Code',
                name: 'Name',
                quantity: 'Quantity',
                cost: `Cost (${Utilities.currencySymbol})`,
                price: `Price (${Utilities.currencySymbol})`,
                discount: `Discount (${Utilities.currencySymbol})`,
                fee: `Fee (${Utilities.currencySymbol})`
              }
            }},
            discount: { external: 'Discount', internal: `Discount (${Utilities.currencySymbol})` },
            fee: { external: 'Fee', internal: `Fee (${Utilities.currencySymbol})` },
            servicesCosts: { external: 'Services Costs', internal: `Services Costs (${Utilities.currencySymbol})` },
            productsCosts: { external: 'Products Costs', internal: `Products Costs (${Utilities.currencySymbol})` },
            totalCosts: { external: 'Total Costs', internal: `Total Costs (${Utilities.currencySymbol})` },
            partialRevenue: { external: 'Partial Revenue', internal: `Partial Revenue (${Utilities.currencySymbol})` },
            finalRevenue: { external: 'Final Revenue', internal: `Final Revenue (${Utilities.currencySymbol})` }
          }
        }
      },
      external: {
        types: {
          servicesExternalReportSynthetic: 'Synthetic Report',
          servicesExternalReportAnalytical: 'Analytical report'
        },
        fields: {
          servicesExternalReportSynthetic: {
            date: { external: 'Date', internal: 'Date' },
            quantity: { external: 'Quantity', internal: 'Quantity' },
            servicesCosts: { external: 'Services Costs', internal: `Services Costs (${Utilities.currencySymbol})` },
            productsCosts: { external: 'Products Costs', internal: `Products Costs (${Utilities.currencySymbol})` },
            totalCosts: { external: 'Total Costs', internal: `Total Costs (${Utilities.currencySymbol})` },
            partialRevenue: { external: 'Partial Revenue', internal: `Partial Revenue (${Utilities.currencySymbol})` },
            finalRevenue: { external: 'Final Revenue', internal: `Final Revenue (${Utilities.currencySymbol})` }
          },
          servicesExternalReportAnalytical: {
            date: { external: 'Date', internal: 'Date' },
            code: { external: 'Code', internal: 'Code' },
            customer: { external: 'Customer', internal: 'Customer' },
            collaborator: { external: 'Collaborator', internal: 'Collaborator' },
            services: { external: 'Services', internal: {
              label: 'Services',
              sub: {
                code: 'Code',
                name: 'Name',
                cost: `Cost (${Utilities.currencySymbol})`,
                price: `Price (${Utilities.currencySymbol})`,
                discount: `Discount (${Utilities.currencySymbol})`,
                fee: `Fee (${Utilities.currencySymbol})`
              }          
            }},
            products: { external: 'Products', internal: {
              label: 'Products',
              sub: {
                code: 'Code',
                name: 'Name',
                quantity: 'Quantity',
                cost: `Cost (${Utilities.currencySymbol})`,
                price: `Price (${Utilities.currencySymbol})`,
                discount: `Discount (${Utilities.currencySymbol})`,
                fee: `Fee (${Utilities.currencySymbol})`
              }
            }},
            discount: { external: 'Discount', internal: `Discount (${Utilities.currencySymbol})` },
            fee: { external: 'Fee', internal: `Fee (${Utilities.currencySymbol})` },
            servicesCosts: { external: 'Services Costs', internal: `Services Costs (${Utilities.currencySymbol})` },
            productsCosts: { external: 'Products Costs', internal: `Products Costs (${Utilities.currencySymbol})` },
            totalCosts: { external: 'Total Costs', internal: `Total Costs (${Utilities.currencySymbol})` },
            partialRevenue: { external: 'Partial Revenue', internal: `Partial Revenue (${Utilities.currencySymbol})` },
            finalRevenue: { external: 'Final Revenue', internal: `Final Revenue (${Utilities.currencySymbol})` }
          }
        }
      },
      curveABC: {
        fields: {
          default: {
            code: { external: 'Code', internal: 'Code' },
            name: { external: 'Name', internal: 'Name' },
            quantity: { external: 'Quantity', internal: 'Quantity' },
            averageCost: { external: 'Average Cost', internal: `Average Cost (${Utilities.currencySymbol})` },
            averagePrice: { external: 'Average Price', internal: `Average Price (${Utilities.currencySymbol})` },
            revenue: { external: 'Revenue', internal: `Revenue (${Utilities.currencySymbol})` }
          }
        }
      }
    }
  }

  public static get(language?: string) {
    return ServiceOrdersReportsTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}