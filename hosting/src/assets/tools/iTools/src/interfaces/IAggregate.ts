import { TOpertators } from '../types/TOperators';

export interface IAggregate{
  limit?: any;
  skip?: any;
  sort?: any;
  count?: string;
  group?: any;
  addFields?: any;
  match?: {
    // field?: string,
    // operator?: TOpertators,
    // value?: any;
    // type?: string;
    $and?: {field: string, operator: TOpertators, value: any, arrayField?: string}[];
    $or?: {field: string, operator: TOpertators, value: any, arrayField?: string}[];
  }
}