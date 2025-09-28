import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { Dispatch } from '@shared/utilities/dispatch';

// Translate
import { CashierRecordsTranslate } from '../../../cashier-records/cashier-records.translate';

@Component({
  selector: 'cashier-front-records',
  templateUrl: './cashier-records.component.html'
})
export class CashierFrontRecordsComponent implements OnInit, OnDestroy {

  @Output() callback: EventEmitter<any> = new EventEmitter();

  public static shared: CashierFrontRecordsComponent;

  public translate = CashierRecordsTranslate.get();

  public isShow: boolean = false;

  private modalComponent: any;  
  
  constructor() {
    CashierFrontRecordsComponent.shared = this;
  }

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // Modal Actions

  public onOpenModal() {

    this.isShow = true;

    this.modalComponent.onOpen();

    // Check when the translation changes

    this.checkTranslationChange();
  }

  public onCloseModal(standard: boolean = false) {

    this.isShow = false;

    if (!standard) {
      this.modalComponent.onClose();
    }
    
  }

  // Event Listeners

  public onModalResponse(event: any) {

    if (event.instance) { 
      this.modalComponent = event.instance;
    }

    if (event.close) {
      this.onCloseModal(true);
    }
  }

  public onCashierRecordsResponse(event: any) {

    if (event.close) {
      this.onCloseModal();
    }
  }

  // Auxiliary Methods

  private checkTranslationChange() {
  
    const setTitle = () => {

      if (this.modalComponent) {
        this.modalComponent.title = this.translate.pageTitle;
      }
    };
        
    Dispatch.onLanguageChange('CashierFrontRecordsComponent', () => {
      setTitle();
    });
    
    setTitle();
  }

  // Destruction Method

  public ngOnDestroy() {
    this.modalComponent = null;
    Dispatch.removeListeners('languageChange', 'CashierFrontRecordsComponent');
  }

}
