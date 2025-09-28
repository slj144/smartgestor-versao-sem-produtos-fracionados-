import { Component, EventEmitter, Output, OnInit, ViewChild, ElementRef } from '@angular/core';

// Translate
import { ServiceOrdersReceiptsTranslate } from './receipts.translate';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';

@Component({
  selector: 'service-order-receipts',
  templateUrl: './receipts.component.html',
  styleUrls: ['./receipts.component.scss']
})
export class ServiceOrdersReceiptsComponent implements OnInit {

  @Output() callback: EventEmitter<any> = new EventEmitter();
  @ViewChild('modal', { static: true }) modal: ElementRef;

  public static shared: ServiceOrdersReceiptsComponent;

  public translate = ServiceOrdersReceiptsTranslate.get();

  public loading: any = true;
  public settings: any = {};

  private receiptPrintComponent: any;

  constructor() {
    ServiceOrdersReceiptsComponent.shared = this;
  }

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // User Interface Actions 

  public onReceiptPrint(type: string, format: string = 'A4') {

    this.receiptPrintComponent.onLaunchPrint({
      activeComponent: `Print/${type}`,
      translate: this.translate,
      data: this.settings.data,
      format: format
    });

    this.onClose();
  }

  // Função para enviar recibo via WhatsApp
  public onSendWhatsApp() {
    // Verifica se tem dados da ordem de serviço
    if (!this.settings || !this.settings.data) {
      console.error('Dados da ordem de serviço não encontrados');
      return;
    }

    // Pega os dados da ordem
    const orderData = this.settings.data;
    const storeInfo = Utilities.storeInfo;

    // Debug para ver os dados
    console.log('=== DADOS DA ORDEM DE SERVIÇO ===');
    console.log('Ordem completa:', orderData);
    console.log('================================');

    // Monta o recibo formatado
    let message = `*🏪 ${storeInfo.billingName}*\n`;
    message += `${storeInfo.address.addressLine}, ${storeInfo.address.city} - ${storeInfo.address.state}\n`;
    message += `📞 ${storeInfo.contacts.phone}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    // Informações da ordem
    message += `*ORDEM DE SERVIÇO*\n\n`;
    message += `📋 *Código:* ${orderData.code}\n`;

    // Formata a data e hora
    const date = new Date(orderData.registerDate);
    message += `📅 *Data:* ${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\n`;
    message += `💼 *Colaborador:* ${orderData.operator?.name || 'N/A'}\n\n`;

    // Dados do cliente
    if (orderData.customer) {
      message += `*CLIENTE*\n`;
      message += `👤 ${orderData.customer.name}\n`;
      if (orderData.customer.personalDocument?.value) {
        message += `${orderData.customer.personalDocument.type}: ${orderData.customer.personalDocument.value}\n`;
      } else if (orderData.customer.businessDocument?.value) {
        message += `${orderData.customer.businessDocument.type}: ${orderData.customer.businessDocument.value}\n`;
      }
      if (orderData.customer.phone) {
        message += `📱 ${orderData.customer.phone}\n`;
      }
      message += `\n`;
    }

    // Veículo (se houver)
    if (orderData.vehicle) {
      message += `*VEÍCULO*\n`;
      message += `🚗 Placa: ${orderData.vehicle.plate}\n`;
      message += `📊 Quilometragem: ${orderData.vehicle.mileage}\n`;
      message += `🚙 Modelo: ${orderData.vehicle.model}\n`;
      message += `🎨 Cor: ${orderData.vehicle.color}\n\n`;
    }

    // Equipamento (se houver)
    if (orderData.equipment) {
      message += `*EQUIPAMENTO*\n`;
      if (orderData.equipment.model) {
        message += `📱 Modelo: ${orderData.equipment.model}`;
        if (orderData.equipment.brand || orderData.equipment.name) {
          message += ` (${orderData.equipment.brand || orderData.equipment.name})`;
        }
        message += `\n`;
      } else if (orderData.equipment.brand || orderData.equipment.name) {
        message += `📱 Marca: ${orderData.equipment.brand || orderData.equipment.name}\n`;
      }
      if (orderData.equipment.password) {
        message += `🔑 Senha: ${orderData.equipment.password}\n`;
      }
      message += `\n`;
    }

    // Descrição do problema
    if (orderData.description) {
      message += `*DESCRIÇÃO DO PROBLEMA*\n`;
      // Remove tags HTML
      const descText = orderData.description.replace(/<[^>]*>/g, '');
      message += `${descText}\n\n`;
    }

    // Serviços
    if (orderData.services && orderData.services.length > 0) {
      message += `*SERVIÇOS*\n`;
      message += `━━━━━━━━━━━━━━━━━━━━\n`;

      orderData.services.forEach((service: any) => {
        message += `🔧 *${service.code} - ${service.name}*\n`;
        message += `   Valor: R$ ${service.customPrice.toFixed(2).replace('.', ',')}\n\n`;
      });
    }

    // Produtos/Peças
    if (orderData.products && orderData.products.length > 0) {
      message += `*PEÇAS*\n`;
      message += `━━━━━━━━━━━━━━━━━━━━\n`;

      orderData.products.forEach((product: any) => {
        message += `📦 *${product.code} - ${product.name}*\n`;
        message += `   ${product.quantity} x R$ ${product.unitaryPrice.toFixed(2).replace('.', ',')}\n`;
        const totalProduct = product.quantity * product.unitaryPrice;
        message += `   *Subtotal: R$ ${totalProduct.toFixed(2).replace('.', ',')}*\n\n`;
      });
    }

    // Resumo financeiro
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `*RESUMO*\n`;

    if (orderData.balance?.subtotal?.products > 0) {
      message += `Peças: R$ ${orderData.balance.subtotal.products.toFixed(2).replace('.', ',')}\n`;
    }

    if (orderData.balance?.subtotal?.services > 0) {
      message += `Serviços: R$ ${orderData.balance.subtotal.services.toFixed(2).replace('.', ',')}\n`;
    }

    if (orderData.balance?.subtotal?.discount > 0) {
      message += `Desconto: R$ ${orderData.balance.subtotal.discount.toFixed(2).replace('.', ',')}\n`;
    }

    message += `\n💰 *TOTAL: R$ ${orderData.balance.total.toFixed(2).replace('.', ',')}*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    // Rodapé
    message += `✅ *Ordem de Serviço gerada pelo sistema*\n`;
    message += `🕐 ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    // Codifica a mensagem
    const encodedMessage = encodeURIComponent(message);

    // Pega o número do telefone do cliente
    let phoneNumber = '';

    // Tenta pegar o telefone de diferentes lugares
    if (orderData.customer) {
      const possiblePhoneFields = [
        orderData.customer.phone,
        orderData.customer.telephone,
        orderData.customer.mobile,
        orderData.customer.cellphone,
        orderData.customer.contacts?.phone,
        orderData.customer.contacts?.telephone,
        orderData.customer.contacts?.mobile
      ];

      // Pega o primeiro telefone válido
      for (const phone of possiblePhoneFields) {
        if (phone) {
          phoneNumber = phone;
          console.log('Telefone encontrado:', phoneNumber);
          break;
        }
      }
    }

    // Se não encontrou telefone, avisa
    if (!phoneNumber) {
      console.log('AVISO: Cliente sem telefone cadastrado');
      alert('⚠️ Cliente sem telefone cadastrado!\n\nO WhatsApp será aberto sem número.');
    }

    // Limpa e formata o número
    if (phoneNumber) {
      phoneNumber = phoneNumber.toString().replace(/\D/g, '');

      if (phoneNumber.startsWith('0')) {
        phoneNumber = phoneNumber.substring(1);
      }

      if (!phoneNumber.startsWith('55')) {
        if (phoneNumber.length === 10 || phoneNumber.length === 11) {
          phoneNumber = '55' + phoneNumber;
        }
      }

      console.log('Número formatado final:', phoneNumber);
    }

    // Monta a URL do WhatsApp
    const whatsappUrl = phoneNumber && phoneNumber.length >= 12
      ? `https://wa.me/${phoneNumber}?text=${encodedMessage}`
      : `https://wa.me/?text=${encodedMessage}`;

    console.log('URL do WhatsApp:', whatsappUrl);

    // Abre o WhatsApp
    window.open(whatsappUrl, '_blank');

    // Fecha o modal
    this.onClose();
  }

  // Event Listeners

  public onReceiptPrintResponse(event) {

    if (event.instance) {
      this.receiptPrintComponent = event.instance;
    }
  }

  // Modal Actions

  public onOpen(settings: any = {}) {

    this.settings = settings;
    $$(this.modal.nativeElement).css({ display: 'block' });
  }

  public onClose() {

    this.loading = true;
    $$(this.modal.nativeElement).css({ display: 'none' });
  }

}