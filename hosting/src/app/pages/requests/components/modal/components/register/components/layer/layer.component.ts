import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';

// Translate
import { RequestsTranslate } from '../../../../../../requests.translate';

// Utilities
import { Dispatch } from '@shared/utilities/dispatch';

@Component({
  selector: 'requests-register-layer',
  templateUrl: './layer.component.html',
  styleUrls: ['./layer.component.scss']
})
export class RequestsRegisterLayerComponent implements OnInit, OnDestroy {

  @Output() callback: EventEmitter<any> = new EventEmitter();

  public translate = RequestsTranslate.get()['modal']['action']['register']['layer'];

  public settings: any = {};

  private layerComponent: any;
  private memberComponent: any;
  private customerComponent: any;
  private productsComponent: any;

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
        (this.memberComponent && (this.settings.activeComponent == 'members')) ||
        (this.productsComponent && (this.settings.activeComponent == 'products'))
      ) {
        clearInterval(timer);
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
        this.layerComponent.title = this.translate[this.settings.activeComponent].title;
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
    this.memberComponent = null;
    this.customerComponent = null;
    this.productsComponent = null;

    Dispatch.removeListeners('languageChange', 'RequestsModalRegisterLayerComponent');
  }

}
