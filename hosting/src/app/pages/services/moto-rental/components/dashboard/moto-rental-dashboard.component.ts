import { ChangeDetectionStrategy, Component } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { MotoRentalService } from '../../moto-rental.service';
import { MotoRentalTranslate } from '../../moto-rental.translate';
import { MotoRentalContract, MotoRentalVehicle } from '../../moto-rental.interfaces';

interface MotoRentalDashboardStats {
  totalVehicles: number;
  availableVehicles: number;
  reservedVehicles: number;
  maintenanceVehicles: number;
  vans: number;
  activeContracts: number;
}

@Component({
  selector: 'app-moto-rental-dashboard',
  templateUrl: './moto-rental-dashboard.component.html',
  styleUrls: ['./moto-rental-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MotoRentalDashboardComponent {

  public readonly translate = MotoRentalTranslate.get();

  public readonly vehicles$ = this.motoRentalService.vehicles$;
  public readonly contracts$ = this.motoRentalService.contracts$;

  public readonly stats$: Observable<MotoRentalDashboardStats> = combineLatest([
    this.vehicles$,
    this.contracts$
  ]).pipe(
    map(([vehicles, contracts]) => this.buildStats(vehicles, contracts))
  );

  public readonly activeReservations$ = this.contracts$.pipe(
    map((contracts) => contracts.filter((contract) => ['active', 'reserved'].includes(contract.status)))
  );

  constructor(
    private readonly motoRentalService: MotoRentalService
  ) {}

  private buildStats(vehicles: MotoRentalVehicle[], contracts: MotoRentalContract[]): MotoRentalDashboardStats {
    const totalVehicles = vehicles.length;
    const availableVehicles = vehicles.filter((vehicle) => vehicle.status === 'available').length;
    const reservedVehicles = vehicles.filter((vehicle) => vehicle.status === 'reserved' || vehicle.status === 'rented').length;
    const maintenanceVehicles = vehicles.filter((vehicle) => vehicle.status === 'maintenance').length;
    const vans = vehicles.filter((vehicle) => vehicle.vehicleType === 'van').length;
    const activeContracts = contracts.filter((contract) => contract.status === 'active').length;

    return {
      totalVehicles,
      availableVehicles,
      reservedVehicles,
      maintenanceVehicles,
      vans,
      activeContracts
    };
  }
}
