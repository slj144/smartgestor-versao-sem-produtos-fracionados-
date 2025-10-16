import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// Services
import { SettingsService } from '../../../../settings.service';

// Utilities
import { Utilities } from '@shared/utilities/utilities';

@Component({
  selector: 'settings-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss']
})
export class SettingsStockComponent implements OnInit {

  @Output() callback: EventEmitter<any> = new EventEmitter();

  public form: FormGroup;
  public settings: any = {};

  constructor(
    private formBuilder: FormBuilder,
    private settingsService: SettingsService
  ) {}

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // Getter and Setter Methods

  public get formControls() {
    return this.form.controls;
  }
  
  // Initialize Method

  public bootstrap(settings: any = {}) {
    this.settings = settings;
    this.formSettings(settings);
  }

  // User Interface Actions

  public onSubmit() {

    const data = this.form.value;

    if (this.settings.activeComponent == 'Stock/AveragePurchaseCost') {

      this.settingsService.updateStockAveragePurchaseCost(data.enable).then(() => {
        this.callback.emit({ close: true });
      });
    }

    if (this.settings.activeComponent == 'Stock/AverageTransfersCost') {

      this.settingsService.updateStockAverageTransfersCost(data.enable).then(() => {
        this.callback.emit({ close: true });
      });
    }

    // New option: Allow negative stock sale
    if (this.settings.activeComponent == 'Stock/AllowNegativeSale') {
      this.settingsService.updateStockAllowNegativeSale(!!data.enable).then(() => {
        // Persist also in local storage for quick client-side checks
        Utilities.localStorage('StockAllowNegativeSale', !!data.enable);
        this.callback.emit({ close: true });
      });
    }

    if (this.settings.activeComponent == 'Stock/Departments') {
      this.settingsService.updateStockDepartmentsEnabled(!!data.enable).then(() => {
        Utilities.localStorage('StockDepartmentsEnabled', !!data.enable);
        this.callback.emit({ close: true });
      });
    }
  }

  // Setting Methods

  private formSettings(data: any = {}) {

    if (
      (this.settings.activeComponent == 'Stock/AveragePurchaseCost') ||
      (this.settings.activeComponent == 'Stock/AverageTransfersCost') ||
      (this.settings.activeComponent == 'Stock/AllowNegativeSale') ||
      (this.settings.activeComponent == 'Stock/Departments')
    ) {
      const key = this.settings.activeComponent.replace('/','');
      let storedValue = Utilities.localStorage(key);

      if (storedValue === undefined || storedValue === null) {
        if (this.settings.activeComponent == 'Stock/AllowNegativeSale') {
          storedValue = Utilities.localStorage('StockAllowNegativeSale');
        }

        if (this.settings.activeComponent == 'Stock/Departments') {
          storedValue = Utilities.stockDepartmentsEnabled;
        }
      }

      const normalizeBoolean = (value: any) => {
        if (typeof value === 'string') {
          return value === 'true';
        }
        return !!value;
      };

      this.form = this.formBuilder.group({
        enable: [normalizeBoolean(storedValue), Validators.required]
      });
    }
  }

}
