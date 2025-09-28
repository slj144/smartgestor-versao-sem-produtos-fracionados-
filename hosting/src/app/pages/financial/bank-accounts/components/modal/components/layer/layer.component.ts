import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';

// Ultilities
import { $$ } from '@shared/utilities/essential';

@Component({
  selector: 'bank-accounts-layer',
  templateUrl: './layer.component.html',
  styleUrls: ['./layer.component.scss']
})
export class BankAccountsModalLayerComponent implements OnInit, OnDestroy {

  @Output() callback: EventEmitter<any> = new EventEmitter();
  
  public settings: any = {};

  private layerComponent: any;

  constructor() {}

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // Layer Actions
  
  public onOpen(settings: any) {
    this.settings = settings;
    this.layerComponent.onOpen({ title: 'Test' });
  }

  // Event Listeners

  public onLayerResponse(event: any) {

    if (event.instance) {
      this.layerComponent = event.instance;
    }
  }

  // Destruction Methods

  public ngOnDestroy() {
    this.settings = {};
    this.layerComponent = null;
  }

}
