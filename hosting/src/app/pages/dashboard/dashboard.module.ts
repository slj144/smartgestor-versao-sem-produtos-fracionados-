import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Modules
import { SharedModule } from '../../@shared/shared.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';

// Components
import { DashboardComponent } from './dashboard.component';

@NgModule({
  imports: [
    SharedModule,
    NgxChartsModule,
    RouterModule.forChild([
      { path: '', component: DashboardComponent },
      { path: '**', redirectTo: '', pathMatch: 'full' }
    ]),
  ],
  declarations: [
    DashboardComponent,
  ]
})
export class DashboardModule { }
