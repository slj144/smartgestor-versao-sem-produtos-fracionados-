// Arquivo: customer-import.component.ts
// Localização: src/app/pages/crm/components/customer-import/customer-import.component.ts
// VERSÃO CORRIGIDA com proteções e debug

import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Serviços
import { CustomerImportService, ICustomerAnalysis } from '../../services/customer-import.service';
import { AlertService } from '@shared/services/alert.service';
import { IToolsService } from '@shared/services/iTools.service';

// Utilities
import { Utilities } from '@shared/utilities/utilities';

@Component({
    selector: 'app-customer-import',
    templateUrl: './customer-import.component.html',
    styleUrls: ['./customer-import.component.scss']
})
export class CustomerImportComponent implements OnInit, OnDestroy {

    @Output() onClose = new EventEmitter<void>();
    @Output() onImportComplete = new EventEmitter<number>();

    private destroy$ = new Subject<void>();
    private isAnalyzing = false; // Flag para evitar análises duplicadas

    // Estados
    public currentStep: 'start' | 'analyzing' | 'selection' | 'importing' | 'complete' = 'start';

    // Dados
    public analysisResults: ICustomerAnalysis[] = [];
    public allAnalysisResults: ICustomerAnalysis[] = [];
    public selectedCustomers: Set<string> = new Set();
    public importProgress = {
        status: 'idle',
        current: 0,
        total: 0,
        message: ''
    };

    // Filtros
    public filterCategory = 'all';
    public filterPriority = 'all';
    public searchTerm = '';
    public showOnlyNew = true;
    public selectAll = false;

    // Estatísticas
    public stats = {
        totalCustomers: 0,
        hotCustomers: 0,
        warmCustomers: 0,
        coldCustomers: 0,
        newCustomers: 0,
        totalValue: 0,
        averageScore: 0
    };

    // Propriedades para o modal de detalhes
    public selectedCustomerForDetails: any = null;
    public selectedCustomerRawData: any = null;

    constructor(
        private customerImportService: CustomerImportService,
        private alertService: AlertService,
        private iToolsService: IToolsService
    ) {
        console.log('🟢 CustomerImport: Componente construído');
    }

    ngOnInit(): void {
        console.log('🟢 CustomerImport: ngOnInit iniciado');

        // Subscrever aos resultados da análise
        this.customerImportService.analysisResults$
            .pipe(takeUntil(this.destroy$))
            .subscribe(results => {
                console.log('📊 CustomerImport: Resultados recebidos via subscription:', results.length);

                // Só processar se estiver analisando
                if (this.isAnalyzing || results.length > 0) {
                    this.analysisResults = results;
                    this.allAnalysisResults = [...results];

                    if (results.length > 0) {
                        console.log('✅ CustomerImport: Mudando para selection com', results.length, 'clientes');
                        this.currentStep = 'selection';
                        this.calculateStats();
                        this.applyFilters();
                        this.isAnalyzing = false;
                    } else if (this.isAnalyzing) {
                        console.log('⚠️ CustomerImport: Análise completa mas sem resultados');
                        this.alertService.alert('Nenhum cliente encontrado para análise', 'warning');
                        this.currentStep = 'start';
                        this.isAnalyzing = false;
                    }
                }
            });

        // Subscrever ao progresso
        this.customerImportService.importProgress$
            .pipe(takeUntil(this.destroy$))
            .subscribe(progress => {
                console.log('📈 CustomerImport: Progresso atualizado:', progress);
                this.importProgress = progress;

                // Só mudar para complete se estiver importando
                if (progress.status === 'completed' && this.currentStep === 'importing') {
                    this.currentStep = 'complete';
                }

                // Tratar erros
                if (progress.status === 'error' && this.isAnalyzing) {
                    console.error('❌ CustomerImport: Erro detectado durante análise');
                    this.alertService.alert('Erro durante a análise. Tente novamente.', 'error');
                    this.currentStep = 'start';
                    this.isAnalyzing = false;
                }
            });
    }

    ngOnDestroy(): void {
        console.log('🔴 CustomerImport: Componente sendo destruído');
        this.destroy$.next();
        this.destroy$.complete();

        // Só resetar se não estiver no meio de uma operação
        if (!this.isAnalyzing && this.currentStep !== 'importing') {
            this.customerImportService.resetProgress();
        }
    }

    /**
     * Iniciar análise
     */
    public async startAnalysis(): Promise<void> {
        console.log('🚀 CustomerImport: Botão de análise clicado');

        // Evitar análises duplicadas
        if (this.isAnalyzing) {
            console.log('⚠️ CustomerImport: Análise já em andamento');
            return;
        }

        try {
            this.isAnalyzing = true;
            this.currentStep = 'analyzing';
            console.log('📍 CustomerImport: Step mudado para analyzing');

            // Limpar resultados anteriores
            this.analysisResults = [];
            this.allAnalysisResults = [];
            this.selectedCustomers.clear();

            // Chamar o serviço
            console.log('🔄 CustomerImport: Chamando serviço de análise...');
            const result = await this.customerImportService.analyzeCustomers();

            console.log('✅ CustomerImport: Serviço retornou:', result?.length || 0, 'resultados');

            // Se o serviço retornar os resultados diretamente (sem usar Subject)
            if (result && result.length > 0 && this.analysisResults.length === 0) {
                console.log('📊 CustomerImport: Processando resultado direto do serviço');
                this.analysisResults = result;
                this.allAnalysisResults = [...result];
                this.currentStep = 'selection';
                this.calculateStats();
                this.applyFilters();
                this.isAnalyzing = false;
            } else if (result && result.length === 0) {
                console.log('⚠️ CustomerImport: Nenhum cliente encontrado');
                this.alertService.alert('Nenhum cliente encontrado para análise', 'warning');
                this.currentStep = 'start';
                this.isAnalyzing = false;
            }
            // Se usar Subject, o subscribe acima cuidará do resto

        } catch (error) {
            console.error('❌ CustomerImport: Erro na análise:', error);
            this.alertService.alert('Erro ao analisar clientes. Por favor, tente novamente.', 'error');
            this.currentStep = 'start';
            this.isAnalyzing = false;
        }
    }

    /**
     * Calcular estatísticas
     */
    private calculateStats(): void {
        console.log('📊 CustomerImport: Calculando estatísticas...');
        const allResults = this.allAnalysisResults;

        this.stats = {
            totalCustomers: allResults.length,
            hotCustomers: allResults.filter(c => c.category === 'hot').length,
            warmCustomers: allResults.filter(c => c.category === 'warm').length,
            coldCustomers: allResults.filter(c => c.category === 'cold').length,
            newCustomers: allResults.filter(c => c.category === 'new').length,
            totalValue: allResults.reduce((sum, c) => sum + c.totalSpent, 0),
            averageScore: allResults.length > 0
                ? allResults.reduce((sum, c) => sum + c.score, 0) / allResults.length
                : 0
        };

        console.log('📊 CustomerImport: Estatísticas calculadas:', this.stats);
    }

    /**
     * Aplicar filtros
     */
    public applyFilters(): void {
        let filtered = [...this.allAnalysisResults];

        // Filtro de categoria
        if (this.filterCategory !== 'all') {
            filtered = filtered.filter(c => c.category === this.filterCategory);
        }

        // Filtro de prioridade
        if (this.filterPriority !== 'all') {
            filtered = filtered.filter(c => c.priority === this.filterPriority);
        }

        // Filtro de busca
        if (this.searchTerm.trim()) {
            const search = this.searchTerm.toLowerCase();
            filtered = filtered.filter(c =>
                c.customerName.toLowerCase().includes(search) ||
                (c.email && c.email.toLowerCase().includes(search))
            );
        }

        this.analysisResults = filtered;
        console.log('🔍 CustomerImport: Filtros aplicados, mostrando', filtered.length, 'de', this.allAnalysisResults.length);
    }

    /**
     * Obter resultados filtrados
     */
    public getFilteredResults(): ICustomerAnalysis[] {
        return this.analysisResults;
    }

    /**
     * Toggle seleção de cliente
     */
    public toggleCustomerSelection(customerId: string): void {
        if (this.selectedCustomers.has(customerId)) {
            this.selectedCustomers.delete(customerId);
        } else {
            this.selectedCustomers.add(customerId);
        }

        this.updateSelectAllState();
    }

    /**
     * Toggle selecionar todos
     */
    public toggleSelectAll(): void {
        if (this.selectAll) {
            this.getFilteredResults().forEach(customer => {
                this.selectedCustomers.add(customer.customerId);
            });
        } else {
            this.selectedCustomers.clear();
        }
    }

    /**
     * Atualizar estado do checkbox "selecionar todos"
     */
    private updateSelectAllState(): void {
        const visibleResults = this.getFilteredResults();
        const allSelected = visibleResults.length > 0 &&
            visibleResults.every(c => this.selectedCustomers.has(c.customerId));

        this.selectAll = allSelected;
    }

    /**
     * Selecionar todos os visíveis
     */
    public selectAllVisible(): void {
        this.getFilteredResults().forEach(customer => {
            this.selectedCustomers.add(customer.customerId);
        });
        this.selectAll = true;
    }

    /**
     * Limpar seleção
     */
    public clearSelection(): void {
        this.selectedCustomers.clear();
        this.selectAll = false;
    }

    /**
     * Importar selecionados
     */
    public async importSelected(): Promise<void> {
        if (this.selectedCustomers.size === 0) {
            this.alertService.alert('Selecione pelo menos um cliente', 'warning');
            return;
        }

        const confirm = await this.alertService.confirm(
            'Confirmar Importação',
            `Deseja importar ${this.selectedCustomers.size} cliente(s) selecionado(s)?`
        );

        if (!confirm.value) return;

        try {
            this.currentStep = 'importing';

            const selectedAnalyses = this.allAnalysisResults.filter(
                a => this.selectedCustomers.has(a.customerId)
            );

            await this.customerImportService.importSelectedCustomers(selectedAnalyses);

            this.onImportComplete.emit(selectedAnalyses.length);

        } catch (error) {
            console.error('Erro na importação:', error);
            this.alertService.alert('Erro ao importar clientes', 'error');
            this.currentStep = 'selection';
        }
    }

    /**
     * Visualizar detalhes do cliente
     */
    public viewCustomerDetails(analysis: ICustomerAnalysis): void {
        console.log('🔍 Visualizando detalhes do cliente:', analysis.customerName);

        this.selectedCustomerForDetails = analysis;

        try {
            const service: any = this.customerImportService;
            const rawData = service.getCustomerRawData ?
                service.getCustomerRawData(analysis.customerId) : null;

            if (rawData) {
                this.selectedCustomerRawData = rawData;
                console.log('✅ Dados brutos encontrados:', rawData.orders?.length, 'orders');
            } else {
                this.selectedCustomerRawData = {
                    _id: analysis.customerId,
                    name: analysis.customerName,
                    email: analysis.email,
                    phone: analysis.phone,
                    orders: []
                };
                console.log('⚠️ Dados brutos não encontrados, modal buscará diretamente');
            }
        } catch (error) {
            console.error('Erro ao buscar dados brutos:', error);
            this.selectedCustomerRawData = {
                _id: analysis.customerId,
                name: analysis.customerName,
                email: analysis.email,
                phone: analysis.phone,
                orders: []
            };
        }
    }

    /**
     * Fechar modal de detalhes
     */
    public closeCustomerDetails(): void {
        this.selectedCustomerForDetails = null;
        this.selectedCustomerRawData = null;
    }

    /**
     * Obter label da categoria
     */
    public getCategoryLabel(category: string): string {
        const labels = {
            'hot': '🔥 Hot',
            'warm': '☀️ Warm',
            'cold': '❄️ Cold',
            'new': '🆕 Novo'
        };
        return labels[category] || category;
    }

    /**
     * Obter label da coleção
     */
    public getCollectionLabel(collection: string): string {
        const labels = {
            'CashierSales': 'Vendas PDV',
            'Sales': 'Vendas',
            'ServiceOrders': 'Ordens de Serviço',
            'Requests': 'Pedidos'
        };
        return labels[collection] || collection;
    }

    /**
     * Formatar moeda
     */
    public formatCurrency(value: number): string {
        if (!value) return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    /**
     * Formatar data
     */
    public formatDate(date: Date | string): string {
        if (!date) return 'N/A';

        const dateObj = typeof date === 'string' ? new Date(date) : date;

        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(dateObj);
    }

    /**
     * Fechar componente
     */
    public close(): void {
        console.log('🔴 CustomerImport: Método close() chamado');

        // Só emitir close se não estiver no meio de uma operação
        if (!this.isAnalyzing && this.currentStep !== 'importing') {
            this.onClose.emit();
        } else {
            console.log('⚠️ CustomerImport: Tentativa de fechar durante operação bloqueada');
        }
    }
}