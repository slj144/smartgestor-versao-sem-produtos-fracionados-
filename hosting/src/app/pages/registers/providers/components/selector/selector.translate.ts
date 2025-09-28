import { ProjectSettings } from "../../../../../../assets/settings/company-settings";

export class ProvidersSelectorTranslate {

  private static obj = {
    'pt_BR': {
      searchBar: {
        placeholder: 'Pesquisar..'
      },
      block: {
        label: {
          name: 'Nome',
          phone: 'Telefone',
          email: 'E-mail',
          address: 'Endereço'
        },
        button: {
          select: {
            label: 'Selecionar Fornecedor'
          },
          edit: {
            title: 'Editar Fornecedor'
          }
        }
      },
      placeholder: {
        beforeSearch: {
          label: 'Busque pelo fornecedor',
          instruction: 'Nome, CPF, CNPJ ou Código'
        },
        afterSearch: {
          label: 'Não houve resultado',
          button: {
            register: {
              label: 'Registrar Fornecedor'
            }
          }
        }
      },
      toast: {
        register: {
          title: 'Registrar Fornecedor'
        }
      },
      floatingButton: {
        register: {
          title: 'Registrar Fornecedor'
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
          phone: 'Phone',
          email: 'Email',
          address: 'Address'
        },
        button: {
          select: {
            label: 'Select Provider'
          },
          edit: {
            title: 'Edit Provider'
          }
        }
      },
      placeholder: {
        beforeSearch: {
          label: 'Search by provider',
          instruction: 'Name, CPF, CNPJ or Code'
        },
        afterSearch: {
          label: 'There was no result',
          button: {
            register: {
              label: 'Register Provider'
            }
          }
        }
      },
      toast: {
        register: {
          title: 'Register Provider'
        }
      },
      floatingButton: {
        register: {
          title: 'Register Provider'
        }
      }
    }
  }

  public static get(language?: string) {
    return ProvidersSelectorTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
