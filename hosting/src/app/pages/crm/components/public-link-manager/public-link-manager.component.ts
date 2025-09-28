// Arquivo: public-link-manager.component.ts
// Caminho: src/app/pages/crm/components/public-link-manager/public-link-manager.component.ts
// O que faz: Componente para gerenciar o link público dentro do CRM

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

// Serviços
import { PublicRegistrationService } from '../../services/public-registration.service';

// Utilities
import { Utilities } from '@shared/utilities/utilities';
import { DateTime } from '@shared/utilities/dateTime';
// Para gerar QR Code
declare var QRCode: any; // Vamos usar a biblioteca QRCode.js

@Component({
    selector: 'app-public-link-manager',
    templateUrl: './public-link-manager.component.html',
    styleUrls: ['./public-link-manager.component.scss']
})
export class PublicLinkManagerComponent implements OnInit {

    // Link público gerado
    public publicLink: string = '';

    // Formulário de configurações
    public settingsForm: FormGroup;

    // Estados
    public loading: boolean = false;
    public showQRCode: boolean = false;
    public qrCodeGenerated: boolean = false;

    // Estatísticas
    public statistics: any = {
        totalRegistrations: 0,
        todayRegistrations: 0,
        weekRegistrations: 0,
        monthRegistrations: 0
    };
    // Últimos cadastros
    public recentRegistrations: any[] = [];
    public recentLoading: boolean = false;

    // Informações da empresa
    public companyName: string = '';
    constructor(
        private formBuilder: FormBuilder,
        private publicRegistrationService: PublicRegistrationService
    ) { }

    ngOnInit(): void {
        console.log('🔗 Gerenciador de Link Público iniciado');

        // Gera o link
        this.publicLink = this.publicRegistrationService.generatePublicLink();

        // Carrega configurações
        this.loadSettings();

        // Carrega estatísticas quando a data estiver pronta
        DateTime.context(() => {
            this.loadStatistics();
            this.loadRecentRegistrations();
        });

        // Carrega informações da empresa
        this.loadCompanyInfo();
    }

    /**
     * Carrega as configurações do formulário
     */
    private async loadSettings(): Promise<void> {
        this.loading = true;

        try {
            const settings = await this.publicRegistrationService.getFormSettings();
            this.createSettingsForm(settings);
            this.loading = false;
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
            this.loading = false;
        }
    }

    /**
     * Cria o formulário de configurações
     */
    private createSettingsForm(settings: any): void {
        this.settingsForm = this.formBuilder.group({
            // Campos do formulário
            fields: this.formBuilder.group({
                name: this.formBuilder.group({
                    show: [settings.fields.name.show],
                    required: [settings.fields.name.required],
                    label: [settings.fields.name.label]
                }),
                email: this.formBuilder.group({
                    show: [settings.fields.email.show],
                    required: [settings.fields.email.required],
                    label: [settings.fields.email.label]
                }),
                phone: this.formBuilder.group({
                    show: [settings.fields.phone.show],
                    required: [{value: settings.fields.phone.required, disabled: true}],
                    label: [settings.fields.phone.label]
                }),
                cpf: this.formBuilder.group({
                    show: [settings.fields.cpf.show],
                    required: [settings.fields.cpf.required],
                    label: [settings.fields.cpf.label]
                }),
                birthDate: this.formBuilder.group({
                    show: [settings.fields.birthDate.show],
                    required: [settings.fields.birthDate.required],
                    label: [settings.fields.birthDate.label]
                }),
                address: this.formBuilder.group({
                    show: [settings.fields.address.show],
                    required: [settings.fields.address.required],
                    label: [settings.fields.address.label]
                })
            }),
            // Aparência
            appearance: this.formBuilder.group({
                title: [settings.appearance.title],
                subtitle: [settings.appearance.subtitle],
                primaryColor: [settings.appearance.primaryColor],
                successMessage: [settings.appearance.successMessage]
            }),
            // Segurança
            security: this.formBuilder.group({
                captcha: [settings.security.captcha],
                emailVerification: [settings.security.emailVerification],
                limitPerDay: [settings.security.limitPerDay]
            })
        });
    }

    /**
     * Salva as configurações
     */
    public async saveSettings(): Promise<void> {
        if (!this.settingsForm.valid) return;

        this.loading = true;

        try {
            await this.publicRegistrationService.saveFormSettings(this.settingsForm.value);
            this.loading = false;
        } catch (error) {
            console.error('Erro ao salvar:', error);
            this.loading = false;
        }
    }

    /**
     * Copia o link para a área de transferência
     */
    public copyLink(): void {
        // Cria um elemento temporário
        const input = document.createElement('input');
        input.value = this.publicLink;
        document.body.appendChild(input);

        // Seleciona e copia
        input.select();
        document.execCommand('copy');

        // Remove o elemento
        document.body.removeChild(input);

        // Mostra mensagem
        alert('Link copiado para a área de transferência!');
    }

    /**
     * Gera o QR Code
     */
    public generateQRCode(): void {
        this.showQRCode = true;

        // Espera o elemento aparecer na tela
        setTimeout(() => {
            const qrElement = document.getElementById('qrcode');

            if (qrElement && !this.qrCodeGenerated) {
                // Limpa o elemento
                qrElement.innerHTML = '';

                // Gera o QR Code - correção aqui
                try {
                    new (window as any).QRCode(qrElement, {
                        text: this.publicLink,
                        width: 300,
                        height: 300,
                        colorDark: '#000000',
                        colorLight: '#FFFFFF',
                        correctLevel: (window as any).QRCode.CorrectLevel.H
                    });

                    this.qrCodeGenerated = true;
                } catch (error) {
                    console.error('Erro ao gerar QR Code:', error);
                    alert('Erro ao gerar QR Code. Verifique se a biblioteca foi carregada.');
                }
            }
        }, 100);
    }

    /**
     * Baixa o QR Code como imagem
     */
    public downloadQRCode(): void {
        const canvas = document.querySelector('#qrcode canvas') as HTMLCanvasElement;

        if (canvas) {
            // Converte para imagem
            const url = canvas.toDataURL('image/png');

            // Cria link de download
            const link = document.createElement('a');
            link.download = `qrcode-cadastro-${Utilities.storeID}.png`;
            link.href = url;
            link.click();
        }
    }

    /**
     * Imprime o QR Code
     */
    public printQRCode(): void {
        const printContent = `
            <html>
                <head>
                    <title>QR Code - Cadastro de Clientes</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            text-align: center;
                            padding: 50px;
                        }
                        h1 {
                            color: #333;
                            margin-bottom: 20px;
                        }
                        .qr-container {
                            margin: 30px auto;
                        }
                        .instructions {
                            margin-top: 30px;
                            font-size: 18px;
                            color: #666;
                        }
                        .link {
                            margin-top: 20px;
                            font-size: 14px;
                            color: #999;
                            word-break: break-all;
                        }
                    </style>
                </head>
                <body>
                    <h1>Cadastre-se usando o QR Code</h1>
                    <div class="qr-container">
                        ${document.getElementById('qrcode').innerHTML}
                    </div>
                    <p class="instructions">
                        Aponte a câmera do seu celular para o QR Code<br>
                        ou acesse o link abaixo:
                    </p>
                    <p class="link">${this.publicLink}</p>
                </body>
            </html>
        `;

        // Abre janela de impressão
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();

        // Imprime
        setTimeout(() => {
            printWindow.print();
        }, 500);
    }
    /**
         * Fecha o modal de QR Code
         */
    public closeQRCodeModal(): void {
        this.showQRCode = false;
        this.qrCodeGenerated = false;
    }
    /**
     * Carrega estatísticas de uso
     */
    private async loadStatistics(): Promise<void> {
        try {
            this.loading = true;

            await this.publicRegistrationService['iToolsService'].ready();

            const storeId = Utilities.storeID === '_default_' ? 'matrix' : Utilities.storeID;

            const createBaseQuery = () => this.publicRegistrationService['iToolsService']
                .database()
                .collection('CRM_Statistics')
                .where([
                    { field: 'owner', operator: '=', value: storeId },
                    { field: 'source', operator: '=', value: 'public_form' },
                    { field: 'type', operator: '=', value: 'registration_completed' }
                ]);

            // Total registrations
            const totalRes = await createBaseQuery().count().get();
            const total = totalRes.docs.length > 0 ? totalRes.docs[0].data().count : 0;

            // Today
            const today = new Date(`${DateTime.getDate('D')} 00:00:00`);
            const startToday = `${DateTime.formatDate(today.toISOString()).date} 00:00:00`;
            const endToday = `${DateTime.formatDate(today.toISOString()).date} 23:59:59`;

            const todayRes = await createBaseQuery().where([
                { field: 'timestamp', operator: '>=', value: startToday },
                { field: 'timestamp', operator: '<=', value: endToday }
            ]).count().get();
            const todayCount = todayRes.docs.length > 0 ? todayRes.docs[0].data().count : 0;

            // Week
            const weekStartDate = DateTime.getStartWeek(today);
            const weekStart = `${DateTime.formatDate(weekStartDate.toISOString()).date} 00:00:00`;
            const weekRes = await createBaseQuery().where([
                { field: 'timestamp', operator: '>=', value: weekStart }
            ]).count().get();
            const weekCount = weekRes.docs.length > 0 ? weekRes.docs[0].data().count : 0;

            // Month
            const monthStart = `${DateTime.getCurrentYear()}-${DateTime.getCurrentMonth()}-01 00:00:00`;
            const monthRes = await createBaseQuery().where([
                { field: 'timestamp', operator: '>=', value: monthStart }
            ]).count().get();
            const monthCount = monthRes.docs.length > 0 ? monthRes.docs[0].data().count : 0;

            this.statistics = {
                totalRegistrations: total,
                todayRegistrations: todayCount,
                weekRegistrations: weekCount,
                monthRegistrations: monthCount
            };
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        } finally {
            this.loading = false;
        }
    }
    /**
        * Carrega os últimos clientes cadastrados
        */
    private async loadRecentRegistrations(): Promise<void> {
        try {
            this.recentLoading = true;
            this.recentRegistrations = await this.publicRegistrationService.getRecentRegistrations();
        } catch (error) {
            console.error('Erro ao carregar últimos cadastros:', error);
            this.recentRegistrations = [];
        } finally {
            this.recentLoading = false;
        }
    }
    /**
 * Abre o formulário público em uma nova aba para visualização
 */
    public previewForm(): void {
        // Abre o link público em uma nova aba
        window.open(this.publicLink, '_blank');
    }



    /**
     * Carrega informações da empresa
     */
    private async loadCompanyInfo(): Promise<void> {
        try {
            const storeId = Utilities.storeID === '_default_' ? 'matrix' : Utilities.storeID;
            console.log('🔍 Carregando informações da empresa para storeId:', storeId);

            const tenantInfo = await this.publicRegistrationService.getTenantInfo(storeId);
            console.log('📋 Informações carregadas:', {
                name: tenantInfo.name
            });

            this.companyName = tenantInfo.name || '';
        } catch (error) {
            console.error('❌ Erro ao carregar informações da empresa:', error);
        }
    }


    /**
     * Salva informações da empresa
     */
    public async saveCompanyInfo(): Promise<void> {
        if (!this.companyName.trim()) {
            alert('⚠️ Digite o nome da empresa!');
            return;
        }

        try {
            this.loading = true;

            const storeId = Utilities.storeID === '_default_' ? 'matrix' : Utilities.storeID;
            console.log('💾 Salvando nome da empresa:', {
                storeId,
                companyName: this.companyName
            });

            // Atualiza na collection Stores
            await this.publicRegistrationService['iToolsService'].ready();

            const updateData = {
                name: this.companyName,
                updatedAt: new Date().toISOString(),
                updatedBy: Utilities.currentLoginData?.email || 'system'
            };

            console.log('📤 Dados que serão salvos:', {
                name: updateData.name
            });

            await this.publicRegistrationService['iToolsService'].database()
                .collection('Stores')
                .doc(storeId)
                .update(updateData, { merge: true });

            console.log('✅ Dados salvos com sucesso no Firebase!');
            alert('✅ Nome da empresa salvo com sucesso!');
            this.loading = false;
        } catch (error) {
            console.error('❌ Erro ao salvar:', error);
            alert('❌ Erro ao salvar informações da empresa');
            this.loading = false;
        }
    }

    /**
     * Formata a data para exibição
     */
    public formatDate(dateString: string): string {
        if (!dateString) return '-';

        try {
            const date = new Date(dateString);
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');

            return `${day}/${month}/${year} às ${hours}:${minutes}`;
        } catch (error) {
            return dateString;
        }
    }

    /**
     * Atualiza quando um campo muda
     */
    public onFieldChange(field: string): void {
        const fieldGroup = this.settingsForm.get(`fields.${field}`);

        // Se desmarcar "mostrar", também desmarca "obrigatório"
        if (!fieldGroup.get('show').value) {
            fieldGroup.get('required').setValue(false);
        }
    }
}