// ========================================
// SERVICO DE IMPRESSAO ZEBRA - MULTI-PLATAFORMA
// Funciona no Windows, Mac e Linux
// ========================================

import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ZebraPrintService {

    constructor() { }

    // ========================================
    // METODO PRINCIPAL - TENTA IMPRIMIR DE VARIAS FORMAS
    // ========================================
    public async printLabels(labels: any[], settings: any): Promise<boolean> {
        // Gera os comandos ZPL (linguagem da Zebra)
        const zplCommands = this.generateZPL(labels, settings);

        // Detecta o sistema operacional
        const os = this.detectOS();

        // Tenta imprimir usando varios metodos
        let success = false;

        // METODO 1: Impressao direta via WebUSB (mais moderno)
        if (!success && 'usb' in navigator) {
            success = await this.printViaWebUSB(zplCommands);
        }

        // METODO 2: Impressao via servidor local (se tiver)
        if (!success) {
            success = await this.printViaLocalServer(zplCommands);
        }

        // METODO 3: Download do arquivo para impressao manual
        if (!success) {
            success = this.downloadForManualPrint(zplCommands, os);
        }

        return success;
    }

    // ========================================
    // GERA COMANDOS ZPL (LINGUAGEM DA ZEBRA)
    // ========================================
    private generateZPL(labels: any[], settings: any): string {
        let zpl = '';
        const columns = settings.print?.columns || 1;
        const format = settings.print?.code || '';

        // Detecta se e formato 33x15mm
        const is33x15Format = format.includes('33x15');

        // Configuracao para 1 ou 2 colunas baseada no formato
        let labelWidth: number;
        let labelHeight: number;

        if (is33x15Format) {
            labelWidth = 264;  // 33mm em dots (por etiqueta)
            labelHeight = 120;  // 15mm altura em dots
        } else {
            labelWidth = columns === 2 ? 400 : 800;  // Largura em dots (50mm)
            labelHeight = 240;  // Altura em dots (30mm)
        }

        for (let i = 0; i < labels.length; i += columns) {
            // Inicio da etiqueta
            zpl += '^XA\n';  // Comeca etiqueta
            zpl += '^CI28\n'; // UTF-8 encoding
            zpl += `^PW${labelWidth * columns}\n`;  // Largura total
            zpl += `^LL${labelHeight}\n`;  // Altura

            // Processa cada coluna
            for (let col = 0; col < columns; col++) {
                const label = labels[i + col];
                if (!label) continue;

                // Posicao X baseada na coluna
                const xOffset = col * labelWidth + (is33x15Format ? 10 : 20);

                if (is33x15Format) {
                    // CONFIGURACOES PARA ETIQUETA 33x15mm (ajustes para nomes longos)
                    // - Fonte menor para o nome
                    // - Truncagem mais agressiva proporcional ao numero de colunas

                    const cols = Math.max(1, Math.min(4, columns));
                    const nameMaxLen = (cols === 1 ? 16 : (cols === 2 ? 12 : 10));

                    // NOME DO PRODUTO (se habilitado)
                    if (settings.tickets?.name && label.name) {
                        zpl += `^FO${xOffset},4\n`;                // Posicao ajustada
                        zpl += '^A0N,18,18\n';                    // Fonte menor
                        zpl += `^FB${labelWidth - 18},1,0,L,0\n`; // Largura do campo
                        zpl += `^FD${this.truncateText(label.name, nameMaxLen)}^FS\n`;  // Texto truncado
                    }

                    // PRECO (se habilitado)
                    if (settings.tickets?.price && label.price) {
                        zpl += `^FO${xOffset},28\n`;  // Posicao ajustada
                        zpl += '^A0N,22,22\n';       // Fonte levemente menor
                        zpl += `^FDR$ ${this.formatPrice(label.price)}^FS\n`;
                    }

                    // CODIGO DE BARRAS (se habilitado)
                    if (settings.tickets?.barcode && label.barcode) {
                        zpl += `^FO${xOffset},54\n`;  // Posicao ajustada
                        zpl += '^BY1,2,40\n';        // Codigo de barras um pouco menor
                        zpl += '^BCN,,Y,N\n';        // Code 128
                        zpl += `^FD${label.barcode}^FS\n`;
                    }
                } else {
                    // CONFIGURACOES PARA ETIQUETA 50x30mm (ORIGINAL)
                    // NOME DO PRODUTO (se habilitado)
                    if (settings.tickets?.name && label.name) {
                        zpl += `^FO${xOffset},20\n`;  // Posicao
                        zpl += '^A0N,30,30\n';  // Fonte e tamanho
                        zpl += `^FD${this.truncateText(label.name, 20)}^FS\n`;  // Texto
                    }

                    // PRECO (se habilitado)
                    if (settings.tickets?.price && label.price) {
                        zpl += `^FO${xOffset},60\n`;  // Posicao
                        zpl += '^A0N,45,45\n';  // Fonte maior para preco
                        zpl += `^FDR$ ${this.formatPrice(label.price)}^FS\n`;  // Preco formatado
                    }

                    // CODIGO DE BARRAS (se habilitado)
                    if (settings.tickets?.barcode && label.barcode) {
                        zpl += `^FO${xOffset},110\n`;  // Posicao
                        zpl += '^BY2,3,80\n';  // Configuracao do codigo de barras
                        zpl += '^BCN,,Y,N\n';  // Tipo Code 128
                        zpl += `^FD${label.barcode}^FS\n`;  // Dados
                    }
                }
            }

            // Fim da etiqueta
            zpl += '^XZ\n';  // Termina etiqueta
        }

        return zpl;
    }

    // ========================================
    // METODO 1: WebUSB (Chrome/Edge)
    // ========================================
    private async printViaWebUSB(zpl: string): Promise<boolean> {
        try {
            // Verifica se o navegador suporta WebUSB
            if (!('usb' in navigator)) {
                return false;
            }

            // Solicita acesso a impressora USB
            const device = await (navigator as any).usb.requestDevice({
                filters: [
                    { vendorId: 0x0A5F },  // ID da Zebra
                    { vendorId: 0x23F6 }   // Outro ID comum da Zebra
                ]
            });

            if (!device) return false;

            // Abre conexao
            await device.open();
            await device.selectConfiguration(1);
            await device.claimInterface(0);

            // Envia os comandos ZPL
            const encoder = new TextEncoder();
            const data = encoder.encode(zpl);
            await device.transferOut(1, data);

            // Fecha conexao
            await device.close();

            this.showSuccess('Etiquetas enviadas para impressao!');
            return true;

        } catch (error) {
            console.log('WebUSB nao disponivel ou nao permitido');
            return false;
        }
    }

    // ========================================
    // METODO 2: Servidor Local (mais confiavel)
    // ========================================
    private async printViaLocalServer(zpl: string): Promise<boolean> {
        try {
            // Tenta enviar para servidor local na porta 9100 (padrao Zebra)
            await fetch('http://localhost:9100', {
                method: 'POST',
                mode: 'no-cors',  // Evita problemas de CORS
                body: zpl
            });

            // Se chegou aqui, provavelmente funcionou
            this.showSuccess('Etiquetas enviadas para impressao!');
            return true;

        } catch (error) {
            // Servidor local nao esta rodando
            return false;
        }
    }

    // ========================================
    // METODO 3: Download do arquivo (fallback)
    // ========================================
    private downloadForManualPrint(zpl: string, os: string): boolean {
        // Cria o arquivo com extensao apropriada
        const extension = os === 'windows' ? 'prn' : 'zpl';
        const filename = `etiquetas_zebra_${Date.now()}.${extension}`;

        // Cria o blob e faz download
        const blob = new Blob([zpl], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);

        // Mostra instrucoes especificas por SO
        this.showPrintInstructions(os, filename);

        return true;
    }

    // ========================================
    // INSTRUCOES DE IMPRESSAO POR SISTEMA
    // ========================================
    private showPrintInstructions(os: string, filename: string) {
        let instructions = '';

        if (os === 'windows') {
            instructions = `
ARQUIVO BAIXADO COM SUCESSO!

COMO IMPRIMIR NO WINDOWS:

OPCAO 1 - Mais Facil:
1. Abra a pasta Downloads
2. Clique com botao direito no arquivo "${filename}"
3. Escolha "Imprimir"
4. Selecione a impressora Zebra

OPCAO 2 - Zebra Setup Utilities:
1. Abra o programa (se instalado)
2. Use "Tools" > "Send File"
3. Selecione o arquivo
      `;
        } else if (os === 'mac') {
            instructions = `
ARQUIVO BAIXADO COM SUCESSO!

COMO IMPRIMIR NO MAC:

OPCAO 1 - Terminal (mais rapido):
1. Abra o Terminal
2. Digite: cd ~/Downloads
3. Digite: lpr -P Zebra_GC420T -o raw ${filename}

OPCAO 2 - Zebra Setup Utilities:
1. Baixe em: zebra.com/drivers
2. Use "Tools" > "Send File"
3. Selecione o arquivo
      `;
        } else {
            instructions = `
ARQUIVO BAIXADO COM SUCESSO!

COMO IMPRIMIR NO LINUX:

1. Abra o Terminal
2. Digite: cd ~/Downloads
3. Digite: lpr -P Zebra ${filename}

OU

Digite: cat ~/Downloads/${filename} > /dev/usb/lp0
      `;
        }

        alert(instructions);
    }

    // ========================================
    // FUNCOES AUXILIARES
    // ========================================

    // Detecta o sistema operacional
    private detectOS(): string {
        const userAgent = window.navigator.userAgent.toLowerCase();

        if (userAgent.includes('win')) return 'windows';
        if (userAgent.includes('mac')) return 'mac';
        if (userAgent.includes('linux')) return 'linux';

        return 'unknown';
    }

    // Trunca texto longo
    private truncateText(text: string, maxLength: number): string {
        if (!text) return '';
        return text.length > maxLength ?
            text.substring(0, maxLength - 3) + '...' :
            text;
    }

    // Formata preco brasileiro
    private formatPrice(price: number): string {
        if (!price) return '0,00';
        return price.toFixed(2).replace('.', ',');
    }

    // Mostra mensagem de sucesso
    private showSuccess(message: string) {
        // Cria notificacao bonita
        const notification = document.createElement('div');
        notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        font-size: 16px;
        z-index: 9999;
        animation: slideIn 0.3s ease;
      ">
        ${message}
      </div>
    `;

        document.body.appendChild(notification);

        // Remove apos 3 segundos
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}
