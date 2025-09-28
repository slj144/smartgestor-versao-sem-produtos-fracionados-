import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';

// Services
import { PurchasesService } from '../../purchases.service';

// Translate
import { PurchasesTranslate } from '../../purchases.translate';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Dispatch } from '@shared/utilities/dispatch';
import { Utilities } from '@shared/utilities/utilities';
import { BillsToPayService } from '@pages/financial/bills-to-pay/bills-to-pay.service';

@Component({
  selector: 'purchases-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class PurchasesModalComponent implements OnInit, OnDestroy {

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  public translate = PurchasesTranslate.get()['modal'];

  public settings: any = {};

  private modalComponent: any;
  private filtersComponent: any;
  private registerComponent: any;
  private printComponent: any;

  constructor(
    private purchasesService: PurchasesService,
    private billsToPayService: BillsToPayService
  ) { }

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // User Interface Actions

  public onAccept() {

    const data = Utilities.deepClone(this.settings.data);

    this.purchasesService.acceptPurchase(data).then(() => {
      this.modalComponent.onClose();
    });
  }

  public onCancel() {

    const data = this.settings.data;

    data.products = (() => {

      let arrData = [];

      for (const item of data.products) {
        arrData.push({ code: item.code, quantity: parseInt(item.quantity) });
      }

      return arrData;
    })();

    this.purchasesService.cancelPurchase(data).then(() => {
      this.settings = {};
      this.modalComponent.onClose();
    });
  }

  public onDelete() {

    const data = this.settings.data;

    this.purchasesService.deletePurchase(data).then(() => {
      this.modalComponent.onClose();
    });
  }

  // User Interface Actions - Attachment

  public onOpenAttachment() {
    console.log(this.settings.data.attachment.name);
  }

  public onDownloadAttachment(anchor: any) {

    //const href = $$(anchor)[0].href;

    //if (!RegExp(/&download=/).test(href)) {
    //$$(anchor)[0].href = `${href}&download=${this.settings.data.attachment.name}`;
    const anchorEl = $$(anchor)[0];
    const href = anchorEl.href;

    if (/^data:/i.test(href)) {
      // Data URIs already contain the file, just ensure filename
      anchorEl.download = this.settings.data.attachment.name;
    } else if (!RegExp(/\bdownload=/).test(href)) {
      const sep = href.includes('?') ? '&' : '?';
      anchorEl.href = `${href}${sep}download=${encodeURIComponent(this.settings.data.attachment.name)}`;
    }

    $$(anchor).trigger('click');
  }

  // Modal Actions

  public onOpen(settings: any = {}) {

    this.settings = {};
    this.settings = settings;
    this.settings.data = (settings.data || {});

    const config: any = { mode: 'fullscreen' };
    const style: any = {};

    const isRegisterOrUpdate: boolean = (this.settings.activeComponent === 'Purchases/Create') || (this.settings.activeComponent === 'Purchases/Update');

    if (settings.activeComponent === 'Purchases/Filters') {
      config.mode = 'sidescreen';
    }

    if (isRegisterOrUpdate) {
      style.backgroundImage = false;
    }

    this.modalComponent.onOpen(config, style);

    // Checks the component's response and initializes them

    const timer = setInterval(() => {

      if (
        (this.settings.activeComponent === 'Purchases/Read') ||
        (this.settings.activeComponent === 'Purchases/Filters' && this.filtersComponent) ||
        ((this.settings.activeComponent === 'Purchases/Create') || (this.settings.activeComponent === 'Purchases/Update') && this.registerComponent)
      ) { clearInterval(timer) }

      if (this.settings.activeComponent === 'Purchases/Filters' && this.filtersComponent) {
        this.filtersComponent.bootstrap(settings);
      }

      if ((this.settings.activeComponent === 'Purchases/Create') || (this.settings.activeComponent === 'Purchases/Update') && this.registerComponent) {
        this.registerComponent.bootstrap({ data: Utilities.deepClone(settings.data) });
      }
    }, 0);


    if (this.settings.data.billToPayCode && !isRegisterOrUpdate) {
      this.billsToPayService.query([{ field: 'code', operator: '=', value: parseInt(this.settings.data.billToPayCode) }], false, false, false, false).then((res) => {
        if (res.length > 0) {
          this.settings.data.billToPay = res[0];
        }
      }).catch(() => { });
    }

    // Check when the translation changes

    this.checkTranslationChange();
  }

  public onClose(standard: boolean = false) {

    if (!standard) {
      this.modalComponent.onClose();
    }

    Dispatch.removeListeners('languageChange', 'PurchasesModalComponent');
  }

  // Print Actions

  public onOpenPrinter() {

    this.printComponent.onLaunchPrint({
      activeComponent: 'Purchase/Receipt',
      data: this.settings.data
    });
  }

  // Event Listeners

  public onModalResponse(event: any) {

    if (event.instance) {
      this.modalComponent = event.instance;
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
      this.modalComponent.onClose();
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

        if (this.settings.activeComponent == 'Purchases/Filters') {
          this.modalComponent.title = this.translate.filters.title;
        }

        if (this.settings.activeComponent == 'Purchases/Create') {
          this.modalComponent.title = this.translate.action.register.type.create.title;
        }

        if (this.settings.activeComponent == 'Purchases/Read') {
          this.modalComponent.title = this.translate.action.read.title;
        }

        if (this.settings.activeComponent == 'Purchases/Update') {
          this.modalComponent.title = this.translate.action.register.type.update.title;
        }

        if (this.settings.activeComponent == 'Purchases/Accept') {
          this.modalComponent.title = this.translate.action.accept.title;
        }

        if (this.settings.activeComponent == 'Purchases/Cancel') {
          this.modalComponent.title = this.translate.action.cancel.title;
        }

        if (this.settings.activeComponent == 'Purchases/Delete') {
          this.modalComponent.title = this.translate.action.delete.title;
        }
      }
    };

    Dispatch.onLanguageChange('PurchasesModalComponent', () => {
      setTitle();
    });

    setTitle();
  }

  // Destruction Method

  public ngOnDestroy() {

    this.settings = {};

    this.modalComponent = null;
    this.filtersComponent = null;
    this.registerComponent = null;
    this.printComponent = null;

    Dispatch.removeListeners('languageChange', 'PurchasesModalComponent');
  }

}
