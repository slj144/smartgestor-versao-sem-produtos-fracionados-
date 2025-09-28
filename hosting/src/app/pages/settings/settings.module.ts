import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';

// Components
import { SettingsComponent } from './settings.component';
import { SettingsModalComponent } from './components/modal/modal.component';
import { SettingsCashierComponent } from './components/modal/components/cashier/cashier.component';
import { SettingsGeneralComponent } from './components/modal/components/general/general.component';
import { SettingsStockComponent } from './components/modal/components/stock/stock.component';
import { SettingsServiceOrdersComponent } from './components/modal/components/serviceOrders/serviceOrders.component';
import { SettingsServiceOrdersLayerComponent } from './components/modal/components/serviceOrders/components/layer/layer.component';
import { SettingsRegistersComponent } from './components/modal/components/registers/registers.component';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild([
      { path: '', component: SettingsComponent },
      { path: '**', redirectTo: '', pathMatch: 'full' }
    ])
  ],
  declarations: [
    SettingsComponent,
    SettingsModalComponent,
    SettingsGeneralComponent,
    SettingsStockComponent,
    SettingsCashierComponent,
    SettingsServiceOrdersComponent,
    SettingsServiceOrdersLayerComponent,    
    SettingsRegistersComponent
  ]
})
export class SettingsModule { }
