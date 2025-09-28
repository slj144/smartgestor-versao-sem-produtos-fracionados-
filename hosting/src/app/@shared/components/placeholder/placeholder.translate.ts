import { ProjectSettings } from "@assets/settings/company-settings";

export class PlaceholderTranslate {

  private static obj = {
    'pt_BR': {
      noData: "Não há dados a serem listados.",
      loading: "Carregando"
    },
    'en_US': {
      noData: "There is no data to be listed.",
      loading: "Loading"
    }
  };

  public static get(language?: string) {
    return PlaceholderTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}