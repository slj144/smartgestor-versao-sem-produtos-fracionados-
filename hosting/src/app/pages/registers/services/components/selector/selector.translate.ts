import { ProjectSettings } from "../../../../../../assets/settings/company-settings";

export class ServicesSelectorTranslate {

  private static obj = {
    'pt_BR': {
      searchBar: {
        placeholder: 'Pesquisar..'
      },
      search: {
        info: [
          'Resultados da pesquisa',
          'serviços'
        ],
        item: {
          label: {
            code: 'Código',
            executionPrice: 'Preço',
          }
        }    
      },
      selected: {
        title: 'Services Selecionados',
        item: {        
          label: {
            code: 'Código',
            executionPrice: 'Preço'
          }
        }
      },
      placeholder: {
        beforeSearch: {
          label: 'Busque por serviços',
          instruction: 'Código ou Nome'
        },
        afterSearch: {
          label: 'Não houve resultado',
          button: {
            register: {
              label: 'Registrar Serviço'
            }
          }      
        }
      },
      toast: {
        register: {
          title: 'Registrar Serviço'
        }
      },
    },
    'en_US': {
      searchBar: {
        placeholder: 'Search..'
      },
      search: {
        info: [
          'Search results',
          'services'
        ],
        item: {        
          label: {
            code: 'Code',
            executionPrice: 'Price'
          }
        }
      },
      selected: {
        title: 'Selected Services',
        item: {        
          label: {
            code: 'Code',
            executionPrice: 'Price'
          }
        }
      },
      placeholder: {
        beforeSearch: {
          label: 'Search by services',
          instruction: 'Code or Name'
        },
        afterSearch: {
          label: 'There was no result',
          button: {
            register: {
              label: 'Register Service'
            }
          }
        }
      },
      toast: {
        register: {
          title: 'Register Service'
        }
      },
    }
  }

  public static get(language?: string) {
    return ServicesSelectorTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
