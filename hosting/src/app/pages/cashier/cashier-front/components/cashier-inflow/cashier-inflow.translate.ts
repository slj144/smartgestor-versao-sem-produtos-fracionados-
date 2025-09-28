import { ProjectSettings } from "@assets/settings/company-settings";
import { Utilities } from "@shared/utilities/utilities";

export class CashierFrontInflowTranslate {

  private static obj = {
    'pt_BR': {
      modalTitle: 'Entrada de Caixa',
      form: {
        label: {
          value: `Valor (${Utilities.currencySymbol})`,
          category: 'Categoria',
          note: 'Observação'
        },
        notice: '* Os campos obrigatórios estão marcados em vermelho.',
        button: {
          register: 'Registrar Entrada'
        }
      },
      layer: {
        categories: {
          title: 'Categorias'
        }
      },
      notification: {
        register: 'A entrada de caixa foi registrada com sucesso.',
        update: 'A entrada de caixa foi atualizada com sucesso.',
        delete: 'A entrada de caixa foi excluída com sucesso.',
        error: 'Houve um erro inesperado. Por favor, tente novamente.'
      },
      systemLog: {
        register: 'Registro de entrada de caixa.',
        update: 'Atualização de entrada de caixa.',
        cancel: 'Cancelamento de entrada de caixa.',
        delete: 'Exclusão de entrada de caixa.'
      }
    },
    'en_US': {
      modalTitle: 'Cash Input',
      form: {
        label: {
          value: `Value (${Utilities.currencySymbol})`,
          category: 'Category',
          note: 'Note'
        },
        notice: '* Mandatory fields are marked in red.',
        button: {
          register: 'Register Input'
        }
      },
      layer: {
        categories: {
          title: 'Categories'
        }
      },
      notification: {
        register: 'The cash inflow was successfully registered.',
        update: 'The cash inflow was successfully updated.',
        delete: 'The cash inflow was successfully deleted.',
        error: 'There was an unexpected error. Please try again.'
      },
      systemLog: {
        register: 'Cash inflow registration.',
        update: 'Cash inflow update.',
        cancel: 'Cash inflow cancellation.',
        delete: 'Cash inflow exclusion.'
      }
    }
  }

  public static get(language?: string) {
    return CashierFrontInflowTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
