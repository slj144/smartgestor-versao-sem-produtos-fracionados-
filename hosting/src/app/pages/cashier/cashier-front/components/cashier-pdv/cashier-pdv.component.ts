/*
  📁 ARQUIVO: cashier-pdv.component.ts
  📂 LOCALIZAÇÃO: src/app/pages/cashier/cashier-front/components/cashier-pdv/
  🎯 FUNÇÃO: Componente TypeScript do PDV - Contém toda a lógica de negócio do ponto de venda
  ✨ MODIFICAÇÕES: 
     1. Adicionado campo warranty no data e no resetPanel
     2. Adicionado warranty no método composeData
     3. Adicionado método setWarranty para botões de sugestão
     4. Adicionado Modal de alerta ao fechar venda PENDENTE (não faturada)
*/

import { Component, OnInit, OnDestroy, Output, Input, HostListener, ViewChild, ElementRef } from '@angular/core';

// Components
import { ProductsSelectorComponent } from '../../../../stock/products/components/selector/selector.component';
import { PaymentMethodsSelectorComponent } from '../../../../registers/paymentMethods/components/selector/selector.component';
import { CashierFrontReceiptsComponent } from '../cashier-receipts/cashier-receipts.component';

// Services
import { CashierFrontPDVService } from './cashier-pdv.service';
import { ScannerService } from '@shared/services/scanner.service';
import { DataBridgeService } from '@shared/services/data-bridge.service';

// Translate
import { CashierFrontPDVTranslate } from './cashier-pdv.translate';

// Interfaces
import { ICashierSale, ECashierSaleStatus, ECashierSaleOrigin } from '@shared/interfaces/ICashierSale';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { FieldMask } from '@shared/utilities/fieldMask';
import { NotificationService } from '@shared/services/notification.service';
import { ENotificationStatus } from '@shared/interfaces/ISystemNotification';
import { DateTime } from '@shared/utilities/dateTime';
import { EFinancialBillToReceiveOrigin, EFinancialBillToReceiveStatus, FinancialBillToReceiveCategoryDefault, EFinancialBillToReceiveDebtorType } from '@shared/interfaces/IFinancialBillToReceive';

import onScan from 'onscan.js';

@Component({
  selector: 'cashier-front-pdv',
  templateUrl: './cashier-pdv.component.html',
  styleUrls: ['./cashier-pdv.component.scss']
})
export class CashierFrontPDVComponent implements OnInit, OnDestroy {

  public static shared: CashierFrontPDVComponent;

  @Input() permissions;

  public translate = CashierFrontPDVTranslate.get();

  public loading: boolean = true;
  public data: any = {};
  public source: any = {};
  public settings: any = {};
  public loadingProducts: boolean = true;
  public sending: boolean = false;
  public saleCompleted: boolean = false;

  public isAdmin: boolean = Utilities.isAdmin;

  private layerComponent: any;

  /*
    🆕 ATALHOS DO TECLADO (F1/F2) E MODAL DE QUANTIDADE
    - Implementação não-invasiva que reutiliza a lógica atual.
    - `settings.quantityModal` controla a exibição/estado do modal de quantidade.
  */
  // 'settings' já existe na classe; reutilizamos para estado do modal
  // Estado do modal de quantidade (abre via F1)
  private getQuantityModal() {
    this.settings = this.settings || {};
    this.settings.quantityModal = this.settings.quantityModal || { open: false, value: 1 };
    return this.settings.quantityModal;
  }

  // Input de quantidade (referência do template) para focar automaticamente ao abrir o modal
  @ViewChild('quantityInput') private quantityInputRef?: ElementRef<HTMLInputElement>;

  constructor(
    private cashierFrontPDVService: CashierFrontPDVService,
    private dataBridgeService: DataBridgeService,
    private scannerService: ScannerService,
    private notificationService: NotificationService,
  ) {
    CashierFrontPDVComponent.shared = this;
  }

  public ngOnInit() {

    // setTimeout(()=>{
    //   //  onScan.simulate(document, "00112024");
    //   //  onScan.simulate(document, "00052024");
    //   //  onScan.simulate(document, "00052024");
    // }, 1000);

    if (this.dataBridgeService.getData('ServiceOrder')) {

      const code: number = (<any>this.dataBridgeService.getData('ServiceOrder')).saleCode;

      if (code) {

        this.cashierFrontPDVService.getSale(code).then((data) => {
          if (data) {
            this.onOpenSale(data);
          }
        });
      }

    } else {
      // 🆕 SE NÃO ESTÁ EDITANDO UMA VENDA, DEFINE CONSUMIDOR FINAL
      this.setDefaultCustomer();
    }
    this.scannerSettings();
    this.generateBalance();

    // Preferência de alerta de venda pendente
    this.settings = this.settings || {};
    this.settings.pendingSaleModalEnabled = this.isPendingAlertEnabled();
  }

  /*
    🆕 HostListener: Atalhos do teclado no PDV
    - F1: Abre modal grande para informar quantidade do último produto do carrinho
    - F2: Abre o seletor de formas de pagamento (mesma lógica do botão já existente)
    Obs.: Não altera a lógica de negócios; apenas dispara as rotinas já existentes.
  */
  @HostListener('window:keydown', ['$event'])
  public onGlobalKeyDown(event: KeyboardEvent) {
    // Ignora quando um input/select/textarea está em foco para não atrapalhar a digitação do usuário
    const tag = (event.target as HTMLElement)?.tagName?.toLowerCase();
    const isTyping = tag === 'input' || tag === 'textarea' || tag === 'select' || (event as any).isComposing;
    if (isTyping) {
      return;
    }

    const key = event.key;
    const code = (event as any).code as string || '';
    const isDigit1 = key === '1' || code === 'Digit1' || code === 'Numpad1';
    const isDigit2 = key === '2' || code === 'Digit2' || code === 'Numpad2';
    const isDigit3 = key === '3' || code === 'Digit3' || code === 'Numpad3';
    const isDigit4 = key === '4' || code === 'Digit4' || code === 'Numpad4';

    // Atalhos compatíveis com macOS:
    // - F1 / F2 (em Macs, pode ser necessário segurar Fn)
    // - ⌘+1, Alt+1, Ctrl+1 => Quantidade
    // - ⌘+2, Alt+2, Ctrl+2 => Pagamento

    const quantityShortcut = (key === 'F1') || (event.ctrlKey && isDigit1);
    const paymentShortcut = (key === 'F2') || (event.ctrlKey && isDigit2);
    const productsShortcut = (key === 'F3') || (event.ctrlKey && isDigit3);
    const finishShortcut = (key === 'F4') || (event.ctrlKey && isDigit4);

    if (quantityShortcut) {
      event.preventDefault();
      this.onOpenQuantityModal();
      return;
    }

    if (paymentShortcut) {
      event.preventDefault();
      this.onOpenLayer('paymentMethods');
      return;
    }

    if (productsShortcut) {
      event.preventDefault();
      this.onOpenLayer('products');
      return;
    }

    if (finishShortcut) {
      // Respeita as mesmas validações do botão de concluir
      const canRegister = !this.sending
        && (!!this.data?.customer || !!this.data?.member)
        && (!!this.data?.service?.code || ((this.data?.products?.length || 0) > 0))
        && (this.settings?.paymentMethods?.status != 'REFUSED');

      event.preventDefault();

      if (canRegister) {
        this.onRegister();
      } else {
        this.notificationService.create({
          title: 'Não é possível concluir',
          description: 'Verifique cliente/produtos e pagamento antes de finalizar (F4).',
          status: ENotificationStatus.info
        });
      }
      return;
    }
  }

  // Getter and Setter Methods

  public get companyProfile() {
    return Utilities.companyProfile;
  }

  // User Interface Action - Common

  public onApplyPrice(data: any, inputField: any, type: string) {

    const value = FieldMask.priceFieldMask(inputField.value);

    if (type == 'product') {
      data.unitaryPrice = (parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0);
      inputField.value = value;
    }

    if (type == 'service') {
      data.customPrice = (parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0);
      inputField.value = value;
    }

    this.generateBalance();
  }

  // User Interface Actions - Sales

  public onOpenSale(data: ICashierSale) {

    this.onResetPanel(true);  // 🆕 MODIFICADO - passa true para manter o cliente

    this.data = Utilities.deepClone(data);
    this.source = Utilities.deepClone(data);

    if (this.data?.products?.length > 0) {
      ProductsSelectorComponent.shared.selectProducts(data.products);
    }

    if (this.data?.service?.types?.length > 0) {
      for (const item of (<any[]>this.data.service.types)) {
        item.customPrice = item.executionPrice;
      }
    }

    if (this.data?.paymentMethods?.length > 0) {
      PaymentMethodsSelectorComponent.shared.selectMethods(this.data.paymentMethods);
    }

    if (this.data.balance) {
      delete this.data.balance;
    }

    this.generateBalance();
  }

  // User Interface Actions - Products

  public onQuickSearch(input: any) {

    let value = $$(input).val();

    if (value != '') {

      Utilities.loading();

      const raw = String(value).trim();
      const isDigits = /^\d+$/.test(raw);
      const where: any[] = [];

      // Tenta pelos campos mais comuns
      where.push({ field: 'barcode', operator: '=', value: raw });
      where.push({ field: 'internalCode', operator: '=', value: raw });
      where.push({ field: 'serialNumber', operator: '=', value: raw });
      where.push({ field: 'batch', operator: '=', value: raw });
      where.push({ field: 'provider.code', operator: '=', value: raw });

      if (isDigits) {
        // code numérico direto
        where.push({ field: 'code', operator: '=', value: parseInt(raw, 10) });

        // AutoBarcode: etiquetas que embutem 4 dígitos no final
        if (raw.length >= 8 && raw.length < 13) {
          const truncated = raw.substring(0, raw.length - 4);
          if (/^\d+$/.test(truncated)) {
            where.push({ field: 'code', operator: '=', value: parseInt(truncated, 10) });
          }
        }
      }

      ProductsSelectorComponent.shared.onSearch({ where, data: { barcode: raw } }, true).then(() => {
        // Clear the quick search input after a successful search
        $$('.products-card .quick-search input').val('');
        Utilities.loading(false);
      });
    }
  }

  public onDeleteProductItem(index: number) {

    ProductsSelectorComponent.shared.onDeselectProduct(this.data.products[index]);
    // this.data.products.splice(index, 1);

    this.generateBalance();
  }

  /*
    🆕 Modal de Quantidade
    - Abre um modal simples e focado para o operador informar a quantidade de forma rápida (atalho F1).
    - Aplica a quantidade no último item do carrinho (padrão comum em PDVs).
    - Sem itens no carrinho, exibe uma notificação e mantém a lógica intacta.
  */
  public onOpenQuantityModal() {
    const hasProducts = this.data?.products && this.data.products.length > 0;
    if (!hasProducts) {
      this.notificationService.create({
        title: 'Carrinho vazio',
        description: 'Adicione um produto antes de definir a quantidade (F1).',
        status: ENotificationStatus.warning
      });
      return;
    }

    const modal = this.getQuantityModal();
    const last = this.data.products[this.data.products.length - 1];
    modal.value = last?.selectedItems || 1;
    modal.open = true;

    // Foca automaticamente no input assim que o modal renderizar
    setTimeout(() => {
      const el = this.quantityInputRef?.nativeElement;
      if (el) {
        el.focus();
        try { el.select(); } catch {}
      }
    }, 0);
  }

  public onConfirmQuantityModal(valueInput?: HTMLInputElement) {
    const modal = this.getQuantityModal();
    const raw = (valueInput?.value ?? modal.value) as any;
    // Garante número inteiro >= 1
    let qty = parseInt(String(raw).replace(/\D/g, ''), 10);
    if (!qty || qty < 1) { qty = 1; }

    if (this.data?.products && this.data.products.length > 0) {
      const last = this.data.products[this.data.products.length - 1];
      // Respeita configuração de estoque negativo
      const allowNegative = (() => { try { return !!JSON.parse(String(Utilities.localStorage('StockAllowNegativeSale') || 'false')); } catch { return !!Utilities.localStorage('StockAllowNegativeSale'); } })();
      if (!allowNegative) {
        const available = parseInt(String(last?.quantity || 0), 10) || 0;
        if (available <= 0) {
          // Sem estoque disponível: alerta e mantém quantidade anterior (não aplica alteração)
          this.notificationService.create({
            title: 'Sem estoque disponível',
            description: 'Produto sem saldo em estoque. Ajuste a quantidade ou verifique disponibilidade.',
            status: ENotificationStatus.warning
          });
          // Não altera a quantidade atual
          if (valueInput) { valueInput.value = String(last?.selectedItems || 1); }
          modal.open = false;
          return;
        } else {
          if (qty > available) {
            // Alerta quando solicitado > disponível
            this.notificationService.create({
              title: 'Quantidade maior que o estoque',
              description: `Disponível: ${available}. A quantidade foi ajustada.`,
              status: ENotificationStatus.warning
            });
            qty = available;
          }
        }
        if (valueInput) { valueInput.value = String(qty); }
      }
      last.selectedItems = qty;
      // Corrige também o campo visível se o input inline estiver renderizado
      this.generateBalance();
    }

    modal.open = false;
  }

  public onCloseQuantityModal() {
    const modal = this.getQuantityModal();
    modal.open = false;
  }

  // 🆕 Sanitiza o input de quantidade enquanto o usuário digita (template não suporta RegExp literal)
  public onQuantityInput(inputEl: HTMLInputElement) {
    const raw = (inputEl?.value || '').replace(/\D/g, '');
    inputEl.value = raw;
    const modal = this.getQuantityModal();
    modal.value = parseInt(raw || '0', 10) || 1;
  }

  public onApplyQuantity(data: any, inputField: any) {

    const value = inputField.value;
    // If negative stock sale is allowed, do not cap by available quantity
    const allowNegative = (() => { try { return !!JSON.parse(String(Utilities.localStorage('StockAllowNegativeSale') || 'false')); } catch { return !!Utilities.localStorage('StockAllowNegativeSale'); } })();
    const requested = parseInt(String(value).replace(/\D/g, ''), 10) || 1;
    const quantity = allowNegative
      ? FieldMask.numberFieldMask(value, 1, null)
      : FieldMask.numberFieldMask(value, 1, data.quantity);

    inputField.value = quantity;
    data.selectedItems = quantity;

    if (!allowNegative) {
      const available = parseInt(String(data?.quantity || 0), 10) || 0;
      const applied = parseInt(String(quantity).replace(/\D/g, ''), 10) || 1;
      if (requested > available && applied === available) {
        this.notificationService.create({
          title: 'Quantidade maior que o estoque',
          description: `Disponível: ${available}. A quantidade foi ajustada.`,
          status: ENotificationStatus.warning
        });
      }
    }

    this.generateBalance();
  }

  public onApplyQuantityCorretion(data: any, inputField: any) {

    if (inputField.value == '') {

      inputField.value = 1;
      data.selectedItems = 1;

      this.generateBalance();
    }
  }

  // 🎯 MÉTODOS PARA SETAS DE QUANTIDADE
  public onIncreaseQuantity(data: any) {
    const currentQuantity = parseInt(String(data.selectedItems || 1), 10);
    const newQuantity = currentQuantity + 1;

    // Verificar estoque se necessário
    const allowNegative = (() => {
      try {
        return !!JSON.parse(String(Utilities.localStorage('StockAllowNegativeSale') || 'false'));
      } catch {
        return !!Utilities.localStorage('StockAllowNegativeSale');
      }
    })();

    if (!allowNegative && newQuantity > data.quantity) {
      this.notificationService.create({
        title: 'Quantidade maior que o estoque',
        description: `Disponível: ${data.quantity}. Não é possível aumentar mais.`,
        status: ENotificationStatus.warning
      });
      return;
    }

    data.selectedItems = newQuantity;
    this.generateBalance();
  }

  public onDecreaseQuantity(data: any) {
    const currentQuantity = parseInt(String(data.selectedItems || 1), 10);
    const newQuantity = Math.max(1, currentQuantity - 1); // Mínimo 1

    data.selectedItems = newQuantity;
    this.generateBalance();
  }

  // User Interface Actions - Payment Methods

  public onDeletePaymentItem(index: number) {
    PaymentMethodsSelectorComponent.shared.deselectMethod(this.data.paymentMethods[index]);
    this.checkPayment();
  }

  public onPaymentValue(data: any, inputField: any) {

    inputField.value = FieldMask.priceFieldMask(inputField.value);
    data.value = parseFloat(inputField.value != '' ? inputField.value.replace(/\./g, '').replace(',', '.') : 0);

    this.checkPayment();
  }

  public onPaymentParcel(data: any, selectField: any) {

    const parcel = selectField.value;

    for (const item of data.fees) {

      if (item.hasOwnProperty('selected')) {
        delete item.selected;
      }

      if (item.parcel == parcel) {
        item.selected = true;
      }
    }
  }

  public onPaymentNote(data: any, inputField: any) {

    const note = String(inputField.value).trim();

    if (note != '') {
      data.note = note;
    }

    if (data.note && note == '') {
      delete data.note;
    }
  }

  public onTogglePaymentNote(data: any) {
    data.hasNote = !data.hasNote;
  }

  // User Interface Actions - Balance

  public onToggleDropdown(target: any, data: any = null) {

    if (target == 'individualDiscount' && data) {
      data.dropdown = !data.dropdown ? true : false;
    } else {

      if (!this.data.dropdown) { this.data.dropdown = {} }

      if (target == 'balanceOptions') {
        this.data.dropdown.balanceOptions = !this.data.dropdown.balanceOptions ? true : false;
      }
    }
  }

  public onApplyDiscount(selectField: any, inputField: any) {

    let value: string;

    if (selectField.value == '$') {
      value = FieldMask.priceFieldMask(inputField.value);
      this.data.balance.discount = { type: '$', value: parseFloat((value || 0).toString().replace(/\./g, '').replace(',', '.')) }
    } else if (selectField.value == '%') {
      value = FieldMask.percentageFieldMask(inputField.value);
      this.data.balance.discount = { type: '%', value: parseFloat((value || 0).toString().replace(/\./g, '').replace(',', '.')) };
    }

    inputField.value = value;

    this.generateBalance();
  }

  public onApplyFee(selectField: any, inputField: any) {

    let value: string;

    if (selectField.value == '$') {
      value = FieldMask.priceFieldMask(inputField.value);
      this.data.balance.aditionalFee = { type: '$', value: parseFloat((value || 0).toString().replace(/\./g, '').replace(',', '.')) };
    } else if (selectField.value == '%') {
      value = FieldMask.percentageFieldMask(inputField.value);
      this.data.balance.aditionalFee = { type: '%', value: parseFloat((value || 0).toString().replace(/\./g, '').replace(',', '.')) };
    }

    inputField.value = value;

    this.generateBalance();
  }

  // 🆕 NOVO MÉTODO - Define garantia pelos botões de sugestão
  public setWarranty(value: string): void {
    this.data.warranty = value;
  }
  // 🆕 MÉTODO PARA BUSCAR E DEFINIR CONSUMIDOR FINAL
  private setDefaultCustomer(): void {
    // Busca o cliente "Consumidor Final" no banco
    this.cashierFrontPDVService.getDefaultCustomer().then((customer) => {
      if (customer) {
        // Define como cliente padrão
        this.data.customer = {
          code: customer.code,
          name: customer.name || 'Consumidor Final',
          personalDocument: customer.personalDocument || '',
          businessDocument: customer.businessDocument || '',
          address: customer.address || 'Não identificado',
          contacts: customer.contacts || {}
        };

        // Log para debug (pode remover depois)
        console.log('Cliente padrão definido:', this.data.customer);
      }
    }).catch((error) => {
      console.error('Erro ao buscar cliente padrão:', error);
    });
  }


  // User Interface Actions - General  

  public onRegister() {

    this.sending = true;

    const data = this.composeData();
    const source = this.composeSource();

    const operation = (!data.code ? 'register' : 'update');

    if (operation == "update" && Object.values(source || {}).length == 0) {

      this.notificationService.create({
        title: "Houve um erro inesperado. Por favor, tente novamente.",
        description: "Source Data not found",
        status: ENotificationStatus.danger
      });

      this.onResetPanel();
      return;
    }

    // console.log(data);
    // return;

    this.cashierFrontPDVService.registerSale(data, source, true).then((response: any) => {
      // 🆕 Aviso de venda pendente
      // Captura valores ANTES do reset para exibir no modal de alerta
      const wasPendent = (data.status === ECashierSaleStatus.PENDENT);
      const pendingValue = Number(this.settings?.paymentMethods?.pendent || 0);
      const saleTotal = Number((data as any)?.balance?.total || 0);

      if (source) {
        data.code = Utilities.prefixCode(data.code);
        data.operator = source.operator;
        data.registerDate = source.registerDate;
      }

      // Abre comprovantes somente se a venda estiver concluída
      if (!wasPendent) {
        CashierFrontReceiptsComponent.shared.onOpen({ data });
      }

      this.onResetPanel();
      this.saleCompleted = true;

      // Abre o modal de alerta somente se a venda foi salva como pendente
      if (wasPendent && this.isPendingAlertEnabled()) {
        // Garante que temos o código salvo da venda para reabrir
        // Tenta extrair o numérico do code formatado ou do response (quando disponível)
        let savedCodeNumeric = 0;
        try { savedCodeNumeric = parseInt(String(data?.code).replace(/\D/g, '')) || 0; } catch {}
        if (!savedCodeNumeric && source?.code) {
          try { savedCodeNumeric = parseInt(String(source.code).replace(/\D/g, '')) || 0; } catch {}
        }
        // Abre modal com code (numérico ou formatado)
        const saleCode = savedCodeNumeric || data?.code;
        this.openPendingSaleModal({ pendingValue, saleTotal, saleCode });
      }
    });
  }

  public onResetPanel(keepCustomer: boolean = false) {  // 🆕 ADICIONADO PARÂMETRO
    // 🆕 MODIFICADO - Mantém estrutura mas NÃO zera o customer
    this.data = {
      customer: null, // Será preenchido logo abaixo
      member: null,
      products: [],
      paymentMethods: [],
      service: null,
      balance: null,
      dropdown: null,
      warranty: null
    };

    this.source = {};
    this.settings = {};

    // Reseta os componentes seletores
    if (ProductsSelectorComponent.shared) {
      ProductsSelectorComponent.shared.reset();
    }

    if (PaymentMethodsSelectorComponent.shared) {
      PaymentMethodsSelectorComponent.shared.reset();
    }

    // Limpa os campos de input
    $$(".input-tax").val("0,00");
    $$(".input-discount").val("0,00");
    $$(".select-discount").val("$");

    if (this.data.balance && this.data.balance.discount) {
      delete this.data.balance.discount;
    }
    $$('.container-products .quick-search input').val('');
    $$('.input-warranty').val('');

    // Limpa outros dados
    this.dataBridgeService.clearData('ServiceOrder');

    // Reseta o estado de envio
    this.sending = false;

    // 🆕 MODIFICADO - Só define consumidor se NÃO for manter o cliente
    if (!keepCustomer) {
      this.setDefaultCustomer();
    }

    // Recalcula o balanço (vai zerar tudo)
    this.generateBalance();
  }

  // Mask Methods

  public onApplyNumberMask(event: Event) {
    $$(event.currentTarget).val(FieldMask.numberFieldMask($$(event.currentTarget).val(), null, null, true));
  }

  // Layer Actions

  public onOpenLayer(id: string) {
    // Se uma venda foi completada e está abrindo produtos
    if (id === 'products' && this.saleCompleted) {
      // Reseta o flag
      this.saleCompleted = false;
      // Força reset do componente
      if (ProductsSelectorComponent.shared) {
        ProductsSelectorComponent.shared.reset();
      }
    }

    // Se está abrindo o seletor de produtos e não tem produtos no carrinho
    // força a limpeza do componente selector
    if (id === 'products' && (!this.data.products || this.data.products.length === 0)) {
      if (ProductsSelectorComponent.shared) {
        ProductsSelectorComponent.shared.reset();
      }
    }

    this.layerComponent.onOpen({ activeComponent: id });
  }

  // Event Listeners

  public onLayerResponse(event: any) {

    // Check
    this.checkLoadingProducts(event);

    // Instance Capture
    if (event.instance) {
      this.layerComponent = event.instance;
    }

    // Data Capture
    if (event.customer) {
      this.data.customer = event.customer;
    }

    if (event.member) {
      this.data.member = event.member;
    }

    if (event.products) {
      // VERIFICAÇÃO PARA EVITAR DUPLICATAS
      if (!this.data.products) {
        this.data.products = [];
      }

      // Limpa produtos anteriores se houver nova seleção
      this.data.products = event.products;
    }

    if (event.paymentMethods) {
      // VERIFICAÇÃO TAMBÉM PARA MÉTODOS DE PAGAMENTO
      if (!this.data.paymentMethods) {
        this.data.paymentMethods = [];
      }

      // Limpa métodos anteriores se houver nova seleção
      this.data.paymentMethods = event.paymentMethods;

      // 🆕 ===== ADICIONE ESTE BLOCO DE CÓDIGO AQUI ===== 🆕
      // NOVA FUNCIONALIDADE: PREENCHIMENTO AUTOMÁTICO
      // Se tiver apenas uma forma de pagamento E tiver um valor total calculado
      if (this.data.paymentMethods.length === 1 && this.data.balance && this.data.balance.totalSale > 0) {
        // Preenche automaticamente o valor total da venda na única forma de pagamento
        this.data.paymentMethods[0].value = this.data.balance.totalSale;

        // Chama o checkPayment para atualizar o status
        this.checkPayment();
      }
      // 🆕 ===== FIM DO NOVO CÓDIGO ===== 🆕
    }

    if (this.data.balance) {
      delete this.data.balance;
    }

    // Perform the Calculations
    this.generateBalance();
  }

  private checkLoadingProducts(event: any) {

    if (this.data.products?.length > 0 && event.products) {

      setTimeout(() => {
        this.loadingProducts = false;
      }, 1500);

      return;
    }

    if (!this.data.products || this.data.products?.length == 0) {

      setTimeout(() => {
        this.loadingProducts = false;
      }, 1500);

      return;
    }

    setTimeout(() => {
      this.loadingProducts = false;
    }, 1500);
  }

  // Auxiliary Methods - Private

  private generateBalance() {


    this.data.balance = (this.data.balance || {});

    this.data.balance.totalProducts = 0;
    this.data.balance.totalServices = 0;
    this.data.balance.totalDiscount = 0;
    this.data.balance.totalFee = 0;

    this.data.balance.totalPartial = 0;
    this.data.balance.totalSale = 0;

    // console.log(this.data.balance);

    // Perform Calculations    

    if (this.data.service && this.data.service.types && this.data.service.types.length > 0) {

      for (const item of this.data.service.types) {

        if (item.customPrice > item.executionPrice) {
          this.data.balance.totalServices += item.customPrice;
        } else {
          this.data.balance.totalServices += item.executionPrice;
        }

        this.data.balance.totalDiscount += (() => {
          return ((item.customPrice < item.executionPrice) ? (item.executionPrice - item.customPrice) : 0);
        })();
      }

      if (this.data.service && this.data.service.additional && this.data.service.additional > 0) {
        this.data.balance.totalServices += this.data.service.additional;
      } else if (!isNaN(this.data.service.additional)) { // Temp
        this.data.balance.totalDiscount += (this.data.service.additional * -1);
      }


      this.data.balance.totalPartial += this.data.balance.totalServices;
    } else {

      if (this.data.service && this.data.service.additional && !isNaN(this.data.service.additional)) {
        this.data.balance.totalServices += this.data.service.additional;
        this.data.balance.totalPartial += this.data.balance.totalServices;
      }
    }

    if (this.data.products && this.data.products.length > 0) {

      for (const item of this.data.products) {

        if (item.unitaryPrice > item.salePrice) {
          this.data.balance.totalProducts += (item.selectedItems * item.unitaryPrice);
        } else {
          this.data.balance.totalProducts += (item.selectedItems * item.salePrice);
        }

        this.data.balance.totalDiscount += (() => {

          const value = (item.unitaryPrice < item.salePrice) ? (item.salePrice - item.unitaryPrice) * item.selectedItems : 0;
          return isNaN(value) ? 0 : value;
        })();

      }

      this.data.balance.totalPartial += this.data.balance.totalProducts;
    }


    if (this.data.balance.aditionalFee) {

      const obj = this.data.balance.aditionalFee;

      if (obj.type == '$') {
        this.data.balance.totalFee += obj.value;
      } else if (obj.type == '%') {
        this.data.balance.totalFee += parseFloat((this.data.balance.totalPartial * (obj.value / 100)).toFixed(2));
      }

      this.data.balance.totalPartial += this.data.balance.totalFee;
    }

    if (this.data.balance.aditionalFee == undefined) {
      this.data.balance.totalFee = this.source?.balance?.subtotal?.fee || 0;
    }

    if (this.data.balance.discount) {

      const obj = this.data.balance.discount;

      if (obj.type == '$') {
        this.data.balance.totalDiscount += obj.value;
      } else if (obj.type == '%') {
        this.data.balance.totalDiscount += parseFloat((this.data.balance.totalPartial * (obj.value / 100)).toFixed(2));
      }
    }

    // Apply Values

    if (this.data.balance.totalDiscount > 0) {
      this.data.balance.totalPartial -= this.data.balance.totalDiscount;
      this.data.balance.totalSale -= this.data.balance.totalDiscount;
    }

    if (this.data.balance.totalProducts > 0) {
      this.data.balance.totalSale += this.data.balance.totalProducts;
    }

    if (this.data.balance.totalServices > 0) {
      this.data.balance.totalSale += this.data.balance.totalServices;
    }

    if (this.data.balance.totalFee > 0) {
      this.data.balance.totalSale += this.data.balance.totalFee;
    }

    this.data.balance.totalSale = parseFloat(parseFloat(this.data.balance.totalSale).toFixed(2));
    // 🆕 ===== ADICIONE ESTE BLOCO AQUI ===== 🆕
    // ATUALIZAÇÃO AUTOMÁTICA: Se tiver apenas uma forma de pagamento, atualiza o valor automaticamente
    if (this.data.paymentMethods &&
      this.data.paymentMethods.length === 1 &&
      this.data.balance.totalSale > 0) {

      // Atualiza o valor da única forma de pagamento com o novo total
      this.data.paymentMethods[0].value = this.data.balance.totalSale;

      // Se tiver um campo de input visível, atualiza ele também
      setTimeout(() => {
        const inputField = $$('.container-payment input.value');
        if (inputField && inputField[0]) {
          // 🔧 CORREÇÃO: Formata o valor corretamente antes de aplicar a máscara
          const valorFormatado = this.data.balance.totalSale.toFixed(2).replace('.', ',');
          inputField.val(FieldMask.priceFieldMask(valorFormatado));
        }
      }, 50);
    }

    // Checks the values of payment methods whenever changes occur

    this.checkPayment();
  }

  private checkPayment() {

    if (this.data.paymentMethods && (this.data.paymentMethods).length > 0) {

      let value = 0;

      for (const method of this.data.paymentMethods) {
        if (method.value) { value += method.value }
      }

      value = parseFloat(value.toFixed(2));

      if (value <= this.data.balance.totalSale) {

        this.settings.paymentMethods = {
          status: 'ACCEPTED',
          value: value,
          pendent: this.data.balance.totalSale - value
        };
      } else {

        this.settings.paymentMethods = {
          status: 'REFUSED',
          value: value,
          overplus: value - this.data.balance.totalSale
        };
      }
    }
  }

  private composeData() {

    // 🆕 MODIFICADO - Adicionado warranty no objeto de resposta
    const response: ICashierSale = {
      code: this.data.code,
      products: ([] as any),
      paymentMethods: ([] as any),
      balance: ({} as any),
      origin: (this.data.origin || ECashierSaleOrigin.CASHIER),
      status: ECashierSaleStatus.PENDENT,
      warranty: this.data.warranty || null  // 🆕 CAMPO DE GARANTIA ADICIONADO
    };

    if (this.data.requestCode) {
      response.requestCode = this.data.requestCode;
    }

    if (this.data.billToReceiveCode) {
      response.billToReceiveCode = this.data.billToReceiveCode;
    }

    if (this.data.customer) {

      response.customer = ({} as any);

      response.customer.code = this.data.customer.code;
      response.customer.name = this.data.customer.name;

      if (this.data.customer.personalDocument) {
        response.customer.personalDocument = this.data.customer.personalDocument;
      }

      if (this.data.customer.businessDocument) {
        response.customer.businessDocument = this.data.customer.businessDocument;
      }

      if (this.data.customer.address) {
        response.customer.address = this.data.customer.address;
      }

      if (this.data.customer.contacts && this.data.customer.contacts.phone) {
        response.customer.phone = this.data.customer.contacts.phone;
      }

      if (this.data.customer.contacts && this.data.customer.contacts.email) {
        response.customer.email = this.data.customer.contacts.email;
      }

      if (this.data.customer.description) {
        response.customer.description = this.data.customer.description;
      }
    }

    if (this.data.member) {

      response.member = ({} as any);

      response.member.code = this.data.member.code;
      response.member.name = this.data.member.name;

      if (this.data.member.address) {
        response.member.address = this.data.member.address;
      }

      if (this.data.member.contacts && this.data.member.contacts.phone) {
        response.member.phone = this.data.member.contacts.phone;
      }

      if (this.data.member.contacts && this.data.member.contacts.email) {
        response.member.email = this.data.member.contacts.email;
      }

      if (this.data.member.description) {
        response.member.description = this.data.member.description;
      }

    }

    if (this.data.service) {

      response.service = {
        _id: this.data.service._id,
        code: this.data.service.code
      };

      if (this.data.service.types) {

        response.service.types = [];

        $$(this.data.service.types).map((_, item) => {

          const obj: any = {
            code: item.code,
            name: item.name,
            costPrice: item.costPrice,
            customCostPrice: item.customCostPrice != undefined ? item.customCostPrice : item.costPrice,
            executionPrice: item.executionPrice,
            customPrice: item.customPrice,
            cnae: item.cnae,
            codigo: item.codigo,
            codigoTributacao: item.codigoTributacao || ""
          };

          if (item.tributes) {
            obj.tributes = item.tributes || {}
          }

          // Preserve per-service executor, if any (so commissions can be attributed correctly)
          if (item.executor && (item.executor.username || item.executor.code || item.executor.name)) {
            obj.executor = {
              code: item.executor.code,
              name: item.executor.name,
              username: item.executor.username,
              usertype: item.executor.usertype
            };
          }

          // Include commission info for services (based on customCostPrice/costPrice)
          const commissionValue = (item.customCostPrice != undefined ? item.customCostPrice : item.costPrice) || 0;
          obj.commission = {
            enabled: commissionValue > 0,
            type: 'fixed',
            value: commissionValue
          };

          response.service.types.push(obj);
        });
      }
    }

    if (this.data.products) {

      for (const item of this.data.products) {

        const obj: any = {
          _id: item._id,
          code: item.code,
          name: item.name,
          costPrice: item.costPrice,
          salePrice: item.salePrice,
          unitaryPrice: item.unitaryPrice,
          quantity: parseInt(item.selectedItems)
        };

        if (item.tributes) {
          obj.tributes = item.tributes;
        }

        if (item.serialNumber) {
          obj.serialNumber = item.serialNumber;
        }

        if (item.internalCode) {
          obj.internalCode = item.internalCode;
        }

        if (item.commercialUnit) {

          obj.commercialUnit = {
            _id: item.commercialUnit._id,
            code: item.commercialUnit.code,
            name: item.commercialUnit.name
          };
        }

        if (item.category) {

          obj.category = {
            _id: item.category._id,
            code: item.category.code,
            name: item.category.name
          };
        }

        if (item.provider) {

          obj.provider = {
            _id: item.provider._id,
            code: item.provider.code,
            name: item.provider.name
          };
        }

        if (item.discount) {
          obj.discount = item.discount;
        }

        if (item.reserve) {
          obj.reserve = item.reserve;
        }
        // Include commission info so reports can calculate commissions
        if (item.commission) {
          obj.commission = {
            type: item.commission.type,
            value: item.commission.value,
            enabled: item.commission.enabled
          };
        }
        response.products.push(obj);
      }
    }

    if (this.data.paymentMethods) {

      let value = 0;

      $$(this.data.paymentMethods).map((_, item) => {

        let obj: any = {
          code: item.code,
          name: (item.code > 6000 && item.alternateName ? item.alternateName : item.name),
          bankAccount: item.bankAccount,
          history: (item.history || []),
          value: (item.value || 0)
        };

        if (item.note) {
          obj.note = item.note;
        }

        if (item.fees && item.fees.length > 0) {

          for (const fee of item.fees) {

            if (fee.selected) {
              obj.fees = fee;
              delete fee.selected;
            }
          }
        } else {

          if (item.fee) {
            obj.fee = item.fee;
          }
        }

        if (item.uninvoiced) {
          obj.uninvoiced = item.uninvoiced;
        }
        value += obj.value;

        if (value > 0) {
          response.paymentMethods.push(obj);
        }
      });

      value = parseFloat(value.toFixed(2));

      if (value == this.data.balance.totalSale) {
        response.status = ECashierSaleStatus.CONCLUDED;
      }
    }
    // ➕ If payment method "Crediário" is selected, generate Accounts Receivable
    const credMethod = response.paymentMethods.find(m => String(m.code) === '9000');
    if (credMethod) {
      const cred = credMethod as any;
      const creditValue = Number(cred.value || 0);
      if (creditValue > 0) {
        const installments = Number(cred.fees?.parcel || cred.settings?.parcel || 1);
        const debtor: any = response.customer ? {
          ...response.customer,
          type: EFinancialBillToReceiveDebtorType.CUSTOMER
        } : {
          _id: '', code: '', name: 'Cliente', type: EFinancialBillToReceiveDebtorType.CUSTOMER
        };

        response.billToReceive = {
          config: {
            origin: EFinancialBillToReceiveOrigin.CASHIER,
            debtor,
            category: FinancialBillToReceiveCategoryDefault.getCategory(EFinancialBillToReceiveOrigin.CASHIER),
            description: "Conta a receber gerada automaticamente pela venda #$RPC('referenceCode')",
            currentInstallment: 0,
            status: EFinancialBillToReceiveStatus.PENDENT,
            installments: Utilities.generateInstallments(parseInt(String(DateTime.getCurrentDay()), 10), installments, creditValue),
            receivedInstallments: 0,
            totalInstallments: installments,
            received: 0,
            amount: creditValue
          },
          installment: installments,
          total: creditValue
        };
      }
    }
    if (this.data.billToReceive) {

    }

    if (this.data.balance) {

      response.balance.subtotal = ({} as any);

      if (this.data.balance.totalServices > 0) {
        response.balance.subtotal.services = this.data.balance.totalServices;
      }

      if (this.data.balance.totalProducts > 0) {
        response.balance.subtotal.products = this.data.balance.totalProducts;
      }

      if (this.data.balance.totalDiscount > 0) {
        response.balance.subtotal.discount = this.data.balance.totalDiscount;
      }

      if (this.data.balance.totalFee > 0) {
        response.balance.subtotal.fee = this.data.balance.totalFee;
      }

      response.balance.total = this.data.balance.totalSale;
    }


    return response;
  }

  private composeSource() {

    let source = null;

    if (Object.values(this.source).length > 0) {
      source = this.source;
    }

    return source;
  }


  // Utility Methods 

  private scannerSettings() {

    this.scannerService.getShot('CashierFrontPDVComponent', (barcode) => {

      Utilities.loading();

      const raw = String(barcode).trim();
      const isDigits = /^\d+$/.test(raw);
      const where: any[] = [];

      where.push({ field: 'barcode', operator: '=', value: raw });
      where.push({ field: 'internalCode', operator: '=', value: raw });
      where.push({ field: 'serialNumber', operator: '=', value: raw });
      where.push({ field: 'batch', operator: '=', value: raw });
      where.push({ field: 'provider.code', operator: '=', value: raw });

      if (isDigits) {
        where.push({ field: 'code', operator: '=', value: parseInt(raw, 10) });
        if (raw.length >= 8 && raw.length < 13) {
          const truncated = raw.substring(0, raw.length - 4);
          if (/^\d+$/.test(truncated)) {
            where.push({ field: 'code', operator: '=', value: parseInt(truncated, 10) });
          }
        }
      }

      ProductsSelectorComponent.shared.onSearch({ where, data: { barcode: raw } }, true).then(() => {
        Utilities.loading(false);
      });
    });
  }

  // Destruction Method

  public ngOnDestroy() {
    this.dataBridgeService.clearData('ServiceOrder');
    this.scannerService.removeListeners('CashierFrontPDVComponent');
  }

  // Rendering performance helpers
  // trackBy functions keep DOM stable when only values change (e.g., quantity, price)
  public trackByProduct = (_: number, item: any) => item?._id || item?.code || _;
  public trackByPaymentMethod = (_: number, item: any) => item?.methodCode || item?.code || _;

  /*
    🆕 Modal: Alerta de Venda Pendente
    - Objetivo: reduzir erros operacionais avisando quando a venda foi salva como PENDENTE (não faturada).
    - Estratégia: abre um modal leve após registrar a venda, sem alterar o fluxo ou performance.
  */
  private ensurePendingModal() {
    this.settings = this.settings || {};
    this.settings.pendingSaleModal = this.settings.pendingSaleModal || { open: false };
    return this.settings.pendingSaleModal;
  }

  public openPendingSaleModal(args: { pendingValue: number; saleTotal: number; saleCode?: any; }) {
    const modal = this.ensurePendingModal();
    modal.open = true;
    modal.pendingValue = Number(args.pendingValue || 0);
    modal.saleTotal = Number(args.saleTotal || 0);
    modal.saleCode = args.saleCode;
  }

  public closePendingSaleModal() {
    const modal = this.ensurePendingModal();
    modal.open = false;
  }

  // Preferência: habilitar/desabilitar alerta de venda pendente
  private isPendingAlertEnabled(): boolean {
    try {
      const raw = Utilities.localStorage('PDV_PendingSaleAlert');
      if (raw === undefined || raw === null || raw === '') return true; // default: ativado
      if (typeof raw === 'boolean') return raw;
      if (typeof raw === 'string') return JSON.parse(raw);
      return !!raw;
    } catch {
      return true;
    }
  }

  // Ação do botão "Conferir/Review payments" para SEMPRE abrir um novo fluxo
  public onReviewPaymentsFromPending() {
    const modal = this.ensurePendingModal();
    const codeRaw = modal?.saleCode;
    this.closePendingSaleModal();
    let code = 0;
    try { code = parseInt(String(codeRaw).replace(/\D/g, '')) || 0; } catch { code = 0; }
    if (code > 0) {
      // Reabre a MESMA venda e depois abre o layer de pagamento
      Utilities.loading(true);
      this.cashierFrontPDVService.getSale(code).then((sale) => {
        Utilities.loading(false);
        if (sale) {
          this.onOpenSale(sale);
          this.onOpenLayer('paymentMethods');
        } else {
          // Fallback: painel novo
          this.onResetPanel();
          this.onOpenLayer('paymentMethods');
        }
      }).catch(() => {
        Utilities.loading(false);
        // Fallback: painel novo
        this.onResetPanel();
        this.onOpenLayer('paymentMethods');
      });
    } else {
      // Fallback quando não há code
      this.onResetPanel();
      this.onOpenLayer('paymentMethods');
    }
  }

  // Salva alteração do toggle (UI) em armazenamento do usuário atual
  public onTogglePendingSaleAlert(event: Event) {
    const checked = (event?.target as HTMLInputElement)?.checked ?? true;
    Utilities.localStorage('PDV_PendingSaleAlert', checked);
    this.settings.pendingSaleModalEnabled = checked;
  }

}
