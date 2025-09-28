export interface IGroupBy{

  [key: string]: {
    $sum?: any;
    $push?: "$$ROOT";
    $avg?: string;
    $min?: string;
    $max?: string;
    $first?: string;
    $last?: string;
  } | string;

  _id: string;
};


export interface ISelectFields{
  [key: string]: boolean;
}