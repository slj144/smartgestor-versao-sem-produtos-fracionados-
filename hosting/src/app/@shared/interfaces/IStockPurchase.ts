import { IFinancialBillToPay } from './IFinancialBillToPay';
import { IOperator } from './_auxiliaries/IOperator';

export interface IStockPurchase {
  _id?: string;
  code?: (number | string); // Number: Database | String: View
  billToPayCode?: (number | string); // Number: Database | String: View
  provider: {
    _id: string;
    code: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  products: {
    _id: string;
    code: string;
    name: string;
    serialNumber?: string;    
    costPrice: number;
    averageCost: number;
    salePrice: number;
    quantity: number;
    department?: {
      _id?: string;
      code: string;
      name: string;
    };
  }[];
  balance: {
    quantity: number;
    total: number;
  };
  attachment?: {
    name: string;
    url: (string | { newFile: File, oldFile: string });
    type: string;
    size: number;
  };
  note?: string;
  billToPay?: IFinancialBillToPay; // Non-storable property
  purchaseStatus: EStockPurchaseStatus;
  paymentStatus: EStockPurchasePaymentStatus;
  purchaseDate?: string;
  receiptDate?: string;
  configuredFromXml?: boolean;
  nf?:{
    serie: number;
    numero: number;
    chave: string;
  };
  operator?: IOperator;
  owner?: string; // Store ID  
  registerDate?: string;
  modifiedDate?: string;
}

export enum EStockPurchaseStatus {
  PENDENT = 'PENDENT',
  CONCLUDED = 'CONCLUDED',
  CANCELED = 'CANCELED'
}

export enum EStockPurchasePaymentStatus {
  PENDENT = 'PENDENT',
  CONCLUDED = 'CONCLUDED',
  CANCELED = 'CANCELED'
}
