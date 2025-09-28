import { Component, EventEmitter, OnInit, Output, OnDestroy } from '@angular/core';

// Components
import { ProductsSelectorComponent } from '../../../../../../stock/products/components/selector/selector.component';

// Services
import { FiscalService } from '@pages/fiscal/fiscal.service';
import { ProductsService } from '@pages/stock/products/products.service';

// Translate
import { PurchasesTranslate } from '../../../../../purchases/purchases.translate';

// Interfaces
import { IStockProduct } from '@shared/interfaces/IStockProduct';


// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { FieldMask } from '@shared/utilities/fieldMask';
import { EStockLogAction } from '@shared/interfaces/IStockLog';


@Component({
  selector: 'xml-import',
  templateUrl: './xmlImport.component.html',
  styleUrls: ['./xmlImport.component.scss']
})
export class XMLImportComponent implements OnInit, OnDestroy {

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  public static shared: XMLImportComponent;

  @Output() public embed: boolean = false;

  public translate = PurchasesTranslate.get()['modal']['action']['register']['panel'];

  public loading: boolean = true;
  public data: any = {products: []};
  public installments: number[];
  public expirationDays: number[];
  public fiscalSettings: any = {};
  public settings: any;

  private layerComponent: any;

  constructor(
    private fiscalService: FiscalService,
    private productsServie: ProductsService
  ) {
    XMLImportComponent.shared = this;
  }

  public ngOnInit() {

    this.callback.emit({ instance: this });

    this.fiscalService.removeListeners("store-settings", "XMLImportComponent");

    this.fiscalService.getStoreSettings("XMLImportComponent", (fiscalSettings)=>{
      this.fiscalSettings = fiscalSettings;
    });

  }

  // Initialize Method

  public bootstrap(settings: any = {}) {

    this.settings = settings;
    // const data = settings.data;
    
    this.settings.fields = {
      name: true, quantity: true, ncm: true,
      cest: true, costPrice: false
    };

    this.onResetPanel();  
    this.data.products = [];
    // this.data = data;
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
      }, true, false).then((data) => {

        // console.log(data);

        this.data.products[index].code = data[0].code;
        this.data.products[index]._id = data[0]._id;

        $$('.container-products .quick-search input').val('');
        Utilities.loading(false);
      });
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

  public isEnabled(){

    let allcodesFiiled = true;

    const data = (this.data.products || []);

    if(data.length > 0){
      data.forEach((item)=>{
        if(!item.code){
          allcodesFiiled = false;
        }
      });
    }else{
      allcodesFiiled = false;
    }

    return allcodesFiiled;
  }

  // User Interface Actions - Settings

  public onCaptureXmlFile(input: any) {

    $$(input).trigger('click');

    input.onchange = () => {     

      const file = input.files[0];
      const size = parseFloat(parseFloat(String(file.size / 1024 / 1024)).toFixed(2));


      const fileReader = new FileReader();

      fileReader.onload = ()=>{

        const nfeDocument = new DOMParser().parseFromString(fileReader.result.toString(), "text/xml");
        const detContainer = nfeDocument.querySelectorAll("NFe infNFe det") || [];

        detContainer.forEach(det=>{

          const product: any = {
            xmlCode: (det.querySelector("prod")?.querySelector("cProd")?.textContent || "").trim(),
            barcode: (det.querySelector("prod")?.querySelector("cEANTrib")?.textContent || "").trim(),
            name: (det.querySelector("prod")?.querySelector("xProd")?.textContent || "").trim(),
            ncm: (det.querySelector("prod")?.querySelector("NCM")?.textContent || "").trim(),
            cest: (det.querySelector("prod")?.querySelector("CEST")?.textContent || "").trim(),
            costPrice: parseFloat(det.querySelector("prod").querySelector("vUnTrib")?.textContent),
            salePrice: parseFloat(det.querySelector("prod").querySelector("vUnTrib")?.textContent),
            quantity: parseFloat(det.querySelector("prod").querySelector("qTrib")?.textContent),
            tributes: {}
          };  

          if(!product.barcode || product.barcode == 'SEM GTIN'){
            delete product.barcode;
          }

          if(!product.ncm || product.ncm == 'SEM GTIN'){
            delete product.ncm;
          }

          if(!product.cest){
            delete product.cest;
          }


          const tax = det.querySelector("imposto");
          const icms = tax.querySelector("ICMS")?.firstChild;
          const icmsst = tax.querySelector("ICMSST")?.firstChild;
          const pis = tax.querySelector("PIS")?.firstChild;
          const pisst = tax.querySelector("PISST")?.firstChild;
          const cofins = tax.querySelector("COFINS")?.firstChild;
          const cofinsst = tax.querySelector("COFINSST")?.firstChild;

          if(icms){

            product.tributes.icms = {
              origem: icms.querySelector("orig")?.textContent,
              cst: icms.querySelector("CST")?.textContent || icms.querySelector("CSOSN")?.textContent,
              aliquota: parseFloat(pis.querySelector("pICMS")?.textContent || 0),
              baseCalculo: {
                modalidadeDeterminacao: parseInt(pis.querySelector("modBC")?.textContent || 0),
              },
            };
          }

          if(icmsst){

            product.tributes.icms = product.tributes.icms || {};
            product.tributes.icms.substituicaoTributaria = {
              aliquota: parseFloat(icms.querySelector("pICMSST")?.textContent || 0),
              baseCalculo: {
                modalidadeDeterminacao: parseInt(icms.querySelector("modBCST")?.textContent || 0),
                valor: parseInt(icms.querySelector("vICMSST")?.textContent || 0)
              },
            };

            product.tributes.icms.cst = this.fiscalSettings.simplesNacional ? 500 : 60;
          }

          if(pis){

            product.tributes.pis = {
              cst: pis.querySelector("CST")?.textContent || pis.querySelector("CSOSN")?.textContent,
              aliquota: parseFloat(pis.querySelector("pPIS")?.textContent || 0)
            };

          }

          if(pisst){

            product.tributes.pis = product.tributes.pis || {};
            product.tributes.pis.substituicaoTributaria = {
              baseCalculo: parseFloat(cofinsst.querySelector("vBC")?.textContent || 0),
              aliquota: parseFloat(pisst.querySelector("pPIpPISS")?.textContent || 0),
              aliquotaReais: parseFloat(pisst.querySelector("vAliqProd")?.textContent || 0),
              valor: parseFloat(pisst.querySelector("vPIS")?.textContent || 0),
            };

            product.tributes.pis.cst = 75;
          }

          if(cofins){

            product.tributes.cofins = {
              cst: cofins.querySelector("CST")?.textContent || cofins.querySelector("CSOSN")?.textContent,
              aliquota: parseFloat(pis.querySelector("pCOFINS")?.textContent || 0)
            };
          }

          if(cofinsst){

            product.tributes.cofins = product.tributes.cofins || {};
            product.tributes.cofins.substituicaoTributaria = {
              baseCalculo: parseFloat(cofinsst.querySelector("vBC")?.textContent || 0),
              aliquota: parseFloat(cofinsst.querySelector("pCOFINS")?.textContent || 0),
              aliquotaReais: parseFloat(cofinsst.querySelector("vAliqProd")?.textContent || 0),
              valor: parseFloat(cofinsst.querySelector("vCOFINS")?.textContent || 0),
            };

            product.tributes.cofins.cst = 75;
          }


          console.log(product);
          // console.log(product, icms, pis, cofins)

          XMLImportComponent.shared.data.products.push(product);

        });

      };

      fileReader.readAsText(file);
      
    };
  }

  public onToggleTicketData(target: string) {
    this.settings.fields[target] = !this.settings.fields[target];
  }

  // User Interface Actions - General

  public onImport() {

    const data = this.composeData();

    this.productsServie.registerProducts(data, null, { action: EStockLogAction.IMPORTXML }).then(() => {
      this.callback.emit({ close: true });
      this.onResetPanel();
    });
  }

  public onResetPanel() {
    
    this.data = {};

    if (ProductsSelectorComponent.shared) {
      ProductsSelectorComponent.shared.reset(); 
    }
  }
  
  // Mask Methods

  public onApplyNumberMask(event: Event) {
    $$(event.currentTarget).val(FieldMask.numberFieldMask($$(event.currentTarget).val(), null, null, true));
  }

  // Layer Actions

  public onOpenLayer(type: string, index: number) {
    this.layerComponent.onOpen({ activeComponent: type, additional: {index: index} });
  }

  // Event Listeners

  public onLayerResponse(event: any) {

    // Instance

    if (event.instance) {
      this.layerComponent = event.instance;   
    }

    if (event.products) {
      // this.data.products = event.products;

      // console.log(event);

      if(event.additional?.index != undefined){
        this.data.products[event.additional.index].code = event.products[0].code;
        this.data.products[event.additional.index]._id = event.products[0]._id;
      }


      if (ProductsSelectorComponent.shared) {
        ProductsSelectorComponent.shared.reset(); 
      }
      
    }


    // Perform the Calculations

    this.generateBalance();
  }  

  // Auxiliary Methods - Private

  private generateBalance() {

    this.data.balance = (this.data.balance || {});
    
    this.data.balance.totalItems = 0;
    this.data.balance.totalCost = 0;
    this.data.balance.totalPurchase = 0;

    // Perform calculations for products

    if (this.data.products && this.data.products.length > 0) {

      for (const item of this.data.products) {

        const quantityToBuy = parseInt(item.selectedItems || 0);
        const quantityStock = item.quantity;

        const totalPurchaseCost = (item.costPrice * quantityToBuy);
        const totalStockCost = (item.unitaryCost * quantityStock);

        item.averageCost = ((totalPurchaseCost + totalStockCost) / (quantityToBuy + quantityStock) || 0);

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

  private composeData(): any {

    const response: IStockProduct[] = []

    if (this.data.products) {

      for (const item of this.data.products) {

        const obj: any = {
          _id: item._id,
          code: parseInt(item.code),
          // costPrice: item.costPrice,
          // averageCost: item.averageCost,          
          // salePrice: item.salePrice,
        };

        if(item.ncm && this.settings.fields.ncm){
          obj.ncm = item.ncm;
        }

        if(item.cest && this.settings.fields.cest){
          obj.ncm = item.cest;
        }

        if(this.settings.fields.name){
          obj.name = item.name;
        }

        if(this.settings.fields.costPrice){
          obj.salePrice = item.salePrice;
        }
        
        if(this.settings.fields.quantity){
          obj.quantity = parseInt(item.quantity);
        }
        
        item.tributes = Utilities.checkTributes(item.tributes);

        if(Utilities.isMatrix){
          obj.tributes = item.tributes;
        }else{
          obj.branches = {};
          obj.branches[Utilities.storeID] = {
            tributes: item.tributes
          };
        }

        response.push(obj);
      }
    }    


    // console.log(response, this.data);

    return response;
  }

  // Destruction Method

  public ngOnDestroy() {
    this.fiscalService.removeListeners("store-settings", "XMLImportComponent");
    this.onResetPanel();
  }

}

