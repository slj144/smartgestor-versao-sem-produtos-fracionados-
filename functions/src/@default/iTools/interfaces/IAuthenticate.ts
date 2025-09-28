import { TLanguage } from "../types/TLanguage";

export interface IAuthenticate{

  createUser(user?: IAuthenticateData): Promise<any>;

  updateUser(user?: IAuthenticateData): Promise<any>;

  deleteUser(user?: IAuthenticateData): Promise<any>;

  recoverPassword(email?: string, language?: TLanguage): Promise<any>;

  login(email: string, password: string, adminkey?: string): Promise<any>;

  logout(): Promise<any>;

}

export interface IAuthenticateData{
  _id?: string;
  email?: string;
  password?: string;
}