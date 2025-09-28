import { ProjectSettings } from "../../../assets/settings/company-settings";

export class SettingsTranslate {
  private static obj = {
    'pt_BR': {
      pageTitle: 'Configurações',
      section: {
        general: {
          title: 'Geral',
          option: {
            language: {
              label: 'Idioma',
              description: 'Configure o idioma que deseja utilizar no sistema.',
            },
            currency: {
              label: 'Moeda',
              description: 'Configure a moeda que deseja utilizar no sistema.',
            }
          }
        },
        cashier: {
          title: 'Caixa',
          option: {
            operationalMode: {
              label: 'Modo Operacional',
              description: 'Configure o modo de operação do caixa.',
            },
            warrantyTerm: {
              label: 'Termo de Garantia',
              description: 'Configure o termo de garantia a ser exibido nos comprovantes a serem emitidos no caixa.',
            }
          }
        },
        serviceOrders: {
          title: 'Ordens de Serviço',
          option: {
            checklist: {
              label: 'Checklist',
              description: 'Configure a lista de checagem que irá auxiliar a criação de ordens de serviço.',
              list: {
                name: "Nome",
                actions: "Ações"
              },
            },
            warrantyTerm: {
              label: 'Termo de Garantia',
              description: 'Configure o termo de garantia a ser exibido nos comprovantes a serem emitidos nas ordens de serviço.',
            },
            deliveryTerm: {
              label: 'Termo de Entrega',
              description: 'Configure o termo de entrega a ser exibido nos comprovantes a serem emitidos nas ordens de serviço.',
            }
          }
        },
        stock: {
          title: 'Estoque',
          option: {
            averagePurchaseCost: {
              label: 'Custo médio em compras',
              description: 'Ao desativar o custo médio o valor calculado não será inserido nas informações finais dos produtos no estoque.',
            },
            averageTransfersCost: {
              label: 'Custo médio em transferências',
              description: 'Ao desativar o custo médio o valor calculado não será inserido nas informações finais dos produtos no estoque.',
            },
            allowNegativeSale: {
              label: 'Permitir venda com estoque negativo',
              description: 'Ao ativar, o PDV permitirá vender itens mesmo sem saldo disponível (estoque pode ficar negativo).'
            }
          }
        },
        registers: {
          title: 'Registros',
          option: {
            restrictCustomerRegistration: {
              label: 'Restringir cadastro de clientes',
              description: 'A restrição de cadastro define a obrigatóriedade de preencimento de alguns campos.'
            }
          }
        }
      },
      modal: {
        help: {
          title: 'Ajuda'
        },
        section: {
          general: {
            title: 'Configurações Gerais',
            language: {
              options: {
                'pt_BR': 'Português',
                'en_US': 'Inglês'
              },
              save: {
                description: 'Deseja atribuir essa configuração como uma definição geral do sistema?',
                subDescription: 'Caso essa opção não seja marcada a definição de idioma será exclusiva para este dispositivo.'
              }
            },
            currency: {
              options: {
                'USD': 'USD - Dólar ($)',
                'GBP': 'GBP - Libra (£)',
                'EUR': 'EUR - Euro (€)',
                'BRL': 'BRL - Real (R$)'
              },
              save: {
                description: 'Deseja atribuir essa configuração como uma definição geral do sistema?',
                subDescription: 'Caso essa opção não seja marcada a definição de idioma será exclusiva para este dispositivo.'
              }
            },
            button: {
              submit: 'Confirmar'
            }
          },
          cashier: {
            title: 'Configurações do Caixa',
            operationalMode: {
              options: {
                shared: 'Compartilhado',
                individual: 'Indivídual'
              }
            },
            button: {
              submit: 'Confirmar'
            }
          },
          serviceOrders: {
            title: 'Configurações das Ordens de Serviço',
            button: {
              submit: 'Confirmar'
            },
            titles: {
              addTitle: "Adicionar Checklist",
              viewTitle: "Detalhes do Checklist",
              editTitle: "Editar Checklist",
              deleteTitle: "Deletar Checklist"
            },
            form: {
              checklistLabel: "Nome do Checklist",
              subchecklistLabel: "Nome do Subchecklist"
            }
          },
          stock: {
            title: 'Configurações de Estoque',
            averagePurchaseCost: {
              description: 'Você deseja ativar a substituição do preço de custo pelo custo médio de determinado produto?',
              subDescription: 'Ao ativar essa opção as operações de compra irão utilizar o custo médio do produto para definir o preço de custo do mesmo no estoque.'
            },
            averageTransfersCost: {
              description: 'Você deseja ativar a substituição do preço de custo pelo custo médio de determinado produto?',
              subDescription: 'Ao ativar essa opção as operações de transferência irão utilizar o custo médio do produto para definir o preço de custo do mesmo no estoque do destinatário.'
            },
            allowNegativeSale: {
              description: 'Deseja permitir venda de produtos com estoque insuficiente?',
              subDescription: 'Ao ativar esta opção, o PDV não bloqueará a seleção de quantidades acima do saldo disponível e não exibirá alerta de “Fora de Estoque”.'
            },
            button: {
              submit: 'Confirmar'
            }
          },
          registers: {
            title: 'Configurações de Registros',
            restrictCustomerRegistration: {
              description: 'Você deseja restringir o cadastro de clientes?',
              subDescription: 'Ao desativar a restrição isso resultará na não obrigatoriedade do preenchimento de alguns campos no registro.',
              fields: {
                document: "CPF / CNPJ",
                birthDate: "Data de Nacimento",
                email: "Email",
                phone: "Telefone"
              }
            },
            button: {
              submit: 'Confirmar'
            }
          }
        }
      },
      notification: {
        'General/Language': {
          title: 'Configurações Gerais',
          description: 'O idioma foi atualizado com sucesso.'
        },
        'General/Currency': {
          title: 'Configurações do Caixa',
          description: 'A moeda foi atualizada com sucesso.'
        },
        'Stock/AveragePurchaseCost': {
          title: 'Configurações de Estoque',
          description: 'A aplicação de custo médio foi atualizada com sucesso.'
        },
        'Stock/AverageTransfersCost': {
          title: 'Configurações de Estoque',
          description: 'A aplicação de custo médio foi atualizada com sucesso.'
        },
        'Stock/AllowNegativeSale': {
          title: 'Configurações de Estoque',
          description: 'A permissão de venda com estoque negativo foi atualizada com sucesso.'
        },
        'Cashier/OperationalMode': {
          title: 'Configurações do Caixa',
          description: 'O modo operacional foi atualizado com sucesso.'
        },
        'Cashier/WarrantyTerm': {
          title: 'Configurações do Caixa',
          description: 'O termo de garantia foi atualizado com sucesso.'
        },
        'ServiceOrder/Checklist': {
          title: 'Configurações das Ordens de Serviço',
          description: 'A checklist foi atualizados com sucesso.'
        },
        'ServiceOrder/WarrantyTerm': {
          title: 'Configurações das Ordens de Serviço',
          description: 'O termo de garantia foi atualizado com sucesso.'
        },
        'ServiceOrder/DeliveryTerm': {
          title: 'Configurações das Ordens de Serviço',
          description: 'O termo de entrega foi atualizado com sucesso.'
        },
        'Registers/RestrictCustomerRegistration': {
          title: 'Configurações de Registros',
          description: 'A restrição de registro foi atualizado com sucesso.'
        },
        error: 'Houve um erro inesperado. Por favor, tente novamente.'
      }
    },
    'en_US': {
      pageTitle: 'Settings',
      section: {
        general: {
          title: 'General',
          option: {
            language: {
              label: 'Language',
              description: 'Configure the language you want to use on the system.',
            },
            currency: {
              label: 'Currency',
              description: 'Configure the currency you want to use in the system.',
            }
          }
        },
        cashier: {
          title: 'Cashier',
          option: {
            operationalMode: {
              label: 'Operational Mode',
              description: 'Configure the cashier operating mode.',
            },
            warrantyTerm: {
              label: 'Warranty Term',
              description: 'Configure the warranty term to be displayed on the receipts to be issued in the cashier.',
            }
          }
        },
        serviceOrders: {
          title: 'Service Ordens',
          option: {
            checklist: {
              label: 'Checklist',
              description: 'Configure the checklist that will assist in creating work orders.',
              list: {
                name: "Name",
                actions: "Actions"
              }
            },
            warrantyTerm: {
              label: 'Warranty Term',
              description: 'Configure the warranty term to be displayed on the receipts to be issued in the service orders.',
            },
            deliveryTerm: {
              label: 'Delivery Term',
              description: 'Configure the delivery term to be displayed on the receipts to be issued in the service orders.',
            }
          }
        },
        stock: {
          title: 'Stock',
          option: {
            averagePurchaseCost: {
              label: 'Average cost in purchases',
              description: 'When deactivating the average cost, the calculated value will not be inserted in the final information of the products in stock.',
            },
            averageTransfersCost: {
              label: 'Average cost in transfers',
              description: 'When deactivating the average cost, the calculated value will not be inserted in the final information of the products in stock.',
            },
            allowNegativeSale: {
              label: 'Allow selling with negative stock',
              description: 'When enabled, POS allows selling items even without available balance (stock may go negative).'
            }
          }
        },
        registers: {
          title: 'Registers',
          option: {
            restrictCustomerRegistration: {
              label: 'Restrict customer registration',
              description: 'The registration restriction defines the obligation to fill in some fields.',
            }
          }
        },
      },
      modal: {
        help: {
          title: 'Help'
        },
        section: {
          general: {
            title: 'General Settings',
            language: {
              options: {
                'pt_BR': 'Portuguese',
                'en_US': 'English'
              },
              save: {
                description: 'Do you want to assign this setting as a general system definition?',
                subDescription: 'If this option is not checked, the language setting will be unique for this device.'
              }
            },
            currency: {
              options: {
                'USD': 'USD - Dollar ($)',
                'GBP': 'GBP - Pound (£)',
                'BRL': 'BRL - Real (R$)'
              },
              save: {
                description: 'Do you want to assign this setting as a general system definition?',
                subDescription: 'If this option is not checked, the language setting will be unique for this device.'
              }
            },
            button: {
              submit: 'Confirm'
            }
          },
          cashier: {
            title: 'Cashier Settings',
            operationalMode: {
              options: {
                shared: 'Shared',
                individual: 'Individual'
              }
            },
            button: {
              submit: 'Confirm'
            }
          },
          serviceOrders: {
            title: 'Service Orders Settings',
            button: {
              submit: 'Confirm'
            },
            titles: {
              addTitle: "Add Checklist",
              viewTitle: "Checklist Details",
              editTitle: "Edit Checklist",
              deleteTitle: "Delete Checklist"
            },
            form: {
              checklistLabel: "Checklist Name",
              subchecklistLabel: "Subchecklist Name"
            }
          },
          stock: {
            title: 'Stock Settings',
            averagePurchaseCost: {
              description: 'Do you want to enable replacement of cost price with average cost of a given product?',
              subDescription: 'When activating this option, the purchase operations will use the average cost of the product to define the cost price of the same in the stock.'
            },
            averageTransfersCost: {
              description: 'Do you want to enable replacement of cost price with average cost of a given product?',
              subDescription: "When activating this option, the transfer operations will use the average cost of the product to define the cost price of the same in the recipient's stock."
            },
            allowNegativeSale: {
              description: 'Do you want to allow selling products with insufficient stock?',
              subDescription: 'When enabled, POS will not block selection above available balance and will not show “Out of Stock” alert.'
            },
            button: {
              submit: 'Confirm'
            }
          },
          registers: {
            title: 'Registers Settings',
            restrictCustomerRegistration: {
              description: 'Do you want to restrict customer registration?',
              subDescription: 'When disabling the restriction, this will result in the non-compulsory filling in of some fields in the record.',
              fields: {
                document: "CPF / CNPJ",
                birthDate: "BirthDate",
                email: "Email",
                phone: "Phone"
              }
            },
            button: {
              submit: 'Confirm'
            }
          }
        }
      },
      notification: {
        'General/Language': {
          title: 'Cashier Settings',
          description: 'The language has been updated successfully.'
        },
        'General/Currency': {
          title: 'Cashier Settings',
          description: 'The currency has been updated successfully.'
        },
        'Stock/AveragePurchaseCost': {
          title: 'Stock Settings',
          description: 'The average cost application has been updated successfully.'
        },
        'Stock/AverageTransfersCost': {
          title: 'Stock Settings',
          description: 'The average cost application has been updated successfully.'
        },
        'Stock/AllowNegativeSale': {
          title: 'Stock Settings',
          description: 'The negative stock sale permission has been updated successfully.'
        },
        'Cashier/OperationalMode': {
          title: 'Cashier Settings',
          description: 'The operating mode has been updated successfully.'
        },
        'Cashier/WarrantyTerm': {
          title: 'Cashier Settings',
          description: 'The warranty term has been updated successfully.'
        },
        'ServiceOrder/Checklist': {
          title: 'Service Orders Settings',
          description: 'The checklist has been updated successfully.'
        },
        'ServiceOrder/WarrantyTerm': {
          title: 'Service Orders Settings',
          description: 'The warranty term has been updated successfully.'
        },
        'ServiceOrder/DeliveryTerm': {
          title: 'Service Orders Settings',
          description: 'The delivery term has been updated successfully.'
        },
        'Registers/RestrictCustomerRegistration': {
          title: 'Registers Settings',
          description: 'The registry restriction has been updated successfully.'
        },
        error: 'There was an unexpected error. Please try again.'
      }
    }
  };

  public static get(language?: string) {
    return SettingsTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
