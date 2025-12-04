import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
//import { PublicRegistrationComponent } from './public/registration/public-registration.component';


// Components
import { PagesComponent } from '@pages/pages.component';
import { LoginComponent } from '@auth/login/login.component';
import { RecoverPasswordComponent } from '@auth/recover-password/recover-password.component';

// Guards
import { MainGuard } from './main/main.guard';
import { AuthGuard } from '@guards/auth.guard';
import { PagesGuard } from '@guards/pages.guard';
import { StoreGuard } from '@guards/store.guard';

// Translation
//import { routingTranslation as translation } from './pages/pages.translation';
import { routingTranslation } from './pages/pages.translation';
const translation = routingTranslation();

// Arquivo: app.routing.ts
// Localização: src/app/app.routing.ts
// ADICIONE a rota do CRM após o dashboard (linha ~41):

const routes: Routes = [
  {
    path: 'registro/:tenantId',
    loadChildren: () => import('./public/public.module').then(m => m.PublicModule)
  },
  {
    path: ':tenantId/registro-publico',
    loadChildren: () => import('./public/public.module').then(m => m.PublicModule)
  },
  {
    path: 'super-admin',
    loadChildren: () => import('./admin/super-admin/super-admin.module').then(m => m.SuperAdminModule),
  },
  {
    path: '',
    canActivate: [MainGuard],
    canActivateChild: [MainGuard],
    loadChildren: () => import('./main/main.module').then(m => m.MainModule),
  },
  {
    path: ':store',
    canActivate: [StoreGuard],
    component: PagesComponent,
    children: [

      {
        path: translation.login, canActivate: [AuthGuard],
        component: LoginComponent
      },
      {
        path: translation.recoverPassword, canActivate: [AuthGuard],
        component: RecoverPasswordComponent
      },
      {
        path: translation.dashboard, canActivate: [PagesGuard], canActivateChild: [PagesGuard],
        loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      // ⭐ ADICIONE ESTA ROTA DO CRM AQUI
      {
        path: translation.crm, canActivate: [PagesGuard], canActivateChild: [PagesGuard],
        loadChildren: () => import('./pages/crm/crm.module').then(m => m.CrmModule)
      },
      {
        path: translation.requests, canActivate: [PagesGuard], canActivateChild: [PagesGuard],
        loadChildren: () => import('./pages/requests/requests.module').then(m => m.RequestsModule)
      },
      {
        path: translation.cashier, canActivate: [PagesGuard], canActivateChild: [PagesGuard],
        loadChildren: () => import('./pages/cashier/cashier.module').then(m => m.CashierModule)
      },
      {
        path: translation.service, canActivate: [PagesGuard], canActivateChild: [PagesGuard],
        loadChildren: () => import('./pages/services/services.module').then(m => m.ServicesModule)
      },
      {
        path: translation.stock, canActivate: [PagesGuard], canActivateChild: [PagesGuard],
        loadChildren: () => import('./pages/stock/stock.module').then(m => m.StockModule)
      },
      {
        path: translation.financial, canActivate: [PagesGuard], canActivateChild: [PagesGuard],
        loadChildren: () => import('./pages/financial/financial.module').then(m => m.FinancialModule)
      },
      {
        path: translation.registers, canActivate: [PagesGuard], canActivateChild: [PagesGuard],
        loadChildren: () => import('./pages/registers/registers.module').then(m => m.RegistersModule)
      },
      {
        path: translation.fiscal, canActivate: [PagesGuard], canActivateChild: [PagesGuard],
        loadChildren: () => import('./pages/fiscal/fiscal.module').then(m => m.FiscalModule)
      },
      {
        path: translation.reports, canActivate: [PagesGuard], canActivateChild: [PagesGuard],
        loadChildren: () => import('./pages/reports/reports.module').then(m => m.ReportsModule)
      },
      {
        path: translation.informations, canActivate: [PagesGuard], canActivateChild: [PagesGuard],
        loadChildren: () => import('./pages/informations/informations.module').then(m => m.InformationModule)
      },
      {
        path: translation.settings, canActivate: [PagesGuard], canActivateChild: [PagesGuard],
        loadChildren: () => import('./pages/settings/settings.module').then(m => m.SettingsModule)
      },
      {
        path: '**', redirectTo: 'dashboard'
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
