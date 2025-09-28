import { ProjectSettings } from "../../../../assets/settings/company-settings";
import { Utilities } from "@shared/utilities/utilities";

export class BankAccountsTranslate {

  private static obj = {
    'pt_BR': {
      pageTitle: 'Contas Bancárias',
      table: {
        label: {
          code: 'Código',
          name: 'Nome',
          bank: 'Banco',
          agency: 'Agência',
          account: 'Conta',
          balance: 'Saldo',
          actions: 'Ações'
        },
        action: {
          read: { title: 'Visualizar Conta' },
          update: { title: 'Editar Conta' },
          delete: { title: 'Excluir Conta' }
        }
      },
      modal: {
        filters: {
          title: 'Filtros',
          field: {
            accountCode: {
              label: 'Código da Conta'
            },
            name: {
              label: 'Nome'
            },
            balance: {
              label: 'Saldo'
            }
          }
        },
        action: {
          transfer: {
            title: 'Transferência entre Contas',
            form: {
              fromAccount: { label: 'Conta de Origem' },
              toAccount: { label: 'Conta de Destino' },
              amount: { label: `Valor (${Utilities.currencySymbol})` },
              description: { label: 'Descrição (opcional)' },
              button: { submit: 'Transferir' },
              messages: {
                notice: '* Campos obrigatórios marcados em vermelho.'
              }
            }
          },
          register: {
            type: {
              create: { title: 'Registro de Conta' },
              update: { title: 'Edição da Conta' }
            },
            form: {
              name: { label: 'Nome' },
              account: { label: 'Conta' },
              agency: { label: 'Agência' },
              balance: { label: 'Saldo' },
              messages: {
                notice: '* Os campos obrigatórios estão marcados em vermelho.'
              },
              button: {
                submit: 'Confirmar'
              }
            }
          },          
          read: {
            title: 'Detalhes da Conta',
            section: {
              informations: {
                title: 'Informações',
                label: {
                  code: 'Código',
                  name: 'Nome',
                  agency: 'Agência',
                  account: 'Conta'
                }
              },
              latestTransactions: {
                title: 'Últimas Transações',
                label: {
                  date: 'Data',
                  description: 'Descrição',
                  operation: 'Operação',
                  value: `Valor (${Utilities.currencySymbol})`
                }
              },
              balance: {
                label: 'Saldo'
              }
            }
          },
          delete: {
						title: 'Exclusão de Conta',
            notice: 'Você deseja realmente excluir esta conta bancária?',
            warning: 'Esteja ciente de que esta ação é irreversível, portanto, analise-a cuidadosamente antes de continuar.',
            option: {
              cancel: 'Cancelar',
              confirm: 'Confirmar'
            }
          }
        }
      },
      notification: {
        register: 'A conta bancária foi registrada com sucesso.',
        update: 'A conta bancária foi atualizada com sucesso.',
        delete: 'A conta bancária foi excluída com sucesso.',
        error: 'Houve um erro inesperado. Por favor, tente novamente.'
      },
      systemLog: {
        register: 'Registro de conta bancária.',
        update: 'Atualização de conta bancária.',
        delete: 'Exclusão de conta bancária.'
      }
    },
    'en_US': {
      pageTitle: 'Bank Accounts',
      table: {
        label: {
          code: 'Code',
          name: 'Name',
          bank: 'Bank',
          agency: 'Agency',
          account: 'Account',
          balance: 'Balance',
          actions: 'Actions'
        },
        action: {
          read: { title: 'View Account' },
          update: { title: 'Edit Account' },
          delete: { title: 'Delete account' }
        }        
      },
      modal: {
        filters: {
          title: 'Filters',
          field: {
            accountCode: {
              label: 'Account Code'
            },
            name: {
              label: 'Name'
            },
            balance: {
              label: 'Balance'
            }
          }
        },
        action: {
          transfer: {
            title: 'Transfer Between Accounts',
            form: {
              fromAccount: { label: 'Source Account' },
              toAccount: { label: 'Destination Account' },
              amount: { label: `Amount (${Utilities.currencySymbol})` },
              description: { label: 'Description (optional)' },
              button: { submit: 'Transfer' },
              messages: {
                notice: '* Required fields are marked in red.'
              }
            }
          },
          register: {
            type: {
              create: { title: 'Register Account' },
              update: { title: 'Account Editing' }
            },
            form: {
              name: { label: 'Name' },
              account: { label: 'Account' },
              agency: { label: 'Agency' },
              balance: { label: 'Balance' },
              messages: {
                notice: '* Mandatory fields are marked in red.'
              },
              button: {
                submit: 'Confirm'
              }
            }
          },          
          read: {
            title: 'Account Details',
            section: {
              informations: {
                title: 'Informations',
                label: {
                  code: 'Code',
                  name: 'Name',
                  agency: 'Agency',
                  account: 'Account'
                }
              },
              latestTransactions: {
                title: 'Last Transactions',
                label: {
                  date: 'Date',
                  description: 'Description',
                  operation: 'Operation',
                  value: `Value (${Utilities.currencySymbol})`
                }
              },
              balance: {
                label: 'Balance'
              }
            }
          },          
          delete: {
            title: 'Account Exclusion',
            notice: 'Do you really want to delete this bank account?',
            warning: 'Be aware that this action is irreversible, so please review it carefully before proceeding.',
            option: {
              cancel: 'Cancel',
              confirm: 'Confirm'
            }
          }
        }       
      },
      notification: {
        register: 'The bank account was successfully registered.',
        update: 'The bank account was successfully updated.',
        delete: 'The bank account was successfully deleted.',
        error: 'There was an unexpected error. Please try again.'
      },
      systemLog: {
        register: 'Bank account registration.',
        update: 'Bank account update.',
        delete: 'Bank account deletion.'
      }
    }
  }

  public static get(language?: string) {
    return BankAccountsTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
