import { IOperator } from './_auxiliaries/IOperator';
import { EBusinessDocument } from '../enum/EBusinesslDocument';
import { EPersonalDocument } from '../enum/EPersonalDocument';
import { ECashierSaleStatus } from './ICashierSale';

export interface IRequest {
  _id?: string;
  code?: (number | string); // Number: Database | String: View
  saleCode?: (number | string); // Number: Database | String: View
  scheme?: (number | string)[]; // Number: Database | String: View
  customer?: {
    _id: string;
    code: string;
    name: string;
    description?: string;
    personalDocument?: {
      type: EPersonalDocument,
      value: string
    };
    businessDocument?: {
      type: EBusinessDocument,
      value: string
    };
    phone?: string;
    email?: string;
    address?: string;
  };
  member?: {
    _id: string;
    code: string;
    name: string;
    description?: string;
    phone?: string;
    email?: string;
    address?: string;
  }; 
  products: {
    _id: string;
    code: string;
    name: string;
    serialNumber?: string;
    type: {
      _id: string;
      code: string;
      name: string;
    };
    category: {
      _id: string;
      code: string;
      name: string;
    };
    costPrice: number;
    salePrice: number;
    unitaryPrice: number;    
    quantity: number;
    discount?: number;
    fee?: number;   
  }[]; 
  balance: {
    subtotal: {
      products: number;
      discount?: number;
      fee?: number;
    };
    total: number;
  };
  requestStatus: ERequestStatus;
  saleStatus: ECashierSaleStatus;
  operator?: IOperator;
  owner?: string; // Store ID   
  registerDate?: string;
  modifiedDate?: string;
}

export enum ERequestStatus {
  PENDENT = 'PENDENT',
  CONCLUDED = 'CONCLUDED',
  CANCELED = 'CANCELED'
}
