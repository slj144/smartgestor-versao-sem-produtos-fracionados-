// ARQUIVO: src/app/pages/stock/products/components/modal/components/register/register.component.ts
// FUNCIONALIDADE: Componente de registro/edição de produtos com suporte a comissões
// LOCALIZAÇÃO: Modal de cadastro/edição de produtos no módulo de estoque

import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormControl } from '@angular/forms';
import { iTools } from '@itools/index';

// Services
import { ProductsService } from '@pages/stock/products/products.service';
import { ProvidersService } from '@pages/registers/providers/providers.service';
import { ProductCommercialUnitsService } from '@pages/registers/_aggregates/stock/product-commercial-units/product-commercial-units.service';
import { ProductCategoriesService } from '@pages/registers/_aggregates/stock/product-categories/product-categories.service';

// Translate
import { ProductsTranslate } from '@pages/stock/products/products.translate';

// Interfaces
import { IStockProduct } from '@shared/interfaces/IStockProduct';
import { EStockLogAction } from '@shared/interfaces/IStockLog';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { FieldMask } from '@shared/utilities/fieldMask';

// Settingers
import { origem, cst as cstICMS, baseCalculo, substituicaoTributaria } from '@shared/settingers/icms';
import { cst as cstPIS } from '@shared/settingers/pis';
import { cst as cstCOFINS } from '@shared/settingers/cofins';
import { FiscalService } from '@pages/fiscal/fiscal.service';

@Component({
  selector: 'produts-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class ProductsRegisterComponent implements OnInit, OnDestroy {

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  public translate = ProductsTranslate.get()['modal']['action']['register'];

  public settings: any = {};

  public productCodes: string[] = [];
  public productBarcodes: string[] = [];
  public productBlackList: string[] = [];

  public commercialUnitsData: any = [];
  public categoriesData: any = [];
  public providersData: any = [];
  public fiscalSettings: any = { simplesNacional: true };

  public checkBootstrap: boolean = false;
  public checkCategories: boolean = false;
  public checkCommercialUnits: boolean = false;
  public checkProviders: boolean = false;
  public checkFiscalSettings: boolean = false;

  public formProduct: FormGroup;

  public origemICMS: any;
  public cstICMS: any;
  public bcModalidadeDeterminacaoICMS: any;
  public stBcModalidadeDeterminacaoICMS: any;
  public cstPIS: any;
  public cstCOFINS: any;
  public stcsts = ["10", "30", "60", "70", "201", "202", "203", "500"];

  // ===== PROPRIEDADES PARA INPUTS MODERNIZADOS =====
  public isNameInputFocused: boolean = false;
  public isSalePriceInputFocused: boolean = false;
  public isCostPriceInputFocused: boolean = false;
  public isQuantityInputFocused: boolean = false;

  private layerComponent: any;

  constructor(
    private formBuilder: FormBuilder,
    private productsService: ProductsService,
    private providersService: ProvidersService,
    private productCommercialUnitsService: ProductCommercialUnitsService,
    private productCategoriesService: ProductCategoriesService,
    private fiscalService: FiscalService
  ) { }

  public ngOnInit() {


    // parse objects

    const parser = (obj, mode = 1) => {

      const arr = [];

      if (mode == 1) {

        for (let [key, value] of Object.entries(obj)) {
          arr.push({ key, value: (key + ' - ' + value) });
        }

      } else if (mode == 2) {

        for (let [key, value] of Object.entries(obj)) {

          const options = [];

          for (let [k, v] of Object.entries(value)) {
            options.push({ key: k, value: (k + ' - ' + v) });
          }

          arr.push({ key, options });
        }
      }

      arr.sort((a, b) => a > b ? -1 : (a < b ? 1 : 0));

      return arr;
    };

    this.origemICMS = parser(origem);
    this.cstICMS = parser(cstICMS, 2);
    this.bcModalidadeDeterminacaoICMS = parser(baseCalculo.modalidadeDeterminacao);
    this.stBcModalidadeDeterminacaoICMS = parser(substituicaoTributaria.baseCalculo.modalidadeDeterminacao);
    this.cstPIS = parser(cstPIS);
    this.cstCOFINS = parser(cstCOFINS);

    this.productCategoriesService.getCategories('ProductsRegisterComponent', (data) => {
      this.categoriesData = data;
      this.checkCategories = true;
    });

    this.productCommercialUnitsService.getUnits('ProductsRegisterComponent', (data) => {
      this.commercialUnitsData = data;
      this.checkCommercialUnits = true;
    });

    this.providersService.getProviders('ProductsRegisterComponent', (data) => {
      this.providersData = data;
      this.checkProviders = true;
    });

    this.fiscalService.getStoreSettings('ProductsRegisterComponent', (data) => {

      this.fiscalSettings = Object.values(data).length > 0 ? data : this.fiscalSettings;
      this.checkFiscalSettings = true;

      JSON.stringify(this.fiscalSettings);

      if (this.fiscalSettings.simplesNacional) {
        this.cstICMS = this.cstICMS.slice(1, 2);
      } else {
        this.cstICMS = this.cstICMS.slice(0, 1);
      }
    });

    this.callback.emit({ instance: this });

  }

  // Initialize Method

  public bootstrap(settings: any = {}) {

    this.settings = settings;
    this.settings.data = (settings.data || {});

    const timer = setInterval(() => {

      if (this.checkCommercialUnits && this.checkCategories && this.checkProviders && this.checkFiscalSettings) {

        this.formSettings(this.settings.data);
        this.checkBootstrap = true;

        clearInterval(timer);
      }
    }, (!(this.checkCommercialUnits && this.checkCategories && this.checkProviders && this.checkFiscalSettings) ? 1000 : 0));
  }

  // Getters and Setters Methods

  public get isMatrix() {
    return (Utilities.storeID == 'matrix');
  }

  public get isAdmin() {
    return Utilities.isAdmin;
  }

  public get isFiscal() {
    return Utilities.isFiscal;
  }

  // User Interface Actions 

  public formControl(path: string) {

    const arrPath = path.split('.');

    let formControl = this.formProduct.controls;

    for (let item of arrPath) {
      if (item != arrPath[arrPath.length - 1]) {
        formControl = (<FormGroup>formControl[item]).controls;
      }
    }

    return formControl[arrPath[arrPath.length - 1]];
  }

  public onChooseImage(inputId: string, targetId: string) {

    const input: any = document.getElementById(inputId);
    const target: any = document.getElementById(targetId);

    input.click();

    input.onchange = () => {

      const file = input.files[0];
      const size = (file.size / 1024 / 1024);

      this.settings.issues = (this.settings.issues || {});
      this.settings.issues.fileSize = (size > 2);

      if (size > 2) {

        input.val('');

        alert('A imagem deve possuir um tamanho menor que 2MB. Por favor, escolha outra imagem.');
        return;
      }

      if (file) {

        const reader = new FileReader();

        reader.onload = (event: any) => {
          target.src = event.target.result;
        };

        reader.readAsDataURL(file);

        this.formControl('thumbnail').setValue({
          url: {
            newFile: file,
            oldFile: ((this.settings.data.thumbnail && this.settings.data.thumbnail.url) ? this.settings.data.thumbnail.url : null)
          },
          type: file.type,
          size: size
        });
      }
    };
  }

  public onChangeSpecialization(select: any) {

    const value = select.value;

    // const clearValidators = (except?: "fuel" | "remedy")=>{
    //   const types = ["fuel", "remedy", ""]
    //   types.forEach((type)=>{
    //     if(type != except){

    //       console.log((<any>this.formControl(type)).controls);

    //       if(type != ""){
    //           (<any>this.formControl(type)).controls.forEach((control)=>{
    //             console.log(control);
    //           // control.clearValidators();
    //         });
    //       }


    //     }
    //   });
    // };

    // switch(value){
    //   case "fuel":{
    //     clearValidators("fuel");
    //     this.formControl("fuel.codigoAnp").addValidators([Validators.required]);
    //     this.formControl("fuel.descricaoAnp").addValidators([Validators.required]);
    //     break;
    //   }
    //   case "remedy":{
    //     clearValidators("remedy");
    //     this.formControl("remedy.codigoAnvisa").addValidators([Validators.required]);
    //     this.formControl("remedy.valorMaximo").addValidators([Validators.required]);
    //     break
    //   }
    //   default :{
    //     clearValidators();
    //   }
    // }

  }

  /**
 * 🎯 Ativa/desativa campos de comissão
 */
  public onToggleCommission(event: any): void {
    const isEnabled = event.target.checked;

    if (!isEnabled) {
      // Se desativar, reseta os valores
      this.formControl('commissionType').setValue('percentage');
      this.formControl('commissionValue').setValue(0);
    }
  }

  /**
  * 🎯 Aplica máscara durante a digitação
  * Mantém simples: apenas remove caracteres inválidos
  */
  public onApplyCommissionMask(event: any): void {
    const input = event.target;
    const type = this.formControl('commissionType').value;
    const cursorPos = input.selectionStart;
    let value = input.value;

    if (type === 'percentage') {
      // Para porcentagem: permite apenas números e ponto
      value = value.replace(/[^0-9.]/g, '');

      // Se começar com ponto, adiciona zero
      if (value.startsWith('.')) {
        value = '0' + value;
      }

      // Garante apenas um ponto
      const parts = value.split('.');
      if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
      }

      // Limita a 2 casas decimais
      if (parts.length === 2 && parts[1].length > 2) {
        value = parts[0] + '.' + parts[1].substring(0, 2);
      }

    } else {
      // Para valor fixo: permite apenas números e vírgula
      value = value.replace(/[^0-9,]/g, '');

      // Se começar com vírgula, adiciona zero
      if (value.startsWith(',')) {
        value = '0' + value;
      }

      // Garante apenas uma vírgula
      const parts = value.split(',');
      if (parts.length > 2) {
        value = parts[0] + ',' + parts.slice(1).join('');
      }

      // Limita a 2 casas decimais
      if (parts.length === 2 && parts[1].length > 2) {
        value = parts[0] + ',' + parts[1].substring(0, 2);
      }
    }

    // Atualiza o campo
    input.value = value;

    // Mantém a posição do cursor
    const diff = value.length - input.value.length;
    input.setSelectionRange(cursorPos + diff, cursorPos + diff);

    // Salva o valor numérico
    const numericValue = type === 'percentage'
      ? parseFloat(value) || 0
      : parseFloat(value.replace(',', '.')) || 0;

    this.formControl('commissionValue').setValue(numericValue);
  }

  /**
  * 🎯 Formata o valor ao sair do campo
  */
  public onApplyCommissionCorretion(event: any): void {
    const input = event.target;
    const type = this.formControl('commissionType').value;
    const numericValue = this.formControl('commissionValue').value || 0;

    if (type === 'percentage') {
      // Limita a 100%
      const finalValue = Math.min(numericValue, 100);

      // Formata para exibição (remove zeros desnecessários)
      if (finalValue === 0) {
        input.value = '0';
      } else if (finalValue === Math.floor(finalValue)) {
        input.value = finalValue.toString();
      } else {
        input.value = finalValue.toFixed(2).replace(/\.?0+$/, '');
      }

      // Atualiza o valor se foi limitado
      if (numericValue > 100) {
        this.formControl('commissionValue').setValue(100);
      }

    } else {
      // Para valor fixo: sempre 2 casas decimais com vírgula
      input.value = numericValue.toFixed(2).replace('.', ',');
    }
  }


  /**
  * 🎯 Calcula preview da comissão
  */
  public calculateCommissionPreview(): number {
    const salePrice = parseFloat(this.formControl('salePrice').value) || 0;
    const commissionValue = parseFloat(this.formControl('commissionValue').value) || 0;
    const commissionType = this.formControl('commissionType').value;

    if (salePrice === 0 || commissionValue === 0) {
      return 0;
    }

    return commissionType === 'percentage'
      ? (salePrice * commissionValue) / 100
      : commissionValue;
  }

  /**
  * 💰 Verifica se deve exibir a margem de lucro
  */
  public shouldShowProfitMargin(): boolean {
    const costPriceValue = this.formControl('costPrice').value;
    const salePriceValue = this.formControl('salePrice').value;

    if (costPriceValue == null || salePriceValue == null) {
      return false;
    }

    const costPrice = Utilities.parseCurrencyToNumber(costPriceValue);
    const salePrice = Utilities.parseCurrencyToNumber(salePriceValue);

    return costPrice > 0 && salePrice > 0;
  }

  /**
  * 💰 Calcula margem de lucro
  */
  public calculateProfitMargin(): { value: number; percentage: number } {
    const costPriceRaw = this.formControl('costPrice').value ?? '0';
    const salePriceRaw = this.formControl('salePrice').value ?? '0';

    const costPrice = Utilities.parseCurrencyToNumber(costPriceRaw);
    const salePrice = Utilities.parseCurrencyToNumber(salePriceRaw);

    if (costPrice === 0 || salePrice === 0) {
      return { value: 0, percentage: 0 };
    }

    const marginValue = salePrice - costPrice;
    const marginPercentage = (marginValue / costPrice) * 100;

    // Garante que retornamos números válidos
    return {
      value: isNaN(marginValue) ? 0 : marginValue,
      percentage: isNaN(marginPercentage) ? 0 : marginPercentage
    };
  }

  /**
  * 💰 Formata a margem de lucro para exibição
  */
  public getProfitMarginDisplay(): string {
    const margin = this.calculateProfitMargin();
    const valueFormatted = margin.value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    const percentageFormatted = margin.percentage.toFixed(1);

    return `${valueFormatted} (${percentageFormatted}%)`;
  }
  public onSubmit() {

    let isValid = true;

    const formData = this.formProduct.value;
    const source = this.settings.data;

    const category = (() => {

      let category = this.settings.data.category;

      $$(this.categoriesData).map((_, item) => {
        if (item.code == formData.category) {
          category = { code: parseInt(<string>item.code), name: item.name };
        }
      });

      return category;
    })();

    const commercialUnit = (() => {

      let commercialUnit = this.settings.data.commercialUnit;

      $$(this.commercialUnitsData).map((_, item) => {
        if (item.code == formData.commercialUnit) {
          commercialUnit = { code: parseInt(<string>item.code), name: item.name, symbol: item.symbol };
        }
      });

      return commercialUnit;
    })();

    const provider = (() => {

      let provider = this.settings.data.provider;

      $$(this.providersData).map((_, item) => {

        if (item.code == formData.provider) {

          provider = {
            _id: item._id,
            code: parseInt(<string>item.code),
            name: item.name
          };

          if (item.address && item.address.local && item.address.number && item.address.city && item.address.neighborhood && item.address.state) {
            provider.address = `${item.address.local}, Nº ${item.address.number}${(item.address.complement ? (', ' + item.address.complement) : '')}, ${item.address.neighborhood}, ${item.address.city} - ${item.address.state}`;
          }

          if (item.contacts) {

            if (item.contacts.phone) {
              provider.phone = item.contacts.phone;
            }

            if (item.contacts.email) {
              provider.email = item.contacts.email;
            }
          }
        }
      });

      // if (provider) {

      //   if (source && source.provider && source.provider.lastSupply) {
      //     provider.lastSupply = source.provider.lastSupply;
      //   } else {
      //     provider.lastSupply = iTools.FieldValue.date(Utilities.timezone);
      //   }
      // }

      return provider;
    })();

    const calcQuantity = (source ? parseInt((parseInt(formData.quantity) - source.quantity).toString()) : 0);

    const data: IStockProduct = {
      _id: source._id,
      code: source.code,
      barcode: (formData.barcode),
      internalCode: formData.internalCode.trim() || '',
      name: formData.name,
      description: formData.description.trim(),
      quantity: 0,
      alert: parseInt(formData.alert),
      costPrice: Utilities.parseCurrencyToNumber(formData.costPrice),
      salePrice: Utilities.parseCurrencyToNumber(formData.salePrice),
      commercialUnit: commercialUnit,
      category: category,
      ncm: formData.ncm.toString().replace(/\./g, '').replace(',', ''),
      provider: (provider || {}),
      specialization: formData.specialization
    };

    // 🎯 CORREÇÃO APLICADA - Monta objeto de comissão garantindo valores numéricos
    if (formData.commissionEnabled) {
      data.commission = {
        enabled: true,
        type: formData.commissionType,
        value: parseFloat(formData.commissionValue) || 0
      };
    } else {
      data.commission = {
        enabled: false,
        type: 'percentage',
        value: 0
      };
    }

    if (formData.thumbnail) {
      data.thumbnail = formData.thumbnail;
    }

    if (formData.serialNumber) {
      data.serialNumber = formData.serialNumber;
    }
    if (formData.batch) {
      data.batch = formData.batch;
    }

    if (formData.expirationDate) {
      data.expirationDate = formData.expirationDate;
    }

    if (formData.stockAdjustment) {
      // delete data.quantity;
    }

    if (formData.tributes && this.isFiscal) {

      data.cest = formData.cest;
      data.nve = formData.nve;
      data.codigoBeneficioFiscal = formData.codigoBeneficioFiscal;

      if (this.settings.data.tributes) {
        delete this.settings.data.tributes.matrix;
      }

      this.treatTributes(formData);

      if (Utilities.storeID == 'matrix') {
        data.tributes = formData.tributes;
      }
      else if (!Utilities.compareObject(formData.tributes, this.settings.data.tributes)) {
        data.branches = data.branches || {};
        data.branches[Utilities.storeID] = <any>{};
        data.branches[Utilities.storeID].tributes = formData.tributes;
      }
    }

    if (formData.specialization) {

      switch (formData.specialization) {
        case "fuel": {
          data.fuel = formData.fuel;
          break;
        }
        case "remedy": {
          data.remedy = formData.remedy;
          break;
        }
      }

    } else if (data.code) {
      data.fuel = (<any>"$unset()");
      data.remedy = (<any>"$unset()");
    }

    if (formData.isDisabled != data._isDisabled) {
      data._isDisabled = formData.isDisabled;
    }


    // Temp ----->

    if (!source.quantity) {
      data.quantity = parseInt(formData.quantity);
    } else {

      if (calcQuantity != 0) {
        data.quantity = iTools.FieldValue.inc(calcQuantity);
      } else {
        delete data.quantity;
      }
    }

    // Temp ----->


    const arrProducts = (() => {

      const arrProduct = [];

      if (Utilities.isMatrix) {
        arrProduct.push(data);
      } else {

        const obj: any = {
          _id: data._id,
          code: data.code,
          branches: data.branches || {}
        };

        obj.branches[Utilities.storeID] = obj.branches[Utilities.storeID] || {};
        obj.branches[Utilities.storeID].costPrice = data.costPrice;
        obj.branches[Utilities.storeID].salePrice = data.salePrice;
        obj.branches[Utilities.storeID].alert = data.alert;
        obj.branches[Utilities.storeID].quantity = data.quantity;

        arrProduct.push(obj);
      }

      return arrProduct;
    })();


    if (isValid) {

      // console.log(arrProducts);

      // return;

      this.productsService.registerProducts(arrProducts, null, { action: EStockLogAction.ADJUSTMENT }).then(() => {
        this.callback.emit({ close: true });
      });
    }

  }

  // Layer Actions

  public onOpenLayer(type: string) {

    let selectedItem = '';

    switch (type) {
      case 'StockAdjustment':

        break;
      case 'Categories':
        selectedItem = this.formControl('category').value;
        break;
      case 'CommercialUnits':
        selectedItem = this.formControl('commercialUnit').value;
        break;
      case 'Providers':
        selectedItem = this.formControl('provider').value;
        break;
    }

    this.layerComponent.onOpen({ activeComponent: type, selectedItem });
  }

  // Event Listeners

  public onLayerResponse(event: any) {

    if (event.instance) {
      this.layerComponent = event.instance;
    }

    if (event.commercialUnit) {
      this.formControl('commercialUnit').setValue(event.commercialUnit.code);
    }

    if (event.category) {
      this.formControl('category').setValue(event.category.code);
    }

    if (event.provider) {

      const hasProvider = this.providersData.filter((item) => { return item.code == event.provider.code })[0] != undefined;

      if (!hasProvider) {
        this.providersData.push(event.provider);
      }

      this.formControl('provider').setValue(event.provider.code);
    }
  }

  // Auxiliary Methods

  public onApplyNumberMask(event: Event, control: AbstractControl) {
    control.setValue(FieldMask.numberFieldMask($$(event.target)[0].value));
  }

  public onApplyPriceMask(event: Event, control: AbstractControl) {
    control.setValue(FieldMask.priceFieldMask($$(event.target)[0].value));
  }

  public onChangeICMSCST(select: any) {

    const cst = select.value;

    if (this.fiscalSettings.simplesNacional) {
      if (this.fiscalSettings.regimeTributarioEspecial != 5) {
        if (cst != '900') {
          this.formControl('tributes.icms.aliquota').patchValue(0);
        }
      } else {
        this.formControl('tributes.icms.aliquota').patchValue(0);
      }
    }

    this.validateSTCST(!this.isPassiveST(select.value));
  }



  private formSettings(data: any) {

    this.formProduct = this.formBuilder.group({
      code: [(data.code || '')],
      internalCode: [(data.internalCode || '')],
      thumbnail: [(data.thumbnail || '')],
      name: [(data.name || ''), [Validators.required]],
      description: [(data.description || '')],
      barcode: [(data.barcode || ''), [Validators.minLength(8)]],
      serialNumber: [(data.serialNumber || '')],
      batch: [(data.batch || '')],
      expirationDate: [(data.expirationDate || '')],
      quantity: [(data.quantity || 0), [Validators.required]],
      alert: [(data.alert || 0), [Validators.required]],
      costPrice: [(FieldMask.priceFieldMask((data.costPrice || 0).toFixed(2).replace('.', ','))), [Validators.required]],
      salePrice: [(FieldMask.priceFieldMask((data.salePrice || 0).toFixed(2).replace('.', ','))), [Validators.required]],

      // 🎯 NOVOS CAMPOS DE COMISSÃO
      commissionEnabled: [(data.commission ? data.commission.enabled : false)],
      commissionType: [(data.commission ? data.commission.type : 'percentage')],
      commissionValue: [(data.commission ? data.commission.value : 0)],

      category: [(data.category && data.category.code ? data.category.code : ''), [Validators.required]],
      commercialUnit: [(data.commercialUnit && data.commercialUnit.code ? data.commercialUnit.code : ''), [Validators.required]],
      provider: [(data.provider && data.provider.code ? data.provider.code : '')],
      cest: [data.cest ? data.cest : '', [Validators.maxLength(7)]],
      ncm: [data.ncm ? data.ncm : '', this.isFiscal ? [Validators.required, Validators.minLength(8), Validators.maxLength(8)] : []],
      nve: [data.nve ? data.nve : ''],
      codigoBeneficioFiscal: [data.codigoBeneficioFiscal ? data.codigoBeneficioFiscal : ''],
      isDisabled: [data._isDisabled],
      specialization: [data.specialization ?? ''],
      fuel: this.formBuilder.group({
        codigoAnp: [data?.fuel?.codigoAnp],
        descricaoAnp: [data?.fuel?.descricaoAnp],
        estadoConsumo: [Utilities.storeInfo.address.state]
      }),
      remedy: this.formBuilder.group({
        codigoAnvisa: [data?.remedy?.codigoAnvisa],
        valorMaximo: [data?.remedy?.valorMaximo],
        motivoInsencaoAnvisa: [data?.remedy?.motivoInsencaoAnvisa]
      }),
    });

    // console.log(this.formProduct.value);

    if (this.isFiscal) {

      // this.treatTributes(data, true);

      if (this.isPassiveST(data?.icms?.cst ?? "")) {
        this.validateSTCST();
      }

      const imcscst = (() => {
        if (this.fiscalSettings?.simplesNacional == undefined || this.fiscalSettings?.simplesNacional) {
          return "102";
        }

        return "00";
      })();

      this.formProduct.addControl("tributes", this.formBuilder.group({
        icms: this.formBuilder.group({
          origem: ["0", [Validators.required]],
          cst: [imcscst, [Validators.required]],
          aliquota: [0, [Validators.required]],
          baseCalculo: this.formBuilder.group({
            modalidadeDeterminacao: ['0', [Validators.required]],
            valor: [0, [Validators.required]]
          }),
          substituicaoTributaria: this.formBuilder.group({
            aliquota: [0, [Validators.required]],
            baseCalculo: this.formBuilder.group({
              modalidadeDeterminacao: [this.fiscalSettings?.simplesNacional ? '6' : '4', [Validators.required]],
              valor: [0, [Validators.required]],
              percentualReducao: [0]
            }),
            margemValorAdicionado: this.formBuilder.group({
              percentual: [0]
            }),
            fundoCombatePobreza: this.formBuilder.group({
              aliquota: [0, [Validators.required]],
              baseCalculo: this.formBuilder.group({
                valor: [0, [Validators.required]]
              }),
              valor: [0, [Validators.required]]
            }),
          }),
          fundoCombatePobreza: this.formBuilder.group({
            aliquota: [0, [Validators.required]],
            baseCalculo: this.formBuilder.group({
              valor: [0, [Validators.required]]
            }),
            valor: [0, [Validators.required]]
          }),
          valor: [0, [Validators.required]]
        }),
        pis: this.formBuilder.group({
          cst: [this.fiscalSettings?.simplesNacional ? '49' : "", [Validators.required]],
          baseCalculo: this.formBuilder.group({
            valor: [0]
          }),
          aliquota: [0],
          valor: [0],
          quantidadeVendida: [0],
          aliquotaReais: [0],
          substituicaoTributaria: this.formBuilder.group({
            baseCalculo: [0],
            aliquota: [0],
            quantidadeVendida: [0],
            aliquotaReais: [0],
            valor: [0]
          }),
        }),
        cofins: this.formBuilder.group({
          cst: [this.fiscalSettings?.simplesNacional ? '49' : "", [Validators.required]],
          aliquota: [0],
          valor: [0],
          baseCalculo: this.formBuilder.group({
            valor: [0]
          }),
          aliquotaReais: [0],
          substituicaoTributaria: this.formBuilder.group({
            baseCalculo: [0],
            aliquota: [0],
            aliquotaReais: [0],
            valor: [0]
          }),
        }),
        valorAproximadoTributos: [0]
      }));

      // console.log("after: ", this.treatTributes(Utilities.deepClone(data), true));

      data.tributes = this.treatTributes(data, true);

      this.formProduct.get("tributes").patchValue(data.tributes);
    }
  }

  private getTributes(data) {
    return data.tributes || {};
  }

  private treatTributes(data, formatCurrency: boolean = false) {

    const tributes = formatCurrency ? Utilities.deepClone(this.getTributes(data)) : this.getTributes(data);

    // TRIBUTES

    tributes['icms'] = tributes['icms'] || {};
    tributes['pis'] = tributes['pis'] || {};
    tributes['cofins'] = tributes['cofins'] || {};

    // ICMS

    const formartPercentual = (value) => {
      return parseFloat(value).toFixed(2).replace(".", ",");
    };

    const formatPrice = (value) => {
      return (FieldMask.priceFieldMask((value || 0).toFixed(2).replace('.', ',')));
    }

    const modbc = "3";
    const stmodbc = this.fiscalSettings?.simplesNacional ? '6' : '4';

    tributes['icms'].aliquota = !formatCurrency ? Utilities.parsePercentualToNumber((tributes['icms'].aliquota || 0)) : formartPercentual((tributes['icms'].aliquota || 0));
    tributes['icms'].valor = !formatCurrency ? Utilities.parseCurrencyToNumber(tributes['icms'].valor || 0) : formatPrice(tributes['icms'].valor || 0);
    tributes['icms'].baseCalculo = tributes['icms'].baseCalculo || {};
    tributes['icms'].baseCalculo.modalidadeDeterminacao = !formatCurrency ? parseInt(tributes['icms'].baseCalculo.modalidadeDeterminacao || modbc) : tributes['icms'].baseCalculo.modalidadeDeterminacao?.toString() || modbc;
    tributes['icms'].baseCalculo.valor = !formatCurrency ? Utilities.parseCurrencyToNumber(tributes['icms'].baseCalculo.valor || 0) : formatPrice(tributes['icms'].baseCalculo.valor || 0);

    tributes['icms'].substituicaoTributaria = tributes['icms'].substituicaoTributaria || {};
    tributes['icms'].substituicaoTributaria.aliquota = !formatCurrency ? Utilities.parsePercentualToNumber(tributes['icms'].substituicaoTributaria.aliquota || 0) : formartPercentual((tributes['icms'].substituicaoTributaria.aliquota || 0));
    tributes['icms'].substituicaoTributaria.baseCalculo = tributes['icms'].substituicaoTributaria.baseCalculo || {};
    tributes['icms'].substituicaoTributaria.baseCalculo.modalidadeDeterminacao = !formatCurrency ? parseInt(tributes['icms'].substituicaoTributaria.baseCalculo.modalidadeDeterminacao || stmodbc) : tributes['icms'].substituicaoTributaria.baseCalculo.modalidadeDeterminacao?.toString() || stmodbc;
    tributes['icms'].substituicaoTributaria.baseCalculo.percentualReducao = !formatCurrency ? Utilities.parsePercentualToNumber(tributes['icms'].substituicaoTributaria.baseCalculo.percentualReducao || 0) : (formartPercentual(tributes['icms'].substituicaoTributaria.baseCalculo.percentualReducao || 0));
    tributes['icms'].substituicaoTributaria.baseCalculo.valor = !formatCurrency ? Utilities.parseCurrencyToNumber(tributes['icms'].substituicaoTributaria.baseCalculo.valor || 0) : formatPrice(tributes['icms'].substituicaoTributaria.baseCalculo.valor || 0);

    tributes['icms'].substituicaoTributaria.margemValorAdicionado = tributes['icms'].substituicaoTributaria.margemValorAdicionado || {};
    tributes['icms'].substituicaoTributaria.margemValorAdicionado.percentual = !formatCurrency ? Utilities.parseCurrencyToNumber(tributes['icms'].substituicaoTributaria.margemValorAdicionado.percentual || 0) : formatPrice(tributes['icms'].substituicaoTributaria.margemValorAdicionado.percentual || 0);

    tributes['icms'].substituicaoTributaria.fundoCombatePobreza = tributes['icms'].substituicaoTributaria.fundoCombatePobreza || {};
    tributes['icms'].substituicaoTributaria.fundoCombatePobreza.aliquota = !formatCurrency ? Utilities.parsePercentualToNumber(tributes['icms'].substituicaoTributaria.fundoCombatePobreza.aliquota || 0) : (formartPercentual((tributes['icms'].substituicaoTributaria.fundoCombatePobreza.aliquota || 0)));
    tributes['icms'].substituicaoTributaria.fundoCombatePobreza.baseCalculo = tributes['icms'].substituicaoTributaria.fundoCombatePobreza.baseCalculo || {};
    tributes['icms'].substituicaoTributaria.fundoCombatePobreza.baseCalculo.valor = !formatCurrency ? Utilities.parseCurrencyToNumber(tributes['icms'].substituicaoTributaria.fundoCombatePobreza.baseCalculo.valor || 0) : formatPrice(tributes['icms'].substituicaoTributaria.fundoCombatePobreza.baseCalculo.valor);
    tributes['icms'].substituicaoTributaria.fundoCombatePobreza.valor = !formatCurrency ? Utilities.parseCurrencyToNumber(tributes['icms'].substituicaoTributaria.fundoCombatePobreza.valor || 0) : formatPrice(tributes['icms'].substituicaoTributaria.fundoCombatePobreza.valor);

    tributes['icms'].fundoCombatePobreza = tributes['icms'].fundoCombatePobreza || {};
    tributes['icms'].fundoCombatePobreza.aliquota = !formatCurrency ? Utilities.parsePercentualToNumber(tributes['icms'].fundoCombatePobreza.aliquota || 0) : (formartPercentual((tributes['icms'].fundoCombatePobreza.aliquota || 0)));
    tributes['icms'].fundoCombatePobreza.baseCalculo = tributes['icms'].fundoCombatePobreza.baseCalculo || {};
    tributes['icms'].fundoCombatePobreza.baseCalculo.valor = !formatCurrency ? Utilities.parseCurrencyToNumber(tributes['icms'].fundoCombatePobreza.baseCalculo.valor || 0) : formatPrice(tributes['icms'].fundoCombatePobreza.baseCalculo.valor);
    tributes['icms'].fundoCombatePobreza.valor = !formatCurrency ? Utilities.parseCurrencyToNumber(tributes['icms'].fundoCombatePobreza.valor || 0) : formatPrice(tributes['icms'].fundoCombatePobreza.valor);

    // PIS - COFINS

    const piscofins = (item: "pis" | "cofins") => {

      tributes[item] = tributes[item] || {};
      tributes[item].aliquota = !formatCurrency ? Utilities.parsePercentualToNumber(tributes[item].aliquota || 0) : (formartPercentual((tributes[item].aliquota || 0)));
      tributes[item].valor = !formatCurrency ? Utilities.parseCurrencyToNumber(tributes[item].valor || 0) : formatPrice(tributes[item].valor || 0);
      tributes[item].baseCalculo = tributes[item].baseCalculo || {};
      // tributes[item].baseCalculo.valor = !formatCurrency ? Utilities.parseCurrencyToNumber(tributes[item].baseCalculo.valor || 0) : formatPrice(tributes[item].baseCalculo.valor);
      // tributes[item].quantidadeVendida = !formatCurrency ? Utilities.parseCurrencyToNumber(tributes[item].quantidadeVendida || 0) : formatPrice(tributes[item].quantidadeVendida);
      tributes[item].aliquotaReais = !formatCurrency ? Utilities.parseCurrencyToNumber(tributes[item].aliquotaReais || 0) : formatPrice(tributes[item].aliquotaReais);


      // (!formatCurrency ? Utilities.parseCurrencyToNumber(tributes[item].baseCalculo.valor || 0) : formatPrice(tributes[item].baseCalculo.valor));
      // console.log(formatCurrency, !formatCurrency ? Utilities.parseCurrencyToNumber(tributes[item].substituicaoTributaria.baseCalculo || 0) : formatPrice(tributes[item].substituicaoTributaria.baseCalculo || 0));

      tributes[item].substituicaoTributaria = tributes[item].substituicaoTributaria || {};
      tributes[item].substituicaoTributaria.baseCalculo = !formatCurrency ? Utilities.parseCurrencyToNumber(tributes[item].substituicaoTributaria.baseCalculo || 0) : formatPrice(tributes[item].substituicaoTributaria.baseCalculo || 0);
      tributes[item].substituicaoTributaria.aliquota = !formatCurrency ? Utilities.parsePercentualToNumber(tributes[item].substituicaoTributaria.aliquota || 0) : (formartPercentual((tributes[item].substituicaoTributaria.aliquota || 0)));
      // tributes[item].substituicaoTributaria.quantidadeVendida = Utilities.parseCurrencyToNumber(tributes[item].substituicaoTributaria.quantidadeVendida || 0);
      tributes[item].substituicaoTributaria.aliquotaReais = !formatCurrency ? Utilities.parseCurrencyToNumber(tributes[item].substituicaoTributaria.aliquotaReais || 0) : formatPrice(tributes[item].substituicaoTributaria.aliquotaReais);
      tributes[item].substituicaoTributaria.valor = !formatCurrency ? Utilities.parseCurrencyToNumber(tributes[item].substituicaoTributaria.valor || 0) : formatPrice(tributes[item].substituicaoTributaria.valor || 0);
    };

    piscofins("pis");
    piscofins("cofins");

    console.log(tributes);

    tributes.valorAproximadoTributos = !formatCurrency ? Utilities.parseCurrencyToNumber(tributes.valorAproximadoTributos || 0) : formatPrice(tributes.valorAproximadoTributos);

    return tributes;
  }

  private isPassiveST(cst) {
    return this.stcsts.includes(cst);
  }

  private validateSTCST(onlyClear = false) {
    this.formControl('cest').clearValidators();
    this.formControl('cest').addValidators(onlyClear ? [Validators.maxLength(7)] : [Validators.required, Validators.minLength(7), Validators.maxLength(7)]);
    this.formControl('cest').patchValue(this.formControl('cest').value);
  }

  // ===== MÉTODOS PARA INPUTS MODERNIZADOS =====

  // Métodos para campo de nome
  public onNameInputFocus(): void {
    this.isNameInputFocused = true;
  }

  public onNameInputBlur(): void {
    this.isNameInputFocused = false;
  }

  public getNameCharProgress(): number {
    const value = this.formControl('name').value || '';
    return (value.length / 100) * 100;
  }

  // Métodos para campo de preço de venda
  public onSalePriceInputFocus(): void {
    this.isSalePriceInputFocused = true;
  }

  public onSalePriceInputBlur(): void {
    this.isSalePriceInputFocused = false;
  }

  // Métodos para campo de preço de custo
  public onCostPriceInputFocus(): void {
    this.isCostPriceInputFocused = true;
  }

  public onCostPriceInputBlur(): void {
    this.isCostPriceInputFocused = false;
  }

  // Métodos para campo de quantidade
  public onQuantityInputFocus(): void {
    this.isQuantityInputFocused = true;
  }

  public onQuantityInputBlur(): void {
    this.isQuantityInputFocused = false;
  }

  public increaseQuantity(): void {
    const currentValue = parseInt(this.formControl('quantity').value) || 0;
    this.formControl('quantity').setValue(currentValue + 1);
  }

  public decreaseQuantity(): void {
    const currentValue = parseInt(this.formControl('quantity').value) || 0;
    if (currentValue > 0) {
      this.formControl('quantity').setValue(currentValue - 1);
    }
  }


  // Destruction Method

  public ngOnDestroy() {

    this.productsService.removeListeners('types', 'ProductsRegisterComponent');
    this.productsService.removeListeners('categories', 'ProductsRegisterComponent');
    this.providersService.removeListeners('records', 'ProductsRegisterComponent');

  }

}
