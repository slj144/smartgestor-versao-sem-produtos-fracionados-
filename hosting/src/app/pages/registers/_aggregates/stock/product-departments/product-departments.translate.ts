import { ProjectSettings } from "../../../../../../assets/settings/company-settings";

export class ProductDepartmentsTranslate {

  private static obj = {
    'pt_BR': {
      title: 'Registro de Departamentos',
      notification: {
        register: 'O departamento foi registrado com sucesso.',
        update: 'O departamento foi atualizado com sucesso.',
        delete: 'O departamento foi excluído com sucesso.',
        error: 'Houve um erro inesperado. Por favor, tente novamente.'
      },
      systemLog: {
        register: 'Registro de departamento de produto.',
        update: 'Atualização de departamento de produto.',
        delete: 'Exclusão de departamento de produto.'
      }
    },
    'en_US': {
      title: 'Department Registration',
      notification: {
        register: 'The department was registered successfully.',
        update: 'The department was updated successfully.',
        delete: 'The department was deleted successfully.',
        error: 'There was an unexpected error. Please try again.'
      },
      systemLog: {
        register: 'Product department registration.',
        update: 'Product department update.',
        delete: 'Product department deletion.'
      }
    }
  };

  public static get(language?: string) {
    return ProductDepartmentsTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
