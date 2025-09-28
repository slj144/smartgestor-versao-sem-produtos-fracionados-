// Arquivo: public-registration.service.ts
// Caminho: src/app/pages/crm/services/public-registration.service.ts
// O que faz: Serviço para gerenciar o link público de cadastro

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { iTools } from '@itools/index';
import { Injector } from '@angular/core';
// Serviços
import { IToolsService } from '@shared/services/iTools.service';

// Utilities
import { Utilities } from '@shared/utilities/utilities';
import { DateTime } from '@shared/utilities/dateTime';

@Injectable({ providedIn: 'root' })
export class PublicRegistrationService {

    constructor(
        private iToolsService: IToolsService) { }

    /**
     * Gera o link público único para o tenant
     */
    public generatePublicLink(): string {
        // O tenant ID vem da URL atual
        const currentUrl = window.location.pathname;
        const urlParts = currentUrl.split('/').filter(Boolean);

        // Suporta os formatos:
        //  - /registro/<tenantId>
        //  - /<tenantId>/registro-publico (legado)
        const tenantId = urlParts[0] === 'registro' ? urlParts[1] : urlParts[0];
        const baseUrl = window.location.origin;
        const publicLink = `${baseUrl}/registro/${tenantId}`;

        console.log('🔗 Link público gerado:', publicLink);
        return publicLink;
    }

    /**
     * Gera dados para criar QR Code
     */
    public generateQRCodeData(): any {
        const link = this.generatePublicLink();

        return {
            value: link,
            size: 300,
            level: 'H',
            foreground: '#000000',
            background: '#FFFFFF'
        };
    }

    /**
     * Salva as configurações do formulário público
     */
    public async saveFormSettings(settings: any): Promise<void> {
        try {
            // Usa update no documento
            await this.iToolsService.database()
                .collection('Settings')
                .doc('crm_public_form')
                .update({
                    formSettings: settings,
                    updatedAt: new Date().toISOString(),
                    updatedBy: Utilities.currentLoginData?.email || 'system'
                });

            console.log('✅ Configurações do formulário salvas');

            // Mostrar alerta simples
            alert('Configurações salvas com sucesso!');

        } catch (error) {
            //console.error('❌ Erro ao salvar configurações:', error);
            alert('Erro ao salvar configurações');
        }
    }

    /**
     * Busca as configurações do formulário
     */
    public async getFormSettings(): Promise<any> {
        try {
            await this.iToolsService.ready();
            const doc = await this.iToolsService.database()
                .collection('Settings')
                .doc('crm_public_form')
                .get();

            if (doc.data()) {
                return doc.data().formSettings;
            }

            return this.getDefaultFormSettings();
        } catch (error) {
            //console.error('❌ Erro ao buscar configurações:', error);
            return this.getDefaultFormSettings();
        }
    }

    /**
     * Configurações padrão do formulário
     */
    private getDefaultFormSettings(): any {
        return {
            fields: {
                name: { show: true, required: true, label: 'Nome Completo' },
                email: { show: true, required: true, label: 'E-mail' },
                phone: { show: true, required: true, label: 'Telefone' },
                cpf: { show: true, required: false, label: 'CPF' },
                birthDate: { show: true, required: false, label: 'Data de Nascimento' },
                address: { show: true, required: false, label: 'Endereço' }
            },
            appearance: {
                title: 'Cadastre-se',
                subtitle: 'Preencha seus dados para se cadastrar',
                primaryColor: '#007bff',
                successMessage: 'Cadastro realizado com sucesso!'
            },
            security: {
                captcha: false,
                emailVerification: false,
                limitPerDay: 100
            }
        };
    }

    /**
  * Verifica se o TELEFONE já existe no tenant
  * @param phone Telefone sem máscara
  * @param tenantId ID do tenant
  * @returns Promise<boolean> - true se existe, false se não existe
  */
    public async checkPhoneExists(phone: string, tenantId: string): Promise<boolean> {
        try {
            await this.iToolsService.ready();
            const storeId = tenantId;

            // Remove TUDO que não for número
            const cleanPhone = phone.replace(/\D/g, '');

            // Se não tem 10 ou 11 dígitos, não é válido
            if (cleanPhone.length < 10 || cleanPhone.length > 11) {
                return false;
            }

            // Busca APENAS pelo número limpo usando array-contains
            const querySnapshot = await this.iToolsService.database()
                .collection('RegistersCustomers')
                .where([
                    { field: 'owner', operator: '=', value: storeId }
                ])
                .get();

            // Verifica manualmente cada documento
            for (const doc of querySnapshot.docs) {
                const data = doc.data();
                const savedPhone = data.contacts?.phone || '';
                const savedPhoneClean = savedPhone.replace(/\D/g, '');

                // Compara apenas os números
                if (savedPhoneClean === cleanPhone) {
                    return true; // Telefone já existe!
                }
            }

            return false; // Telefone disponível

        } catch (error) {
            console.error('❌ Erro ao verificar telefone:', error);
            return false;
        }
    }
    /**
     * Verifica se o CPF já existe no tenant
     * @param cpf CPF sem máscara
     * @param tenantId ID do tenant
     * @returns Promise<boolean> - true se existe, false se não existe
     */
    public async checkCpfExists(cpf: string, tenantId: string): Promise<boolean> {
        try {
            console.log('🆔 Verificando se CPF existe:', cpf);

            await this.iToolsService.ready();
            const storeId = tenantId;

            // Remove máscara do CPF
            const cleanCpf = cpf.replace(/\D/g, '');

            // Busca clientes com este CPF (tentando com e sem máscara)
            const cpfVariations = [
                cleanCpf, // sem máscara
                this.formatCpf(cleanCpf), // com máscara
                `${cleanCpf.substring(0, 3)}.${cleanCpf.substring(3, 6)}.${cleanCpf.substring(6, 9)}-${cleanCpf.substring(9)}` // formato padrão
            ];

            console.log('🆔 Variações de CPF:', cpfVariations);

            for (const cpfVariation of cpfVariations) {
                // Busca no campo personalDocument.value
                const querySnapshot = await this.iToolsService.database()
                    .collection('RegistersCustomers')
                    .where([
                        { field: 'personalDocument.value', operator: '=', value: cpfVariation },
                        { field: 'owner', operator: '=', value: storeId }
                    ])
                    .get();

                if (querySnapshot.docs && querySnapshot.docs.length > 0) {
                    console.log('⚠️ CPF já cadastrado no sistema:', cpfVariation);
                    return true;
                }
            }

            console.log('✅ CPF disponível para cadastro');
            return false;

        } catch (error) {
            // console.error('❌ Erro ao verificar CPF:', error);
            return false; // Em caso de erro, permite continuar
        }
    }

    /**
     * Formata CPF para exibição
     */
    private formatCpf(cpf: string): string {
        // Remove não números
        const cleaned = cpf.replace(/\D/g, '');

        // Aplica máscara 000.000.000-00
        if (cleaned.length === 11) {
            return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }

        return cpf;
    }
    /**
     * Formata telefone para exibição
     */
    private formatPhone(phone: string): string {
        // Remove não números
        const cleaned = phone.replace(/\D/g, '');

        // Aplica máscara (00) 00000-0000 ou (00) 0000-0000
        if (cleaned.length === 11) {
            return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (cleaned.length === 10) {
            return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }

        return phone;
    }

    /**
     * Registra um cliente via formulário público
     */
    public async registerPublicCustomer(data: any): Promise<any> {
        try {
            console.log('🚀 INICIANDO CADASTRO PÚBLICO');
            console.log('📋 Dados recebidos:', data);

            await this.iToolsService.ready();
            const storeId = Utilities.storeID === '_default_' ? 'matrix' : Utilities.storeID;
            console.log('🏢 StoreID:', storeId);

            // Verifica se o TELEFONE já existe (dupla verificação)
            if (data.contacts?.phone) {
                const cleanPhone = data.contacts.phone.replace(/\D/g, '');
                const phoneExists = await this.checkPhoneExists(cleanPhone, storeId);
                if (phoneExists) {
                    throw new Error('Telefone já cadastrado. Cada pessoa pode se cadastrar apenas uma vez para garantir o desconto.');
                }
            }
            // Verifica se o CPF já existe (se foi informado)
            if (data.personalDocument?.value) {
                const cleanCpf = data.personalDocument.value.replace(/\D/g, '');
                const cpfExists = await this.checkCpfExists(cleanCpf, storeId);
                if (cpfExists) {
                    throw new Error('CPF já cadastrado no sistema.');
                }
            }
            // Gerar ID único
            const customerId = this.generateUniqueId();
            console.log('🆔 ID do cliente gerado:', customerId);

            // Preparar dados do cliente com o ID
            const customerData = {
                ...data,
                _id: customerId,
                code: iTools.FieldValue.control('SystemControls', storeId, 'RegistersCustomers.code'),
                owner: storeId,
                registerDate: iTools.FieldValue.date(Utilities.timezone),
                modifiedDate: iTools.FieldValue.date(Utilities.timezone),
                description: 'Cadastro via formulário público',
                // IMPORTANTE: Salvar telefone SEM máscara para facilitar buscas
                contacts: {
                    ...data.contacts,
                    phone: data.contacts?.phone ? data.contacts.phone.replace(/\D/g, '') : ''
                }
            };

            console.log('👤 Dados do cliente preparados:', customerData);

            // Salvar no banco
            const batch = this.iToolsService.database().batch();
            const customerRef = this.iToolsService.database()
                .collection('RegistersCustomers')
                .doc(customerId);

            batch.update(customerRef, customerData, { merge: true });
            await batch.commit();

            console.log('✅ Cliente cadastrado com sucesso!');
            console.log('🆔 ID do cliente:', customerData._id);

            // Registrar estatística
            await this.registerStatistic('registration_completed');
            console.log('📊 Estatística registrada');

            // Criar lead e atividade passando o cliente COM ID
            console.log('🎯 CHAMANDO createLeadAndActivity...');
            await this.createLeadAndActivity(customerData);
            console.log('✅ createLeadAndActivity FINALIZADO!');

            return { success: true, code: customerData.code, id: customerData._id };

        } catch (error) {
            //console.error('❌ ERRO GERAL em registerPublicCustomer:', error);
            console.error('Stack:', error.stack);
            await this.registerStatistic('registration_error');
            throw error;
        }
    }

    /**
     * Cria um lead no CRM e atividade de agradecimento
     * VERSÃO SIMPLIFICADA - Funciona imediatamente
     */
    private async createLeadAndActivity(customer: any): Promise<void> {
        try {
            console.log('🚀 Iniciando createLeadAndActivity...');
            console.log('👤 Dados do cliente:', customer);

            await this.iToolsService.ready();
            const storeId = Utilities.storeID === '_default_' ? 'matrix' : Utilities.storeID;

            // 1️⃣ PRIMEIRO: Criar o lead e obter o ID
            const leadId = await this.createLeadOnly(customer, storeId);

            if (!leadId) {
                //console.error('❌ Erro ao criar lead');
                return;
            }

            console.log('✅ Lead criado com ID:', leadId);
            console.log('⏳ Aguardando para criar atividade...');

            // 2️⃣ SEGUNDO: Criar a atividade vinculada ao lead
            await this.createActivityForLead(leadId, customer, storeId);

            console.log('🎉 Lead e atividade criados com sucesso!');

        } catch (error) {
            console.error('❌ Erro em createLeadAndActivity:', error);
            console.error('Stack:', error.stack);
        }
    }

    /**
     * Cria apenas o lead e retorna o ID
     */
    private async createLeadOnly(customer: any, storeId: string): Promise<string | null> {
        console.log('📋 createLeadOnly iniciado');
        console.log('👤 Cliente recebido:', customer);
        console.log('🏢 StoreID:', storeId);

        try {
            // Gerar ID único
            const leadId = this.generateUniqueId();
            console.log('🆔 Lead ID gerado:', leadId);

            const batch = this.iToolsService.database().batch();
            const leadRef = this.iToolsService.database()
                .collection('CRMLeads')
                .doc(leadId);

            const leadData = {
                _id: leadId,
                name: customer.name || 'Cliente',
                email: customer.contacts?.email || '',
                phone: customer.contacts?.phone || '',
                status: 'new',
                source: 'formulario_publico',
                value: 0,
                score: 50,
                customerId: customer._id,
                customerCode: customer.code,
                activityIds: [],
                saleIds: [],
                customerData: {
                    _id: customer._id,
                    code: customer.code,
                    name: customer.name,
                    email: customer.contacts?.email,
                    phone: customer.contacts?.phone,
                    cpfCnpj: customer.personalDocument?.value
                },
                notes: `=== LEAD CRIADO VIA FORMULÁRIO PÚBLICO ===\n` +
                    `📅 Data: ${new Date().toLocaleString('pt-BR')}\n` +
                    `👤 Cliente: ${customer.name}\n` +
                    `📧 Email: ${customer.contacts?.email || 'Não informado'}\n` +
                    `📱 Telefone: ${customer.contacts?.phone || 'Não informado'}\n` +
                    `🏢 ID Cliente: ${customer._id}`,
                tags: ['cadastro-publico', 'novo-cliente'],
                code: iTools.FieldValue.control('SystemControls', storeId, 'CRMLeads.code'),
                owner: storeId,
                registerDate: iTools.FieldValue.date(Utilities.timezone),
                modifiedDate: iTools.FieldValue.date(Utilities.timezone),
                hasCompleteData: true,
                priority: 'medium'
            };

            console.log('📝 Dados do lead preparados:', leadData);

            batch.update(leadRef, leadData, { merge: true });
            console.log('💾 Executando batch para criar lead...');
            await batch.commit();

            console.log('✅ Lead criado com sucesso! ID:', leadId);
            return leadId;

        } catch (error) {
            console.error('❌ ERRO em createLeadOnly:', error);
            console.error('Stack:', error.stack);
            console.error('Tipo do erro:', typeof error);
            console.error('Mensagem:', error.message);
            return null;
        }
    }

    /**
     * Cria a atividade vinculada ao lead
     */
    private async createActivityForLead(leadId: string, customer: any, storeId: string): Promise<void> {
        try {
            console.log('🔄 Iniciando criação de atividade...');
            console.log('📋 Lead ID:', leadId);
            console.log('👤 Customer:', customer);

            // Aguardar um pouco para garantir que o lead foi indexado
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Buscar o lead criado para garantir que existe
            const leadDoc = await this.iToolsService.database()
                .collection('CRMLeads')
                .doc(leadId)
                .get();

            if (!leadDoc.data()) {
                console.error('❌ Lead não encontrado para criar atividade');
                return;
            }

            const leadData = leadDoc.data();
            console.log('✅ Lead encontrado:', leadData);

            // Gerar ID da atividade
            const activityId = this.generateUniqueId();
            console.log('🆔 Activity ID gerado:', activityId);

            const batch = this.iToolsService.database().batch();
            const activityRef = this.iToolsService.database()
                .collection('CRMActivities')
                .doc(activityId);

            const activityData = {
                _id: activityId,
                leadId: leadId,
                customerId: customer._id || customer.code,
                customerCode: customer.code,
                title: 'Enviar boas-vindas',
                type: 'whatsapp',
                status: 'pending',
                priority: 'high',
                description: `Enviar mensagem de boas-vindas para ${customer.name}.\n` +
                    `Agradecer pelo cadastro e apresentar a empresa.`,
                leadName: leadData.name || customer.name,
                leadEmail: leadData.email || customer.contacts?.email || '',
                leadPhone: leadData.phone || customer.contacts?.phone || '',
                leadCode: leadData.code,
                scheduledDate: iTools.FieldValue.date(Utilities.timezone),
                dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                metadata: {
                    source: 'public_registration',
                    templateSuggestion: 'boas-vindas-desconto-cadastro', // 🆕 ID do novo template
                    templateCategory: 'pos-venda', // 🆕 Categoria do template
                    customerInfo: {
                        _id: customer._id,
                        code: customer.code,
                        name: customer.name
                    },
                    leadInfo: {
                        _id: leadId,
                        name: leadData.name,
                        email: leadData.email,
                        phone: leadData.phone
                    },
                    // 🆕 Dados do desconto
                    discountInfo: {
                        code: this.generateDiscountCode(customer.code),
                        percentage: 10, // 10% de desconto
                        validDays: 30 // Válido por 30 dias
                    }

                },
                code: iTools.FieldValue.control('SystemControls', storeId, 'CRMActivities.code'),
                owner: storeId,
                registerDate: iTools.FieldValue.date(Utilities.timezone),
                modifiedDate: iTools.FieldValue.date(Utilities.timezone)
            };

            console.log('📝 Dados da atividade:', activityData);

            // Atualizar o lead com a atividade
            const updatedActivityIds = [...(leadData.activityIds || []), activityId];

            console.log('🔗 IDs de atividades atualizadas:', updatedActivityIds);

            // Criar atividade
            batch.update(activityRef, activityData, { merge: true });

            // Atualizar lead
            batch.update(
                this.iToolsService.database().collection('CRMLeads').doc(leadId),
                {
                    activityIds: updatedActivityIds,
                    modifiedDate: iTools.FieldValue.date(Utilities.timezone)
                },
                { merge: true }
            );

            console.log('💾 Executando batch...');
            await batch.commit();

            console.log('✅ Atividade criada com sucesso!');
            console.log('📋 Activity ID:', activityId);
            console.log('🔗 Vinculada ao lead:', leadId);
            console.log('👤 Customer ID:', customer._id);

        } catch (error) {
            console.error('❌ Erro detalhado ao criar atividade:', error);
            console.error('Stack:', error.stack);
        }
    }

    /**
     * Gera código de desconto único para o cliente
     */
    private generateDiscountCode(customerCode: string): string {
        const prefix = 'BEMVINDO';
        const suffix = customerCode ? customerCode.toString().substring(0, 4) : Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefix}${suffix}`;
    }
    /**
        * Obtém os últimos clientes cadastrados via link público
     * (filtra apenas registros criados pelo formulário público)
     */
    public async getRecentRegistrations(limit: number = 10): Promise<any[]> {
        try {
            await this.iToolsService.ready();
            const storeId = Utilities.storeID === '_default_' ? 'matrix' : Utilities.storeID;

            const query = await this.iToolsService.database()
                .collection('RegistersCustomers')
                .where([
                    { field: 'owner', operator: '=', value: storeId },
                    { field: 'description', operator: '=', value: 'Cadastro via formulário público' }
                ])
                .orderBy({ registerDate: -1 })
                .limit(limit)
                .get();

            const list: any[] = [];
            query.docs.forEach(doc => {
                const data = doc.data();
                list.push({
                    name: data.name || '',
                    registerDate: data.registerDate
                });
            });

            return list;
        } catch (error) {
            console.error('Erro ao buscar últimos cadastros:', error);
            return [];
        }
    }
    /**
     * Registra estatísticas de uso
     */
    private async registerStatistic(type: string): Promise<void> {
        try {
            await this.iToolsService.ready();
            const batch = this.iToolsService.database().batch();
            const storeId = Utilities.storeID === '_default_' ? 'matrix' : Utilities.storeID;
            const statId = this.generateUniqueId();
            const statRef = this.iToolsService.database()
                .collection('CRM_Statistics')
                .doc(statId);

            batch.update(statRef, {
                _id: statId,
                type: type,
                timestamp: DateTime.getDate('DH'),
                tenant: storeId,
                source: 'public_form',
                owner: storeId
            }, { merge: true });

            await batch.commit();
        } catch (error) {
            console.error('Erro ao registrar estatística:', error);
        }
    }

    /**
     * Valida se o tenant tem permissão
     */
    public async validateTenantAccess(tenantId: string): Promise<boolean> {
        try {
            console.log('🔍 Validando acesso público para tenant:', tenantId);

            // Para acesso público, vamos apenas verificar se o tenant existe e está ativo
            // Não precisamos verificar CRM pois é uma página pública

            // Por enquanto, vamos retornar true para permitir o acesso
            // Você pode adicionar validações específicas depois se necessário
            console.log('✅ Acesso público permitido para tenant:', tenantId);
            return true;

        } catch (error) {
            console.error('❌ Erro ao validar tenant:', error);
            return false;
        }
    }

    /**
     * Busca informações do tenant
     */
    public async getTenantInfo(tenantId: string): Promise<any> {
        try {
            await this.iToolsService.ready();

            // Primeiro tenta buscar na collection Stores
            const storeDoc = await this.iToolsService.database()
                .collection('Stores')
                .doc(tenantId)
                .get();

            if (storeDoc.data()) {
                const data = storeDoc.data();
                return {
                    id: tenantId,
                    name: data.name || data.storeName || data.companyName || this.formatTenantName(tenantId),
                    logo: data.logo || data.storeLogo || null,
                    backgroundColor: data.backgroundColor || 'blue',
                    theme: data.theme || {},
                    phone: data.phone || data.storePhone || '',
                    email: data.email || data.storeEmail || '',
                    address: data.address || data.storeAddress || ''
                };
            }

            // Se não encontrar, usa o nome formatado do tenantId
            console.log('⚠️ Loja não encontrada no banco, usando nome do tenant');
            return {
                id: tenantId,
                name: this.formatTenantName(tenantId),
                logo: null,
                backgroundColor: 'blue',
                theme: {},
                phone: '',
                email: '',
                address: ''
            };

        } catch (error) {
            console.error('Erro ao buscar informações do tenant:', error);
            // Em caso de erro, retorna o nome baseado no tenantId
            return {
                id: tenantId,
                name: this.formatTenantName(tenantId),
                logo: null,
                backgroundColor: 'blue',
                theme: {},
                phone: '',
                email: '',
                address: ''
            };
        }
    }

    /**
     * Formata o nome do tenant para exibição
     * Remove prefixos como 'bm-' e capitaliza
     */
    private formatTenantName(tenantId: string): string {
        // Remove prefixos comuns
        let name = tenantId.replace(/^bm-/, '').replace(/^bc-/, '');

        // Capitaliza primeira letra
        name = name.charAt(0).toUpperCase() + name.slice(1);

        // Adiciona espaços antes de letras maiúsculas (camelCase para Title Case)
        name = name.replace(/([A-Z])/g, ' $1').trim();

        // Casos especiais
        if (name.toLowerCase() === 'iparttsdev') {
            return 'iPartts Dev';
        }

        return name;
    }

    /**
     * Gera um ID único para documentos
     */
    private generateUniqueId(): string {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 9);
        return `${timestamp}_${random}`;
    }
}