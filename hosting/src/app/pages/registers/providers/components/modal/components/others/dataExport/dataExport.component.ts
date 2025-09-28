import { Component, Output, EventEmitter, OnInit } from '@angular/core';

// Services
import { ProvidersService } from '../../../../../providers.service';

// Translate
import { ProvidersTranslate } from '../../../../../providers.translate';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';

@Component({
  selector: 'providers-data-export',
  templateUrl: './dataExport.component.html',
  styleUrls: ['./dataExport.component.scss']
})
export class ProvidersDataExportComponent implements OnInit {

  @Output() public callback: EventEmitter<any> = new EventEmitter(); 

  public translate = ProvidersTranslate.get()['modal']['action']['others']['dataExport'];
 
  public recordsData: any = [];
  public checkBootstrap: boolean = false;

  constructor(
    private providersService: ProvidersService
  ) {}

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // Initialize Method

  public bootstrap() {

    setTimeout(() => {
      this.checkBootstrap = true;
    }, 1000);
  }

  // User Interface Actions

  public onExport() {

    Utilities.loading();

    this.providersService.query([], false, false, false, false).then((data) => {

      console.log(data);

      $$(data).map((_, item) => {

        if (item.address) {
          item.address = `${item.address.local}, Nº ${item.address.number}${(item.address.complement ? (', ' + item.address.complement) : '')}, ${item.address.neighborhood}, ${item.address.city} - ${item.address.state}`;
        }

        if (item.contacts && item.contacts.phone) {
          item.phone = item.contacts.phone;
        }

        if (item.contacts && item.contacts.email) {
          item.email = item.contacts.email;
        }

        delete item.contacts;
      });

      this.recordsData = data;
      
      setTimeout(() => {

        Utilities.exportXSL({
          name: `${this.translate.fileName} - ${Utilities.storeInfo.name}`,
          html: document.getElementById('exportData').innerHTML
        });

        Utilities.loading(false);
      }, 2000);     
    });    
  }

}
