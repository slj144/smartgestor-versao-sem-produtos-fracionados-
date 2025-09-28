// Arquivo: pages.routing.ts
// Localização: src/app/pages/pages.routing.ts

import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

// Componente
import { PagesComponent } from './pages.component';

const routes: Routes = [
  {
    path: '',
    component: PagesComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'pedidos',
        loadChildren: () => import('./requests/requests.module').then(m => m.RequestsModule)
      },
      {
        path: 'caixa',
        loadChildren: () => import('./cashier/cashier.module').then(m => m.CashierModule)
      },
      {
        path: 'servicos',
        loadChildren: () => import('./services/services.module').then(m => m.ServicesModule)
      },
      {
        path: 'estoque',
        loadChildren: () => import('./stock/stock.module').then(m => m.StockModule)
      },
      {
        path: 'financeiro',
        loadChildren: () => import('./financial/financial.module').then(m => m.FinancialModule)
      },
      {
        path: 'registros',
        loadChildren: () => import('./registers/registers.module').then(m => m.RegistersModule)
      },
      {
        path: 'notas-fiscais',
        loadChildren: () => import('./fiscal/fiscal.module').then(m => m.FiscalModule)
      },
      {
        path: 'relatorios',
        loadChildren: () => import('./reports/reports.module').then(m => m.ReportsModule)
      },
      {
        path: 'configuracoes',
        loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule)
      },
      {
        path: 'informacoes',
        loadChildren: () => import('./informations/informations.module').then(m => m.InformationModule)
      },
      {
        path: 'crm',
        loadChildren: () => import('./crm/crm.module').then(m => m.CrmModule),
        data: { title: 'CRM' }
      },
      { path: '**', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }