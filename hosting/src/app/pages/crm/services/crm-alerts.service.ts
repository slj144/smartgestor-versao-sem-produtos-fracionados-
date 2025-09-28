// Arquivo: crm-alerts.service.ts
// Localização: src/app/pages/crm/services/crm-alerts.service.ts
// Serviço: Sistema de Alertas Automáticos do CRM

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { iTools } from '@itools/index';
import { ENotificationStatus } from '@shared/interfaces/ISystemNotification';

// Serviços
import { IToolsService } from '@shared/services/iTools.service';
import { NotificationService } from '@shared/services/notification.service';

// Utilities
import { Utilities } from '@shared/utilities/utilities';

// Interface para alertas
export interface ICRMAlert {
    id: string;
    type: 'danger' | 'warning' | 'info' | 'success';
    priority: 'high' | 'medium' | 'low';
    title: string;
    message: string;
    customerId?: string;
    customerName?: string;
    actionRequired: string;
    createdAt: Date;
    read: boolean;
    dismissed: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class CrmAlertsService {

    // Alertas ativos
    private alertsSubject = new BehaviorSubject<ICRMAlert[]>([]);
    public alerts$ = this.alertsSubject.asObservable();

    // Contadores
    private alertCountSubject = new BehaviorSubject<number>(0);
    public alertCount$ = this.alertCountSubject.asObservable();

    // Cache de alertas já criados (evita duplicatas)
    private alertCache = new Set<string>();

    constructor(
        private iToolsService: IToolsService,
        private notificationService: NotificationService
    ) {
        // Iniciar monitoramento
        this.startMonitoring();
    }

    // Iniciar monitoramento automático
    private startMonitoring(): void {
        // Executar verificação inicial
        this.checkForAlerts();

        // Executar a cada 30 minutos
        setInterval(() => {
            this.checkForAlerts();
        }, 30 * 60 * 1000); // 30 minutos
    }

    // Verificar e gerar alertas
    public async checkForAlerts(): Promise<void> {
        console.log('🔔 Verificando alertas automáticos...');

        try {
            const alerts: ICRMAlert[] = [];

            // 1. Buscar vendas recentes
            const salesAlerts = await this.checkRecentSales();
            alerts.push(...salesAlerts);

            // 2. Verificar clientes inativos
            const inactiveAlerts = await this.checkInactiveCustomers();
            alerts.push(...inactiveAlerts);

            // 3. Verificar aniversariantes
            const birthdayAlerts = await this.checkBirthdays();
            alerts.push(...birthdayAlerts);

            // 4. Verificar metas e oportunidades
            const opportunityAlerts = await this.checkOpportunities();
            alerts.push(...opportunityAlerts);

            // Filtrar alertas não duplicados
            const uniqueAlerts = alerts.filter(alert => {
                const key = `${alert.type}-${alert.customerId}-${alert.title}`;
                if (this.alertCache.has(key)) {
                    return false;
                }
                this.alertCache.add(key);
                return true;
            });

            // Ordenar por prioridade
            uniqueAlerts.sort((a, b) => {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            });

            // Atualizar alertas
            this.alertsSubject.next(uniqueAlerts);
            this.alertCountSubject.next(uniqueAlerts.filter(a => !a.read).length);

            console.log(`✅ ${uniqueAlerts.length} alertas gerados`);

            // Notificar se há alertas críticos
            const criticalAlerts = uniqueAlerts.filter(a => a.priority === 'high' && !a.read);
            if (criticalAlerts.length > 0) {
                this.notificationService.create({
                    title: 'CRM - Alertas Importantes',
                    description: `Você tem ${criticalAlerts.length} alertas de alta prioridade!`,
                    status: ENotificationStatus.warning  // ✅ CERTO
                });
            }

        } catch (error) {
            console.error('❌ Erro ao verificar alertas:', error);
        }
    }

    // 1. Verificar vendas recentes (clientes novos)
    private async checkRecentSales(): Promise<ICRMAlert[]> {
        const alerts: ICRMAlert[] = [];

        try {
            // Buscar vendas dos últimos 7 dias
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const salesSnapshot = await this.iToolsService.database()
                .collection('CashierSales')
                .where([
                    { field: 'owner', operator: '=', value: Utilities.storeID },
                    { field: 'registerDate', operator: '>=', value: sevenDaysAgo }
                ])
                .get();

            // Agrupar por cliente
            const customerSales = new Map();

            salesSnapshot.docs.forEach(doc => {
                const sale = doc.data();
                const customer = sale.customer || {};
                const customerId = customer._id || customer.id || `temp_${doc.id}`;

                if (!customerSales.has(customerId)) {
                    customerSales.set(customerId, {
                        customer: customer,
                        salesCount: 0,
                        totalValue: 0,
                        firstSale: sale.registerDate
                    });
                }

                const data = customerSales.get(customerId);
                data.salesCount++;
                data.totalValue += sale.total || sale.totalValue || 0;
            });

            // Gerar alertas para clientes novos
            customerSales.forEach((data, customerId) => {
                if (data.salesCount === 1) {
                    // Cliente novo!
                    alerts.push({
                        id: `new-customer-${customerId}`,
                        type: 'success',
                        priority: 'high',
                        title: '🎉 Novo Cliente!',
                        message: `${data.customer.name || 'Cliente'} fez sua primeira compra (${this.formatCurrency(data.totalValue)})`,
                        customerId: customerId,
                        customerName: data.customer.name,
                        actionRequired: 'Enviar mensagem de boas-vindas',
                        createdAt: new Date(),
                        read: false,
                        dismissed: false
                    });
                } else if (data.salesCount > 3) {
                    // Cliente comprando muito!
                    alerts.push({
                        id: `frequent-buyer-${customerId}`,
                        type: 'info',
                        priority: 'medium',
                        title: '🔥 Cliente Frequente',
                        message: `${data.customer.name || 'Cliente'} fez ${data.salesCount} compras esta semana!`,
                        customerId: customerId,
                        customerName: data.customer.name,
                        actionRequired: 'Oferecer benefício VIP',
                        createdAt: new Date(),
                        read: false,
                        dismissed: false
                    });
                }
            });

        } catch (error) {
            console.error('Erro ao verificar vendas recentes:', error);
        }

        return alerts;
    }

    // 2. Verificar clientes inativos
    private async checkInactiveCustomers(): Promise<ICRMAlert[]> {
        const alerts: ICRMAlert[] = [];

        try {
            // Buscar todas as vendas para identificar clientes inativos
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const sixtyDaysAgo = new Date();
            sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

            // Buscar clientes que compraram entre 30-60 dias atrás
            const salesSnapshot = await this.iToolsService.database()
                .collection('CashierSales')
                .where([
                    { field: 'owner', operator: '=', value: Utilities.storeID },
                    { field: 'registerDate', operator: '<=', value: thirtyDaysAgo },
                    { field: 'registerDate', operator: '>=', value: sixtyDaysAgo }
                ])
                .get();

            // Agrupar clientes únicos
            const inactiveCustomers = new Map();

            salesSnapshot.docs.forEach(doc => {
                const sale = doc.data();
                const customer = sale.customer || {};
                const customerId = customer._id || customer.id;

                if (customerId && customer.name) {
                    if (!inactiveCustomers.has(customerId)) {
                        inactiveCustomers.set(customerId, {
                            customer: customer,
                            lastPurchase: sale.registerDate,
                            totalSpent: 0,
                            purchaseCount: 0
                        });
                    }

                    const data = inactiveCustomers.get(customerId);
                    data.totalSpent += sale.total || 0;
                    data.purchaseCount++;
                }
            });

            // Gerar alertas
            inactiveCustomers.forEach((data, customerId) => {
                const daysSinceLastPurchase = Math.floor(
                    (new Date().getTime() - new Date(data.lastPurchase).getTime()) / (1000 * 60 * 60 * 24)
                );

                if (daysSinceLastPurchase > 30 && daysSinceLastPurchase <= 45) {
                    alerts.push({
                        id: `inactive-warning-${customerId}`,
                        type: 'warning',
                        priority: 'medium',
                        title: '⚠️ Cliente Sumindo',
                        message: `${data.customer.name} não compra há ${daysSinceLastPurchase} dias`,
                        customerId: customerId,
                        customerName: data.customer.name,
                        actionRequired: 'Fazer contato de reativação',
                        createdAt: new Date(),
                        read: false,
                        dismissed: false
                    });
                } else if (daysSinceLastPurchase > 45) {
                    alerts.push({
                        id: `inactive-critical-${customerId}`,
                        type: 'danger',
                        priority: 'high',
                        title: '🚨 Cliente Inativo',
                        message: `${data.customer.name} não compra há ${daysSinceLastPurchase} dias! (Gastou ${this.formatCurrency(data.totalSpent)})`,
                        customerId: customerId,
                        customerName: data.customer.name,
                        actionRequired: 'Ação urgente de reativação',
                        createdAt: new Date(),
                        read: false,
                        dismissed: false
                    });
                }
            });

        } catch (error) {
            console.error('Erro ao verificar clientes inativos:', error);
        }

        return alerts;
    }


    // 3. Verificar aniversariantes
    private async checkBirthdays(): Promise<ICRMAlert[]> {
        const alerts: ICRMAlert[] = [];

        try {
            await this.iToolsService.ready();
            const today = new Date();
            const customersSnapshot = await this.iToolsService.database()
                .collection('RegistersCustomers')
                .where([
                    { field: 'owner', operator: '=', value: Utilities.storeID }
                ])
                .get();

            let weekBirthdays = 0;

            customersSnapshot.docs.forEach(doc => {
                const data = doc.data();

                const birthField = data.birthDate ||
                    data.dateOfBirth ||
                    data.dataNascimento ||
                    data.nascimento ||
                    data.birthday;

                if (!birthField) return;

                const birthday = new Date(birthField);
                if (isNaN(birthday.getTime())) return;

                const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
                const nextYearBirthday = new Date(today.getFullYear() + 1, birthday.getMonth(), birthday.getDate());
                const nextBirthday = thisYearBirthday >= today ? thisYearBirthday : nextYearBirthday;
                const daysUntil = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                if (daysUntil >= 0 && daysUntil <= 7) {
                    weekBirthdays++;
                }


                const phone = data.phone || data.cellphone || data.telefone || data.whatsapp || data.celular || data.mobile || '';

                if (daysUntil === 0) {
                    alerts.push({
                        id: `birthday-today-${doc.id}`,
                        type: 'success',
                        priority: 'high',
                        title: '🎂 Aniversariante do Dia!',
                        message: `${data.name || 'Cliente'} está fazendo aniversário HOJE! Envie uma mensagem especial.`,
                        customerId: doc.id,
                        customerName: data.name,
                        actionRequired: 'Enviar parabéns com oferta especial',
                        createdAt: new Date(),
                        read: false,
                        dismissed: false
                    });
                } else if (daysUntil === 1) {
                    alerts.push({
                        id: `birthday-tomorrow-${doc.id}`,
                        type: 'info',
                        priority: 'medium',
                        title: '🎉 Aniversário Amanhã',
                        message: `${data.name || 'Cliente'} faz aniversário amanhã. Prepare uma surpresa!`,
                        customerId: doc.id,
                        customerName: data.name,
                        actionRequired: 'Preparar mensagem de aniversário',
                        createdAt: new Date(),
                        read: false,
                        dismissed: false
                    });
                }
            });

            if (weekBirthdays > 0) {
                alerts.push({
                    id: `birthdays-week-${today.getTime()}`,
                    type: 'info',
                    priority: 'low',
                    title: '📅 Aniversariantes da Semana',
                    message: `${weekBirthdays} clientes fazem aniversário esta semana. Prepare as felicitações!`,
                    actionRequired: 'Ver lista completa',
                    createdAt: new Date(),
                    read: false,
                    dismissed: false
                });
            }

        } catch (error) {
            console.error('Erro ao verificar aniversariantes:', error);
        }

        return alerts;
    }

    // 4. Verificar oportunidades
    private async checkOpportunities(): Promise<ICRMAlert[]> {
        const alerts: ICRMAlert[] = [];

        try {
            // Buscar clientes com alto valor de compra recente
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const salesSnapshot = await this.iToolsService.database()
                .collection('CashierSales')
                .where([
                    { field: 'owner', operator: '=', value: Utilities.storeID },
                    { field: 'registerDate', operator: '>=', value: sevenDaysAgo },
                    { field: 'total', operator: '>=', value: 500 } // Compras acima de R$ 500
                ])
                .get();

            salesSnapshot.docs.forEach(doc => {
                const sale = doc.data();
                const customer = sale.customer || {};

                if (customer.name && (sale.total || sale.totalValue) > 1000) {
                    alerts.push({
                        id: `high-value-${doc.id}`,
                        type: 'success',
                        priority: 'high',
                        title: '💰 Venda Alta!',
                        message: `${customer.name} gastou ${this.formatCurrency(sale.total || sale.totalValue)}!`,
                        customerId: customer._id || customer.id,
                        customerName: customer.name,
                        actionRequired: 'Oferecer produtos premium',
                        createdAt: new Date(),
                        read: false,
                        dismissed: false
                    });
                }
            });

        } catch (error) {
            console.error('Erro ao verificar oportunidades:', error);
        }

        return alerts;
    }

    // Marcar alerta como lido
    public markAsRead(alertId: string): void {
        const alerts = this.alertsSubject.value;
        const alert = alerts.find(a => a.id === alertId);
        if (alert) {
            alert.read = true;
            this.alertsSubject.next([...alerts]);
            this.updateAlertCount();
        }
    }

    // Dispensar alerta
    public dismissAlert(alertId: string): void {
        const alerts = this.alertsSubject.value;
        const filteredAlerts = alerts.filter(a => a.id !== alertId);
        this.alertsSubject.next(filteredAlerts);
        this.updateAlertCount();
    }

    // Marcar todos como lidos
    public markAllAsRead(): void {
        const alerts = this.alertsSubject.value;
        alerts.forEach(alert => alert.read = true);
        this.alertsSubject.next([...alerts]);
        this.updateAlertCount();
    }

    // Atualizar contador
    private updateAlertCount(): void {
        const alerts = this.alertsSubject.value;
        const unreadCount = alerts.filter(a => !a.read).length;
        this.alertCountSubject.next(unreadCount);
    }

    // Formatar moeda
    private formatCurrency(value: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    }

    // Forçar verificação manual
    public forceCheck(): void {
        this.alertCache.clear(); // Limpar cache para permitir novos alertas
        this.checkForAlerts();
    }
}