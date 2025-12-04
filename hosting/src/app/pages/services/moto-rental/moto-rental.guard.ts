import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, UrlTree } from '@angular/router';

import { NotificationService } from '@shared/services/notification.service';
import { ENotificationStatus } from '@shared/interfaces/ISystemNotification';
import { MotoRentalService } from './moto-rental.service';
import { MotoRentalTranslate } from './moto-rental.translate';
import { Utilities } from '@shared/utilities/utilities';

@Injectable()
export class MotoRentalGuard implements CanActivate, CanActivateChild {

  private readonly translate = MotoRentalTranslate.get();

  constructor(
    private readonly router: Router,
    private readonly notificationService: NotificationService,
    private readonly motoRentalService: MotoRentalService
  ) {}

  canActivate(): boolean | UrlTree {
    return this.ensureAccess();
  }

  canActivateChild(): boolean | UrlTree {
    return this.ensureAccess();
  }

  private ensureAccess(): boolean | UrlTree {
    const allowed = this.motoRentalService.isFeatureEnabled();

    console.log('[MotoRentalGuard] access check', {
      projectId: Utilities.currentLoginData?.projectId,
      allowed
    });

    if (allowed) {
      return true;
    }

    this.notificationService.create({
      title: this.translate.title,
      description: this.translate.guard.disabled,
      status: ENotificationStatus.warning,
      duration: 6000,
      icon: 'shield-off-outline'
    });

    const fallback = `/${Utilities.currentLoginData.projectId}/servicos/ordens-de-servico`;
    return this.router.parseUrl(fallback);
  }
}
