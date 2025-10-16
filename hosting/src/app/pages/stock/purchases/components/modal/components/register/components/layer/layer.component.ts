import { Component, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';

// Translate
import { PurchasesTranslate } from '../../../../../../purchases.translate';

// Utilities
import { Dispatch } from '@shared/utilities/dispatch';

@Component({
  selector: 'purchases-register-layer',
  templateUrl: './layer.component.html',
  styleUrls: ['./layer.component.scss']
})
export class PurchasesRegisterLayerComponent implements OnInit {

  @Output() callback: EventEmitter<any> = new EventEmitter();

  public translate = PurchasesTranslate.get()['modal']['action']['register']['layer'];

  public settings: any = {};
  public selectedProducts: any = [];

  private layerComponent: any;
  private providersComponent: any;
  private productsComponent: any;
  private billsToPayComponent: any;
  private generalSelectorComponent: any;

  // @ViewChild("generalSelector", {static: false}) generalSelectorComponent: any;

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
        (this.providersComponent && (this.settings.activeComponent == 'providers')) ||
        (this.productsComponent && (this.settings.activeComponent == 'products')) ||
        (this.billsToPayComponent && (this.settings.activeComponent == 'billToPay')) ||
        (this.generalSelectorComponent && (this.settings.activeComponent == 'commercialUnits')) || 
        (this.generalSelectorComponent && (this.settings.activeComponent == 'categories')) ||
        (this.generalSelectorComponent && (this.settings.activeComponent == 'departments'))
      ) {
        clearInterval(timer);
      }

      if (this.providersComponent && (this.settings.activeComponent == 'providers')) {
        this.providersComponent.bootstrap();
      }

      if (this.productsComponent && (this.settings.activeComponent == 'products')) {
        this.productsComponent.bootstrap({ selectAll: true });
      }

      if (this.billsToPayComponent && (this.settings.activeComponent == 'billToPay')) {
        this.billsToPayComponent.bootstrap();
      }

      if (this.generalSelectorComponent && (this.settings.activeComponent == 'commercialUnits')) {
        this.generalSelectorComponent.bootstrap({ 
          activeComponent: 'Products/CommercialUnits', selectItem: this.settings.selectedItem
        });
      }

      if (this.generalSelectorComponent && (this.settings.activeComponent == 'categories')) {
        this.generalSelectorComponent.bootstrap({ 
          activeComponent: 'Products/Categories', selectItem: this.settings.selectedItem
        });
      }

      if (this.generalSelectorComponent && (this.settings.activeComponent == 'departments')) {
        this.generalSelectorComponent.bootstrap({
          activeComponent: 'Products/Departments', selectItem: this.settings.selectedItem
        });
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

  public onProvidersResponse(event: any) {

    if (event.instance) {
      this.providersComponent = event.instance;
    }

    if (event.data) {
      this.callback.emit({ provider: event.data });
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
      this.callback.emit({ products: event.data, additional: this.settings.additional});
    }

    if (event.close) {
      this.onClose();
    }
  }

  public onBillsToPayResponse(event: any) {

    if (event.instance) {
      this.billsToPayComponent = event.instance;
    }

    if (event.data) {
      this.callback.emit({ billsToReceive: event.data });
    }

    if (event.close) {
      this.onClose();
    }
  }

  
  public onGeneralSelectorResponse(event: any) {

    if (event.instance) {
      this.generalSelectorComponent = event.instance;
    }

    if (event.data) {

      if (this.settings.activeComponent == 'commercialUnits') {
        this.callback.emit({ commercialUnit: event.data });
      }

      if (this.settings.activeComponent == 'categories') {
        this.callback.emit({ category: event.data });
      }

      if (this.settings.activeComponent == 'departments') {
        this.callback.emit({ department: event.data });
      }
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
    this.providersComponent = null;
    this.productsComponent = null;
    this.billsToPayComponent = null;

    Dispatch.removeListeners('languageChange', 'PurchasesRegisterLayerComponent');
  }

}
