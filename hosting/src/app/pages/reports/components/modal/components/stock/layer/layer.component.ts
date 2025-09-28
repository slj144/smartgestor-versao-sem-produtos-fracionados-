import { Component, Output, EventEmitter, OnInit } from '@angular/core';

// Translate
import { StockReportsTranslate } from '../stock.translate';

// Ultilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';

@Component({
  selector: 'stock-layer',
  templateUrl: './layer.component.html',
  styleUrls: ['./layer.component.scss']
})
export class StockReportsLayerComponent implements OnInit {

  @Output() callback: EventEmitter<any> = new EventEmitter();

  public translate = StockReportsTranslate.get();

  public settings: any = {};

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // Operating Data

  public onExportXLS() {

    let filename = '';

    if (this.settings.id == 'resume') {
      filename = `Relatório de Caixa - Resumo`;
    }

    Utilities.exportXSL({
      name: filename,
      html: document.getElementById('report').innerHTML
    });
  }

  // Layer Actions

  public onOpen(settings: any) {

    const body = $$('#container-modal-body');

    const sideLayer = $$('#sideLayer');
    sideLayer.addClass('active');

    if (body.length > 0) {
      body[0].scrollTop = 0;
      body[0].style.overflowY = 'hidden';
    }

    this.settings = (() => {
      settings.balance = this.calcBalance(settings.id, settings.type, settings.data);
      return settings;
    })();
  }

  public onClose() {

    const body = $$('#container-modal-body');

    const sideLayer = $$('#sideLayer');
    sideLayer.removeClass('active');

    if (body.length > 0) {
      body[0].style.overflowY = 'auto';
    }
  }

  // Auxiliary Methods

  public onCheckColspan() {
    return ((this.settings.fields).length + 2);
  }

  public onCheckField(id: string): boolean {
    return ((<string[]>this.settings.fields).indexOf(id) != -1);
  }

  private calcBalance(id: string, type: string = null, data: any = []) {

    let balance: any = {};

    if (id == 'products') {

      if (type == 'default') {

        balance = {
          quantity: 0, totalCost: 0,
          totalSale: 0, contributionMargin: 0
        };

        for (const item of data) {
          balance.quantity += item.quantity;
          balance.totalCost += item.totalCost;
          balance.totalSale += item.totalSale;
          balance.contributionMargin += item.contributionMargin;
        }
      }
    }
    if (id == 'validity') {
      balance = { quantity: 0 };

      for (const item of data) {
        balance.quantity += item.quantity;
      }
    }
    if (id == 'purchases') {

      if (type == 'completedPurchases') {

        balance = {
          totalCost: 0, totalSale: 0,
          purchaseAmount: 0, contributionMargin: 0
        };

        for (const item of data) {
          balance.totalCost += item.totalCost;
          balance.totalSale += item.totalSale;
          balance.purchaseAmount += item.purchaseAmount;
          balance.contributionMargin += item.contributionMargin;
        }
      }

      if (type == 'pendingPurchases') {

        balance = {
          totalCost: 0, totalSale: 0,
          purchaseAmount: 0, contributionMargin: 0
        };

        for (const item of data) {
          balance.totalCost += item.totalCost;
          balance.totalSale += item.totalSale;
          balance.purchaseAmount += item.purchaseAmount;
          balance.contributionMargin += item.contributionMargin;
        }
      }

      if (type == 'purchasedProducts') {

        balance = {
          quantity: 0, totalCost: 0,
          totalSale: 0, contributionMargin: 0
        };

        for (const item of data) {
          balance.quantity += item.quantity;
          balance.totalCost += item.totalCost;
          balance.totalSale += item.totalSale;
          balance.contributionMargin += item.contributionMargin;
        }
      }
    }

    if (id == 'transfers') {

      if (type == 'completedTransfers') {

        balance = {
          totalCost: 0, totalSale: 0,
          transferAmount: 0
        };

        for (const item of data) {
          balance.totalCost += item.totalCost;
          balance.totalSale += item.totalSale;
          balance.transferAmount += item.transferAmount;
        }
      }

      if (type == 'pendingTransfers') {

        balance = {
          totalCost: 0, totalSale: 0,
          transferAmount: 0
        };

        for (const item of data) {
          balance.totalCost += item.totalCost;
          balance.totalSale += item.totalSale;
          balance.transferAmount += item.transferAmount;
        }
      }

      if (type == 'transferedProducts') {

        balance = {
          quantity: 0, totalCost: 0,
          totalSale: 0
        };

        for (const item of data) {
          balance.quantity += item.quantity;
          balance.totalCost += item.totalCost;
          balance.totalSale += item.totalSale;
        }
      }
    }

    return balance;
  }
  public expirationStatus(date: string): string {
    if (!date) { return ''; }
    const now = new Date();
    const exp = new Date(date);
    if (exp < now) { return 'expired'; }
    const diff = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diff <= 30) { return 'near-expiry'; }
    return '';
  }

}
