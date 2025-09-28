import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { PublicTithesComponent } from './tithes.component';

// Components

const routes: Routes = [
  { path: '', component: PublicTithesComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)], 
  exports: [RouterModule]
})
export class PublicTithesRoutingModule {}
