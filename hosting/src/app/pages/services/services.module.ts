// Arquivo: services.module.ts
// Localização: src/app/pages/services/services.module.ts

import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Modules
import { SharedModule } from '@shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: 'ordens-de-servico',
        loadChildren: () => import('./serviceOrders/serviceOrders.module').then(m => m.ServiceOrdersModule)
      },
      {
        path: 'aluguel-de-motos',
        loadChildren: () => import('./moto-rental/moto-rental.module').then(m => m.MotoRentalModule)
      },
      { path: '', redirectTo: 'ordens-de-servico', pathMatch: 'full' },
      { path: '**', redirectTo: 'ordens-de-servico', pathMatch: 'full' }
    ])
  ],
  declarations: [
    // NÃO DECLARAR COMPONENTES AQUI
    // Todos os componentes de ServiceOrders devem estar apenas no ServiceOrdersModule
  ]
})
export class ServicesModule { }
