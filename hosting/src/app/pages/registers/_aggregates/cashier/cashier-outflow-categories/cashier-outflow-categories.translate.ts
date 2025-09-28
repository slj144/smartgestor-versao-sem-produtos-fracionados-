import { ProjectSettings } from "../../../../../../assets/settings/company-settings";

export class CashierOutflowCategoriesTranslate {

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
        register: 'Registro de categoria de produto.',
        update: 'Atualização de categoria de produto.',
        delete: 'Exclusão de categoria de produto.'
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
        register: 'Product category registration.',
        update: 'Product category update.',
        delete: 'Product category exclusion.'
      }      
    }
  }

  public static get(language?: string) {
    return CashierOutflowCategoriesTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
