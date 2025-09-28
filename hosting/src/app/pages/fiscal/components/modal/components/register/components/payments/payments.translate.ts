import { ProjectSettings } from "../../../../../../../../../assets/settings/company-settings";

export class AddressComponentTranslate {

  private static obj = {
    'pt_BR': {
      
    },
    'en_US': {
       
    }
  }

  public static get(language?: string) {
    return AddressComponentTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
