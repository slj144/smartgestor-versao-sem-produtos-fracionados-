import { Component, EventEmitter, OnInit, Output, OnDestroy } from '@angular/core';
import { iTools } from '@itools/index';

// Components
import { ProductsSelectorComponent } from '@pages/stock/products/components/selector/selector.component';

// Services
import { TransfersService } from '@pages/stock/transfers/transfers.service';
import { BillsToReceiveService } from '@pages/financial/bills-to-receive/bills-to-receive.service';

// Translate
import { TransfersTranslate } from '@pages/stock/transfers/transfers.translate';

// Interfaces
import { IStockTransfer, EStockTransferStatus, EStockTransferPaymentStatus } from '@shared/interfaces/IStockTransfer';
import { IFinancialBillToPay, EFinancialBillToPayOrigin, EFinancialBillToPayStatus, FinancialBillToPayCategoryDefault, EFinancialBillToPayBeneficiaryType } from '@shared/interfaces/IFinancialBillToPay';
import { IFinancialBillToReceive, EFinancialBillToReceiveOrigin, EFinancialBillToReceiveStatus, FinancialBillToReceiveCategoryDefault, EFinancialBillToReceiveDebtorType } from '@shared/interfaces/IFinancialBillToReceive';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { FieldMask } from '@shared/utilities/fieldMask';

@Component({
  selector: 'transfers-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class TransfersRegisterComponent implements OnInit, OnDestroy {

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  public static shared: TransfersRegisterComponent;

  public translate = TransfersTranslate.get()['modal']['action']['register']['panel'];

  public loading: boolean = true;
  public data: any = {};
  public installments: number[];
  public expirationDays: number[];
  public sending: boolean = false;

  private layerComponent: any;

  constructor(
    private transfersService: TransfersService,
    private billsToReceiveService: BillsToReceiveService
  ) {
    TransfersRegisterComponent.shared = this;
  }

  public ngOnInit() {

    this.callback.emit({ instance: this });

    this.installments = [...Array(12).keys()].map((v) => v + 1);
    this.expirationDays = [...Array(31).keys()].map((v) => v + 1);
  }

  // Initialize Method

  public bootstrap(settings: any = {}) {
    
    const data = settings.data;

    this.onResetPanel();

    if (!data.origin) {

      const storeInfo = Utilities.storeInfo;

      data.origin = {};

      data.origin._id = storeInfo._id;
      data.origin.name = storeInfo.name;

      if (storeInfo.cnpj) {
        data.origin.cnpj = storeInfo.cnpj;
      }

      if (storeInfo.address) {
        data.origin.address = `${storeInfo.address.addressLine}, ${storeInfo.address.city} - ${storeInfo.address.state}`;
      }

      if (storeInfo.contacts && storeInfo.contacts.phone) {
        data.origin.phone = storeInfo.contacts.phone;
      }

      if (storeInfo.contacts && storeInfo.contacts.email) {
        data.origin.email = storeInfo.contacts.email;
      }
    } else {

      if (
        (settings.data.origin && settings.data.origin.phone) ||
        (settings.data.origin && settings.data.origin.email)
      ) {

        data.origin.contacts = {}

        if (settings.data.origin.phone) {
          data.origin.contacts.phone = settings.data.origin.phone;
        }

        if (settings.data.origin.email) {
          data.origin.contacts.email = settings.data.origin.email;
        }
      }
    }

    if (
      (settings.data.destination && settings.data.destination.phone) ||
      (settings.data.destination && settings.data.destination.email)
    ) {

      data.destination.contacts = {}

      if (settings.data.destination.phone) {
        data.destination.contacts.phone = settings.data.destination.phone;
      }

      if (settings.data.destination.email) {
        data.destination.contacts.email = settings.data.destination.email;
      }
    }

    if (settings.data.products && (settings.data.products.length > 0)) {
      ProductsSelectorComponent.shared.selectProducts(data.products);
    }

    if (settings.data.billToReceiveCode) {
      this.billsToReceiveService.query([{
        field: "code", operator: "=", value: parseInt(settings.data.billToReceiveCode)
      }], false, false, false, false).then((res)=>{

        data.billToReceive = res[0];

        data.billToReceive.expirationDay = parseInt(data.billToReceive.installments[0].dueDate.split("-")[2]);
        data.billToReceive._installments = data.billToReceive.installments;
        data.billToReceive.installments = data.billToReceive.totalInstallments;
      });

    } else {
      data.billToReceive = { installments: 1, expirationDay: 15, installmentValue: 0 };
    }
    
    this.data = data;
  }

  // User Interface Actions - Products
  
  public onQuickSearch(input: any) {

    const value = $$(input).val();

    if (value != '') {
      
      Utilities.loading();
  
      ProductsSelectorComponent.shared.onSearch({
        where: [
          { field: 'code', operator: '=', value: parseInt(value) }
        ]
      }, true).then(() => {
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
    const quantity = FieldMask.numberFieldMask(value, 1, data.quantity);

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

  public onCaptureNote(input: any) {
    this.data.note = input.value;
  }

  public onCaptureAttachment(input: any) {

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
    this.data.billToReceive.installments = input.value;
    this.generateBalance();
  }

  public onCaptureFinancialExpirationDay(input: any) {
    this.data.billToReceive.expirationDay = input.value;
  }

  // User Interface Actions - General

  public onRegister() {

    this.sending = true;

    const data = this.composeData();
    const source = this.data.source;

    this.transfersService.registerTransfer(data, source).then(() => {
      this.callback.emit({ close: true });
      this.onResetPanel();
    });
  }

  public onResetPanel() {
    
    this.data = {};

    if (ProductsSelectorComponent.shared) {
      ProductsSelectorComponent.shared.reset(); 
    }    

    this.sending = false;
  }
    
  // Mask Methods

  public onApplyNumberMask(event: Event) {
    $$(event.currentTarget).val(FieldMask.numberFieldMask($$(event.currentTarget).val(), null, null, true));
  }

  // Layer Actions

  public onOpenLayer(type: string) {
    this.layerComponent.onOpen({ activeComponent: type });
  }

  // Event Listeners

  public onLayerResponse(event: any) {

    // Instance Capture

    if (event.instance) {
      this.layerComponent = event.instance;   
    }

    // Data Capture    

    if (event.store) {
      this.data.destination = event.store;
    }

    if (event.products) {
      this.data.products = event.products;
    }

    if (event.billToReceive) {
      this.data.billToReceive = event.billToReceive;
    }

    // Treat Products
    
    if (this.data.destination && this.data.products) {
      
      let id = this.data.destination._id;

      $$(this.data.products).map((_, item) => {

        if (!item.temp) {
          
          item.temp = {
            salePrice: (item.matrix ? item.matrix.salePrice : item.salePrice)
          };
        } else {
          item.salePrice = item.temp.salePrice;
        }

        if (id == 'matrix') {

          if (item.matrix) {
            item.salePrice = item.matrix.salePrice;
          }

        } else {

          if (item.branches) {
            item.destQuantity = (item.branches[id] ? item.branches[id].quantity : (item.matrix ? item.matrix.quantity : item.quantity));
            item.unitaryCost = (item.branches[id] ? item.branches[id].costPrice : (item.matrix ? item.matrix.costPrice : item.costPrice));
            item.salePrice = (item.branches[id] ? item.branches[id].salePrice : (item.matrix ? item.matrix.salePrice : item.salePrice));
          }
        }
      });
    }

    // Perform the Calculations

    this.generateBalance();
  }  

  // Auxiliary Methods - Private

  private generateBalance() {

    this.data.balance = (this.data.balance || {});
    
    this.data.balance.totalItems = 0;
    this.data.balance.totalCost = 0;
    this.data.balance.totalTransfer = 0;

    // Perform Calculations for products

    if (this.data.products && this.data.products.length > 0) {

      for (const item of this.data.products) {        

        const quantityToTransfer = parseInt(item.selectedItems || 0);
        const quantityStock = (item.destQuantity || 0);

        const totalTransferCost = (item.costPrice * quantityToTransfer);
        const totalStockCost = (item.unitaryCost * quantityStock);

        item.averageCost = ((totalTransferCost + totalStockCost) / (quantityToTransfer + quantityStock) || 0);

        this.data.balance.totalItems += quantityToTransfer;
        this.data.balance.totalCost += totalTransferCost;
      }

      this.data.balance.totalTransfer += this.data.balance.totalCost;
    }

    // Perform calculations for financial

    if (this.data.billToReceive && this.data.billToReceive.installments) {
      this.data.billToReceive.installmentValue = (this.data.balance.totalTransfer / this.data.billToReceive.installments);
    }
  }

  private composeData(): IStockTransfer {

    const response: IStockTransfer = {
      _id: this.data._id,
      code: this.data.code,
      origin: ({} as any),
      destination: ({} as any),
      products: ([] as any),
      billToReceive: ([] as any),
      billToPay: ([] as any),
      balance: ({} as any),
      note: this.data.note,
      transferDate: iTools.FieldValue.date(Utilities.timezone),
      transferStatus: EStockTransferStatus.PENDENT,
      paymentStatus: (this.data.paymentStatus || EStockTransferPaymentStatus.PENDENT)      
    };

    if (this.data.origin) {

      response.origin._id = this.data.origin._id;
      response.origin.name = this.data.origin.name;

      if (this.data.origin.cnpj) {
        response.origin.businessDocument = this.data.origin.cnpj;
      }

      if (this.data.origin.address) {
        response.origin.address = this.data.origin.address;
      }

      if (this.data.origin.phone) {
        response.origin.phone = this.data.origin.phone;
      }

      if (this.data.origin.email) {
        response.origin.email = this.data.origin.email;
      }      
    }

    if (this.data.destination) {

      response.destination._id = this.data.destination._id;
      response.destination.name = this.data.destination.name;

      if (this.data.destination.cnpj) {
        response.destination.businessDocument = this.data.destination.cnpj;
      }

      if (this.data.destination.address) {
        response.destination.address = this.data.destination.address;
      }

      if (this.data.destination.contacts && this.data.destination.contacts.phone) {
        response.destination.phone = this.data.destination.contacts.phone;
      }

      if (this.data.destination.contacts && this.data.destination.contacts.email) {
        response.destination.email = this.data.destination.contacts.email;
      }      
    }

    if (this.data.attachment) {
      response.attachment = this.data.attachment;
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
          quantity: parseInt(item.selectedItems)
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

        response.balance.quantity += obj.quantity;
        response.products.push(obj);
      }
    }

    if (this.data.billToReceive) {

      const debtor = <IFinancialBillToReceive['debtor']>response.destination;
      debtor.type = EFinancialBillToReceiveDebtorType.STORE;

      const expirationDay = parseInt(this.data.billToReceive.expirationDay);
      const installments = parseInt(this.data.billToReceive.installments);
      const totalTransfer = parseFloat(this.data.balance.totalTransfer);
      
      response.billToReceive = {
        code: this.data.billToReceive.code,
        debtor,
        category: FinancialBillToReceiveCategoryDefault.getCategory(EFinancialBillToReceiveOrigin.TRANSFER),
        description: "Conta a receber gerada automaticamente pela transferência #$RPC('referenceCode')",
        currentInstallment: 0,
        origin: EFinancialBillToReceiveOrigin.TRANSFER,
        status: EFinancialBillToReceiveStatus.PENDENT,
        installments: Utilities.generateInstallments(expirationDay, installments, totalTransfer),
        receivedInstallments: 0,
        totalInstallments: installments,
        received: 0,
        amount: totalTransfer
      };

      const beneficiary = <IFinancialBillToPay['beneficiary']>response.origin;
      beneficiary.type = EFinancialBillToPayBeneficiaryType.STORE;

      response.billToPay = {
        code: this.data.billToPayCode,
        beneficiary,
        category: FinancialBillToPayCategoryDefault.getCategory(EFinancialBillToPayOrigin.TRANSFER),
        description: "Conta a pagar gerada automaticamente pela transferência #$RPC('referenceCode')",
        currentInstallment: 0,
        origin: EFinancialBillToPayOrigin.TRANSFER,
        status: EFinancialBillToPayStatus.PENDENT,
        installments: Utilities.generateInstallments(expirationDay, installments, totalTransfer),
        paidInstallments: 0,
        totalInstallments: installments,
        paid: 0,
        amount: totalTransfer,
        owner: debtor._id
      };
    }

    if (this.data.balance) {
      response.balance.total = this.data.balance.totalTransfer;
    }

    return response;
  }

  // Destruction Method

  public ngOnDestroy() {
    this.onResetPanel();
  }

}
