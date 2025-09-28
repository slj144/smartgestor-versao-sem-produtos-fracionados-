import { ProjectSettings } from "@assets/settings/company-settings";

export class SystemUpdateTranslation {

  private static obj = {
    'pt_BR': {
      title: 'Novidades do sistema',
      release: {        
        version: 'Versão',
        date: 'Data de Lançamento'
      },
      button: {
        update: 'Obter Atualização'
      }
    },
    'en_US': {
      title: 'System news',
      release: {
        version: 'Version',
        date: 'Release Date'
      },
      button: {
        update: 'Get Update'        
      }
    }
  };

  public static get(language?: string) {
    return SystemUpdateTranslation.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
