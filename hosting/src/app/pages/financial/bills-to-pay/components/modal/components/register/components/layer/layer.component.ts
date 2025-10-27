import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';

// Translate
import { BillsToPayTranslate } from '@pages/financial/bills-to-pay/bills-to-pay.translate';

// Ultilities
import { Dispatch } from '@shared/utilities/dispatch';

@Component({
  selector: 'bills-to-pay-register-layer',
  templateUrl: './layer.component.html'
})
export class BillsToPayRegisterLayerComponent implements OnInit, OnDestroy {

  @Output() callback: EventEmitter<any> = new EventEmitter();
 
  public translate = BillsToPayTranslate.get()['modal']['action']['register']['layer'];
  public settings: any = {};

  private layerComponent: any;
  private providersComponent: any;
  private generalSelectorComponent: any;
  private paymentMethodsComponent: any;

  constructor() {}

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // Layer Actions

  public onOpen(settings: any) {

    this.settings = settings;
    this.settings.data = (settings.data || {});

    // Reset cached component reference so the active selector gets the bootstrap call
    if (this.settings.activeComponent === 'categories' || this.settings.activeComponent === 'departments') {
      this.generalSelectorComponent = null;
    }

    this.layerComponent.onOpen();
    
    // Checks the component's response and initializes them

    const timer = setInterval(() => {

      if (
        (this.providersComponent && (this.settings.activeComponent == 'beneficiaries')) ||
        (this.generalSelectorComponent && (this.settings.activeComponent == 'categories')) ||
        (this.paymentMethodsComponent && (this.settings.activeComponent == 'paymentMethods'))
      ) {
        clearInterval(timer);
      }

      if (this.generalSelectorComponent && (this.settings.activeComponent == 'categories' || this.settings.activeComponent == 'departments')) {
        const selectorComponent = (this.settings.activeComponent == 'departments') ? 'Products/Departments' : 'BillsToPay/Categories';
        this.generalSelectorComponent.bootstrap({ activeComponent: selectorComponent, selectItem: this.settings.selectItem });
      }

      if (this.paymentMethodsComponent && (this.settings.activeComponent == 'paymentMethods')) {
        this.paymentMethodsComponent.bootstrap();
      }
    }, 100);

    // Check when the translation changes

    this.checkTranslationChange();
  }

  public onClose(standard: boolean = false) {

    if (!standard) {
      this.layerComponent.onClose();
    }

    Dispatch.removeListeners('languageChange', 'BillsToPayRegisterLayerComponent');

    this.generalSelectorComponent = null;
    this.providersComponent = null;
    this.paymentMethodsComponent = null;
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
      this.providersComponent = event.instance;
    }

    if (event.data) {
      this.callback.emit({ beneficiary: event.data });
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
  
  public onPaymentResponse(event: any) {

    if (event.instance) {
      this.paymentMethodsComponent = event.instance;
    }

    if (event.data) {
      this.callback.emit({ paymentMethods: event.data });
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
       
    Dispatch.onLanguageChange('BillsToPayRegisterLayerComponent', () => {
      setTitle();
    });
    
    setTitle();
  }

  // Destruction Methods

  public ngOnDestroy() {

    this.settings = {};

    this.layerComponent = null;
    this.providersComponent = null;
    this.generalSelectorComponent = null;
    this.paymentMethodsComponent = null;

    Dispatch.removeListeners('languageChange', 'BillsToPayRegisterLayerComponent');
  }

}
