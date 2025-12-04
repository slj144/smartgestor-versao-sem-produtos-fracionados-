import { ChangeDetectionStrategy, Component } from '@angular/core';

import { MotoRentalTranslate } from '../../moto-rental.translate';
import { ProjectSettings } from '@assets/settings/company-settings';

@Component({
  selector: 'app-moto-rental-settings',
  templateUrl: './moto-rental-settings.component.html',
  styleUrls: ['./moto-rental-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MotoRentalSettingsComponent {

  public readonly translate = MotoRentalTranslate.get();
  public readonly settings = ProjectSettings.companySettings();

  public readonly defaultRates = this.settings?.workshop?.defaultRates || {
    daily: null,
    weekly: null,
    deposit: null
  };

  public readonly country = (this.settings?.country || '').toUpperCase();
}
