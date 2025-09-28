import { ProjectSettings } from "@assets/settings/company-settings";
import { Utilities } from "@shared/utilities/utilities";

export class BillsToReceiveTranslate {

  private static obj = {
    'pt_BR': {
      pageTitle: 'Contas a Receber',
      table: {
        label: {
          code: 'Código',
          dueDate: 'Vencimento',
          debtor: 'Devedor',
          category: 'Categoria',           
          installments: 'Parcelas',
          status: 'Status',
          value: `Valor (${Utilities.currencySymbol})`,
          actions: 'Acões'
        },
        enum: {
          status: {
            PENDENT: 'PENDENTE',
            CONCLUDED: 'CONCLUÍDA',
            CANCELED: 'CANCELADA'
          }
        },
        action: {
          read: { title: 'Visualizar' },
          update: { title: 'Editar' },
          cancel: { title: 'Cancelar' },
          delete: { title: 'Excluir' }
        }        
      },      
      modal: {
        filters: {
          title: 'Filtros',
          field: {
            accountCode: {
              label: 'Código da Conta'
            },
            referenceCode: {
              label: 'Código de Referência'
            },
            debtor: {
              label: 'Devedor',
              option: {
                code: {
                  label: 'Código',
                  path: 'Devedor/Código'
                },
                name: {
                  label: 'Nome',
                  path: 'Devedor/Nome'
                }
              }
            },
            category: {
              label: 'Categoria',
              option: {
                code: {
                  label: 'Código',
                  path: 'Categoria/Código'
                },
                name: {
                  label: 'Nome',
                  path: 'Categoria/Nome'
                }
              }
            },
            billStatus: {
              label: 'Status',
              list: {
                pendent: {
                  label: 'PENDENTE'
                },
                concluded: {
                  label: 'CONCLUÍDA'
                },
                canceled: {
                  label: 'CANCELADA'
                },
              }
            },
            dueDate: {
              label: 'Data de Vencimento'
            },
            billAmount: {
              label: 'Valor'
            }
          }
        },
        action: {
          register: {
            type: {
              create: { title: 'Registro de Conta' },
              update: { title: 'Edição de Conta' }
            },          
            panel: {
              debtor: {
                title: 'Devedor',
                label: {
                  name: 'Nome',
                  phone: 'Telefone',
                  email: 'E-mail',
                  address: 'Endereço'
                }
              },
              category: {
                title: 'Categoria',
                label: {
                  code: 'Código',
                  name: 'Nome'
                }
              },
              installments: {
                title: 'Parcelamento',
                label: {
                  parcel: 'Parcela',
                  dueDate: 'Vencimento',
                  value: `Valor (${Utilities.currencySymbol})`,
                  received: `Recebido (${Utilities.currencySymbol})`
                }
              },
              description: {
                title: 'Descrição',
                field: {
                  textarea: {
                    placeholder: 'Digite aqui uma descrição...'
                  }
                }
              },
              balance: {
                title: 'Balanço',
                label: {           
                  plots: 'Parcelas Recebidas',
                  received: `Valor Recebido (${Utilities.currencySymbol})`,
                  amount: `Valor a Receber (${Utilities.currencySymbol})`
                }
              },
              button: {
                register: 'Registrar'
              }
            },
            toast: {
              title: 'Recebimento',
              section: {
                informations: {
                  label: {
                    parcel: 'Parcela',
                    dueDate: 'Vencimento',
                    amount: `Valor da Parcela (${Utilities.currencySymbol})`,
                    received: `Valor Recebido (${Utilities.currencySymbol})`
                  }
                },
                settings: {
                  title: 'Configurações',
                  label: {
                    discount: `Desconto (${Utilities.currencySymbol})`,
                    interest: `Juros / Multa (${Utilities.currencySymbol})`
                  }
                },
                paymentMethods: {
                  title: 'Meios de Pagamento',
                  label: {
                    name: 'Nome',
                    plots: 'Parcela',
                    amount: `Valor (${Utilities.currencySymbol})`
                  },
                  noData: 'Não há meios de pagamento adicionados.'
                },
                balance: {
                  label: {
                    amount: 'Valor Recebido'
                  }
                }
              }
            },
            layer: {
              debtors: { title: 'Clientes' },
              categories: { title: 'Categorias' },
              paymentMethods: { title: 'Meios de Pagamento' }
            }
          },       
          read: {
            title: 'Detalhes da Conta',
            section: {
              info: {
                title: 'Informações',
                label: {
                  code: 'Código da Conta',
                  referenceCode: 'Código de Referência',
                  status: {
                    title: 'Status',
                    enum: {
                      LATE: 'ATRASADA',
                      PENDENT: 'PENDENTE',
                      CONCLUDED: 'CONCLUÍDA',
                      CANCELED: 'CANCELADA',
                    }
                  }
                }
              },
              debtor: {
                title: 'Devedor',
                label: {
                  code: 'Código',
                  name: 'Nome',
                  phone: 'Telefone',
                  email: 'E-mail',
                  address: 'Endereço'
                }
              },
              category: {
                title: 'Categoria',
                label: {
                  code: 'Código',
                  name: 'Nome'
                }
              },
              description: {
                title: 'Descrição',               
              },
              installments: {
                title: 'Parcelamento',
                label: {
                  parcel: 'Parcela',
                  dueDate: 'Vencimento',
                  amount: `Valor (${Utilities.currencySymbol})`,
                  received: `Recebido (${Utilities.currencySymbol})`,
                  status: 'Status'
                }
              },
              balance: {
                title: 'Balanço',
                label: {
                  plots: 'Parcelas Recebidas',
                  received: `Valor Recebido (${Utilities.currencySymbol})`,
                  amount: `Valor a Receber (${Utilities.currencySymbol})`
                }
              }             
            },
            button: {
              print: {
                title: 'Imprimir Conta',
                label: 'Imprimir'
              }
            }
          },
          cancel: {
						title: 'Cancelamento de Conta',
            notice: 'Você deseja realmente cancelar esta conta a receive?',
            warning: 'Esteja ciente de que esta ação é irreversível, portanto, analise-a cuidadosamente antes de continuar.',
            option: {
              cancel: 'Cancelar',
              confirm: 'Confirmar'
            }
          },
          delete: {
						title: 'Exclusão de Conta',
            notice: 'Você deseja realmente excluir esta conta a receive?',
            warning: 'Esteja ciente de que esta ação é irreversível, portanto, analise-a cuidadosamente antes de continuar.',
            option: {
              cancel: 'Cancelar',
              confirm: 'Confirmar'
            }
          }
        }
      },
      notification: {
        register: 'A conta a receber foi registrada com sucesso.',
        update: 'A conta a receber foi atualizada com sucesso.',
        cancel: 'A conta a receber foi cancelada com sucesso.',
        delete: 'A conta a receber foi excluída com sucesso.',
        error: 'Houve um erro inesperado. Por favor, tente novamente.'
      },
      systemLog: {
        register: 'Registro de conta a receber.',
        update: 'Atualização de conta a receber.',
        cancel: 'Cancelamento de conta a receber.',
        delete: 'Exclusão de conta a receber.'
      }
    },
    'en_US': {
      pageTitle: 'Bills to Receive',
      table: {
        label: {
          code: 'Code',
          dueDate: 'Due Date',
          debtor: 'Debtor',            
          category: 'Category',           
          installments: 'Installments',
          status: 'Status',
          value: `Amount (${Utilities.currencySymbol})`,
          actions: 'Actions'
        },
        enum: {
          status: {
            PENDENT: 'PENDENT',
            CONCLUDED: 'CONCLUDED',
            CANCELED: 'CANCELED'
          }          
        },
        action: {
          read: { title: 'View' },
          update: { title: 'Update' },
          cancel: { title: 'Cancel' },
          delete: { title: 'Delete' }
        }
      },
      modal: {
        filters: {
          title: 'Filters',
          field: {
            accountCode: {
              label: 'Account Code'
            },
            referenceCode: {
              label: 'Reference Code'
            },
            debtor: {
              label: 'Debtor',
              option: {
                code: {
                  label: 'Code',
                  path: 'Debtor/Code'
                },
                name: {
                  label: 'Name',
                  path: 'Debtor/Name'
                }
              }
            },
            category: {
              label: 'Category',
              option: {
                code: {
                  label: 'Code',
                  path: 'Category/Code'
                },
                name: {
                  label: 'Name',
                  path: 'Category/Name'
                }
              }
            },
            billStatus: {
              label: 'Status',
              list: {
                pendent: {
                  label: 'PENDENT'
                },
                concluded: {
                  label: 'CONCLUDED'
                },
                canceled: {
                  label: 'CANCELED'
                },
              }
            },
            dueDate: {
              label: 'Due Date'
            },
            billAmount: {
              label: 'Value'
            }
          }
        },
        action: {
          register: {
            type: {
              create: { title: 'Register Account' },
              update: { title: 'Account Editing' }
            },
            panel: {
              debtor: {
                title: 'Debtor',
                label: {
                  name: 'Name',
                  phone: 'Phone',
                  email: 'Email',
                  address: 'Address'                  
                }
              },
              category: {
                title: 'Category',
                label: {
                  code: 'Code',
                  name: 'Name'
                }
              },
              installments: {
                title: 'Installment',
                label: {
                  status: 'Status',
                  parcel: 'Parcela',
                  dueDate: 'Due Date', 
                  value: `Amount (${Utilities.currencySymbol})`,
                  received: `Recebido (${Utilities.currencySymbol})`                 
                }
              },
              description: {
                title: 'Description',
                field: {
                  textarea: {
                    placeholder: 'Enter a description here...'
                  }
                }
              },
              balance: {
                title: 'Balance',
                label: {           
                  plots: 'Plots Received',
                  received: `Amount Received (${Utilities.currencySymbol})`,
                  amount: `Amount Receivable (${Utilities.currencySymbol})`
                }
              },
              button: {
                register: 'Register'
              }
            },
            toast: {
              title: 'Receipt',
              section: {
                informations: {
                  label: {
                    parcel: 'Parcel',
                    dueDate: 'Due Date',
                    amount: `Installment Value (${Utilities.currencySymbol})`,
                    received: `Amount received (${Utilities.currencySymbol})`
                  }
                },
                settings: {
                  title: 'Settings',
                  label: {
                    discount: `Discount (${Utilities.currencySymbol})`,
                    interest: `Interest / Fine (${Utilities.currencySymbol})`
                  }
                },
                paymentMethods: {
                  title: 'Payment Methods',
                  label: {
                    name: 'Name',
                    plots: 'Plots',
                    amount: `Amount (${Utilities.currencySymbol})`
                  },
                  noData: 'There are no payment methods added.'
                },
                balance: {
                  label: {
                    amount: 'Amount Received'
                  }
                }
              }
            },
            layer: {
              debtors: { title: 'Customers' },
              categories: { title: 'Categories' },
              paymentMethods: { title: 'Payment Methods' }
            }
          },
          read: {
            title: 'Account Details',
            section: {
              info: {
                title: 'Informations',
                label: {
                  code: 'Account Code',
                  referenceCode: 'Reference Code',
                  status: {
                    title: 'Status',
                    enum: {
                      LATE: 'LATE',
                      PENDENT: 'PENDENT',
                      CONCLUDED: 'CONCLUDED',
                      CANCELED: 'CANCELED',
                    }
                  }
                }
              },
              debtor: {
                title: 'Debtor',
                label: {
                  code: 'Code',
                  name: 'Name',                  
                  phone: 'Phone',
                  email: 'Email',
                  address: 'Address'
                }
              },
              category: {
                title: 'Category',
                label: {
                  code: 'Code',
                  name: 'Name'
                }
              },
              description: {
                title: 'Description',
              },
              installments: {
                title: 'Installment',
                label: {
                  parcel: 'Parcel',
                  dueDate: 'Due Date',
                  amount: `Amount (${Utilities.currencySymbol})`,
                  received: `Received (${Utilities.currencySymbol})`,
                  status: 'Status'
                }
              }, 
              balance: {
                title: 'Balance',
                label: {
                  plots: 'Plots Received',
                  received: `Amount Received (${Utilities.currencySymbol})`,
                  amount: `Amount Receivable (${Utilities.currencySymbol})`
                }
              }
            },
            button: {
              print: {
                title: 'Print Account',
                label: 'Print'
              }
            }      
          },
          cancel: {
            title: 'Account Cancellation',
            notice: 'Do you really want to cancel this receivable account?',
            warning: 'Be aware that this action is irreversible, so please review it carefully before proceeding.',
            option: {
              cancel: 'Cancel',
              confirm: 'Confirm'
            }
          },
          delete: {
            title: 'Account Exclusion',
            notice: 'Do you really want to delete this receivable account?',
            warning: 'Be aware that this action is irreversible, so please review it carefully before proceeding.',
            option: {
              cancel: 'Cancel',
              confirm: 'Confirm'
            }
          } 
        }
      },
      notification: {
        register: 'The receivable account was successfully registered.',
        update: 'The receivable account was successfully updated.',
        cancel: 'The receivable account was successfully canceled.',
        delete: 'The receivable account was successfully deleted.',
        error: 'There was an unexpected error. Please try again.'
      },
      systemLog: {
        register: 'Account receivable registration.',
        update: 'Account receivable update.',
        cancel: 'Account receivable cancellation.',
        delete: 'Account receivable exclusion.'
      }
    }
  };

  public static get(language?: string) {
    return BillsToReceiveTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
