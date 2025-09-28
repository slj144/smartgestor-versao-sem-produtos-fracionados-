import { ProjectSettings } from "../../../../assets/settings/company-settings";

export class CarriersTranslate {

  private static obj = {
    'pt_BR': {
      pageTitle: 'Transportadoras',
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
              create: { title: 'Registro de Transportadora' },
              update: { title: 'Edição de Transportadora' }
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
                municipalInscription: "Inscrição Municipal",
                stateInscription: "Inscrição Estadual",
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
                  title: 'Registro de Transportadora',
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
						title: 'Detalhes do Transportadora',
						label: {
              municipalInscription: "Inscrição Municipal",
              stateInscription: "Inscrição Estadual",
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
						title: 'Exclusão de Transportadora',
            notice: 'Você deseja realmente excluir este transportadora?',
            warning: 'Esteja ciente de que esta ação é irreversível, portanto, analise-a cuidadosamente antes de continuar.',
            option: {
              cancel: 'Cancelar',
              confirm: 'Confirmar'
            }
          },
          others: {
            dataExport: {
              title: 'Exportação de Dados',
              fileName: 'Transportadoras',
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
        register: 'O transportadora foi registrado com sucesso.',
        update: 'O transportadora foi atualizado com sucesso.',
        delete: 'O transportadora foi excluído com sucesso.',
        error: 'Houve um erro inesperado. Por favor, tente novamente.'
      },
      systemLog: {
        register: 'Registro de transportadora.',
        update: 'Atualização de transportadora.',
        delete: 'Exclusão de transportadora.'
      }
    },
    'en_US': {
      pageTitle: 'Carriers',
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
              create: { title: 'Registrer Carrier' },
              update: { title: 'Carrier Editing' }
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
                municipalInscription: "Municipal Inscription",
                stateInscription: "State Inscription",
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
                  title: 'Carrier Registration',
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
						title: 'Carrier Details',
            municipalInscription: "Municipal Inscription",
            stateInscription: "State Inscription",
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
						title: 'Carrier Removal',
            notice: 'Do you really want to delete this carrier?',
            warning: 'Be aware that this action is irreversible, so please review it carefully before proceeding.',
            option: {
              cancel: 'Cancel',
              confirm: 'Confirm'
            }
          },
          others: {
            dataExport: { 
              title: 'Data Export',
              fileName: 'Carriers',
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
        register: 'The carrier was registered successfully.',
        update: 'The carrier was updated successfully.',
        delete: 'The carrier was deleted successfully.',
        error: 'There was an unexpected error. Please try again.'
      },
      systemLog: {
        register: 'Carrier registration.',
        update: 'Carrier update.',
        delete: 'Carrier exclusion.'
      }      
    }
  }

  public static get(language?: string) {
    return CarriersTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }
  
}