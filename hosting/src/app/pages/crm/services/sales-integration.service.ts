/**
 * =====================================================
 * ARQUIVO: sales-integration.service.ts
 * CAMINHO: src/app/pages/crm/services/sales-integration.service.ts
 * =====================================================
 * 
 * ⚠️ SERVIÇO TOTALMENTE DESABILITADO ⚠️
 * 
 * MOTIVO: Evitar duplicação de leads e atividades
 * SUBSTITUTO: GlobalSalesIntegrationService (via App Module)
 * 
 * ✅ TODOS OS MÉTODOS VAZIOS - ZERO PROCESSAMENTO
 * =====================================================
 */

import { Injectable } from '@angular/core';

// Serviços (mantidos apenas para compatibilidade)
import { IToolsService } from '@shared/services/iTools.service';
import { CrmService } from '../crm.service';
import { NotificationService } from '@shared/services/notification.service';

@Injectable({
    providedIn: 'root'
})
export class SalesIntegrationService {

    // ✅ PROPRIEDADES VAZIAS (para compatibilidade)
    private salesListeners: any[] = [];
    private processingNow: Set<string> = new Set();
    private leadCreationMap: Map<string, boolean> = new Map();

    constructor(
        private iToolsService: IToolsService,
        private crmService: CrmService,
        private notificationService: NotificationService
    ) {
        console.log('🚫 SALES INTEGRATION SERVICE: Construtor chamado mas TOTALMENTE DESABILITADO');
        console.log('✅ Usando APENAS GlobalSalesIntegrationService para evitar duplicação');
    }

    /**
     * 🚫 MÉTODO TOTALMENTE VAZIO - NÃO FAZ ABSOLUTAMENTE NADA
     */
    public startMonitoring(): void {
        console.log('🚫 SALES INTEGRATION: startMonitoring() CHAMADO MAS TOTALMENTE DESABILITADO');
        console.log('⚠️ ZERO listeners criados - ZERO processamento');
        console.log('✅ Use APENAS GlobalSalesIntegrationService via App Module');

        // 🚫 ABSOLUTAMENTE NADA ACONTECE AQUI
        // NÃO CRIAR LISTENERS
        // NÃO CHAMAR MÉTODOS
        // NÃO PROCESSAR VENDAS

        return; // ✅ SAIR IMEDIATAMENTE
    }

    /**
     * 🚫 MÉTODO TOTALMENTE VAZIO - NÃO FAZ ABSOLUTAMENTE NADA
     */
    public stopMonitoring(): void {
        console.log('🚫 SALES INTEGRATION: stopMonitoring() CHAMADO MAS NADA PARA PARAR');

        // ✅ LIMPAR ARRAYS (mas estão vazios mesmo)
        this.salesListeners = [];
        this.processingNow.clear();
        this.leadCreationMap.clear();

        return; // ✅ SAIR IMEDIATAMENTE
    }

    /**
     * ✅ MÉTODO DE STATUS PARA DEBUG
     */
    public getServiceStatus(): any {
        return {
            serviceName: 'SalesIntegrationService',
            status: 'TOTALMENTE DESABILITADO',
            reason: 'Evitar duplicação de leads e atividades',
            activeListeners: 0,
            processingItems: 0,
            methodsCalled: 'NENHUM',
            recommendation: 'Use APENAS GlobalSalesIntegrationService',
            globalServiceActive: !!(window as any).globalSalesIntegrationService
        };
    }

    /**
     * ✅ MÉTODO PARA VERIFICAR GLOBAL SERVICE
     */
    public checkGlobalServiceStatus(): any {
        const globalService = (window as any).globalSalesIntegrationService;

        if (globalService) {
            const stats = globalService.getMonitoringStats();
            console.log('✅ Global Service ativo:', stats);
            return {
                found: true,
                active: stats.isActive,
                listeners: stats.listenersCount,
                tenant: stats.tenant
            };
        } else {
            console.log('❌ Global Service não encontrado');
            return {
                found: false,
                active: false,
                listeners: 0,
                tenant: 'unknown'
            };
        }
    }

    /**
     * ✅ DEBUG COMPLETO
     */
    public showCompleteDebug(): void {
        console.log('=== SALES INTEGRATION SERVICE DEBUG COMPLETO ===');
        console.log('🚫 Status: TOTALMENTE DESABILITADO');
        console.log('🚫 Listeners ativos: 0');
        console.log('🚫 Processamento: ZERO');
        console.log('🚫 Métodos chamados: NENHUM');
        console.log('✅ Global Service:', this.checkGlobalServiceStatus());
        console.log('=== RESULTADO: SEM DUPLICAÇÃO ===');
    }

    // ====================================================================
    // 🚫 TODOS OS MÉTODOS ABAIXO ESTÃO COMPLETAMENTE VAZIOS
    // ====================================================================

    private async checkRecentSales(): Promise<void> {
        // 🚫 MÉTODO VAZIO - NÃO FAZ NADA
        return;
    }

    private monitorBillingSales(): void {
        // 🚫 MÉTODO VAZIO - NÃO CRIA LISTENERS
        return;
    }

    private monitorCashierSales(): void {
        // 🚫 MÉTODO VAZIO - NÃO CRIA LISTENERS  
        return;
    }

    private monitorRequestSales(): void {
        // 🚫 MÉTODO VAZIO - NÃO CRIA LISTENERS
        return;
    }

    private monitorServiceOrders(): void {
        // 🚫 MÉTODO VAZIO - NÃO CRIA LISTENERS
        return;
    }

    private monitorPendingSales(): void {
        // 🚫 MÉTODO VAZIO - NÃO CRIA LISTENERS
        return;
    }

    private debugMonitorAllSales(): void {
        // 🚫 MÉTODO VAZIO - NÃO CRIA LISTENERS
        return;
    }

    private async processNewSale(sale: any, source: string, saleId: string): Promise<void> {
        // 🚫 MÉTODO VAZIO - NÃO PROCESSA VENDAS
        return;
    }

    private async processNegotiationLead(sale: any, source: string, saleId: string, status: string): Promise<void> {
        // 🚫 MÉTODO VAZIO - NÃO PROCESSA NEGOCIAÇÕES
        return;
    }

    private async processSaleInCRM(customerData: any, sale: any, source: string, saleDetails: any, processedKey: string): Promise<void> {
        // 🚫 MÉTODO VAZIO - NÃO PROCESSA CRM
        return;
    }

    private async createOrUpdateNegotiationLead(customerData: any, sale: any, source: string, saleDetails: any, saleId: string): Promise<void> {
        // 🚫 MÉTODO VAZIO - NÃO CRIA LEADS
        return;
    }

    private async createFollowUpTask(customerData: any, sale: any, saleDetails: any, saleId: string): Promise<void> {
        // 🚫 MÉTODO VAZIO - NÃO CRIA TAREFAS
        return;
    }

    private async createPostSaleActivity(customerData: any, sale: any, saleDetails: any): Promise<void> {
        // 🚫 MÉTODO VAZIO - NÃO CRIA ATIVIDADES
        return;
    }

    // ✅ Manter APENAS métodos utilitários para compatibilidade
    private formatCurrency(value: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    }

    private formatDate(date: Date): string {
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}