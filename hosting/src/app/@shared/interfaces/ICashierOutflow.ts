import { IOperator } from './_auxiliaries/IOperator';

export interface ICashierOutflow {
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
  status: ECashierOutflowStatus;
  operator?: IOperator;
  owner?: string; // Store ID
  origin?: ECashierOutflowOrigin;
  registerDate?: string;
  modifiedDate?: string;
}

export enum ECashierOutflowStatus {
  CONCLUDED = 'CONCLUDED',
  CANCELED = 'CANCELED'
}

export enum ECashierOutflowOrigin {
  CASHIER = "CASHIER",
  BILLSTOPAY = 'BILLSTOPAY',
  BILLSTORECEIVE = 'BILLSTORECEIVE'
}
