import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';

// Translate
import { ProductsTranslate } from '../../../../../../products.translate';

// Ultilities
import { Dispatch } from '@shared/utilities/dispatch';

@Component({
  selector: 'products-register-layer',
  styleUrls: ['./layer.component.scss'],
  templateUrl: './layer.component.html'
})
export class ProductsRegisterLayerComponent implements OnInit, OnDestroy {

  @Output() callback: EventEmitter<any> = new EventEmitter(); 

  public translate = ProductsTranslate.get()['modal']['action']['register'];
  
  public settings: any = {};

  private layerComponent: any;
  private generalSelectorComponent: any;

  constructor() {}

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // Layer Actions

  public onOpen(settings: any) {
    
    this.settings = settings;

    this.layerComponent.onOpen();
        
    // Checks the component's response and initializes them

    const timer = setInterval(() => {
      
      if (
        (this.generalSelectorComponent && (this.settings.activeComponent == 'commercialUnits')) || 
        (this.generalSelectorComponent && (this.settings.activeComponent == 'categories')) || 
        (this.generalSelectorComponent && (this.settings.activeComponent == 'departments')) || 
        (this.generalSelectorComponent && (this.settings.activeComponent == 'providers'))
      ) {
        clearInterval(timer);
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

      if (this.generalSelectorComponent && (this.settings.activeComponent == 'providers')) {
        this.generalSelectorComponent.bootstrap({ 
          activeComponent: 'Products/Providers', selectItem: this.settings.selectedItem
        });
      }
    }, 0);

    // Check when the translation changes

    this.checkTranslationChange();
  }

  public onClose(standard: boolean = false) {

    if (!standard) {
      this.layerComponent.onClose();
    }

    Dispatch.removeListeners('languageChange', 'ProductsRegisterLayerComponent');
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

  public onProvidersResponse(event: any) {

    if (event.instance) {
      this.generalSelectorComponent = event.instance;
    }

    if (event.data) {
      this.callback.emit({ provider: event.data });
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
        this.layerComponent.title = this.translate.layer[this.settings.activeComponent].title;        
      }
    };   
       
    Dispatch.onLanguageChange('ProductsRegisterLayerComponent', () => {
      setTitle();
    });
    
    setTitle();
  }

  // Destruction Methods

  public ngOnDestroy() {

    this.settings = {};
    this.layerComponent = null;
    this.generalSelectorComponent = null;

    Dispatch.removeListeners('languageChange', 'ProductsRegisterLayerComponent');
  }
  
}
