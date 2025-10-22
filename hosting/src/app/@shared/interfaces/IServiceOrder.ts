import { IOperator } from './_auxiliaries/IOperator';
import { EPersonalDocument } from '../enum/EPersonalDocument';
import { EBusinessDocument } from '../enum/EBusinesslDocument';

export interface IServiceOrder {
  _id?: string;
  code?: (number | string); // Number: Database | String: View
  saleCode?: (number | string); // Number: Database | String: View
  entryDate: string;
  deliveryDate?: string;
  description: string;
  execution: {
    type: EServiceOrderExecutionType;
    provider?: {
      _id: string;
      code: string;
      name: string;
      phone?: string;
      email?: string;
      address?: string;
    };
  };
  customer: {
    _id?: string;
    code: string;
    name: string;
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
  vehicle?: {
    code?: (number | string);
    plate: string;
    model: string;
    color: string;
    mileage: number;
    chassis?: string;
  };
  photosBefore?: string[];
  photosAfter?: string[];
  executor?: IOperator;
  services?: {
    _id?: string;
    code: string;
    name: string;
    costPrice: number;
    executionPrice: number;
    customCostPrice: number;
    customPrice: number;
    department?: {
      _id?: string;
      code: number | string;
      name: string;
    };
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
    department?: {
      _id?: string;
      code: number | string;
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
      services?: number;
      discount?: number;
      fee?: number;
    };
    total: number;
  };
  scheme?: {
    data: {
      type: string;
      status: any[];
    };
    allocProducts: string;
    status: string;
  },
  equipment?: {
    model?: string;
    brand?: string;
    password?: string;
    serialNumber?: string;
  };
  checklist?: {
    name: string;
    subChecklists?: {
      name: string;
    }[];
  }[];
  hasChecklist: boolean;
  isAllocProducts: boolean;
  serviceStatus: EServiceOrderStatus;
  paymentStatus: EServiceOrderPaymentStatus;
  operator?: IOperator;
  owner?: string; // Store IDs
  registerDate?: string;
  modifiedDate?: string;
  warranty?: string; // Optional warranty detail
}

export enum EServiceOrderExecutionType {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL'
}

export enum EServiceOrderStatus {
  PENDENT = 'PENDENT',
  CONCLUDED = 'CONCLUDED',
  CANCELED = 'CANCELED'
}

export enum EServiceOrderPaymentStatus {
  PENDENT = 'PENDENT',
  CONCLUDED = 'CONCLUDED',
  CANCELED = 'CANCELED'
}

export class CServiceScheme {

  public static technicalAssistance = {
    data: {
      type: "technicalAssistance",
      status: ["BUDGET", "AUTORIZATION", "PARTS", "REPAIR", "CONCLUDED", "WITHDRAWAL"],
    },
    allocProducts: "AUTORIZATION",
    status: ""
  }

  public static mechanic = {
    data: {
      type: "mechanic",
      status: ["BUDGET", "AUTORIZATION", "PARTS", "CONCLUDED"],
    },
    allocProducts: "AUTORIZATION",
    status: ""
  }
};
