// ARQUIVO: src/app/pages/stock/products/components/modal/components/generateTickets/generateTickets.component.ts
// CAMINHO: src/app/pages/stock/products/components/modal/components/generateTickets/

import { Component, Output, EventEmitter, OnInit } from '@angular/core';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { FieldMask } from '@shared/utilities/fieldMask';

@Component({
  selector: 'generate-tickets',
  templateUrl: './generateTickets.component.html',
  styleUrls: ['./generateTickets.component.scss']
})
export class GenerateTicketsComponent implements OnInit {

  @Output() callback: EventEmitter<any> = new EventEmitter();

  public settings: any = {};
  public checkBootstrap: boolean = false;
  public productsData: any = [];
  public isPrinting: boolean = false; // Adiciona flag de controle


  // MANTENDO OS FORMATOS ORIGINAIS + ADICIONANDO OPÇÕES ZEBRA + NOVO FORMATO 33x15mm
  public formats: any[] = [
    {
      code: 'Pimaco - A4056/A4256/A4356/A4056R',
      name: 'Pimaco - A4056/A4256/A4356/A4056R',
      columns: 3,
      rows: 11,
      quantityPerSheet: 33,
      pageLimit: 10,
      cssPath: '/assets/css/tickets/tickets.css',
      jsPdf: { format: 'A4', orientation: 'portrait', compressPDF: true, quality: 100 }
    },
    {
      code: 'GC420t - 50x30 - 1 coluna',
      name: 'Zebra GC420t - 50x30mm - 1 coluna',
      columns: 1,
      rows: 1,
      quantityPerSheet: 1,
      pageLimit: 999,
      cssPath: null,
      jsPdf: null
    },
    {
      code: 'GC420t - 50x30 - 2 colunas',
      name: 'Zebra GC420t - 50x30mm - 2 colunas',
      columns: 2,
      rows: 1,
      quantityPerSheet: 2,
      pageLimit: 999,
      cssPath: null,
      jsPdf: null
    },
    {
      code: 'GC420t - 33x15 - 1 coluna',
      name: 'Zebra GC420t - 33x15mm - 1 coluna (Couche)',
      columns: 1,
      rows: 1,
      quantityPerSheet: 1,
      pageLimit: 999,
      cssPath: null,
      jsPdf: null
    },
    {
      code: 'GC420t - 33x15 - 2 colunas',
      name: 'Zebra GC420t - 33x15mm - 2 colunas (Couche)',
      columns: 2,
      rows: 1,
      quantityPerSheet: 2,
      pageLimit: 999,
      cssPath: null,
      jsPdf: null
    },
    {
      code: 'GC420t - 33x15 - 3 colunas',
      name: 'Zebra GC420t - 33x15mm - 3 colunas (Couche)',
      columns: 3,
      rows: 1,
      quantityPerSheet: 3,
      pageLimit: 999,
      cssPath: null,
      jsPdf: null
    }
  ];

  private layerComponent: any;
  private printComponent: any;
  private productsComponent: any;

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // Initialize Method - MANTIDO ORIGINAL
  public bootstrap(settings: any = {}) {
    this.settings = settings;
    this.settings.print = { ...this.formats[0] };
    this.settings.tickets = {
      name: true,
      price: true,
      barcode: true
    };
    this.settings.statistics = {
      tickets: 0,
      pages: 0,
      files: 0
    };

    setTimeout(() => {
      this.checkBootstrap = true;
    }, 500);
  }

  // User Interface Actions - MANTIDO ORIGINAL
  public onToggleTicketData(target: string) {
    this.settings.tickets[target] = !this.settings.tickets[target];
  }

  public onChangePrintFormat(event: any) {
    const value = $$(event.target).val();
    const format = this.formats.find((f) => f.code == value);
    if (format) {
      this.settings.print = { ...format };
      this.composeStatistics();
    }
  }

  public onRemoveProductItem(index: number) {
    this.productsData[index].selected = false;
    this.productsData.splice(index, 1);
    this.toggleContainerFloat();
  }

  // MÉTODO PRINCIPAL - Detecta se é Zebra, A4248 ou Pimaco padrão
  public onGenerateTickets() {
    // Evita múltiplos cliques
    if (this.isPrinting) {
      return;
    }

    const that = this;

    // SE FOR ZEBRA - Usa novo método melhorado
    if (this.settings.print && this.settings.print.code && this.settings.print.code.includes('GC420')) {
      this.processZebraLabelsImproved();
      return;
    }


    // PIMACO PADRÃO E A4248 - CÓDIGO ORIGINAL INTACTO
    const tickets = [];

    // DEBUG: Log dos produtos e quantidades ANTES de gerar tickets
    console.log('📊 Produtos para geração de etiquetas:');
    this.productsData.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.name} - Quantidade: ${item.ticketsQuantity}`);
    });

    for (const item of this.productsData) {
      for (let i = 0; i < item.ticketsQuantity; i++) {
        tickets.push({
          name: (this.settings.tickets.name ? item.name : null),
          price: (this.settings.tickets.price ? item.salePrice : null),
          barcode: (this.settings.tickets.barcode ? item.barcode : null)
        });
      }
    }
    
    console.log(`🎫 Total de etiquetas geradas: ${tickets.length}`);
    console.log(`📄 Formato selecionado: ${this.settings.print.code}`);
    console.log(`📊 Etiquetas por folha configuradas: ${this.settings.print.quantityPerSheet}`);

    const pages = [];
    const quantityPerSheet = this.settings.print.quantityPerSheet;
    const quantityOfLeaves = Math.ceil(tickets.length / quantityPerSheet);

    for (let p = 0; p < quantityOfLeaves; p++) {
      pages[p] = tickets.slice((p * quantityPerSheet), ((p + 1) * quantityPerSheet));
    }

    const files = [];
    const pageLimit = this.settings.print.pageLimit;
    const quantityOfFiles = Math.ceil(quantityOfLeaves / pageLimit);

    for (let f = 0; f < quantityOfFiles; f++) {
      files[f] = (pages.slice((f * pageLimit), ((f + 1) * pageLimit)));
    }

    let currentIndex = 0;

    function generate(data) {
      if (that.printComponent && that.printComponent.onLaunchPrint) {
        that.printComponent.onLaunchPrint({
          formatCode: that.settings.print.code,
          fileIndex: currentIndex,
          pages: data,
          cssPath: that.settings.print.cssPath,
          jsPdf: that.settings.print.jsPdf
        }).then(() => {
          currentIndex += 1;
          if (currentIndex < (files.length)) {
            generate(files[currentIndex]);
          } else {
            that.resetComponent();
          }
        }).catch((error) => {
          console.error('Erro no print component:', error);
          that.resetComponent();
        });
      }
    }

    generate(files[currentIndex]);
  }


  // ============================================
  // NOVO MÉTODO MELHORADO PARA IMPRESSÃO ZEBRA
  // ============================================
  private async processZebraLabelsImproved() {
    this.isPrinting = true;

    // Prepara as etiquetas
    const allLabels = [];
    for (const item of this.productsData) {
      for (let i = 0; i < item.ticketsQuantity; i++) {
        allLabels.push({
          name: item.name,
          price: item.salePrice,
          barcode: item.barcode
        });
      }
    }

    // Gera comandos ZPL
    const zplContent = this.generateZPLCommands();

    // Detecta o sistema operacional
    const os = this.detectOS();

    // Tenta múltiplos métodos de impressão
    let success = false;

    // MÉTODO 1: Tenta WebUSB (Chrome/Edge)
    if (!success && 'usb' in navigator) {
      success = await this.tryWebUSBPrint(zplContent);
    }

    // MÉTODO 2: Tenta servidor local
    if (!success) {
      success = await this.tryLocalServerPrint(zplContent);
    }

    // MÉTODO 3: Interface simplificada com download
    if (!success) {
      this.showSimplifiedInterface(allLabels.length, zplContent, os);
    }

    this.isPrinting = false;
  }

  // ============================================
  // MÉTODO 1: WEBUSB (Chrome/Edge)
  // ============================================
  private async tryWebUSBPrint(zpl: string): Promise<boolean> {
    try {
      // Solicita acesso à impressora USB
      const device = await (navigator as any).usb.requestDevice({
        filters: [
          { vendorId: 0x0A5F }, // Zebra vendor ID
          { vendorId: 0x23F6 }  // Outro ID comum Zebra
        ]
      });

      if (!device) return false;

      // Abre conexão e envia dados
      await device.open();
      await device.selectConfiguration(1);
      await device.claimInterface(0);

      const encoder = new TextEncoder();
      const data = encoder.encode(zpl);
      await device.transferOut(1, data);

      await device.close();

      this.showSuccessMessage('✅ Etiquetas enviadas para impressão via USB!');
      setTimeout(() => this.resetComponent(), 2000);
      return true;

    } catch (error) {
      console.log('WebUSB não disponível:', error);
      return false;
    }
  }

  // ============================================
  // MÉTODO 2: SERVIDOR LOCAL
  // ============================================
  private async tryLocalServerPrint(zpl: string): Promise<boolean> {
    try {
      // Tenta enviar para servidor local (porta 9100 é padrão Zebra)
      const response = await fetch('http://localhost:9100', {
        method: 'POST',
        mode: 'no-cors',
        body: zpl
      });

      this.showSuccessMessage('✅ Etiquetas enviadas para impressão via rede!');
      setTimeout(() => this.resetComponent(), 2000);
      return true;

    } catch (error) {
      console.log('Servidor local não disponível:', error);
      return false;
    }
  }

  // ============================================
  // SOLUÇÃO SIMPLIFICADA - USA ZEBRA SETUP UTILITIES
  // ============================================
  private showSimplifiedInterface(totalLabels: number, zplContent: string, os: string) {
    const printWindow = window.open('', 'ZebraPrint', 'width=900,height=700');
    const timestamp = new Date().getTime();

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Impressão de Etiquetas Zebra</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 20px;
          box-shadow: 0 25px 50px rgba(0,0,0,0.2);
          max-width: 800px;
          width: 100%;
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          font-size: 28px;
          margin-bottom: 10px;
        }
        .stats {
          display: flex;
          justify-content: center;
          gap: 30px;
          margin-top: 20px;
        }
        .stat {
          text-align: center;
        }
        .stat-value {
          font-size: 32px;
          font-weight: bold;
        }
        .content {
          padding: 30px;
        }
        .success-box {
          background: #e8f5e9;
          border: 2px solid #4CAF50;
          border-radius: 15px;
          padding: 25px;
          text-align: center;
        }
        .btn-download {
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
          color: white;
          border: none;
          padding: 20px 50px;
          font-size: 20px;
          font-weight: bold;
          border-radius: 50px;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(76,175,80,0.3);
          transition: all 0.3s;
          margin: 20px auto;
          display: block;
        }
        .btn-download:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(76,175,80,0.4);
        }
        .instructions {
          background: #f5f5f5;
          border-radius: 10px;
          padding: 20px;
          margin-top: 20px;
        }
        .instructions h3 {
          color: #333;
          margin-bottom: 15px;
        }
        .instructions ol {
          margin-left: 20px;
          color: #666;
        }
        .instructions li {
          margin: 10px 0;
          line-height: 1.6;
        }
        .instructions strong {
          color: #4CAF50;
        }
        .step-number {
          display: inline-block;
          width: 30px;
          height: 30px;
          background: #4CAF50;
          color: white;
          border-radius: 50%;
          text-align: center;
          line-height: 30px;
          margin-right: 10px;
          font-weight: bold;
        }
        .preview-info {
          background: #fff3e0;
          border-left: 4px solid #ff9800;
          padding: 15px;
          margin: 20px 0;
          border-radius: 5px;
        }
        .download-status {
          display: none;
          background: #4CAF50;
          color: white;
          padding: 15px;
          border-radius: 10px;
          margin: 20px 0;
          text-align: center;
          animation: slideIn 0.3s ease;
        }
        .download-status.show {
          display: block;
        }
        @keyframes slideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏷️ Impressão de Etiquetas Zebra</h1>
          <p>Sistema otimizado para ${os === 'windows' ? 'Windows com Zebra Setup Utilities' : 'Mac'}</p>
          <div class="stats">
            <div class="stat">
              <div class="stat-value">${totalLabels}</div>
              <div>Etiquetas</div>
            </div>
            <div class="stat">
              <div class="stat-value">${this.settings.print.columns}</div>
              <div>Coluna(s)</div>
            </div>
            <div class="stat">
              <div class="stat-value">${this.productsData.length}</div>
              <div>Produtos</div>
            </div>
          </div>
        </div>
        
        <div class="content">
          ${os === 'windows' ? `
            <!-- WINDOWS - Zebra Setup Utilities -->
            <div class="success-box">
              <h2>✅ Método Garantido de Impressão</h2>
              <p style="margin: 15px 0; color: #666;">
                Como o <strong>Zebra Setup Utilities</strong> funciona perfeitamente,<br>
                vamos usar ele para garantir a impressão!
              </p>
              
              <button class="btn-download" onclick="downloadZPLFile()">
                📥 BAIXAR ARQUIVO DE ETIQUETAS
              </button>
              
              <div id="download-status" class="download-status">
                ✅ Arquivo baixado com sucesso!
              </div>
            </div>

            <div class="instructions">
              <h3>📋 Instruções Super Simples:</h3>
              <ol>
                <li>
                  <span class="step-number">1</span>
                  Clique no botão <strong>"BAIXAR ARQUIVO DE ETIQUETAS"</strong> acima
                </li>
                <li>
                  <span class="step-number">2</span>
                  Abra o <strong>Zebra Setup Utilities</strong>
                  <br><small>(Se não tiver, baixe em: zebra.com/drivers)</small>
                </li>
                <li>
                  <span class="step-number">3</span>
                  No Zebra Setup Utilities, clique em <strong>"Open Communication"</strong>
                </li>
                <li>
                  <span class="step-number">4</span>
                  Clique no botão <strong>"Send File"</strong>
                </li>
                <li>
                  <span class="step-number">5</span>
                  Selecione o arquivo <strong>zebra_etiquetas_${timestamp}.zpl</strong> na pasta Downloads
                </li>
                <li>
                  <span class="step-number">6</span>
                  Clique em <strong>"Send"</strong> e pronto! 🎉
                </li>
              </ol>
            </div>

            <div class="preview-info">
              <strong>💡 Dica:</strong> Salve o Zebra Setup Utilities na área de trabalho para acesso rápido!
              É a forma mais confiável de imprimir na Zebra no Windows.
            </div>

          ` : os === 'mac' ? `
            <!-- MAC - Funciona direto -->
            <div class="success-box">
              <h2>✅ Impressão Direta no Mac</h2>
              <p style="margin: 15px 0; color: #666;">
                No Mac funciona perfeitamente via Terminal!
              </p>
              
              <button class="btn-download" onclick="downloadForMac()">
                🍎 BAIXAR E OBTER COMANDO
              </button>
              
              <div id="download-status" class="download-status">
                ✅ Arquivo baixado e comando copiado!
              </div>
            </div>

            <div class="instructions">
              <h3>📋 Instruções para Mac:</h3>
              <ol>
                <li>
                  <span class="step-number">1</span>
                  Clique no botão acima para baixar o arquivo
                </li>
                <li>
                  <span class="step-number">2</span>
                  Abra o <strong>Terminal</strong> (Cmd + Espaço, digite "Terminal")
                </li>
                <li>
                  <span class="step-number">3</span>
                  Cole o comando copiado (Cmd + V) e pressione Enter
                </li>
              </ol>
            </div>
          ` : ''}

          <div class="instructions" style="background: #e3f2fd; border-left: 4px solid #2196F3;">
            <h3>📊 Resumo das Etiquetas:</h3>
            <ul style="list-style: none; padding: 0;">
              ${this.productsData.slice(0, 5).map(product => `
                <li style="padding: 5px 0;">
                  ✓ ${product.name} - <strong>${product.ticketsQuantity || 1}</strong> etiqueta(s)
                </li>
              `).join('')}
              ${this.productsData.length > 5 ? `
                <li style="padding: 5px 0; font-style: italic;">
                  ... e mais ${this.productsData.length - 5} produto(s)
                </li>
              ` : ''}
            </ul>
          </div>
        </div>
      </div>

      <script>
        const zplContent = \`${zplContent.replace(/`/g, '\\`')}\`;
        const os = '${os}';
        const timestamp = '${timestamp}';
        
        // Windows - Download simples do ZPL
        function downloadZPLFile() {
          const blob = new Blob([zplContent], { type: 'text/plain' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = \`zebra_etiquetas_\${timestamp}.zpl\`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          // Mostra status
          document.getElementById('download-status').classList.add('show');
          
          // Mensagem de confirmação
          setTimeout(() => {
            alert(\`
✅ ARQUIVO BAIXADO COM SUCESSO!

📁 Nome: zebra_etiquetas_\${timestamp}.zpl
📂 Local: Pasta Downloads

Agora abra o Zebra Setup Utilities e use a opção "Send File"!
            \`);
          }, 500);
        }
        
        // Mac - Download e copia comando
        function downloadForMac() {
          const blob = new Blob([zplContent], { type: 'text/plain' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          const filename = \`zebra_\${timestamp}.txt\`;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          // Copia comando para clipboard
          const command = \`lpr -P Zebra_GC420T -o raw ~/Downloads/\${filename}\`;
          navigator.clipboard.writeText(command);
          
          // Mostra status
          document.getElementById('download-status').classList.add('show');
          
          setTimeout(() => {
            alert(\`
✅ PRONTO PARA IMPRIMIR!

📁 Arquivo: \${filename}
📋 Comando copiado (já está no Ctrl+V)

Abra o Terminal e cole o comando!
            \`);
          }, 500);
        }
        
        // Auto fecha após 5 minutos
        setTimeout(() => {
          if (confirm('Impressão concluída? Posso fechar esta janela?')) {
            window.close();
          }
        }, 300000);
      </script>
    </body>
    </html>
  `);

    printWindow.document.close();

    setTimeout(() => {
      this.resetComponent();
    }, 3000);
  }
  // ============================================
  // MÉTODOS AUXILIARES NOVOS
  // ============================================

  // Detecta o sistema operacional
  private detectOS(): string {
    const platform = navigator.platform.toLowerCase();
    const userAgent = navigator.userAgent.toLowerCase();

    if (platform.includes('win') || userAgent.includes('windows')) {
      return 'windows';
    }
    if (platform.includes('mac') || userAgent.includes('macintosh')) {
      return 'mac';
    }
    if (platform.includes('linux') || userAgent.includes('linux')) {
      return 'linux';
    }

    return 'unknown';
  }

  // Gera instruções específicas do SO
  private getOSInstructions(os: string): string {
    if (os === 'windows') {
      return `
        <ol>
          <li>Quando o arquivo baixar, vá até a pasta <code>Downloads</code></li>
          <li>Clique com o <strong>botão direito</strong> no arquivo</li>
          <li>Selecione <strong>"Imprimir"</strong></li>
          <li>Escolha a impressora <strong>Zebra GC420T</strong></li>
          <li>Clique em <strong>Imprimir</strong></li>
        </ol>
        <p style="margin-top: 15px;">
          <strong>Alternativa:</strong> Use o Prompt de Comando (cmd) e digite:<br>
          <code>print /D:\\\\%COMPUTERNAME%\\Zebra arquivo.prn</code>
        </p>
      `;
    } else if (os === 'mac') {
      return `
        <ol>
          <li>Quando o arquivo baixar, abra o <strong>Terminal</strong> (Cmd+Espaço, digite "Terminal")</li>
          <li>Digite: <code>cd ~/Downloads</code> e pressione Enter</li>
          <li>Digite: <code>lpr -P Zebra_GC420T -o raw zebra_*.txt</code> e pressione Enter</li>
        </ol>
        <p style="margin-top: 15px;">
          <strong>Dica:</strong> O comando será copiado automaticamente quando você clicar em "Imprimir Agora"!
        </p>
      `;
    } else {
      return `
        <ol>
          <li>Quando o arquivo baixar, abra o <strong>Terminal</strong></li>
          <li>Digite: <code>cd ~/Downloads</code></li>
          <li>Digite: <code>lpr -P Zebra zebra_*.txt</code></li>
          <li>Pressione Enter</li>
        </ol>
      `;
    }
  }

  // Mostra mensagem de sucesso
  private showSuccessMessage(message: string) {
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
        padding: 20px 30px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(76,175,80,0.3);
        font-size: 16px;
        font-weight: bold;
        z-index: 9999;
        animation: slideInRight 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
      ">
        <span style="font-size: 24px;">✅</span>
        <span>${message}</span>
      </div>
      <style>
        @keyframes slideInRight {
          from { transform: translateX(100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      </style>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Gera HTML de preview MELHORADO
  private generatePreviewHTML(): string {
    const allLabels = [];
    for (const item of this.productsData) {
      for (let i = 0; i < item.ticketsQuantity; i++) {
        allLabels.push({
          name: item.name,
          price: item.salePrice,
          barcode: item.barcode
        });
      }
    }

    let html = '';
    const maxPreview = Math.min(6, allLabels.length); // Mostra até 6 etiquetas

    for (let i = 0; i < maxPreview; i++) {
      const label = allLabels[i];
      html += `
        <div class="preview-label" style="
          display: inline-flex;
          flex-direction: column;
          justify-content: space-between;
        ">
          ${this.settings.tickets.name ? `
            <div style="font-weight: bold; font-size: 12px; color: #333;">
              ${(label.name || 'Produto').substring(0, 20)}
            </div>
          ` : ''}
          ${this.settings.tickets.price ? `
            <div style="font-size: 16px; color: #d00; font-weight: bold; margin: 5px 0;">
              R$ ${(label.price || 0).toFixed(2).replace('.', ',')}
            </div>
          ` : ''}
          ${this.settings.tickets.barcode ? `
            <div style="font-family: monospace; font-size: 10px; color: #666; margin-top: auto;">
              ${label.barcode || '0000000000000'}
            </div>
          ` : ''}
        </div>
      `;
    }

    if (allLabels.length > maxPreview) {
      html += `
        <div style="
          display: inline-block;
          padding: 20px;
          color: #666;
          font-style: italic;
        ">
          ... e mais ${allLabels.length - maxPreview} etiquetas
        </div>
      `;
    }

    return html;
  }

  // ADICIONE ESTE MÉTODO NO SEU COMPONENTE - TESTE DIAGNÓSTICO
  // Isso vai nos mostrar onde a impressora realmente está imprimindo
  private generateDiagnosticZPL(): string {
    let zpl = '';

    // TESTE 1: Uma etiqueta simples para descobrir a área real
    zpl += '^XA\n';                    // Início
    zpl += '^CI28\n';                  // UTF-8
    zpl += '^PW236\n';                 // 30mm (UMA etiqueta)
    zpl += '^LL118\n';                 // 15mm altura
    zpl += '^LH0,0\n';                 // Posição inicial

    // MARCADORES NOS CANTOS para ver a área real
    zpl += '^FO0,0\n';                 // CANTO SUPERIOR ESQUERDO
    zpl += '^A0N,12,12\n';
    zpl += '^FD1^FS\n';                // Número 1

    zpl += '^FO224,0\n';               // CANTO SUPERIOR DIREITO
    zpl += '^A0N,12,12\n';
    zpl += '^FD2^FS\n';                // Número 2

    zpl += '^FO0,106\n';               // CANTO INFERIOR ESQUERDO
    zpl += '^A0N,12,12\n';
    zpl += '^FD3^FS\n';                // Número 3

    zpl += '^FO224,106\n';             // CANTO INFERIOR DIREITO
    zpl += '^A0N,12,12\n';
    zpl += '^FD4^FS\n';                // Número 4

    // MARCADORES NO CENTRO
    zpl += '^FO118,54\n';              // CENTRO DA ETIQUETA
    zpl += '^A0N,16,16\n';
    zpl += '^FDCENTRO^FS\n';           // Texto "CENTRO"

    // TESTE DE TEXTO EM VÁRIAS POSIÇÕES
    zpl += '^FO10,20\n';               // Posição segura
    zpl += '^A0N,14,14\n';
    zpl += '^FDNOME TESTE^FS\n';

    zpl += '^FO10,36\n';               // Meio
    zpl += '^A0N,16,16\n';
    zpl += '^FDR$ 25,90^FS\n';

    zpl += '^FO10,78\n';               // Base
    zpl += '^A0N,12,12\n';
    zpl += '^FD1234567890123^FS\n';    // Código longo para testar

    zpl += '^XZ\n';                    // Fim

    return zpl;
  }

private generateZPLCommands(): string {
  let zpl = '';
  const columns = this.settings.print.columns || 1;
  const format = this.settings.print.code;
  const is33x15Format = format.includes('33x15');

  // Cria array com todas as etiquetas
  const allLabels = [];
  for (const item of this.productsData) {
    for (let i = 0; i < item.ticketsQuantity; i++) {
      allLabels.push({
        name: item.name,
        price: item.salePrice,
        barcode: item.barcode
      });
    }
  }

  // ========================================
  // 33x15mm - 3 COLUNAS (BASEADO NO QUE FUNCIONA 100%)
  // ========================================
  if (columns === 3 && is33x15Format) {
    // USANDO A MESMA LÓGICA DO FORMATO QUE FUNCIONA
    // 50x30mm funciona com: PW400, LL240
    // 33x15mm (3 colunas): PW792 (99mm total = 33mm x 3), LL120 (15mm altura)

    for (let i = 0; i < allLabels.length; i += 3) {
      zpl += '^XA\n';
      zpl += '^CI28\n';
      zpl += '^PW720\n';                 // 90mm total (30mm x 3 colunas)
      zpl += '^LL120\n';                 // 15mm altura (igual ao formato original)
      zpl += '^LH0,0\n';

      // 🔥 VAMOS USAR EXATAMENTE O MESMO CÓDIGO QUE FUNCIONA EM 2 COLUNAS
      // MAS ADAPTADO PARA 3 COLUNAS (baseado no formato 50x30mm que funciona perfeitamente)

      // ============================================
      // 🟢 PADRÃO PERFEITO - BACKUP SEGURO
      // ============================================
      // ⭐ LAYOUT FINAL FUNCIONANDO 100%:
      // Nome: Y=25 (fonte 18) - próximo do código
      // Código de barras: Y=40 (SEM texto automático)
      // Número do código: Y=90 (fonte 24) - bem legível
      // Preço: Y=115 (fonte 20) - com espaçamento
      //
      // POSIÇÕES HORIZONTAIS:
      // COLUNA 1: X=-8 | COLUNA 2: X=270 | COLUNA 3: X=555
      // ============================================
      const label1 = allLabels[i];
      if (label1) {
        if (this.settings.tickets.name && label1.name) {
          zpl += '^FO-8,25\n';           // Nome mais próximo do código
          zpl += '^A0N,18,18\n';         // Fonte menor para nome
          zpl += '^FB240,1,0,L,0\n';
          zpl += '^FD' + this.sanitizeForZPL(label1.name, 15) + '^FS\n';
        }
        if (this.settings.tickets.barcode && label1.barcode) {
          zpl += '^FO-8,40\n';           // Código de barras
          zpl += '^BY1,2,45\n';
          zpl += '^BCN,,N,N\n';
          zpl += '^FD' + this.sanitizeBarcode(label1.barcode) + '^FS\n';
          // Número do código embaixo (maior)
          zpl += '^FO-8,90\n';
          zpl += '^A0N,24,24\n';         // Fonte maior para o número
          zpl += '^FD' + this.sanitizeBarcode(label1.barcode) + '^FS\n';
        }
        if (this.settings.tickets.price && label1.price) {
          zpl += '^FO-8,115\n';          // Preço com espaçamento do número do código
          zpl += '^A0N,20,20\n';
          zpl += '^FDR$ ' + this.formatPriceForZPL(label1.price) + '^FS\n';
        }
      }

      // COLUNA 2 - MEIO (AJUSTADA)
      const label2 = allLabels[i + 1];
      if (label2) {
        if (this.settings.tickets.name && label2.name) {
          zpl += '^FO270,25\n';          // Nome mais próximo do código
          zpl += '^A0N,18,18\n';         // Fonte menor para nome
          zpl += '^FB240,1,0,L,0\n';
          zpl += '^FD' + this.sanitizeForZPL(label2.name, 15) + '^FS\n';
        }
        if (this.settings.tickets.barcode && label2.barcode) {
          zpl += '^FO270,40\n';          // Código de barras
          zpl += '^BY1,2,45\n';
          zpl += '^BCN,,N,N\n';
          zpl += '^FD' + this.sanitizeBarcode(label2.barcode) + '^FS\n';
          // Número do código embaixo (maior)
          zpl += '^FO270,90\n';
          zpl += '^A0N,24,24\n';         // Fonte maior para o número
          zpl += '^FD' + this.sanitizeBarcode(label2.barcode) + '^FS\n';
        }
        if (this.settings.tickets.price && label2.price) {
          zpl += '^FO270,115\n';         // Preço com espaçamento do número do código
          zpl += '^A0N,20,20\n';
          zpl += '^FDR$ ' + this.formatPriceForZPL(label2.price) + '^FS\n';
        }
      }

      // COLUNA 3 - DIREITA (MAIS UM POUQUINHO)
      const label3 = allLabels[i + 2];
      if (label3) {
        if (this.settings.tickets.name && label3.name) {
          zpl += '^FO555,25\n';          // Nome mais próximo do código
          zpl += '^A0N,18,18\n';         // Fonte menor para nome
          zpl += '^FB240,1,0,L,0\n';
          zpl += '^FD' + this.sanitizeForZPL(label3.name, 15) + '^FS\n';
        }
        if (this.settings.tickets.barcode && label3.barcode) {
          zpl += '^FO555,40\n';          // Código de barras
          zpl += '^BY1,2,45\n';
          zpl += '^BCN,,N,N\n';
          zpl += '^FD' + this.sanitizeBarcode(label3.barcode) + '^FS\n';
          // Número do código embaixo (maior)
          zpl += '^FO555,90\n';
          zpl += '^A0N,24,24\n';         // Fonte maior para o número
          zpl += '^FD' + this.sanitizeBarcode(label3.barcode) + '^FS\n';
        }
        if (this.settings.tickets.price && label3.price) {
          zpl += '^FO555,115\n';         // Preço com espaçamento do número do código
          zpl += '^A0N,20,20\n';
          zpl += '^FDR$ ' + this.formatPriceForZPL(label3.price) + '^FS\n';
        }
      }

      zpl += '^XZ\n';
    }
  }
  // ========================================
  // 33x15mm - 2 COLUNAS
  // ========================================
  else if (columns === 2 && is33x15Format) {
    // Total: 66mm = 528 dots (33mm x 2)
    for (let i = 0; i < allLabels.length; i += 2) {
      zpl += '^XA\n';
      zpl += '^CI28\n';
      zpl += '^PW528\n';                 // 66mm total (33mm x 2)
      zpl += '^LL120\n';                 // 15mm altura
      zpl += '^LH0,0\n';

      // COLUNA 1 - Esquerda
      const label1 = allLabels[i];
      if (label1) {
        if (this.settings.tickets.name && label1.name) {
          zpl += '^FO10,8\n';
          zpl += '^A0N,14,14\n';
          zpl += '^FB250,1,0,L,0\n';
          zpl += '^FD' + this.sanitizeForZPL(label1.name, 20) + '^FS\n';
        }
        if (this.settings.tickets.price && label1.price) {
          zpl += '^FO10,30\n';
          zpl += '^A0N,20,20\n';
          zpl += '^FDR$ ' + this.formatPriceForZPL(label1.price) + '^FS\n';
        }
        if (this.settings.tickets.barcode && label1.barcode) {
          zpl += '^FO10,55\n';
          zpl += '^BY1,2,40\n';
          zpl += '^BCN,,N,N\n';
          zpl += '^FD' + this.sanitizeBarcode(label1.barcode) + '^FS\n';
        }
      }

      // COLUNA 2 - Direita
      const label2 = allLabels[i + 1];
      if (label2) {
        if (this.settings.tickets.name && label2.name) {
          zpl += '^FO274,8\n';           // X=274 (metade de 528 + margem)
          zpl += '^A0N,14,14\n';
          zpl += '^FB250,1,0,L,0\n';
          zpl += '^FD' + this.sanitizeForZPL(label2.name, 20) + '^FS\n';
        }
        if (this.settings.tickets.price && label2.price) {
          zpl += '^FO274,30\n';
          zpl += '^A0N,20,20\n';
          zpl += '^FDR$ ' + this.formatPriceForZPL(label2.price) + '^FS\n';
        }
        if (this.settings.tickets.barcode && label2.barcode) {
          zpl += '^FO274,55\n';
          zpl += '^BY1,2,40\n';
          zpl += '^BCN,,N,N\n';
          zpl += '^FD' + this.sanitizeBarcode(label2.barcode) + '^FS\n';
        }
      }

      zpl += '^XZ\n';
    }
  }
  // ========================================
  // 33x15mm - 1 COLUNA
  // ========================================
  else if (columns === 1 && is33x15Format) {
    // 33mm = 264 dots
    for (const label of allLabels) {
      zpl += '^XA\n';
      zpl += '^CI28\n';
      zpl += '^PW264\n';                 // 33mm largura
      zpl += '^LL120\n';                 // 15mm altura
      zpl += '^LH0,0\n';

      if (this.settings.tickets.name && label.name) {
        zpl += '^FO10,8\n';
        zpl += '^A0N,16,16\n';
        zpl += '^FB244,1,0,L,0\n';
        zpl += '^FD' + this.sanitizeForZPL(label.name, 22) + '^FS\n';
      }
      if (this.settings.tickets.price && label.price) {
        zpl += '^FO10,32\n';
        zpl += '^A0N,24,24\n';
        zpl += '^FDR$ ' + this.formatPriceForZPL(label.price) + '^FS\n';
      }
      if (this.settings.tickets.barcode && label.barcode) {
        zpl += '^FO10,58\n';
        zpl += '^BY1,2,40\n';
        zpl += '^BCN,,Y,N\n';
        zpl += '^FD' + this.sanitizeBarcode(label.barcode) + '^FS\n';
      }

      zpl += '^XZ\n';
    }
  }
  // ========================================
  // FORMATO 50x30mm (ORIGINAL)
  // ========================================
  else if (columns === 2 && !is33x15Format) {
    // DUAS COLUNAS - 100x30mm
    for (let i = 0; i < allLabels.length; i += 2) {
      zpl += '^XA\n';
      zpl += '^CI28\n';
      zpl += '^PW800\n';                 // 100mm total
      zpl += '^LL240\n';                 // 30mm altura
      zpl += '^LH0,0\n';

      // Etiqueta esquerda
      const label1 = allLabels[i];
      if (label1) {
        if (this.settings.tickets.name && label1.name) {
          zpl += '^FO20,15\n';
          zpl += '^A0N,28,28\n';
          zpl += '^FB380,1,0,L,0\n';
          zpl += '^FD' + this.sanitizeForZPL(label1.name, 25) + '^FS\n';
        }
        if (this.settings.tickets.price && label1.price) {
          zpl += '^FO20,50\n';
          zpl += '^A0N,38,38\n';
          zpl += '^FDR$ ' + this.formatPriceForZPL(label1.price) + '^FS\n';
        }
        if (this.settings.tickets.barcode && label1.barcode) {
          zpl += '^FO20,95\n';
          zpl += '^BY2,3,75\n';
          zpl += '^BCN,,N,N\n';
          zpl += '^FD' + this.sanitizeBarcode(label1.barcode) + '^FS\n';
        }
      }

      // Etiqueta direita
      const label2 = allLabels[i + 1];
      if (label2) {
        if (this.settings.tickets.name && label2.name) {
          zpl += '^FO420,15\n';
          zpl += '^A0N,28,28\n';
          zpl += '^FB380,1,0,L,0\n';
          zpl += '^FD' + this.sanitizeForZPL(label2.name, 25) + '^FS\n';
        }
        if (this.settings.tickets.price && label2.price) {
          zpl += '^FO420,50\n';
          zpl += '^A0N,38,38\n';
          zpl += '^FDR$ ' + this.formatPriceForZPL(label2.price) + '^FS\n';
        }
        if (this.settings.tickets.barcode && label2.barcode) {
          zpl += '^FO420,95\n';
          zpl += '^BY2,3,75\n';
          zpl += '^BCN,,N,N\n';
          zpl += '^FD' + this.sanitizeBarcode(label2.barcode) + '^FS\n';
        }
      }

      zpl += '^XZ\n';
    }
  }
  else {
    // UMA COLUNA - 50x30mm (formato padrão)
    for (const label of allLabels) {
      zpl += '^XA\n';
      zpl += '^CI28\n';
      zpl += '^PW400\n';                 // 50mm largura
      zpl += '^LL240\n';                 // 30mm altura
      zpl += '^LH0,0\n';

      if (this.settings.tickets.name && label.name) {
        zpl += '^FO20,15\n';
        zpl += '^A0N,28,28\n';
        zpl += '^FB380,1,0,L,0\n';
        zpl += '^FD' + this.sanitizeForZPL(label.name, 30) + '^FS\n';
      }
      if (this.settings.tickets.price && label.price) {
        zpl += '^FO20,50\n';
        zpl += '^A0N,38,38\n';
        zpl += '^FDR$ ' + this.formatPriceForZPL(label.price) + '^FS\n';
      }
      if (this.settings.tickets.barcode && label.barcode) {
        zpl += '^FO20,95\n';
        zpl += '^BY2,3,75\n';
        zpl += '^BCN,,Y,N\n';
        zpl += '^FD' + this.sanitizeBarcode(label.barcode) + '^FS\n';
      }

      zpl += '^XZ\n';
    }
  }

  return zpl;
}

// Formata o preço para ZPL (remove espaços e caracteres especiais)
private formatPriceForZPL(price: number): string {
  return (price || 0).toFixed(2).replace('.', ',');
}

// Limpa o texto para ZPL (remove caracteres problemáticos)
private sanitizeForZPL(text: string, maxLength: number = 30): string {
  if (!text) return '';

  // Remove caracteres especiais que podem causar problemas no ZPL
  let sanitized = text
    .substring(0, maxLength)
    .replace(/\^/g, '')
    .replace(/~/g, '')
    .replace(/</g, '')
    .replace(/>/g, '')
    .trim();

  return sanitized;
}

// Limpa código de barras (apenas números)
private sanitizeBarcode(barcode: string): string {
  if (!barcode) return '0000000000000';

  // Remove tudo que não for número
  const cleaned = barcode.replace(/\D/g, '');

  // Se ficar vazio, retorna código padrão
  if (!cleaned) return '0000000000000';

  // Limita a 13 dígitos (padrão EAN-13)
  return cleaned.substring(0, 13);
}

  // Método auxiliar para contar total de etiquetas
  public getTotalLabels(): number {
    let total = 0;
    for (const item of this.productsData) {
      total += item.ticketsQuantity || 0;
    }
    return total;
  }


  // MÉTODOS ORIGINAIS DESCOMENTADOS PARA CORRIGIR COMPILAÇÃO

  // Event Listeners - MANTIDO ORIGINAL
  public onLayerResponse(event: any) {
    if (event.instanceMain) {
      this.layerComponent = event.instanceMain;
    }

    if (event.instance) {
      this.productsComponent = event.instance;
    }

    if (event.productsData) {
      console.log(event.productsData);
      const incoming = event.productsData;

      for (const item of incoming) {
        const existing = this.productsData.find((p: any) => p.code === item.code);

        if (existing) {
          existing.ticketsQuantity = item.ticketsQuantity;
        } else {
          this.productsData.push(item);
        }
      }
    }

    this.toggleContainerFloat();
  }

  public onPrintResponse(event: any) {
    if (event.instance) {
      this.printComponent = event.instance;
    }
  }

  // MÉTODOS AUXILIARES - MANTIDOS EXATAMENTE COMO O ORIGINAL
  public resetComponent() {
    this.productsData = [];

    this.settings.tickets = {
      name: true,
      price: true,
      barcode: true
    };
    this.settings.print = { ...this.formats[0] };

    $$('.container-float').css({ display: 'none' });
    $$('.container-products').css({ marginBottom: '0' });

    if (this.layerComponent) {
      this.layerComponent.onClose();
    }

    // Verifica se existe antes de chamar
    if (this.productsComponent && this.productsComponent.resetData) {
      this.productsComponent.resetData();
    }

    this.isPrinting = false; // Reseta flag de impressão
  }

  public composeStatistics() {
    this.settings.statistics = {
      tickets: 0,
      pages: 0,
      files: 0
    };

    for (const item of this.productsData) {
      this.settings.statistics.tickets += item.ticketsQuantity;
    }

    const calcPages = Math.ceil(this.settings.statistics.tickets / this.settings.print.quantityPerSheet);

    this.settings.statistics.pages = ((calcPages < this.settings.print.pageLimit) ? calcPages : this.settings.print.pageLimit);
    const value = Math.ceil(calcPages / this.settings.statistics.pages);
    this.settings.statistics.files = isNaN(value) ? 0 : value;
  }

  private toggleContainerFloat() {
    const timer = setInterval(() => {
      const containerFloat = $$('.container-float');
      const containerProducts = $$('.container-products');

      if (containerFloat.length > 0 && containerProducts.length > 0) {
        clearInterval(timer);

        this.composeStatistics();

        if ((this.productsData).length > 0) {
          containerFloat.css({ display: 'block' });
          containerProducts.css({ marginBottom: `${(containerFloat.height() + 10)}px` });
        } else {
          containerFloat.css({ display: 'none' });
          containerProducts.css({ marginBottom: '0' });
        }
      }
    }, 0);
  }

  // Layer Actions - MANTIDO ORIGINAL
  public onOpenLayer(type: string) {
    if (this.layerComponent) {
      this.layerComponent.onOpen({
        title: 'Products',
        activeComponent: type
      });
    }
  }

  // Auxiliary Methods - MANTIDO ORIGINAL
  public onApplyNumberMask(event: any, item: any, target: string) {
    const value = FieldMask.numberFieldMask($$(event.target)[0].value);
    $$(event.target).val(value);

    if (target == 'quantity') {
      item.ticketsQuantity = (value ? parseInt(value) : 0);
    }

    this.composeStatistics();
  }

  // MÉTODO COMENTADO TEMPORARIAMENTE - CÓDIGO ORIGINAL
  /*
  private generateZPLCommandsOriginal(): string {
    let zpl = '';
    const columns = this.settings.print.columns || 1;
    const format = this.settings.print.code;
    const is33x15Format = format.includes('33x15');

    // Cria array com todas as etiquetas
    const allLabels = [];
    for (const item of this.productsData) {
      for (let i = 0; i < item.ticketsQuantity; i++) {
        allLabels.push({
          name: item.name,
          price: item.salePrice,
          barcode: item.barcode
        });
      }
    }

    if (columns === 2) {
      if (is33x15Format) {
        // DUAS COLUNAS - 66x15mm (33mm cada etiqueta)
        for (let i = 0; i < allLabels.length; i += 2) {
          zpl += '^XA\n';
          zpl += '^CI28\n'; // UTF-8 encoding
          zpl += '^PW528\n';  // 66mm total (33mm x 2)
          zpl += '^LL120\n';  // 15mm altura
          zpl += '^LH0,0\n';  // Posição inicial

          // ETIQUETA ESQUERDA
          const label1 = allLabels[i];
          if (label1) {
            if (this.settings.tickets.name && label1.name) {
              zpl += '^FO10,5\n';
              zpl += '^A0N,18,18\n';  // Fonte menor para caber no espaço
              zpl += '^FB250,1,0,L,0\n'; // Field block ajustado
              zpl += '^FD' + this.sanitizeForZPL(label1.name, 12) + '^FS\n';
            }
            if (this.settings.tickets.price && label1.price) {
              zpl += '^FO10,30\n';
              zpl += '^A0N,24,24\n';  // Fonte para preço
              zpl += '^FDR$ ' + this.formatPriceForZPL(label1.price) + '^FS\n';
            }
            if (this.settings.tickets.barcode && label1.barcode) {
              zpl += '^FO10,55\n';
              zpl += '^BY1,2,40\n';  // Código de barras ligeiramente menor
              zpl += '^BCN,,N,N\n';
              zpl += '^FD' + this.sanitizeBarcode(label1.barcode) + '^FS\n';
            }
          }

          // ETIQUETA DIREITA
          const label2 = allLabels[i + 1];
          if (label2) {
            if (this.settings.tickets.name && label2.name) {
              zpl += '^FO274,5\n';
              zpl += '^A0N,18,18\n';
              zpl += '^FB250,1,0,L,0\n';
              zpl += '^FD' + this.sanitizeForZPL(label2.name, 12) + '^FS\n';
            }
            if (this.settings.tickets.price && label2.price) {
              zpl += '^FO274,30\n';
              zpl += '^A0N,24,24\n';
              zpl += '^FDR$ ' + this.formatPriceForZPL(label2.price) + '^FS\n';
            }
            if (this.settings.tickets.barcode && label2.barcode) {
              zpl += '^FO274,55\n';
              zpl += '^BY1,2,40\n';
              zpl += '^BCN,,N,N\n';
              zpl += '^FD' + this.sanitizeBarcode(label2.barcode) + '^FS\n';
            }
          }

          zpl += '^XZ\n';
        }
      } else {
        // DUAS COLUNAS - 100x30mm (50mm cada etiqueta) - FORMATO ORIGINAL
        for (let i = 0; i < allLabels.length; i += 2) {
          zpl += '^XA\n';
          zpl += '^CI28\n'; // UTF-8 encoding
          zpl += '^PW800\n';  // 100mm total
          zpl += '^LL240\n';  // 30mm altura
          zpl += '^LH0,0\n';  // Posição inicial

          // ETIQUETA ESQUERDA
          const label1 = allLabels[i];
          if (label1) {
            if (this.settings.tickets.name && label1.name) {
              zpl += '^FO20,15\n';
              zpl += '^A0N,28,28\n';  // Fonte otimizada
              zpl += '^FB380,1,0,L,0\n'; // Field block para quebra de linha
              zpl += '^FD' + this.sanitizeForZPL(label1.name, 25) + '^FS\n';
            }
            if (this.settings.tickets.price && label1.price) {
              zpl += '^FO20,50\n';
              zpl += '^A0N,38,38\n';  // Fonte grande para preço
              zpl += '^FDR$ ' + this.formatPriceForZPL(label1.price) + '^FS\n';
            }
            if (this.settings.tickets.barcode && label1.barcode) {
              zpl += '^FO20,95\n';
              zpl += '^BY2,3,75\n';  // Código de barras otimizado
              zpl += '^BCN,,N,N\n';
              zpl += '^FD' + this.sanitizeBarcode(label1.barcode) + '^FS\n';
            }
          }

          // ETIQUETA DIREITA
          const label2 = allLabels[i + 1];
          if (label2) {
            if (this.settings.tickets.name && label2.name) {
              zpl += '^FO420,15\n';
              zpl += '^A0N,28,28\n';
              zpl += '^FB380,1,0,L,0\n';
              zpl += '^FD' + this.sanitizeForZPL(label2.name, 25) + '^FS\n';
            }
            if (this.settings.tickets.price && label2.price) {
              zpl += '^FO420,50\n';
              zpl += '^A0N,38,38\n';
              zpl += '^FDR$ ' + this.formatPriceForZPL(label2.price) + '^FS\n';
            }
            if (this.settings.tickets.barcode && label2.barcode) {
              zpl += '^FO420,95\n';
              zpl += '^BY2,3,75\n';
              zpl += '^BCN,,N,N\n';
              zpl += '^FD' + this.sanitizeBarcode(label2.barcode) + '^FS\n';
            }
          }

          zpl += '^XZ\n';
        }
      }
    } else {
      if (is33x15Format) {
        // UMA COLUNA - 33x15mm
        for (const label of allLabels) {
          zpl += '^XA\n';
          zpl += '^CI28\n'; // UTF-8 encoding
          zpl += '^PW264\n';  // 33mm largura
          zpl += '^LL120\n';  // 15mm altura
          zpl += '^LH0,0\n';  // Posição inicial

          if (this.settings.tickets.name && label.name) {
            zpl += '^FO10,4\n';
            zpl += '^A0N,18,18\n';  // Fonte menor para caber melhor
            zpl += '^FB244,1,0,L,0\n'; // Field block
            zpl += '^FD' + this.sanitizeForZPL(label.name, 14) + '^FS\n';
          }
          if (this.settings.tickets.price && label.price) {
            zpl += '^FO10,28\n';
            zpl += '^A0N,24,24\n';  // Fonte para preço
            zpl += '^FDR$ ' + this.formatPriceForZPL(label.price) + '^FS\n';
          }
          if (this.settings.tickets.barcode && label.barcode) {
            zpl += '^FO10,55\n';
            zpl += '^BY1,2,40\n';  // Código de barras um pouco menor
            zpl += '^BCN,,N,N\n';
            zpl += '^FD' + this.sanitizeBarcode(label.barcode) + '^FS\n';
          }

          zpl += '^XZ\n';
        }
      } else {
        // UMA COLUNA - 50x30mm - FORMATO ORIGINAL
        for (const label of allLabels) {
          zpl += '^XA\n';
          zpl += '^CI28\n'; // UTF-8 encoding
          zpl += '^PW400\n';  // 50mm largura
          zpl += '^LL240\n';  // 30mm altura
          zpl += '^LH0,0\n';  // Posição inicial

          if (this.settings.tickets.name && label.name) {
            zpl += '^FO20,10\n';
            zpl += '^A0N,32,32\n';  // Fonte grande
            zpl += '^FB360,1,0,L,0\n'; // Field block
            zpl += '^FD' + this.sanitizeForZPL(label.name, 25) + '^FS\n';
          }
          if (this.settings.tickets.price && label.price) {
            zpl += '^FO20,50\n';
            zpl += '^A0N,42,42\n';  // Fonte extra grande para preço
            zpl += '^FDR$ ' + this.formatPriceForZPL(label.price) + '^FS\n';
          }
          if (this.settings.tickets.barcode && label.barcode) {
            zpl += '^FO20,100\n';
            zpl += '^BY2,3,80\n';  // Código de barras maior
            zpl += '^BCN,,N,N\n';
            zpl += '^FD' + this.sanitizeBarcode(label.barcode) + '^FS\n';
          }

          zpl += '^XZ\n';
        }
      }
    }

    return zpl;
  }

  // MÉTODOS ORIGINAIS MANTIDOS ABAIXO

  // Layer Actions - MANTIDO ORIGINAL
  public onOpenLayer(type: string) {
    if (this.layerComponent) {
      this.layerComponent.onOpen({
        title: 'Products',
        activeComponent: type
      });
    }
  }

  // Event Listeners - MANTIDO ORIGINAL
  public onLayerResponse(event: any) {
    if (event.instanceMain) {
      this.layerComponent = event.instanceMain;
    }

    if (event.instance) {
      this.productsComponent = event.instance;
    }

    if (event.productsData) {
      console.log(event.productsData);
      const incoming = event.productsData;

      for (const item of incoming) {
        const existing = this.productsData.find((p: any) => p.code === item.code);

        if (existing) {
          existing.ticketsQuantity = item.ticketsQuantity;
        } else {
          this.productsData.push(item);
        }
      }
    }

    this.toggleContainerFloat();
  }

  public onPrintResponse(event: any) {
    if (event.instance) {
      this.printComponent = event.instance;
    }
  }

  // Auxiliary Methods - MANTIDO ORIGINAL
  public onApplyNumberMask(event: any, item: any, target: string) {
    const value = FieldMask.numberFieldMask($$(event.target)[0].value);
    $$(event.target).val(value);

    if (target == 'quantity') {
      item.ticketsQuantity = (value ? parseInt(value) : 0);
    }

    this.composeStatistics();
  }

  // MÉTODOS AUXILIARES - MANTIDOS EXATAMENTE COMO O ORIGINAL
  public resetComponent() {
    this.productsData = [];

    this.settings.tickets = {
      name: true,
      price: true,
      barcode: true
    };
    this.settings.print = { ...this.formats[0] };

    $$('.container-float').css({ display: 'none' });
    $$('.container-products').css({ marginBottom: '0' });

    if (this.layerComponent) {
      this.layerComponent.onClose();
    }

    // Verifica se existe antes de chamar
    if (this.productsComponent && this.productsComponent.resetData) {
      this.productsComponent.resetData();
    }

    this.isPrinting = false; // Reseta flag de impressão
  }

  // ===================================================================
  // DEPOIS DO TESTE, USE ESTES TEMPLATES BASEADOS NO QUE APARECER:
  // ===================================================================

  // TEMPLATE A: Se os números 1,2,3,4 aparecerem nos cantos corretos
  private generateCorrectZPL_TemplateA(): string {
    let zpl = '';
    const columns = 3;
    const allLabels = this.getAllLabels(); // Use seu método atual

    for (let i = 0; i < allLabels.length; i += 3) {
      zpl += '^XA\n^CI28\n^PW708\n^LL118\n^LH0,0\n';

      // COLUNA 1: X=10-226
      const label1 = allLabels[i];
      if (label1) {
        if (this.settings.tickets.name && label1.name) {
          zpl += '^FO10,5\n^A0N,14,14\n^FB216,1,0,L,0\n';
          zpl += '^FD' + this.sanitizeForZPL(label1.name, 15) + '^FS\n';
        }
        if (this.settings.tickets.price && label1.price) {
          zpl += '^FO10,22\n^A0N,16,16\n';
          zpl += '^FDR$ ' + this.formatPriceForZPL(label1.price) + '^FS\n';
        }
        if (this.settings.tickets.barcode && label1.barcode) {
          zpl += '^FO10,45\n^BY1,1,25\n^BCN,,N,N\n';
          zpl += '^FD' + this.sanitizeBarcode(label1.barcode) + '^FS\n';
        }
      }

      // COLUNA 2: X=246-462
      const label2 = allLabels[i + 1];
      if (label2) {
        if (this.settings.tickets.name && label2.name) {
          zpl += '^FO246,5\n^A0N,14,14\n^FB216,1,0,L,0\n';
          zpl += '^FD' + this.sanitizeForZPL(label2.name, 15) + '^FS\n';
        }
        if (this.settings.tickets.price && label2.price) {
          zpl += '^FO246,22\n^A0N,16,16\n';
          zpl += '^FDR$ ' + this.formatPriceForZPL(label2.price) + '^FS\n';
        }
        if (this.settings.tickets.barcode && label2.barcode) {
          zpl += '^FO246,45\n^BY1,1,25\n^BCN,,N,N\n';
          zpl += '^FD' + this.sanitizeBarcode(label2.barcode) + '^FS\n';
        }
      }

      // COLUNA 3: X=482-698
      const label3 = allLabels[i + 2];
      if (label3) {
        if (this.settings.tickets.name && label3.name) {
          zpl += '^FO482,5\n^A0N,14,14\n^FB216,1,0,L,0\n';
          zpl += '^FD' + this.sanitizeForZPL(label3.name, 15) + '^FS\n';
        }
        if (this.settings.tickets.price && label3.price) {
          zpl += '^FO482,22\n^A0N,16,16\n';
          zpl += '^FDR$ ' + this.formatPriceForZPL(label3.price) + '^FS\n';
        }
        if (this.settings.tickets.barcode && label3.barcode) {
          zpl += '^FO482,45\n^BY1,1,25\n^BCN,,N,N\n';
          zpl += '^FD' + this.sanitizeBarcode(label3.barcode) + '^FS\n';
        }
      }

      zpl += '^XZ\n';
    }

    return zpl;
  }

  // TEMPLATE B: Se tudo estiver deslocado, use coordenadas menores
  private generateCorrectZPL_TemplateB(): string {
    let zpl = '';
    const columns = 3;
    const allLabels = this.getAllLabels();

    for (let i = 0; i < allLabels.length; i += 3) {
      zpl += '^XA\n^CI28\n^PW600\n^LL100\n^LH0,0\n'; // Menores

      // COLUNA 1: X=5-195
      const label1 = allLabels[i];
      if (label1) {
        if (this.settings.tickets.name && label1.name) {
          zpl += '^FO5,2\n^A0N,12,12\n^FB190,1,0,L,0\n';
          zpl += '^FD' + this.sanitizeForZPL(label1.name, 12) + '^FS\n';
        }
        if (this.settings.tickets.price && label1.price) {
          zpl += '^FO5,18\n^A0N,14,14\n';
          zpl += '^FDR$ ' + this.formatPriceForZPL(label1.price) + '^FS\n';
        }
        if (this.settings.tickets.barcode && label1.barcode) {
          zpl += '^FO5,38\n^BY1,1,22\n^BCN,,N,N\n';
          zpl += '^FD' + this.sanitizeBarcode(label1.barcode) + '^FS\n';
        }
      }

      // COLUNA 2 e 3 similares...
      // (Complete conforme necessário após o teste)

      zpl += '^XZ\n';
    }

    return zpl;
  }

  // Método auxiliar para obter todas as etiquetas
  private getAllLabels(): any[] {
    const allLabels = [];
    for (const item of this.productsData) {
      for (let i = 0; i < item.ticketsQuantity; i++) {
        allLabels.push({
          name: item.name,
          price: item.salePrice,
          barcode: item.barcode
        });
      }
    }
    return allLabels;
  }

  public composeStatistics() {
    this.settings.statistics = {
      tickets: 0,
      pages: 0,
      files: 0
    };

    for (const item of this.productsData) {
      this.settings.statistics.tickets += item.ticketsQuantity;
    }

    const calcPages = Math.ceil(this.settings.statistics.tickets / this.settings.print.quantityPerSheet);

    this.settings.statistics.pages = ((calcPages < this.settings.print.pageLimit) ? calcPages : this.settings.print.pageLimit);
    const value = Math.ceil(calcPages / this.settings.statistics.pages);
    this.settings.statistics.files = isNaN(value) ? 0 : value;
  }

  private toggleContainerFloat() {
    const timer = setInterval(() => {
      const containerFloat = $$('.container-float');
      const containerProducts = $$('.container-products');

      if (containerFloat.length > 0 && containerProducts.length > 0) {
        clearInterval(timer);

        this.composeStatistics();

        if ((this.productsData).length > 0) {
          containerFloat.css({ display: 'block' });
          containerProducts.css({ marginBottom: `${(containerFloat.height() + 10)}px` });
        } else {
          containerFloat.css({ display: 'none' });
          containerProducts.css({ marginBottom: '0' });
        }
      }
    }, 0);
  }

// Formata o preço para ZPL (remove espaços e caracteres especiais)
private formatPriceForZPL(price: number): string {
  return (price || 0).toFixed(2).replace('.', ',');
}

// Limpa o texto para ZPL (remove caracteres problemáticos)
private sanitizeForZPL(text: string, maxLength: number = 30): string {
  if (!text) return '';

  // Remove caracteres especiais que podem causar problemas no ZPL
  let sanitized = text
    .substring(0, maxLength)
    .replace(/\^/g, '')
    .replace(/~/g, '')
    .replace(/</g, '')
    .replace(/>/g, '')
    .trim();

  return sanitized;
}

// Limpa código de barras (apenas números)
private sanitizeBarcode(barcode: string): string {
  if (!barcode) return '0000000000000';

  // Remove tudo que não for número
  const cleaned = barcode.replace(/\D/g, '');

  // Se ficar vazio, retorna código padrão
  if (!cleaned) return '0000000000000';

  // Limita a 13 dígitos (padrão EAN-13)
  return cleaned.substring(0, 13);
}

  // Método auxiliar para contar total de etiquetas
  public getTotalLabels(): number {
    let total = 0;
    for (const item of this.productsData) {
      total += item.ticketsQuantity || 0;
    }
    return total;
  }
  */
}
