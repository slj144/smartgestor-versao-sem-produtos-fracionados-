import { ProjectSettings } from "../../../../../../assets/settings/company-settings";
import { Utilities } from "@shared/utilities/utilities";

export class CashierFrontReceiptsTranslate {

  private static obj = {
    'pt_BR': {
      option: {
        title: {
          default: 'COMPROVANTE',
          whatsapp: 'WHATSAPP',
          fiscal: {
            danfe: {
              nf: 'NFE / NFCE DANFE',
              nfse: 'NFSE DANFE'
            },
            xml: {
              nf: 'NFE / NFCE',
              nfse: 'NFSE'
            }
          }
        },
        format: {
          a4: 'Formato: A4 (Comum)',
          thermal: 'Formato: Térmico',
          whatsapp: 'Enviar via WhatsApp',
          pdf: 'Format: PDF',
          xml: 'Format: XML'
        },
        button: {
          close: 'Fechar'
        }
      },
      receipt: {
        store: {
          phone: 'Telefone',
          cnpj: 'CNPJ'
        },
        label: {
          code: 'Código da Venda',
          date: 'Data',
          operator: 'Operador',
          customer: 'Cliente',
          name: 'Nome',
          services: {
            title: 'Informações de Serviços'
          },
          products: {
            title: 'Informações de Produtos',
            sub: {
              serialNumber: 'Número de Série'
            }
          },
          balance: {
            subtotal: {
              title: 'Subtotal',
              sub: {
                products: 'Produtos',
                services: 'Serviços',
                discount: 'Desconto'
              }
            },
            total: 'Total'
          },
          payment: {
            title: 'Forma(s) de Pagamento'
          },
          note: {
            title: 'Observação'
          },
          warrantyTerm: {
            title: 'TERMO DE GARANTIA'
          },
          signature: {
            customer: 'Cliente',
            responsible: 'Responsável'
          }
        }
      }
    },
    'en_US': {
      option: {
        title: {
          default: 'RECEIPT',
          whatsapp: 'WHATSAPP',
          fiscal: {
            danfe: {
              nf: 'NFE / NFCE DANFE',
              nfse: 'NFSE DANFE'
            },
            xml: {
              nf: 'NFE / NFCE',
              nfse: 'NFSE'
            }
          }
        },
        format: {
          a4: 'Format: A4 (Common)',
          thermal: 'Format: Thermal',
          whatsapp: 'Send via WhatsApp',
          pdf: 'Format: PDF',
          xml: 'Format: XML'
        },
        button: {
          close: 'Close'
        }
      },
      receipt: {
        store: {
          phone: 'Phone',
          cnpj: 'CNPJ'
        },
        label: {
          code: 'Sale Code',
          date: 'Date',
          operator: 'Operator',
          customer: 'Customer',
          name: 'Name',
          services: {
            title: 'Services Information'
          },
          products: {
            title: 'Products Information',
            sub: {
              serialNumber: 'Serial Number'
            }
          },
          balance: {
            subtotal: {
              title: 'Subtotal',
              sub: {
                products: 'Products',
                services: 'Services',
                discount: 'Discount'
              }
            },
            total: 'Total'
          },
          payment: {
            title: 'Payment Information'
          },
          note: {
            title: 'Note'
          },
          warrantyTerm: {
            title: 'WARRANTY TERMS'
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
    return CashierFrontReceiptsTranslate.obj[language || window.localStorage.getItem('Language') || ProjectSettings.companySettings().language];
  }

}