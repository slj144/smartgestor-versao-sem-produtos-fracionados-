import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';

// Translate
import { SchemesTranslate } from '../../../../../schemes.translate';

// Ultilities
import { Dispatch } from '@shared/utilities/dispatch';

@Component({
  selector: 'schemes-register-layer',
  templateUrl: './layer.component.html'
})
export class SchemesRegisterLayerComponent implements OnInit, OnDestroy {

  @Output() callback: EventEmitter<any> = new EventEmitter();
 
  public translate = SchemesTranslate.get()['modal']['action']['register']['layer'];
  public settings: any = {};

  private layerComponent: any;
  private productsComponent: any;
  private generalSelectorComponent: any;

  constructor() {}

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
        (this.productsComponent && (this.settings.activeComponent == 'products'))
      ) {
        clearInterval(timer);
      }

      if (this.productsComponent && (this.settings.activeComponent == 'products')) {
        this.productsComponent.bootstrap({ activeComponent: 'Schemes/Products', alertOutStock: false });
      }

    }, 100);

    // Check when the translation changes

    this.checkTranslationChange();
  }

  public onClose(standard: boolean = false) {

    if (!standard) {
      this.layerComponent.onClose();
    }

    Dispatch.removeListeners('languageChange', 'VehicleRegisterLayerComponent');
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
  
  // Auxiliary Methods

  private checkTranslationChange() {

    const setTitle = () => {
      if (this.layerComponent) {
        console.log(this.settings.activeComponent);
        this.layerComponent.title = this.translate[this.settings.activeComponent].title;        
      }
    };   
       
    Dispatch.onLanguageChange('VehicleRegisterLayerComponent', () => {
      setTitle();
    });
    
    setTitle();
  }

  // Destruction Methods

  public ngOnDestroy() {

    this.settings = {};

    this.layerComponent = null;
    this.productsComponent = null;
    this.generalSelectorComponent = null;

    Dispatch.removeListeners('languageChange', 'VehicleRegisterLayerComponent');
  }

}
