// Arquivo: crm.routing.ts
// Localização: src/app/pages/crm/crm.routing.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Componentes
import { CrmComponent } from './crm.component';
import { CrmDashboardComponent } from './dashboard/crm-dashboard.component';
import { LeadsComponent } from './leads/leads.component';
import { PipelineComponent } from './pipeline/pipeline.component';
import { ActivitiesComponent } from './activities/activities.component';
import { BirthdayCustomersComponent } from './components/birthday-customers/birthday-customers.component';
import { PublicLinkManagerComponent } from './components/public-link-manager/public-link-manager.component';
import { SalesAnalysisComponent } from './sales-analysis/sales-analysis.component';

const routes: Routes = [
    {
        path: '',
        component: CrmComponent,
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                component: CrmDashboardComponent
            },
            {
                path: 'leads',
                component: LeadsComponent
            },
            {
                path: 'pipeline',
                component: PipelineComponent
            },
            {
                path: 'atividades',
                component: ActivitiesComponent
            },
            // Adicione esta rota:
            {
                path: 'analise-vendas',
                component: SalesAnalysisComponent
            },
            {
                path: 'aniversarios',
                component: BirthdayCustomersComponent
            },
            {
                path: 'link-publico',
                component: PublicLinkManagerComponent
            }


        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CrmRoutingModule { }