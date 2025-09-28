import { EOperationDB } from "../enums/EOperation";


export interface IOperationREAD {
  collName: string;
  docName?: string;  
  aggregate?: {
    match?: any;
    sort?: any;
    limit?: number;
  };
  query?: any;
  operation: EOperationDB.READ;
}

export interface IOperationUPSET {
  collName: string;
  docName?: string;
  data: any;
  options: {
    merge: boolean;
  };  
  operation: EOperationDB.UPSERT;
}


export interface IOperationDELETE {
  collName: string;
  docName?: string;
  query?: any;
  operation: EOperationDB.DELETE;
}


export interface IOperationTRANSACTION {
  batch: (IOperationREAD | IOperationUPSET | IOperationDELETE)[];
  operation: EOperationDB.TRANSACTION;
}
