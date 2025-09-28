import { Component, EventEmitter, Output, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Dispatch } from '@shared/utilities/dispatch';

// Services
import { CashierFrontReportsService } from './cashier-reports.service';

// Translate
import { CashierFrontReportsTranslate } from './cashier-reports.translate';

@Component({
  selector: 'cashier-front-reports',
  templateUrl: './cashier-reports.component.html',
  styleUrls: ['./cashier-reports.component.scss']
})
export class CashierFrontReportsComponent implements OnInit, OnDestroy {

  @Output() callback: EventEmitter<any> = new EventEmitter();

  @ViewChild('modal', { static: false }) modal: ElementRef;
  @ViewChild('tabs', { static: false }) tabs: ElementRef;

  public static shared: CashierFrontReportsComponent;

  public translate = CashierFrontReportsTranslate.get();
  
  public loading: boolean = true; 
  public settings: any = {};
  public data: any = {};
  public activeTab: string = '';

  private modalComponent: any;
  private tabsComponent: any;
  private reportPrintComponent: any;

  constructor(
    private cashierFrontReportsService: CashierFrontReportsService
  ) {
    CashierFrontReportsComponent.shared = this;   
  }

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  public bootstrap() {

    this.loading = true;

    this.cashierFrontReportsService.getData((data) => {

      this.data = data;
      setTimeout(() => { this.loading = false }, 1000);
    });
  }

  // User Interface Actions

  public onReportPrint(type: string) {

    this.reportPrintComponent.onLaunchPrint({
      type: type,
      data: this.data
    });
  }

  // Modal Actions

  public onOpenModal(settings: any = {}) {
    
    this.settings = settings;

    this.bootstrap();

    this.modalComponent.onOpen({
      style: {
        backgroundColor: 'white',
        backgroundImage: false
      }
    });
    
    // Check when the translation changes

    this.checkTranslationChange();
  }

  public onCloseModal() {
    this.loading = false;
    this.modalComponent.onCloseModas();
  }

  // Event Listeners

  public onModalResponse(event) {
    
    if (event.instance) {
      this.modalComponent = event.instance;
    }
  }

  public onTabsResponse(event) {
    
    if (event.instance) {

      this.tabsComponent = event.instance;

      this.tabsComponent.initialize({ 
        items: [
          { id: 'general', name: this.translate.tabs.option.general },
          { id: 'sales', name: this.translate.tabs.option.sales },
          { id: 'inflows', name: this.translate.tabs.option.inflows },
          { id: 'outflows', name: this.translate.tabs.option.outflows }
        ],
        activate: 'general'
      });
    }

    if (event.activeTab) {
      this.activeTab = event.activeTab;
    }
  }

  public onReportPrintResponse(event) {

    if (event.instance) {
      this.reportPrintComponent = event.instance;
    }
  }

  // Auxiliary Methods

  private checkTranslationChange() {
  
    const setTitle = () => {

      if (this.modalComponent) {
        this.modalComponent.title = this.translate.modalTitle;
      }
    };   
        
    Dispatch.onLanguageChange('PurchasesModalComponent', () => {
      setTitle();
    });
    
    setTitle();
  }

  // Destruction Method

  public ngOnDestroy() {
    Dispatch.removeListeners('languageChange', 'PurchasesModalComponent');
  }

}
