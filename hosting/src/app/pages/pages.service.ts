import { Injectable, Injector } from '@angular/core';

// Services
import { CashierFrontPDVService } from "./cashier/cashier-front/components/cashier-pdv/cashier-pdv.service";
import { ServiceOrdersService } from './services/serviceOrders/serviceOrders.service';
import { CollaboratorsService } from "./registers/collaborators/collaborators.service";
import { RequestsService } from "./requests/requests.service";
import { FiscalService } from "./fiscal/fiscal.service";

// Utilities
import { Dispatch } from '@shared/utilities/dispatch';

@Injectable({
  providedIn: 'root'
})
export class PagesService {

  constructor(
    private injector: Injector
  ) {
    Dispatch.cashierFrontPDVService = this.injector.get(CashierFrontPDVService);
    Dispatch.serviceOrdersService = this.injector.get(ServiceOrdersService);
    Dispatch.collaboratorsService = this.injector.get(CollaboratorsService);
    Dispatch.requestsService = this.injector.get(RequestsService);
    Dispatch.fiscalService = this.injector.get(FiscalService);
  }
  
}
