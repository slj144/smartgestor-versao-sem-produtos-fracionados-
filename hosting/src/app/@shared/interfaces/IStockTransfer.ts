import { EBusinessDocument } from '../enum/EBusinesslDocument';
import { IFinancialBillToPay } from './IFinancialBillToPay';
import { IFinancialBillToReceive } from './IFinancialBillToReceive';
import { IOperator } from './_auxiliaries/IOperator';

export interface IStockTransfer {
  _id?: string;
  code?: (number | string); // Number: Database | String: View
  billToReceiveCode?: (number | string); // Number: Database | String: View
  billToPayCode?: (number | string); // Number: Database | String: View
  origin: {
    _id: string;
    name: string;
    businessDocument?: {
      type: EBusinessDocument;
      value: string;
    };
    phone?: string;
    email?: string;
    address?: string;
  };
  destination: {
    _id: string;
    name: string;
    businessDocument?: {
      type: EBusinessDocument;
      value: string;
    };    
    phone?: string;
    email?: string;
    address?: string;
  };
  products: {
    _id: string;
    code: string;
    name: string;
    serialNumber?: string;
    quantity: number;
    costPrice: number;
    averageCost: number;
    salePrice: number;
  }[];
  billToReceive?: IFinancialBillToReceive; // Non-storable property
  billToPay?: IFinancialBillToPay; // Non-storable property
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
  transferStatus: EStockTransferStatus;
  paymentStatus: EStockTransferPaymentStatus;
  transferDate?: string;
  receiptDate?: string;
  operator?: IOperator;
  owner?: string; // Store ID
  registerDate?: string;
  modifiedDate?: string;
}

export enum EStockTransferStatus {
  PENDENT = 'PENDENT',
  CONCLUDED = 'CONCLUDED',
  CANCELED = 'CANCELED'
}

export enum EStockTransferPaymentStatus {
  PENDENT = 'PENDENT',
  CONCLUDED = 'CONCLUDED',
  CANCELED = 'CANCELED'
}
