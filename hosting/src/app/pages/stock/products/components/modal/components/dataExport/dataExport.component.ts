import { Component, Output, EventEmitter, OnInit } from '@angular/core';

// Services
import { ProductsService } from '../../../../products.service';

// Translate
import { DataExportTranslate } from './dataExport.translate';

// Utilities
import { Utilities } from '@shared/utilities/utilities';

@Component({
  selector: 'data-export',
  templateUrl: './dataExport.component.html',
  styleUrls: ['./dataExport.component.scss']
})
export class DataExportComponent implements OnInit {

  @Output() public callback: EventEmitter<any> = new EventEmitter(); 
 
  public translate = DataExportTranslate.get();

  public recordsData: any = [];
  public checkBootstrap: boolean = false;

  constructor(
    private productsService: ProductsService
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

    Utilities.loading(true);
    
    this.productsService.query([], false, false, false, false).then((data) => {

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
