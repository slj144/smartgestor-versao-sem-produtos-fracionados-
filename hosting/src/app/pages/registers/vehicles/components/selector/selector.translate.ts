import { ProjectSettings } from "@assets/settings/company-settings";

export class VehiclesSelectorTranslate {

  private static obj = {
    'pt_BR': {
      searchBar: {
        placeholder: 'Pesquisar..'
      },
      search: {
        info: [
          'Resultados da pesquisa',
          'veículos'
        ],
        item: {
          label: {
            code: 'Código',
            model: 'Modelo',
            proprietary: 'Proprietário'
          }
        }    
      },
      selected: {
        title: 'Serviços selecionados',
        item: {        
          label: {
            code: 'Código',
            model: 'Modelo',
            proprietary: 'Proprietário'
          }
        }
      },
      placeholder: {
        beforeSearch: {
          label: 'Busque por veículos',
          instruction: 'Código ou Placa'
        },
        afterSearch: {
          label: 'Não houve resultado',
          button: {
            register: {
              label: 'Registrar Veículo'
            }
          }      
        }
      },
      toast: {
        register: {
          title: 'Registrar Veículo'
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
          'vehicles'
        ],
        item: {        
          label: {
            code: 'Code',
            model: 'Model',
            proprietary: 'Proprietary'
          }
        }
      },
      selected: {
        title: 'Selected vehicles',
        item: {        
          label: {
            code: 'Code',
            model: 'Model',
            proprietary: 'Proprietary'
          }
        }
      },
      placeholder: {
        beforeSearch: {
          label: 'Search by vehicles',
          instruction: 'Code or Plate'
        },
        afterSearch: {
          label: 'There was no result',
          button: {
            register: {
              label: 'Register Vehicle'
            }
          }
        }
      },
      toast: {
        register: {
          title: 'Register Vehicle'
        }
      },
    }
  }

  public static get(language?: string) {
    return VehiclesSelectorTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
