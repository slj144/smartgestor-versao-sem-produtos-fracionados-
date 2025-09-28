
export interface IFinancialBillToPayCategory {
  _id?: string;
  code?: (number | string); // Number: Database | String: View
  name: string;
  owner?: string; // Store ID
  registerDate?: string;
  modifiedDate?: string;
}
