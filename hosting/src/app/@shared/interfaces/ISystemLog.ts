import { IOperator } from './_auxiliaries/IOperator';

export interface ISystemLog {
  _id?: string;
  code?: (number | string); // Number: Database | String: View
  data: {
    referenceCode?: (number | string); // Number: Database | String: View
    type: ESystemLogType;
    action: ESystemLogAction;
    note: string;
  }[];
  operator?: IOperator;
  owner?: string; // Store ID
  registerDate?: string;
}

export enum ESystemLogType {
  Auth = 'Auth',
  CashierControls = 'CashierControls',
  CashierSales = 'CashierSales',
  CashierInflows = 'CashierInflows',
  CashierInflowCategories = 'CashierInflowCategories',
  CashierOutflows = 'CashierOutflows',
  CashierOutflowCategories = 'CashierOutflowCategories',
  Requests = 'Requests',
  SocialDemands = 'SocialDemands',  
  Projects = 'Projects',
  Crafts = 'Crafts',
  Requirements = 'Requirements',
  Agenda = 'Agenda',
  Events = 'Events',
  Kitchen = 'Kitchen',
  Menu = 'Menu',
  Groups = 'Groups',
  Classrooms = 'Classrooms',
  Tithes = 'Tithes',
  Donations = 'Donations',
  ServiceOrders = 'ServiceOrders',  
  StockProducts = 'StockProducts', 
  StockProductCommercialUnit = 'StockProductCommercialUnit',
  StockProductCategories = 'StockProductCategories', 
  StockProductDepartments = 'StockProductDepartments',
  StockPurchases = 'StockPurchases',
  StockTransfers = 'StockTransfers',
  StockLogTypes = 'StockLogTypes',
  FinancialBillsToPay = 'FinancesBillsToPay',
  FinancialBillsToPayCategories = 'FinancesBillsToPayCategories',
  FinancialBillsToReceive = 'FinancesBillsToReceive',
  FinancialBillsToReceiveCategories = 'FinancesBillsToReceiveCategories',
  FinancialBankAccount = 'FinancesBankAccount',
  FinancialBankAccountTransaction = 'FinancesBankAccountTransaction',  
  Fiscal = "Fiscal",
  RegistersCustomers = 'RegistersCustomers',
  RegistersMembers = 'RegistersMembers',
  RegistersVoters = 'RegistersVoters',
  RegistersCollaborators = 'RegistersCollaborators',  
  RegistersCollaboratorProfiles = "RegistersCollaboratorProfiles",
  RegistersCraftsRecipient = 'RegistersCraftsRecipient',
  RegistersBranches = 'RegistersBranches',
  RegistersCarriers = 'RegistersCarriers',
  RegistersProviders = 'RegistersProviders',
  RegistersPartners = 'RegistersPartners',
  RegistersServices = 'RegistersServices',
  RegistersPaymentMethods = 'RegistersPaymentMethods',
  Informations = 'Informations',
  Settings = 'Settings'
}

export enum ESystemLogAction {
  REGISTER = 'REGISTER',
  UPDATE = 'UPDATE',
  DELETION = 'DELETION',
  CANCELLATION = 'CANCELLATION'
}
