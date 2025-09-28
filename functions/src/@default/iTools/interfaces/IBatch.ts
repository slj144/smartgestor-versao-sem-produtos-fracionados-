import { IUpdateOptions } from './IUpdateOptions';
import { IDocument } from './IDocument';
import { IBatchOperations } from './IBatchOperations';
import { ICommitResult } from './ICommitResult';

export interface IBatch{
  read(settings: IBatchOperations["read"]): void;
  update(settings: IBatchOperations["update"] | IDocument, data: any, options?: IUpdateOptions): number;
  delete(settings: IBatchOperations["delete"] | IDocument): void;
  commit(): Promise<ICommitResult>;
  commitsLength(): number;
  getOperations(): any[];
}