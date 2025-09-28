import { Component, Output, EventEmitter, OnInit } from '@angular/core';

// Translate
import { CashierFrontPDVTranslate } from '../../cashier-pdv.translate';

// Utilities
import { Dispatch } from '@shared/utilities/dispatch';

@Component({
  selector: 'cashier-pdv-layer',
  templateUrl: './layer.component.html'
})
export class CashierFrontPDVLayerComponent implements OnInit {

  @Output() callback: EventEmitter<any> = new EventEmitter();

  public translate = CashierFrontPDVTranslate.get()['layer'];

  public settings: any = {};

  private layerComponent: any;
  private memberComponent: any;
  private customerComponent: any;
  private productsComponent: any;
  private paymentMethodsComponent: any;

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // Layer Actions

  public onOpen(settings: any) {

    this.settings = settings;
    this.settings.data = (settings.data || {});

    this.layerComponent.onOpen();

    // Checks the component's response and initializes them

    const timer = setInterval(() => {

      if (
        (this.customerComponent && (this.settings.activeComponent == 'customers')) ||
        (this.memberComponent && (this.settings.activeComponent == 'members')) ||
        (this.productsComponent && (this.settings.activeComponent == 'products')) ||
        (this.paymentMethodsComponent && (this.settings.activeComponent == 'paymentMethods'))
      ) {
        clearInterval(timer);
      }

      if (this.customerComponent && (this.settings.activeComponent == 'customers')) {
        this.customerComponent.bootstrap();
      }

      if (this.memberComponent && (this.settings.activeComponent == 'members')) {
        this.memberComponent.bootstrap();
      }

      if (this.productsComponent && (this.settings.activeComponent == 'products')) {
        this.productsComponent.bootstrap();
      }

      if (this.paymentMethodsComponent && (this.settings.activeComponent == 'paymentMethods')) {
        this.paymentMethodsComponent.bootstrap();
      }
    }, 100);


    // Check when the translation changes

    this.checkTranslationChange();
  }

  public onClose(standard: boolean = false) {

    if (!standard && this.layerComponent) {
      this.layerComponent.onClose();
    }
    
    Dispatch.removeListeners('languageChange', 'CashierFrontPDVLayerComponent');
  }

  // Event Listeners

  public onLayerResponse(event: any) {

    if (event.instance) {
      this.layerComponent = event.instance;
    }

    if (event.close) {
      this.onClose(true);
    }
  }

  public onCustomerResponse(event: any) {

    if (event.instance) {
      this.customerComponent = event.instance;
    }

    if (event.data) {
      this.callback.emit({ customer: event.data });
    }
    
    if (event.close) {
      this.onClose();
    }
  }

  public onProductsResponse(event: any) {

    if (event.instance) {
      this.productsComponent = event.instance;
    }

    if (event.data) {
      this.callback.emit({ products: event.data });
    }

    if (event.close) {
      this.onClose();
    }
  }
  
  public onPaymentResponse(event: any) {

    if (event.instance) {
      this.paymentMethodsComponent = event.instance;
    }

    if (event.data) {
      this.callback.emit({ paymentMethods: event.data });
    }

    if (event.close) {
      this.onClose();
    }
  }
  
  // Auxiliary Methods

  private checkTranslationChange() {

    const setTitle = () => {

      if (this.layerComponent) {
        this.layerComponent.title = this.translate[this.settings.activeComponent].title;        
      }
    };   
       
    Dispatch.onLanguageChange('CashierFrontPDVLayerComponent', () => {
      setTitle();
    });
    
    setTitle();
  }

  // Destruction Methods

  public ngOnDestroy() {

    this.settings = {};
    this.layerComponent = null;
    this.memberComponent = null;
    this.customerComponent = null;
    this.productsComponent = null;
    this.paymentMethodsComponent = null;

    Dispatch.removeListeners('languageChange', 'CashierFrontPDVLayerComponent');
  }

}
