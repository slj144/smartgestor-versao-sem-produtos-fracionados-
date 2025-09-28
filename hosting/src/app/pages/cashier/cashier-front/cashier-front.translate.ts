import { ProjectSettings } from "../../../../assets/settings/company-settings";

export class CashierFrontTranslate {

  private static obj = {
    'pt_BR': {
      pageTitle: 'Frente de Caixa',     
      shortcut: {
        cashInflow: 'Nova Entrada',
        cashOutflow: 'Nova Saída',
        cashRecords: 'Registros',
        cashSummary: 'Resumo',
        cashVaultWithdraw: 'Retirada p/ Cofre',
        cashVaultReplenish: 'Repor do Cofre',
        cashClosing: 'Fechar Caixa'
      },
      dropdown: {
        cashInflow: 'Entrada de Caixa',
        cashOutflow: 'Saída de Caixa',
        cashRecords: 'Registros de Caixa',
        cashSummary: 'Resumo de Caixa',
        cashVaultWithdraw: 'Retirada p/ Cofre',
        cashVaultReplenish: 'Repor do Cofre',
        resetPanel: 'Resetar Painel',
        fullscreen: 'Tela Cheia',
        cashClosing: 'Fechar Caixa'
      }
    },
    'en_US': {
      pageTitle: 'Cashier Front',
      shortcut: {
        cashInflow: 'New Inflow',
        cashOutflow: 'New Outflow',
        cashRecords: 'Records',
        cashSummary: 'Summary',
        cashVaultWithdraw: 'Send to Vault',
        cashVaultReplenish: 'From Vault',
        cashClosing: 'Cash Closing'
      },
      dropdown: {
        cashInflow: 'Cash Input',
        cashOutflow: 'Cash Output',
        cashRecords: 'Cash Records',
        cashSummary: 'Cash Summary',
        cashVaultWithdraw: 'Send to Vault',
        cashVaultReplenish: 'From Vault',
        resetPanel: 'Reset Panel',
        fullscreen: 'Fullscreen',
        cashClosing: 'Cash Closing'
      }
    }
  }

  public static get(language?: string) {
    return CashierFrontTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
