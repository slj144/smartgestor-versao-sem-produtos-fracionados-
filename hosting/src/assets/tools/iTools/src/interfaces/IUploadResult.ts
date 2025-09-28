export interface IUploadResult{
  status: boolean;
  uploadedUrls: {
    path: string;
    getDownloadUrl: ()=>Promise<any>;
  }[];
  notUploadedUrls: {path: string, fullPath: string}[]
}