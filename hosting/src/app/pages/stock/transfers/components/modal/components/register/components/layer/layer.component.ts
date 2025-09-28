import { Component, Output, EventEmitter, OnInit } from '@angular/core';

// Translate
import { TransfersTranslate } from '../../../../../../transfers.translate';

// Utilities
import { Dispatch } from '@shared/utilities/dispatch';

@Component({
  selector: 'transfers-register-layer',
  templateUrl: './layer.component.html'
})
export class TransfersRegisterLayerComponent implements OnInit {

  @Output() callback: EventEmitter<any> = new EventEmitter();

  public translate = TransfersTranslate.get()['modal']['action']['register']['layer'];

  public settings: any = {};
  public selectedProducts: any = [];

  private layerComponent: any;
  private storesComponent: any;
  private productsComponent: any;
  private billsToReceiveComponent: any;

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
        (this.storesComponent && (this.settings.activeComponent == 'stores')) ||
        (this.productsComponent && (this.settings.activeComponent == 'products')) ||
        (this.billsToReceiveComponent && (this.settings.activeComponent == 'billToReceive'))
      ) {
        clearInterval(timer);
      }

      if (this.storesComponent && (this.settings.activeComponent == 'stores')) {
        this.storesComponent.bootstrap();        
      }

      if (this.productsComponent && (this.settings.activeComponent == 'products')) {
        this.productsComponent.bootstrap();
      }

      if (this.billsToReceiveComponent && (this.settings.activeComponent == 'billToReceive')) {
        this.billsToReceiveComponent.bootstrap();        
      }
    }, 0);

    // Check when the translation changes

    this.checkTranslationChange();
  }

  public onClose() {
    this.layerComponent.onClose();
  }

  // Event Listeners

  public onLayerResponse(event: any) {

    if (event.instance) {
      this.layerComponent = event.instance;
    }
  }

  public onStoresResponse(event: any) {

    if (event.instance) {
      this.storesComponent = event.instance;
    }

    if (event.data) {
      this.callback.emit({ store: event.data });
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

  public onBillsToReceiveResponse(event: any) {

    if (event.instance) {
      this.billsToReceiveComponent = event.instance;
    }

    if (event.data) {
      this.callback.emit({ billsToReceive: event.data });
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
       
    Dispatch.onLanguageChange('TransfersRegisterLayerComponent', () => {
      setTitle();
    });
    
    setTitle();
  }

  // Destruction Methods

  public ngOnDestroy() {

    this.settings = {};

    this.layerComponent = null;
    this.storesComponent = null;
    this.productsComponent = null;
    this.billsToReceiveComponent = null;

    Dispatch.removeListeners('languageChange', 'TransfersRegisterLayerComponent');
  }

}
