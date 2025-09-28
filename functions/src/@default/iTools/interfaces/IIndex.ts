export interface IIndex{
  unique?: boolean,
  sparse?: boolean,
  key: {[key: string]: 0 | 1},
  name?: string,
}