import { Component, Output, EventEmitter, OnInit } from '@angular/core';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { DateTime } from '@shared/utilities/dateTime';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'cashier-receipts-print',
  templateUrl: './print.component.html'
})
export class CashierFrontReceiptsPrintComponent implements OnInit {  

  @Output() callback: EventEmitter<any> = new EventEmitter();

  public loading: boolean = true;
  public settings: any = {};

  private checkLoadEvent: boolean = false;

  public constructor(
    private sanitizer: DomSanitizer
  ){}

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  public safeHTML(unsafe: string) {
    return this.sanitizer.bypassSecurityTrustHtml(unsafe);
  }

  public onLaunchPrint(settings: any = {}) {

    Utilities.loading();

    this.settings = settings;
    this.settings.storeInfo = Utilities.storeInfo;
    this.settings.currentDate = `${DateTime.formatDate(DateTime.getDate('D'), 'array', 'BR')[0]} ${DateTime.getDate('H')}`;

    if (Utilities.localStorage("CashierWarrantyTerm")) {
      this.settings.warrantyTerm = this.safeHTML(Utilities.localStorage("CashierWarrantyTerm"));
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
