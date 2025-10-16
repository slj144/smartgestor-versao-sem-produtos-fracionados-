import { ProjectSettings } from "../../../../../../../assets/settings/company-settings";
import { Utilities } from "@shared/utilities/utilities";

export class StockReportsTranslate {

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
          categories: {
            title: "Categorias",
            list: {
              all: "Todas as Categorias"
            }
          },
          departments: {
            title: "Departamentos",
            list: {
              all: "Todos os Departamentos"
            }
          },
          status: {
            title: "Status",
            list: {
              all: "Com Ou Sem Estoque",
              inStock: "Em Estoque",
              outStock: "Fora De Estoque",
              negativeStock: "Estoque Negativo",
              zeroOrNegative: "Zerado ou Negativo"
            }
          },
          button: {
            generate: 'Gerar Relatório'
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
          },
          label: {
            total: 'Total'
          }
        }
      },
      products: {
        fields: {
          default: {
            code: { external: 'Código', internal: 'Código' },
            name: { external: 'Nome', internal: 'Nome' },
            category: {
              external: 'Categoria', internal: {
                label: 'Categoria',
                sub: {
                  code: 'Código',
                  name: 'Nome'
                }
              }
            },
            department: {
              external: 'Departamento', internal: {
                label: 'Departamento',
                sub: {
                  code: 'Código',
                  name: 'Nome'
                }
              }
            },
            commercialUnit: {
              external: 'Unidade Comercial', internal: {
                label: 'Unidade Comercial',
                sub: {
                  code: 'Código',
                  name: 'Nome'
                }
              }
            },
            provider: {
              external: 'Fornecedor', internal: {
                label: 'Fornecedor',
                sub: {
                  code: 'Código',
                  name: 'Nome'
                }
              }
            },
            quantity: { external: 'Quantidade', internal: 'Quantidade' },
            alert: { external: 'Alerta', internal: 'Alerta' },
            costPrice: { external: 'Preço de Custo', internal: `Preço de Custo (${Utilities.currencySymbol})` },
            salePrice: { external: 'Preço de Venda', internal: `Preço de Venda (${Utilities.currencySymbol})` },
            totalCost: { external: 'Total de Custo', internal: `Total de Custo (${Utilities.currencySymbol})` },
            totalSale: { external: 'Total de Venda', internal: `Total de Venda (${Utilities.currencySymbol})` },
            contributionMargin: { external: 'Margem de Contribuição', internal: `Margem de Contribuição (${Utilities.currencySymbol})` }
          }
        }
      },
      validity: {
        fields: {
          default: {
            code: { external: 'Código', internal: 'Código' },
            name: { external: 'Nome', internal: 'Nome' },
            batch: { external: 'Lote', internal: 'Lote' },
            expirationDate: { external: 'Validade', internal: 'Validade' },
            quantity: { external: 'Quantidade', internal: 'Quantidade' }
          }
        }
      },
      purchases: {
        types: {
          completedPurchases: 'Compras Concluidas',
          pendingPurchases: 'Compras Pendentes',
          purchasedProducts: 'Produtos Comprados'
        },
        fields: {
          completedPurchases: {
            code: { external: 'Código', internal: 'Código' },
            date: { external: 'Data', internal: 'Data' },
            provider: {
              external: 'Fornecedor', internal: {
                label: 'Fornecedor',
                sub: {
                  code: 'Código',
                  name: 'Nome'
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
                  costPrice: `Preço Custo (${Utilities.currencySymbol})`,
                  salePrice: `Preço Venda (${Utilities.currencySymbol})`
                }
              }
            },
            purchaseAmount: { external: 'Valor da Compra', internal: `Valor da Compra (${Utilities.currencySymbol})` },
            totalCost: { external: 'Total de Custo', internal: `Total de Custo (${Utilities.currencySymbol})` },
            totalSale: { external: 'Total de Venda', internal: `Total de Venda (${Utilities.currencySymbol})` },
            contributionMargin: { external: 'Margem de Contribuição', internal: `Margem de Contribuição (${Utilities.currencySymbol})` }
          },
          pendingPurchases: {
            code: { external: 'Código', internal: 'Código' },
            date: { external: 'Data', internal: 'Data' },
            provider: {
              external: 'Fornecedor', internal: {
                label: 'Fornecedor',
                sub: {
                  code: 'Código',
                  name: 'Nome'
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
                  costPrice: `Preço Custo (${Utilities.currencySymbol})`,
                  salePrice: `Preço Venda (${Utilities.currencySymbol})`
                }
              }
            },
            totalCost: { external: 'Total de Custo', internal: `Total de Custo (${Utilities.currencySymbol})` },
            totalSale: { external: 'Total de Venda', internal: `Total de Venda (${Utilities.currencySymbol})` },
            purchaseAmount: { external: 'Valor da Comnpra', internal: `Valor Da Comnpra (${Utilities.currencySymbol})` },
            contributionMargin: { external: 'Margem de Contribuição', internal: `Margem de Contribuição (${Utilities.currencySymbol})` }
          },
          purchasedProducts: {
            date: { external: 'Data', internal: 'Data' },
            purchaseCode: { external: 'Referência de Compra', internal: 'Ref. Compra' },
            productCode: { external: 'Referência de Produto', internal: 'Ref. Produto' },
            name: { external: 'Nome', internal: 'Nome' },
            provider: { external: 'Fornecedor', internal: 'Fornecedor' },
            category: { external: 'Categoria', internal: 'Categoria' },
            department: { external: 'Departamento', internal: 'Departamento' },
            quantity: { external: 'Quantidade', internal: 'Quantidade' },
            costPrice: { external: 'Preço de Custo', internal: `Preço de Custo (${Utilities.currencySymbol})` },
            salePrice: { external: 'Preço de Venda', internal: `Preço de Venda (${Utilities.currencySymbol})` },
            totalCost: { external: 'Total de Custo', internal: `Total de Custo (${Utilities.currencySymbol})` },
            totalSale: { external: 'Total de Venda', internal: `Total de Venda (${Utilities.currencySymbol})` },
            contributionMargin: { external: 'Margem de Contribuição', internal: `Margem de Contribuição (${Utilities.currencySymbol})` }
          }
        }
      },
      transfers: {
        types: {
          completedTransfers: 'Transferências Concluídas',
          pendingTransfers: 'Transferências Pendentes',
          transferedProducts: 'Produtos Transferidos'
        },
        fields: {
          completedTransfers: {
            code: { external: 'Código', internal: 'Código' },
            date: { external: 'Data', internal: 'Data' },
            origin: { external: 'Origem', internal: 'Origem' },
            destination: { external: 'Destino', internal: 'Destino' },
            products: {
              external: 'Produtos', internal: {
                label: 'Produtos',
                sub: {
                  code: 'Código',
                  name: 'Nome',
                  quantity: 'Quantidade',
                  costPrice: `Preço Custo (${Utilities.currencySymbol})`,
                  salePrice: `Preço Venda (${Utilities.currencySymbol})`
                }
              }
            },
            totalCost: { external: 'Total de Custo', internal: `Total de Custo (${Utilities.currencySymbol})` },
            totalSale: { external: 'Total de Venda', internal: `Total de Venda (${Utilities.currencySymbol})` },
            transferAmount: { external: 'Valor da Transferência', internal: `Valor da Transferência (${Utilities.currencySymbol})` }
          },
          pendingTransfers: {
            code: { external: 'Código', internal: 'Código' },
            date: { external: 'Data', internal: 'Data' },
            origin: { external: 'Origem', internal: 'Origem' },
            destination: { external: 'Destino', internal: 'Destino' },
            products: {
              external: 'Produtos', internal: {
                label: 'Produtos',
                sub: {
                  code: 'Código',
                  name: 'Nome',
                  quantity: 'Quantidade',
                  costPrice: `Preço Custo (${Utilities.currencySymbol})`,
                  salePrice: `Preço Venda (${Utilities.currencySymbol})`
                }
              }
            },
            totalCost: { external: 'Total de Custo', internal: `Total de Custo (${Utilities.currencySymbol})` },
            totalSale: { external: 'Total de Venda', internal: `Total de Venda (${Utilities.currencySymbol})` },
            transferAmount: { external: 'Valor da Transferência', internal: `Valor da Transferência (${Utilities.currencySymbol})` }
          },
          transferedProducts: {
            date: { external: 'Data', internal: 'Data' },
            transferCode: { external: 'Código', internal: 'Código' },
            origin: { external: 'Origem', internal: 'Origem' },
            destination: { external: 'Destino', internal: 'Destino' },
            productCode: { external: 'Referência de Produto', internal: 'Ref. Produto' },
            name: { external: 'Nome', internal: 'Nome' },
            category: { external: 'Categoria', internal: 'Categoria' },
            department: { external: 'Departamento', internal: 'Departamento' },
            quantity: { external: 'Quantidade', internal: 'Quantidade' },
            costPrice: { external: 'Preço de Custo', internal: `Preço de Custo (${Utilities.currencySymbol})` },
            salePrice: { external: 'Preço de Venda', internal: `Preço de Venda (${Utilities.currencySymbol})` },
            totalCost: { external: 'Total de Custo', internal: `Total de Custo (${Utilities.currencySymbol})` },
            totalSale: { external: 'Total de Venda', internal: `Total de Venda (${Utilities.currencySymbol})` }
          }
        }
      },
      stockLogs: {
        fields: {
          default: {
            date: { external: 'Date', internal: 'Date' },
            code: { external: 'Código', internal: 'Código' },
            productCode: { external: 'Referência de Produto', internal: 'Ref. Produto' },
            collaborator: { external: 'Colaborador', internal: 'Colaborador' },
            type: { external: 'Tipo', internal: 'Tipo' },
            note: { external: 'Nota', internal: 'Nota' },
            quantity: { external: 'Quantidade', internal: 'Quantidade' },
            operation: { external: 'Operação', internal: 'Operação' },
            action: { external: 'Ação', internal: 'Ação' }
          }
        },
        layer: {
          operation: {
            INPUT: 'ENTRADA',
            OUTPUT: 'SAÍDA'
          },
          action: {
            IMPORT: 'IMPORTAÇÃO DE DADOS',
            ADJUSTMENT: 'AJUSTE',
            SALE: 'VENDA',
            SERVICE: 'SERVIÇO',
            PURCHASE: 'COMPRA',
            TRANSFER: 'TRANSFERÊNCIA'
          }
        }
      },
      curveABC: {
        fields: {
          default: {
            code: { external: 'Código', internal: 'Código' },
            name: { external: 'Nome', internal: 'Nome' },
            quantity: { external: 'Quantidade Vendida', internal: 'Quantidade Vendida' },
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
          categories: {
            title: "Categories",
            list: {
              all: "All Categories"
            }
          },
          departments: {
            title: "Departments",
            list: {
              all: "All Departments"
            }
          },
          status: {
            title: "Status",
            list: {
              all: "With or without Stock",
              inStock: "In Stock",
              outStock: "Out Stock",
              negativeStock: "Negative Stock",
              zeroOrNegative: "Zero or Negative"
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
          },
          label: {
            total: 'Total'
          }
        }
      },
      products: {
        fields: {
          default: {
            code: { external: 'Code', internal: 'Code' },
            name: { external: 'Name', internal: 'Name' },
            category: {
              external: 'Category', internal: {
                label: 'Category',
                sub: {
                  code: 'Code',
                  name: 'Name'
                }
              }
            },
            department: {
              external: 'Department', internal: {
                label: 'Department',
                sub: {
                  code: 'Code',
                  name: 'Name'
                }
              }
            },
            commercialUnit: {
              external: 'Commercial Unit', internal: {
                label: 'Commercial Unit',
                sub: {
                  code: 'Code',
                  name: 'Name'
                }
              }
            },
            provider: {
              external: 'Provider', internal: {
                label: 'Provider',
                sub: {
                  code: 'Code',
                  name: 'Name'
                }
              }
            },
            alert: { external: 'Alert', internal: 'Alert' },
            costPrice: { external: 'Cost Price', internal: `Cost Price (${Utilities.currencySymbol})` },
            salePrice: { external: 'Sale Price', internal: `Sale Price (${Utilities.currencySymbol})` },
            quantity: { external: 'Quantity', internal: 'Quantity' },
            totalCost: { external: 'Total Cost', internal: `Total Cost (${Utilities.currencySymbol})` },
            totalSale: { external: 'Total Sale', internal: `Total Sale (${Utilities.currencySymbol})` },
            contributionMargin: { external: 'Contribution Margin', internal: `Contribution Margin (${Utilities.currencySymbol})` }
          }
        }
      },
      validity: {
        fields: {
          default: {
            code: { external: 'Code', internal: 'Code' },
            name: { external: 'Name', internal: 'Name' },
            batch: { external: 'Batch', internal: 'Batch' },
            expirationDate: { external: 'Expiration', internal: 'Expiration' },
            quantity: { external: 'Quantity', internal: 'Quantity' }
          }
        }
      },
      purchases: {
        types: {
          completedPurchases: 'Completed Purchases',
          pendingPurchases: 'Pending Purchases',
          purchasedProducts: 'Purchased Products'
        },
        fields: {
          completedPurchases: {
            code: { external: 'Code', internal: 'Code' },
            date: { external: 'Date', internal: 'Date' },
            provider: {
              external: 'Provider', internal: {
                label: 'Provider',
                sub: {
                  code: 'Code',
                  name: 'Name'
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
                  costPrice: `Cost Price (${Utilities.currencySymbol})`,
                  salePrice: `Sale Price (${Utilities.currencySymbol})`
                }
              }
            },
            totalCost: { external: 'Total Cost', internal: `Total Cost (${Utilities.currencySymbol})` },
            totalSale: { external: 'Total Sale', internal: `Total Sale (${Utilities.currencySymbol})` },
            contributionMargin: { external: 'Contribution Margin', internal: `Contribution Margin (${Utilities.currencySymbol})` },
            purchaseAmount: { external: 'Purchase Amount', internal: `Purchase Amount (${Utilities.currencySymbol})` }
          },
          pendingPurchases: {
            code: { external: 'Code', internal: 'Code' },
            date: { external: 'Date', internal: 'Date' },
            provider: {
              external: 'Provider', internal: {
                label: 'Provider',
                sub: {
                  code: 'Code',
                  name: 'Name'
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
                  costPrice: `Cost Price (${Utilities.currencySymbol})`,
                  salePrice: `Sale Price (${Utilities.currencySymbol})`
                }
              }
            },
            totalCost: { external: 'Total Cost', internal: `Total Cost (${Utilities.currencySymbol})` },
            totalSale: { external: 'Total Sale', internal: `Total Sale (${Utilities.currencySymbol})` },
            contributionMargin: { external: 'Contribution Margin', internal: `Contribution Margin (${Utilities.currencySymbol})` },
            purchaseAmount: { external: 'Purchase Amount', internal: `Purchase Amount (${Utilities.currencySymbol})` }
          },
          purchasedProducts: {
            date: { external: 'Date', internal: 'Date' },
            purchaseCode: { external: 'Purchase Code', internal: 'Purchase Code' },
            productCode: { external: 'Product Code', internal: 'Product Code' },
            name: { external: 'Name', internal: 'Name' },
            provider: { external: 'Provider', internal: 'Provider' },
            category: { external: 'Category', internal: 'Category' },
            department: { external: 'Department', internal: 'Department' },
            quantity: { external: 'Quantity', internal: 'Quantity' },
            costPrice: { external: 'Cost Price', internal: `Cost Price (${Utilities.currencySymbol})` },
            salePrice: { external: 'Sale Price', internal: `Sale Price (${Utilities.currencySymbol})` },
            totalCost: { external: 'Total Cost', internal: `Total Cost (${Utilities.currencySymbol})` },
            totalSale: { external: 'Total Sale', internal: `Total Sale (${Utilities.currencySymbol})` },
            contributionMargin: { external: 'Contribution Margin', internal: `Contribution Margin (${Utilities.currencySymbol})` }
          }
        }
      },
      transfers: {
        types: {
          completedTransfers: 'Completed Transfers',
          pendingTransfers: 'Pending Transfers',
          transferedProducts: 'Transfered Products'
        },
        fields: {
          completedTransfers: {
            code: { external: 'Code', internal: 'Code' },
            origin: { external: 'Origin', internal: 'Origin' },
            destination: { external: 'Destination', internal: 'Destination' },
            products: {
              external: 'Products', internal: {
                label: 'Produtos',
                sub: {
                  code: 'Code',
                  name: 'Name',
                  quantity: 'Quantity',
                  costPrice: `Cost Price (${Utilities.currencySymbol})`,
                  salePrice: `Sale Price (${Utilities.currencySymbol})`
                }
              }
            },
            totalCost: { external: 'Total Cost', internal: `Total Cost (${Utilities.currencySymbol})` },
            totalSale: { external: 'Total Sale', internal: `Total Sale (${Utilities.currencySymbol})` },
            contributionMargin: { external: 'Contribution Margin', internal: `Contribution Margin (${Utilities.currencySymbol})` },
            transferAmount: { external: 'Transfer Amount', internal: `Transfer Amount (${Utilities.currencySymbol})` }
          },
          pendingTransfers: {
            code: { external: 'Code', internal: 'Code' },
            origin: { external: 'Origin', internal: 'Origin' },
            destination: { external: 'Destination', internal: 'Destination' },
            products: {
              external: 'Products', internal: {
                label: 'Produtos',
                sub: {
                  code: 'Code',
                  name: 'Name',
                  quantity: 'Quantity',
                  costPrice: `Cost Price (${Utilities.currencySymbol})`,
                  salePrice: `Sale Price (${Utilities.currencySymbol})`
                }
              }
            },
            totalCost: { external: 'Total Cost', internal: `Total Cost (${Utilities.currencySymbol})` },
            totalSale: { external: 'Total Sale', internal: `Total Sale (${Utilities.currencySymbol})` },
            contributionMargin: { external: 'Contribution Margin', internal: `Contribution Margin (${Utilities.currencySymbol})` },
            transferAmount: { external: 'Transfer Amount', internal: `Transfer Amount (${Utilities.currencySymbol})` }
          },
          transferedProducts: {
            code: { external: 'Code', internal: 'Code' },
            name: { external: 'Name', internal: 'Name' },
            department: { external: 'Department', internal: 'Department' },
            quantity: { external: 'Quantity', internal: 'Quantity' },
            totalCost: { external: 'Total Cost', internal: `Total Cost (${Utilities.currencySymbol})` },
            totalSale: { external: 'Total Sale', internal: `Total Sale (${Utilities.currencySymbol})` },
            contributionMargin: { external: 'Contribution Margin', internal: `Contribution Margin (${Utilities.currencySymbol})` }
          }
        }
      },
      stockLogs: {
        fields: {
          default: {
            code: { external: 'Code', internal: 'Code' },
            productCode: { external: 'Product Reference', internal: 'Product Reference' },
            collaborator: { external: 'Collaborator', internal: 'Collaborator' },
            type: { external: 'Type', internal: 'Type' },
            note: { external: 'Note', internal: 'Note' },
            operation: { external: 'Operation', internal: 'Operation' },
            quantity: { external: 'Quantity', internal: 'Quantity' },
            action: { external: 'Action', internal: 'Action' }
          }
        },
        layer: {
          operation: {
            INPUT: 'ENTRADA',
            OUTPUT: 'SAÍDA'
          },
          action: {
            IMPORT: 'DATA IMPORT',
            ADJUSTMENT: 'ADJUSTMENT',
            SALE: 'SALE',
            SERVICE: 'SERVICE',
            PURCHASE: 'PURCHASE',
            TRANSFER: 'TRANSFER'
          }
        }
      },
      curveABC: {
        fields: {
          default: {
            code: { external: 'Code', internal: 'Code' },
            name: { external: 'Name', internal: 'Name' },
            quantity: { external: 'Sold Amount', internal: `Sold Amount (${Utilities.currencySymbol})` },
            averageCost: { external: 'Average Cost', internal: `Average Cost (${Utilities.currencySymbol})` },
            averagePrice: { external: 'Average Price', internal: `Average Price (${Utilities.currencySymbol})` },
            revenue: { external: 'Revenue', internal: `Revenue (${Utilities.currencySymbol})` }
          }
        }
      }
    }
  }

  public static get(language?: string) {
    return StockReportsTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
