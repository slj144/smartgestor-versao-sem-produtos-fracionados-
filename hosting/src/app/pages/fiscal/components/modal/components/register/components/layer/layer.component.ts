import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';

// Translate
import { FiscalTranslate } from '../../../../../../fiscal.translate';

// Utilities
import { Dispatch } from '@shared/utilities/dispatch';

@Component({
  selector: 'register-nf-layer',
  templateUrl: './layer.component.html',
  styleUrls: ['./layer.component.scss']
})
export class RegisterNfLayerComponent implements OnInit, OnDestroy {

  @Output() callback: EventEmitter<any> = new EventEmitter();

  public translate = FiscalTranslate.get()['modal']['action']['register']['layer'];

  public settings: any = {};

  private layerComponent: any;
  private customerComponent: any;
  private servicesComponent: any;
  private productsComponent: any;
  private paymentMethodsComponent: any;

  public ngOnInit() {
    this.callback.emit({ instance: this });     
  } 

  // Operating Methods

  public onOpen(settings: any) {

    this.settings = settings;

    this.layerComponent.onOpen();
    
    // Checks the component's response and initializes them

    const timer = setInterval(() => {

      if (        
        (this.customerComponent && (this.settings.activeComponent == 'customers')) ||
        (this.servicesComponent && (this.settings.activeComponent == 'services')) ||
        (this.productsComponent && (this.settings.activeComponent == 'products'))
      ) {
        clearInterval(timer);
      }

      if (this.customerComponent && (this.settings.activeComponent == 'customers')) {
        this.customerComponent.bootstrap({});
      }

      if (this.servicesComponent && (this.settings.activeComponent == 'services')) {
        this.servicesComponent.bootstrap({});
      }

      if (this.productsComponent && (this.settings.activeComponent == 'products')) {
        this.productsComponent.bootstrap({ alt: { parts: true }, alertOutStock: false, selectAll: true});
      }
    }, 0);

    // Check when the translation changes

    this.checkTranslationChange();
  }

  public onClose(standard: boolean = false) {

    if (!standard) {
      this.layerComponent.onClose();
    }
    
    Dispatch.removeListeners('languageChange', 'RequestsModalRegisterLayerComponent');
  }

  // Event Listeners

  public onLayerResponse(event: any) {

    if (event.instance) {
      this.layerComponent = event.instance;
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

  public onServicesResponse(event: any) {

    if (event.instance) {
      this.servicesComponent = event.instance;
    }

    if (event.data) {
      this.callback.emit({ services: event.data });
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

  public onPaymentMethodsResponse(event: any) {

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
       
        if (this.settings.activeComponent == 'customers') {
          this.layerComponent.title = "Clientes";
        }

        if (this.settings.activeComponent == 'services') {
          this.layerComponent.title = "Serviços";
        }

        if (this.settings.activeComponent == 'products') {
          this.layerComponent.title = "Produtos";
        }

        if (this.settings.activeComponent == 'paymentMethods') {
          this.layerComponent.title = "Meios de Pagamentos";
        }
      }
    };
       
    Dispatch.onLanguageChange('RequestsModalRegisterLayerComponent', () => {
      setTitle();
    });
    
    setTitle();
  }

  // Destruction Methods

  public ngOnDestroy() {

    this.settings = {};

    this.layerComponent = null;
    this.customerComponent = null;
    this.servicesComponent = null;
    this.productsComponent = null;

    Dispatch.removeListeners('languageChange', 'RequestsModalRegisterLayerComponent');
  }

}
