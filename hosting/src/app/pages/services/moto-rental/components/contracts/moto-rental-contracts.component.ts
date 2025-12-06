import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { MotoRentalService } from '../../moto-rental.service';
import { MotoRentalTranslate } from '../../moto-rental.translate';
import { MotoRentalContract, MotoRentalContractFilters } from '../../moto-rental.interfaces';

@Component({
  selector: 'app-moto-rental-contracts',
  templateUrl: './moto-rental-contracts.component.html',
  styleUrls: ['./moto-rental-contracts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MotoRentalContractsComponent implements OnInit, OnDestroy {

  public readonly translate = MotoRentalTranslate.get();
  public readonly contracts$ = this.motoRentalService.contracts$;
  public readonly loading$ = this.motoRentalService.loadingContracts$;

  public readonly statusOptions = [
    { value: '', label: this.translate.contracts.filters?.status?.all || 'All' },
    { value: 'draft', label: this.translate.contracts.statusLabel.draft },
    { value: 'reserved', label: this.translate.contracts.statusLabel.reserved },
    { value: 'active', label: this.translate.contracts.statusLabel.active },
    { value: 'closed', label: this.translate.contracts.statusLabel.closed },
    { value: 'cancelled', label: this.translate.contracts.statusLabel.cancelled }
  ];

  public filtersForm: FormGroup;
  public wizardVisible = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly motoRentalService: MotoRentalService
  ) {
    this.filtersForm = this.fb.group({
      status: ['']
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
    const filters: MotoRentalContractFilters = {
      status: this.filtersForm.value.status || undefined
    };

    await this.motoRentalService.listContracts(filters);
  }

  public trackContract(_: number, contract: MotoRentalContract) {
    return contract.id;
  }

  public openWizard(): void {
    this.wizardVisible = true;
  }

  public handleWizardCompleted(): void {
    this.refresh();
  }
}
