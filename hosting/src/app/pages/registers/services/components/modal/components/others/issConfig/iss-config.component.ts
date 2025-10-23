import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

// Services
import { ServicesService } from '../../../../../services.service';

// Translate
import { ServicesTranslate } from '../../../../../services.translate';

// Utilities
import { Utilities } from '@shared/utilities/utilities';

@Component({
  selector: 'services-iss-config',
  templateUrl: './iss-config.component.html',
  styleUrls: ['./iss-config.component.scss']
})
export class ServicesIssConfigComponent implements OnInit, OnDestroy {

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  public translate = ServicesTranslate.get()['modal']['action']['others']['issConfig'];

  public form: FormGroup;
  public sliderValue = 0;
  public displayLabel = '0,00%';
  public isApplying = false;
  public readonly maxPercent = 15;
  public initialized = false;

  private valueChangesSub?: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private servicesService: ServicesService
  ) {}

  public ngOnInit(): void {
    this.callback.emit({ instance: this });
  }

  public ngOnDestroy(): void {
    this.valueChangesSub?.unsubscribe();
  }

  public bootstrap(): void {

    this.initialized = false;
    const initialValue = this.getInitialAliquota();

    this.form = this.formBuilder.group({
      aliquota: [{ value: initialValue, disabled: false }, [Validators.required, Validators.min(0), Validators.max(this.maxPercent)]]
    });

    this.syncDisplay(initialValue);

    this.valueChangesSub?.unsubscribe();
    this.valueChangesSub = this.form.get('aliquota')?.valueChanges.subscribe((value) => {
      const sanitized = this.sanitizeAliquotaValue(value);

      if (sanitized !== value) {
        this.form.get('aliquota')?.setValue(sanitized, { emitEvent: false });
      }

      this.syncDisplay(sanitized);
      Utilities.localStorage('ServicesIssLastAliquota', sanitized);
    });

    this.initialized = true;
  }

  public onSliderInput(event: Event): void {

    if (!this.form) {
      return;
    }

    const inputValue = Number((event.target as HTMLInputElement).value || 0);
    const sanitized = this.sliderToPercent(inputValue);

    this.form.get('aliquota')?.setValue(sanitized, { emitEvent: true });
  }

  public async onApply(): Promise<void> {

    if (!this.form || this.form.invalid || this.isApplying) {
      return;
    }

    const control = this.form.get('aliquota');
    const sanitized = this.sanitizeAliquotaValue(control?.value);

    this.isApplying = true;
    control?.setValue(sanitized, { emitEvent: false });
    control?.disable({ emitEvent: false });

    try {
      await this.servicesService.applyIssAliquotaToAllServices(sanitized);
      Utilities.localStorage('ServicesIssLastAliquota', sanitized);
    } catch (error) {
      console.error('Failed to apply ISS aliquota globally:', error);
    } finally {
      control?.enable({ emitEvent: false });
      this.isApplying = false;
    }
  }

  private getInitialAliquota(): number {

    const stored = Utilities.localStorage('ServicesIssLastAliquota');

    if (stored !== undefined && stored !== null && stored !== '') {
      const parsed = this.sanitizeAliquotaValue(stored);

      if (!isNaN(parsed)) {
        return parsed;
      }
    }

    const suggestion = this.servicesService.getIssAliquotaSuggestion();

    if (suggestion !== null && suggestion !== undefined) {
      return this.sanitizeAliquotaValue(suggestion);
    }

    return 0;
  }

  private syncDisplay(value: number): void {

    const sanitized = this.sanitizeAliquotaValue(value);

    this.sliderValue = this.percentToSlider(sanitized);
    this.displayLabel = `${sanitized.toFixed(2).replace('.', ',')}%`;
  }

  private sanitizeAliquotaValue(value: any): number {

    const parsed = typeof value === 'string' ? parseFloat(value.replace(/,/g, '.')) : Number(value);

    if (!isFinite(parsed) || parsed < 0) {
      return 0;
    }

    if (parsed > this.maxPercent) {
      return this.maxPercent;
    }

    return parseFloat(parsed.toFixed(2));
  }

  private percentToSlider(value: number): number {
    return Math.round(value * 100);
  }

  private sliderToPercent(value: number): number {
    return this.sanitizeAliquotaValue(value / 100);
  }

}
