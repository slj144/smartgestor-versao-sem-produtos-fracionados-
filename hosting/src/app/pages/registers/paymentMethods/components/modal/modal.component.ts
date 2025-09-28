import { Component, Output, EventEmitter, OnInit } from '@angular/core';

// Services
import { PaymentMethodsService } from '../../paymentMethods.service';

// Translate
import { PaymentMethodsTranslate } from '../../paymentMethods.translate';

// Utilities
import { Dispatch } from '@shared/utilities/dispatch';

@Component({
  selector: 'payment-methods-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class PaymentMethodsModalComponent implements OnInit {

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  public translate = PaymentMethodsTranslate.get()['modal'];

  public settings: any = {};

  private modalComponent: any;
  private filtersComponent: any;
  private registerComponent: any;
  private dataExportComponent: any; 

  constructor(
    private paymentMethodsService: PaymentMethodsService
  ) {}

  public ngOnInit() {
    this.callback.emit({ instance: this });    
  }

  // User Interface Actions

  public onDelete() {

    const data = this.settings.data;

    this.paymentMethodsService.deletePaymentMethod(data, (this.settings.type == 'Provider/Delete')).then(() => {
      this.onClose();
    });
  } 

  // Modal Actions

  public onOpen(settings: any) {

    this.settings = settings;
    this.settings.data = (settings.data || {});
    
    const config = { mode: 'fullscreen' };

    if (this.settings.activeComponent === 'Customers/Filters') {
      config.mode = 'sidescreen';
    }

    this.modalComponent.onOpen(config);

    // Checks the component's response and initializes them

    const timer = setInterval(() => {

      if (   
        (this.settings.activeComponent === 'PaymentMethods/Filters' && this.filtersComponent) ||
        (this.settings.activeComponent === 'PaymentMethods/Read') ||        
        ((this.settings.activeComponent === 'PaymentMethods/Create') || (this.settings.activeComponent === 'PaymentMethods/Update') && this.registerComponent) ||
        (this.settings.activeComponent === 'PaymentMethods/Delete') ||
        ((this.settings.activeComponent === 'PaymentMethods/DataExport') && this.dataExportComponent)
      ) { clearInterval(timer) }
      
      if (this.settings.activeComponent === 'PaymentMethods/Filters' && this.filtersComponent) {
        this.filtersComponent.bootstrap(settings);
      }

      if ((this.settings.activeComponent === 'PaymentMethods/Create') || (this.settings.activeComponent === 'PaymentMethods/Update') && this.registerComponent) {
        this.registerComponent.bootstrap(settings);
      }

      if (this.settings.activeComponent === 'PaymentMethods/DataExport' && this.dataExportComponent) {
        this.dataExportComponent.bootstrap();
      }
    }, 0);

    // Check when the translation changes

    this.checkTranslationChange();
  }

  public onClose(standard: boolean = false) {

    this.settings = {};

    if (!standard) {
      this.modalComponent.onClose();
    }

    Dispatch.removeListeners('languageChange', 'PaymentMethodsModalComponent');
  }

  // Event Listeners

  public onModalResponse(event: any) {
    
    if (event.instance) {
      this.modalComponent = event.instance;
    }

    if (event.close) {
      this.onClose(true);
    }
  }

  public onRegisterResponse(event: any) {
    
    if (event.instance) {
      this.registerComponent = event.instance;
    }

    if (event.close) { 
      this.onClose() 
    }
  }
    
  public onDataExportResponse(event: any) {

    if (event.instance) {
      this.dataExportComponent = event.instance;
    }

    if (event.close) {
      this.onClose();
    }
  }
      
  // Auxiliary Methods

  private checkTranslationChange() {

    const setTitle = () => {

      if (this.modalComponent) {

        if (this.settings.activeComponent == 'PaymentMethods/Filters') {
          this.modalComponent.title = this.translate.filters.title;
        }       

        if (this.settings.activeComponent == 'PaymentMethods/Create') {
          this.modalComponent.title = this.translate.action.register.type.create.title;
        }
        
        if (this.settings.activeComponent == 'PaymentMethods/Read') {
          this.modalComponent.title = this.translate.action.read.title;
        }

        if (this.settings.activeComponent == 'PaymentMethods/Update') {
          this.modalComponent.title = this.translate.action.register.type.update.title;
        }

        if (this.settings.activeComponent == 'PaymentMethods/Delete') {
          this.modalComponent.title = this.translate.action.delete.title;
        }

        if (this.settings.activeComponent == 'PaymentMethods/DataExport') {
          this.modalComponent.title = this.translate.action.others.dataExport.title;
        } 
      }
    };   
       
    Dispatch.onLanguageChange('PaymentMethodsModalComponent', () => {
      setTitle();
    });
    
    setTitle();
  }

  // Destruction Methods

  public ngOnDestroy() {
    Dispatch.removeListeners('languageChange', 'PaymentMethodsModalComponent');
  }

}
