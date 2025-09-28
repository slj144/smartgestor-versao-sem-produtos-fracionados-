// NOME DO ARQUIVO: message-templates.component.ts
// LOCAL: src/app/pages/crm/components/message-templates/message-templates.component.ts
// FUNCIONALIDADE GERAL: Este componente é responsável por gerenciar, exibir, filtrar e pré-preencher templates de mensagens para comunicação com clientes (CRM). Ele possui uma lógica inteligente para analisar o contexto do cliente (como histórico de compras, status, tipo de negócio) e sugerir ou selecionar automaticamente o template mais adequado, com foco especial em casos de garantia e, agora, aniversários.
// =====================================================
// VERSÃO SUPER INTELIGENTE - PREENCHE TUDO AUTOMATICAMENTE
// =====================================================


import { Utilities } from '@shared/utilities/utilities';
import { MESSAGE_TEMPLATES, TEMPLATE_CATEGORIES, fillTemplateVariables, IMessageTemplate } from './message-templates-data';
import { ENotificationStatus } from '@shared/interfaces/ISystemNotification';
import { NotificationService } from '@shared/services/notification.service';
import { IToolsService } from '@shared/services/iTools.service';
import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { ProjectSettings } from 'src/assets/settings/company-settings';


@Component({
    selector: 'app-message-templates',
    templateUrl: './message-templates.component.html',
    styleUrls: ['./message-templates.component.scss']
})
export class MessageTemplatesComponent implements OnInit, AfterViewInit {

    @Input() customer: any = null;
    @Input() showModal = false;
    @Input() filterCategory: string = 'all';
    @Output() onClose = new EventEmitter<void>();
    @Output() onSelect = new EventEmitter<{ template: IMessageTemplate, message: string }>();

    // 📚 DADOS
    public templates = MESSAGE_TEMPLATES;
    public categories = TEMPLATE_CATEGORIES;
    public templateCounts: { [key: string]: number } = {};

    // Estados
    public selectedTemplate: IMessageTemplate | null = null;
    public editedMessage = '';
    public searchTerm = '';
    public suggestedTemplates: IMessageTemplate[] = [];
    // ✅ CONTROLES VISUAIS PARA GARANTIA
    public isGarantiaDetected: boolean = false;
    public garantiaInfo: string = '';
    public showGarantiaAlert: boolean = false;

    // Variáveis inteligentes
    private contextData: any = {};

    // 🏢 PROPRIEDADE PARA ARMAZENAR DADOS DA EMPRESA
    private tenantCompanyInfo: any = {
        name: '',
        phone: '',
        email: '',
        address: ''
    };
    filteredTemplates: any[];
    selectedCategory: string;
    allTemplates: any;

    constructor(
        private notificationService: NotificationService,
        private iToolsService: IToolsService
    ) { }

    /**
    * NOME: ngOnInit
    * LOCAL: message-templates.component.ts
    * FUNCIONALIDADE: Método do ciclo de vida do Angular executado na inicialização do componente. Ele é responsável por carregar os templates, analisar o contexto do cliente, detectar garantias, sugerir e selecionar templates automaticamente.
    */
    // 📁 ARQUIVO: message-templates.component.ts
    // 📂 CAMINHO: src/app/pages/crm/components/message-templates/message-templates.component.ts
    // 🎯 ngOnInit COMPLETO com detecção de recompra

    ngOnInit(): void {
        // 🆕 CARREGAR INFORMAÇÕES DA EMPRESA DO TENANT
        this.loadTenantCompanyInfo();

        // Garantir que temos dados de contexto
        if (Object.keys(this.contextData).length === 0) {
            console.log('⚠️ Contexto vazio no ngOnInit, analisando...');
            this.analyzeContextIntelligently();
        }

        console.log('=== DEBUG TEMPLATE MODAL ===');
        console.log('Templates carregados:', MESSAGE_TEMPLATES.length);
        console.log('Categorias carregadas:', TEMPLATE_CATEGORIES.length);
        console.log('Customer:', this.customer);
        console.log('Filter Category:', this.filterCategory);
        console.log('🚀 Iniciando sistema inteligente de templates...');
        console.log('📊 Dados recebidos:', this.customer);

        // =====================================================
        // 🔄 INÍCIO DA DETECÇÃO DE RECOMPRA - ADICIONE AQUI!
        // =====================================================
        const isRecompra = this.customer?.isRecompra ||
            this.customer?.contextData?.isRecompra ||
            this.customer?.contextData?.templateType === 'recompra' ||
            this.customer?.activityTitle?.includes('Recompra') ||
            this.customer?.activityTitle?.includes('🔄');

        if (isRecompra) {
            console.log('🔄 ATIVIDADE DE RECOMPRA DETECTADA NO MODAL!');

            // Forçar categoria de recompra
            this.selectedCategory = 'recompra';
            this.filterCategory = 'recompra'; // Adicionar também no filterCategory

            // Se tem dados de recompra, preparar contexto
            if (this.customer?.recompraData || this.customer?.contextData?.products) {
                const recompraData = this.customer?.recompraData || this.customer?.contextData;

                // Adicionar dados ao contexto para os templates usarem
                this.contextData = {
                    ...this.contextData,
                    isRecompra: true,
                    products: recompraData.products || [],
                    lastPurchaseValue: recompraData.lastPurchaseValue || 0,
                    saleDate: recompraData.saleDate,
                    saleCode: recompraData.saleCode
                };

                console.log('📦 Dados de recompra adicionados ao contexto:', this.contextData);
            }
        }
        // =====================================================
        // 🔄 FIM DA DETECÇÃO DE RECOMPRA
        // =====================================================

        // Carregar todos os templates disponíveis
        this.loadTemplates();

        // Verificar se tem contexto de garantia no localStorage
        this.checkWarrantyContext();

        // Analisar contexto e preparar dados
        this.analyzeContextIntelligently();

        // 🎯 NOVO: Detectar automaticamente se é garantia
        if (this.customer) {
            // Chamar a detecção automática
            this.detectarESugerirTemplates();

            // Se não detectou garantia, sugerir templates normais
            if (this.suggestedTemplates.length === 0) {
                this.suggestTemplatesByContext();
            }
        }

        // =====================================================
        // 🔄 ADICIONAR TEMPLATES DE RECOMPRA SE NECESSÁRIO
        // =====================================================
        if (isRecompra) {
            // Adicionar templates específicos de recompra aos templates sugeridos
            this.addRecompraToSuggestedTemplates();

            // Se ainda não tem templates, adicionar padrão
            if (this.filteredTemplates.length === 0) {
                this.addDefaultRecompraTemplates();
            }
        }
        // =====================================================

        // Selecionar melhor template automaticamente
        this.selectBestTemplateAutomatically();

        // 🆕 ADICIONE ESTAS LINHAS AQUI - ANTES DO } QUE FECHA O MÉTODO
        console.log('🚀 Modal iniciado com:');
        console.log(`- Total de templates: ${this.templates.length}`);
        console.log(`- Categoria inicial: ${this.filterCategory}`);
        console.log(`- Templates filtrados: ${this.getFilteredTemplates().length}`);
        console.log('📋 Templates sugeridos:', this.suggestedTemplates);
        console.log('🏷️ Categorias disponíveis:', this.categories.map(c => c.value));

        // 🆕 ADICIONE ESTA LINHA NO FINAL
        this.calculateTemplateCounts();

        // =========================================================================
        // NOME: Lógica de Aniversário no ngOnInit
        // LOCAL: message-templates.component.ts (Dentro do método ngOnInit)
        // FUNCIONALIDADE: Este bloco de código verifica se o componente foi iniciado com a categoria de 'aniversário'. Se for o caso, ele localiza e seleciona automaticamente o primeiro template de aniversário disponível, facilitando o envio de mensagens de felicitações.
        // =========================================================================
        if (this.filterCategory === 'birthday' || this.filterCategory === 'aniversario') {
            console.log('🎂 Categoria de aniversário detectada! Selecionando template automaticamente...');

            // Forçar categoria para 'aniversario'
            if (this.filterCategory === 'birthday') {
                this.filterCategory = 'aniversario';
            }

            // Aguardar um momento para garantir que os templates foram carregados
            setTimeout(() => {
                // Buscar templates de aniversário
                const birthdayTemplates = this.templates.filter(t => t.category === 'aniversario');

                if (birthdayTemplates.length > 0) {
                    // Selecionar o primeiro template de aniversário
                    this.selectTemplate(birthdayTemplates[0]);
                    console.log('✅ Template de aniversário selecionado:', birthdayTemplates[0].name);
                }
            }, 100);
        }

        // =====================================================
        // 🔄 SELEÇÃO AUTOMÁTICA DE TEMPLATE DE RECOMPRA
        // =====================================================
        if (isRecompra && this.filterCategory === 'recompra') {
            console.log('🔄 Selecionando template de recompra automaticamente...');

            setTimeout(() => {
                // Buscar templates de recompra
                const recompraTemplates = this.templates.filter(t =>
                    t.category === 'recompra' ||
                    t.id?.includes('recompra') ||
                    t.tags?.includes('recompra')
                );

                if (recompraTemplates.length > 0) {
                    // Selecionar o primeiro template de recompra
                    this.selectTemplate(recompraTemplates[0]);
                    console.log('✅ Template de recompra selecionado:', recompraTemplates[0].name);
                }
            }, 150); // Aguardar um pouco mais que o de aniversário
        }
        // =====================================================
    }
    // 📁 ARQUIVO: message-templates.component.ts
    // 📂 CAMINHO: src/app/pages/crm/components/message-templates/message-templates.component.ts
    // 🎯 MÉTODOS AUXILIARES - Adicionar após o ngOnInit

    /**
     * 🔄 ADICIONAR TEMPLATES DE RECOMPRA AOS SUGERIDOS
     * Este método adiciona templates de recompra à lista de sugeridos
     */
    private addRecompraToSuggestedTemplates(): void {
        console.log('🔄 Adicionando templates de recompra aos sugeridos...');

        // Buscar templates de recompra existentes
        const recompraTemplates = this.templates.filter(t =>
            t.category === 'recompra' ||
            t.id?.includes('recompra') ||
            t.tags?.includes('recompra')
        );

        if (recompraTemplates.length > 0) {
            // Adicionar aos templates sugeridos (no início da lista)
            this.suggestedTemplates = [
                ...recompraTemplates.slice(0, 3), // Pegar os 3 primeiros templates de recompra
                ...this.suggestedTemplates
            ];

            console.log(`✅ ${recompraTemplates.length} templates de recompra adicionados`);
        } else {
            // Se não tem templates de recompra, criar um padrão
            this.createDefaultRecompraTemplate();
        }
    }

    /**
     * 🔄 ADICIONAR TEMPLATES PADRÃO DE RECOMPRA
     * Cria templates básicos se não existirem
     */
    private addDefaultRecompraTemplates(): void {
        console.log('🔄 Criando templates padrão de recompra...');

        const customerName = this.customer?.name || '{{nome}}';
        const products = this.getProductsFromContext();

        const defaultTemplates = [
            {
                id: 'recompra-default-1',
                name: '🔄 Recompra - Padrão',
                category: 'recompra',
                content: `Olá ${customerName}! 👋

Está na hora de fazer uma nova compra!
${products ? `\nSeus produtos favoritos:\n${products}\n` : ''}
💰 Desconto especial de 10% para você
🚚 Frete grátis acima de R$ 100
🎁 Brinde surpresa

Vamos fazer seu pedido?`,
                variables: ['nome'],
                tags: ['recompra', 'follow-up'],
                priority: 1
            },
            {
                id: 'recompra-default-2',
                name: '🎁 Oferta de Recompra',
                category: 'recompra',
                content: `Oi ${customerName}! 🎯

Tenho uma oferta especial para você!
${products ? `\nProdutos em oferta:\n${products}\n` : ''}
✨ Condições especiais:
💰 15% de desconto
🚚 Entrega em 24h
🎁 Brinde exclusivo

Válido só hoje! Aceita?`,
                variables: ['nome'],
                tags: ['recompra', 'oferta'],
                priority: 2
            }
        ];

        // Adicionar aos templates filtrados
        this.filteredTemplates = [...defaultTemplates, ...this.filteredTemplates];

        // Adicionar também à lista geral de templates
        this.templates = [...this.templates, ...defaultTemplates];

        console.log('✅ Templates padrão de recompra criados');
    }

    /**
     * 🔄 CRIAR UM TEMPLATE PADRÃO DE RECOMPRA
     * Cria um único template básico
     */
    private createDefaultRecompraTemplate(): void {
        const customerName = this.customer?.name || '{{nome}}';
        const products = this.getProductsFromContext();

        const defaultTemplate = {
            id: 'recompra-auto-generated',
            name: '🔄 Recompra Automática',
            category: 'recompra',
            content: `Olá ${customerName}! 👋

Já faz um tempo desde sua última compra!
${products ? `\nQue tal repor:\n${products}\n` : ''}
💰 Temos condições especiais para você
🚚 Entrega rápida garantida

Posso te ajudar com um novo pedido?`,
            variables: ['nome'],
            tags: ['recompra', 'auto'],
            priority: 1
        };

        // Adicionar ao início dos templates sugeridos
        this.suggestedTemplates.unshift(defaultTemplate);

        // Adicionar também aos templates gerais
        this.templates.push(defaultTemplate);
    }

    /**
     * 📦 OBTER PRODUTOS DO CONTEXTO
     * Extrai lista de produtos formatada do contexto
     */
    private getProductsFromContext(): string {
        // Tentar pegar produtos de várias fontes
        const products = this.contextData?.products ||
            this.customer?.recompraData?.products ||
            this.customer?.contextData?.products ||
            this.customer?.products ||
            [];

        if (!products || products.length === 0) {
            return '';
        }

        // Formatar lista de produtos
        if (Array.isArray(products)) {
            return products.map((p, index) => {
                if (typeof p === 'string') {
                    return `${index + 1}. ${p}`;
                } else if (p.name) {
                    const qty = p.quantity ? ` (${p.quantity}x)` : '';
                    return `${index + 1}. ${p.name}${qty}`;
                }
                return '';
            }).filter(p => p).join('\n');
        }

        return '';
    }

    /**
     * 🔄 VERIFICAR SE É ATIVIDADE DE RECOMPRA
     * Método auxiliar para verificar recompra
     */
    private isRecompraActivity(): boolean {
        return this.customer?.isRecompra ||
            this.customer?.contextData?.isRecompra ||
            this.customer?.contextData?.templateType === 'recompra' ||
            this.customer?.activityTitle?.includes('Recompra') ||
            this.customer?.activityTitle?.includes('🔄') ||
            false;
    }
    // 🏢 MÉTODO PARA BUSCAR INFORMAÇÕES DA EMPRESA DO TENANT
    private async loadTenantCompanyInfo(): Promise<void> {
        try {
            console.log('🏢 Buscando informações da empresa do tenant...');
            // Priorizar busca direta no banco para garantir dados originais
            try {
                await this.iToolsService.ready();
                const storeId = Utilities.storeID === '_default_' ? 'matrix' : Utilities.storeID;
                const storeDoc = await this.iToolsService.database()
                    .collection('Stores')
                    .doc(storeId)
                    .get();

                if (storeDoc && storeDoc.data()) {
                    const data = storeDoc.data();
                    this.tenantCompanyInfo = {
                        name: data.name || data.storeName || data.companyName || '',
                        phone: data.phone || data.storePhone || data.companyPhone || '',
                        email: data.email || data.storeEmail || data.companyEmail || '',
                        address: data.address || data.storeAddress || data.companyAddress || ''
                    };
                    console.log('✅ Empresa carregada do banco:', this.tenantCompanyInfo.name);
                    return;
                }
            } catch (dbError) {
                console.error('❌ Erro ao buscar empresa no banco:', dbError);
            }

            // Método 1: Buscar do ProjectSettings (RECOMENDADO)
            const companySettings = ProjectSettings.companySettings();
            if (companySettings && companySettings.companyName) {
                this.tenantCompanyInfo = {
                    name: companySettings.companyName || '',
                    phone: companySettings.phone || companySettings.companyPhone || '',
                    email: companySettings.email || companySettings.companyEmail || '',
                    address: companySettings.address || companySettings.companyAddress || ''
                };
                console.log('✅ Empresa encontrada no ProjectSettings:', this.tenantCompanyInfo.name);
                return;
            }

            // Método 2: Buscar do localStorage (selectedCompany)
            const selectedCompany = localStorage.getItem('selectedCompany');
            if (selectedCompany) {
                const companyData = JSON.parse(selectedCompany);
                this.tenantCompanyInfo = {
                    name: companyData.name || companyData.storeName || companyData.companyName || '',
                    phone: companyData.phone || companyData.storePhone || companyData.companyPhone || '',
                    email: companyData.email || companyData.storeEmail || companyData.companyEmail || '',
                    address: companyData.address || companyData.storeAddress || companyData.companyAddress || ''
                };
                console.log('✅ Empresa encontrada no localStorage:', this.tenantCompanyInfo.name);
                return;
            }

            // Método 3: Buscar do localStorage (logins)
            const logins = localStorage.getItem('logins');
            if (logins) {
                const loginsData = JSON.parse(logins);
                const windowId = (window as any).id;
                const currentLogin = loginsData[windowId];

                if (currentLogin && currentLogin.projectInfo) {
                    this.tenantCompanyInfo = {
                        name: currentLogin.projectInfo.companyName || currentLogin.storeName || '',
                        phone: currentLogin.projectInfo.companyPhone || currentLogin.storePhone || '',
                        email: currentLogin.projectInfo.companyEmail || currentLogin.storeEmail || '',
                        address: currentLogin.projectInfo.companyAddress || currentLogin.storeAddress || ''
                    };
                    console.log('✅ Empresa encontrada nos logins:', this.tenantCompanyInfo.name);
                    return;
                }
            }

            // Método 4: Buscar do sessionStorage
            const storeInfo = sessionStorage.getItem('storeInfo');
            if (storeInfo) {
                const storeData = JSON.parse(storeInfo);
                this.tenantCompanyInfo = {
                    name: storeData.name || storeData.storeName || storeData.companyName || '',
                    phone: storeData.phone || storeData.storePhone || storeData.companyPhone || '',
                    email: storeData.email || storeData.storeEmail || storeData.companyEmail || '',
                    address: storeData.address || storeData.storeAddress || storeData.companyAddress || ''
                };
                console.log('✅ Empresa encontrada no sessionStorage:', this.tenantCompanyInfo.name);
                return;
            }

            // Método 5: Buscar do Utilities (sistema legado)
            if (typeof Utilities !== 'undefined') {
                // Buscar de Utilities.localStorage
                if (Utilities.localStorage) {
                    const userInfo = Utilities.localStorage('userInfo');

                    if (userInfo && userInfo.storeName) {
                        this.tenantCompanyInfo = {
                            name: userInfo.storeName || userInfo.companyName || '',
                            phone: userInfo.storePhone || userInfo.companyPhone || '',
                            email: userInfo.storeEmail || userInfo.companyEmail || '',
                            address: userInfo.storeAddress || userInfo.companyAddress || ''
                        };
                        console.log('✅ Empresa encontrada no Utilities.localStorage:', this.tenantCompanyInfo.name);
                        return;
                    }
                }

                // Buscar de Utilities.currentLoginData
                if (Utilities.currentLoginData) {
                    this.tenantCompanyInfo = {
                        name: Utilities.currentLoginData.companyName || Utilities.currentLoginData.storeName || '',
                        phone: Utilities.currentLoginData.companyPhone || Utilities.currentLoginData.phone || '',
                        email: Utilities.currentLoginData.companyEmail || Utilities.currentLoginData.email || '',
                        address: Utilities.currentLoginData.companyAddress || Utilities.currentLoginData.address || ''
                    };

                    if (this.tenantCompanyInfo.name) {
                        console.log('✅ Empresa encontrada em Utilities.currentLoginData:', this.tenantCompanyInfo.name);
                        return;
                    }
                }
            }

            // Método 6: Buscar de window com verificação de tipo
            if (typeof (window as any).companySettings !== 'undefined') {
                const winCompanySettings = (window as any).companySettings;
                this.tenantCompanyInfo = {
                    name: winCompanySettings.name || winCompanySettings.companyName || '',
                    phone: winCompanySettings.phone || winCompanySettings.companyPhone || '',
                    email: winCompanySettings.email || winCompanySettings.companyEmail || '',
                    address: winCompanySettings.address || winCompanySettings.companyAddress || ''
                };
                console.log('✅ Empresa encontrada em window.companySettings:', this.tenantCompanyInfo.name);
                return;
            }

            // Método 7: Buscar do userInfo direto no localStorage
            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                const userData = JSON.parse(userInfo);
                if (userData.storeName || userData.companyName) {
                    this.tenantCompanyInfo = {
                        name: userData.storeName || userData.companyName || '',
                        phone: userData.storePhone || userData.companyPhone || '',
                        email: userData.storeEmail || userData.companyEmail || '',
                        address: userData.storeAddress || userData.companyAddress || ''
                    };
                    console.log('✅ Empresa encontrada no userInfo:', this.tenantCompanyInfo.name);
                    return;
                }
            }

            // Método 8: Valor padrão se nada for encontrado
            console.log('⚠️ Nenhuma informação de empresa encontrada, usando padrão');
            this.tenantCompanyInfo = {
                name: 'Nossa Empresa',
                phone: '(00) 0000-0000',
                email: 'contato@empresa.com.br',
                address: 'Endereço da empresa'
            };

        } catch (error) {
            console.error('❌ Erro ao buscar informações da empresa:', error);
            // Valor padrão em caso de erro
            this.tenantCompanyInfo = {
                name: 'Nossa Empresa',
                phone: '(00) 0000-0000',
                email: 'contato@empresa.com.br',
                address: 'Endereço da empresa'
            };
        }
    }
    /**
     * 📊 CALCULAR CONTAGENS UMA VEZ SÓ
     * FUNCIONALIDADE: Calcula e armazena em cache o número de templates por categoria para otimizar a performance, evitando recálculos repetidos.
     */
    private calculateTemplateCounts(): void {
        console.log('📊 Calculando contagens de templates...');

        // Limpar cache anterior
        this.templateCounts = {};

        // Calcular para "all"
        this.templateCounts['all'] = this.templates.length;

        // Calcular para cada categoria
        this.categories.forEach(cat => {
            if (cat.value !== 'all') {
                const count = this.templates.filter(t => t.category === cat.value).length;
                this.templateCounts[cat.value] = count;
            }
        });

        console.log('✅ Contagens calculadas:', this.templateCounts);
    }
    /**
     * NOME: ngAfterViewInit
     * LOCAL: message-templates.component.ts
     * FUNCIONALIDADE: Método do ciclo de vida do Angular executado após a view do componente ser totalmente inicializada. É usado aqui para garantir a seleção correta de templates (especialmente o de aniversário) e para realizar depurações relacionadas a elementos do DOM.
     */
    ngAfterViewInit(): void {

        // =========================================================================
        // NOME: Garantia de Seleção de Aniversário no ngAfterViewInit
        // LOCAL: message-templates.component.ts (Dentro do método ngAfterViewInit)
        // FUNCIONALIDADE: Este bloco assegura que, se a categoria for 'aniversário', o template correspondente seja selecionado
        // =========================================================================
        if (this.filterCategory === 'birthday' || this.filterCategory === 'aniversario') {
            // Forçar a categoria para 'aniversario' se vier como 'birthday'
            if (this.filterCategory === 'birthday') {
                this.filterCategory = 'aniversario';
            }

            // Re-selecionar após a view carregar completamente
            setTimeout(() => {
                const birthdayTemplates = this.templates.filter(t => t.category === 'aniversario');
                if (birthdayTemplates.length > 0 && !this.selectedTemplate) {
                    this.selectTemplate(birthdayTemplates[0]);
                }
            }, 200);
        }

        console.log('=== AFTER VIEW INIT DEBUG ===');
        console.log('Total templates no componente:', this.templates.length);
        console.log('Templates filtrados:', this.getFilteredTemplates().length);
        console.log('Categorias:', this.categories);

        // Verificar elementos DOM
        setTimeout(() => {
            const sidebar = document.querySelector('.sidebar-panel');
            const container = document.querySelector('.templates-container');
            const cards = document.querySelectorAll('.template-card');

            console.log('Sidebar existe?', !!sidebar);
            console.log('Container existe?', !!container);
            console.log('Quantidade de cards:', cards.length);

            if (sidebar) {
                console.log('Sidebar width:', (sidebar as HTMLElement).offsetWidth);
                console.log('Sidebar display:', window.getComputedStyle(sidebar).display);
            }
        }, 500);

        // 📱 ADICIONAR LISTENERS APENAS PARA MOBILE
        if (this.isMobile()) {
            const self = this;

            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    if (self.isMobile()) {
                        self.updateTextarea();
                    }
                }, 300);
            });

            let resizeTimer: any;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    if (self.isMobile()) {
                        self.updateTextarea();
                    }
                }, 250);
            });
        }
    }
    /**
     * 📚 CARREGAR TEMPLATES
     * FUNCIONALIDADE: Carrega os templates a partir de uma fonte de dados e os organiza, priorizando templates específicos ao tipo de negócio do cliente (ex: oficina, celular) sobre os gerais.
     */
    private loadTemplates(): void {
        // Importar os templates do arquivo de dados
        this.templates = MESSAGE_TEMPLATES;

        // Filtrar por tipo de negócio se configurado
        const tipoNegocio = this.detectarTipoNegocio(this.customer || {});

        // Se detectou um tipo específico, priorizar esses templates
        if (tipoNegocio !== 'geral') {
            // Colocar templates do tipo de negócio primeiro
            const templatesEspecificos = this.templates.filter(t =>
                t.businessType === tipoNegocio
            );
            const templatesGerais = this.templates.filter(t =>
                !t.businessType || t.businessType === 'geral'
            );

            this.templates = [...templatesEspecificos, ...templatesGerais];
        }

        console.log(`📚 Templates carregados: ${this.templates.length} total`);
        console.log(`🏪 Tipo de negócio: ${tipoNegocio}`);
        // 🆕 ADICIONE ESTA LINHA
        this.calculateTemplateCounts();
    }

    /**
     * 💡 SUGERIR TEMPLATES POR CONTEXTO
     * FUNCIONALIDADE: Analisa o contexto do cliente (status, tempo desde o último contato) para sugerir templates relevantes, como pós-venda, follow-up ou recuperação.
     */
    private suggestTemplatesByContext(): void {
        if (!this.customer) return;

        const suggestions: IMessageTemplate[] = [];

        // Analisar contexto para sugerir templates apropriados
        if (this.customer.status === 'completed' || this.customer.activityType === 'pos-venda') {
            // Sugerir templates de pós-venda
            const posVenda = this.templates.filter(t => t.category === 'pos-venda');
            suggestions.push(...posVenda.slice(0, 2));
        }

        if (this.customer.daysSinceLastContact > 7) {
            // Sugerir templates de follow-up
            const followUp = this.templates.filter(t => t.category === 'follow-up');
            suggestions.push(...followUp.slice(0, 2));
        }

        if (this.customer.cancelReason || this.customer.status === 'cancelled') {
            // Sugerir templates de recuperação
            const recuperacao = this.templates.filter(t => t.category === 'recuperacao');
            suggestions.push(...recuperacao.slice(0, 2));
        }

        // Limitar a 3 sugestões
        this.suggestedTemplates = suggestions.slice(0, 3);

        console.log('💡 Templates sugeridos por contexto:', this.suggestedTemplates.length);
    }

    /**
     * 🛡️ VERIFICAR CONTEXTO DE GARANTIA
     * FUNCIONALIDADE: Verifica se há informações de garantia armazenadas no `localStorage`, funde esses dados com os do cliente e limpa o armazenamento para evitar repetições.
     */
    private checkWarrantyContext(): void {
        try {
            const warrantyContext = localStorage.getItem('warranty_context');
            if (warrantyContext) {
                const context = JSON.parse(warrantyContext);
                console.log('🛡️ Contexto de garantia detectado:', context);

                // Merge com customer data
                this.customer = {
                    ...this.customer,
                    ...context,
                    isWarrantyContext: true
                };

                // Limpar localStorage após usar
                localStorage.removeItem('warranty_context');
            }
        } catch (error) {
            console.error('Erro ao verificar contexto de garantia:', error);
        }
    }

    /**
     * 🎯 DETECTAR AUTOMATICAMENTE SE É UMA GARANTIA
     * FUNCIONALIDADE: Atua como um detetive, procurando por palavras-chave relacionadas à garantia nos dados do cliente para identificar se a comunicação é sobre esse tema.
     */
    private detectarGarantia(contexto: any): boolean {
        // Se já veio marcado como garantia do CRM
        if (contexto.isWarranty || contexto.isWarrantyContext) {
            return true;
        }

        // Palavras que indicam que é sobre garantia
        const palavrasGarantia = [
            'garantia', 'warranty', 'vencimento', 'prazo',
            'cobertura', 'validade', 'meses de garantia',
            'anos de garantia', 'dias de garantia'
        ];

        // Verificar no contexto da venda ou serviço
        const textoParaVerificar = [
            contexto.description?.toLowerCase() || '',
            contexto.warranty?.toLowerCase() || '',
            contexto.service?.warranty?.toLowerCase() || '',
            contexto.title?.toLowerCase() || '',
            contexto.activityDescription?.toLowerCase() || '',
            contexto.metadata?.warrantyInfo?.toLowerCase() || ''
        ].join(' ');

        // Se encontrar alguma palavra de garantia, é garantia!
        return palavrasGarantia.some(palavra =>
            textoParaVerificar.includes(palavra)
        );
    }

    /**
     * 🏪 DETECTAR O TIPO DE NEGÓCIO
     * FUNCIONALIDADE: Analisa os dados do cliente para inferir o tipo de negócio (celular, oficina, varejo), permitindo a seleção de templates mais específicos.
     */
    private detectarTipoNegocio(contexto: any): string {
        // Se já tem tipo de negócio definido
        if (contexto.businessType) {
            return contexto.businessType;
        }

        const texto = JSON.stringify(contexto).toLowerCase();

        // Palavras-chave para cada tipo de negócio
        const tiposNegocio = {
            celular: ['celular', 'smartphone', 'iphone', 'samsung', 'xiaomi',
                'motorola', 'tela', 'bateria', 'chip', 'android', 'ios'],
            oficina: ['carro', 'veículo', 'motor', 'óleo', 'freio', 'pneu',
                'suspensão', 'automóvel', 'moto', 'km', 'quilometragem'],
            varejo: ['produto', 'mercadoria', 'estoque', 'loja', 'compra']
        };

        // Contar quantas palavras de cada tipo aparecem
        let melhorTipo = 'geral';
        let maiorPontuacao = 0;

        for (const [tipo, palavras] of Object.entries(tiposNegocio)) {
            const pontuacao = palavras.filter(palavra =>
                texto.includes(palavra)
            ).length;

            if (pontuacao > maiorPontuacao) {
                maiorPontuacao = pontuacao;
                melhorTipo = tipo;
            }
        }

        return melhorTipo;
    }

    /**
     * 🎨 ESCOLHER TEMPLATE DE GARANTIA AUTOMATICAMENTE
     * FUNCIONALIDADE: Com base no tipo de negócio detectado, seleciona o template de garantia mais apropriado, priorizando sugestões diretas do CRM.
     */
    private escolherTemplateGarantiaAutomatico(contexto: any): any {
        // Detectar o tipo de negócio
        const tipoNegocio = this.detectarTipoNegocio(contexto);
        console.log('🏪 Tipo de negócio detectado:', tipoNegocio);

        // Se veio sugestão do CRM
        if (contexto.metadata?.templateSuggestion) {
            const suggested = this.templates.find(t =>
                t.id === contexto.metadata.templateSuggestion
            );
            if (suggested) return suggested;
        }

        // Buscar templates de garantia para este tipo de negócio
        const templatesGarantia = this.templates.filter(t =>
            t.tags.includes('garantia') &&
            t.tags.includes('automatica') &&
            (t.businessType === tipoNegocio || t.businessType === 'geral')
        );

        // Se encontrou templates específicos, usar o primeiro
        if (templatesGarantia.length > 0) {
            return templatesGarantia[0];
        }

        // Se não encontrou, usar o template geral de garantia
        return this.templates.find(t => t.id === 'garantia-auto-geral');
    }

    /**
     * 🚀 FUNÇÃO PRINCIPAL - DETECTAR E SUGERIR TEMPLATES
     * FUNCIONALIDADE: Orquestra a detecção de garantia, a escolha do template adequado, a sugestão na interface e a aplicação de efeitos visuais para destacar o contexto de garantia.
     */
    public detectarESugerirTemplates(): void {
        // Se detectar que é uma garantia
        if (this.detectarGarantia(this.customer)) {
            console.log('✅ Garantia detectada! Sugerindo template automático...');

            // Escolher o template certo
            const templateGarantia = this.escolherTemplateGarantiaAutomatico(this.customer);

            if (templateGarantia) {
                // Adicionar nos templates sugeridos (no topo)
                this.suggestedTemplates = [
                    templateGarantia,
                    ...this.suggestedTemplates.filter(t => t.id !== templateGarantia.id)
                ];

                // Se veio do contexto de garantia, pré-selecionar
                if (this.customer.isWarrantyContext) {
                    this.selectedTemplate = templateGarantia;
                    this.preencherVariaveisGarantia(templateGarantia);
                }

                // 🆕 ADICIONE ESTA LINHA - Aplicar efeitos visuais
                this.applyGarantiaVisualEffects();

                // Mostrar notificação de garantia detectada
                this.mostrarNotificacaoGarantia();
            }
        }
    }
    /**
     * 📝 PREENCHER VARIÁVEIS DA GARANTIA AUTOMATICAMENTE
     * FUNCIONALIDADE: Extrai e preenche automaticamente as variáveis do template de garantia (nome, produto, data de vencimento, etc.) com os dados do cliente.
     */
    private preencherVariaveisGarantia(template: any): void {
        // Dados que vamos preencher automaticamente
        const dadosAutomaticos = {
            nome: this.customer.name || this.customer.customerName || 'Cliente',
            empresa: this.tenantCompanyInfo.name || Utilities.currentLoginData?.companyName || 'Nossa Empresa',
            produto: this.extrairProduto(this.customer),
            servico: this.extrairServico(this.customer),
            garantia_detectada: this.customer.warranty || this.customer.service?.warranty || '1 ano',
            data_vencimento: this.calcularDataVencimento(this.customer),
            numero_os: this.customer.orderId || this.customer.saleId || 'N/A',
            data_servico: new Date().toLocaleDateString('pt-BR'),
            veiculo: this.extrairVeiculo(this.customer),
            item: this.extrairItem(this.customer),
            codigo_garantia: `GAR-${Date.now()}`
        };

        // Adicionar ao contextData
        this.contextData = {
            ...this.contextData,
            ...dadosAutomaticos
        };

        // Preencher o template
        this.editedMessage = fillTemplateVariables(template.content, this.contextData);

        console.log('✅ Template de garantia preenchido automaticamente');
    }

    /**
     * 🔔 MOSTRAR NOTIFICAÇÃO DE GARANTIA
     * FUNCIONALIDADE: Exibe uma notificação e um badge visual no cabeçalho do modal para alertar o usuário que um contexto de garantia foi detectado.
     */
    private mostrarNotificacaoGarantia(): void {
        // Se tiver serviço de notificação, use-o
        if (this.notificationService) {
            this.notificationService.create({
                title: '🛡️ Garantia Detectada!',
                description: 'Template de garantia selecionado automaticamente',
                status: ENotificationStatus.info
            });
        }

        // Adicionar uma badge visual no modal
        setTimeout(() => {
            const modalHeader = document.querySelector('.modal-header h2');
            if (modalHeader && !modalHeader.querySelector('.garantia-badge')) {
                const badge = document.createElement('span');
                badge.className = 'garantia-badge';
                badge.innerHTML = '🛡️ Garantia';
                badge.style.cssText = `
                    background: #4CAF50;
                    color: white;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    margin-left: 10px;
                    animation: pulse 2s infinite;
                `;
                modalHeader.appendChild(badge);

                // Adicionar animação CSS se não existir
                if (!document.querySelector('#garantia-pulse-animation')) {
                    const style = document.createElement('style');
                    style.id = 'garantia-pulse-animation';
                    style.textContent = `
                        @keyframes pulse {
                            0% { opacity: 1; transform: scale(1); }
                            50% { opacity: 0.8; transform: scale(1.05); }
                            100% { opacity: 1; transform: scale(1); }
                        }
                    `;
                    document.head.appendChild(style);
                }
            }
        }, 100);

        console.log('🔔 Notificação de garantia exibida');
    }
    /**
     * 🎨 MELHORAR VISUAL QUANDO DETECTAR GARANTIA
     * FUNCIONALIDADE: Ativa flags que exibem um alerta visual específico de garantia na interface do componente.
     */
    private applyGarantiaVisualEffects(): void {
        // Marcar que detectou garantia
        this.isGarantiaDetected = true;
        this.showGarantiaAlert = true;

        // Extrair informações da garantia para mostrar
        this.garantiaInfo = this.extractWarrantyDisplayInfo();
    }

    /**
     * 📝 EXTRAIR INFORMAÇÕES DA GARANTIA PARA EXIBIR
     * FUNCIONALIDADE: Compila uma string de fácil leitura com as informações da garantia para ser exibida no alerta visual.
     */
    private extractWarrantyDisplayInfo(): string {
        const warranty = this.customer.warranty ||
            this.customer.service?.warranty ||
            this.customer.metadata?.warrantyInfo ||
            'Garantia detectada';

        const produto = this.extrairProduto(this.customer);

        return `${produto} - ${warranty}`;
    }

    /**
     * 🎯 USAR TEMPLATE DE GARANTIA (botão do alerta)
     * FUNCIONALIDADE: Ação disparada pelo botão no alerta de garantia, que seleciona o template de garantia sugerido e rola a tela até ele.
     */
    public usarTemplateGarantia(): void {
        // Buscar o template de garantia sugerido
        if (this.suggestedTemplates.length > 0) {
            const templateGarantia = this.suggestedTemplates[0];
            this.selectTemplate(templateGarantia);

            // Fechar alerta
            this.showGarantiaAlert = false;

            // Rolar suavemente para o template
            setTimeout(() => {
                const element = document.querySelector('.template-item.selected');
                element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }

    /**
     * 📋 OBTER PREVIEW DO TEMPLATE
     * FUNCIONALIDADE: Gera uma prévia curta do conteúdo de um template para exibição na lista.
     */
    public getTemplatePreview(template: IMessageTemplate): string {
        const preview = template.content
            .replace(/\n/g, ' ')
            .replace(/{{[^}]+}}/g, '___')
            .substring(0, 100);

        return preview + (template.content.length > 100 ? '...' : '');
    }

    /**
     * 🏷️ VERIFICAR SE É TEMPLATE NOVO
     * FUNCIONALIDADE: Verifica se um template é marcado como 'novo' com base em uma lista de IDs pré-definidos.
     */
    public isNewTemplate(template: IMessageTemplate): boolean {
        const newTemplateIds = [
            'garantia-celular-1',
            'garantia-celular-2',
            'garantia-oficina-1',
            'garantia-auto-celular',
            'garantia-auto-oficina',
            'garantia-auto-geral',
            'garantia-manutencao-geral-1',
            // 🆕 ADICIONAR IDS DOS NOVOS TEMPLATES DE ANIVERSÁRIO
            'aniversario-2',
            'aniversario-3',
            'aniversario-4',
            'aniversario-5',
            'aniversario-6',
            'aniversario-7',
            'aniversario-8'
        ];

        return newTemplateIds.includes(template.id);
    }

    // FUNÇÕES AUXILIARES PARA GARANTIA

    private extrairProduto(contexto: any): string {
        return contexto.productName ||
            contexto.products?.[0]?.name ||
            contexto.produto ||
            'Produto';
    }

    private extrairServico(contexto: any): string {
        // 1️⃣ Direto nos campos principais
        const direct = contexto.serviceName || contexto.service?.name;
        if (direct) return direct;

        // 2️⃣ Array de serviços fornecido
        if (Array.isArray(contexto.services) && contexto.services.length > 0) {
            const first = contexto.services[0];
            return first.name || first.serviceName || first.description || 'Serviço realizado';
        }

        // 3️⃣ Dados da ordem de serviço
        const sd = contexto.serviceData;
        if (sd) {
            if (sd.servicesTypes && Array.isArray(sd.servicesTypes) && sd.servicesTypes.length > 0) {
                const first = sd.servicesTypes[0];
                return first.name || first.description || 'Serviço realizado';
            }

            if (typeof sd.servicesDetails === 'string' && sd.servicesDetails.trim() !== '') {
                const first = sd.servicesDetails.split(',')[0];
                if (first) return first.trim();
            }

            if (sd.types && Array.isArray(sd.types) && sd.types.length > 0) {
                const first = sd.types[0];
                return first.name || first.serviceName || first.description || 'Serviço realizado';
            }

            if (sd.name) return sd.name;
        }

        // 4️⃣ Campos genéricos
        if (contexto.servico) return contexto.servico;

        return 'Serviço realizado';
    }
    private extrairVeiculo(contexto: any): string {
        return contexto.vehicle ||
            contexto.car ||
            contexto.veiculo ||
            'Veículo';
    }

    private extrairItem(contexto: any): string {
        return this.extrairProduto(contexto) ||
            this.extrairServico(contexto);
    }

    private calcularDataVencimento(contexto: any): string {
        const garantia = contexto.warranty || contexto.service?.warranty || '1 ano';
        const hoje = new Date();

        // Tentar entender o prazo da garantia
        if (garantia.includes('ano')) {
            const anos = parseInt(garantia) || 1;
            hoje.setFullYear(hoje.getFullYear() + anos);
        } else if (garantia.includes('mes') || garantia.includes('mês')) {
            const meses = parseInt(garantia) || 1;
            hoje.setMonth(hoje.getMonth() + meses);
        } else if (garantia.includes('dia')) {
            const dias = parseInt(garantia) || 1;
            hoje.setDate(hoje.getDate() + dias);
        }

        return hoje.toLocaleDateString('pt-BR');
    }

    /**
     * 🧠 ANÁLISE INTELIGENTE DO CONTEXTO
     * FUNCIONALIDADE: É o cérebro do componente. Extrai uma vasta gama de informações do objeto `customer`, formata-as e as armazena em `contextData` para serem usadas como variáveis nos templates. Isso inclui dados do cliente, financeiros, datas, produtos, serviços, e até gera ofertas e mensagens personalizadas.
     */
    private analyzeContextIntelligently(): void {
        if (!this.customer) return;

        console.log('🔍 Analisando contexto inteligentemente...');

        // Extrair TODOS os dados possíveis
        this.contextData = {
            // DADOS BÁSICOS
            nome: this.customer.name || this.customer.customerName || this.customer.leadName || 'Cliente',
            telefone: this.formatPhone(this.customer.phone || this.customer.customerPhone || ''),
            email: this.customer.email || this.customer.leadEmail || this.customer.customerEmail || '',

            // DADOS DA EMPRESA - USAR O TENANT COMPANY INFO
            empresa: this.tenantCompanyInfo.name || Utilities.currentLoginData?.companyName || 'Nossa Empresa',
            nome_empresa: this.tenantCompanyInfo.name || Utilities.currentLoginData?.companyName || 'Nossa Empresa',
            telefone_empresa: this.tenantCompanyInfo.phone || '',
            email_empresa: this.tenantCompanyInfo.email || '',
            endereco_empresa: this.tenantCompanyInfo.address || '',

            atendente: Utilities.currentLoginData?.name || Utilities.operator?.name || 'Equipe',
            horario: 'Seg-Sex 8h às 18h',
            chave_pix: this.tenantCompanyInfo.email || 'pix@empresa.com', // Usar email da empresa como PIX

            // DADOS FINANCEIROS
            valor: this.formatCurrency(this.extractTotalValue()),
            valor_original: this.formatCurrency(this.extractOriginalValue()),
            valor_promocional: this.formatCurrency(this.extractPromotionalValue()),
            desconto: this.calculateDiscount(),
            economia: this.formatCurrency(this.calculateSavings()),

            // DATAS
            data: this.formatDate(new Date()),
            dataLimite: this.formatDate(this.addDays(new Date(), 7)),
            previsao: this.formatDate(this.addDays(new Date(), 3)),
            validade: this.formatDate(this.addDays(new Date(), 30)),
            vencimento: this.formatDate(this.addDays(new Date(), 5)),

            // PRODUTOS
            produtos: this.formatProductsList(),

            // SERVIÇOS
            servicos: this.formatServicesList(),
            servicos_realizados: this.formatServicesList(),
            servico_realizado: this.extrairServico(this.customer),
            // ORDEM DE SERVIÇO
            numero_os: this.extractServiceOrderNumber(),
            equipamento: this.extractEquipment(),
            status: this.extractStatus(),
            observacoes: this.extractObservations(),

            // CONTEXTO ESPECÍFICO
            dias: this.calculateDaysSinceLastPurchase(),
            motivo_cancelamento: this.extractCancellationReason(),

            // OFERTAS E BRINDES
            oferta: this.generateSpecialOffer(),
            brinde: this.generateGift(),
            parcelamento: this.generateInstallmentOffer(),
            presente: this.generateBirthdayGift(),

            // DADOS ADICIONAIS
            novidades: this.generateNews(),
            mensagem_personalizada: this.generatePersonalizedMessage(),
            resposta: this.generateResponse(),
            bonus: this.generateBonus(),
            condicoes: this.generateConditions(),
            oferta_especial: this.generateSpecialConditions(),

            // 🎂 VARIÁVEIS ESPECÍFICAS PARA ANIVERSÁRIO
            presente_aniversario: '20% de desconto em qualquer produto + frete grátis',
            valor_minimo: '100,00',
            dias_validade: '30',
            categorias_validas: 'todos os produtos',
            cupom_desconto: 'NIVER15',
            data_validade: this.formatDate(this.addDays(new Date(), 30))
        };

        console.log('✅ Contexto analisado:', this.contextData);
        // 🆕 DETECÇÃO DE BOAS-VINDAS COM DESCONTO
        if (this.customer?.contextData?.isBemVindas) {
            console.log('🎁 Contexto de boas-vindas detectado!');

            this.contextData = {
                ...this.contextData,
                nome: this.customer.name || this.customer.customerName || 'Cliente',
                empresa: this.tenantCompanyInfo.name || 'Nossa Empresa',
                codigo_desconto: this.customer.contextData.discountCode || 'BEMVINDO10',
                percentual_desconto: this.customer.contextData.discountPercentage || '10',
                dias_validade: this.customer.contextData.validDays || '30',
                endereco_loja: this.tenantCompanyInfo.address || 'Rua Principal, 123 - Centro',
                horario_funcionamento: 'Segunda a Sexta: 8h às 18h | Sábado: 8h às 12h',
                assinatura_empresa: `Atenciosamente,\n${this.tenantCompanyInfo.name}\n${this.tenantCompanyInfo.phone}`
            };

            // Forçar seleção do template de boas-vindas
            this.filterCategory = 'pos-venda';
            this.suggestedTemplates = this.templates.filter(t => t.id === 'boas-vindas-desconto-cadastro');
        }
    }

    /**
     * 💰 EXTRAIR VALOR TOTAL
     * FUNCIONALIDADE: Tenta extrair o valor total da transação de múltiplos campos possíveis no objeto do cliente.
     */
    private extractTotalValue(): number {
        // Tentar pegar de várias fontes
        return this.customer.saleValue ||
            this.customer.value ||
            this.customer.totalValue ||
            this.customer.amount ||
            0;
    }

    /**
     * 💵 EXTRAIR VALOR ORIGINAL (para promoções)
     * FUNCIONALIDADE: Calcula um valor "original" fictício para criar a percepção de desconto, mesmo que não haja um valor explícito.
     */
    private extractOriginalValue(): number {
        const total = this.extractTotalValue();
        // Se tiver desconto, calcular valor original
        if (this.customer.discount) {
            return total * 1.2; // Assumir 20% de desconto
        }
        return total * 1.15; // Adicionar 15% para parecer desconto
    }

    /**
     * 💸 EXTRAIR VALOR PROMOCIONAL
     * FUNCIONALIDADE: Calcula um valor promocional fictício para ser usado em ofertas.
     */
    private extractPromotionalValue(): number {
        return this.extractTotalValue() * 0.9; // 10% de desconto
    }

    /**
     * 📊 CALCULAR DESCONTO
     * FUNCIONALIDADE: Determina o percentual de desconto a ser oferecido, seja a partir de dados do cliente ou com base na categoria da mensagem.
     */
    private calculateDiscount(): string {
        // Se tiver desconto específico
        if (this.customer.discount) {
            return Math.round(this.customer.discount).toString();
        }
        // Desconto padrão baseado no tipo
        const discounts: any = {
            'pos-venda': '10',
            'follow-up': '15',
            'recuperacao': '20',
            'aniversario': '25'
        };
        return discounts[this.filterCategory] || '10';
    }

    /**
     * 💰 CALCULAR ECONOMIA
     * FUNCIONALIDADE: Calcula a diferença entre o valor original e o promocional para exibir a "economia" para o cliente.
     */
    private calculateSavings(): number {
        const original = this.extractOriginalValue();
        const promotional = this.extractPromotionalValue();
        return original - promotional;
    }

    /**
     * 📦 FORMATAR LISTA DE PRODUTOS
     * FUNCIONALIDADE: Extrai a lista de produtos de diferentes fontes de dados e a formata como uma lista legível para ser inserida na mensagem.
     */
    private formatProductsList(): string {
        let products: any[] = [];

        // Extrair produtos de várias fontes possíveis
        if (this.customer.products && Array.isArray(this.customer.products)) {
            products = this.customer.products;
        } else if (this.customer.activityDescription) {
            // Tentar extrair da descrição
            products = this.extractProductsFromDescription(this.customer.activityDescription);
        }

        if (products.length === 0) {
            return '• Seus produtos favoritos';
        }

        // Formatar lista bonita
        return products.map(p => {
            const qty = p.quantity || 1;
            const name = p.name || p.productName || 'Produto';
            const price = p.price || p.value || p.total || 0;

            if (price > 0) {
                return `• ${qty}x ${name} - ${this.formatCurrency(price)}`;
            }
            return `• ${qty}x ${name}`;
        }).join('\n');
    }

    /**
     * 🔧 FORMATAR LISTA DE SERVIÇOS
     * FUNCIONALIDADE: Extrai a lista de serviços de diferentes fontes de dados e a formata como uma lista legível.
     */
    private formatServicesList(): string {
        let services: any[] = [];

        // Extrair serviços de várias fontes
        if (this.customer.services && Array.isArray(this.customer.services)) {
            services = this.customer.services;
        } else if (this.customer.serviceData) {
            services = this.extractServicesFromServiceData(this.customer.serviceData);
        } else if (this.customer.activityDescription) {
            services = this.extractServicesFromDescription(this.customer.activityDescription);
        }

        if (services.length === 0) {
            return '• Nossos serviços especializados';
        }

        // Formatar lista
        return services.map(s => {
            const name = s.name || s.serviceName || s.description || 'Serviço';
            const price = s.price || s.value || s.total || 0;

            if (price > 0) {
                return `• ${name} - ${this.formatCurrency(price)}`;
            }
            return `• ${name}`;
        }).join('\n');
    }

    /**
     * 📋 EXTRAIR NÚMERO DA OS
     * FUNCIONALIDADE: Procura o número da Ordem de Serviço em múltiplos campos e, se não encontrar, gera um número aleatório.
     */
    private extractServiceOrderNumber(): string {
        // Várias tentativas
        if (this.customer.serviceOrderCode) return this.customer.serviceOrderCode;
        if (this.customer.serviceData?.serviceOrderCode) return this.customer.serviceData.serviceOrderCode;
        if (this.customer.orderId) return this.customer.orderId;
        if (this.customer.saleId) return this.customer.saleId;

        // Tentar extrair da descrição
        if (this.customer.activityDescription) {
            const match = this.customer.activityDescription.match(/#(\d+)/);
            if (match) return match[1];
        }

        return 'OS' + Math.floor(Math.random() * 9999);
    }

    /**
     * 📱 EXTRAIR EQUIPAMENTO
     * FUNCIONALIDADE: Extrai o nome do equipamento de vários campos possíveis.
     */
    private extractEquipment(): string {
        if (this.customer.equipment) return this.customer.equipment;
        if (this.customer.serviceData?.equipment) return this.customer.serviceData.equipment;

        // Tentar extrair da descrição
        if (this.customer.activityDescription) {
            const match = this.customer.activityDescription.match(/Equipamento: (.+?)\n/);
            if (match) return match[1];
        }

        return 'Equipamento';
    }

    /**
     * 📊 EXTRAIR STATUS
     * FUNCIONALIDADE: Traduz o status técnico (ex: 'pending') para um termo mais amigável (ex: 'Em andamento').
     */
    private extractStatus(): string {
        const statusMap: any = {
            'pending': 'Em andamento',
            'completed': 'Concluído',
            'cancelled': 'Cancelado',
            'in_progress': 'Em execução',
            'waiting': 'Aguardando peças'
        };

        const status = this.customer.status || this.customer.serviceStatus || 'pending';
        return statusMap[status] || 'Em andamento';
    }

    /**
     * 📝 EXTRAIR OBSERVAÇÕES
     * FUNCIONALIDADE: Extrai observações ou notas e, se não houver, gera uma observação padrão baseada no contexto.
     */
    private extractObservations(): string {
        if (this.customer.observations) return this.customer.observations;
        if (this.customer.notes) return this.customer.notes.substring(0, 100);

        // Gerar observação baseada no contexto
        const observations: any = {
            'pos-venda': 'Produto entregue em perfeitas condições',
            'ordem-servico': 'Serviço realizado conforme solicitado',
            'follow-up': 'Cliente demonstrou interesse, aguardando decisão',
            'recuperacao': 'Tentativa de recuperação da venda'
        };

        return observations[this.filterCategory] || 'Sem observações adicionais';
    }

    /**
     * 📅 CALCULAR DIAS DESDE ÚLTIMA COMPRA
     * FUNCIONALIDADE: Calcula o número de dias desde a última compra do cliente.
     */
    private calculateDaysSinceLastPurchase(): string {
        if (this.customer.lastPurchaseDate) {
            const last = new Date(this.customer.lastPurchaseDate);
            const now = new Date();
            const diff = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
            return diff.toString();
        }
        return '30'; // Padrão
    }

    /**
     * ❌ EXTRAIR MOTIVO DO CANCELAMENTO
     * FUNCIONALIDADE: Extrai o motivo do cancelamento de campos relevantes.
     */
    private extractCancellationReason(): string {
        if (this.customer.cancelReason) return this.customer.cancelReason;
        if (this.customer.cancellationReason) return this.customer.cancellationReason;

        // Tentar extrair da descrição
        if (this.customer.activityDescription) {
            const match = this.customer.activityDescription.match(/Motivo: (.+?)\n/);
            if (match) return match[1];
        }

        return 'Mudança de planos';
    }

    /**
     * 🎁 GERAR OFERTA ESPECIAL
     * FUNCIONALIDADE: Cria uma oferta de texto com base na categoria da mensagem (pós-venda, recuperação, etc.).
     */
    private generateSpecialOffer(): string {
        const offers: any = {
            'pos-venda': '10% de desconto na próxima compra',
            'follow-up': '15% de desconto + frete grátis',
            'recuperacao': '20% de desconto + brinde exclusivo',
            'aniversario': '25% de desconto no mês do aniversário',
            'promocao': 'Compre 2 leve 3'
        };

        return offers[this.filterCategory] || '10% de desconto especial';
    }

    /**
     * 🎁 GERAR BRINDE
     * FUNCIONALIDADE: Gera uma oferta de brinde contextualizada com a categoria da mensagem.
     */
    private generateGift(): string {
        const gifts: any = {
            'pos-venda': 'Chaveiro personalizado',
            'follow-up': 'Caneca exclusiva',
            'recuperacao': 'Kit de brindes especiais',
            'aniversario': 'Vale-presente surpresa'
        };

        return gifts[this.filterCategory] || 'Brinde surpresa';
    }

    /**
     * 💳 GERAR OFERTA DE PARCELAMENTO
     * FUNCIONALIDADE: Gera uma oferta de parcelamento com base no valor total da compra.
     */
    private generateInstallmentOffer(): string {
        const value = this.extractTotalValue();
        if (value > 100) {
            const installments = Math.min(12, Math.floor(value / 50));
            const installmentValue = value / installments;
            return `Até ${installments}x de ${this.formatCurrency(installmentValue)} sem juros`;
        }
        return 'À vista com 5% de desconto';
    }

    /**
     * 🎂 GERAR PRESENTE DE ANIVERSÁRIO
     * FUNCIONALIDADE: Cria uma oferta especial para a categoria de aniversário.
     */
    private generateBirthdayGift(): string {
        if (this.filterCategory === 'aniversario') {
            return '20% de desconto em qualquer produto + frete grátis';
        }
        return '10% de desconto especial';
    }

    /**
     * 📰 GERAR NOVIDADES
     * FUNCIONALIDADE: Gera um texto sobre novidades, personalizado para o contexto da comunicação.
     */
    private generateNews(): string {
        const news: any = {
            'pos-venda': '✨ Novos produtos chegaram!\n📦 Frete grátis acima de R$ 150',
            'follow-up': '🎯 Promoção relâmpago esta semana\n💳 Parcelamento em até 12x',
            'recuperacao': '🔥 Últimas unidades em estoque\n⚡ Entrega express disponível',
            'relacionamento': '🆕 Lançamento exclusivo\n🎁 Programa de fidelidade'
        };

        return news[this.filterCategory] || '✨ Confira nossas novidades!';
    }

    /**
     * 💬 GERAR MENSAGEM PERSONALIZADA
     * FUNCIONALIDADE: Cria uma frase de abertura personalizada com base na categoria da mensagem.
     */
    private generatePersonalizedMessage(): string {
        // Baseado no contexto, gerar mensagem apropriada
        if (this.filterCategory === 'pos-venda') {
            return 'Esperamos que esteja gostando da sua compra! Sua opinião é muito importante para nós.';
        } else if (this.filterCategory === 'follow-up') {
            return 'Notamos seu interesse em nossos produtos. Que tal aproveitar essa oportunidade especial?';
        } else if (this.filterCategory === 'recuperacao') {
            return 'Sentimos sua falta! Preparamos algo especial para você voltar.';
        }

        return 'Temos uma oferta especial preparada para você!';
    }

    /**
     * 💬 GERAR RESPOSTA
     * FUNCIONALIDADE: Gera uma resposta genérica para ser usada em templates de resposta.
     */
    private generateResponse(): string {
        return 'Fico feliz em poder ajudar! Estou à disposição para qualquer dúvida.';
    }

    /**
     * 🎁 GERAR BÔNUS
     * FUNCIONALIDADE: Gera uma oferta de bônus padrão.
     */
    private generateBonus(): string {
        return 'Cupom de R$ 20 para próxima compra';
    }

    /**
     * 📋 GERAR CONDIÇÕES
     * FUNCIONALIDADE: Gera uma frase padrão sobre condições de pagamento e entrega.
     */
    private generateConditions(): string {
        return 'Pagamento facilitado + Entrega grátis';
    }

    /**
     * 🌟 GERAR CONDIÇÕES ESPECIAIS
     * FUNCIONALIDADE: Gera um texto com uma oferta especial agressiva.
     */
    private generateSpecialConditions(): string {
        return '30% de desconto + Brinde exclusivo + Frete grátis';
    }

    /**
     * 🎯 SELECIONAR MELHOR TEMPLATE AUTOMATICAMENTE
     * FUNCIONALIDADE: Tenta selecionar o template mais relevante para o contexto atual, dando prioridade à categoria filtrada e evitando sobrepor seleções já feitas (como a de garantia).
     */
    private selectBestTemplateAutomatically(): void {
        console.log('🎯 Selecionando melhor template para categoria:', this.filterCategory);

        // Se já foi selecionado pela detecção de garantia, manter
        if (this.selectedTemplate && this.customer?.isWarrantyContext) {
            return;
        }

        let bestTemplate: IMessageTemplate | null = null;

        // Se tem categoria específica
        if (this.filterCategory && this.filterCategory !== 'all') {
            // Filtrar templates da categoria
            const categoryTemplates = this.templates.filter(t => t.category === this.filterCategory);

            // Analisar qual é mais adequado baseado no contexto
            bestTemplate = this.findBestTemplateByContext(categoryTemplates);
        }

        // Se não encontrou, pegar o primeiro da categoria
        if (!bestTemplate && this.filterCategory !== 'all') {
            const categoryTemplates = this.templates.filter(t => t.category === this.filterCategory);
            if (categoryTemplates.length > 0) {
                bestTemplate = categoryTemplates[0];
            }
        }

        // Se ainda não tem, pegar qualquer um relevante
        if (!bestTemplate) {
            bestTemplate = this.templates[0];
        }

        // Selecionar e preencher
        if (bestTemplate && !this.selectedTemplate) {
            this.selectTemplate(bestTemplate);
        }
    }

    /**
     * 🔍 ENCONTRAR MELHOR TEMPLATE PELO CONTEXTO
     * FUNCIONALIDADE: Atribui uma pontuação aos templates com base na correspondência de tags com a descrição da atividade do cliente, para encontrar o mais relevante.
     */
    private findBestTemplateByContext(templates: IMessageTemplate[]): IMessageTemplate | null {
        // Analisar descrição da atividade para escolher melhor template
        const description = (this.customer?.activityDescription || '').toLowerCase();
        const title = (this.customer?.activityTitle || '').toLowerCase();

        // Pontuação para cada template
        const scores = templates.map(template => {
            let score = 0;

            // Verificar palavras-chave
            template.tags.forEach(tag => {
                if (description.includes(tag) || title.includes(tag)) {
                    score += 10;
                }
            });

            // Prioridade base
            score += (10 - (template.priority || 10));

            return { template, score };
        });

        // Ordenar por pontuação
        scores.sort((a, b) => b.score - a.score);

        return scores[0]?.template || null;
    }

    /**
     * ✅ SELECIONAR TEMPLATE E PREENCHER
     * FUNCIONALIDADE: Define um template como "selecionado", preenche seu conteúdo com as variáveis do `contextData` e atualiza a interface para exibir a mensagem final.
     */
    public selectTemplate(template: IMessageTemplate): void {
        console.log('🎯 Selecionando template:', template.name);

        // Marcar como selecionado
        this.selectedTemplate = template;

        // Verificar se temos dados de contexto
        if (Object.keys(this.contextData).length === 0) {
            console.log('⚠️ Contexto vazio, preenchendo novamente...');
            this.analyzeContextIntelligently();
        }

        // 🎂 SE FOR TEMPLATE DE ANIVERSÁRIO, ADICIONAR VARIÁVEIS ESPECÍFICAS
        if (template.category === 'aniversario') {
            this.addBirthdayVariables(template);
        }

        // Preencher o template com os dados
        if (template.tags && template.tags.includes('garantia')) {
            // Garantir que variáveis de garantia estejam no contexto
            this.preencherVariaveisGarantia(template);
        } else {
            this.editedMessage = fillTemplateVariables(template.content, this.contextData);
        }

        console.log('✅ Template preenchido com sucesso');
        console.log('📝 Mensagem:', this.editedMessage.substring(0, 100) + '...');

        // Atualizar textarea após preencher
        this.updateTextarea();

    }

    /**
     * 🎂 ADICIONAR VARIÁVEIS ESPECÍFICAS DE ANIVERSÁRIO
     */
    private addBirthdayVariables(template: IMessageTemplate): void {
        // Variáveis específicas por template de aniversário
        if (template.id === 'aniversario-1') {
            this.contextData['presente_aniversario'] = '15% de desconto + brinde surpresa';
        } else if (template.id === 'aniversario-2') {
            this.contextData['cupom'] = 'NIVER10';
        } else if (template.id === 'aniversario-3') {
            this.contextData['cupom'] = 'VIPNIVER20';
        } else if (template.id === 'aniversario-4') {
            this.contextData['cupom'] = 'PARABENS15';
        } else if (template.id === 'aniversario-5') {
            this.contextData['cupom'] = 'NIVER25';
            this.contextData['valor_minimo'] = '150,00';
        } else if (template.id === 'aniversario-6') {
            // Cupons progressivos
            this.contextData['cupom1'] = 'NIVER10';
            this.contextData['cupom2'] = 'NIVER15';
            this.contextData['cupom3'] = 'NIVER20';
        } else if (template.id === 'aniversario-7') {
            this.contextData['cupom'] = 'PREMIUM30';
            this.contextData['dias_validade'] = '45';
        } else if (template.id === 'aniversario-8') {
            this.contextData['cupom'] = 'NIVER2X1';
            this.contextData['categorias_validas'] = 'roupas, acessórios e calçados';
            this.contextData['dias_validade'] = '30';
        }
    }

    /**
     * 🐛 DEBUG - Verificar seleção
     * FUNCIONALIDADE: Imprime no console o estado atual da seleção para fins de depuração.
     */
    private debugSelection(): void {
        console.log('=== DEBUG SELEÇÃO ===');
        console.log('Template selecionado:', this.selectedTemplate?.name);
        console.log('Mensagem editada:', this.editedMessage?.length, 'caracteres');
        console.log('Context data:', Object.keys(this.contextData).length, 'variáveis');
    }

    /**
     * 🔍 EXTRAIR PRODUTOS DA DESCRIÇÃO
     * FUNCIONALIDADE: Utiliza expressões regulares para extrair detalhes de produtos de uma string de texto formatada.
     */
    private extractProductsFromDescription(description: string): any[] {
        const products: any[] = [];

        // Procurar padrão: • 2x Nome do Produto - R$ 100,00
        const regex = /• (\d+)x (.+?) - R\$ ([\d.,]+)/g;
        let match;

        while ((match = regex.exec(description)) !== null) {
            products.push({
                quantity: parseInt(match[1]),
                name: match[2],
                total: parseFloat(match[3].replace('.', '').replace(',', '.'))
            });
        }

        return products;
    }

    /**
     * 🔍 EXTRAIR SERVIÇOS DA DESCRIÇÃO
     * FUNCIONALIDADE: Utiliza expressões regulares para extrair detalhes de serviços de uma string de texto.
     */
    private extractServicesFromDescription(description: string): any[] {
        const services: any[] = [];

        // Procurar por serviços na descrição
        if (description.includes('SERVIÇOS')) {
            const servicesSection = description.split('SERVIÇOS')[1]?.split('\n\n')[0];
            if (servicesSection) {
                const lines = servicesSection.split('\n').filter(l => l.includes('•'));
                lines.forEach(line => {
                    const match = line.match(/• (.+?) - R\$ ([\d.,]+)/);
                    if (match) {
                        services.push({
                            name: match[1],
                            total: parseFloat(match[2].replace('.', '').replace(',', '.'))
                        });
                    }
                });
            }
        }

        return services;
    }

    /**
     * 🔍 EXTRAIR SERVIÇOS DO SERVICE DATA
     * FUNCIONALIDADE: Extrai informações de serviços de um objeto estruturado `serviceData`.
     */
    private extractServicesFromServiceData(serviceData: any): any[] {
        const services: any[] = [];

        if (serviceData.servicesDetails) {
            // Se é string separada por vírgula
            if (typeof serviceData.servicesDetails === 'string') {
                serviceData.servicesDetails.split(',').forEach((service: string) => {
                    services.push({ name: service.trim() });
                });
            }
        }

        if (serviceData.servicesTypes && Array.isArray(serviceData.servicesTypes)) {
            serviceData.servicesTypes.forEach((type: any) => {
                services.push({
                    name: type.name || type.description,
                    price: type.price || type.value
                });
            });
        }

        return services;
    }

    /**
     * 🔍 FILTRAR TEMPLATES
     * FUNCIONALIDADE: Retorna a lista de templates filtrada com base na categoria selecionada e no termo de busca digitado pelo usuário. Prioriza templates de garantia se o contexto for detectado.
     */
    public getFilteredTemplates(): IMessageTemplate[] {
        let filtered = [...this.templates]; // Fazer cópia do array

        // Filtrar por categoria SE não for 'all'
        if (this.filterCategory && this.filterCategory !== 'all') {
            filtered = filtered.filter(template =>
                template.category === this.filterCategory
            );
        }

        // Filtrar por busca
        if (this.searchTerm && this.searchTerm.trim() !== '') {
            const searchLower = this.searchTerm.toLowerCase().trim();
            filtered = filtered.filter(template =>
                template.name.toLowerCase().includes(searchLower) ||
                template.content.toLowerCase().includes(searchLower) ||
                template.tags.some(tag => tag.toLowerCase().includes(searchLower))
            );
        }

        // Se detectou garantia, colocar templates de garantia no topo
        if (this.isGarantiaDetected) {
            const garantiaTemplates = filtered.filter(t => t.tags.includes('garantia'));
            const outrosTemplates = filtered.filter(t => !t.tags.includes('garantia'));
            filtered = [...garantiaTemplates, ...outrosTemplates];
        }

        // console.log(`📋 Templates filtrados: ${filtered.length} de ${this.templates.length}`);
        return filtered;
    }

    /**
     * 💾 CONFIRMAR ENVIO
     * FUNCIONALIDADE: Emite um evento com o template selecionado e a mensagem finalizada, para que o componente pai possa prosseguir com o envio.
     */
    public confirmSend(): void {
        if (!this.selectedTemplate) return;

        this.onSelect.emit({
            template: this.selectedTemplate,
            message: this.editedMessage
        });
    }

    /**
     * ❌ FECHAR MODAL
     * FUNCIONALIDADE: Emite um evento para sinalizar ao componente pai que o modal deve ser fechado.
     */
    public closeModal(): void {
        this.onClose.emit();
    }

    // === FUNÇÕES AUXILIARES ===

    /**
     * 📱 FORMATAR TELEFONE
     * FUNCIONALIDADE: Formata um número de telefone para o padrão brasileiro (XX) XXXXX-XXXX.
     */
    private formatPhone(phone: string): string {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 11) {
            return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
        }
        return phone;
    }

    /**
     * 💰 FORMATAR MOEDA
     * FUNCIONALIDADE: Formata um valor numérico para o padrão de moeda brasileiro (R$).
     */
    private formatCurrency(value: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    }

    /**
     * 📅 FORMATAR DATA
     * FUNCIONALIDADE: Formata um objeto `Date` para o padrão de data brasileiro (dd/mm/aaaa).
     */
    private formatDate(date: Date): string {
        return new Intl.DateTimeFormat('pt-BR').format(date);
    }

    /**
     * 📅 ADICIONAR DIAS
     * FUNCIONALIDADE: Adiciona um número de dias a uma data.
     */
    private addDays(date: Date, days: number): Date {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    /**
     * 🎨 OBTER COR DA CATEGORIA
     * FUNCIONALIDADE: Retorna um código de cor hexadecimal associado a uma categoria de template para uso visual.
     */
    public getCategoryColor(category: string): string {
        const colors: { [key: string]: string } = {
            'pos-venda': '#10b981',
            'follow-up': '#3b82f6',
            'recuperacao': '#f59e0b',
            'ordem-servico': '#6366f1',
            'cobranca': '#ef4444',
            'aniversario': '#ec4899',
            'promocao': '#8b5cf6',
            'agendamento': '#06b6d4',
            'relacionamento': '#84cc16',
            'generico': '#6b7280'
        };
        return colors[category] || '#718096';
    }

    /**
     * 🎯 OBTER ÍCONE DA CATEGORIA
     * FUNCIONALIDADE: Retorna o nome de um ícone associado a uma categoria de template.
     */
    public getCategoryIcon(category: string): string {
        const cat = this.categories.find(c => c.value === category);
        return cat ? cat.icon : 'grid-outline';
    }

    /**
     * 🏷️ CONTAR TEMPLATES POR CATEGORIA - OTIMIZADO
     * FUNCIONALIDADE: Retorna a contagem de templates de uma categoria a partir do cache pré-calculado, garantindo alta performance.
     */
    public getTemplateCount(category: string): number {
        // 🆕 USAR O CACHE AO INVÉS DE CALCULAR TODA VEZ
        return this.templateCounts[category] || 0;
    }
    /**
     * 🎯 MUDAR CATEGORIA
     * FUNCIONALIDADE: Altera a categoria de filtro ativa, limpa o campo de busca e, se necessário, seleciona o primeiro template da nova categoria.
     */
    public changeCategory(category: string): void {
        console.log(`🔄 Mudando para categoria: ${category}`);
        this.filterCategory = category;

        // Limpar busca ao mudar categoria
        this.searchTerm = '';

        // Se não tem template selecionado, selecionar o primeiro da nova categoria
        const filtered = this.getFilteredTemplates();
        if (filtered.length > 0 && !this.selectedTemplate) {
            this.selectTemplate(filtered[0]);
        }
    }

    /**
     * 🔍 LIMPAR BUSCA
     * FUNCIONALIDADE: Limpa o termo de busca do campo de input.
     */
    public clearSearch(): void {
        this.searchTerm = '';
        console.log('🧹 Busca limpa');
    }

    /**
     * 📋 COPIAR MENSAGEM
     * FUNCIONALIDADE: Copia o texto da mensagem editada para a área de transferência do usuário.
     */
    public copyMessage(): void {
        if (this.editedMessage) {
            navigator.clipboard.writeText(this.editedMessage);
            // TODO: Mostrar notificação
        }
    }

    /**
     * 🔄 RECARREGAR TEMPLATE
     * FUNCIONALIDADE: Preenche novamente o template selecionado, descartando quaisquer edições manuais e restaurando a versão original preenchida com as variáveis.
     */
    public reloadTemplate(): void {
        if (this.selectedTemplate) {
            this.selectTemplate(this.selectedTemplate);
        }
    }

    /**
 * 📏 CALCULAR ALTURA DO TEXTAREA (VERSÃO MOBILE MELHORADA)
 * FUNCIONALIDADE: Calcula altura dinâmica do textarea baseada no conteúdo
 * Melhorado para funcionar bem em dispositivos móveis
 */
    public getTextareaHeight(): number {
        // Se não tem mensagem, altura padrão
        if (!this.editedMessage) {
            return this.isMobile() ? 150 : 200;
        }

        // Conta linhas
        const lines = this.editedMessage.split('\n').length;

        // Calcula altura baseada nas linhas
        const lineHeight = 25;
        const calculatedHeight = lines * lineHeight;

        // Define limites diferentes para mobile e desktop
        const minHeight = this.isMobile() ? 120 : 200;
        const maxHeight = this.isMobile() ? 300 : 400;

        // Retorna altura dentro dos limites
        return Math.max(minHeight, Math.min(maxHeight, calculatedHeight));
    }
    /**
     * 📱 DETECTAR SE É MOBILE
     * FUNCIONALIDADE: Verifica se está em dispositivo móvel
     */
    private isMobile(): boolean {
        return window.innerWidth <= 768;
    }
    /**
     * 🔄 ATUALIZAR TEXTAREA
     * FUNCIONALIDADE: Garante que o textarea seja atualizado corretamente em
     * qualquer dispositivo. Antes estava restrito ao mobile, o que fazia o
     * conteúdo não aparecer no desktop em alguns cenários.
     */
    public updateTextarea(): void {

        setTimeout(() => {
            const textarea = document.querySelector('.editor-textarea textarea') as HTMLTextAreaElement;
            if (textarea && this.editedMessage) {
                // Força o foco e atualização
                textarea.value = this.editedMessage;
                textarea.dispatchEvent(new Event('input', { bubbles: true }));

                // Ajusta altura automaticamente
                textarea.style.height = 'auto';
                textarea.style.height = textarea.scrollHeight + 'px';
            }
        }, 100);
    }
    /**
  * 🔍 EVENTO DE MUDANÇA NA BUSCA
  * FUNCIONALIDADE: Chamado quando o usuário digita no campo de busca
  * Adicionado para resolver problemas de responsividade no mobile
  */
    public onSearchChange(): void {
        // Pequeno delay para melhorar performance no mobile
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        this.searchTimeout = setTimeout(() => {
            // A busca já é feita automaticamente pelo getFilteredTemplates()
            // Este método existe apenas para melhorar a experiência no mobile
            console.log('🔍 Busca atualizada:', this.searchTerm);
        }, 300);
    }

    // Adicione esta propriedade no início da classe:
    private searchTimeout: any;


    /**
      * 🌐 TRADUZIR CATEGORIA DO CLIENTE
      * FUNCIONALIDADE: Converte um identificador de categoria de cliente em um rótulo amigável para exibição.
      */
    public translateCustomerCategory(category: string): string {
        const translations: { [key: string]: string } = {
            'today': '🎂 Hoje',
            'this-week': '📅 Esta Semana',
            'this-month': '📆 Este Mês',
            'pos-venda': '🛍️ Pós-Venda',
            'follow-up': '📞 Follow-up',
            'recuperacao': '🔄 Recuperação',
            'ordem-servico': '🔧 Ordem de Serviço'
        };
        return translations[category] || 'Cliente';
    }

    // ⬇️ ADICIONE OS NOVOS MÉTODOS AQUI ⬇️

    /**
     * 🕐 OBTER HORA ATUAL
     * FUNCIONALIDADE: Retorna a hora atual formatada no padrão brasileiro (hh:mm).
     */
    public getCurrentTime(): string {
        const now = new Date();
        return now.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * 📱 OBTER NOME DA CATEGORIA
     * FUNCIONALIDADE: Retorna o nome (rótulo) de uma categoria com base em seu valor (identificador).
     */
    public getCategoryName(category: string): string {
        const cat = this.categories.find(c => c.value === category);
        return cat ? cat.label : 'Templates';
    }

    /**
     * 🔄 ATUALIZAR EMPRESA DINAMICAMENTE
     */
    public refreshCompanyInfo(): void {
        this.loadTenantCompanyInfo().then(() => {
            // Re-preencher o template atual se houver
            if (this.selectedTemplate) {
                this.analyzeContextIntelligently();
                this.selectTemplate(this.selectedTemplate);
            }
        });
    }
    // 📁 ARQUIVO: message-templates.component.ts (método loadTemplatesByCategory)
    // 📂 CAMINHO: src/app/pages/crm/components/message-templates/message-templates.component.ts
    // 🎯 CORREÇÃO: Adicionar suporte para categoria recompra

    /**
     * 📋 CARREGAR TEMPLATES POR CATEGORIA
     * Filtra os templates baseado na categoria selecionada
     */
    private loadTemplatesByCategory(): void {
        console.log('📋 Carregando templates da categoria:', this.selectedCategory);

        // Se não tem categoria, mostrar todos
        if (!this.selectedCategory || this.selectedCategory === 'all') {
            this.filteredTemplates = [...this.allTemplates];
            return;
        }

        // 🔄 TRATAMENTO ESPECIAL PARA RECOMPRA
        if (this.selectedCategory === 'recompra') {
            console.log('🔄 Carregando templates de RECOMPRA');

            // Filtrar templates de recompra
            this.filteredTemplates = this.allTemplates.filter(t =>
                t.category === 'recompra' ||
                t.tags?.includes('recompra') ||
                t.id?.includes('recompra')
            );

            // Se não encontrou templates de recompra, criar alguns padrão
            if (this.filteredTemplates.length === 0) {
                console.log('⚠️ Nenhum template de recompra encontrado, criando padrão...');
                this.addDefaultRecompraTemplates();
            }

            return;
        }

        // Filtrar por categoria normal
        this.filteredTemplates = this.allTemplates.filter(t =>
            t.category === this.selectedCategory
        );

        console.log(`✅ ${this.filteredTemplates.length} templates encontrados`);
    }

    /**
     * 🏷️ OBTER CATEGORIAS DISPONÍVEIS
     * Retorna lista de categorias incluindo recompra
     */
    public getCategories(): string[] {
        const categories = [
            'all',
            'first-contact',
            'follow-up',
            'pos-venda',
            'recuperacao',
            'recompra', // 🔄 ADICIONAR CATEGORIA RECOMPRA
            'garantia',
            'oficina',
            'varejo'
        ];

        return categories;
    }

    /**
     * 🏷️ OBTER LABEL DA CATEGORIA
     * Retorna o nome amigável da categoria
     */
    public getCategoryLabel(category: string): string {
        const labels = {
            'all': 'Todos',
            'first-contact': '👋 Primeiro Contato',
            'follow-up': '📞 Follow-up',
            'pos-venda': '✅ Pós-Venda',
            'recuperacao': '🔄 Recuperação',
            'recompra': '🔄 Recompra', // 🔄 ADICIONAR LABEL DE RECOMPRA
            'garantia': '🛡️ Garantia',
            'oficina': '🔧 Oficina',
            'varejo': '🛍️ Varejo'
        };

        return labels[category] || category;
    }
}  