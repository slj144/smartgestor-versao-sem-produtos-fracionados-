import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { SuperAdminAuthService } from './super-admin-auth.service';

@Injectable({
    providedIn: 'root'
})
export class SuperAdminGuard implements CanActivate {

    constructor(
        private authService: SuperAdminAuthService,
        private router: Router
    ) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean {
        // Usa a verificação síncrona para não bloquear
        if (this.authService.isAuthenticatedSync()) {
            return true;
        }

        // Não está autenticado, redireciona para o login
        this.router.navigate(['/super-admin/login']);
        return false;
    }
}