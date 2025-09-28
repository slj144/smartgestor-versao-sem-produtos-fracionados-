import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

// Services
import { AuthService } from '@auth/auth.service';

// Interfaces
import { IPermissions } from '@shared/interfaces/_auxiliaries/IPermissions';

// Utilities
import { Utilities } from '@shared/utilities/utilities';

@Injectable({ providedIn: 'root' })
export class StoreGuard  {

  constructor(
    private authService: AuthService,
    private router: Router,
  ){}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean{

    const path = (route.pathFromRoot[route.pathFromRoot.length - 1]["_routerState"]["url"]);
    const currentLogin = Utilities.currentLoginData;
    const permissions = currentLogin.permissions as IPermissions;

    this.setupStartRoute(permissions, path);
    
    return true;
  }

  private setupStartRoute(permissions: any, path: string) {

    let redirectPath = "";

    if (permissions) {

      if (permissions.dashboard != null) {  
        redirectPath = "dashboard";
      }
      else if (permissions.cashier != null) {  
        redirectPath = "caixa";
      }
      else if (permissions.requests != null) {    
        redirectPath = "pedidos";
      }
      else if (permissions.serviceOrders != null) {        
        redirectPath = "ordens-servico";
      }
      else if (permissions.informations != null) {
        redirectPath = "loja";
      }
      else if (permissions.fiscal != null) {  
        redirectPath = "notas-fiscais";
      }
      else if (permissions.registers != null) {  
        redirectPath = "registros";
      }
      else if (permissions.finances != null) {  
        redirectPath = "financeiro";
      }
      else if (permissions.reports != null) {  
        redirectPath = "relatorios";
      }
    } else {  
      redirectPath = "dashboard";
    }

    const isRedirect = path.split("/").length === 2;

    if (isRedirect && this.authService.isLogged()) {
      this.router.navigate(["/" + Utilities.currentLoginData.projectId + "/"+ redirectPath]);
    } else if (isRedirect && !this.authService.isLogged()) {
      this.router.navigate(["/" + Utilities.projectId + "/login/"]);
    }

    return window.location.protocol + "//" + window.location.host + Utilities.projectId + "/login/";
  }

}
