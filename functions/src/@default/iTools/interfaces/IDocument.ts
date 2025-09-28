import { ICollection } from './ICollection';

export interface IDocument{

  collection: ICollection;
  id: string;

  get(): Promise<IDocumentResult>;

  onSnapshot(callback: (_: IDocumentChange)=> void, p1?: any, p2?: any): string;

  clearSnapshot(id: string);

  update(data: any, options?: any): Promise<any>;

  delete(): Promise<any>;
}


export interface IDocumentChange{
  id: string
  type: "ADD" | "UPDATE" | "DELETE";
  ref: IDocument;
  data: ()=> any;
}

export interface IDocumentResult{
  id: string
  ref: IDocument;
  data: ()=> any;
}