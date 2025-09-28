import { Injectable } from "@angular/core";

// Components
import { NotificationsComponent } from "@shared/components/notifications/notifications.component";

// Interfaces
import { ISystemNotification } from '../interfaces/ISystemNotification';

@Injectable({ providedIn: 'root' })
export class NotificationService {

  public create(settings: ISystemNotification, storage: boolean = true, to: string = null) {
    NotificationsComponent.shared.show(settings);
  }

}
