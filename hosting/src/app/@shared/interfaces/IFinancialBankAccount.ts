import { IFinancialBankTransaction } from "./IFinancialBankTransaction";

export interface IFinancialBankAccount {
  _id?: string;  
  code?: (number | string); // Number: Database | String: View
  name: string;
  agency: string;
  account: string;
  balance: (number | string);
  transaction?: IFinancialBankTransaction; // Only service
  owner: string; // Store ID
  registerDate?: string;
  modifiedDate?: string;  
  _isDefault?: boolean;
}
