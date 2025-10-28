// Arquivo: selector.component.ts
// Localização: src/app/pages/stock/products/components/selector/selector.component.ts

import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

// Services
import { ProductsService } from '../../products.service';
import { AlertService } from '@shared/services/alert.service';

// Translate
import { ProductsSelectorTranslate } from './selector.translate';

// Interfaces
import { IStockProduct } from '@shared/interfaces/IStockProduct';

// Types
import { query } from '@shared/types/query';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';

@Component({
  selector: 'products-selector',
  templateUrl: './selector.component.html',
  styleUrls: ['./selector.component.scss']
})
export class ProductsSelectorComponent implements OnInit {

  @Output() callback: EventEmitter<any> = new EventEmitter();
  @ViewChild('searchBar', { static: true }) searchBar: ElementRef;

  public static shared: ProductsSelectorComponent;

  public translate = ProductsSelectorTranslate.get();

  public loading: boolean = false;
  public filtersBadge: number = 0;
  public settings: any = {};
  public recordsData: any = [];
  public searchText: string = '';
  public productsPreSelected: any = [];
  public productsSelected: any = [];
  // Debounce controller for incremental search (typing)
  private searchDebounce: any;
  private searchToken = 0;

  public get useDepartments(): boolean {
    return Utilities.stockDepartmentsEnabled;
  }

  constructor(
    private productsService: ProductsService,
    private alertService: AlertService
  ) {
    ProductsSelectorComponent.shared = this;
  }

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // Initialize Method

  public bootstrap(settings: { selectAll?: boolean, alertOutStock?: boolean }) {

    this.settings = (settings || {});
    this.settings.additional = this.settings.additional || {};
    this.settings.alertOutStock = this.settings.alertOutStock == undefined ? true : !!this.settings.alertOutStock;

    $$(this.searchBar.nativeElement).find('input')[0].focus();
  }

  // Filter Methods

  public onFilter() {

  }

  public onSearch(settings?: { where: query['where'], data?: any }, scanner?: boolean, alertOutStock: boolean = true, alertNotFound: boolean = true): Promise<IStockProduct[]> {

    return (new Promise((resolve, reject) => {

      const value = $$(this.searchBar.nativeElement).find('input').val().toLowerCase();

      if (!settings || !settings.where) {

        if (value != '') {

          this.loading = true;

          const values = [];
          let queryString = "";

          value.split(';').map((v) => {
            if (v.trim()) {
              values.push(v.trim().toLowerCase());
            }
          });

          settings = { where: [] };

          $$(values).map((_, inputVal) => {

            const raw = String(inputVal).trim();
            const isDigits = /^\d+$/.test(raw);

            if (isDigits) {
              // Código interno numérico
              settings.where.push({ field: 'code', operator: '=', value: parseInt(raw, 10) });

              // Códigos de barras numéricos (EAN/UPC) também aceitam como barcode string
              if (raw.length >= 8) {
                settings.where.push({ field: 'barcode', operator: '=', value: raw });
                // AutoBarcode: tenta também remover os últimos 4 dígitos
                if (raw.length < 13) {
                  const truncated = raw.substring(0, raw.length - 4);
                  if (/^\d+$/.test(truncated)) {
                    settings.where.push({ field: 'code', operator: '=', value: parseInt(truncated, 10) });
                  }
                }
              }

              // Possíveis campos alternativos que podem ser numéricos
              settings.where.push({ field: 'internalCode', operator: '=', value: raw });
              settings.where.push({ field: 'serialNumber', operator: '=', value: raw });
              settings.where.push({ field: 'batch', operator: '=', value: raw });
              settings.where.push({ field: 'provider.code', operator: '=', value: raw });
            } else {

              // Alfanumérico: tentar campos alternativos diretos
              settings.where.push({ field: 'barcode', operator: '=', value: raw });
              settings.where.push({ field: 'internalCode', operator: '=', value: raw });
              settings.where.push({ field: 'serialNumber', operator: '=', value: raw });
              settings.where.push({ field: 'batch', operator: '=', value: raw });
              settings.where.push({ field: 'provider.code', operator: '=', value: raw });

              // Busca por nome com curingas (*fr* para contém)
              let parts = raw.split("*")
              const startString = parts[0].trim();
              parts.shift();

              queryString += startString;

              parts.forEach((str) => {
                str = str.trim()
                  .replace(/\-/g, "\-")
                  .replace(/\\/g, "\\")
                  .replace(/\//g, "\/")
                  .replace(/\_/g, "\_")
                  .replace(/\%/g, "\%")
                  .replace(/\$/g, "\$")
                  .replace(/\@/g, "\@")
                  .replace(/\!/g, "\!")
                  .replace(/\(/g, "\(")
                  .replace(/\)/g, "\)")
                  .replace(/\[/g, "\[")
                  .replace(/\]/g, "\_")
                  .replace(/\{/g, "\{")
                  .replace(/\}/g, "\}")
                  .replace(/\:/g, "\:")
                  .replace(/\,/g, "\,")
                  .replace(/\./g, "\.");
                queryString += "[\\w\\W\\s]*" + `${str}`;
              });

              if (queryString.length > 0) {
                queryString += "[\\w\\W\\s]*";
                settings.where.push({ field: 'name', operator: 'like', value: new RegExp(queryString, 'gi') });
              }
            }
          });

        } else {

          this.recordsData = [];
          this.searchText = '';

          return;
        }
      }

      // Regras de performance:
      // - Se houver busca por nome (like/regex), exige ao menos 3 caracteres úteis.
      // - Usa strict=true para evitar varredura em lotes (respeita limit do service).
      // - Para scanner/igualdade, também usa strict=true (respostas mais rápidas e capadas por limit).

      const hasLike = (settings.where || []).some((w: any) => w?.operator === 'like');
      const onlyEquals = (settings.where || []).every((w: any) => w?.operator === '=');

      if (!scanner && hasLike) {
        const plain = String(value || '').replace(/\*/g, '').trim();
        if (plain.length < 3) {
          this.recordsData = [];
          this.searchText = value;
          this.loading = false;
          resolve([]);
          return;
        }
      }

      // strict=true (último booleano) e flex=true para manter OR quando necessário
      this.loading = true;
      this.productsService.query(settings.where, true, true, false, true).then((data) => {

        if (data.length > 0) {

          $$(data).map((key, item) => {
            if (item._isDisabled) { data.splice(key, 1) }
          });

          if (scanner) {

            $$(data).map((_, item) => {

              $$(this.productsSelected).map((_, product) => {
                if (item.code == product.code) {
                  const allowNegative = (() => { try { return !!JSON.parse(String(Utilities.localStorage('StockAllowNegativeSale') || 'false')); } catch { return !!Utilities.localStorage('StockAllowNegativeSale'); } })();
                  if (allowNegative || (product.selectedItems < item.quantity)) {
                    product.selectedItems += 1;
                  }
                }
              });

              this.onSelectProduct(item, false, alertOutStock);
            });
          }
        } else if (alertNotFound) {

          this.alertService.alert(this.translate.alert.notFound, 'warning');
        }

        // Limita a renderização a um lote razoável (o service já limita por paginação)
        this.recordsData = data;
        this.searchText = value;

        this.loading = false;

        resolve(data);
      }).catch((error) => {
        reject(error);
      });
    }));
  }

  // Input incremental com debounce: não altera o comportamento de Enter/Scanner
  public onSearchInput(ev?: Event) {
    clearTimeout(this.searchDebounce);
    const token = ++this.searchToken;
    this.searchDebounce = setTimeout(() => {
      // Evita corrida entre timeouts
      if (token !== this.searchToken) { return; }
      this.onSearch().catch(() => {});
    }, 300);
  }

  // Operating Actions

  public onResetSearchBar() {

    this.recordsData = [];
    this.searchText = '';

    $$(this.searchBar.nativeElement).find('input').val('');
  }

  public onSelectProduct(data: any, preSelect: boolean = false, alertOutStock: boolean = true) {

    this.settings.alertOutStock = this.settings.alertOutStock == undefined ? alertOutStock : !!this.settings.alertOutStock;

    if (preSelect) {
      data.reserve = data.selectedItems;
    } else {
      // Allow negative stock when configured: bypass out-of-stock alert
      const allowNegativeFlag = (() => {
        try { return !!JSON.parse(String(Utilities.localStorage('StockAllowNegativeSale') || 'false')); } catch { return !!Utilities.localStorage('StockAllowNegativeSale'); }
      })();

      if (!allowNegativeFlag) {
        if (!this.settings.selectAll && (data.quantity <= 0) && this.settings.alertOutStock) {
          this.alertService.alert(this.translate.alert.outOfStock, 'warning');
          return;
        }
      }
    }

    if (this.productsSelected.length > 0) {

      let index = -1;
      let c = 0;

      for (const item of this.productsSelected) {
        if (item.code == data.code) { index = c }
        c++;
      }

      if (index == -1) {
        this.productsSelected.push(data);
        data.selected = true;
      }
    } else {
      this.productsSelected.push(data);
      data.selected = true;
    }

    for (let item of this.productsSelected) {
      item.selectedItems = (item.selectedItems || 1);
    }

    this.callback.emit({ data: this.productsSelected, additional: this.settings.additional });
  }

  public onDeselectProduct(data: IStockProduct) {

    const productsSelected = [];

    for (let item of this.productsSelected) {
      if (item.code != data.code) {
        productsSelected.push(item);
      }
    }

    data.selected = false;
    delete data.selectedItems;

    this.productsSelected = productsSelected;

    this.callback.emit({ data: this.productsSelected, additional: this.settings.additional });
  }

  // Auxiliary Methods

  public selectProducts(data: any[]) {

    const settings: { where: query['where'] } = { where: [] };

    $$(data).map((_, item) => {
      settings.where.push({ field: 'code', operator: '=', value: parseInt(item.code) });
    });

    this.onSearch(settings).then((result) => {

      const products = (() => {

        const map: Record<string, any> = {};

        $$(data).map((_, item) => {

          const rawCode = String(item.code ?? '');
          const normalizedCode = Utilities.prefixCode(rawCode);
          const numericCode = parseInt(rawCode, 10);

          // Preserve original data so we can use it after selecting
          const payload = { ...item, code: normalizedCode };

          if (normalizedCode) {
            map[normalizedCode] = payload;
          }

          if (rawCode) {
            map[rawCode] = payload;
          }

          if (!isNaN(numericCode)) {
            map[String(numericCode)] = payload;
          }
        });

        return map;
      })();

      $$(result).map((_, item) => {

        const candidateCodes: string[] = [];

        const normalized = Utilities.prefixCode(item.code);
        const raw = String(item.code ?? '');
        const numeric = parseInt(raw, 10);

        if (normalized) {
          candidateCodes.push(normalized);
        }

        if (raw) {
          candidateCodes.push(raw);
        }

        if (!isNaN(numeric)) {
          candidateCodes.push(String(numeric));
        }

        let product: any = null;

        for (const codeKey of candidateCodes) {
          if (products[codeKey]) {
            product = products[codeKey];
            break;
          }
        }

        // If we didn't find a matching product, fall back to the original search item
        const source = product || {};

        const sourceQuantity = source.quantity ?? source.selectedItems ?? item.selectedItems ?? 0;
        const shareUnit = typeof source.freightShareUnit === 'number'
          ? source.freightShareUnit
          : ((typeof source.freightShare === 'number' && sourceQuantity) ? (source.freightShare / sourceQuantity) : 0);
        const baseCost = typeof source.baseCostPrice === 'number'
          ? source.baseCostPrice
          : Math.max((source.costPrice ?? item.costPrice ?? 0) - shareUnit, 0);

        item.code = normalized || raw;
        item.costPrice = baseCost + shareUnit;
        item.baseCostPrice = baseCost;
        item.freightShare = typeof source.freightShare === 'number' ? source.freightShare : (shareUnit * sourceQuantity);
        item.freightShareUnit = shareUnit;
        item.selectedItems = sourceQuantity;
        item.unitaryPrice = source.unitaryPrice ?? item.unitaryPrice;
        item.salePrice = source.salePrice ?? item.salePrice;

        this.onSelectProduct(item, true);
      });
    });
  }

  // MÉTODO NOVO - Limpa completamente a seleção de produtos
  public clearSelection(emit: boolean = true) {
    // Limpa os arrays de produtos selecionados
    this.productsSelected = [];
    this.productsPreSelected = [];

    // Limpa a propriedade selected de todos os produtos na lista
    if (this.recordsData && this.recordsData.length > 0) {
      this.recordsData.forEach((product: any) => {
        if (product.selected) {
          product.selected = false;
        }
        if (product.selectedItems) {
          delete product.selectedItems;
        }
        if (product.reserve) {
          delete product.reserve;
        }
      });
    }

    // Limpa checkboxes e classes CSS via DOM
    setTimeout(() => {
      try {
        // Busca todos os checkboxes marcados no componente
        const checkboxes = document.querySelectorAll('products-selector input[type="checkbox"]:checked');
        checkboxes.forEach((checkbox: any) => {
          checkbox.checked = false;
          // Dispara evento de mudança para atualizar o estado visual
          checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        });

        // Remove classes de seleção das linhas da tabela
        const selectedRows = document.querySelectorAll('products-selector .selected, products-selector tr.active, products-selector tr.bg-light');
        selectedRows.forEach(row => {
          row.classList.remove('selected', 'active', 'bg-light');
        });

        // Remove qualquer outro indicador visual de seleção
        const selectedItems = document.querySelectorAll('products-selector .item-selected, products-selector .product-selected');
        selectedItems.forEach(item => {
          item.classList.remove('item-selected', 'product-selected');
        });

      } catch (e) {
        console.log('Erro ao limpar elementos DOM:', e);
      }
    }, 100);

    // Emite evento informando que a seleção foi completamente limpa
    if (emit) {
      this.callback.emit({ data: [] });
    }
  }

  // Utility Methods - MÉTODO ATUALIZADO
  public reset(emit: boolean = true) {
    // Chama o método clearSelection para limpar tudo
    this.clearSelection(emit);

    // Limpa também os dados de busca se necessário
    this.recordsData = [];
    this.searchText = '';

    // Limpa o campo de busca
    if (this.searchBar && this.searchBar.nativeElement) {
      $$(this.searchBar.nativeElement).find('input').val('');
    }

    // Reseta configurações
    this.settings = {};
    this.filtersBadge = 0;
    this.loading = false;
  }

  // trackBy para manter DOM estável na lista de resultados
  public trackByProductCard(_: number, item: any) { return item?._id || item?.code || _; }

}
