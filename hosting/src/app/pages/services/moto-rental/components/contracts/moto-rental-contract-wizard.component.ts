import { ChangeDetectionStrategy, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ProjectSettings } from '@assets/settings/company-settings';
import { MotoRentalService } from '../../moto-rental.service';
import { MotoRentalTranslate } from '../../moto-rental.translate';
import { MotoRentalAvailability, MotoRentalReservationPayload, MotoRentalVehicle } from '../../moto-rental.interfaces';

@Component({
  selector: 'app-moto-rental-contract-wizard',
  templateUrl: './moto-rental-contract-wizard.component.html',
  styleUrls: ['./moto-rental-contract-wizard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MotoRentalContractWizardComponent implements OnInit, OnDestroy {

  @Output() close = new EventEmitter<void>();
  @Output() completed = new EventEmitter<void>();

  public readonly translate = MotoRentalTranslate.get();
  public readonly vehicles$ = this.motoRentalService.vehicles$;
  public readonly steps = [
    'customer',
    'vehicle',
    'review'
  ];

  public stepIndex = 0;
  public wizardForm: FormGroup;
  public availability: MotoRentalAvailability[] = [];
  public availabilityLoading = false;
  public saving = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly motoRentalService: MotoRentalService
  ) {
    const defaultRates = ProjectSettings.companySettings()?.workshop?.defaultRates || {};

    this.wizardForm = this.fb.group({
      customerId: ['', Validators.required],
      customerName: [''],
      customerDocs: [''],
      customerPhone: [''],
      vehicleId: ['', Validators.required],
      startDate: [this.getDateString(0), Validators.required],
      endDate: [this.getDateString(1), Validators.required],
      deposit: [defaultRates.deposit ?? null],
      linkedServiceOrderId: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.motoRentalService.listVehicles();

    this.wizardForm.get('vehicleId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadAvailability());

    this.wizardForm.get('startDate')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadAvailability(false));

    this.wizardForm.get('endDate')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadAvailability(false));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public nextStep(): void {
    if (this.stepIndex < this.steps.length - 1 && this.validateCurrentStep()) {
      this.stepIndex++;
    }
  }

  public previousStep(): void {
    if (this.stepIndex > 0) {
      this.stepIndex--;
    }
  }

  public async submit(): Promise<void> {
    if (!this.wizardForm.valid) {
      this.wizardForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    const payload = this.buildPayload();
    const result = await this.motoRentalService.reserveVehicle(payload);

    this.saving = false;

    if (result) {
      this.completed.emit();
      this.close.emit();
    }
  }

  public async loadAvailability(useSelectedVehicle: boolean = true): Promise<void> {
    const formValue = this.wizardForm.value;
    const vehicleId = formValue.vehicleId;

    if (!vehicleId) {
      this.availability = [];
      return;
    }

    this.availabilityLoading = true;

    const data = await this.motoRentalService.getAvailability(
      vehicleId,
      formValue.startDate,
      formValue.endDate
    );

    this.availability = data;
    this.availabilityLoading = false;
  }

  public selectVehicle(vehicle: MotoRentalVehicle): void {
    this.wizardForm.patchValue({
      vehicleId: vehicle.id,
      deposit: vehicle.deposit ?? this.wizardForm.value.deposit
    });
  }

  public cancel(): void {
    this.close.emit();
  }

  public trackAvailability(_: number, item: MotoRentalAvailability) {
    return item.id;
  }

  private validateCurrentStep(): boolean {
    if (this.stepIndex === 0) {
      this.wizardForm.get('customerId')?.markAsTouched();
      return this.wizardForm.get('customerId')?.valid ?? false;
    }

    if (this.stepIndex === 1) {
      this.wizardForm.get('vehicleId')?.markAsTouched();
      this.wizardForm.get('startDate')?.markAsTouched();
      this.wizardForm.get('endDate')?.markAsTouched();

      return this.wizardForm.get('vehicleId')?.valid &&
        this.wizardForm.get('startDate')?.valid &&
        this.wizardForm.get('endDate')?.valid || false;
    }

    return true;
  }

  private buildPayload(): MotoRentalReservationPayload {
    const formValue = this.wizardForm.value;

    return {
      vehicleId: formValue.vehicleId,
      customerId: formValue.customerId,
      customerDocs: formValue.customerDocs ? { notes: formValue.customerDocs } : undefined,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      deposit: formValue.deposit ? Number(formValue.deposit) : undefined,
      linkedServiceOrderId: formValue.linkedServiceOrderId,
      kmOut: undefined,
      kmIn: undefined
    };
  }

  private getDateString(offset: number): string {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date.toISOString().slice(0, 10);
  }
}
