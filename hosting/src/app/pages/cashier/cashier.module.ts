import { NgModule } from "@angular/core";
import { RouterModule } from '@angular/router';

// Modules
import { SharedModule } from '@shared/shared.module';

// Components
import { CashierFrontComponent } from './cashier-front/cashier-front.component';
import { CashierFrontControlComponent } from './cashier-front/components/cashier-control/cashier-control.component';

import { CashierFrontPDVComponent } from './cashier-front/components/cashier-pdv/cashier-pdv.component';
import { CashierFrontPDVLayerComponent } from './cashier-front/components/cashier-pdv/components/layer/layer.component';

import { CashierFrontInflowComponent } from './cashier-front/components/cashier-inflow/cashier-inflow.component';
import { CashierFrontInflowLayerComponent } from './cashier-front/components/cashier-inflow/components/layer/layer.component';

import { CashierFrontOutflowComponent } from './cashier-front/components/cashier-outflow/cashier-outflow.component';
import { CashierFrontOutflowLayerComponent } from './cashier-front/components/cashier-outflow/components/layer/layer.component';

import { CashierFrontReportsComponent } from './cashier-front/components/cashier-reports/cashier-reports.component';
import { CashierFrontReportsPrintComponent } from './cashier-front/components/cashier-reports/components/print/print.component';

import { CashierFrontReceiptsComponent } from './cashier-front/components/cashier-receipts/cashier-receipts.component';
import { CashierFrontReceiptsPrintComponent } from './cashier-front/components/cashier-receipts/components/print/print.component';

import { CashierFrontRecordsComponent } from './cashier-front/components/cashier-records/cashier-records.component';

import { CashierRecordsComponent } from './cashier-records/cashier-records.component';
import { CashierRecordsModalComponent } from './cashier-records/components/modal/modal.component';
import { CashierFrontVaultComponent } from './cashier-front/components/cashier-vault/cashier-vault.component';

@NgModule({
	imports: [
		SharedModule,
    RouterModule.forChild([
			{ path: 'pdv', component: CashierFrontComponent },
			{ path: 'registros-de-caixa', component: CashierRecordsComponent },
      { path: '', redirectTo: 'pdv', pathMatch: 'full' },
      { path: '**', redirectTo: 'pdv', pathMatch: 'full' }
    ])
	],
	declarations: [
		CashierFrontComponent,
		CashierFrontControlComponent,

		CashierFrontPDVComponent,
    CashierFrontPDVLayerComponent,
		
		CashierFrontInflowComponent,
		CashierFrontInflowLayerComponent,

		CashierFrontOutflowComponent,
		CashierFrontOutflowLayerComponent,

		CashierFrontReportsComponent,
		CashierFrontReportsPrintComponent,

		CashierFrontReceiptsComponent,
		CashierFrontReceiptsPrintComponent,

		CashierFrontRecordsComponent,

		CashierRecordsComponent,
		CashierRecordsModalComponent,
		CashierFrontVaultComponent
	]
})
export class CashierModule {}
