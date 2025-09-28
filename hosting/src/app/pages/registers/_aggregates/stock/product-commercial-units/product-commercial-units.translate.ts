import { ProjectSettings } from "../../../../../../assets/settings/company-settings";

export class ProductCommercialUnitTranslate {

  private static obj = {
    'pt_BR': {
      title: 'Registro de Unidade Commercial',
      notification: {
        register: 'O cliente foi registrado com sucesso.',
        update: 'O cliente foi atualizado com sucesso.',
        delete: 'O cliente foi excluído com sucesso.',
        error: 'Houve um erro inesperado. Por favor, tente novamente.'
      },
      systemLog: {
        register: 'Registro de cliente.',
        update: 'Atualização de cliente.',
        delete: 'Exclusão de cliente.'
      }
    },
    'en_US': {
      title: 'Commercial Unit Registration',
      notification: {
        register: 'The commercial unit was registered successfully.',
        update: 'The commercial unit was updated successfully.',
        delete: 'The commercial unit was deleted successfully.',
        error: 'There was an unexpected error. Please try again.'
      },
      systemLog: {
        register: 'Commercial Unit registration.',
        update: 'Commercial Unit update.',
        delete: 'Commercial Unit exclusion.'
      }      
    }
  }

  public static get(language?: string) {
    return ProductCommercialUnitTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
