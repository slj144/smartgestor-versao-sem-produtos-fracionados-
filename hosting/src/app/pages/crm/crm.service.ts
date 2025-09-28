// Arquivo: crm.service.ts
// Localização: src/app/pages/crm/crm.service.ts
// Componente: Serviço Principal do CRM - Corrigido com Debug Completo

import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { EventEmitter } from 'events';
import { iTools } from '@itools/index';

// Serviços
import { IToolsService } from '@shared/services/iTools.service';
import { NotificationService } from '@shared/services/notification.service';
import { SystemLogsService } from '@shared/services/system-logs.service';

// Interfaces
import { IBatch } from '@itools/interfaces/IBatch';
import { ICollection } from '@itools/interfaces/ICollection';
import { ESystemLogAction, ESystemLogType } from '@shared/interfaces/ISystemLog';
import { ENotificationStatus } from '@shared/interfaces/ISystemNotification';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { DateTime } from '@shared/utilities/dateTime';

// Types
import { query } from '@shared/types/query';
import { ECashierSaleOrigin, ECashierSaleStatus } from '@shared/interfaces/ICashierSale';

// 🆕 ENUM PARA TIPOS DE CANCELAMENTO
export enum ECancelReasonType {
    PRICE = 'price',
    COMPETITOR = 'competitor',
    NO_NEED = 'no_need',
    NO_BUDGET = 'no_budget',
    BAD_TIMING = 'bad_timing',
    POOR_SERVICE = 'poor_service',
    OTHER = 'other'
}

// Interfaces do CRM
export interface ICRMLead {
    _id?: string;
    code?: number;
    name: string;
    email: string;
    phone?: string;
    source: string;

    // 🆕 ATUALIZADO: Adicionado status 'cancelled'
    status: 'new' | 'contacted' | 'qualified' | 'negotiation' | 'closed' | 'lost' | 'cancelled';

    value?: number;
    notes?: string;
    tags?: string[];
    score?: number;
    assignedTo?: string;

    // 🆕 NOVOS CAMPOS PARA CANCELAMENTO
    cancelReason?: {
        type: string;           // Tipo do motivo (price, competitor, etc)
        description?: string;   // Descrição detalhada
        canRecover: boolean;    // Se pode ser recuperado
    };
    cancelDate?: Date | string;     // Data do cancelamento
    previousStatus?: string;        // Status anterior ao cancelamento
    archived?: boolean;             // Se está arquivado

    // Controle
    owner?: string;
    operator?: any;
    registerDate?: string;
    modifiedDate?: string;

    // Relacionamentos
    activityIds?: string[];
    saleIds?: string[];

    // Dados completos do cliente (cadastro público)
    customerData?: any;
}

export interface ICRMActivity {
    _id?: string;
    code?: number;
    title: string;
    type: 'call' | 'email' | 'meeting' | 'task' | 'whatsapp' | 'followup';
    status: 'pending' | 'completed' | 'cancelled' | 'overdue';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    description?: string;
    scheduledDate: Date | string;
    completedDate?: Date | string;
    leadId: string;
    leadName?: string;
    leadPhone?: string;
    leadEmail?: string;
    metadata?: any;

    // Controle
    owner?: string;
    operator?: any;
    registerDate?: string;
    modifiedDate?: string;
}

export interface ICRMPipeline {
    _id?: string;
    name: string;
    position: number;
    color: string;
    isActive: boolean;

    // Controle
    owner?: string;
    modifiedDate?: string;
}

@Injectable({
    providedIn: 'root'
})
export class CrmService {

    // Subjects para dados reativos
    private leadsSubject = new BehaviorSubject<ICRMLead[]>([]);
    private pipelineSubject = new BehaviorSubject<ICRMPipeline[]>([]);
    private activitiesSubject = new BehaviorSubject<ICRMActivity[]>([]);

    // 📄 Observable para notificar quando detectar garantia
    private warrantyDetected$ = new Subject<any>();
    public warrantyDetected = this.warrantyDetected$.asObservable();

    // Observables públicos
    public leads$ = this.leadsSubject.asObservable();
    public pipeline$ = this.pipelineSubject.asObservable();
    public activities$ = this.activitiesSubject.asObservable();

    // Dados em memória
    private leadsData: { [_id: string]: ICRMLead } = {};
    private activitiesData: { [_id: string]: ICRMActivity } = {};
    private pipelineData: { [_id: string]: ICRMPipeline } = {};

    // Controle de requisições
    private _dataMonitors: EventEmitter = new EventEmitter();
    private snapshots = {
        leads: null,
        activities: null,
        pipeline: null
    };

    constructor(
        private iToolsService: IToolsService,
        private notificationService: NotificationService,
        private systemLogsService: SystemLogsService
    ) {
        // Inicializar listeners do banco
        this.initializeListeners();
    }

    // Inicializar listeners em tempo real
    private initializeListeners(): void {
        // Pipeline - carregar uma vez (configuração mais estática)
        this.loadPipelineConfig();
    }

    // === LEADS ===

    // Buscar leads com filtros opcionais
    public getLeads(forceRefresh = false, filters?: any): void {
        console.log('🔍 getLeads chamado - forceRefresh:', forceRefresh);
        console.log('👤 Usuário:', Utilities.operator);
        console.log('🏢 StoreID:', Utilities.storeID);

        // Limpar snapshot anterior se forçar refresh
        if (forceRefresh && this.snapshots.leads) {
            this.collRef('leads').clearSnapshot(this.snapshots.leads);
            this.snapshots.leads = null;
        }

        // Se já tem snapshot ativo, não criar outro
        if (this.snapshots.leads) {
            console.log('📌 Snapshot já existe, retornando...');
            return;
        }

        // Query com filtros
        const querySettings: query = {
            orderBy: { code: -1 }
        };

        if (filters) {
            querySettings.where = this.buildWhereClause(filters);
        }

        console.log('📊 Query settings:', querySettings);

        try {
            // Criar snapshot para dados em tempo real
            this.snapshots.leads = this.collRef('leads', querySettings).onSnapshot((res) => {
                console.log('📥 Snapshot recebido - docs:', res.docs.length);

                // Processar mudanças
                for (const doc of res.changes()) {
                    const docData = doc.data();

                    if (doc.type === 'ADD' || doc.type === 'UPDATE') {
                        this.leadsData[docData._id] = docData;
                    }

                    if (doc.type === 'DELETE') {
                        delete this.leadsData[docData._id];
                    }
                }

                // Se não teve mudanças, carregar todos
                if (res.changes().length === 0) {
                    for (const doc of res.docs) {
                        const docData = doc.data();
                        this.leadsData[docData._id] = docData;
                    }
                }

                // Emitir dados tratados
                const leads = this.treatLeadsData();
                console.log('✅ Leads tratados:', leads.length);
                this.leadsSubject.next(leads);
            }, (error) => {
                console.error('❌ Erro no snapshot de leads:', error);
                this.leadsSubject.next([]);
                this.notification('Erro ao carregar leads', 'error');
            });
        } catch (error) {
            console.error('❌ Erro ao criar snapshot:', error);
            this.leadsSubject.next([]);
            this.notification('Erro ao acessar leads', 'error');
        }
    }

    // Arquivo: crm.service.ts
    // Localização: src/app/pages/crm/crm.service.ts
    // CORREÇÃO: Gerar ID único manualmente para o lead

    public async createLead(leadData: any): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                Utilities.loading();

                const batch: IBatch = this.iToolsService.database().batch() as IBatch;

                // 🔥 CORREÇÃO: GERAR ID ÚNICO MANUALMENTE
                // Usar o mesmo padrão que o PDV usa
                const leadId = `LEAD-${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

                console.log('🆔 ID único gerado para o lead:', leadId);

                // Criar referência com o ID específico
                const docRef = this.collRef('leads').doc(leadId);

                // Preparar dados do lead COM O ID
                const lead: ICRMLead = {
                    ...leadData,
                    _id: leadId, // ID único gerado
                    code: iTools.FieldValue.control('SystemControls', Utilities.storeID, 'CRMLeads.code'),
                    owner: Utilities.storeID,
                    operator: Utilities.operator,
                    registerDate: iTools.FieldValue.date(Utilities.timezone),
                    modifiedDate: iTools.FieldValue.date(Utilities.timezone),
                    status: leadData.status || 'new',
                    score: leadData.score || 0,
                    tags: leadData.tags || [],
                    activityIds: [],
                    saleIds: [],
                    // Inicializar campos de cancelamento
                    cancelReason: null,
                    cancelDate: null,
                    previousStatus: null,
                    archived: false
                };

                console.log('📋 Lead preparado:', {
                    _id: lead._id,
                    code: lead.code,
                    name: lead.name,
                    status: lead.status
                });

                // Usar a referência com o ID específico
                const batchRef = batch.update(docRef, lead, { merge: true });

                // Log do sistema
                await this.systemLogs([{
                    referenceCode: iTools.FieldValue.bindBatchData(batchRef, 'code'),
                    type: ESystemLogType.ServiceOrders,
                    action: ESystemLogAction.REGISTER,
                    note: `CRM - Lead cadastrado: ${lead.name}`
                }], batch);

                // Commit
                await batch.commit();

                console.log('✅ Lead criado com sucesso!');
                console.log('🆔 ID do lead:', leadId);
                console.log('📝 Código do lead:', lead.code);

                // Adicionar o lead na memória local
                if (this.leadsData) {
                    this.leadsData[leadId] = lead;
                }

                Utilities.loading(false);
                this.notification('Lead cadastrado com sucesso!', 'success');

                // 🔥 RETORNAR APENAS O ID DO LEAD
                resolve(leadId);

            } catch (error) {
                console.error('❌ Erro ao criar lead:', error);
                Utilities.loading(false);
                this.notification('Erro ao cadastrar lead', 'error');
                reject(error);
            }
        });
    }

    // Atualizar lead
    public async updateLead(leadId: string, updates: Partial<ICRMLead>): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                Utilities.loading();

                const batch: IBatch = this.iToolsService.database().batch() as IBatch;

                // Adicionar data de modificação
                updates.modifiedDate = iTools.FieldValue.date(Utilities.timezone);

                // 🆕 Se está cancelando, adicionar data de cancelamento
                if (updates.status === 'cancelled' && !updates.cancelDate) {
                    updates.cancelDate = iTools.FieldValue.date(Utilities.timezone);
                }

                // Atualizar documento
                batch.update(
                    this.collRef('leads').doc(leadId),
                    updates
                );

                // Log do sistema
                const lead = this.leadsData[leadId];
                await this.systemLogs([{
                    referenceCode: lead?.code || 0,
                    type: ESystemLogType.ServiceOrders,
                    action: ESystemLogAction.UPDATE,
                    note: `CRM - Lead atualizado: ${lead?.name}${updates.status === 'cancelled' ? ' (CANCELADO)' : ''}`
                }], batch);

                // Commit
                await batch.commit();

                Utilities.loading(false);
                this.notification('Lead atualizado com sucesso!', 'success');
                resolve({ status: true });

            } catch (error) {
                Utilities.loading(false);
                this.notification('Erro ao atualizar lead', 'error');
                reject(error);
            }
        });
    }

    // Deletar lead
    public async deleteLead(leadId: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                Utilities.loading();

                const batch: IBatch = this.iToolsService.database().batch() as IBatch;
                let lead = this.leadsData[leadId];

                // Se o lead não está em memória, buscar diretamente no banco
                if (!lead) {
                    const leadDoc = await this.iToolsService.database()
                        .collection('CRMLeads')
                        .doc(leadId)
                        .get();

                    if (leadDoc && leadDoc.data()) {
                        lead = leadDoc.data();
                    }
                }

                if (!lead) {
                    throw new Error('Lead não encontrado');
                }

                // Deletar lead
                batch.delete(this.collRef('leads').doc(leadId));

                // Deletar atividades relacionadas
                if (lead.activityIds && lead.activityIds.length > 0) {
                    for (const activityId of lead.activityIds) {
                        batch.delete(this.collRef('activities').doc(activityId));
                    }
                }

                // Log do sistema
                await this.systemLogs([{
                    referenceCode: lead.code,
                    type: ESystemLogType.ServiceOrders,
                    action: ESystemLogAction.DELETION,
                    note: `CRM - Lead excluído: ${lead.name}`
                }], batch);

                // Commit
                await batch.commit();

                Utilities.loading(false);
                this.notification('Lead excluído com sucesso!', 'success');
                resolve({ status: true });

            } catch (error) {
                Utilities.loading(false);
                this.notification('Erro ao excluir lead', 'error');
                reject(error);
            }
        });
    }

    // === ATIVIDADES ===

    // Buscar atividades
    public getActivities(forceRefresh = false, filters?: any): void {
        console.log('🔍 Buscando atividades...');

        if (forceRefresh && this.snapshots.activities) {
            this.collRef('activities').clearSnapshot(this.snapshots.activities);
            this.snapshots.activities = null;
        }

        if (this.snapshots.activities) {
            console.log('📌 Usando snapshot existente');
            return;
        }

        const querySettings: query = {
            orderBy: { scheduledDate: 1, code: -1 }
        };

        if (filters) {
            querySettings.where = this.buildWhereClause(filters);
        }

        console.log('📊 Query settings:', querySettings);

        this.snapshots.activities = this.collRef('activities', querySettings).onSnapshot((res) => {
            console.log('📥 Snapshot recebido:', res.docs.length, 'documentos');

            // Limpar dados anteriores se não houver mudanças
            if (res.changes().length === 0) {
                this.activitiesData = {};
                for (const doc of res.docs) {
                    const docData = doc.data();
                    console.log('📄 Documento:', docData);
                    this.activitiesData[docData._id] = docData;
                }
            } else {
                // Processar mudanças
                for (const doc of res.changes()) {
                    const docData = doc.data();
                    console.log('🔄 Mudança:', doc.type, docData);

                    if (doc.type === 'ADD' || doc.type === 'UPDATE') {
                        this.activitiesData[docData._id] = docData;
                    }

                    if (doc.type === 'DELETE') {
                        delete this.activitiesData[docData._id];
                    }
                }
            }

            const activities = this.treatActivitiesData();
            console.log('✅ Atividades tratadas:', activities);
            this.activitiesSubject.next(activities);
        }, (error) => {
            console.error('❌ Erro ao buscar atividades:', error);
            this.activitiesSubject.next([]);
        });
    }

    // Arquivo: crm.service.ts
    // Localização: src/app/pages/crm/crm.service.ts
    // CORREÇÃO: Método createActivity usando o padrão correto do projeto

    public async createActivity(activityData: any): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                console.log('🚀 Criando atividade:', activityData);
                console.log('🔑 LeadId fornecido:', activityData.leadId);

                // 🛡️ VALIDAÇÃO ESPECIAL PARA ATIVIDADES DE RECOMPRA
                if (activityData.metadata?.activityType === 'recompra') {
                    console.log('🔄 Detectada atividade de RECOMPRA');

                    // Verificar se tem leadId (OBRIGATÓRIO para recompra)
                    if (!activityData.leadId) {
                        // Tentar recuperar do metadata como backup
                        if (activityData.metadata?.leadId) {
                            activityData.leadId = activityData.metadata.leadId;
                            console.log('🔧 LeadId recuperado do metadata:', activityData.leadId);
                        } else {
                            console.error('❌ ERRO: Atividade de recompra sem leadId!');
                            reject(new Error('LeadId é obrigatório para atividades de recompra'));
                            return;
                        }
                    }
                }

                Utilities.loading();

                // Criar batch para operações no banco
                const batch: IBatch = this.iToolsService.database().batch() as IBatch;

                // Gerar referência e ID para o novo documento
                const docRef = this.collRef('activities').doc();
                const activityId = docRef.id;

                // Montar objeto da atividade com todos os dados necessários
                const activity: ICRMActivity = {
                    ...activityData,
                    _id: activityId, // ID único da atividade
                    code: iTools.FieldValue.control('SystemControls', Utilities.storeID, 'CRMActivities.code'),
                    owner: activityData.owner || Utilities.storeID,
                    operator: activityData.operator || Utilities.operator,
                    registerDate: activityData.registerDate || iTools.FieldValue.date(Utilities.timezone),
                    modifiedDate: iTools.FieldValue.date(Utilities.timezone),
                    status: activityData.status || 'pending',
                    priority: activityData.priority || 'medium',

                    // 🔑 GARANTIR QUE O LEADID ESTÁ PRESENTE
                    leadId: activityData.leadId || null,

                    // Preservar todos os metadados (informações extras)
                    metadata: activityData.metadata || {}
                };

                console.log('📄 Atividade preparada para salvar:', {
                    _id: activity._id,
                    title: activity.title,
                    leadId: activity.leadId,
                    leadName: activity.leadName,
                    leadPhone: activity.leadPhone,
                    type: activity.type,
                    metadata: activity.metadata
                });

                // ✅ CRIAR DOCUMENTO USANDO O PADRÃO DO PROJETO
                // Este projeto usa update com merge: true para criar novos documentos
                const batchRef = batch.update(docRef, activity, { merge: true });

                // Se tem leadId, vincular a atividade ao lead
                if (activity.leadId) {
                    console.log('🔗 Vinculando atividade ao lead:', activity.leadId);

                    try {
                        // Buscar o lead para adicionar esta atividade na lista dele
                        const leadDoc = await this.collRef('leads').doc(activity.leadId).get();

                        if (leadDoc.exists) {
                            const leadData = leadDoc.data();
                            const activityIds = leadData?.activityIds || [];

                            // Adicionar o ID desta nova atividade ao lead
                            if (!activityIds.includes(activityId)) {
                                activityIds.push(activityId);
                            }

                            // Atualizar o lead com a nova lista de atividades
                            batch.update(this.collRef('leads').doc(activity.leadId), {
                                activityIds: activityIds,
                                modifiedDate: iTools.FieldValue.date(Utilities.timezone),
                                // Adicionar flag indicando que tem atividade de recompra
                                hasRecompraActivity: activity.metadata?.activityType === 'recompra'
                            });

                            console.log('✅ Lead será atualizado com a atividade');
                        } else {
                            console.warn('⚠️ Lead não encontrado:', activity.leadId);
                        }
                    } catch (error) {
                        console.warn('⚠️ Erro ao buscar lead para vincular atividade:', error);
                        // Continua mesmo se falhar o vínculo - a atividade ainda será criada
                    }
                }

                // Registrar no log do sistema (usando o tipo correto)
                await this.systemLogs([{
                    referenceCode: iTools.FieldValue.bindBatchData(batchRef, 'code'),
                    type: ESystemLogType.ServiceOrders, // ✅ Tipo correto usado no projeto
                    action: ESystemLogAction.REGISTER,
                    note: `CRM - Atividade criada: ${activity.title}`
                }], batch);

                console.log('💾 Salvando no banco de dados...');
                await batch.commit();

                console.log('✅ Atividade criada com sucesso!');
                console.log('🆔 ID da atividade:', activityId);
                console.log('🔗 Vinculada ao lead:', activity.leadId);

                Utilities.loading(false);
                this.notification('Atividade criada com sucesso!', 'success');

                // Retornar o ID da atividade criada
                resolve(activityId);

            } catch (error) {
                console.error('❌ Erro ao criar atividade:', error);
                Utilities.loading(false);
                this.notification('Erro ao criar atividade', 'error');
                reject(error);
            }
        });
    }

    // Forçar atualização das atividades
    public forceRefreshActivities(): void {
        console.log('🔄 Forçando atualização das atividades...');

        // Limpar snapshot atual para forçar nova busca
        if (this.snapshots.activities) {
            this.collRef('activities').clearSnapshot(this.snapshots.activities);
            this.snapshots.activities = null;
        }

        // Buscar novamente
        this.getActivities(true);

        // Garantir que os componentes sejam atualizados
        setTimeout(() => {
            const activities = this.treatActivitiesData();
            this.activitiesSubject.next(activities);
            console.log('✅ Atividades forçadas a atualizar:', activities.length);
        }, 1000);
    }

    // Atualizar atividade
    public async updateActivity(activityId: string, updates: Partial<ICRMActivity>): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                Utilities.loading();

                const batch: IBatch = this.iToolsService.database().batch() as IBatch;

                // Adicionar data de modificação
                updates.modifiedDate = iTools.FieldValue.date(Utilities.timezone);

                // Atualizar documento
                batch.update(
                    this.collRef('activities').doc(activityId),
                    updates
                );

                // Log do sistema
                const activity = this.activitiesData[activityId];
                await this.systemLogs([{
                    referenceCode: activity?.code || 0,
                    type: ESystemLogType.ServiceOrders,
                    action: ESystemLogAction.UPDATE,
                    note: `CRM - Atividade atualizada: ${activity?.title}`
                }], batch);

                // Commit
                await batch.commit();

                Utilities.loading(false);
                this.notification('Atividade atualizada com sucesso!', 'success');
                resolve({ status: true });

            } catch (error) {
                Utilities.loading(false);
                this.notification('Erro ao atualizar atividade', 'error');
                reject(error);
            }
        });
    }

    // Deletar atividade - versão simplificada
    public async deleteActivity(activityId: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                Utilities.loading();

                const batch: IBatch = this.iToolsService.database().batch() as IBatch;
                const activity = this.activitiesData[activityId];

                if (!activity) {
                    throw new Error('Atividade não encontrada');
                }

                // Deletar atividade
                batch.delete(this.collRef('activities').doc(activityId));

                // Remover referência do lead (usando dados em memória)
                if (activity.leadId && this.leadsData[activity.leadId]) {
                    const leadData = this.leadsData[activity.leadId];
                    const activityIds = (leadData.activityIds || []).filter(id => id !== activityId);

                    batch.update(this.collRef('leads').doc(activity.leadId), {
                        activityIds: activityIds,
                        modifiedDate: iTools.FieldValue.date(Utilities.timezone)
                    });
                }

                // Log do sistema
                await this.systemLogs([{
                    referenceCode: activity.code,
                    type: ESystemLogType.ServiceOrders,
                    action: ESystemLogAction.DELETION,
                    note: `CRM - Atividade excluída: ${activity.title}`
                }], batch);

                // Commit
                await batch.commit();

                Utilities.loading(false);
                this.notification('Atividade excluída com sucesso!', 'success');
                resolve({ status: true });

            } catch (error) {
                Utilities.loading(false);
                this.notification('Erro ao excluir atividade', 'error');
                reject(error);
            }
        });
    }

    // === PIPELINE ===

    // Buscar configuração do pipeline
    public getPipeline(forceRefresh = false): void {
        if (forceRefresh) {
            this.loadPipelineConfig();
        }
    }

    private loadPipelineConfig(): void {
        // Pipeline é por tenant, então filtrar por owner
        this.collRef('pipeline', { orderBy: { position: 1 } }).get().then((res) => {
            this.pipelineData = {};

            for (const doc of res.docs) {
                const data = doc.data();
                this.pipelineData[data._id] = data;
            }

            // Se não tem pipeline, criar padrão
            if (res.docs.length === 0) {
                this.createDefaultPipeline();
            } else {
                const pipeline = this.treatPipelineData();
                this.pipelineSubject.next(pipeline);
            }
        });
    }

    // Criar pipeline padrão
    private async createDefaultPipeline(): Promise<void> {
        const defaultStages = [
            { name: 'Prospecção', position: 1, color: '#667eea', isActive: true },
            { name: 'Qualificação', position: 2, color: '#764ba2', isActive: true },
            { name: 'Proposta', position: 3, color: '#f093fb', isActive: true },
            { name: 'Negociação', position: 4, color: '#4facfe', isActive: true },
            { name: 'Fechamento', position: 5, color: '#43e97b', isActive: true }
        ];

        const batch: IBatch = this.iToolsService.database().batch() as IBatch;

        for (const stage of defaultStages) {
            const docRef = this.collRef('pipeline').doc();
            const data: ICRMPipeline = {
                ...stage,
                _id: docRef.id,
                owner: Utilities.storeID,
                modifiedDate: iTools.FieldValue.date(Utilities.timezone)
            };

            batch.update(docRef, data, { merge: true });
        }

        await batch.commit();
        this.loadPipelineConfig();
    }

    // === MÉTODOS AUXILIARES ===

    // Construir cláusula where
    private buildWhereClause(filters: any): any[] {
        const where = [];

        // Sempre filtrar por tenant
        where.push({ field: 'owner', operator: '=', value: Utilities.storeID });

        // Adicionar outros filtros
        if (filters.status && filters.status !== 'all') {
            where.push({ field: 'status', operator: '=', value: filters.status });
        }

        if (filters.source && filters.source !== 'all') {
            where.push({ field: 'source', operator: '=', value: filters.source });
        }

        if (filters.leadId) {
            where.push({ field: 'leadId', operator: '=', value: filters.leadId });
        }

        if (filters.dateFrom) {
            where.push({ field: 'scheduledDate', operator: '>=', value: filters.dateFrom });
        }

        if (filters.dateTo) {
            where.push({ field: 'scheduledDate', operator: '<=', value: filters.dateTo });
        }

        return where;
    }

    // Referência da collection com debug
    private collRef(type: 'leads' | 'activities' | 'pipeline', settings?: query): ICollection {
        const collectionMap = {
            leads: 'CRMLeads',
            activities: 'CRMActivities',
            pipeline: 'CRMPipeline'
        };

        console.log(`📂 Acessando collection: ${collectionMap[type]}`);
        console.log('⚙️ Settings:', settings);
        console.log('🏢 Tenant (owner):', Utilities.storeID);

        const collection = this.iToolsService.database().collection(collectionMap[type]);

        settings = Utilities.deepClone(settings || {});

        // Sempre filtrar por tenant
        if (settings.where) {
            settings.where.push({ field: 'owner', operator: '=', value: Utilities.storeID });
        } else {
            settings.where = [{ field: 'owner', operator: '=', value: Utilities.storeID }];
        }

        console.log('🔍 Where final:', settings.where);

        if (settings.orderBy) {
            collection.orderBy(settings.orderBy);
        }

        collection.where(settings.where);

        if (settings.or) {
            collection.or(settings.or);
        }

        if (settings.limit) {
            collection.limit(settings.limit);
        }

        return collection;
    }

    // 🔧 FUNÇÃO CORRIGIDA - Linha 727-741
    // Tratar dados dos leads com proteção completa
    private treatLeadsData(): ICRMLead[] {
        console.log('🔧 CRM: Iniciando tratamento dos dados dos leads...');
        console.log('🔧 CRM: Total de leads brutos:', Object.keys(this.leadsData || {}).length);

        const leads = [];

        try {
            // 🛡️ PROTEÇÃO: Verificar se leadsData existe
            if (!this.leadsData || typeof this.leadsData !== 'object') {
                console.warn('⚠️ CRM: leadsData está undefined ou não é um objeto:', this.leadsData);
                return [];
            }

            // 🔄 PROCESSAR: Iterar sobre os leads
            for (const [leadId, lead] of Object.entries(this.leadsData)) {
                try {
                    // 🛡️ PROTEÇÃO: Verificar se o lead existe
                    if (!lead || typeof lead !== 'object') {
                        console.warn('⚠️ CRM: Lead undefined encontrado para ID:', leadId);
                        continue;
                    }

                    // 🛡️ PROTEÇÃO: Verificar se o code existe antes de processar
                    const leadCode = lead.code;
                    if (leadCode === undefined || leadCode === null) {
                        console.warn('⚠️ CRM: Lead sem code encontrado:', {
                            id: leadId,
                            name: lead.name || 'Sem nome',
                            code: leadCode
                        });
                    }

                    // 🔧 PROCESSAR: Criar lead tratado com proteções
                    const treated = {
                        ...lead,
                        // 🔧 PROTEÇÃO: Só aplicar prefixCode se o code existir e for válido
                        code: leadCode !== undefined && leadCode !== null
                            ? Utilities.prefixCode(leadCode)
                            : `LEAD-${Date.now()}`, // Código de emergência

                        // 🔧 PROTEÇÃO: Garantir campos obrigatórios
                        name: lead.name || 'Nome não informado',
                        email: lead.email || '',
                        status: lead.status || 'new',
                        source: lead.source || 'Sistema',

                        // 🔧 PROTEÇÃO: Arrays que podem não existir
                        tags: Array.isArray(lead.tags) ? lead.tags : [],
                        activityIds: Array.isArray(lead.activityIds) ? lead.activityIds : [],
                        saleIds: Array.isArray(lead.saleIds) ? lead.saleIds : [],

                        // 🔧 PROTEÇÃO: Valores numéricos
                        value: typeof lead.value === 'number' ? lead.value : 0,
                        score: typeof lead.score === 'number' ? lead.score : 0,

                        // 🆕 PROTEÇÃO: Campos de cancelamento
                        cancelReason: lead.cancelReason || null,
                        cancelDate: lead.cancelDate || null,
                        previousStatus: lead.previousStatus || null,
                        archived: lead.archived || false,

                        // 🔧 PROTEÇÃO: ID interno
                        _id: leadId
                    };

                    leads.push(treated);
                    console.log('✅ CRM: Lead processado:', {
                        id: leadId,
                        name: treated.name,
                        code: treated.code,
                        status: treated.status
                    });

                } catch (leadError) {
                    console.error('❌ CRM: Erro ao processar lead individual:', {
                        leadId,
                        error: leadError,
                        lead: lead
                    });
                    continue;
                }
            }

            // 🔄 ORDENAR: Ordenar por código decrescente (com proteção)
            leads.sort((a, b) => {
                try {
                    const codeA = String(a.code || '');
                    const codeB = String(b.code || '');
                    return codeB.localeCompare(codeA);
                } catch (sortError) {
                    console.error('❌ CRM: Erro ao ordenar leads:', sortError);
                    return 0;
                }
            });

            console.log('✅ CRM: Leads processados com sucesso:', {
                total: leads.length,
                primeiros3: leads.slice(0, 3).map(l => ({ name: l.name, code: l.code, status: l.status }))
            });

            return leads;

        } catch (globalError) {
            console.error('❌ CRM: Erro global ao tratar dados dos leads:', globalError);
            console.error('❌ CRM: leadsData atual:', this.leadsData);
            return [];
        }
    }

    // 🔧 FUNÇÃO CORRIGIDA - Linha 743-768
    // Tratar dados das atividades com proteção completa
    private treatActivitiesData(): ICRMActivity[] {
        console.log('🔧 CRM: Iniciando tratamento dos dados das atividades...');
        console.log('🔧 CRM: Total de atividades brutas:', Object.keys(this.activitiesData || {}).length);

        const activities = [];

        try {
            // 🛡️ PROTEÇÃO: Verificar se activitiesData existe
            if (!this.activitiesData || typeof this.activitiesData !== 'object') {
                console.warn('⚠️ CRM: activitiesData está undefined ou não é um objeto:', this.activitiesData);
                return [];
            }

            // 🔄 PROCESSAR: Iterar sobre as atividades
            for (const [activityId, activity] of Object.entries(this.activitiesData)) {
                try {
                    // 🛡️ PROTEÇÃO: Verificar se a atividade existe
                    if (!activity || typeof activity !== 'object') {
                        console.warn('⚠️ CRM: Atividade undefined encontrada para ID:', activityId);
                        continue;
                    }

                    // 🛡️ PROTEÇÃO: Verificar se o code existe antes de processar
                    const activityCode = activity.code;
                    if (activityCode === undefined || activityCode === null) {
                        console.warn('⚠️ CRM: Atividade sem code encontrada:', {
                            id: activityId,
                            title: activity.title || 'Sem título',
                            code: activityCode
                        });
                    }

                    // 🔍 BUSCA: Buscar dados do lead relacionado (com proteção)
                    let lead = null;
                    let leadName = 'Lead não encontrado';

                    if (activity.leadId && this.leadsData && this.leadsData[activity.leadId]) {
                        lead = this.leadsData[activity.leadId];
                        leadName = lead?.name || 'Nome não informado';
                    } else {
                        console.warn('⚠️ CRM: Lead não encontrado para atividade:', {
                            activityId,
                            leadId: activity.leadId,
                            title: activity.title
                        });
                    }
                    // 🔧 PROCESSAR: Normalizar data agendada
                    let normalizedDate = activity.scheduledDate;
                    if (
                        normalizedDate &&
                        typeof normalizedDate === 'object' &&
                        (normalizedDate as any).seconds
                    ) {
                        const ts = normalizedDate as any;
                        normalizedDate = new Date(ts.seconds * 1000).toISOString();
                    }
                    // 🔧 PROCESSAR: Criar atividade tratada com proteções
                    const treated = {
                        ...activity,
                        // 🔧 PROTEÇÃO: Só aplicar prefixCode se o code existir e for válido
                        code: activityCode !== undefined && activityCode !== null
                            ? Utilities.prefixCode(activityCode)
                            : `ACT-${activityId}`, // Código de emergência baseado no ID

                        // 🔧 PROTEÇÃO: Adicionar nome do lead
                        leadName: leadName,

                        // 🔧 PROTEÇÃO: Garantir campos obrigatórios
                        title: activity.title || 'Atividade sem título',
                        type: activity.type || 'task',
                        status: activity.status || 'pending',
                        priority: activity.priority || 'medium',

                        // 🔧 PROTEÇÃO: Datas
                        scheduledDate: normalizedDate || new Date().toISOString(),

                        // 🔧 PROTEÇÃO: ID interno
                        _id: activityId,

                        // 🔧 PROTEÇÃO: Relacionamentos
                        leadId: activity.leadId || null
                    };

                    // 🕰️ VERIFICAÇÃO: Verificar se está atrasada (com proteção)
                    try {
                        if (treated.status === 'pending' && treated.scheduledDate) {
                            const scheduledDate = new Date(treated.scheduledDate);
                            const today = new Date();

                            // Zerar horários para comparar apenas datas
                            today.setHours(0, 0, 0, 0);
                            scheduledDate.setHours(0, 0, 0, 0);

                            if (scheduledDate < today) {
                                treated.status = 'overdue';
                                console.log('⏰ CRM: Atividade marcada como atrasada:', {
                                    id: activityId,
                                    title: treated.title,
                                    scheduledDate: treated.scheduledDate
                                });
                            }
                        }
                    } catch (dateError) {
                        console.error('❌ CRM: Erro ao verificar data da atividade:', {
                            activityId,
                            error: dateError,
                            scheduledDate: treated.scheduledDate
                        });
                    }

                    activities.push(treated);
                    console.log('✅ CRM: Atividade processada:', {
                        id: activityId,
                        title: treated.title,
                        code: treated.code,
                        status: treated.status,
                        leadName: treated.leadName
                    });

                } catch (activityError) {
                    console.error('❌ CRM: Erro ao processar atividade individual:', {
                        activityId,
                        error: activityError,
                        activity: activity
                    });
                    continue;
                }
            }

            // 🔄 ORDENAR: Ordenar por data agendada (com proteção)
            activities.sort((a, b) => {
                try {
                    const dateA = new Date(a.scheduledDate || 0).getTime();
                    const dateB = new Date(b.scheduledDate || 0).getTime();
                    return dateA - dateB;
                } catch (sortError) {
                    console.error('❌ CRM: Erro ao ordenar atividades:', sortError);
                    return 0;
                }
            });

            console.log('✅ CRM: Atividades processadas com sucesso:', {
                total: activities.length,
                pendentes: activities.filter(a => a.status === 'pending').length,
                atrasadas: activities.filter(a => a.status === 'overdue').length,
                primeiras3: activities.slice(0, 3).map(a => ({
                    title: a.title,
                    code: a.code,
                    status: a.status,
                    leadName: a.leadName
                }))
            });

            return activities;

        } catch (globalError) {
            console.error('❌ CRM: Erro global ao tratar dados das atividades:', globalError);
            console.error('❌ CRM: activitiesData atual:', this.activitiesData);
            console.error('❌ CRM: leadsData atual:', this.leadsData);
            return [];
        }
    }

    // Tratar dados do pipeline
    private treatPipelineData(): ICRMPipeline[] {
        const pipeline = Object.values(this.pipelineData)
            .filter(stage => stage.isActive)
            .sort((a, b) => a.position - b.position);

        return pipeline;
    }

    // Notificações
    private notification(message: string, type: 'success' | 'error'): void {
        const settings: any = {
            title: 'CRM',
            description: message,
            status: type === 'success' ? ENotificationStatus.success : ENotificationStatus.danger
        };

        this.notificationService.create(settings);
    }

    // System logs
    private async systemLogs(data: any[], batch: IBatch): Promise<any> {
        return this.systemLogsService.registerLogs({ data }, batch);
    }

    // 🆕 MÉTODOS DE ESTATÍSTICAS
    public getStats(): any {
        const leads = this.treatLeadsData();

        // Estatísticas de leads
        const leadStats = {
            total: leads.length,
            byStatus: {} as any,
            totalValue: 0,
            cancelled: { // 🆕 Estatísticas de cancelamento
                count: 0,
                value: 0,
                recoverable: 0
            }
        };

        // Calcular por status
        leads.forEach(lead => {
            // Por status
            if (!leadStats.byStatus[lead.status]) {
                leadStats.byStatus[lead.status] = 0;
            }
            leadStats.byStatus[lead.status]++;

            // Valor total
            leadStats.totalValue += lead.value || 0;

            // 🆕 Estatísticas de cancelamento
            if (lead.status === 'cancelled') {
                leadStats.cancelled.count++;
                leadStats.cancelled.value += lead.value || 0;
                if (lead.cancelReason?.canRecover) {
                    leadStats.cancelled.recoverable++;
                }
            }
        });

        return { leads: leadStats };
    }

    // 🆕 MÉTODOS ESPECÍFICOS PARA CANCELAMENTO

    // Obter leads cancelados
    public getCancelledLeads(): ICRMLead[] {
        return this.treatLeadsData().filter(lead => lead.status === 'cancelled');
    }

    // Obter leads recuperáveis
    public getRecoverableLeads(): ICRMLead[] {
        return this.getCancelledLeads().filter(lead => lead.cancelReason?.canRecover);
    }

    // Tentar recuperar lead cancelado
    public async recoverLead(leadId: string): Promise<any> {
        const lead = this.leadsData[leadId];
        if (!lead || lead.status !== 'cancelled') {
            throw new Error('Lead não encontrado ou não está cancelado');
        }

        // Voltar ao status anterior ou 'new' se não tiver
        const newStatus = lead.previousStatus || 'new';

        return this.updateLead(leadId, {
            status: newStatus as any,
            cancelReason: null,
            cancelDate: null,
            previousStatus: null,
            notes: `${lead.notes || ''}\n\n🔄 Lead recuperado em ${new Date().toLocaleDateString('pt-BR')}`
        });
    }
    /**
       * ✅ CONVERTER LEAD EM VENDA SIMPLES E CRIAR PÓS-VENDA
       * Este método registra uma venda concluída no caixa a partir do lead
       * e cria automaticamente uma atividade de pós-venda
       */
    public async closeLeadAsSale(lead: ICRMLead): Promise<void> {
        try {
            const saleId = this.iToolsService.database().collection('CashierSales').doc().id;

            const saleData: any = {
                _id: saleId,
                customer: lead.customerData ? {
                    _id: lead.customerData._id,
                    code: lead.customerData.code,
                    name: lead.customerData.name,
                    phone: lead.customerData.phone,
                    email: lead.customerData.email
                } : {
                    code: '',
                    name: lead.name,
                    phone: lead.phone,
                    email: lead.email
                },
                products: [],
                paymentMethods: [],
                balance: { subtotal: { products: lead.value || 0 }, total: lead.value || 0 },
                status: ECashierSaleStatus.CONCLUDED,
                origin: ECashierSaleOrigin.CRM,
                owner: Utilities.storeID,
                operator: Utilities.operator,
                registerDate: iTools.FieldValue.date(Utilities.timezone),
                modifiedDate: iTools.FieldValue.date(Utilities.timezone)
            };
            console.log('📝 closeLeadAsSale - nova venda criada via CRM', {
                saleId,
                origin: saleData.origin,
                leadId: lead._id
            });

            const activityId = this.iToolsService.database().collection('CRMActivities').doc().id;
            const activityData: any = {
                _id: activityId,
                title: `Pós-venda: ${lead.name}`,
                type: 'whatsapp',
                status: 'pending',
                priority: 'medium',
                description: 'Contato de pós-venda',
                scheduledDate: iTools.FieldValue.date(Utilities.timezone),
                leadId: lead._id,
                saleId: saleId,
                owner: Utilities.storeID,
                operator: Utilities.operator,
                registerDate: iTools.FieldValue.date(Utilities.timezone),
                modifiedDate: iTools.FieldValue.date(Utilities.timezone),
                tags: ['pos-venda']
            };

            const batch: IBatch = this.iToolsService.database().batch() as IBatch;

            batch.update(
                this.iToolsService.database().collection('CashierSales').doc(saleId),
                saleData,
                { merge: true }
            );

            const updatedSaleIds = Array.isArray(lead.saleIds) ? [...lead.saleIds, saleId] : [saleId];
            batch.update(
                this.collRef('leads').doc(lead._id!),
                { saleIds: updatedSaleIds },
                { merge: true }
            );

            batch.update(
                this.iToolsService.database().collection('CRMActivities').doc(activityId),
                activityData,
                { merge: true }
            );

            await batch.commit();

            this.notification('Lead convertido em venda', 'success');

            // Forçar atualização para refletir nova venda e atividade
            this.getLeads(true);
            this.getActivities(true);

        } catch (error) {
            console.error('❌ Erro ao converter lead em venda:', error);
            this.notification('Erro ao registrar venda do lead', 'error');
        }
    }

    // Obter estatísticas de cancelamento por motivo
    public getCancellationStatsByReason(): any {
        const cancelled = this.getCancelledLeads();
        const stats: any = {};

        cancelled.forEach(lead => {
            const reason = lead.cancelReason?.type || 'other';
            if (!stats[reason]) {
                stats[reason] = {
                    count: 0,
                    value: 0,
                    recoverable: 0
                };
            }
            stats[reason].count++;
            stats[reason].value += lead.value || 0;
            if (lead.cancelReason?.canRecover) {
                stats[reason].recoverable++;
            }
        });

        return stats;
    }

    /**
     * 🛡️ VERIFICAR E NOTIFICAR SOBRE GARANTIAS
     * Este método verifica se uma venda tem garantia e prepara o contexto
     */
    public async checkAndNotifyWarranty(sale: any, leadId: string): Promise<void> {
        try {
            // Verificar se tem garantia
            const warranty = sale.warranty || sale.service?.warranty;

            if (!warranty || warranty.trim() === '') {
                return; // Não tem garantia, não fazer nada
            }

            console.log('🛡️ Garantia detectada na venda:', warranty);

            // Criar um contexto especial para garantia
            const warrantyContext = {
                isWarranty: true,
                warranty: warranty,
                leadId: leadId,
                customerName: sale.customer?.name || 'Cliente',
                customerPhone: sale.customer?.phone,
                customerEmail: sale.customer?.email,
                saleId: sale.id,
                saleDate: new Date(),
                productName: sale.products?.[0]?.name || sale.service?.name || 'Item',
                saleValue: sale.value || sale.totalValue,
                // Tipo de negócio detectado
                businessType: this.detectBusinessTypeFromSale(sale)
            };

            // Salvar no localStorage para o modal de templates usar
            localStorage.setItem('warranty_context', JSON.stringify(warrantyContext));

            // Emitir evento para notificar outros componentes
            this.warrantyDetected$.next(warrantyContext);

            // Criar uma atividade de follow-up para enviar garantia
            await this.createWarrantyFollowUp(leadId, warrantyContext);

        } catch (error) {
            console.error('❌ Erro ao verificar garantia:', error);
        }
    }

    /**
     * 🏪 DETECTAR TIPO DE NEGÓCIO PELA VENDA
     */
    private detectBusinessTypeFromSale(sale: any): string {
        const saleText = JSON.stringify(sale).toLowerCase();

        // Lógica similar à do componente de templates
        if (saleText.includes('celular') || saleText.includes('smartphone')) {
            return 'celular';
        } else if (saleText.includes('carro') || saleText.includes('veículo') || saleText.includes('motor')) {
            return 'oficina';
        } else if (saleText.includes('produto') || saleText.includes('mercadoria')) {
            return 'varejo';
        }

        return 'geral';
    }

    /**
     * 📅 CRIAR FOLLOW-UP PARA ENVIAR GARANTIA
     */
    private async createWarrantyFollowUp(leadId: string, warrantyContext: any): Promise<void> {
        try {
            const activityData = {
                title: `🛡️ Enviar Garantia - ${warrantyContext.customerName}`,
                type: 'whatsapp' as const,
                leadId: leadId,
                leadName: warrantyContext.customerName,
                leadPhone: warrantyContext.customerPhone,
                leadEmail: warrantyContext.customerEmail,
                description: `GARANTIA DETECTADA!\n\nProduto/Serviço: ${warrantyContext.productName}\nGarantia: ${warrantyContext.warranty}\n\n⚡ Ação: Enviar template de garantia via WhatsApp`,
                scheduledDate: new Date(), // Enviar imediatamente
                priority: 'high' as const,
                status: 'pending' as const,
                metadata: {
                    isWarranty: true,
                    warrantyInfo: warrantyContext.warranty,
                    templateSuggestion: 'garantia-auto-' + warrantyContext.businessType
                }
            };

            await this.createActivity(activityData);

            console.log('✅ Atividade de garantia criada');

        } catch (error) {
            console.error('❌ Erro ao criar follow-up de garantia:', error);
        }
    }

    // Limpar cache e listeners
    public clearCache(): void {
        // Limpar snapshots
        if (this.snapshots.leads) {
            this.collRef('leads').clearSnapshot(this.snapshots.leads);
        }
        if (this.snapshots.activities) {
            this.collRef('activities').clearSnapshot(this.snapshots.activities);
        }

        // Resetar dados
        this.leadsData = {};
        this.activitiesData = {};
        this.pipelineData = {};

        // Limpar subjects
        this.leadsSubject.next([]);
        this.activitiesSubject.next([]);
        this.pipelineSubject.next([]);
    }

    // Destruir serviço
    public destroy(): void {
        this.clearCache();
    }
}