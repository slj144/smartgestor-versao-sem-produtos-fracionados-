import { ProjectSettings } from "../../../../../../assets/settings/company-settings";

export class ProductsSelectorTranslate {

  private static obj = {
    'pt_BR': {
      searchBar: {
        placeholder: 'Pesquisar..'
      },
      search: {
        info: [
          'Resultados da pesquisa',
          'produtos',
          'peças'
        ],
        item: {
          label: {
            code: 'Código',
            department: 'Departamento',
            serialNumber: 'Número de Série',
            available: 'Disponível',
            price: 'Preço',
            outOfStock: 'Fora de Estoque',
            exceedsStock: 'A quantidade excede o estoque disponível!' // ADICIONAR ESTA LINHA
          }
        }
      },
      alert: {
        notFound: 'O produto não foi encontrado!',
        outOfStock: 'O produto está fora de estoque!'
      },
      placeholder: {
        beforeSearch: {
          label: [
            'Busque por produtos',
            'Busque por peças'
          ],
          instruction: 'Código, Nome, ou Código de Barras'
        },
        afterSearch: {
          label: 'Não houve resultado'
        }
      }
    },
    'en_US': {
      searchBar: {
        placeholder: 'Search..'
      },
      search: {
        info: [
          'Search results',
          'products',
          'parts'
        ],
        item: {
          label: {
            code: 'Code',
            department: 'Department',
            serialNumber: 'Serial Number',
            available: 'Available',
            price: 'Price',
            outOfStock: 'Out of Stock'
          }
        }
      },
      alert: {
        notFound: 'The product was not found!',
        outOfStock: 'The product is out of stock!',
        exceedsStock: 'The quantity exceeds available stock!' // ADICIONAR ESTA LINHA
      },
      placeholder: {
        beforeSearch: {
          label: [
            'Search by products',
            'Search by parts'
          ],
          instruction: 'Code, Name or Barcode'
        },
        afterSearch: {
          label: 'There was no result'
        }
      }
    }
  }

  public static get(language?: string) {
    return ProductsSelectorTranslate.obj[language ?? window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language];
  }

}
