/**
 * =====================================================
 * ARQUIVO: global-sales-integration.service.ts  
 * CAMINHO: src/@shared/services/global-sales-integration.service.ts
 * =====================================================
 * 
 * VERSÃO FINAL CORRIGIDA:
 * ✅ Evita duplicação de leads
 * ✅ Garante criação de pós-venda
 * ✅ Debounce para evitar race conditions
 * ✅ Retry com delay para pós-venda
 * =====================================================
 */

import { Injectable } from '@angular/core';
import { IToolsService } from './iTools.service';
import { NotificationService } from './notification.service';
import { ENotificationStatus } from '../interfaces/ISystemNotification';

@Injectable({
    providedIn: 'root'
})
export class GlobalSalesIntegrationService {
    private salesListeners: any[] = [];
    private processingNow: Set<string> = new Set();
    private isMonitoring = false;
    private storeID: string = '';
    private recentCancellations: Map<string, number> = new Map();
    private lastProcessedSales: Map<string, string> = new Map();
    private processedCancellations: Set<string> = new Set();
    private saleSnapshots: Map<string, any> = new Map();
    private recentCancelActivities: Set<string> = new Set();

    // 🆕 NOVOS CONTROLES ANTI-DUPLICAÇÃO
    private processingDebounce: Map<string, any> = new Map();
    private createdLeads: Map<string, string> = new Map(); // saleId -> leadId
    private createdActivities: Map<string, Set<string>> = new Map(); // leadId -> Set de activityIds
    private createdRecoveries: Set<string> = new Set(); // saleId -> atividade criada

    constructor(
        private iToolsService: IToolsService,
        private notificationService: NotificationService
    ) {
        console.log('🌍 GLOBAL: Serviço CRM Global iniciado');
    }

    /**
     * ✅ INICIALIZAR COM STOREID
     */
    public initializeWithStoreID(storeID: string): void {
        console.log('🎯 GLOBAL: Inicializando CRM Global com storeID:', storeID);
        this.storeID = storeID;

        if (this.checkDependencies()) {
            this.startGlobalMonitoring();
        } else {
            this.retryInitialization();
        }
    }

    /**
     * ✅ VERIFICAR DEPENDÊNCIAS
     */
    private checkDependencies(): boolean {
        return !!(this.storeID && this.iToolsService && this.iToolsService.database());
    }

    /**
     * ✅ RETRY DE INICIALIZAÇÃO
     */
    private retryInitialization(): void {
        let attempts = 0;
        const retry = () => {
            attempts++;
            if (this.checkDependencies() || attempts >= 3) {
                this.startGlobalMonitoring();
            } else {
                setTimeout(retry, 2000);
            }
        };
        setTimeout(retry, 2000);
    }

    /**
     * ✅ INICIAR MONITORAMENTO COMPLETO
     */
    public startGlobalMonitoring(): void {
        if (this.isMonitoring) {
            console.log('⚠️ GLOBAL: Monitoramento já ativo');
            return;
        }

        console.log('🚀 GLOBAL: Iniciando monitoramento COMPLETO de vendas...');
        console.log('📍 GLOBAL: Tenant:', this.storeID);

        this.isMonitoring = true;

        try {
            // Monitorar TODAS as vendas (pendentes + concluídas)
            this.monitorAllSales();
            console.log('✅ GLOBAL: Monitoramento COMPLETO ativo!');
        } catch (error) {
            console.error('❌ GLOBAL: Erro ao iniciar monitoramento:', error);
            this.isMonitoring = false;
        }
    }

    /**
     * 🎯 MONITORAR TODAS AS VENDAS (COM DEBOUNCE)
     */
    private monitorAllSales(): void {
        try {
            const listener = this.iToolsService.database()
                .collection('CashierSales')
                .where([{ field: 'owner', operator: '=', value: this.storeID }])
                .onSnapshot(async (res) => {
                    console.log('📊 GLOBAL: Snapshot recebido', {
                        docs: res.docs?.length || 0,
                        changes: res.changes()?.length || 0,
                        timestamp: new Date().toLocaleString()
                    });

                    const changes = res.changes() || [];

                    for (const doc of changes) {
                        const sale = doc.data();
                        const saleId = doc.id;

                        // 🆕 DEBOUNCE: Evitar processar a mesma venda múltiplas vezes
                        const debounceKey = `${doc.type}_${saleId}_${sale.status}`;

                        // Cancelar processamento anterior se existir
                        if (this.processingDebounce.has(debounceKey)) {
                            clearTimeout(this.processingDebounce.get(debounceKey));
                        }

                        // Agendar novo processamento com delay
                        const timeoutId = setTimeout(async () => {
                            await this.processaSaleChange(doc, sale, saleId);
                            this.processingDebounce.delete(debounceKey);
                        }, 200); // 500ms de debounce

                        this.processingDebounce.set(debounceKey, timeoutId);
                    }
                });

            this.salesListeners.push(listener);
            console.log('✅ GLOBAL: Listener COMPLETO ativo com debounce');
        } catch (error) {
            console.error('❌ GLOBAL: Erro ao monitorar vendas:', error);
        }
    }

    /**
  * 🆕 PROCESSAR MUDANÇA DE VENDA (EXTRAÍDO PARA MÉTODO SEPARADO)
  */
    private async processaSaleChange(doc: any, sale: any, saleId: string): Promise<void> {
        // ✅ NOVO: Log detalhado para debug
        console.log('🔍 GLOBAL: Iniciando processamento', {
            type: doc.type,
            saleId: saleId,
            status: sale.status,
            timestamp: new Date().toISOString(),
            debounceAtivo: this.processingDebounce.size,
            processandoAgora: this.processingNow.size
        });
        // 🆕 Ignore vendas originadas do CRM para evitar duplicação
        if (sale.origin === 'CRM') {
            console.log('⏭️ GLOBAL: Venda criada pelo CRM, ignorando...');
            return;
        }
        // ✅ NOVO: Verificação de processamento duplicado
        const processingKey = `${doc.type}_${saleId}_${sale.status}`;
        if (this.processingNow.has(processingKey)) {
            console.log('⏭️ GLOBAL: Já processando esta mudança, pulando...');
            return;
        }
        this.processingNow.add(processingKey);

        try {
            const saleValue = this.extractValue(sale);

            // Sempre salvar o snapshot atual ANTES de processar
            const previousSnapshot = this.saleSnapshots.get(saleId);
            this.saleSnapshots.set(saleId, {
                value: saleValue,
                productsCount: sale.products?.length || 0,
                products: JSON.stringify(sale.products || []),
                payments: JSON.stringify(sale.payments || sale.paymentMethods || []),
                modifiedDate: sale.modifiedDate || sale.updatedAt,
                status: sale.status
            });

            console.log('🔄 GLOBAL: Processando mudança', {
                type: doc.type,
                id: saleId,
                status: sale.status,
                previousStatus: previousSnapshot?.status || 'NOVO',
                cliente: sale.customer?.name || 'Sem nome',
                valor: saleValue
            });

            // 1️⃣ VENDA NOVA (ADD)
            if (doc.type === 'ADD') {
                // 🆕 VERIFICAR SE JÁ EXISTE LEAD (MELHORADO)
                const existingLeadId = this.createdLeads.get(saleId);
                if (existingLeadId) {
                    console.log('⚠️ GLOBAL: Lead já criado para esta venda:', existingLeadId);
                    return;
                }
                // 🆕 TAMBÉM VERIFICAR NO BANCO PARA GARANTIR
                const existingLeadInDb = await this.findLeadBySaleId(saleId);
                if (existingLeadInDb) {
                    console.log('⚠️ GLOBAL: Lead já existe no banco:', existingLeadInDb.id);
                    this.createdLeads.set(saleId, existingLeadInDb.id);
                    return;
                }

                // Venda CONCLUÍDA → Lead + Pós-venda
                if (sale.status === 'CONCLUDED') {
                    console.log('✅ GLOBAL: Nova venda CONCLUÍDA → Criando lead + pós-venda');
                    await this.processNewConcludedSale(sale, saleId, saleValue);
                }
                // Venda PENDENTE → Lead negociação + Follow-up
                else if (sale.status === 'PENDENT') {
                    console.log('🟡 GLOBAL: Nova venda PENDENTE → Criando lead negociação + follow-up');
                    await this.processNewPendentSale(sale, saleId, saleValue);
                }
            }

            // 2️⃣ VENDA MODIFICADA (UPDATE/MODIFIED)
            else if (doc.type === 'MODIFIED' || doc.type === 'UPDATE') {
                // Venda CANCELADA
                if (sale.status === 'CANCELED' || sale.status === 'CANCELLED') {
                    console.log('🚫 GLOBAL: Venda CANCELADA detectada');
                    await this.processSaleCancellation(sale, saleId, saleValue);
                }
                // PENDENTE → CONCLUÍDA
                else if (sale.status === 'CONCLUDED' && previousSnapshot && previousSnapshot.status === 'PENDENT') {
                    console.log('🎯 GLOBAL: PENDENTE → CONCLUÍDA detectada!');
                    await this.processPendentToConcluded(sale, saleId, saleValue);
                }
                // Outras edições (valor, produtos, etc)
                else if (this.hasSignificantChanges(sale)) {
                    console.log('✏️ GLOBAL: Venda EDITADA');
                    await this.processSaleEdit(sale, saleId, saleValue);
                }
            }

        } finally {
            // ✅ NOVO: Limpar flag de processamento após 5 segundos
            setTimeout(() => {
                this.processingNow.delete(processingKey);
                console.log('🧹 GLOBAL: Limpando flag de processamento:', processingKey);
            }, 5000);
        }
    }
    private async processNewConcludedSale(sale: any, saleId: string, saleValue: number): Promise<void> {
        // Verificar se já está processando
        const key = `new_concluded_${saleId}`;
        if (this.processingNow.has(key)) {
            console.log('⏭️ Venda concluída já em processamento');
            return;
        }
        this.processingNow.add(key);

        try {
            // Verificar se já existe lead para esta venda
            const existingLead = await this.findLeadBySaleId(saleId);
            if (existingLead) {
                console.log('⚠️ Lead já existe para esta venda');
                return;
            }

            const customerData = sale.customer || {};
            const isServiceOrder = this.isServiceOrderSale(sale);

            // 🔧 TRATAMENTO ESPECIAL PARA ORDEM DE SERVIÇO
            let leadSource = 'PDV';
            let leadNotes = this.buildConcludedSaleNotes(sale, saleId, saleValue);

            if (isServiceOrder) {
                leadSource = 'Ordem de Serviço';
                leadNotes = this.buildServiceOrderCompletedNotes(sale, saleId, saleValue);
                console.log('🔧 Venda de ORDEM DE SERVIÇO detectada');
            }

            // Criar lead (tanto para venda normal quanto OS)
            const leadId = await this.createLead({
                customerData,
                saleValue,
                saleId,
                status: 'closed',
                source: leadSource,
                notes: leadNotes
            });

            if (leadId) {
                // Garantir que o lead já possua dados completos (produtos, serviços etc.)
                await this.updateLeadWithCompleteData(leadId, sale, saleId);

                // Criar atividade de pós-venda
                await this.createPostSaleActivityWithRetry(leadId, sale, saleId, saleValue);

                // ⭐⭐⭐ CÓDIGO NOVO COMEÇA AQUI ⭐⭐⭐

                // 🆕 BUSCAR GARANTIA DA ORDEM DE SERVIÇO
                let warranty = null;

                // Se for uma venda de OS, buscar warranty no service
                if (isServiceOrder && sale.service) {
                    warranty = sale.service.warranty;
                    console.log('🔧 DEBUG - Garantia da OS:', warranty);
                }
                // Senão, buscar direto na venda (caso futuro)
                else {
                    warranty = sale.warranty;
                    console.log('🛒 DEBUG - Garantia da venda direta:', warranty);
                }

                // 🆕 CRIAR LEMBRETE DE GARANTIA SE EXISTIR
                if (warranty && warranty.trim() !== '') {
                    console.log('✅ Criando lembrete de garantia:', warranty);

                    // Criar um objeto sale com a garantia para passar ao método
                    const saleWithWarranty = { ...sale, warranty: warranty };
                    await this.createWarrantyReminder(leadId, saleWithWarranty, saleId);

                    // Notificar sobre a garantia
                    this.notificationService.create({
                        title: '🛡️ Garantia Configurada',
                        description: `Lembrete de garantia criado para ${customerData.name || 'Cliente'} - ${warranty}`,
                        status: ENotificationStatus.info
                    });
                } else {
                    console.log('⚠️ Venda sem garantia informada');
                }

                // ⭐⭐⭐ CÓDIGO NOVO TERMINA AQUI ⭐⭐⭐

                // Notificar (mensagem diferente para OS)
                if (isServiceOrder) {
                    this.notificationService.create({
                        title: '🔧 Ordem de Serviço Concluída',
                        description: `Lead criado para OS de ${customerData.name || 'Cliente'} - ${this.formatCurrency(saleValue)}`,
                        status: ENotificationStatus.success
                    });
                } else {
                    this.notificationService.create({
                        title: '✅ Nova Venda Concluída',
                        description: `Lead criado para ${customerData.name || 'Cliente'} - ${this.formatCurrency(saleValue)}`,
                        status: ENotificationStatus.success
                    });
                }
            }

        } catch (error) {
            console.error('❌ Erro ao processar venda concluída:', error);
        } finally {
            setTimeout(() => this.processingNow.delete(key), 5000);
        }
    }

    /**
     * 2️⃣ PROCESSAR NOVA VENDA PENDENTE (COM PROTEÇÃO ANTI-DUPLICAÇÃO)
     */
    private async processNewPendentSale(sale: any, saleId: string, saleValue: number): Promise<void> {
        // Verificar se já está processando
        const key = `new_pendent_${saleId}`;
        if (this.processingNow.has(key)) {
            console.log('⏭️ Venda pendente já em processamento');
            return;
        }
        this.processingNow.add(key);

        try {
            // 🆕 DUPLA VERIFICAÇÃO: memoria + banco
            const memoryLeadId = this.createdLeads.get(saleId);
            if (memoryLeadId) {
                console.log('⚠️ Lead já existe em memória:', memoryLeadId);
                return;
            }

            // 🆕 VERIFICAR SE É ORDEM DE SERVIÇO
            if (this.isServiceOrderSale(sale)) {
                console.log('🔧 Venda pendente de ORDEM DE SERVIÇO - NÃO criar lead agora');
                return;
            }

            // Verificar no banco também
            const existingLead = await this.findLeadBySaleId(saleId);
            if (existingLead) {
                console.log('⚠️ Lead já existe no banco para esta venda');
                this.createdLeads.set(saleId, existingLead.id); // Salvar em memória
                return;
            }

            // ✅ Solicitação do cliente: não criar lead para vendas pendentes
            // Mantemos a lógica e proteções existentes acima (deduplicação, OS, etc.),
            // mas não criamos lead/atividade aqui. Apenas registramos e saímos.
            console.log('ℹ️ Lead para venda pendente não será criado (config cliente).');
            return;

        } catch (error) {
            console.error('❌ Erro ao processar venda pendente:', error);
        } finally {
            setTimeout(() => this.processingNow.delete(key), 5000);
        }
    }

    /**
  * 3️⃣ PROCESSAR CANCELAMENTO DE VENDA
  * Cancela lead + conclui atividades pendentes
  */
    private async processSaleCancellation(sale: any, saleId: string, saleValue: number): Promise<void> {
        // Verificar se já está processando
        const key = `cancel_${saleId}`;
        if (this.processingNow.has(key)) {
            console.log('⏭️ Cancelamento já em processamento');
            return;
        }
        if (this.createdRecoveries.has(saleId)) {
            console.log('⏭️ Recuperação já processada recentemente para esta venda');
            return;
        }
        this.processingNow.add(key);

        try {
            // Buscar lead da venda
            const lead = await this.findLeadBySaleId(saleId);

            if (!lead) {
                console.log('⚠️ Nenhum lead encontrado para cancelar');
                return;
            }

            // Cancelar o lead
            await this.iToolsService.database()
                .collection('CRMLeads')
                .doc(lead.id)
                .update({
                    status: 'canceled',
                    pipeline: true,         // Manter no pipeline
                    archived: false,        // Não arquivar
                    previousStatus: lead.status,
                    cancelReason: sale.cancelReason || 'Venda cancelada no PDV',
                    cancelDate: new Date(),
                    modifiedDate: new Date(),
                    notes: lead.notes + `\n\n🚫 CANCELADO em ${this.formatDate(new Date())}\nMotivo: ${sale.cancelReason || 'Não informado'}`
                });

            // Concluir atividades de pós-venda pendentes
            await this.completePostSaleActivities(saleId);

            // ✅ Fechar eventuais atividades de follow-up da venda
            await this.closeFollowUpActivities(lead.id, saleId);

            // 🆕 FINALIZAR ATIVIDADES DE GARANTIA
            await this.completeWarrantyActivities(saleId);

            // Verificar se já existe atividade de recuperação antes de criar
            const existingRecovery = await this.checkExistingRecoveryActivity(saleId);
            if (!existingRecovery) {
                const created = await this.createRecoveryActivity(lead.id, sale, saleId, saleValue);
                if (created) {
                    this.createdRecoveries.add(saleId);
                }
            } else {
                console.log('⚠️ Atividade de recuperação já existe');
                this.createdRecoveries.add(saleId);
            }

            // Notificar
            this.notificationService.create({
                title: '🚫 Venda Cancelada',
                description: `Lead cancelado e atividade de recuperação criada`,
                status: ENotificationStatus.warning
            });

        } catch (error) {
            console.error('❌ Erro ao processar cancelamento:', error);
        } finally {
            setTimeout(() => this.processingNow.delete(key), 5000);
        }
    }

    /**
  * 4️⃣ PROCESSAR PENDENTE → CONCLUÍDA (GARANTIR PÓS-VENDA)
  */
    private async processPendentToConcluded(sale: any, saleId: string, saleValue: number): Promise<void> {
        // Verificar se já está processando
        const key = `pendent_to_concluded_${saleId}`;
        if (this.processingNow.has(key)) {
            console.log('⏭️ Mudança de status já em processamento');
            return;
        }
        this.processingNow.add(key);

        try {
            console.log('🔄 Processando PENDENTE → CONCLUÍDA para venda:', saleId);

            // 🆕 BUSCAR LEAD CORRETO (usar memória primeiro)
            let leadId = this.createdLeads.get(saleId);
            let lead = null;

            if (leadId) {
                // Buscar dados completos do lead
                const leadDoc = await this.iToolsService.database()
                    .collection('CRMLeads')
                    .doc(leadId)
                    .get();

                if (leadDoc.data()) {
                    lead = { id: leadId, ...leadDoc.data() };
                }
            }

            // Se não encontrou em memória, buscar no banco
            if (!lead) {
                lead = await this.findLeadBySaleId(saleId);
                if (lead) {
                    this.createdLeads.set(saleId, lead.id); // Salvar em memória
                }
            }

            // 🆕 SE FOR OS E NÃO TEM LEAD, CRIAR AGORA
            const isServiceOrder = this.isServiceOrderSale(sale);
            if (!lead && isServiceOrder) {
                console.log('🔧 Criando lead FECHADO para Ordem de Serviço finalizada');

                const customerData = sale.customer || {};
                leadId = await this.createLead({
                    customerData,
                    saleValue,
                    saleId,
                    status: 'closed',
                    source: 'Ordem de Serviço Finalizada',
                    notes: this.buildServiceOrderCompletedNotes(sale, saleId, saleValue)
                });

                if (leadId) {
                    this.createdLeads.set(saleId, leadId);
                    await this.updateLeadWithCompleteData(leadId, sale, saleId);
                    await this.createPostSaleActivityWithRetry(leadId, sale, saleId, saleValue);

                    // 🆕 VERIFICAR GARANTIA PARA OS FINALIZADAS
                    const warranty = sale.service?.warranty || sale.warranty;
                    if (warranty && warranty.trim() !== '') {
                        console.log('🛡️ OS finalizada tem garantia:', warranty);

                        const saleWithWarranty = { ...sale, warranty: warranty };
                        await this.createWarrantyReminder(leadId, saleWithWarranty, saleId);

                        this.notificationService.create({
                            title: '🛡️ Garantia Configurada',
                            description: `Lembrete de garantia criado para ${customerData.name || 'Cliente'} - ${warranty}`,
                            status: ENotificationStatus.info
                        });
                    }

                    this.notificationService.create({
                        title: '🔧 Ordem de Serviço Concluída',
                        description: `Lead FECHADO criado para ${customerData.name || 'Cliente'} - ${this.formatCurrency(saleValue)}`,
                        status: ENotificationStatus.success
                    });
                }
                return;
            }

            // 🆕 SE NÃO É OS E NÃO TEM LEAD (pois não criamos mais em PENDENTE), CRIAR AGORA COMO FECHADO
            if (!lead && !isServiceOrder) {
                console.log('🆕 Criando lead FECHADO para venda que estava pendente e foi concluída');

                const customerData = sale.customer || {};
                const newLeadId = await this.createLead({
                    customerData,
                    saleValue,
                    saleId,
                    status: 'closed',
                    source: 'PDV - Venda Concluída',
                    notes: this.buildConcludedSaleNotes(sale, saleId, saleValue)
                });

                if (newLeadId) {
                    this.createdLeads.set(saleId, newLeadId);
                    await this.updateLeadWithCompleteData(newLeadId, sale, saleId);
                    await this.createPostSaleActivityWithRetry(newLeadId, sale, saleId, saleValue);

                    // Lembrete de garantia se houver
                    const warranty = sale.service?.warranty || sale.warranty;
                    if (warranty && warranty.trim() !== '') {
                        const saleWithWarranty = { ...sale, warranty: warranty };
                        await this.createWarrantyReminder(newLeadId, saleWithWarranty, saleId);
                    }

                    this.notificationService.create({
                        title: '✅ Venda Concluída',
                        description: `Lead criado e pós-venda agendado para ${customerData.name || 'Cliente'}`,
                        status: ENotificationStatus.success
                    });
                } else {
                    console.log('⚠️ Não foi possível criar lead para venda concluída');
                }
                return;
            }

            if (!lead) {
                console.log('⚠️ Nenhum lead encontrado para atualizar');
                return;
            }

            console.log('📋 Lead encontrado:', {
                id: lead.id,
                status: lead.status,
                name: lead.name
            });

            // ATUALIZAR LEAD
            const products = this.extractProducts(sale);
            const services = this.extractServices(sale);
            const paymentMethods = this.extractPaymentMethods(sale);
            const serviceData = isServiceOrder ? this.extractServiceDataForCRM(sale) : null;

            let updatedNotes = lead.notes || '';
            updatedNotes += `\n\n✅ VENDA CONCLUÍDA em ${this.formatDate(new Date())}\n`;

            // Adicionar produtos
            if (products.length > 0) {
                updatedNotes += `\n📦 PRODUTOS (${products.length} itens):\n`;
                products.forEach(p => {
                    updatedNotes += `• ${p.quantity}x ${p.name} - ${this.formatCurrency(p.total)}\n`;
                });
            }

            // Adicionar serviços ou dados de ordem de serviço
            if (serviceData) {
                updatedNotes += `\n🔧 ORDEM DE SERVIÇO FINALIZADA:\n`;
                updatedNotes += `• Código: #${serviceData.serviceOrderCode || 'N/A'}\n`;
                updatedNotes += `• Serviços: ${serviceData.servicesDetails}\n`;
                if (serviceData.equipment) {
                    updatedNotes += `• Equipamento: ${serviceData.equipment}\n`;
                }
                if (serviceData.responsible) {
                    updatedNotes += `• Responsável: ${serviceData.responsible}\n`;
                }
            } else if (services.length > 0) {
                updatedNotes += `\n🔧 SERVIÇOS (${services.length} itens):\n`;
                services.forEach(s => {
                    updatedNotes += `• ${s.quantity}x ${s.name} - ${this.formatCurrency(s.total)}\n`;
                });
            }

            // Adicionar formas de pagamento
            if (paymentMethods.length > 0) {
                updatedNotes += `\n💳 FORMAS DE PAGAMENTO:\n`;
                paymentMethods.forEach(p => {
                    updatedNotes += `• ${p.name}: ${this.formatCurrency(p.value)}\n`;
                });
            }

            // 🆕 ADICIONAR GARANTIA NAS NOTAS SE EXISTIR
            const warranty = sale.service?.warranty || sale.warranty;
            if (warranty && warranty.trim() !== '') {
                updatedNotes += `\n🛡️ GARANTIA: ${warranty}\n`;
            }

            const customData: any = {
                products: products,
                services: services,
                paymentMethods: paymentMethods,
                lastUpdate: new Date()
            };

            if (serviceData) {
                customData.serviceData = serviceData;
            }

            await this.iToolsService.database()
                .collection('CRMLeads')
                .doc(lead.id)
                .update({
                    status: 'closed',
                    score: 100,
                    value: saleValue,
                    modifiedDate: new Date(),
                    notes: updatedNotes,
                    customData: customData,
                    tags: [...(lead.tags || []), 'venda-finalizada', ...(serviceData ? ['ordem-servico-concluida'] : [])]
                });

            console.log('✅ Lead atualizado para CLOSED');

            // CONCLUIR ATIVIDADES DE FOLLOW-UP
            await this.closeFollowUpActivities(lead.id, saleId);

            // AGUARDAR UM POUCO PARA GARANTIR
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 🆕 GARANTIR CRIAÇÃO DE PÓS-VENDA COM RETRY
            await this.createPostSaleActivityWithRetry(lead.id, sale, saleId, saleValue);

            // 🆕 CRIAR LEMBRETE DE GARANTIA SE EXISTIR (para vendas que já tinham lead)
            if (warranty && warranty.trim() !== '') {
                console.log('🛡️ Venda finalizada tem garantia:', warranty);

                const saleWithWarranty = { ...sale, warranty: warranty };
                await this.createWarrantyReminder(lead.id, saleWithWarranty, saleId);

                this.notificationService.create({
                    title: '🛡️ Garantia Configurada',
                    description: `Lembrete de garantia criado - ${warranty}`,
                    status: ENotificationStatus.info
                });
            }

            // Notificar conclusão
            this.notificationService.create({
                title: '🎉 Venda Fechada!',
                description: `Negociação concluída com sucesso - ${lead.name}`,
                status: ENotificationStatus.success
            });

        } catch (error) {
            console.error('❌ Erro ao processar mudança de status:', error);
        } finally {
            setTimeout(() => this.processingNow.delete(key), 5000);
        }
    }

    /**
     * 🆕 CRIAR PÓS-VENDA COM RETRY E VERIFICAÇÃO
     */
    private async createPostSaleActivityWithRetry(leadId: string, sale: any, saleId: string, saleValue: number): Promise<void> {
        console.log('🎯 Tentando criar atividade de pós-venda...');

        // Verificar se já existe pós-venda
        if (!this.createdActivities.has(leadId)) {
            this.createdActivities.set(leadId, new Set());
        }

        const activities = this.createdActivities.get(leadId)!;
        const hasPostSale = Array.from(activities).some(actId => actId.includes('postsale'));

        if (hasPostSale) {
            console.log('⚠️ Pós-venda já existe para este lead');
            return;
        }

        // Tentar criar com retry
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            try {
                attempts++;
                console.log(`🔄 Tentativa ${attempts} de criar pós-venda`);

                // Aguardar um pouco entre tentativas
                if (attempts > 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
                }

                const activityId = await this.createPostSaleActivitySimple(leadId, sale, saleId, saleValue);

                if (activityId) {
                    activities.add(activityId);
                    console.log('✅ Pós-venda criada com sucesso na tentativa', attempts);

                    // Notificar sobre a pós-venda
                    this.notificationService.create({
                        title: '📞 Pós-Venda Agendada',
                        description: `Atividade de pós-venda criada para ${sale.customer?.name || 'Cliente'}`,
                        status: ENotificationStatus.info
                    });

                    return;
                }

            } catch (error) {
                console.error(`❌ Erro na tentativa ${attempts}:`, error);

                if (attempts === maxAttempts) {
                    console.error('❌ Falha definitiva ao criar pós-venda após', maxAttempts, 'tentativas');

                    // Notificar falha
                    this.notificationService.create({
                        title: '⚠️ Atenção',
                        description: 'Não foi possível criar atividade de pós-venda automaticamente',
                        status: ENotificationStatus.warning
                    });
                }
            }
        }
    }

    /**
     * 5️⃣ PROCESSAR EDIÇÃO DE VENDA
     * Atualiza informações do lead
     */
    private async processSaleEdit(sale: any, saleId: string, saleValue: number): Promise<void> {
        // Verificar se já está processando
        const key = `edit_${saleId}`;
        if (this.processingNow.has(key)) {
            console.log('⏭️ Edição já em processamento');
            return;
        }
        this.processingNow.add(key);

        try {
            // Buscar lead da venda
            const lead = await this.findLeadBySaleId(saleId);

            if (!lead) {
                console.log('⚠️ Nenhum lead encontrado para editar');
                return;
            }

            // Atualizar valor e adicionar nota de edição
            await this.iToolsService.database()
                .collection('CRMLeads')
                .doc(lead.id)
                .update({
                    value: saleValue,
                    modifiedDate: new Date(),
                    notes: lead.notes + `\n\n✏️ EDITADO em ${this.formatDate(new Date())}\nNovo valor: ${this.formatCurrency(saleValue)}`
                });

            console.log('✅ Lead atualizado com novas informações');

        } catch (error) {
            console.error('❌ Erro ao processar edição:', error);
        } finally {
            setTimeout(() => this.processingNow.delete(key), 5000);
        }
    }

    /**
     * 🆕 ATUALIZAR DADOS COMPLETOS DO LEAD
     * Método auxiliar para garantir que produtos/serviços sejam sempre atualizados
     */
    private async updateLeadWithCompleteData(leadId: string, sale: any, saleId: string): Promise<void> {
        try {
            console.log('🔄 Atualizando lead com dados completos...');

            // Extrair todos os dados da venda
            const products = this.extractProducts(sale);
            const services = this.extractServices(sale);
            const paymentMethods = this.extractPaymentMethods(sale);
            const serviceData = this.isServiceOrderSale(sale) ? this.extractServiceDataForCRM(sale) : null;
            const saleValue = this.extractValue(sale);

            // Buscar lead atual
            const leadDoc = await this.iToolsService.database()
                .collection('CRMLeads')
                .doc(leadId)
                .get();

            if (!leadDoc.data()) {
                console.error('❌ Lead não encontrado para atualizar');
                return;
            }

            const currentLead = leadDoc.data();

            // Construir customData estruturado
            const customData: any = {
                products: products,
                services: services,
                paymentMethods: paymentMethods,
                lastUpdate: new Date(),
                saleId: saleId
            };

            if (serviceData) {
                customData.serviceData = serviceData;
            }

            // Atualizar notas preservando histórico
            let updatedNotes = currentLead.notes || '';
            if (!updatedNotes.includes('=== DADOS COMPLETOS ===')) {
                updatedNotes += `\n\n=== DADOS COMPLETOS ===\n`;
                updatedNotes += `📅 Atualizado em: ${this.formatDate(new Date())}\n`;

                // Produtos
                if (products.length > 0) {
                    updatedNotes += `\n📦 PRODUTOS (${products.length} itens):\n`;
                    products.forEach(p => {
                        const unitPrice = p.unitPrice || (p.total / p.quantity);
                        updatedNotes += `• ${p.quantity}x ${p.name}\n`;
                        updatedNotes += `  Unitário: ${this.formatCurrency(unitPrice)} | Total: ${this.formatCurrency(p.total)}\n`;
                    });
                }

                // Serviços ou Ordem de Serviço
                if (serviceData) {
                    updatedNotes += `\n🔧 ORDEM DE SERVIÇO:\n`;
                    updatedNotes += `• Código: #${serviceData.serviceOrderCode || 'N/A'}\n`;
                    updatedNotes += `• Serviços: ${serviceData.servicesDetails}\n`;
                    if (serviceData.equipment) {
                        updatedNotes += `• Equipamento: ${serviceData.equipment}\n`;
                    }
                    if (serviceData.responsible) {
                        updatedNotes += `• Responsável: ${serviceData.responsible}\n`;
                    }
                } else if (services.length > 0) {
                    updatedNotes += `\n🔧 SERVIÇOS (${services.length} itens):\n`;
                    services.forEach(s => {
                        updatedNotes += `• ${s.quantity}x ${s.name} - ${this.formatCurrency(s.total)}\n`;
                    });
                }

                // Formas de pagamento
                if (paymentMethods.length > 0) {
                    updatedNotes += `\n💳 FORMAS DE PAGAMENTO:\n`;
                    paymentMethods.forEach(p => {
                        updatedNotes += `• ${p.name}: ${this.formatCurrency(p.value)}\n`;
                    });
                }
            }

            // Atualizar o lead
            await this.iToolsService.database()
                .collection('CRMLeads')
                .doc(leadId)
                .update({
                    value: saleValue,
                    notes: updatedNotes,
                    customData: customData,
                    modifiedDate: new Date(),
                    hasCompleteData: true // Flag para indicar dados completos
                });

            console.log('✅ Lead atualizado com dados completos');

        } catch (error) {
            console.error('❌ Erro ao atualizar lead com dados completos:', error);
        }
    }

    /**
     * 🆕 VERIFICAR E ATUALIZAR DADOS DO LEAD SE NECESSÁRIO
     * Método para ser chamado sempre que houver mudanças na venda
     */
    private async ensureLeadHasCompleteData(saleId: string, sale: any): Promise<void> {
        try {
            const lead = await this.findLeadBySaleId(saleId);

            if (lead && !lead.hasCompleteData) {
                console.log('🔍 Lead sem dados completos, atualizando...');
                await this.updateLeadWithCompleteData(lead.id, sale, saleId);
            }
        } catch (error) {
            console.error('❌ Erro ao verificar dados do lead:', error);
        }
    }

    /**
     * ✅ BUSCAR LEAD POR SALE ID (MELHORADO)
     */
    private async findLeadBySaleId(saleId: string): Promise<any> {
        try {
            // 🆕 Verificar primeiro na memória
            const memoryLeadId = this.createdLeads.get(saleId);
            if (memoryLeadId) {
                const leadDoc = await this.iToolsService.database()
                    .collection('CRMLeads')
                    .doc(memoryLeadId)
                    .get();

                if (leadDoc.data()) {
                    return { id: memoryLeadId, ...leadDoc.data() };
                }
            }

            // Buscar no banco
            const leads = await this.iToolsService.database()
                .collection('CRMLeads')
                .where([
                    { field: 'owner', operator: '=', value: this.storeID }
                ])
                .get();

            if (leads.docs) {
                for (const doc of leads.docs) {
                    const lead = doc.data();
                    if (lead.notes && lead.notes.includes(saleId)) {
                        // 🆕 Salvar em memória
                        this.createdLeads.set(saleId, doc.id);
                        return { id: doc.id, ...lead };
                    }
                }
            }

            return null;
        } catch (error) {
            console.error('❌ Erro ao buscar lead:', error);
            return null;
        }
    }

    /**
     * ✅ CRIAR LEAD (SIMPLIFICADO)
     */
    private async createLead(params: {
        customerData: any,
        saleValue: number,
        saleId: string,
        status: string,
        source: string,
        notes: string
    }): Promise<string | null> {
        try {
            // ✅ NOVA VERIFICAÇÃO: Evitar criar duplicatas
            const existingCheck = `creating_lead_${params.saleId}`;
            if (this.processingNow.has(existingCheck)) {
                console.log('⚠️ Lead já está sendo criado para esta venda');
                return null;
            }
            this.processingNow.add(existingCheck);
            // 🆕 Não criar lead se não houver telefone do cliente
            const customerPhone = params.customerData.phone || params.customerData.telefone || '';
            if (!customerPhone || customerPhone.trim() === '') {
                console.log('⚠️ Lead não criado - cliente sem telefone informado');
                this.processingNow.delete(existingCheck);
                return null;
            }

            // ✅ Verificar se já existe no banco antes de criar
            const existing = await this.findLeadBySaleId(params.saleId);
            if (existing) {
                console.log('⚠️ Lead já existe no banco:', existing.id);
                this.createdLeads.set(params.saleId, existing.id);
                this.processingNow.delete(existingCheck);
                return existing.id;
            }

            // ID fixo sem timestamp
            const leadId = `lead_${params.saleId}_${this.storeID}`;
            const batch = this.iToolsService.database().batch();

            const leadData = {
                name: params.customerData.name || 'Cliente',
                email: params.customerData.email || `temp_${Date.now()}@temp.com`,
                phone: params.customerData.phone || params.customerData.telefone || '',
                status: params.status,
                value: params.saleValue,
                source: params.source,
                score: this.calculateScore(params.saleValue),
                notes: params.notes,
                tags: [params.status === 'negotiation' ? 'venda-pendente' : 'venda-concluida'],
                owner: this.storeID,
                registerDate: new Date(),
                modifiedDate: new Date()
            };

            batch.update(
                this.iToolsService.database().collection('CRMLeads').doc(leadId),
                leadData,
                { merge: true }
            );

            await batch.commit();
            console.log(`✅ Lead criado: ${leadId}`);

            // 🆕 Salvar em memória
            this.createdLeads.set(params.saleId, leadId);

            return leadId;

        } catch (error) {
            console.error('❌ Erro ao criar lead:', error);
            return null;
        }
    }

    /**
  * ✅ CRIAR ATIVIDADE DE PÓS-VENDA (VERSÃO CORRIGIDA)
  * Agora incluindo produtos E serviços
  */
    private async createPostSaleActivitySimple(leadId: string, sale: any, saleId: string, saleValue: number): Promise<string | null> {
        try {
            // 🆕 VERIFICAR SE JÁ EXISTE ANTES DE CRIAR
            const existingActivities = await this.iToolsService.database()
                .collection('CRMActivities')
                .where([
                    { field: 'leadId', operator: '=', value: leadId },
                    { field: 'saleId', operator: '=', value: saleId },
                    { field: 'type', operator: '=', value: 'whatsapp' },
                    { field: 'owner', operator: '=', value: this.storeID }
                ])
                .get();

            if (existingActivities.docs && existingActivities.docs.length > 0) {
                // Verificar se alguma é pós-venda
                for (const doc of existingActivities.docs) {
                    const activity = doc.data();
                    if (activity.tags && activity.tags.includes('pos-venda')) {
                        console.log('⚠️ Atividade de pós-venda já existe, não criar nova');
                        return doc.id; // Retornar ID da existente
                    }
                }
            }

            const timestamp = Date.now();
            const activityId = `postsale_${saleId}_${this.storeID}`;

            const batch = this.iToolsService.database().batch();
            const customerData = sale.customer || {};

            // Buscar dados do lead para incluir informações de contato
            const leadDoc = await this.iToolsService.database()
                .collection('CRMLeads')
                .doc(leadId)
                .get();
            const leadData = leadDoc.data() || {};
            const contactInfo = (customerData as any).contacts || {};
            const phone = leadData.phone || contactInfo.phone || contactInfo.whatsapp || '';
            // Extrair dados da venda
            const products = this.extractProducts(sale);
            const services = this.extractServices(sale);
            const serviceData = this.extractServiceDataForCRM(sale);

            // Construir detalhes dos produtos E serviços
            const productDetails = this.buildProductsDetails(products);
            const servicesDetails = this.buildServicesDetails(services);
            const serviceOrderDetails = this.buildServiceOrderDetails(serviceData);

            // Montar descrição completa
            let description = `Contato de pós-venda\nValor: ${this.formatCurrency(saleValue)}\nVenda: ${saleId}`;

            // Adicionar produtos se existirem
            if (productDetails) {
                description += productDetails;
            }

            // Adicionar serviços OU ordem de serviço
            if (serviceOrderDetails) {
                description += serviceOrderDetails;
            } else if (servicesDetails) {
                description += servicesDetails;
            }

            description += `\n\n📞 Verificar satisfação do cliente\n✅ Oferecer suporte adicional`;

            const activityData = {
                title: `Pós-venda: ${customerData.name || 'Cliente'}`,
                type: 'whatsapp',
                leadId: leadId,
                leadName: leadData.name || customerData.name || '',
                leadEmail: leadData.email || contactInfo.email || '',
                leadPhone: phone,
                saleId: saleId,
                assignedTo: sale.collaborator?._id || sale.collaboratorId || sale.userId || sale.owner || sale.createdBy || null,
                description: description,
                scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
                priority: 'normal',
                status: 'pending',
                owner: this.storeID,
                registerDate: new Date(),
                modifiedDate: new Date(),
                tags: ['pos-venda', 'follow-up-venda'],
                uniqueKey: `${leadId}_${saleId}_postsale`
            };

            batch.update(
                this.iToolsService.database().collection('CRMActivities').doc(activityId),
                activityData,
                { merge: true }
            );

            await batch.commit();
            console.log('✅ Atividade de pós-venda criada com ID:', activityId);

            return activityId;

        } catch (error) {
            console.error('❌ Erro ao criar atividade de pós-venda:', error);
            return null;
        }
    }
    /**
     * 🆕 CRIAR ATIVIDADE DE LEMBRETE DE GARANTIA
     * Este método cria uma atividade no CRM para lembrar sobre a garantia
     */
    private async createWarrantyReminder(leadId: string, sale: any, saleId: string): Promise<void> {
        try {
            // Só criar lembrete se a venda tiver garantia informada
            if (!sale.warranty || sale.warranty.trim() === '') {
                return;
            }

            console.log('🛡️ Criando lembrete de garantia:', sale.warranty);

            // Passo 1: Entender as informações da garantia (quanto tempo, etc)
            const warrantyInfo = this.parseWarrantyInfo(sale.warranty);
            if (!warrantyInfo) {
                return;
            }

            // Passo 2: Calcular quando devemos lembrar o cliente
            const reminderDate = this.calculateWarrantyReminderDate(warrantyInfo);

            // Criar um ID único para esta atividade
            const activityId = `warranty_${saleId}_${this.storeID}`;
            const batch = this.iToolsService.database().batch();
            const customerData = sale.customer || {};
            // Buscar dados do lead para preencher contatos
            const leadDoc = await this.iToolsService.database()
                .collection('CRMLeads')
                .doc(leadId)
                .get();
            const leadData = leadDoc.data() || {};
            const contactInfo = (customerData as any).contacts || {};
            const phone = leadData.phone || contactInfo.phone || contactInfo.whatsapp || '';
            // Passo 3: Montar a descrição completa do lembrete
            let description = `🛡️ LEMBRETE DE GARANTIA\n`;
            description += `━━━━━━━━━━━━━━━━━━━\n\n`;
            description += `👤 Cliente: ${customerData.name || 'Cliente'}\n`;
            description += `📞 Telefone: ${customerData.phone || 'Não informado'}\n`;
            description += `📧 Email: ${customerData.email || 'Não informado'}\n\n`;

            description += `📦 DETALHES DA VENDA:\n`;
            description += `• Código: #${saleId}\n`;
            description += `• Data da venda: ${this.formatDate(new Date())}\n`;
            description += `• Valor: ${this.formatCurrency(this.extractValue(sale))}\n\n`;

            description += `🔒 GARANTIA:\n`;
            description += `• Tipo: ${warrantyInfo.type === 'time' ? 'Por tempo' : 'Por kilometragem'}\n`;
            description += `• Duração: ${sale.warranty}\n`;
            description += `• Vencimento: ${this.formatDate(warrantyInfo.expiryDate)}\n\n`;

            // Adicionar lista de produtos vendidos
            const products = this.extractProducts(sale);
            if (products.length > 0) {
                description += `📦 PRODUTOS:\n`;
                products.forEach(p => {
                    description += `• ${p.quantity}x ${p.name}\n`;
                });
                description += `\n`;
            }

            description += `💡 AÇÕES RECOMENDADAS:\n`;
            description += `• Entrar em contato via WhatsApp\n`;
            description += `• Oferecer extensão de garantia\n`;
            description += `• Apresentar novos produtos\n`;
            description += `• Agendar revisão preventiva\n`;

            // Passo 4: Criar a atividade no banco de dados
            const activityData = {
                _id: activityId,
                title: `⚠️ Garantia: ${customerData.name || 'Cliente'} - ${sale.warranty}`,
                type: 'warranty',
                assignedTo: sale.collaborator?._id || sale.collaboratorId || sale.userId || sale.owner || sale.createdBy || null,
                leadId: leadId,
                leadName: leadData.name || customerData.name || '',
                leadEmail: leadData.email || contactInfo.email || '',
                leadPhone: phone,
                saleId: saleId,
                description: description,
                scheduledDate: reminderDate.toISOString().split('T')[0],
                scheduledTime: '09:00',
                priority: 'high',
                status: 'pending',
                owner: this.storeID,
                registerDate: new Date(),
                modifiedDate: new Date(),
                tags: ['garantia', 'lembrete-automatico', 'oportunidade-venda'],
                warrantyData: {
                    originalText: sale.warranty,
                    type: warrantyInfo.type,
                    duration: warrantyInfo.duration,
                    unit: warrantyInfo.unit,
                    expiryDate: warrantyInfo.expiryDate,
                    reminderDate: reminderDate
                }
            };

            // Salvar no banco
            batch.update(
                this.iToolsService.database().collection('CRMActivities').doc(activityId),
                activityData,
                { merge: true }
            );

            await batch.commit();
            console.log('✅ Lembrete de garantia criado com sucesso!');

        } catch (error) {
            console.error('❌ Erro ao criar lembrete de garantia:', error);
        }
    }

    /**
     * 🆕 PARSER DE INFORMAÇÕES DE GARANTIA
     * Este método entende o texto da garantia (ex: "6 meses", "1 ano", "10.000 km")
     */
    private parseWarrantyInfo(warrantyText: string): any {
        try {
            const text = warrantyText.toLowerCase().trim();

            // Lista de padrões para detectar tempo
            const timePatterns = [
                { regex: /(\d+)\s*(ano|anos)/i, unit: 'year' },
                { regex: /(\d+)\s*(mês|mes|meses)/i, unit: 'month' },
                { regex: /(\d+)\s*(dia|dias)/i, unit: 'day' },
                { regex: /(\d+)\s*(semana|semanas)/i, unit: 'week' }
            ];

            // Padrão para detectar kilometragem
            const kmPattern = /(\d+\.?\d*)\s*(km|kilometros?|quilômetros?)/i;

            // Verificar se a garantia é por tempo (dias, meses, anos)
            for (const pattern of timePatterns) {
                const match = text.match(pattern.regex);
                if (match) {
                    const duration = parseInt(match[1]);
                    const expiryDate = new Date();

                    // Calcular data de vencimento baseado no tipo
                    switch (pattern.unit) {
                        case 'year':
                            expiryDate.setFullYear(expiryDate.getFullYear() + duration);
                            break;
                        case 'month':
                            expiryDate.setMonth(expiryDate.getMonth() + duration);
                            break;
                        case 'week':
                            expiryDate.setDate(expiryDate.getDate() + (duration * 7));
                            break;
                        case 'day':
                            expiryDate.setDate(expiryDate.getDate() + duration);
                            break;
                    }

                    return {
                        type: 'time',
                        duration: duration,
                        unit: pattern.unit,
                        expiryDate: expiryDate
                    };
                }
            }

            // Verificar se a garantia é por kilometragem
            const kmMatch = text.match(kmPattern);
            if (kmMatch) {
                return {
                    type: 'mileage',
                    duration: parseFloat(kmMatch[1]),
                    unit: 'km',
                    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) // Estima 1 ano
                };
            }

            // Se não conseguiu entender o texto, assume 1 ano de garantia
            console.log('⚠️ Não foi possível fazer parse da garantia, assumindo 1 ano');
            const defaultExpiry = new Date();
            defaultExpiry.setFullYear(defaultExpiry.getFullYear() + 1);

            return {
                type: 'time',
                duration: 1,
                unit: 'year',
                expiryDate: defaultExpiry
            };

        } catch (error) {
            console.error('❌ Erro ao fazer parse da garantia:', error);
            return null;
        }
    }

    /**
     * 🆕 CALCULAR DATA DO LEMBRETE
     * Este método decide quando devemos lembrar o cliente sobre a garantia
     */
    private calculateWarrantyReminderDate(warrantyInfo: any): Date {
        const reminderDate = new Date(warrantyInfo.expiryDate);

        // Por padrão, lembrar 30 dias antes do vencimento
        let daysBefore = 30;

        // Ajustar baseado na duração da garantia
        if (warrantyInfo.unit === 'day' && warrantyInfo.duration <= 30) {
            // Para garantias muito curtas (menos de 30 dias), lembrar em 1/3 do tempo
            daysBefore = Math.floor(warrantyInfo.duration / 3);
        } else if (warrantyInfo.unit === 'week') {
            // Para garantias em semanas, lembrar 1 semana antes
            daysBefore = 7;
        } else if (warrantyInfo.unit === 'month' && warrantyInfo.duration <= 3) {
            // Para garantias curtas (até 3 meses), lembrar 15 dias antes
            daysBefore = 15;
        }

        // Subtrair os dias da data de vencimento
        reminderDate.setDate(reminderDate.getDate() - daysBefore);

        // Se a data calculada já passou, colocar o lembrete para amanhã
        const today = new Date();
        if (reminderDate < today) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            return tomorrow;
        }

        return reminderDate;
    }
    /**
  * ✅ CRIAR ATIVIDADE DE FOLLOW-UP (VERSÃO CORRIGIDA)
  * Agora incluindo produtos E serviços
  */
    private async createFollowUpActivity(leadId: string, sale: any, saleId: string, saleValue: number): Promise<void> {
        try {
            const activityId = `followup_${saleId}_${Date.now()}`;
            const batch = this.iToolsService.database().batch();
            const customerData = sale.customer || {};

            // Extrair dados da venda
            const products = this.extractProducts(sale);
            const services = this.extractServices(sale);
            const serviceData = this.extractServiceDataForCRM(sale);

            // Construir detalhes dos produtos E serviços
            const productDetails = this.buildProductsDetails(products);
            const servicesDetails = this.buildServicesDetails(services);
            const serviceOrderDetails = this.buildServiceOrderDetails(serviceData);

            // Montar descrição completa
            let description = `Follow-up urgente - Venda pendente\nValor: ${this.formatCurrency(saleValue)}\nVenda: ${saleId}`;

            // Adicionar produtos se existirem
            if (productDetails) {
                description += productDetails;
            }

            // Adicionar serviços OU ordem de serviço
            if (serviceOrderDetails) {
                description += serviceOrderDetails;
            } else if (servicesDetails) {
                description += servicesDetails;
            }

            const activityData = {
                title: `Follow-up: ${customerData.name || 'Cliente'} - Venda Pendente`,
                type: 'call',
                assignedTo: sale.collaborator?._id || sale.collaboratorId || sale.userId || sale.owner || sale.createdBy || null,
                leadId: leadId,
                saleId: saleId,
                description: description,
                scheduledDate: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
                priority: 'urgent',
                status: 'pending',
                owner: this.storeID,
                registerDate: new Date(),
                tags: ['follow-up', 'venda-pendente']
            };

            batch.update(
                this.iToolsService.database().collection('CRMActivities').doc(activityId),
                activityData,
                { merge: true }
            );

            await batch.commit();
            console.log('✅ Atividade de follow-up criada');

        } catch (error) {
            console.error('❌ Erro ao criar atividade de follow-up:', error);
        }
    }
    /**
    * ✅ VERIFICAR SE JÁ EXISTE ATIVIDADE DE RECUPERAÇÃO
    */
    private async checkExistingRecoveryActivity(saleId: string): Promise<boolean> {
        try {
            console.log('🔍 Verificando atividade de recuperação para venda:', saleId);

            // Buscar TODAS as atividades relacionadas a esta venda
            const activities = await this.iToolsService.database()
                .collection('CRMActivities')
                .where([
                    { field: 'saleId', operator: '=', value: saleId },
                    { field: 'owner', operator: '=', value: this.storeID }
                ])
                .get();

            // Verificar se alguma tem tag de recuperação
            if (activities.docs && activities.docs.length > 0) {
                for (const doc of activities.docs) {
                    const activity = doc.data();

                    // Verificar por tags OU pelo título
                    if ((activity.tags && activity.tags.includes('recuperacao')) ||
                        (activity.title && activity.title.includes('Recuperação'))) {
                        console.log('✅ Atividade de recuperação já existe:', doc.id);
                        return true;
                    }
                }
            }

            console.log('❌ Nenhuma atividade de recuperação encontrada');
            return false;

        } catch (error) {
            console.error('❌ Erro ao verificar atividade de recuperação:', error);
            return false; // ✅ MUDADO: retornar false em caso de erro
        }
    }

    /**
   * ✅ CRIAR ATIVIDADE DE RECUPERAÇÃO (VERSÃO CORRIGIDA)
   * Agora incluindo produtos E serviços
   */
    private async createRecoveryActivity(leadId: string, sale: any, saleId: string, saleValue: number): Promise<boolean> {
        try {
            // ⚠️ PROTEÇÃO EXTRA: Verificar novamente antes de criar
            const alreadyExists = await this.checkExistingRecoveryActivity(saleId);
            if (alreadyExists) {
                console.log('⏭️ Atividade de recuperação já existe, pulando criação');
                return false;
            }

            // Usar ID único baseado no saleId (sem timestamp para evitar duplicatas)
            const activityId = `recovery_${saleId}_${this.storeID}`;
            const batch = this.iToolsService.database().batch();
            const customerData = sale.customer || {};

            // Extrair dados da venda
            const products = this.extractProducts(sale);
            const services = this.extractServices(sale);
            const serviceData = this.extractServiceDataForCRM(sale);

            // Construir detalhes dos produtos E serviços
            const productDetails = this.buildProductsDetails(products);
            const servicesDetails = this.buildServicesDetails(services);
            const serviceOrderDetails = this.buildServiceOrderDetails(serviceData);

            // Montar descrição completa
            let description = `Tentar recuperar venda cancelada\nValor: ${this.formatCurrency(saleValue)}\nMotivo: ${sale.cancelReason || 'Não informado'}`;

            // Adicionar produtos se existirem
            if (productDetails) {
                description += productDetails;
            }

            // Adicionar serviços OU ordem de serviço
            if (serviceOrderDetails) {
                description += serviceOrderDetails;
            } else if (servicesDetails) {
                description += servicesDetails;
            }

            const activityData = {
                _id: activityId, // ID fixo para evitar duplicatas
                title: `Recuperação: ${customerData.name || 'Cliente'} - Venda Cancelada`,
                type: 'call',
                assignedTo: sale.collaborator?._id || sale.collaboratorId || sale.userId || sale.owner || sale.createdBy || null,
                leadId: leadId,
                saleId: saleId,
                description: description,
                scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
                priority: 'urgent',
                status: 'pending',
                owner: this.storeID,
                registerDate: new Date(),
                tags: ['recuperacao', 'venda-cancelada'],
                uniqueKey: `${saleId}_recovery` // Chave única adicional
            };

            // ✅ CORRETO - usar update com merge
            batch.update(
                this.iToolsService.database().collection('CRMActivities').doc(activityId),
                activityData,
                { merge: true }
            );

            await batch.commit();
            console.log('✅ Atividade de recuperação criada com ID fixo:', activityId);
            return true;

        } catch (error) {
            console.error('❌ Erro ao criar atividade de recuperação:', error);
            return false;
        }
    }

    /**
  * ✅ CONCLUIR ATIVIDADES DE PÓS-VENDA
  */
    private async completePostSaleActivities(saleId: string): Promise<void> {
        try {
            // 🆕 BUSCAR ATIVIDADES MAIS ESPECÍFICAS
            const activities = await this.iToolsService.database()
                .collection('CRMActivities')
                .where([
                    { field: 'owner', operator: '=', value: this.storeID },
                    { field: 'status', operator: '=', value: 'pending' }
                ])
                .get();

            if (activities.docs) {
                const batch = this.iToolsService.database().batch();
                let count = 0;
                const processedIds = new Set<string>(); // 🆕 Evitar processar duplicatas

                for (const doc of activities.docs) {
                    const activity = doc.data();

                    // 🆕 VERIFICAÇÃO MAIS ESPECÍFICA
                    const isPostSaleForThisSale = (
                        activity.saleId === saleId &&
                        activity.tags &&
                        activity.tags.includes('pos-venda')
                    ) || (
                            activity.description &&
                            activity.description.includes(`Venda: ${saleId}`) &&
                            activity.type === 'whatsapp'
                        );

                    if (isPostSaleForThisSale && !processedIds.has(doc.id)) {
                        processedIds.add(doc.id); // 🆕 Marcar como processado

                        batch.update(
                            this.iToolsService.database().collection('CRMActivities').doc(doc.id),
                            {
                                status: 'completed',
                                completedDate: new Date(),
                                completedNote: 'Concluída automaticamente - Venda cancelada',
                                modifiedDate: new Date()
                            },
                            { merge: true }
                        );
                        count++;
                    }
                }

                if (count > 0) {
                    await batch.commit();
                    console.log(`✅ ${count} atividade(s) de pós-venda concluída(s)`);
                }
            }
        } catch (error) {
            console.error('❌ Erro ao concluir atividades:', error);
        }
    }
    /**
     * ✅ FINALIZAR ATIVIDADES DE GARANTIA
     * Finaliza lembretes de garantia quando a venda é cancelada
     */
    private async completeWarrantyActivities(saleId: string): Promise<void> {
        try {
            console.log('🛡️ Finalizando atividades de garantia para venda cancelada:', saleId);

            // Buscar atividades de garantia desta venda
            const activities = await this.iToolsService.database()
                .collection('CRMActivities')
                .where([
                    { field: 'owner', operator: '=', value: this.storeID },
                    { field: 'saleId', operator: '=', value: saleId },
                    { field: 'type', operator: '=', value: 'warranty' },
                    { field: 'status', operator: '=', value: 'pending' }
                ])
                .get();

            if (activities.docs && activities.docs.length > 0) {
                const batch = this.iToolsService.database().batch();
                let count = 0;

                for (const doc of activities.docs) {
                    batch.update(
                        this.iToolsService.database().collection('CRMActivities').doc(doc.id),
                        {
                            status: 'completed',
                            completedDate: new Date(),
                            completedNote: '🚫 Finalizada automaticamente - Venda cancelada (sem garantia)',
                            modifiedDate: new Date()
                        },
                        { merge: true }
                    );
                    count++;
                }

                if (count > 0) {
                    await batch.commit();
                    console.log(`✅ ${count} atividade(s) de garantia finalizada(s)`);
                }
            }
        } catch (error) {
            console.error('❌ Erro ao finalizar atividades de garantia:', error);
        }
    }
    /**
     * ✅ NOVO MÉTODO: Fechar atividades de follow-up
     */
    private async closeFollowUpActivities(leadId: string, saleId: string): Promise<void> {
        try {
            console.log('📋 GLOBAL: Fechando atividades de follow-up...');

            const activities = await this.iToolsService.database()
                .collection('CRMActivities')
                .where([
                    { field: 'leadId', operator: '=', value: leadId },
                    { field: 'status', operator: '=', value: 'pending' },
                    { field: 'owner', operator: '=', value: this.storeID }
                ])
                .get();

            if (activities.docs && activities.docs.length > 0) {
                const batch = this.iToolsService.database().batch();
                let count = 0;
                let activityNames: string[] = [];

                for (const doc of activities.docs) {
                    const activity = doc.data();
                    // Fecha apenas atividades de follow-up (não pós-venda)
                    if (activity.type === 'call' || (activity.tags && activity.tags.includes('follow-up'))) {
                        batch.update(
                            this.iToolsService.database().collection('CRMActivities').doc(doc.id),
                            {
                                status: 'completed',
                                completedDate: new Date(),
                                completedNote: '✅ Concluída automaticamente - Venda finalizada',
                                modifiedDate: new Date()
                            },
                            { merge: true }
                        );
                        activityNames.push(activity.title || 'Atividade');
                        count++;
                    }
                }

                if (count > 0) {
                    await batch.commit();
                    console.log(`✅ GLOBAL: ${count} atividades de follow-up fechadas`);

                    // NOTIFICAR SOBRE CONCLUSÃO
                    this.notificationService.create({
                        title: '✅ Atividades Concluídas',
                        description: `${count} atividade(s) de follow-up concluída(s) automaticamente`,
                        status: ENotificationStatus.success
                    });
                }
            }

        } catch (error) {
            console.error('❌ GLOBAL: Erro ao fechar atividades:', error);
        }
    }

    /**
     * ✅ CONSTRUIR NOTAS PARA VENDA CONCLUÍDA - COM PRODUTOS E PAGAMENTOS
     */
    private buildConcludedSaleNotes(sale: any, saleId: string, saleValue: number): string {
        let notes = `VENDA CONCLUÍDA\n`;
        notes += `📅 ${this.formatDate(new Date())}\n`;
        notes += `💰 Valor: ${this.formatCurrency(saleValue)}\n`;

        // Adicionar produtos se existirem
        if (sale.products && Array.isArray(sale.products) && sale.products.length > 0) {
            notes += `\n📦 PRODUTOS (${sale.products.length}):\n`;
            sale.products.forEach(product => {
                const qty = product.quantity || 1;
                const name = product.name || product.productName || 'Produto';
                const total = product.total || product.totalValue || product.value || 0;
                notes += `• ${qty}x ${name} - ${this.formatCurrency(total)}\n`;
            });
        }

        // Adicionar formas de pagamento se existirem
        if (sale.payments && Array.isArray(sale.payments) && sale.payments.length > 0) {
            notes += `\n💳 PAGAMENTO:\n`;
            sale.payments.forEach(payment => {
                const method = payment.paymentMethod?.name || payment.method || payment.name || 'Não informado';
                const value = payment.value || payment.amount || 0;
                notes += `• ${method}: ${this.formatCurrency(value)}\n`;
            });
        } else if (sale.paymentMethods && Array.isArray(sale.paymentMethods)) {
            notes += `\n💳 PAGAMENTO:\n`;
            sale.paymentMethods.forEach(payment => {
                const method = payment.name || 'Não informado';
                const value = payment.value || 0;
                notes += `• ${method}: ${this.formatCurrency(value)}\n`;
            });
        }
        if (sale.warranty) {
            notes += `\n🔒 Garantia: ${sale.warranty}`;
        }


        notes += `\n🆔 Venda: ${saleId}`;
        return notes;
    }

    /**
     * ✅ CONSTRUIR NOTAS PARA VENDA PENDENTE - COM PRODUTOS E PAGAMENTOS
     */
    private buildPendentSaleNotes(sale: any, saleId: string, saleValue: number): string {
        let notes = `VENDA PENDENTE - NEGOCIAÇÃO\n`;
        notes += `📅 ${this.formatDate(new Date())}\n`;
        notes += `💰 Valor: ${this.formatCurrency(saleValue)}\n`;
        notes += `🟡 Status: PENDENTE - Requer follow-up\n`;

        // Adicionar produtos se existirem
        if (sale.products && Array.isArray(sale.products) && sale.products.length > 0) {
            notes += `\n📦 PRODUTOS (${sale.products.length}):\n`;
            sale.products.forEach(product => {
                const qty = product.quantity || 1;
                const name = product.name || product.productName || 'Produto';
                const total = product.total || product.totalValue || product.value || 0;
                notes += `• ${qty}x ${name} - ${this.formatCurrency(total)}\n`;
            });
        }

        // Adicionar formas de pagamento se existirem
        if (sale.payments && Array.isArray(sale.payments) && sale.payments.length > 0) {
            notes += `\n💳 PAGAMENTO:\n`;
            sale.payments.forEach(payment => {
                const method = payment.paymentMethod?.name || payment.method || payment.name || 'Não informado';
                const value = payment.value || payment.amount || 0;
                notes += `• ${method}: ${this.formatCurrency(value)}\n`;
            });
        }

        notes += `\n📞 AÇÃO: Entrar em contato para fechar venda\n`;
        notes += `🆔 Venda: ${saleId}`;

        return notes;
    }

    /**
  * 🔧 CONSTRUIR NOTAS PARA ORDEM DE SERVIÇO CONCLUÍDA
  * Método auxiliar para criar notas específicas de OS
  */
    private buildServiceOrderCompletedNotes(sale: any, saleId: string, saleValue: number): string {
        let notes = `🔧 ORDEM DE SERVIÇO CONCLUÍDA\n`;
        notes += `📅 ${this.formatDate(new Date())}\n`;
        notes += `💰 Valor Total: ${this.formatCurrency(saleValue)}\n`;
        notes += `✅ Status: FINALIZADA\n`;

        // Adicionar código da OS se existir
        if (sale.service && sale.service.code) {
            notes += `🔧 OS: #${sale.service.code}\n`;
        }

        // Adicionar equipamento se existir
        if (sale.equipment || sale.service?.equipment) {
            const equipment = sale.equipment || sale.service.equipment;
            notes += `📱 Equipamento: ${equipment.model || equipment.brand || equipment}\n`;
        }

        // Adicionar serviços realizados
        if (sale.service && sale.service.types && Array.isArray(sale.service.types)) {
            notes += `\n🔧 SERVIÇOS (${sale.service.types.length}):\n`;
            sale.service.types.forEach(service => {
                const name = service.name || service.description || 'Serviço';
                const value = service.executionPrice || service.price || 0;
                notes += `• ${name} - ${this.formatCurrency(value)}\n`;
            });
        }

        // Adicionar produtos se existirem
        if (sale.products && Array.isArray(sale.products) && sale.products.length > 0) {
            notes += `\n📦 PRODUTOS (${sale.products.length}):\n`;
            sale.products.forEach(product => {
                const qty = product.quantity || 1;
                const name = product.name || product.productName || 'Produto';
                const total = product.total || product.totalValue || product.value || 0;
                notes += `• ${qty}x ${name} - ${this.formatCurrency(total)}\n`;
            });
        }

        // Adicionar formas de pagamento
        if (sale.payments && Array.isArray(sale.payments) && sale.payments.length > 0) {
            notes += `\n💳 PAGAMENTO:\n`;
            sale.payments.forEach(payment => {
                const method = payment.paymentMethod?.name || payment.method || payment.name || 'Não informado';
                const value = payment.value || payment.amount || 0;
                notes += `• ${method}: ${this.formatCurrency(value)}\n`;
            });
        } else if (sale.paymentMethods && Array.isArray(sale.paymentMethods)) {
            notes += `\n💳 PAGAMENTO:\n`;
            sale.paymentMethods.forEach(payment => {
                const method = payment.name || 'Não informado';
                const value = payment.value || 0;
                notes += `• ${method}: ${this.formatCurrency(value)}\n`;
            });
        }

        // 🆕 ADICIONAR GARANTIA SE EXISTIR
        const warranty = sale.service?.warranty || sale.warranty;
        if (warranty && warranty.trim() !== '') {
            notes += `\n🛡️ GARANTIA: ${warranty}\n`;
        }

        notes += `\n🆔 Venda: ${saleId}`;
        notes += `\n🏷️ Origem: Ordem de Serviço`;

        return notes;
    }

    /**
     * ✅ VERIFICAR SE JÁ EXISTE ATIVIDADE DE PÓS-VENDA (MELHORADO)
     */
    private async checkExistingPostSaleActivity(leadId: string, saleId: string): Promise<boolean> {
        try {
            console.log('🔍 GLOBAL: Verificando atividade existente:', { leadId, saleId });

            // 🆕 Verificar por múltiplos critérios para garantir
            const activities = await this.iToolsService.database()
                .collection('CRMActivities')
                .where([
                    { field: 'owner', operator: '=', value: this.storeID },
                    { field: 'leadId', operator: '=', value: leadId }
                ])
                .get();

            if (activities.docs && activities.docs.length > 0) {
                for (const doc of activities.docs) {
                    const activity = doc.data();
                    // Verificar se é pós-venda por múltiplos critérios
                    if (
                        (activity.saleId === saleId) ||
                        (activity.type === 'whatsapp' && activity.tags?.includes('pos-venda')) ||
                        (activity.title && activity.title.includes('Pós-venda'))
                    ) {
                        console.log('✅ GLOBAL: Atividade de pós-venda já existe');
                        return true;
                    }
                }
            }

            return false;

        } catch (error) {
            console.error('❌ GLOBAL: Erro ao verificar atividade existente:', error);
            return false;
        }
    }

    /**
     * ✅ DETECTAR MUDANÇAS NA VENDA
     */
    private hasSignificantChanges(sale: any): boolean {
        const saleId = sale.id || sale._id;
        const previousSnapshot = this.saleSnapshots.get(saleId);

        // Criar snapshot atual
        const currentSnapshot = {
            value: this.extractValue(sale),
            productsCount: sale.products?.length || 0,
            products: JSON.stringify(sale.products || []),
            payments: JSON.stringify(sale.payments || sale.paymentMethods || []),
            modifiedDate: sale.modifiedDate || sale.updatedAt,
            status: sale.status
        };

        // Se não tem snapshot anterior, salva e retorna false
        if (!previousSnapshot) {
            this.saleSnapshots.set(saleId, currentSnapshot);
            return false;
        }

        // Comparar com snapshot anterior (excluindo mudança de status)
        const hasChanges = (
            previousSnapshot.value !== currentSnapshot.value ||
            previousSnapshot.productsCount !== currentSnapshot.productsCount ||
            previousSnapshot.products !== currentSnapshot.products ||
            previousSnapshot.payments !== currentSnapshot.payments
        );

        if (hasChanges) {
            console.log('✏️ GLOBAL: Mudanças detectadas na venda:', {
                valorAnterior: previousSnapshot.value,
                valorAtual: currentSnapshot.value,
                produtosAnterior: previousSnapshot.productsCount,
                produtosAtual: currentSnapshot.productsCount
            });
        }

        // Sempre atualizar snapshot
        this.saleSnapshots.set(saleId, currentSnapshot);

        return hasChanges;
    }

    /**
     * ✅ UTILITÁRIOS
     */
    private extractValue(sale: any): number {
        return sale.balance?.total || sale.value || sale.total || 0;
    }

    /**
     * ✅ EXTRAIR PRODUTOS DA VENDA - VERSÃO CORRIGIDA COM VALORES
     */
    private extractProducts(sale: any): any[] {
        try {
            if (!sale.products || !Array.isArray(sale.products)) {
                return [];
            }

            return sale.products.map(product => {
                const quantity = product.quantity || 1;
                const name = product.name || product.productName || product.product?.name || 'Produto';

                // Buscar valor em TODOS os lugares possíveis
                let finalValue = 0;

                // Lista de todos os campos possíveis para valor total
                const totalFields = [
                    'total', 'totalValue', 'value', 'amount', 'subtotal',
                    'totalAmount', 'finalValue', 'productTotal', 'itemTotal'
                ];

                // Lista de todos os campos possíveis para valor unitário
                const unitFields = [
                    'unitaryPrice', 'unitaryCost', 'unitaryValue', 'unitPrice',
                    'price', 'salePrice', 'sellingPrice', 'productPrice', 'cost'
                ];

                // Buscar valor total
                for (const field of totalFields) {
                    if (product[field] && product[field] > 0) {
                        finalValue = product[field];
                        break;
                    }
                }

                // Se não encontrou, tentar no balance
                if (finalValue === 0 && product.balance) {
                    for (const field of totalFields) {
                        if (product.balance[field] && product.balance[field] > 0) {
                            finalValue = product.balance[field];
                            break;
                        }
                    }
                }

                // Buscar valor unitário
                let unitValue = 0;
                for (const field of unitFields) {
                    if (product[field] && product[field] > 0) {
                        unitValue = product[field];
                        break;
                    }
                }

                // Se não encontrou unitário mas tem total, calcular
                if (unitValue === 0 && finalValue > 0) {
                    unitValue = finalValue / quantity;
                }

                // Se não encontrou total mas tem unitário, calcular
                if (finalValue === 0 && unitValue > 0) {
                    finalValue = unitValue * quantity;
                }

                // Se ainda não tem valor, pode ser que o valor total da venda seja de 1 produto só
                if (finalValue === 0 && sale.products.length === 1) {
                    finalValue = this.extractValue(sale);
                    unitValue = finalValue / quantity;
                }

                return {
                    name: name,
                    quantity: quantity,
                    unitPrice: unitValue,
                    total: finalValue
                };
            });
        } catch (error) {
            console.error('❌ Erro ao extrair produtos:', error);
            return [];
        }
    }

    /**
     * ✅ EXTRAIR SERVIÇOS DA VENDA - VERSÃO CORRIGIDA
     */
    private extractServices(sale: any): any[] {
        try {
            let services: any[] = [];

            if (sale.services && Array.isArray(sale.services)) {
                services = sale.services.map(service => {
                    const quantity = service.quantity || 1;

                    // Extrair preço do serviço
                    const unitPrice = service.executionPrice ||
                        service.price ||
                        service.value ||
                        service.unitPrice ||
                        service.unitaryPrice || 0;

                    // Extrair total
                    const total = service.total ||
                        service.totalValue ||
                        service.value ||
                        service.amount ||
                        (unitPrice * quantity);

                    return {
                        name: service.name || service.serviceName || service.description || 'Serviço',
                        quantity: quantity,
                        price: unitPrice,
                        unitPrice: unitPrice,
                        total: total
                    };
                });
            }

            // Se for ordem de serviço, tentar extrair dos tipos
            else if (sale.service && sale.service.types && Array.isArray(sale.service.types)) {
                services = sale.service.types.map(serviceType => {
                    const quantity = serviceType.quantity || 1;
                    const unitPrice = serviceType.executionPrice ||
                        serviceType.price ||
                        serviceType.value || 0;
                    const total = serviceType.total || (unitPrice * quantity);

                    return {
                        name: serviceType.name || serviceType.description || 'Serviço',
                        quantity: quantity,
                        price: unitPrice,
                        unitPrice: unitPrice,
                        total: total
                    };
                });
            }

            console.log('🔧 GLOBAL: Serviços extraídos:', services);
            return services;
        } catch (error) {
            console.error('❌ GLOBAL: Erro ao extrair serviços:', error);
            return [];
        }
    }

    /**
     * ✅ EXTRAIR FORMAS DE PAGAMENTO
     */
    private extractPaymentMethods(sale: any): any[] {
        try {
            console.log('💳 GLOBAL: Extraindo formas de pagamento:', sale);

            let paymentMethods: any[] = [];

            // Verificar sale.payments (mais comum)
            if (sale.payments && Array.isArray(sale.payments) && sale.payments.length > 0) {
                paymentMethods = sale.payments.map(payment => ({
                    name: payment.paymentMethod?.name || payment.method || payment.name || 'Não informado',
                    value: payment.value || payment.amount || 0
                }));
                console.log('💳 GLOBAL: Encontrado em sale.payments:', paymentMethods);
                return paymentMethods;
            }

            // Verificar sale.paymentMethods  
            if (sale.paymentMethods && Array.isArray(sale.paymentMethods) && sale.paymentMethods.length > 0) {
                paymentMethods = sale.paymentMethods.map(payment => ({
                    name: payment.name || payment.method || payment.type || 'Não informado',
                    value: payment.value || payment.amount || 0
                }));
                console.log('💳 GLOBAL: Encontrado em sale.paymentMethods:', paymentMethods);
                return paymentMethods;
            }

            // Fallback
            console.log('💳 GLOBAL: Nenhuma forma de pagamento encontrada, usando padrão');
            return [{
                name: 'Não informado',
                value: this.extractValue(sale)
            }];

        } catch (error) {
            console.error('❌ GLOBAL: Erro ao extrair formas de pagamento:', error);
            return [{
                name: 'Erro na extração',
                value: this.extractValue(sale)
            }];
        }
    }

    /**
  * ✅ EXTRAIR DADOS DO SERVIÇO PARA CRM
  */
    public extractServiceDataForCRM(sale: any): any {
        if (!sale || !sale.service) {
            console.log('❌ GLOBAL: Venda sem dados de serviço');
            return null;
        }

        console.log('🔧 GLOBAL: Extraindo dados do serviço da venda:', sale.service);

        const serviceData = {
            serviceOrderId: sale.service._id || null,
            serviceOrderCode: sale.service.code || null,
            servicesTypes: sale.service.types || [],
            origin: 'SERVICE_ORDER',
            servicesDetails: this.formatServicesForDisplay(sale.service.types),
            entryDate: sale.entryDate || null,
            deliveryDate: sale.deliveryDate || null,
            equipment: sale.equipment || null,
            description: sale.description || null,
            responsible: sale.responsible || null,
            serviceStatus: sale.serviceStatus || 'CONCLUDED',
            products: sale.products || [],
            warranty: sale.service.warranty || sale.warranty || null  // 🆕 BUSCAR WARRANTY AQUI
        };

        console.log('✅ GLOBAL: Dados do serviço extraídos (com garantia):', serviceData);
        return serviceData;
    }
    /**
     * ✅ FORMATAR SERVIÇOS PARA EXIBIÇÃO
     */
    private formatServicesForDisplay(servicesTypes: any[]): string {
        if (!servicesTypes || servicesTypes.length === 0) {
            return 'Sem serviços especificados';
        }

        const serviceNames = servicesTypes.map(service => {
            return service.name ||
                service.serviceName ||
                service.description ||
                `Serviço ${service.code || ''}`;
        });

        const uniqueNames = [...new Set(serviceNames)].filter(name => name && name.trim());
        return uniqueNames.join(', ');
    }

    /**
     * ✅ VERIFICAR SE É ORDEM DE SERVIÇO
     */
    private isServiceOrderSale(sale: any): boolean {
        return !!(
            sale.origin === 'SERVICE_ORDER' ||
            (sale.service && (sale.service._id || sale.service.code)) ||
            (sale.service && sale.service.types && sale.service.types.length > 0)
        );
    }

    /**
     * ✅ VALIDAR CLIENTE
     */
    private isValidCustomer(name: string): boolean {
        return !!(name && name !== 'Cliente PDV' && name !== 'Cliente Venda');
    }

    /**
     * ✅ VALIDAR VALOR
     */
    private isValidValue(value: number): boolean {
        return !!(value && value > 0);
    }

    /**
     * ✅ CALCULAR SCORE
     */
    private calculateScore(value: number): number {
        if (value >= 1000) return 80;
        if (value >= 500) return 60;
        if (value >= 200) return 40;
        return 30;
    }

    /**
     * ✅ FORMATAR DATA
     */
    private formatDate(date: Date): string {
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * ✅ FORMATAR MOEDA
     */
    private formatCurrency(value: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    }
    /**
        * ✅ MONTAR DETALHES DOS PRODUTOS PARA ATIVIDADES
        */
    private buildProductsDetails(products: any[]): string {
        if (!products || products.length === 0) {
            return '';
        }

        let details = '\n\nProdutos:\n';
        for (const p of products) {
            const unit = this.formatCurrency(p.unitPrice || (p.total / (p.quantity || 1)));
            const total = this.formatCurrency(p.total);
            details += `• ${p.quantity}x ${p.name} - ${unit} un | Total: ${total}\n`;
        }
        return details;
    }
    /**
 * ✅ CONSTRUIR DETALHES DOS SERVIÇOS PARA ATIVIDADES
 * Método novo que faltava para mostrar serviços nas atividades
 */
    private buildServicesDetails(services: any[]): string {
        // Se não tem serviços, retorna vazio
        if (!services || services.length === 0) {
            return '';
        }

        // Construir string com os serviços
        let details = `\n\n🔧 SERVIÇOS (${services.length}):\n`;

        services.forEach(service => {
            const qty = service.quantity || 1;
            const name = service.name || 'Serviço';
            const total = service.total || service.value || 0;

            // Adicionar cada serviço na lista
            details += `• ${qty}x ${name} - ${this.formatCurrency(total)}\n`;
        });

        return details;
    }

    /**
     * ✅ CONSTRUIR DETALHES DA ORDEM DE SERVIÇO PARA ATIVIDADES
     * Método para mostrar dados específicos de OS nas atividades
     */
    private buildServiceOrderDetails(serviceData: any): string {
        // Se não tem dados de OS, retorna vazio
        if (!serviceData) {
            return '';
        }

        // Construir string com os dados da OS
        let details = `\n\n🔧 ORDEM DE SERVIÇO:\n`;

        // Adicionar código da OS se existir
        if (serviceData.serviceOrderCode) {
            details += `• Código: #${serviceData.serviceOrderCode}\n`;
        }

        // Adicionar serviços realizados
        if (serviceData.servicesDetails) {
            details += `• Serviços: ${serviceData.servicesDetails}\n`;
        }

        // Adicionar equipamento se existir
        if (serviceData.equipment) {
            details += `• Equipamento: ${serviceData.equipment}\n`;
        }

        // Adicionar responsável se existir
        if (serviceData.responsible) {
            details += `• Responsável: ${serviceData.responsible}\n`;
        }

        return details;
    }
    /**
     * ✅ PARAR MONITORAMENTO (LIMPAR MEMÓRIA)
     */
    public stopGlobalMonitoring(): void {
        console.log('⏹️ GLOBAL: Parando monitoramento...');

        // Cancelar debounces pendentes
        this.processingDebounce.forEach(timeoutId => clearTimeout(timeoutId));
        this.processingDebounce.clear();

        // Parar listeners
        this.salesListeners.forEach(listener => {
            if (listener && typeof listener === 'function') {
                listener();
            }
        });

        this.salesListeners = [];
        this.processingNow.clear();
        this.createdLeads.clear(); // 🆕 Limpar memória
        this.createdActivities.clear(); // 🆕 Limpar memória
        this.createdRecoveries.clear(); // 🆕 Limpar memória
        this.isMonitoring = false;
    }

    /**
     * ✅ VERIFICAR SE MONITORAMENTO ESTÁ ATIVO
     */
    public isMonitoringActive(): boolean {
        return this.isMonitoring;
    }

    /**
     * ✅ OBTER ESTATÍSTICAS DO MONITORAMENTO
     */
    public getMonitoringStats(): any {
        return {
            isActive: this.isMonitoring,
            listenersCount: this.salesListeners.length,
            processingCount: this.processingNow.size,
            tenant: this.storeID
        };
    }
}
