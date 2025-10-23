/*
  📁 ARQUIVO: cashier-pdv.translate.ts
  📂 LOCALIZAÇÃO: src/app/pages/cashier/cashier-front/components/cashier-pdv/
  🎯 FUNÇÃO: Arquivo de traduções do componente PDV (Português e Inglês)
  ✨ MODIFICAÇÃO: Adicionado traduções para o campo de garantia
*/

import { ProjectSettings } from "../../../../../../assets/settings/company-settings";
import { Utilities } from "@shared/utilities/utilities";

export class CashierFrontPDVTranslate {

  private static obj = {
    'pt_BR': {
      componentTitle: 'Ponto de Venda',
      panel: {
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
            name: 'Nome',
            price: `Price (${Utilities.currencySymbol})`
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
            price: `Preço (${Utilities.currencySymbol})`,
            total: `Total (${Utilities.currencySymbol})`
          }
        },
        paymentMethods: {
          title: 'Meios de Pagamento',
          label: {
            value: `Valor (${Utilities.currencySymbol})`,
            parcels: 'Parcelas',
            note: 'Observação',
            info: {
              received: 'Valor recebido',
              pendent: "Valor pendente",
              allPaid: "O(s) valor(es) correspondem exatamente ao total da venda.",
              overplus: (value: number) => { return "O valor está incorreto. Por favor, retire " + value + " do(s) métodos."; }
            },

          }
        },
        settings: {
          title: 'Configurações',
          option: {
            fee: {
              label: 'Taxa'
            },
            // 🆕 TRADUÇÕES ADICIONADAS PARA GARANTIA
            warranty: {
              label: 'Garantia',
              placeholder: 'Ex: 6 meses, 1 ano, 10.000 km'
            }
          }
        },
        balance: {
          label: {
            subtotal: {
              title: 'Subtotal',
              integrant: {
                products: 'Produtos',
                services: 'Serviços',
                discount: 'Desconto',
                fee: "Taxa"
              }
            },
            total: 'Total'
          }
        },
        button: {
          register: 'Registrar'
        }
      },
      pendingModal: {
        title: 'Venda fechada como pendente',
        subtitle: 'Atenção: ainda não foi faturada.',
        pendingLabel: 'Valor pendente:',
        totalLabel: 'Total da venda:',
        codeLabel: 'Venda #',
        actionReview: 'Revisar pagamentos',
        actionOk: 'Ok, entendi'
      },
      layer: {
        members: { title: 'Membros' },
        customers: { title: 'Clientes' },
        products: { title: 'Produtos' },
        paymentMethods: { title: 'Meios de Pagamento' }
      },
      notification: {
        register: 'A venda foi registrada com sucesso.',
        update: 'A venda foi atualizada com sucesso.',
        delete: 'A venda foi excluída com sucesso.',
        error: 'Houve um erro inesperado. Por favor, tente novamente.',
        discountLock: {
          title: 'Desconto bloqueado',
          description: 'Um administrador precisa aprovar este desconto antes de concluir a venda.'
        }
      },
      systemLog: {
        register: 'Registro de venda.',
        update: 'Atualização de venda.',
        delete: 'Exclusão de venda.'
      },
      discountLockModal: {
        title: 'Aprovação necessária',
        description: 'Informe usuário e senha de um administrador para liberar o desconto ou salve como pendente para aprovação posterior.',
        username: 'Usuário administrador',
        password: 'Senha',
        confirm: 'Autorizar desconto',
        savePending: 'Salvar como pendente',
        cancel: 'Cancelar',
        invalid: 'Credenciais inválidas ou usuário não autorizado.'
      }
    },
    'en_US': {
      componentTitle: 'Point of Sale',
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
        services: {
          title: 'Services',
          label: {
            code: 'Código',
            name: 'Nome',
            price: `Price (${Utilities.currencySymbol})`
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
            price: `Price (${Utilities.currencySymbol})`,
            total: `Total (${Utilities.currencySymbol})`
          }
        },
        paymentMethods: {
          title: 'Payment Methods',
          label: {
            value: `Value (${Utilities.currencySymbol})`,
            parcels: 'Parcels',
            note: 'Note',
            info: {
              received: 'Amount received',
              pendent: "Amount pendent",
              allPaid: "O(s) valor(es) correspondem exatamente ao total da venda.",
              overplus: (value: number) => { return "O valor está incorreto. Por favor, retire " + value + " do(s) métodos."; }
            }
          }
        },
        settings: {
          title: 'Settings',
          option: {
            fee: {
              label: 'Fee'
            },
            // 🆕 TRADUÇÕES EM INGLÊS PARA GARANTIA
            warranty: {
              label: 'Warranty',
              placeholder: 'Ex: 6 months, 1 year, 10,000 km'
            }
          }
        },
        balance: {
          label: {
            subtotal: {
              title: 'Subtotal',
              integrant: {
                products: 'Products',
                services: 'Services',
                discount: 'Discount',
                fee: "Fee"
              }
            },
            total: 'Total'
          }
        },
        button: {
          register: 'Register'
        }
      },
      pendingModal: {
        title: 'Sale closed as pending',
        subtitle: 'Attention: it has not been invoiced yet.',
        pendingLabel: 'Pending amount:',
        totalLabel: 'Sale total:',
        codeLabel: 'Sale #',
        actionReview: 'Review payments',
        actionOk: 'OK, got it'
      },
      layer: {
        members: { title: 'Members' },
        customers: { title: 'Customers' },
        products: { title: 'Products' },
        paymentMethods: { title: 'Payment Methods' }
      },
      notification: {
        register: 'The sale was successfully registered.',
        update: 'The sale was successfully updated.',
        delete: 'The sale was successfully deleted.',
        error: 'There was an unexpected error. Please try again.',
        discountLock: {
          title: 'Discount blocked',
          description: 'An administrator must approve this discount before completing the sale.'
        }
      },
      systemLog: {
        register: 'Sale registration.',
        update: 'Sale update.',
        delete: 'Sale exclusion.'
      },
      discountLockModal: {
        title: 'Approval required',
        description: 'Provide an administrator username and password to authorize the discount, or save the sale as pending for later approval.',
        username: 'Administrator username',
        password: 'Password',
        confirm: 'Authorize discount',
        savePending: 'Save as pending',
        cancel: 'Cancel',
        invalid: 'Invalid credentials or user not allowed.'
      }
    }
  }

  public static get(language?: string) {
    return CashierFrontPDVTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
