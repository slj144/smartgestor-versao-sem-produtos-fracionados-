// collaborators.translate.ts
// LOCALIZAÇÃO: Mesmo local do arquivo original
// FUNÇÃO: Arquivo de traduções do sistema incluindo o CRM

import { ProjectSettings } from "@assets/settings/company-settings";

export class CollaboratorsTranslate {
  private static data = {
    pt_BR: {
      titles: {
        main: "Colaboradores",
        nodataPlaceholder: "Não há dados a serem listados.",
      },
      mainModal: {
        viewTitle: "Detalhes do colaborador",
        addTitle: "Adicionar colaborador",
        editTitle: "Editar colaborador",
        deleteTitle: "Deletar colaborador",
        collaboratorProfilesTitle: "Prefis de colaborador",
        helpTitle: "Ajuda",
        filtersTitle: "Filters",

        permissions: {
          title: "PERMISSÔES",
          sections: "Seções",
          actions: "Ações",
          fields: "Campos",
          widgets: "Widgets"
        },

        decision: {
          yes: "Sim",
          no: "Não"
        },

        requestNewPassword: "Requisitar nova senha",
        admin: "ADMINISTRADOR",
        actions: "Ações",
        userAccount: "Conta de usuário",
        systemAccess: "Acceso ao sistema",
        name: "Nome",
        email: "Email",
        user: "Usuário",
        allowAccess: "Permitir acesso ao sistema",
        isSendEmailToStore: "Receber emails pelo email da loja",
        usertype: "Tipo de usuário",
        code: "Código",
        address: {
          title: "Endereço",
          addressLine: "Logradouro",
          postalCode: "CEP",
          state: "Estado",
          city: "Cidade",
          district: "Bairro",
          complement: "Complemento",
          number: "Número"
        },


        contacts: {
          title: "Contatos",
          phone: "Telefone",
          whatsapp: "whatsapp",
          email: "E-mail",
        },

        providerRemoveConfirmation: "Você deseja realmente remover esta empresa parceira?",
        confirm: "Confirmar",
        cancel: "Cancelar",
        mandatoryFields: "* Os campos em vermelho são obrigatórios."
      },
      profilesModal: {
        viewTitle: "Detalhes do perfil de colaborador",
        addTitle: "Adicionar perfil de colaborador",
        editTitle: "Editar perfil de colaborador",
        deleteTitle: "Deletar perfil colaborador",
        collaboratorProfilesTitle: "Prefis de colaborador",
        helpTitle: "Ajuda",
        filtersTitle: "Filters",

        decision: {
          yes: "Sim",
          no: "Não"
        },

        code: "Código",
        actions: "Ações",
        name: "Nome",
        email: "Email",
        cloneProfile: "Clonar Perfil",
        permissions: "Permissões",
        profileName: "Nome do Perfil",
        profileRemoveConfirmation: "Você deseja realmente deletar o perfil ",
        confirm: "Confirmar",
        cancel: "Cancelar",
        mandatoryFields: "* Os campos em vermelho são obrigatórios."
      },
        permissions: {
          actions: {
          "add": "Adicionar",
          "edit": "Editar",
          "accept": "Aceitar",
          "cancel": 'Cancelar',
          "delete": "Deletar",
          "view": "Visualizar",
          "cancelSales": "Cancelar Vendas",
          "closeCashier": "Fechar Caixa",
          "openCashier": "Abrir Caixa",
          "changeOperator": "Alterar Operador",
          "duplicateSales": "Duplicar Vendas",
          "applyDiscount": "Aplicar Desconto",
          "applyTax": "Aplicar Taxa",
          // Novas ações para Registros de Caixa
          "viewAll": "Ver todas as vendas (Registros)",
          "editSales": "Editar vendas (Registros)",
          "closeSales": "Fechar/Cancelar vendas (Registros)",
          "cashierResume": "Resumo de Caixa",
          "editPrice": "Editar Preço",
          "editServiceCostPrice": "Editar Preço de Custo de Serviço",
          "filterDataPerOperator": "Filtrar Dados Por Operador",
          "downloadReport": "Baixar Relatório",
          "filterPersonalized": "Filtro Personalizado",
          "filterWeek": "Filtro Semanal",
          "filterMonth": "Filtro Mensal",
          "filterLastMonth": "Filtro Mês Anterior",
          "filterPerProducts": "Filtro por Produtos",
          "filterPerCategory": "Filtro por Categoria",
          "filterPerProvider": "Filtro por Fornecedor"
        },
        dashboard: {
          counters: {
            fields: { "customers": "Clientes Registrados", "products": "Produtos Registrados" }
          },
          cashierResume: {
            fields: { "revenue": "Receita", "sales": "Vendas", "inputs": "Entradas", "outputs": "Saídas", "costs": "Custos" }
          },
          topProducts: {
            fields: {}
          },
          requests: {
            fields: {}
          },
          stockAlert: {
            fields: {}
          },
          serviceOrders: {
            fields: {}
          },
          billsToPay: {
            fields: {}
          },
          billsToReceive: {
            fields: {}
          }
        },
        cashier: {
          cashierFront: {
            actions: { "cancelSales": "Cancelar Vendas", },
            fields: { "showOpeningValue": "Mostrar Valor de Abertura", "editOpeningValue": "Editar Valor de Abertura" },
            sections: { "inputs": "Entradas", "outputs": "Saidas", "sales": "Vendas" }
          },
          cashierRegisters: {
            actions: {},
            fields: { filterDataPerOperator: "Filtrar Dados Por Operador" },
            sections: { "inputs": "Entradas", "outputs": "Saidas", "sales": "Vendas" }
          }
        },
        registers: {
          collaborators: {
            sections: { collaboratorProfiles: "Perfis de colaboradores" }
          }
        },
        stock: {
          products: {
            fields: { "code": "Código", "name": "Nome", "salePrice": "Preço de venda", "costPrice": "Preço de custo", "quantity": "Quantidade", "alert": "Alerta", "category": "Categoria", "type": "Tipo", "thumbnail": "Thumbnail" },
            sections: { "stockAdjustment": "Ajuste de Estoque", "generateTickets": "Generação de Etiquetas", "dataImport": "Importação de Dados" }
          },
          transfers: {
            fields: { costPrice: "Preço de custo" }
          }
        },
        // CORREÇÃO: ADICIONADO CRM COM ANIVERSÁRIOS
        crm: {
          title: 'CRM - Gestão de Relacionamento',
          leads: {
            actions: {
              add: 'Adicionar Lead',
              edit: 'Editar Lead',
              delete: 'Excluir Lead',
              view: 'Visualizar Leads'
            },
            fields: {
              value: 'Valor do Lead',
              notes: 'Anotações',
              assignedTo: 'Responsável'
            }
          },
          activities: {
            actions: {
              add: 'Adicionar Atividade',
              edit: 'Editar Atividade',
              delete: 'Excluir Atividade',
              view: 'Visualizar Atividades'
            },
            fields: {
              description: 'Descrição',
              scheduledDate: 'Data Agendada',
              priority: 'Prioridade'
            }
          },
          pipeline: {
            actions: {
              view: 'Visualizar Pipeline',
              edit: 'Editar Pipeline'
            },
            fields: {}
          },
          dashboard: {
            actions: {
              view: 'Visualizar Dashboard CRM'
            },
            fields: {}
          },
          aniversarios: {
            actions: {
              view: 'Visualizar Aniversários',
              send: 'Enviar Mensagens'
            },
            fields: {
              customerData: 'Dados do Cliente',
              phoneNumber: 'Número do WhatsApp'
            }
          }
        },
        reports: {
          cashier: {
            sections: {
              resume: {
                default: {
                  fields: {
                    "sales": "Valor de Vendas",
                    "inputs": "Valor de Entradas",
                    "outputs": "Valor de Saídas",
                    "servicesCosts": "Custos de Serviços",
                    "productsCosts": "Custos de Produtos",
                    "paymentsCosts": "Custos de Pagamentos",
                    "totalCosts": "Total de Custo",
                    "partialRevenue": "Receita Parcial",
                    "commission": "Comissão",
                    "finalRevenue": "Receita Final",
                  }
                }
              },
              sales: {
                salesReportSynthetic: {
                  fields: {
                    "number": "Número de Vendas",
                    "billed": "Vendas Faturadas",
                    "salesTotal": "Valor de Vendas",
                    "servicesCosts": "Custo de Serviços",
                    "productsCosts": "Custo de Produtos",
                    "paymentsCosts": "Custo de Pagamentos",
                    "totalCosts": "Total de Custos",
                    "totalUnbilled": "Total Não Faturado",
                    "partialRevenue": "Receita Parcial",
                    "commission": "Comissão",
                    "finalRevenue": "Receita Final",
                  },
                },
                salesReportAnalytical: {
                  fields: {
                    "serviceCode": "Referência de OS",
                    "customer": "Cliente",
                    "collaborator": "Colaborador",
                    "services": "Serviços",
                    "products": "Produtos",
                    "paymentMethods": "Meios de Pagamento",
                    "discount": "Desconto",
                    "fee": "Taxa",
                    "additional": "Adicional",
                    "saleValue": "Valor de Venda",
                    "unbilledValue": "Valor Não Faturado",
                    "servicesCosts": "Custo de Serviços",
                    "productsCosts": "Custo de Produtos",
                    "paymentsCosts": "Custo de Pagamento",
                    "totalCosts": "Total de Custos",
                    "partialRevenue": "Receita Parcial",
                    "finalRevenue": "Receita Final",
                    "commission": "Comissão"
                  }
                },
                paymentMethodsSynthetic: {
                  fields: {
                    "paymentMethod": "Meio de Pagamento",
                    "cost": "Custo",
                    "value": "Valor",
                    "revenue": "Receita"
                  }
                },
                paymentMethodsAnalytical: {
                  fields: {
                    "saleCode": "Referência de Venda",
                    "paymentMethod": "Meio de Pagamento",
                    "note": "Observação",
                    "fee": "Taxa",
                    "cost": "Custo",
                    "value": "Valor",
                    "revenue": "Receita"
                  }
                },
                salesPerUserSynthetic: {
                  fields: {}
                },
                salesPerUserAnalytical: {
                  fields: {}
                }
              },
              inflows: {
                inflowsReportSynthetic: {
                  fields: {
                    "outputsQuantity": "Quantidade de Entradas",
                    "total": "Total"
                  }
                },
                inflowsReportAnalytical: {
                  fields: {
                    "code": "Código",
                    "referenceCode": "Código de Referência",
                    "collaborator": "Colaborador",
                    "category": "Categoria",
                    "note": "Observação",
                    "value": "Valor"
                  }
                }
              },
              outflows: {
                outflowsReportSynthetic: {
                  fields: {
                    "outputsQuantity": "Número de Saídas",
                    "total": "Total de Saídas"
                  }
                },
                outflowsReportAnalytical: {
                  fields: {
                    "code": "Código",
                    "referenceCode": "Código de Referência",
                    "collaborator": "Colaborador",
                    "category": "Categoria",
                    "note": "Observação",
                    "value": "Valor"
                  }
                }
              },
              afterSales: {
                default: {
                  fields: {
                    "saleCode": "Referência de Venda",
                    "serviceCode": "Referência de OS",
                    "customer": "Cliente",
                    "collaborator": "Colaborador",
                    "phone": "Telefone",
                    "email": "Email",
                    "services": "Serviços",
                    "products": "Produtos",
                    "value": "Valor"
                  }
                }
              }
            }
          },
          servicesOrders: {
            sections: {
              resume: {
                default: {
                  fields: {
                    "servicesCosts": "Custo dos Serviços",
                    "productsCosts": "Custo dos Produtos",
                    "totalCosts": "Total de Custos",
                    "partialRevenue": "Receita Parcial",
                    "finalRevenue": "Receita Final"
                  }
                }
              },
              internal: {
                servicesInternalReportSynthetic: {
                  fields: {
                    "servicesCosts": "Custo dos Serviços",
                    "productsCosts": "Custo dos Produtos",
                    "totalCosts": "Total de Custos",
                    "partialRevenue": "Receita Parcial",
                    "finalRevenue": "Receita Final"
                  }
                },
                servicesInternalReportAnalytical: {
                  fields: {
                    "customer": "Cliente",
                    "collaborator": "Colaborador",
                    "services": "Serviços",
                    "products": "Produtos",
                    "discount": "Desconto",
                    "fee": "Taxa",
                    "servicesCosts": "Custo dos Serviços",
                    "productsCosts": "Custo dos Produtos",
                    "totalCosts": "Total de Custos",
                    "partialRevenue": "Receita Parcial",
                    "finalRevenue": "Receita Final"
                  }
                }
              },
              external: {
                servicesExternalReportSynthetic: {
                  fields: {
                    "servicesCosts": "Custo dos Serviços",
                    "productsCosts": "Custo dos Produtos",
                    "totalCosts": "Total de Custos",
                    "partialRevenue": "Receita Parcial",
                    "finalRevenue": "Receita Final"
                  }
                },
                servicesExternalReportAnalytical: {
                  fields: {
                    "customer": "Cliente",
                    "collaborator": "Colaborador",
                    "services": "Serviços",
                    "products": "Produtos",
                    "discount": "Desconto",
                    "fee": "Taxa",
                    "servicesCosts": "Custo dos Serviços",
                    "productsCosts": "Custo dos Produtos",
                    "totalCosts": "Total de Custo",
                    "partialRevenue": "Receita Parcial",
                    "finalRevenue": "Receita Final"
                  }
                }
              },
              curveABC: {
                default: {
                  fields: {
                    "averageCost": "Custo Médio",
                    "averagePrice": "Preço Médio",
                    "revenue": "Faturamento"
                  }
                }
              }
            }
          },
          stock: {
            sections: {
              products: {
                default: {
                  fields: {
                    "category": "Categoria",
                    "commercialUnit": "Unidade Comercial",
                    "provider": "Fornecedor",
                    "quantity": "Quantidade",
                    "alert": "Alerta",
                    "costPrice": "Preço de Custo",
                    "salePrice": "Preço de Venda",
                    "totalCost": "Total de Custo",
                    "totalSale": "Total de Venda",
                    "contributionMargin": "Margem de Contribuição"
                  }
                }
              },
              purchases: {
                completedPurchases: {
                  fields: {
                    "provider": "Fornecedor",
                    "products": "Produtos",
                    "purchaseAmount": "Valor da Compra",
                    "totalCost": "Total de Custo",
                    "totalSale": "Total de Venda",
                    "contributionMargin": "Margem de Contribuição"
                  }
                },
                pendingPurchases: {
                  fields: {
                    "provider": "Fornecedor",
                    "products": "Produtos",
                    "purchaseAmount": "Valor da Compra",
                    "totalCost": "Total de Custo",
                    "totalSale": "Total de Venda",
                    "contributionMargin": "Margem de Contribuição"
                  }
                },
                purchasedProducts: {
                  fields: {
                    "provider": "Fornecedor",
                    "category": "Categoria",
                    "quantity": "Quantidade",
                    "costPrice": "Preço de Custo",
                    "salePrice": "Preço de Venda",
                    "totalCost": "Total de Custo",
                    "totalSale": "Total de Venda",
                    "contributionMargin": "Margem de Contribuição"
                  }
                }
              },
              transfers: {
                completedTransfers: {
                  fields: {
                    "origin": "Origem",
                    "destination": "Destino",
                    "products": "Produtos",
                    "totalCost": "Total de Custo",
                    "totalSale": "Total de Venda",
                    "transferAmount": "Valor da Transferência"
                  }
                },
                pendingTransfers: {
                  fields: {
                    "origin": "Origem",
                    "destination": "Destino",
                    "products": "Produtos",
                    "totalCost": "Total de Custo",
                    "totalSale": "Total de Venda",
                    "transferAmount": "Valor da Transferência"
                  }
                },
                transferedProducts: {
                  fields: {
                    "origin": "Origem",
                    "destination": "Destino",
                    "name": "'Nome",
                    "category": "Categoria",
                    "quantity": "Quantidade",
                    "costPrice": "Preço de Custo",
                    "salePrice": "Preço de Venda",
                    "totalCost": "Total de Custo",
                    "totalSale": "Total de Venda"
                  }
                }
              },
              stockLogs: {
                default: {
                  fields: {
                    "productCode": "Referência de Produto",
                    "collaborator": "Colaborador",
                    "type": "Tipo",
                    "note": "Nota",
                    "operation": "Quantidade",
                    "quantity": "Operação",
                    "action": "Ação"
                  }
                }
              },
              curveABC: {
                default: {
                  fields: {
                    "averageCost": "Custo Médio",
                    "averagePrice": "Preço Médio",
                    "revenue": "Faturamento"
                  }
                }
              }
            }
          },
          financial: {
            sections: {
              cashFlow: {
                default: {
                  fields: {}
                }
              },
              billsToPay: {
                default: {
                  fields: {}
                }
              },
              billsToReceive: {
                default: {
                  fields: {}
                }
              },
              bankTransactions: {
                default: {
                  fields: {}
                }
              }
            }
          },
          several: {
            sections: {
              systemLogs: {
                default: {
                  fields: {
                    "code": "Código",
                    "referenceCode": "Código de Referência",
                    "collaborator": "Colaborador",
                    "origin": "Origem",
                    "description": "Descrição",
                    "action": "Ação"
                  }
                }
              },
            }
          }
        },
        settings: {
          sections: { "general": "Geral", "cashier": "Caixa", "servicesOrders": "Ordens de serviços" }
        },
        _reports: {
          sections: {
            "cashier": "Caixa",
            "stock": "Estoque",
            "servicesOrders": "Ordens de serviço",
            "financial": "Financeiro",
            "several": "Diversos"
          },
          subSections: {
            "resume": "Resumo",

            "sales": "Vendas",
            "inflows": "Entradas",
            "outflows": "Saídas",
            "afterSales": "Pós-Vendas",
            "historic": "Histórico",

            "internal": "Internas",
            "external": "Externas",

            "products": "Produtos",
            "purchases": "Compras",
            "transfers": "Transferêcias",
            "stockLogs": "Movimentação de Estoque",

            "curveABC": "Curva ABC",

            "cashFlow": "Fluxo de caixa",
            "billsToPay": "Contas a pagar",
            "billsToReceive": "Contas a receber",
            "bankTransactions": "Transações Bancárias",

            "systemLogs": "Logs do sistema"
          },
          types: {
            "resume": "Resumo",
            "default": "Padrão",

            "salesReportSynthetic": "Relatório de Vendas (Sintético)",
            "salesReportAnalytical": "Relatório de Vendas (Analítico)",
            "paymentMethodsSynthetic": "Relatório de Meios de Pagamento (Sintético)",
            "paymentMethodsAnalytical": "Relatório de Meios de Pagamento (Analítico)",

            "salesPerUserSynthetic": "Vendas por Usuário (Sintético)",
            "salesPerUserAnalytical": "Vendas por Usuário (Analítico)",

            "inflowsReportSynthetic": "Relatório de Entradas (Sintético)",
            "inflowsReportAnalytical": "Relatório de Entradas (Analítico)",

            "outflowsReportSynthetic": "Relatório de Saídas (Sintético)",
            "outflowsReportAnalytical": "Relatório de Saídas (Analítico)",

            "servicesInternalReportSynthetic": "Relatório Sintético",
            "servicesInternalReportAnalytical": "Relatório Analítico",

            "servicesExternalReportSynthetic": "Relatório Sintético",
            "servicesExternalReportAnalytical": "Relatório Analítico",

            "completedPurchases": "Compras Concluidas",
            "pendingPurchases": "Compras Pendentes",
            "purchasedProducts": "Produtos Comprados",

            "completedTransfers": "Transferências Concluídas",
            "pendingTransfers": "Transferências Pendentes",
            "transferedProducts": "Produtos Transferidos",

            "paidAccounts": "Contas Pagas",
            "receivedAccounts": "Contas Recebidas",
            "pendentAccounts": "Contas Pendentes",
            "expireAccounts": "Contas Vencidas"
          }
        }
      },
      pages: {
        // Dashboard and widgets

        dashboard: "Dashboard",
        counters: "Contadores",
        bestSellers: "Top Produtos Mais Vendidos",
        stockAlert: "Alerta de Estoque",
        cashierResume: "Resumo de Caixa",

        // Cashier

        cashier: "Caixa",
        cashierFront: "Frente de Caixa",
        cashierRegisters: "Registros de Caixa",

        // CORREÇÃO: ADICIONADO CRM
        crm: "CRM",
        leads: "Leads",
        activities: "Atividades",
        pipeline: "Pipeline",

        requests: "Pedidos",

        serviceOrders: "Ordens de Serviços",

        socialDemands: "Demandas Sociais",
        projects: "Projetos",
        crafts: "Oficios",
        groups: "Grupos",
        classrooms: "Classes",
        tithes: "Dízimos",
        donations: "Doações",
        agenda: "Agenda",
        events: "Eventos",
        kitchen: "Cozinha",
        menu: "Cardápio",

        stock: "Estoque",
        products: "Produtos",
        purchases: "Compras",
        transfers: "Transferências",

        registers: "Registros",
        customers: "Clientes",
        members: "Membros",
        voters: "Eleitores",
        collaboratorProfiles: "Perfis de Colaboradores",
        collaborators: "Colaboradores",
        providers: "Fornecedores",
        carriers: "Transportadoras",
        services: "Serviços",
        partners: "Parceiros",
        branches: "Filiais",
        payments: "Pagamentos",
        paymentMethods: "Meios de Pagamentos",

        financial: "Financeiro",
        billsToPay: "Contas A Pagar",
        billsToReceive: "Contas A Receber",
        bankAccounts: "Contas Bancárias",

        fiscal: "Notas Fiscais",
        reports: "Relatórios",
        store: "Loja",
        settings: "Configurações",

        informations: 'Infomações'
      },
      notifications: {
        registerCollaboratorWithSuccess: "Colaborador registrada com sucesso.",
        registerCollaboratorWithError: "Ocorreu um erro inesperado. Não foi possivel registrar o Colaborador.",
        updateCollaboratorWithSuccess: "Colaborador atualizado com sucesso.",
        updateCollaboratorWithError: "Ocorreu um erro inesperado. Não foi possivel atualizar o Colaborador.",
        deleteCollaboratorWithSuccess: "Colaborador removida com sucesso.",
        deleteCollaboratorWithError: "Ocorreu um erro inesperado. Não foi possivel remover o Colaborador.",

        registerCollaboratorProfileWithSuccess: "Perfil de colaboraor criado com scuesso.",
        registerCollaboratorProfileWithError: "Ocorreu um erro inesperado. Não foi possivel criar o perfil de colaborador.",
        updateCollaboratorProfileWithSuccess: "Perfil de colaborador atualizado com sucesso.",
        updateCollaboratorProfileWithError: "Ocorreu um erro inesperado. Não foi possivel atualizar o perfil de colaborador.",

        registerLimit: "O limite de registro de collaboradores com acesso ao sistema foi atingido.",
        credentialsSendedWithSuccess: (email: string) => { return `Email enviado para ${email} com as credênciais de login.` },
        credentialsSendedWithError: "Algo deu errado ao enviar email com as credênciais de login.",

        email: {
          title: "Credenciais de Login",
          message: (email: string) => { return "A mesma senha cadastrada anteriormente com esse email " + email },
          yourCredentials: "SUAS CREDÊNCIAIS DE LOGIN"
        },

        lockedAccess: {
          title: "Acesso Bloqueado",
          description: "Seu usuário foi bloqueado. Em 10 segundos você será deslogado."
        },

        requestPassword: {
          success: (email: string) => { return `Verifique o email ${email} e acesse o link para redefinir sua senha.` },
          error: "Erro ao requisitar nova senha."
        }
      },
      systemLogNotes: {
        registerOS: "Criação de ordem de colaborador.",
        deleteOS: "Deleção de colaborador.",
        updateOS: "Atualização de ordem de colaborador.",
      },
    },
    en_US: {
      titles: {
        main: "Collaborators",
        nodataPlaceholder: "There is no data to list.",
      },
      mainModal: {
        viewTitle: "Collaborator Details",
        addTitle: "Add Collaborator",
        editTitle: "Edit Collaborator",
        deleteTitle: "Delete Collaborator",
        collaboratorProfilesTitle: "Collaborator Profiles",
        helpTitle: "Help",
        filtersTitle: "Filters",

        permissions: {
          title: "PERMISSIONS",
          sections: "Sections",
          actions: "Actions",
          fields: "Fields",
          widgets: "Widgets"
        },

        decision: {
          yes: "Yes",
          no: "No"
        },

        requestNewPassword: "Request new password",
        admin: "ADMINISTRATOR",
        userAccount: "User Account",
        actions: "Actions",
        code: "Code",
        name: "Name",
        email: "Email",
        user: "User",
        systemAccess: "System Access",
        isSendEmailToStore: "Receive emails for store email",
        allowAccess: "Allow access to the system",
        usertype: "User type",

        address: {
          title: "Address",
          addressLine: "Address Line",
          postalCode: "PostalCode",
          state: "State",
          city: "City",
          district: "District",
          complement: "Complement",
          number: "Number"
        },

        contacts: {
          title: "Contacts",
          phone: "Phone",
          email: "E-mail",
          whatsapp: "whatsapp"
        },

        providerRemoveConfirmation: "Do you really want to remove this Partner Company?",
        confirm: "Confirm",
        cancel: "Cancel",
        mandatoryFields: "* The red fields are mandatory."
      },
      profilesModal: {
        viewTitle: "Collaborator Profile Details",
        addTitle: "Add Collaborator Profile",
        editTitle: "Edit Collaborator Profile",
        deleteTitle: "Delete Collaborator Profile",
        collaboratorProfilesTitle: "Collaborator Profiles",
        helpTitle: "Help",
        filtersTitle: "Filters",

        decision: {
          yes: "Yes",
          no: "No"
        },

        actions: "Actions",
        code: "Code",
        name: "Name",
        email: "Email",

        cloneProfile: "Clone Profile",
        permissions: "Permissions",
        profileName: "Profile Name",
        profileRemoveConfirmation: "Do you really want to remove the profile ",
        confirm: "Confirm",
        cancel: "Cancel",
        mandatoryFields: "* The red fields are mandatory."
      },
      permissions: {
        actions: {
          "add": "Add",
          "edit": "Edit",
          "accept": "Accept",
          "cancel": 'Cancel',
          "delete": "Delete",
          "view": "View",
          "cancelSales": "Cancel Sales",
          "closeCashier": "Close Cash",
          "openCashier": "Open Cash",
          "changeOperator": "Change Operator",
          "duplicateSales": "Duplicate Sales",
          "applyDiscount": "Apply Discount",
          "applyTax": "Apply Tax",
          "cashierResume": "Cashier Resume",
          "editPrice": "Edit Price",
          "editServiceCostPrice": "Edit Service Cost Price",
          "filterDataPerOperator": "Filtrar Dados Por Operador",
          "downloadReport": "Donwload Report",
          "filterPersonalized": "Filter Personalized",
          "filterPerProducts": "Filter Per Products",
          "filterPerCategory": "Filter Per Category",
          "filterPerProvider": "Filter Per Provider",
          "filterWeek": "Filter Week",
          "filterMonth": "Filter Month",
          "filterLastMonth": "Filter Last Month",
        },
        dashboard: {
          customers: {
            fields: { "customers": "Clientes Registrados", "products": "Produtos Registrados" }
          },
          cashierResume: {
            fields: {
              "revenue": "Revenue", "sales": "Sales", "inputs": "Inputs", "outputs": "Outputs", "costs": "Costs"
            }
          },
          requests: {
            fields: {}
          },
          stockAlert: {
            fields: {}
          },
          serviceOrders: {
            fields: {}
          },
          billsToPay: {
            fields: {}
          },
          billsToReceive: {
            fields: {}
          }
        },
        cashier: {
          cashierFront: {
            actions: {
              "cancelSales": "Cancelar Vendas",
              "duplicateSales": "Duplicar Vendas"
            },
            fields: { showOpeningValue: "Mostrar Valor de Abertura", "editOpeningValue": "Editar Valor de Abertura" },
            sections: {
              "inputs": "Inputs",
              "outputs": "Outputs",
              "sales": "Sales"
            }
          },
          cashierRegisters: {
            actions: {},
            fields: {
              filterByOperator: "Filtrar Dados Por Operador"
            },
            sections: {
              "inputs": "Inputs",
              "outputs": "Outputs",
              "sales": "Sales"
            }
          }
        },
        stock: {
          products: {
            fields: {
              "code": "Code",
              "name": "Name",
              "salePrice": "Sale price",
              "costPrice": "Cost price",
              "quantity": "Quantity",
              "alert": "Alert",
              "category": "Category",
              "commercialUnit": "Commercial Unit",
              "thumbnail": "Thumbnail"
            },
            sections: {
              "stockAdjustment": "Stock Adjustment",
              "generateTickets": "Generate Tickets",
              "dataImport": "Data Import"
            }
          },
          transfers: {
            fields: { costPrice: "Cost Price" }
          }
        },
        registers: {
          collaborators: {
            sections: {
              collaboratorProfiles: "Employee Profiles"
            }
          }
        },
        // CORREÇÃO: ADICIONADO CRM EM INGLÊS
        crm: {
          title: 'CRM - Customer Relationship Management',
          leads: {
            actions: {
              add: 'Add Lead',
              edit: 'Edit Lead',
              delete: 'Delete Lead',
              view: 'View Leads'
            },
            fields: {
              value: 'Lead Value',
              notes: 'Notes',
              assignedTo: 'Assigned To'
            }
          },
          activities: {
            actions: {
              add: 'Add Activity',
              edit: 'Edit Activity',
              delete: 'Delete Activity',
              view: 'View Activities'
            },
            fields: {
              description: 'Description',
              scheduledDate: 'Scheduled Date',
              priority: 'Priority'
            }
          },
          pipeline: {
            actions: {
              view: 'View Pipeline',
              edit: 'Edit Pipeline'
            },
            fields: {}
          },
          dashboard: {
            actions: {
              view: 'View CRM Dashboard'
            },
            fields: {}
          }
        },
        reports: {
          cashier: {
            sections: {
              resume: {
                default: {
                  fields: {
                    "sales": "Sales Value",
                    "inputs": "Input Value",
                    "outputs": "Output Value",
                    "servicesCosts": "Services Costs",
                    "productsCosts": "Product Costs",
                    "paymentsCosts": "Payments Costs",
                    "totalCosts": "Total Cost",
                    "partialRevenue": "Partial Revenue",
                    "finalRevenue": "Final Recipe",
                  }
                }
              },
              sales: {
                salesReportSynthetic: {
                  fields: {
                    "number": "Sales Number",
                    "billed": "Sales Billed",
                    "salesTotal": "Sales Value",
                    "servicesCosts": "Cost of Services",
                    "productsCosts": "Products Cost",
                    "paymentsCosts": "Payments Cost",
                    "totalCosts": "Total Costs",
                    "totalUnbilled": "Total Unbilled",
                    "partialRevenue": "Partial Revenue",
                    "commission": "Commission",
                    "finalRevenue": "Final Recipe",
                  },
                },
                salesReportAnalytical: {
                  fields: {
                    "serviceCode": "OS Reference",
                    "customer": "Customer",
                    "collaborator": "Collaborator",
                    "services": "Services",
                    "products": "Products",
                    "paymentMethods": "Payment Methods",
                    "discount": "Discount",
                    "fee": "Fee",
                    "additional": "Additional",
                    "saleValue": "Sale Value",
                    "unbilledValue": "Unbilled Value",
                    "servicesCosts": "Cost of Services",
                    "productsCosts": "Products Cost",
                    "paymentsCosts": "Payment Cost",
                    "totalCosts": "Total Costs",
                    "partialRevenue": "Partial Revenue",
                    "finalRevenue": "Final Recipe"
                  }
                },
                paymentMethodsSynthetic: {
                  fields: {
                    "paymentMethod": "Payment Method",
                    "cost": "Cost",
                    "value": "Value",
                    "revenue": "Revenue"
                  }
                },
                paymentMethodsAnalytical: {
                  fields: {
                    "saleCode": "Sales Reference",
                    "paymentMethod": "Payment Method",
                    "note": "Note",
                    "fee": "Fee",
                    "cost": "Cost",
                    "value": "Value",
                    "revenue": "Revenue"
                  }
                },
                salesPerUserSynthetic: {
                  fields: {}
                },
                salesPerUserAnalytical: {
                  fields: {}
                }
              },
              inflows: {
                inflowsReportSynthetic: {
                  fields: {
                    "outputsQuantity": "Amount of Inputs",
                    "total": "Total"
                  }
                },
                inflowsReportAnalytical: {
                  fields: {
                    "code": "Code",
                    "referenceCode": "ReferenceCode",
                    "collaborator": "Collaborator",
                    "category": "Category",
                    "note": "Note",
                    "value": "Value"
                  }
                }
              },
              outflows: {
                outflowsReportSynthetic: {
                  fields: {
                    "outputsQuantity": "Number of Outputs",
                    "total": "Total Outputs"
                  }
                },
                outflowsReportAnalytical: {
                  fields: {
                    "code": "Code",
                    "referenceCode": "Reference Code",
                    "collaborator": "Collaborator",
                    "category": "Category",
                    "note": "Note",
                    "value": "Value"
                  }
                }
              },
              afterSales: {
                default: {
                  fields: {
                    "saleCode": "Sales Reference",
                    "serviceCode": "OS Reference",
                    "customer": "Customer",
                    "collaborator": "Collaborator",
                    "phone": "Phone",
                    "email": "Email",
                    "services": "Services",
                    "products": "Products",
                    "value": "Value"
                  }
                }
              }
            }
          },
          servicesOrders: {
            sections: {
              resume: {
                default: {
                  fields: {
                    "servicesCosts": "Cost of Services",
                    "productsCosts": "Cost of Products",
                    "totalCosts": "Total Costs",
                    "partialRevenue": "Partial Revenue",
                    "finalRevenue": "Final Recipe"
                  }
                }
              },
              internal: {
                servicesInternalReportSynthetic: {
                  fields: {
                    "servicesCosts": "Cost of Services",
                    "productsCosts": "Cost of Products",
                    "totalCosts": "Total Costs",
                    "partialRevenue": "Partial Revenue",
                    "finalRevenue": "Final Recipe"
                  }
                },
                servicesInternalReportAnalytical: {
                  fields: {
                    "customer": "Customer",
                    "collaborator": "Collaborator",
                    "services": "Services",
                    "products": "Products",
                    "discount": "Discount",
                    "fee": "Fee",
                    "servicesCosts": "Cost of Services",
                    "productsCosts": "Cost of Products",
                    "totalCosts": "Total Costs",
                    "partialRevenue": "Partial Revenue",
                    "finalRevenue": "Final Recipe"
                  }
                }
              },
              external: {
                servicesExternalReportSynthetic: {
                  fields: {
                    "servicesCosts": "Cost of Services",
                    "productsCosts": "Cost of Products",
                    "totalCosts": "Total Costs",
                    "partialRevenue": "Partial Revenue",
                    "finalRevenue": "Final Recipe"
                  }
                },
                servicesExternalReportAnalytical: {
                  fields: {
                    "customer": "Customer",
                    "collaborator": "Collaborator",
                    "services": "Services",
                    "products": "Products",
                    "discount": "Discount",
                    "fee": "Fee",
                    "servicesCosts": "Cost of Services",
                    "productsCosts": "Cost of Products",
                    "totalCosts": "Total Cost",
                    "partialRevenue": "Partial Revenue",
                    "finalRevenue": "Final Recipe"
                  }
                }
              },
              curveABC: {
                default: {
                  fields: {
                    "averageCost": "Average Cost",
                    "averagePrice": "Average Price",
                    "revenue": "Billing"
                  }
                }
              }
            }
          },
          stock: {
            sections: {
              products: {
                default: {
                  fields: {
                    "category": "Category",
                    "commercialUnit": "Commercial Unit",
                    "provider": "Supplier",
                    "quantity": "Quantity",
                    "alert": "Alert",
                    "costPrice": "Cost Price",
                    "salePrice": "Sales Price",
                    "totalCost": "Total Cost",
                    "totalSale": "Total Sale",
                    "contributionMargin": "Contribution Margin"
                  }
                }
              },
              purchases: {
                completedPurchases: {
                  fields: {
                    "provider": "Supplier",
                    "products": "Products",
                    "purchaseAmount": "Purchase Amount",
                    "totalCost": "Total Cost",
                    "totalSale": "Total Sale",
                    "contributionMargin": "Contribution Margin"
                  }
                },
                pendingPurchases: {
                  fields: {
                    "provider": "Supplier",
                    "products": "Products",
                    "purchaseAmount": "Purchase Amount",
                    "totalCost": "Total Cost",
                    "totalSale": "Total Sale",
                    "contributionMargin": "Contribution Margin"
                  }
                },
                purchasedProducts: {
                  fields: {
                    "provider": "Supplier",
                    "category": "Category",
                    "quantity": "Quantity",
                    "costPrice": "Cost Price",
                    "salePrice": "Sales Price",
                    "totalCost": "Total Cost",
                    "totalSale": "Total Sale",
                    "contributionMargin": "Contribution Margin"
                  }
                }
              },
              transfers: {
                completedTransfers: {
                  fields: {
                    "origin": "Origin",
                    "destination": "Destination",
                    "products": "Products",
                    "totalCost": "Total Cost",
                    "totalSale": "Total Sale",
                    "transferAmount": "Transfer Amount"
                  }
                },
                pendingTransfers: {
                  fields: {
                    "origin": "Origin",
                    "destination": "Destination",
                    "products": "Products",
                    "totalCost": "Total Cost",
                    "totalSale": "Total Sale",
                    "transferAmount": "Transfer Amount"
                  }
                },
                transferredProducts: {
                  fields: {
                    "origin": "Origin",
                    "destination": "Destination",
                    "name": "'Name",
                    "category": "Category",
                    "quantity": "Quantity",
                    "costPrice": "Cost Price",
                    "salePrice": "Sales Price",
                    "totalCost": "Total Cost",
                    "totalSale": "Total Sale"
                  }
                }
              },
              stockLogs: {
                default: {
                  fields: {
                    "productCode": "Product Reference",
                    "collaborator": "Collaborator",
                    "type": "Type",
                    "note": "Note",
                    "operation": "Quantity",
                    "quantity": "Operation",
                    "action": "Action"
                  }
                }
              },
              curveABC: {
                default: {
                  fields: {
                    "averageCost": "Average Cost",
                    "averagePrice": "Average Price",
                    "revenue": "Billing"
                  }
                }
              }
            }
          },
          financial: {
            sections: {
              cashFlow: {
                default: {
                  fields: {}
                }
              },
              billsToPay: {
                default: {
                  fields: {}
                }
              },
              billsToReceive: {
                default: {
                  fields: {}
                }
              },
              bankTransactions: {
                default: {
                  fields: {}
                }
              }
            }
          },
          several: {
            sections: {
              systemLogs: {
                default: {
                  fields: {
                    "code": "Code",
                    "referenceCode": "Reference",
                    "collaborator": "Collaborator",
                    "origin": "Origin",
                    "description": "Description",
                    "action": "Action"
                  }
                }
              },
            }
          }
        },
        settings: {
          sections: {
            "general": "General",
            "cashier": "Cashier",
            "servicesOrders": "Service orders"
          }
        },
        _reports: {
          sections: {
            "cashier": "Cashier",
            "stock": "Stock",
            "servicesOrders": "Service orders",
            "financial": "Financial",
            "several": "Miscellaneous"
          },
          subSections: {
            "resume": "Summary",

            "sales": "Sales",
            "inflows": "Inputs",
            "outflows": "Outflows",
            "afterSales": "After Sales",
            "historic": "Historic",

            "internal": "Internal",
            "external": "External",

            "products": "Products",
            "purchases": "Purchases",
            "transfers": "Transfers",
            "stockLogs": "Stock Movement",

            "curveABC": "Curve ABC",

            "cashFlow": "Cash flow",
            "billsToPay": "Accounts Payable",
            "billsToReceive": "Accounts Receivable",
            "bankTransactions": "Bank Transactions",

            "systemLogs": "System Logs"
          },
          types: {
            "resume": "Summary",
            "default": "Default",

            "salesReportSynthetic": "Sales Report (Synthetic)",
            "salesReportAnalytical": "Sales Report (Analytical)",
            "paymentMethodsSynthetic": "Payment Methods Report (Synthetic)",
            "paymentMethodsAnalytical": "Payment Methods Report (Analytical)",

            "salesPerUserSynthetic": "Vendas by User (Synthetic)",
            "salesPerUserAnalytical": "Vendas by User (Analytical)",

            "inflowsReportSynthetic": "Input Report (Synthetic)",
            "inflowsReportAnalytical": "Input Report (Analytical)",

            "outflowsReportSynthetic": "Outflows Report (Synthetic)",
            "outflowsReportAnalytical": "Outflows Report (Analytical)",

            "servicesInternalReportSynthetic": "Synthetic Report",
            "servicesInternalReportAnalytical": "Analytical Report",

            "servicesExternalReportSynthetic": "Synthetic Report",
            "servicesExternalReportAnalytical": "Analytical Report",

            "completedPurchases": "Completed Purchases",
            "pendingPurchases": "Pending Purchases",
            "purchasedProducts": "Purchased Products",

            "completedTransfers": "Transfers Completed",
            "pendingTransfers": "Pending Transfers",
            "transferedProducts": "Transferred Products",

            "paidAccounts": "Paid Accounts",
            "receivedAccounts": "Received Accounts",
            "pendingAccounts": "Pending Accounts",
            "expireAccounts": "Expired Accounts"
          }
        }
      },
      pages: {

        // Dashboard

        bestSellers: "BestSellers",
        counters: "Counters",
        dashboard: "Dashboard",
        stockAlert: "Stock Alert",
        cashierResume: "Cashier Resume",

        // Cashier

        cashier: "Cashier",
        cashierFront: "Cashier Front",
        cashierRegisters: "Cashier Registers",

        // CORREÇÃO: ADICIONADO CRM EM INGLÊS
        crm: "CRM",
        leads: "Leads",
        activities: "Activities",
        pipeline: "Pipeline",

        requests: "Requests",

        serviceOrders: "Service Orders",


        socialDemands: "Social Demands",
        projects: "Projects",
        crafts: "Crafts",
        groups: "Groups",
        classrooms: "Classrooms",
        tithes: "Tithes",
        donations: "Donations",
        agenda: "Schedule",
        events: "Events",
        kitchen: "Kitchen",
        menu: "Menu",

        // Stock

        stock: "Stock",
        products: "Products",
        purchases: "Purchases",
        transfers: "Transfers",


        // Registers

        registers: "Registers",
        customers: "Customers",
        members: "Members",
        voters: "Voters",
        collaboratorProfiles: "Colaborator Profiles",
        collaborators: "Collaborators",
        providers: "Providers",
        carriers: "Carriers",
        services: "Services",
        partners: "Partners",
        branches: "Branches",
        payments: "Payments",
        paymentMethods: "Payment Methods",

        // Financial

        finances: "Finances",
        billsToPay: "Bills To Pay",
        billsToReceive: "Bills To Receive",
        bankAccounts: "Bank Accounts",

        fiscal: "Fiscal Notes",
        reports: "Reports",
        store: "Store",
        settings: "Settings"
      },
      notifications: {
        registerCollaboratorWithSuccess: "Collaborator registered successfully.",
        registerCollaboratorWithError: "An unexpected error has occurred. It was not possible to register the Employee.",
        updateCollaboratorWithSuccess: "Collaborator updated successfully.",
        updateCollaboratorWithError: "An unexpected error has occurred. It was not possible to update the Employee.",
        deleteCollaboratorWithSuccess: "Contributor successfully removed.",
        deleteCollaboratorWithError: "An unexpected error has occurred. It was not possible to remove the Contributor.",

        registerCollaboratorProfileWithSuccess: "Collaborator profile created successfully.",
        registerCollaboratorProfileWithError: "An unexpected error has occurred. It was not possible to create the collaborator profile.",
        updateCollaboratorProfileWithSuccess: "Collaborator profile updated successfully.",
        updateCollaboratorProfileWithError: "An unexpected error has occurred. It was not possible to update the collaborator profile.",


        registerLimit: "The registration limit for employees with access to the system has been reached.",
        credentialsSendedWithSuccess: (email: string) => { return `Email sent to ${email} with login credentials.` },
        credentialsSendedWithError: "Something went wrong when sending email with login credentials.",

        email: {
          title: "Login Credentials",
          message: (email: string) => { return "The same password previously registered with this email " + email },
          yourCredentials: "YOUR LOGIN CREDENTIALS",
        },

        lockedAccess: {
          title: "Blocked Access",
          description: "Your user was blocked, in 10 seconds you will be disconnected."
        },

        requestPassword: {
          success: (email: string) => { return `Check email ${email} and access the link to reset your password.` },
          error: "Erro ao requisitar nova senha."
        }
      },
      systemLogNotes: {
        registerOS: "Collaborator creation.",
        deleteOS: "Collaborator deletion.",
        updateOS: "Collaborator update.",
      },
    }
  };

  public static get() {
    return CollaboratorsTranslate.data[window.localStorage.getItem('Language') ? window.localStorage.getItem('Language') : ProjectSettings.companySettings().language];
  }

}
