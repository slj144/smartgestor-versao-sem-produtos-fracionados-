import { ProjectSettings } from "@assets/settings/company-settings";
import { Utilities } from "@shared/utilities/utilities";

export class TransfersTranslate {

  private static obj = {
    'pt_BR': {
      pageTitle: 'Transferências',
      table: {
        label: {
          code: 'Código',
          date: 'Data',
          origin: 'Origem',
          destination: 'Destino',
          transferStatus: 'Status da Transferência',
          paymentStatus: 'Status do Pagamento',
          value: 'Valor',
          actions: 'Ações'
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
          accept: { title: 'Aceitar' },
          cancel: { title: 'Cancelar' },
          delete: { title: 'Excluir' }
        }
      },
      modal: {
        filters: {
          title: 'Filtros',
          field: {
            code: {
              label: 'Código'
            },
            origin: {
              label: 'Origem',
              option: {
                code: {
                  label: 'Código',
                  path: 'Origem/Código'
                },
                name: {
                  label: 'Nome',
                  path: 'Origem/Nome'
                }
              }
            },
            destination: {
              label: 'Destino',
              option: {
                code: {
                  label: 'Código',
                  path: 'Destino/Código'
                },
                name: {
                  label: 'Nome',
                  path: 'Destino/Nome'
                }
              }
            },
            transferStatus: {
              label: 'Status da Transferência',
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
            paymentStatus: {
              label: 'Status do Pagamento',
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
            transferDate: {
              label: 'Data da Transferência'
            },
            value: {
              label: 'Valor'
            }
          }
        },
        action: {
          register: {
            type: {
              create: { title: 'Registro de Transferência' },
              update: { title: 'Edição da Transferência' }
            },
            panel: {
              store: {
                title: 'Loja',
                label: {
                  name: 'Nome',
                  email: 'E-mail',
                  phone: 'Telefone',
                  address: 'Endereço'
                }
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
                  costPrice: `P. Custo (${Utilities.currencySymbol})`,
                  salePrice: `P. Venda (${Utilities.currencySymbol})`,
                  averageCost: `Custo Médio (${Utilities.currencySymbol})`,
                  total: `Total (${Utilities.currencySymbol})`
                }
              },              
              settings: {
                title: 'Configurações',
                label: {                 
                  note: 'Observações',
                  attachment: {
                    title: 'Anexo',
                    message: {
                      noFile: 'Nenhum arquivo anexado..'
                    }
                  }
                }
              },
              financial: {
                title: 'Conta a receber',
                label: {
                  installments: 'Parcelas',
                  expirationDay: 'Dia de Vencimento'
                }
              },
              balance: {
                label: {
                  subtotal: {
                    title: 'Subtotal',
                    integrant: {
                      items: 'Itens',
                      cost: 'Custo'
                    }
                  },
                  total: 'Total'
                }
              },
              button: {
                register: 'Registrar'
              }
            },
            layer: {
              stores: { title: 'Lojas' },
              products: { title: 'Produtos' },
              billToReceive: { title: 'Conta a Receber' }
            }
          },          
          read: {
            title: 'Detalhes da Transferência',
            section: {
              info: {
                title: 'Informações',
                label: {
                  code: 'Código da Transferência',
                  billToPayCode: 'Código da Conta a Pagar',
                  billToReceiveCode: 'Código da Conta a Receber',
                  transferDate: 'Data da Transferência',
                  receiptDate: 'Data de Recebimento',
                  transferStatus: {
                    title: 'Status da Transferência',
                    enum: {
                      PENDENT: 'PENDENTE',
                      CONCLUDED: 'CONCLUÍDA',
                      CANCELED: 'CANCELADA'
                    }
                  },
                  paymentStatus: {
                    title: 'Status de Pagamento',
                    enum: {
                      PENDENT: 'PENDENTE',
                      CONCLUDED: 'CONCLUÍDA',
                      CANCELED: 'CANCELADA'
                    }
                  }
                }
              },
              origin: {
                title: 'Origem',
                label: {
                  name: 'Nome',
                  businessDocument: 'CNPJ',
                  address: 'Endereço',
                  phone: 'Telefone',
                  email: 'E-mail'
                }
              },
              destination: {
                title: 'Destino',
                label: {
                  name: 'Nome',
                  businessDocument: 'CNPJ',
                  address: 'Endereço',
                  phone: 'Telefone',
                  email: 'E-mail'
                }
              },
              products: {
                title: 'Produtos',
                label: {
                  code: 'Código',
                  name: 'Nome',
                  quantity: 'Quantidade',
                  costPrice: `P. Custo (${Utilities.currencySymbol})`,
                  salePrice: `P. Venda (${Utilities.currencySymbol})`,
                  total: `Total (${Utilities.currencySymbol})`
                }
              },
              balance: {
                title: 'Balanço',
                label: {
                  quantity: 'Quantidade',
                  total: 'Total'
                }             
              },
              note: {
                title: 'Observações'                
              },
              attachment: {
                label: 'Visualizar Documento Anexado'
              },
              button: {
                print: 'Imprimir'
              }
            }
          },
          accept: {
						title: 'Aceite de Transferência',
            notice: 'Você deseja realmente aceitar esta transferência?',
            warning: 'Esteja ciente de que esta ação é irreversível, portanto, analise-a cuidadosamente antes de continuar.',
            option: {
              cancel: 'Cancelar',
              confirm: 'Confirmar'
            }
          },
          cancel: {
						title: 'Cancelamento de Transferência',
            notice: 'Você deseja realmente cancelar esta transferência?',
            warning: 'Esteja ciente de que esta ação é irreversível, portanto, analise-a cuidadosamente antes de continuar.',
            option: {
              cancel: 'Cancelar',
              confirm: 'Confirmar'
            }
          },
          delete: {
						title: 'Exclusão de Transferência',
            notice: 'Você deseja realmente excluir esta transferência?',
            warning: 'Esteja ciente de que esta ação é irreversível, portanto, analise-a cuidadosamente antes de continuar.',
            option: {
              cancel: 'Cancelar',
              confirm: 'Confirmar'
            }
          },
          others: {
            priceList: {
              title: 'Tabela de Preços'
            }
          }
        }
      },
      notification: {
        register: 'A transferência foi registrada com sucesso.',
        update: 'A transferência foi atualizada com sucesso.',
        cancel: 'A transferência foi cancelada com sucesso.',
        delete: 'A transferência foi excluída com sucesso.',
        accept: 'A transferência foi aceita com sucesso.',
        error: 'Houve um erro inesperado. Por favor, tente novamente.'
      },
      systemLog: {
        register: 'Registro de transferência.',
        update: 'Atualização de transferência.',
        cancel: 'Cancelamento de transferência.',
        delete: 'Exclusão de transferência.',
        accept: 'Aceite de transferência.'
      }
    },
    'en_US': {
      pageTitle: 'Transfers',
      table: {
        label: {
          code: 'Transfer Code',
          date: 'Date of Transfer',
          origin: 'Origin',
          destination: 'Destination',
          transferStatus: 'Transfer Status',
          paymentStatus: 'Payment Status',
          value: 'Valor',
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
          update: { title: 'Edit' },
          accept: { title: 'Accept' },
          cancel: { title: 'Cancel' },
          delete: { title: 'Delete' }
        }
      },
      modal: {
        filters: {
          title: 'Filters',
          field: {
            code: {
              label: 'Code'
            },
            origin: {
              label: 'Origin',
              option: {
                code: {
                  label: 'Code',
                  path: 'Origin/Code'
                },
                name: {
                  label: 'Name',
                  path: 'Origin/Name'
                }
              }
            },
            destination: {
              label: 'Destination',
              option: {
                code: {
                  label: 'Code',
                  path: 'Destination/Code'
                },
                name: {
                  label: 'Name',
                  path: 'Destination/Name'
                }
              }
            },
            transferStatus: {
              label: 'Transfer Status',
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
            paymentStatus: {
              label: 'Payment Status',
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
            transferDate: {
              label: 'Transfer Date'
            },
            value: {
              label: 'Value'
            }
          }
        },
        action: {
          register: {
            type: {
              create: { title: 'Register Transfer' },
              update: { title: 'Transfer Editing' }
            },
            panel: {
              store: {
                title: 'Store',
                label: {
                  name: 'Name',
                  email: 'Email',
                  phone: 'Phone',
                  address: 'Address'
                }
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
                  costPrice: `Cost Price (${Utilities.currencySymbol})`,
                  salePrice: `Sale Price (${Utilities.currencySymbol})`,
                  averageCost: `Average Cost (${Utilities.currencySymbol})`,
                  total: `Total (${Utilities.currencySymbol})`
                }
              },              
              settings: {
                title: 'Settings',
                label: {
                  note: 'Note',
                  attachment: { 
                    title: 'Attachment',
                    message: {
                      noFile: 'No files attached..'
                    }
                  }
                }
              },
              financial: {
                title: 'Bill to receive',
                label: {
                  installments: 'Installments',
                  expirationDay: 'Expiration Day'                 
                }
              },
              balance: {
                label: {
                  subtotal: {
                    title: 'Subtotal',
                    integrant: {
                      items: 'Items',
                      cost: 'Cost'
                    }
                  },
                  total: 'Total'
                }
              },
              button: {
                register: 'Register'
              }
            },
            layer: {
              stores: { title: 'Stores' },
              products: { title: 'Products' },
              billToReceive: { title: 'Bill to Receive' }
            }
          },          
          read: {
            title: 'Transfer Details',
            section: {
              info: {
                title: 'Informations',
                label: {
                  code: 'Transfer Code',
                  billToPayCode: 'Account Code Payable',
                  billToReceiveCode: 'Account Code Receivable',
                  transferDate: 'Transfer Date',
                  receiptDate: 'Receipt Date',
                  transferStatus: {
                    title: 'Transfer Status',
                    enum: {
                      PENDENT: 'PENDENT',
                      CONCLUDED: 'CONCLUDED',
                      CANCELED: 'CANCELED'
                    }
                  },
                  paymentStatus: {
                    title: 'Payment Status',
                    enum: {
                      PENDENT: 'PENDENT',
                      CONCLUDED: 'CONCLUDED',
                      CANCELED: 'CANCELED'
                    }
                  }
                }
              },
              origin: {
                title: 'Origin',
                label: {
                  name: 'Name',
                  businessDocument: 'CNPJ',
                  address: 'Address',
                  phone: 'Phone',
                  email: 'Email'
                }
              },
              destination: {
                title: 'Destination',
                label: {
                  name: 'Name',
                  businessDocument: 'CNPJ',
                  address: 'Address',
                  phone: 'Phone',
                  email: 'Email'
                }
              },
              products: {
                title: 'Products',
                label: {
                  code: 'Code',
                  name: 'Name',
                  quantity: 'Quantity',
                  costPrice: `Cost Price (${Utilities.currencySymbol})`,
                  salePrice: `Sale Price (${Utilities.currencySymbol})`,
                  total: `Total (${Utilities.currencySymbol})`
                }
              },
              balance: {
                title: 'Balance',
                label: {
                  quantity: 'Quantity',
                  total: 'Total'
                }
              },
              note: {
                title: 'Note'                
              },
              attachment: {
                label: 'View Attached Document'
              },
              button: {
                print: 'Print'
              }
            }
          },          
          accept: {
						title: 'Transfer Acceptance',
            notice: 'Do you really want to accept this transfer?',
            warning: 'Be aware that this action is irreversible, so please review it carefully before proceeding.',
            option: {
              cancel: 'Cancel',
              confirm: 'Confirm'
            }
          },
          cancel: {
						title: 'Transfer Cancellation',
            notice: 'Do you really want to cancel this transfer?',
            warning: 'Be aware that this action is irreversible, so please review it carefully before proceeding.',
            option: {
              cancel: 'Cancel',
              confirm: 'Confirm'
            }
          },
          delete: {
						title: 'Transfer Exclusion',
            notice: 'Do you really want to delete this transfer?',
            warning: 'Be aware that this action is irreversible, so please review it carefully before proceeding.',
            option: {
              cancel: 'Cancel',
              confirm: 'Confirm'
            }
          },
          others: {
            priceList: {
              title: 'Price List'
            }
          }
        }
      },
      notification: {
        register: 'The transfer was successfully registered.',
        update: 'The transfer was successfully updated.',
        cancel: 'The transfer was successfully canceled.',
        delete: 'The transfer was successfully deleted.',
        accept: 'The transfer was successfully accepted.',
        error: 'There was an unexpected error. Please try again.'
      },
      systemLog: {
        register: 'Transfer registration.',
        update: 'Transfer update.',
        cancel: 'Transfer cancellation.',
        delete: 'Transfer exclusion.',
        accept: 'Transfer acceptance.'
      }
    }
  };

  public static get(language?: string) {
    return TransfersTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
