import { ProjectSettings } from "../../../../assets/settings/company-settings";

export class ProvidersTranslate {

  private static obj = {
    'pt_BR': {
      pageTitle: 'Fornecedores',
      table: {
        label: {
					code: 'Código',
					name: 'Nome',
          country: {
            brazil: {
              personalDocument: 'CPF',
              businessDocument: 'CNPJ',
            },
            others: {
              document: 'Documento'
            }
          },
          email: 'E-mail',
					phone: 'Telefone',
					actions: 'Ações'
        },
        action: {
          read: { title: 'Visualizar' },
          update: { title: 'Editar' },
          delete: { title: 'Excluir' }
        }
      },
      modal: {
        filters: {
          title: 'Filtros'
        },
        action: {
          register: {
            type: {
              create: { title: 'Registro de Fornecedor' },
              update: { title: 'Edição de Fornecedor' }
            },
            form: {
              label: {
                type: {
                  title: 'Tipo',
                  option: {
                    naturalPerson: 'Pessoa Física',
                    legalPerson: 'Pessoa Jurídica'
                  }
                },
                country: {
                  brazil: {
                    personalDocument: 'CPF',
                    businessDocument: 'CNPJ'
                  },
                  others: {
                    title: 'Documento',
                    sub: {
                      type: 'Tipo',
                      value: 'Valor'
                    }
                  }
                },
                name: 'Nome',
                description: 'Descrição',
                contact: {
                  title: 'Contatos',
                  sub: {
                    phone: 'Telefone',
                    email: 'E-mail'
                  }
                },
                address: {
                  title: 'Endereço',
                  sub: {
                    postalCode: 'CEP',
                    local: 'Logradouro',
                    number: 'Número',
                    complement: 'Complemento',
                    neighborhood: 'Bairro',
                    city: 'Cidade',
                    state: 'Estado'
                  }
                }
              },
              cepSearch: {
                notification: {
                  title: 'Registro de Fornecedor',
                  status: {
                    success: 'O CEP foi encotrado com sucesso.',
                    error: 'Confira o CEP e tente novamente.'
                  }
                }
              },
              notice: '* Os campos obrigatórios estão marcados em vermelho.',
              button: {
                submit: 'Confirmar'
              }
            }
          },
          read: {
						title: 'Detalhes do Fornecedor',
						label: {
              description: {
                title: 'Descrição'
              },
							address: {
								title: 'Endereço'
							},
							contact: {
								title: 'Contatos',
								sub: {
									email: 'E-mail',
									phone: 'Telefone'
								}
							}
						}
          },
          delete: {
						title: 'Exclusão de Fornecedor',
            notice: 'Você deseja realmente excluir este fornecedor?',
            warning: 'Esteja ciente de que esta ação é irreversível, portanto, analise-a cuidadosamente antes de continuar.',
            option: {
              cancel: 'Cancelar',
              confirm: 'Confirmar'
            }
          },
          others: {
            dataExport: {
              title: 'Exportação de Dados',
              fileName: 'Fornecedores',
              label: {
                title: 'Assistente de Exportação',
                info: [
                  'O assistente de exportação deve ser utilizado quando há a necessidade de obter os dados brutos dos fornecedores.',
                  'O processo de exportação pode demorar alguns minutos, tudo depende da sua conexão com a internet e também a quantidade de dados a serem baixados do banco de dados.'
                ],
                table: {
                  code: 'Código',
                  name: 'Nome',
                  personalDocument: 'CPF',
                  businessDocument: 'CNPJ',
                  address: 'Endereço',
                  phone: 'Telefone',
                  email: 'E-mail'
                },
                button: 'Iniciar Exportação'
              }
            }
          }
        }
      },
      notification: {
        register: 'O fornecedor foi registrado com sucesso.',
        update: 'O fornecedor foi atualizado com sucesso.',
        delete: 'O fornecedor foi excluído com sucesso.',
        error: 'Houve um erro inesperado. Por favor, tente novamente.'
      },
      systemLog: {
        register: 'Registro de fornecedor.',
        update: 'Atualização de fornecedor.',
        delete: 'Exclusão de fornecedor.'
      }
    },
    'en_US': {
      pageTitle: 'Providers',
      table: {
        label: {
					code: 'Code',
					name: 'Name',
          country: {
            brazil: {
              personalDocument: 'CPF',
              businessDocument: 'CNPJ',
            },
            others: {
              document: 'Document'
            }
          },
          email: 'Email',
					phone: 'Phone',
					actions: 'Actions'
        },
        action: {
					read: { title: 'View' },
          update: { title: 'Edit' },
          delete: { title: 'Delete' }
        }
      },
      modal: {
        filters: {
          title: 'Filters'
        },
        action: {
          register: {
            type: {
              create: { title: 'Register Provider' },
              update: { title: 'Provider Editing' }
            },
            form: {
              label: {
                type: {
                  title: 'Type',
                  option: {
                    naturalPerson: 'Natural Person',
                    legalPerson: 'Legal Person'
                  }
                },
                country: {
                  brazil: {
                    personalDocument: 'CPF',
                    businessDocument: 'CNPJ'
                  },
                  others: {
                    title: 'Document',
                    sub: {
                      type: 'Type',
                      value: 'Value'
                    }
                  }
                },
                name: 'Name',
                description: 'Description',
                contact: {
                  title: 'Contacts',
                  sub: {
                    phone: 'Phone',
                    email: 'Email'
                  }
                },
                address: {
                  title: 'Address',
                  sub: {
                    postalCode: 'Postal Code',
                    local: 'Local',
                    number: 'Number',
                    complement: 'Complement',
                    neighborhood: 'Neighborhood',
                    city: 'City',
                    state: 'State'
                  }
                }
              },
              cepSearch: {
                notification: {
                  title: 'Provider Registration',
                  status: {
                    success: 'The zip code was found successfully.',
                    error: 'Check the zip code and try again.'
                  }
                }
              },
              notice: '* Mandatory fields are marked in red.',
              button: {
                submit: 'Confirm'
              }
            }
          },
          read: {
						title: 'Provider Details',
						label: {
              description: {
                title: 'Description'
              },
							address: {
								title: 'Address'
							},
							contact: {
								title: 'Contacts',
								sub: {
									email: 'Email',
									phone: 'Phone'
								}
							}
						}
          },          
          delete: {
						title: 'Provider Removal',
            notice: 'Do you really want to delete this provider?',
            warning: 'Be aware that this action is irreversible, so please review it carefully before proceeding.',
            option: {
              cancel: 'Cancel',
              confirm: 'Confirm'
            }
          },
          others: {
            dataExport: { 
              title: 'Data Export',
              fileName: 'Providers',
              label: {
                title: 'Export Assistant',
                info: [
                  'The export wizard should be used when there is a need to obtain raw provider data.',
                  'The export process can take a few minutes, it all depends on your internet connection and also the amount of data to be downloaded from the database.'
                ],
                table: {
                  code: 'Code',
                  name: 'Name',
                  personalDocument: 'CPF',
                  businessDocument: 'CNPJ',
                  address: 'Address',
                  phone: 'Phone',
                  email: 'Email'
                },
                button: 'Start Export'
              }
            }
          }
        }
      },
      notification: {
        register: 'The provider was registered successfully.',
        update: 'The provider was updated successfully.',
        delete: 'The provider was deleted successfully.',
        error: 'There was an unexpected error. Please try again.'
      },
      systemLog: {
        register: 'Provider registration.',
        update: 'Provider update.',
        delete: 'Provider exclusion.'
      }      
    }
  }

  public static get(language?: string) {
    return ProvidersTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
