import { ProjectSettings } from "@assets/settings/company-settings";

export class HeaderTranslate {

  private static obj = {
    'pt_BR': {
      searchBar: {
        placeholder: 'Pesquisar..'
      },      
      count: {
        label: [ 'Exibindo', 'de' ]
      },
      orderBy:{
        label: 'Alterar ordem da listagem'
      }
    },
    'en_US': {
      searchBar: {
        placeholder: 'Search..'
      },
      count: {
        label: [ 'Displaying', 'of' ]
      },
      orderBy:{
        label: 'Change list order'
      }
    }
  }

  public static get(language?: string) {
    return HeaderTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
