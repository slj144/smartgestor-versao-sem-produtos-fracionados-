import { Component, EventEmitter, Output, OnInit, ViewChild, ElementRef } from '@angular/core';

// Translate
import { CashierFrontReceiptsTranslate } from './cashier-receipts.translate';

// Services
import { FiscalService } from '@pages/fiscal/fiscal.service';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { ENFeImpresionFileType, ENFeType } from '@shared/enum/EFiscal';

@Component({
  selector: 'cashier-front-receipts',
  templateUrl: './cashier-receipts.component.html',
  styleUrls: ['./cashier-receipts.component.scss']
})
export class CashierFrontReceiptsComponent implements OnInit {

  @Output() callback: EventEmitter<any> = new EventEmitter();
  @ViewChild('modal', { static: true }) modal: ElementRef;

  public static shared: CashierFrontReceiptsComponent;

  public translate = CashierFrontReceiptsTranslate.get();

  public loading: any = true;
  public settings: any = {};

  private receiptPrintComponent: any;
  private nfPollTimer: any;
  private autoPrint: boolean = false;
  private autoPrintTriggered: boolean = false;

  // Utilitário: imprime um PDF (Blob) via iframe oculto
  private printPdfBlob(blob: Blob) {
    try {
      const pdfUrl = window.URL.createObjectURL(blob);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = pdfUrl;
      document.body.appendChild(iframe);

      iframe.onload = () => {
        setTimeout(() => {
          try { iframe.contentWindow?.focus(); } catch {}
          try { iframe.contentWindow?.print(); } catch {}
        }, 300);
      };

      setTimeout(() => {
        try { window.URL.revokeObjectURL(pdfUrl); } catch {}
        try { document.body.removeChild(iframe); } catch {}
      }, 120000);
    } catch { /* ignora */ }
  }

  // Espera a NF concluir (por tempo limitado) e imprime quando concluída
  private waitAndPrintNF(nfType: ENFeType, id: string, maxAttempts: number = 5, intervalMs: number = 2500) {
    let attempts = 0;
    const poll = () => {
      attempts++;
      this.fiscalServicce.getResumeNf(nfType, id).then((res: any) => {
        const info = Array.isArray(res) ? res[0] : null;
        const status = info?.status || info?.situacao;
        if (status === 'CONCLUIDO') {
          this.fiscalServicce
            .downloadNote(nfType, ENFeImpresionFileType.PDF, id, true)
            .then((blob: Blob) => this.printPdfBlob(blob))
            .catch(() => { /* falha silenciosa */ });
        } else if (attempts < maxAttempts) {
          setTimeout(poll, intervalMs);
        } else {
          // Tempo esgotado: não imprime, deixa o usuário tentar novamente mais tarde
          console.warn('NF ainda em processamento. Tente novamente em instantes.');
        }
      }).catch(() => {
        if (attempts < maxAttempts) {
          setTimeout(poll, intervalMs);
        }
      });
    };
    poll();
  }

  constructor(
    private fiscalServicce: FiscalService
  ) {
    CashierFrontReceiptsComponent.shared = this;
  }

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // User Interface Actions 

  public onReceiptPrint(format: string) {
    // Se houver Nota Fiscal disponível, prioriza imprimir a NF no formato adequado
    const nf = this.settings?.data?.nf;
    const hasNF = !!(nf && (nf.id?.nf || nf.id?.nfse));

    const tryPrintNF = () => {
      // Formato TÉRMICO: prioriza NFC-e; A4: prioriza NF-e (ou NFSe)
      if (format === 'THERMAL') {
        if (nf?.id?.nf && nf?.type?.nf === 'NFCE') {
          if (nf?.status?.nf === 'CONCLUIDO') {
            this.fiscalServicce
              .downloadNote('NFCE' as ENFeType, ENFeImpresionFileType.PDF, nf.id.nf, true)
              .then((blob: Blob) => this.printPdfBlob(blob))
              .catch(() => {});
          } else {
            // Aguardar um pouco se ainda estiver processando
            this.waitAndPrintNF('NFCE' as ENFeType, nf.id.nf);
          }
          return true;
        }
        // Caso não seja NFC-e, não tem NF térmica apropriada → cai no recibo térmico
        return false;
      } else { // A4
        if (nf?.id?.nf && nf?.type?.nf === 'NFE') {
          if (nf?.status?.nf === 'CONCLUIDO') {
            this.fiscalServicce
              .downloadNote('NFE' as ENFeType, ENFeImpresionFileType.PDF, nf.id.nf, true)
              .then((blob: Blob) => this.printPdfBlob(blob))
              .catch(() => {});
          } else {
            this.waitAndPrintNF('NFE' as ENFeType, nf.id.nf);
          }
          return true;
        }
        if (nf?.id?.nfse && nf?.type?.nfse === 'NFSE') {
          if (nf?.status?.nfse === 'CONCLUIDO') {
            this.fiscalServicce
              .downloadNote('NFSE' as ENFeType, ENFeImpresionFileType.PDF, nf.id.nfse, true)
              .then((blob: Blob) => this.printPdfBlob(blob))
              .catch(() => {});
          } else {
            this.waitAndPrintNF('NFSE' as ENFeType, nf.id.nfse);
          }
          return true;
        }
        return false;
      }
    };

    const printedNF = hasNF ? tryPrintNF() : false;

    // Se não imprimiu NF, imprime o recibo no formato escolhido
    if (!printedNF) {
      this.receiptPrintComponent.onLaunchPrint({
        activeComponent: 'Print/SaleReceipt',
        translate: this.translate,
        data: this.settings.data,
        format: format
      });
    }

    this.onClose();
  }

  public onDownload(ftype, ntype) {

    // Se for PDF, baixar e abrir para impressão
    if (ftype === 'PDF') {
      const nfType = this.settings.data.nf.type[ntype] as ENFeType;
      const fileType = ftype as ENFeImpresionFileType;
      this.fiscalServicce.downloadNote(nfType, fileType, this.settings.data.nf.id[ntype], true).then((blob: Blob) => {
        // Imprimir via iframe oculto (evita abrir nova aba)
        try {
          const pdfUrl = window.URL.createObjectURL(blob);
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.src = pdfUrl;
          document.body.appendChild(iframe);

          iframe.onload = () => {
            setTimeout(() => {
              try { iframe.contentWindow?.focus(); } catch {}
              try { iframe.contentWindow?.print(); } catch {}
            }, 300);
          };

          // Limpar recursos
          setTimeout(() => {
            try { window.URL.revokeObjectURL(pdfUrl); } catch {}
            try { document.body.removeChild(iframe); } catch {}
          }, 120000);
        } catch (e) { /* fallback silencioso */ }
      }).catch((error) => {
        console.log("error: ", error);
      });
    } else {
      // Para XML, apenas fazer download normal
      const nfType = this.settings.data.nf.type[ntype] as ENFeType;
      const fileType = ftype as ENFeImpresionFileType;
      this.fiscalServicce.downloadNote(nfType, fileType, this.settings.data.nf.id[ntype]).then((res) => { }).catch((error) => {
        console.log("error: ", error);
      });
    }

    this.onClose();
  }

  // Função para enviar recibo via WhatsApp
  public onSendWhatsApp() {
    // Verifica se tem dados da venda
    if (!this.settings || !this.settings.data) {
      console.error('Dados da venda não encontrados');
      return;
    }

    // Pega os dados da venda
    const saleData = this.settings.data;
    const storeInfo = Utilities.storeInfo;

    // Debug - vamos ver o que tem no customer
    console.log('=== DADOS DO CLIENTE ===');
    console.log('Cliente completo:', saleData.customer);
    console.log('=======================');

    // Monta o recibo no mesmo formato do PDF
    let message = `*🏪 ${storeInfo.billingName}*\n`;
    message += `${storeInfo.address.addressLine}, ${storeInfo.address.city} - ${storeInfo.address.state}\n`;
    if (storeInfo.cnpj) {
      message += `CNPJ: ${storeInfo.cnpj}\n`;
    }
    message += `📞 ${storeInfo.contacts.phone}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    // Informações da venda
    message += `*RECIBO DE VENDA*\n\n`;
    message += `📋 *Código:* ${saleData.code}\n`;

    // Formata a data e hora
    const date = new Date(saleData.registerDate);
    message += `📅 *Data:* ${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\n`;
    message += `💼 *Operador:* ${saleData.operator.name}\n\n`;

    // Dados do cliente
    message += `*CLIENTE*\n`;
    message += `👤 ${saleData.customer.name}\n`;
    if (saleData.customer.personalDocument?.value) {
      message += `${saleData.customer.personalDocument.type}: ${saleData.customer.personalDocument.value}\n`;
    } else if (saleData.customer.businessDocument?.value) {
      message += `${saleData.customer.businessDocument.type}: ${saleData.customer.businessDocument.value}\n`;
    }
    message += `\n`;

    // Serviços (se houver)
    if (saleData.service?.types?.length > 0) {
      message += `*SERVIÇOS*\n`;
      saleData.service.types.forEach((service: any) => {
        message += `▪️ ${service.code} - ${service.name}\n`;
      });
      message += `\n`;
    }

    // Produtos
    if (saleData.products && saleData.products.length > 0) {
      message += `*PRODUTOS*\n`;
      message += `━━━━━━━━━━━━━━━━━━━━\n`;

      saleData.products.forEach((product: any) => {
        message += `📦 *${product.code} - ${product.name}*\n`;
        if (product.serialNumber) {
          message += `   N° Série: ${product.serialNumber}\n`;
        }
        message += `   ${product.quantity} x R$ ${product.unitaryPrice.toFixed(2).replace('.', ',')}\n`;
        const totalProduct = product.quantity * product.unitaryPrice;
        message += `   *Subtotal: R$ ${totalProduct.toFixed(2).replace('.', ',')}*\n\n`;
      });
    }

    // Resumo financeiro
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `*RESUMO*\n`;

    if (saleData.balance?.subtotal?.products > 0) {
      message += `Produtos: R$ ${saleData.balance.subtotal.products.toFixed(2).replace('.', ',')}\n`;
    }

    if (saleData.service?.code || saleData.balance?.subtotal?.services > 0) {
      message += `Serviços: R$ ${(saleData.balance?.subtotal?.services || 0).toFixed(2).replace('.', ',')}\n`;
    }

    if (saleData.balance?.subtotal?.discount > 0) {
      message += `Desconto: R$ ${saleData.balance.subtotal.discount.toFixed(2).replace('.', ',')}\n`;
    }

    message += `\n💰 *TOTAL: R$ ${saleData.balance.total.toFixed(2).replace('.', ',')}*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    // Formas de pagamento
    if (saleData.paymentMethods && saleData.paymentMethods.length > 0) {
      message += `*FORMAS DE PAGAMENTO*\n`;
      saleData.paymentMethods.forEach((method: any) => {
        let methodName = method.name;

        // Formata o nome do método de pagamento
        if (method.code > 3000 && method.code < 4000) {
          methodName = 'CARTÃO DE DÉBITO';
        } else if (method.code > 4000 && method.code < 5000) {
          const parcelas = method.fees?.parcel || 1;
          methodName = parcelas === 1
            ? 'CARTÃO DE CRÉDITO (À Vista)'
            : `CARTÃO DE CRÉDITO (${parcelas}x)`;
        }

        message += `▪️ ${methodName}: R$ ${method.value.toFixed(2).replace('.', ',')}\n`;

        if (method.note) {
          message += `   Obs: ${method.note}\n`;
        }
      });
      message += `\n`;
    }

    // Observações da venda (se houver)
    if (saleData.note) {
      message += `*OBSERVAÇÕES*\n`;
      // Remove tags HTML se houver
      const noteText = saleData.note.replace(/<[^>]*>/g, '');
      message += `${noteText}\n\n`;
    }

    // Rodapé
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `✅ *Recibo gerado pelo sistema*\n`;
    message += `🕐 ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    // Codifica a mensagem
    const encodedMessage = encodeURIComponent(message);

    // Pega o número do telefone do cliente - VERSÃO MELHORADA
    let phoneNumber = '';

    // Tenta pegar o telefone de diferentes lugares possíveis
    if (saleData.customer) {
      // Tenta vários campos possíveis
      const possiblePhoneFields = [
        saleData.customer.phone,
        saleData.customer.telephone,
        saleData.customer.mobile,
        saleData.customer.cellphone,
        saleData.customer.contacts?.phone,
        saleData.customer.contacts?.telephone,
        saleData.customer.contacts?.mobile
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
      // Remove tudo que não for número
      phoneNumber = phoneNumber.toString().replace(/\D/g, '');

      // Remove zero do início se tiver
      if (phoneNumber.startsWith('0')) {
        phoneNumber = phoneNumber.substring(1);
      }

      // Adiciona 55 se necessário
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
    this.autoPrint = !!settings.autoPrint;
    this.autoPrintTriggered = false;
    $$(this.modal.nativeElement).css({ display: 'block' });

    // Função para baixar e imprimir a nota fiscal
    const downloadAndPrintNF = (type: string, id: string) => {
      // Aguardar um pouco para garantir que a nota foi processada
      setTimeout(() => {
        // Converter string para ENFeType
        const nfType = type as ENFeType;
        this.fiscalServicce.downloadNote(nfType, ENFeImpresionFileType.PDF, id, true).then((blob: Blob) => {
          console.log(`${type === 'NFCE' ? 'DANFCe' : 'DANFE'} baixado com sucesso`);
          // Imprimir via iframe oculto (sem abrir nova aba)
          try {
            const pdfUrl = window.URL.createObjectURL(blob);
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = pdfUrl;
            document.body.appendChild(iframe);

            iframe.onload = () => {
              setTimeout(() => {
                try { iframe.contentWindow?.focus(); } catch {}
                try { iframe.contentWindow?.print(); } catch {}
              }, 300);
            };

            setTimeout(() => {
              try { window.URL.revokeObjectURL(pdfUrl); } catch {}
              try { document.body.removeChild(iframe); } catch {}
            }, 120000);
          } catch { /* ignora */ }
        }).catch(error => {
          console.error(`Erro ao baixar ${type === 'NFCE' ? 'DANFCe' : 'DANFE'}:`, error);
        });
      }, 2000); // Aguarda 2 segundos para garantir processamento
    };

    // Se existir NF emitida mas ainda não concluída, faz polling até concluir
    try {
      const nf = this.settings?.data?.nf;
      const typesToCheck: Array<'nf' | 'nfse'> = [];
      if (nf?.id?.nf && nf?.type?.nf) typesToCheck.push('nf');
      if (nf?.id?.nfse && nf?.type?.nfse) typesToCheck.push('nfse');

      const poll = () => {
        let pending = 0;
        typesToCheck.forEach((t) => {
          const id = nf?.id?.[t];
          const tp = nf?.type?.[t];
          const status = nf?.status?.[t];
          if (id && tp && status && status !== 'CONCLUIDO' && status !== 'REJEITADO' && status !== 'CANCELADO') {
            pending++;
            this.fiscalServicce.getResumeNf(tp, id).then((res: any) => {
              const info = Array.isArray(res) ? res[0] : null;
              if (info && (info.status || info.situacao)) {
                const newStatus = info.status || info.situacao;
                const oldStatus = this.settings.data.nf.status[t];
                this.settings.data.nf.status = this.settings.data.nf.status || {};
                this.settings.data.nf.status[t] = newStatus;

                // Se mudou para CONCLUIDO, baixar e imprimir automaticamente
                if (oldStatus !== 'CONCLUIDO' && newStatus === 'CONCLUIDO') {
                  console.log(`Nota ${tp} processada com sucesso, baixando PDF...`);
                  downloadAndPrintNF(tp, id);
                }
              }
            }).catch(() => { /* ignora */ });
          }
        });

        // Continua enquanto houver algum pendente
        if (pending > 0) {
          this.nfPollTimer = setTimeout(poll, 2500);
        }
      };

      // Se a nota já está concluída, baixar imediatamente
      if (this.autoPrint && nf?.id?.nf && nf?.type?.nf && nf?.status?.nf === 'CONCLUIDO' && !this.autoPrintTriggered) {
        this.autoPrintTriggered = true;
        downloadAndPrintNF(nf.type.nf, nf.id.nf);
      } else if (this.autoPrint && nf?.id?.nfse && nf?.type?.nfse && nf?.status?.nfse === 'CONCLUIDO' && !this.autoPrintTriggered) {
        this.autoPrintTriggered = true;
        downloadAndPrintNF(nf.type.nfse, nf.id.nfse);
      }

      // Inicia polling apenas se houver algo para checar
      if (this.autoPrint && ((nf?.id?.nf && nf?.status?.nf && nf.status.nf !== 'CONCLUIDO') ||
          (nf?.id?.nfse && nf?.status?.nfse && nf.status.nfse !== 'CONCLUIDO'))) {
        this.nfPollTimer = setTimeout(poll, 1500);
      }
    } catch { /* ignora falhas de polling */ }
  }

  public onClose() {

    this.loading = true;
    $$(this.modal.nativeElement).css({ display: 'none' });

    // Limpa polling de status de NF
    if (this.nfPollTimer) {
      clearTimeout(this.nfPollTimer);
      this.nfPollTimer = null;
    }
    this.autoPrint = false;
    this.autoPrintTriggered = false;
  }

}
