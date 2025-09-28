import { ProjectSettings } from "@assets/settings/company-settings";
import { Utilities } from "@shared/utilities/utilities";

export class VehiclesTranslate {

  private static obj = {
    'pt_BR': {
      pageTitle: 'Veículos',
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
              create: { title: 'Registro de Veículo' },
              update: { title: 'Edição de Veículo' }
            },
            panel: {
              proprietary: {
                title: 'Proprietário',
                label: {
                  name: 'Nome',
                  email: 'E-mail',
                  phone: 'Telefone',
                  address: 'Endereço'
                }
              },
              vehicle: {
                title: 'Veículo',
                label: {
                  code: 'Código',
                  plate: 'Placa',
                  model: 'Modelo',
                  color: 'Cor',
                  mileage: 'KM',
                  chassis: 'Chassis'
                }
              },
              notice: '* Os campos obrigatórios estão marcados em vermelho.',
              button: {
                submit: 'Confirmar'
              }
            },
            layer: {
              owners: { title: 'Proprietários' },
              models: { title: 'Modelos de veículos' }
            }
          },
          read: {
            title: 'Detalhes do Veículo',
            section: {
              informations: {
                title: 'Informações',
                label: {
                  code: 'Código',
                  plate: 'Placa',
                  model: 'Modelo',
                  color: 'Cor',
                  mileage: 'KM',
                  chassis: 'Chassis',
                }
              },
              proprietary: {
                title: 'Proprietário',
                label: {
                  name: 'Nome',
                  email: 'E-mail',
                  phone: 'Telefone',
                  address: 'Endereço'
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
            title: 'Exclusão de Veículo',
            notice: 'Você deseja realmente excluir este Veículo?',
            warning: 'Esteja ciente de que esta ação é irreversível, portanto, analise-a cuidadosamente antes de continuar.',
            option: {
              cancel: 'Cancelar',
              confirm: 'Confirmar'
            }
          },
          others: {
            dataExport: {
              title: 'Exportação de Dados',
              fileName: 'Veículos',
              label: {
                title: 'Assistente de Exportação',
                info: [
                  'O assistente de exportação deve ser utilizado quando há a necessidade de obter os dados brutos dos Veículos.',
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
        register: 'O veículo foi registrado com sucesso.',
        update: 'O veículo foi atualizado com sucesso.',
        delete: 'O veículo foi excluído com sucesso.',
        error: 'Houve um erro inesperado. Por favor, tente novamente.'
      },
      systemLog: {
        register: 'Registro de veículo.',
        update: 'Edição de veículo.',
        delete: 'Exclusão de veículo.'
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
              proprietary: {
                title: 'Proprietary',
                label: {
                  name: 'Name',
                  email: 'Email',
                  phone: 'Phone',
                  address: 'Address'
                }
              },
              vehicle: {
                title: 'Vehicle',
                label: {
                  code: 'Code',
                  plate: 'Plate',
                  model: 'Model',
                  color: 'Color',
                  mileage: 'Mileage',
                  chassis: 'Chassis',
                }
              },
              notice: '* Mandatory fields are marked in red.',
              button: {
                submit: 'Confirm'
              }
            },
            layer: {
              owners: { title: 'Owners' },
              models: { title: 'Vehicle Models' }
            }
          },
          read: {
            title: 'Vehicle Details',
            section: {
              informations: {
                title: 'Informations',
                label: {
                  code: 'Code',
                  plate: 'Plate',
                  model: 'Model',
                  color: 'Color',
                  mileage: 'Mileage',
                  chassis: 'Chassis'
                }
              },
              proprietary: {
                title: 'Proprietary',
                label: {
                  name: 'Name',
                  email: 'Email',
                  phone: 'Phone',
                  address: 'Address'
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
            title: 'Vehicle Exclusion',
            notice: 'Do you really want to delete this vehicle?',
            warning: 'Be aware that this action is irreversible, so please review it carefully before proceeding.',
            option: {
              cancel: 'Cancel',
              confirm: 'Confirm'
            }
          },
          others: {
            dataExport: {
              title: 'Data Export',
              fileName: 'Vehicles',
              label: {
                title: 'Export Assistant',
                info: [
                  'The export wizard should be used when there is a need to obtain raw vehicle data.',
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
        register: 'The vehicle was registered successfully.',
        update: 'The vehicle was updated successfully.',
        delete: 'The vehicle was deleted successfully.',
        error: 'There was an unexpected error. Please try again.'
      },
      systemLog: {
        register: 'Vehicle registration.',
        update: 'Vehicle update.',
        delete: 'Vehicle exclusion.'
      }
    }
  }

  public static get(language?: string) {
    return VehiclesTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}