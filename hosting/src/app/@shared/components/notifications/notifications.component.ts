import { Component } from '@angular/core';

// Interfaces
import { ENotificationStatus, ISystemNotification } from '@shared/interfaces/ISystemNotification';

// Utilities
import bootstrap from 'bootstrap/dist/js/bootstrap';

@Component({
  selector: 'notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent {  

  public static shared: NotificationsComponent;

  protected toasts: ISystemNotification[] = [];
  private _duration: number = 10000;

  constructor() {
    NotificationsComponent.shared = this;
  }

  public set duration(miliseconds: number) {
    this._duration = miliseconds;
  }

  public show(settings: ISystemNotification) {

    // Define um identicador para o toast
    settings.tag = String(new Date().getTime() * Math.random());

    // Inclui o novo elemento no array para exibição
    this.toasts.push(settings);

    // Realiza a configuração do toast
    this.mountToast();
  }

  public hide(index: number = 0) {

    // Remove o elemento do array no indice especificado
    this.toasts.splice(index, 1);
  }

  protected selectIcon(item: ISystemNotification) {
  
    let iconName = '';

    if (!item.icon) {

      switch (item.status) {
        case ENotificationStatus.success: iconName = 'check'; break;
        case ENotificationStatus.info: iconName = 'info'; break;
        case ENotificationStatus.warning: iconName = 'triangle-exclamation'; break;
        case ENotificationStatus.danger: iconName = 'close'; break;
      }
    } else {
      iconName = item.icon;
    }

    return iconName;
  }

  private mountToast() {

    let c = 0;
    
    const interval = setInterval(() => {

      const toastList = [].slice.call(document.querySelectorAll('.toast'));

      if (toastList.length) {

        clearInterval(interval);

        toastList.map((toastElement: HTMLDivElement) => {

          if (!toastElement.getAttribute('data-init')) {

            toastElement.setAttribute('data-init', 'true');            

            (new bootstrap.Toast(toastElement, { dealy: this._duration })).show();

            const timeout = setTimeout(() => {
              
              clearTimeout(timeout);

              this.toasts.splice(this.toasts.findIndex((v) => {
                return v.tag == toastElement.getAttribute('data-tag');
              }), 1);
              
            }, (this._duration + 250));
          }
        });

        c++;
      }

      if (c >= 25) {
        clearInterval(interval);        
      }
    }, 250);
  }

}
