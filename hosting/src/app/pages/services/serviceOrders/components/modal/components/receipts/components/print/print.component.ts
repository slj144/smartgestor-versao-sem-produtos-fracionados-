import { Component, Output, EventEmitter, OnInit } from '@angular/core';

// Services

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { DateTime } from '@shared/utilities/dateTime';
import { ServiceOrdersReceiptsTranslate } from '../../receipts.translate';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'service-order-print',
  templateUrl: './print.component.html'
})
export class ServiceOrdersReceiptsPrintComponent implements OnInit {  

  @Output() callback: EventEmitter<any> = new EventEmitter();

  public translate = ServiceOrdersReceiptsTranslate.get();

  public loading: boolean = true;
  public settings: any = {};

  private checkLoadEvent: boolean = false;

  constructor(
    private sanitizer:  DomSanitizer
  ) {}

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // Getter and Setter Methods

  public get storeInfo() {
    return this.settings.storeInfo;
  }

  public get data() {
    return this.settings.data;
  }

  // Launch Method

  safeHTML(unsafe: string) {
    return this.sanitizer.bypassSecurityTrustHtml(unsafe);
  }

  public onLaunchPrint(settings: any = {}) {

    Utilities.loading();

    this.settings = settings;
    this.settings.storeInfo = Utilities.storeInfo;
    this.settings.currentDate = `${DateTime.formatDate(DateTime.getDate('D'), 'array', 'BR')[0]} ${DateTime.getDate('H')}`;

    if (Utilities.localStorage("ServiceOrderWarrantyTerm")) {
      this.settings.warrantyTerm =  this.safeHTML(Utilities.localStorage("ServiceOrderWarrantyTerm"));
    }

    if (Utilities.localStorage("ServiceOrderDeliveryTerm")) {
      this.settings.deliveryTerm = this.safeHTML(Utilities.localStorage("ServiceOrderDeliveryTerm"));
    }

    setTimeout(() => {

      const newWin = window.frames['printingFrame'];

      if (newWin) {
        newWin.document.write($$('#printingFrame').html());
        newWin.document.close();
      }

      setTimeout(() => {

        Utilities.loading(false);
      
        newWin.focus();
        newWin.print();
      }, 2000);

    }, 500);
  }
  
}
