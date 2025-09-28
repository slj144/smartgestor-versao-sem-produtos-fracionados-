import { Component, EventEmitter, OnInit, Output, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';

// Components
import { ProductsSelectorComponent } from '@pages/stock/products/components/selector/selector.component';

// Services
import { RequestsService } from '@pages/requests/requests.service';
import { CashierFrontPDVService } from '@pages/cashier/cashier-front/components/cashier-pdv/cashier-pdv.service';
import { ScannerService } from '@shared/services/scanner.service';

// Translate
import { RequestsTranslate } from '@pages/requests/requests.translate';

// Interfaces
import { IRequest, ERequestStatus } from '@shared/interfaces/IRequest';
import { ECashierSaleStatus } from '@shared/interfaces/ICashierSale';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { FieldMask } from '@shared/utilities/fieldMask';
import { SchemesService } from '../schemes/schemes.service';

@Component({
  selector: 'requests-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RequestsRegisterComponent implements OnInit, OnDestroy {

  @ViewChild('schemeSelect', { static: false }) public schemeSelect: ElementRef;

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  public static shared: RequestsRegisterComponent;

  public translate: any = RequestsTranslate.get()['modal']['action']['register'];

  public loading: boolean = true;
  public checkProducts: boolean = false;
  public data: any = {};
  public settings: any = {};
  public sending: boolean = false;
  public schemes: any[] = [];

  private layerComponent: any;
  

  constructor(
    private requestsService: RequestsService,
    private schemesService: SchemesService,
    private cdr: ChangeDetectorRef,
    private cashierFrontPDVService: CashierFrontPDVService,
    private scannerService: ScannerService
  ) {
    RequestsRegisterComponent.shared = this;
  }

  public ngOnInit() {
    this.callback.emit({ instance: this });
    this.scannerSettings();
  }

  // Initialize Method

  public bootstrap(settings: any = {}) {

    this.data = settings.data || {};
    this.settings = settings;

    if (!this.data?.customer) {
      this.setDefaultCustomer();
    }
    if (settings.data?.products?.length > 0) {
      ProductsSelectorComponent.shared.selectProducts(settings.data.products);
    }

    this.schemesService.getSchemes("RequestsRegisterComponent", (data) => {
      this.schemes = data;
      this.cdr.detectChanges();
    });
  }

  // Getter and Setter Methods

  public get companyProfile() {
    return Utilities.companyProfile;
  }

  // User Interface Actions - Products

  public onQuickSearch(input: any) {

    let value = $$(input).val();

    if (value != '') {

      Utilities.loading();
      const raw = String(value).trim();
      const isDigits = /^\d+$/.test(raw);
      const where: any[] = [];

      where.push({ field: 'barcode', operator: '=', value: raw });
      where.push({ field: 'internalCode', operator: '=', value: raw });
      where.push({ field: 'serialNumber', operator: '=', value: raw });
      where.push({ field: 'batch', operator: '=', value: raw });
      where.push({ field: 'provider.code', operator: '=', value: raw });

      if (isDigits) {
        where.push({ field: 'code', operator: '=', value: parseInt(raw, 10) });
        if (raw.length >= 8 && raw.length < 13) {
          const truncated = raw.substring(0, raw.length - 4);
          if (/^\d+$/.test(truncated)) {
            where.push({ field: 'code', operator: '=', value: parseInt(truncated, 10) });
          }
        }
      }

      ProductsSelectorComponent.shared.onSearch({ where, data: { barcode: raw } }, true).then(() => {
        $$('.products-card .quick-search input').val('');
        Utilities.loading(false);
      });
    }
  }

  public onDeleteProductItem(index: number) {

    ProductsSelectorComponent.shared.onDeselectProduct(this.data.products[index]);
    this.checkProductsOutStock(this.data.products);
    this.generateBalance();
  }

  public onApplyPrice(data: any, inputField: any) {

    const value = FieldMask.priceFieldMask(inputField.value);

    data.unitaryPrice = (parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0);
    inputField.value = value;

    this.generateBalance();
  }

  public onApplyQuantity(data: any, inputField: any) {

    const value = inputField.value;
    const quantity = FieldMask.numberFieldMask(value, this.data.scheme ? 0 : 1, data.quantity);

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

  public onCaptureCompleteOrder(input: any) {
    this.data.completeOrder = input.checked;
  }

  public onChangeScheme(event, scheme?: any) {

    const checked = event.target.checked;
    const quantity = parseInt(event.target.parentElement.parentElement.querySelector("input[type='text']")?.value || 1);

    // console.log(checked, scheme, quantity);

    // return;

    if (!scheme) {
      this.data.products = [];
      this.data.scheme = [];
      ProductsSelectorComponent.shared.reset();
      return;
    }

    if (!checked) {

      // console.log(this.data.scheme);

      this.data.scheme = this.data.scheme.filter((code) => {
        return code != scheme.code;
      });

      scheme.products.map((prod) => {
        prod.quantity = prod.originalQuantity || prod.quantity;

        (this.data.products || []).forEach(item => {
          if (item.code == prod.code) {
            // console.log(item);
            item.selectedItems -= prod.quantity * scheme.quantity;
            item.selectedItems = item.selectedItems < 0 ? 0 : item.selectedItems;
            if (item.selectedItems == 0) {
              ProductsSelectorComponent.shared.onDeselectProduct(item);
            }
          }
        });


        return prod;
      });

      // this.data.products = (this.data.products || []).filter((item)=>{
      //   if(item.selectedItems == 0){
      //     ProductsSelectorComponent.shared.onDeselectProduct(item);
      //   }
      //   // return item.selectedItems > 0;
      // });

      // console.log(this.data.scheme, scheme, this.data.products);

      return;
    }

    scheme.quantity = 1;

    this.data.scheme = (() => {
      if (typeof this.data.scheme == 'string' && this.data.scheme.length > 0) {
        return [this.data.scheme]
      }
      if (typeof this.data.scheme == 'string') {
        return [];
      }

      if (this.data.scheme instanceof Array) {
        return this.data.scheme;
      } else {
        return this.data.scheme ? [this.data.scheme] : [];
      }

    })();

    // console.log(this.data.scheme);

    if (checked) {
      this.data.scheme.push(scheme.code);
    }

    scheme.products.map((prod) => {
      prod.originalQuantity = prod.quantity || 1;
      return prod;
    });

    (this.data.products || []).forEach(item => {
      scheme.products.map((prod) => {
        if (item.code == prod.code) {
          prod.originalQuantity = prod.quantity || 0;
          prod.quantity += item.selectedItems || 0;
          item.selectedItems = prod.quantity;
        }
        return prod;
      });
    });

    // console.log(scheme.products);

    if (scheme) {
      // ProductsSelectorComponent.shared.reset();
      ProductsSelectorComponent.shared.selectProducts(scheme.products);
    }
  }

  public onChangeQuantityScheme(scheme, event) {

    const input = event.target;

    // console.log(input, scheme);

    const value = input.value.trim() > 0 ? input.value.trim() : 1;

    scheme?.products.map((prod) => {
      prod.quantity = prod.originalQuantity * (value || 1)
      scheme.quantity = scheme.quantity || 1;
      const selectedProduct = this.data.products?.filter((item) => item.code == prod.code)[0];
      if (selectedProduct) {

        if (value != scheme.quantity) {

          const _quantity = prod.originalQuantity * (scheme.quantity || 1);

          // console.log(prod.originalQuantity, prod.quantity, _quantity, prod.quantity - _quantity)

          selectedProduct.selectedItems += prod.quantity - _quantity;
        } else {
          selectedProduct.selectedItems += prod.quantity;
        }

      }
    });

    scheme.quantity = value;
    this.generateBalance();
  }

  // User Interface Actions - General

  public onRegister() {

    this.sending = true;

    const data = this.composeData();

    this.requestsService.registerRequest(data).then(() => {
      this.callback.emit({ close: true });
      this.onResetPanel();
    });
  }

  public onResetPanel() {

    this.data = {};
    this.settings = {};

    if (ProductsSelectorComponent.shared) {
      ProductsSelectorComponent.shared.reset();
    }

    if ($$('#container-request-register').length > 0) {
      $$('#container-request-register')[0].scrollTop = 0;
    }

    this.sending = false;
  }

  // Mask Methods

  public onApplyNumberMask(event: Event, min?: number) {
    $$(event.currentTarget).val(FieldMask.numberFieldMask($$(event.currentTarget).val(), min, null, true));
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

    if (event.customer) {
      this.data.customer = event.customer;
    }

    if (event.member) {
      this.data.member = event.member;
    }

    if (event.products) {
      this.data.products = event.products;
      this.checkProductsOutStock(this.data.products);
    }

    // Perform the Calculations

    this.generateBalance();
  }

  // Auxiliary Methods - Private

  private generateBalance() {

    this.data.balance = (this.data.balance || {});

    this.data.balance.totalProducts = 0;
    this.data.balance.totalDiscount = 0;
    this.data.balance.totalFee = 0;

    this.data.balance.totalPartial = 0;
    this.data.balance.totalSale = 0;

    // Perform Calculations

    if (this.data.products && this.data.products.length > 0) {

      for (const item of this.data.products) {

        if (item.unitaryPrice > item.salePrice) {
          this.data.balance.totalProducts += (item.selectedItems * item.unitaryPrice);
        } else {
          this.data.balance.totalProducts += (item.selectedItems * item.salePrice);
        }

        this.data.balance.totalDiscount += (() => {
          return ((item.unitaryPrice < item.salePrice) ? ((item.salePrice - item.unitaryPrice) * item.selectedItems) : 0);
        })();
      }

      this.data.balance.totalPartial += this.data.balance.totalProducts;
      this.data.balance.totalSale += this.data.balance.totalProducts;
    }

    if (this.data.balance.discount) {

      const obj = this.data.balance.discount;

      if (obj.type == 'R$') {
        this.data.balance.totalDiscount += obj.value;
      } else if (obj.type == '%') {
        this.data.balance.totalDiscount += parseFloat((this.data.balance.totalSale * (obj.value / 100)).toFixed(2));
      }
    }

    // Apply Values

    if (this.data.balance.totalDiscount > 0) {
      this.data.balance.totalPartial -= this.data.balance.totalDiscount;
      this.data.balance.totalSale -= this.data.balance.totalDiscount;
    }

    if (this.data.balance.totalFee > 0) {
      this.data.balance.totalSale += this.data.balance.totalFee;
    }
  }

  private composeData() {

    const response: IRequest = {
      _id: this.data._id,
      code: this.data.code,
      products: ([] as any),
      balance: ({} as any),
      saleStatus: ECashierSaleStatus.PENDENT,
      requestStatus: ERequestStatus.PENDENT
    };

    if (this.data.customer) {

      response.customer = ({} as any);

      response.customer._id = this.data.customer._id;
      response.customer.code = this.data.customer.code;
      response.customer.name = this.data.customer.name;

      if (this.data.customer.personalDocument) {
        response.customer.personalDocument = this.data.customer.personalDocument;
      }

      if (this.data.customer.businessDocument) {
        response.customer.businessDocument = this.data.customer.businessDocument;
      }

      if (this.data.customer.address) {
        response.customer.address = this.data.customer.address;
      }

      if (this.data.customer.contacts && this.data.customer.contacts.phone) {
        response.customer.phone = this.data.customer.contacts.phone;
      }

      if (this.data.customer.contacts && this.data.customer.contacts.email) {
        response.customer.email = this.data.customer.contacts.email;
      }
    }

    if (this.data.member) {

      response.member = ({} as any);

      response.member._id = this.data.member._id;
      response.member.code = this.data.member.code;
      response.member.name = this.data.member.name;

      if (this.data.member.address) {
        response.member.address = this.data.member.address;
      }

      if (this.data.member.contacts && this.data.member.contacts.phone) {
        response.member.phone = this.data.member.contacts.phone;
      }

      if (this.data.member.contacts && this.data.member.contacts.email) {
        response.member.email = this.data.member.contacts.email;
      }

      if (this.data.member.description) {
        response.member.description = this.data.member.description;
      }
    }

    if (this.data.products) {

      for (const item of this.data.products) {

        const obj: any = {
          _id: item._id,
          code: item.code,
          name: item.name,
          costPrice: item.costPrice,
          salePrice: item.salePrice,
          unitaryPrice: item.unitaryPrice,
          quantity: parseInt(item.selectedItems)
        };

        if (item.serialNumber) {
          obj.serialNumber = item.serialNumber;
        }

        if (item.commercialUnit) {
          obj.commercialUnit = {
            _id: item.commercialUnit._id, code: item.commercialUnit.code, name: item.commercialUnit.name
          };
        }

        if (item.category) {
          obj.category = {
            _id: item.category._id, code: item.category.code, name: item.category.name
          };
        }

        if (item.discount) {
          obj.discount = item.discount;
        }

        if (item.internalCode) {
          obj.internalCode = item.internalCode;
        }

        response.products.push(obj);
      }
    }

    if (this.data.balance) {

      response.balance.subtotal = ({} as any);

      if (this.data.balance.totalProducts > 0) {
        response.balance.subtotal.products = this.data.balance.totalProducts;
      }

      if (this.data.balance.totalDiscount > 0) {
        response.balance.subtotal.discount = this.data.balance.totalDiscount;
      }

      if (this.data.balance.totalFee > 0) {
        response.balance.subtotal.fee = this.data.balance.totalFee;
      }

      response.balance.total = this.data.balance.totalSale;
    }

    if (this.data.scheme) {
      response.scheme = this.data.scheme;
    }

    if (this.data.completeOrder) {
      response.requestStatus = ERequestStatus.CONCLUDED
    }

    return response;
  }

  private checkProductsOutStock(products) {

    const productsOutStock = products.filter((item) => item.quantity == 0);

    if (this.settings.action != 'Requests/edit' && this.data.scheme) {
      this.checkProducts = productsOutStock.length == 0;
    } else {
      this.checkProducts = true;
    }
  }
  private setDefaultCustomer(): void {
    this.cashierFrontPDVService.getDefaultCustomer().then((customer) => {
      if (customer) {
        this.data.customer = {
          code: customer.code,
          name: customer.name || 'Consumidor Final',
          personalDocument: customer.personalDocument || '',
          businessDocument: customer.businessDocument || '',
          address: customer.address || 'Não identificado',
          contacts: customer.contacts || {}
        };

        console.log('Cliente padrão definido:', this.data.customer);
      }
    }).catch((error) => {
      console.error('Erro ao buscar cliente padrão:', error);
    });
  }

  private scannerSettings() {
    this.scannerService.getShot('RequestsRegisterComponent', (barcode) => {
      Utilities.loading();

      const raw = String(barcode).trim();
      const isDigits = /^\d+$/.test(raw);
      const where: any[] = [];

      where.push({ field: 'barcode', operator: '=', value: raw });
      where.push({ field: 'internalCode', operator: '=', value: raw });
      where.push({ field: 'serialNumber', operator: '=', value: raw });
      where.push({ field: 'batch', operator: '=', value: raw });
      where.push({ field: 'provider.code', operator: '=', value: raw });

      if (isDigits) {
        where.push({ field: 'code', operator: '=', value: parseInt(raw, 10) });
        if (raw.length >= 8 && raw.length < 13) {
          const truncated = raw.substring(0, raw.length - 4);
          if (/^\d+$/.test(truncated)) {
            where.push({ field: 'code', operator: '=', value: parseInt(truncated, 10) });
          }
        }
      }

      ProductsSelectorComponent.shared.onSearch({ where, data: { barcode: raw } }, true).then(() => {
        Utilities.loading(false);
      });
    });
  }
  // Destruction Method

  public ngOnDestroy() {
    this.onResetPanel();
    this.schemesService.removeListeners("records", 'RequestsRegisterComponent');
    this.scannerService.removeListeners('RequestsRegisterComponent');
  }

}
