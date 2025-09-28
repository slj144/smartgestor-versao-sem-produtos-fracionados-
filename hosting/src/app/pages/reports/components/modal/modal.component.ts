import { Component, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'modal-reports',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalReportsComponent implements OnInit {

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  public settings: any = {};

  private modalComponent: any;
  private activeComponent: any;

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // Modal Actions

  public onOpen(settings: any = {}) {

    this.settings = settings;

    const timer = setInterval(() => {

      if (this.activeComponent) {
        clearInterval(timer);
        this.activeComponent.bootstrap();
      }
    }, 200);

    this.modalComponent.onOpen({ title: settings.title });
  }

  // Listen Methods

  public onModalResponse(event) {

    if (event.instance) {
      this.modalComponent = event.instance;
    }

    if (event.close) {
      this.settings = {};
    }
  }

  public onComponentResponse(event: any) {

    if (event.instance) {
      this.activeComponent = event.instance;
    }
  }

}
