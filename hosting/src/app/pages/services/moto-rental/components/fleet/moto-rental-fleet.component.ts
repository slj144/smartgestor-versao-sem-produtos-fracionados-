import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { MotoRentalService } from '../../moto-rental.service';
import { MotoRentalTranslate } from '../../moto-rental.translate';
import { MotoRentalVehicle, MotoRentalVehicleFilters } from '../../moto-rental.interfaces';

@Component({
  selector: 'app-moto-rental-fleet',
  templateUrl: './moto-rental-fleet.component.html',
  styleUrls: ['./moto-rental-fleet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MotoRentalFleetComponent implements OnInit, OnDestroy {

  public readonly translate = MotoRentalTranslate.get();
  public readonly vehicles$ = this.motoRentalService.vehicles$;
  public readonly loading$ = this.motoRentalService.loadingVehicles$;
  private readonly plateRegex = /^[A-Z]{2}[0-9]{2}\s?[A-Z]{3}$/;

  public readonly statusOptions = [
    { value: '', label: this.translate.fleet.filters.status.all || 'All' },
    { value: 'available', label: this.translate.fleet.badge.available },
    { value: 'reserved', label: this.translate.fleet.badge.reserved },
    { value: 'rented', label: this.translate.fleet.badge.rented },
    { value: 'maintenance', label: this.translate.fleet.badge.maintenance }
  ];

  public readonly vehicleTypeOptions = [
    { value: '', label: this.translate.fleet.filters.vehicleType.all || 'All' },
    { value: 'motorcycle', label: this.translate.fleet.filters.vehicleType.motorcycle },
    { value: 'van', label: this.translate.fleet.filters.vehicleType.van }
  ];

  public filtersForm: FormGroup;
  public vehicleForm: FormGroup;
  public editorVisible = false;
  public savingVehicle = false;
  public editingVehicle: MotoRentalVehicle | null = null;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly motoRentalService: MotoRentalService
  ) {
    this.filtersForm = this.fb.group({
      search: [''],
      status: [''],
      vehicleType: ['']
    });

    this.vehicleForm = this.fb.group({
      id: [''],
      plate: ['', [Validators.required, Validators.pattern(this.plateRegex)]],
      vehicleType: ['motorcycle', Validators.required],
      status: ['available', Validators.required],
      model: [''],
      make: [''],
      year: [''],
      mileage: [''],
      vin: [''],
      insuranceExpiry: [''],
      roadTaxExpiry: [''],
      dailyRate: [''],
      weeklyRate: [''],
      deposit: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.filtersForm.valueChanges
      .pipe(debounceTime(200), takeUntil(this.destroy$))
      .subscribe(() => this.refresh());

    this.refresh();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public async refresh(): Promise<void> {
    const formValue = this.filtersForm.value;
    const filters: MotoRentalVehicleFilters = {
      search: formValue.search?.trim() || undefined,
      status: formValue.status || undefined,
      vehicleType: formValue.vehicleType || undefined
    };

    await this.motoRentalService.listVehicles(filters);
  }

  public trackVehicle(_: number, vehicle: MotoRentalVehicle) {
    return vehicle.id;
  }

  public insuranceStatus(vehicle: MotoRentalVehicle) {
    if (!vehicle.insuranceExpiry) {
      return '—';
    }

    return new Date(vehicle.insuranceExpiry).toLocaleDateString();
  }

  public openCreate(): void {
    this.editingVehicle = null;
    this.vehicleForm.reset({
      id: '',
      plate: '',
      vehicleType: 'motorcycle',
      status: 'available'
    });
    this.editorVisible = true;
  }

  public openEdit(vehicle: MotoRentalVehicle): void {
    this.editingVehicle = vehicle;
    this.vehicleForm.reset({
      id: vehicle.id,
      plate: vehicle.plate,
      vehicleType: vehicle.vehicleType,
      status: vehicle.status,
      model: vehicle.model,
      make: vehicle.make,
      year: vehicle.year,
      mileage: vehicle.mileage,
      vin: vehicle.vin,
      insuranceExpiry: this.normalizeDate(vehicle.insuranceExpiry),
      roadTaxExpiry: this.normalizeDate(vehicle.roadTaxExpiry),
      dailyRate: vehicle.dailyRate,
      weeklyRate: vehicle.weeklyRate,
      deposit: vehicle.deposit,
      notes: vehicle.notes
    });
    this.editorVisible = true;
  }

  public closeEditor(): void {
    this.editorVisible = false;
    this.savingVehicle = false;
    this.vehicleForm.reset();
  }

  public async submitVehicle(): Promise<void> {
    if (this.vehicleForm.invalid) {
      this.vehicleForm.markAllAsTouched();
      return;
    }

    this.savingVehicle = true;

    const payload = {
      ...this.vehicleForm.value,
      id: this.vehicleForm.value.id || undefined
    };

    const result = await this.motoRentalService.saveVehicle(payload);
    this.savingVehicle = false;

    if (result) {
      this.closeEditor();
    }
  }

  public get plateInvalid(): boolean {
    const control = this.vehicleForm.get('plate');
    if (!control) { return false; }
    return control.invalid && (control.dirty || control.touched);
  }

  private normalizeDate(value?: string): string | null {
    if (!value) { return null; }
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date.toISOString().slice(0, 10);
  }
}
