import { IOperator } from './_auxiliaries/IOperator';

export interface IFinancialBankTransaction {
  _id?: string;
  code?: (number | string); // Number: Database | String: View
  type: EFinancialBankTransactionType;
  bankAccount: {
    code: string;
    name: string;
  } 
  interest?: number;
  discount?: number;
  value: number;  
  operator?: IOperator;
  owner?: string; // Store ID
  registerDate?: string;
}

export enum EFinancialBankTransactionType {
  OPENING = 'OPENING',
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  TRANSFER = 'TRANSFER'
}
