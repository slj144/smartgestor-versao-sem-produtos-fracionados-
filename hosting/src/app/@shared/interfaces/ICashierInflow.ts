import { IOperator } from './_auxiliaries/IOperator';

export interface ICashierInflow {
  _id?: string;
  code?: (number | string); // Number: Database | String: View
  referenceCode?: (number | string); // Number: Database | String: View
  category: {
    _id: string;
    code: string;
    name: string;
  };
  note: string;
  value: number;
  status: ECashierInflowStatus;
  operator?: IOperator;
  owner?: string; // Store ID
  origin?: ECashierInflowOrigin;
  registerDate?: string;
  modifiedDate?: string;
}

export enum ECashierInflowStatus {
  CONCLUDED = 'CONCLUDED',
  CANCELED = 'CANCELED'
}

export enum ECashierInflowOrigin {
  CASHIER = "CASHIER",
  BILLSTOPAY = 'BILLSTOPAY',
  BILLSTORECEIVE = 'BILLSTORECEIVE'
}
