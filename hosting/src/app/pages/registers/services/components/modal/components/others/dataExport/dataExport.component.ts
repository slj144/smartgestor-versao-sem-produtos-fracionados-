import { Component, Output, EventEmitter, OnInit } from '@angular/core';

// Services
import { ServicesService } from '../../../../../services.service';

// Translate
import { ServicesTranslate } from '../../../../../services.translate';

// Utilities
import { Utilities } from '@shared/utilities/utilities';

@Component({
  selector: 'services-data-export',
  templateUrl: './dataExport.component.html',
  styleUrls: ['./dataExport.component.scss']
})
export class ServicesDataExportComponent implements OnInit {

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  public translate = ServicesTranslate.get()['modal']['action']['others']['dataExport'];
 
  public recordsData: any = [];
  public checkBootstrap: boolean = false;

  constructor(
    private servicesService: ServicesService
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

    this.servicesService.query([], false, false, false, false).then((data) => {     

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
