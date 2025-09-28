import { ICollection } from './ICollection';
import { IBatch } from './IBatch';

export interface ITest{

  batch(): IBatch;
  getCollections(): Promise<any>;
  collection(collName: string): ICollection;
  backup(): Promise<any>;
  deleteBackup(): Promise<any>;
  restoreBackup(mode: "manual" | "system", collections?: string[], collectionsData?: {[key: string]: any[]}): Promise<any>;
  importData(collectionsData: {[key: string]: any[]}, collections?: string[]): Promise<any>;
}