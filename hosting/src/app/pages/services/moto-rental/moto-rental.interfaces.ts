export type MotoRentalVehicleStatus = "available" | "maintenance" | "rented" | "reserved";
export type MotoRentalVehicleType = "motorcycle" | "van";
export type MotoRentalContractStatus = "draft" | "reserved" | "active" | "closed" | "cancelled";

export interface MotoRentalVehicle {
  id: string;
  instanceId: string;
  plate: string;
  vin?: string;
  make?: string;
  model?: string;
  year?: number;
  status: MotoRentalVehicleStatus;
  vehicleType: MotoRentalVehicleType;
  mileage?: number;
  insuranceExpiry?: string;
  roadTaxExpiry?: string;
  dailyRate?: number;
  weeklyRate?: number;
  deposit?: number;
  notes?: string;
  documents?: {
    insurance?: string;
    logbook?: string;
  };
  metadata?: {
    createdBy?: string;
    updatedBy?: string;
    updatedAt?: string;
    createdAt?: string;
    statusHistory?: Array<{
      status: MotoRentalVehicleStatus;
      changedAt: string;
      changedBy?: string;
      note?: string;
    }>;
  };
  currentContractId?: string | null;
}

export interface MotoRentalContract {
  id: string;
  instanceId: string;
  vehicleId: string;
  vehicleType: MotoRentalVehicleType;
  customerId: string;
  customerDocs?: Record<string, any>;
  startDate: string;
  endDate: string;
  status: MotoRentalContractStatus;
  kmOut?: number;
  kmIn?: number;
  deposit?: number;
  charges?: MotoRentalChargeSummary;
  damageReport?: string;
  linkedServiceOrderId?: string;
  linkedVanOrderId?: string;
  signatures?: Record<string, any>;
  createdBy?: string;
  closedAt?: string;
}

export interface MotoRentalChargeSummary {
  totalDays: number;
  dailyRate: number;
  weeklyRate?: number;
  deposit?: number;
  baseAmount: number;
  totalAmount: number;
}

export interface MotoRentalVehicleFilters {
  status?: MotoRentalVehicleStatus | MotoRentalVehicleStatus[];
  vehicleType?: MotoRentalVehicleType | MotoRentalVehicleType[];
  search?: string;
}

export interface MotoRentalContractFilters {
  status?: MotoRentalContractStatus | MotoRentalContractStatus[];
  vehicleId?: string;
}

export interface MotoRentalReservationPayload {
  id?: string;
  vehicleId: string;
  customerId: string;
  customerDocs?: Record<string, any>;
  startDate: string;
  endDate: string;
  status?: MotoRentalContractStatus;
  kmOut?: number;
  kmIn?: number;
  deposit?: number;
  dailyRate?: number;
  weeklyRate?: number;
  damageReport?: string;
  linkedServiceOrderId?: string;
  linkedVanOrderId?: string;
  signatures?: Record<string, any>;
}

export interface MotoRentalAvailability {
  id: string;
  startDate: string;
  endDate: string;
  status: MotoRentalContractStatus;
  customerId: string;
}

export interface MotoRentalModuleState {
  lastUpdated?: string;
  defaultRates?: {
    daily?: number;
    weekly?: number;
    deposit?: number;
  };
}
