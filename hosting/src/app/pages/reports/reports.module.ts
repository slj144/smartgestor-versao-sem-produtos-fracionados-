import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';

// Components
import { ReportsComponent } from './reports.component';
import { ModalReportsComponent } from './components/modal/modal.component';
import { CashierReportsComponent } from './components/modal/components/cashier/cashier.component';
import { CashierReportsLayerComponent } from './components/modal/components/cashier/layer/layer.component';
import { StockReportsComponent } from './components/modal/components/stock/stock.component';
import { StockReportsLayerComponent } from './components/modal/components/stock/layer/layer.component';
import { StockReportsModalComponent } from './components/modal/components/stock/modal/modal.component';
import { ServiceOrdersReportsComponent } from './components/modal/components/serviceOrders/serviceOrders.component';
import { ServiceOrdersReportsLayerComponent } from './components/modal/components/serviceOrders/layer/layer.component';
import { FinancialReportsComponent } from './components/modal/components/financial/financial.component';
import { FinancialReportsLayerComponent } from './components/modal/components/financial/layer/layer.component';
import { SeveralReportsComponent } from './components/modal/components/several/several.component';
import { SeveralReportsLayerComponent } from './components/modal/components/several/layer/layer.component';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild([
      { path: '', component: ReportsComponent },
      { path: '**', redirectTo: '', pathMatch: 'full' }
    ])
  ],
  declarations: [
    ReportsComponent,
    ModalReportsComponent,
    CashierReportsComponent,
    CashierReportsLayerComponent,
    StockReportsComponent,
    StockReportsLayerComponent,
    StockReportsModalComponent,
    ServiceOrdersReportsComponent,
    ServiceOrdersReportsLayerComponent,
    FinancialReportsComponent,
    FinancialReportsLayerComponent,
    SeveralReportsComponent,
    SeveralReportsLayerComponent
  ]
})
export class ReportsModule {}
