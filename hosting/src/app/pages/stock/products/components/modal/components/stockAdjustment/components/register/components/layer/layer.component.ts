import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';

// Translate
import { StockAdjustmentTranslate } from '../../../../stockAdjustment.translate';

// Ultilities
import { Dispatch } from '@shared/utilities/dispatch';

@Component({
  selector: 'stock-adjustment-register-layer',
  templateUrl: './layer.component.html'
})
export class StockAdjustmentRegisterLayerComponent implements OnInit, OnDestroy {

  @Output() callback: EventEmitter<any> = new EventEmitter();
 
  public translate = StockAdjustmentTranslate.get();

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
    this.settings.data = (settings.data || {});

    this.layerComponent.onOpen();
    
    // Checks the component's response and initializes them

    const timer = setInterval(() => {

      if (
        (this.generalSelectorComponent && (this.settings.activeComponent == 'adjustmentTypes'))
      ) {
        clearInterval(timer);
      }

      if (this.generalSelectorComponent && (this.settings.activeComponent == 'adjustmentTypes')) {

        console.log({
          activeComponent: 'StockMovement/AdjustmentTypes',
          selectItem: { code: this.settings.selectedItem }
        });

        this.generalSelectorComponent.bootstrap({
          activeComponent: 'StockMovement/AdjustmentTypes',
          selectItem: { code: this.settings.selectedItem }
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

    Dispatch.removeListeners('languageChange', 'StockAdjustmentRegisterLayerComponent');
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

      if (this.settings.activeComponent == 'adjustmentTypes') {
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
        this.layerComponent.title = this.translate[this.settings.activeComponent].title;
      }
    };   
       
    Dispatch.onLanguageChange('StockAdjustmentRegisterLayerComponent', () => {
      setTitle();
    });
    
    setTitle();
  }

  // Destruction Methods

  public ngOnDestroy() {
    Dispatch.removeListeners('languageChange', 'StockAdjustmentRegisterLayerComponent');
  }

}
