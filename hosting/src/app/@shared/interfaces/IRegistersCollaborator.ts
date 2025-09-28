import { IPermissions } from './_auxiliaries/IPermissions';

export interface IRegistersCollaborator {
  _id?: string;
  id?: string;
  code?: number | string;
  email: string;
  name: string;
  username: string;
  permissions?: IPermissions;
  owner: string; // Store ID
  isSendEmailToStore?: boolean;

  image: string;
  address?: {
    country?: string,
    state: string,
    addressLine: string,
    postalCode: string,
    city: string;
  };  
  contacts?: {
    phone: string,
    whatsapp: string,
  };
  usertype: string;
  allowAccess: boolean;
}