// Arquivo: customer-detail-modal.component.ts
// Localização: src/app/pages/crm/components/customer-detail-modal/customer-detail-modal.component.ts
// Função: Modal para visualizar TODOS os detalhes e vendas de um cliente
// Versão: CORRIGIDA - Busca inteligente por múltiplos campos

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { IToolsService } from '@shared/services/iTools.service';
import { Utilities } from '@shared/utilities/utilities';

@Component({
    selector: 'app-customer-detail-modal',
    templateUrl: './customer-detail-modal.component.html',
    styleUrls: ['./customer-detail-modal.component.scss']
})
export class CustomerDetailModalComponent implements OnInit {
    @Input() customer: any;
    @Input() rawCustomerData: any;
    @Output() onClose = new EventEmitter<void>();

    // Estados do componente
    public loading = true;
    public allOrders: any[] = [];
    public ordersByCollection: any[] = [];
    public filteredOrders: any[] = [];
    public analysisResults: any = {};

    // Controles de visualização
    public showRawData = false;
    public showDebugInfo = false;
    public selectedCollection = '';
    public searchTerm = '';

    constructor(
        private iToolsService: IToolsService
    ) { }

    ngOnInit() {
        this.loadCustomerDetails();
    }

    /**
     * Carregar detalhes completos do cliente
     * Busca todas as vendas em todas as collections
     */
    private async loadCustomerDetails() {
        try {
            console.log('🔍 Iniciando carregamento dos detalhes do cliente:', {
                customerName: this.customer?.customerName,
                customerId: this.customer?.customerId,
                email: this.customer?.email,
                phone: this.customer?.phone,
                cpfCnpj: this.customer?.cpfCnpj,
                totalPurchases: this.customer?.totalPurchases,
                totalSpent: this.customer?.totalSpent
            });

            // Se temos os dados brutos com orders, usar eles
            if (this.rawCustomerData && this.rawCustomerData.orders && this.rawCustomerData.orders.length > 0) {
                console.log('✅ Usando dados brutos fornecidos:', this.rawCustomerData.orders.length, 'orders');
                this.processOrders(this.rawCustomerData.orders);
            } else {
                console.log('🔄 Buscando vendas diretamente nas collections...');

                // IMPORTANTE: Como o ID do cliente pode ter sido gerado de forma diferente,
                // vamos buscar por NOME + outros campos para garantir que encontramos tudo
                await this.fetchAllOrdersByMultipleCriteria();
            }

            // Analisar problemas
            this.analyzeProblems();

            // Inicializar filteredOrders com TODAS as orders
            this.filteredOrders = [...this.allOrders];
            console.log('📊 Total de orders encontradas:', this.allOrders.length);
            console.log('📊 Orders por coleção:', this.ordersByCollection);

            this.loading = false;
        } catch (error) {
            console.error('❌ Erro ao carregar detalhes:', error);
            this.allOrders = [];
            this.filteredOrders = [];
            this.ordersByCollection = [];
            this.loading = false;
        }
    }

    /**
     * Buscar vendas usando múltiplos critérios
     * Como o ID pode não bater, vamos buscar por nome, email, CPF, etc
     */
    private async fetchAllOrdersByMultipleCriteria() {
        const collections = ['CashierSales', 'ServiceOrders', 'Sales', 'Requests'];
        const allOrders = [];

        console.log('🔎 Iniciando busca por múltiplos critérios...');

        // Normalizar nome do cliente para busca
        const normalizedCustomerName = this.normalizeCustomerName(this.customer.customerName || '');

        for (const collName of collections) {
            try {
                console.log(`📂 Buscando em ${collName}...`);

                // Buscar TODOS os documentos da collection (com limite)
                const snapshot = await this.iToolsService.database()
                    .collection(collName)
                    .where([
                        { field: 'owner', operator: '=', value: Utilities.storeID }
                    ])
                    .limit(2000) // Limite aumentado
                    .get();

                if (snapshot && snapshot.docs) {
                    let found = 0;
                    let checked = 0;

                    snapshot.docs.forEach(doc => {
                        const data = (doc as any).data();
                        checked++;

                        // Verificar se pertence ao cliente usando múltiplos critérios
                        if (this.isOrderFromCustomer(data, normalizedCustomerName)) {
                            allOrders.push({
                                ...data,
                                _collection: collName,
                                _docId: doc.id
                            });
                            found++;

                            // Log das primeiras vendas encontradas
                            if (found <= 3) {
                                const customerInDoc = data.customer || data.client || data.cliente || {};
                                console.log(`✅ Venda encontrada em ${collName}:`, {
                                    docId: doc.id,
                                    customerName: customerInDoc.name,
                                    customerId: customerInDoc._id,
                                    value: data.total || data.value || data.amount,
                                    date: data.registerDate || data.date
                                });
                            }
                        }
                    });

                    console.log(`📊 ${collName}: Verificados ${checked} docs, encontradas ${found} vendas do cliente`);
                }
            } catch (error) {
                console.error(`❌ Erro ao buscar ${collName}:`, error);
            }
        }

        console.log('🎯 Total de vendas encontradas:', allOrders.length);

        // Se não encontrou nada mas o cliente tem vendas registradas, fazer busca adicional
        if (allOrders.length === 0 && this.customer.totalPurchases > 0) {
            console.log('⚠️ Nenhuma venda encontrada mas cliente tem', this.customer.totalPurchases, 'compras registradas');
            console.log('🔍 Fazendo busca adicional por nome parcial...');

            // Tentar busca mais ampla
            const additionalOrders = await this.searchByPartialName(normalizedCustomerName);
            allOrders.push(...additionalOrders);
        }

        this.processOrders(allOrders);
    }

    /**
     * Verificar se a order pertence ao cliente
     * Usa múltiplos critérios para garantir match correto
     */
    private isOrderFromCustomer(orderData: any, normalizedCustomerName: string): boolean {
        // Extrair dados do cliente da order
        const customerInOrder = orderData.customer || orderData.client || orderData.cliente || {};

        // CRITÉRIO 1: ID exato (se bater, é certeza)
        if (customerInOrder._id && customerInOrder._id === this.customer.customerId) {
            return true;
        }

        // CRITÉRIO 2: Nome normalizado
        const orderCustomerName = this.normalizeCustomerName(customerInOrder.name || customerInOrder.nome || '');
        if (orderCustomerName && normalizedCustomerName && orderCustomerName === normalizedCustomerName) {
            // Se o nome bate exatamente, verificar outros campos para confirmar

            // Se tem email e bate, é bem provável que seja o mesmo
            if (this.customer.email && customerInOrder.email &&
                this.customer.email.toLowerCase() === customerInOrder.email.toLowerCase()) {
                return true;
            }

            // Se tem CPF/CNPJ e bate, é certeza
            if (this.customer.cpfCnpj && (customerInOrder.cpfCnpj || customerInOrder.cpf || customerInOrder.cnpj)) {
                const cpf1 = this.customer.cpfCnpj.replace(/\D/g, '');
                const cpf2 = (customerInOrder.cpfCnpj || customerInOrder.cpf || customerInOrder.cnpj || '').replace(/\D/g, '');
                if (cpf1 && cpf2 && cpf1 === cpf2) {
                    return true;
                }
            }

            // Se tem telefone e bate, é bem provável
            if (this.customer.phone && (customerInOrder.phone || customerInOrder.telefone || customerInOrder.cellphone)) {
                const phone1 = this.customer.phone.replace(/\D/g, '');
                const phone2 = (customerInOrder.phone || customerInOrder.telefone || customerInOrder.cellphone || '').replace(/\D/g, '');
                if (phone1 && phone2 && phone1.length >= 10 && phone2.length >= 10) {
                    // Comparar últimos 8 dígitos (ignora código de área que pode mudar)
                    if (phone1.slice(-8) === phone2.slice(-8)) {
                        return true;
                    }
                }
            }

            // Se só tem o nome e mais nada, aceitar se for nome completo (não muito comum)
            if (orderCustomerName.split(' ').length >= 2) {
                return true;
            }
        }

        // CRITÉRIO 3: Email exato
        if (this.customer.email && customerInOrder.email &&
            this.customer.email.toLowerCase() === customerInOrder.email.toLowerCase()) {
            return true;
        }

        // CRITÉRIO 4: CPF/CNPJ exato
        if (this.customer.cpfCnpj) {
            const cpf1 = this.customer.cpfCnpj.replace(/\D/g, '');
            const cpf2 = (customerInOrder.cpfCnpj || customerInOrder.cpf || customerInOrder.cnpj || '').replace(/\D/g, '');
            if (cpf1 && cpf2 && cpf1 === cpf2) {
                return true;
            }
        }

        // CRITÉRIO 5: Verificar também campos diretos na order (alguns sistemas salvam direto)
        if (orderData.customerName && normalizedCustomerName) {
            const orderName = this.normalizeCustomerName(orderData.customerName);
            if (orderName === normalizedCustomerName) {
                return true;
            }
        }

        return false;
    }

    /**
     * Busca adicional por nome parcial
     * Usado quando não encontra nada mas sabemos que existem vendas
     */
    private async searchByPartialName(normalizedName: string): Promise<any[]> {
        if (!normalizedName || normalizedName.length < 3) return [];

        const orders = [];
        const nameParts = normalizedName.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts[nameParts.length - 1];

        console.log('🔍 Buscando por partes do nome:', { firstName, lastName });

        // Por enquanto retornar vazio, mas aqui poderia implementar
        // uma busca mais sofisticada se necessário

        return orders;
    }

    /**
     * Normalizar nome do cliente
     * Remove espaços extras, caracteres especiais e padroniza
     */
    private normalizeCustomerName(name: string): string {
        if (!name) return '';

        return name
            .toUpperCase()
            .replace(/\s+/g, ' ') // Múltiplos espaços -> um espaço
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '') // Remove pontuação
            .replace(/\b(LTDA|ME|EPP|EIRELI|SA|S\/A|CIA|COMPANHIA)\b/g, '') // Remove tipos de empresa
            .trim();
    }

    /**
     * Processar orders e agrupar por coleção
     * Extrai informações importantes de cada venda
     */
    private processOrders(orders: any[]) {
        console.log(`📊 Processando ${orders.length} orders...`);

        // Processar cada order para extrair informações
        this.allOrders = orders.map(order => {
            const processedOrder = {
                ...order,
                date: this.extractOrderDate(order),
                value: this.extractOrderValue(order),
                products: this.extractProducts(order),
                services: this.extractServices(order),
                paymentMethods: this.extractPaymentMethods(order),
                status: this.extractOrderStatus(order),
                customerInOrder: order.customer || order.client || order.cliente || {},
                showDetails: false
            };

            return processedOrder;
        });

        // Agrupar por coleção
        const grouped = {};

        this.allOrders.forEach(order => {
            const coll = order._collection || 'Unknown';

            if (!grouped[coll]) {
                grouped[coll] = {
                    name: coll,
                    orders: [],
                    total: 0,
                    firstDate: null,
                    lastDate: null
                };
            }

            grouped[coll].orders.push(order);
            grouped[coll].total += order.value;

            // Atualizar datas
            if (!grouped[coll].firstDate || order.date < grouped[coll].firstDate) {
                grouped[coll].firstDate = order.date;
            }
            if (!grouped[coll].lastDate || order.date > grouped[coll].lastDate) {
                grouped[coll].lastDate = order.date;
            }
        });

        this.ordersByCollection = Object.values(grouped);

        // Ordenar orders por data (mais recentes primeiro)
        this.allOrders.sort((a, b) => b.date.getTime() - a.date.getTime());

        // Ordenar dentro de cada coleção também
        this.ordersByCollection.forEach(coll => {
            coll.orders.sort((a, b) => b.date.getTime() - a.date.getTime());
        });

        console.log('✅ Processamento concluído:', {
            totalOrders: this.allOrders.length,
            collections: this.ordersByCollection.map(c => ({
                name: c.name,
                count: c.orders.length,
                total: c.total
            }))
        });
    }

    /**
     * Analisar problemas nos dados
     * Identifica múltiplos IDs ou códigos para o mesmo cliente
     */
    private analyzeProblems() {
        const uniqueIds = new Set();
        const uniqueCodes = new Set();
        const uniqueNames = new Set();
        const uniqueEmails = new Set();

        this.allOrders.forEach(order => {
            const customer = order.customerInOrder;

            if (customer._id) uniqueIds.add(customer._id);
            if (customer.code) uniqueCodes.add(customer.code.toString());
            if (customer.name) uniqueNames.add(customer.name);
            if (customer.email) uniqueEmails.add(customer.email.toLowerCase());
        });

        this.analysisResults = {
            multipleIds: uniqueIds.size > 1,
            uniqueIds: Array.from(uniqueIds),
            multipleCodes: uniqueCodes.size > 1,
            uniqueCodes: Array.from(uniqueCodes),
            multipleNames: uniqueNames.size > 1,
            uniqueNames: Array.from(uniqueNames),
            multipleEmails: uniqueEmails.size > 1,
            uniqueEmails: Array.from(uniqueEmails),
            hasProblems: false
        };

        this.analysisResults.hasProblems =
            this.analysisResults.multipleIds ||
            this.analysisResults.multipleCodes ||
            this.analysisResults.multipleNames ||
            this.analysisResults.multipleEmails;

        console.log('🔍 Análise de problemas:', this.analysisResults);
    }

    /**
     * Filtrar orders baseado em coleção e termo de busca
     */
    public filterOrders(): void {
        console.log('🔍 Filtrando orders...', {
            collection: this.selectedCollection,
            searchTerm: this.searchTerm,
            totalOrders: this.allOrders.length
        });

        let filtered = [...this.allOrders];

        // Filtrar por coleção
        if (this.selectedCollection) {
            filtered = filtered.filter(order => order._collection === this.selectedCollection);
            console.log(`📂 Após filtro de coleção: ${filtered.length} orders`);
        }

        // Filtrar por termo de busca
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(order => {
                // Buscar no código
                if (order.code && order.code.toString().toLowerCase().includes(term)) return true;

                // Buscar no ID do documento
                if (order._docId && order._docId.toLowerCase().includes(term)) return true;

                // Buscar nos produtos
                if (order.products && Array.isArray(order.products)) {
                    const hasProduct = order.products.some(p =>
                        (p.name && p.name.toLowerCase().includes(term)) ||
                        (p.description && p.description.toLowerCase().includes(term))
                    );
                    if (hasProduct) return true;
                }

                // Buscar nos serviços
                if (order.services && Array.isArray(order.services)) {
                    const hasService = order.services.some(s =>
                        (s.name && s.name.toLowerCase().includes(term)) ||
                        (s.description && s.description.toLowerCase().includes(term))
                    );
                    if (hasService) return true;
                }

                return false;
            });
            console.log(`🔍 Após filtro de busca: ${filtered.length} orders`);
        }

        this.filteredOrders = filtered;
        console.log(`✅ Total filtrado: ${this.filteredOrders.length} orders`);
    }

    /**
  * Alternar detalhes da ordem
  */
    public toggleOrderDetails(index: number): void {
        this.filteredOrders[index].showDetails = !this.filteredOrders[index].showDetails;
    }

    /**
     * Calcular valor total das vendas filtradas
     */
    public getTotalValue(): number {
        return this.filteredOrders.reduce((sum, order) => sum + (order.total || order.value || 0), 0);
    }

    /**
     * Obter data da primeira venda
     */
    public getFirstSaleDate(): Date {
        if (!this.filteredOrders.length) return new Date();
        return this.filteredOrders[this.filteredOrders.length - 1].date;
    }

    /**
     * Obter data da última venda
     */
    public getLastSaleDate(): Date {
        if (!this.filteredOrders.length) return new Date();
        return this.filteredOrders[0].date;
    }

    /**
     * Extrair data do pedido
     * Tenta múltiplos campos possíveis
     */
    private extractOrderDate(order: any): Date {
        // Lista de campos de data possíveis
        const dateFields = [
            'paymentDate',
            'registerDate',
            'date',
            'createdAt',
            'created_at',
            'dataVenda',
            'saleDate',
            'orderDate',
            'data'
        ];

        let dateValue = null;

        // Tentar encontrar um campo de data válido
        for (const field of dateFields) {
            if (order[field]) {
                dateValue = order[field];
                break;
            }
        }

        if (!dateValue) {
            console.warn('⚠️ Nenhuma data encontrada na order:', order._docId);
            return new Date();
        }

        // Converter para Date
        if (dateValue instanceof Date) return dateValue;
        if (typeof dateValue === 'string') return new Date(dateValue);
        if (typeof dateValue === 'number') return new Date(dateValue);
        if (dateValue.seconds) return new Date(dateValue.seconds * 1000);
        if (dateValue.toDate && typeof dateValue.toDate === 'function') return dateValue.toDate();

        return new Date();
    }

    /**
     * Extrair valor do pedido
     * Tenta múltiplos campos possíveis
     */
    private extractOrderValue(order: any): number {
        // Lista de campos de valor possíveis
        const valueFields = [
            'total',
            'totalValue',
            'value',
            'amount',
            'valor',
            'totalAmount',
            'grandTotal',
            'finalValue',
            'totalGeral'
        ];

        let value: any = 0;

        // Tentar campos aninhados primeiro (balance.total)
        if (order.balance && order.balance.total !== undefined) {
            value = order.balance.total;
        } else if (order.totals && order.totals.total !== undefined) {
            value = order.totals.total;
        } else {
            // Tentar campos diretos
            for (const field of valueFields) {
                if (order[field] !== undefined && order[field] !== null) {
                    value = order[field];
                    break;
                }
            }
        }

        // Converter para número se necessário
        if (typeof value === 'string') {
            // Remover caracteres não numéricos (exceto ponto e vírgula)
            const cleanValue = value.replace(/[^0-9.,-]/g, '');
            // Trocar vírgula por ponto se for decimal brasileiro
            const normalizedValue = cleanValue.replace(',', '.');
            value = parseFloat(normalizedValue) || 0;
        } else if (typeof value === 'number') {
            // Já é número, apenas garantir que não seja NaN
            value = isNaN(value) ? 0 : value;
        } else {
            // Qualquer outro tipo, converter para 0
            value = 0;
        }

        return value;
    }
    /**
        * Extrair produtos da venda em formato padronizado
        */
    private extractProducts(order: any): any[] {
        try {
            const productsSrc = order.products || order.items || order.itens || [];
            if (!Array.isArray(productsSrc) || productsSrc.length === 0) {
                return [];
            }

            return productsSrc.map((p: any) => {
                const qty = p.quantity || p.qtd || 1;
                const name = p.name || p.productName || p.description || (p.product && p.product.name) || 'Produto';

                const total = p.total || p.totalValue || p.value || p.amount || (p.balance && p.balance.total) || 0;
                let unitPrice = p.unitPrice || p.unitaryPrice || p.price || p.salePrice || 0;

                if (!unitPrice && total && qty) {
                    unitPrice = total / qty;
                }

                return {
                    name,
                    quantity: qty,
                    unitPrice,
                    total: total || unitPrice * qty
                };
            });
        } catch (error) {
            console.error('Erro ao extrair produtos:', error);
            return [];
        }
    }

    /**
     * Extrair serviços da venda em formato padronizado
     */
    private extractServices(order: any): any[] {
        try {
            let services: any[] = [];

            if (order.services && Array.isArray(order.services)) {
                services = order.services;
            } else if (order.service && order.service.types && Array.isArray(order.service.types)) {
                services = order.service.types;
            }

            return services.map((s: any) => {
                const qty = s.quantity || 1;
                const name = s.name || s.serviceName || s.description || 'Serviço';
                const total = s.total || s.totalValue || s.value || s.amount || 0;
                return {
                    name,
                    quantity: qty,
                    price: s.price || s.unitPrice || s.unitaryPrice || total / qty,
                    unitPrice: s.price || s.unitPrice || s.unitaryPrice || total / qty,
                    total: total || qty * (s.price || 0)
                };
            });
        } catch (error) {
            console.error('Erro ao extrair serviços:', error);
            return [];
        }
    }

    /**
     * Extrair formas de pagamento padronizadas
     */
    private extractPaymentMethods(order: any): any[] {
        try {
            if (order.payments && Array.isArray(order.payments) && order.payments.length > 0) {
                return order.payments.map((p: any) => ({
                    name: p.paymentMethod?.name || p.method || p.name || 'Não informado',
                    value: p.value || p.amount || 0
                }));
            }

            if (order.paymentMethods && Array.isArray(order.paymentMethods) && order.paymentMethods.length > 0) {
                return order.paymentMethods.map((p: any) => ({
                    name: p.name || p.method || p.type || 'Não informado',
                    value: p.value || p.amount || 0
                }));
            }

            return [];
        } catch (error) {
            console.error('Erro ao extrair formas de pagamento:', error);
            return [];
        }
    }

    /**
     * Extrair status da venda a partir de múltiplos campos
     */
    private extractOrderStatus(order: any): string {
        return order.status || order.statusName || order.saleStatus || order.state || order.situation || (order.canceled ? 'CANCELED' : '');
    }

    /**
     * Obter informações de debug de uma order
     * Mostra a estrutura completa para debug
     */
    public getOrderDebugInfo(order: any): string {
        const debugInfo = {
            collection: order._collection,
            docId: order._docId,
            date: this.formatDate(order.date),
            value: this.formatCurrency(order.value),
            structure: {
                hasProducts: !!(order.products && order.products.length > 0),
                productsCount: order.products?.length || 0,
                productsSample: order.products?.[0] ? Object.keys(order.products[0]) : [],
                hasServices: !!(order.services && order.services.length > 0),
                servicesCount: order.services?.length || 0,
                servicesSample: order.services?.[0] ? Object.keys(order.services[0]) : [],
                hasPaymentMethods: !!(order.paymentMethods && order.paymentMethods.length > 0),
                paymentMethodsCount: order.paymentMethods?.length || 0,
                paymentSample: order.paymentMethods?.[0] ? Object.keys(order.paymentMethods[0]) : []
            },
            customer: {
                id: order.customerInOrder?._id,
                name: order.customerInOrder?.name,
                code: order.customerInOrder?.code,
                email: order.customerInOrder?.email,
                phone: order.customerInOrder?.phone || order.customerInOrder?.telefone
            },
            mainFields: Object.keys(order)
                .filter(key => !key.startsWith('_') && typeof order[key] !== 'object')
                .reduce((acc, key) => {
                    acc[key] = order[key];
                    return acc;
                }, {})
        };

        return JSON.stringify(debugInfo, null, 2);
    }

    /**
     * Obter ícone da coleção
     */
    public getCollectionIcon(collection: string): string {
        const icons = {
            'CashierSales': 'eva eva-shopping-cart-outline',
            'Sales': 'eva eva-briefcase-outline',
            'ServiceOrders': 'eva eva-settings-2-outline',
            'Requests': 'eva eva-file-text-outline',
            'Unknown': 'eva eva-folder-outline'
        };
        return icons[collection] || 'eva eva-folder-outline';
    }

    /**
     * Obter label da coleção
     */
    public getCollectionLabel(collection: string): string {
        const labels = {
            'CashierSales': 'Vendas PDV',
            'Sales': 'Vendas',
            'ServiceOrders': 'Ordens de Serviço',
            'Requests': 'Pedidos',
            'Unknown': 'Outros'
        };
        return labels[collection] || collection;
    }

    /**
     * Formatar moeda
     */
    public formatCurrency(value: number): string {
        if (!value && value !== 0) return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    /**
     * Formatar data
     */
    public formatDate(date: Date): string {
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
            return 'Data inválida';
        }

        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    /**
     * Obter JSON dos dados brutos
     */
    public getRawDataJson(): string {
        const summary = {
            customer: {
                id: this.customer.customerId,
                name: this.customer.customerName,
                normalizedName: this.normalizeCustomerName(this.customer.customerName),
                email: this.customer.email,
                phone: this.customer.phone,
                cpfCnpj: this.customer.cpfCnpj,
                totalSpent: this.customer.totalSpent,
                totalPurchases: this.customer.totalPurchases
            },
            searchResults: {
                totalOrdersFound: this.allOrders.length,
                expectedOrders: this.customer.totalPurchases,
                difference: this.customer.totalPurchases - this.allOrders.length,
                ordersByCollection: this.ordersByCollection.map(c => ({
                    collection: c.name,
                    count: c.orders.length,
                    total: c.total
                }))
            },
            analysis: this.analysisResults,
            firstThreeOrders: this.allOrders.slice(0, 3).map(o => ({
                collection: o._collection,
                docId: o._docId,
                date: this.formatDate(o.date),
                value: o.value,
                customerInOrder: {
                    id: o.customerInOrder?._id,
                    name: o.customerInOrder?.name,
                    email: o.customerInOrder?.email
                },
                hasProducts: !!(o.products && o.products.length > 0),
                hasServices: !!(o.services && o.services.length > 0)
            }))
        };

        return JSON.stringify(summary, null, 2);
    }

    /**
     * Exportar dados em formato JSON
     */
    public exportData(): void {
        const data = {
            exportInfo: {
                exportDate: new Date().toISOString(),
                customerName: this.customer.customerName,
                customerId: this.customer.customerId,
                totalOrdersFound: this.allOrders.length,
                expectedOrders: this.customer.totalPurchases
            },
            customer: this.customer,
            orders: this.allOrders.map(order => ({
                ...order,
                dateFormatted: this.formatDate(order.date),
                valueFormatted: this.formatCurrency(order.value)
            })),
            summary: this.ordersByCollection,
            analysis: this.analysisResults
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cliente_${this.customer.customerId}_detalhes_${Date.now()}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
    }


    /**
     * Fechar modal
     */
    public close(): void {
        this.onClose.emit();
    }
}