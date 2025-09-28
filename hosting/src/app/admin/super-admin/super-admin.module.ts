import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { SuperAdminRoutingModule } from './super-admin.routing';
import { SuperAdminComponent } from './super-admin.component';
import { SuperAdminLoginComponent } from './login/super-admin-login.component';
import { SuperAdminAuthService } from './super-admin-auth.service';
import { SuperAdminGuard } from './super-admin.guard';

// Importa o serviço que vocês já usam
import { IToolsService } from '@shared/services/iTools.service';

@NgModule({
    declarations: [
        SuperAdminComponent,
        SuperAdminLoginComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        SuperAdminRoutingModule
    ],
    providers: [
        SuperAdminAuthService,
        SuperAdminGuard,
        IToolsService // Adiciona aqui
    ]
})
export class SuperAdminModule { }