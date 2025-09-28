import { IOperator } from './_auxiliaries/IOperator';

export interface IFinancialBillToReceive {
  _id?: string;
  code?: (number | string); // Number: Database | String: View
  referenceCode?: (number | string); // Number: Database | String: View
  origin: EFinancialBillToReceiveOrigin;
  debtor?: {
    _id: string;
    code: string;
    name: string;
    type: EFinancialBillToReceiveDebtorType;
    email?: string;
    phone?: string;
    address?: string;
  };
  category: {
    _id: string;
    code: string; 
    name: string;
  };  
  installments: {
    parcel: number;
    dueDate: string;
    discount?: number;
    interest?: number;
    amount: number;
    receivedAmount?: number;
    receiptDate?: string;
    paymentMethods?: {
      code: string;
      name: string;
      amount: number;
      bankAccount?: {
        _id: string;
        code: string;
        name: string;
      };
      history?: {
        date: string,
        value: number
      }[];
      settings?: {
        fee?: number;
        parcel?: number;
      };
      uninvoiced?: boolean;
    }[];
    status: EFinancialBillToReceiveInstallmentStatus;
  }[]; 
  description: string;
  status: EFinancialBillToReceiveStatus;
  receivedInstallments: number;
  totalInstallments: number;
  currentInstallment: number;
  received: number;
  amount: number;
  operator?: IOperator;
  owner?: string; // Store ID
  registerDate?: string;
  modifiedDate?: string;
}

export enum EFinancialBillToReceiveOrigin {
  FINANCIAL = 'FINANCIAL',
  CASHIER = 'CASHIER',
  TRANSFER = 'TRANSFER'
}

export enum EFinancialBillToReceiveDebtorType {
  CUSTOMER = 'CUSTOMER',
  PROVIDER = 'PROVIDER',
  STORE = 'STORE'
}

export enum EFinancialBillToReceiveInstallmentStatus {
  PENDENT = 'PENDENT',
  CONCLUDED = 'CONCLUDED'
}

export enum EFinancialBillToReceiveStatus {
  PENDENT = 'PENDENT',
  CONCLUDED = 'CONCLUDED',
  CANCELED = 'CANCELED'
}

export class FinancialBillToReceiveCategoryDefault {

  private static CASHIER = { code: '@0001', name: 'CAIXA' };
  private static PURCHASE = { code: '@0002', name: 'COMPRA' };
  private static TRANSFER = { code: '@0003', name: 'TRANSFERÊNCIA' };

  public static getCategory(origin: EFinancialBillToReceiveOrigin): IFinancialBillToReceive['category'] {
    return FinancialBillToReceiveCategoryDefault[origin];
  }
}
