import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { IToolsService } from '@shared/services/iTools.service';
import { NotificationService } from '@shared/services/notification.service';
import { ENotificationStatus } from '@shared/interfaces/ISystemNotification';
import { ProjectSettings } from '@assets/settings/company-settings';
import { Utilities } from '@shared/utilities/utilities';
import { MotoRentalTranslate } from './moto-rental.translate';
import {
  MotoRentalAvailability,
  MotoRentalContract,
  MotoRentalContractFilters,
  MotoRentalReservationPayload,
  MotoRentalVehicle,
  MotoRentalVehicleFilters
} from './moto-rental.interfaces';

@Injectable({ providedIn: 'root' })
export class MotoRentalService {

  private readonly moduleTitle = MotoRentalTranslate.get().title;

  private vehiclesSubject = new BehaviorSubject<MotoRentalVehicle[]>([]);
  private contractsSubject = new BehaviorSubject<MotoRentalContract[]>([]);
  private loadingVehiclesSubject = new BehaviorSubject<boolean>(false);
  private loadingContractsSubject = new BehaviorSubject<boolean>(false);

  public vehicles$ = this.vehiclesSubject.asObservable();
  public contracts$ = this.contractsSubject.asObservable();
  public loadingVehicles$ = this.loadingVehiclesSubject.asObservable();
  public loadingContracts$ = this.loadingContractsSubject.asObservable();

  private cachedVehicleFilters: MotoRentalVehicleFilters = {};
  private cachedContractFilters: MotoRentalContractFilters = {};
  private bootstrapPromise?: Promise<void>;

  constructor(
    private readonly iToolsService: IToolsService,
    private readonly notificationService: NotificationService
  ) {}

  public isFeatureEnabled(): boolean {
    const settings = ProjectSettings.companySettings();
    const enabled = settings?.workshop?.motoRentalEnabled === true;
    const country = (settings?.country || settings?.profile?.country || '').toString().toUpperCase();
    return enabled && country === 'UK';
  }

  public async bootstrap(): Promise<void> {
    if (this.bootstrapPromise) {
      return this.bootstrapPromise;
    }

    this.bootstrapPromise = new Promise<void>(async (resolve) => {
      try {
        await Promise.all([
          this.listVehicles(this.cachedVehicleFilters),
          this.listContracts(this.cachedContractFilters)
        ]);
        resolve();
      } catch (error) {
        this.handleError('bootstrap', error);
        resolve();
      }
    });

    return this.bootstrapPromise;
  }

  public async listVehicles(filters: MotoRentalVehicleFilters = {}): Promise<MotoRentalVehicle[]> {
    if (!this.isFeatureEnabled()) {
      return [];
    }

    this.cachedVehicleFilters = filters;
    this.loadingVehiclesSubject.next(true);

    try {
      const payload = this.buildPayload({ filters });
      await this.iToolsService.ready();
      const response = await this.iToolsService.functions().call('motoRentalListVehicles', payload);

      if (!response?.status) {
        throw new Error(response?.error || 'Failed to list vehicles');
      }

      const vehicles: MotoRentalVehicle[] = response.data || [];
      this.vehiclesSubject.next(vehicles);
      return vehicles;
    } catch (error) {
      this.handleError('listVehicles', error);
      return [];
    } finally {
      this.loadingVehiclesSubject.next(false);
    }
  }

  public async saveVehicle(vehicle: Partial<MotoRentalVehicle>): Promise<MotoRentalVehicle | null> {
    if (!this.isFeatureEnabled()) {
      return null;
    }

    try {
      const payload = this.buildPayload({ vehicle });
      await this.iToolsService.ready();
      const response = await this.iToolsService.functions().call('motoRentalSaveVehicle', payload);

      if (!response?.status) {
        throw new Error(response?.error || 'Failed to save vehicle');
      }

      await this.listVehicles(this.cachedVehicleFilters);
      return response.data;
    } catch (error) {
      this.handleError('saveVehicle', error);
      return null;
    }
  }

  public async changeVehicleStatus(vehicleId: string, status: MotoRentalVehicle['status'], note?: string): Promise<boolean> {
    if (!this.isFeatureEnabled()) {
      return false;
    }

    try {
      const payload = this.buildPayload({ vehicleId, status, note });
      await this.iToolsService.ready();
      const response = await this.iToolsService.functions().call('motoRentalChangeVehicleStatus', payload);

      if (!response?.status) {
        throw new Error(response?.error || 'Failed to change vehicle status');
      }

      await this.listVehicles(this.cachedVehicleFilters);
      return true;
    } catch (error) {
      this.handleError('changeVehicleStatus', error);
      return false;
    }
  }

  public async listContracts(filters: MotoRentalContractFilters = {}): Promise<MotoRentalContract[]> {
    if (!this.isFeatureEnabled()) {
      return [];
    }

    this.cachedContractFilters = filters;
    this.loadingContractsSubject.next(true);

    try {
      const payload = this.buildPayload({ filters });
      await this.iToolsService.ready();
      const response = await this.iToolsService.functions().call('motoRentalListContracts', payload);

      if (!response?.status) {
        throw new Error(response?.error || 'Failed to list contracts');
      }

      const contracts: MotoRentalContract[] = response.data || [];
      this.contractsSubject.next(contracts);
      return contracts;
    } catch (error) {
      this.handleError('listContracts', error);
      return [];
    } finally {
      this.loadingContractsSubject.next(false);
    }
  }

  public async reserveVehicle(reservation: MotoRentalReservationPayload): Promise<MotoRentalContract | null> {
    if (!this.isFeatureEnabled()) {
      return null;
    }

    try {
      const payload = this.buildPayload({ reservation });
      await this.iToolsService.ready();
      const response = await this.iToolsService.functions().call('motoRentalReserveVehicle', payload);

      if (!response?.status) {
        throw new Error(response?.error || 'Failed to reserve vehicle');
      }

      await Promise.all([
        this.listVehicles(this.cachedVehicleFilters),
        this.listContracts(this.cachedContractFilters)
      ]);

      return response.data;
    } catch (error) {
      this.handleError('reserveVehicle', error);
      return null;
    }
  }

  public async closeContract(contractId: string, options: Partial<MotoRentalReservationPayload> = {}): Promise<MotoRentalContract | null> {
    if (!this.isFeatureEnabled()) {
      return null;
    }

    try {
      const payload = this.buildPayload({ contractId, ...options });
      await this.iToolsService.ready();
      const response = await this.iToolsService.functions().call('motoRentalCloseContract', payload);

      if (!response?.status) {
        throw new Error(response?.error || 'Failed to close contract');
      }

      await Promise.all([
        this.listVehicles(this.cachedVehicleFilters),
        this.listContracts(this.cachedContractFilters)
      ]);

      return response.data;
    } catch (error) {
      this.handleError('closeContract', error);
      return null;
    }
  }

  public async getAvailability(vehicleId: string, startDate?: string, endDate?: string): Promise<MotoRentalAvailability[]> {
    if (!this.isFeatureEnabled()) {
      return [];
    }

    try {
      const payload = this.buildPayload({ vehicleId, startDate, endDate });
      await this.iToolsService.ready();
      const response = await this.iToolsService.functions().call('motoRentalGetAvailability', payload);

      if (!response?.status) {
        throw new Error(response?.error || 'Failed to load availability');
      }

      return response.data || [];
    } catch (error) {
      this.handleError('getAvailability', error);
      return [];
    }
  }

  private buildPayload(data: Record<string, any>) {
    return {
      instanceId: ProjectSettings.companyID(),
      settings: ProjectSettings.companySettings(),
      user: {
        id: Utilities.currentLoginData?.userId || Utilities.currentLoginData?._id,
        username: Utilities.currentLoginData?.username
      },
      data
    };
  }

  private handleError(context: string, error: any) {
    console.error(`[MotoRentalService:${context}]`, error);
    this.notificationService.create({
      title: this.moduleTitle,
      description: error?.message || 'Não foi possível concluir a operação.',
      status: ENotificationStatus.danger,
      icon: 'alert-triangle-outline',
      duration: 8000
    });
  }
}
