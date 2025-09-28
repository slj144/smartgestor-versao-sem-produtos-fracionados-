import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

// Components
import { PublicDonationsComponent } from './donations.component';

const routes: Routes = [
  { path: '', component: PublicDonationsComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)], 
  exports: [RouterModule]
})
export class PublicDonationsRoutingModule {}
