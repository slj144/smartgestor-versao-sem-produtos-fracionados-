import { NgModule } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { RouterModule } from '@angular/router';

// Modules
import { SharedModule } from '@shared/shared.module';

// Components
import { ServiceOrdersComponent } from './serviceOrders.component';
import { ServiceOrdersModalComponent } from './components/modal/modal.component';
import { ServiceOrdersRegisterComponent } from './components/modal/components/register/register.component';
import { ServiceOrdersRegisterLayerComponent } from './components/modal/components/register/components/layer/layer.component';
import { ServiceOrdersReceiptsComponent } from './components/modal/components/receipts/receipts.component';
import { ServiceOrdersStatusComponent } from './components/modal/components/status/status.component';
import { ServiceOrdersReceiptsPrintComponent } from './components/modal/components/receipts/components/print/print.component';

@NgModule({
  imports: [
    SharedModule,
    // Virtual Scroll for large lists without DOM cost
    ScrollingModule,
    RouterModule.forChild([
      { path: 'ordens-de-servico', component: ServiceOrdersComponent },
      { path: '**', redirectTo: 'ordens-de-servico', pathMatch: 'full' }
    ]),
  ],
  declarations: [
    ServiceOrdersComponent,
    ServiceOrdersModalComponent,    
    ServiceOrdersRegisterComponent,
    ServiceOrdersRegisterLayerComponent,    
    ServiceOrdersReceiptsComponent,
    ServiceOrdersReceiptsPrintComponent,
    ServiceOrdersStatusComponent
  ]
})
export class ServiceOrdersModule {}
