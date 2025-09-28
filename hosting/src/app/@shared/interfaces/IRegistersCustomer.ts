import { EPersonType } from "../enum/EPersonType";
import { EBusinessDocument } from "../enum/EBusinesslDocument";
import { EPersonalDocument } from "../enum/EPersonalDocument";

export interface IRegistersCustomer {
  _id?: string;
  code?: (number | string); // Number: Database | String: View
  name: string;  
  description?: string;
  type: EPersonType;
  birthDate?: string;
  personalDocument?: {
    type: EPersonalDocument;
    value: string;
  };
  businessDocument?: {
    type: EBusinessDocument;
    value: string;
  };
  stateInscription?: string;
  municipalInscription?: string;
  address?: {
    postalCode: string;
    local: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    country: string;
  };
  contacts?: {
    email?: string;
    phone?: string;
  };
  owner?: string; // Store ID
  registerDate?: string;
  modifiedDate?: string;
}
