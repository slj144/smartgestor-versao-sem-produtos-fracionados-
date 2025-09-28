import { Injectable } from '@angular/core';

// Settings
import { Utilities } from '@shared/utilities/utilities';

@Injectable({ providedIn: 'root' })
export class MainService {

  constructor(
  ) {
    this.checkLogout();
  }
  
  public isLogged(): boolean {

    if (!Utilities.windowID) {
      MainService.clearAuthData();
      return false;
    }

    const currentLogin = Utilities.currentLoginData;

    if (currentLogin.storeId == "0" || currentLogin.storeId == "undfined" || !currentLogin.storeId) {
      MainService.clearAuthData();
      return false;
    }

    if (currentLogin.usertype && currentLogin.email && currentLogin.username && currentLogin.isLogged && !currentLogin.firstName && !currentLogin.lastName && window.localStorage.getItem("itoolsAuthenticate")) {
      return true;
    } else {
      MainService.clearAuthData();
      return false;
    }
  }

  private checkLogout(){

    if (this.isLogged()){

      const timer = setInterval(() => {

        if (!Object.values(Utilities.currentLoginData).length) {

          clearInterval(timer);

          (<any>window).id = undefined;
          window.location.href = window.location.href;
        }
      });
    }
  }

  public static clearAuthData() {

    const logins = Utilities.logins;
    delete logins[Utilities.currentLoginData.userId];
    
    window.localStorage.setItem("logins", JSON.stringify(logins));
  }

}
