import { ProjectSettings } from "@assets/settings/company-settings";
import { Utilities } from "@shared/utilities/utilities";

export class BillsToPayTranslate {

  private static obj = {
    'pt_BR': {
      pageTitle: 'Contas a Pagar',
      table: {
        label: {
          code: 'Código',
          dueDate: 'Vencimento',
          beneficiary: 'Beneficiário',           
          category: 'Categoria',           
          department: 'Departamento',
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
            beneficiary: {
              label: 'Beneficiário',
              option: {
                code: {
                  label: 'Código',
                  path: 'Beneficiário/Código'
                },
                name: {
                  label: 'Nome',
                  path: 'Beneficiário/Nome'
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
            department: {
              label: 'Departamento',
              option: {
                code: {
                  label: 'Código',
                  path: 'Departamento/Código'
                },
                name: {
                  label: 'Nome',
                  path: 'Departamento/Nome'
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
              beneficiary: {
                title: 'Beneficiário',
                label: {
                  name: 'Nome',
                  email: 'E-mail',
                  phone: 'Telefone',
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
              department: {
                title: 'Departamento',
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
                  paid: `Pago (${Utilities.currencySymbol})`
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
                  plots: 'Parcelas Pagas',
                  paid: `Valor Pago (${Utilities.currencySymbol})`,
                  amount: `Valor da Conta (${Utilities.currencySymbol})`
                }
              },
              button: {
                register: 'Registrar'
              }
            },
            toast: {
              title: 'Pagamento',
              section: {
                informations: {
                  label: {
                    parcel: 'Parcela',
                    dueDate: 'Vencimento',
                    amount: `Valor da Parcela (${Utilities.currencySymbol})`,
                    paid: `Valor Pago (${Utilities.currencySymbol})`
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
                    amount: 'Valor Pago'
                  }
                }
              }
            },
            layer: {
              beneficiaries: { title: 'Fornecedores' },
              categories: { title: 'Categorias' },
              departments: { title: 'Departamentos de Produto' },
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
              beneficiary: {
                title: 'Beneficiário',
                label: {
                  code: 'Código',
                  name: 'Nome',
                  address: 'Endereço',
                  phone: 'Telefone',
                  email: 'E-mail'
                }
              },
              category: {
                title: 'Categoria',
                label: {
                  code: 'Código',
                  name: 'Nome'
                }
              },
              department: {
                title: 'Departamento',
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
                  paid: `Pago (${Utilities.currencySymbol})`,
                  status: 'Status'
                }
              },
              balance: {
                title: 'Balanço',
                label: {
                  plots: 'Parcelas Pagas',
                  paid: `Valor Pago (${Utilities.currencySymbol})`,
                  amount: `Valor da Conta (${Utilities.currencySymbol})`
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
            notice: 'Você deseja realmente cancelar esta conta a pagar?',
            warning: 'Esteja ciente de que esta ação é irreversível, portanto, analise-a cuidadosamente antes de continuar.',
            option: {
              cancel: 'Cancelar',
              confirm: 'Confirmar'
            }
          },
          delete: {
						title: 'Exclusão de Conta',
            notice: 'Você deseja realmente excluir esta conta a pagar?',
            warning: 'Esteja ciente de que esta ação é irreversível, portanto, analise-a cuidadosamente antes de continuar.',
            option: {
              cancel: 'Cancelar',
              confirm: 'Confirmar'
            }
          }        
        }
      },
      notification: {
        register: 'A conta a pagar foi registrada com sucesso.',
        update: 'A conta a pagar foi atualizada com sucesso.',
        cancel: 'A conta a pagar foi cancelada com sucesso.',
        delete: 'A conta a pagar foi excluída com sucesso.',
        error: 'Houve um erro inesperado. Por favor, tente novamente.'
      },
      systemLog: {
        register: 'Registro de conta a pagar.',
        update: 'Atualização de conta a pagar.',
        cancel: 'Cancelamento de conta a pagar.',
        delete: 'Exclusão de conta a pagar.'
      }
    },
    'en_US': {
      pageTitle: 'Bills to Pay',
      table: {
        label: {
          code: 'Code',
          dueDate: 'Due Date',
          beneficiary: 'Beneficiary',            
          category: 'Category',
          department: 'Department',
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
            beneficiary: {
              label: 'Beneficiary',
              option: {
                code: {
                  label: 'Code',
                  path: 'Beneficiary/Code'
                },
                name: {
                  label: 'Name',
                  path: 'Beneficiary/Name'
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
            department: {
              label: 'Department',
              option: {
                code: {
                  label: 'Code',
                  path: 'Department/Code'
                },
                name: {
                  label: 'Name',
                  path: 'Department/Name'
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
              beneficiary: {
                title: 'Beneficiary',
                label: {
                  name: 'Name',
                  email: 'Email',
                  phone: 'Phone',
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
              department: {
                title: 'Department',
                label: {
                  code: 'Code',
                  name: 'Name'
                }
              },
              installments: {
                title: 'Installment',
                label: {
                  status: 'Status',
                  parcel: 'Parcel',
                  dueDate: 'Due Date', 
                  value: `Amount (${Utilities.currencySymbol})`,
                  paid: `Paid (${Utilities.currencySymbol})`                 
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
                  plots: 'Plots Paid',
                  paid: `Amount Paid (${Utilities.currencySymbol})`,
                  amount: `Account Amount (${Utilities.currencySymbol})`
                }
              },
              button: {
                register: 'Register'
              }
            },
            toast: {
              title: 'Payment',
              section: {
                informations: {
                  label: {
                    parcel: 'Parcel',
                    dueDate: 'Due Date',
                    amount: `Installment Value (${Utilities.currencySymbol})`,
                    paid: `Amount Paid (${Utilities.currencySymbol})`
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
                    amount: 'Amount Paid'
                  }
                }
              }
            },
            layer: {
              beneficiaries: { title: 'Providers' },
              categories: { title: 'Categories' },
              departments: { title: 'Product Departments' },
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
              beneficiary: {
                title: 'Beneficiary',
                label: {
                  code: 'Code',
                  name: 'Name',
                  address: 'Address',
                  phone: 'Phone',
                  email: 'Email'
                }
              },
              category: {
                title: 'Category',
                label: {
                  code: 'Code',
                  name: 'Name'
                }
              },
              department: {
                title: 'Department',
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
                  paid: `Paid (${Utilities.currencySymbol})`,
                  status: 'Status'
                }
              },              
              balance: {
                title: 'Balance',
                label: {
                  plots: 'Plots Paid',                  
                  paid: `Amount Paid (${Utilities.currencySymbol})`,
                  amount: `Account Amount (${Utilities.currencySymbol})`
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
            notice: 'Do you really want to cancel this payable account?',
            warning: 'Be aware that this action is irreversible, so please review it carefully before proceeding.',
            option: {
              cancel: 'Cancel',
              confirm: 'Confirm'
            }
          },
          delete: {
            title: 'Account Exclusion',
            notice: 'Do you really want to delete this payable account?',
            warning: 'Be aware that this action is irreversible, so please review it carefully before proceeding.',
            option: {
              cancel: 'Cancel',
              confirm: 'Confirm'
            }
          }         
        }        
      },
      notification: {
        register: 'The payable account was successfully registered.',
        update: 'The payable account was successfully updated.',
        cancel: 'The payable account was successfully canceled.',
        delete: 'The payable account was successfully deleted.',
        error: 'There was an unexpected error. Please try again.'
      },
      systemLog: {
        register: 'Account payable registration',
        update: 'Account payable update.',
        cancel: 'Account payable cancellation.',
        delete: 'Account payable exclusion.'
      }
    }
  }

  public static get(language?: string) {
    return BillsToPayTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
