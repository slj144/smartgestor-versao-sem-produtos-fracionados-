import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SharedModule } from '@shared/shared.module';
import { MotoRentalComponent } from './moto-rental.component';
import { MotoRentalDashboardComponent } from './components/dashboard/moto-rental-dashboard.component';
import { MotoRentalFleetComponent } from './components/fleet/moto-rental-fleet.component';
import { MotoRentalContractsComponent } from './components/contracts/moto-rental-contracts.component';
import { MotoRentalContractWizardComponent } from './components/contracts/moto-rental-contract-wizard.component';
import { MotoRentalSettingsComponent } from './components/settings/moto-rental-settings.component';
import { MotoRentalGuard } from './moto-rental.guard';

const routes: Routes = [
  {
    path: '',
    component: MotoRentalComponent,
    canActivate: [MotoRentalGuard],
    canActivateChild: [MotoRentalGuard],
    children: [
      { path: '', redirectTo: 'painel', pathMatch: 'full' },
      { path: 'painel', component: MotoRentalDashboardComponent },
      { path: 'frota', component: MotoRentalFleetComponent },
      { path: 'contratos', component: MotoRentalContractsComponent },
      { path: 'configuracoes', component: MotoRentalSettingsComponent },
      { path: '**', redirectTo: 'painel', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    MotoRentalComponent,
    MotoRentalDashboardComponent,
    MotoRentalFleetComponent,
    MotoRentalContractsComponent,
    MotoRentalContractWizardComponent,
    MotoRentalSettingsComponent
  ],
  providers: [
    MotoRentalGuard
  ]
})
export class MotoRentalModule {}
