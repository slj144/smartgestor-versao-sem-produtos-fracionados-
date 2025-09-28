import { TDeleteMode } from '../types/TDeleteMode';
import { TOpertators } from '../types/TOperators';

export interface IBatchOperations{

  read?: {
    collName: string;
    docName?: string;
    aggregate?: {
      match?: any;
      sort?: any;
      limit?: number;
    };
    query?: any;
  };

  delete?: {
    collName: string,
    docName?: string;
    mode?: TDeleteMode,
    where?: {field: string, operator: TOpertators, value: any}[]  
  };

  update?: {
    collName: string,
    docName?: string;
    where?: {field: string, operator: TOpertators, value: any}[]
  };

}
