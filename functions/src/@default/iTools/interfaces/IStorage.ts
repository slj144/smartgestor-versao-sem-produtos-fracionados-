import { IUploadResult } from './IUploadResult';
import { IPath } from './IPath';
import { IUpload } from './IUpload';

export interface IStorage{

  listDir(path: string): Promise<any>;

  delete(paths: string[]): Promise<any>;

  upload(settings: IUpload[]): Promise<IUploadResult>;

  path(path: string): IPath;
}