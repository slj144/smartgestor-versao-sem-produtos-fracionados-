import { ProjectSettings } from "../../../assets/settings/company-settings";

export class FiscalTranslate {

  private static obj = {
    'pt_BR': {
      pageTitle: 'Fiscal',
      searchBar: {
        placeholder: 'Pesquisar..'
      },
      count: {
        label: [ 'Exibindo', 'de' ]
      },
      block: {
        label: {
          code: 'Código',
          members: 'Membros'
        }
      },
      table: {
        label: {
          code: 'Código',
          name: 'Nome',
          subject: 'Assunto',
          members: 'Membros',
          actions: 'Ações'
        }
      },
      modal: {
        help: {
          title: 'Ajuda'
        },
        filters: {
          title: 'Filtros'
        },
        action: {
          register: {
            type: {
              create: { title: 'Registro de Grupo' },
              update: { title: 'Edição de Grupo' }
            },
            form: {
              field: {
                name: { label: 'Nome do Grupo' },
                subject: { label: 'Assunto' },
                description: { label: 'Descrição' },
                members: {
                  label: 'Membros',
                  content: {
                    code: 'Código'
                  },
                  placeholder: 'Selecione membros para o grupo..'
                }
              },
              issues: {
                label: 'Atenção!',
                message: {
                  requiredFields: 'Os campos obrigatórios estão marcados em vermelho.',
                  fileSize: 'A imagem selecionada deve ter um tamanho de até 2MB.',
                  membersSelection: 'Selecione pelo menos um membro.'
                }
              },
              button: {
                submit: 'Confirmar'
              }
            },
            layer: {
              members: { title: 'Membros' }
            }
          },
          read: {
            title: 'Detalhes do Grupo',
            section: {
              info: {
                label: {
                  code: 'Código'
                }
              },
              subject: {
                title: 'Assunto'
              },
              description: {
                title: 'Descrição'
              },
              members: {
                title: 'Membros',
                label: {
                  code: 'Código'
                }
              },
              others: {
                label: {
                  date: 'Criado em'
                }
              }
            }
          },
          delete: {
						title: 'Exclusão de Grupo',
            notice: 'Você deseja realmente excluir este grupo?',
            warning: 'Esteja ciente de que esta ação é irreversível, portanto, analise-a cuidadosamente antes de continuar.',
            option: {
              cancel: 'Cancelar',
              confirm: 'Confirmar'
            }
          }
        }
      },
      notification: {
        register: 'Nota Fiscal emitida com sucesso.',
        update: 'O registro foi atualizado com sucesso.',
        delete: 'A nota Fiscal foi excluída com sucesso.',
        error: 'Houve um erro inesperado. Por favor, tente novamente.'
      },
      systemLog: {
        register: 'Registro de grupo.',
        update: 'Atualização de grupo.',
        delete: 'Exclusão de grupo.'
      },
      _common: {
        action: {
          create: { label: 'Criar' },
          read: { label: 'Visualizar' },
          update: { label: 'Editar' },
          delete: { label: 'Excluir' }
        },
        placeholder: {
          noData: {
            label: 'Nenhum grupo foi criado até o momento!'
          }
        }
      }
    },
    'en_US': {
      pageTitle: 'Groups',
      searchBar: {
        placeholder: 'Search..'
      },
      count: {
        label: [ 'Displaying', 'of' ]
      },
      block: {
        label: {
          code: 'Code',  
          members: 'Members'
        }
      },
      table: {
        label: {
          code: 'Code',
          name: 'Name',
          subject: 'Subject',
          members: 'Members',
          actions: 'Actions'
        }
      },
      modal: {
        help: {
          title: 'Help'
        },
        filters: {
          title: 'Filters'
        },
        action: {
          register: {
            type: {
              create: { title: 'Register Group' },
              update: { title: 'Group Editing' }
            },
            form: {
              field: {
                name: { label: 'Group Name' },
                subject: { label: 'Subject' },
                description: { label: 'Description' },
                members: {
                  label: 'Members',
                  content: {
                    code: 'Code'
                  },
                  placeholder: 'Select members for the group..'
                }
              },
              issues: {
                label: 'Attention!',
                message: {
                  requiredFields: 'Required fields are marked in red.',
                  fileSize: 'The selected image must be up to 2MB in size.',
                  membersSelection: 'Select at least one member.'                  
                }
              },
              button: {
                submit: 'Confirm'
              }
            },
            layer: {
              members: { title: 'Members' }
            }
          },
          read: {
            title: 'Group Details',
            section: {
              info: {
                label: {
                  code: 'Code'
                }
              },
              subject: {
                title: 'Subject'
              },
              description: {
                title: 'Description'
              },
              members: {
                title: 'Members',
                label: {
                  code: 'Code'
                }
              },
              others: {
                label: {
                  date: 'Created in'
                }
              }
            }
          },
          delete: {
						title: 'Group Exclusion',
            notice: 'Do you really want to delete this group?',
            warning: 'Be aware that this action is irreversible, so please review it carefully before proceeding.',
            option: {
              cancel: 'Cancel',
              confirm: 'Confirm'
            }
          }
        }
      },
      notification: {
        register: 'Fiscal note emitted successfully.',
        update: 'The fiscal note was updated successfully.',
        delete: 'The fiscal note deleted successfully.',
        error: 'There was an unexpected error. Please try again.'
      },
      systemLog: {
        register: 'Group registration.',
        update: 'Group update.',
        delete: 'Group exclusion.'
      },
      _common: {
        action: {
          create: { label: 'Create' },
          read: { label: 'View' },
          update: { label: 'Edit' },
          delete: { label: 'Delete' }
        },
        placeholder: {
          noData: {
            label: 'No groups have been created yet!'
          }
        }
      }
    }
  }

  public static get(language?: string) {
    return FiscalTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
