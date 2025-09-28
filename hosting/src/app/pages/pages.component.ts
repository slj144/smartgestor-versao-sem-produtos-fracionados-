// Arquivo: pages.component.ts
// Componente: PagesComponent
// Localização: src/app/pages/pages.component.ts

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

// Services
import { PagesService } from './pages.service';
import { AuthService } from '@auth/auth.service';
import { ScannerService } from '@shared/services/scanner.service';
import { SettingsService } from './settings/settings.service';

// Interfaces
import { IMenuOptions } from '@shared/interfaces/IMenuOptions';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { Dispatch } from '@shared/utilities/dispatch';

import { MENU_ITEMS, setupMenu } from './pages.menu';

@Component({
  selector: 'app-pages',
  template: `
    <router-outlet *ngIf="!isEnable"></router-outlet>  
    
    <div class='main-loader fade-in' *ngIf="loading">
      <div class="loader-container">
        <div class="modern-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <div class="spinner-inner"></div>
        </div>
        <p class="loading-text">{{ loadingMessage }}</p>
      </div>
    </div>

    <ng-container *ngIf="isEnable">
      <layout>
        <router-outlet></router-outlet>
      </layout>
    </ng-container>   
  `,
  styles: [`
    .main-loader {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }

    .loader-container {
      text-align: center;
    }

    .modern-spinner {
      width: 80px;
      height: 80px;
      position: relative;
      margin: 0 auto 20px;
    }

    .spinner-ring {
      position: absolute;
      width: 100%;
      height: 100%;
      border: 3px solid transparent;
      border-radius: 50%;
      animation: spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
    }

    .spinner-ring:nth-child(1) {
      border-top-color: #667eea;
      animation-delay: 0s;
    }

    .spinner-ring:nth-child(2) {
      border-right-color: #764ba2;
      animation-delay: 0.15s;
      width: 70%;
      height: 70%;
      top: 15%;
      left: 15%;
    }

    .spinner-ring:nth-child(3) {
      border-bottom-color: #f093fb;
      animation-delay: 0.3s;
      width: 40%;
      height: 40%;
      top: 30%;
      left: 30%;
    }

    .spinner-inner {
      position: absolute;
      width: 20px;
      height: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      animation: pulse 1s ease-in-out infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg) scale(1); }
      50% { transform: rotate(180deg) scale(0.8); }
      100% { transform: rotate(360deg) scale(1); }
    }

    @keyframes pulse {
      0%, 100% { transform: translate(-50%, -50%) scale(1); }
      50% { transform: translate(-50%, -50%) scale(1.2); }
    }

    .loading-text {
      color: #6b7280;
      font-size: 14px;
      font-weight: 500;
      margin: 0;
      animation: fadeInOut 2s ease-in-out infinite;
    }

    @keyframes fadeInOut {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }

    .fade-in {
      animation: fadeIn 0.3s ease-in-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class PagesComponent implements OnInit {

  public menu: IMenuOptions[] = MENU_ITEMS;
  public loading: boolean = false;
  public loadingMessage: string = 'Carregando...';

  // Mensagens de loading variadas para melhor UX
  private loadingMessages: string[] = [
    'Carregando...',
    'Preparando ambiente...',
    'Quase lá...',
    'Organizando dados...',
    'Finalizando...'
  ];
  private messageIndex: number = 0;
  private messageInterval: any;

  constructor(
    private _: PagesService,
    private authService: AuthService,
    private scannerService: ScannerService,
    private settingsService: SettingsService,
    private cdr: ChangeDetectorRef
  ) {

    if (this.isEnable) {
      this.setupSettings();
      this.setupScanner();
      this.setupLoader();
    }
  }

  public ngOnInit(): void {

    if (this.isEnable) {
      this.initMenuItems();
      this.refreshMenuItems();
    }
  }

  public ngOnDestroy(): void {
    // Limpar interval ao destruir componente
    if (this.messageInterval) {
      clearInterval(this.messageInterval);
    }
  }

  // Getters and setter methods

  public get isEnable() {

    const path = (window.location.pathname.split("/")[window.location.pathname.split("/").length - 1]);

    if (path == "login" || path == "recuperar-senha" || !this.authService.isLogged()) {
      return false;
    }

    return true;
  }

  // Auxiliary Methods

  private setupScanner() {

    if (!this.scannerService.isInitialized) {
      this.scannerService.initialize();
    }
  }

  private setupSettings() {

    this.settingsService.getSettings('PagesComponent', (data) => {

      if (data.general) {

        if (data.general?.language != Utilities.localStorage('Language')) {

          Utilities.localStorage('Language', data.general.language);

          Dispatch.emit('language', {});
          Dispatch.emit('refresh-menu', {});
        }

        if (data.general?.currency != Utilities.localStorage('Currency')) {
          Utilities.localStorage('Currency', data.general.currency);
        }
      }

      if (data.stock) {

        if (data.stock?.averagePurchaseCost != Utilities.localStorage('StockAveragePurchaseCost')) {
          Utilities.localStorage('StockAveragePurchaseCost', data.stock.averagePurchaseCost);
        }

        if (data.stock?.averageTransfersCost != Utilities.localStorage('StockAverageTransfersCost')) {
          Utilities.localStorage("StockAverageTransfersCost", data.stock.averageTransfersCost);
        }
      }

      if (data.cashier) {

        if (data.cashier?.operationalMode != Utilities.localStorage('CashierOperationalMode')) {
          Utilities.localStorage('CashierOperationalMode', data.cashier.operationalMode);
        }

        if (data.cashier?.warrantyTerm != Utilities.localStorage('CashierWarrantyTerm')) {
          Utilities.localStorage("CashierWarrantyTerm", data.cashier.warrantyTerm);
        }
      }

      if (data.serviceOrders) {

        if (data.serviceOrders?.warrantyTerm != Utilities.localStorage("ServiceOrderWarrantyTerm")) {
          Utilities.localStorage("ServiceOrderWarrantyTerm", data.serviceOrders.warrantyTerm);
        }

        if (data.serviceOrders?.deliveryTerm != Utilities.localStorage("ServiceOrderDeliveryTerm")) {
          Utilities.localStorage("ServiceOrderDeliveryTerm", data.serviceOrders.deliveryTerm);
        }
      }

      if (data.registers) {

        if (data.registers?.restrictCustomerRegistration != Utilities.localStorage('RegistersRestrictCustomerRegistration')) {
          Utilities.localStorage('RegistersRestrictCustomerRegistration', JSON.stringify(typeof data.registers.restrictCustomerRegistration == 'object' ? data.registers.restrictCustomerRegistration : ''));
        }
      }

    });
  }

  private setupLoader() {

    Utilities.loadingObserver.on(null, (loading) => {
      // Usar setTimeout para evitar ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => {
        this.loading = loading;

        if (loading) {
          // Iniciar rotação de mensagens
          this.messageIndex = 0;
          this.loadingMessage = this.loadingMessages[0];

          this.messageInterval = setInterval(() => {
            this.messageIndex = (this.messageIndex + 1) % this.loadingMessages.length;
            this.loadingMessage = this.loadingMessages[this.messageIndex];
            this.cdr.detectChanges();
          }, 2000);
        } else {
          // Parar rotação de mensagens
          if (this.messageInterval) {
            clearInterval(this.messageInterval);
            this.messageInterval = null;
          }
        }

        this.cdr.detectChanges();
      });
    });
  }

  // Utility Methods

  private initMenuItems() {

    const interval = setInterval(() => {

      const menu = setupMenu();

      if (menu.length > 0) {
        clearInterval(interval);
        this.menu = menu;
      }
    });
  }

  private refreshMenuItems() {

    Dispatch.onRefreshCurrentUserPermissions('PagesComponent', () => {

      const itemSelected = this.getSelectedMenuItem();

      setTimeout(() => {
        this.menu = setupMenu();
        this.setSelectedMenuItem(itemSelected);
      }, 500);
    });
  }

  private getSelectedMenuItem() {

    let checkSelected: boolean = false;
    let itemSelected: any = {};

    $$(this.menu).map((_, item) => {

      if (item.selected) {

        if (!item.children) {
          item.level = 'root';
          itemSelected = item;
        } else {

          $$(item.children).map((_, child) => {
            if (child.selected) {
              itemSelected = child;
              return true;
            }
          });
        }

        checkSelected = true;
      }

      if (checkSelected) {
        return true;
      }
    });

    return itemSelected;
  }

  private setSelectedMenuItem(data: any) {

    if (data.level == 'root') {

      $$(this.menu).map((_, item) => {
        item.selected = (item.link == data.link);
      });
    } else {

      $$(this.menu).map((_, item) => {

        $$(item.children).map((_, child) => {

          if (child.link == data.link) {

            child.selected = true;

            item.selected = true;
            item.expanded = true;
          }

          if (!child.parent) {
            child.parent = item;
            child.pathMatch = 'full';
          }
        });
      });
    }
  }

}