import { Component, Output, EventEmitter, OnInit } from '@angular/core';

// Translate
import { ServiceOrdersReportsTranslate } from '../serviceOrders.translate';

// Ultilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';

@Component({
  selector: 'service-orders-layer',
  templateUrl: './layer.component.html',
  styleUrls: ['./layer.component.scss']
})
export class ServiceOrdersReportsLayerComponent implements OnInit {

  @Output() callback: EventEmitter<any> = new EventEmitter();

  public translate = ServiceOrdersReportsTranslate.get();

  public settings: any = {};

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // Operating Data
  
  public onExportXLS() {
    
    Utilities.exportXSL({
      name: this.settings.title,
      html: document.getElementById('report').innerHTML
    });
  }

  // Layer Actions

  public onOpen(settings: any) {

    const body = $$('#container-modal-body');

    const sideLayer = $$('#sideLayer');
    sideLayer.addClass('active');
    
    if (body.length > 0) {
      body[0].scrollTop = 0;
      body[0].style.overflowY = 'hidden';
    }         

    this.settings = settings;
  }

  public onClose() {

    const body = $$('#container-modal-body');

    const sideLayer = $$('#sideLayer');
    sideLayer.removeClass('active');

    if (body.length > 0) {
      body[0].style.overflowY = 'auto';
    }
  }

  // Auxiliary Methods
  
  public onCheckColspan(id: string = null) {

    let colspan = 0;

    $$(this.settings.fields).map((_, item) => {

      if (id) {
        if ((String(item).search(id) != -1) && (String(item).search('/') != -1)) {
          colspan += 1;
        }
      } else {
        if (String(item).search('/') == -1) {
          colspan += 1;
        }
      }
    });

    if (!id) {
      colspan += 2;
    }
   
    return colspan;
  }
  
  public onCheckField(id: string): boolean {
    return ((<string[]>this.settings.fields).indexOf(id) != -1);
  }

}
