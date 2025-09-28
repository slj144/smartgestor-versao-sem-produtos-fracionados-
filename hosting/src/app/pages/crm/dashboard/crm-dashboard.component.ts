// crm-dashboard.component.ts
// ARQUIVO: src/app/pages/crm/dashboard/crm-dashboard.component.ts
// DASHBOARD COMPLETO: Com clientes potenciais e ações reais

import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Serviços
import { CrmService } from '../crm.service';
import { IToolsService } from '@shared/services/iTools.service';
import { AlertService } from '@shared/services/alert.service';
import { NotificationService } from '@shared/services/notification.service';

// Utilities
import { Utilities } from '@shared/utilities/utilities';
import { DateTime } from '@shared/utilities/dateTime';

// Interfaces
import { ENotificationStatus } from '@shared/interfaces/ISystemNotification';

interface DashboardMetrics {
    // Vendas
    salesToday: { count: number; value: number; growth: number };
    salesWeek: { count: number; value: number; growth: number };
    salesMonth: { count: number; value: number; growth: number };

    // Clientes
    newLeads: { count: number; growth: number };
    hotLeads: { count: number; conversion: number };
    totalCustomers: { count: number; growth: number };

    // Performance
    averageTicket: { value: number; growth: number };
    conversionRate: { value: number; growth: number };
    topProducts: Array<{ name: string; sales: number; value: number; category: string }>;

    // Metas
    monthlyGoal: { target: number; current: number; percentage: number };
    dailyGoal: { target: number; current: number; percentage: number };
}

interface PotentialCustomer {
    id: string;
    name: string;
    email: string;
    phone: string;
    category: 'hot' | 'warm' | 'cold' | 'new';
    score: number;
    totalSpent: number;
    totalPurchases: number;
    daysSinceLastPurchase: number;
    recommendedAction: string;
    lastPurchaseDate?: Date;
    value?: number;
}

interface PendingAction {
    id: string;
    type: 'call' | 'whatsapp' | 'email' | 'follow-up';
    customer: PotentialCustomer;
    priority: 'high' | 'medium' | 'low';
    description: string;
    dueDate: Date;
    createdDate: Date;
}

@Component({
    selector: 'app-crm-dashboard',
    templateUrl: './crm-dashboard.component.html',
    styleUrls: ['./crm-dashboard.component.scss']
})
export class CrmDashboardComponent implements OnInit, OnDestroy {

    private destroy$ = new Subject<void>();

    // Dados
    public metrics: DashboardMetrics = {
        salesToday: { count: 0, value: 0, growth: 0 },
        salesWeek: { count: 0, value: 0, growth: 0 },
        salesMonth: { count: 0, value: 0, growth: 0 },
        newLeads: { count: 0, growth: 0 },
        hotLeads: { count: 0, conversion: 0 },
        totalCustomers: { count: 0, growth: 0 },
        averageTicket: { value: 0, growth: 0 },
        conversionRate: { value: 0, growth: 0 },
        topProducts: [],
        monthlyGoal: { target: 100000, current: 0, percentage: 0 },
        dailyGoal: { target: 3000, current: 0, percentage: 0 }
    };

    // ✅ CLIENTES POTENCIAIS E AÇÕES
    public potentialCustomers: PotentialCustomer[] = [];
    public pendingActions: PendingAction[] = [];
    public allCustomers: any[] = [];

    // Estados
    public loading = true;
    public lastUpdate = new Date();
    public autoRefresh = true;

    // Modais e ações
    public showActionModal = false;
    public actionModalTitle = '';
    public actionModalMessage = '';
    public actionModalType = '';
    public showTemplatesModal = false;
    public selectedCustomer: PotentialCustomer | null = null;

    // Cache para performance
    private dataCache = new Map<string, { data: any; timestamp: number }>();
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

    // Dados de gráficos (sem Chart.js - vamos usar CSS)
    public salesChartData: number[] = [];
    public salesChartLabels: string[] = [];
    public productsChartData: Array<{ name: string, value: number, color: string }> = [];

    constructor(
        private crmService: CrmService,
        private iToolsService: IToolsService,
        private alertService: AlertService,
        private notificationService: NotificationService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        console.log('🚀 CRM Dashboard Enhanced - Iniciando...');

        // Carregar dados iniciais
        this.loadDashboardData();

        // Configurar auto-refresh
        this.setupAutoRefresh();

        // Preparar dados dos gráficos
        this.prepareSalesChartData();
        this.prepareProductsChartData();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * ⚡ CARREGAR DADOS DO DASHBOARD COM CACHE
     */
    private async loadDashboardData(): Promise<void> {
        try {
            this.loading = true;

            // Carregar dados em paralelo para melhor performance
            const [salesData, leadsData, customersData, potentialData] = await Promise.all([
                this.loadSalesMetrics(),
                this.loadLeadsMetrics(),
                this.loadCustomersMetrics(),
                this.loadPotentialCustomers() // ✅ NOVO
            ]);

            // Combinar dados
            this.metrics = {
                ...this.metrics,
                ...salesData,
                ...leadsData,
                ...customersData
            };

            // ✅ PROCESSAR CLIENTES POTENCIAIS
            this.potentialCustomers = potentialData || [];
            this.generatePendingActions();

            // Calcular métricas derivadas
            this.calculateDerivedMetrics();

            // Atualizar gráficos
            this.updateChartData();

            this.lastUpdate = new Date();
            this.loading = false;
            this.cdr.detectChanges();

            console.log('✅ Dashboard carregado:', this.metrics);
            console.log('✅ Clientes potenciais:', this.potentialCustomers.length);

        } catch (error) {
            console.error('❌ Erro ao carregar dashboard:', error);
            this.loading = false;
        }
    }

    /**
     * 📊 CARREGAR MÉTRICAS DE VENDAS - DADOS REAIS
     */
    private async loadSalesMetrics(): Promise<Partial<DashboardMetrics>> {
        const cacheKey = 'sales_metrics';
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            console.log('💰 Carregando métricas de vendas reais...');

            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - 7);

            const monthStart = new Date(today);
            monthStart.setDate(1);

            const lastMonthStart = new Date(today);
            lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
            lastMonthStart.setDate(1);

            const lastMonthEnd = new Date(monthStart);
            lastMonthEnd.setDate(lastMonthEnd.getDate() - 1);

            // Buscar TODAS as vendas para análise completa
            const salesSnapshot = await this.iToolsService.database()
                .collection('CashierSales')
                .where([
                    { field: 'owner', operator: '=', value: Utilities.storeID },
                    { field: 'status', operator: '=', value: 'CONCLUDED' },
                    { field: 'registerDate', operator: '>=', value: lastMonthStart }
                ])
                .orderBy({ registerDate: -1 })
                .get();

            const allSales = salesSnapshot.docs?.map(doc => ({
                id: doc.id,
                ...doc.data(),
                registerDate: new Date(doc.data().registerDate),
                value: this.calculateSingleSaleValue(doc.data())
            })) || [];

            console.log('📊 Total de vendas encontradas:', allSales.length);

            // HOJE
            const todaySales = allSales.filter(s => this.isSameDay(s.registerDate, today));
            const todayValue = todaySales.reduce((sum, sale) => sum + sale.value, 0);

            // ONTEM  
            const yesterdaySales = allSales.filter(s => this.isSameDay(s.registerDate, yesterday));
            const yesterdayValue = yesterdaySales.reduce((sum, sale) => sum + sale.value, 0);

            // SEMANA
            const weekSales = allSales.filter(s => s.registerDate >= weekStart);
            const weekValue = weekSales.reduce((sum, sale) => sum + sale.value, 0);

            // MÊS ATUAL
            const monthSales = allSales.filter(s => s.registerDate >= monthStart);
            const monthValue = monthSales.reduce((sum, sale) => sum + sale.value, 0);

            // MÊS PASSADO (para comparar crescimento)
            const lastMonthSales = allSales.filter(s =>
                s.registerDate >= lastMonthStart && s.registerDate <= lastMonthEnd
            );
            const lastMonthValue = lastMonthSales.reduce((sum, sale) => sum + sale.value, 0);

            // SEMANA PASSADA (para comparar crescimento)
            const lastWeekStart = new Date(weekStart);
            lastWeekStart.setDate(lastWeekStart.getDate() - 7);
            const lastWeekSales = allSales.filter(s =>
                s.registerDate >= lastWeekStart && s.registerDate < weekStart
            );
            const lastWeekValue = lastWeekSales.reduce((sum, sale) => sum + sale.value, 0);

            console.log('💰 Vendas HOJE:', todayValue, '(' + todaySales.length + ' vendas)');
            console.log('💰 Vendas ONTEM:', yesterdayValue, '(' + yesterdaySales.length + ' vendas)');
            console.log('💰 Vendas MÊS:', monthValue, '(' + monthSales.length + ' vendas)');
            console.log('💰 Vendas MÊS PASSADO:', lastMonthValue, '(' + lastMonthSales.length + ' vendas)');

            const result = {
                salesToday: {
                    count: todaySales.length,
                    value: todayValue,
                    growth: this.calculateGrowth(todayValue, yesterdayValue)
                },
                salesWeek: {
                    count: weekSales.length,
                    value: weekValue,
                    growth: this.calculateGrowth(weekValue, lastWeekValue)
                },
                salesMonth: {
                    count: monthSales.length,
                    value: monthValue,
                    growth: this.calculateGrowth(monthValue, lastMonthValue)
                },
                topProducts: this.extractTopProducts(monthSales)
            };

            console.log('✅ Métricas calculadas:', result);

            this.saveToCache(cacheKey, result);
            return result;

        } catch (error) {
            console.error('❌ Erro ao carregar métricas de vendas:', error);
            return {
                salesToday: { count: 0, value: 0, growth: 0 },
                salesWeek: { count: 0, value: 0, growth: 0 },
                salesMonth: { count: 0, value: 0, growth: 0 },
                topProducts: []
            };
        }
    }

    /**
     * ✅ CALCULAR VALOR DE UMA VENDA - CORRIGIDO SEM DIVISÃO POR 100
     */
    private calculateSingleSaleValue(sale: any): number {
        // Prioridade 1: balance.total (valor final da venda)
        if (sale.balance && sale.balance.total) {
            return sale.balance.total; // REMOVIDO: / 100
        }

        // Prioridade 2: paymentMethods (soma dos pagamentos)
        if (sale.paymentMethods && sale.paymentMethods.length > 0) {
            const totalPayments = sale.paymentMethods.reduce((sum, payment) => {
                return sum + (payment.value || 0);
            }, 0);
            return totalPayments; // REMOVIDO: / 100
        }

        // Prioridade 3: produtos (somar salePrice * quantity)
        if (sale.products && sale.products.length > 0) {
            const totalProducts = sale.products.reduce((sum, product) => {
                const price = product.salePrice || product.unitaryPrice || 0;
                const quantity = product.quantity || 1;
                return sum + (price * quantity);
            }, 0);
            return totalProducts; // REMOVIDO: / 100
        }

        // Prioridade 4: campos diretos
        const directValue = sale.total || sale.totalValue || sale.value || sale.amount || 0;
        return directValue; // REMOVIDO: lógica de conversão condicional
    }

    /**
     * 👥 CARREGAR MÉTRICAS DE LEADS - DADOS REAIS
     */
    private async loadLeadsMetrics(): Promise<Partial<DashboardMetrics>> {
        const cacheKey = 'leads_metrics';
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            console.log('👥 Carregando métricas de leads reais...');

            const leadsSnapshot = await this.iToolsService.database()
                .collection('CRMLeads')
                .where([{ field: 'owner', operator: '=', value: Utilities.storeID }])
                .get();

            const leads = leadsSnapshot.docs?.map(doc => ({
                id: doc.id,
                ...doc.data(),
                registerDate: new Date(doc.data().registerDate || Date.now())
            })) || [];

            const today = new Date();
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - 7);

            const lastWeekStart = new Date(weekStart);
            lastWeekStart.setDate(lastWeekStart.getDate() - 7);

            // Leads desta semana
            const newLeads = leads.filter(l => l.registerDate >= weekStart);

            // Leads da semana passada (para calcular crescimento)
            const lastWeekLeads = leads.filter(l =>
                l.registerDate >= lastWeekStart && l.registerDate < weekStart
            );

            // Leads qualificados (hot)
            const hotLeads = leads.filter(l =>
                l.status === 'qualified' || l.status === 'negotiation' || l.score >= 70
            );

            // Leads fechados (convertidos)
            const closedDeals = leads.filter(l => l.status === 'closed');

            const conversionRate = leads.length > 0 ? (closedDeals.length / leads.length) * 100 : 0;

            console.log('👥 Total de leads:', leads.length);
            console.log('👥 Novos esta semana:', newLeads.length);
            console.log('👥 Hot leads:', hotLeads.length);
            console.log('👥 Conversão:', conversionRate.toFixed(1) + '%');

            const result = {
                newLeads: {
                    count: newLeads.length,
                    growth: this.calculateGrowth(newLeads.length, lastWeekLeads.length)
                },
                hotLeads: {
                    count: hotLeads.length,
                    conversion: conversionRate
                },
                conversionRate: {
                    value: conversionRate,
                    growth: 0 // Pode implementar comparação com período anterior
                }
            };

            this.saveToCache(cacheKey, result);
            return result;

        } catch (error) {
            console.error('❌ Erro ao carregar métricas de leads:', error);
            return {
                newLeads: { count: 0, growth: 0 },
                hotLeads: { count: 0, conversion: 0 },
                conversionRate: { value: 0, growth: 0 }
            };
        }
    }

    /**
     * 🏢 CARREGAR MÉTRICAS DE CLIENTES - DADOS REAIS
     */
    private async loadCustomersMetrics(): Promise<Partial<DashboardMetrics>> {
        try {
            console.log('🏢 Carregando métricas de clientes reais...');

            // Contar clientes únicos baseado nas vendas
            const totalCustomers = this.allCustomers.length || this.potentialCustomers.length;

            // Calcular ticket médio baseado nas vendas reais
            const totalSalesValue = this.metrics.salesMonth?.value || 0;
            const totalSalesCount = this.metrics.salesMonth?.count || 1;
            const averageTicket = totalSalesValue / totalSalesCount;

            console.log('🏢 Total clientes únicos:', totalCustomers);
            console.log('🏢 Ticket médio:', averageTicket);

            return {
                totalCustomers: {
                    count: totalCustomers,
                    growth: 0 // Pode implementar comparação com período anterior
                },
                averageTicket: {
                    value: averageTicket,
                    growth: 0 // Pode implementar comparação com período anterior
                }
            };

        } catch (error) {
            console.error('❌ Erro ao carregar métricas de clientes:', error);
            return {
                totalCustomers: { count: 0, growth: 0 },
                averageTicket: { value: 0, growth: 0 }
            };
        }
    }

    /**
     * 📈 PREPARAR DADOS DOS GRÁFICOS - DADOS REAIS
     */
    private async prepareSalesChartData(): Promise<void> {
        try {
            console.log('📈 Preparando dados reais para gráfico...');

            // Buscar vendas dos últimos 7 dias
            const salesData: number[] = [];
            const labels: string[] = [];

            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);

                // Buscar vendas deste dia específico
                const daySnapshot = await this.iToolsService.database()
                    .collection('CRMLeads')
                    .where([
                        { field: 'owner', operator: '=', value: Utilities.storeID },
                        { field: 'status', operator: '=', value: 'closed' },
                        { field: 'registerDate', operator: '>=', value: date },
                        { field: 'registerDate', operator: '<', value: new Date(date.getTime() + 24 * 60 * 60 * 1000) }
                    ])
                    .get();

                const dayValue = daySnapshot.docs?.reduce((sum, doc) => {
                    return sum + this.calculateSingleSaleValue(doc.data());
                }, 0) || 0;

                salesData.push(dayValue);
                labels.push(date.toLocaleDateString('pt-BR', { weekday: 'short' }));
            }

            this.salesChartData = salesData;
            this.salesChartLabels = labels;

            console.log('📈 Dados do gráfico preparados:', salesData);

        } catch (error) {
            console.error('❌ Erro ao preparar dados do gráfico:', error);
            // Fallback com dados simulados se der erro
            this.salesChartData = [0, 0, 0, 0, 0, 0, this.metrics.salesToday.value];
            this.salesChartLabels = this.getLast7DaysLabels();
        }
    }

    /**
     * ✅ CARREGAR CLIENTES POTENCIAIS (FUNCIONALIDADE PRINCIPAL) - CORRIGIDO
     */
    private async loadPotentialCustomers(): Promise<PotentialCustomer[]> {
        const cacheKey = 'potential_customers';
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            console.log('🔍 Buscando clientes potenciais...');

            // Buscar todos os leads concluídos para análise
            const salesSnapshot = await this.iToolsService.database()
                .collection('CRMLeads')
                .where([
                    { field: 'owner', operator: '=', value: Utilities.storeID },
                    { field: 'status', operator: '=', value: 'closed' }
                ])
                .orderBy({ registerDate: -1 })
                .limit(500)
                .get();

            const sales = salesSnapshot.docs?.map(doc => ({
                id: doc.id,
                ...doc.data(),
                registerDate: new Date(doc.data().registerDate)
            })) || [];

            // Processar clientes
            const customerMap = new Map<string, any>();

            sales.forEach(sale => {
                const customer = sale.customerData || {
                    name: sale.name,
                    email: sale.email,
                    phone: sale.phone
                };
                if (!customer || !customer.name || customer.name === 'Cliente PDV') return;

                const key = customer.email || customer.phone || customer.name;
                const saleValue = sale.value || 0;

                if (customerMap.has(key)) {
                    const existing = customerMap.get(key);
                    existing.totalSpent += saleValue;
                    existing.totalPurchases += 1;
                    if (sale.registerDate > existing.lastPurchaseDate) {
                        existing.lastPurchaseDate = sale.registerDate;
                    }
                } else {
                    customerMap.set(key, {
                        id: key,
                        name: customer.name,
                        email: customer.email || '',
                        phone: customer.phone || '',
                        totalSpent: saleValue,
                        totalPurchases: 1,
                        lastPurchaseDate: sale.registerDate,
                        value: saleValue
                    });
                }
            });

            // Converter para array e calcular métricas
            const customers = Array.from(customerMap.values()).map(customer => {
                const daysSinceLastPurchase = Math.floor(
                    (new Date().getTime() - customer.lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24)
                );

                let category: 'hot' | 'warm' | 'cold' | 'new' = 'cold';
                let score = 0;

                // Calcular categoria e score
                if (daysSinceLastPurchase <= 7) {
                    category = 'hot';
                    score = 90;
                } else if (daysSinceLastPurchase <= 30) {
                    category = 'warm';
                    score = 70;
                } else if (daysSinceLastPurchase <= 90) {
                    category = 'cold';
                    score = 40;
                } else {
                    category = 'new';
                    score = 20;
                }

                // Ajustar score baseado no valor gasto
                if (customer.totalSpent > 5000) score += 10;
                else if (customer.totalSpent > 1000) score += 5;

                // Ajustar score baseado na frequência
                if (customer.totalPurchases > 10) score += 10;
                else if (customer.totalPurchases > 5) score += 5;

                return {
                    ...customer,
                    category,
                    score: Math.min(100, score),
                    daysSinceLastPurchase,
                    recommendedAction: this.getRecommendedAction(category, daysSinceLastPurchase, customer.totalSpent)
                };
            });

            // Filtrar e ordenar os melhores
            const potentialCustomers = customers
                .filter(c => c.score >= 50 || c.category === 'hot' || c.category === 'warm')
                .sort((a, b) => b.score - a.score)
                .slice(0, 10);

            this.saveToCache(cacheKey, potentialCustomers);
            console.log('✅ Clientes potenciais carregados:', potentialCustomers.length);

            return potentialCustomers;

        } catch (error) {
            console.error('❌ Erro ao carregar clientes potenciais:', error);
            return [];
        }
    }

    /**
     * ✅ GERAR AÇÕES PENDENTES
     */
    private generatePendingActions(): void {
        this.pendingActions = [];

        this.potentialCustomers.forEach(customer => {
            let actionType: 'call' | 'whatsapp' | 'email' | 'follow-up' = 'whatsapp';
            let priority: 'high' | 'medium' | 'low' = 'medium';
            let description = '';

            // Definir ação baseada na categoria
            switch (customer.category) {
                case 'hot':
                    actionType = 'call';
                    priority = 'high';
                    description = `Cliente quente! Ligar para oferecer produtos premium`;
                    break;
                case 'warm':
                    actionType = 'whatsapp';
                    priority = 'high';
                    description = `Enviar mensagem sobre novidades e promoções`;
                    break;
                case 'cold':
                    actionType = 'whatsapp';
                    priority = 'medium';
                    description = `Reativar cliente com oferta especial`;
                    break;
                default:
                    actionType = 'email';
                    priority = 'low';
                    description = `Follow-up de boas-vindas`;
            }

            this.pendingActions.push({
                id: `action_${customer.id}`,
                type: actionType,
                customer: customer,
                priority: priority,
                description: description,
                dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Amanhã
                createdDate: new Date()
            });
        });

        console.log('✅ Ações pendentes geradas:', this.pendingActions.length);
    }

    /**
     * ✅ OBTER AÇÃO RECOMENDADA
     */
    private getRecommendedAction(category: string, daysSince: number, totalSpent: number): string {
        if (category === 'hot') {
            return '🔥 Ligar hoje! Cliente muito ativo';
        } else if (category === 'warm') {
            return '📱 Enviar WhatsApp com novidades';
        } else if (daysSince > 60) {
            return '🎁 Oferta especial de retorno';
        } else if (totalSpent > 2000) {
            return '💎 Oferecer programa VIP';
        } else {
            return '📞 Follow-up de relacionamento';
        }
    }

    /**
     * 🧮 CALCULAR MÉTRICAS DERIVADAS
     */
    private calculateDerivedMetrics(): void {
        // Calcular progresso das metas
        this.metrics.dailyGoal.current = this.metrics.salesToday.value;
        this.metrics.dailyGoal.percentage = Math.min(
            (this.metrics.dailyGoal.current / this.metrics.dailyGoal.target) * 100,
            100
        );

        this.metrics.monthlyGoal.current = this.metrics.salesMonth.value;
        this.metrics.monthlyGoal.percentage = Math.min(
            (this.metrics.monthlyGoal.current / this.metrics.monthlyGoal.target) * 100,
            100
        );
    }


    private prepareProductsChartData(): void {
        const colors = ['#667eea', '#11998e', '#ffa726', '#f093fb', '#4facfe'];

        this.productsChartData = this.metrics.topProducts.slice(0, 5).map((product, index) => ({
            name: product.name,
            value: product.sales,
            color: colors[index] || '#95a5a6'
        }));
    }

    /**
     * 🔄 ATUALIZAR DADOS DOS GRÁFICOS - DADOS REAIS
     */
    private async updateChartData(): Promise<void> {
        await this.prepareSalesChartData();
        this.prepareProductsChartData();
    }

    /**
     * ⏰ CONFIGURAR AUTO-REFRESH
     */
    private setupAutoRefresh(): void {
        // Refresh a cada 5 minutos
        interval(5 * 60 * 1000)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                if (this.autoRefresh) {
                    this.refreshData();
                }
            });
    }

    /**
     * 🔄 REFRESH MANUAL
     */
    public refreshData(): void {
        this.clearCache();
        this.loadDashboardData();
    }

    /**
     * 🎛️ TOGGLE AUTO-REFRESH
     */
    public toggleAutoRefresh(): void {
        this.autoRefresh = !this.autoRefresh;
        this.notificationService.create({
            title: `Auto-refresh ${this.autoRefresh ? 'ativado' : 'desativado'}`,
            description: this.autoRefresh ? 'Dashboard será atualizado automaticamente' : 'Atualize manualmente quando necessário',
            status: ENotificationStatus.info
        });
    }

    // ============ AÇÕES DOS CLIENTES POTENCIAIS ============

    /**
     * ✅ ENVIAR WHATSAPP PARA CLIENTE
     */
    public sendWhatsApp(customer: PotentialCustomer): void {
        console.log('📱 Enviando WhatsApp para:', customer.name);
        this.selectedCustomer = customer;
        this.showTemplatesModal = true;
    }

    /**
     * ✅ LIGAR PARA CLIENTE
     */
    public callCustomer(customer: PotentialCustomer): void {
        console.log('📞 Ligando para:', customer.name);

        // Registrar ação no CRM
        this.registerCall(customer);

        // Mostrar informações para ligação
        this.actionModalTitle = 'Ligar para Cliente';
        this.actionModalMessage = `
            👤 Cliente: ${customer.name}
            📞 Telefone: ${customer.phone}
            💰 Total gasto: ${this.formatCurrency(customer.totalSpent)}
            🛍️ Compras: ${customer.totalPurchases}
            📅 Última compra: ${customer.daysSinceLastPurchase} dias atrás
            
            💡 Sugestão: ${customer.recommendedAction}
        `;
        this.actionModalType = 'call';
        this.showActionModal = true;
    }

    /**
     * ✅ ENVIAR EMAIL PARA CLIENTE
     */
    public sendEmail(customer: PotentialCustomer): void {
        console.log('📧 Enviando email para:', customer.name);

        this.actionModalTitle = 'Enviar Email';
        this.actionModalMessage = `Preparar email para ${customer.name} (${customer.email})`;
        this.actionModalType = 'email';
        this.selectedCustomer = customer;
        this.showActionModal = true;
    }

    /**
     * ✅ TEMPLATE SELECIONADO - ABRIR WHATSAPP
     */
    public onTemplateSelected(template: any): void {
        if (!this.selectedCustomer) return;

        const customer = this.selectedCustomer;
        const phone = customer.phone.replace(/\D/g, ''); // Remover formatação

        // Personalizar mensagem
        let message = template.message || template.content || `Olá ${customer.name}!`;
        message = message.replace(/\{nome\}/g, customer.name);
        message = message.replace(/\{valor\}/g, this.formatCurrency(customer.totalSpent));

        // Codificar para URL
        const encodedMessage = encodeURIComponent(message);

        // Abrir WhatsApp
        const whatsappUrl = `https://wa.me/55${phone}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');

        // Registrar ação
        this.registerWhatsAppSent(customer, message);

        this.showTemplatesModal = false;
        this.selectedCustomer = null;

        this.notificationService.create({
            title: 'WhatsApp Enviado!',
            description: `Mensagem enviada para ${customer.name}`,
            status: ENotificationStatus.success
        });
    }

    // ============ IMPLEMENTAÇÃO DOS BOTÕES DE AÇÕES RÁPIDAS ============

    public openNewLeadModal(): void {
        // Navegar para página de criação de lead
        const projectId = Utilities.currentLoginData?.projectId || 'default';
        window.location.href = `/${projectId}/crm/leads`;

        this.notificationService.create({
            title: 'Redirecionando...',
            description: 'Abrindo página de criação de leads',
            status: ENotificationStatus.info
        });
    }

    public openCallModal(): void {
        if (this.potentialCustomers.length === 0) {
            this.alertService.alert('Nenhum cliente potencial encontrado para ligar', 'warning');
            return;
        }

        // Pegar o cliente com maior prioridade para ligação
        const hotCustomers = this.potentialCustomers.filter(c => c.category === 'hot');
        const targetCustomer = hotCustomers.length > 0 ? hotCustomers[0] : this.potentialCustomers[0];

        this.callCustomer(targetCustomer);
    }

    public openWhatsAppModal(): void {
        if (this.potentialCustomers.length === 0) {
            this.alertService.alert('Nenhum cliente potencial encontrado para WhatsApp', 'warning');
            return;
        }

        // Pegar o cliente com maior prioridade para WhatsApp
        const warmCustomers = this.potentialCustomers.filter(c => c.category === 'warm' || c.category === 'hot');
        const targetCustomer = warmCustomers.length > 0 ? warmCustomers[0] : this.potentialCustomers[0];

        this.sendWhatsApp(targetCustomer);
    }

    public openReportsModal(): void {
        // Gerar relatório em tempo real baseado nos dados do dashboard
        this.generateQuickReport();
    }

    /**
     * ✅ GERAR RELATÓRIO RÁPIDO
     */
    private generateQuickReport(): void {
        const report = {
            periodo: 'Últimos 30 dias',
            vendas: {
                total: this.formatCurrency(this.metrics.salesMonth.value),
                quantidade: this.metrics.salesMonth.count,
                ticketMedio: this.formatCurrency(this.metrics.salesMonth.value / Math.max(this.metrics.salesMonth.count, 1)),
                crescimento: this.formatPercentage(this.metrics.salesMonth.growth)
            },
            clientes: {
                total: this.metrics.totalCustomers.count,
                novos: this.metrics.newLeads.count,
                potenciais: this.potentialCustomers.length,
                conversao: this.formatPercentage(this.metrics.conversionRate.value)
            },
            produtos: this.metrics.topProducts.slice(0, 3).map(p => ({
                nome: p.name,
                vendas: p.sales,
                valor: this.formatCurrency(p.value)
            })),
            acoes: {
                pendentes: this.pendingActions.length,
                prioritarias: this.pendingActions.filter(a => a.priority === 'high').length
            }
        };

        this.actionModalTitle = '📊 Relatório Rápido do CRM';
        this.actionModalMessage = this.formatReportMessage(report);
        this.actionModalType = 'report';
        this.showActionModal = true;
    }

    /**
     * ✅ FORMATAR MENSAGEM DO RELATÓRIO
     */
    private formatReportMessage(report: any): string {
        return `
📈 VENDAS (${report.periodo}):
• Total: ${report.vendas.total} (${report.vendas.quantidade} vendas)
• Ticket Médio: ${report.vendas.ticketMedio}
• Crescimento: ${report.vendas.crescimento}

👥 CLIENTES:
• Total: ${report.clientes.total}
• Novos Leads: ${report.clientes.novos}
• Potenciais: ${report.clientes.potenciais}
• Taxa Conversão: ${report.clientes.conversao}

🏆 TOP PRODUTOS:
${report.produtos.map(p => `• ${p.nome}: ${p.vendas} vendas (${p.valor})`).join('\n')}

⚡ AÇÕES CRM:
• Pendentes: ${report.acoes.pendentes}
• Prioritárias: ${report.acoes.prioritarias}

✨ Sistema 100% automatizado - Dados em tempo real!
        `.trim();
    }

    public closeActionModal(): void {
        this.showActionModal = false;
        this.actionModalTitle = '';
        this.actionModalMessage = '';
        this.actionModalType = '';
        this.selectedCustomer = null;
    }

    public confirmAction(): void {
        switch (this.actionModalType) {
            case 'report':
                this.downloadReport();
                break;
            case 'call':
                // Ação já executada no callCustomer
                break;
            case 'email':
                this.sendEmailAction();
                break;
        }
        this.closeActionModal();
    }

    /**
     * ✅ DOWNLOAD DO RELATÓRIO EM EXCEL
     */
    private downloadReport(): void {
        // Dados para o Excel
        const reportData = this.generateExcelData();

        // Criar planilha Excel
        const worksheet = this.createExcelWorksheet(reportData);

        // Download do arquivo
        this.downloadExcelFile(worksheet);

        this.notificationService.create({
            title: 'Relatório Excel Baixado!',
            description: 'Relatório do CRM foi salvo em formato Excel',
            status: ENotificationStatus.success
        });
    }

    /**
     * ✅ GERAR DADOS PARA EXCEL
     */
    private generateExcelData(): any {
        const hoje = new Date();
        const mesPassado = new Date();
        mesPassado.setMonth(mesPassado.getMonth() - 1);

        return {
            resumo: [
                ['📊 RELATÓRIO CRM - DASHBOARD', ''],
                ['Data:', hoje.toLocaleDateString('pt-BR')],
                ['Período:', 'Últimos 30 dias'],
                ['', ''],
                ['VENDAS', ''],
                ['Total em Vendas:', this.formatCurrency(this.metrics.salesMonth.value)],
                ['Quantidade de Vendas:', this.metrics.salesMonth.count],
                ['Ticket Médio:', this.formatCurrency(this.metrics.salesMonth.value / Math.max(this.metrics.salesMonth.count, 1))],
                ['Crescimento:', this.formatPercentage(this.metrics.salesMonth.growth)],
                ['', ''],
                ['CLIENTES', ''],
                ['Total de Clientes:', this.metrics.totalCustomers.count],
                ['Novos Leads:', this.metrics.newLeads.count],
                ['Clientes Potenciais:', this.potentialCustomers.length],
                ['Taxa de Conversão:', this.formatPercentage(this.metrics.conversionRate.value)],
                ['', ''],
                ['METAS', ''],
                ['Meta Diária:', this.formatCurrency(this.metrics.dailyGoal.target)],
                ['Atingido Hoje:', this.formatCurrency(this.metrics.dailyGoal.current)],
                ['% Meta Diária:', this.formatPercentage(this.metrics.dailyGoal.percentage)],
                ['Meta Mensal:', this.formatCurrency(this.metrics.monthlyGoal.target)],
                ['Atingido no Mês:', this.formatCurrency(this.metrics.monthlyGoal.current)],
                ['% Meta Mensal:', this.formatPercentage(this.metrics.monthlyGoal.percentage)]
            ],
            produtos: [
                ['RANKING', 'PRODUTO', 'VENDAS', 'VALOR TOTAL', 'CATEGORIA'],
                ...this.metrics.topProducts.map((produto, index) => [
                    `#${index + 1}`,
                    produto.name,
                    produto.sales,
                    this.formatCurrency(produto.value),
                    produto.category
                ])
            ],
            clientesPotenciais: [
                ['CLIENTE', 'CATEGORIA', 'SCORE', 'TOTAL GASTO', 'COMPRAS', 'ÚLTIMA COMPRA', 'AÇÃO RECOMENDADA'],
                ...this.potentialCustomers.map(cliente => [
                    cliente.name,
                    cliente.category.toUpperCase(),
                    cliente.score,
                    this.formatCurrency(cliente.totalSpent),
                    cliente.totalPurchases,
                    `${cliente.daysSinceLastPurchase} dias atrás`,
                    cliente.recommendedAction
                ])
            ],
            acoesPendentes: [
                ['CLIENTE', 'TIPO', 'PRIORIDADE', 'DESCRIÇÃO', 'TELEFONE'],
                ...this.pendingActions.map(acao => [
                    acao.customer.name,
                    acao.type.toUpperCase(),
                    acao.priority.toUpperCase(),
                    acao.description,
                    acao.customer.phone
                ])
            ]
        };
    }

    /**
     * ✅ CRIAR PLANILHA EXCEL (CSV COMPATÍVEL)
     */
    private createExcelWorksheet(data: any): string {
        let csvContent = '';

        // Aba Resumo
        csvContent += '=== RESUMO GERAL ===\n';
        data.resumo.forEach(linha => {
            csvContent += linha.join(',') + '\n';
        });

        csvContent += '\n\n=== TOP PRODUTOS ===\n';
        data.produtos.forEach(linha => {
            csvContent += linha.join(',') + '\n';
        });

        csvContent += '\n\n=== CLIENTES POTENCIAIS ===\n';
        data.clientesPotenciais.forEach(linha => {
            csvContent += linha.join(',') + '\n';
        });

        csvContent += '\n\n=== AÇÕES PENDENTES ===\n';
        data.acoesPendentes.forEach(linha => {
            csvContent += linha.join(',') + '\n';
        });

        return csvContent;
    }

    /**
     * ✅ DOWNLOAD ARQUIVO EXCEL
     */
    private downloadExcelFile(csvContent: string): void {
        // Criar BOM para UTF-8 (para acentos funcionarem no Excel)
        const BOM = '\uFEFF';
        const csvContentWithBOM = BOM + csvContent;

        // Criar blob como CSV (Excel abre automaticamente)
        const blob = new Blob([csvContentWithBOM], {
            type: 'text/csv;charset=utf-8;'
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Nome do arquivo com data
        const dataAtual = new Date().toISOString().split('T')[0];
        link.download = `relatorio-crm-${dataAtual}.csv`;

        // Download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    // ============ MÉTODOS DE REGISTRO ============

    private async registerCall(customer: PotentialCustomer): Promise<void> {
        try {
            // Registrar no CRM como atividade
            const activityData = {
                title: `Ligação para ${customer.name}`,
                type: 'call' as const,
                leadId: customer.id,
                leadName: customer.name,
                leadEmail: customer.email,
                leadPhone: customer.phone,
                description: `Ligação realizada para cliente potencial\nMotivo: ${customer.recommendedAction}`,
                scheduledDate: new Date(),
                priority: 'high' as const,
                status: 'completed' as const
            };

            await this.crmService.createActivity(activityData);
            console.log('✅ Ligação registrada no CRM');

        } catch (error) {
            console.error('❌ Erro ao registrar ligação:', error);
        }
    }

    private async registerWhatsAppSent(customer: PotentialCustomer, message: string): Promise<void> {
        try {
            // Registrar no CRM como atividade
            const activityData = {
                title: `WhatsApp para ${customer.name}`,
                type: 'whatsapp' as const,
                leadId: customer.id,
                leadName: customer.name,
                leadEmail: customer.email,
                leadPhone: customer.phone,
                description: `WhatsApp enviado para cliente potencial\n\nMensagem:\n${message}`,
                scheduledDate: new Date(),
                priority: 'medium' as const,
                status: 'completed' as const
            };

            await this.crmService.createActivity(activityData);
            console.log('✅ WhatsApp registrado no CRM');

        } catch (error) {
            console.error('❌ Erro ao registrar WhatsApp:', error);
        }
    }

    private sendEmailAction(): void {
        if (this.selectedCustomer) {
            const mailto = `mailto:${this.selectedCustomer.email}?subject=Contato da ${Utilities.storeID}&body=Olá ${this.selectedCustomer.name}!`;
            window.location.href = mailto;
        }
    }

    // ============ MÉTODOS AUXILIARES - DADOS REAIS ============

    private calculateSalesValue(sales: any[]): number {
        return sales.reduce((total, sale) => {
            return total + this.calculateSingleSaleValue(sale);
        }, 0);
    }

    /**
     * EXTRAIR TOP PRODUTOS - CORRIGIDO SEM DIVISÃO POR 100
     */
    private extractTopProducts(sales: any[]): any[] {
        const productMap = new Map();

        sales.forEach(sale => {
            if (sale.products && sale.products.length > 0) {
                sale.products.forEach(product => {
                    const key = product.name || 'Produto sem nome';
                    if (productMap.has(key)) {
                        const existing = productMap.get(key);
                        existing.sales += product.quantity || 1;
                        existing.value += product.salePrice || 0; // REMOVIDO: / 100
                    } else {
                        productMap.set(key, {
                            name: key,
                            sales: product.quantity || 1,
                            value: product.salePrice || 0, // REMOVIDO: / 100
                            category: product.category?.name || 'Sem categoria'
                        });
                    }
                });
            }
        });

        return Array.from(productMap.values())
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 10);
    }

    private calculateGrowth(current: number, previous: number): number {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100 * 100) / 100;
    }

    private isSameDay(date1: Date, date2: Date): boolean {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    }

    private getLast7DaysLabels(): string[] {
        const labels = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('pt-BR', { weekday: 'short' }));
        }
        return labels;
    }

    // ============ CACHE METHODS ============

    private getFromCache(key: string): any {
        const cached = this.dataCache.get(key);
        if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
            return cached.data;
        }
        return null;
    }

    private saveToCache(key: string, data: any): void {
        this.dataCache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    private clearCache(): void {
        this.dataCache.clear();
    }

    // ============ FORMATTERS ============

    public formatCurrency(value: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    }

    public formatPercentage(value: number): string {
        return `${value.toFixed(1)}%`;
    }

    public getGrowthClass(growth: number): string {
        if (growth > 0) return 'text-success';
        if (growth < 0) return 'text-danger';
        return 'text-muted';
    }

    public getGrowthIcon(growth: number): string {
        if (growth > 0) return 'trending-up';
        if (growth < 0) return 'trending-down';
        return 'minus';
    }

    public getCategoryClass(category: string): string {
        switch (category) {
            case 'hot': return 'category-hot';
            case 'warm': return 'category-warm';
            case 'cold': return 'category-cold';
            case 'new': return 'category-new';
            default: return '';
        }
    }

    public getCategoryIcon(category: string): string {
        switch (category) {
            case 'hot': return '🔥';
            case 'warm': return '🌟';
            case 'cold': return '❄️';
            case 'new': return '✨';
            default: return '👤';
        }
    }

    // ============ MÉTODOS DOS GRÁFICOS CSS ============

    public getSalesChartBarHeight(value: number): number {
        const maxValue = Math.max(...this.salesChartData);
        return maxValue > 0 ? (value / maxValue) * 100 : 0;
    }

    public getProductChartPercentage(value: number): number {
        const total = this.productsChartData.reduce((sum, item) => sum + item.value, 0);
        return total > 0 ? (value / total) * 100 : 0;
    }
}