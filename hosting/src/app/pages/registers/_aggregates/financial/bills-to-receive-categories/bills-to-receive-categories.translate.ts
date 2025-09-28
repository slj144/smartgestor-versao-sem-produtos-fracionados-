import { ProjectSettings } from "../../../../../../assets/settings/company-settings";

export class BillsToReceiveCategoriesTranslate {

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
        register: 'Registro de categoria de contas a receber.',
        update: 'Atualização de categoria de contas a receber.',
        delete: 'Exclusão de categoria de contas a receber.'
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
        register: 'Accounts receivable category record.',
        update: 'Accounts receivable category editing.',
        delete: 'Accounts receivable category exclusion.'
      }      
    }
  }

  public static get(language?: string) {
    return BillsToReceiveCategoriesTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
