import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Modules
import { SharedModule } from '@shared/shared.module';

// Components - Products
import { ProductsComponent } from './products/products.component';
import { ProductsModalComponent } from './products/components/modal/modal.component';
import { ProductsRegisterComponent } from './products/components/modal/components/register/register.component';
import { ProductsRegisterLayerComponent } from './products/components/modal/components/register/components/layer/layer.component';
import { StockAdjustmentComponent } from './products/components/modal/components/stockAdjustment/stockAdjustment.component';
import { StockAdjustmentRegisterComponent } from './products/components/modal/components/stockAdjustment/components/register/register.component';
import { StockAdjustmentRegisterLayerComponent } from './products/components/modal/components/stockAdjustment/components/register/components/layer/layer.component';
import { GenerateTicketsComponent } from './products/components/modal/components/generateTickets/generateTickets.component';
import { GenerateTicketsLayerComponent } from './products/components/modal/components/generateTickets/components/layer/layer.component';
import { GenerateTicketsPrintComponent } from './products/components/modal/components/generateTickets/components/print/print.component';
import { DataImportComponent } from './products/components/modal/components/dataImport/dataImport.component';
import { DataExportComponent } from './products/components/modal/components/dataExport/dataExport.component';

// Components - Purchases
import { PurchasesComponent } from './purchases/purchases.component';
import { PurchasesModalComponent } from './purchases/components/modal/modal.component';
import { PurchasesRegisterComponent } from './purchases/components/modal/components/register/register.component';
import { PurchasesRegisterLayerComponent } from './purchases/components/modal/components/register/components/layer/layer.component';
import { PurchasesPrintComponent } from './purchases/components/modal/components/print/print.component';

// Components - Transfers
import { TransfersComponent } from './transfers/transfers.component';
import { TransfersModalComponent } from './transfers/components/modal/modal.component';
import { TransfersRegisterComponent } from './transfers/components/modal/components/register/register.component';
import { TransfersRegisterLayerComponent } from './transfers/components/modal/components/register/components/layer/layer.component';
import { TransfersPrintComponent } from './transfers/components/modal/components/print/print.component';

import { BarcodeComponent } from '@shared/components/barcode/barcode.component';
import { XMLImportComponent } from './products/components/modal/components/xmlImport/xmlImport.component';
import { XMLImportLayerComponent } from './products/components/modal/components/xmlImport/components/layer/layer.component';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild([
      { path: 'produtos', component: ProductsComponent },
      { path: 'compras', component: PurchasesComponent },
      { path: 'transferencias', component: TransfersComponent },
      { path: '', redirectTo: 'produtos', pathMatch: 'full' },
      { path: '**', redirectTo: 'produtos', pathMatch: 'full' }
    ])    
  ],  
  declarations: [
    ProductsComponent,
    ProductsModalComponent,
    ProductsRegisterComponent,
    ProductsRegisterLayerComponent,    

    PurchasesComponent,
    PurchasesModalComponent,
    PurchasesRegisterComponent,
    PurchasesRegisterLayerComponent,
    PurchasesPrintComponent,
    
    TransfersComponent,
    TransfersModalComponent,
    TransfersRegisterComponent,
    TransfersRegisterLayerComponent,
    TransfersPrintComponent,

    StockAdjustmentComponent,
    StockAdjustmentRegisterComponent,
    StockAdjustmentRegisterLayerComponent,

    GenerateTicketsComponent,
    GenerateTicketsLayerComponent,
    GenerateTicketsPrintComponent,

    BarcodeComponent,
    DataImportComponent,
    DataExportComponent,
    XMLImportComponent,
    XMLImportLayerComponent
  ]
})
export class StockModule { }
