import { IOperator } from './_auxiliaries/IOperator';

export interface ICashierControl {
  _id?: string;
  code?: (number | string); // Number: Database | String: View
  opening?: {
    value: number;
    date: string;
  };
  closing?: {
    value: number;
    date: string;
  };
  status?: ECashierControlStatus;
  operator?: IOperator;
  owner?: string; // Store ID
  registerDate?: string;
  modifiedDate?: string;
}

export enum ECashierControlStatus {
  OPENED = 'OPENED',
  CLOSED = 'CLOSED'
}
