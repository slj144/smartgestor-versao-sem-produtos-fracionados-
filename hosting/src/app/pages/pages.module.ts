import { NgModule } from '@angular/core';

// Modules
import { SharedModule } from '@shared/shared.module';
import { PagesRoutingModule } from './pages.routing';

// Components
import { PagesComponent } from './pages.component';
import { LayoutComponent } from '../@theme/layout/layout.component';
import { MenuComponent } from '../@theme/menu/menu.component';

@NgModule({
  imports: [
    SharedModule,
    PagesRoutingModule
  ],
  declarations: [
    PagesComponent,
    LayoutComponent,
    MenuComponent
  ]
})
export class PagesModule { }
