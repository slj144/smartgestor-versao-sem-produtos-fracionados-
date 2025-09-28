import { Component, Output, EventEmitter, OnInit } from '@angular/core';

// Services
import { VehiclesService } from '@pages/registers/vehicles/vehicles.service';

// Translate
import { VehiclesTranslate } from '@pages/registers/vehicles/vehicles.translate';

// Utilities
import { Utilities } from '@shared/utilities/utilities';

@Component({
  selector: 'vehicles-data-export',
  templateUrl: './dataExport.component.html',
  styleUrls: ['./dataExport.component.scss']
})
export class VehiclesDataExportComponent implements OnInit {

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  public translate = VehiclesTranslate.get()['modal']['action']['others']['dataExport'];
 
  public recordsData: any = [];
  public checkBootstrap: boolean = false;

  constructor(
    private vehiclesService: VehiclesService
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

    this.vehiclesService.query([], false, false, false, false).then((data) => {     

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
