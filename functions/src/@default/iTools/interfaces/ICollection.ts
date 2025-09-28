import { IDocumentResult, IDocumentChange, IDocument } from './IDocument';
import { IGroupBy, ISelectFields } from './IGroupBy';
import { TOpertators } from '../types/TOperators';
import { IAggregate } from './IAggregate';
import { IOrderBy } from './IOrderBy';
import { IIndex } from './IIndex';
import { TDeleteMode } from '../types/TDeleteMode';

export interface ICollection{

  id: string;

  get(): Promise<ICollectionResult>;

  onSnapshot(callback: (_: any)=> void, error?: (_: any)=> void): string;

  clearSnapshot(id: string);

  // update(data: any, options?: any): Promise<any>;

  rename(newName: string): Promise<any>;

  delete(mode?: TDeleteMode): Promise<any>;
   
  limit(limit: any): this;

  startAt(startAt: any): this;

  startAfter(startAfter: any): this;

  endAt(endAt: any): this;

  orderBy(orderBy: IOrderBy): this;

  where(and: IAggregate["match"]["$and"], test?: any): this;

  or(or: IAggregate["match"]["$or"]): this;

  groupBy(or: IGroupBy, selectFields?: ISelectFields): this;

  count(): this;

  doc(docName?: string): IDocument;

  filter(fn: ()=> boolean): this;

  getIndexes(): Promise<any>;

  createIndexes(data: IIndex[]): Promise<any>;

  deleteIndex(name: string): Promise<any>;

}


export interface ICollectionResult{
  id: string;
  ref: ICollection;
  docs: IDocumentResult[];
  changes: ()=> IDocumentChange[];
}