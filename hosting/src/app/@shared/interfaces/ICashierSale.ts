import { IOperator } from "./_auxiliaries/IOperator";
import { IFinancialBillToReceive } from "./IFinancialBillToReceive";
import { EPersonalDocument } from "../enum/EPersonalDocument";
import { EBusinessDocument } from "../enum/EBusinesslDocument";

export interface ICashierSale {
  _id?: string;
  code?: (number | string); // Number: Database | String: View
  requestCode?: (number | string); // Number: Database | String: View
  billToReceiveCode?: (number | string); // Number: Database | String: View
  customer?: {
    _id?: string;
    code: string;
    name: string;
    description?: string;
    personalDocument?: {
      type: EPersonalDocument;
      value: string;
    };
    businessDocument?: {
      type: EBusinessDocument;
      value: string;
    };
    phone?: string;
    email?: string;
    address?: string;
  };
  member?: {
    _id?: string;
    code: string;
    name: string;
    description?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  service?: {
    _id: string;
    code: string;
    types?: {
      code: string;
      name: string;
      costPrice: number;
      executionPrice: number;
      customPrice: number;
      codigoTributacao?: string,
      codigo?: string;
      cnae?: string;
      tributes?: any;
    }[];
    additional?: number;
  }
  services?: {
    _id?: string;
    code: string;
    name: string;
    costPrice: number;
    executionPrice: number;
    customCostPrice: number;
    customPrice: number;
    executor?: IOperator; // Técnico responsável específico do serviço
    commission?: {        // Sistema de comissão para serviços
      enabled: boolean;
      type: 'percentage' | 'fixed';
      value: number;
    };
    cnae?: string;
    codigo?: string;
    codigoTributacao?: string;
    tributes?: any;
  }[];
  products: {
    _id: string;
    code: string;
    name: string;
    serialNumber?: string;
    commercialUnit: {
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
     /**
     * Commission settings for the sold product. If enabled, reports
     * will calculate the commission value based on these parameters.
     */
      commission?: {
        type: 'percentage' | 'fixed';
        value: number;
        enabled: boolean;
      };
  }[];
  paymentMethods?: {
    _id: string;
    code: string;
    name: string;
    value: number;
    note?: string;
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
  balance: {
    subtotal: {
      products: number;
      services?: number;
      discount?: number;
      fee?: number;
    };
    total: number;
  };
  billToReceive?: {
    config: IFinancialBillToReceive;
    installment: number;
    total: number;
  };
  status?: ECashierSaleStatus; // Optional only update
  origin?: ECashierSaleOrigin; // Optional only update
  operator?: IOperator;
  owner?: string; // Store ID
  registerDate?: string;
  modifiedDate?: string;
  paymentDate?: string;
  warranty?: string; // Optional warranty detail
}

export enum ECashierSaleStatus {
  PENDENT = 'PENDENT',
  CONCLUDED = 'CONCLUDED',
  CANCELED = 'CANCELED'
}

export enum ECashierSaleOrigin {
  CASHIER = 'CASHIER',
  REQUEST = 'REQUEST',
  SERVICE_ORDER = 'SERVICE_ORDER',
  CRM = 'CRM'
}
