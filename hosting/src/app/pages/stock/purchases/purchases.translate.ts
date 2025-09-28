import { ProjectSettings } from "@assets/settings/company-settings";
import { Utilities } from "@shared/utilities/utilities";

export class PurchasesTranslate {

  private static obj = {
    'pt_BR': {
      pageTitle: 'Compras',
      table: {
        label: {
          code: 'Código',
          date: 'Data',
          provider: 'Fornecedor',          
          purchaseStatus: 'Status da Compra',            
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
            provider: {
              label: 'Fornecedor',
              option: {
                code: {
                  label: 'Código',
                  path: 'Fornecedor/Código'
                },
                name: {
                  label: 'Nome',
                  path: 'Fornecedor/Nome'
                }
              }
            },
            product: {
              label: 'Produto',
              option: {
                code: {
                  label: 'Código',
                  path: 'products/code'
                },
                name: {
                  label: 'Nome',
                  path: 'products/name'
                }
              }
            },
            purchaseStatus: {
              label: 'Status da Compra',
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
            purchaseDate: {
              label: 'Data da Compra'
            },
            value: {
              label: 'Valor'
            }
          }
        },
        action: {
          register: {
            type: {
              create: { title: 'Registro de Compra' },
              update: { title: 'Edição da Compra' }
            },
            panel: {
              provider: {
                title: 'Fornecedor',
                label: {
                  name: 'Nome',
                  address: 'Endereço',
                  phone: 'Telefone'
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
                  configFromXML: "Configurar a partir de XML",
                  purchaseDate: 'Data da Compra',                  
                  note: 'Observações',
                  attachment: {
                    title: 'Anexo',
                    message: {
                      noFile: 'Nenhum arquivo anexado..'
                    }
                  },
                  xmlImport: {
                    title: 'XML Nota Fiscal',
                    message: {
                      noFile: 'Nenhum arquivo selecionado..'
                    }
                  }
                }
              },
              financial: {
                title: 'Conta a pagar',
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
              providers: { title: 'Fornecedores' },
              products: { title: 'Produtos' },
              billToPay: { title: 'Conta a Pagar' },
              categories: {title: 'Categorias'},
              commercialUnits: {title: 'Unidades Comerciais'},
            },
          },          
          read: {
            title: 'Detalhes da Compra',
            section: {
              info: {
                title: 'Informações',
                label: {
                  code: 'Código da Compra',
                  billToPayCode: 'Código da Conta a Pagar',
                  purchaseDate: 'Data da Compra',
                  purchaseStatus: {
                    title: 'Status da Compra',
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
              supply: {
                title: 'Fornecedor',
                label: {
                  name: 'Nome',
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
              paymentMethods: {
                title: 'Forma(s) de Pagamento',
                label: {
                  note: 'Observação'
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
						title: 'Aceite de Compra',
            notice: 'Você deseja realmente aceitar esta compra?',
            warning: 'Esteja ciente de que esta ação é irreversível, portanto, analise-a cuidadosamente antes de continuar.',
            option: {
              cancel: 'Cancelar',
              confirm: 'Confirmar'
            }
          },
          cancel: {
						title: 'Cancelamento de Compra',
            notice: 'Você deseja realmente cancelar esta compra?',
            warning: 'Esteja ciente de que esta ação é irreversível, portanto, analise-a cuidadosamente antes de continuar.',
            option: {
              cancel: 'Cancelar',
              confirm: 'Confirmar'
            }
          },
          delete: {
						title: 'Exclusão de Compra',
            notice: 'Você deseja realmente excluir esta compra?',
            warning: 'Esteja ciente de que esta ação é irreversível, portanto, analise-a cuidadosamente antes de continuar.',
            option: {
              cancel: 'Cancelar',
              confirm: 'Confirmar'
            }
          }         
        }        
      },
      notification: {
        register: 'A compra foi registrada com sucesso.',
        update: 'A compra foi atualizada com sucesso.',
        accept: 'A compra foi aceita com sucesso.',
        cancel: 'A compra foi cancelada com sucesso.',
        delete: 'A compra foi excluída com sucesso.',
        error: 'Houve um erro inesperado. Por favor, tente novamente.'
      },
      systemLog: {
        register: 'Registro de compra.',
        update: 'Atualização de compra.',
        accept: 'Aceite de compra.',
        cancel: 'Cancelamento de compra.',
        delete: 'Exclusão de compra.'
      }
    },
    'en_US': {
      pageTitle: 'Purchases',
      table: {
        label: {
          code: 'Code',
          date: 'Date',
          provider: 'Provider',       
          purchaseStatus: 'Purchase Status',
          paymentStatus: 'Payment Status',
          value: 'Value',
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
            provider: {
              label: 'Provider',
              option: {
                code: {
                  label: 'Code',
                  path: 'Provider/Code'
                },
                name: {
                  label: 'Name',
                  path: 'Provider/Name'
                }
              }
            },
            product: {
              label: 'Product',
              option: {
                code: {
                  label: 'Code',
                  path: 'products/code'
                },
                name: {
                  label: 'Name',
                  path: 'products/name'
                }
              }
            },
            purchaseStatus: {
              label: 'Purchase Status',
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
            purchaseDate: {
              label: 'Purchase Date'
            },
            value: {
              label: 'Value'
            }
          }
        },
        action: {
          register: {
            type: {
              create: { title: 'Register Purchase' },
              update: { title: 'Purchase Editing' }
            },
            panel: {
              provider: {
                title: 'Provider',
                label: {
                  name: 'Name',
                  address: 'Address',
                  phone: 'Phone'
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
                  configFromXML: "Config from XMl file",
                  purchaseDate: 'Purchase Date',                  
                  note: 'Note',
                  attachment: { 
                    title: 'Attachment',
                    message: {
                      noFile: 'No files attached..'
                    }
                  },
                  xmlImport: {
                    title: 'XML Nota Fiscal',
                    message: {
                      noFile: 'Nenhum arquivo selecionado..'
                    }
                  }
                }
              },
              financial: {
                title: 'Bill to pay',
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
              providers: { title: 'Providers' },
              products: { title: 'Products' },
              billToPay: { title: 'Bill to Pay' },
              categories: {title: 'Categories'},
              commercialUnits: {title: 'Comercial Units'},
            }
          },          
          read: {
            title: 'Purchase Details',
            section: {
              info: {
                title: 'Informations',
                label: {
                  code: 'Purchase Code',
                  billToPayCode: 'Account Code Payable',
                  purchaseDate: 'Purchase Date',
                  purchaseStatus: {
                    title: 'Purchase Status',
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
              supply: {
                title: 'Provider',
                label: {
                  name: 'Name',
                  personalDocument: 'SSN',
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
              paymentMethods: {
                title: 'Payment Methods',
                label: {
                  note: 'Note'
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
						title: 'Purchase Acceptance',
            notice: 'Do you really want to accept this purchase?',
            warning: 'Be aware that this action is irreversible, so please review it carefully before proceeding.',
            option: {
              cancel: 'Cancel',
              confirm: 'Confirm'
            }
          },
          cancel: {
						title: 'Purchase Cancellation',
            notice: 'Do you really want to cancel this purchase?',
            warning: 'Be aware that this action is irreversible, so please review it carefully before proceeding.',
            option: {
              cancel: 'Cancel',
              confirm: 'Confirm'
            }
          },
          delete: {
						title: 'Purchase Exclusion',
            notice: 'Do you really want to delete this purchase?',
            warning: 'Be aware that this action is irreversible, so please review it carefully before proceeding.',
            option: {
              cancel: 'Cancel',
              confirm: 'Confirm'
            }
          }
        }
      },
      notification: {
        register: 'The purchase was successfully registered.',
        update: 'The purchase was successfully updated.',
        accept: 'The purchase was successfully accepted.',
        cancel: 'The purchase was successfully canceled.',
        delete: 'The purchase was successfully deleted.',
        error: 'There was an unexpected error. Please try again.'
      },
      systemLog: {
        register: 'Purchase registration.',
        update: 'Purchase update.',
        accept: 'Purchase Acception.',
        cancel: 'Purchase cancellation.',
        delete: 'Purchase exclusion.'
      }
    }
  };

  public static get(language?: string) {
    return PurchasesTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
