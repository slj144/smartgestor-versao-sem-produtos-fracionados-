import { Component, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';

// Translate
import { ServiceOrdersTranslate } from '../../../../../../serviceOrders.translate';

// Utilities
import { Dispatch } from '@shared/utilities/dispatch';

@Component({
  selector: 'service-orders-register-layer',
  templateUrl: './layer.component.html',
  styleUrls: ['./layer.component.scss']
})
export class ServiceOrdersRegisterLayerComponent implements OnInit, OnDestroy {

  @Output() callback: EventEmitter<any> = new EventEmitter();

  public translate = ServiceOrdersTranslate.get()['modal']['action']['register']['layer'];

  public settings: any = {};

  @ViewChild("layerComponent", {static: false}) layerComponent: any;
  @ViewChild("customerComponent", {static: false}) customerComponent: any;
  @ViewChild("vehicleComponent", {static: false}) vehicleComponent: any;
  @ViewChild("servicesComponent", {static: false}) servicesComponent: any;
  @ViewChild("productsComponent", {static: false}) productsComponent: any;

  constructor(
    private cdr: ChangeDetectorRef,
  ){}

  public ngOnInit() {
    this.callback.emit({ instance: this });     
  } 

  // Operating Methods

  public onOpen(settings: any) {

    this.settings = settings;
    this.layerComponent.onOpen();
    this.cdr.detectChanges();
    
    // Checks the component's response and initializes them
    
    if (this.customerComponent && (this.settings.activeComponent == 'customers')) {
      this.customerComponent.bootstrap({});
    }
    
    if (this.vehicleComponent && (this.settings.activeComponent == 'vehicles')) {
      this.vehicleComponent.bootstrap({});
    }

    if (this.servicesComponent && (this.settings.activeComponent == 'services')) {
      this.servicesComponent.bootstrap({});
    }

    if (this.productsComponent && (this.settings.activeComponent == 'products')) {
      this.productsComponent.bootstrap({ alt: { parts: true }});
    }

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

  }

  public onCustomerResponse(event: any) {

    if (event.data) {
      this.callback.emit({ customer: event.data });
    }

    if (event.close) {
      this.onClose();
    }
  }

  public onVehicleResponse(event: any) {

    if (event.data) {
      this.callback.emit({ vehicle: event.data });
    }

    if (event.close) {
      this.onClose();
    }
  }

  public onServicesResponse(event: any) {

    if (event.data) {
      this.callback.emit({ services: event.data });
    }

    if (event.close) {
      this.onClose();
    }
  }

  public onProductsResponse(event: any) {

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
    this.customerComponent = null;
    this.servicesComponent = null;
    this.productsComponent = null;

    Dispatch.removeListeners('languageChange', 'RequestsModalRegisterLayerComponent');
  }

}
