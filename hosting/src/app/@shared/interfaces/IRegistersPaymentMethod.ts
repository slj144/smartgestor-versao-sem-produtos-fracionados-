
export interface IRegistersPaymentMethod {
  _id?: string;
  _lastProviderCode?: number;
  _isDefault?: boolean;
  _isDisabled?: boolean;
  code?: (number | string); // Number: Database | String: View
  name: string;
  fee?: number;  
  bankAccount?: BankAccount;
  branches?: {
    [key: string]: {
      bankAccount: BankAccount
    }
  };
  providers?: {
    [key: string]: {
      code: number;
      name: string;
      fee?: number;
      fees?: {
        [key: string]: {
          fee: number;
          parcel: number;
        }
      };
      bankAccount?: BankAccount,
      branches?: {
        [key: string]: {
          bankAccount: BankAccount
        }
      };
      owner?: string;
      uninvoiced?: boolean;
      _isDisabled?: boolean;
    }
  };
  uninvoiced?: boolean;
  owner?: string; // Store ID  
  registerDate?: string;
  modifiedDate?: string;
}

class BankAccount {
  _id: string;
  code: string;
  name: string;
  agency: string;
  account: string;
}
