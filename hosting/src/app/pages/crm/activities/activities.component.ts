// 📄 ARQUIVO: activities.component.ts
// 📁 LOCALIZAÇÃO: src/app/pages/crm/activities/activities.component.ts
// 🎯 VERSÃO FINAL COMPLETA COM TODAS AS CORREÇÕES

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Serviços
import { CrmService } from '../crm.service';
import { AlertService } from '@shared/services/alert.service';
import { IToolsService } from '@shared/services/iTools.service';
import { Utilities } from '@shared/utilities/utilities';
import { ActivityDetectionService } from '../services/activity-detection.service';

@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.scss']
})
export class ActivitiesComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  // ✅ DADOS
  public activities: any[] = [];
  public allActivities: any[] = [];
  public filteredActivities: any[] = [];
  public leads: any[] = [];
  public loading = true;
  private viewActivityId: string | null = null;
  selectedTemplateCategory: string;
  whatsappData: any;
  whatsappTemplates: { id: string; name: string; message: string; }[];
  showWhatsAppModal: boolean;
  /**
  * Parse date strings in local time to avoid timezone shifts
  */
  private parseDateInLocalTime(dateString: string): Date {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [y, m, d] = dateString.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date(dateString);
  }
  // Adicione este método na classe ActivitiesComponent

  public getTimeFromDate(activity: any): string {
    if (!activity) return '';

    // Se tiver scheduledTime separado, usar ele
    if (activity.scheduledTime) {
      return activity.scheduledTime;
    }

    // Senão, tentar extrair do scheduledDate
    if (!activity.scheduledDate) return '';

    try {
      const date = this.parseDateInLocalTime(activity.scheduledDate);
      const hours = date.getHours();
      const minutes = date.getMinutes();

      // Se for 00:00, provavelmente não tem hora definida
      if (hours === 0 && minutes === 0) {
        return '';
      }

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('Erro ao formatar hora:', error);
      return '';
    }
  }
  // ✅ MÉTODO: Criar atividade para um dia específico
  // Adicione este método na classe ActivitiesComponent se ainda não existir

  public openCreateModalForDay(day: any): void {
    if (!day || day.isOtherMonth) return;

    // Fechar modal do dia
    this.closeDayModal();

    // Configurar formulário com a data selecionada
    this.modalMode = 'create';
    this.selectedActivity = null;
    this.resetForm();

    // Definir a data do dia selecionado
    const selectedDate = new Date(day.date);
    const year = selectedDate.getFullYear();
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = selectedDate.getDate().toString().padStart(2, '0');

    this.activityForm.scheduledDate = `${year}-${month}-${dayStr}`;
    this.activityForm.scheduledTime = '09:00'; // Horário padrão

    // Abrir modal de criação após um pequeno delay para garantir que o outro fechou
    setTimeout(() => {
      this.showModal = true;
    }, 300);

    console.log('📅 Criando atividade para o dia:', day.day);
  }

  // ✅ CONTROLES DE VISUALIZAÇÃO
  public calendarView = false;

  // ✅ MODAL DE ATIVIDADES
  public showModal = false;
  public modalMode: 'create' | 'edit' = 'create';
  public selectedActivity: any = null;

  // ✅ MODAL DE TEMPLATES WHATSAPP
  public showTemplatesModal = false;
  public selectedCustomerForTemplate: any = null;

  // ✅ FILTROS - VERSÃO MELHORADA COM MAIS OPÇÕES
  public filters = {
    // Filtros existentes
    type: 'all',
    status: 'all',
    dateFilter: 'today',
    leadId: '',

    // NOVOS FILTROS
    searchText: '',        // Para buscar por texto
    priority: 'all',       // Filtrar por prioridade
    assignedTo: 'all',     // Filtrar por responsável
    startDate: '',         // Data inicial para período customizado
    endDate: ''            // Data final para período customizado
  };

  // ✅ PROPRIEDADES DO CALENDÁRIO
  public currentMonth: Date = new Date();            // Guarda o mês que queremos mostrar no calendário
  public calendarDays: any[] = [];                   // Array que vai receber os dias do mês
  public weekDays: string[] = [                      // Nomes abreviados dos dias da semana
    'Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'
  ];
  public monthNames: string[] = [                    // Nomes completos dos 12 meses do ano
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // ✅ MODAL DO DIA
  public showDayModal = false;
  public selectedDay: any = null;

  // Chame este método após abrir o modal
  public showDayActivities(day: any): void {
    if (!day || day.isOtherMonth) return;

    if (!day.activities) {
      day.activities = [];
    }

    this.selectedDay = day;
    this.showDayModal = true;
    document.body.classList.add('modal-open');

    console.log('📅 Modal aberto para dia:', {
      dia: day.day,
      totalAtividades: day.activities.length,
      atividades: day.activities,
      selectedDay: this.selectedDay
    });

    // Aguardar o Angular renderizar e então debugar
    setTimeout(() => {
      this.debugModalRendering();
    }, 300);
  }
  // 🐛 DEBUG DETALHADO - Adicione este método temporariamente
  public debugModalRendering(): void {
    console.log('🔍 === DEBUG DETALHADO DO MODAL ===');

    // Verificar se o modal está no DOM
    const modalElement = document.querySelector('.day-modal');
    console.log('1. Modal no DOM?', modalElement ? 'SIM' : 'NÃO');

    if (modalElement) {
      // Verificar se tem a classe show
      console.log('2. Modal tem classe show?', modalElement.classList.contains('show'));

      // Verificar o container de atividades
      const scrollContainer = modalElement.querySelector('.activities-scroll-container');
      console.log('3. Container de scroll existe?', scrollContainer ? 'SIM' : 'NÃO');

      // Verificar se tem atividades renderizadas
      const activityItems = modalElement.querySelectorAll('.day-activity-item');
      console.log('4. Atividades renderizadas:', activityItems.length);

      // Verificar se o empty-day está aparecendo
      const emptyDay = modalElement.querySelector('.empty-day');
      console.log('5. Mensagem de dia vazio visível?', emptyDay ? 'SIM' : 'NÃO');

      // Verificar dados do componente
      console.log('6. selectedDay no componente:', this.selectedDay);
      console.log('7. Atividades no selectedDay:', this.selectedDay?.activities);

      // Se tem atividades mas não estão renderizadas
      if (this.selectedDay?.activities?.length > 0 && activityItems.length === 0) {
        console.log('⚠️ PROBLEMA: Atividades existem mas não estão sendo renderizadas!');

        // Verificar se é problema de CSS
        const computedStyle = scrollContainer ? window.getComputedStyle(scrollContainer) : null;
        if (computedStyle) {
          console.log('8. CSS do container:', {
            display: computedStyle.display,
            visibility: computedStyle.visibility,
            opacity: computedStyle.opacity,
            height: computedStyle.height,
            overflow: computedStyle.overflow
          });
        }
      }

      // Verificar conteúdo HTML
      if (scrollContainer) {
        console.log('9. HTML interno do container:', scrollContainer.innerHTML.substring(0, 200) + '...');
      }
    }

    console.log('🔍 === FIM DO DEBUG ===');
  }

  public closeDayModal(): void {
    this.showDayModal = false;
    this.selectedDay = null;

    // Remove classe do body
    document.body.classList.remove('modal-open');
  }


  // Contador de filtros ativos
  public activeFiltersCount = 0;

  // Lista de responsáveis (será preenchida no ngOnInit)
  public assignedToOptions: any[] = [];

  // ✅ FORMULÁRIO
  public activityForm: {
    title: string;
    type: 'call' | 'email' | 'meeting' | 'task' | 'whatsapp' | 'followup';
    leadId: string;
    description: string;
    scheduledDate: string;
    scheduledTime: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'completed' | 'cancelled' | 'overdue';
  } = {
      title: '',
      type: 'call',
      leadId: '',
      description: '',
      scheduledDate: '',
      scheduledTime: '',
      priority: 'medium',
      status: 'pending'
    };

  // ✅ OPÇÕES PARA SELECTS
  public typeOptions = [
    { value: 'call', label: 'Ligação', icon: 'phone-outline' },
    { value: 'email', label: 'E-mail', icon: 'email-outline' },
    { value: 'meeting', label: 'Reunião', icon: 'people-outline' },
    { value: 'task', label: 'Tarefa', icon: 'checkmark-square-outline' },
    { value: 'whatsapp', label: 'WhatsApp', icon: 'message-circle-outline' },
    { value: 'followup', label: 'Follow-up', icon: 'refresh-outline' },
    // 🆕 NOVO TIPO
    { value: 'warranty', label: 'Garantia', icon: 'shield-outline' }
  ];

  public statusOptions = [
    { value: 'pending', label: 'Pendente' },
    { value: 'completed', label: 'Concluída' },
    { value: 'cancelled', label: 'Cancelada' },
    { value: 'overdue', label: 'Atrasada' }
  ];

  public priorityOptions = [
    { value: 'low', label: 'Baixa' },
    { value: 'medium', label: 'Média' },
    { value: 'high', label: 'Alta' },
    { value: 'urgent', label: 'Urgente' }
  ];

  constructor(
    private crmService: CrmService,
    private alertService: AlertService,
    private iToolsService: IToolsService,
    private detectionService: ActivityDetectionService, // ADICIONAR ESTA LINHA
    private route: ActivatedRoute


  ) { }

  ngOnInit(): void {
    console.log('🚀 Activities Component iniciado');
    console.log('🔍 Usuário atual:', {
      userId: Utilities.currentLoginData.userId,
      name: Utilities.currentLoginData.name,
      storeID: Utilities.storeID
    });
    this.loadData();
    this.loadAssignedToOptions();
    this.route.queryParams.subscribe(params => {
      if (params['atividade']) {
        this.viewActivityId = params['atividade'];
      }

      // 🆕 FILTRAR POR LEAD SE VIER DA TELA DE LEADS
      if (params['leadId']) {
        console.log('🔍 Filtrando atividades por lead:', params['leadName'] || params['leadId']);
        this.filters.leadId = params['leadId'];

        // Aplicar filtros após carregar dados
        setTimeout(() => {
          this.applyFilters();
        }, 500);

        // Feedback visual opcional
        if (params['leadName']) {
          this.alertService.alert(`Exibindo atividades do lead: ${params['leadName']}`, 'info');
        }
      }
    });
  }

  ngOnDestroy(): void {
    // Garante que remove a classe se o componente for destruído
    document.body.classList.remove('modal-open');

    this.destroy$.next();
    this.destroy$.complete();
  }

  // ✅ CARREGAR DADOS
  private loadData(): void {
    console.log('📊 Carregando dados das atividades...');

    // Carregar atividades
    this.crmService.activities$
      .pipe(takeUntil(this.destroy$))
      .subscribe(activities => {
        console.log('📨 Atividades recebidas:', activities.length);
        this.allActivities = this.processActivities(activities);
        this.applyFilters();
        this.loading = false;
        if (this.viewActivityId) {
          const act = this.allActivities.find(a => a._id === this.viewActivityId);
          if (act) {
            this.editActivity(act);
            this.viewActivityId = null;
          }
        }
      });

    // Carregar leads
    this.crmService.leads$
      .pipe(takeUntil(this.destroy$))
      .subscribe(leads => {
        console.log('👥 Leads recebidos:', leads.length);
        this.leads = leads;
        // Reprocessar atividades quando leads chegarem
        if (this.allActivities.length > 0) {
          this.allActivities = this.processActivities(this.allActivities);
          this.applyFilters();
        }
      });

    // Buscar dados
    this.crmService.getActivities(true); // Forçar refresh
    this.crmService.getLeads();
  }
  // ✅ CARREGAR LISTA DE RESPONSÁVEIS (USUÁRIOS REAIS)
  private async loadAssignedToOptions(): Promise<void> {
    try {
      console.log('👥 Carregando colaboradores do sistema...');

      // Buscar colaboradores com acesso ao sistema
      const collaborators = await this.iToolsService.database()
        .collection('CollaboratorsDatas')
        .where([
          { field: 'owner', operator: '=', value: Utilities.storeID },
          { field: 'allowAccess', operator: '=', value: true }
        ])
        .get();

      if (collaborators && collaborators.docs) {
        const users: any[] = [];

        // Adicionar o usuário atual primeiro
        users.push({
          id: Utilities.currentLoginData.userId,
          name: Utilities.currentLoginData.name || 'Eu',
          email: Utilities.currentLoginData.email,
          isCurrentUser: true
        });

        // Adicionar outros colaboradores
        collaborators.docs.forEach((doc: any) => {
          const collab = doc.data();
          // Não adicionar o usuário atual novamente
          if (collab._id !== Utilities.currentLoginData.userId) {
            users.push({
              id: collab._id,
              name: collab.name || collab.email || 'Colaborador',
              email: collab.email || '',
              usertype: collab.usertype || 'collaborator',
              isCurrentUser: false
            });
          }
        });

        // Ordenar por nome (mantendo o usuário atual no topo)
        this.assignedToOptions = users.sort((a, b) => {
          if (a.isCurrentUser) return -1;
          if (b.isCurrentUser) return 1;
          return a.name.localeCompare(b.name);
        });

        console.log(`✅ ${this.assignedToOptions.length} colaboradores carregados`);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar colaboradores:', error);
      // Em caso de erro, pelo menos adicionar o usuário atual
      this.assignedToOptions = [{
        id: Utilities.currentLoginData.userId,
        name: Utilities.currentLoginData.name || 'Eu',
        email: Utilities.currentLoginData.email,
        isCurrentUser: true
      }];
    }

  }
  // 🐛 MÉTODO DE DEBUG - Adicione temporariamente para verificar os dados
  public debugModalData(): void {
    console.log('🔍 DEBUG MODAL DO DIA:');
    console.log('- Modal visível?', this.showDayModal);
    console.log('- Dia selecionado:', this.selectedDay);

    if (this.selectedDay) {
      console.log('- Número do dia:', this.selectedDay.day);
      console.log('- Data:', this.selectedDay.date);
      console.log('- Total de atividades:', this.selectedDay.activities?.length || 0);

      if (this.selectedDay.activities && this.selectedDay.activities.length > 0) {
        console.log('- Atividades:');
        this.selectedDay.activities.forEach((act: any, index: number) => {
          console.log(`  ${index + 1}. ${act.title} - Status: ${act.status}`);
        });
      }
    }
  }




  // ✅ PROCESSAR ATIVIDADES - VERSÃO MELHORADA
  private processActivities(activities: any[]): any[] {
    console.log('🔍 PROCESSANDO ATIVIDADES:', activities.length);

    return activities.map(activity => {
      // DEBUG COMPLETO
      console.log('📋 Atividade:', {
        title: activity.title,
        assignedTo: activity.assignedTo,
        createdBy: activity.createdBy,
        owner: activity.owner,
        type: activity.type
      });
      const scheduledDate = this.parseDateInLocalTime(activity.scheduledDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      scheduledDate.setHours(0, 0, 0, 0);

      // Atualizar status se estiver atrasada
      if (activity.status === 'pending' && scheduledDate < today) {
        activity.status = 'overdue';
      }

      // Buscar lead completo com todos os dados
      const lead = this.leads.find(l => l._id === activity.leadId);

      // Extrair dados completos do lead
      let enhancedActivity = {
        ...activity,
        // Dados básicos do lead
        leadName: lead?.name || activity.leadName || 'Cliente',
        // 🛠️ Usa o telefone da atividade como fallback caso o lead não esteja carregado
        leadPhone: lead?.phone || activity.leadPhone || '',
        leadEmail: lead?.email || '',

        // Dados financeiros
        leadValue: lead?.value || 0,
        leadStatus: lead?.status || '',

        // Dados customizados (produtos, serviços, etc)
        leadCustomData: lead?.customData || {},
        leadNotes: lead?.notes || '',
        leadTags: lead?.tags || [],

        // Dados da venda se existir
        saleId: activity.saleId || lead?.saleIds?.[0] || null,
        saleValue: lead?.value || 0
      };

      // Se tem descrição, tentar extrair dados dela também
      if (activity.description) {
        const extractedData = this.extractAllDataFromDescription(activity.description);
        enhancedActivity = {
          ...enhancedActivity,
          ...extractedData
        };
      }

      return enhancedActivity;
    });
  }
  /**
   * 🔄 Verifica se a atividade é de recompra
   */
  private isRecompraActivity(activity: any): boolean {
    return activity?.metadata?.activityType === 'recompra';
  }

  /**
  * 📱 Abre modal de WhatsApp - MODIFICADO para detectar recompra
  */
  public openWhatsAppModal(activity: any): void {
    console.log('📱 Abrindo WhatsApp para atividade:', activity);

    // Verifica se é atividade de recompra
    const isRecompra = this.isRecompraActivity(activity);

    if (isRecompra) {
      console.log('🔄 Detectada atividade de RECOMPRA!');
    }

    // Prepara os dados para o modal
    this.whatsappData = {
      phone: activity.leadPhone,
      name: activity.leadName,
      activityId: activity._id,
      leadId: activity.leadId,
      isRecompra: isRecompra, // PASSA A FLAG DE RECOMPRA
      metadata: activity.metadata || {},

      // Se for recompra, passa dados especiais
      recompraData: isRecompra ? {
        products: activity.metadata?.products || [],
        lastPurchaseValue: activity.metadata?.lastPurchaseValue || 0,
        saleDate: activity.metadata?.saleDate,
        saleCode: activity.metadata?.saleCode
      } : null
    };

    // Abre o modal
    this.showWhatsAppModal = true;

    // Se for recompra, carrega templates especiais
    if (isRecompra) {
      this.loadRecompraTemplates();
    }
  }

  /**
  * 🔄 Carrega templates especiais de recompra
  */
  private loadRecompraTemplates(): void {
    console.log('📄 Carregando templates de recompra...');

    // Define templates específicos para recompra
    this.whatsappTemplates = [
      {
        id: 'recompra_15_dias',
        name: '🔄 Follow-up 15 dias',
        message: this.generateRecompraTemplate('15_dias')
      },
      {
        id: 'recompra_oferta',
        name: '🎁 Oferta Especial',
        message: this.generateRecompraTemplate('oferta')
      },
      {
        id: 'recompra_satisfacao',
        name: '😊 Satisfação + Recompra',
        message: this.generateRecompraTemplate('satisfacao')
      },
      {
        id: 'recompra_novidades',
        name: '✨ Novidades',
        message: this.generateRecompraTemplate('novidades')
      }
    ];
  }

  /**
  * 📝 Gera template de recompra baseado no tipo
  */
  private generateRecompraTemplate(tipo: string): string {
    const data = this.whatsappData?.recompraData;
    const name = this.whatsappData?.name || 'Cliente';
    const products = data?.products || [];
    const value = data?.lastPurchaseValue || 0;
    const saleDate = data?.saleDate ? new Date(data.saleDate).toLocaleDateString('pt-BR') : 'sua última compra';

    // Lista de produtos formatada
    const productList = products.length > 0
      ? products.map(p => `• ${p.name}`).join('\n')
      : '• Seus produtos favoritos';

    // Templates diferentes baseados no tipo
    const templates = {
      '15_dias': `Olá ${name}! 😊

Como está sua experiência com os produtos que adquiriu em ${saleDate}?

${productList}

Já está na hora de fazer uma recompra? 
Temos *condições especiais* para você! 🎁

*📍 Venha nos visitar ou peça pelo WhatsApp!*

Aguardamos seu contato! 🛍️`,

      'oferta': `🎉 *OFERTA ESPECIAL* para ${name}!

Você que comprou conosco em ${saleDate}, temos uma surpresa!

*10% DE DESCONTO* na recompra dos produtos:
${productList}

⏰ *Oferta válida por 48 horas!*

Aproveite agora! Digite *QUERO* para garantir seu desconto! 💰`,

      'satisfacao': `Oi ${name}! 👋

Já se passaram alguns dias desde sua compra...

Como está sendo sua experiência com:
${productList}

Adoraríamos saber sua opinião! ⭐

E ah! Se quiser fazer uma *recompra*, temos um *cupom de desconto* esperando por você! 🎁

Digite:
1️⃣ para avaliar sua compra
2️⃣ para fazer nova compra com desconto`,

      'novidades': `✨ *NOVIDADES* que você vai adorar, ${name}!

Baseado na sua última compra:
${productList}

Separamos produtos que *combinam perfeitamente* com seu perfil! 

🆕 *Lançamentos da semana:*
- [Produto similar 1]
- [Produto similar 2]
- [Produto complementar]

*Frete grátis* para recompras acima de R$ ${(value * 0.8).toFixed(2)}! 🚚

Quer conhecer? Responda com *SIM*! 🛍️`
    };

    return templates[tipo] || templates['15_dias'];
  }
  // ✅ EXTRAIR TODOS OS DADOS DA DESCRIÇÃO
  private extractAllDataFromDescription(description: string): any {
    const data: any = {};

    // Extrair valor monetário
    const valueMatch = description.match(/Valor:?\s*R\$\s*([\d.,]+)/i);
    if (valueMatch) {
      data.extractedValue = parseFloat(valueMatch[1].replace(/\./g, '').replace(',', '.'));
    }

    // Extrair código da venda
    const saleMatch = description.match(/Venda:?\s*#?(\w+)/i);
    if (saleMatch) {
      data.extractedSaleId = saleMatch[1];
    }

    // Extrair status
    const statusMatch = description.match(/Status:?\s*(\w+)/i);
    if (statusMatch) {
      data.extractedStatus = statusMatch[1];
    }

    return data;
  }

  // ✅ APLICAR FILTROS - VERSÃO MELHORADA
  public applyFilters(): void {
    let filtered = [...this.allActivities];

    // 🔍 NOVO: Filtro por texto (busca em título, descrição e nome do lead)
    if (this.filters.searchText && this.filters.searchText.trim() !== '') {
      const searchLower = this.filters.searchText.toLowerCase().trim();
      filtered = filtered.filter(activity => {
        return activity.title?.toLowerCase().includes(searchLower) ||
          activity.description?.toLowerCase().includes(searchLower) ||
          activity.leadName?.toLowerCase().includes(searchLower) ||
          activity.leadPhone?.includes(searchLower) ||
          activity.leadEmail?.toLowerCase().includes(searchLower);
      });
    }

    // Filtro por tipo
    if (this.filters.type !== 'all') {
      filtered = filtered.filter(activity => activity.type === this.filters.type);
    }

    // Filtro por status
    if (this.filters.status !== 'all') {
      filtered = filtered.filter(activity => activity.status === this.filters.status);
    }

    // 🔍 NOVO: Filtro por prioridade
    if (this.filters.priority !== 'all') {
      filtered = filtered.filter(activity => activity.priority === this.filters.priority);
    }
    console.log('🔍 Filtro assignedTo selecionado:', this.filters.assignedTo);
    console.log('🔍 Total antes do filtro:', filtered.length);
    // 🔍 NOVO: Filtro por responsável
    if (this.filters.assignedTo !== 'all') {
      filtered = filtered.filter(activity => {
        // Se não tem assignedTo, considerar como "não atribuído"
        if (!activity.assignedTo || activity.assignedTo === 'matrix') {
          // Só mostra se o filtro for para o usuário atual
          return this.filters.assignedTo === Utilities.currentLoginData.userId;
        }
        return activity.assignedTo === this.filters.assignedTo;
      });
    }
    console.log('🔍 Total depois do filtro:', filtered.length);
    // Filtro por data (melhorado com período customizado)
    if (this.filters.dateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      filtered = filtered.filter(activity => {
        const activityDate = this.parseDateInLocalTime(activity.scheduledDate);
        activityDate.setHours(0, 0, 0, 0);

        switch (this.filters.dateFilter) {
          case 'today':
            return activityDate.getTime() === today.getTime();
          case 'week':
            const weekFromNow = new Date(today);
            weekFromNow.setDate(today.getDate() + 7);
            return activityDate >= today && activityDate <= weekFromNow;
          case 'month':
            const monthFromNow = new Date(today);
            monthFromNow.setMonth(today.getMonth() + 1);
            return activityDate >= today && activityDate <= monthFromNow;
          case 'overdue':
            return activity.status === 'overdue' || activityDate < today;
          case 'custom':
            // 🔍 NOVO: Período customizado
            if (this.filters.startDate && this.filters.endDate) {
              const start = new Date(this.filters.startDate);
              const end = new Date(this.filters.endDate);
              start.setHours(0, 0, 0, 0);
              end.setHours(23, 59, 59, 999);
              return activityDate >= start && activityDate <= end;
            }
            return true;
          default:
            return true;
        }
      });
    }

    // Filtro por lead
    if (this.filters.leadId) {
      filtered = filtered.filter(activity => activity.leadId === this.filters.leadId);
    }

    // Ordenar por data (mais próximas primeiro)
    filtered.sort((a, b) => {
      const dateA = this.parseDateInLocalTime(a.scheduledDate);
      const dateB = this.parseDateInLocalTime(b.scheduledDate);
      return dateA.getTime() - dateB.getTime();
    });

    this.filteredActivities = filtered;

    // 🔍 NOVO: Atualizar contador de filtros ativos
    this.updateActiveFiltersCount();

    console.log('🔍 Filtros aplicados:', this.filteredActivities.length, 'atividades');
  }
  // ✅ NOVO MÉTODO: Contar filtros ativos
  private updateActiveFiltersCount(): void {
    let count = 0;

    // Contar cada filtro ativo
    if (this.filters.type !== 'all') count++;
    if (this.filters.status !== 'all') count++;
    if (this.filters.priority !== 'all') count++;
    if (this.filters.assignedTo !== 'all') count++;
    if (this.filters.dateFilter !== 'all' && this.filters.dateFilter !== 'today') count++;
    if (this.filters.leadId) count++;
    if (this.filters.searchText && this.filters.searchText.trim() !== '') count++;

    this.activeFiltersCount = count;
    // Regenerar calendário quando aplicar filtros
    if (this.calendarView) {
      this.generateCalendar();
    }
  }

  // ✅ NOVO MÉTODO: Limpar todos os filtros
  public clearAllFilters(): void {
    this.filters = {
      type: 'all',
      status: 'all',
      dateFilter: 'today',
      leadId: '',
      searchText: '',
      priority: 'all',
      assignedTo: 'all',
      startDate: '',
      endDate: ''
    };

    this.applyFilters();
  }

  // ✅ ALTERNAR VISUALIZAÇÃO

  public toggleView(): void {
    this.calendarView = !this.calendarView;
    console.log('👁️ Visualização alterada para:', this.calendarView ? 'Calendário' : 'Lista');

    // Se mudou para calendário, gerar
    if (this.calendarView) {
      this.generateCalendar();
    }
  }
  // 📄 ARQUIVO: activities.component.ts
  // 📁 LOCALIZAÇÃO: src/app/pages/crm/activities/activities.component.ts
  // 🔧 MÉTODO: generateCalendar() - VERSÃO CORRIGIDA

  public generateCalendar(): void {
    console.log('📅 Gerando calendário para:', this.currentMonth);

    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();

    // Primeiro e último dia do mês
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Dia da semana do primeiro dia (0 = domingo)
    const firstDayOfWeek = firstDay.getDay();

    // Total de dias no mês
    const totalDays = lastDay.getDate();

    // Limpar calendário
    this.calendarDays = [];

    // Adicionar dias do mês anterior
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      this.calendarDays.push({
        day: day,
        date: new Date(year, month - 1, day),
        activities: [],
        isToday: false,
        isOtherMonth: true,
        hasActivities: false
      });
    }

    // Adicionar dias do mês atual
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day);

      // 🔧 CORREÇÃO: Ajustar timezone antes de comparar
      const dateLocal = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      // Buscar atividades deste dia - MÉTODO CORRIGIDO
      const dayActivities = this.filteredActivities.filter(activity => {
        if (!activity.scheduledDate) return false;

        // 🔧 CORREÇÃO: Converter string para Date corretamente
        const activityDateStr = activity.scheduledDate;
        let activityDate: Date;

        // Se já é uma string ISO, fazer parse direto
        if (activityDateStr.includes('T')) {
          activityDate = new Date(activityDateStr);
        } else {
          // Se é apenas data (YYYY-MM-DD), adicionar horário
          activityDate = new Date(activityDateStr + 'T00:00:00');
        }

        // Comparar apenas ano, mês e dia
        return activityDate.getFullYear() === dateLocal.getFullYear() &&
          activityDate.getMonth() === dateLocal.getMonth() &&
          activityDate.getDate() === dateLocal.getDate();
      });

      // 🔧 DEBUG: Log para verificar atividades encontradas
      if (dayActivities.length > 0) {
        console.log(`📌 Dia ${day}/${month + 1}/${year} tem ${dayActivities.length} atividade(s):`, dayActivities);
      }

      this.calendarDays.push({
        day: day,
        date: date,
        dateStr: `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
        activities: dayActivities,
        isToday: this.isSameDay(date, today),
        isOtherMonth: false,
        hasActivities: dayActivities.length > 0
      });
    }

    // Completar até 42 dias (6 semanas completas)
    const totalCells = 42;
    const remainingDays = totalCells - this.calendarDays.length;

    for (let day = 1; day <= remainingDays; day++) {
      this.calendarDays.push({
        day: day,
        date: new Date(year, month + 1, day),
        activities: [],
        isToday: false,
        isOtherMonth: true,
        hasActivities: false
      });
    }

    console.log('📊 Total de dias no calendário:', this.calendarDays.length);
    console.log('📊 Dias com atividades:', this.calendarDays.filter(d => d.hasActivities).length);
  }

  // ✅ NAVEGAR ENTRE MESES
  public previousMonth(): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() - 1,
      1
    );
    this.generateCalendar();
  }

  public nextMonth(): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + 1,
      1
    );
    this.generateCalendar();
  }

  public goToToday(): void {
    this.currentMonth = new Date();
    this.generateCalendar();
  }

  // ✅ VERIFICAR SE É O MESMO DIA
  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear();
  }

  // ✅ OBTER COR DO STATUS
  public getStatusColor(status: string): string {
    switch (status) {
      case 'completed': return '#10b981'; // Verde
      case 'pending': return '#3b82f6';   // Azul
      case 'overdue': return '#ef4444';   // Vermelho
      case 'cancelled': return '#6b7280'; // Cinza
      default: return '#3b82f6';
    }
  }
  // =====================================================
  // 🏪 DETECÇÃO INTELIGENTE DE TIPO DE COMÉRCIO
  // =====================================================

  /**
   * 🔍 DETECTAR TIPO DE COMÉRCIO BASEADO NOS DADOS
   */
  private detectBusinessType(): 'celular' | 'oficina' | 'varejo' | 'geral' {
    try {
      // Verificar produtos vendidos recentemente
      const recentProducts = this.getRecentProducts();
      const recentServices = this.getRecentServices();

      // Análise de palavras-chave nos produtos
      const productKeywords = recentProducts.map(p => p.name?.toLowerCase() || '').join(' ');
      const serviceKeywords = recentServices.map(s => s.name?.toLowerCase() || '').join(' ');

      // 📱 LOJA DE CELULAR
      if (productKeywords.includes('celular') ||
        productKeywords.includes('smartphone') ||
        productKeywords.includes('iphone') ||
        productKeywords.includes('samsung') ||
        productKeywords.includes('xiaomi') ||
        productKeywords.includes('motorola') ||
        productKeywords.includes('capinha') ||
        productKeywords.includes('película') ||
        productKeywords.includes('carregador')) {
        console.log('🏪 Tipo detectado: LOJA DE CELULAR');
        return 'celular';
      }

      // 🔧 OFICINA MECÂNICA
      if (serviceKeywords.includes('troca de óleo') ||
        serviceKeywords.includes('alinhamento') ||
        serviceKeywords.includes('balanceamento') ||
        serviceKeywords.includes('revisão') ||
        serviceKeywords.includes('freio') ||
        serviceKeywords.includes('suspensão') ||
        serviceKeywords.includes('motor') ||
        productKeywords.includes('filtro') ||
        productKeywords.includes('pneu')) {
        console.log('🏪 Tipo detectado: OFICINA MECÂNICA');
        return 'oficina';
      }

      // 🛍️ VAREJO GERAL
      if (recentProducts.length > 0 && recentServices.length === 0) {
        console.log('🏪 Tipo detectado: VAREJO GERAL');
        return 'varejo';
      }

      // 🏢 GERAL (padrão)
      console.log('🏪 Tipo detectado: GERAL');
      return 'geral';

    } catch (error) {
      console.error('❌ Erro ao detectar tipo de comércio:', error);
      return 'geral';
    }
  }

  /**
  * 📊 BUSCAR PRODUTOS VENDIDOS RECENTEMENTE
  */
  private getRecentProducts(): any[] {
    // Aqui você pode buscar os produtos das últimas vendas
    // Por enquanto, vamos retornar um array vazio
    // TODO: Implementar busca real de produtos
    return [];
  }

  /**
  * 🔧 BUSCAR SERVIÇOS VENDIDOS RECENTEMENTE
  */
  private getRecentServices(): any[] {
    // Aqui você pode buscar os serviços das últimas vendas
    // Por enquanto, vamos retornar um array vazio
    // TODO: Implementar busca real de serviços
    return [];
  }

  /**
  * 🎯 DETERMINAR CATEGORIA DO TEMPLATE - VERSÃO INTELIGENTE 2.0
  */
  private determineTemplateCategory(activity: any): string {
    try {
      // Usar o serviço de detecção inteligente
      const detection = this.detectionService.detectActivityType(activity, {
        businessType: this.getCurrentBusinessType()
      });

      console.log('🤖 Resultado da detecção:', {
        categoria: detection.category,
        tipoNegocio: detection.businessType,
        éServiço: detection.isService,
        éProduto: detection.isProduct,
        confiança: `${(detection.confidence * 100).toFixed(0)}%`,
        tagsSugeridas: detection.suggestedTags
      });

      // Adicionar tags sugeridas à atividade se não existirem
      if (detection.suggestedTags.length > 0) {
        const currentTags = activity.tags || [];
        const newTags = [...new Set([...currentTags, ...detection.suggestedTags])];
        activity.tags = newTags;
      }

      // Adicionar sugestão de próxima ação
      const nextAction = this.detectionService.suggestNextAction(detection);
      console.log('💡 Próxima ação sugerida:', nextAction);

      return detection.category;

    } catch (error) {
      console.error('❌ Erro na detecção:', error);
      return 'generico';
    }
  }
  /**
   * 🏪 OBTER TIPO DE NEGÓCIO ATUAL
   */
  private getCurrentBusinessType(): 'celular' | 'oficina' | 'varejo' | 'geral' {
    const configuredType = localStorage.getItem('businessType');
    if (configuredType) {
      return configuredType as any;
    }
    return this.detectBusinessType(); // ✅ Usar o método correto
  }

  // ✅ CONTAR ATIVIDADES POR STATUS
  public getActivityCountByStatus(activities: any[], status: string): number {
    return activities.filter(a => a.status === status).length;
  }
  // ✅ MODAL DE ATIVIDADES - MÉTODOS
  public openCreateModal(): void {
    this.modalMode = 'create';
    this.selectedActivity = null;
    this.resetForm();
    this.showModal = true;
    console.log('➕ Modal de criação aberto');
  }

  public editActivity(activity: any): void {
    this.modalMode = 'edit';
    this.selectedActivity = activity;
    this.fillForm(activity);
    this.showModal = true;
    console.log('✏️ Editando atividade:', activity.title);
  }

  public closeModal(): void {
    this.showModal = false;
    this.selectedActivity = null;
    this.resetForm();
    console.log('❌ Modal de atividade fechado');
  }


  public async openWhatsAppTemplates(activity: any): Promise<void> {
    try {
      console.log('📱 Abrindo templates do WhatsApp para:', activity);
      console.log('📊 Metadata da atividade:', activity.metadata); // Debug para verificar metadata

      // 🔄 CORREÇÃO PRINCIPAL: Detectar se é atividade de recompra
      const isRecompra = activity.metadata?.activityType === 'recompra' ||
        activity.title?.includes('Recompra') ||
        activity.title?.includes('🔄');

      if (isRecompra) {
        console.log('🔄 ATIVIDADE DE RECOMPRA DETECTADA!');

        // Garantir que os metadados estejam corretos
        if (!activity.metadata) {
          activity.metadata = {};
        }

        // Configurar metadados específicos de recompra
        activity.metadata.activityType = 'recompra';
        activity.metadata.templateCategory = 'recompra'; // Usar categoria específica
        activity.metadata.templateSuggestion = 'recompra_15_dias';

        // Se tem produtos no metadata, garantir que sejam passados
        if (activity.metadata.products) {
          activity.metadata.suggestedProducts = activity.metadata.products;
        }
      }

      // 🆕 Detectar se é atividade de boas-vindas
      if (activity.metadata?.source === 'public_registration') {
        console.log('🎉 Atividade de boas-vindas detectada!');

        activity.metadata.templateSuggestion = 'boas-vindas-desconto-cadastro';
        activity.metadata.discountInfo = activity.metadata.discountInfo || {
          code: 'BEMVINDO10',
          percentage: 10,
          validDays: 30,
        };

        this.selectedTemplateCategory = 'pos-venda';
      }

      // Buscar dados do lead/cliente
      const lead = await this.getLeadData(activity.leadId);
      if (!lead || !lead.phone) {
        this.alertService.alert('Cliente não possui telefone cadastrado!', 'error');
        return;
      }

      // Usar categoria e sugestão vindas do metadata
      const metadata = activity.metadata || {};
      const templateCategory = isRecompra ? 'recompra' :
        (metadata.templateCategory || this.determineTemplateCategory(activity));
      const businessType = this.getCurrentBusinessType();

      // Extrair produtos da atividade ou do lead
      let products = this.extractProductsFromMultipleSources({
        ...activity,
        leadCustomData: lead?.customData,
        leadNotes: lead?.notes
      });

      // Se é recompra e tem produtos no metadata, usar esses
      if (isRecompra && activity.metadata?.products) {
        products = activity.metadata.products;
      }

      const services = this.extractServicesFromMultipleSources({
        ...activity,
        leadCustomData: lead?.customData,
        leadNotes: lead?.notes
      });

      const serviceData = this.extractServiceDataFromMultipleSources({
        ...activity,
        leadCustomData: lead?.customData,
        leadNotes: lead?.notes
      });

      // Preparar dados do contexto para templates
      const contextData: any = {};

      // Se é recompra, adicionar dados específicos
      if (isRecompra) {
        contextData.isRecompra = true;
        contextData.products = products || activity.metadata?.products || [];
        contextData.lastPurchaseValue = activity.metadata?.lastPurchaseValue || 0;
        contextData.saleDate = activity.metadata?.saleDate;
        contextData.saleCode = activity.metadata?.saleCode;
        contextData.templateType = 'recompra';
      }

      // Se é boas-vindas, adicionar dados de desconto
      if (metadata.templateSuggestion === 'boas-vindas-desconto-cadastro') {
        contextData.isBemVindas = true;
        if (metadata.discountInfo) {
          contextData.discountCode = metadata.discountInfo.code;
          contextData.discountPercentage = metadata.discountInfo.percentage;
          contextData.validDays = metadata.discountInfo.validDays;
        }
      }

      // Preparar dados completos do cliente para o modal
      this.selectedCustomerForTemplate = {
        name: lead.name || 'Cliente',
        phone: lead.phone,
        email: lead.email || '',
        activityTitle: activity.title,
        activityDescription: activity.description,
        activityId: activity._id,
        activityType: activity.type,
        category: templateCategory,
        businessType: businessType,
        products,
        services,
        serviceData,
        contextData, // Passa todos os dados de contexto
        templateSuggestion: metadata.templateSuggestion,
        // IMPORTANTE: Adicionar flag de recompra
        isRecompra: isRecompra,
        recompraData: isRecompra ? {
          products: activity.metadata?.products || products || [],
          lastPurchaseValue: activity.metadata?.lastPurchaseValue || 0,
          saleDate: activity.metadata?.saleDate,
          saleCode: activity.metadata?.saleCode
        } : null
      };

      // Log para debug
      console.log('🎯 Cliente selecionado com dados completos:', {
        nome: this.selectedCustomerForTemplate.name,
        categoria: this.selectedCustomerForTemplate.category,
        tipoNegocio: this.selectedCustomerForTemplate.businessType,
        éRecompra: this.selectedCustomerForTemplate.isRecompra,
        temProdutos: (this.selectedCustomerForTemplate.products?.length || 0) > 0,
        metadata: activity.metadata
      });

      // Abrir modal de templates
      this.showModal = false;
      this.showTemplatesModal = true;

    } catch (error) {
      console.error('❌ Erro ao abrir templates:', error);
      this.alertService.alert('Erro ao carregar templates', 'error');
    }
  }
  /**
  * 🔍 BUSCAR DADOS DO LEAD
  */
  // 📁 ARQUIVO: activities.component.ts
  // 📂 CAMINHO: src/app/pages/crm/activities/activities.component.ts
  // 🎯 CORREÇÃO: Método getLeadData com validação completa

  /**
   * 🔍 BUSCAR DADOS DO LEAD COM VALIDAÇÃO
   */
  private async getLeadData(leadId: string | null | undefined): Promise<any> {
    // 🛡️ VALIDAÇÃO 1: Verificar se leadId existe
    if (!leadId) {
      console.log('⚠️ LeadId não fornecido ou é inválido');
      return null;
    }

    // 🛡️ VALIDAÇÃO 2: Verificar se é uma string
    if (typeof leadId !== 'string') {
      console.log('⚠️ LeadId não é uma string:', typeof leadId, leadId);
      return null;
    }

    // 🛡️ VALIDAÇÃO 3: Verificar se não está vazio
    const trimmedLeadId = leadId.trim();
    if (!trimmedLeadId) {
      console.log('⚠️ LeadId está vazio após trim');
      return null;
    }

    console.log('🔍 Buscando lead com ID:', trimmedLeadId);

    // Primeiro tentar buscar nos leads já carregados
    const lead = this.leads.find(l => l._id === trimmedLeadId);

    if (lead) {
      console.log('✅ Lead encontrado no cache local');
      return lead;
    }

    // Se não encontrou, buscar direto do banco
    try {
      console.log('📡 Buscando lead no Firebase...');

      const leadDoc = await this.iToolsService.database()
        .collection('CRMLeads')
        .doc(trimmedLeadId)  // Usar o ID validado e limpo
        .get();

      if (leadDoc && leadDoc.exists) {
        const leadData = leadDoc.data();
        console.log('✅ Lead encontrado no Firebase:', leadData?.name);
        return leadData;
      } else {
        console.log('⚠️ Lead não encontrado no Firebase');
        return null;
      }

    } catch (error) {
      console.error('❌ Erro ao buscar lead no Firebase:', error);
      // Retornar null ao invés de lançar erro
      return null;
    }
  }
  /**
   * ⚙️ CONFIGURAR TIPO DE NEGÓCIO MANUALMENTE
   * Pode ser chamado de uma tela de configurações
   */
  public setBusinessType(type: 'celular' | 'oficina' | 'varejo' | 'geral'): void {
    localStorage.setItem('businessType', type);
    console.log('✅ Tipo de negócio configurado:', type);

    // Recarregar atividades para aplicar nova detecção
    this.loadData();  // ✅ MÉTODO CORRETO
  }




  public closeTemplatesModal(): void {
    this.showTemplatesModal = false;
    this.selectedCustomerForTemplate = null;
    console.log('❌ Modal de templates fechado');
  }

  // ✅ CALLBACK QUANDO TEMPLATE É SELECIONADO
  public onTemplateSelected(event: { template: any, message: string }): void {
    console.log('📱 Template selecionado:', event);

    if (!this.selectedCustomerForTemplate) {
      console.error('❌ Nenhum cliente selecionado');
      return;
    }

    const customer = this.selectedCustomerForTemplate;
    const phone = customer.phone.replace(/\D/g, ''); // Remove caracteres não numéricos
    const message = event.message;

    // 🌐 ABRIR WHATSAPP
    const whatsappUrl = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    // ✅ MARCAR ATIVIDADE COMO CONCLUÍDA SE FOR APROPRIADO
    if (customer.activityId && this.shouldCompleteActivity(customer)) {
      this.markAsCompleted({ _id: customer.activityId });
    }

    // 🔔 NOTIFICAÇÃO
    this.alertService.alert(`WhatsApp enviado para ${customer.name}!`, 'success');

    // 🔒 FECHAR MODAL
    this.closeTemplatesModal();
  }


  // ✅ EXTRAIR PRODUTOS DE MÚLTIPLAS FONTES
  private extractProductsFromMultipleSources(activity: any): any[] {
    let products: any[] = [];

    console.log('🔍 Buscando produtos em múltiplas fontes...');

    // 1️⃣ Tentar do customData do lead
    if (activity.leadCustomData?.products && Array.isArray(activity.leadCustomData.products)) {
      products = activity.leadCustomData.products;
      console.log('✅ Produtos encontrados no customData:', products.length);
      return products;
    }

    // 2️⃣ Tentar extrair da descrição
    if (activity.description) {
      products = this.extractProductsFromDescription(activity.description);
      if (products.length > 0) {
        console.log('✅ Produtos extraídos da descrição:', products.length);
        return products;
      }
    }

    // 3️⃣ Tentar das notas do lead
    if (activity.leadNotes) {
      products = this.extractProductsFromDescription(activity.leadNotes);
      if (products.length > 0) {
        console.log('✅ Produtos extraídos das notas:', products.length);
        return products;
      }
    }

    console.log('⚠️ Nenhum produto encontrado');
    return products;
  }

  // ✅ EXTRAIR PRODUTOS DA DESCRIÇÃO - VERSÃO MELHORADA
  private extractProductsFromDescription(text: string): any[] {
    const products: any[] = [];

    if (!text) return products;

    // Padrão 1: "PRODUTOS" ou "📦 PRODUTOS"
    const productsMatch = text.match(/(?:📦\s*)?PRODUTOS[^:]*:\s*\n((?:(?:•|\*|-)\s*.+\n?)+)/i);
    if (productsMatch) {
      const productsText = productsMatch[1];

      // Padrão: • 2x Nome do Produto - R$ 100,00
      const regex1 = /(?:•|\*|-)\s*(\d+)x\s+(.+?)\s*-\s*R\$\s*([\d.,]+)/g;
      let match;

      while ((match = regex1.exec(productsText)) !== null) {
        products.push({
          quantity: parseInt(match[1]),
          name: match[2].trim(),
          price: parseFloat(match[3].replace(/\./g, '').replace(',', '.')),
          total: parseFloat(match[3].replace(/\./g, '').replace(',', '.'))
        });
      }

      // Padrão alternativo: • Nome do Produto (2x) - R$ 100,00
      const regex2 = /(?:•|\*|-)\s*(.+?)\s*\((\d+)x\)\s*-\s*R\$\s*([\d.,]+)/g;
      while ((match = regex2.exec(productsText)) !== null) {
        products.push({
          quantity: parseInt(match[2]),
          name: match[1].trim(),
          price: parseFloat(match[3].replace(/\./g, '').replace(',', '.')),
          total: parseFloat(match[3].replace(/\./g, '').replace(',', '.'))
        });
      }
    }

    // Se não encontrou com o padrão acima, tentar padrões inline
    if (products.length === 0) {
      // Padrão inline: "2x Mouse Gamer por R$ 150,00"
      const inlineRegex = /(\d+)x\s+([^,\n]+?)(?:\s+por)?\s+R\$\s*([\d.,]+)/g;
      let match;

      while ((match = inlineRegex.exec(text)) !== null) {
        const qty = parseInt(match[1]);
        const price = parseFloat(match[3].replace(/\./g, '').replace(',', '.'));
        products.push({
          quantity: qty,
          name: match[2].trim(),
          price: price / qty,
          total: price
        });
      }
    }

    console.log('📦 Produtos extraídos:', products);
    return products;
  }

  // ✅ EXTRAIR SERVIÇOS DE MÚLTIPLAS FONTES
  private extractServicesFromMultipleSources(activity: any): any[] {
    let services: any[] = [];

    console.log('🔍 Buscando serviços em múltiplas fontes...');

    // 1️⃣ Tentar do customData
    if (activity.leadCustomData?.services && Array.isArray(activity.leadCustomData.services)) {
      services = activity.leadCustomData.services;
      console.log('✅ Serviços encontrados no customData:', services.length);
      return services;
    }

    // 2️⃣ Tentar do serviceData
    if (activity.leadCustomData?.serviceData) {
      services = this.extractServicesFromServiceData(activity.leadCustomData.serviceData);
      if (services.length > 0) {
        console.log('✅ Serviços extraídos do serviceData:', services.length);
        return services;
      }
    }

    // 3️⃣ Tentar da descrição
    if (activity.description) {
      services = this.extractServicesFromDescription(activity.description);
      if (services.length > 0) {
        console.log('✅ Serviços extraídos da descrição:', services.length);
        return services;
      }
    }

    console.log('⚠️ Nenhum serviço encontrado');
    return services;
  }

  // ✅ EXTRAIR SERVIÇOS DA DESCRIÇÃO - VERSÃO MELHORADA
  private extractServicesFromDescription(text: string): any[] {
    const services: any[] = [];

    if (!text) return services;

    // Procurar seção de serviços
    const servicesMatch = text.match(/(?:🔧\s*)?(?:SERVIÇOS|ORDEM DE SERVIÇO)[^:]*:\s*\n((?:(?:•|\*|-)\s*.+\n?)+)/i);
    if (servicesMatch) {
      const servicesText = servicesMatch[1];
      const lines = servicesText.split('\n').filter(l => l.trim());

      lines.forEach(line => {
        // Padrão: • Nome do Serviço - R$ 100,00
        const match1 = line.match(/(?:•|\*|-)\s*(.+?)\s*-\s*R\$\s*([\d.,]+)/);
        if (match1) {
          services.push({
            name: match1[1].trim(),
            price: parseFloat(match1[2].replace(/\./g, '').replace(',', '.')),
            total: parseFloat(match1[2].replace(/\./g, '').replace(',', '.'))
          });
        } else {
          // Padrão sem valor: • Nome do Serviço
          const match2 = line.match(/(?:•|\*|-)\s*(.+)/);
          if (match2) {
            services.push({
              name: match2[1].trim(),
              price: 0,
              total: 0
            });
          }
        }
      });
    }

    console.log('🔧 Serviços extraídos:', services);
    return services;
  }

  // ✅ EXTRAIR SERVIÇOS DO SERVICE DATA
  private extractServicesFromServiceData(serviceData: any): any[] {
    const services: any[] = [];

    if (!serviceData) return services;

    // Se tem servicesDetails como string
    if (serviceData.servicesDetails && typeof serviceData.servicesDetails === 'string') {
      serviceData.servicesDetails.split(',').forEach((service: string) => {
        services.push({
          name: service.trim(),
          price: 0,
          total: 0
        });
      });
    }

    // Se tem servicesTypes como array
    if (serviceData.servicesTypes && Array.isArray(serviceData.servicesTypes)) {
      serviceData.servicesTypes.forEach((type: any) => {
        services.push({
          name: type.name || type.description || 'Serviço',
          price: type.price || type.value || 0,
          total: type.total || type.price || type.value || 0
        });
      });
    }

    // Se tem types (ordem de serviço)
    if (serviceData.types && Array.isArray(serviceData.types)) {
      serviceData.types.forEach((type: any) => {
        services.push({
          name: type.name || type.serviceName || type.description || 'Serviço',
          price: type.executionPrice || type.price || type.value || 0,
          total: type.total || type.executionPrice || type.price || 0
        });
      });
    }

    return services;
  }

  // ✅ EXTRAIR DADOS DE OS DE MÚLTIPLAS FONTES
  private extractServiceDataFromMultipleSources(activity: any): any {
    // 1️⃣ Tentar do customData
    if (activity.leadCustomData?.serviceData) {
      console.log('✅ ServiceData encontrado no customData');
      return activity.leadCustomData.serviceData;
    }

    // 2️⃣ Tentar extrair da descrição
    if (activity.description) {
      const extracted = this.extractServiceDataFromActivity(activity);
      if (extracted) {
        console.log('✅ ServiceData extraído da descrição');
        return extracted;
      }
    }

    console.log('⚠️ Nenhum serviceData encontrado');
    return null;
  }

  // ✅ EXTRAIR DADOS DE OS DA ATIVIDADE
  private extractServiceDataFromActivity(activity: any): any {
    if (!activity.description) return null;

    const serviceData: any = {};

    // Procurar código da OS
    const codeMatch = activity.description.match(/(?:Código|OS):\s*#?(\w+)/);
    if (codeMatch) {
      serviceData.serviceOrderCode = codeMatch[1];
    }

    // Procurar equipamento
    const equipMatch = activity.description.match(/Equipamento:\s*(.+?)(?:\n|$)/);
    if (equipMatch) {
      serviceData.equipment = equipMatch[1];
    }

    // Procurar responsável
    const respMatch = activity.description.match(/Responsável:\s*(.+?)(?:\n|$)/);
    if (respMatch) {
      serviceData.responsible = respMatch[1];
    }

    // Procurar status
    const statusMatch = activity.description.match(/Status:\s*(.+?)(?:\n|$)/);
    if (statusMatch) {
      serviceData.status = statusMatch[1];
    }

    return Object.keys(serviceData).length > 0 ? serviceData : null;
  }

  // ✅ VERIFICAR SE DEVE COMPLETAR ATIVIDADE AUTOMATICAMENTE
  private shouldCompleteActivity(customer: any): boolean {
    // Completar automaticamente se for follow-up, pós-venda ou qualquer WhatsApp
    const isFollowUp = customer.category === 'follow-up';
    const isPosVenda = customer.category === 'pos-venda' ||
      customer.category?.startsWith('pos-venda');
    const isWhats = customer.activityType === 'whatsapp';

    return isFollowUp || isPosVenda || isWhats;
  }

  // ✅ OBTER CATEGORIA PARA FILTRO DE TEMPLATES
  public getTemplateCategory(): string {
    return this.selectedCustomerForTemplate?.category || 'all';
  }

  // ✅ FORMULÁRIO - MÉTODOS
  private resetForm(): void {
    this.activityForm = {
      title: '',
      type: 'call',
      leadId: '',
      description: '',
      scheduledDate: '',
      scheduledTime: '',
      priority: 'medium',
      status: 'pending'
    };
  }

  private fillForm(activity: any): void {
    this.activityForm = {
      title: activity.title || '',
      type: activity.type || 'call',
      leadId: activity.leadId || '',
      description: activity.description || '',
      scheduledDate: activity.scheduledDate || '',
      scheduledTime: activity.scheduledTime || '',
      priority: activity.priority || 'medium',
      status: activity.status || 'pending'
    };
  }

  // ✅ SALVAR ATIVIDADE
  public async saveActivity(): Promise<void> {
    if (!this.activityForm.title || !this.activityForm.type || !this.activityForm.scheduledDate) {
      this.alertService.alert('Preencha todos os campos obrigatórios', 'warning');
      return;
    }

    try {
      console.log('💾 Salvando atividade...');

      const activityData: any = {
        ...this.activityForm,
        owner: Utilities.storeID,
        createdBy: Utilities.currentLoginData.userId,
        updatedAt: new Date().toISOString()
      };

      if (this.modalMode === 'create') {
        activityData.createdAt = new Date().toISOString();
        await this.crmService.createActivity(activityData);
        this.alertService.alert('Atividade criada com sucesso!', 'success');
      } else {
        await this.crmService.updateActivity(this.selectedActivity._id, activityData);
        this.alertService.alert('Atividade atualizada com sucesso!', 'success');
      }

      this.closeModal();
      this.crmService.getActivities(true);
    } catch (error) {
      console.error('❌ Erro ao salvar atividade:', error);
      this.alertService.alert('Erro ao salvar atividade', 'error');
    }
  }

  // ✅ MARCAR COMO CONCLUÍDA
  public async markAsCompleted(activity: any): Promise<void> {
    try {
      console.log('✅ Marcando atividade como concluída:', activity.title);

      await this.crmService.updateActivity(activity._id, {
        status: 'completed',
        completedDate: new Date().toISOString()
      });

      this.alertService.alert('Atividade marcada como concluída!', 'success');
      this.crmService.getActivities(true);
    } catch (error) {
      console.error('❌ Erro ao marcar como concluída:', error);
      this.alertService.alert('Erro ao atualizar atividade', 'error');
    }
  }

  // ✅ EXCLUIR ATIVIDADE
  public async deleteActivity(activity: any): Promise<void> {
    const result = await this.alertService.confirm(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir a atividade "${activity.title}"?`
    );

    if (result.isConfirmed) {
      try {
        console.log('🗑️ Excluindo atividade:', activity.title);

        await this.crmService.deleteActivity(activity._id);
        this.alertService.alert('Atividade excluída com sucesso!', 'success');
        this.crmService.getActivities(true);
      } catch (error) {
        console.error('❌ Erro ao excluir atividade:', error);
        this.alertService.alert('Erro ao excluir atividade', 'error');
      }
    }
  }

  // ✅ OUTRAS AÇÕES DE COMUNICAÇÃO
  public makeCall(activity: any): void {
    if (activity.leadPhone) {
      window.open(`tel:${activity.leadPhone}`, '_self');
      console.log('📞 Fazendo ligação para:', activity.leadPhone);
    } else {
      this.alertService.alert('Número de telefone não encontrado', 'warning');
    }
  }

  // ✅ FUNÇÃO CORRIGIDA PARA ENVIAR EMAIL - ABRE O CLIENTE DE EMAIL
  public sendEmail(activity: any): void {
    // Verifica se tem email do cliente
    if (!activity.leadEmail) {
      this.alertService.alert('❌ Cliente sem email cadastrado!', 'warning');
      return;
    }

    try {
      // 📧 Monta o email de forma profissional
      const emailData = {
        to: activity.leadEmail,
        subject: this.buildEmailSubject(activity),
        body: this.buildEmailBody(activity)
      };

      // 🚀 CORREÇÃO: Criar link mailto corretamente
      const mailtoLink = `mailto:${emailData.to}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;

      // 📊 DEBUG: Mostrar o link no console
      console.log('📧 Link mailto gerado:', mailtoLink);
      console.log('📧 Tamanho do link:', mailtoLink.length, 'caracteres');

      // ⚠️ IMPORTANTE: Usar window.open ao invés de window.location.href
      // Isso funciona melhor em todos os navegadores
      window.open(mailtoLink, '_self');

      // ✅ Feedback visual APÓS abrir o email
      setTimeout(() => {
        this.alertService.alert('📧 Cliente de email aberto!', 'success');
      }, 500);

      // 📊 Log de sucesso
      console.log('✅ Email aberto com sucesso para:', emailData.to);

    } catch (error) {
      console.error('❌ Erro ao abrir email:', error);
      this.alertService.alert('Erro ao abrir o cliente de email. Verifique se tem um cliente de email configurado.', 'error');
    }
  }

  // 📝 Função auxiliar para montar o assunto do email
  private buildEmailSubject(activity: any): string {
    // Cria um assunto profissional baseado no tipo de atividade
    const hoje = new Date().toLocaleDateString('pt-BR');

    // Verifica o tipo de atividade e monta assunto apropriado
    if (activity.type === 'follow-up') {
      return `Acompanhamento - ${activity.leadName} - ${hoje}`;
    } else if (activity.type === 'proposal') {
      return `Proposta Comercial - ${activity.leadName}`;
    } else if (activity.type === 'meeting') {
      return `Reunião Agendada - ${activity.title}`;
    } else {
      return `${activity.title} - ${activity.leadName}`;
    }
  }

  // 📄 Função auxiliar para montar o corpo do email - VERSÃO SIMPLIFICADA
  private buildEmailBody(activity: any): string {
    // Busca o lead completo para ter mais informações
    const lead = this.leads.find(l => l._id === activity.leadId);

    // Monta um email profissional
    let emailBody = `Olá ${activity.leadName},\n\n`;

    // Adiciona conteúdo baseado no tipo de atividade
    if (activity.type === 'follow-up') {
      emailBody += `Espero que esteja tudo bem com você!\n\n`;
      emailBody += `Estou entrando em contato para dar continuidade em nossa conversa sobre `;
      emailBody += activity.description || 'nossos produtos e serviços';
      emailBody += `.\n\n`;
    } else if (activity.type === 'proposal') {
      emailBody += `Conforme conversamos, estou enviando nossa proposta comercial.\n\n`;
      if (lead?.customData?.products) {
        emailBody += `Produtos de seu interesse:\n`;
        lead.customData.products.forEach((product: any) => {
          emailBody += `- ${product.name}\n`;
        });
        emailBody += `\n`;
      }
    } else {
      emailBody += activity.description || 'Estou entrando em contato conforme combinado';
      emailBody += `.\n\n`;
    }

    // Adiciona informações de valor se existir
    if (lead?.value) {
      emailBody += `Valor estimado: R$ ${lead.value.toLocaleString('pt-BR')}\n\n`;
    }

    // Adiciona call-to-action
    emailBody += `Fico à disposição para esclarecer qualquer dúvida.\n\n`;
    emailBody += `Qual o melhor horário para conversarmos?\n\n`;

    // Assinatura profissional SIMPLIFICADA (sem depender do ProjectSettings)
    emailBody += `Atenciosamente,\n`;
    emailBody += `${Utilities.currentLoginData?.name || 'Equipe de Vendas'}\n`;
    emailBody += `${Utilities.currentLoginData?.email || ''}\n`;

    return emailBody;
  }

  // 🧪 MÉTODO DE TESTE - USE PARA DEBUG
  public testActivityData(activity: any): void {
    console.log('🧪 === TESTE DE EXTRAÇÃO DE DADOS ===');

    // 1. Dados básicos
    console.log('📋 DADOS BÁSICOS:');
    console.log('- Título:', activity.title);
    console.log('- Lead Name:', activity.leadName);
    console.log('- Lead Phone:', activity.leadPhone);
    console.log('- Lead ID:', activity.leadId);

    // 2. Buscar lead completo
    const lead = this.leads.find(l => l._id === activity.leadId);
    if (lead) {
      console.log('\n👤 LEAD COMPLETO ENCONTRADO:');
      console.log('- Nome:', lead.name);
      console.log('- Telefone:', lead.phone);
      console.log('- Email:', lead.email);
      console.log('- Valor:', lead.value);
      console.log('- Status:', lead.status);
      console.log('- Tags:', lead.tags);
      console.log('- Custom Data:', lead.customData);
      console.log('- Notas (primeiros 200 chars):', lead.notes?.substring(0, 200));
    } else {
      console.log('\n❌ LEAD NÃO ENCONTRADO!');
    }

    // 3. Testar extração de produtos
    console.log('\n📦 TESTE DE EXTRAÇÃO DE PRODUTOS:');

    // Do customData
    if (lead?.customData?.products) {
      console.log('✅ Produtos no customData:', lead.customData.products);
    }

    // Da descrição
    if (activity.description) {
      console.log('\n📄 Descrição da atividade:', activity.description);
      const productsFromDesc = this.extractProductsFromDescription(activity.description);
      console.log('📦 Produtos extraídos da descrição:', productsFromDesc);
    }

    // Das notas do lead
    if (lead?.notes) {
      const productsFromNotes = this.extractProductsFromDescription(lead.notes);
      console.log('📦 Produtos extraídos das notas:', productsFromNotes);
    }

    // 4. Testar extração de serviços
    console.log('\n🔧 TESTE DE EXTRAÇÃO DE SERVIÇOS:');

    // Do customData
    if (lead?.customData?.services) {
      console.log('✅ Serviços no customData:', lead.customData.services);
    }

    // Do serviceData
    if (lead?.customData?.serviceData) {
      console.log('✅ ServiceData no customData:', lead.customData.serviceData);
    }

    // 5. Preparar dados como seria para o template
    const products = this.extractProductsFromMultipleSources({
      ...activity,
      leadCustomData: lead?.customData,
      leadNotes: lead?.notes
    });

    const services = this.extractServicesFromMultipleSources({
      ...activity,
      leadCustomData: lead?.customData,
      leadNotes: lead?.notes
    });

    console.log('\n🎯 RESULTADO FINAL:');
    console.log('- Cliente:', lead?.name || activity.leadName || 'Não encontrado');
    console.log('- Produtos encontrados:', products.length);
    console.log('- Serviços encontrados:', services.length);
    console.log('- Valor total:', lead?.value || 0);

    if (products.length > 0) {
      console.log('\n📦 PRODUTOS:');
      products.forEach(p => {
        console.log(`  - ${p.quantity}x ${p.name} = R$ ${p.total}`);
      });
    }

    if (services.length > 0) {
      console.log('\n🔧 SERVIÇOS:');
      services.forEach(s => {
        console.log(`  - ${s.name} = R$ ${s.total || s.price || 0}`);
      });
    }

    console.log('\n🧪 === FIM DO TESTE ===');
  }

  // ✅ FUNÇÕES AUXILIARES PARA O TEMPLATE

  // TrackBy para melhor performance
  public trackByActivity(index: number, activity: any): any {
    return activity._id || index;
  }

  // Obter contagem por status
  public getActivityCount(status: string): number {
    return this.allActivities.filter(activity => activity.status === status).length;
  }

  // Obter contagem para hoje
  public getTodayCount(): number {
    const today = new Date().toISOString().split('T')[0];
    return this.allActivities.filter(activity =>
      activity.scheduledDate === today && activity.status === 'pending'
    ).length;
  }

  // Obter ícone do tipo
  public getTypeIcon(type: string): string {
    const typeOption = this.typeOptions.find(option => option.value === type);
    return typeOption ? typeOption.icon : 'help-circle-outline';
  }

  // Obter label do tipo
  public getTypeLabel(type: string): string {
    const typeOption = this.typeOptions.find(option => option.value === type);
    return typeOption ? typeOption.label : type;
  }

  // Obter label do status
  public getStatusLabel(status: string): string {
    const statusOption = this.statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.label : status;
  }

  // Obter label da prioridade
  public getPriorityLabel(priority: string): string {
    const priorityOption = this.priorityOptions.find(option => option.value === priority);
    return priorityOption ? priorityOption.label : priority;
  }

  // Formatar data
  public formatDate(dateString: string): string {
    if (!dateString) return '';

    const date = this.parseDateInLocalTime(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Zerar horas para comparação
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return 'Hoje';
    } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
      return 'Amanhã';
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  }

  // ✅ MÉTODOS PARA DEBUG (úteis durante desenvolvimento)
  public debugActivities(): void {
    console.log('🔍 DEBUG - Todas as atividades:', this.allActivities);
    console.log('🔍 DEBUG - Atividades filtradas:', this.filteredActivities);
    console.log('🔍 DEBUG - Filtros atuais:', this.filters);
    console.log('🔍 DEBUG - Leads:', this.leads);
  }

  public debugTemplates(): void {
    console.log('🔍 DEBUG - Modal templates:', this.showTemplatesModal);
    console.log('🔍 DEBUG - Cliente selecionado:', this.selectedCustomerForTemplate);
    console.log('🔍 DEBUG - Categoria de template:', this.getTemplateCategory());
  }
}
