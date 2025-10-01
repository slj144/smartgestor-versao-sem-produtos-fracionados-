import { Component, Output, EventEmitter, OnInit } from '@angular/core';

// Translate
import { CashierFrontReportsTranslate } from '../../cashier-reports.translate';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { DateTime } from '@shared/utilities/dateTime';

@Component({
  selector: 'cashier-reports-print',
  templateUrl: './print.component.html'
})
export class CashierFrontReportsPrintComponent implements OnInit {  

  @Output() callback: EventEmitter<any> = new EventEmitter();

  public translate = CashierFrontReportsTranslate.get();

  public loading: boolean = true;
  public settings: any = {};  

  private checkLoadEvent: boolean = false;

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // Auxiliary Methods

  public onLaunchPrint(settings: any = {}) {

    Utilities.loading();

    const storeInfo = Utilities.storeInfo;

    this.settings = settings;
    this.settings.storeInfo = storeInfo;

    // Tentar obter a data do DateTime com fallback para data do cliente
    try {
      const dateString = DateTime.getDate('D');
      const formattedDate = DateTime.formatDate(dateString, 'array', 'BR');
      const timeString = DateTime.getDate('H');

      if (formattedDate && Array.isArray(formattedDate)) {
        this.settings.currentDate = `${formattedDate[0]} ${timeString}`;
      } else {
        this.settings.currentDate = this.getClientDate();
      }
    } catch (error) {
      console.warn('DateTime error in reports, using client date:', error);
      this.settings.currentDate = this.getClientDate();
    }

    setTimeout(() => {

      const newWin = window.frames['printingFrame1'];

      if (newWin) {
        newWin.document.write($$('#printingFrame1').html());
        newWin.document.close();
      }

      setTimeout(() => {

        Utilities.loading(false);
      
        newWin.focus();
        newWin.print();
      }, 2000);

    }, 500);
  }

  private getClientDate(): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

}
