import { ProjectSettings } from "@assets/settings/company-settings";

export class GeneralSelectorTranslate {

  private static obj = {
    'pt_BR': {
      searchBar: {
        placeholder: 'Pesquisar..'
      },
      table: {
        label: {
          code: 'Código'
        },
        actions: {
          update: { title: 'Editar' },
          delete: { title: 'Remover' }
        }
      },
      toast: {
        register: {
          type: {
            categories: {
              action: {
                register: { title: 'Adicionar Categoria' },
                update: { title: 'Editar Categoria' }
              }
            },
            professions: {
              action: {
                register: { title: 'Adicionar Profissão' },
                update: { title: 'Editar Profissão' }
              }
            },
            commercialUnits: {
              action: {
                register: { title: 'Adicionar Unidade Comercial' },
                update: { title: 'Editar Unidade Comercial' }
              }
            },
            departments: {
              action: {
                register: { title: 'Adicionar Departamento' },
                update: { title: 'Editar Departamento' }
              }
            },
            providers: {
              action: {
                register: { title: 'Adicionar Fornecedor' }
              }
            },
            adjustmentTypes: {
              action: {
                register: { title: 'Adicionar Tipo de Ajuste' },
                update: { title: 'Editar Tipo de Ajuste' }
              }
            },
          },
          form: {
            label: {
              code: 'Código',
              name: 'Nome',
              symbol: 'Sigla'
            },
            button: {
              cancel: 'Cancelar',
              confirm: 'Confirmar'
            }
          }
        },
        delete: {
          type: {
            categories: {
              title: 'Excluir Categoria',
              notice: 'Você deseja realmente remover esta categoria?',
              label: {
                code: 'Código',
                name: 'Nome'
              }
            },
            professions: {
              title: 'Excluir Profissão',
              notice: 'Você deseja realmente remover esta profissão?',
              label: {
                code: 'Código',
                name: 'Nome'
              }
            },
            commercialUnits: {
              title: 'Excluir Unidade Comercial',
              notice: 'Você deseja realmente remover esta unidade comercial?',
              label: {
                code: 'Código',
                name: 'Nome'
              }
            },
            departments: {
              title: 'Excluir Departamento',
              notice: 'Você deseja realmente remover este departamento?',
              label: {
                code: 'Código',
                name: 'Nome'
              }
            }
          },
          option: {
            cancel: 'Cancelar',
            confirm: 'Confirmar'
          }
        }
      }
    },
    'en_US': {
      searchBar: {
        placeholder: 'Search..'
      },
      table: {
        label: {
          code: 'Code'
        },
        actions: {
          update: { title: 'Edit' },
          delete: { title: 'Delete' }
        }
      },
      toast: {
        register: {
          type: {
            categories: {
              action: {
                register: { title: 'Add Category' },
                update: { title: 'Edit Category' }
              }
            },
            professions: {
              action: {
                register: { title: 'Add Profession' },
                update: { title: 'Edit Profession' }
              }
            },
            commercialUnits: {
              action: {
                register: { title: 'Add Commercial Unit' },
                update: { title: 'Edit Commercial Unit' }
              }
            },
            departments: {
              action: {
                register: { title: 'Add Department' },
                update: { title: 'Edit Department' }
              }
            },
            providers: {
              action: {
                register: { title: 'Add Provider' }
              }
            },
            adjustmentTypes: {
              action: {
                register: { title: 'Add Adjustment Type' },
                update: { title: 'Edit Adjustment Type' }
              }
            },
          },
          form: {
            label: {
              code: 'Code',
              name: 'Name',
              symbol: 'Symbol'
            },
            button: {
              cancel: 'Cancel',
              confirm: 'Confirm'
            }
          }
        },
        delete: {
          type: {
            categories: {
              title: 'Remove Category',
              notice: 'Do you really want to remove this category?',
              label: {
                code: 'Code',
                name: 'Name'
              }
            },
            professions: {
              title: 'Remove Profession',
              notice: 'Do you really want to remove this profession?',
              label: {
                code: 'Code',
                name: 'Name'
              }
            },
            commercialUnits: {
              title: 'Remove Commercial Unit',
              notice: 'Do you really want to remove this commercial unit?',
              label: {
                code: 'Code',
                name: 'Name'
              }
            },
            departments: {
              title: 'Remove Department',
              notice: 'Do you really want to remove this department?',
              label: {
                code: 'Code',
                name: 'Name'
              }
            }
          },
          option: {
            cancel: 'Cancel',
            confirm: 'Confirm'
          }
        }
      }
    }
  };

  public static get(language?: string) {
    return GeneralSelectorTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
