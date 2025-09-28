// Arquivo: birthday-customers.component.ts  
// Localização: src/app/pages/crm/components/birthday-customers/birthday-customers.component.ts
// Descrição: Componente para listar clientes aniversariantes e enviar mensagens de WhatsApp
// VERSÃO COMPLETA CORRIGIDA - Telefones funcionando igual ao dashboard

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Utilities } from '@shared/utilities/utilities';
import { AlertService } from '@shared/services/alert.service';
import { NotificationService } from '@shared/services/notification.service';
import { ENotificationStatus } from '@shared/interfaces/ISystemNotification';
import { IToolsService } from '@shared/services/iTools.service';
import { DateTime } from '@shared/utilities/dateTime';

// Interface para os dados do cliente aniversariante
interface BirthdayCustomer {
    id: string;
    name: string;
    phone: string;
    email?: string;
    birthDate: Date;
    age?: number;
    daysUntilBirthday: number; // 0 = hoje, 1 = amanhã, etc.
    totalSpent: number;
    lastPurchase?: Date;
    category: 'today' | 'this-week' | 'this-month';
    /** Indica se já foi enviada mensagem de parabéns */
    messageSent?: boolean;
}

@Component({
    selector: 'app-birthday-customers',
    templateUrl: './birthday-customers.component.html',
    styleUrls: ['./birthday-customers.component.scss']
})
export class BirthdayCustomersComponent implements OnInit, OnDestroy {

    private destroy$ = new Subject<void>();

    // Dados dos clientes aniversariantes
    public birthdayCustomers: BirthdayCustomer[] = [];
    public todayBirthdays: BirthdayCustomer[] = [];
    public weekBirthdays: BirthdayCustomer[] = [];
    public monthBirthdays: BirthdayCustomer[] = [];

    // Estados de carregamento
    public loading = true;
    public sending = false;

    // Modal de templates
    public showTemplatesModal = false;
    public selectedCustomer: BirthdayCustomer | null = null;

    // Filtros
    public filterPeriod = 'all'; // 'today', 'week', 'month', 'all'

    constructor(
        private alertService: AlertService,
        private notificationService: NotificationService,
        private iToolsService: IToolsService
    ) { }

    ngOnInit(): void {
        this.loadBirthdayCustomers();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * 🎂 CARREGAR CLIENTES ANIVERSARIANTES - VERSÃO HÍBRIDA CORRIGIDA
     * Busca aniversários no RegistersCustomers + Copia lógica de telefone do dashboard
     */
    private async loadBirthdayCustomers(): Promise<void> {
        try {
            this.loading = true;

            console.log('🔍 Buscando clientes aniversariantes - VERSÃO HÍBRIDA...');

            // ✅ PRIMEIRA ETAPA: Buscar clientes cadastrados (que têm aniversário)
            const customersQuery = await this.iToolsService.database()
                .collection('RegistersCustomers') // ← Manter busca aqui pelas datas de nascimento
                .where([{
                    field: 'owner',
                    operator: '=',
                    value: Utilities.storeID
                }])
                .get();

            let allCustomers: any[] = [];

            if (customersQuery?.docs && customersQuery.docs.length > 0) {
                console.log(`✅ ${customersQuery.docs.length} clientes encontrados em "RegistersCustomers"`);

                allCustomers = customersQuery.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    _collection: 'RegistersCustomers'
                }));
            } else {
                console.log('⚠️ Nenhum cliente encontrado na collection RegistersCustomers');
            }

            console.log(`📊 Total de clientes encontrados: ${allCustomers.length}`);

            if (allCustomers.length === 0) {
                console.log('⚠️ Nenhum cliente encontrado no sistema');
                this.birthdayCustomers = [];
                this.categorizeBirthdays();
                return;
            }

            // ✅ SEGUNDA ETAPA: Filtrar apenas clientes com data de nascimento
            const customersWithBirthday = allCustomers.filter(customer => {
                const hasDate = customer.birthDate || customer.dateOfBirth || customer.dataNascimento || customer.nascimento || customer.birthday;

                if (hasDate) {
                    console.log(`🎂 Cliente com aniversário: ${customer.name} - ${hasDate}`);

                    // ✅ COPIAR LÓGICA DE TELEFONE DO DASHBOARD
                    const phoneFromDashboard = customer.phone ||
                        customer.cellphone ||
                        customer.telefone ||
                        customer.whatsapp ||
                        customer.celular ||
                        customer.mobile;

                    console.log(`📞 Telefone encontrado: "${phoneFromDashboard}"`);

                    // ✅ INVESTIGAR SE TEM CONTACTS COMO ARRAY OU OBJETO
                    if (customer.contacts) {
                        console.log(`📞 Campo contacts encontrado:`, customer.contacts);

                        // Se contacts for array
                        if (Array.isArray(customer.contacts)) {
                            console.log(`📞 Contacts é array com ${customer.contacts.length} itens:`);
                            customer.contacts.forEach((contact, index) => {
                                console.log(`   📞 Contact ${index}:`, contact);
                                if (contact.phone) console.log(`      Telefone do contact: ${contact.phone}`);
                                if (contact.whatsapp) console.log(`      WhatsApp do contact: ${contact.whatsapp}`);
                            });
                        }

                        // Se contacts for objeto
                        if (typeof customer.contacts === 'object' && !Array.isArray(customer.contacts)) {
                            console.log(`📞 Contacts é objeto:`, customer.contacts);
                            if (customer.contacts.phone) console.log(`   Telefone: ${customer.contacts.phone}`);
                            if (customer.contacts.whatsapp) console.log(`   WhatsApp: ${customer.contacts.whatsapp}`);
                        }
                    }

                    return true;
                } else {
                    console.log(`❌ Cliente SEM data de nascimento: ${customer.name}`);
                    return false;
                }
            });

            console.log(`🎉 Clientes com data de nascimento: ${customersWithBirthday.length}`);

            // Se não encontrou nenhum, mostrar alguns clientes de exemplo para debug
            if (customersWithBirthday.length === 0 && allCustomers.length > 0) {
                console.log('🔍 EXEMPLO de cliente para debug:', allCustomers[0]);
                console.log('🔍 Campos disponíveis:', Object.keys(allCustomers[0]));
            }

            // ✅ TERCEIRA ETAPA: Converter para formato de aniversariantes
            console.log('🔄 Convertendo clientes para aniversariantes...');
            this.birthdayCustomers = customersWithBirthday
                .map((customer, index) => {
                    console.log(`\n🔄 Processando cliente ${index + 1}/${customersWithBirthday.length}: ${customer.name}`);
                    const result = this.processBirthdayCustomerFixed(customer); // ← Método modificado
                    if (result) {
                        console.log(`✅ Cliente processado - Telefone final: "${result.phone}"`);
                    } else {
                        console.log(`❌ Cliente não processado (data inválida)`);
                    }
                    return result;
                })
                .filter(customer => customer !== null);

            // Separar por categorias
            this.categorizeBirthdays();

            console.log('✅ Aniversariantes processados:');
            console.log(`   - Hoje: ${this.todayBirthdays.length}`);
            console.log(`   - Esta semana: ${this.weekBirthdays.length}`);
            console.log(`   - Este mês: ${this.monthBirthdays.length}`);

            // ✅ DEBUG FINAL: Mostrar telefones dos aniversariantes
            console.log('\n🔍 === TELEFONES DOS ANIVERSARIANTES ===');
            this.birthdayCustomers.slice(0, 5).forEach((customer, index) => {
                console.log(`   ${index + 1}. ${customer.name}`);
                console.log(`      📞 Telefone: "${customer.phone}"`);
                console.log(`      🎂 Aniversário: ${this.getBirthdayDateFormatted(customer)}`);
                console.log(`      📅 Categoria: ${customer.category}`);
            });

        } catch (error) {
            console.error('❌ Erro ao carregar aniversariantes:', error);
            this.alertService.alert('Erro ao carregar lista de aniversariantes', 'error');
        } finally {
            this.loading = false;
        }
    }

    /**
     * 🔄 PROCESSAR DADOS DO CLIENTE ANIVERSARIANTE - VERSÃO CORRIGIDA
     * Copia exatamente a lógica de telefone que funciona no dashboard
     */
    private processBirthdayCustomerFixed(customer: any): BirthdayCustomer | null {
        // Buscar data de nascimento em diferentes campos possíveis
        const birthDateField = customer.birthDate ||
            customer.dateOfBirth ||
            customer.dataNascimento ||
            customer.nascimento ||
            customer.birthday;

        if (!birthDateField) {
            console.warn('Cliente sem data de nascimento:', customer.name);
            return null;
        }

        const birthday = DateTime.getDateObjectFromString(String(birthDateField));
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Garantir comparação apenas por dia
        // Validar se a data é válida
        if (birthday.toString() === 'Invalid Date') {
            console.warn('Data de nascimento inválida para cliente:', customer.name, birthDateField);
            return null;
        }

        // Calcular próximo aniversário e último aniversário
        const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
        const nextYearBirthday = new Date(today.getFullYear() + 1, birthday.getMonth(), birthday.getDate());

        const nextBirthday = thisYearBirthday >= today ? thisYearBirthday : nextYearBirthday;


        const daysUntil = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));


        // Calcular idade
        let age = today.getFullYear() - birthday.getFullYear();
        const monthDiff = today.getMonth() - birthday.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
            age--;
        }

        // Determinar categoria baseada na data do aniversário
        let category: 'today' | 'this-week' | 'this-month' | null = null;

        if (daysUntil === 0) {
            category = 'today';
        } else if (daysUntil > 0 && daysUntil <= 7) {
            category = 'this-week';
        } else if (thisYearBirthday.getMonth() === today.getMonth()) {
            // Aniversários que já passaram ou ainda vão acontecer neste mês
            category = 'this-month';
        } else if (nextBirthday.getMonth() === today.getMonth()) {
            // Aniversários futuros ainda neste mês
            category = 'this-month';
        } else {
            // Fora do mês atual, ignorar
            console.log(`⏭️ Aniversário de ${customer.name} é em ${daysUntil} dias - fora do mês atual, não incluindo`);
            return null;
        }

        // ✅ COPIAR EXATAMENTE A LÓGICA DE TELEFONE DO DASHBOARD
        let phoneField = '';

        // Primeiro tentar campos diretos (como o dashboard)
        phoneField = customer.phone ||
            customer.cellphone ||
            customer.telefone ||
            customer.whatsapp ||
            customer.celular ||
            customer.mobile || '';

        // Se não encontrou, tentar no campo contacts
        if (!phoneField && customer.contacts) {
            if (Array.isArray(customer.contacts) && customer.contacts.length > 0) {
                // Se contacts for array, pegar o primeiro telefone encontrado
                for (const contact of customer.contacts) {
                    if (contact.phone || contact.whatsapp || contact.telefone) {
                        phoneField = contact.phone || contact.whatsapp || contact.telefone;
                        break;
                    }
                }
            } else if (typeof customer.contacts === 'object') {
                // Se contacts for objeto
                phoneField = customer.contacts.phone ||
                    customer.contacts.whatsapp ||
                    customer.contacts.telefone || '';
            }
        }

        console.log(`📞 Telefone extraído para ${customer.name}: "${phoneField}"`);

        return {
            id: customer.id || customer._id,
            name: customer.name || customer.nome || 'Cliente',
            phone: phoneField, // ✅ TELEFONE USANDO A LÓGICA DO DASHBOARD
            email: customer.email || '',
            birthDate: birthday,
            age,
            daysUntilBirthday: daysUntil,
            totalSpent: customer.totalSpent || 0,
            lastPurchase: customer.lastPurchase ? new Date(customer.lastPurchase) : undefined,
            category,
            messageSent: false
        };
    }

    /**
     * 📊 SEPARAR ANIVERSÁRIOS POR CATEGORIA
     */
    private categorizeBirthdays(): void {
        // Filtrar apenas clientes válidos (não nulos) e que ainda não receberam mensagem
        const validCustomers = this.birthdayCustomers.filter(customer => customer !== null && !customer.messageSent);

        this.todayBirthdays = validCustomers.filter(c => c.category === 'today');
        this.weekBirthdays = validCustomers.filter(c => c.category === 'this-week');
        this.monthBirthdays = validCustomers.filter(c => c.category === 'this-month');

        // Atualizar a lista principal sem os nulos
        this.birthdayCustomers = validCustomers;
    }

    /**
     * 📱 ENVIAR MENSAGEM DE ANIVERSÁRIO - COPIANDO LÓGICA DO DASHBOARD
     */
    public sendBirthdayMessage(customer: BirthdayCustomer): void {
        console.log('🎯 sendBirthdayMessage chamado para:', customer.name);
        console.log('📞 Telefone recebido:', customer.phone);

        // MESMA VALIDAÇÃO DO DASHBOARD
        if (!customer.phone || customer.phone.trim() === '') {
            console.log('❌ Cliente sem telefone válido');
            this.alertService.alert(`Cliente ${customer.name} não possui telefone cadastrado`, 'warning');
            return;
        }

        console.log('✅ Telefone válido, abrindo modal de templates');
        this.selectedCustomer = customer;
        this.showTemplatesModal = true;
    }

    /**
     * ✅ CALLBACK QUANDO TEMPLATE É SELECIONADO - COPIANDO EXATAMENTE DO DASHBOARD
     */
    public onTemplateSelected(data: { template: any, message: string }): void {
        if (!this.selectedCustomer) return;

        const customer = this.selectedCustomer;

        // MESMA LÓGICA DO DASHBOARD: remover formatação do telefone
        const phone = customer.phone.replace(/\D/g, '');

        if (!phone) {
            this.alertService.alert('Número de telefone inválido', 'warning');
            return;
        }

        console.log('📱 Abrindo WhatsApp para:', customer.name, 'Telefone limpo:', phone);

        // Personalizar mensagem (mesma lógica do dashboard)
        let message = data.message || data.template.content || `Olá ${customer.name}!`;
        message = message.replace(/\{nome\}/g, customer.name);
        message = message.replace(/\{valor\}/g, this.formatCurrency(customer.totalSpent));

        // Codificar para URL (mesma lógica do dashboard)
        const encodedMessage = encodeURIComponent(message);

        // Abrir WhatsApp (mesma URL do dashboard)
        const whatsappUrl = `https://wa.me/55${phone}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');

        // Registrar no console (mesma lógica do dashboard)
        console.log('📱 WhatsApp enviado:', {
            customer: customer.name,
            phone: customer.phone,
            message: message,
            timestamp: new Date().toISOString()
        });

        // Notificar sucesso (mesma lógica do dashboard)
        this.notificationService.create({
            title: 'WhatsApp Enviado!',
            description: `Mensagem de aniversário enviada para ${customer.name}`,
            status: ENotificationStatus.success
        });
        // Marcar cliente como atendido e atualizar listas
        customer.messageSent = true;
        this.categorizeBirthdays();
        // Fechar modal (mesma lógica do dashboard)
        this.showTemplatesModal = false;
        this.selectedCustomer = null;
    }

    /**
     * ❌ FECHAR MODAL DE TEMPLATES
     */
    public closeTemplatesModal(): void {
        this.showTemplatesModal = false;
        this.selectedCustomer = null;
    }

    /**
     * 🔄 ATUALIZAR LISTA
     */
    public refreshList(): void {
        this.loadBirthdayCustomers();
    }

    /**
     * 🎯 FILTRAR POR PERÍODO
     */
    public getFilteredCustomers(): BirthdayCustomer[] {
        switch (this.filterPeriod) {
            case 'today': return this.todayBirthdays;
            case 'week': return this.weekBirthdays;
            case 'month': return this.monthBirthdays;
            default: return this.birthdayCustomers;
        }
    }

    /**
     * 💰 FORMATAR VALOR MONETÁRIO
     */
    public formatCurrency(value: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    }

    /**
     * 📅 FORMATAR DATA
     */
    public formatDate(date: Date): string {
        return new Intl.DateTimeFormat('pt-BR').format(date);
    }

    /**
     * 🎂 TEXTO DOS DIAS PARA ANIVERSÁRIO
     */
    public getBirthdayText(customer: BirthdayCustomer): string {
        const day = customer.birthDate.getDate();
        const month = customer.birthDate.getMonth() + 1;
        const dateFormatted = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}`;

        if (customer.daysUntilBirthday === 0) return `Hoje! (${dateFormatted})`;
        if (customer.daysUntilBirthday === 1) return `Amanhã (${dateFormatted})`;
        if (customer.daysUntilBirthday <= 7) return `${dateFormatted} (em ${customer.daysUntilBirthday} dias)`;
        return `${dateFormatted} (${customer.daysUntilBirthday} dias)`;
    }

    /**
     * 📅 OBTER DATA FORMATADA DO ANIVERSÁRIO
     */
    public getBirthdayDateFormatted(customer: BirthdayCustomer): string {
        const day = customer.birthDate.getDate();
        const month = customer.birthDate.getMonth() + 1;
        return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}`;
    }
}