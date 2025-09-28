import { ProjectSettings } from "@assets/settings/company-settings";
import { Utilities } from "@shared/utilities/utilities";

export class SchemesTranslate {

	private static obj = {
    'pt_BR': {
      pageTitle: 'Esquemas',
      table: {
        label: {
					code: 'Código',
          owner: {
            name: 'Proprietário',
          },
					plate: 'Placa',
					model: 'Modelo',
          color: 'Cor',
					mileage: `KM`,
					actions: 'Ações'
        },
        action: {
          read: { title: 'Visualizar' },
          update: { title: 'Editar' },
          delete: { title: 'Excluir' }
        }
      },
      modal: {
        filters: {
          title: 'Filtros'
        },
        action: {
          register: {
            type: {
              create: { title: 'Registro de Esquema' },
              update: { title: 'Edição de Esquema' }
            },
            panel: {
              quantity: {
                label: "Quantidade"
              },
              name: {
                label: "Nome"
              },
              products: {
                title: 'Produtos',
                quickSearch: {
                  placeholder: 'Código'
                },
                label: {
                  code: 'Código',
                  name: 'Nome',
                  quantity: 'Quantidade',
                  price: `Preço (${Utilities.currencySymbol})`,
                  total: `Total (${Utilities.currencySymbol})`
                }
              },
              notice: '* Os campos obrigatórios estão marcados em vermelho.',
              button: {
                submit: 'Confirmar'
              }
            },
            layer: {
              products: { title: 'Produtos' }
            }
          },
          read: {
						title: 'Detalhes do Esquema',
            section: {
              informations: {
                title: 'Informações',
                label: {
                  quantity: "Quantidade",
                  code: 'Código',                  
                  name: 'Nome',
                }
              },
              name: {
                label: "Nome"
              },
              products: {
                title: 'Produtos',
                quickSearch: {
                  placeholder: 'Código'
                },
                label: {
                  code: 'Código',
                  name: 'Nome',
                  quantity: 'Quantidade',
                  price: `Preço (${Utilities.currencySymbol})`,
                  total: `Total (${Utilities.currencySymbol})`
                }
              },
              historic: {
                title: 'Histórico',
                label: {
                  code: 'OS',
                  service: 'Serviço',
                  mileage: 'KM',
                  date: 'Data'
                }
              }
            }
          },
          delete: {
						title: 'Exclusão de Esquema',
            notice: 'Você deseja realmente excluir este Esquema?',
            warning: 'Esteja ciente de que esta ação é irreversível, portanto, analise-a cuidadosamente antes de continuar.',
            option: {
              cancel: 'Cancelar',
              confirm: 'Confirmar'
            }
          },
          others: {
            dataExport: {
              title: 'Exportação de Dados',
              fileName: 'Esquemas',
              label: {
                title: 'Assistente de Exportação',
                info: [
                  'O assistente de exportação deve ser utilizado quando há a necessidade de obter os dados brutos dos Esquemas.',
                  'O processo de exportação pode demorar alguns minutos, tudo depende da sua conexão com a internet e também a quantidade de dados a serem baixados do banco de dados.'
                ],
                table: {
                  code: 'Código',
                  name: 'Nome',
                  costPrice: `Preço de Custo (${Utilities.currencySymbol})`,
                  finalPrice: `Preço Final (${Utilities.currencySymbol})`,
                },
                button: 'Iniciar Exportação'
              }
            }
          }
        }
      },
      notification: {
        register: 'O Esquema foi registrado com sucesso.',
        update: 'O Esquema foi atualizado com sucesso.',
        delete: 'O Esquema foi excluído com sucesso.',
        error: 'Houve um erro inesperado. Por favor, tente novamente.'
      },
      systemLog: {
        register: 'Registro de Esquema.',
        update: 'Edição de Esquema.',
        delete: 'Exclusão de Esquema.'
      }
    },
    'en_US': {
      pageTitle: 'Vehicles',
      table: {
        label: {
					code: 'Code',
          owner: {
            name: 'Owner',
          },
					plate: 'Plate',
          model: 'Model',
          color: 'Color',
					mileage: 'Mileage',
					actions: 'Actions'
        },
        action: {
					read: { title: 'View' },
          update: { title: 'Edit' },
          delete: { title: 'Delete' }
        }
      },
      modal: {
        filters: {
          title: 'Filters'
        },
        action: {
          register: {
            type: {
              create: { title: 'Registrer Vehicle' },
              update: { title: 'Vehicle Editing' }
            },
            panel: {
              quantity: {
                label: "Quantity"
              },
              name: {
                label: "Name"
              },        
              products: {
                title: 'Products',
                quickSearch: {
                  placeholder: 'Code'
                },
                label: {
                  code: 'Code',
                  name: 'Name',
                  quantity: 'Quantity',
                  price: `Price (${Utilities.currencySymbol})`,
                  total: `Total (${Utilities.currencySymbol})`
                }
              },   
              notice: '* Mandatory fields are marked in red.',
              button: {
                submit: 'Confirm'
              }
            },
            layer: {
              products: { title: 'Products' }
            }
          },
          read: {
						title: 'Vehicle Details',
            section: {
              informations: {
                title: 'Informations',
                label: {
                  quantity: "Quantity",
                  code: 'Code',                 
                  name: 'name',
                }
              },
              name: {
                label: "Name"
              },
              products: {
                title: 'Products',
                quickSearch: {
                  placeholder: 'Code'
                },
                label: {
                  code: 'Code',
                  name: 'Name',
                  quantity: 'Quantity',
                  price: `Price (${Utilities.currencySymbol})`,
                  total: `Total (${Utilities.currencySymbol})`
                }
              },
              historic: {
                title: 'Historic',
                label: {
                  code: 'Service Order',
                  service: 'Service',
                  mileage: 'Mileage',
                  date: 'Date'
                }
              }             
            }
          },          
          delete: {
						title: 'Scheme Exclusion',
            notice: 'Do you really want to delete this Scheme?',
            warning: 'Be aware that this action is irreversible, so please review it carefully before proceeding.',
            option: {
              cancel: 'Cancel',
              confirm: 'Confirm'
            }
          },
          others: {
            dataExport: { 
              title: 'Data Export',
              fileName: 'Schemes',
              label: {
                title: 'Export Assistant',
                info: [
                  'The export wizard should be used when there is a need to obtain raw Scheme data.',
                  'The export process can take a few minutes, it all depends on your internet connection and also the amount of data to be downloaded from the database.'
                ],
                table: {
                  code: 'Code',
                  name: 'Name',
                  costPrice: `Cost Price (${Utilities.currencySymbol})`,
                  finalPrice: `Final Price (${Utilities.currencySymbol})`,
                },
                button: 'Start Export'
              }
            }
          }
        }
      },
      notification: {
        register: 'The Scheme was registered successfully.',
        update: 'The Scheme was updated successfully.',
        delete: 'The Scheme was deleted successfully.',
        error: 'There was an unexpected error. Please try again.'
      },
      systemLog: {
        register: 'Scheme registration.',
        update: 'Scheme update.',
        delete: 'Scheme exclusion.'
      }      
    }
  }

  public static get(language?: string) {
    return SchemesTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}