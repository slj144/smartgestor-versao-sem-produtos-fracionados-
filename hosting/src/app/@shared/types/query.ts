import { TOpertators } from '@itools/types/TOperators';

export type query = { 
  where?: { 
    field: string;
    operator: TOpertators; 
    value: any; 
  }[];
  orderBy?: { 
    [key: string]: (1|-1);
  }; 
  or?: { 
    field: string;
    operator: TOpertators; 
    value: any; 
  }[];
  start?: number;
  limit?: number;
  data?: any;
  groupBy?: string;
  productReport?:{
    provider?: (string | number);
    category?: (string | number);
    products?: any[];
  }
};
