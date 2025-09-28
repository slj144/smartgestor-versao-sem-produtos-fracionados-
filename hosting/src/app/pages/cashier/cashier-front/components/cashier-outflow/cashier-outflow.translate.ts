import { ProjectSettings } from "../../../../../../assets/settings/company-settings";
import { Utilities } from "@shared/utilities/utilities";

export class CashierFrontOutflowTranslate {

  private static obj = {
    'pt_BR': {
      modalTitle: 'Saída de Caixa',
      form: {
        label: {
          value: `Valor (${Utilities.currencySymbol})`,
          category: 'Categoria',
          note: 'Observação'
        },
        notice: '* Os campos obrigatórios estão marcados em vermelho.',
        button: {
          register: 'Registrar Saída'
        }
      },
      layer: {
        categories: {
          title: 'Categorias'
        }
      },
      notification: {
        register: 'A saída de caixa foi registrada com sucesso.',
        update: 'A saída de caixa foi atualizada com sucesso.',
        delete: 'A saída de caixa foi excluída com sucesso.',
        error: 'Houve um erro inesperado. Por favor, tente novamente.'
      },
      systemLog: {
        register: 'Registro de saída de caixa.',
        update: 'Atualização de saída de caixa.',
        cancel: 'Cancelamento de saída de caixa.',
        delete: 'Exclusão de saída de caixa.'
      }
    },
    'en_US': {
      modalTitle: 'Cash Output',
      form: {
        label: {
          value: `Value (${Utilities.currencySymbol})`,
          category: 'Category',
          note: 'Note'
        },
        notice: '* Mandatory fields are marked in red.',
        button: {
          register: 'Register Output'
        }
      },
      layer: {
        categories: {
          title: 'Categories'
        }
      },
      notification: {
        register: 'The cash outflow was successfully registered.',
        update: 'The cash outflow was successfully updated.',
        delete: 'The cash outflow was successfully deleted.',
        error: 'There was an unexpected error. Please try again.'
      },
      systemLog: {
        register: 'Cash outflow registration.',
        update: 'Cash outflow update.',
        cancel: 'Cash outflow cancellation.',
        delete: 'Cash outflow exclusion.'
      }
    }
  }

  public static get(language?: string) {
    return CashierFrontOutflowTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
