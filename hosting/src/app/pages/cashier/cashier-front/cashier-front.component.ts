import { Component, OnInit, OnDestroy } from "@angular/core";

// Components
import { CashierFrontPDVComponent } from './components/cashier-pdv/cashier-pdv.component';
import { CashierFrontInflowComponent } from './components/cashier-inflow/cashier-inflow.component';
import { CashierFrontRecordsComponent } from './components/cashier-records/cashier-records.component';
import { CashierFrontOutflowComponent } from './components/cashier-outflow/cashier-outflow.component';
import { CashierFrontVaultComponent } from './components/cashier-vault/cashier-vault.component';

// Components
import { CashierFrontReportsComponent } from './components/cashier-reports/cashier-reports.component';

// Services
import { CashierFrontControlService } from "./components/cashier-control/cashier-control.service";
import { CashierFrontReportsService } from "./components/cashier-reports/cashier-reports.service";

// Translate
import { CashierFrontTranslate } from "./cashier-front.translate";

// Interfaces
import { IPermissions } from '@shared/interfaces/_auxiliaries/IPermissions';
import { ECashierControlStatus } from '@shared/interfaces/ICashierControl';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { Dispatch } from "@shared/utilities/dispatch";
import { ScrollMonitor } from "@shared/utilities/scrollMonitor";

@Component({
	selector: 'cashier-front',
	templateUrl: 'cashier-front.component.html',
	styleUrls: ['cashier-front.component.scss']
})
export class CashierFrontComponent implements OnInit, OnDestroy {

  public translate = CashierFrontTranslate.get();

  public loading: boolean = true;
  public cashierControl: any = {};
  public settingsControl: any = {};
  public settingsComponent: any = {}; 
  public permissions: any = {};

	constructor(
    private cashierFrontControlService: CashierFrontControlService,
    private cashierFrontReportsService: CashierFrontReportsService
	) {
    this.permissionsSettings();
  }

  public ngOnInit() {

    ScrollMonitor.reset();

    this.cashierFrontControlService.getControl('CashierFrontComponent', (data) => {

      const control = (data.length > 0 ? data[0] : null);

      // console.log(control);
      
      if (control && control.status == ECashierControlStatus.CLOSED) {
        this.settingsControl.cashierControl = control;
      }
      
      this.cashierControl = (control ? control : { status: ECashierControlStatus.CLOSED });
      this.cashierFrontReportsService.cashierControl = this.cashierControl;

      this.settingsControl.permissions = this.permissions;
      this.settingsControl.activeMode = this.cashierControl.status;

      this.loading = false;
    });
  }

  // User Interface Actions - Utilities

  public onCashierInflow() {
    CashierFrontInflowComponent.shared.onOpenModal();
  }

  public onCashierOutflow() {
    CashierFrontOutflowComponent.shared.onOpenModal();
  }
  
  public onCashierRecords() {
    CashierFrontRecordsComponent.shared.onOpenModal();
  }

  public onCashierReports() {
    
    CashierFrontReportsComponent.shared.onOpenModal({ 
      control: this.cashierControl 
    });
  }   
  
  public onVaultWithdraw() {
    CashierFrontVaultComponent.shared.onOpenModal({ direction: 'TO_VAULT' });
  }

  public onVaultReplenish() {
    CashierFrontVaultComponent.shared.onOpenModal({ direction: 'FROM_VAULT' });
  }
  
  // Removed transfer modal (replaced by Caixa ⇄ Cofre flow via inflow/outflow)
  
  public onCashierClear() {
    CashierFrontPDVComponent.shared.onResetPanel();
  }
  
  public onFullscreen() {

    const elem = $$('#container-main');

    if (!this.settingsComponent.fullscreen) {

      elem.addClass('activeFullscreen');
      this.settingsComponent.fullscreen = true;
    } else {

      elem.removeClass('activeFullscreen');
      this.settingsComponent.fullscreen = false;
    }    
  }

  public async onCashierClosing() {
    
    this.cashierControl.status = "CLOSING"; 

    this.settingsControl = { 
      activeMode: this.cashierControl.status,
      callback: (response) => {

        if (response.back) {
          this.cashierControl.status = 'OPENED';
        }

        if (response.restore) {    
          if (this.settingsComponent.fullscreen) {
            this.onFullscreen();
          }
        }

        if (response.closed) {
          this.cashierControl = { status: ECashierControlStatus.CLOSED };
          this.settingsControl.activeMode = this.cashierControl.status;
        }
      }
    };

    this.cashierControl.closing = await (async () => {

      const response = { value: 0 };
      response.value = ((await this.cashierFrontReportsService.getData()).resume.dailyBalance.total.currentValue || 0); 
     
      return response;
    })();

    this.settingsControl.cashierControl = this.cashierControl;
  }

  // Utility Method

  private permissionsSettings() {

    const setupPermissions = () => {
      if (Utilities.isAdmin) {
        this.permissions = { inputs: true, outputs: true, cashierRegisters: true, cashierResume: true, control: { opening: true, closing: true, showOpeningValue: true, editOpeningValue: true}, sales: {applyDiscount: true, applyTax: true}};
      } else {

        const permissions = ((<any>Utilities.permissions('cashier'))["cashierFront"] as IPermissions['cashier']['cashierFront']);

        this.permissions = {
          cashierResume: (permissions.actions.indexOf('cashierResume') !== -1),
          cashierRegisters: !!((<any>Utilities.permissions('cashier'))["cashierRegisters"]),
          inputs: (
            permissions.sections && permissions.sections.inputs && 
            permissions.sections.inputs.actions && (permissions.sections.inputs.actions.indexOf('add') !== -1)),
          outputs: (
            permissions.sections && permissions.sections.outputs && 
            permissions.sections.outputs.actions && (permissions.sections.outputs.actions.indexOf('add') !== -1)),
          control: {
            opening: (permissions.actions.indexOf('openCashier') !== -1),
            closing: (permissions.actions.indexOf('closeCashier') !== -1),
            showOpeningValue: (permissions.fields.indexOf('showOpeningValue') !== -1),
            editOpeningValue: (permissions.fields.indexOf('editOpeningValue') !== -1),
          },
          sales: {
            applyDiscount: (permissions.sections?.sales?.actions.indexOf('applyDiscount') !== -1),
            applyTax: (permissions.sections?.sales?.actions.indexOf('applyTax') !== -1)
          }
        };
      }
    };

    Dispatch.onRefreshCurrentUserPermissions('CashierFrontComponent', () => {
      setupPermissions();
    });

    setupPermissions();
  }

  // Destruction Method

  public ngOnDestroy() {
    this.cashierFrontControlService.removeListeners('control', 'CashierFrontComponent');
    Dispatch.removeListeners('refreshCurrentUserPermissions', 'CashierFrontComponent');
  }

}
