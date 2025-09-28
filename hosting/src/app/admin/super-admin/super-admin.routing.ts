import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SuperAdminComponent } from './super-admin.component';
import { SuperAdminLoginComponent } from './login/super-admin-login.component';
import { SuperAdminGuard } from './super-admin.guard';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: SuperAdminLoginComponent
    },
    {
        path: 'dashboard',
        component: SuperAdminComponent,
        canActivate: [SuperAdminGuard]
    },
    {
        path: '**',
        redirectTo: 'dashboard'
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SuperAdminRoutingModule { }