import { ICollection } from './ICollection';
import { IBatch } from './IBatch';
import { ISCheme } from './IDocumentScheme';

export interface IDatabase{

  getDatabases(): Promise<any>;
  deleteDatabase(): Promise<any>;

  batch(): IBatch;
  getCollections(): Promise<any>;
  collection(collName: string, scheme?: ISCheme): ICollection;
  backup(): Promise<any>;
  deleteBackup(): Promise<any>;
  restoreBackup(mode: "manual" | "system", collections?: string[], collectionsData?: {[key: string]: any[]}): Promise<any>;
  importData(collectionsData: {[key: string]: any[]}, collections?: string[]): Promise<any>;

  getReleaseInfo(variation: string): Promise<any>;
  onReleaseInfo(variation: string, callback?: (_: any)=> void): string;
  clearReleaseInfo(listenerId: string): void;

  registerLog(data: any): Promise<any>;
}