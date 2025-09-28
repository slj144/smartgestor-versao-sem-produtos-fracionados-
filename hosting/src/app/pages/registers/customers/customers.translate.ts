import { ProjectSettings } from "@assets/settings/company-settings";

export class CustomersTranslate {

  private static obj = {
    'pt_BR': {
      pageTitle: 'Clientes',
      table: {
        label: {
          code: 'Código',
          name: 'Nome',
          country: {
            brazil: {
              personalDocument: 'CPF',
              businessDocument: 'CNPJ',
              foreignerDocument: 'Número de Documento'
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
          title: 'Filtros',
          field: {
            code: {
              label: 'Código'
            },
            name: {
              label: 'Nome'
            },
            personalDocument: {
              label: 'CPF'
            },
            businessDocument: {
              label: 'CNPJ'
            },
            foreignerDocument: {
              label: 'Número de Documento',
            }
          }
        },
        action: {
          register: {
            type: {
              create: { title: 'Registro de Cliente' },
              update: { title: 'Edição de Cliente' }
            },
            form: {
              field: {
                type: {
                  label: 'Tipo',
                  option: {
                    naturalPerson: 'Pessoa Física',
                    legalPerson: 'Pessoa Jurídica'
                  },

                },
                document: {
                  brazil: {
                    personalDocument: {
                      label: 'CPF',
                      warning: '> Este CPF já está cadastrado.'
                    },
                    businessDocument: {
                      label: 'CNPJ',
                      warning: '> Este CNPJ já está cadastrado.'
                    },
                    foreignerDocument: {
                      label: 'Número de Documento',
                      warning: '> Este Documento já está cadastrado.'
                    }
                  },
                  others: {
                    title: 'Documento',
                    sub: {
                      type: 'Tipo',
                      value: 'Valor'
                    }
                  }
                },
                name: { label: 'Nome' },
                birthDate: { label: 'Data de Nascimento' },
                foreigner: { label: "Estrangeiro" },
                contact: {
                  label: 'Contatos',
                  sub: {
                    phone: { label: 'Telefone' },
                    email: { label: 'E-mail' }
                  }
                },
                address: {
                  label: 'Endereço',
                  sub: {
                    postalCode: {
                      label: 'CEP',
                      warning: '> O CEP não foi encontrado.'
                    },
                    local: { label: 'Logradouro' },
                    number: { label: 'Número' },
                    complement: { label: 'Complemento' },
                    neighborhood: { label: 'Bairro' },
                    city: { label: 'Cidade' },
                    state: { label: 'Estado' }
                  }
                },
                stateInscription: {
                  label: "Inscrição Estadual"
                },
                municipalInscription: {
                  label: "Inscrição Municipal"
                }
              },
              notification: {
                documentValidator: {
                  title: 'Validação de Documento',
                  status: {
                    error: 'Não foi possivel realizar a validação do documento. Por favor, tente novamente.',
                    invalidType: 'O tipo de documento informado não é valido.'
                  }
                }
              },
              issues: {
                label: 'Atenção!',
                message: {
                  invalidDocument: 'O documento inserido é inválido.',
                  invalidPostalCode: 'O CEP inserido é inválido.',
                  requiredFields: 'Os campos obrigatórios estão marcados em vermelho.',
                }
              },
              button: {
                submit: 'Confirmar'
              }
            }
          },
          read: {
            title: 'Detalhes do Cliente',
            label: {
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
            title: 'Exclusão de Cliente',
            notice: 'Você deseja realmente excluir este cliente?',
            warning: 'Esteja ciente de que esta ação é irreversível, portanto, analise-a cuidadosamente antes de continuar.',
            option: {
              cancel: 'Cancelar',
              confirm: 'Confirmar'
            }
          },
          others: {
            dataExport: {
              title: 'Exportação de Dados',
              fileName: 'Clientes',
              label: {
                title: 'Assistente de Exportação',
                info: [
                  'O assistente de exportação deve ser utilizado quando há a necessidade de obter os dados brutos dos clientes.',
                  'O processo de exportação pode demorar alguns minutos, tudo depende da sua conexão com a internet e também a quantidade de dados a serem baixados do banco de dados.'
                ],
                table: {
                  code: 'Código',
                  name: 'Nome',
                  personalDocument: 'CPF',
                  businessDocument: 'CNPJ',
                  foreignerDocument: "Número de Documento",
                  birthDate: 'Data de Nascimento',
                  address: 'Endereço',
                  phone: 'Telefone',
                  email: 'E-mail'
                },
                button: 'Iniciar Exportação'
              }
            },
            dataImport: {
              title: 'Importação de Dados',
              label: {
                title: 'Assistente de Importação',
                info: [
                  'Selecione uma planilha (.xlsx) com os dados dos clientes.',
                  'Serão importados apenas os campos presentes na planilha.'
                ],
                button: 'Importar Dados'
              }
            }
          }
        }
      },
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
      pageTitle: 'Customers',
      table: {
        label: {
          code: 'Code',
          name: 'Name',
          country: {
            brazil: {
              personalDocument: 'CPF',
              businessDocument: 'CNPJ',
              foreignerDocument: "Número de Documento"
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
          title: 'Filters',
          field: {
            code: {
              label: 'Code'
            },
            name: {
              label: 'Name'
            },
            personalDocument: {
              label: 'CPF'
            },
            businessDocument: {
              label: 'CNPJ'
            },
            foreignerDocument: {
              label: 'Número de Documento'
            }
          }
        },
        action: {
          register: {
            type: {
              create: { title: 'Registrer Customer' },
              update: { title: 'Customer Editing' }
            },
            form: {
              field: {
                type: {
                  label: 'Type',
                  option: {
                    naturalPerson: 'Natural Person',
                    legalPerson: 'Legal Person'
                  }
                },
                document: {
                  brazil: {
                    personalDocument: {
                      label: 'CPF',
                      warning: '> This CPF is already registered.'
                    },
                    businessDocument: {
                      label: 'CNPJ',
                      warning: '> This CNPJ is already registered.'
                    },
                    foreignerDocument: {
                      label: 'Document Number',
                      warning: '> this Document already registered.'
                    }
                  },
                  others: {
                    title: 'Document',
                    sub: {
                      type: 'Type',
                      value: 'Value'
                    }
                  }
                },
                name: { label: 'Name' },
                foreigner: { label: "Foreigner" },
                birthDate: { label: 'Birth Date' },
                contact: {
                  label: 'Contacts',
                  sub: {
                    phone: { label: 'Phone' },
                    email: { label: 'Email' }
                  }
                },
                address: {
                  label: 'Address',
                  sub: {
                    postalCode: {
                      label: 'Postal Code',
                      warning: '> The postal code was not found.'
                    },
                    local: { label: 'Local' },
                    number: { label: 'Number' },
                    complement: { label: 'Complement' },
                    neighborhood: { label: 'Neighborhood' },
                    city: { label: 'City' },
                    state: { label: 'State' }
                  }
                },
                stateInscription: {
                  label: "State Inscription"
                },
                municipalInscription: {
                  label: "Municipal Inscription"
                }
              },
              notification: {
                documentValidator: {
                  title: 'Document Validation',
                  status: {
                    error: 'It was not possible to validate the document. Please try again.',
                    invalidType: 'The type of document entered is not valid.'
                  }
                }
              },
              messages: {
                label: 'Attention!',
                issues: {
                  invalidDocument: 'The document entered is invalid.',
                  invalidPostalCode: 'The postal code entered is invalid.',
                  requiredFields: 'Mandatory fields are marked in red.'
                }
              },
              button: {
                submit: 'Confirm'
              }
            }
          },
          read: {
            title: 'Customer Details',
            label: {
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
            title: 'Customer Exclusion',
            notice: 'Do you really want to delete this customer?',
            warning: 'Be aware that this action is irreversible, so please review it carefully before proceeding.',
            option: {
              cancel: 'Cancel',
              confirm: 'Confirm'
            }
          },
          others: {
            dataExport: {
              title: 'Data Export',
              fileName: 'Customers',
              label: {
                title: 'Export Assistant',
                info: [
                  'The export wizard should be used when there is a need to obtain raw customer data.',
                  'The export process can take a few minutes, it all depends on your internet connection and also the amount of data to be downloaded from the database.'
                ],
                table: {
                  code: 'Code',
                  name: 'Name',
                  personalDocument: 'CPF',
                  businessDocument: 'CNPJ',
                  foreignerDocument: 'Número de Documento',
                  birthDate: 'Birth Date',
                  address: 'Address',
                  phone: 'Phone',
                  email: 'Email'
                },
                button: 'Start Export'
              }
            },
            dataImport: {
              title: 'Data Import',
              label: {
                title: 'Import Assistant',
                info: [
                  'Select an Excel (.xlsx) file with customer data.',
                  'Only the fields present in the file will be imported.'
                ],
                button: 'Start Import'
              }
            }
          }
        }
      },
      notification: {
        register: 'The customer was registered successfully.',
        update: 'The customer was updated successfully.',
        delete: 'The customer was deleted successfully.',
        error: 'There was an unexpected error. Please try again.'
      },
      systemLog: {
        register: 'Customer registration.',
        update: 'Customer update.',
        delete: 'Customer exclusion.'
      }
    }
  };

  public static get(language?: string) {
    return CustomersTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
