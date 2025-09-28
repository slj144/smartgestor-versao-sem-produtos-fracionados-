import { Component, Output, EventEmitter, OnInit } from '@angular/core';

// Translate
import { PurchasesTranslate } from '../../../../../../../purchases/purchases.translate';

// Utilities
import { Dispatch } from '@shared/utilities/dispatch';

@Component({
  selector: 'xml-import-layer',
  templateUrl: './layer.component.html'
})
export class XMLImportLayerComponent implements OnInit {

  @Output() callback: EventEmitter<any> = new EventEmitter();

  public translate = PurchasesTranslate.get()['modal']['action']['register']['layer'];

  public settings: any = {};
  public selectedProducts: any = [];

  private layerComponent: any;
  private productsComponent: any;

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // Layer Actions

  public onOpen(settings: any) {

    this.settings = settings;
    this.settings.data = (settings.data || {});

    this.layerComponent.onOpen({ title: settings.title });

    // Checks the component's response and initializes them

    const timer = setInterval(() => {

      if (
        (this.productsComponent && (this.settings.activeComponent == 'products'))
      ) {
        clearInterval(timer);
      }

      if (this.productsComponent && (this.settings.activeComponent == 'products')) {

        this.productsComponent.bootstrap({ selectAll: true, alertOutStock: false});
      }

    }, 0);

    // Check when the translation changes

    this.checkTranslationChange();
  }

  public onClose() {
    this.settings = {};
    this.layerComponent.onClose();
  }

  // Event Listeners

  public onLayerResponse(event: any) {

    if (event.instance) {
      this.layerComponent = event.instance;
    }
  }

  public onProductsResponse(event: any) {

    if (event.instance) {
      this.productsComponent = event.instance;
    }

    if (event.data) {
      this.callback.emit({ products: event.data, additional:  this.settings.additional});
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
       
    Dispatch.onLanguageChange('PurchasesRegisterLayerComponent', () => {
      setTitle();
    });
    
    setTitle();
  }

  // Destruction Methods

  public ngOnDestroy() {

    this.settings = {};

    this.layerComponent = null;
    this.productsComponent = null;

    Dispatch.removeListeners('languageChange', 'PurchasesRegisterLayerComponent');
  }

}
