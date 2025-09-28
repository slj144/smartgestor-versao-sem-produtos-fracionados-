// Arquivo: customer-import.service.ts
// Localização: src/app/pages/crm/services/customer-import.service.ts
// VERSÃO FINAL - Compatível com a estrutura existente do projeto

import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

// Serviços
import { IToolsService } from '@shared/services/iTools.service';
import { Utilities } from '@shared/utilities/utilities';

// Interfaces
export interface ICustomerAnalysis {
    customerId: string;
    customerName: string;
    email: string;
    phone: string;
    totalSpent: number;
    totalPurchases: number;
    averageTicket: number;
    lastPurchaseDate: Date;
    daysSinceLastPurchase: number;
    purchaseFrequency: number;
    category: 'hot' | 'warm' | 'cold' | 'new';
    priority: 'high' | 'medium' | 'low';
    score: number;
    source: string;
    observations: string[];
    recommendation: string;
}

export interface IImportProgress {
    status: 'idle' | 'fetching' | 'analyzing' | 'importing' | 'completed' | 'error';
    current: number;
    total: number;
    message: string;
}

@Injectable()
export class CustomerImportService {


    // Configurações de batch e performance
    private readonly BATCH_CONFIG = {
        batchSize: 100,          // Tamanho do batch para paginação
        delayBetweenBatches: 100, // Delay entre batches em ms
        parallelAnalysis: 10      // Análises em paralelo
    };
    // Mapa para acesso rápido aos dados brutos de cada cliente
    private customerRawDataMap = new Map<string, any>();

    // Subjects para comunicação
    private analysisResultsSubject = new BehaviorSubject<ICustomerAnalysis[]>([]);
    public analysisResults$ = this.analysisResultsSubject.asObservable();

    private importProgressSubject = new BehaviorSubject<IImportProgress>({
        status: 'idle',
        current: 0,
        total: 0,
        message: ''
    });
    public importProgress$ = this.importProgressSubject.asObservable();

    constructor(
        private iToolsService: IToolsService
    ) { }

    /**
     * Resetar progresso - MÉTODO ADICIONADO
     */
    public resetProgress(): void {
        this.updateProgress('idle', 0, 0, '');
        this.analysisResultsSubject.next([]);
        this.customerRawDataMap.clear();
    }

    /**
     * Obter dados brutos de um cliente analisado
     */
    public getCustomerRawData(customerId: string): any {
        return this.customerRawDataMap.get(customerId) || null;
    }

    /**
     * Debug de cliente específico - MÉTODO ADICIONADO
     */
    public async debugSpecificCustomer(customerName: string): Promise<void> {
        try {
            console.log(`\n🔍 DEBUG - Analisando cliente: "${customerName}"`);

            const collections = ['CashierSales', 'ServiceOrders', 'Sales', 'Requests'];
            let totalFound = 0;

            for (const collName of collections) {
                console.log(`\n📂 Verificando ${collName}...`);

                const snapshot = await this.iToolsService.database()
                    .collection(collName)
                    .where([{ field: 'owner', operator: '=', value: Utilities.storeID }])
                    .limit(1000) // Limitar para não sobrecarregar
                    .get();

                if (snapshot && snapshot.docs) {
                    const matchingDocs = [];

                    snapshot.docs.forEach(doc => {
                        const data = (doc as any).data();
                        const customer = data.customer || data.client || data.cliente || {};
                        const docCustomerName = customer.name || customer.nome || '';

                        if (docCustomerName.toUpperCase().includes(customerName.toUpperCase())) {
                            matchingDocs.push({
                                id: doc.id,
                                customerData: customer,
                                orderData: data
                            });
                            totalFound++;
                        }
                    });

                    if (matchingDocs.length > 0) {
                        console.log(`✅ Encontrados ${matchingDocs.length} documentos`);

                        // Mostrar resumo
                        const uniqueIds = new Set(matchingDocs.map(d => d.customerData._id).filter(id => id));
                        const uniqueCodes = new Set(matchingDocs.map(d => d.customerData.code).filter(code => code));

                        console.log(`   - IDs únicos: ${uniqueIds.size}`, Array.from(uniqueIds));
                        console.log(`   - Códigos únicos: ${uniqueCodes.size}`, Array.from(uniqueCodes));
                    }
                }
            }

            console.log(`\n📊 Total geral: ${totalFound} documentos encontrados`);

        } catch (error) {
            console.error('Erro no debug:', error);
        }
    }

    /**
     * ANALISAR CLIENTES - PONTO DE ENTRADA PRINCIPAL
     */
    public async analyzeCustomers(): Promise<ICustomerAnalysis[]> {
        try {
            console.log('🚀 Iniciando análise inteligente de clientes...');
            this.updateProgress('fetching', 0, 0, 'Contando documentos...');

            // Contar documentos em cada coleção
            const counts = await this.countAllDocuments();
            const totalDocuments = counts.sales + counts.cashier + counts.orders + counts.requests;

            console.log(`📊 Total de documentos encontrados: ${totalDocuments}`);
            console.log(`   - Vendas (Sales): ${counts.sales}`);
            console.log(`   - PDV (CashierSales): ${counts.cashier}`);
            console.log(`   - Ordens de Serviço: ${counts.orders}`);
            console.log(`   - Pedidos (Requests): ${counts.requests}`);

            if (totalDocuments === 0) {
                this.updateProgress('completed', 0, 0, 'Nenhum documento encontrado');
                return [];
            }

            // Mapa principal de clientes
            const customersMap = new Map<string, any>();
            let currentProgress = 0;

            // Processar cada coleção
            if (counts.sales > 0) {
                currentProgress = await this.processCollectionWithPagination(
                    'Sales', counts.sales, customersMap,
                    currentProgress, totalDocuments,
                    this.processSaleDocument
                );
            }

            if (counts.cashier > 0) {
                currentProgress = await this.processCollectionWithPagination(
                    'CashierSales', counts.cashier, customersMap,
                    currentProgress, totalDocuments,
                    this.processCashierSaleDocument
                );
            }

            if (counts.orders > 0) {
                currentProgress = await this.processCollectionWithPagination(
                    'ServiceOrders', counts.orders, customersMap,
                    currentProgress, totalDocuments,
                    this.processServiceOrderDocument
                );
            }

            if (counts.requests > 0) {
                currentProgress = await this.processCollectionWithPagination(
                    'Requests', counts.requests, customersMap,
                    currentProgress, totalDocuments,
                    this.processRequestDocument
                );
            }

            // Converter mapa em array e analisar
            const customers = Array.from(customersMap.values());

            // Salvar mapa para consultas posteriores no modal de detalhes
            this.customerRawDataMap = customersMap;
            console.log(`\n👥 Total de clientes únicos encontrados: ${customers.length}`);

            if (customers.length === 0) {
                this.updateProgress('completed', 0, 0, 'Nenhum cliente encontrado');
                return [];
            }

            // Analisar clientes
            this.updateProgress('analyzing', 0, customers.length, 'Analisando perfil dos clientes...');
            const analyses = await this.analyzeCustomersInParallel(customers);

            // Ordenar por score
            analyses.sort((a, b) => b.score - a.score);

            // Emitir resultados
            this.analysisResultsSubject.next(analyses);
            this.updateProgress('completed', analyses.length, analyses.length,
                `Análise concluída! ${analyses.length} clientes analisados.`);

            return analyses;

        } catch (error) {
            console.error('❌ Erro na análise:', error);
            this.updateProgress('error', 0, 0, 'Erro ao analisar clientes');
            throw error;
        }
    }

    /**
     * Processar coleção com paginação usando lastDoc
     */
    private async processCollectionWithPagination(
        collectionName: string,
        totalCount: number,
        customersMap: Map<string, any>,
        currentProgress: number,
        totalProgress: number,
        processDocument: (doc: any) => { customerId: string, customerData: any, orderData: any }
    ): Promise<number> {

        if (totalCount === 0) return currentProgress;

        console.log(`\n📦 Processando ${collectionName} (${totalCount} documentos)...`);

        // Mapas para controle de merge
        const mergeKeysMap = new Map<string, string>(); // chave de merge -> customerId final

        let processedInCollection = 0;
        let lastDocId = null; // ID do último documento processado
        let hasMore = true;
        let emptyBatchCount = 0; // Contador de batches vazios

        while (hasMore && processedInCollection < totalCount && emptyBatchCount < 3) {
            try {
                // Construir query base
                let query = this.iToolsService.database()
                    .collection(collectionName)
                    .where([{ field: 'owner', operator: '=', value: Utilities.storeID }])
                    .orderBy({ '_id': 1 })
                    .limit(this.BATCH_CONFIG.batchSize);

                // Se tem último documento, usar startAfter com o ID
                if (lastDocId) {
                    // Buscar documentos com ID maior que o último processado
                    query = query.where([
                        { field: 'owner', operator: '=', value: Utilities.storeID },
                        { field: '_id', operator: '>', value: lastDocId }
                    ]);
                }

                const batch = await query.get();

                if (!batch || !batch.docs || batch.docs.length === 0) {
                    emptyBatchCount++;
                    if (emptyBatchCount >= 3) {
                        console.log(`⚠️ 3 batches vazios consecutivos, finalizando ${collectionName}`);
                        hasMore = false;
                    }
                    continue;
                }

                emptyBatchCount = 0; // Reset contador se achou documentos
                console.log(`📄 Processando batch: ${batch.docs.length} documentos...`);

                // Processar cada documento do batch
                for (const doc of batch.docs) {
                    try {
                        const result = processDocument.call(this, doc);

                        if (result && result.customerId) {
                            // Buscar cliente existente
                            const existingCustomer = this.findExistingCustomer(
                                result.customerData,
                                customersMap,
                                mergeKeysMap
                            );

                            let finalCustomerId = result.customerId;

                            if (existingCustomer.found) {
                                // Cliente existe - fazer merge
                                finalCustomerId = existingCustomer.customerId;

                                const existing = customersMap.get(finalCustomerId);
                                existing.orders.push(result.orderData);

                                // Atualizar dados se mais completos
                                this.mergeCustomerData(existing, result.customerData, mergeKeysMap, finalCustomerId);
                            } else {
                                // Novo cliente
                                const mergeKeys = this.createMergeKeys(result.customerData);
                                for (const key of mergeKeys) {
                                    mergeKeysMap.set(key, finalCustomerId);
                                }

                                customersMap.set(finalCustomerId, {
                                    ...result.customerData,
                                    _id: finalCustomerId,
                                    orders: [result.orderData]
                                });
                            }
                        }

                        processedInCollection++;
                        currentProgress++;

                        // Guardar ID do último documento processado
                        lastDocId = doc.id;

                    } catch (error) {
                        console.error(`❌ Erro ao processar documento ${doc.id}:`, error);
                    }
                }

                // Atualizar progresso
                this.updateProgress('fetching', currentProgress, totalProgress,
                    `Processando ${collectionName}: ${processedInCollection}/${totalCount}`);

                // Se processou menos que o limite, não tem mais
                if (batch.docs.length < this.BATCH_CONFIG.batchSize) {
                    hasMore = false;
                }

                // Delay entre batches
                await this.delay(this.BATCH_CONFIG.delayBetweenBatches);

            } catch (error) {
                console.error(`❌ Erro ao buscar batch de ${collectionName}:`, error);
                emptyBatchCount++;

                // Se der erro, tentar continuar do último ID conhecido
                if (lastDocId) {
                    await this.delay(1000); // Esperar 1 segundo antes de tentar novamente
                } else {
                    hasMore = false; // Se não tem lastDocId, parar
                }
            }
        }

        console.log(`✅ ${collectionName} processado: ${processedInCollection} documentos`);
        return currentProgress;
    }

    /**
     * Encontrar cliente existente
     */
    private findExistingCustomer(
        customerData: any,
        customersMap: Map<string, any>,
        mergeKeysMap: Map<string, string>
    ): { found: boolean; customerId: string } {

        // Se tem _id MongoDB, verificar se já existe
        if (customerData._id && customersMap.has(customerData._id)) {
            return { found: true, customerId: customerData._id };
        }

        // Buscar por merge keys
        const mergeKeys = this.createMergeKeys(customerData);

        for (const key of mergeKeys) {
            if (mergeKeysMap.has(key)) {
                const existingId = mergeKeysMap.get(key);
                if (customersMap.has(existingId)) {
                    return { found: true, customerId: existingId };
                }
            }
        }

        return { found: false, customerId: '' };
    }

    /**
     * Criar chaves de merge
     */
    private createMergeKeys(customerData: any): string[] {
        const keys = [];

        // CPF/CNPJ - mais confiável
        const cpf = (customerData.cpfCnpj || customerData.cpf || customerData.cnpj || '').replace(/\D/g, '');
        if (cpf.length >= 11) {
            keys.push(`cpf:${cpf}`);
        }

        // Email
        const email = (customerData.email || '').toLowerCase().trim();
        if (email && email.includes('@')) {
            keys.push(`email:${email}`);
        }

        // Telefone
        const phone = (customerData.phone || customerData.telefone || '').replace(/\D/g, '');
        if (phone.length >= 10) {
            keys.push(`phone:${phone}`);
        }

        // Nome normalizado + CPF
        const normalizedName = this.normalizeCustomerName(customerData.name || '');
        if (normalizedName && cpf.length >= 11) {
            keys.push(`name_cpf:${normalizedName}_${cpf}`);
        }

        // Só nome (menos confiável)
        if (normalizedName && normalizedName.length > 3) {
            keys.push(`name:${normalizedName}`);
        }

        return keys;
    }

    /**
     * Mesclar dados do cliente
     */
    private mergeCustomerData(
        existing: any,
        newData: any,
        mergeKeysMap: Map<string, string>,
        customerId: string
    ): void {
        // Atualizar email
        if (!existing.email && newData.email) {
            existing.email = newData.email;
            const emailKey = `email:${newData.email.toLowerCase().trim()}`;
            mergeKeysMap.set(emailKey, customerId);
        }

        // Atualizar telefone
        if (!existing.phone && newData.phone) {
            existing.phone = newData.phone;
            const phone = newData.phone.replace(/\D/g, '');
            if (phone.length >= 10) {
                mergeKeysMap.set(`phone:${phone}`, customerId);
            }
        }

        // Atualizar CPF/CNPJ
        if (!existing.cpfCnpj && newData.cpfCnpj) {
            existing.cpfCnpj = newData.cpfCnpj;
            const cpf = newData.cpfCnpj.replace(/\D/g, '');
            if (cpf.length >= 11) {
                mergeKeysMap.set(`cpf:${cpf}`, customerId);
            }
        }

        // Outros campos
        if (!existing.birthDate && newData.birthDate) {
            existing.birthDate = newData.birthDate;
        }
    }

    /**
     * Gerar ID único para cliente
     */
    private generateCustomerId(customerData: any, docId: string): string {
        // PRIORIDADE 1: usar _id MongoDB se existir
        if (customerData._id && typeof customerData._id === 'string' && customerData._id.length >= 20) {
            return customerData._id;
        }

        // PRIORIDADE 2: CPF/CNPJ
        const cpfCnpj = customerData.cpfCnpj || customerData.cpf || customerData.cnpj || '';
        if (cpfCnpj) {
            const cleanDoc = cpfCnpj.replace(/\D/g, '');
            if (cleanDoc.length >= 11) {
                return cleanDoc.length === 11 ? `cpf_${cleanDoc}` : `cnpj_${cleanDoc}`;
            }
        }

        // PRIORIDADE 3: Email
        const email = (customerData.email || '').toLowerCase().trim();
        if (email && email.includes('@')) {
            const emailHash = this.createSimpleHash(email);
            return `email_${emailHash}`;
        }

        // PRIORIDADE 4: Telefone
        const phone = (customerData.phone || customerData.telefone || '').replace(/\D/g, '');
        if (phone.length >= 10) {
            return `phone_${phone}`;
        }

        // PRIORIDADE 5: Nome normalizado + timestamp
        const normalizedName = this.normalizeCustomerName(customerData.name || '');
        if (normalizedName && normalizedName.length > 3) {
            const nameHash = this.createSimpleHash(normalizedName);
            const timestamp = Date.now();
            return `name_${nameHash}_${timestamp}`;
        }

        // FALLBACK: ID único
        return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Normalizar nome do cliente
     */
    private normalizeCustomerName(name: string): string {
        if (!name) return '';

        return name
            .toUpperCase()
            .replace(/\s+/g, ' ')
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
            .replace(/\b(LTDA|ME|EPP|EIRELI|SA|S\/A|CIA|COMPANHIA)\b/g, '')
            .trim();
    }

    /**
     * Criar hash simples
     */
    private createSimpleHash(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }

    /**
     * Contar documentos - CORRIGIDO sem select()
     */
    private async countAllDocuments(): Promise<any> {
        const counts = {
            sales: 0,
            cashier: 0,
            orders: 0,
            requests: 0
        };

        try {
            const collections = [
                { name: 'Sales', key: 'sales' },
                { name: 'CashierSales', key: 'cashier' },
                { name: 'ServiceOrders', key: 'orders' },
                { name: 'Requests', key: 'requests' }
            ];

            for (const coll of collections) {
                try {
                    // Buscar apenas 1 documento para verificar se a coleção tem dados
                    // e depois estimar o total com limit alto
                    const snapshot = await this.iToolsService.database()
                        .collection(coll.name)
                        .where([{ field: 'owner', operator: '=', value: Utilities.storeID }])
                        .limit(2000) // Limite para estimativa
                        .get();

                    counts[coll.key] = snapshot?.docs?.length || 0;

                    if (counts[coll.key] === 2000) {
                        console.log(`⚠️ ${coll.name} tem 2000+ documentos (estimativa)`);
                    }
                } catch (error) {
                    console.error(`Erro ao contar ${coll.name}:`, error);
                }
            }
        } catch (error) {
            console.error('Erro ao contar documentos:', error);
        }

        return counts;
    }

    /**
     * Processar documento de venda
     */
    private processSaleDocument(doc: any): any {
        const sale = (doc as any).data();
        const customerData = sale.customer || sale.client || sale.cliente || {};

        if (!customerData.name && !customerData.phone && !customerData._id) {
            return null;
        }

        const customerId = this.generateCustomerId(customerData, doc.id);

        return {
            customerId: customerId,
            customerData: {
                _id: customerId,
                name: customerData.name || customerData.nome || 'Cliente Venda',
                normalizedName: this.normalizeCustomerName(customerData.name || ''),
                email: customerData.email || '',
                phone: customerData.phone || customerData.telefone || '',
                cpfCnpj: customerData.cpfCnpj || '',
                code: customerData.code || null,
                owner: Utilities.storeID,
                source: 'Vendas'
            },
            orderData: {
                ...sale,
                _collection: 'Sales',
                _type: 'sale',
                _docId: doc.id
            }
        };
    }

    /**
     * Processar documento de venda PDV
     */
    private processCashierSaleDocument(doc: any): any {
        const sale = (doc as any).data();
        const customerData = sale.customer || {};

        if (!customerData.name && !customerData._id) {
            return null;
        }

        const customerId = this.generateCustomerId(customerData, doc.id);

        return {
            customerId: customerId,
            customerData: {
                _id: customerId,
                name: customerData.name || 'Cliente PDV',
                normalizedName: this.normalizeCustomerName(customerData.name || ''),
                email: customerData.email || '',
                phone: customerData.phone || customerData.cellphone || '',
                cpfCnpj: customerData.cpfCnpj || customerData.cpf || customerData.cnpj || '',
                code: customerData.code || null,
                owner: Utilities.storeID,
                source: 'PDV/Caixa'
            },
            orderData: {
                ...sale,
                _collection: 'CashierSales',
                _type: 'pdv_sale',
                _docId: doc.id
            }
        };
    }

    /**
     * Processar documento de ordem de serviço
     */
    private processServiceOrderDocument(doc: any): any {
        const order = (doc as any).data();
        const customerData = order.customer || {};

        if (!customerData.name && !customerData._id) {
            return null;
        }

        const customerId = this.generateCustomerId(customerData, doc.id);

        return {
            customerId: customerId,
            customerData: {
                _id: customerId,
                name: customerData.name || 'Cliente OS',
                normalizedName: this.normalizeCustomerName(customerData.name || ''),
                email: customerData.email || '',
                phone: customerData.phone || customerData.telefone || '',
                cpfCnpj: customerData.cpfCnpj || (customerData.personalDocument?.value) || '',
                code: customerData.code || null,
                owner: Utilities.storeID,
                source: 'Ordens de Serviço'
            },
            orderData: {
                ...order,
                _collection: 'ServiceOrders',
                _type: 'service_order',
                _docId: doc.id
            }
        };
    }

    /**
     * Processar documento de pedido
     */
    private processRequestDocument(doc: any): any {
        const order = (doc as any).data();
        const customerData = order.customer || order.client || order.cliente || order.clientData || {};

        if (!customerData.name && !customerData.phone && !customerData._id) {
            return null;
        }

        const customerId = this.generateCustomerId(customerData, doc.id);

        return {
            customerId: customerId,
            customerData: {
                _id: customerId,
                name: customerData.name || customerData.nome || 'Cliente Pedido',
                normalizedName: this.normalizeCustomerName(customerData.name || ''),
                email: customerData.email || order.email || '',
                phone: customerData.phone || order.phone || '',
                cpfCnpj: customerData.cpfCnpj || '',
                code: customerData.code || null,
                owner: Utilities.storeID,
                source: 'Pedidos'
            },
            orderData: {
                ...order,
                _collection: 'Requests',
                _type: 'request',
                _docId: doc.id
            }
        };
    }

    /**
     * Analisar clientes em paralelo
     */
    private async analyzeCustomersInParallel(customers: any[]): Promise<ICustomerAnalysis[]> {
        const analyses: ICustomerAnalysis[] = [];
        const batchSize = this.BATCH_CONFIG.parallelAnalysis;

        for (let i = 0; i < customers.length; i += batchSize) {
            const batch = customers.slice(i, i + batchSize);

            const batchPromises = batch.map(customer =>
                this.analyzeCustomerFromOrders(customer)
                    .catch(error => {
                        console.error(`Erro ao analisar ${customer.name}:`, error);
                        return null;
                    })
            );

            const batchResults = await Promise.all(batchPromises);

            batchResults.forEach(result => {
                if (result) analyses.push(result);
            });

            this.updateProgress('analyzing',
                Math.min(i + batchSize, customers.length),
                customers.length,
                `Analisando clientes: ${Math.min(i + batchSize, customers.length)}/${customers.length}`
            );

            await this.delay(50);
        }

        return analyses;
    }

    /**
     * Analisar cliente individual
     */
    private async analyzeCustomerFromOrders(customer: any): Promise<ICustomerAnalysis> {
        const orders = customer.orders || [];

        // Calcular métricas
        let totalSpent = 0;
        let lastPurchaseDate = null;
        const purchaseDates = [];

        for (const order of orders) {
            // Calcular valor total
            const orderValue = this.extractOrderValue(order);
            totalSpent += orderValue;

            // Pegar data da compra
            const orderDate = this.extractOrderDate(order);
            if (orderDate) {
                purchaseDates.push(orderDate);
                if (!lastPurchaseDate || orderDate > lastPurchaseDate) {
                    lastPurchaseDate = orderDate;
                }
            }
        }

        // Calcular dias desde última compra
        const daysSinceLastPurchase = lastPurchaseDate
            ? Math.floor((Date.now() - lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24))
            : 999;

        // Calcular frequência
        const purchaseFrequency = this.calculatePurchaseFrequency(purchaseDates);

        // Ticket médio
        const averageTicket = orders.length > 0 ? totalSpent / orders.length : 0;

        // Determinar categoria e score
        const metrics = {
            totalSpent,
            totalPurchases: orders.length,
            averageTicket,
            daysSinceLastPurchase,
            purchaseFrequency
        };

        const category = this.determineCustomerCategory(metrics);
        const score = this.calculateCustomerScore(metrics);
        const priority = this.determineCustomerPriority(score, category);

        return {
            customerId: customer._id,
            customerName: customer.name,
            email: customer.email || '',
            phone: customer.phone || '',
            totalSpent,
            totalPurchases: orders.length,
            averageTicket,
            lastPurchaseDate: lastPurchaseDate || new Date(),
            daysSinceLastPurchase,
            purchaseFrequency,
            category,
            priority,
            score,
            source: customer.source || 'Sistema',
            observations: this.generateObservations(metrics),
            recommendation: this.generateRecommendation(category, metrics)
        };
    }

    /**
     * Extrair valor do pedido
     */
    private extractOrderValue(order: any): number {
        const value = order.balance?.total ||
            order.total ||
            order.totalValue ||
            order.valorTotal ||
            order.valor ||
            order.value ||
            order.amount ||
            0;

        return typeof value === 'number' ? value : parseFloat(value) || 0;
    }

    /**
     * Extrair data do pedido
     */
    private extractOrderDate(order: any): Date | null {
        const dateField = order.paymentDate ||
            order.registerDate ||
            order.date ||
            order.data ||
            order.createdAt ||
            order.dataVenda ||
            order.dataPedido;

        return this.parseDate(dateField);
    }

    /**
     * Parser de data flexível
     */
    private parseDate(value: any): Date | null {
        if (!value) return null;

        if (value instanceof Date) {
            return value;
        }

        if (typeof value === 'string') {
            // Formato brasileiro DD/MM/YYYY
            if (value.includes('/')) {
                const parts = value.split(/[\/\s:]/);
                if (parts.length >= 3) {
                    const day = parseInt(parts[0]);
                    const month = parseInt(parts[1]) - 1;
                    const year = parseInt(parts[2]);
                    const hour = parts[3] ? parseInt(parts[3]) : 0;
                    const minute = parts[4] ? parseInt(parts[4]) : 0;
                    const second = parts[5] ? parseInt(parts[5]) : 0;
                    return new Date(year, month, day, hour, minute, second);
                }
            }
            return new Date(value);
        }

        if (typeof value === 'number') {
            return value < 10000000000 ? new Date(value * 1000) : new Date(value);
        }

        if (value && typeof value === 'object') {
            if (value.seconds) {
                return new Date(value.seconds * 1000);
            }
            if (value.toDate && typeof value.toDate === 'function') {
                return value.toDate();
            }
        }

        return null;
    }

    /**
     * Calcular frequência de compra
     */
    private calculatePurchaseFrequency(dates: Date[]): number {
        if (dates.length < 2) return 0;

        dates.sort((a, b) => a.getTime() - b.getTime());

        let totalDays = 0;
        for (let i = 1; i < dates.length; i++) {
            const daysBetween = (dates[i].getTime() - dates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
            totalDays += daysBetween;
        }

        const averageDaysBetween = totalDays / (dates.length - 1);
        return averageDaysBetween > 0 ? 30 / averageDaysBetween : 0;
    }

    /**
     * Determinar categoria do cliente
     */
    private determineCustomerCategory(metrics: any): 'hot' | 'warm' | 'cold' | 'new' {
        if (metrics.totalPurchases === 1) {
            return metrics.daysSinceLastPurchase < 90 ? 'new' : 'cold';
        }

        if (metrics.daysSinceLastPurchase < 60 && metrics.purchaseFrequency > 1) {
            return 'hot';
        } else if (metrics.daysSinceLastPurchase < 180) {
            return 'warm';
        } else {
            return 'cold';
        }
    }

    /**
     * Calcular score do cliente
     */
    private calculateCustomerScore(metrics: any): number {
        let score = 0;

        // Valor total (até 30 pontos)
        if (metrics.totalSpent > 10000) score += 30;
        else if (metrics.totalSpent > 5000) score += 20;
        else if (metrics.totalSpent > 1000) score += 10;
        else if (metrics.totalSpent > 100) score += 5;

        // Frequência (até 30 pontos)
        if (metrics.purchaseFrequency > 3) score += 30;
        else if (metrics.purchaseFrequency > 2) score += 20;
        else if (metrics.purchaseFrequency > 1) score += 10;

        // Recência (até 25 pontos)
        if (metrics.daysSinceLastPurchase < 30) score += 25;
        else if (metrics.daysSinceLastPurchase < 60) score += 20;
        else if (metrics.daysSinceLastPurchase < 90) score += 15;
        else if (metrics.daysSinceLastPurchase < 180) score += 5;

        // Ticket médio (até 15 pontos)
        if (metrics.averageTicket > 1000) score += 15;
        else if (metrics.averageTicket > 500) score += 10;
        else if (metrics.averageTicket > 100) score += 5;

        return Math.min(score, 100);
    }

    /**
     * Determinar prioridade
     */
    private determineCustomerPriority(score: number, category: string): 'high' | 'medium' | 'low' {
        if (score >= 70 || category === 'hot') return 'high';
        if (score >= 40 || category === 'warm') return 'medium';
        return 'low';
    }

    /**
     * Gerar recomendação
     */
    private generateRecommendation(category: string, metrics: any): string {
        switch (category) {
            case 'hot':
                return '🔥 Oferecer programa de fidelidade ou produtos premium';
            case 'warm':
                return '📧 Enviar promoções personalizadas para reativar';
            case 'cold':
                return '💌 Campanha de reativação com desconto especial';
            case 'new':
                return '🎁 Oferecer desconto para segunda compra';
            default:
                return '📊 Analisar melhor o perfil do cliente';
        }
    }

    /**
     * Gerar observações
     */
    private generateObservations(metrics: any): string[] {
        const obs = [];

        if (metrics.daysSinceLastPurchase > 180) {
            obs.push('⚠️ Cliente inativo há mais de 6 meses');
        }

        if (metrics.purchaseFrequency > 3) {
            obs.push('✅ Cliente frequente - fidelizado');
        }

        if (metrics.averageTicket > 1000) {
            obs.push('💰 Alto ticket médio');
        }

        if (metrics.totalSpent > 10000) {
            obs.push('🏆 Cliente de alto valor');
        }

        return obs;
    }

    /**
     * Atualizar progresso
     */
    private updateProgress(status: string, current: number, total: number, message: string): void {
        this.importProgressSubject.next({
            status: status as any,
            current,
            total,
            message
        });
    }

    /**
     * Delay helper
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * IMPORTAR CLIENTES SELECIONADOS
     */
    public async importSelectedCustomers(selectedAnalyses: ICustomerAnalysis[]): Promise<void> {
        try {
            this.updateProgress('importing', 0, selectedAnalyses.length, 'Iniciando importação...');

            let imported = 0;
            let errors = 0;

            for (const analysis of selectedAnalyses) {
                try {
                    this.updateProgress('importing', imported, selectedAnalyses.length,
                        `Importando ${analysis.customerName}...`);

                    // Verificar se já existe lead
                    const existingLead = await this.checkExistingLead(analysis.email, analysis.customerId);

                    if (!existingLead) {
                        // Criar novo lead
                        await this.createLeadFromAnalysis(analysis);
                        imported++;
                    } else {
                        // Atualizar lead existente
                        await this.updateExistingLead(existingLead._id, analysis);
                        imported++;
                    }

                } catch (error) {
                    console.error(`Erro ao importar ${analysis.customerName}:`, error);
                    errors++;
                }
            }

            const message = errors > 0
                ? `Importação concluída! ${imported} importados, ${errors} erros.`
                : `Importação concluída! ${imported} clientes importados com sucesso!`;

            this.updateProgress('completed', imported, selectedAnalyses.length, message);

        } catch (error) {
            console.error('Erro na importação:', error);
            this.updateProgress('error', 0, 0, 'Erro ao importar clientes');
            throw error;
        }
    }

    /**
     * Verificar se já existe lead
     */
    private async checkExistingLead(email: string, customerId: string): Promise<any> {
        if (!email) return null;

        const snapshot = await this.iToolsService.database()
            .collection('CRMLeads')
            .where([
                { field: 'owner', operator: '=', value: Utilities.storeID },
                { field: 'email', operator: '=', value: email }
            ])
            .limit(1)
            .get();

        if (snapshot.docs && snapshot.docs.length > 0) {
            const doc = snapshot.docs[0];
            return {
                _id: doc.id,
                ...(doc as any).data()
            };
        }

        return null;
    }

    /**
     * Criar lead a partir da análise
     */
    private async createLeadFromAnalysis(analysis: ICustomerAnalysis): Promise<void> {
        const leadData = {
            owner: Utilities.storeID,
            name: analysis.customerName,
            email: analysis.email,
            phone: analysis.phone,
            status: 'new',
            score: analysis.score,
            category: analysis.category,
            priority: analysis.priority,
            source: 'import',
            importSource: analysis.source,
            totalSpent: analysis.totalSpent,
            totalPurchases: analysis.totalPurchases,
            averageTicket: analysis.averageTicket,
            lastPurchaseDate: analysis.lastPurchaseDate,
            daysSinceLastPurchase: analysis.daysSinceLastPurchase,
            tags: [`imported-${new Date().toISOString().split('T')[0]}`, analysis.category],
            notes: `Cliente importado automaticamente. ${analysis.observations.join('. ')}`,
            customerId: analysis.customerId,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Gerar ID único
        const newLeadId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        await this.iToolsService.database()
            .collection('CRMLeads')
            .doc(newLeadId)
            .update(leadData);
    }

    /**
     * Atualizar lead existente
     */
    private async updateExistingLead(leadId: string, analysis: ICustomerAnalysis): Promise<void> {
        const updateData = {
            score: analysis.score,
            category: analysis.category,
            priority: analysis.priority,
            totalSpent: analysis.totalSpent,
            totalPurchases: analysis.totalPurchases,
            averageTicket: analysis.averageTicket,
            lastPurchaseDate: analysis.lastPurchaseDate,
            daysSinceLastPurchase: analysis.daysSinceLastPurchase,
            updatedAt: new Date()
        };

        await this.iToolsService.database()
            .collection('CRMLeads')
            .doc(leadId)
            .update(updateData);
    }
}