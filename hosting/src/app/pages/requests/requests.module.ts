import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';

// Components
import { RequestsComponent } from './requests.component';
import { RequestsModalComponent } from './components/modal/modal.component';
import { RequestsRegisterComponent } from './components/modal/components/register/register.component';
import { RequestsRegisterLayerComponent } from './components/modal/components/register/components/layer/layer.component';
import { SchemesComponent } from './components/modal/components/schemes/schemes.component';
import { SchemesModalComponent } from './components/modal/components/schemes/modal/modal.component';
import { SchemesDataExportComponent } from './components/modal/components/schemes/modal/components/others/dataExport/dataExport.component';
import { SchemesRegisterLayerComponent } from './components/modal/components/schemes/modal/components/register/components/layer/layer.component';
import { SchemesRegisterComponent } from './components/modal/components/schemes/modal/components/register/register.component';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild([
      { path: '', component: RequestsComponent },
      { path: '**', redirectTo: '', pathMatch: 'full' }
    ])
  ],
  declarations: [
    RequestsComponent,
    RequestsModalComponent,
    RequestsRegisterComponent,
    RequestsRegisterLayerComponent,

    SchemesComponent,
    SchemesModalComponent,
    SchemesRegisterComponent,
    SchemesRegisterLayerComponent,
    SchemesDataExportComponent
  ]
})
export class RequestsModule { }
