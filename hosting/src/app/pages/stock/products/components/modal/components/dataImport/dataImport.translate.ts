import { ProjectSettings } from "../../../../../../../../assets/settings/company-settings";

export class DataImportTranslate {

  private static obj = {
    'pt_BR': {

    },
    'en_US': {

    }
  }

  public static get(language?: string) {
    return DataImportTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
