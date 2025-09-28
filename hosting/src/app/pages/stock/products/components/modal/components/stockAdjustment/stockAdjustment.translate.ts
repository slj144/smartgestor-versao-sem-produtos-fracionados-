import { ProjectSettings } from "../../../../../../../../assets/settings/company-settings";

export class StockAdjustmentTranslate {

  private static obj = {
    'pt_BR': {
      searchBar: {
        placeholder: 'Pesquisar..'
      },
      table: {
        label: {
          date: 'Data',
          code: 'Código',
          productCode: 'Ref. Produto',
          type: 'Tipo',
          note: 'Nota de Ajuste',
          quantity: 'Quantidade',
          operation: 'Operação'
        },
        operation: {
          INPUT: 'ENTRADA',
          OUTPUT: 'SAÍDA'
        }
      },
      adjustmentTypes: {
        title: "Tipo de Ajuste de estoque"
      }
    },
    'en_US': {
      searchBar: {
        placeholder: 'Search..'
      },
      table: {
        label: {
          date: 'Date',
          code: 'Code',
          productCode: 'Ref. Product',
          type: 'Type',
          note: 'Adjustment Note',
          quantity: 'Quantity',
          operation: 'Operation'
        },
        operation: {
          INPUT: 'INPUT',
          OUTPUT: 'OUTPUT'
        }
      },
      adjustmentTypes: {
        title: "Adjustment Type"
      }
    }
  }

  public static get(language?: string) {
    return StockAdjustmentTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
