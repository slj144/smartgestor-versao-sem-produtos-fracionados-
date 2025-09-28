import { ProjectSettings } from "@assets/settings/company-settings";
import { Utilities } from "@shared/utilities/utilities";

export class ServiceOrdersReceiptsTranslate {

  private static obj = {
    'pt_BR': {
      settings: {
        title: 'COMPROVANTES',
        type: {
          warranty: 'Termo de Garantia',
          delivery: 'Termo de Entrega',
          whatsapp: 'WHATSAPP' // ADICIONADO
        },
        format: {
          a4: 'Formato: A4',
          thermal: 'Formato: Térmico',
          whatsapp: 'Enviar via WhatsApp' // ADICIONADO
        },
        button: {
          close: 'Fechar'
        }
      },
      receipt: {
        header: {
          address: 'Endereço',
          phone: 'Telefone',
          cnpj: 'CNPJ' // ADICIONADO
        },
        content: {
          informations: {
            title: 'Informações',
            label: {
              code: 'Código',
              date: 'Data',
              operator: 'Colaborador'
            }
          },
          customer: {
            title: 'Cliente',
            label: {
              name: 'Nome',
              phone: 'Telefone'
            }
          },
          vehicle: { // ADICIONADO
            title: 'Veículo',
            label: {
              plate: 'Placa',
              mileage: 'Quilometragem',
              model: 'Modelo',
              color: 'Cor'
            }
          },
          equipment: {
            title: 'Equipamento',
            label: {
              model: 'Modelo',
              brand: "Marca",
              password: "Senha"
            }
          },
          photos: {
            title: 'Fotos',
            before: 'Antes',
            after: 'Depois'
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
          },
          checklist: {
            title: 'Checklist'
          },
          description: {
            title: 'Descrição'
          },
          term: {
            warranty: { title: 'TERMO DE GARANTIA' },
            delivery: { title: 'TERMO DE ENTREGA' }
          },
          signature: {
            customer: 'Cliente',
            responsible: 'Responsável'
          }
        }
      }
    },
    'en_US': {
      settings: {
        title: 'RECEIPT',
        type: {
          warranty: 'Warranty Term',
          delivery: 'Delivery Term',
          whatsapp: 'WHATSAPP' // ADICIONADO
        },
        format: {
          a4: 'Format: A4',
          thermal: 'Format: Thermal',
          whatsapp: 'Send via WhatsApp' // ADICIONADO
        },
        button: {
          close: 'Close'
        }
      },
      receipt: {
        header: {
          address: 'Address',
          phone: 'Phone',
          cnpj: 'CNPJ' // ADICIONADO
        },
        content: {
          informations: {
            title: 'Informations',
            label: {
              code: 'Code',
              date: 'Date',
              operator: 'Collaborator'
            }
          },
          customer: {
            title: 'Customer',
            label: {
              name: 'Name',
              phone: 'Phone'
            }
          },
          vehicle: { // ADICIONADO
            title: 'Vehicle',
            label: {
              plate: 'Plate',
              mileage: 'Mileage',
              model: 'Model',
              color: 'Color'
            }
          },
          equipment: {
            title: 'Equipment',
            label: {
              model: 'Model',
              brand: "Brand",
              password: "Password"
            }
          },
          photos: {
            title: 'Photos',
            before: 'Before',
            after: 'After'
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
          },
          checklist: {
            title: 'Checklist'
          },
          description: {
            title: 'Description'
          },
          term: {
            warranty: { title: 'WARRANTY TERM' },
            delivery: { title: 'DELIVERY TERM' }
          },
          signature: {
            customer: 'Customer',
            responsible: 'Responsible'
          }
        }
      }
    }
  }

  public static get(language?: string) {
    return ServiceOrdersReceiptsTranslate.obj[language || window.localStorage.getItem('Language') || ProjectSettings.companySettings().language];
  }

}