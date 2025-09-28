import { Component, Output, EventEmitter, OnInit } from '@angular/core';

// Components
import { SettingsGeneralComponent } from './components/general/general.component';
import { SettingsCashierComponent } from './components/cashier/cashier.component';
import { SettingsServiceOrdersComponent } from './components/serviceOrders/serviceOrders.component';

@Component({
  selector: 'settings-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class SettingsModalComponent implements OnInit {

  @Output() callback: EventEmitter<any> = new EventEmitter();

  public settings: any = {};

  private modalComponent: any;
  private generalComponent: any;
  private stockComponent: any;
  private cashierComponent: any;
  private serviceOrdersComponent: any;
  private registersComponent: any;

  constructor() {}

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // Modal Actions

  public onOpen(settings: any = {}) {

    this.settings = settings;

    this.modalComponent.onOpen({ title: this.settings.title });

    const timer = setInterval(() => {

      if ((settings.section == 'General') && this.generalComponent) {
        clearInterval(timer);
        this.generalComponent.bootstrap(this.settings);
      }

      if ((settings.section == 'Stock') && this.stockComponent) {
        clearInterval(timer);
        this.stockComponent.bootstrap(this.settings);
      }

      if ((settings.section == 'Cashier') && this.cashierComponent) {
        clearInterval(timer);
        this.cashierComponent.bootstrap(this.settings);
      }
      
      if ((settings.section == 'ServiceOrders') && this.serviceOrdersComponent) {
        clearInterval(timer);
        this.serviceOrdersComponent.bootstrap(this.settings);
      }

      if ((settings.section == 'Registers') && this.registersComponent) {
        clearInterval(timer);
        this.registersComponent.bootstrap(this.settings);
      }
    });
  }

  public onClose() {
    
    this.modalComponent.onClose();

    if (this.cashierComponent) {
      this.cashierComponent.reset();
    }

    if (this.serviceOrdersComponent) {
      this.serviceOrdersComponent.reset();
    }    
  }

  // Event Listeners

  public onModalResponse(event) {

    if (event.instance) {
      this.modalComponent = event.instance;
    }
  }

  public onGeneralResponse(event) {

    if (event.instance) {
      this.generalComponent = event.instance;
    }

    if (event.close) {
      this.onClose();
    }
  }

  public onStockResponse(event) {

    if (event.instance) {
      this.stockComponent = event.instance;
    }

    if (event.close) {
      this.onClose();
    }
  }

  public onCashierResponse(event) {

    if (event.instance) {
      this.cashierComponent = event.instance;
    }

    if (event.close) {
      this.onClose();
    }
  }

  public onServiceOrdersResponse(event) {

    if (event.instance) {
      this.serviceOrdersComponent = event.instance;
    }

    if (event.close) {
      this.onClose();
    }
  }

  public onRegistersResponse(event) {

    if (event.instance) {
      this.registersComponent = event.instance;
    }

    if (event.close) {
      this.onClose();
    }
  }

}
