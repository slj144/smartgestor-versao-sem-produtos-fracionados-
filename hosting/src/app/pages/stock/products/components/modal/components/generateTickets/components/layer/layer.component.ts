import { Component, Output, EventEmitter, OnInit } from '@angular/core';

// Ultilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';

@Component({
  selector: 'generate-tickets-layer',
  templateUrl: './layer.component.html',
  styleUrls: ['./layer.component.scss']
})
export class GenerateTicketsLayerComponent implements OnInit {

  @Output() callback: EventEmitter<any> = new EventEmitter();

  public settings: any = {};

  private layerComponent: any;
  private productsComponent: any;

  public ngOnInit() {
    this.callback.emit({ instanceMain: this });
  }

  // Layer Actions

  public onOpen(settings: any) {

    this.settings = settings;
    this.layerComponent.onOpen({ title: settings.title });

    const timer = setInterval(() => {

      if (this.productsComponent && (settings.activeComponent == 'products')) {
        clearInterval(timer);
        this.productsComponent.bootstrap({ selectAll: true });
      }
    }, 0);
  }

  //public onClose() {
  //this.layerComponent.onClose();
  public onClose(standard: boolean = false) {

    if (!standard && this.layerComponent) {
      this.layerComponent.onClose();
    }
    this.settings = {};
  }

  // Event Listeners

  public onLayerResponse(event: any) {

    if (event.instance) {
      this.layerComponent = event.instance;
    }

    if (event.close) {
      //this.onClose();
      this.onClose(true);
    }
  }

  public onProductsResponse(event: any) {

    if (event.instance) {
      this.productsComponent = event.instance;
    }

    if (event.data) {

      const products = Utilities.deepClone(event.data);

      for (const item of products) {
        item.ticketsQuantity = item.quantity;
      }

      event.productsData = products;
    }

    if (event.close) {
      this.onClose();
    }

    this.callback.emit(event);
  }

}
