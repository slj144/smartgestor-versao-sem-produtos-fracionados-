import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Utilities } from '@shared/utilities/utilities';

@Injectable({ providedIn: 'root' })
export class MainGuard  {

  constructor(
    private authService: AuthService,
    private router: Router
  ){}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

    if (this.authService.isLogged()){
      this.router.navigate([Utilities.currentLoginData.projectId + "/pages"]);
    }
    return !this.authService.isLogged();
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

    if (this.authService.isLogged()){
      this.router.navigate([Utilities.currentLoginData.projectId + "/pages"]);
    }
    
    return !this.authService.isLogged();
  }
}