import { Component, EventEmitter, OnInit, Output, OnDestroy } from '@angular/core';

// Translate
import { PurchasesTranslate } from '@pages/stock/purchases/purchases.translate';

// Components
import { ProductsSelectorComponent } from '@pages/stock/products/components/selector/selector.component';

// Services
import { PurchasesService } from '@pages/stock/purchases/purchases.service';
import { BillsToPayService } from '@pages/financial/bills-to-pay/bills-to-pay.service';

// Interfaces
import { IStockPurchase, EStockPurchasePaymentStatus, EStockPurchaseStatus } from '@shared/interfaces/IStockPurchase';
import { IFinancialBillToPay, EFinancialBillToPayOrigin, EFinancialBillToPayStatus, FinancialBillToPayCategoryDefault, EFinancialBillToPayBeneficiaryType } from '@shared/interfaces/IFinancialBillToPay';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { DateTime } from '@shared/utilities/dateTime';
import { FieldMask } from '@shared/utilities/fieldMask';
import { FiscalService } from '@pages/fiscal/fiscal.service';

// Settingers
import { cst as cstICMS } from '@shared/settingers/icms';
import { cst as cstPIS } from '@shared/settingers/pis';
import { cst as cstCOFINS } from '@shared/settingers/cofins';
import { ProductCommercialUnitsService } from '@pages/registers/_aggregates/stock/product-commercial-units/product-commercial-units.service';
import { ProductCategoriesService } from '@pages/registers/_aggregates/stock/product-categories/product-categories.service';
import { ProductDepartmentsService } from '@pages/registers/_aggregates/stock/product-departments/product-departments.service';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';

@Component({
  selector: 'purchases-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class PurchasesRegisterComponent implements OnInit, OnDestroy {

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  public static shared: PurchasesRegisterComponent;

  public translate = PurchasesTranslate.get()['modal']['action']['register']['panel'];

  public loading: boolean = true;
  public data: any = {};
  public sending: boolean = false;

  public categoriesData: any[] = [];
  public commercialUnitsData: any[] = [];
  public departmentsData: any[] = [];
  public checkCategories: boolean = false;
  public checkCommercialUnits: boolean = false;
  public checkDepartments: boolean = false;

  public productsFormArray: FormArray;

  public installments: number[];
  public expirationDays: number[];
  public fiscalSettings: any;
  public cstICMS: any;
  public cstPIS: any;
  public cstCOFINS: any;
  
  public isFiscal: boolean = Utilities.isFiscal;
  public isMatrix: boolean = Utilities.isMatrix;
  public isSimplesNacional: boolean = true;

  public get useDepartments(): boolean {
    return Utilities.stockDepartmentsEnabled;
  }

  private layerComponent: any;

  constructor(
    private formBuilder: FormBuilder,
    private purchasesService: PurchasesService,
    private billsToPayService: BillsToPayService,
    private fiscalService: FiscalService,
    private productCommercialUnitsService: ProductCommercialUnitsService,
    private productCategoriesService: ProductCategoriesService,
    private productDepartmentsService: ProductDepartmentsService
  ) {
    PurchasesRegisterComponent.shared = this;
  }

  public ngOnInit() {

    this.callback.emit({ instance: this });

    this.installments = [...Array(12).keys()].map((v) => v + 1);
    this.expirationDays = [...Array(31).keys()].map((v) => v + 1);

    this.onResetPanel();

    // this.fiscalService.removeListeners("store-settings", "PurchasesRegisterComponent");

    // this.fiscalService.getStoreSettings("PurchasesRegisterComponent", (fiscalSettings)=>{
    //   this.fiscalSettings = fiscalSettings;
    // });

     // parse objects

     const parser = (obj, mode = 1) => {

      const arr = [];

      if (mode == 1) {

        for (let [key, value] of Object.entries(obj)) {
          arr.push({ key, value: (key + ' - '+ value) });
        }

      } else if (mode == 2) {

        for (let [key, value] of Object.entries(obj)) {

          const options = [];

          for (let [k, v] of Object.entries(value)) {
            options.push({ key: k, value: (k + ' - '+ v) });
          }

          arr.push({ key, options });
        }
      }

      arr.sort((a, b) => a > b ? -1 : (a < b ? 1 : 0));

      return arr;
    };

    this.cstICMS = parser(cstICMS, 2);
    this.cstPIS = parser(cstPIS);
    this.cstCOFINS = parser(cstCOFINS);
  }

  // Initialize Method

  public bootstrap(settings: any = {}) {

    const data = settings.data;
    
    this.onResetPanel();  

    this.productCategoriesService.getCategories('PurchasesRegisterComponent', (data) => {
      this.categoriesData = data;
      this.checkCategories = true;
    });
    
    this.productCommercialUnitsService.getUnits('PurchasesRegisterComponent', (data) => {
      this.commercialUnitsData = data;
      this.checkCommercialUnits = true;
    });

    if (this.useDepartments) {
      this.productDepartmentsService.getDepartments('PurchasesRegisterComponent', (data) => {
        this.departmentsData = data;
        this.checkDepartments = true;
      });
    } else {
      this.checkDepartments = true;
    }

    this.fiscalService.removeListeners("store-settings", "PurchasesRegisterComponent");
    this.fiscalService.getStoreSettings("PurchasesRegisterComponent", (fiscalSettings)=>{
      this.fiscalSettings = fiscalSettings;

      ProductsSelectorComponent.shared.bootstrap({ selectAll: true });  

      if (
        (settings.data.provider && settings.data.provider.phone) ||
        (settings.data.provider && settings.data.provider.email)
      ) {

        data.contacts = {}

        if (settings.data.provider.phone) {
          data.contacts.phone = settings.data.provider.phone;
        }

        if (settings.data.provider.email) {
          data.contacts.email = settings.data.provider.email;
        }
      }

      if (settings.data.products && (settings.data.products.length > 0)) {
        ProductsSelectorComponent.shared.selectProducts(this.filterRegisterProducts(data.products));
      }
      
      if (settings.data.purchaseDate) {
        data.purchaseDate = DateTime.formatDate(data.purchaseDate, 'string', 'BR', 'D');
      } else {
        data.purchaseDate = DateTime.formatDate(DateTime.getDate(), 'string', 'BR', 'D');
      }


      if (settings.data.billToPayCode) {

        this.billsToPayService.query([{
          field: "code", operator: "=", value: parseInt(settings.data.billToPayCode)
        }], false, false, false, false).then((res)=>{

          data.billToPay = res[0];

          data.billToPay.expirationDay = parseInt(data.billToPay.installments[0].dueDate.split("-")[2]);
          data.billToPay._installments = data.billToPay.installments;
          data.billToPay.installments = data.billToPay.totalInstallments;

          this.generateBalance();
        });
      } else {
        data.billToPay = { installments: 1, expirationDay: 15, installmentValue: 0 };
      }

      data.configFromXml = !!data.configuredFromXml;

      this.data = data;

      (this.data.products || []).forEach((product) => {
        product.selectedItems = this.resolveQuantity(product);
      });
    });

    // setInterval(()=>{
    //   console.log(this.data.products)
    // }, 2000);

  }

  // User Interface Actions - Products

  public onQuickSearch(input: any, index: number = -1) {

    const value = $$(input).val();

    if (value != '') {
      
      Utilities.loading();
  
      ProductsSelectorComponent.shared.onSearch({
        where: [
          { field: 'code', operator: '=', value: parseInt(value) }
        ]
      }, true, false).then((data: any) => {

        if (this.data.configFromXml && data.length > 0) {

          data[0].tributes = this.data.products[index].tributes;
          data[0].cest = this.data.products[index].cest;
          data[0].ncm = this.data.products[index].ncm;
          data[0].quantity = this.data.products[index].quantity;
          data[0].selectedItems = this.data.products[index].quantity;
          data[0].costPrice = this.data.products[index].costPrice;

          this.data.products[index] = data[0];

          this.generateBalance();
        }

        if (ProductsSelectorComponent.shared && this.data.configFromXml) {
          ProductsSelectorComponent.shared.reset(false); 
        }

        $$('.container-products .quick-search input').val('');
        Utilities.loading(false);
      });
    }else{
      delete this.data.products[index].code;
      if (ProductsSelectorComponent.shared && this.data.configFromXml) {
        ProductsSelectorComponent.shared.reset(false); 
      }
    }
  }

  public onDeleteProductItem(index: number) {

    ProductsSelectorComponent.shared.onDeselectProduct(this.data.products[index]);
    this.generateBalance();
  } 

  public onApplyPrice(data: any, inputField: any, type: string) {

    const value = FieldMask.priceFieldMask(inputField.value);

    if (type == 'costPrice') {
      data.costPrice = (parseFloat(value.replace(/\./g,'').replace(',','.')) || 0);
    }

    if (type == 'salePrice') {
      data.salePrice = (parseFloat(value.replace(/\./g,'').replace(',','.')) || 0);
    }

    inputField.value = value;

    this.generateBalance();
  }
  
  public onApplyQuantity(data: any, inputField: any) {

    const value = inputField.value;
    const quantity = FieldMask.numberFieldMask(value, 1);

    inputField.value = quantity;
    data.selectedItems = quantity;

    this.generateBalance();
  }
  
  public onApplyQuantityCorretion(data: any, inputField: any) {

    if (inputField.value == '') {

      inputField.value = 1;
      data.selectedItems = 1;

      this.generateBalance();
    }
  }

  // User Interface Actions - Settings

  public onCaptureSettingsPurchaseDate(input: any) {
    
    const value = FieldMask.dateFieldMask(input.value);
    
    input.value = value;
    this.data.purchaseDate = value;    
  }

  public onCaptureSettingsNote(input: any) {
    this.data.note = input.value;
  }

  public onCaptureSettingsAttachment(input: any) {

    $$(input).trigger('click');

    input.onchange = () => {     

      const file = input.files[0];
      const size = parseFloat(parseFloat(String(file.size / 1024 / 1024)).toFixed(2));

      if (file) {

        this.data.attachment = {
          name: file.name, 
          url: { 
            newFile: file,
            oldFile: ((this.data.attachment && this.data.attachment.url) ? this.data.attachment.url : null)
          },
          type: file.type,
          size: size
        };
      }
    };
  }

  public onCaptureFinancialInstallments(input: any) {
    this.data.billToPay.installments = input.value;
    this.generateBalance();
  }

  public onCaptureFinancialExpirationDay(input: any) {
    this.data.billToPay.expirationDay = input.value;
  }

  public onSelectXml(select: any) {

    this.data.configFromXml = select.value == 'true';

    if(!this.data.configFromXml){
      delete this.data.nf;
    }
  }

  public checkXMLAssoc(){

    let allcodesFiiled = true;
    let allCategoriesConfigured = true;
    let allCommercialUnitsConfigured = true;

    const data = (this.data.products || []);

    if(data.length > 0){
      data.forEach((item)=>{
        if(!item.code && !item.isRegister){
          allcodesFiiled = false;
        }

        if(!item.code && item.isRegister){
          if(!item.category?.code){
            allCategoriesConfigured = false;
          }

          if(!item.commercialUnit?.code){
            allCommercialUnitsConfigured = false;
          }
        }
      });
    }else{
      allcodesFiiled = false;
    }

    return (allcodesFiiled && allCategoriesConfigured && allCommercialUnitsConfigured);
  }
  
  public onCaptureXmlFile(input: any) {

    input.value = "";

    $$(input).trigger('click');

    input.onchange = () => {     
      const file = input.files[0];

      const fileReader = new FileReader();

      fileReader.onload = ()=>{

        PurchasesRegisterComponent.shared.data.products = [];

        const data = Utilities.parseXMLNfe(fileReader, this.fiscalSettings.simplesNacional);

        this.data.nf = {
          serie: data.serie,
          numero: data.numero,
          chave: data.chave
        };

        data.products.forEach((item)=>{

          item.category = {
            code: "",
            name: ""
          };

          item.commercialUnit = {
            code: "",
            name: ""
          };

        });

        this.moutProductsFormArray(data.products);

        PurchasesRegisterComponent.shared.data.products = data.products;
        this.generateBalance();
      };

      fileReader.readAsText(file);
      
    };
  }

  public moutProductsFormArray(products: any[], clear: boolean = true){

    this.productsFormArray = this.productsFormArray || this.formBuilder.array([]);

    if(clear){
      this.productsFormArray.clear();
    }

    products?.forEach((product)=>{

      const obj = this.formBuilder.group({
        category: this.formBuilder.group({
          code: [product?.category?.code],
          name: [product?.category?.name]
        }),
        department: this.formBuilder.group({
          code: [product?.department?.code],
          name: [product?.department?.name]
        }),
        commercialUnit: this.formBuilder.group({
          code: [product?.commercialUnit?.code],
          name: [product?.commercialUnit?.name]
        }),
      });

      this.productsFormArray.push(<any>obj);
    });

    return this.productsFormArray;
  }

  public getProductFormGroup(index: number): FormGroup | null {

    if (!this.productsFormArray || !this.productsFormArray.controls?.[index]) {
      return null;
    }

    return this.productsFormArray.controls[index] as FormGroup;
  }

  public getProductNestedGroup(index: number, field: 'category' | 'department' | 'commercialUnit'): FormGroup | null {

    const parentGroup = this.getProductFormGroup(index);
    const control = parentGroup?.get(field);

    return control instanceof FormGroup ? control : null;
  }

  public filterRegisterProducts(data: any[], isRegister: boolean = false){
    if(isRegister){
      return data.filter((prod)=> { 
        prod.selectedItems = prod.selectedItems ?? prod.quantity;
        return prod.code == undefined 
      });
    }else{
      return data.filter((prod)=> { return prod.code != undefined });
    }
  }

  public adjustProducts(data: any[]){
    return data.map((prod)=> { 
      prod.selectedItems = prod.selectedItems ?? prod.quantity;
      prod.unitaryCost = prod.unitaryCost ?? prod.costPrice; 
      return prod;
    });
  }

  public onChangeStockConciliation(event, item, index){
    const isRegister = $$(event.target).val() == "isRegister";
    const objValue = {code: '', name: ""};
    item.category = objValue
    item.commercialUnit = objValue;
    item.department = objValue;

    if(isRegister){
      item.isRegister = true;
      delete item.code;
    }else{
      delete item.isRegister
    }

    this.getProductNestedGroup(index, 'category')?.patchValue(objValue, { emitEvent: false });
    this.getProductNestedGroup(index, 'commercialUnit')?.patchValue(objValue, { emitEvent: false });
  }

  public onChangeCategory(event, item){
    const code = $$(event.target).val();
    const category = this.categoriesData.filter((cat)=> cat.code == code)[0];
    item.category = category;
  }

  public onChangeDepartment(event, item){
    const code = $$(event.target).val();
    const department = this.departmentsData.filter((dep)=> dep.code == code)[0];
    item.department = department;
  }

  public onChangeCommercialunit(event, item){
    const code = $$(event.target).val();
    const commercialUnit = this.commercialUnitsData.filter((unit)=> unit.code == code)[0];
    item.commercialUnit = commercialUnit;
  }
  
  // User Interface Actions - General

  public onRegister() {

    this.sending = true;

    const data = this.composeData();

    // console.log(data);

    this.purchasesService.registerPurchase(data).then(() => {
      this.callback.emit({ close: true });
      this.onResetPanel();
    });
  }

  public onResetPanel() {
    
    this.data = {};

    this.fiscalService.removeListeners("store-settings", "PurchasesRegisterComponent");
    this.productCommercialUnitsService.removeListeners("PurchasesRegisterComponent");
    this.productCategoriesService.removeListeners("PurchasesRegisterComponent");

    if (ProductsSelectorComponent.shared) {
      ProductsSelectorComponent.shared.reset(false); 
    }

    this.sending = false;
  }
  
  // Mask Methods

  public onApplyNumberMask(event: Event) {
    $$(event.currentTarget).val(FieldMask.numberFieldMask($$(event.currentTarget).val(), null, null, true));
  }

  // Layer Actions

  public onOpenLayer(type: string, index: number = null) {

    let selectedItem = '';
    const product = this.data?.products ? this.data.products[index] : undefined;

    // console.log(product);

    switch (type) {
      case 'categories':
        selectedItem = product?.category?.code;
        break;
      case 'departments':
        selectedItem = product?.department?.code;
        break;
      case 'commercialUnits':
        selectedItem = product?.commercialUnit?.code;
        break;
    }

    if (ProductsSelectorComponent.shared && this.data.configFromXml) {
      ProductsSelectorComponent.shared.reset(false); 
    }

    if (this.data.configFromXml) {
      setTimeout(()=>{ this.moutProductsFormArray(this.data.products); }, 1000);
    }


    this.layerComponent.onOpen({ activeComponent: type, selectedItem: selectedItem, additional: {index: index} });
  }

  // Event Listeners

  public onLayerResponse(event: any) {

    // Instance

    if (event.instance) {
      this.layerComponent = event.instance;   
    }

    // Data

    if (event.provider) {
      this.data.provider = event.provider;
    }

    if (event.products) {
      if (this.data.configFromXml) {

        if (event.additional?.index != undefined) {

          event.products[0] = { ...event.products[0], ...{
            tributes: this.data.products[event.additional.index].tributes,
            cest: this.data.products[event.additional.index].cest,
            ncm: this.data.products[event.additional.index].ncm,
            quantity: this.resolveQuantity(this.data.products[event.additional.index]),
            costPrice: this.data.products[event.additional.index].costPrice,
            selectedItems: this.resolveQuantity(this.data.products[event.additional.index]),
            category: this.data.products[event.additional.index].category,
            department: this.data.products[event.additional.index].department,
            commercialUnit: this.data.products[event.additional.index].commercialUnit
          }};

          this.data.products[event.additional.index] = event.products[0];
        } else {

          event.products.forEach((prod)=>{
            this.data.products.forEach((originProd, index)=>{
              if(prod.code == originProd.code){
                this.data.products[index] = {
                  ...prod,
                  selectedItems: this.resolveQuantity(this.data.products[index]),
                  category: this.data.products[index].category,
                  department: this.data.products[index].department,
                  commercialUnit: this.data.products[index].commercialUnit
                };
              }
            });  
          });

          this.data.products = this.adjustProducts(this.data.products);
        }

        if (ProductsSelectorComponent.shared) {
          ProductsSelectorComponent.shared.reset(false); 
        }


      }else{

        this.data.products = event.products;
      }

      this.moutProductsFormArray(this.data.products);

    }

    if (event.billToPay) {
      this.data.billToPay = event.billToPay;
    }

    if (event.category) {
      const index = event.additional?.index;

      if (index != null && this.data.products?.[index] && this.productsFormArray?.controls?.[index]) {

        const matched = this.categoriesData.find((cat) => cat.code == event.category.code) || event.category;

        this.data.products[index].category = matched;
        this.productsFormArray.controls[index].get('category')?.patchValue({
          code: matched?.code ?? '',
          name: matched?.name ?? ''
        }, { emitEvent: false });
      }
    }

    if (event.department) {
      const index = event.additional?.index;

      if (index != null && this.data.products?.[index] && this.productsFormArray?.controls?.[index]) {

        const matched = this.departmentsData.find((dep) => dep.code == event.department.code) || event.department;

        this.data.products[index].department = matched;
        this.productsFormArray.controls[index].get('department')?.patchValue({
          code: matched?.code ?? '',
          name: matched?.name ?? ''
        }, { emitEvent: false });
      }
    }

    if (event.commercialUnit) {
      const index = event.additional?.index;

      if (index != null && this.data.products?.[index] && this.productsFormArray?.controls?.[index]) {

        const matched = this.commercialUnitsData.find((unit) => unit.code == event.commercialUnit.code) || event.commercialUnit;

        this.data.products[index].commercialUnit = matched;
        this.productsFormArray.controls[index].get('commercialUnit')?.patchValue({
          code: matched?.code ?? '',
          name: matched?.name ?? ''
        }, { emitEvent: false });
      }
    }

    this.generateBalance();   
  }

  // Auxiliary Methods - Private

  private resolveQuantity(item: any): number {

    const rawValue = item?.selectedItems ?? item?.quantity ?? 0;

    if (typeof rawValue === 'number' && !isNaN(rawValue)) {
      return rawValue;
    }

    if (typeof rawValue === 'string') {
      const digitsOnly = rawValue.replace(/[^0-9]/g, '');
      const parsed = digitsOnly ? parseInt(digitsOnly, 10) : NaN;
      return isNaN(parsed) ? 0 : parsed;
    }

    const numeric = Number(rawValue);
    return isNaN(numeric) ? 0 : numeric;
  }

  private generateBalance() {

    this.data.balance = (this.data.balance || {});
    
    this.data.balance.totalItems = 0;
    this.data.balance.totalCost = 0;
    this.data.balance.totalPurchase = 0;

    // Perform calculations for products

    // console.log(this.data.products);

    if (this.data.products && this.data.products.length > 0) {

      for (const item of this.data.products) {

        const quantityToBuy = this.resolveQuantity(item);
        const quantityStock = item.quantity;

        const totalPurchaseCost = (item.costPrice * quantityToBuy);
        const totalStockCost = (item.unitaryCost * quantityStock);

        item.averageCost = ((totalPurchaseCost + totalStockCost) / (quantityToBuy + quantityStock) || 0);

        // console.log(item.code, item.unitaryCost , quantityStock, " - ",item, totalPurchaseCost, totalStockCost, quantityToBuy, quantityStock, ' -- ', item.averageCost)

        this.data.balance.totalItems += quantityToBuy;
        this.data.balance.totalCost += totalPurchaseCost;
      }
      
      this.data.balance.totalPurchase += this.data.balance.totalCost;
    }

    // Perform calculations for financial

    if (this.data.billToPay && this.data.billToPay.installments) {
      this.data.billToPay.installmentValue = (this.data.balance.totalPurchase / this.data.billToPay.installments);
    }
    
  }

  private composeData(): IStockPurchase {

    const response: IStockPurchase = {
      _id: this.data._id,
      code: this.data.code,
      provider: ({} as any),
      products: ([] as any),
      balance: ({} as any),
      note: this.data.note,
      billToPay: ({} as any),
      purchaseDate: DateTime.formatDate(this.data.purchaseDate).date,
      purchaseStatus: (this.data.purchaseStatus || EStockPurchaseStatus.PENDENT),
      paymentStatus: (this.data.paymentStatus || EStockPurchasePaymentStatus.PENDENT),
      configuredFromXml: !!(this.data.configFromXml)
    };    

    if (this.data.provider) {

      response.provider._id = this.data.provider._id;
      response.provider.code = this.data.provider.code;
      response.provider.name = this.data.provider.name;

      if (this.data.provider.address) {
        response.provider.address = this.data.provider.address;
      }

      if (this.data.provider.contacts && this.data.provider.contacts.phone) {
        response.provider.phone = this.data.provider.contacts.phone;
      }

      if (this.data.provider.contacts && this.data.provider.contacts.email) {
        response.provider.email = this.data.provider.contacts.email;
      }      
    }

    if (this.data.products) {

      response.balance.quantity = 0;
      
      for (const item of this.data.products) {

        const obj: any = {
          _id: item._id,
          code: item.code,
          name: item.name,
          costPrice: item.costPrice,
          averageCost: item.averageCost,          
          salePrice: item.salePrice,
          isRegister: !!item.isRegister,
          quantity: this.resolveQuantity(item)
        };

        if (item.serialNumber) {
          obj.serialNumber = item.serialNumber;
        }

        if (item.commercialUnit) {
          
          obj.commercialUnit = { 
            _id: item.commercialUnit._id,
            code: item.commercialUnit.code, 
            name: item.commercialUnit.name 
          };
        }

        if (item.category) {

          obj.category = { 
            _id: item.category._id,
            code: item.category.code, 
            name: item.category.name
          };
        }

        if (item.department) {

          obj.department = {
            _id: item.department._id,
            code: (typeof item.department.code === 'string' ? parseInt(<string>item.department.code, 10) : item.department.code),
            name: item.department.name
          };
        }

        if(!item.code && item.tributes){
          obj.tributes = Utilities.checkTributes(item.tributes);          
        }

        response.balance.quantity += obj.quantity;
        response.products.push(obj);
      }
    }    

    if (this.data.balance) {
      response.balance.total = this.data.balance.totalPurchase;
    }

    if (this.data.attachment) {
      response.attachment = this.data.attachment;
    }

    if (this.data.billToPay) {

      const beneficiary = <IFinancialBillToPay['beneficiary']>response.provider;
      beneficiary.type = EFinancialBillToPayBeneficiaryType.PROVIDER;

      const expirationDay = parseInt(this.data.billToPay.expirationDay);
      const installments = parseInt(this.data.billToPay.installments);
      const totalPurchase = parseFloat(this.data.balance.totalPurchase);

      // this.checkInstalments({qty: installments, totalPurchase: totalPurchase, installments: Utilities.generateInstallments(expirationDay, installments, totalPurchase)});

      response.billToPay = {
        code: this.data.billToPay.code,
        beneficiary,
        category: FinancialBillToPayCategoryDefault.getCategory(EFinancialBillToPayOrigin.PURCHASE),
        description: "Conta a pagar gerada automaticamente pela compra #$RPC('referenceCode')",
        currentInstallment: 0,        
        origin: EFinancialBillToPayOrigin.PURCHASE,
        status: EFinancialBillToPayStatus.PENDENT,
        installments: Utilities.generateInstallments(expirationDay, installments, totalPurchase),
        paidInstallments: 0,
        totalInstallments: installments,
        paid: 0,
        amount: totalPurchase
      };
    }

    if(this.data.purchaseStatus == EStockPurchaseStatus.CONCLUDED){
      response.paymentStatus = EStockPurchasePaymentStatus.PENDENT;
    }

    if (this.data.configFromXml) {
      response.nf = this.data.nf;
    }

    return response;
  }

  private checkInstalments(data){

    // console.log(this.data.billToPay, data);
  }

  // Destruction Method

  public ngOnDestroy() {
    this.onResetPanel();
  }

}
