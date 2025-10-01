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

    // Tentar obter a data do DateTime, mas não bloquear se falhar
    try {
      const dateString = DateTime.getDate('D');
      const formattedDate = DateTime.formatDate(dateString, 'array', 'BR');
      const timeString = DateTime.getDate('H');

      if (formattedDate && Array.isArray(formattedDate)) {
        this.settings.currentDate = `${formattedDate[0]} ${timeString}`;
      } else {
        // Usar data do cliente se formatDate falhar
        this.settings.currentDate = this.getClientDate();
      }
    } catch (error) {
      // Fallback para data do cliente em caso de qualquer erro
      console.warn('DateTime error, using client date:', error);
      this.settings.currentDate = this.getClientDate();
    }

    // Continuar com a impressão imediatamente
    this.continuePrint();
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

  private continuePrint() {

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
