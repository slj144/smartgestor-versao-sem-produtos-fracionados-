import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';

// Services
import { TransfersService } from '../../transfers.service';

// Translate
import { TransfersTranslate } from '../../transfers.translate';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { Dispatch } from '@shared/utilities/dispatch';

@Component({
  selector: 'transfers-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class TransfersModalComponent implements OnInit, OnDestroy {

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  public translate = TransfersTranslate.get()['modal'];

  public settings: any = {};

  private modalComponent: any;
  private filtersComponent: any;
  private registerComponent: any;
  private printComponent: any;

  constructor(
    private transfersService: TransfersService,
  ) { }

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // User Interface Actions - General  

  public onCancel() {

    const data = this.settings.data;

    data.products = (() => {

      let arrData = [];

      for (const product of data.products) {

        arrData.push({
          code: product.code,
          quantity: parseInt(product.quantity)
        });
      }

      return arrData;
    })();

    this.transfersService.cancelTransfer(data).then(() => {
      this.onClose();
    });
  }

  public onDelete() {

    const data = this.settings.data;

    this.transfersService.deleteTransfer(data).then(() => {
      this.onClose();
    });
  }

  public onAccept() {

    const data = this.settings.data;

    this.transfersService.acceptTransfer(data).then(() => {
      this.onClose();
    });
  }

  // User Interface Actions - Attachment

  public onOpenAttachment() {
    console.log(this.settings.data.attachment.name);
  }

  public onDownloadAttachment(anchor: any) {

    //const href = $$(anchor)[0].href;

    // if (!RegExp(/&download=/).test(href)) {
    //$$(anchor)[0].href = `${href}&download=${this.settings.data.attachment.name}`;
    const anchorEl = $$(anchor)[0];
    const href = anchorEl.href;

    if (/^data:/i.test(href)) {
      anchorEl.download = this.settings.data.attachment.name;
    } else if (!RegExp(/\bdownload=/).test(href)) {
      const sep = href.includes('?') ? '&' : '?';
      anchorEl.href = `${href}${sep}download=${encodeURIComponent(this.settings.data.attachment.name)}`;
    }

    $$(anchor).trigger('click');
  }

  // Modal Actions

  public onOpen(settings: any = {}) {

    this.settings = settings;
    this.settings.data = (settings.data || {});

    const config: any = { mode: 'fullscreen' };
    const style: any = {};


    if (settings.activeComponent === 'Transfers/Filters') {
      config.mode = 'sidescreen';
    }

    if ((this.settings.activeComponent === 'Transfers/Create') || (this.settings.activeComponent === 'Transfers/Update')) {
      style.backgroundImage = false;
    }

    this.modalComponent.onOpen(config, style);

    // Checks the component's response and initializes them

    const timer = setInterval(() => {

      if (
        (this.settings.activeComponent === 'Transfers/Read') ||
        (this.settings.activeComponent === 'Transfers/Filters' && this.filtersComponent) ||
        ((this.settings.activeComponent === 'Transfers/Create') || (this.settings.activeComponent === 'Transfers/Update') && this.registerComponent)
      ) { clearInterval(timer) }

      if (this.settings.activeComponent === 'Transfers/Filters' && this.filtersComponent) {
        this.filtersComponent.bootstrap(settings);
      }

      if ((this.settings.activeComponent === 'Transfers/Create') || (this.settings.activeComponent === 'Transfers/Update') && this.registerComponent) {
        this.registerComponent.bootstrap({ data: settings.data });
      }
    }, 0);

    // Check when the translation changes

    this.checkTranslationChange();
  }

  public onClose(standard: boolean = false) {

    if (!standard) {
      this.modalComponent.onClose();
    }

    Dispatch.removeListeners('languageChange', 'TransfersModalComponent');
  }

  // Print Actions

  public onOpenPrinter() {

    const data = Utilities.deepClone(this.settings.data);
    data.products = this.settings.data.products;

    this.printComponent.onLaunchPrint({
      activeComponent: 'Transfer/Receipt',
      data: data
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
      this.onClose();
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

        if (this.settings.activeComponent == 'Transfers/Filters') {
          this.modalComponent.title = this.translate.filters.title;
        }

        if (this.settings.activeComponent == 'Transfers/Create') {
          this.modalComponent.title = this.translate.action.register.type.create.title;
        }

        if (this.settings.activeComponent == 'Transfers/Read') {
          this.modalComponent.title = this.translate.action.read.title;
        }

        if (this.settings.activeComponent == 'Transfers/Update') {
          this.modalComponent.title = this.translate.action.register.type.update.title;
        }

        if (this.settings.activeComponent == 'Transfers/Cancel') {
          this.modalComponent.title = this.translate.action.cancel.title;
        }

        if (this.settings.activeComponent == 'Transfers/Delete') {
          this.modalComponent.title = this.translate.action.delete.title;
        }

        if (this.settings.activeComponent == 'Transfers/Accept') {
          this.modalComponent.title = this.translate.action.accept.title;
        }

        if (this.settings.activeComponent == 'Transfers/PriceList') {
          this.modalComponent.title = this.translate.action.others.priceList.title;
        }
      }
    };

    Dispatch.onLanguageChange('TransfersModalComponent', () => {
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

    Dispatch.removeListeners('languageChange', 'TransfersModalComponent');
  }

}
