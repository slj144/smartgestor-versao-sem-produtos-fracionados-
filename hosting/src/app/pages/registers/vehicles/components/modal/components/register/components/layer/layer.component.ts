import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';

// Translate
import { VehiclesTranslate } from '@pages/registers/vehicles/vehicles.translate';

// Ultilities
import { Dispatch } from '@shared/utilities/dispatch';

@Component({
  selector: 'vehicles-register-layer',
  templateUrl: './layer.component.html'
})
export class VehiclesRegisterLayerComponent implements OnInit, OnDestroy {

  @Output() callback: EventEmitter<any> = new EventEmitter();
 
  public translate = VehiclesTranslate.get()['modal']['action']['register']['layer'];
  public settings: any = {};

  private layerComponent: any;
  private ownersComponent: any;
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
        (this.ownersComponent && (this.settings.activeComponent == 'owners')) ||
        (this.generalSelectorComponent && (this.settings.activeComponent == 'models'))
      ) {
        clearInterval(timer);
      }

      if (this.generalSelectorComponent && (this.settings.activeComponent == 'models')) {
        this.generalSelectorComponent.bootstrap({ activeComponent: 'Vehicles/Models' });
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

  public onOwnerResponse(event: any) {

    if (event.instance) {
      this.ownersComponent = event.instance;
    }

    if (event.data) {
      this.callback.emit({ owner: event.data });
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
      if (this.settings.activeComponent == 'models') {
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
       
    Dispatch.onLanguageChange('VehicleRegisterLayerComponent', () => {
      setTitle();
    });
    
    setTitle();
  }

  // Destruction Methods

  public ngOnDestroy() {

    this.settings = {};

    this.layerComponent = null;
    this.ownersComponent = null;
    this.generalSelectorComponent = null;

    Dispatch.removeListeners('languageChange', 'VehicleRegisterLayerComponent');
  }

}
