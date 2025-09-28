
export interface IMenuOptions {
  id: string;
  title?: string;
  route?: string;
  icon?: string;
  subItems?: IMenuOptions[];
  active?: boolean;
  hidden?: boolean;
  pack?: ('eva' | 'fa');
}
