// LOCALIZAÇÃO: src/app/pages/stock/products/components/modals/dataImport/dataImport.component.ts
// CORREÇÃO COMPLETA DO COMPONENTE DE IMPORTAÇÃO

import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import readXlsxFile from 'read-excel-file';

// Services
import { DataImportService } from './dataImport.service';
import { ProductsService } from '../../../../products.service';
import { ProductCategoriesService } from '../../../../../../registers/_aggregates/stock/product-categories/product-categories.service';
import { ProductCommercialUnitsService } from '../../../../../../registers/_aggregates/stock/product-commercial-units/product-commercial-units.service';
import { ProvidersService } from '../../../../../../registers/providers/providers.service';

// Interfaces
import { EStockLogAction } from '@shared/interfaces/IStockLog';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { IStockProduct } from '@shared/interfaces/IStockProduct';
import { EPersonType } from '@shared/enum/EPersonType';
import { IToolsService } from '@shared/services/iTools.service';
import { iTools } from '@itools/index';
import { DateTime } from '@shared/utilities/dateTime';

@Component({
  selector: 'data-import',
  templateUrl: './dataImport.component.html',
  styleUrls: ['./dataImport.component.scss']
})
export class DataImportComponent implements OnInit {

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  public settings: any = {
    model: {},
    informations: {
      mode: 'register',
      data: [],
      errors: [],
      valid: false
    }
  };

  public productsCategories: any = {};
  public productsCommercialUnits: any = {};
  public productsProviders: any = {};

  public checkBootstrap: boolean = false;

  private checkFileUrl: boolean = false;
  private checkProductsCategories: boolean = false;
  private checkProductsCommercialUnits: boolean = false;
  private checkProductsProviders: boolean = false;

  constructor(
    private dataImportService: DataImportService,
    private productsService: ProductsService,
    private productCategoriesService: ProductCategoriesService,
    private productCommercialUnitsService: ProductCommercialUnitsService,
    private productProvidersService: ProvidersService,
    private itoolsService: IToolsService
  ) { }

  public ngOnInit() {
    console.log('🚀 DataImport Component iniciando...');

    // Inicializa settings.informations AQUI para evitar erros
    this.settings.informations = {
      mode: 'register',
      data: [],
      errors: [],
      valid: false
    };

    this.checkFileUrl = true; // Temp

    this.dataImportService.getFileUrl().subscribe((url) => {
      this.settings.model = {
        fileName: 'Planilha de Importacao',
        fileLink: url
      };
      this.checkFileUrl = true;
    });

    this.productCategoriesService.getCategories('DataImportComponent', (data) => {
      const obj: { [key: number]: IStockProduct['category'] } = {}

      $$(data).map((_, item) => {
        obj[parseInt(<string>item.code)] = {
          _id: item._id,
          code: item.code,
          name: item.name
        };
      });

      this.productsCategories = obj;
      this.checkProductsCategories = true;
      console.log('✅ Categorias carregadas:', Object.keys(obj).length);
    });

    this.productCommercialUnitsService.getUnits('DataImportComponent', (data) => {
      const obj: { [key: number]: IStockProduct['commercialUnit'] } = {}

      $$(data).map((_, item) => {
        obj[parseInt(<string>item.code)] = {
          _id: item._id,
          code: item.code,
          name: item.name,
          symbol: item.symbol
        };
      });

      this.productsCommercialUnits = obj;
      this.checkProductsCommercialUnits = true;
      console.log('✅ Unidades comerciais carregadas:', Object.keys(obj).length);
    });

    this.productProvidersService.getProviders('DataImportComponent', (data) => {
      const obj: { [key: number]: IStockProduct['provider'] } = {}

      $$(data).map((_, item) => {
        // Cria o objeto apenas com as propriedades esperadas
        obj[parseInt(<string>item.code)] = {
          _id: item._id,
          code: item.code,
          name: item.name
        };

        // Adiciona propriedades opcionais se existirem
        if (item.address) {
          obj[parseInt(<string>item.code)].address = item.address;
        }

        if (item.contacts && item.contacts.email) {
          obj[parseInt(<string>item.code)].email = item.contacts.email;
        }

        if (item.contacts && item.contacts.phone) {
          obj[parseInt(<string>item.code)].phone = item.contacts.phone;
        }

        if (item.lastSupply) {
          obj[parseInt(<string>item.code)].lastSupply = item.lastSupply;
        }
      });

      this.productsProviders = obj;
      this.checkProductsProviders = true;
      console.log('✅ Fornecedores carregados:', Object.keys(obj).length);
    });

    // Verifica quando tudo está carregado
    const checkBootstrap = setInterval(() => {
      if (
        this.checkFileUrl &&
        this.checkProductsCategories &&
        this.checkProductsCommercialUnits &&
        this.checkProductsProviders
      ) {
        this.checkBootstrap = true;
        console.log('✅ Bootstrap completo!');
        clearInterval(checkBootstrap);
      }
    }, 250);

    this.callback.emit({ instance: this });
  }

  // Getter para verificar se é matriz
  public get isMatrix() {
    return Utilities.isMatrix;
  }

  // Initialize Method chamado pelo modal
  public bootstrap() {
    console.log('🎯 Bootstrap chamado pelo modal');

    // Garante que settings.informations está inicializado
    this.settings.informations = {
      mode: 'register',
      data: [],
      errors: [],
      valid: false
    };

    // Limpa o input de arquivo
    const inputFile = document.getElementById('inputXLSFile') as HTMLInputElement;
    if (inputFile) {
      inputFile.value = '';
    }
  }

  // Muda o modo de importação
  public onChangeSelect(event) {
    this.settings.informations.mode = event.currentTarget.value;
    this.settings.informations.data = [];
    this.settings.informations.errors = [];
    this.settings.informations.valid = false;

    // Limpa o input
    const inputFile = document.getElementById('inputXLSFile') as HTMLInputElement;
    if (inputFile) {
      inputFile.value = '';
    }
  }

  // Converte moeda para número
  private parseCurrencyToNumber(value: any): number {
    if (value == null || value === '') {
      return 0;
    }

    // Se já for número, retorna
    if (typeof value === 'number') {
      return value;
    }

    // Converte string para número
    const cleanValue = value
      .toString()
      .replace(/[R$\s]/g, '') // Remove R$ e espaços
      .replace(/\./g, '') // Remove pontos de milhar
      .replace(',', '.'); // Troca vírgula por ponto

    const result = parseFloat(cleanValue);
    return isNaN(result) ? 0 : result;
  }

  // Processa o arquivo selecionado
  public onChangeInput(event) {
    console.log('📁 Arquivo selecionado');

    const file: File = event.currentTarget.files[0];

    this.settings.informations.data = [];
    this.settings.informations.errors = [];
    this.settings.informations.valid = false;

    if (!file) {
      return;
    }

    // Verifica extensão
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      alert('Por favor, selecione um arquivo com extensão ".xlsx".');
      event.currentTarget.value = '';
      return;
    }

    let schema = {};

    if (this.isMatrix) {
      const checkRequired = (this.settings.informations.mode == 'register');

      schema = {
        'CODIGO': {
          prop: 'code',
          type: String,
          required: this.settings.informations.mode == "update",
          parse: (value) => this.checkString(value)
        },
        'NOME': {
          prop: 'name',
          type: String,
          required: checkRequired,
          parse: (value) => this.checkString(value)
        },
        'NUMERO DE SERIE': {
          prop: 'serialNumber',
          type: String,
          required: false,
          parse: (value) => this.checkString(value)
        },
        'QUANTIDADE': {
          prop: 'quantity',
          type: Number,
          required: checkRequired,
          parse: (value) => this.checkNumber(value, 'integer')
        },
        'ALERTA': {
          prop: 'alert',
          type: String,
          required: checkRequired,
          parse: (value) => this.checkNumber(value, 'integer')
        },
        'PRECO DE CUSTO': {
          prop: 'costPrice',
          type: Number,
          required: checkRequired,
          parse: (value) => this.checkNumber(value, 'float')
        },
        'PRECO DE VENDA': {
          prop: 'salePrice',
          type: Number,
          required: checkRequired,
          parse: (value) => this.checkNumber(value, 'float')
        },
        'CATEGORIA': {
          prop: 'category',
          type: String,
          required: checkRequired,
          parse: (value) => this.checkValue(value, 'category')
        },
        'TIPO': {
          prop: 'commercialUnit',
          type: String,
          required: checkRequired,
          parse: (value) => this.checkValue(value, 'commercialUnit')
        },
        'FORNECEDOR': {
          prop: 'provider',
          type: String,
          required: false,
          parse: (value) => this.checkValue(value, 'provider')
        },
        'CODIGO DE BARRAS': {
          prop: 'barcode',
          type: String,
          required: false,
          parse: (value) => this.checkString(value)
        }
      };
    } else {
      // Schema para filiais
      schema = {
        'CODIGO': {
          prop: 'code',
          type: String,
          required: true
        },
        'QUANTIDADE': {
          prop: 'quantity',
          type: Number,
          required: false,
          parse: (value) => this.checkNumber(value, 'integer')
        },
        'ALERTA': {
          prop: 'alert',
          type: String,
          required: false,
          parse: (value) => this.checkNumber(value, 'integer')
        },
        'PRECO DE CUSTO': {
          prop: 'costPrice',
          type: Number,
          required: false,
          parse: (value) => this.checkNumber(value, 'float')
        },
        'PRECO DE VENDA': {
          prop: 'salePrice',
          type: Number,
          required: false,
          parse: (value) => this.checkNumber(value, 'float')
        }
      };
    }

    // Lê o arquivo para verificar headers
    readXlsxFile(file).then((rows: any[]) => {
      console.log('📊 Linhas lidas:', rows.length);

      if (!rows || rows.length === 0) {
        alert('O arquivo selecionado não possui dados. Por favor, insira dados ou escolha outro arquivo.');
        return;
      }

      // Normaliza os headers
      const headers = rows[0].map((h: any) => {
        if (!h) return '';
        return h
          .toString()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim()
          .toUpperCase();
      });

      console.log('📋 Headers encontrados:', headers);
      console.log('📋 Headers esperados:', Object.keys(schema));

      const expectedHeaders = Object.keys(schema);
      const missing = expectedHeaders.filter(
        (h) => headers.indexOf(h.toUpperCase()) === -1
      );

      if (missing.length > 0) {
        console.error('❌ Headers faltando:', missing);
        alert(`A planilha está em um formato diferente do esperado.\n\nColunas faltando: ${missing.join(', ')}\n\nBaixe a planilha modelo e tente novamente.`);
        this.settings.informations.valid = false;
        return;
      }

      // Headers válidos, lê com schema
      readXlsxFile(file, { schema }).then((data) => {
        console.log('✅ Dados processados:', data.rows.length, 'linhas');

        const errors = data.errors;

        if (errors.length == 0) {
          if ((data.rows).length > 0) {
            this.settings.informations.data = data.rows;
            this.settings.informations.valid = true;
            console.log('✅ Importação válida! Botão deve estar habilitado.');
          } else {
            alert('O arquivo selecionado não possui dados. Por favor, insira dados ou escolha outro arquivo.');
          }
        } else {
          console.error('❌ Erros encontrados:', errors);

          // Processa os erros
          for (const item of errors) {
            switch (item.error) {
              case 'required':
                this.settings.informations.errors.push(
                  ` Linha ${(item.row + 1)} / Coluna <b>${item.column}</b> - O campo é obrigatório.`
                );
                break;
              case 'invalid':
                this.settings.informations.errors.push(
                  ` Linha ${(item.row + 1)} / Coluna <b>${item.column}</b> - O valor "${item.value}" é inválido.`
                );
                break;
              case 'nonexistent':
                this.settings.informations.errors.push(
                  ` Linha ${(item.row + 1)} / Coluna <b>${item.column}</b> - O código ${item.value} não está cadastrado no sistema.`
                );
                break;
            }
          }
        }
      }).catch((error) => {
        console.error('❌ Erro ao processar arquivo:', error);
        alert('Não foi possível ler o arquivo selecionado. Verifique se o documento está no formato correto.');
        this.settings.informations.valid = false;
      });
    }).catch((error) => {
      console.error('❌ Erro ao ler arquivo:', error);
      alert('Não foi possível ler o arquivo selecionado. Verifique se é um arquivo Excel válido.');
    });
  }

  // Limpa o input
  public onClearInput(event) {
    event.currentTarget.value = '';
    this.settings.informations.data = [];
    this.settings.informations.errors = [];
    this.settings.informations.valid = false;
  }

  // Executa a importação
  public onImport() {
    console.log('🚀 Iniciando importação...');

    let data = this.settings.informations.data;

    if (!data || data.length === 0) {
      alert('Nenhum dado para importar.');
      return;
    }

    // Processa dados para filiais
    if (!this.isMatrix) {
      data = data.map((item) => {
        const obj: any = {
          code: parseInt(item.code),
          branches: {}
        };

        obj.branches[Utilities.storeID] = {};

        if (item.quantity !== undefined && item.quantity !== null) {
          obj.branches[Utilities.storeID].quantity = item.quantity;
        }

        if (item.alert !== undefined && item.alert !== null) {
          obj.branches[Utilities.storeID].alert = isNaN(item.alert) ? 0 : item.alert;
        }

        if (item.costPrice !== undefined && item.costPrice !== null) {
          obj.branches[Utilities.storeID].costPrice = item.costPrice;
        }

        if (item.salePrice !== undefined && item.salePrice !== null) {
          obj.branches[Utilities.storeID].salePrice = item.salePrice;
        }

        return obj;
      });
    }

    if (data.length > 0) {
      console.log('📦 Importando', data.length, 'produtos...');

      this.productsService.registerProducts(data, null, { action: EStockLogAction.IMPORT }).then(() => {
        console.log('✅ Importação concluída!');

        // Força atualização da lista
        this.productsService.query([], true, true, false, true);

        alert(`✅ ${data.length} produto(s) importado(s) com sucesso!`);

        this.callback.emit({ close: true });
      }).catch((error) => {
        console.error('❌ Erro na importação:', error);
        alert('Erro ao importar produtos. Verifique o console para mais detalhes.');
        this.settings.informations.valid = false;
      });
    }
  }

  // Métodos auxiliares de validação
  private checkString(value: any) {
    return value ? value.toString().trim() : '';
  }

  private checkValue(value: any, type: string) {
    if (!value) {
      return null; // Permite valores vazios para campos opcionais
    }

    const code = parseInt(value.toString());

    if (!isNaN(code)) {
      if (type == 'category') {
        if (this.productsCategories[code]) {
          return this.productsCategories[code];
        } else {
          console.warn(`⚠️ Categoria ${code} não encontrada`);
          throw new Error('nonexistent');
        }
      }

      if (type == 'commercialUnit') {
        if (this.productsCommercialUnits[code]) {
          return this.productsCommercialUnits[code];
        } else {
          console.warn(`⚠️ Unidade comercial ${code} não encontrada`);
          throw new Error('nonexistent');
        }
      }

      if (type == 'provider') {
        if (this.productsProviders[code]) {
          return this.productsProviders[code];
        } else {
          console.warn(`⚠️ Fornecedor ${code} não encontrado`);
          throw new Error('nonexistent');
        }
      }
    } else {
      throw new Error('invalid');
    }
  }

  private checkNumber(value: any, type: string) {
    if (value === null || value === undefined || value === '') {
      return 0; // Valor padrão para campos numéricos vazios
    }

    let numValue: number;

    if (type == 'integer') {
      numValue = parseInt(value.toString());
    } else if (type == 'float') {
      numValue = this.parseCurrencyToNumber(value);
    }

    if (isNaN(numValue)) {
      throw new Error('invalid');
    }

    return numValue;
  }
}