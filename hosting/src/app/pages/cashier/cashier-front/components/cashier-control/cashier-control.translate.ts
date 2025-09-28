import { ProjectSettings } from "../../../../../../assets/settings/company-settings";
import { Utilities } from "@shared/utilities/utilities";

export class CashierFrontControlTranslate {

  private static obj = {
    'pt_BR': {
      componentTitle: 'Controle de Caixa',
      open: {
        salutation: 'Olá',
        subtitle: 'Para começar, realize a abertura do caixa.',
        info: {
          opening: `Saldo Inicial (${Utilities.currencySymbol})`,
          warning: 'Você não tem permissão para realizar essa ação!'
        },
        button: {
          submit: 'Abrir Caixa'
        }
      },
      close: {
        title: 'Fechamento de Caixa',
        subtitle: 'O fechamento será aplicado imediatamente.',
        info: {
          opened_by: 'Aberto por',
          opened_in: 'Aberto em',
          value: {
            opening: `Valor de Abertura (${Utilities.currencySymbol})`,
            current: `Valor em Caixa (${Utilities.currencySymbol})`
          }
        },
        button: {
          back: 'Voltar',
          confirm: 'Confirmar'
        }
      },
      notification: {
        open: 'A abertura de caixa foi realizada com sucesso.',
        close: 'O fechamento de caixa foi realizado com sucesso.',
        error: 'Houve um erro inesperado. Por favor, tente novamente.'
      },
      systemLog: {
        open: 'Registro de entrada de caixa.',
        close: 'Atualização de entrada de caixa.'
      }
    },
    'en_US': {
      componentTitle: 'Cashier Control',
      open: {
        salutation: 'Hello',
        subtitle: 'To start, open the cashier.',
        info: {
          opening: `Opening balance (${Utilities.currencySymbol})`,
          warning: 'You are not allowed to perform this action!'
        },
        button: {
          submit: 'Open Cashier'
        }
      },
      close: {
        title: 'Cash Closing',
        suttitle: 'The closure will be applied immediately.',
        info: {
          opened_by: 'Opened by',
          opened_in: 'Opened in',
          value: {
            opening: `Opening Value (${Utilities.currencySymbol})`,
            current: `Cash Value (${Utilities.currencySymbol})`
          }
        },
        button: {
          back: 'Back',
          confirm: 'Close Cashier'
        }
      },
      notification: {
        open: 'The cash opening was successfully performed.',
        close: 'The cash closing was successfully performed.',
        error: 'There was an unexpected error. Please try again.'
      },
      systemLog: {
        open: 'Registro de entrada de caixa.',
        close: 'Atualização de entrada de caixa.'
      }
    }
  }

  public static get(language?: string) {
    return CashierFrontControlTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
