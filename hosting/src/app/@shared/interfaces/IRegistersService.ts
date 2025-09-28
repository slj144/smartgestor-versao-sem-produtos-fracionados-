
export interface IRegistersService {
  _id?: string;
  _isDisabled?: boolean;
  code?: (number | string); // Number: Database | String: View
  name: string;
  costPrice: number;
  executionPrice: number;
  description?: string;
  
  cnae?: string;
  codigo?: string;
  codigoTributacao?: string;
  tributes?: any;
  branches?: any;
  owner?: string; // Store ID
  registerDate?: string;
  modifiedDate?: string;  
}
