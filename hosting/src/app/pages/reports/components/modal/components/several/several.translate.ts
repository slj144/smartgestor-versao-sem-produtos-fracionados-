import { ProjectSettings } from "../../../../../../../assets/settings/company-settings";

export class SeveralReportsTranslate {

  private static obj = {
    'pt_BR': {
      _general: {
        form: {
          store: {
            title: 'Loja'
          },
          period: {
            title: 'Período',
            label: {
              option: {
                today: 'Hoje',
                currentWeek: 'Esta semana',
                currentMonth: 'Este mês',
                lastMonth: "Mês anterior",
                custom: 'Personalizado'
              },
              start: 'Início',
              end: 'Fim'
            }
          },
          reportType: {
            title: 'Tipo de Relatório'
          },
          reportFields: {
            title: 'Campos do Relatório'
          },
          button: {
            generate: 'Gerar Relatório'
          }
        },
        layer: {
          titleBar: {
            generated: [ 'Gerado em', 'às' ],
            button: {
              exportXLS: 'Exportar XLS'
            }
          },
          information: {
            label: {
              address: 'Endereço',
              phone: 'Telefone',
              period: [ 'Período', 'à' ]
            }
          },
          warning: {
            noData: 'Nenhum registro foi encontrado para o período selecionado.'
          }
        }
      },
      systemLogs: {
        fields: {
          default: {
            date: { external: 'Data', internal: 'Data' },
            code: { external: 'Código', internal: 'Código' },
            referenceCode: { external: 'Referência', internal: 'Referência' },
            collaborator: { external: 'Colaborador', internal: 'Colaborador' },
            origin: { external: 'Origem', internal: 'Origem' },
            description: { external: 'Descrição', internal: 'Descrição' },
            action: { external: 'Ação', internal: 'Ação' }
          }
        },
        layer: {
          type: {
            Auth: 'Autenticação',      
            CashierControls: 'Controle de Caixa',
            CashierSales: 'Frente de Caixa',
            CashierInflows: 'Entrada de Caixa',
            CashierInflowCategories: 'Categoria de Entrada de Caixa',
            CashierOutflows: 'Saída de Caixa',
            CashierOutflowCategories: 'Categoria de Saída de Caixa',
            Requests: 'Pedidos',
            SocialDemands: 'Demandas Sociais',
            Crafts: 'Ofícios',
            Projects: 'Projetos',
            Agenda: 'Agenda',
            Events: 'Eventos',
            Kitchen: 'Cozinha',
            Menu: 'Cardápio',
            Groups: 'Grupos',
            Classrooms: 'Salas de Aula',
            Tithes: 'Dízimo',
            Donations: 'Doações',
            ServiceOrders: 'Ordens de Serviço',            
            StockProducts: 'Produtos', 
            StockProductCommercialUnit: 'Unidade Comercial de Produto',
            StockProductCategories: 'Categoria de Produto', 
            StockPurchases: 'Compras',
            StockTransfers: 'Transferências',
            StockLogTypes: 'Tipos de Movimentação de Estoque',
            FinancialBillsToPay: 'Conta a Pagar',
            FinancialBillsToPayCategories: 'Categoria de Conta a Pagar',
            FinancialBillsToReceive: 'Conta a Receber',
            FinancialBillsToReceiveCategories: 'Categoria de Conta a Receber',
            FinancialBankAccount: 'Contas Bancárias',
            FinancialBankAccountTransaction: 'Transação de Conta Bancária',            
            RegistersCustomers: 'Clientes',
            RegistersMembers: 'Membros',
            RegistersVoters: 'Eleitores',
            RegistersCollaborators: 'Colaboradores',  
            RegistersCollaboratorProfiles: 'Perfil de Colaboradores',
            RegistersCraftsRecipient: 'Destinatário de Ofício',
            RegistersBranches: 'Filiais',
            RegistersCarriers: 'Transportadoras',
            RegistersProviders: 'Fornecedores',
            RegistersPartners: 'Empresas Parceiras',
            RegistersServices: 'Serviços',
            RegistersPaymentMethods: 'Meios de Pagamento',
            Informations: 'Informações',
            Settings: 'Configurações'
          },
          action: {
            REGISTER: 'REGISTRO',
            UPDATE: 'ATUALIZAÇÃO',
            DELETION: 'REMOÇÃO',
            CANCELLATION: 'CANCELAMENTO'
          }
        }
      }
    },
    'en_US': {
      _general: {
        form: {
          store: {
            title: 'Store'
          },
          period: {
            title: 'Period',
            label: {
              option: {
                today: 'Today',
                currentWeek: 'Current Week',
                currentMonth: 'Current Month',
                lastMonth: "Last Month",
                custom: 'Personalizado'
              },
              start: 'Start',
              end: 'End'
            }
          },
          reportType: {
            title: 'Report Type'
          },
          reportFields: {
            title: 'Report Fields'
          },
          button: {
            generate: 'Generate Report'
          }
        },
        layer: {
          titleBar: {
            generated: [ 'Generated on', 'at' ],
            button: {
              exportXLS: 'Export XLS'
            }
          },
          information: {
            label: {
              address: 'Address',
              phone: 'Phone',
              period: [ 'Period', 'to' ]
            }
          },
          warning: {
            noData: 'No records were found for the selected period.'
          }
        }
      },
      systemLogs: {
        fields: {
          default: {
            date: { external: 'Date', internal: 'Date' },
            code: { external: 'Code', internal: 'Code' },
            referenceCode: { external: 'Reference', internal: 'Reference' },
            collaborator: { external: 'Collaborator', internal: 'Collaborator' },
            origin: { external: 'Origin', internal: 'Origin' },
            description: { external: 'Description', internal: 'Description' },
            action: { external: 'Action', internal: 'Action' }
          }
        },
        layer: {
          type: {
            Auth: 'Authentication',      
            CashierControls: 'Cashier Control',
            CashierSales: 'Sale',
            CashierInflows: 'Cashier Inflow',
            CashierInflowCategories: 'Cashier Inflow Category',
            CashierOutflows: 'Cashier Outflow',
            CashierOutflowCategories: 'Cashier Outflow Category',            
            Requests: 'Requests',
            SocialDemands: 'Social Demands',
            Crafts: 'Crafts',
            Projects: 'Projects',
            Agenda: 'Agenda',
            Events: 'Events',
            Kitchen: 'kitchen',
            Menu: 'Menu',
            Groups: 'Groups',
            Classrooms: 'Classrooms',
            Tithes: 'Tithes',
            Donations: 'Donations',
            ServiceOrders: 'Service Order',
            StockProducts: 'Products', 
            StockProductCommercialUnit: 'Product Commercial Unit',
            StockProductCategories: 'Product Category', 
            StockPurchases: 'Purchases',
            StockTransfers: 'Transfers',
            StockLogTypes: 'Types of Stock Movement',
            FinancialBillsToPay: 'Bills to pay',
            FinancialBillsToPayCategories: 'Accounts Payable Categoryr',
            FinancialBillsToReceive: 'Bills to Receive',
            FinancialBillsToReceiveCategories: 'Accounts Receivable Category',
            FinancialBankAccount: 'Bank account',
            FinancialBankAccountTransaction: 'Bank Account Transaction',            
            RegistersCustomers: 'Customers',
            RegistersMembers: 'Members',
            RegistersVoters: 'Voters',
            RegistersCollaborators: 'Collaborators',  
            RegistersCollaboratorProfiles: 'Perfil de Colaboradores',
            RegistersCraftsRecipient: 'Craft Recipient',
            RegistersBranches: 'Branches',
            RegistersCarriers: 'Carriers',
            RegistersProviders: 'Providers',
            RegistersPartners: 'Partner Companies',
            RegistersServices: 'Services',
            RegistersPaymentMethods: 'Payment Method',
            Informations: 'Informations',
            Settings: 'Settings'
          },
          action: {
            REGISTER: 'REGISTER',
            UPDATE: 'UPDATE',
            DELETION: 'DELETION',
            CANCELLATION: 'CANCELLATION'
          }
        }
      }
    }
  }

  public static get(language?: string) {
    return SeveralReportsTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
