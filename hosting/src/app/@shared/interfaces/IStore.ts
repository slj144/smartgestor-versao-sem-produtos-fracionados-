import { IRegistersCollaborator } from "./IRegistersCollaborator";

export interface IStore {
  _id: string;
  name: string;
  datetime?: string;
  updateTime?: string;
  billingName: string;
  cnpj: string;
  cnpjFiscal?: string;
  image: string;
  limitBranches?: number;
  limitUsers?: number;
  /** Número máximo de dispositivos autorizados */
  limitDevices?: number;


  rootUser?: IRegistersCollaborator;

  address: {
    country?: string,
    state: string,
    addressLine: string,
    postalCode: string,
    city: string;
  };

  contacts: {
    phone: string,
    email: string,
    whatsapp: string,
  },
}
