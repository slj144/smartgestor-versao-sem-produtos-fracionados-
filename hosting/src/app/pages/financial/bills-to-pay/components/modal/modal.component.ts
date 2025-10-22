import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';

// Services
import { BillsToPayService } from '../../bills-to-pay.service';

// Translate
import { BillsToPayTranslate } from '../../bills-to-pay.translate';

// Utilities
import { Utilities } from '@shared/utilities/utilities';
import { Dispatch } from '@shared/utilities/dispatch';

@Component({
  selector: 'bills-to-pay-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class BillsToPayModalComponent implements OnInit, OnDestroy {

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  public translate = BillsToPayTranslate.get()['modal'];

  public settings: any = {};

  private modalComponent: any;
  private filtersComponent: any;
  private registerComponent: any;
  private printComponent: any;

  constructor(
    private billsToPayService: BillsToPayService
  ) {}

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  public get useDepartments(): boolean {
    return Utilities.stockDepartmentsEnabled;
  }

  public formatDepartmentCode(code: number | string | undefined): string {
    const stringCode = String(code ?? '').trim();

    if (!stringCode) {
      return '';
    }

    if (stringCode.startsWith('@')) {
      return stringCode;
    }

    const numeric = parseInt(stringCode, 10);
    return isNaN(numeric) ? stringCode : Utilities.prefixCode(numeric);
  }

  // User Interface Actions

  public onCancel() {
    
    const data = this.settings.data;

    this.billsToPayService.cancelBill(data).then(() => {
      this.modalComponent.onClose();
    });
  }
  
  public onDelete() {
    
    const data = this.settings.data;

    this.billsToPayService.deleteBill(data).then(() => {
      this.modalComponent.onClose();
    });
  }

  // Modal Actions

  public onOpen(settings: any) {

    const modalSettings: any = { mode: 'fullscreen' };

    this.settings = settings;
    this.settings.data = (settings.data || {});

    if (this.settings.activeComponent === 'BillsToPay/Filters') {
      modalSettings.mode = 'sidescreen';
    }

    this.modalComponent.onOpen(modalSettings);

    // Checks the component's response and initializes them

    const timer = setInterval(() => {

      if (
        (this.settings.activeComponent === 'BillsToPay/Read') ||
        (this.settings.activeComponent === 'BillsToPay/Filters' && this.filtersComponent) ||
        ((this.settings.activeComponent === 'BillsToPay/Create') && this.registerComponent) ||
        ((this.settings.activeComponent === 'BillsToPay/Update') && this.registerComponent) ||
        (this.settings.activeComponent === 'BillsToPay/Delete')
      ) { clearInterval(timer) }
      
      if (this.settings.activeComponent === 'BillsToPay/Filters' && this.filtersComponent) {
        this.filtersComponent.bootstrap(settings);
      }

      if ((this.settings.activeComponent === 'BillsToPay/Create') || (this.settings.activeComponent === 'BillsToPay/Update') && this.registerComponent) {
        this.registerComponent.bootstrap({ action: settings.activeComponent, data: settings.data });
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

    Dispatch.removeListeners('languageChange', 'BillsToPayModalComponent');
  }

  // Print Actions

  public onOpenPrinter() {
    
    this.printComponent.onLaunchPrint({
      activeComponent: 'Receipt',
      data: Utilities.deepClone(this.settings.data)
    });
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

  public onFiltersResponse(event: any) {

    if (event.instance) {
      this.filtersComponent = event.instance;
    }
  }

  public onRegisterResponse(event: any) {
    
    if (event.instance) {
      this.registerComponent = event.instance;
    }

    if (event.close) { 
      this.modalComponent.onClose() 
    }
  }

  public onPrintResponse(event: any) {

    if (event.instance) {
      this.printComponent = event.instance;
    }
  }
  
  // Auxiliary Methods

  private checkTranslationChange() {

    const setTitle = () => {

      if (this.modalComponent) {

        if (this.settings.activeComponent == 'BillsToPay/Filters') {
          this.modalComponent.title = this.translate.filters.title;
        }

        if (this.settings.activeComponent == 'BillsToPay/Read') {
          this.modalComponent.title = this.translate.action.read.title;
        }    

        if (this.settings.activeComponent == 'BillsToPay/Create') {
          this.modalComponent.title = this.translate.action.register.type.create.title;
        } 

        if (this.settings.activeComponent == 'BillsToPay/Update') {
          this.modalComponent.title = this.translate.action.register.type.update.title;
        } 

        if (this.settings.activeComponent == 'BillsToPay/Cancel') {
          this.modalComponent.title = this.translate.action.cancel.title;
        }

        if (this.settings.activeComponent == 'BillsToPay/Delete') {
          this.modalComponent.title = this.translate.action.delete.title;
        }
      }
    };   
      
    Dispatch.onLanguageChange('BillsToPayModalComponent', () => {
      setTitle();
    });
    
    setTitle();
  }

  // Destruction Methods

  public ngOnDestroy() {
    Dispatch.removeListeners('languageChange', 'BillsToPayModalComponent');
  }

}
