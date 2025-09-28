import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NbAlertModule, NbCheckboxModule } from '@nebular/theme';
import { ThemeModule } from '../../@theme/theme.module';
import { NbSpinnerModule } from '@nebular/theme';

// Modules

// Components
import { PublicDonationsComponent } from './donations.component';
import { PublicDonationsRoutingModule } from './donations.routing';
import { RegisterDonationsComponent } from './components/register/register.component';
import { SharedModule } from '@shared/shared.module';
// import { CurrencyCustomPipe } from '@shared/pipes/currency.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NbAlertModule,
    ReactiveFormsModule,
    NbCheckboxModule,
    ThemeModule,
    NbSpinnerModule,
    PublicDonationsRoutingModule,
    SharedModule
  ],
  declarations: [
    // CurrencyCustomPipe,
    PublicDonationsComponent,
    RegisterDonationsComponent
  ]
})
export class PublicDonationsModule { }
