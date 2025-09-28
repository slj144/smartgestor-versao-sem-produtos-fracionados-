import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';

// Services
import { BillsToReceiveService } from '../../bills-to-receive.service';

// Translate
import { BillsToReceiveTranslate } from '../../bills-to-receive.translate';

// Utilities
import { Utilities } from '@shared/utilities/utilities';
import { Dispatch } from '@shared/utilities/dispatch';

@Component({
  selector: 'bills-to-receive-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class BillsToReceiveModalComponent implements OnInit, OnDestroy {

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  public translate = BillsToReceiveTranslate.get()['modal'];

  public settings: any = {};

  private modalComponent: any;
  private filtersComponent: any;
  private registerComponent: any;
  private printComponent: any;

  constructor(
    private billsToReceiveService: BillsToReceiveService
  ) {}

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // User Interface Actions

  public onCancel() {
    
    const data = this.settings.data;

    this.billsToReceiveService.cancelBill(data).then(() => {
      this.modalComponent.onClose();
    });
  }
  
  public onDelete() {
    
    const data = this.settings.data;

    this.billsToReceiveService.deleteBill(data).then(() => {
      this.modalComponent.onClose();
    });
  }

  // Modal Actions

  public onOpen(settings: any) {

    this.settings = settings;
    this.settings.data = (settings.data || {});

    const config: any = { mode: 'fullscreen' };

    if (this.settings.activeComponent === 'BillsToReceive/Filters') {
      config.mode = 'sidescreen';
    }    

    this.modalComponent.onOpen(config);

    // Checks the component's response and initializes them

    const timer = setInterval(() => {

      if (
        (this.settings.activeComponent === 'BillsToReceive/Read') ||
        (this.settings.activeComponent === 'BillsToReceive/Filters' && this.filtersComponent) ||
        ((this.settings.activeComponent === 'BillsToReceive/Create') || (this.settings.activeComponent === 'BillsToReceive/Update') && this.registerComponent)
      ) { clearInterval(timer) }
      
      if (this.settings.activeComponent === 'BillsToReceive/Filters' && this.filtersComponent) {
        this.filtersComponent.bootstrap(settings);
      }

      if ((this.settings.activeComponent === 'BillsToReceive/Create') || (this.settings.activeComponent === 'BillsToReceive/Update') && this.registerComponent) {
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

        if (this.settings.activeComponent == 'BillsToReceive/Filters') {
          this.modalComponent.title = this.translate.filters.title;
        }

        if (this.settings.activeComponent == 'BillsToReceive/Read') {
          this.modalComponent.title = this.translate.action.read.title;
        }    

        if (this.settings.activeComponent == 'BillsToReceive/Create') {
          this.modalComponent.title = this.translate.action.register.type.create.title;
        } 

        if (this.settings.activeComponent == 'BillsToReceive/Update') {
          this.modalComponent.title = this.translate.action.register.type.update.title;
        } 

        if (this.settings.activeComponent == 'BillsToReceive/Cancel') {
          this.modalComponent.title = this.translate.action.cancel.title;
        }

        if (this.settings.activeComponent == 'BillsToReceive/Delete') {
          this.modalComponent.title = this.translate.action.delete.title;
        }        
      }
    };   
      
    Dispatch.onLanguageChange('BillsToReceiveModalComponent', () => {
      setTitle();
    });
    
    setTitle();
  }
  
  // Destruction Methods

  public ngOnDestroy() {
    Dispatch.removeListeners('languageChange', 'BillsToReceiveModalComponent');
  }

}
