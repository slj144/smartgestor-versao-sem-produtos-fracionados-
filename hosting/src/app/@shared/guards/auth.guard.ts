import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { Injectable } from '@angular/core';
import { Utilities } from '@shared/utilities/utilities';

@Injectable({ providedIn: 'root' })
export class AuthGuard  {

  constructor(
    private authService: AuthService,
    private router: Router
  ){}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

    if (this.authService.isLogged()){
      this.router.navigate(['/' + Utilities.currentLoginData.projectId]);
    }

    return !this.authService.isLogged();
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

    if (this.authService.isLogged()){
      this.router.navigate(['/' + Utilities.currentLoginData.projectId]);
    }
    
    return !this.authService.isLogged();
  }
}