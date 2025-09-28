import { Component, Output, EventEmitter, OnInit } from '@angular/core';

// Services
import { CollaboratorsService } from '../../../../../collaborators.service';

// Translate
import { CollaboratorsTranslate } from '../../../../../collaborators.translate';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';

@Component({
  selector: 'collaborators-data-export',
  templateUrl: './dataExport.component.html',
  styleUrls: ['./dataExport.component.scss']
})
export class CollaboratorsDataExportComponent implements OnInit {

  @Output() public callback: EventEmitter<any> = new EventEmitter(); 

  public translate = CollaboratorsTranslate.get()['modal']['action']['others']['dataExport'];
 
  public recordsData: any = [];
  public checkBootstrap: boolean = false;

  constructor(
    private collaboratorsService: CollaboratorsService
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

    this.collaboratorsService.query([], false, false).then((data) => {

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
