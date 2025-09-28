import { ProjectSettings } from "../../../../../assets/settings/company-settings";

export class StoresSelectorTranslate {

  private static obj = {
    'pt_BR': {
      searchBar: {
        placeholder: 'Pesquisar..'
      },
      block: {
        label: {
          name: 'Nome',
          businessDocument: 'CNPJ',
          phone: 'Telefone',
          email: 'E-mail',
          address: 'Endereço'
        },
        button: {
          select: {
            label: 'Selecionar Loja'
          },
          edit: {
            title: 'Editar Loja'
          }
        }
      },
      placeholder: {
        beforeSearch: {
          label: 'Busque pela loja',
          instruction: 'Nome, CNPJ ou Código'
        },
        afterSearch: {
          label: 'Não houve resultado',
          instruction: 'Pesquise por Nome, CNPJ ou Código'
        }
      }      
    },
    'en_US': {
      searchBar: {
        placeholder: 'Search..'
      },
      block: {
        label: {
          name: 'Name',
          businessDocument: 'CNPJ',
          phone: 'Phone',
          email: 'Email',
          address: 'Address'
        },
        button: {
          select: {
            label: 'Select Store'
          },
          edit: {
            title: 'Edit Store'
          }
        }
      },
      placeholder: {
        beforeSearch: {
          label: 'Search by store',
          instruction: 'Name, CNPJ or Code'
        },
        afterSearch: {
          label: 'There was no result',
          instruction: 'Search by Name, CNPJ or Code'         
        }
      }     
    }
  }

  public static get(language?: string) {
    return StoresSelectorTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
