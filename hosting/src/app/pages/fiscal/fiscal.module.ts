import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';

// Components
import { FiscalComponent } from './fiscal.component';
import { FiscalModalComponent } from './components/modal/modal.component';
import { CancelAdjustNfComponent } from './components/modal/components/cancel-adjust-note/cancel-adjust-note.component';
import { SettingsNfComponent } from './components/modal/components/settings/settings.component';
import { InutilizationNfComponent } from './components/modal/components/inutilization/inutilization.component';

// NOTA: RegisterNfComponent e seus componentes relacionados foram movidos para SharedModule
// para permitir uso no CashierModule sem dependência circular



@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild([
      { path: '', component: FiscalComponent },
      { path: '**', redirectTo: '', pathMatch: 'full' }
    ])
  ],
  declarations: [
    FiscalComponent,
    FiscalModalComponent,
    CancelAdjustNfComponent,
    SettingsNfComponent,
    InutilizationNfComponent,
  ]
})
export class FiscalModule { }
