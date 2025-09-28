export interface IFunctions{
  
  call(fn: string, data?: any): Promise<any>;
}