import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PublicTithesRoutingModule } from './tithes.routing';
import { PublicTithesComponent } from './tithes.component';
import { RegisterTithesComponent } from './components/register/register.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PublicTithesRoutingModule,
    SharedModule
  ],
  declarations: [
    PublicTithesComponent,
    RegisterTithesComponent
  ]
})
export class PublicTithesModule { }
