import { Component, Output, EventEmitter, OnInit } from '@angular/core';

// Components
import { CashierFrontReceiptsComponent } from '../../../cashier-front/components/cashier-receipts/cashier-receipts.component';

// Services
import { CashierFrontPDVService } from '../../../cashier-front/components/cashier-pdv/cashier-pdv.service';
import { CashierFrontInflowService } from '../../../cashier-front/components/cashier-inflow/cashier-inflow.service';
import { CashierFrontOutflowService } from '../../../cashier-front/components/cashier-outflow/cashier-outflow.service';

// Translate
import { CashierRecordsTranslate } from '../../cashier-records.translate';

// Utilities
import { Utilities } from '@shared/utilities/utilities';
import { Dispatch } from '@shared/utilities/dispatch';

@Component({
  selector: 'cashier-records-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class CashierRecordsModalComponent implements OnInit {

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  public translate = CashierRecordsTranslate.get()['modal'];
  
  public settings: any = {};

  private modalComponent: any;
  private filtersComponent: any;

  constructor(
    private cashierFrontPDVService: CashierFrontPDVService,
    private cashierFrontInflowService: CashierFrontInflowService,
    private cashierFrontOutflowService: CashierFrontOutflowService,
  ) {}

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // User Interface Actions

  public onCancel() {

    const data = Utilities.deepClone(this.settings.data);

    if (this.settings.type == 'Sale') {      
      this.cashierFrontPDVService.cancelSale(data).then(() => {
        this.onClose();
      });
    }

    if (this.settings.type == 'Inflow') {      
      this.cashierFrontInflowService.cancelInflow(data).then(() => {
        this.onClose();
      });
    }

    if (this.settings.type == 'Outflow') {
      this.cashierFrontOutflowService.cancelOutflow(data).then(() => {
        this.onClose();
      });
    }
  }

  public onDelete() {

    const data = this.settings.data;

    if (this.settings.type == 'Inflow') {      
      this.cashierFrontInflowService.deleteInflow(data).then(() => {
        this.onClose();
      });
    }

    if (this.settings.type == 'Outflow') {
      this.cashierFrontOutflowService.deleteOutflow(data).then(() => {
        this.onClose();
      });
    }
  }

  public onPrint(data: any, type: string) {
    CashierFrontReceiptsComponent.shared.onOpen({ data, type, nf: data.nf, fiscal: !!data.nf });
  }

  // Modal Actions

  public onOpen(settings: any) {

    this.settings = settings;
    this.settings.cloneData = Utilities.deepClone(settings.data);

    const config = { mode: 'fullscreen' };

    if (settings.activeComponent === 'CashierRecords/Filters') {
      config.mode = 'sidescreen';
    }

    this.modalComponent.onOpen(config);

    // Checks the component's response and initializes them

    const timer = setInterval(() => {

      if (
        (this.settings.activeComponent === 'CashierRecords/Read') ||
        (this.settings.activeComponent === 'CashierRecords/Filters' && this.filtersComponent)
      ) { clearInterval(timer) }
      
      if (this.settings.activeComponent === 'CashierRecords/Filters' && this.filtersComponent) {
        this.filtersComponent.bootstrap(settings);
      }
    }, 100);

    // Check when the translation changes

    this.checkTranslationChange();
  }  

  public onClose(standard: boolean = false) {

    this.settings = {};

    if (!standard) {
      this.modalComponent.onClose();
    }

    Dispatch.removeListeners('languageChange', 'CashierRecordsModalComponent');
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

  public onResponseRegisterNf(event: any){

    if(event.instance){

      event.instance.bootstrap({
        data: Utilities.deepClone(this.settings.data)
      });
    }

    if (event.close) {
      this.onClose();
      event.instance?.reset();
    }
  }

  // Auxiliary Methods

  private checkTranslationChange() {
    
    const setTitle = () => {

      if (this.modalComponent) {

        if (this.settings.activeComponent == 'CashierRecords/Help') {
          this.modalComponent.title = this.translate.help.title;
        }

        if (this.settings.activeComponent == 'CashierRecords/Filters') {
          this.modalComponent.title = this.translate.filters.title;
        }

        if (this.settings.activeComponent == 'CashierRecords/Read') {

          if (this.settings.type == 'Sale') {
            this.modalComponent.title = this.translate.action.read.sale.title;
          }

          if (this.settings.type == 'Inflow') {
            this.modalComponent.title = this.translate.action.read.inflow.title;
          }

          if (this.settings.type == 'Outflow') {
            this.modalComponent.title = this.translate.action.read.outflow.title;
          }
        }

        if (this.settings.activeComponent == 'CashierRecords/Cancel') {

          if (this.settings.type == 'Sale') {
            this.modalComponent.title = this.translate.action.cancel.sale.title;
          }

          if (this.settings.type == 'Inflow') {
            this.modalComponent.title = this.translate.action.cancel.inflow.title;
          }

          if (this.settings.type == 'Outflow') {
            this.modalComponent.title = this.translate.action.cancel.outflow.title;
          }
        }

        if (this.settings.activeComponent == 'CashierRecords/Delete') {

          if (this.settings.type == 'Inflow') {
            this.modalComponent.title = this.translate.action.delete.inflow.title;
          }

          if (this.settings.type == 'Outflow') {
            this.modalComponent.title = this.translate.action.delete.outflow.title;
          }
        }

        if (this.settings.activeComponent == 'Fiscal/Add') {

          if (this.settings.type == 'fiscal') {
            this.modalComponent.title = "Emitir Nota Fiscal";
          }
        }
      }
    };
       
    Dispatch.onLanguageChange('CashierRecordsModalComponent', () => {
      setTitle();
    });
    
    setTitle();
  }

  // Destruction Method

  public ngOnDestroy() {
    Dispatch.removeListeners('languageChange', 'CashierRecordsModalComponent');
  }

}
