// default
import { Functions } from "./@default/functions/functions";

// Utilities
import { iTools } from "./@default/iTools";
import { Utilities } from "./@default/iTools/utilities/utilities";

// Custom
import { ProjectInstance } from "./project-instance/project-instance";
import { Email } from "./email/email";
import * as fiscal from "./fiscal/fiscal";

// Default
export const __exported_packages__ = {
  fiscal: fiscal
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

Functions.setAccess(createProjectInstance, "PUBLIC");
Functions.setAccess(getDate, "PUBLIC");

// Define acesso público para a nova função
Functions.setAccess(updateInstanceStatus, "PUBLIC");
