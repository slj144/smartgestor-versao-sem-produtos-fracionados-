import { IOperator } from './_auxiliaries/IOperator';

export interface IStockLog {
  _id?: string;
  code?: (number | string); // Number: Database | String: View
  originReferenceCode?: (number | string); // Sale Code || Purchase Code || Transfer Code
  data: {
    referenceCode?: (number | string); // Product Code    
    adjustmentType?: {
      _id: string;
      code: string;
      name: string;
    };
    quantity: number;
    operation: EStockLogOperation;
    note: string;
  }[];
  action?: EStockLogAction;
  operator?: IOperator;
  owner?: string; // Store ID
  registerDate?: string;
}

export enum EStockLogAction {
  ADJUSTMENT = 'ADJUSTMENT',
  TRANSFER = 'TRANSFER',
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  SERVICE = 'SERVICE',
  REQUEST = 'REQUEST',
  IMPORT = 'IMPORT',
  IMPORTXML = 'IMPORTXML'
}

export enum EStockLogOperation {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT'
}