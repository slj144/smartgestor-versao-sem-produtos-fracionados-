import { Component, Output, EventEmitter, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup } from '@angular/forms';

// Translate
import { BankAccountsTranslate } from '../../bank-accounts.translate';

// Services
import { BankAccountsService } from '../../bank-accounts.service';
import { BankTransactionsService } from '@pages/registers/_aggregates/financial/bank-transactions/bank-transactions.service';

// Utilities
import { Dispatch } from '@shared/utilities/dispatch';
import { Utilities } from '@shared/utilities/utilities';
import { DateTime } from '@shared/utilities/dateTime';

@Component({
  selector: 'bank-accounts-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class BankAccountsModalComponent implements OnInit {

  @Output() public callback: EventEmitter<any> = new EventEmitter();
  @ViewChild('modal', { static: false }) modal: ElementRef;

  public translate = BankAccountsTranslate.get()['modal'];  

  public settings: any = {};
  
  public formBankAccount: FormGroup;

  private modalComponent: any;
  private layerComponent: any;
  private filtersComponent: any;
  private registerComponent: any;
  private printComponent: any;
  private transferComponent: any;

  constructor(
    private bankAccountsService: BankAccountsService,
    private bankTransactionsService: BankTransactionsService
  ) {}

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // User Interface Actions

  public onPrintExtract(period: string) {

    Utilities.loading();

    DateTime.context(() => {

      const date = new Date(`${DateTime.getDate('D')} 00:00:00`);
      const end = `${DateTime.formatDate(date.toISOString()).date} 23:59:59`;

      switch (period) {
        case 'last_7': date.setDate(date.getDate() - 6); break;
        case 'last_15': date.setDate(date.getDate() - 14); break;
        case 'last_30': date.setDate(date.getDate() - 29); break;
      }

      const start = `${DateTime.formatDate(date.toISOString()).date} 00:00:00 `;

      this.bankTransactionsService.getTransactions(this.settings.data.code, { start, end }, null, 'DESC').then((records) => {

        this.printComponent.onLaunchPrint({
          activeComponent: 'BankAccounts/Extract',
          data: {
            informations: this.settings.data,
            transactions: records
          }
        });

        Utilities.loading(false);
      });
    });   
  }

  public onDelete() {

    const data = this.settings.data;

    this.bankAccountsService.deleteAccount(data).then(() => {
      this.onClose();
    });
  }   

  // Modal Actions

  public onOpen(settings: any = {}) {

    this.settings = settings;
    this.settings.data = (settings.data || {});

    const config = { mode: 'fullscreen' };

    if (this.settings.activeComponent === 'BankAccounts/Filters') {
      config.mode = 'sidescreen';
    }

    this.modalComponent.onOpen(config);

    // Checks the component's response and initializes them

    const timer = setInterval(() => {

      if (
        (this.settings.activeComponent === 'BankAccounts/Read') ||
        (this.settings.activeComponent === 'BankAccounts/Filters' && this.filtersComponent) ||
        (((this.settings.activeComponent === 'BankAccounts/Create') || (this.settings.activeComponent === 'BankAccounts/Update')) && this.registerComponent) ||
        (this.settings.activeComponent === 'BankAccounts/Transfer' && this.transferComponent)
      ) { clearInterval(timer) }
      
      if (this.settings.activeComponent === 'BankAccounts/Filters' && this.filtersComponent) {
        this.filtersComponent.bootstrap(settings);
      }

      if ((this.settings.activeComponent === 'BankAccounts/Create') || (this.settings.activeComponent === 'BankAccounts/Update') && this.registerComponent) {
        this.registerComponent.bootstrap({ action: settings.activeComponent, data: settings.data });
      }

      if ((this.settings.activeComponent === 'BankAccounts/Transfer') && this.transferComponent) {
        this.transferComponent.bootstrap({ sourceAccountCode: settings.data?.code });
      }
    }, 100); 

    // Check when the translation changes

    this.checkTranslationChange();
    this.checkTransactions();
  }  

  public onClose(standard: boolean = false) {

    if (!standard) {
      this.modalComponent.onClose();
    }

    Dispatch.removeListeners('languageChange', 'BankAccountsModalComponent');
  }

  // Event Listeners

  public onModalResponse(event: any) {

    if (event.instance) {
      this.modalComponent = event.instance;
    }

    if (event.modal) {
      this.onClose(true);
    }
  }

  public onLayerResponse(event: any) {

    if (event.instance) {
      this.layerComponent = event.instance;
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
      this.onClose() 
    }
  }
  
  public onPrintResponse(event: any) {

    if (event.instance) {
      this.printComponent = event.instance;
    }    
  }
  
  public onTransferResponse(event: any) {

    if (event.instance) {
      this.transferComponent = event.instance;
    }

    if (event.success) {
      // After successful transfer, return to Read view and refresh balance + extract
      this.settings.activeComponent = 'BankAccounts/Read';
      this.refreshCurrentAccount().then(() => this.checkTransactions());
    }

    if (event.close) {
      this.onClose();
    }
  }

  private async refreshCurrentAccount(): Promise<void> {
    return new Promise<void>((resolve) => {
      const code = this.settings?.data?.code;
      if (!code) { return resolve(); }
      this.bankAccountsService.getAccount(code).then((acc) => {
        if (acc) {
          this.settings.data.balance = acc.balance;
        }
        resolve();
      }).catch(() => resolve());
    });
  }
  
  // Auxiliary Methods

  private checkTranslationChange() {

    const setTitle = () => {

      if (this.modalComponent) {

        if (this.settings.activeComponent == 'BankAccounts/Filters') {
          this.modalComponent.title = this.translate.filters.title;
        }

        if (this.settings.activeComponent == 'BankAccounts/Read') {
          this.modalComponent.title = this.translate.action.read.title;
        }    

        if (this.settings.activeComponent == 'BankAccounts/Create') {
          this.modalComponent.title = this.translate.action.register.type.create.title;
        } 

        if (this.settings.activeComponent == 'BankAccounts/Update') {
          this.modalComponent.title = this.translate.action.register.type.update.title;
        } 

        if (this.settings.activeComponent == 'BankAccounts/Delete') {
          this.modalComponent.title = this.translate.action.delete.title;
        }

        if (this.settings.activeComponent == 'BankAccounts/Transfer') {
          this.modalComponent.title = this.translate.action.transfer.title;
        }
      }
    };   
      
    Dispatch.onLanguageChange('BankAccountsModalComponent', () => {
      setTitle();
    });
    
    setTitle();
  }

  private checkTransactions() {

    this.bankTransactionsService.getTransactions(this.settings.data.code, null, 15, 'DESC').then((records) => {
      this.settings.data.latestTransactions = records.slice(0, 14);
    });
  }

  // Destruction Methods

  public ngOnDestroy() {

    this.settings = {};

    this.modalComponent = null;
    this.layerComponent = null;
    this.filtersComponent = null;
    this.registerComponent = null;
    this.printComponent = null;

    Dispatch.removeListeners('languageChange', 'BankAccountsModalComponent');
  }

}
