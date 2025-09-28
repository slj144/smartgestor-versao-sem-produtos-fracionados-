import { ProjectSettings } from "@assets/settings/company-settings";
import { Utilities } from "@shared/utilities/utilities";

export class CashierRecordsTranslate {

  private static obj = {
    'pt_BR': {
      pageTitle: 'Registros de Caixa',
      searchBar: {
        placeholder: 'Pesquisar..'
      },
      tabs: {
        option: {
          sales: 'Vendas',
          inflows: 'Entradas',
          outflows: 'Saídas'
        },
        segment: {
          sales: {
            statusSelector: {
              all: 'TODAS',
              concluded: 'CONCLUÍDA',
              pendent: 'PENDENTE',
              canceled: 'CANCELADA'
            },
            block: {
              label: {
                code: 'Código da Venda',
                date: 'Data da Venda',
                customer: 'Cliente',
                member: 'Membro',
                operator: 'Operador',
                value: 'Valor',
                status: 'Status'
              },
              enum: {
                status: {
                  PENDENT: 'PENDENTE',
                  CONCLUDED: 'CONCLUÍDA',
                  CANCELED: 'CANCELADA'
                }
              },
              action: {
                read: 'Visualizar',
                update: 'Editar',
                cancel: 'Cancelar',
                print: 'Imprimir Comprovante',
                fiscal: 'Emitir Nota Fiscal',
                changeOperator: 'Alterar Operador',
                duplicate: "Duplicar Venda"
              }
            }
          },
          inflows: {
            statusSelector: {
              all: 'TODAS',
              concluded: 'CONCLUÍDA',
              canceled: 'CANCELADA'
            },
            block: {
              label: {
                code: 'Código da Entrada',
                date: 'Data da Entrada',
                operator: 'Operador',                  
                category: 'Categoria',                  
                value: 'Valor',
                status: 'Status'                
              },
              enum: {
                status: {
                  PENDENT: 'PENDENTE',
                  CONCLUDED: 'CONCLUÍDA',
                  CANCELED: 'CANCELADA'
                }
              },
              action: {
                read: 'Visualizar',
                update: 'Editar',
                cancel: 'Cancelar',
                delete: 'Excluir',
                print: 'Imprimir Comprovante'
              }
            }
          },
          outflows: {
            statusSelector: {
              all: 'TODAS',
              concluded: 'CONCLUÍDA',
              canceled: 'CANCELADA'
            },
            block: {
              label: {
                code: 'Código de Saída',
                date: 'Data da Saída',              
                operator: 'Operador',
                category: 'Categoria',                 
                value: 'Valor',
                status: 'Status'                
              },
              enum: {
                status: {
                  PENDENT: 'PENDENTE',
                  CONCLUDED: 'CONCLUÍDA',
                  CANCELED: 'CANCELADA'
                }
              },
              action: {
                read: 'Visualizar',
                update: 'Editar',
                cancel: 'Cancelar',
                delete: 'Excluir',
                print: 'Imprimir Comprovante'
              }
            }
          }
        }
      },
      modal: {
        filters: {
          title: 'Filtros',
          segment: {
            sale: {
              field: {
                saleCode: {
                  label: 'Código da Venda'
                },
                serviceCode: {
                  label: 'Código de OS'
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
                    },
                    cpf: {
                      label: 'CPF',
                      path: 'Cliente/CPF'
                    },
                    cnpj: {
                      label: 'CNPJ',
                      path: 'Cliente/CNPJ'
                    },
                    phone: {
                      label: 'Telefone',
                      path: 'Cliente/Telefone'
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
                services: {
                  label: 'Serviços',
                  option: {
                    code: {
                      label: 'Código',
                      path: 'Serviços/Código'
                    },
                    name: {
                      label: 'Nome',
                      path: 'Serviços/Nome'
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
                paymentMethods: {
                  label: 'Meios de Pagamento',
                  option: {
                    code: {
                      label: 'Código',
                      path: 'Meios de Pagamento/Código'
                    },
                    name: {
                      label: 'Nome',
                      path: 'Meios de Pagamento/Nome'
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
                status: {
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
                saleDate: {
                  label: 'Data da Venda'
                }
              }
            },
            inflow: {
              field: {
                code: {
                  label: 'Código da Entrada'
                },
                date: {
                  label: 'Data da Entrada'
                },
                operator: {
                  label: 'Colaborador',
                  option: {
                    name: {
                      label: 'Nome',
                      path: 'Colaborador/Nome'
                    }
                  }
                }
              },
              outflow: {
                field: {
                  code: {
                    label: 'Código da Saída'
                  },
                  date: {
                    label: 'Data da Saída'
                  },
                  operator: {
                    label: 'Colaborador',
                    option: {
                      name: {
                        label: 'Nome',
                        path: 'Colaborador/Nome'
                      }
                    }
                  }
                }
              }
            }
          }          
        },
        action: {
          read: {
            sale: {
              title: 'Detalhes de Venda',
              section: {
                fiscal: {
                  title: "Fiscal",
                  label: {
                    id: "ID da Nota Fiscal",
                    idIntegracao: "ID Integração Fiscal",
                    statusNf: "Status da Nota Fiscal",
                  }
                },
                informations: {
                  title: 'Informações',
                  label: {
                    saleCode: 'Código da Venda',
                    requestCode: 'Código do Pedido',
                    serviceCode: 'Código do Serviço',
                    operator: 'Operador',
                    date: 'Data',
                    status: {
                      title: 'Situação',
                      enum: {
                        PENDENT: 'PENDENTE',
                        CONCLUDED: 'CONCLUÍDA',
                        CANCELED: 'CANCELADA'
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
                services: {
                  title: 'Serviços',
                  label: {
                    code: 'Código',
                    description: 'Descrição',
                    price: `Preço (${Utilities.currencySymbol})`,
                    total: `Total (${Utilities.currencySymbol})`
                  }
                },
                products: {
                  title: 'Produtos',
                  label: {
                    code: 'Código',
                    name: 'Nome',
                    serialNumber: 'Número de série',
                    quantity: 'Quantidade',
                    price: `Preço (${Utilities.currencySymbol})`,
                    total: `Total (${Utilities.currencySymbol})`
                  }
                },
                paymentMethods: {
                  title: 'Forma(s) de Pagamento',
                  label: {
                    note: 'Observação'
                  }
                },
                balance: {
                  title: 'Balanço',
                  label: {
                    subtotal: {
                      title: 'Subtotal',
                      integrant: {
                        products: 'Produtos',
                        services: 'Serviços',
                        discount: 'Desconto'
                      }
                    },
                    total: 'Total'
                  }
                },
                note: {
                  title: 'Observação'
                }
              },
              button: {
                print: 'Imprimir'
              }
            },
            inflow: {
              title: 'Detalhes de Entrada',
              section: {
                informations: {
                  title: 'Informações',
                  label: {
                    code: 'Código da Entrada',       
                    referenceCode: "Código de Referência",           
                    operator: 'Operador',
                    date: 'Data',
                    status: {
                      title: 'Situação',
                      enum: {
                        PENDENT: 'PENDENTE',
                        CONCLUDED: 'CONCLUÍDA',
                        CANCELED: 'CANCELADA'
                      }
                    }
                  }
                },
                note: {
                  title: 'Observação'
                },
                balance: {
                  title: 'Balanço',
                  label: {
                    value: 'Valor'
                  }
                }
              },
              button: {
                print: 'Imprimir'
              }
            },
            outflow: {
              title: 'Detalhes de Saída',
              section: {
                informations: {
                  title: 'Informações',
                  label: {
                    code: 'Código da Saída',   
                    referenceCode: "Código de Referência",
                    operator: 'Operador',
                    date: 'Data',
                    status: {
                      title: 'Situação',
                      enum: {
                        PENDENT: 'PENDENTE',
                        CONCLUDED: 'CONCLUÍDA',
                        CANCELED: 'CANCELADA'
                      }
                    }
                  }
                },
                note: {
                  title: 'Observação'
                },
                balance: {
                  title: 'Balanço',
                  label: {
                    value: 'Valor'
                  }
                }              
              },
              button: {
                print: 'Imprimir'
              }
            }
          },
          cancel: {
            sale: {
              title: 'Cancelamento de Venda',
              notice: 'Você deseja realmente cancelar esta venda?',
              warning: 'Esteja ciente de que esta ação é irreversível, portanto, analise-a cuidadosamente antes de continuar.',
              option: { cancel: 'Cancelar', confirm: 'Confirmar' }
            },
            inflow: {
              title: 'Cancelamento de Entrada',
              notice: 'Você deseja realmente cancelar esta entrada?',
              warning: 'Esteja ciente de que esta ação é irreversível, portanto, analise-a cuidadosamente antes de continuar.',
              option: { cancel: 'Cancelar', confirm: 'Confirmar' }
            },
            outflow: {
              title: 'Cancelamento de Saída',
              notice: 'Você deseja realmente cancelar este saída?',
              warning: 'Esteja ciente de que esta ação é irreversível, portanto, analise-a cuidadosamente antes de continuar.',
              option: { cancel: 'Cancelar', confirm: 'Confirmar' }
            }
          },
          delete: {
            sale: {
              title: 'Exclusão de Venda',
              notice: 'Você deseja realmente excluir este venda?',
              warning: 'Esteja ciente de que esta ação é irreversível, portanto, analise-a cuidadosamente antes de continuar.',
              option: { cancel: 'Cancelar', confirm: 'Confirmar' }
            },
            inflow: {
              title: 'Exclusão de Entrada',
              notice: 'Você deseja realmente excluir este entrada?',
              warning: 'Esteja ciente de que esta ação é irreversível, portanto, analise-a cuidadosamente antes de continuar.',
              option: { cancel: 'Cancelar', confirm: 'Confirmar' }
            },
            outflow: {
              title: 'Exclusão de Saída',
              notice: 'Você deseja realmente excluir este Saída?',
              warning: 'Esteja ciente de que esta ação é irreversível, portanto, analise-a cuidadosamente antes de continuar.',
              option: { cancel: 'Cancelar', confirm: 'Confirmar' }
            }           
          }
        }
      }
    },
    'en_US': {
      pageTitle: 'Cash Registers',
      searchBar: {
        placeholder: 'Search..'
      },
      tabs: {
        option: {
          sales: 'Sales',
          inflows: 'Inputs',
          outflows: 'Outputs'
        },
        segment: {
          sales: {
            statusSelector: {
              all: 'ALL',
              concluded: 'CONCLUDED',
              pendent: 'PENDENT',
              canceled: 'CANCELED'
            },
            block: {
              label: {
                code: 'Sale Code',
                date: 'Date of Sale',
                customer: 'Customer',
                member: 'Member',
                operator: 'Operator',
                value: 'Value',
                status: 'Status'                
              },
              enum: {
                status: {
                  PENDENT: 'PENDENT',
                  CONCLUDED: 'CONCLUDED',
                  CANCELED: 'CANCELED'
                }
              },
              action: {
                read: 'View',
                update: 'Edit',
                cancel: 'Cancel',
                print: 'Print Receipt',
                fiscal: 'Issue Invoice',
                changeOperator: 'Change Operator',
                duplicate: "Duplicate Sale"
              }
            }
          },
          inflows: {
            statusSelector: {
              all: 'ALL',
              concluded: 'CONCLUDED',
              canceled: 'CANCELED'
            },
            block: {
              label: {
                code: 'Input Code',
                date: 'Date of Input',             
                operator: 'Operator',
                category: 'Category',                 
                value: 'Value',
                status: 'Status'
              },
              enum: {
                status: {
                  PENDENT: 'PENDENT',
                  CONCLUDED: 'CONCLUDED',
                  CANCELED: 'CANCELED'
                }
              },
              action: {
                read: 'View',
                update: 'Edit',
                cancel: 'Cancel',
                delete: 'Delete',
                print: 'Print Receipt'
              }
            }
          },
          outflows: {
            statusSelector: {
              all: 'ALL',
              concluded: 'CONCLUDED',
              canceled: 'CANCELED'
            },
            block: {
              label: {
                code: 'Output Code',
                date: 'Date of Output',
                operator: 'Operator',
                category: 'Category',
                value: 'Value',
                status: 'Status'
              },
              enum: {
                status: {
                  PENDENT: 'PENDENT',
                  CONCLUDED: 'CONCLUDED',
                  CANCELED: 'CANCELED'
                }
              },
              action: {
                read: 'View',
                update: 'Edit',
                cancel: 'Cancel',
                delete: 'Delete',
                print: 'Print Receipt'
              }
            }
          }
        }
      },
      modal: {
        filters: {
          title: 'Filters',
          segment: {
            sale: {
              field: {
                saleCode: {
                  label: 'Sale Code'
                },
                serviceCode: {
                  label: 'Service Order Code'
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
                    },
                    cpf: {
                      label: 'CPF',
                      path: 'Customer/CPF'
                    },
                    cnpj: {
                      label: 'CNPJ',
                      path: 'Customer/CNPJ'
                    },
                    phone: {
                      label: 'Phone',
                      path: 'Customer/Phone'
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
                services: {
                  label: 'Services',
                  option: {
                    code: {
                      label: 'Code',
                      path: 'Services/Code'
                    },
                    name: {
                      label: 'Name',
                      path: 'Services/Name'
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
                paymentMethods: {
                  label: 'Payment Methods',
                  option: {
                    code: {
                      label: 'Code',
                      path: 'Payment Methods/Code'
                    },
                    name: {
                      label: 'Name',
                      path: 'Payment Methods/Name'
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
                status: {
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
                saleDate: {
                  label: 'Sale Date'
                }
              }
            },
            inflow: {
              field: {
                code: {
                  label: 'Input Code'
                },
                date: {
                  label: 'Input Date'
                },
                operator: {
                  label: 'Collaborator',
                  option: {
                    name: {
                      label: 'Name',
                      path: 'Collaborator/Name'
                    }
                  }
                }
              }
            },
            outflow: {
              field: {
                code: {
                  label: 'Output Code'
                },
                date: {
                  label: 'Output Date'
                },
                operator: {
                  label: 'Collaborator',
                  option: {
                    name: {
                      label: 'Name',
                      path: 'Collaborator/Name'
                    }
                  }
                }
              }              
            }
          }
        },
        action: {
          read: {
            sale: {
              title: 'Sale Details',
              section: {
                fiscal: {
                  title: "Fiscal",
                  label: {
                    id: "ID Fiscal Note",
                    idIntegração: "ID Fiscal Integration",
                    statusNf: "Status Fiscal Note",
                  }
                },
                informations: {
                  title: 'Informations',
                  label: {
                    saleCode: 'Sale Code',
                    requestCode: 'Order Code',
                    serviceCode: 'Service Code',
                    operator: 'Operator',
                    date: 'Date',
                    status: {
                      title: 'Status',
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
                services: {
                  title: 'Services',
                  label: {
                    code: 'Code',
                    description: 'Description',
                    price: `Price (${Utilities.currencySymbol})`,
                    total: `Total (${Utilities.currencySymbol})`
                  }
                },
                products: {
                  title: 'Products',
                  label: {
                    code: 'Code',
                    name: 'Name',
                    serialNumber: 'Serial number',
                    quantity: 'Quantity',
                    price: `Price (${Utilities.currencySymbol})`,
                    total: `Total (${Utilities.currencySymbol})`
                  }
                },
                paymentMethods: {
                  title: 'Payment Methods',
                  label: {
                    note: 'Note'
                  }
                },
                balance: {
                  title: 'Balance',
                  label: {
                    subtotal: {
                      title: 'Subtotal',
                      integrant: {
                        products: 'Products',
                        services: 'Services',
                        discount: 'Discount'
                      }
                    },
                    total: 'Total'
                  }
                },
                note: {
                  title: 'Note'
                }
              },
              button: {
                print: 'Print'
              }
            },
            inflow: {
              title: 'Input Details',
              section: {
                informations: {
                  title: 'Informations',
                  label: {
                    code: 'Input Code',    
                    referenceCode: "Reference Code",
                    operator: 'Operator',
                    date: 'Date',
                    status: {
                      title: 'Status',
                      enum: {
                        PENDENT: 'PENDENT',
                        CONCLUDED: 'CONCLUDED',
                        CANCELED: 'CANCELED'
                      }
                    }
                  }
                },
                note: {
                  title: 'Note'
                },
                balance: {
                  title: 'Balance',
                  label: {
                    value: 'Value'
                  }
                }
              },
              button: {
                print: 'Print'
              }
            },
            outflow: {
              title: 'Output Details',
              section: {
                informations: {
                  title: 'Informations',
                  label: {
                    code: 'Output Code',    
                    referenceCode: "Reference Code",
                    operator: 'Operator',
                    date: 'Date',
                    status: {
                      title: 'Status',
                      enum: {
                        PENDENT: 'PENDENT',
                        CONCLUDED: 'CONCLUDED',
                        CANCELED: 'CANCELED'
                      }
                    }
                  }
                },
                note: {
                  title: 'Note'
                },
                balance: {
                  title: 'Balance',
                  label: {
                    value: 'Value'
                  }
                }
              },
              button: {
                print: 'Print'
              }
            }
          },
          cancel: {
            sale: {
              title: 'Sale Cancellation',
              notice: 'Do you really want to cancel this sale?',
              warning: 'Be aware that this action is irreversible, so please review it carefully before proceeding.',
              option: { cancel: 'Cancel', confirm: 'Confirm' }
            },
            inflow: {
              title: 'Input Cancellation',
              notice: 'Do you really want to cancel this input?',
              warning: 'Be aware that this action is irreversible, so please review it carefully before proceeding.',
              option: { cancel: 'Cancel', confirm: 'Confirm' }
            },
            outflow: {
              title: 'Output Cancellation',
              notice: 'Do you really want to cancel this output?',
              warning: 'Be aware that this action is irreversible, so please review it carefully before proceeding.',
              option: { cancel: 'Cancel', confirm: 'Confirm' }
            }
          },
          delete: {
            sale: {
              title: 'Sale Exclusion',
              notice: 'Do you really want to delete this sale?',
              warning: 'Be aware that this action is irreversible, so please review it carefully before proceeding.',
              option: { cancel: 'Cancel', confirm: 'Confirm' }
            },
            inflow: {
              title: 'Input Exclusion',
              notice: 'Do you really want to delete this input?',
              warning: 'Be aware that this action is irreversible, so please review it carefully before proceeding.',
              option: { cancel: 'Cancel', confirm: 'Confirm' }
            },
            outflow: {
              title: 'Output Exclusion',
              notice: 'Do you really want to delete this output?',
              warning: 'Be aware that this action is irreversible, so please review it carefully before proceeding.',
              option: { cancel: 'Cancel', confirm: 'Confirm' }
            }           
          }
        }
      }
    }
  };

  public static get(language?: string) {
    return CashierRecordsTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
