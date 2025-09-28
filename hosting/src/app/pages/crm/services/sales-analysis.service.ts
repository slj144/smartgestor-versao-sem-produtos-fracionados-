// Arquivo: sales-analysis.service.ts
// Caminho: src/app/pages/crm/services/sales-analysis.service.ts
// O que faz: Serviço para análise de vendas - VERSÃO CORRIGIDA COM BUSCA FUNCIONAL

import { Injectable } from '@angular/core';

// Serviços
import { IToolsService } from '@shared/services/iTools.service';
import { CrmService } from '../crm.service';

// Utilities
import { Utilities } from '@shared/utilities/utilities';
import { DateTime } from '@shared/utilities/dateTime';
import { ECashierSaleOrigin } from '@shared/interfaces/ICashierSale';

@Injectable()
export class SalesAnalysisService {

    constructor(
        private iToolsService: IToolsService,
        private crmService: CrmService
    ) { }

    /**
     * Helper para criar cláusula where com tipo correto
     */
    private createWhereClause(field: string, operator: string, value: any): any {
        return { field, operator: operator as any, value };
    }

    /**
     * Busca vendas por período
     * CORRIGIDO: Formato de data e campos corretos
     */
    public async getSalesByPeriod(
        dateFrom: string,
        dateTo: string,
        includeManagementSales: boolean = true
    ): Promise<any[]> {
        await this.iToolsService.ready();

        const sales = [];
        const tenant = Utilities.storeID;

        // CORREÇÃO: Adicionar hora no formato esperado
        const dateFromWithTime = `${dateFrom} 00:00:00`;
        const dateToWithTime = `${dateTo} 23:59:59`;

        console.log('📅 Buscando vendas do período:', dateFromWithTime, 'até', dateToWithTime);

        try {
            // 1. Buscar vendas do CRM (leads concluídos)
            const crmSales = await this.getCRMSales(dateFromWithTime, dateToWithTime, tenant);
            sales.push(...crmSales);

            // 2. Se tem sistema de gestão, buscar vendas do PDV e Ordens
            if (includeManagementSales) {
                // Vendas do PDV
                const pdvSales = await this.getPDVSales(dateFromWithTime, dateToWithTime, tenant);
                sales.push(...pdvSales);

                // Ordens de Serviço
                const orderSales = await this.getServiceOrders(dateFromWithTime, dateToWithTime, tenant);
                sales.push(...orderSales);
            }

            // 3. Remover duplicatas (vendas que já viraram lead)
            const uniqueSales = this.removeDuplicates(sales);

            // 4. Ordenar por data (mais recentes primeiro)
            uniqueSales.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateB.getTime() - dateA.getTime();
            });

            console.log(`📊 Total de vendas encontradas: ${uniqueSales.length}`);
            return uniqueSales;

        } catch (error) {
            console.error('Erro ao buscar vendas:', error);
            throw error;
        }
    }

    /**
     * Busca vendas do CRM (leads concluídos)
     */
    private async getCRMSales(dateFrom: string, dateTo: string, tenant: string): Promise<any[]> {
        try {
            console.log('🔍 Buscando vendas do CRM...');

            const where = [
                this.createWhereClause('owner', '=', tenant),
                this.createWhereClause('status', '=', 'closed'),
                // registros usam 'registerDate' para data do lead
                this.createWhereClause('registerDate', '>=', dateFrom),
                this.createWhereClause('registerDate', '<=', dateTo)
            ];

            const snapshot = await this.iToolsService.database()
                .collection('CRMLeads')
                .where(where)
                .get();

            console.log(`✅ CRM: ${snapshot.docs.length} leads concluídos encontrados`);

            // Filtrar leads que já possuem venda registrada para evitar duplicação
            const validDocs = snapshot.docs.filter(doc => {
                const d = doc.data();
                return !(Array.isArray(d.saleIds) && d.saleIds.length > 0);
            });

            console.log(`🗑️ CRM: ${snapshot.docs.length - validDocs.length} leads ignorados por já possuírem venda`);

            return validDocs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    source: 'crm',
                    code: data._id || doc.id,
                    date: data.registerDate || data.createdAt,
                    status: 'CONCLUDED',
                    customerId: data.customerId,
                    customerName: data.name,
                    customerPhone: data.phone,
                    customerEmail: data.email,
                    total: data.value || 0,
                    products: this.extractProductsFromLead(data),
                    services: [],
                    notes: data.notes,
                    isLead: true
                };
            });
        } catch (error) {
            console.error('Erro ao buscar vendas do CRM:', error);
            return [];
        }
    }

    /**
     * Busca vendas do PDV
     * CORRIGIDO: Busca por registerDate e status CONCLUDED
     */
    private async getPDVSales(dateFrom: string, dateTo: string, tenant: string): Promise<any[]> {
        try {
            console.log('🛒 Buscando vendas do PDV...');

            // Buscar por registerDate que é o campo mais confiável
            const where = [
                this.createWhereClause('owner', '=', tenant),
                this.createWhereClause('status', '=', 'CONCLUDED'), // Apenas vendas concluídas
                this.createWhereClause('registerDate', '>=', dateFrom),
                this.createWhereClause('registerDate', '<=', dateTo)
            ];

            const snapshot = await this.iToolsService.database()
                .collection('CashierSales')
                .where(where)
                .limit(500)
                .get();

            console.log(`✅ PDV: ${snapshot.docs.length} vendas encontradas`);

            return snapshot.docs.map(doc => {
                const data = doc.data();
                const customer = data.customer || {};

                // Extrair data correta
                const saleDate = data.paymentDate || data.registerDate || data.date;

                // Calcular total correto
                const total = data.balance?.total || data.total || data.value || 0;
                // Determinar a origem real da venda
                let source = 'pdv';
                switch (data.origin) {
                    case ECashierSaleOrigin.CRM:
                        source = 'crm';
                        break;
                    case ECashierSaleOrigin.SERVICE_ORDER:
                        source = 'orders';
                        break;
                    case ECashierSaleOrigin.REQUEST:
                        source = 'request';
                        break;
                }
                return {
                    id: doc.id,
                    source: source,
                    code: data.code || doc.id,
                    date: saleDate,
                    status: data.status || 'CONCLUDED',
                    customerId: customer._id || customer.id,
                    customerName: customer.name || 'Cliente não identificado',
                    customerPhone: customer.phone || '',
                    customerEmail: customer.email || '',
                    total: total,
                    products: data.products || [],
                    services: data.service?.types || [],
                    paymentMethods: data.paymentMethods || [],
                    notes: data.note || data.notes || '',
                    leadId: data.leadId,
                    // Dados extras para debug
                    _originalData: {
                        hasBalance: !!data.balance,
                        hasProducts: data.products?.length > 0,
                        hasServices: data.service?.types?.length > 0,
                        fields: Object.keys(data).filter(k => !k.startsWith('_'))
                    }
                };
            });
        } catch (error) {
            console.error('Erro ao buscar vendas do PDV:', error);
            return [];
        }
    }

    /**
     * Busca ordens de serviço
     * CORRIGIDO: Campos e status corretos
     */
    private async getServiceOrders(dateFrom: string, dateTo: string, tenant: string): Promise<any[]> {
        try {
            console.log('🔧 Buscando ordens de serviço...');

            const where = [
                this.createWhereClause('owner', '=', tenant),
                this.createWhereClause('status', 'in', ['CONCLUDED', 'DELIVERED']),
                this.createWhereClause('registerDate', '>=', dateFrom),
                this.createWhereClause('registerDate', '<=', dateTo)
            ];

            const snapshot = await this.iToolsService.database()
                .collection('ServiceOrders')
                .where(where)
                .limit(500)
                .get();

            console.log(`✅ Ordens: ${snapshot.docs.length} ordens encontradas`);

            return snapshot.docs.map(doc => {
                const data = doc.data();
                const customer = data.customer || {};

                // Calcular total incluindo serviços
                let total = data.balance?.total || data.total || data.value || 0;

                // Se não tem total mas tem serviços, calcular
                if (!total && data.services?.length > 0) {
                    total = data.services.reduce((sum, service) => {
                        return sum + (service.value || service.total || 0);
                    }, 0);
                }

                return {
                    id: doc.id,
                    source: 'orders',
                    code: data.code || doc.id,
                    date: data.registerDate || data.date || data.createdAt,
                    status: data.status,
                    customerId: customer._id || customer.id,
                    customerName: customer.name || 'Cliente não identificado',
                    customerPhone: customer.phone || '',
                    customerEmail: customer.email || '',
                    total: total,
                    products: data.products || [],
                    services: data.services || [],
                    notes: data.observations || data.notes || '',
                    leadId: data.leadId
                };
            });
        } catch (error) {
            console.error('Erro ao buscar ordens de serviço:', error);
            return [];
        }
    }

    /**
     * Remove vendas duplicadas
     * MELHORADO: Verificação mais inteligente
     */
    private removeDuplicates(sales: any[]): any[] {
        const seen = new Map();

        return sales.filter(sale => {
            // Se já é um lead do CRM, mantém
            if (sale.isLead) return true;

            // Se já tem leadId associado, remove (já foi convertido)
            if (sale.leadId) {
                console.log(`⚠️ Venda ${sale.code} já tem lead associado`);
                return false;
            }

            // Criar chave única baseada em múltiplos campos
            const key = `${sale.source}-${sale.id}`;

            if (seen.has(key)) {
                return false;
            }

            seen.set(key, true);
            return true;
        });
    }

    // ... resto dos métodos permanece igual ...

    /**
     * Extrai produtos de um lead
     */
    private extractProductsFromLead(lead: any): any[] {
        if (lead.customData?.products) {
            return lead.customData.products;
        }

        return [];
    }

    /**
 * Converte vendas em leads - MODIFICADO PARA CRIAR ATIVIDADE DE RECOMPRA
 */

    public async convertSalesToLeads(sales: any[]): Promise<any> {
        let created = 0;
        let errors = 0;
        let activitiesCreated = 0;

        console.log('🚀 ====================================');
        console.log('🚀 INICIANDO CONVERSÃO DE VENDAS EM LEADS');
        console.log('🚀 ====================================');
        console.log('📊 Total de vendas para processar:', sales.length);

        for (const sale of sales) {
            try {
                console.log('');
                console.log('📦 Processando venda:', sale.code);

                // Verificar se já existe lead
                const exists = await this.checkExistingLead(sale);

                if (!exists) {
                    // Preparar dados do lead
                    const leadData = {
                        name: sale.customerName || 'Cliente da Venda',
                        email: sale.customerEmail || '',
                        phone: sale.customerPhone || '',
                        source: this.getLeadSource(sale.source),
                        status: 'qualified',
                        value: sale.total || 0,
                        notes: this.buildLeadNotes(sale),
                        customData: {
                            saleId: sale.id || sale._id,
                            saleCode: sale.code,
                            saleDate: sale.date,
                            products: sale.products || [],
                            services: sale.services || [],
                            paymentMethods: sale.paymentMethods || []
                        }
                    };

                    console.log('📝 Dados do lead preparados:', {
                        name: leadData.name,
                        phone: leadData.phone,
                        value: leadData.value
                    });

                    // 🔑 CRIAR O LEAD E OBTER O ID CORRETO
                    console.log('📤 Criando lead no CRM...');
                    const leadId = await this.crmService.createLead(leadData);

                    // Agora o leadId já vem como string diretamente!
                    console.log('🆔 Lead ID recebido:', leadId);
                    console.log('🔍 Tipo do ID:', typeof leadId);

                    // Verificar se o ID é válido (formato de ID do Firebase)
                    if (leadId && typeof leadId === 'string' && leadId.length > 10) {
                        created++;
                        console.log('✅ Lead criado com sucesso!');
                        console.log('🆔 ID confirmado:', leadId);

                        // 🔄 CRIAR ATIVIDADE DE RECOMPRA
                        console.log('');
                        console.log('🔄 ====================================');
                        console.log('🔄 CRIANDO ATIVIDADE DE RECOMPRA');
                        console.log('🔄 ====================================');
                        console.log('🔗 Para o lead ID:', leadId);

                        // Aguardar para garantir que o lead foi indexado
                        await new Promise(resolve => setTimeout(resolve, 1000));

                        // Criar a atividade de recompra
                        const activityCreated = await this.createRecompraActivityForLead(
                            leadId,    // ID correto do lead
                            leadData,  // Dados do lead
                            sale       // Dados da venda
                        );

                        if (activityCreated) {
                            activitiesCreated++;
                            console.log('✅ Atividade de recompra criada!');
                            console.log('🔗 Vinculada ao lead:', leadId);
                        } else {
                            console.error('⚠️ Falha ao criar atividade');
                        }

                        // Marcar venda como convertida
                        await this.markSaleAsConverted(sale);

                    } else {
                        console.error('❌ ID inválido recebido:', leadId);
                        errors++;
                    }
                } else {
                    console.log('⚠️ Lead já existe, pulando...');
                }

            } catch (error) {
                console.error(`❌ Erro ao processar venda ${sale.code}:`, error);
                errors++;
            }
        }

        // Resultado final
        const result = {
            created,
            errors,
            activitiesCreated
        };

        console.log('');
        console.log('📊 ====================================');
        console.log('📊 RESULTADO FINAL');
        console.log('📊 ====================================');
        console.log('✅ Leads criados:', result.created);
        console.log('📋 Atividades criadas:', result.activitiesCreated);
        console.log('❌ Erros:', result.errors);

        return result;
    }
    /**
     * 🔄 CRIAR ATIVIDADE DE RECOMPRA COM LEADID CORRETO
     */
    // Arquivo: sales-analysis.service.ts
    // Localização: src/app/pages/reports/cashier/sales/sales-analysis.service.ts
    // MELHORIA: Método melhorado para garantir criação da atividade

    /**
     * 🔄 CRIAR ATIVIDADE DE RECOMPRA COM VALIDAÇÕES EXTRAS
     */
    private async createRecompraActivityForLead(
        leadId: string,
        leadData: any,
        sale: any
    ): Promise<boolean> {
        try {
            console.log('🔄 ===========================================');
            console.log('🔄 INICIANDO CRIAÇÃO DE ATIVIDADE DE RECOMPRA');
            console.log('🔄 ===========================================');
            console.log('🔑 Lead ID:', leadId);
            console.log('👤 Nome do cliente:', leadData.name);
            console.log('💰 Valor da venda:', sale.total);

            // 🔒 VALIDAÇÃO 1: Verificar se o leadId é válido
            if (!leadId || typeof leadId !== 'string' || leadId.trim() === '') {
                console.error('❌ LeadId inválido ou vazio!');
                return false;
            }

            // 📅 Definir data de agendamento (hoje mesmo para follow-up imediato)
            const followUpDate = new Date();
            followUpDate.setHours(10, 0, 0, 0); // Agendar para 10h da manhã

            // 📦 Preparar lista de produtos da venda
            const productsList = (sale.products || [])
                .map(p => `• ${p.name} (Qtd: ${p.quantity})`)
                .join('\n');

            // 📝 Montar dados completos da atividade
            const activityData = {
                // === DADOS BÁSICOS DA ATIVIDADE ===
                title: `🔄 Recompra - ${leadData.name || sale.customerName}`,
                type: 'followup' as const,
                status: 'pending' as const,
                priority: 'medium' as const,

                // Descrição detalhada para o vendedor
                description:
                    `📞 ATIVIDADE DE RECOMPRA\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                    `👤 Cliente: ${leadData.name || sale.customerName}\n` +
                    `📱 Telefone: ${leadData.phone || sale.customerPhone || 'Não informado'}\n` +
                    `📧 Email: ${leadData.email || sale.customerEmail || 'Não informado'}\n` +
                    `\n` +
                    `💰 Última compra: R$ ${sale.total?.toFixed(2) || '0.00'}\n` +
                    `📅 Data da compra: ${new Date(sale.date).toLocaleDateString('pt-BR')}\n` +
                    `🔖 Código da venda: ${sale.code}\n` +
                    `\n` +
                    `📦 PRODUTOS COMPRADOS:\n${productsList || 'Nenhum produto listado'}\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                    `💡 AÇÃO: Entrar em contato para oferecer recompra dos produtos acima`,

                // Data de agendamento
                scheduledDate: followUpDate.toISOString(),
                dueDate: followUpDate.toISOString(),

                // 🔑 CAMPO MAIS IMPORTANTE: VINCULAR AO LEAD
                leadId: leadId, // ⚠️ ESTE CAMPO É OBRIGATÓRIO!

                // Dados do lead para facilitar visualização
                leadName: leadData.name || sale.customerName || 'Cliente',
                leadPhone: leadData.phone || sale.customerPhone || '',
                leadEmail: leadData.email || sale.customerEmail || '',

                // Dados de controle
                owner: Utilities.storeID,
                createdBy: Utilities.currentLoginData?.userId || 'system',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),

                // 🏷️ METADADOS IMPORTANTES (informações extras)
                metadata: {
                    // Identificador do tipo de atividade
                    activityType: 'recompra', // 🔥 IMPORTANTE: identifica como recompra
                    source: 'sales-analysis', // De onde veio

                    // Backup do leadId (redundância de segurança)
                    leadId: leadId,

                    // Dados da venda original
                    saleId: sale.id || sale._id,
                    saleCode: sale.code,
                    saleDate: sale.date,

                    // Produtos e valores
                    products: sale.products || [],
                    services: sale.services || [],
                    lastPurchaseValue: sale.total || sale.value || 0,

                    // Informações do cliente (backup)
                    customerSince: sale.date,
                    customerName: leadData.name || sale.customerName,
                    customerPhone: leadData.phone || sale.customerPhone,
                    customerEmail: leadData.email || sale.customerEmail,

                    // Sugestões para o vendedor
                    suggestedProducts: sale.products || [],
                    suggestedApproach: 'follow-up-recompra',

                    // Flags de controle
                    autoCreated: true, // Criada automaticamente
                    createdFromSale: true, // Veio de uma venda
                    requiresWhatsApp: true // Sugerir contato via WhatsApp
                }
            };

            console.log('📋 Dados da atividade montados');
            console.log('🔍 Verificação final do leadId:', activityData.leadId);

            // 🔒 VALIDAÇÃO FINAL: Garantir que o leadId está presente
            if (!activityData.leadId) {
                console.error('❌ ERRO CRÍTICO: LeadId perdido durante montagem!');
                return false;
            }

            // 📤 ENVIAR PARA CRIAÇÃO
            console.log('📤 Enviando atividade para criação...');
            const activityId = await this.crmService.createActivity(activityData);

            // ✅ VERIFICAR RESULTADO
            if (activityId) {
                console.log('✅ ===================================');
                console.log('✅ ATIVIDADE CRIADA COM SUCESSO!');
                console.log('✅ ===================================');
                console.log('🆔 ID da atividade:', activityId);
                console.log('🔗 Vinculada ao lead:', activityData.leadId);
                console.log('📱 Telefone para contato:', activityData.leadPhone);
                return true;
            } else {
                console.error('❌ Falha ao criar atividade - ID não retornado');
                return false;
            }

        } catch (error) {
            console.error('❌ ===================================');
            console.error('❌ ERRO AO CRIAR ATIVIDADE DE RECOMPRA');
            console.error('❌ ===================================');
            console.error('Erro:', error);
            console.error('Stack:', error.stack);
            return false;
        }
    }

    /**
     * Verifica se já existe lead para o cliente
     */
    private async checkExistingLead(sale: any): Promise<boolean> {
        if (!sale.customerId && !sale.customerPhone && !sale.customerEmail) {
            return false;
        }

        try {
            const where = [
                this.createWhereClause('owner', '=', Utilities.storeID)
            ];

            // Busca por ID do cliente
            if (sale.customerId) {
                where.push(this.createWhereClause('customerId', '=', sale.customerId));
            }
            // Ou por telefone
            else if (sale.customerPhone) {
                where.push(this.createWhereClause('phone', '=', sale.customerPhone));
            }
            // Ou por email
            else if (sale.customerEmail) {
                where.push(this.createWhereClause('email', '=', sale.customerEmail));
            }

            const snapshot = await this.iToolsService.database()
                .collection('CRMLeads')
                .where(where)
                .limit(1)
                .get();

            return snapshot.docs.length > 0;

        } catch (error) {
            console.error('Erro ao verificar lead existente:', error);
            return false;
        }
    }

    /**
     * Obtém a fonte do lead baseado na origem da venda
     */
    private getLeadSource(saleSource: string): string {
        const sourceMap = {
            'pdv': 'Venda PDV',
            'crm': 'Website',
            'orders': 'Ordem de Serviço',
            'request': 'Pedido'
        };
        return sourceMap[saleSource] || 'Análise de Vendas';
    }

    /**
     * Constrói as notas do lead com informações da venda
     * MELHORADO: Inclui mais detalhes
     */
    private buildLeadNotes(sale: any): string {
        let notes = `🛍️ LEAD CRIADO A PARTIR DE ANÁLISE DE VENDAS\n\n`;
        notes += `📅 Data da Venda: ${DateTime.formatDate(sale.date).date}\n`;
        notes += `🏷️ Código: ${sale.code}\n`;
        notes += `💰 Valor Total: ${this.formatCurrency(sale.total)}\n`;
        notes += `📍 Origem: ${this.getLeadSource(sale.source)}\n\n`;

        // Produtos
        if (sale.products?.length > 0) {
            notes += `📦 PRODUTOS COMPRADOS:\n`;
            sale.products.forEach(p => {
                const price = p.unitaryPrice || p.unitPrice || p.salePrice || 0;
                const total = p.quantity * price;
                notes += `• ${p.name} - ${p.quantity}x ${this.formatCurrency(price)} = ${this.formatCurrency(total)}\n`;
            });
            notes += '\n';
        }

        // Serviços
        if (sale.services?.length > 0) {
            notes += `🔧 SERVIÇOS REALIZADOS:\n`;
            sale.services.forEach(s => {
                notes += `• ${s.name} - ${this.formatCurrency(s.value || s.total || 0)}\n`;
            });
            notes += '\n';
        }

        // Formas de pagamento
        if (sale.paymentMethods?.length > 0) {
            notes += `💳 FORMAS DE PAGAMENTO:\n`;
            sale.paymentMethods.forEach(pm => {
                notes += `• ${pm.name}: ${this.formatCurrency(pm.value)}\n`;
            });
            notes += '\n';
        }

        // Observações originais
        if (sale.notes) {
            notes += `📝 OBSERVAÇÕES DA VENDA:\n${sale.notes}\n\n`;
        }

        notes += `💡 SUGESTÕES DE ABORDAGEM:\n`;
        notes += `• Verificar satisfação com a compra\n`;
        notes += `• Oferecer produtos complementares\n`;
        notes += `• Apresentar programa de fidelidade\n`;
        notes += `• Solicitar avaliação/feedback\n`;

        return notes;
    }

    /**
  * Marca a venda como convertida em lead
  */
    private async markSaleAsConverted(sale: any): Promise<void> {
        try {
            // Adicionar flag na venda indicando que já foi convertida
            await this.iToolsService.database()
                .collection('CashierSales')
                .doc(sale.id || sale._id)
                .update({
                    convertedToLead: true,
                    convertedDate: new Date().toISOString()
                });

            console.log('✅ Venda marcada como convertida');
        } catch (error) {
            console.error('⚠️ Erro ao marcar venda como convertida:', error);
            // Não é crítico, então continua
        }
    }

    /**
     * Obtém a coleção baseado na origem da venda
     */
    private getCollectionBySaleSource(source: string): string {
        const collectionMap = {
            'pdv': 'CashierSales',
            'orders': 'ServiceOrders'
        };
        return collectionMap[source] || null;
    }

    /**
     * Formata valor monetário
     */
    private formatCurrency(value: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    }

    /**
     * Calcula estatísticas das vendas
     */
    public calculateStats(sales: any[]): {
        totalSales: number;
        totalValue: number;
        averageTicket: number;
        topCustomers: any[];
        topProducts: any[];
    } {
        const stats = {
            totalSales: sales.length,
            totalValue: sales.reduce((sum, sale) => sum + (sale.total || 0), 0),
            averageTicket: 0,
            topCustomers: [],
            topProducts: []
        };

        stats.averageTicket = stats.totalSales > 0
            ? stats.totalValue / stats.totalSales
            : 0;

        // Top clientes
        const customerMap = new Map();
        sales.forEach(sale => {
            if (sale.customerName && sale.customerName !== 'Cliente não identificado') {
                const key = sale.customerId || sale.customerName;
                const existing = customerMap.get(key) || {
                    id: sale.customerId,
                    name: sale.customerName,
                    total: 0,
                    count: 0
                };
                existing.total += sale.total || 0;
                existing.count += 1;
                customerMap.set(key, existing);
            }
        });

        stats.topCustomers = Array.from(customerMap.values())
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);

        // Top produtos
        const productMap = new Map();
        sales.forEach(sale => {
            sale.products?.forEach(product => {
                const key = product.id || product._id || product.name;
                const existing = productMap.get(key) || {
                    id: product.id || product._id,
                    name: product.name,
                    total: 0,
                    quantity: 0
                };

                const price = product.unitaryPrice || product.unitPrice || product.salePrice || 0;
                const productTotal = product.quantity * price;

                existing.total += productTotal;
                existing.quantity += product.quantity || 0;
                productMap.set(key, existing);
            });
        });

        stats.topProducts = Array.from(productMap.values())
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);

        return stats;
    }
}