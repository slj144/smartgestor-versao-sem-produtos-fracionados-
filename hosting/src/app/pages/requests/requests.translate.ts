import { ProjectSettings } from "../../../assets/settings/company-settings";
import { Utilities } from "@shared/utilities/utilities";

export class RequestsTranslate {

  private static obj = {
    'pt_BR': {
      pageTitle: 'Pedidos',
      header: {
        dropdown: {
          label: {

          }
        }
      },
      table: {
        label: {
          code: 'Código',
          date: 'Data',
          customer: 'Cliente',          
          operator: 'Colaborador',
          requestStatus: 'Status do Pedido',
          saleStatus: 'Status da Venda',
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
          cancel: { title: 'Cancelar' },
          delete: { title: 'Excluir' }
        }
      },
      modal: {
        filters: {
          title: 'Filtros',
          field: {
            requestCode: {
              label: 'Código do Pedido'
            },
            saleCode: {
              label: 'Código da Venda'
            },
            customer: {
              label: 'Cliente',
              option: {
                code: {
                  label: 'Código',
                  path: 'Cliente/Código'
                },
                name: {
                  label: 'Nome',
                  path: 'Cliente/Nome'
                }
              }
            },
            member: {
              label: 'Membro',
              option: {
                code: {
                  label: 'Código',
                  path: 'Membro/Código'
                },
                name: {
                  label: 'Nome',
                  path: 'Membro/Nome'
                }
              }
            },
            products: {
              label: 'Produtos',
              option: {
                code: {
                  label: 'Código',
                  path: 'Produtos/Código'
                },
                name: {
                  label: 'Nome',
                  path: 'Produtos/Nome'
                }
              }
            },
            operator: {
              label: 'Colaborador',
              option: {
                name: {
                  label: 'Nome',
                  path: 'Colaborador/Nome'
                }
              }
            },
            requestStatus: {
              label: 'Status do Pedido',
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
            saleStatus: {
              label: 'Status da Venda',
              list: {
                pendent: { label: 'PENDENTE' },
                concluded: { label: 'CONCLUÍDA' },
                canceled: { label: 'CANCELADA' },
              }
            },
            requestDate: {
              label: 'Data do Pedido'
            }
          }
        },
        action: {
          register: {
            type: {
              create: { title: 'Registro de Pedido' },
              update: { title: 'Edição de Pedido' }
            },
            panel: {
              customer: {
                title: 'Cliente',
                label: {
                  name: 'Nome',
                  address: 'Endereço',
                  personalDocument: 'CPF',
                  businessDocument: 'CNPJ',
                  phone: 'Telefone'
                }
              },
              member: {
                title: 'Membro',
                label: {
                  name: 'Nome',
                  address: 'Endereço',
                  personalDocument: 'CPF',
                  businessDocument: 'CNPJ',
                  phone: 'Telefone'
                }
              },
              scheme: {
                title: 'Esquema',
                quantity: "Quantidade"
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
              settings: {
                title: 'Configurações',
                option: {
                  conclusion: {
                    label: 'Concluir o pedido',
                    description: 'Esta opção marcará o pedido como concluído e, em seguida, uma venda pendente será gerada no caixa para este registro.'
                  }
                }
              },
              balance: {
                label: {
                  subtotal: {
                    title: 'Subtotal',
                    integrant: {
                      products: 'Produtos',
                      discount: 'Desconto'
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
              customers: { title: 'Clientes' },
              members: { title: 'Membros' },
              products: { title: 'Produtos' }
            }
          },        
          read: {
            title: 'Detalhes do Pedido',
            section: {
              informations: {
                title: 'Informações',
                label: {
                  requestCode: 'Código do Pedido',
                  saleCode: 'Código da Venda',
                  operator: 'Operador',
                  date: 'Data',
                  requestStatus: {
                    title: 'Status do Pedido',
                    enum: {
                      PENDENT: 'PENDENTE',
                      CONCLUDED: 'CONCLUÍDO',
                      CANCELED: 'CANCELADO'
                    }
                  },
                  saleStatus: {
                    title: 'Status da Venda',
                    enum: {
                      PENDENT: 'PENDENTE',
                      CONCLUDED: 'CONCLUÍDO',
                      CANCELED: 'CANCELADO'
                    }
                  }
                }
              },
              customer: {
                title: 'Cliente',
                label: {
                  name: 'Nome',
                  address: 'Endereço',
                  phone: 'Telefone'
                }
              },
              member: {
                title: 'Membro',
                label: {
                  name: 'Nome',
                  address: 'Endereço',
                  phone: 'Telefone'
                }
              },
              products: {
                title: 'Produtos',
                label: {
                  code: 'Código',
                  name: 'Nome',
                  quantity: 'Quantidade',
                  price: `Preço (${Utilities.currencySymbol})`,
                  total: `Total (${Utilities.currencySymbol})`
                }
              },
              balance: {
                title: 'Balanço',
                label: {
                  subtotal: {
                    title: 'Subtotal',
                    integrant: {
                      products: 'Produtos',
                      discount: 'Desconto'
                    }
                  },
                  total: 'Total'
                }
              }
            },
            button: {
              print: 'Imprimir'
            }
          }, 
          cancel: {
						title: 'Cancelamento de Pedido',
            notice: 'Você deseja realmente cancelar este pedido?',
            warning: 'Esteja ciente de que esta ação é irreversível, portanto, analise-a cuidadosamente antes de continuar.',
            option: {
              cancel: 'Cancelar',
              confirm: 'Confirmar'
            }
          },
          delete: {
						title: 'Exclusão de Pedido',
            notice: 'Você deseja realmente excluir este pedido?',
            warning: 'Esteja ciente de que esta ação é irreversível, portanto, analise-a cuidadosamente antes de continuar.',
            option: {
              cancel: 'Cancelar',
              confirm: 'Confirmar'
            }
          },
          others: {
            schemes:{
              title: "Esquemas",
            }
          }     
        }
      },
      notification: {
        register: 'O pedido foi registrado com sucesso.',
        update: 'O pedido foi atualizado com sucesso.',
        cancel: 'O pedido foi cancelado com sucesso.',
        delete: 'O pedido foi excluido com sucesso.',
        error: 'Houve um erro inesperado. Por favor, tente novamente.'
      },
      systemLog: {
        register: 'Registro de pedido.',
        update: 'Atualização de pedido.',
        cancel: 'Cancelamento de pedido.',
        delete: 'Exclusão de pedido.'
      },
      _common: {
        placeholder: {
          noData: {
            label: 'Nenhum pedido foi criado até o momento!'
          }
        }
      }
    },
    'en_US': {
      pageTitle: 'Requests',
      table: {
        label: {
          code: 'Code',
          date: 'Date',
          customer: 'Customer',         
          operator: 'Operator',          
          requestStatus: 'Order Status',
          saleStatus: 'Sale Status',
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
          cancel: { title: 'Cancel' },
          delete: { title: 'Delete' }
        }
      },     
      modal: {
        filters: {
          title: 'Filters',
          field: {
            requestCode: {
              label: 'Request Code'
            },
            saleCode: {
              label: 'Sale Code'
            },
            customer: {
              label: 'Customer',
              option: {
                code: {
                  label: 'Code',
                  path: 'Customer/Code'
                },
                name: {
                  label: 'Name',
                  path: 'Customer/Name'
                }
              }
            },
            member: {
              label: 'Member',
              option: {
                code: {
                  label: 'Code',
                  path: 'Member/Code'
                },
                name: {
                  label: 'Name',
                  path: 'Member/Name'
                }
              }
            },
            products: {
              label: 'Products',
              option: {
                code: {
                  label: 'Code',
                  path: 'Products/Code'
                },
                name: {
                  label: 'Name',
                  path: 'Products/Name'
                }
              }
            },
            operator: {
              label: 'Collaborator',
              option: {
                name: {
                  label: 'Name',
                  path: 'Collaborator/Name'
                }
              }
            },
            requestStatus: {
              label: 'Request Status',
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
            saleStatus: {
              label: 'Sale Status',
              list: {
                pendent: { label: 'PENDENT' },
                concluded: { label: 'CONCLUDED' },
                canceled: { label: 'CANCELED' }
              }
            },
            requestDate: {
              label: 'Request Date'
            }
          }
        },
        action: {
          register: {
            type: {
              create: { title: 'Register Order' },
              update: { title: 'Order Editing' }
            },
            panel: {
              customer: {
                title: 'Customer',
                label: {
                  name: 'Name',
                  address: 'Address',
                  personalDocument: 'SSN',
                  businessDocument: 'CNPJ',
                  phone: 'Phone'
                }
              },
              member: {
                title: 'Member',
                label: {
                  name: 'Name',
                  address: 'Address',
                  personalDocument: 'SSN',
                  businessDocument: 'CNPJ',
                  phone: 'Phone'
                }
              },
              scheme: {
                title: 'Scheme',
                quantity: "Quantity"
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
              settings: {
                title: 'Settings',
                option: {
                  conclusion: {
                    label: 'Complete the order',
                    description: 'This option will mark the order as completed and then a pending sale will be generated at the cashier for this record.'
                  }
                }
              },
              balance: {
                label: {
                  subtotal: {
                    title: 'Subtotal',
                    integrant: {
                      products: 'Products',
                      discount: 'Discount'
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
              customers: { title: 'Customers' },
              members: { title: 'Members' },
              products: { title: 'Products' }
            }
          },          
          read: {
            title: 'Order Details',
            section: {
              informations: {
                title: 'Informations',
                label: {
                  requestCode: 'Request Code',
                  saleCode: 'Sale Code',
                  operator: 'Operator',
                  date: 'Date',
                  requestStatus: {
                    title: 'Request Status',
                    enum: {
                      PENDENT: 'PENDENT',
                      CONCLUDED: 'CONCLUDED',
                      CANCELED: 'CANCELED'
                    }
                  },
                  saleStatus: {
                    title: 'Sale Status',
                    enum: {
                      PENDENT: 'PENDENT',
                      CONCLUDED: 'CONCLUDED',
                      CANCELED: 'CANCELED'
                    }
                  }
                }
              },
              customer: {
                title: 'Customer',
                label: {
                  name: 'Name',
                  address: 'Address',
                  phone: 'Phone'
                }
              },
              member: {
                title: 'Member',
                label: {
                  name: 'Name',
                  address: 'Address',
                  phone: 'Phone'
                }
              },
              products: {
                title: 'Products',
                label: {
                  code: 'Code',
                  name: 'Name',
                  quantity: 'Quantity',
                  price: `Price (${Utilities.currencySymbol})`,
                  total: `Total (${Utilities.currencySymbol})`
                }
              },
              balance: {
                title: 'Balance',
                label: {
                  subtotal: {
                    title: 'Subtotal',
                    integrant: {
                      products: 'Products',
                      discount: 'Discount'
                    }
                  },
                  total: 'Total'
                }
              }              
            },
            button: {
              print: 'Print'
            }
          },
          cancel: {
						title: 'Order Cancellation',
            notice: 'Do you really want to cancel this order?',
            warning: 'Be aware that this action is irreversible, so please review it carefully before proceeding.',
            option: {
              cancel: 'Cancel',
              confirm: 'Confirm'
            }
          },
          delete: {
						title: 'Order Exclusion',
            notice: 'Do you really want to delete this order?',
            warning: 'Be aware that this action is irreversible, so please review it carefully before proceeding.',
            option: {
              cancel: 'Cancel',
              confirm: 'Confirm'
            }
          },
          others: {
            schemes:{
              title: "Schemes"
            }
          }  
        }
      },
      notification: {
        register: 'The order has been successfully registered.',
        update: 'The order has been successfully updated.',
        cancel: 'The order was successfully canceled.',
        delete: 'The order was successfully deleted.',
        error: 'There was an unexpected error. Please try again.'
      },
      systemLog: {
        register: 'Order registration.',
        update: 'Order update.',
        cancel: 'Order cancellation.',
        delete: 'Order exclusion.'
      },
      _common: {
        placeholder: {
          noData: {
            label: 'No request have been created yet!'
          }
        }
      }
    }
  }

  public static get(language?: string) {
    return RequestsTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
