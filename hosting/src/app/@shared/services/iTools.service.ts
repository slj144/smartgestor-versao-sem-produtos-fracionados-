import { Injectable } from '@angular/core';
import { iTools } from '../../../assets/tools/iTools';
import { ProjectSettings } from '@assets/settings/company-settings';
import { environment } from '../../../environments/environment.prod';
import { Utilities } from '../utilities/utilities';

@Injectable({ providedIn: 'root' })
export class IToolsService {

  public instance: iTools;

  constructor() {

    this.initialize();
  }


  public auth() {
    return this.instance.auth();
  }

  public functions() {
    return this.instance.functions();
  }

  public database() {
    return this.instance.database();
  }

  public storage() {
    return this.instance.storage();
  }

  /**
    * Aguarda a inicialização do iTools antes de executar operações.
    */
  public async ready(): Promise<void> {
    if ((<any>this.instance).initializeAppPromise?.promise) {
      try {
        await (<any>this.instance).initializeAppPromise.promise;
      } catch {
        // ignore initialization errors here; subsequent calls will handle them
      }
    }
  }
  private initialize() {
    const instance = new iTools();
    this.instance = instance;
    const defaultLogin = {} as any;
    defaultLogin[environment.loginSettings.email] = {
      email: environment.loginSettings.email,
      password: environment.loginSettings.password != null ? environment.loginSettings.password.toString() : environment.loginSettings.password,
      encrypted: false
    };

    const logins = (localStorage.getItem("itoolsAuthenticate") ? JSON.parse(localStorage.getItem("itoolsAuthenticate")) : defaultLogin);
    const loginInfo = logins[Object.values(Utilities.currentLoginData).length > 0 ? Utilities.currentLoginData.email || environment.loginSettings.email : environment.loginSettings.email];

    const init = (info: any) => instance.initializeApp({
      projectId: ProjectSettings.companyID(),
      // adminKey: "0asc4b5e78994q3ad90235",
      developerMode: false,
      email: info.email,
      password: info.password != null ? info.password.toString() : info.password,
      encrypted: !!info.encrypted
    });

    init(loginInfo).catch((err) => {
      console.log(err);
      const fallback = defaultLogin[environment.loginSettings.email];
      if (loginInfo !== fallback) {
        init(fallback).catch((e) => console.log(e));
      }
    });


  }

}