import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

// Componentes
import { PublicRegistrationComponent } from './registration/public-registration.component';

// Rotas do módulo público
const routes: Routes = [
    {
        path: '',
        component: PublicRegistrationComponent
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes) // ✅ Importante para lazy loading
    ],
    declarations: [
        PublicRegistrationComponent
    ]
})
export class PublicModule { }