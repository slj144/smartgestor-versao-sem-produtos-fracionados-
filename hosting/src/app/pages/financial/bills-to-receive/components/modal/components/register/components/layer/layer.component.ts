import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';

// Translate
import { BillsToReceiveTranslate } from '../../../../../../bills-to-receive.translate';

// Ultilities
import { Dispatch } from '@shared/utilities/dispatch';

@Component({
  selector: 'bills-to-receive-register-layer',
  templateUrl: './layer.component.html'
})
export class BillsToReceiveRegisterLayerComponent implements OnInit, OnDestroy {

  @Output() callback: EventEmitter<any> = new EventEmitter();
 
  public translate = BillsToReceiveTranslate.get()['modal']['action']['register']['layer'];

  public settings: any = {};

  private layerComponent: any;
  private customersComponent: any;
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

    this.layerComponent.onOpen();
    
    // Checks the component's response and initializes them

    const timer = setInterval(() => {

      if (
        (this.customersComponent && (this.settings.activeComponent == 'debtors')) ||
        (this.generalSelectorComponent && (this.settings.activeComponent == 'categories')) ||
        (this.paymentMethodsComponent && (this.settings.activeComponent == 'paymentMethods'))
      ) {
        clearInterval(timer);
      }

      if (this.generalSelectorComponent && (this.settings.activeComponent == 'categories')) {
        this.generalSelectorComponent.bootstrap({ activeComponent: 'BillsToReceive/Categories' });
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

  public onCustomersResponse(event: any) {

    if (event.instance) {
      this.customersComponent = event.instance;
    }

    if (event.data) {
      this.callback.emit({ debtor: event.data });
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
    this.customersComponent = null;
    this.generalSelectorComponent = null;
    this.paymentMethodsComponent = null;

    Dispatch.removeListeners('languageChange', 'BillsToPayRegisterLayerComponent');
  }

}
