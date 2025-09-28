// Arquivo: informations.module.ts
// Localização: src/app/pages/informations/informations.module.ts

import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';

import { InformationsComponent } from './informations.component';
import { InformationsModalComponent } from './components/modal/modal.component';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild([
      { path: '', component: InformationsComponent },
      { path: '**', redirectTo: '', pathMatch: 'full' }
    ])
  ],
  declarations: [
    InformationsComponent,
    InformationsModalComponent
  ]
})
export class InformationsModule { }

// Exportar com o nome que o routing espera
export { InformationsModule as InformationModule };