// default
import { Functions } from "./@default/functions/functions";

// Utilities
import { iTools } from "./@default/iTools";
import { Utilities } from "./@default/iTools/utilities/utilities";

// Custom
import { ProjectInstance } from "./project-instance/project-instance";
import { Email } from "./email/email";
import * as fiscal from "./fiscal/fiscal";
import * as motoRentals from "./moto-rentals";

// Default
export const __exported_packages__ = {
  fiscal: fiscal,
  motoRentals: motoRentals
};

export const getDate = (request: any, response: any) => {

  Functions.parseRequestBody(request);

  const timezone = request.body?.data?.timezone;

  const formatNumber = (number: number) => {
    if (number < 10) {
      return "0" + number;
    } else {
      return number.toString();
    }
  };

  const date = timezone ? Utilities.applyTimezone(timezone, new Date()) : new Date();

  response.send(timezone ? `${date.getFullYear()}-${formatNumber(date.getMonth() + 1)}-${formatNumber(date.getDate())}T${formatNumber(date.getHours())}:${formatNumber(date.getMinutes())}:${formatNumber(date.getSeconds())}` : new Date().toISOString());
};

export const sendEmail = Email.sendEmail;

export const getProjectSettings = ProjectInstance.getProjectSettings;

export const createProjectInstance = ProjectInstance.createProjectInstance;

// NOVA FUNÇÃO - Atualizar status da instância (ativar/desativar)
export const updateInstanceStatus = ProjectInstance.updateInstanceStatus;
export const updateInstanceSettings = ProjectInstance.updateInstanceSettings;

export const motoRentalListVehicles = motoRentals.listVehicles;
export const motoRentalSaveVehicle = motoRentals.saveVehicle;
export const motoRentalChangeVehicleStatus = motoRentals.changeVehicleStatus;
export const motoRentalListContracts = motoRentals.listContracts;
export const motoRentalReserveVehicle = motoRentals.reserveVehicle;
export const motoRentalCloseContract = motoRentals.closeContract;
export const motoRentalGetAvailability = motoRentals.getAvailability;

Functions.setAccess(createProjectInstance, "PUBLIC");
Functions.setAccess(getDate, "PUBLIC");

// Define acesso público para a nova função
Functions.setAccess(updateInstanceStatus, "PUBLIC");
Functions.setAccess(updateInstanceSettings, "PUBLIC");
