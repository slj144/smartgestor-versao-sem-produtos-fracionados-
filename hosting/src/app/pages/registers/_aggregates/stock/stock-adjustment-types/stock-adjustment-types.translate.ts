import { ProjectSettings } from "../../../../../../assets/settings/company-settings";

export class StockAdjustmentTypesTranslate {

  private static obj = {
    'pt_BR': {
      title: 'Registro de Tipo de Ajuste',
      notification: {
        register: 'O cliente foi registrado com sucesso.',
        update: 'O cliente foi atualizado com sucesso.',
        delete: 'O cliente foi excluído com sucesso.',
        error: 'Houve um erro inesperado. Por favor, tente novamente.'
      },
      systemLog: {
        register: 'Registro de tipo de ajuste de estoque.',
        update: 'Atualização de tipo de ajuste de estoque.',
        delete: 'Exclusão de tipo de ajust de estoquee.'
      }
    },
    'en_US': {
      title: 'Adjustment Types Registration',
      notification: {
        register: 'The type was registered successfully.',
        update: 'The type was updated successfully.',
        delete: 'The type was deleted successfully.',
        error: 'There was an unexpected error. Please try again.'
      },
      systemLog: {
        register: 'Stock Adjustment Types registration.',
        update: 'Stock Adjustment Types update.',
        delete: 'Stock Adjustment Types exclusion.'
      }      
    }
  }

  public static get(language?: string) {
    return StockAdjustmentTypesTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
