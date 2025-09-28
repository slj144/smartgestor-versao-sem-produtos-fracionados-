import { Component, EventEmitter, Output, OnInit, ViewChild, ElementRef } from '@angular/core';

// Translate
import { ServiceOrdersReceiptsTranslate } from './receipts.translate';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { FiscalService } from '../../../../../../fiscal.service';
import { ENFeImpresionFileType } from '@shared/enum/EFiscal';

@Component({
  selector: 'nf-receipts',
  templateUrl: './receipts.component.html',
  styleUrls: ['./receipts.component.scss']
})
export class NfReceiptsComponent implements OnInit {

  @Output() callback: EventEmitter<any> = new EventEmitter();
  @ViewChild('modal', { static: true }) modal: ElementRef;

  public static shared: NfReceiptsComponent;

  public translate = ServiceOrdersReceiptsTranslate.get();

  public loading: any = true;
  public settings: any = {};

  private receiptPrintComponent: any;

  constructor(
    private fiscalServicce: FiscalService
  ) {
    NfReceiptsComponent.shared = this;
  }

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // User Interface Actions 

  public onDownload(ftype, nftype) {

    this.fiscalServicce.downloadNote(this.settings.data.nf.type[nftype], ftype, this.settings.data.nf.id[nftype]).then((res) => { }).catch((error) => {
      console.log("error: ", error);
    });

    this.onClose();
  }


  // Modal Actions

  public onOpen(settings: any = {}) {

    this.settings = settings;
    $$(this.modal.nativeElement).css({ display: 'block' });

    // Fazer download automático do PDF quando a nota estiver concluída
    if (settings.data && settings.data.nf) {
      const nfType = settings.data.nf.type.nf || settings.data.nf.type.nfse;
      const nfId = settings.data.nf.id.nf || settings.data.nf.id.nfse;
      const nfStatus = settings.data.nf.status.nf || settings.data.nf.status.nfse;

      if (nfStatus === 'CONCLUIDO' && nfType && nfId) {
        this.fiscalServicce.downloadNote(nfType, ENFeImpresionFileType.PDF, nfId).then(() => {
          console.log('PDF da nota fiscal baixado automaticamente');
        }).catch((error) => {
          console.error('Erro ao baixar PDF automaticamente:', error);
        });
      }
    }
  }

  public onClose() {

    this.loading = true;
    $$(this.modal.nativeElement).css({ display: 'none' });
  }

}
