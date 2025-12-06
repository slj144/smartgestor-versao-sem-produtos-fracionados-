import { Functions } from "../@default/functions/functions";
import { iTools } from "../@default/iTools";

type VehicleStatus = "available" | "maintenance" | "rented" | "reserved";
type VehicleType = "motorcycle" | "van";
type ContractStatus = "draft" | "reserved" | "active" | "closed" | "cancelled";

interface HandlerContext {
  body: any;
  data: any;
  instanceId: string;
  settings: any;
  timezone: string;
  itools: iTools;
  userId?: string;
}

export interface MotoRentalVehicle {
  id: string;
  instanceId: string;
  plate: string;
  vin?: string;
  make?: string;
  model?: string;
  year?: number;
  status: VehicleStatus;
  vehicleType: VehicleType;
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
    updatedAt?: any;
    createdAt?: any;
    statusHistory?: Array<{
      status: VehicleStatus;
      changedAt: any;
      changedBy?: string;
      note?: string;
    }>;
  };
  currentContractId?: string;
}

export interface MotoRentalContract {
  id: string;
  instanceId: string;
  vehicleId: string;
  vehicleType: VehicleType;
  customerId: string;
  customerDocs?: any;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  kmOut?: number;
  kmIn?: number;
  deposit?: number;
  charges?: any;
  damageReport?: string;
  linkedServiceOrderId?: string;
  linkedVanOrderId?: string;
  signatures?: any;
  createdBy?: string;
  closedAt?: any;
}

const COLLECTIONS = {
  vehicles: "MotoRentalVehicles",
  contracts: "MotoRentalContracts",
  rates: "MotoRentalRates"
};

class MotoRentalHandlers {
  private static readonly UK_PLATE_REGEX = /^[A-Z]{2}[0-9]{2}[A-Z]{3}$/;
  private static readonly UK_PLATE_PREFIX_REGEX = /^[A-Z][0-9]{1,3}[A-Z]{3}$/; // 1983-2001 prefix
  private static readonly UK_PLATE_SUFFIX_REGEX = /^[A-Z]{3}[0-9]{1,3}[A-Z]$/; // 1963-1980 suffix
  private static readonly VEHICLE_STATUSES: VehicleStatus[] = ["available", "maintenance", "rented", "reserved"];
  private static readonly CONTRACT_STATUSES: ContractStatus[] = ["draft", "reserved", "active", "closed", "cancelled"];
  private static readonly VEHICLE_TYPES: VehicleType[] = ["motorcycle", "van"];
  private static readonly DEFAULT_TIMEZONE = "Europe/London";

  public static async listVehicles(request: any, response: any) {
    const ctx = await this.buildContext(request, response);
    if (!ctx) { return; }

    try {
      const filters = ctx.data?.filters || {};
      const whereConditions: any[] = [
        { field: "instanceId", operator: "==", value: ctx.instanceId }
      ];

      const statusFilter = this.normalizeArray(filters.status).filter((status) => this.VEHICLE_STATUSES.indexOf(status) !== -1);
      const typeFilter = this.normalizeArray(filters.vehicleType).filter((type) => this.VEHICLE_TYPES.indexOf(type as VehicleType) !== -1);

      if (statusFilter.length === 1) {
        whereConditions.push({ field: "status", operator: "==", value: statusFilter[0] });
      } else if (statusFilter.length > 1) {
        whereConditions.push({ field: "status", operator: "in", value: statusFilter });
      }

      if (typeFilter.length === 1) {
        whereConditions.push({ field: "vehicleType", operator: "==", value: typeFilter[0] });
      } else if (typeFilter.length > 1) {
        whereConditions.push({ field: "vehicleType", operator: "in", value: typeFilter });
      }

      const collection = ctx.itools.database().collection(COLLECTIONS.vehicles).where(whereConditions);
      const result = await collection.get();

      const searchTerm = typeof filters.search === "string" ? filters.search.trim().toUpperCase() : null;

      const vehicles = result.docs
        .map((doc) => doc.data())
        .filter((vehicle) => {
          if (!searchTerm) { return true; }
          const plate = (vehicle.plate || "").toUpperCase();
          const model = (vehicle.model || "").toUpperCase();
          return plate.indexOf(searchTerm) !== -1 || model.indexOf(searchTerm) !== -1;
        });

      console.log('[MotoRental] listVehicles result', {
        instanceId: ctx.instanceId,
        count: vehicles.length
      });
      response.send({ status: true, data: vehicles });
    } catch (error) {
      this.handleError(response, error, "LIST_VEHICLES");
    }
  }

  public static async saveVehicle(request: any, response: any) {
    const ctx = await this.buildContext(request, response);
    if (!ctx) { return; }

    try {
      const payload = ctx.data?.vehicle || ctx.data;
      if (!payload) {
        response.send({ status: false, error: "VEHICLE_DATA_REQUIRED" });
        return;
      }
      console.log('[MotoRental] saveVehicle payload', {
        instanceId: ctx.instanceId,
        hasData: !!payload,
        plate: payload?.plate,
        keys: Object.keys(payload || {})
      });

      const sanitizedPlate = this.normalizePlate(payload.plate);
      if (!sanitizedPlate || !this.isValidPlate(sanitizedPlate)) {
        console.warn('[MotoRental] Invalid plate format', {
          original: payload.plate,
          sanitized: sanitizedPlate,
          instanceId: ctx.instanceId
        });
        response.send({ status: false, error: "INVALID_PLATE_FORMAT" });
        return;
      }

      const vehicleType = this.normalizeVehicleType(payload.vehicleType);
      const status = this.normalizeVehicleStatus(payload.status);
      const vehicleId = payload.id && payload.id.toString().trim().length > 0 ? payload.id : iTools.ObjectId();

      const docRef = ctx.itools.database().collection(COLLECTIONS.vehicles).doc(vehicleId);
      const snapshot = await docRef.get();
      const existing = snapshot ? snapshot.data() : null;
      const nowField = this.getServerDateField(ctx.timezone);

      const metadata = existing?.metadata || {};
      metadata.statusHistory = metadata.statusHistory || [];

      if (!existing || existing.status !== status) {
        metadata.statusHistory.push({
          status: status,
          changedAt: nowField,
          changedBy: ctx.userId,
          note: payload.statusNote
        });
      }

      const vehicle: MotoRentalVehicle = {
        id: vehicleId,
        instanceId: ctx.instanceId,
        plate: sanitizedPlate,
        vin: this.cleanString(payload.vin),
        make: this.cleanString(payload.make),
        model: this.cleanString(payload.model),
        year: this.toNumber(payload.year),
        status,
        vehicleType,
        mileage: this.toNumber(payload.mileage),
        insuranceExpiry: payload.insuranceExpiry,
        roadTaxExpiry: payload.roadTaxExpiry,
        dailyRate: this.toNumber(payload.dailyRate),
        weeklyRate: this.toNumber(payload.weeklyRate),
        deposit: this.toNumber(payload.deposit),
        notes: this.cleanString(payload.notes),
        documents: payload.documents || existing?.documents || {},
        metadata: {
          createdAt: existing?.metadata?.createdAt || nowField,
          createdBy: existing?.metadata?.createdBy || ctx.userId,
          updatedAt: nowField,
          updatedBy: ctx.userId,
          statusHistory: metadata.statusHistory
        },
        currentContractId: existing?.currentContractId
      };

      await docRef.update(vehicle, { upsert: true });
      response.send({ status: true, data: vehicle });
    } catch (error) {
      this.handleError(response, error, "SAVE_VEHICLE");
    }
  }

  public static async changeVehicleStatus(request: any, response: any) {
    const ctx = await this.buildContext(request, response);
    if (!ctx) { return; }

    try {
      const { vehicleId, status, note } = ctx.data || {};
      if (!vehicleId) {
        response.send({ status: false, error: "VEHICLE_ID_REQUIRED" });
        return;
      }

      const normalizedStatus = this.normalizeVehicleStatus(status);
      if (!normalizedStatus) {
        response.send({ status: false, error: "INVALID_STATUS" });
        return;
      }

      const docRef = ctx.itools.database().collection(COLLECTIONS.vehicles).doc(vehicleId);
      const snapshot = await docRef.get();
      const vehicle = snapshot ? snapshot.data() : null;

      if (!vehicle || vehicle.instanceId !== ctx.instanceId) {
        response.send({ status: false, error: "VEHICLE_NOT_FOUND" });
        return;
      }

      const nowField = this.getServerDateField(ctx.timezone);
      const statusHistory = vehicle?.metadata?.statusHistory || [];
      statusHistory.push({
        status: normalizedStatus,
        changedAt: nowField,
        changedBy: ctx.userId,
        note
      });

      await docRef.update({
        status: normalizedStatus,
        metadata: {
          ...(vehicle.metadata || {}),
          statusHistory,
          updatedAt: nowField,
          updatedBy: ctx.userId
        },
        lastStatusUpdate: nowField
      });

      response.send({ status: true });
    } catch (error) {
      this.handleError(response, error, "CHANGE_VEHICLE_STATUS");
    }
  }

  public static async listContracts(request: any, response: any) {
    const ctx = await this.buildContext(request, response);
    if (!ctx) { return; }

    try {
      const filters = ctx.data?.filters || {};
      const whereConditions: any[] = [
        { field: "instanceId", operator: "==", value: ctx.instanceId }
      ];

      const statusFilter = this.normalizeArray(filters.status).filter((status) => this.CONTRACT_STATUSES.indexOf(status) !== -1);
      if (statusFilter.length === 1) {
        whereConditions.push({ field: "status", operator: "==", value: statusFilter[0] });
      } else if (statusFilter.length > 1) {
        whereConditions.push({ field: "status", operator: "in", value: statusFilter });
      }

      if (filters.vehicleId) {
        whereConditions.push({ field: "vehicleId", operator: "==", value: filters.vehicleId });
      }

      const collection = ctx.itools.database().collection(COLLECTIONS.contracts).where(whereConditions);
      const result = await collection.get();
      const contracts = result.docs.map((doc) => doc.data());

      response.send({ status: true, data: contracts });
    } catch (error) {
      this.handleError(response, error, "LIST_CONTRACTS");
    }
  }

  public static async reserveVehicle(request: any, response: any) {
    const ctx = await this.buildContext(request, response);
    if (!ctx) { return; }

    try {
      const reservation = ctx.data?.reservation || ctx.data;

      if (!reservation || !reservation.vehicleId || !reservation.customerId || !reservation.startDate || !reservation.endDate) {
        response.send({ status: false, error: "RESERVATION_DATA_INCOMPLETE" });
        return;
      }

      const vehicleDoc = ctx.itools.database().collection(COLLECTIONS.vehicles).doc(reservation.vehicleId);
      const vehicleSnapshot = await vehicleDoc.get();
      const vehicle = vehicleSnapshot ? vehicleSnapshot.data() : null;

      if (!vehicle || vehicle.instanceId !== ctx.instanceId) {
        response.send({ status: false, error: "VEHICLE_NOT_FOUND" });
        return;
      }

      const conflict = await this.hasScheduleConflict(ctx, reservation.vehicleId, reservation.startDate, reservation.endDate, reservation.id);
      if (conflict) {
        response.send({ status: false, error: "VEHICLE_UNAVAILABLE" });
        return;
      }

      const contractId = reservation.id && reservation.id.toString().trim().length > 0 ? reservation.id : iTools.ObjectId();
      const nowField = this.getServerDateField(ctx.timezone);

      const charges = this.calculateCharges(vehicle, reservation);

      const contract: MotoRentalContract = {
        id: contractId,
        instanceId: ctx.instanceId,
        vehicleId: reservation.vehicleId,
        vehicleType: vehicle.vehicleType || "motorcycle",
        customerId: reservation.customerId,
        customerDocs: reservation.customerDocs,
        startDate: reservation.startDate,
        endDate: reservation.endDate,
        status: reservation.status && this.CONTRACT_STATUSES.indexOf(reservation.status) !== -1 ? reservation.status : "reserved",
        kmOut: this.toNumber(reservation.kmOut),
        kmIn: this.toNumber(reservation.kmIn),
        deposit: this.toNumber(reservation.deposit) || vehicle.deposit,
        charges,
        damageReport: reservation.damageReport,
        linkedServiceOrderId: reservation.linkedServiceOrderId,
        linkedVanOrderId: reservation.linkedVanOrderId,
        signatures: reservation.signatures,
        createdBy: ctx.userId
      };

      await ctx.itools.database().collection(COLLECTIONS.contracts).doc(contractId).update(contract, { upsert: true });
      await vehicleDoc.update({
        status: "reserved",
        currentContractId: contractId,
        metadata: {
          ...(vehicle.metadata || {}),
          updatedAt: nowField,
          updatedBy: ctx.userId
        }
      });

      response.send({ status: true, data: contract });
    } catch (error) {
      this.handleError(response, error, "RESERVE_VEHICLE");
    }
  }

  public static async closeContract(request: any, response: any) {
    const ctx = await this.buildContext(request, response);
    if (!ctx) { return; }

    try {
      const payload = ctx.data || {};
      const contractId = payload.contractId;

      if (!contractId) {
        response.send({ status: false, error: "CONTRACT_ID_REQUIRED" });
        return;
      }

      const contractRef = ctx.itools.database().collection(COLLECTIONS.contracts).doc(contractId);
      const contractSnapshot = await contractRef.get();
      const contract = contractSnapshot ? contractSnapshot.data() : null;

      if (!contract || contract.instanceId !== ctx.instanceId) {
        response.send({ status: false, error: "CONTRACT_NOT_FOUND" });
        return;
      }

      const vehicleRef = ctx.itools.database().collection(COLLECTIONS.vehicles).doc(contract.vehicleId);
      const vehicleSnapshot = await vehicleRef.get();
      const vehicle = vehicleSnapshot ? vehicleSnapshot.data() : null;

      if (!vehicle) {
        response.send({ status: false, error: "VEHICLE_NOT_FOUND" });
        return;
      }

      const nowField = this.getServerDateField(ctx.timezone);
      const closingCharges = this.calculateCharges(vehicle, {
        startDate: contract.startDate,
        endDate: contract.endDate,
        dailyRate: payload.overrideDailyRate,
        weeklyRate: payload.overrideWeeklyRate,
        deposit: payload.overrideDeposit
      });

      const updatedContract = {
        ...contract,
        status: "closed" as ContractStatus,
        kmIn: this.toNumber(payload.kmIn) || contract.kmIn,
        damageReport: payload.damageReport || contract.damageReport,
        charges: closingCharges,
        closedAt: nowField
      };

      await contractRef.update(updatedContract);
      await vehicleRef.update({
        status: "available",
        currentContractId: null,
        mileage: this.toNumber(payload.kmIn) || vehicle.mileage,
        metadata: {
          ...(vehicle.metadata || {}),
          updatedAt: nowField,
          updatedBy: ctx.userId
        }
      });

      response.send({ status: true, data: updatedContract });
    } catch (error) {
      this.handleError(response, error, "CLOSE_CONTRACT");
    }
  }

  public static async getAvailability(request: any, response: any) {
    const ctx = await this.buildContext(request, response);
    if (!ctx) { return; }

    try {
      const { vehicleId, startDate, endDate } = ctx.data || {};
      if (!vehicleId) {
        response.send({ status: false, error: "VEHICLE_ID_REQUIRED" });
        return;
      }

      const reservations = await this.fetchContractsForVehicle(ctx, vehicleId);
      const filtered = this.filterByDateRange(reservations, startDate, endDate).map((item) => ({
        id: item.id,
        startDate: item.startDate,
        endDate: item.endDate,
        status: item.status,
        customerId: item.customerId
      }));

      response.send({ status: true, data: filtered });
    } catch (error) {
      this.handleError(response, error, "GET_AVAILABILITY");
    }
  }

  private static async buildContext(request: any, response: any): Promise<HandlerContext | null> {
    Functions.parseRequestBody(request);

    const body = typeof request.body === "object" ? request.body : {};
    console.log('[MotoRental] Raw request body', body);
    const envelope = body && typeof body.data === "object" ? body.data : {};
    const payloadData = envelope && typeof envelope.data === "object" ? envelope.data : envelope;

    const rawInstanceId =
      body.instanceId ||
      envelope.instanceId ||
      payloadData.instanceId ||
      body.projectId;
    const instanceId = typeof rawInstanceId === "string"
      ? rawInstanceId.trim()
      : (rawInstanceId ? rawInstanceId.toString() : "");
    let settingsSource = body.settings || envelope.settings || payloadData.settings || {};
    let settings = settingsSource && typeof settingsSource === "object" ? { ...settingsSource } : {};

    if (!instanceId) {
      response.send({ status: false, error: "INSTANCE_ID_REQUIRED" });
      return null;
    }

    if (this.settingsNeedHydration(settings)) {
      const persistedSettings = await this.fetchInstanceSettings(instanceId);
      settings = this.mergeSettings(persistedSettings, settings);
    } else {
      settings = this.normalizeSettings(settings);
    }

    const gate = this.featureGate(settings);
    if (!gate.allowed) {
      console.warn('[MotoRental] Feature gate blocked', {
        reason: gate.reason,
        settings: {
          country: settings?.country,
          motoRentalEnabled: settings?.workshop?.motoRentalEnabled
        },
        instanceId
      });
      response.send({ status: false, error: gate.reason || "FEATURE_DISABLED" });
      return null;
    }

    const itoolsInstance = Functions.initITools(instanceId);
    return {
      body,
      data: payloadData || {},
      instanceId,
      settings,
      timezone: settings?.timezone || settings?.profile?.timezone || this.DEFAULT_TIMEZONE,
      itools: itoolsInstance,
      userId: envelope?.user?.id || body.user?.id || payloadData?.user?.id || body.userId
    };
  }

  private static async fetchInstanceSettings(instanceId: string) {
    const managerInstance = new iTools();
    try {
      await managerInstance.initializeApp({
        projectId: "projects-manager"
      });
      const doc = await managerInstance.database().collection("Projects").doc(instanceId).get();
      return this.normalizeSettings(doc?.data() || {});
    } catch (error) {
      console.error('[MotoRental] Failed to fetch instance settings', error);
      return {};
    } finally {
      try { managerInstance.close(); } catch { }
    }
  }

  private static featureGate(settings: any): { allowed: boolean; reason?: string } {
    const normalized = this.normalizeSettings(settings);
    const enabled = normalized?.workshop?.motoRentalEnabled === true;
    const country = normalized?.country || "";
    const regionAllowed = country === "UK";
    return {
      allowed: enabled && regionAllowed,
      reason: enabled ? (regionAllowed ? undefined : "MOTO_RENTAL_ALLOWED_ONLY_IN_UK") : "MOTO_RENTAL_DISABLED_FOR_INSTANCE"
    };
  }

  private static normalizePlate(plate: any): string {
    if (!plate) { return ""; }
    return plate
      .toString()
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
  }

  private static isValidPlate(plate: string): boolean {
    if (!plate) { return false; }
    const patterns = [
      this.UK_PLATE_REGEX,
      this.UK_PLATE_PREFIX_REGEX,
      this.UK_PLATE_SUFFIX_REGEX
    ];
    if (patterns.some((regex) => regex.test(plate))) {
      return true;
    }

    const fallback = /^[A-Z0-9]{5,8}$/;
    if (fallback.test(plate)) {
      console.warn('[MotoRental] Plate accepted via fallback validator', { plate });
      return true;
    }

    return false;
  }

  private static normalizeVehicleType(value: any): VehicleType {
    return value === "van" ? "van" : "motorcycle";
  }

  private static normalizeVehicleStatus(value: any): VehicleStatus {
    const status = (value || "").toString().toLowerCase();
    return this.VEHICLE_STATUSES.indexOf(status as VehicleStatus) !== -1 ? status as VehicleStatus : "available";
  }

  private static normalizeArray(value: any): string[] {
    if (!value) { return []; }
    return value instanceof Array ? value.map((item) => item.toString()) : [value.toString()];
  }

  private static cleanString(value: any): string | undefined {
    if (value === null || value === undefined) { return undefined; }
    const str = value.toString().trim();
    return str.length > 0 ? str : undefined;
  }

  private static toNumber(value: any): number | undefined {
    if (value === null || value === undefined || value === "") { return undefined; }
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  }

  private static handleError(response: any, error: any, context: string) {
    console.error(`[MotoRental:${context}]`, error);
    response.send({ status: false, error: "INTERNAL_ERROR", context });
  }

  private static getServerDateField(timezone?: string) {
    const tz = timezone || this.DEFAULT_TIMEZONE;
    return iTools.FieldValue.date(tz);
  }

  private static async fetchContractsForVehicle(ctx: HandlerContext, vehicleId: string) {
    const result = await ctx.itools.database().collection(COLLECTIONS.contracts).where([
      { field: "instanceId", operator: "==", value: ctx.instanceId },
      { field: "vehicleId", operator: "==", value: vehicleId }
    ]).get();

    return result.docs.map((doc) => doc.data());
  }

  private static async hasScheduleConflict(ctx: HandlerContext, vehicleId: string, startDate: string, endDate: string, ignoreId?: string) {
    const reservations = await this.fetchContractsForVehicle(ctx, vehicleId);
    const overlapping = this.filterByDateRange(reservations, startDate, endDate).filter((contract) => {
      if (ignoreId && contract.id === ignoreId) { return false; }
      return contract.status === "reserved" || contract.status === "active";
    });
    return overlapping.length > 0;
  }

  private static filterByDateRange(reservations: MotoRentalContract[], startDate?: string, endDate?: string) {
    if (!startDate && !endDate) { return reservations; }
    const start = startDate ? new Date(startDate).getTime() : null;
    const end = endDate ? new Date(endDate).getTime() : null;

    return reservations.filter((reservation) => {
      const resStart = new Date(reservation.startDate).getTime();
      const resEnd = new Date(reservation.endDate).getTime();

      if (start !== null && resEnd < start) { return false; }
      if (end !== null && resStart > end) { return false; }
      return true;
    });
  }

  private static calculateCharges(vehicle: MotoRentalVehicle, reservation: any) {
    const start = reservation.startDate ? new Date(reservation.startDate) : new Date();
    const end = reservation.endDate ? new Date(reservation.endDate) : start;
    const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    const dailyRate = this.toNumber(reservation.dailyRate) || vehicle.dailyRate || 0;
    const weeklyRate = this.toNumber(reservation.weeklyRate) || vehicle.weeklyRate || 0;
    const deposit = this.toNumber(reservation.deposit) || vehicle.deposit || 0;

    let total = 0;
    if (weeklyRate && totalDays >= 7) {
      const weeks = Math.floor(totalDays / 7);
      const remainingDays = totalDays % 7;
      total = (weeks * weeklyRate) + (remainingDays * dailyRate);
    } else {
      total = totalDays * dailyRate;
    }

    return {
      totalDays,
      dailyRate,
      weeklyRate,
      deposit,
      baseAmount: total,
      totalAmount: total + deposit
    };
  }

  private static settingsNeedHydration(settings: any): boolean {
    if (!settings || typeof settings !== "object") {
      return true;
    }

    const hasCountry = !!this.resolveCountry(settings);
    const hasExplicitFlag = typeof settings?.workshop?.motoRentalEnabled === "boolean";

    return !(hasCountry && hasExplicitFlag);
  }

  private static mergeSettings(base: any, override: any) {
    const merged: any = {
      ...(base || {}),
      ...(override || {})
    };

    merged.profile = {
      ...(base?.profile || {}),
      ...(override?.profile || {})
    };

    merged.company = {
      ...(base?.company || {}),
      ...(override?.company || {})
    };

    merged.workshop = {
      ...(base?.workshop || {}),
      ...(override?.workshop || {})
    };

    return this.normalizeSettings(merged);
  }

  private static normalizeSettings(settings: any) {
    if (!settings || typeof settings !== "object") {
      return {};
    }

    const normalized: any = {
      ...settings,
      profile: { ...(settings.profile || {}) },
      company: { ...(settings.company || {}) },
      workshop: { ...(settings.workshop || {}) }
    };

    const resolvedCountry = this.resolveCountry(normalized);
    if (resolvedCountry) {
      normalized.country = resolvedCountry;
    }

    if (typeof normalized.workshop.motoRentalEnabled !== "boolean") {
      normalized.workshop.motoRentalEnabled = this.resolveWorkshopFlag(normalized);
    }

    return normalized;
  }

  private static resolveCountry(settings: any): string {
    const candidates = [
      settings?.country,
      settings?.profile?.country,
      settings?.profile?.data?.country,
      settings?.company?.country,
      settings?.company?.settings?.country,
      settings?.adminKey?.country,
      settings?.workshop?.country
    ];

    for (const value of candidates) {
      if (typeof value === "string" && value.trim().length > 0) {
        return value.trim().toUpperCase();
      }
    }

    return "";
  }

  private static resolveWorkshopFlag(settings: any): boolean {
    const candidates = [
      settings?.workshop?.motoRentalEnabled,
      settings?.profile?.workshop?.motoRentalEnabled,
      settings?.profile?.data?.workshop?.motoRentalEnabled,
      settings?.company?.workshop?.motoRentalEnabled
    ];

    return candidates.some((value) => value === true);
  }
}

export const listVehicles = MotoRentalHandlers.listVehicles.bind(MotoRentalHandlers);
export const saveVehicle = MotoRentalHandlers.saveVehicle.bind(MotoRentalHandlers);
export const changeVehicleStatus = MotoRentalHandlers.changeVehicleStatus.bind(MotoRentalHandlers);
export const listContracts = MotoRentalHandlers.listContracts.bind(MotoRentalHandlers);
export const reserveVehicle = MotoRentalHandlers.reserveVehicle.bind(MotoRentalHandlers);
export const closeContract = MotoRentalHandlers.closeContract.bind(MotoRentalHandlers);
export const getAvailability = MotoRentalHandlers.getAvailability.bind(MotoRentalHandlers);

Functions.setAccess(listVehicles, "PRIVATE");
Functions.setAccess(saveVehicle, "PRIVATE");
Functions.setAccess(changeVehicleStatus, "PRIVATE");
Functions.setAccess(listContracts, "PRIVATE");
Functions.setAccess(reserveVehicle, "PRIVATE");
Functions.setAccess(closeContract, "PRIVATE");
Functions.setAccess(getAvailability, "PRIVATE");
