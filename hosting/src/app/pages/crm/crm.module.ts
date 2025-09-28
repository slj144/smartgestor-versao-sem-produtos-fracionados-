// Arquivo: crm.module.ts
// Caminho: src/app/pages/crm/crm.module.ts
// O que faz: Módulo do CRM

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';

// Módulos
import { SharedModule } from '@shared/shared.module';
import { CrmRoutingModule } from './crm.routing';

// Componentes
import { CrmComponent } from './crm.component';
import { CrmDashboardComponent } from './dashboard/crm-dashboard.component';
import { LeadsComponent } from './leads/leads.component';
import { PipelineComponent } from './pipeline/pipeline.component';
import { ActivitiesComponent } from './activities/activities.component';
import { CustomerImportComponent } from './components/customer-import/customer-import.component';
import { MessageTemplatesComponent } from './components/message-templates/message-templates.component';
import { BirthdayCustomersComponent } from './components/birthday-customers/birthday-customers.component';
import { PublicLinkManagerComponent } from './components/public-link-manager/public-link-manager.component';
import { SalesAnalysisComponent } from './sales-analysis/sales-analysis.component';


// Serviços
import { CrmService } from './crm.service';
import { CustomerImportService } from './services/customer-import.service';
import { CrmAlertsService } from './services/crm-alerts.service';
import { SalesIntegrationService } from './services/sales-integration.service';
import { PublicRegistrationService } from './services/public-registration.service';
import { SalesAnalysisService } from './services/sales-analysis.service';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        RouterModule,
        DragDropModule,
        CrmRoutingModule
    ],
    declarations: [
        CrmComponent,
        CrmDashboardComponent,
        LeadsComponent,
        PipelineComponent,
        ActivitiesComponent,
        CustomerImportComponent,
        MessageTemplatesComponent,
        BirthdayCustomersComponent,
        PublicLinkManagerComponent,
        SalesAnalysisComponent

    ],
    providers: [
        CrmService,
        CustomerImportService,
        CrmAlertsService,
        SalesIntegrationService,
        PublicRegistrationService,
        SalesAnalysisService
    ]
})
export class CrmModule { }