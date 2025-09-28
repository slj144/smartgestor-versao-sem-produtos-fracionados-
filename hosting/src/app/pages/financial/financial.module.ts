import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';

// Components
import { BillsToPayComponent } from './bills-to-pay/bills-to-pay.component';
import { BillsToPayModalComponent } from './bills-to-pay/components/modal/modal.component';
import { BillsToPayPrintComponent } from './bills-to-pay/components/modal/components/print/print.component';

import { BillsToReceiveComponent } from './bills-to-receive/bills-to-receive.component';
import { BillsToReceiveModalComponent } from './bills-to-receive/components/modal/modal.component';
import { BillsToReceivePrintComponent } from './bills-to-receive/components/modal/components/print/print.component';

import { BankAccountsComponent } from './bank-accounts/bank-accounts.component';
import { BankAccountsModalComponent } from './bank-accounts/components/modal/modal.component';
import { BankAccountsModalLayerComponent } from './bank-accounts/components/modal/components/layer/layer.component';
import { BankAccountsRegisterComponent } from './bank-accounts/components/modal/components/register/register.component';
import { BankAccountsPrintComponent } from './bank-accounts/components/modal/components/print/print.component';
import { BankAccountsTransferComponent } from './bank-accounts/components/modal/components/transfer/transfer.component';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild([
      { path: 'contas-pagar', component: BillsToPayComponent },
      { path: 'contas-receber', component: BillsToReceiveComponent },
      { path: 'contas-bancarias', component: BankAccountsComponent },
      { path: '', redirectTo: 'contas-pagar', pathMatch: 'full' },
      { path: '**', redirectTo: 'contas-pagar', pathMatch: 'full' }
    ])
  ],
  declarations: [
    BillsToPayComponent,
    BillsToPayModalComponent,
    BillsToPayPrintComponent,

    BillsToReceiveComponent,
    BillsToReceiveModalComponent,
    BillsToReceivePrintComponent,

    BankAccountsComponent,
    BankAccountsModalComponent,
    BankAccountsModalLayerComponent,
    BankAccountsRegisterComponent,
    BankAccountsPrintComponent,
    BankAccountsTransferComponent
  ]
})
export class FinancialModule { }
