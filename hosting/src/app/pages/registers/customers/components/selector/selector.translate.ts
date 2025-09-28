import { ProjectSettings } from "../../../../../../assets/settings/company-settings";

export class CustomerSelectorTranslate {

  private static obj = {
    'pt_BR': {
      searchBar: {
        placeholder: 'Pesquisar..'
      },
      block: {
        label: {
          name: 'Nome',
          personalDocument: 'CPF',
          businessDocument: 'CNPJ',
          phone: 'Telefone',
          email: 'E-mail',
          address: 'Endereço'
        },
        button: {
          select: {
            label: 'Selecionar Cliente'
          },
          edit: {
            title: 'Editar Cliente'
          }
        }
      },
      placeholder: {
        beforeSearch: {
          label: 'Busque pelo cliente',
          instruction: 'Nome, CPF, CNPJ ou Código'
        },
        afterSearch: {
          label: 'Não houve resultado',
          button: {
            register: {
              label: 'Registrar Cliente'
            }
          }
        }
      },
      toast: {
        register: {
          title: 'Registrar Cliente'
        },
        update: {
          title: 'Editar Cliente'
        }
      },
      floatingButton: {
        register: {
          title: 'Registrar Cliente'
        }
      }
    },
    'en_US': {
      searchBar: {
        placeholder: 'Search..'
      },
      block: {
        label: {
          name: 'Name',
          personalDocument: 'CPF',
          businessDocument: 'CNPJ',
          phone: 'Phone',
          email: 'Email',
          address: 'Address'
        },
        button: {
          select: {
            label: 'Select Customer'
          },
          edit: {
            title: 'Edit Customer'
          }
        }
      },
      placeholder: {
        beforeSearch: {
          label: 'Search by customer',
          instruction: 'Name, CPF, CNPJ or Code'
        },
        afterSearch: {
          label: 'There was no result',
          button: {
            register: {
              label: 'Register Customer'
            }
          }
        }
      },
      toast: {
        register: {
          title: 'Register Customer'
        },
        update: {
          title: 'Edit Customer'
        }
      },
      floatingButton: {
        register: {
          title: 'Register Customer'
        }
      }
    }
  }

  public static get(language?: string) {
    return CustomerSelectorTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
