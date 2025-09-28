import { ProjectSettings } from "../../../../../../../../../assets/settings/company-settings";
import { Utilities } from "@shared/utilities/utilities";

export class ServiceOrdersReceiptsTranslate {

  private static obj = {
    'pt_BR': {
      settings: {
        title: 'COMPROVANTES',
        type: {
          danfe: {
            nf: 'NFE / NFCE DANFE',
            nfse: 'NFSE DANFE'
          },
          xml: {
            nf: 'NFE / NFCE',
            nfse: 'NFSE'
          }
        },
        format: {
          pdf: 'Format: PDF',
          xml: 'Format: XML'
        },
        button: {
          close: 'Fechar'
        }
      },
    },
    'en_US': {
      settings: {
        title: 'RECEIPT',
        type: {
          danfe: {
            nf: 'NFE / NFCE DANFE',
            nfse: 'NFSE DANFE'
          },
          xml: {
            nf: 'NFE / NFCE',
            nfse: 'NFSE'
          }
        },
        format: {
          pdf: 'Format: PDF',
          xml: 'Format: XML'
        },
        button: {
          lose: 'Close'
        }
      },

    }
  }

  public static get(language?: string) {
    return ServiceOrdersReceiptsTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
