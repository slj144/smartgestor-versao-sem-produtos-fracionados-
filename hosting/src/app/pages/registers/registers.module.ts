import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Modules
import { SharedModule } from '@shared/shared.module';

// Components
import { BranchesComponent } from './branches/branches.component';
import { BranchesModalComponent } from './branches/components/modal/modal.component';
import { BranchesDataExportComponent } from './branches/components/modal/components/others/dataExport/dataExport.component';

import { CustomersComponent } from './customers/customers.component';
import { CustomersModalComponent } from './customers/components/modal/modal.component';
import { CustomersDataExportComponent } from './customers/components/modal/components/others/dataExport/dataExport.component';
import { CustomersDataImportComponent } from './customers/components/modal/components/others/dataExport/dataImport.component';
import { CollaboratorsComponent } from './collaborators/collaborators.component';
import { CollaboratorsModalComponent } from './collaborators/components/modal/modal.component';
import { CollaboratorsModalLayerComponent } from './collaborators/components/modal/components/layer/layer.component';
import { CollaboratorProfilesComponent } from './collaborators/components/modal/components/others/profiles/profiles.component';
import { CollaboratorProfilesUpdateComponent } from './collaborators/components/modal/components/others/profiles/components/layer/components/update/update.component';
import { CollaboratorProfilesLayerComponent } from './collaborators/components/modal/components/others/profiles/components/layer/layer.component';
import { CollaboratorsPermissionsComponent } from './collaborators/components/modal/components/others/profiles/components/layer/components/permissions/permissions.component';
import { CollaboratorsDataExportComponent } from './collaborators/components/modal/components/others/dataExport/dataExport.component';

import { CarriersComponent } from './carriers/carriers.component';
import { CarriersModalComponent } from './carriers/components/modal/modal.component';
import { CarriersRegisterComponent } from './carriers/components/modal/components/register/register.component';
import { CarriersDataExportComponent } from './carriers/components/modal/components/others/dataExport/dataExport.component';

import { ProvidersComponent } from './providers/providers.component';
import { ProvidersModalComponent } from './providers/components/modal/modal.component';
import { ProvidersDataExportComponent } from './providers/components/modal/components/others/dataExport/dataExport.component';

import { PartnersComponent } from './partners/partners.component';
import { PartnersModalComponent } from './partners/components/modal/modal.component';
import { PartnersDataExportComponent } from './partners/components/modal/components/others/dataExport/dataExport.component';

import { ServicesComponent } from './services/services.component';
import { ServicesModalComponent } from './services/components/modal/modal.component';
import { ServicesDataExportComponent } from './services/components/modal/components/others/dataExport/dataExport.component';
import { ServicesIssConfigComponent } from './services/components/modal/components/others/issConfig/iss-config.component';

import { VehiclesComponent } from './vehicles/vehicles.component';
import { VehiclesModalComponent } from './vehicles/components/modal/modal.component';
import { VehiclesDataExportComponent } from './vehicles/components/modal/components/others/dataExport/dataExport.component';

import { PaymentMethodsComponent } from './paymentMethods/paymentMethods.component';
import { PaymentMethodsModalComponent } from './paymentMethods/components/modal/modal.component';
import { PaymentMethodsRegisterComponent } from './paymentMethods/components/modal/components/register/register.component';
import { PaymentMethodsDataExportComponent } from './paymentMethods/components/modal/components/others/dataExport/dataExport.component';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild([
      { path: 'clientes', component: CustomersComponent },
      { path: 'colaboradores', component: CollaboratorsComponent },
      { path: 'filiais', component: BranchesComponent },
      { path: 'transportadoras', component: CarriersComponent },
      { path: 'fornecedores', component: ProvidersComponent },
      { path: 'parceiros', component: PartnersComponent },
      { path: 'meios-pagamento', component: PaymentMethodsComponent },
      { path: 'servicos', component: ServicesComponent },
      { path: 'veiculos', component: VehiclesComponent },
      { path: '', redirectTo: 'clientes', pathMatch: 'full' },
      { path: '**', redirectTo: 'clientes', pathMatch: 'full' }
    ])
  ],
  declarations: [
    CustomersComponent,
    CustomersModalComponent,
    CustomersDataExportComponent,
    CustomersDataImportComponent,

    CollaboratorsComponent,
    CollaboratorsModalComponent,
    CollaboratorsModalLayerComponent,
    CollaboratorsPermissionsComponent,
    CollaboratorProfilesComponent,
    CollaboratorsModalLayerComponent,
    CollaboratorProfilesUpdateComponent,
    CollaboratorProfilesLayerComponent,
    CollaboratorsDataExportComponent,

    CarriersComponent,
    CarriersModalComponent,
    CarriersRegisterComponent,
    CarriersDataExportComponent,

    ProvidersComponent,
    ProvidersModalComponent,
    ProvidersDataExportComponent,

    PartnersComponent,
    PartnersModalComponent,
    PartnersDataExportComponent,

    ServicesComponent,
    ServicesModalComponent,
    ServicesDataExportComponent,
    ServicesIssConfigComponent,

    VehiclesComponent,
    VehiclesModalComponent,
    VehiclesDataExportComponent,

    PaymentMethodsComponent,
    PaymentMethodsModalComponent,
    PaymentMethodsRegisterComponent,
    PaymentMethodsDataExportComponent,

    BranchesComponent,
    BranchesModalComponent,
    BranchesDataExportComponent
  ]
})
export class RegistersModule { }
