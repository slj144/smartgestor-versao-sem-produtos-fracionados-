export interface IPath{
  path: string;
  getDownloadUrl: ()=> Promise<any>;
  delete: ()=> Promise<any>;
  upload: (data: ArrayBuffer) => Promise<any>;
}