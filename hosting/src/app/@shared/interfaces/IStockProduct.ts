// ARQUIVO: src/app/shared/interfaces/stock/IStockProduct.ts
// FUNCIONALIDADE: Interface que define a estrutura de dados de um produto no estoque
// Esta interface é usada em todo o sistema para tipar objetos de produto

import { IStockLog } from './IStockLog';
import { IStockProductDepartment } from './IStockProductDepartment';

export interface IStockProduct {
  _id?: string;
  _isDisabled?: boolean;
  code?: (string | number);
  barcode: string;
  name: string;
  internalCode?: string;
  description?: string;
  serialNumber?: string;
  batch?: string;
  expirationDate?: string;
  thumbnail?: {
    url: (string | { newFile: File, oldFile: string });
    type: string;
    size: number;
  };
  // NOVO: Galeria de imagens para o catálogo
  gallery?: Array<{
    url: string;
    name?: string;
    order?: number;
  }>;
  commercialUnit: {
    _id: string;
    code: string;
    name: string;
    symbol: string;
  };
  category: {
    _id: string;
    code: string;
    name: string;
  };
  department?: IStockProductDepartment;
  provider?: {
    _id: string;
    code: string;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    lastSupply?: string;
  };
  costPrice: number;
  salePrice: number;
  alert: number;
  quantity: (number | string);

  // 🎯 NOVOS CAMPOS DE COMISSÃO
  commission?: {
    type: 'percentage' | 'fixed';  // Tipo da comissão: porcentagem ou valor fixo
    value: number;                  // Valor da comissão (% ou R$)
    enabled: boolean;               // Se a comissão está ativa para este produto
  };

  ncm?: string;
  cest?: string;
  nve?: string;
  codigoBeneficioFiscal?: string;
  tributes?: any;
  specialization?: string;
  fuel?: {
    codigoAnp: string;
    descricaoAnp: string;
  };
  remedy?: {
    codigoAnvisa: string,
    valorMaximo: number,
    motivoInsencaoAnvisa?: string;
  }
  branches?: {
    [key: string]: {
      tributes?: any;
      costPrice?: number;
      salePrice?: number;
      alert?: number;
      quantity: number;
      modifiedDate?: string;
      // 🎯 Comissão específica por filial (opcional)
      commission?: {
        type: 'percentage' | 'fixed';
        value: number;
        enabled: boolean;
      };
    }
  };
  priceList?: {
    [key: string]: {
      costPrice?: number;
      salePrice?: number;
    }
  };
  stockAdjustment?: IStockLog;
  selected?: boolean;
  selectedItems?: number;
  registerDate?: string;
  modifiedDate?: string;
}
