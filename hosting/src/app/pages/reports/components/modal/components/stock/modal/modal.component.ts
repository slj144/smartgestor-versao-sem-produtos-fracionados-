import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

// Utilities
import { $$ } from '@shared/utilities/essential';

@Component({
  selector: 'stock-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class StockReportsModalComponent implements OnInit {

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  public settings: any = {};

  private modalComponent: any;
  private filtersComponent: any;

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // Modal Actions

  public onOpen(settings: any = {}) {

    this.settings = settings;
    this.settings.data = (settings.data || {});

    this.modalComponent.onOpen({ title: 'Filtros', mode: 'sidescreen' });

    if (settings.activeComponent === 'ReportsStock/Filters') {
      
      const timer = setInterval(() => {

        if (this.filtersComponent) { 
          clearInterval(timer);
          this.filtersComponent.bootstrap(settings);
        }
      }, 0);
    }
  }  

  public onClose() {
    this.modalComponent.onClose();
    this.callback.emit({ close: true });
  }

  // Event Listeners

  public onModalResponse(event: any) {

    if (event.instance) {
      this.modalComponent = event.instance;
    }
  }

  public onFiltersResponse(event: any) {

    if (event.instance) {
      this.filtersComponent = event.instance;
    }
  }

}
