import { ProjectSettings } from "../../../../../../../../assets/settings/company-settings";

export class DataExportTranslate {

  private static obj = {
    'pt_BR': {
      fileName: 'Produtos',
      label: {
        title: 'Assistente de Exportação',
        info: [
          'O assistente de exportação deve ser utilizado quando há a necessidade de obter os dados brutos dos produtos.',
          'O processo de exportação pode demorar alguns minutos, tudo depende da sua conexão com a internet e também a quantidade de dados a serem baixados do banco de dados.'
        ],
        table: {
          code: 'Código',
          name: 'Nome',
          serialNumber: 'Número de Série',
          barcode: 'Código de Barras',
          costPrice: 'Preço de Custo',
          salePrice: 'Preço de Venda',
          quantity: 'Quantidade',
          alert: 'Alerta',
          category: {
            title:'Categoria',
            sub: {
              code: 'Código',
              name: 'Nome'
            }
          },
          commercialUnit: {
            title:'Unidade Comercial',
            sub: {
              code: 'Código',
              name: 'Nome'
            }
          },
          provider: {
            title:'Fornecedor',
            sub: {
              code: 'Código',
              name: 'Nome'
            }
          }
        },
        button: 'Iniciar Exportação'
      }
    },
    'en_US': {
      fileName: 'Products',
      label: {
        title: 'Export Assistant',
        info: [
          'The export wizard should be used when there is a need to obtain raw product data.',
          'The export process can take a few minutes, it all depends on your internet connection and also the amount of data to be downloaded from the database.'
        ],
        table: {
          code: 'Code',
          name: 'Name',
          serialNumber: 'Serial Number',
          barcode: 'Barcode',
          costPrice: 'Cost Price',
          salePrice: 'Sale Price',
          quantity: 'Quantity',
          alert: 'Alert',
          category: {
            title: 'Category',
            sub: {
              code: 'Code',
              name: 'Name'
            }
          },
          commercialUnit: {
            title: 'Commercial Unit',
            sub: {
              code: 'Code',
              name: 'Name'
            }
          },
          provider: {
            title: 'Provider',
            sub: {
              code: 'Code',
              name: 'Name'
            }
          }
        },
        button: 'Start Export'
      }
    }
  }

  public static get(language?: string) {
    return DataExportTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
