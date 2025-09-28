import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';

// Translate
import { CashierFrontOutflowTranslate } from '../../cashier-outflow.translate';

// Ultilities
import { Dispatch } from '@shared/utilities/dispatch';

@Component({
  selector: 'cashier-outflow-layer',
  templateUrl: './layer.component.html'
})
export class CashierFrontOutflowLayerComponent implements OnInit, OnDestroy {

  @Output() callback: EventEmitter<any> = new EventEmitter(); 

  public translate = CashierFrontOutflowTranslate.get();
  
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
        (this.generalSelectorComponent && (this.settings.activeComponent == 'categories'))
      ) {
        clearInterval(timer);
      }

      if (this.generalSelectorComponent && (this.settings.activeComponent == 'categories')) {
        this.generalSelectorComponent.bootstrap({
          activeComponent: 'CashierOutflow/Categories', selectItem: this.settings.selectedItem
        });
      }
    }, 100);

    // Check when the translation changes

    this.checkTranslationChange();
  }

  public onClose(standard: boolean = false) {

    if (!standard) {
      this.layerComponent.onClose();
    }

    if (this.generalSelectorComponent) {
      this.generalSelectorComponent.reset();
    }

    Dispatch.removeListeners('languageChange', 'CashierFrontOutflowLayerComponent');
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

  public onGeneralSelectorResponse(event: any) {

    if (event.instance) {
      this.generalSelectorComponent = event.instance;
    }

    if (event.data) {

      if (this.settings.activeComponent == 'categories') {
        this.callback.emit({ category: event.data });
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
       
    Dispatch.onLanguageChange('CashierFrontOutflowLayerComponent', () => {
      setTitle();
    });
    
    setTitle();
  }

  // Destruction Methods

  public ngOnDestroy() {

    this.settings = {};
    this.layerComponent = null;
    this.generalSelectorComponent = null;

    Dispatch.removeListeners('languageChange', 'CashierFrontOutflowLayerComponent');
  }

}
