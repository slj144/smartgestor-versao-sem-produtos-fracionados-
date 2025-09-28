import { Component, Output, EventEmitter, OnInit } from '@angular/core';

// Translate
import { SeveralReportsTranslate } from '../several.translate';

// Ultilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';

@Component({
  selector: 'several-layer',
  templateUrl: './layer.component.html',
  styleUrls: ['./layer.component.scss']
})
export class SeveralReportsLayerComponent implements OnInit {

  @Output() callback: EventEmitter<any> = new EventEmitter();

  public translate = SeveralReportsTranslate.get();

  public settings: any = {};

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // Operating Data
   
  public onCheckColspan() {
    return ((this.settings.fields).length);
  }
  
  public onCheckField(id: string): boolean {
    return ((<string[]>this.settings.fields).indexOf(id) != -1);
  }

  public onRefresh() {
    
  }
  
  public onExportXLS() {
    
    let filename = '';

    if (this.settings.id == 'resume') {
      filename = `Relatório de Caixa - Resumo`;
    }

    Utilities.exportXSL({
      name: filename,
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

    if (settings.id == 'resume') {
      settings.totals = this.calcTotalResume(settings.data);
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

  private calcTotalResume(data: any = []) {

    const totals: any = {
      sales: 0, inputs: 0, outputs: 0,
      revenue: 0, costs: 0, grossProfit: 0
    };

    for (const item of data) {      
      totals.sales += item.balance.sales;
      totals.inputs += item.balance.inputs;
      totals.outputs += item.balance.outputs;
      totals.revenue += item.balance.revenue;
      totals.costs += item.balance.costs;
      totals.grossProfit += item.balance.grossProfit;
    }

    return totals;
  }

}
