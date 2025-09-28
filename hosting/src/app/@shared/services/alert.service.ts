import { Injectable } from "@angular/core";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import Swal, { SweetAlertOptions, SweetAlertIcon, SweetAlertResult } from "sweetalert2";

@Injectable({ providedIn: 'root' })
export class AlertService {

  public get sweetalert() {
    return Swal;
  }

  public async alert(title: string, icon: SweetAlertIcon = 'success', text: string = null): Promise<SweetAlertResult> {
    return this.custom({ title, html: text, icon });
  }

  public async error(title: string, text: string = null): Promise<SweetAlertResult> {
    return this.custom({ title, html: text, icon: 'error' });
  }

  public async confirm(title: string, text: string): Promise<SweetAlertResult> {

    return (new Promise((resolve, reject) => {

      this.custom({
        title, 
        html: text,
        icon: 'question',
        showCancelButton: true,
        showConfirmButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Confirmar',
        reverseButtons: true,
        allowOutsideClick: false
      })
      .then((res) => { resolve(res) })
      .catch((err) => { reject(err) });
    }));    
  }

  confirmObservable(title: string, text: string): Observable<boolean> {
    return from(this.confirm(title, text)).pipe(
      map((x) => x.isConfirmed ? true : false)
    );
  }

  public async custom(config: SweetAlertOptions): Promise<SweetAlertResult> {

    const preConfig: SweetAlertOptions = {
      backdrop: 'rgba(0, 0, 0, 0.4)',
      customClass: {
        popup: 'swal swal-popup',
        title: 'swal swal-title',
        actions: 'swal swal-actions',
        icon: 'swal swal-icon',
        cancelButton: 'swal swal-cancel-button',
        confirmButton: 'swal swal-confirm-button',
        htmlContainer: 'swal swal-html-container',        
        footer: 'swal swal-footer'
      }
    };

    return Swal.fire(<any>{ ...preConfig, ...config });
  }

}
