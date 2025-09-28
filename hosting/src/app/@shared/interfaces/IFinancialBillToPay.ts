import { IOperator } from './_auxiliaries/IOperator';

export interface IFinancialBillToPay {
  _id?: string;
  code?: (number | string); // Number: Database | String: View
  referenceCode?: (number | string); // Number: Database | String: View
  origin: EFinancialBillToPayOrigin;
  beneficiary?: {
    _id: string;
    code: string;
    name: string;
    type: EFinancialBillToPayBeneficiaryType;
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
    paidAmount?: number;
    paymentDate?: string;
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
    status: EFinancialBillToPayInstallmentStatus;
  }[];
  description: string;
  status: EFinancialBillToPayStatus;
  paidInstallments: number;
  totalInstallments: number;
  currentInstallment: number;
  paid: number;
  amount: number;
  operator?: IOperator;
  owner?: string; // Store ID
  registerDate?: string;
  modifiedDate?: string;
}

export enum EFinancialBillToPayOrigin {
  FINANCIAL = 'FINANCIAL',
  CASHIER = 'CASHIER',
  PURCHASE = 'PURCHASE',
  TRANSFER = 'TRANSFER'
}

export enum EFinancialBillToPayBeneficiaryType {
  CUSTOMER = 'CUSTOMER',
  PROVIDER = 'PROVIDER',
  STORE = 'STORE'
}

export enum EFinancialBillToPayInstallmentStatus {
  PENDENT = 'PENDENT',
  CONCLUDED = 'CONCLUDED'
}

export enum EFinancialBillToPayStatus {
  PENDENT = 'PENDENT',
  CONCLUDED = 'CONCLUDED',
  CANCELED = 'CANCELED'
}

export class FinancialBillToPayCategoryDefault {

  private static PURCHASE = { code: '@0001', name: 'COMPRA' };
  private static TRANSFER = { code: '@0002', name: 'TRANSFERÊNCIA' };
  private static CASHIER = { code: '@0003', name: 'CAIXA' };

  public static getCategory(origin: EFinancialBillToPayOrigin): IFinancialBillToPay['category'] {
    return FinancialBillToPayCategoryDefault[origin];
  }
}
