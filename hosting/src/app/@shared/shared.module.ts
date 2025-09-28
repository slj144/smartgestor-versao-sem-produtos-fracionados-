import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Modules
import { AngularEditorModule } from '@kolkov/angular-editor';
import { TooltipModule } from './modules/tooltip/tooltip.module';

// Components
import { ModalComponent } from './components/_auxiliaries/modal/modal.component';
import { LayerComponent } from './components/_auxiliaries/layer/layer.component';
import { ToastComponent } from './components/_auxiliaries/toast/toast.component';
import { TabsComponent } from './components/_auxiliaries/tabs/tabs.component';
import { IconComponent } from './components/_auxiliaries/icon/icon.component';
import { HeaderComponent } from './components/_auxiliaries/header/header.component';

import { GeneralSelectorComponent } from './components/general-selector/general-selector.component';
import { CustomersSelectorComponent } from '@pages/registers/customers/components/selector/selector.component';
import { ProductsSelectorComponent } from '@pages/stock/products/components/selector/selector.component';
import { PaymentMethodsSelectorComponent } from '@pages/registers/paymentMethods/components/selector/selector.component';
import { ProvidersSelectorComponent } from '@pages/registers/providers/components/selector/selector.component';
import { ServicesSelectorComponent } from '@pages/registers/services/components/selector/selector.component';
import { VehiclesSelectorComponent } from '@pages/registers/vehicles/components/selector/selector.component';
import { StoresSelectorComponent } from '@pages/informations/components/selector/selector.component';

import { ProvidersRegisterComponent } from '@pages/registers/providers/components/modal/components/register/register.component';
import { CustomersRegisterComponent } from '@pages/registers/customers/components/modal/components/register/register.component';
import { PartnersRegisterComponent } from '@pages/registers/partners/components/modal/components/register/register.component';
import { ServicesRegisterComponent } from '@pages/registers/services/components/modal/components/register/register.component';

import { VehiclesRegisterComponent } from '@pages/registers/vehicles/components/modal/components/register/register.component';
import { VehiclesRegisterLayerComponent } from '@pages/registers/vehicles/components/modal/components/register/components/layer/layer.component';

import { BillsToPayRegisterComponent } from '@pages/financial/bills-to-pay/components/modal/components/register/register.component';
import { BillsToPayRegisterLayerComponent } from '@pages/financial/bills-to-pay/components/modal/components/register/components/layer/layer.component';
import { BillsToReceiveRegisterComponent } from '@pages/financial/bills-to-receive/components/modal/components/register/register.component';
import { BillsToReceiveRegisterLayerComponent } from '@pages/financial/bills-to-receive/components/modal/components/register/components/layer/layer.component';

// FISCAL COMPONENTS - Movidos para SharedModule para uso em outros módulos (ex: CashierModule)
// Estes componentes foram movidos do FiscalModule para permitir que o botão "Emitir Nota Fiscal"
// no registro de caixa funcione corretamente sem dependência circular entre módulos
import { RegisterNfComponent } from '@pages/fiscal/components/modal/components/register/register.component';
import { RegisterNfLayerComponent } from '@pages/fiscal/components/modal/components/register/components/layer/layer.component';
import { NfPaymentMethodsSelectorComponent } from '@pages/fiscal/components/modal/components/register/components/selector/selector.component';
import { AddressComponent } from '@pages/fiscal/components/modal/components/register/components/address/address.component';
import { NfCFOPComponent } from '@pages/fiscal/components/modal/components/register/components/cfop/cfop.component';
import { NfPaymentsComponent } from '@pages/fiscal/components/modal/components/register/components/payments/payments.component';
import { NfReceiptsComponent } from '@pages/fiscal/components/modal/components/register/components/receipts/receipts.component';

import { CalendarComponent } from './components/calendar/calendar.component';
import { FiltersComponent } from './components/filters/filters.component';
import { PlaceholderComponent } from './components/placeholder/placeholder.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { ActivityBellComponent } from './components/activity-bell/activity-bell.component';
import { UpdatesBannerComponent } from './components/updates-banner/updates-banner.component';

import { SystemUpdateComponent } from './components/system-update/system-update.component';
//import { CameraScannerModalComponent } from './components/camera-scanner-modal/camera-scanner-modal.component';
// REMOVIDO: import { CameraScannerService } from './services/camera-scanner.service';

// Pipes
import { EllipsisPipe } from './pipes/ellipsis.pipe';
import { CurrencyCustomPipe } from './pipes/currency.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    ModalComponent,
    LayerComponent,
    ToastComponent,
    TabsComponent,
    IconComponent,
    HeaderComponent,

    GeneralSelectorComponent,
    CustomersSelectorComponent,
    ProductsSelectorComponent,
    PaymentMethodsSelectorComponent,
    ProvidersSelectorComponent,
    ServicesSelectorComponent,
    VehiclesSelectorComponent,
    StoresSelectorComponent,

    ProvidersRegisterComponent,
    CustomersRegisterComponent,
    PartnersRegisterComponent,
    ServicesRegisterComponent,

    VehiclesRegisterComponent,
    VehiclesRegisterLayerComponent,

    BillsToPayRegisterComponent,
    BillsToPayRegisterLayerComponent,
    BillsToReceiveRegisterComponent,
    BillsToReceiveRegisterLayerComponent,

    // FISCAL COMPONENTS - Declarados aqui para uso no CashierModule e outros
    // FIX: Movidos do FiscalModule para resolver problema do botão "Emitir Nota Fiscal" no registro de caixa
    RegisterNfComponent,
    RegisterNfLayerComponent,
    NfPaymentMethodsSelectorComponent,
    AddressComponent,
    NfCFOPComponent,
    NfPaymentsComponent,
    NfReceiptsComponent,

    CalendarComponent,
    FiltersComponent,
    PlaceholderComponent,
    NotificationsComponent,
    ActivityBellComponent,
    SystemUpdateComponent,
    UpdatesBannerComponent,

    EllipsisPipe,
    CurrencyCustomPipe,
    //CameraScannerModalComponent
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    AngularEditorModule,
    TooltipModule,

    ModalComponent,
    LayerComponent,
    ToastComponent,
    TabsComponent,
    IconComponent,
    HeaderComponent,

    GeneralSelectorComponent,
    CustomersSelectorComponent,
    ProductsSelectorComponent,
    PaymentMethodsSelectorComponent,
    ProvidersSelectorComponent,
    ServicesSelectorComponent,
    VehiclesSelectorComponent,
    StoresSelectorComponent,

    ProvidersRegisterComponent,
    CustomersRegisterComponent,
    PartnersRegisterComponent,
    ServicesRegisterComponent,

    VehiclesRegisterComponent,
    VehiclesRegisterLayerComponent,

    BillsToPayRegisterComponent,
    BillsToPayRegisterLayerComponent,
    BillsToReceiveRegisterComponent,
    BillsToReceiveRegisterLayerComponent,

    // FISCAL COMPONENTS - Exportados para uso em outros módulos
    RegisterNfComponent,
    RegisterNfLayerComponent,
    NfPaymentMethodsSelectorComponent,
    AddressComponent,
    NfCFOPComponent,
    NfPaymentsComponent,
    NfReceiptsComponent,

    CalendarComponent,
    FiltersComponent,
    PlaceholderComponent,
    NotificationsComponent,
    ActivityBellComponent,
    SystemUpdateComponent,
    UpdatesBannerComponent,

    EllipsisPipe,
    CurrencyCustomPipe,
    //CameraScannerModalComponent
  ],
})
export class SharedModule { }
