// Arquivo: sales-analysis.component.ts
// Caminho: src/app/pages/crm/sales-analysis/sales-analysis.component.ts
// O que faz: Componente para análise de vendas - VERSÃO REFATORADA COM GRÁFICOS

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';

// ADICIONADO: Importar Chart.js
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

// Serviços
import { CrmService } from '../crm.service';
import { SalesAnalysisService } from '../services/sales-analysis.service';
import { AlertService } from '@shared/services/alert.service';

// Utilities
import { Utilities } from '@shared/utilities/utilities';
import { DateTime } from '@shared/utilities/dateTime';
import * as XLSX from 'xlsx';
@Component({
    selector: 'app-sales-analysis',
    templateUrl: './sales-analysis.component.html',
    styleUrls: ['./sales-analysis.component.scss']
})
export class SalesAnalysisComponent implements OnInit, OnDestroy {

    private destroy$ = new Subject<void>();

    // Estados
    public loading = true;
    public processing = false;

    // Dados
    public sales: any[] = [];
    public filteredSales: any[] = [];
    public selectedSales = new Set<string>();

    // ADICIONADO: Controle de expansão de vendas
    public expandedSales = new Set<string>();

    // ADICIONADO: Filtro rápido selecionado
    public quickFilter: string = 'month';

    // ADICIONADO: Propriedades dos gráficos
    public salesChart: Chart | null = null;
    public productsChart: Chart | null = null;
    public sourceChart: Chart | null = null;

    // Filtros
    public filters = {
        dateFrom: this.get30DaysAgo(),
        dateTo: this.getToday(),
        source: 'all',
        status: 'all',
        customer: '',
        minValue: 0,
        maxValue: 0,
        searchTerm: ''
    };

    // Estatísticas
    public stats = {
        totalSales: 0,
        totalValue: 0,
        averageTicket: 0,
        conversions: 0,
        topCustomers: [],
        topProducts: []
    };

    // Controle de módulos disponíveis
    public hasManagementSystem = false;
    public hasCRMOnly = false;
    // Controle de permissões
    public permissions = {
        canView: false,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canViewValue: false,
        canExport: false
    };

    constructor(
        private crmService: CrmService,
        private salesAnalysisService: SalesAnalysisService,
        private alertService: AlertService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.checkPermissions();
        this.checkAvailableModules();
        // ADICIONADO: Definir filtro inicial
        this.setQuickFilter('month');
        this.loadSales();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        // ADICIONADO: Destruir gráficos
        this.destroyCharts();
    }
    /**
     * Verifica permissões do usuário
     */
    private checkPermissions(): void {
        if (Utilities.isAdmin) {
            // Admin tem todas as permissões
            this.permissions = {
                canView: true,
                canCreate: true,
                canEdit: true,
                canDelete: true,
                canViewValue: true,
                canExport: true
            };
        } else {
            // Buscar permissões específicas do CRM
            // const crmPermissions = Utilities.permissions()?.crm;
            const currentStore = Utilities.currentLoginData.projectId;
            const crmPermissions = Utilities.permissions()?.crm;

            if (!crmPermissions) {
                console.warn('Sem permissões para CRM');
                this.router.navigate([`/${currentStore}/dashboard`]);
                return;
            }


            const modules = crmPermissions.modules;
            if (Array.isArray(modules) && !modules.includes('salesAnalysis')) {
                console.warn('Usuário sem permissão para análise de vendas');
                this.router.navigate([`/${currentStore}/crm/dashboard`]);
                return;
            }

            const actions = crmPermissions.actions;
            const hasView = actions ? actions.includes('view') : true;

            this.permissions = {
                canView: hasView,
                canCreate: actions?.includes('add') || false,
                canEdit: actions?.includes('edit') || false,
                canDelete: actions?.includes('delete') || false,
                canViewValue: crmPermissions.fields?.includes('value') || false,
                canExport: hasView
            };

            if (actions && !hasView) {
                this.router.navigate([`/${currentStore}/crm/dashboard`]);
            }
        }
    }
    /**
     * Obtém data de 30 dias atrás
     */
    private get30DaysAgo(): string {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return DateTime.formatDate(date.toISOString()).date;
    }

    /**
     * Obtém data de hoje
     */
    private getToday(): string {
        return DateTime.formatDate(new Date().toISOString()).date;
    }

    private checkAvailableModules(): void {
        const permissions = Utilities.permissions();
        const isAdmin = Utilities.isAdmin;

        console.log('🔍 É admin?', isAdmin);
        console.log('🔍 Permissões completas:', permissions);
        console.log('🔍 Tem cashier?', permissions?.cashier);
        console.log('🔍 Tem stock?', permissions?.stock);
        console.log('🔍 Tem serviceOrders?', permissions?.serviceOrders);

        // Se é admin, tem acesso a tudo
        this.hasManagementSystem = isAdmin || !!(
            permissions?.cashier ||
            permissions?.stock ||
            permissions?.serviceOrders
        );

        this.hasCRMOnly = !this.hasManagementSystem;

        console.log('📊 Módulos disponíveis:', {
            hasManagementSystem: this.hasManagementSystem,
            hasCRMOnly: this.hasCRMOnly,
            isAdmin: isAdmin
        });
    }

    /**
     * Carrega as vendas baseado nos filtros
     */
    public async loadSales(): Promise<void> {
        this.loading = true;

        try {
            // Adicione este log:
            console.log('🚀 Chamando getSalesByPeriod com:', {
                dateFrom: this.filters.dateFrom,
                dateTo: this.filters.dateTo,
                includeManagementSales: this.hasManagementSystem
            });
            // Busca vendas através do serviço
            const sales = await this.salesAnalysisService.getSalesByPeriod(
                this.filters.dateFrom,
                this.filters.dateTo,
                this.hasManagementSystem
            );

            // Adicione este log após receber os dados:
            console.log('📦 Vendas recebidas:', {
                total: sales.length,
                porOrigem: sales.reduce((acc, sale) => {
                    acc[sale.source] = (acc[sale.source] || 0) + 1;
                    return acc;
                }, {})
            });

            this.sales = sales;
            this.applyFilters();
            this.calculateStats();

            // ADICIONADO: Atualizar gráficos após carregar dados
            setTimeout(() => {
                this.updateCharts();
            }, 100);

        } catch (error) {
            console.error('Erro ao carregar vendas:', error);
            this.alertService.alert('Erro ao carregar vendas', 'error');
        } finally {
            this.loading = false;
        }
    }

    /**
     * Aplica filtros nas vendas
     */
    public applyFilters(): void {
        let filtered = [...this.sales];

        // Filtro por origem
        //if (this.filters.source !== 'all') {
        //filtered = filtered.filter(sale => sale.source === this.filters.source);
        // }

        // Filtro por status
        if (this.filters.status !== 'all') {
            filtered = filtered.filter(sale => sale.status === this.filters.status);
        }

        // Filtro por cliente
        if (this.filters.customer) {
            const term = this.filters.customer.toLowerCase();
            filtered = filtered.filter(sale =>
                sale.customerName?.toLowerCase().includes(term) ||
                sale.customerPhone?.includes(term) ||
                sale.customerEmail?.toLowerCase().includes(term)
            );
        }

        // Filtro por valor
        if (this.filters.minValue > 0) {
            filtered = filtered.filter(sale => sale.total >= this.filters.minValue);
        }

        if (this.filters.maxValue > 0) {
            filtered = filtered.filter(sale => sale.total <= this.filters.maxValue);
        }

        // Filtro por termo de busca (produtos/serviços)
        if (this.filters.searchTerm) {
            const term = this.filters.searchTerm.toLowerCase();
            filtered = filtered.filter(sale => {
                // Busca nos produtos
                if (sale.products?.some(p => p.name?.toLowerCase().includes(term))) {
                    return true;
                }
                // Busca nos serviços
                if (sale.services?.some(s => s.name?.toLowerCase().includes(term))) {
                    return true;
                }
                return false;
            });
        }

        this.filteredSales = filtered;
        this.calculateStats();
    }

    /**
  * Calcula estatísticas
  */
    private calculateStats(): void {
        // Recebe as estatísticas do serviço
        const baseStats = this.salesAnalysisService.calculateStats(this.filteredSales);

        // Complementa com conversions
        this.stats = {
            ...baseStats,
            conversions: Math.floor(this.filteredSales.length * 0.15) // 15% de conversão estimada
        };
    }
    /**
     * Seleciona/deseleciona uma venda
     */
    public toggleSaleSelection(saleId: string): void {
        if (this.selectedSales.has(saleId)) {
            this.selectedSales.delete(saleId);
        } else {
            this.selectedSales.add(saleId);
        }
    }

    /**
     * Seleciona/deseleciona todas as vendas
     */
    public toggleSelectAll(): void {
        if (this.selectedSales.size === this.filteredSales.length) {
            this.selectedSales.clear();
        } else {
            this.filteredSales.forEach(sale => {
                if (sale.id) {
                    this.selectedSales.add(sale.id);
                }
            });
        }
    }

    /**
  * Converte vendas selecionadas em leads - MODIFICADO
  */
    public async convertToLeads(): Promise<void> {
        if (this.selectedSales.size === 0) {
            this.alertService.alert('Selecione pelo menos uma venda', 'warning');
            return;
        }

        const confirm = await this.alertService.confirm(
            `Deseja converter ${this.selectedSales.size} venda(s) em lead(s)?
        
        ✅ Será criado um lead para cada venda
        📅 Uma atividade de recompra será criada automaticamente
        💬 Você poderá enviar WhatsApp com template especial`,
            'question'
        );

        if (!confirm) return;

        this.processing = true;

        try {
            const selectedSalesArray = Array.from(this.selectedSales);
            const results = await this.salesAnalysisService.convertSalesToLeads(
                this.sales.filter(s => selectedSalesArray.includes(s.id))
            );

            // Mensagem melhorada mostrando as atividades
            this.alertService.alert(
                `✅ Sucesso!
            ${results.created} lead(s) criado(s)
            📅 ${results.activitiesCreated} atividade(s) de recompra agendada(s)
            
            As atividades já estão disponíveis para envio de WhatsApp!`,
                'success'
            );

            // Pergunta se quer ir para as atividades
            if (results.activitiesCreated > 0) {
                const goToActivities = await this.alertService.confirm(
                    'Deseja ir para a tela de Atividades para enviar as mensagens de recompra?',
                    'question'
                );

                if (goToActivities) {
                    this.router.navigate(['/crm/atividades']);
                }
            }

            // Limpa seleção e recarrega
            this.selectedSales.clear();
            this.loadSales();

        } catch (error) {
            console.error('Erro ao converter vendas:', error);
            this.alertService.alert('Erro ao converter vendas em leads', 'error');
        } finally {
            this.processing = false;
        }
    }

    /**
     * Visualiza detalhes de uma venda
     */
    public viewSaleDetails(sale: any): void {
        sale.showDetails = !sale.showDetails;
    }

    /**
  * Formata valor monetário
  */
    public formatCurrency(value: number): string {
        // Verifica se tem permissão para ver valores
        if (!this.permissions.canViewValue) {
            return '***';
        }

        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    }

    /**
     * Formata data
     */
    public formatDate(date: any): string {
        if (!date) return '-';
        return DateTime.formatDate(date).date;
    }

    /**
     * Obtém ícone da origem
     */
    public getSourceIcon(source: string): string {
        const icons = {
            'pdv': 'cart-outline',
            'crm': 'people-outline',
            'orders': 'clipboard-outline',
            'Website': 'globe-outline'
        };
        return icons[source] || 'pricetag-outline';
    }

    /**
     * Obtém cor do status
     */
    public getStatusColor(status: string): string {
        const colors = {
            'CONCLUDED': 'success',
            'PENDING': 'warning',
            'CANCELED': 'danger'
        };
        return colors[status] || 'medium';
    }

    // ===== FUNÇÕES ADICIONADAS PARA OS GRÁFICOS E MELHORIAS =====

    /**
     * ADICIONADO: Define filtro rápido de período
     */
    public setQuickFilter(filter: string): void {
        this.quickFilter = filter;
        const today = new Date();

        switch (filter) {
            case 'today':
                // Hoje
                this.filters.dateFrom = this.formatDateForInput(today);
                this.filters.dateTo = this.formatDateForInput(today);
                break;

            case 'week':
                // Esta semana (domingo a sábado)
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay());
                this.filters.dateFrom = this.formatDateForInput(startOfWeek);
                this.filters.dateTo = this.formatDateForInput(today);
                break;

            case 'month':
                // Este mês
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                this.filters.dateFrom = this.formatDateForInput(startOfMonth);
                this.filters.dateTo = this.formatDateForInput(today);
                break;

            case 'custom':
                // Não fazer nada, deixar o usuário escolher
                break;
        }

        // Recarregar dados se não for custom
        if (filter !== 'custom') {
            this.loadSales();
        }
    }

    /**
     * ADICIONADO: Expande/colapsa detalhes de uma venda
     */
    public toggleSaleExpansion(saleId: string, event: Event): void {
        event.stopPropagation();
        if (this.expandedSales.has(saleId)) {
            this.expandedSales.delete(saleId);
        } else {
            this.expandedSales.add(saleId);
        }
    }

    /**
     * ADICIONADO: Formata data para input HTML
     */
    private formatDateForInput(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * ADICIONADO: Formata valor sem símbolo de moeda
     */
    public formatValue(value: number): string {
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value || 0);
    }

    /**
     * ADICIONADO: Exporta dados para Excel
     */
    public async exportToExcel(): Promise<void> {
        try {
            if (this.filteredSales.length === 0) {
                this.alertService.alert('Nenhum dado para exportar', 'warning');
                return;
            }
            this.alertService.alert('Exportando dados para Excel...', 'info');

            const exportData = this.filteredSales.map(sale => ({
                'Código': sale.code || sale.id,
                'Data': new Date(sale.date).toLocaleDateString('pt-BR'),
                'Cliente': sale.customerName || 'Cliente não identificado',
                'Valor': sale.total,
                'Status': sale.status
            }));
            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendas');

            const fileName = `analise-vendas-${Date.now()}.xlsx`;
            XLSX.writeFile(workbook, fileName);

            this.alertService.alert('Dados exportados com sucesso!', 'success');

        } catch (error) {
            console.error('Erro ao exportar:', error);
            this.alertService.alert('Erro ao exportar dados', 'error');
        }
    }

    // ===== FUNÇÕES DOS GRÁFICOS =====

    /**
     * ADICIONADO: Atualiza todos os gráficos
     */
    private updateCharts(): void {
        // Destruir gráficos existentes
        this.destroyCharts();

        // Criar novos gráficos
        this.createSalesChart();
        this.createProductsChart();

    }

    /**
     * ADICIONADO: Cria gráfico de vendas por dia
     */
    private createSalesChart(): void {
        const canvas = document.getElementById('salesChart') as HTMLCanvasElement;
        if (!canvas) return;

        // Agrupar vendas por dia
        const salesByDay = new Map();
        this.filteredSales.forEach(sale => {
            const date = new Date(sale.date).toLocaleDateString('pt-BR');
            if (!salesByDay.has(date)) {
                salesByDay.set(date, 0);
            }
            salesByDay.set(date, salesByDay.get(date) + sale.total);
        });

        // Preparar dados
        const labels = Array.from(salesByDay.keys());
        const data = Array.from(salesByDay.values());

        // Meta diária (exemplo: R$ 5.000)
        const dailyGoal = 5000;

        // Criar gráfico
        this.salesChart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Vendas',
                        data: data,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderWidth: 3,
                        pointBackgroundColor: '#667eea',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        tension: 0.4
                    },
                    {
                        label: 'Meta',
                        data: data.map(() => dailyGoal),
                        borderColor: '#f093fb',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        pointRadius: 0,
                        tension: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        },
                        callbacks: {
                            label: (context) => {
                                return `${context.dataset.label}: ${this.formatCurrency(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => this.formatCurrency(value as number)
                        }
                    }
                }
            }
        });
    }

    /**
     * ADICIONADO: Cria gráfico de produtos mais vendidos
     */
    private createProductsChart(): void {
        const canvas = document.getElementById('productsChart') as HTMLCanvasElement;
        if (!canvas || !this.stats.topProducts || this.stats.topProducts.length === 0) return;

        const labels = this.stats.topProducts.slice(0, 5).map(p => p.name);
        const data = this.stats.topProducts.slice(0, 5).map(p => p.total);

        this.productsChart = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#667eea',
                        '#11998e',
                        '#ffa726',
                        '#f093fb',
                        '#4facfe'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = this.formatCurrency(context.parsed);
                                const percentage = ((context.parsed / this.stats.totalValue) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * ADICIONADO: Cria gráfico de origem das vendas
     */
    private createSourceChart(): void {
        const canvas = document.getElementById('sourceChart') as HTMLCanvasElement;
        if (!canvas) return;

        // Agrupar por origem
        const sourceMap = new Map();
        this.filteredSales.forEach(sale => {
            if (!sourceMap.has(sale.source)) {
                sourceMap.set(sale.source, 0);
            }
            sourceMap.set(sale.source, sourceMap.get(sale.source) + sale.total);
        });

        const labels = Array.from(sourceMap.keys());
        const data = Array.from(sourceMap.values());

        // Definir cores por origem
        const backgroundColors = labels.map(label => {
            switch (label.toLowerCase()) {
                case 'pdv': return '#667eea';
                case 'crm': return '#10b981';
                case 'orders': return '#f59e0b';
                default: return '#6b7280';
            }
        });

        this.sourceChart = new Chart(canvas, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = this.formatCurrency(context.parsed);
                                const percentage = ((context.parsed / this.stats.totalValue) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * ADICIONADO: Destrói todos os gráficos
     */
    private destroyCharts(): void {
        if (this.salesChart) {
            this.salesChart.destroy();
            this.salesChart = null;
        }
        if (this.productsChart) {
            this.productsChart.destroy();
            this.productsChart = null;
        }

    }
}