import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// Services
import { SettingsService } from '../../../../settings.service';

// Utilities
import { Utilities } from '@shared/utilities/utilities';
import { ProjectSettings } from '../../../../../../../assets/settings/company-settings';

@Component({
  selector: 'settings-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss']
})
export class SettingsGeneralComponent implements OnInit {

  @Output() callback: EventEmitter<any> = new EventEmitter();

  public formLanguage: FormGroup;
  public formCurrency: FormGroup;

  public settings: any = {};
  public languages: any[] = [];
  public currencies: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private settingsService: SettingsService
  ) { }

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // Getter and Setter Methods

  public get isAdmin() {
    return Utilities.isAdmin;
  }

  public get formLanguageControls() {
    return this.formLanguage.controls;
  }

  public get formCurrencyControls() {
    return this.formCurrency.controls;
  }

  // Initialize Method

  public bootstrap(settings: any = {}) {

    this.settings = settings;

    if (this.settings.activeComponent == 'General/Language') {
      this.languages = [
        { value: 'en_US', label: settings.translate.modal.section.general.language.options.en_US },
        { value: 'pt_BR', label: settings.translate.modal.section.general.language.options.pt_BR }
      ];
    }

    if (this.settings.activeComponent == 'General/Currency') {
      this.currencies = [
        { value: 'USD', label: settings.translate.modal.section.general.currency.options.USD },
        { value: 'GBP', label: settings.translate.modal.section.general.currency.options.GBP },
        { value: 'EUR', label: settings.translate.modal.section.general.currency.options.EUR },
        { value: 'BRL', label: settings.translate.modal.section.general.currency.options.BRL }
      ];
    }

    this.formSettings(settings);
  }

  // User Interface Actions

  public onSubmitLanguage() {

    const data = this.formLanguage.value;

    this.settingsService.updateGeneralLanguage(data.language, data.save).then(() => {
      this.callback.emit({ close: true });
    });
  }

  public onSubmitCurrency() {

    const data = this.formCurrency.value;

    this.settingsService.updateGeneralCurrency(data.currency, data.save).then(() => {
      this.callback.emit({ close: true });
    });
  }

  // Setting Methods

  private formSettings(data: any = {}) {

    if (this.settings.activeComponent == 'General/Language') {

      this.formLanguage = this.formBuilder.group({
        language: [(window.localStorage.getItem('Language') || ProjectSettings.companySettings().language), Validators.required],
        save: [false]
      });
    }

    if (this.settings.activeComponent == 'General/Currency') {

      this.formCurrency = this.formBuilder.group({
        currency: [(window.localStorage.getItem('Currency') || ProjectSettings.companySettings().currency), Validators.required],
        save: [false]
      });
    }
  }

}
