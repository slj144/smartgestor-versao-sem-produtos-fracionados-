// ARQUIVO: src/app/pages/reports/components/modal/components/financial/financial.translate.ts
// CAMINHO: src/app/pages/reports/components/modal/components/financial/
// FUNCIONALIDADE: Arquivo de tradução dos relatórios financeiros com suporte a comissões

import { ProjectSettings } from "../../../../../../../assets/settings/company-settings";
import { Utilities } from "@shared/utilities/utilities";

export class ReportsFinancesTranslate {

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
          categories: {
            title: 'Categorias',
            list: {
              all: 'Todas as Categorias'
            }
          },
          button: {
            generate: 'Gerar Relatório'
          },
          billCategory: {
            title: "Categoria de Conta",
            list: {
              all: "Todas as Categorias"
            }
          },
          collaborator: {
            title: "Colaborador",
            list: {
              all: "Todos os Colaboradores"
            }
          },
          filterDateType: {
            title: "Filtrar por",
            options: {
              registerDate: "Data de Registro",
              dueDate: "Data de Vencimento",
              dischargeDate: "Data de Quitação"
            }
          }
        },
        layer: {
          titleBar: {
            generated: ['Gerado em', 'às'],
            button: {
              exportXLS: 'Exportar XLS'
            }
          },
          information: {
            label: {
              address: 'Endereço',
              phone: 'Telefone',
              period: ['Período', 'à']
            }
          },
          warning: {
            noData: 'Nenhum registro foi encontrado para o período selecionado.'
          }
        }
      },
      cashFlow: {
        fields: {
          default: {
            date: { external: 'Data', internal: 'Data' },
            cashierResult: { external: 'Caixa', internal: `Caixa (${Utilities.currencySymbol})` },
            servicesOrdersResults: { external: 'Ordens de Serviço', internal: `Ordens de Serviço (${Utilities.currencySymbol})` },
            billsToReceiveResult: { external: 'Contas a Receber', internal: `Contas a Receber (${Utilities.currencySymbol})` },
            billsToPayResult: { external: 'Contas a Pagar', internal: `Contas a Pagar (${Utilities.currencySymbol})` },
            costs: {
              external: 'Custos', internal: {
                label: `Custos`,
                sub: {
                  products: `Produtos (${Utilities.currencySymbol})`,
                  services: `Serviços (${Utilities.currencySymbol})`,
                  payments: `Pagamentos (${Utilities.currencySymbol})`,
                  total: `Total (${Utilities.currencySymbol})`
                }
              }
            },
            billing: { external: 'Faturamento', internal: `Faturamento (${Utilities.currencySymbol})` },
            grossProfit: { external: 'Lucro Bruto', internal: `Lucro Bruto (${Utilities.currencySymbol})` }
          }
        },
        label: {
          total: 'Total'
        }
      },
      billsToPay: {
        types: {
          paidAccounts: 'Contas Pagas',
          pendingAccounts: 'Contas Pendentes',
          overdueAccounts: 'Contas Vencidas',
          canceledAccounts: 'Contas Canceladas'
        },
        fields: {
          paidAccounts: {
            code: { external: 'Código', internal: 'Código' },
            referenceCode: { external: 'Código de Referência', internal: 'Código de Referência' },
            beneficiary: { external: 'Beneficiário', internal: 'Beneficiário' },
            category: { external: 'Categoria', internal: 'Categoria' },
            registerDate: { external: 'Data de Registro', internal: 'Data de Registro' },
            dischargeDate: { external: 'Data de Quitação', internal: 'Data de Quitação' },
            paymentDate: { external: 'Data de Quitação', internal: 'Data de Quitação' },
            installments: { external: 'Parcelamento', internal: 'Parcelamento' },
            installmentsState: { external: 'Parcelamento', internal: 'Parcelamento' },
            discount: { external: 'Desconto', internal: `Desconto (${Utilities.currencySymbol})` },
            interest: { external: 'Juros', internal: `Juros (${Utilities.currencySymbol})` },
            bankCharges: { external: 'Encargos', internal: `Encargos (${Utilities.currencySymbol})` },
            amountPaid: { external: 'Valor Pago', internal: `Valor Pago (${Utilities.currencySymbol})` },
            accountValue: { external: 'Valor da Conta', internal: `Valor da Conta (${Utilities.currencySymbol})` }
          },
          pendingAccounts: {
            code: { external: 'Código', internal: 'Código' },
            referenceCode: { external: 'Código de Referência', internal: 'Código de Referência' },
            beneficiary: { external: 'Beneficiário', internal: 'Beneficiário' },
            category: { external: 'Categoria', internal: 'Categoria' },
            registerDate: { external: 'Data de Registro', internal: 'Data de Registro' },
            dueDate: { external: 'Data de Vencimento', internal: 'Data de Vencimento' },
            installmentsState: { external: 'Parcelamento', internal: 'Parcelamento' },
            installmentValue: { external: 'Valor da Parcela', internal: `Valor da Parcela (${Utilities.currencySymbol})` },
            amountPaid: { external: 'Valor Pago', internal: `Valor Pago (${Utilities.currencySymbol})` },
            pendingAmount: { external: 'Valor Pendente', internal: `Valor Pendente (${Utilities.currencySymbol})` },
            accountValue: { external: 'Valor da Conta', internal: `Valor da Conta (${Utilities.currencySymbol})` }
          },
          overdueAccounts: {
            code: { external: 'Código', internal: 'Código' },
            referenceCode: { external: 'Código de Referência', internal: 'Código de Referência' },
            beneficiary: { external: 'Beneficiário', internal: 'Beneficiário' },
            category: { external: 'Categoria', internal: 'Categoria' },
            registerDate: { external: 'Data de Registro', internal: 'Data de Registro' },
            dueDate: { external: 'Data de Vencimento', internal: 'Data de Vencimento' },
            daysOverdue: { external: 'Dias em Atraso', internal: 'Dias em Atraso' },
            installmentsState: { external: 'Parcelamento', internal: 'Parcelamento' },
            installmentValue: { external: 'Valor da Parcela', internal: `Valor da Parcela (${Utilities.currencySymbol})` },
            amountPaid: { external: 'Valor Pago', internal: `Valor Pago (${Utilities.currencySymbol})` },
            pendingAmount: { external: 'Valor Pendente', internal: `Valor Pendente (${Utilities.currencySymbol})` },
            accountValue: { external: 'Valor da Conta', internal: `Valor da Conta (${Utilities.currencySymbol})` }
          },
          canceledAccounts: {
            code: { external: 'Código', internal: 'Código' },
            referenceCode: { external: 'Código de Referência', internal: 'Código de Referência' },
            beneficiary: { external: 'Beneficiário', internal: 'Beneficiário' },
            category: { external: 'Categoria', internal: 'Categoria' },
            registerDate: { external: 'Data de Registro', internal: 'Data de Registro' },
            dueDate: { external: 'Data de Vencimento', internal: 'Data de Vencimento' },
            installmentsState: { external: 'Parcelamento', internal: 'Parcelamento' },
            installmentValue: { external: 'Valor da Parcela', internal: `Valor da Parcela (${Utilities.currencySymbol})` },
            amountPaid: { external: 'Valor Pago', internal: `Valor Pago (${Utilities.currencySymbol})` },
            pendingAmount: { external: 'Valor Pendente', internal: `Valor Pendente (${Utilities.currencySymbol})` },
            accountValue: { external: 'Valor da Conta', internal: `Valor da Conta (${Utilities.currencySymbol})` }
          }
        },
        label: {
          total: 'Total'
        }
      },
      billsToReceive: {
        types: {
          receivedAccounts: 'Contas Recebidas',
          pendingAccounts: 'Contas Pendentes',
          overdueAccounts: 'Contas Vencidas',
          canceledAccounts: 'Contas Canceladas'
        },
        fields: {
          receivedAccounts: {
            code: { external: 'Código', internal: 'Código' },
            referenceCode: { external: 'Código de Referência', internal: 'Código de Referência' },
            debtor: { external: 'Devedor', internal: 'Devedor' },
            category: { external: 'Categoria', internal: 'Categoria' },
            registerDate: { external: 'Data de Registro', internal: 'Data de Registro' },
            dischargeDate: { external: 'Data de Recebimento', internal: 'Data de Recebimento' },
            paymentDate: { external: 'Data de Recebimento', internal: 'Data de Recebimento' },
            installments: { external: 'Parcelamento', internal: 'Parcelamento' },
            installmentsState: { external: 'Parcelamento', internal: 'Parcelamento' },
            discount: { external: 'Desconto', internal: `Desconto (${Utilities.currencySymbol})` },
            interest: { external: 'Juros', internal: `Juros (${Utilities.currencySymbol})` },
            bankCharges: { external: 'Encargos', internal: `Encargos (${Utilities.currencySymbol})` },
            amountReceived: { external: 'Valor Recebido', internal: `Valor Recebido (${Utilities.currencySymbol})` },
            accountValue: { external: 'Valor da Conta', internal: `Valor da Conta (${Utilities.currencySymbol})` }
          },
          pendingAccounts: {
            code: { external: 'Código', internal: 'Código' },
            referenceCode: { external: 'Código de Referência', internal: 'Código de Referência' },
            debtor: { external: 'Devedor', internal: 'Devedor' },
            category: { external: 'Categoria', internal: 'Categoria' },
            registerDate: { external: 'Data de Registro', internal: 'Data de Registro' },
            dueDate: { external: 'Data de Vencimento', internal: 'Data de Vencimento' },
            installmentsState: { external: 'Parcelamento', internal: 'Parcelamento' },
            installmentValue: { external: 'Valor da Parcela', internal: `Valor da Parcela (${Utilities.currencySymbol})` },
            amountReceived: { external: 'Valor Recebido', internal: `Valor Recebido (${Utilities.currencySymbol})` },
            pendingAmount: { external: 'Valor Pendente', internal: `Valor Pendente (${Utilities.currencySymbol})` },
            accountValue: { external: 'Valor da Conta', internal: `Valor da Conta (${Utilities.currencySymbol})` }
          },
          overdueAccounts: {
            code: { external: 'Código', internal: 'Código' },
            referenceCode: { external: 'Código de Referência', internal: 'Código de Referência' },
            debtor: { external: 'Devedor', internal: 'Devedor' },
            category: { external: 'Categoria', internal: 'Categoria' },
            registerDate: { external: 'Data de Registro', internal: 'Data de Registro' },
            dueDate: { external: 'Data de Vencimento', internal: 'Data de Vencimento' },
            daysOverdue: { external: 'Dias em Atraso', internal: 'Dias em Atraso' },
            installmentsState: { external: 'Parcelamento', internal: 'Parcelamento' },
            installmentValue: { external: 'Valor da Parcela', internal: `Valor da Parcela (${Utilities.currencySymbol})` },
            amountReceived: { external: 'Valor Recebido', internal: `Valor Recebido (${Utilities.currencySymbol})` },
            pendingAmount: { external: 'Valor Pendente', internal: `Valor Pendente (${Utilities.currencySymbol})` },
            accountValue: { external: 'Valor da Conta', internal: `Valor da Conta (${Utilities.currencySymbol})` }
          },
          canceledAccounts: {
            code: { external: 'Código', internal: 'Código' },
            referenceCode: { external: 'Código de Referência', internal: 'Código de Referência' },
            debtor: { external: 'Devedor', internal: 'Devedor' },
            category: { external: 'Categoria', internal: 'Categoria' },
            registerDate: { external: 'Data de Registro', internal: 'Data de Registro' },
            dueDate: { external: 'Data de Vencimento', internal: 'Data de Vencimento' },
            installmentsState: { external: 'Parcelamento', internal: 'Parcelamento' },
            installmentValue: { external: 'Valor da Parcela', internal: `Valor da Parcela (${Utilities.currencySymbol})` },
            amountReceived: { external: 'Valor Recebido', internal: `Valor Recebido (${Utilities.currencySymbol})` },
            pendingAmount: { external: 'Valor Pendente', internal: `Valor Pendente (${Utilities.currencySymbol})` },
            accountValue: { external: 'Valor da Conta', internal: `Valor da Conta (${Utilities.currencySymbol})` }
          }
        },
        label: {
          total: 'Total'
        }
      },
      bankTransactions: {
        fields: {
          default: {
            date: { external: 'Data', internal: 'Data' },
            code: { external: 'Código', internal: 'Código' },
            operator: {
              label: { external: 'Colaborador', internal: 'Colaborador' }
            },
            bankAccount: {
              label: { external: 'Conta Bancária', internal: 'Conta Bancária' }
            },
            account: { external: 'Conta', internal: 'Conta' },
            type: {
              external: 'Tipo',
              internal: {
                label: 'Tipo',
                enum: {
                  'DEPOSIT': 'Depósito',
                  'WITHDRAW': 'Saque',
                  'TRANSFER': 'Transferência',
                  'PAYMENT': 'Pagamento',
                  'RECEIPT': 'Recebimento'
                }
              }
            },
            description: { external: 'Descrição', internal: 'Descrição' },
            value: { external: 'Valor', internal: `Valor (${Utilities.currencySymbol})` },
            balance: { external: 'Saldo', internal: `Saldo (${Utilities.currencySymbol})` }
          }
        },
        label: {
          total: 'Total'
        }
      },
      // ✅ NOVA SEÇÃO: COMISSÕES
      commissions: {
        types: {
          commissionReportSynthetic: 'Relatório de Comissões (Sintético)',
          commissionReportAnalytical: 'Relatório de Comissões (Analítico)',
          commissionByCollaborator: 'Comissões por Colaborador',
          commissionByProduct: 'Comissões por Produto',
          commissionByService: 'Comissões por Serviço'
        },
        fields: {
          default: {
            collaborator: { external: 'Colaborador', internal: 'Colaborador' },
            commission: { external: 'Comissão', internal: 'Comissão' },
            partialRevenue: { external: 'Receita Parcial', internal: 'Receita Parcial' }
          },
          commissionReportSynthetic: {
            collaborator: { external: 'Colaborador', internal: 'Colaborador' },
            salesQuantity: { external: 'Qtd. Vendas', internal: 'Qtd. Vendas' },
            salesTotal: { external: 'Total Vendas', internal: `Total Vendas (${Utilities.currencySymbol})` },
            commissionPercentage: { external: 'Percentual', internal: 'Percentual (%)' },
            commissionValue: { external: 'Valor Comissão', internal: `Valor Comissão (${Utilities.currencySymbol})` },
            partialRevenue: { external: 'Receita Parcial', internal: `Receita Parcial (${Utilities.currencySymbol})` },
            paymentDate: { external: 'Data Pagamento', internal: 'Data Pagamento' }
          },
          commissionReportAnalytical: {
            date: { external: 'Data', internal: 'Data' },
            saleCode: { external: 'Cód. Venda', internal: 'Cód. Venda' },
            collaborator: { external: 'Colaborador', internal: 'Colaborador' },
            customer: { external: 'Cliente', internal: 'Cliente' },
            saleValue: { external: 'Valor Venda', internal: `Valor Venda (${Utilities.currencySymbol})` },
            partialRevenue: { external: 'Receita Parcial', internal: `Receita Parcial (${Utilities.currencySymbol})` },
            commissionPercentage: { external: 'Percentual', internal: 'Percentual (%)' },
            commissionValue: { external: 'Valor Comissão', internal: `Valor Comissão (${Utilities.currencySymbol})` },
            paymentDate: { external: 'Data Pagamento', internal: 'Data Pagamento' },
            observation: { external: 'Observação', internal: 'Observação' }
          },
          commissionByCollaborator: {
            collaborator: { external: 'Colaborador', internal: 'Colaborador' },
            period: { external: 'Período', internal: 'Período' },
            salesQuantity: { external: 'Qtd. Vendas', internal: 'Qtd. Vendas' },
            productsTotal: { external: 'Total Produtos', internal: `Total Produtos (${Utilities.currencySymbol})` },
            servicesTotal: { external: 'Total Serviços', internal: `Total Serviços (${Utilities.currencySymbol})` },
            salesTotal: { external: 'Total Geral', internal: `Total Geral (${Utilities.currencySymbol})` },
            averageCommission: { external: 'Comissão Média', internal: 'Comissão Média (%)' },
            totalCommission: { external: 'Total Comissão', internal: `Total Comissão (${Utilities.currencySymbol})` },
            paidCommission: { external: 'Comissão Paga', internal: `Comissão Paga (${Utilities.currencySymbol})` },
            pendingCommission: { external: 'Comissão Pendente', internal: `Comissão Pendente (${Utilities.currencySymbol})` }
          },
          commissionByProduct: {
            productCode: { external: 'Cód. Produto', internal: 'Cód. Produto' },
            productName: { external: 'Produto', internal: 'Produto' },
            category: { external: 'Categoria', internal: 'Categoria' },
            quantitySold: { external: 'Qtd. Vendida', internal: 'Qtd. Vendida' },
            totalSales: { external: 'Total Vendas', internal: `Total Vendas (${Utilities.currencySymbol})` },
            averageCommission: { external: 'Comissão Média', internal: 'Comissão Média (%)' },
            totalCommission: { external: 'Total Comissão', internal: `Total Comissão (${Utilities.currencySymbol})` }
          },
          commissionByService: {
            serviceCode: { external: 'Cód. Serviço', internal: 'Cód. Serviço' },
            serviceName: { external: 'Serviço', internal: 'Serviço' },
            quantityExecuted: { external: 'Qtd. Executada', internal: 'Qtd. Executada' },
            totalSales: { external: 'Total Vendas', internal: `Total Vendas (${Utilities.currencySymbol})` },
            averageCommission: { external: 'Comissão Média', internal: 'Comissão Média (%)' },
            totalCommission: { external: 'Total Comissão', internal: `Total Comissão (${Utilities.currencySymbol})` }
          }
        },
        label: {
          total: 'Total',
          pending: 'Pendente',
          paid: 'Pago',
          commission: 'Comissão'
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
                currentWeek: 'This week',
                currentMonth: 'This month',
                lastMonth: 'Last month',
                custom: 'Custom'
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
          categories: {
            title: 'Categories',
            list: {
              all: 'All Categories'
            }
          },
          button: {
            generate: 'Generate Report'
          },
          billCategory: {
            title: "Bill Category",
            list: {
              all: "All Categories"
            }
          },
          collaborator: {
            title: "Collaborator",
            list: {
              all: "All Collaborators"
            }
          },
          filterDateType: {
            title: "Filter by",
            options: {
              registerDate: "Register Date",
              dueDate: "Due Date",
              dischargeDate: "Discharge Date"
            }
          }
        },
        layer: {
          titleBar: {
            generated: ['Generated on', 'at'],
            button: {
              exportXLS: 'Export XLS'
            }
          },
          information: {
            label: {
              address: 'Address',
              phone: 'Phone',
              period: ['Period', 'to']
            }
          },
          warning: {
            noData: 'No records were found for the selected period.'
          }
        }
      },
      cashFlow: {
        fields: {
          default: {
            date: { external: 'Date', internal: 'Date' },
            cashierResult: { external: 'Cashier', internal: `Cashier (${Utilities.currencySymbol})` },
            servicesOrdersResults: { external: 'Service Orders', internal: `Service Orders (${Utilities.currencySymbol})` },
            billsToReceiveResult: { external: 'Bills to Receive', internal: `Bills to Receive (${Utilities.currencySymbol})` },
            billsToPayResult: { external: 'Bills to Pay', internal: `Bills to Pay (${Utilities.currencySymbol})` },
            costs: {
              external: 'Costs', internal: {
                label: `Costs`,
                sub: {
                  products: `Products (${Utilities.currencySymbol})`,
                  services: `Services (${Utilities.currencySymbol})`,
                  payments: `Payments (${Utilities.currencySymbol})`,
                  total: `Total (${Utilities.currencySymbol})`
                }
              }
            },
            billing: { external: 'Billing', internal: `Billing (${Utilities.currencySymbol})` },
            grossProfit: { external: 'Gross Profit', internal: `Gross Profit (${Utilities.currencySymbol})` }
          }
        },
        label: {
          total: 'Total'
        }
      },
      billsToPay: {
        types: {
          paidAccounts: 'Paid Accounts',
          pendingAccounts: 'Pending Accounts',
          overdueAccounts: 'Overdue Accounts',
          canceledAccounts: 'Canceled Accounts'
        },
        fields: {
          paidAccounts: {
            code: { external: 'Code', internal: 'Code' },
            referenceCode: { external: 'Reference Code', internal: 'Reference Code' },
            beneficiary: { external: 'Beneficiary', internal: 'Beneficiary' },
            category: { external: 'Category', internal: 'Category' },
            registerDate: { external: 'Register Date', internal: 'Register Date' },
            dischargeDate: { external: 'Discharge Date', internal: 'Discharge Date' },
            paymentDate: { external: 'Discharge Date', internal: 'Discharge Date' },
            installments: { external: 'Installments', internal: 'Installments' },
            installmentsState: { external: 'Installments', internal: 'Installments' },
            discount: { external: 'Discount', internal: `Discount (${Utilities.currencySymbol})` },
            interest: { external: 'Interest', internal: `Interest (${Utilities.currencySymbol})` },
            bankCharges: { external: 'Bank Charges', internal: `Bank Charges (${Utilities.currencySymbol})` },
            amountPaid: { external: 'Amount Paid', internal: `Amount Paid (${Utilities.currencySymbol})` },
            accountValue: { external: 'Account Value', internal: `Account Value (${Utilities.currencySymbol})` }
          },
          pendingAccounts: {
            code: { external: 'Code', internal: 'Code' },
            referenceCode: { external: 'Reference Code', internal: 'Reference Code' },
            beneficiary: { external: 'Beneficiary', internal: 'Beneficiary' },
            category: { external: 'Category', internal: 'Category' },
            registerDate: { external: 'Register Date', internal: 'Register Date' },
            dueDate: { external: 'Due Date', internal: 'Due Date' },
            installmentsState: { external: 'Installments', internal: 'Installments' },
            installmentValue: { external: 'Installment Value', internal: `Installment Value (${Utilities.currencySymbol})` },
            amountPaid: { external: 'Amount Paid', internal: `Amount Paid (${Utilities.currencySymbol})` },
            pendingAmount: { external: 'Pending Amount', internal: `Pending Amount (${Utilities.currencySymbol})` },
            accountValue: { external: 'Account Value', internal: `Account Value (${Utilities.currencySymbol})` }
          },
          overdueAccounts: {
            code: { external: 'Code', internal: 'Code' },
            referenceCode: { external: 'Reference Code', internal: 'Reference Code' },
            beneficiary: { external: 'Beneficiary', internal: 'Beneficiary' },
            category: { external: 'Category', internal: 'Category' },
            registerDate: { external: 'Register Date', internal: 'Register Date' },
            dueDate: { external: 'Due Date', internal: 'Due Date' },
            daysOverdue: { external: 'Days Overdue', internal: 'Days Overdue' },
            installmentsState: { external: 'Installments', internal: 'Installments' },
            installmentValue: { external: 'Installment Value', internal: `Installment Value (${Utilities.currencySymbol})` },
            amountPaid: { external: 'Amount Paid', internal: `Amount Paid (${Utilities.currencySymbol})` },
            pendingAmount: { external: 'Pending Amount', internal: `Pending Amount (${Utilities.currencySymbol})` },
            accountValue: { external: 'Account Value', internal: `Account Value (${Utilities.currencySymbol})` }
          },
          canceledAccounts: {
            code: { external: 'Code', internal: 'Code' },
            referenceCode: { external: 'Reference Code', internal: 'Reference Code' },
            beneficiary: { external: 'Beneficiary', internal: 'Beneficiary' },
            category: { external: 'Category', internal: 'Category' },
            registerDate: { external: 'Register Date', internal: 'Register Date' },
            dueDate: { external: 'Due Date', internal: 'Due Date' },
            installmentsState: { external: 'Installments', internal: 'Installments' },
            installmentValue: { external: 'Installment Value', internal: `Installment Value (${Utilities.currencySymbol})` },
            amountPaid: { external: 'Amount Paid', internal: `Amount Paid (${Utilities.currencySymbol})` },
            pendingAmount: { external: 'Pending Amount', internal: `Pending Amount (${Utilities.currencySymbol})` },
            accountValue: { external: 'Account Value', internal: `Account Value (${Utilities.currencySymbol})` }
          }
        },
        label: {
          total: 'Total'
        }
      },
      billsToReceive: {
        types: {
          receivedAccounts: 'Received Accounts',
          pendingAccounts: 'Pending Accounts',
          overdueAccounts: 'Overdue Accounts',
          canceledAccounts: 'Canceled Accounts'
        },
        fields: {
          receivedAccounts: {
            code: { external: 'Code', internal: 'Code' },
            referenceCode: { external: 'Reference Code', internal: 'Reference Code' },
            debtor: { external: 'Debtor', internal: 'Debtor' },
            category: { external: 'Category', internal: 'Category' },
            registerDate: { external: 'Register Date', internal: 'Register Date' },
            dischargeDate: { external: 'Receipt Date', internal: 'Receipt Date' },
            paymentDate: { external: 'Receipt Date', internal: 'Receipt Date' },
            installments: { external: 'Installments', internal: 'Installments' },
            installmentsState: { external: 'Installments', internal: 'Installments' },
            discount: { external: 'Discount', internal: `Discount (${Utilities.currencySymbol})` },
            interest: { external: 'Interest', internal: `Interest (${Utilities.currencySymbol})` },
            bankCharges: { external: 'Bank Charges', internal: `Bank Charges (${Utilities.currencySymbol})` },
            amountReceived: { external: 'Amount Received', internal: `Amount Received (${Utilities.currencySymbol})` },
            accountValue: { external: 'Account Value', internal: `Account Value (${Utilities.currencySymbol})` }
          },
          pendingAccounts: {
            code: { external: 'Code', internal: 'Code' },
            referenceCode: { external: 'Reference Code', internal: 'Reference Code' },
            debtor: { external: 'Debtor', internal: 'Debtor' },
            category: { external: 'Category', internal: 'Category' },
            registerDate: { external: 'Register Date', internal: 'Register Date' },
            dueDate: { external: 'Due Date', internal: 'Due Date' },
            installmentsState: { external: 'Installments', internal: 'Installments' },
            installmentValue: { external: 'Installment Value', internal: `Installment Value (${Utilities.currencySymbol})` },
            amountReceived: { external: 'Amount Received', internal: `Amount Received (${Utilities.currencySymbol})` },
            pendingAmount: { external: 'Pending Amount', internal: `Pending Amount (${Utilities.currencySymbol})` },
            accountValue: { external: 'Account Value', internal: `Account Value (${Utilities.currencySymbol})` }
          },
          overdueAccounts: {
            code: { external: 'Code', internal: 'Code' },
            referenceCode: { external: 'Reference Code', internal: 'Reference Code' },
            debtor: { external: 'Debtor', internal: 'Debtor' },
            category: { external: 'Category', internal: 'Category' },
            registerDate: { external: 'Register Date', internal: 'Register Date' },
            dueDate: { external: 'Due Date', internal: 'Due Date' },
            daysOverdue: { external: 'Days Overdue', internal: 'Days Overdue' },
            installmentsState: { external: 'Installments', internal: 'Installments' },
            installmentValue: { external: 'Installment Value', internal: `Installment Value (${Utilities.currencySymbol})` },
            amountReceived: { external: 'Amount Received', internal: `Amount Received (${Utilities.currencySymbol})` },
            pendingAmount: { external: 'Pending Amount', internal: `Pending Amount (${Utilities.currencySymbol})` },
            accountValue: { external: 'Account Value', internal: `Account Value (${Utilities.currencySymbol})` }
          },
          canceledAccounts: {
            code: { external: 'Code', internal: 'Code' },
            referenceCode: { external: 'Reference Code', internal: 'Reference Code' },
            debtor: { external: 'Debtor', internal: 'Debtor' },
            category: { external: 'Category', internal: 'Category' },
            registerDate: { external: 'Register Date', internal: 'Register Date' },
            dueDate: { external: 'Due Date', internal: 'Due Date' },
            installmentsState: { external: 'Installments', internal: 'Installments' },
            installmentValue: { external: 'Installment Value', internal: `Installment Value (${Utilities.currencySymbol})` },
            amountReceived: { external: 'Amount Received', internal: `Amount Received (${Utilities.currencySymbol})` },
            pendingAmount: { external: 'Pending Amount', internal: `Pending Amount (${Utilities.currencySymbol})` },
            accountValue: { external: 'Account Value', internal: `Account Value (${Utilities.currencySymbol})` }
          }
        },
        label: {
          total: 'Total'
        }
      },
      bankTransactions: {
        fields: {
          default: {
            date: { external: 'Date', internal: 'Date' },
            code: { external: 'Code', internal: 'Code' },
            operator: {
              label: { external: 'Operator', internal: 'Operator' }
            },
            bankAccount: {
              label: { external: 'Bank Account', internal: 'Bank Account' }
            },
            account: { external: 'Account', internal: 'Account' },
            type: {
              external: 'Type',
              internal: {
                label: 'Type',
                enum: {
                  'DEPOSIT': 'Deposit',
                  'WITHDRAW': 'Withdraw',
                  'TRANSFER': 'Transfer',
                  'PAYMENT': 'Payment',
                  'RECEIPT': 'Receipt'
                }
              }
            },
            description: { external: 'Description', internal: 'Description' },
            value: { external: 'Value', internal: `Value (${Utilities.currencySymbol})` },
            balance: { external: 'Balance', internal: `Balance (${Utilities.currencySymbol})` }
          }
        },
        label: {
          total: 'Total'
        }
      },
      // ✅ NOVA SEÇÃO: COMISSÕES (INGLÊS)
      commissions: {
        types: {
          commissionReportSynthetic: 'Commission Report (Synthetic)',
          commissionReportAnalytical: 'Commission Report (Analytical)',
          commissionByCollaborator: 'Commission by Collaborator',
          commissionByProduct: 'Commission by Product',
          commissionByService: 'Commission by Service'
        },
        fields: {
          default: {
            collaborator: { external: 'Collaborator', internal: 'Collaborator' },
            commission: { external: 'Commission', internal: 'Commission' },
            partialRevenue: { external: 'Partial Revenue', internal: 'Partial Revenue' }
          },
          commissionReportSynthetic: {
            collaborator: { external: 'Collaborator', internal: 'Collaborator' },
            salesQuantity: { external: 'Sales Qty', internal: 'Sales Qty' },
            salesTotal: { external: 'Sales Total', internal: `Sales Total (${Utilities.currencySymbol})` },
            commissionPercentage: { external: 'Percentage', internal: 'Percentage (%)' },
            commissionValue: { external: 'Commission Value', internal: `Commission Value (${Utilities.currencySymbol})` },
            partialRevenue: { external: 'Partial Revenue', internal: `Partial Revenue (${Utilities.currencySymbol})` },
            paymentDate: { external: 'Payment Date', internal: 'Payment Date' }
          },
          commissionReportAnalytical: {
            date: { external: 'Date', internal: 'Date' },
            saleCode: { external: 'Sale Code', internal: 'Sale Code' },
            collaborator: { external: 'Collaborator', internal: 'Collaborator' },
            customer: { external: 'Customer', internal: 'Customer' },
            saleValue: { external: 'Sale Value', internal: `Sale Value (${Utilities.currencySymbol})` },
            partialRevenue: { external: 'Partial Revenue', internal: `Partial Revenue (${Utilities.currencySymbol})` },
            commissionPercentage: { external: 'Percentage', internal: 'Percentage (%)' },
            commissionValue: { external: 'Commission Value', internal: `Commission Value (${Utilities.currencySymbol})` },
            paymentDate: { external: 'Payment Date', internal: 'Payment Date' },
            observation: { external: 'Observation', internal: 'Observation' }
          },
          commissionByCollaborator: {
            collaborator: { external: 'Collaborator', internal: 'Collaborator' },
            period: { external: 'Period', internal: 'Period' },
            salesQuantity: { external: 'Sales Qty', internal: 'Sales Qty' },
            productsTotal: { external: 'Products Total', internal: `Products Total (${Utilities.currencySymbol})` },
            servicesTotal: { external: 'Services Total', internal: `Services Total (${Utilities.currencySymbol})` },
            salesTotal: { external: 'Grand Total', internal: `Grand Total (${Utilities.currencySymbol})` },
            averageCommission: { external: 'Average Commission', internal: 'Average Commission (%)' },
            totalCommission: { external: 'Total Commission', internal: `Total Commission (${Utilities.currencySymbol})` },
            paidCommission: { external: 'Paid Commission', internal: `Paid Commission (${Utilities.currencySymbol})` },
            pendingCommission: { external: 'Pending Commission', internal: `Pending Commission (${Utilities.currencySymbol})` }
          },
          commissionByProduct: {
            productCode: { external: 'Product Code', internal: 'Product Code' },
            productName: { external: 'Product', internal: 'Product' },
            category: { external: 'Category', internal: 'Category' },
            quantitySold: { external: 'Qty Sold', internal: 'Qty Sold' },
            totalSales: { external: 'Sales Total', internal: `Sales Total (${Utilities.currencySymbol})` },
            averageCommission: { external: 'Average Commission', internal: 'Average Commission (%)' },
            totalCommission: { external: 'Total Commission', internal: `Total Commission (${Utilities.currencySymbol})` }
          },
          commissionByService: {
            serviceCode: { external: 'Service Code', internal: 'Service Code' },
            serviceName: { external: 'Service', internal: 'Service' },
            quantityExecuted: { external: 'Qty Executed', internal: 'Qty Executed' },
            totalSales: { external: 'Sales Total', internal: `Sales Total (${Utilities.currencySymbol})` },
            averageCommission: { external: 'Average Commission', internal: 'Average Commission (%)' },
            totalCommission: { external: 'Total Commission', internal: `Total Commission (${Utilities.currencySymbol})` }
          }
        },
        label: {
          total: 'Total',
          pending: 'Pending',
          paid: 'Paid',
          commission: 'Commission'
        }
      }
    }
  }

  public static get(language?: string) {
    const lang = language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language ?? 'pt_BR';
    return ReportsFinancesTranslate.obj[lang] ?? ReportsFinancesTranslate.obj['pt_BR'];
  }

}