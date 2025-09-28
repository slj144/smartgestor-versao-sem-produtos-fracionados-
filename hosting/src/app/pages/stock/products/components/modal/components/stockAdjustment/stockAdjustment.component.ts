import { Component, Output, EventEmitter, OnInit } from '@angular/core';

// Services
import { StockLogsService } from '@shared/services/stock-logs.service';

// Translate

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { StockAdjustmentTranslate } from './stockAdjustment.translate';

@Component({
  selector: 'stock-adjustment',
  templateUrl: './stockAdjustment.component.html',
  styleUrls: ['./stockAdjustment.component.scss']
})
export class StockAdjustmentComponent implements OnInit {

  @Output() public callback: EventEmitter<any> = new EventEmitter(); 

  public translate = StockAdjustmentTranslate.get();
 
  public loading: boolean = true;
  public filtersBadge: number = 0;  
  public countData: any = {};
  public recordsData: any = [];
  public queryClauses: any = [];
  public headerVisibility: boolean = true;
  public viewingData: any;

  private registerComponent: any;

  constructor(
    private stockLogsService: StockLogsService
  ) {}

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // Initialize Method

  public bootstrap() {

    this.loading = true;

    let processPeding = 1;

    this.stockLogsService.getLogs('StockAdjustmentComponent', (data) => {
      this.recordsData = data;
      processPeding -= 1;

      // console.log(data);
    });

    this.stockLogsService.getLogsCount('ProductsComponent', (data) => {
      this.countData = data;
    });

    const timer = setInterval(() => {

      if (processPeding == 0 && this.registerComponent) {
        clearInterval(timer);

        this.loading = false;
        this.registerComponent.bootstrap();
      }
    }, 200);
  }
  
  // Getter and Setter Methods

  public get enableLoadMoreButton() {
    return (this.recordsData.length < this.countData.total);
  }

  // User Interface Actions - Filters

  public onSearch(event: Event) {
    const value = $$(event.target).val().trim().toLowerCase();

    if (value != '') {

      this.queryClauses = [];
      
      this.queryClauses.push({ field: 'data.referenceCode', operator: '=', value: parseInt(value) });
      this.stockLogsService.query(this.queryClauses);
    }else{
      this.stockLogsService.query([]);
    }
   
  }

  // User Interface Actions

  public onRead(data: any) {
    this.viewingData = data;
    this.onOpenContainerFloating('container-view');
  }

  public onCreate() {
    this.onOpenContainerFloating('container-update');
  }

  public onOpenContainerFloating(type: string) {
    $$(`.container-floating .${type}`).css({ display: 'block' });
    $$('.container-floating').addClass('active');
  }

  public onCloseContainerFloating(type: string = null) {

    $$('.container-floating').removeClass('active');

    if (type) {
      $$(`.container-floating .container-${type}`).css({ display: 'none' });
    } else {
      $$(`.container-floating .container-view, .container-floating .container-update`).css({ display: 'none' });
    }   

    this.viewingData = null;   
    this.registerComponent.resetComponent();
  }

  // Event Listeners

  public onRegisterResponse(event: any) {

    if (event.instance) {
      this.registerComponent = event.instance;
    }    

    if (event.headerVisibility) {
      this.headerVisibility = (event.headerVisibility == 'visible');
    }
    
    if (event.close) {
      this.onCloseContainerFloating('update');
    }
  }

  // Utility Methods

  public onLoadMoreData() {

    if (this.countData.total > this.stockLogsService.limit) {
          
      Utilities.loading();

      const query: any = (this.queryClauses.length > 0 ? this.queryClauses : null);
      const reset: boolean = false;
      const flex: boolean = (this.filtersBadge == 0);
      const scrolling: boolean = (this.queryClauses.length > 0);

      this.stockLogsService.query(query, reset, flex, scrolling).then(() => {
        Utilities.loading(false);
      });
    }
  }

  // Auxiliary Methods

  public resetComponent() {
    this.onCloseContainerFloating();    
  }

}
