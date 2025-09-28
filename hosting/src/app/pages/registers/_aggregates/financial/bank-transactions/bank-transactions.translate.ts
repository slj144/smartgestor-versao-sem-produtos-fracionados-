import { ProjectSettings } from "../../../../../../assets/settings/company-settings";

export class BankTransactionsTranslate {

  private static obj = {
    'pt_BR': {
      data: {
        type: {
          deposit: 'DEPÓSITO',
          withdraw: 'SAQUE',
          transfer: 'TRANSFERÊNCIA'
        }
      },
      systemLog: {
        register: 'Registro de transação bancária.'
      }
    },
    'en_US': {
      data: {
        type: {
          deposit: 'DEPOSIT',
          withdraw: 'WITHDRAW',
          transfer: 'TRANSFER'
        }
      },
      systemLog: {
        register: 'Registration of bank transactions.'
      }      
    }
  }

  public static get(language?: string) {
    return BankTransactionsTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
