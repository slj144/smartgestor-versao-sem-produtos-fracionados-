import { ProjectSettings } from "@assets/settings/company-settings";
import { Utilities } from "@shared/utilities/utilities";

export class ServiceOrdersTranslate {

  private static obj = {
    'pt_BR': {
      pageTitle: 'Ordens de Serviço',
      table: {
        label: {
          code: 'Código',
          customer: 'Cliente',
          date: "Data",
          phone: 'Telefone',
          responsible: () => { return ProjectSettings.companySettings().profile?.registers.components.vehicles?.active ? "Mecânico" : 'Responsável' },
          status: 'Status',
          steps: 'Etapas',
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
          edit: { title: 'Editar' },
          cancel: { title: 'Cancelar' }
        }
      },
      modal: {
        filters: {
          title: 'Filtros',
          field: {
            code: {
              label: 'Código'
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
            operator: {
              label: 'Colaborador',
              option: {
                name: {
                  label: 'Nome',
                  path: 'Colaborador/Nome'
                }
              }
            },
            equipment: {
              label: 'Equipamento',
              option: {
                name: {
                  label: 'Nome',
                  path: 'Equipamento/Nome'
                },
                model: {
                  label: 'Modelo',
                  path: 'Equipamento/Modelo'
                },
                serialNumber: {
                  label: 'Número de Série',
                  path: 'Equipamento/Número de Série'
                }
              }
            },
            product: {
              label: 'Produto',
              option: {
                code: {
                  label: 'Código',
                  path: 'Produto/Código'
                },
                name: {
                  label: 'Nome',
                  path: 'Produto/Nome'
                }
              }
            },
            service: {
              label: 'Serviço',
              option: {
                code: {
                  label: 'Código',
                  path: 'Serviço/Código'
                },
                name: {
                  label: 'Nome',
                  path: 'Serviço/Nome'
                }
              }
            },
            serviceOrderStatus: {
              label: 'Status da Ordem de Serviço',
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
              label: 'Status de Pagamento',
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
            entryDate: {
              label: 'Data de Entrada'
            },
            deliveryDate: {
              label: 'Data de Entrega'
            },
            value: {
              label: 'Valor'
            }
          }
        },
        action: {
          register: {
            type: {
              create: { title: 'Registro de Ordem de Serviço' },
              update: { title: 'Edição da Ordem de Serviço' }
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
              vehicle: {
                title: 'Veículo',
                label: {
                  plate: 'Placa',
                  model: 'Modelo',
                  mileage: 'KM',
                  proprietary: {
                    name: 'Proprietário',
                    phone: 'Telefone'
                  }
                }
              },
              photos: {
                before: 'Fotos Antes',
                after: 'Fotos Depois',
                capture: 'Capturar Foto',
                switchCamera: 'Trocar câmera',
                // === ADICIONE ESTAS NOVAS TRADUÇÕES ===
                gallery: 'Escolher da galeria',
                camera: 'Tirar foto',
                dropZone: 'Clique nos botões acima para adicionar fotos',
                photoCount: '{{current}}/{{max}}',
                removePhoto: 'Remover foto',
                photoAdded: 'Foto adicionada com sucesso!',
                maxPhotosReached: 'Limite máximo de 4 fotos atingido',
                fileTooLarge: 'Arquivo muito grande. Máximo: 5MB',
                invalidFileType: 'Arquivo inválido. Apenas imagens são permitidas',
                remainingPhotos: 'Você pode adicionar mais {{count}} foto(s)'
              },
              services: {
                title: 'Serviços',
                label: {
                  code: 'Código',
                  name: 'Nome',
                  price: `Preço (${Utilities.currencySymbol})`,
                  costPrice: `Custo (${Utilities.currencySymbol})`
                }
              },
              products: {
                title: 'Peças',
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
              equipment: {
                title: 'Equipamento',
                label: {
                  model: 'Modelo',
                  brand: 'Marca',
                  password: 'Senha',
                  serialNumber: 'IMEI / Número de Série'
                }
              },
              checklist: {
                title: 'Checklist'
              },
              settings: {
                title: 'Configurações',
                label: {
                  responsible: () => { return ProjectSettings.companySettings().profile?.registers.components.vehicles?.active ? "Mecânico" : 'Responsável' },
                  serviceExecution: {
                    title: 'Execução do Serviço',
                    options: {
                      internal: 'INTERNA',
                      external: 'EXTERNA'
                    }
                  },
                  technicalAssistance: 'Assistência Técnica',
                  entryDate: 'Data de Entrada',
                  deliveryDate: 'Previsão de Entrega',
                  description: 'Descrição'
                }
              },
              balance: {
                label: {
                  subtotal: {
                    title: 'Subtotal',
                    integrant: {
                      products: 'Peças',
                      services: 'Serviços',
                      discount: 'Desconto'
                    }
                  },
                  total: 'Total'
                }
              },
              button: {
                register: 'Registrar'
              },
            },
            layer: {
              customers: { title: 'Clientes' },
              vehicles: { title: 'Veículos' },
              services: { title: 'Serviços' },
              products: { title: 'Peças' }
            }
          },
          read: {
            title: 'Detalhes da Ordem de Serviço',
            section: {
              informations: {
                title: 'Informações',
                label: {
                  serviceCode: 'Código do Serviço',
                  saleCode: 'Código da Venda',
                  execution: {
                    title: 'Execução',
                    type: {
                      INTERNAL: 'INTERNA',
                      EXTERNAL: 'EXTERNA'
                    }
                  },
                  operator: 'Operador',
                  date: 'Data',
                  serviceOrderStatus: {
                    title: 'Status de Ordem de Serviço',
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
              executor: {
                title: "Responsável",
              },
              customer: {
                title: 'Cliente',
                label: {
                  name: 'Nome',
                  address: 'Endereço',
                  phone: 'Telefone',
                  personalDocument: 'CPF',
                  businessDocument: 'CNPJ',
                }
              },
              vehicle: {
                title: 'Veículo',
                label: {
                  plate: 'Placa',
                  model: 'Modelo',
                  mileage: 'KM'
                }
              },
              equipment: {
                title: 'Equipamento',
                label: {
                  model: 'Modelo',
                  brand: 'Marca',
                  name: 'Nome',
                  password: 'Senha',
                  serialNumber: 'IMEI / Número de Série'
                }
              },
              photos: {
                title: 'Fotos',
                before: 'Antes',
                after: 'Depois'
              },
              checklist: {
                title: 'Checklist',
              },
              description: {
                title: 'Descrição'
              },
              services: {
                title: 'Serviços',
                label: {
                  code: 'Código',
                  performed: "Serviços Realizados",
                  description: 'Descrição',
                  price: `Preço (${Utilities.currencySymbol})`,
                  costPrice: `Custo (${Utilities.currencySymbol})`,
                  total: `Total (${Utilities.currencySymbol})`
                }
              },
              products: {
                title: 'Peças',
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
                      products: 'Peças',
                      services: 'Serviços',
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
            title: 'Cancelamento de Ordem de Serviço',
            notice: 'Você deseja realmente cancelar esta ordem de serviço?',
            warning: 'Esteja ciente de que esta ação é irreversível, portanto, analise-a cuidadosamente antes de continuar.',
            deleteAfterCancel: "Apagar Ordem de serviço após o cancelamento.",
            option: {
              cancel: 'Cancelar',
              confirm: 'Confirmar'
            }
          },
          delete: {
            title: 'Exclusão de Ordem de Serviço',
            notice: 'Você deseja realmente excluir esta ordem de serviço?',
            warning: 'Esteja ciente de que esta ação é irreversível, portanto, analise-a cuidadosamente antes de continuar.',
            option: {
              cancel: 'Cancelar',
              confirm: 'Confirmar'
            }
          },
          updateStatus: {
            title: 'Atualização de Status',
            status: [
              "Concluir etapa de",
              "deste serviço",
              "e reservar produtos"
            ],
            option: {
              cancel: 'Cancelar',
              confirm: 'Confirmar'
            },
            scheme: {
              mechanic: {
                BUDGET: "ORÇAMENTO",
                AUTORIZATION: "AUTORIZAÇÃO",
                PARTS: "PEÇAS",
                CONCLUDED: "CONCLUÍDO",
                PAYMENT: "PAGAMENTO"
              },
              technicalAssistance: {
                BUDGET: "ORÇAMENTO",
                AUTORIZATION: "AUTORIZAÇÃO",
                PARTS: "PEÇAS",
                REPAIR: "REPARO",
                CONCLUDED: "CONCLUÍDO",
                WITHDRAWAL: "RETIRADA",
                PAYMENT: "PAGAMENTO"
              }
            },
          }
        }
      },
      scheme: {
        mechanic: {
          BUDGET: "ORÇAMENTO",
          AUTORIZATION: "AUTORIZAÇÃO",
          PARTS: "PEÇAS",
          CONCLUDED: "CONCLUÍDO",
          PAYMENT: "PAGAMENTO"
        },
        technicalAssistance: {
          BUDGET: "ORÇAMENTO",
          AUTORIZATION: "AUTORIZAÇÃO",
          PARTS: "PEÇAS",
          REPAIR: "REPARO",
          CONCLUDED: "CONCLUÍDO",
          WITHDRAWAL: "RETIRADA",
          PAYMENT: "PAGAMENTO"
        }
      },
      notification: {
        register: 'A ordem de serviço foi registrada com sucesso.',
        update: 'A ordem de serviço foi atualizada com sucesso.',
        cancel: 'A ordem de serviço foi cancelada com sucesso.',
        delete: 'A ordem de serviço foi excluída com sucesso.',
        error: 'Houve um erro inesperado. Por favor, tente novamente.',
        noStock: "Um ou mais produtos estão fora de estoque."
      },
      systemLog: {
        register: 'Registro de ordem de serviço.',
        update: 'Atualização de ordem de serviço.',
        cancel: 'Cancelamento de ordem de serviço.',
        delete: 'Exclusão de ordem de serviço.',
      }
    },
    'en_US': {
      pageTitle: 'Service Orders',
      table: {
        label: {
          code: 'Code',
          date: "Date",
          customer: 'Customer',
          phone: 'Phone',
          responsible: () => { return ProjectSettings.companySettings().profile?.registers.components.vehicles?.active ? "Mechanic" : 'Responsible' },
          status: 'Status',
          steps: 'Etapas',
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
          edit: { title: 'Edit' },
          cancel: { title: 'Cancel' }
        }
      },
      modal: {
        filters: {
          title: 'Filters',
          field: {
            code: {
              label: 'Code'
            },
            customer: {
              label: 'Customer',
              option: {
                code: {
                  label: 'Código',
                  path: 'Customer/Código'
                },
                name: {
                  label: 'Nome',
                  path: 'Customer/Nome'
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
            equipment: {
              label: 'Equipment',
              option: {
                name: {
                  label: 'Name',
                  path: 'Equipment/Name'
                },
                model: {
                  label: 'Model',
                  path: 'Equipment/Model'
                },
                serialNumber: {
                  label: 'Serial Number',
                  path: 'Equipment/Serial Number'
                }
              }
            },
            product: {
              label: 'Producto',
              option: {
                code: {
                  label: 'Code',
                  path: 'Producto/Code'
                },
                name: {
                  label: 'Name',
                  path: 'Producto/Name'
                }
              }
            },
            service: {
              label: 'Service',
              option: {
                code: {
                  label: 'Code',
                  path: 'Service/Code'
                },
                name: {
                  label: 'Name',
                  path: 'Service/Name'
                }
              }
            },
            serviceOrderStatus: {
              label: 'Service Order Status',
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
            entryDate: {
              label: 'Entry Date'
            },
            deliveryDate: {
              label: 'Delivery Date'
            },
            value: {
              label: 'Value'
            }
          }
        },
        action: {
          register: {
            type: {
              create: { title: 'Register Service Order' },
              update: { title: 'Service Order Editing' }
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
              vehicle: {
                title: 'Vehicle',
                label: {
                  plate: 'Plate',
                  model: 'Model',
                  mileage: 'KM',
                  proprietary: {
                    name: 'Proprietary',
                    phone: 'Phone'
                  }
                }
              },
              photos: {
                before: 'Before Photos',
                after: 'After Photos'
              },
              services: {
                title: 'Services',
                label: {
                  code: 'Code',
                  name: 'Name',
                  price: `Price (${Utilities.currencySymbol})`,
                  costPrice: `Custo (${Utilities.currencySymbol})`
                }
              },
              products: {
                title: 'Parts',
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
              equipment: {
                title: 'Equipment',
                label: {
                  model: 'Model',
                  brand: 'Brand',
                  password: 'Password',
                  serialNumber: 'IMEI / Serial Number'
                }
              },
              checklist: {
                title: 'Checklist'
              },
              settings: {
                title: 'Settings',
                label: {
                  responsible: () => { return ProjectSettings.companySettings().profile?.registers.components.vehicles?.active ? "Mechanic" : 'Responsible' },
                  serviceExecution: {
                    title: 'Service Execution',
                    options: {
                      internal: 'INTERNAL',
                      external: 'EXTERNAL'
                    }
                  },
                  technicalAssistance: 'Technical Assistance',
                  entryDate: 'Entry Date',
                  deliveryDate: 'Delivery Forecast',
                  description: 'Description'
                }
              },
              balance: {
                label: {
                  subtotal: {
                    title: 'Subtotal',
                    integrant: {
                      products: 'Parts',
                      services: 'Services',
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
              vehicles: { title: 'Vehicles' },
              services: { title: 'Services' },
              products: { title: 'Parts' }
            }
          },
          read: {
            title: 'Service Order Details',
            section: {
              informations: {
                title: 'Informations',
                label: {
                  serviceCode: 'Service Code',
                  saleCode: 'Sale Code',
                  execution: {
                    title: 'Execution',
                    type: {
                      INTERNAL: 'INTERNAL',
                      EXTERNAL: 'EXTERNAL'
                    }
                  },
                  operator: 'Operator',
                  date: 'Date',
                  serviceOrderStatus: {
                    title: 'Service Order Status',
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
              executor: {
                title: "Executor",
              },
              customer: {
                title: 'Customer',
                label: {
                  name: 'Name',
                  address: 'Address',
                  phone: 'Phone'
                }
              },
              vehicle: {
                title: 'Vehicle',
                label: {
                  plate: 'Plate',
                  model: 'Model',
                  mileage: 'Mileage'
                }
              },
              equipment: {
                title: 'Equipment',
                label: {
                  model: 'Model',
                  brand: 'Brand',
                  name: 'Name',
                  password: 'Password',
                  serialNumber: 'IMEI / Serial Number'
                }
              },
              photos: {
                title: 'Photos',
                before: 'Before',
                after: 'After'
              },
              checklist: {
                title: 'Checklist',
              },
              description: {
                title: 'Descrição'
              },
              services: {
                title: 'Services',
                label: {
                  code: 'Code',
                  performed: "Serviços Realizados",
                  price: `Price (${Utilities.currencySymbol})`,
                  total: `Total (${Utilities.currencySymbol})`
                }
              },
              products: {
                title: 'Parts',
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
                      products: 'Parts',
                      services: 'Services',
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
            title: 'Service Order Cancellation',
            notice: 'Do you really want to cancel this service order?',
            warning: 'Be aware that this action is irreversible, so please review it carefully before proceeding.',
            option: {
              cancel: 'Cancel',
              confirm: 'Confirm'
            }
          },
          delete: {
            title: 'Service Order Exclusion',
            notice: 'Do you really want to delete this service order?',
            warning: 'Be aware that this action is irreversible, so please review it carefully before proceeding.',
            option: {
              cancel: 'Cancel',
              confirm: 'Confirm'
            }
          },
          updateStatus: {
            title: 'Status Update',
            option: {
              cancel: 'Cancel',
              confirm: 'Confirm'
            },
            status: [
              "Complete step",
              "of this service",
              "and reserve products"
            ],
            scheme: {
              mechanic: {
                BUDGET: "BUDGET",
                AUTORIZATION: "AUTORIZATION",
                PARTS: "PARTS",
                CONCLUDED: "CONCLUDED",
                PAYMENT: "PAYMENT"
              },
              technicalAssistance: {
                BUDGET: "BUDGET",
                AUTORIZATION: "AUTORIZATION",
                PARTS: "PARTS",
                REPAIR: "REPAIR",
                CONCLUDED: "CONCLUDED",
                WITHDRAWAL: "WITHDRAWAL",
                PAYMENT: "PAYMENT"
              }
            },
          }
        }
      },
      scheme: {
        mechanic: {
          BUDGET: "BUDGET",
          AUTORIZATION: "AUTORIZATION",
          PARTS: "PARTS",
          CONCLUDED: "CONCLUDED",
          PAYMENT: "PAYMENT"
        },
        technicalAssistance: {
          BUDGET: "BUDGET",
          AUTORIZATION: "AUTORIZATION",
          PARTS: "PARTS",
          REPAIR: "REPAIR",
          CONCLUDED: "CONCLUDED",
          WITHDRAWAL: "WITHDRAWAL",
          PAYMENT: "PAYMENT"
        }
      },
      notification: {
        register: 'The service order was successfully registered.',
        update: 'The service order was successfully updated.',
        cancel: 'The service order was successfully canceled.',
        delete: 'The service order was successfully deleted.',
        error: 'There was an unexpected error. Please try again.',
        noStock: "One or more products are out of stock."
      },
      systemLog: {
        register: 'Service order registration.',
        update: 'Service order update.',
        cancel: 'Service order cancellation.',
        delete: 'Service order exclusion.'
      }
    }
  }

  public static get(language?: string) {
    return ServiceOrdersTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}