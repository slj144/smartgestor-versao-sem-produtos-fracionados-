import { Component, Output, EventEmitter, OnInit } from '@angular/core';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { DateTime } from '@shared/utilities/dateTime';

@Component({
  selector: 'bank-accounts-print',
  templateUrl: './print.component.html'
})
export class BankAccountsPrintComponent implements OnInit {

  @Output() callback: EventEmitter<any> = new EventEmitter();

  public loading: boolean = true;
  public settings: any = {};

  private checkLoadEvent: boolean = false;

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  public onLaunchPrint(settings: any = {}) {

    Utilities.loading();

    const storeInfo = Utilities.storeInfo;

    this.settings = settings;
    this.settings.storeInfo = storeInfo;
    this.settings.currentDate = `${DateTime.formatDate(DateTime.getDate('D'), 'array', 'BR')[0]} ${DateTime.getDate('H')}`;
    
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
