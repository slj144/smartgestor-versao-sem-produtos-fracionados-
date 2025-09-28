import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { DateTime } from '@shared/utilities/dateTime';

// Tools
import * as pdf from 'html2pdf.js';

@Component({
  selector: 'generate-tickets-print',
  templateUrl: './print.component.html'
})
export class GenerateTicketsPrintComponent implements OnInit {

  @Output() callback: EventEmitter<any> = new EventEmitter();

  public settings: any = {};
  constructor(private sanitizer: DomSanitizer) { }
  public ngOnInit() {
    this.settings.cssPath = this.sanitizer.bypassSecurityTrustResourceUrl('/assets/css/tickets/tickets.css');
    this.callback.emit({ instance: this });
  }

  // User Interface Actions

  public onLaunchPrint(settings: any = {}): Promise<void> {

    Utilities.loading();

    this.settings = { ...settings };

    const cssPath = settings.cssPath || '/assets/css/tickets/tickets.css';
    this.settings.cssPath = this.sanitizer.bypassSecurityTrustResourceUrl(cssPath);

    return (new Promise((resolve, reject) => {

      setTimeout(() => {

        const newWin = window.frames['printingFrame'];

        if (newWin) {
          newWin.document.write($$('#printingFrame').html());
          newWin.document.close();
        }

        const handler = () => {

          const container: Element = newWin.document.getElementById('container');
          const id = ((settings.fileIndex + 1) < 9) ? ('0' + (settings.fileIndex + 1)) : (settings.fileIndex + 1);

          // Sem injeção inline — CSS é controlado pelo link padrão do template e trocado abaixo se necessário.

          // Ajuste dinâmico de CSS: troca href do link se necessário e aguarda carregar
          const defaultHref = '/assets/css/tickets/tickets.css';
          const desiredHref = (() => {
            try { return typeof settings.cssPath === 'string' ? settings.cssPath : (this.settings.cssPath.changingThisBreaksApplicationSecurity || defaultHref); } catch { return defaultHref; }
          })();

          const proceed = () => {
            const options = {
            filename: `Etiquetas-${id}-(${DateTime.formatDate(DateTime.getDate()).date}).pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPdf: Object.assign({
              format: 'A4',
              orientation: 'portrait',
              compressPDF: true,
              quality: 100,
              margin: [0, 0, 0, 0]
            }, settings.jsPdf || {}),
            pagebreak: {
              mode: '',
              before: '.before',
              after: '.after',
              avoid: '.avoid'
            }
          };
            pdf().from(container).set(options).save().then(() => {
              Utilities.loading(false);
              resolve();
            }).catch((e) => {
              Utilities.loading(false);
              reject(e);
            });
          };

          try {
            const links = newWin.document.getElementsByTagName('link');
            if (links && links.length > 0) {
              const linkEl = links[0];
              if (desiredHref && desiredHref !== defaultHref) {
                linkEl.addEventListener('load', () => setTimeout(proceed, 50), { once: true });
                linkEl.setAttribute('href', desiredHref);
                // fallback se o evento não disparar
                setTimeout(proceed, 150);
              } else {
                proceed();
              }
            } else {
              proceed();
            }
          } catch (_) {
            proceed();
          }

          $$(newWin.frameElement).off('load', handler);
        }

        $$(newWin.frameElement).on('load', handler);
      }, 500);
    }));
  }


}
