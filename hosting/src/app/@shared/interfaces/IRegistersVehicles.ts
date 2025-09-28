import { IRegistersCustomer } from "./IRegistersCustomer";

export interface IRegistersVehicles {
  _id?: string;
  _isDisabled?: boolean;
  code?: (number | string); // Number: Database | String: View
  proprietary?: IRegistersCustomer;
  plate: string;
  model: string;
  color: string;
  mileage: number;
  chassis?: string;
  branches?: any;
  owner?: string; // Store ID
  registerDate?: string;
  modifiedDate?: string;  
}
