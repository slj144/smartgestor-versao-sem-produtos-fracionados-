import { ProjectSettings } from "../../../../../../assets/settings/company-settings";

export class CashierInflowCategoriesTranslate {

  private static obj = {
    'pt_BR': {
      title: 'Registro de Categorias',
      notification: {
        register: 'A categoria foi registrado com sucesso.',
        update: 'A categoria foi atualizado com sucesso.',
        delete: 'A categoria foi excluído com sucesso.',
        error: 'Houve um erro inesperado. Por favor, tente novamente.'
      },
      systemLog: {
        register: 'Registro de categoria de entrada de caixa.',
        update: 'Atualização de categoria de entrada de caixa.',
        delete: 'Exclusão de categoria de entrada de caixa.'
      }
    },
    'en_US': {
      title: 'Categorias Registration',
      notification: {
        register: 'The category was registered successfully.',
        update: 'The category was updated successfully.',
        delete: 'The category was deleted successfully.',
        error: 'There was an unexpected error. Please try again.'
      },
      systemLog: {
        register: 'Cash inflow category registration.',
        update: 'Cash inflow category update.',
        delete: 'Cash inflow category exclusion.'
      }      
    }
  }

  public static get(language?: string) {
    return CashierInflowCategoriesTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
