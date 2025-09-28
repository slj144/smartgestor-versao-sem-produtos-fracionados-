import { ProjectSettings } from "../../../../assets/settings/company-settings";

export class PaymentMethodsTranslate {

	private static obj = {
    'pt_BR': {
      pageTitle: 'Meios de Pagamento',
      searchBar: {
        placeholder: 'Pesquisar..'
      },
      count: {
        label: [ 'Exibindo', 'de' ]
      },
      table: {
        label: {
					code: 'Código',
					name: 'Nome',        
					actions: 'Ações'
        },
        warning: 'Adicione sub métodos de pagamento relacionados a',
        action: {
          read: { title: 'Visualizar Meio de Pagamento' },
          update: { title: 'Editar Meio de Pagamento' },
          delete: { title: 'Excluir Meio de Pagamento' }
        }
      },
      modal: {
        help: {
          title: 'Ajuda'
        },
        filters: {
          title: 'Filtros'
        },
        action: {
          register: {
            type: {
              create: { title: 'Registro de Meio de Pagamento' },
              update: { title: 'Edição de Meio de Pagamento' }
            },
            form: {
              name: {
                label: 'Nome'
              },
              fee: {
                label: 'Taxa (%)'
              },
              rateTable: {
                label: 'Tabela de Taxas',
                table: {
                  parcel: 'Parcela',
                  fee: 'Taxa (%)'
                },
                warning: [ 'Importante:', 'Pressione o botão "+" para confirmar a configuração.' ]
              },
              bankAccount: {
                label: 'Conta Bancária',
                warning: [ 'Importante:', 'Indique a conta bancária vinculada a este método de pagamento.' ]
              },
              settings: {
                label: 'Configurações',
                option: {
                  uninvoiced: [ 'Método não faturado:', 'ao marcar esta opção o meio de pagamento passa a não ser mais inserido no saldo final do caixa e dos relatórios.' ],
                  disabled:   [ 'Desativar meio de pagamento:', 'ao marcar esta opção o meio de pagamento será desativado no sistema, portanto, ele não poderá ser selecionado nas demais rotinas.' ]
                }
              },
              button: {
                confirm: 'Confirmar'
              }
            }
          },
          read: {
						title: 'Detalhes do Meio de Pagamento',
            section: {
              informations: {
                title: 'Informações',
                label: {
                  code: 'Código',
                  name: 'Nome',
                  fee: 'Taxa'
                },
              },
              bankAccount: {
                title: 'Conta Bancária',
                label: {
                  code: 'Código',
                  name: 'Nome',
                  agency: 'Agência',
                  account: 'Conta'
                }
              },
              rateTable: {
                title: 'Tabela de Taxas',
                table: {
                  parcel: 'Parcela',
                  fee: 'Taxa (%)'
                }
              },
              settings: {
                title: 'Configurações',
                list: {
                  uninvoiced: {
                    label: 'Método não faturado',
                    description: 'A forma de pagamento não é incluída no saldo final do caixa e nos relatórios.'
                  }
                }
              }
            }
          },
          delete: {
						title: 'Exclusão de Meio de Pagamento',
            notice: 'Você deseja realmente excluir este meio de pagamento?',
            warning: 'Esteja ciente de que esta ação é irreversível, portanto, analise-a cuidadosamente antes de continuar.',
            option: {
              cancel: 'Cancelar',
              confirm: 'Confirmar'
            }
          },
          others: {
            dataExport: {
              title: 'Exportação de Dados',
              fileName: 'Meios de Pagamento',
              label: {
                title: 'Assistente de Exportação',
                info: [
                  'O assistente de exportação deve ser utilizado quando há a necessidade de obter os dados brutos dos meios de pagamento.',
                  'O processo de exportação pode demorar alguns minutos, tudo depende da sua conexão com a internet e também a quantidade de dados a serem baixados do banco de dados.'
                ],
                table: {
                  code: 'Código',
                  name: 'Nome',
                  personalDocument: 'CPF',
                  businessDocument: 'CNPJ',
                  address: 'Endereço',
                  phone: 'Telefone',
                  email: 'E-mail'
                },
                button: 'Iniciar Exportação'
              }
            }
          }
        }
      },
      notification: {
        register: 'O meio de pagamento foi registrado com sucesso.',
        update: 'O meio de pagamento foi atualizado com sucesso.',
        delete: 'O meio de pagamento foi excluído com sucesso.',
        error: 'Houve um erro inesperado. Por favor, tente novamente.'
      },
      systemLog: {
        register: 'Registro de meio de pagamento.',
        update: 'Atualização de meio de pagamento.',
        delete: 'Exclusão de meio de pagamento.'
      }
    },
    'en_US': {
      pageTitle: 'Payment Methods',
      searchBar: {
        placeholder: 'Search..'
      },
      count: {
        label: [ 'Displaying', 'of' ]
      },
      table: {
        label: {
					code: 'Code',
					name: 'Name',
					actions: 'Actions'
        },
        warning: 'Add sub payment methods related to',
        action: {
          add: { title: 'Add Payment Method' },
					read: { title: 'View Payment Method' },
          update: { title: 'Edit Payment Method' },
          delete: { title: 'Delete Payment Method' }
        }
      },
      modal: {
        help: {
          title: 'Help'
        },
        filters: {
          title: 'Filters'
        },
        action: {
          register: {
            type: {
              create: { title: 'Registrer Payment Method' },
              update: { title: 'Payment Method Editing' }
            },
            form: {
              name: {
                label: 'Name'
              },
              fee: {
                label: 'Fee (%)'
              },
              rateTable: {
                label: 'Rate Table',
                table: {
                  parcel: 'Parcel',
                  fee: 'Fee (%)'
                },
                warning: [ 'Important:', 'Press the "+" button to confirm the setting.' ]
              },
              bankAccount: {
                label: 'Bank Account',
                warning: [ 'Important:', 'Specify the bank account linked to this payment method.' ]
              },
              settings: {
                label: 'Settings',
                option: {
                  uninvoiced: [ 'Uninvoiced Method:', 'by checking this option, the payment method is no longer included in the final balance of the cashier and the reports.' ]
                }
              },
              button: {
                confirm: 'Confirm'
              }
            }
          },
          read: {
						title: 'Payment Method Details',
            section: {
              informations: {
                title: 'Informations',
                label: {
                  code: 'Code',
                  name: 'Name',
                  fee: 'Fee'
                }
              },
              bankAccount: {
                title: 'Bank Account',
                label: {
                  code: 'Code',
                  name: 'Name',
                  agency: 'Agency',
                  account: 'Account'
                }
              },
              rateTable: {
                title: 'Rate Fee',
                label: {
                  parcel: 'Parcel',
                  fee: 'Fee (%)'
                }
              },
              settings: {
                title: 'Settings',
                list: {
                  uninvoiced: {
                    label: 'Uninvoiced Method',
                    description: 'The payment method is not included in the final cash balance and in the reports.'
                  }
                }
              }
            }						
          },      
          delete: {
						title: 'Payment Method Exclusion',
            notice: 'Do you really want to delete this payment method?',
            warning: 'Be aware that this action is irreversible, so please review it carefully before proceeding.',
            option: {
              cancel: 'Cancel',
              confirm: 'Confirm'
            }
          },
          others: {
            dataExport: { 
              title: 'Data Export',
              fileName: 'Payment Methods',
              label: {
                title: 'Export Assistant',
                info: [
                  'The export wizard should be used when there is a need to obtain raw payment methods data.',
                  'The export process can take a few minutes, it all depends on your internet connection and also the amount of data to be downloaded from the database.'
                ],
                table: {
                  code: 'Code',
                  name: 'Name'                  
                },
                button: 'Start Export'
              }
            }
          }
        }
      },
      notification: {
        register: 'The payment method was registered successfully.',
        update: 'The payment method was updated successfully.',
        delete: 'The payment method was deleted successfully.',
        error: 'There was an unexpected error. Please try again.'
      },
      systemLog: {
        register: 'Payment Method registration.',
        update: 'Payment Method update.',
        delete: 'Payment Method exclusion.'
      }      
    }
  }

  public static get(language?: string) {
    return PaymentMethodsTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }
  
}