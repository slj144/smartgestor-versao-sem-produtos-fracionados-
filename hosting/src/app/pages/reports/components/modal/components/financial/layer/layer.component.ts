import { Component, Output, EventEmitter, OnInit } from '@angular/core';

// Translate
import { ReportsFinancesTranslate } from '../financial.translate';

// Ultilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';

@Component({
  selector: 'financial-layer',
  templateUrl: './layer.component.html',
  styleUrls: ['./layer.component.scss']
})
export class FinancialReportsLayerComponent implements OnInit {

  @Output() callback: EventEmitter<any> = new EventEmitter();

  public translate = ReportsFinancesTranslate.get();

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
    // Fazer o cast correto para HTMLElement
    const sideLayer = document.getElementById('sideLayer') as HTMLElement;
    const body = document.querySelector('#container-modal-body') as HTMLElement;

    if (!sideLayer) {
      console.error('❌ Elemento #sideLayer não encontrado!');
      return;
    }

    // Adicionar classe active
    sideLayer.classList.add('active');

    console.log('✅ Classe active adicionada');
    console.log('✅ Classes do elemento:', sideLayer.className);

    // Forçar reflow para garantir que a transição funcione
    sideLayer.offsetHeight;

    if (body) {
      body.scrollTop = 0;
      body.style.overflowY = 'hidden';
    }

    this.settings = settings;

    // Verificar dados
    console.log('📊 Dados do relatório:', this.settings.data);
  }

  public onClose() {
    const sideLayer = document.getElementById('sideLayer') as HTMLElement;
    const body = document.querySelector('#container-modal-body') as HTMLElement;

    if (sideLayer) {
      sideLayer.classList.remove('active');
    }

    if (body) {
      body.style.overflowY = 'auto';
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
