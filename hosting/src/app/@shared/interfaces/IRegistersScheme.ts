
export interface IRegistersScheme {
  _id?: string;
  _isDisabled?: boolean;
  code?: (number | string); // Number: Database | String: View
  name: string;
  branches?: any;
  owner?: string; // Store ID
  quantity: number;
  products: {
    name: string;
    code: (number | string);
    quantity: number;
    salePrice: number;
    costPrice: number;
    unitaryPrice?: number;
  }[];
  registerDate?: string;
  modifiedDate?: string;  
}
