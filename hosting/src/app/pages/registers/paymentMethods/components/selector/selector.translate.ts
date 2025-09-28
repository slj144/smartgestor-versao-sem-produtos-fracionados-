import { ProjectSettings } from "../../../../../../assets/settings/company-settings";

export class PaymentMethodsSelectorTranslate {

  private static obj = {
    'pt_BR': {
      
    },
    'en_US': {
       
    }
  }

  public static get(language?: string) {
    return PaymentMethodsSelectorTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
