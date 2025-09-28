// Arquivo: leads.component.ts
// Localização: src/app/pages/crm/leads/leads.component.ts
// Componente: Leads com Importador de Clientes e Seleção Múltipla
// VERSÃO CORRIGIDA: Filtros de status e formatNotesShort atualizados

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Serviços
import { CrmService, ICRMLead } from '../crm.service';
import { AlertService } from '@shared/services/alert.service';

// Utilities
import { Utilities } from '@shared/utilities/utilities';
import { Dispatch } from '@shared/utilities/dispatch';

@Component({
  selector: 'app-leads',
  templateUrl: './leads.component.html',
  styleUrls: ['./leads.component.scss']
})
export class LeadsComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  // Dados
  public leads: any[] = [];
  public filteredLeads: any[] = [];
  public loading = true;

  // Filtros
  public searchTerm = '';
  public filterStatus = 'all';
  public filterSource = 'all';
  public filterType = 'all';

  // Modal
  public showModal = false;
  public modalMode: 'create' | 'edit' = 'create';
  public selectedLead: any = null;

  // 🆕 MODAL DE DETALHES MELHORADO
  public showDetailsModal = false;
  public leadDetails: any = null;

  // Modal de Importação
  public showImportModal = false;

  // ⭐ SELEÇÃO MÚLTIPLA
  public selectedLeads = new Set<string>();
  public selectAll = false;

  // 📊 ESTATÍSTICAS
  public stats = {
    total: 0,
    pending: 0,
    concluded: 0,
    totalValue: 0
  };

  // Formulário
  public leadForm: Partial<ICRMLead> = {
    name: '',
    email: '',
    phone: '',
    source: 'Website',
    status: 'new',
    value: 0,
    notes: ''
  };

  // 🆕 FUNCIONALIDADE DE CRIAR ATIVIDADE COM O LEAD
  // Flag para controlar se deve criar atividade junto com o lead
  public createActivityWithLead = false;

  // Formulário da atividade (usado quando createActivityWithLead = true)
  public activityForm = {
    title: '',                    // Título da atividade
    type: 'call' as any,          // Tipo: call, email, meeting, task, whatsapp, followup
    description: '',              // Descrição da atividade
    scheduledDate: '',            // Data agendada (formato: YYYY-MM-DD)
    scheduledTime: '',            // Hora agendada (formato: HH:MM)
    priority: 'medium' as any,    // Prioridade: low, medium, high, urgent
  };

  // Opções para o formulário de atividade
  public activityTypeOptions = [
    { value: 'call', label: '📞 Ligação', icon: 'phone-call-outline' },
    { value: 'email', label: '✉️ Email', icon: 'email-outline' },
    { value: 'meeting', label: '🤝 Reunião', icon: 'people-outline' },
    { value: 'task', label: '📋 Tarefa', icon: 'checkmark-square-outline' },
    { value: 'whatsapp', label: '💬 WhatsApp', icon: 'message-circle-outline' },
    { value: 'followup', label: '🔄 Follow-up', icon: 'refresh-outline' }
  ];

  public activityPriorityOptions = [
    { value: 'low', label: '🟢 Baixa' },
    { value: 'medium', label: '🟡 Média' },
    { value: 'high', label: '🟠 Alta' },
    { value: 'urgent', label: '🔴 Urgente' }
  ];

  // Opções
  public statusOptions = [
    { value: 'new', label: 'Novo', color: 'primary', icon: 'flash-outline' },
    { value: 'contacted', label: 'Contactado', color: 'info', icon: 'phone-call-outline' },
    { value: 'qualified', label: 'Qualificado', color: 'warning', icon: 'checkmark-circle-outline' },
    { value: 'negotiation', label: 'Em Negociação', color: 'success', icon: 'trending-up-outline' },
    { value: 'closed', label: 'Fechado', color: 'secondary', icon: 'checkmark-square-outline' },
    { value: 'lost', label: 'Perdido', color: 'danger', icon: 'close-circle-outline' },
    { value: 'canceled', label: 'Cancelado', color: 'danger', icon: 'alert-circle-outline' }
  ];

  public sourceOptions = [
    'Website',
    'Indicação',
    'Facebook',
    'Instagram',
    'WhatsApp',
    'Mercado Livre',
    'Google',
    'PDV',
    'PDV Pendente',
    'Ordem de Serviço Pendente',
    'PDV - Ordem de Serviço',
    'Sistema (Importado)',
    'Outros'
  ];

  // 🆕 Opções de tipo de lead
  public typeOptions = [
    { value: 'all', label: 'Todos os tipos' },
    { value: 'with-products', label: 'Com produtos' },
    { value: 'with-services', label: 'Com serviços' },
    { value: 'with-order', label: 'Com ordem de serviço' },
    { value: 'pending', label: 'Vendas pendentes' },
    { value: 'concluded', label: 'Vendas concluídas' }
  ];

  // Permissões
  public permissions = {
    canAdd: false,
    canEdit: false,
    canDelete: false,
    canViewValue: false,
    canViewNotes: false,
    canAssign: false
  };

  constructor(
    private crmService: CrmService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.checkPermissions();
    this.loadLeads();
    this.setupSearchDebounce();

    // Listener para mudanças de permissões
    Dispatch.onRefreshCurrentUserPermissions('LeadsComponent', () => {
      this.checkPermissions();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    Dispatch.removeListeners('refreshCurrentUserPermissions', 'LeadsComponent');
  }

  // 🔍 Configurar debounce para busca
  private setupSearchDebounce(): void {
    this.searchSubject$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.searchTerm = searchTerm;
        this.applyFilters();
      });
  }

  // 🔍 Handler para mudança na busca
  public onSearchChange(searchTerm: string): void {
    this.searchSubject$.next(searchTerm);
  }

  // Verificar permissões
  private checkPermissions(): void {
    if (Utilities.isAdmin) {
      // Admin tem todas as permissões
      this.permissions = {
        canAdd: true,
        canEdit: true,
        canDelete: true,
        canViewValue: true,
        canViewNotes: true,
        canAssign: true
      };
    } else {
      // Buscar permissões específicas do CRM
      const crmPermissions = Utilities.permissions()?.crm;

      if (crmPermissions) {
        // Verificar se tem a estrutura esperada
        if (crmPermissions.actions && Array.isArray(crmPermissions.actions)) {
          this.permissions = {
            canAdd: crmPermissions.actions.includes('add'),
            canEdit: crmPermissions.actions.includes('edit'),
            canDelete: crmPermissions.actions.includes('delete'),
            canViewValue: crmPermissions.fields?.includes('value') || false,
            canViewNotes: crmPermissions.fields?.includes('notes') || false,
            canAssign: crmPermissions.fields?.includes('assignedTo') || false
          };
        } else {
          // Se tem permissão CRM mas não está no formato esperado
          // Dar permissões completas (já que tem acesso ao CRM)
          console.log('CRM permissions em formato antigo, aplicando permissões completas');
          this.permissions = {
            canAdd: true,
            canEdit: true,
            canDelete: true,
            canViewValue: true,
            canViewNotes: true,
            canAssign: true
          };
        }
      } else {
        // Sem permissões - modo visualização apenas
        this.permissions = {
          canAdd: false,
          canEdit: false,
          canDelete: false,
          canViewValue: false,
          canViewNotes: false,
          canAssign: false
        };
      }
    }
  }

  // Carregar leads
  private loadLeads(): void {
    this.crmService.leads$
      .pipe(takeUntil(this.destroy$))
      .subscribe(leads => {
        this.leads = leads;
        this.applyFilters();
        this.updateStats();
        this.loading = false;
      });

    this.crmService.getLeads();
  }

  // 📊 Atualizar estatísticas - CORRIGIDO: Não contar cancelados como pendentes
  private updateStats(): void {
    this.stats = {
      total: this.leads.length,
      pending: 0,
      concluded: 0,
      totalValue: 0
    };

    this.leads.forEach(lead => {
      // CORRIGIDO: Contar pendentes (excluindo cancelados e perdidos)
      if (lead.status !== 'canceled' && lead.status !== 'lost') {
        if (lead.status === 'negotiation' ||
          (lead.notes && (
            lead.notes.includes('VENDA PENDENTE') ||
            lead.notes.includes('PENDENTE - Requer follow-up')
          ))
        ) {
          this.stats.pending++;
        }
      }

      // Contar concluídas
      if (lead.status === 'closed' ||
        (lead.notes && (
          lead.notes.includes('VENDA CONCLUÍDA') ||
          lead.notes.includes('VENDA FINALIZADA')
        ))
      ) {
        this.stats.concluded++;
      }

      // Somar valor total
      this.stats.totalValue += lead.value || 0;
    });
  }

  // Aplicar filtros - CORRIGIDO: Lógica de pendentes e concluídas
  public applyFilters(): void {
    let filtered = [...this.leads];

    // Filtro por busca
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(search) ||
        lead.email.toLowerCase().includes(search) ||
        (lead.phone && lead.phone.includes(search)) ||
        (lead.notes && lead.notes.toLowerCase().includes(search)) ||
        (lead._id && lead._id.toLowerCase().includes(search))
      );
    }

    // Filtro por status
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(lead => lead.status === this.filterStatus);
    }

    // Filtro por origem
    if (this.filterSource !== 'all') {
      filtered = filtered.filter(lead => lead.source === this.filterSource);
    }

    // 🆕 Filtro por tipo - CORRIGIDO
    if (this.filterType !== 'all') {
      filtered = filtered.filter(lead => {
        switch (this.filterType) {
          case 'with-products':
            return this.extractProductsFromLead(lead).length > 0;

          case 'with-services':
            return this.extractServicesFromLead(lead).length > 0 || this.hasServiceOrder(lead);

          case 'with-order':
            return this.hasServiceOrder(lead);

          case 'pending':
            // CORRIGIDO: Excluir leads cancelados e perdidos da lista de pendentes!
            return lead.status !== 'canceled' && lead.status !== 'lost' && (
              lead.status === 'negotiation' || // Status em negociação
              (lead.notes && (
                lead.notes.includes('VENDA PENDENTE') ||
                lead.notes.includes('PENDENTE - Requer follow-up')
              ))
            );

          case 'concluded':
            // CORRIGIDO: Apenas leads com status 'closed' são considerados concluídos
            return lead.status === 'closed' || (
              lead.notes && (
                lead.notes.includes('VENDA CONCLUÍDA') ||
                lead.notes.includes('VENDA FINALIZADA')
              )
            );

          default:
            return true;
        }
      });
    }

    // Ordenar por data de registro (mais recentes primeiro)
    filtered.sort((a, b) => {
      const dateA = new Date(a.registerDate || 0).getTime();
      const dateB = new Date(b.registerDate || 0).getTime();
      return dateB - dateA;
    });

    this.filteredLeads = filtered;

    // Atualizar estado do "Selecionar Todos"
    this.updateSelectAllState();
  }

  // ⭐ MÉTODOS DE SELEÇÃO MÚLTIPLA

  // Atualizar estado do checkbox "Selecionar Todos"
  private updateSelectAllState(): void {
    // Limpar seleções que não existem mais nos resultados filtrados
    const filteredIds = new Set(this.filteredLeads.map(lead => lead._id));
    const toRemove: string[] = [];

    this.selectedLeads.forEach(id => {
      if (!filteredIds.has(id)) {
        toRemove.push(id);
      }
    });

    toRemove.forEach(id => this.selectedLeads.delete(id));

    // Atualizar estado do selectAll
    this.selectAll = this.filteredLeads.length > 0 &&
      this.selectedLeads.size === this.filteredLeads.length;
  }

  // Alternar seleção de um lead
  public toggleLeadSelection(leadId: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (this.selectedLeads.has(leadId)) {
      this.selectedLeads.delete(leadId);
    } else {
      this.selectedLeads.add(leadId);
    }

    // Atualizar estado do "Selecionar Todos"
    this.updateSelectAllState();
  }

  // Verificar se um lead está selecionado
  public isLeadSelected(leadId: string): boolean {
    return this.selectedLeads.has(leadId);
  }

  // Selecionar/Desmarcar todos
  public toggleSelectAll(): void {
    if (this.selectAll) {
      // Desmarcar todos
      this.selectedLeads.clear();
      this.selectAll = false;
    } else {
      // Selecionar todos os leads filtrados
      this.selectedLeads.clear();
      this.filteredLeads.forEach(lead => {
        this.selectedLeads.add(lead._id);
      });
      this.selectAll = true;
    }
  }

  // Obter texto do botão de seleção
  public getSelectAllText(): string {
    if (this.selectAll) {
      return 'Desmarcar Todos';
    }
    return `Selecionar Todos (${this.filteredLeads.length})`;
  }

  // Excluir leads selecionados
  public async deleteSelected(): Promise<void> {
    if (this.selectedLeads.size === 0) {
      this.alertService.alert('Nenhum lead selecionado!', 'warning');
      return;
    }

    const result = await this.alertService.confirm(
      `Deseja realmente excluir ${this.selectedLeads.size} lead(s)?`,
      'Esta ação não pode ser desfeita!'
    );

    if (result.isConfirmed) {
      try {
        let deletedCount = 0;
        let errorCount = 0;

        // Mostrar loading
        this.alertService.alert('Excluindo leads...', 'info');

        // Converter Set para Array para processar
        const leadsToDelete = Array.from(this.selectedLeads);

        // Processar em lotes de 5 para não sobrecarregar
        const batchSize = 5;
        for (let i = 0; i < leadsToDelete.length; i += batchSize) {
          const batch = leadsToDelete.slice(i, i + batchSize);

          const promises = batch.map(leadId =>
            this.crmService.deleteLead(leadId)
              .then(() => deletedCount++)
              .catch(error => {
                console.error(`Erro ao excluir lead ${leadId}:`, error);
                errorCount++;
              })
          );

          await Promise.all(promises);
        }

        // Limpar seleção
        this.selectedLeads.clear();
        this.selectAll = false;

        // Recarregar leads
        await this.crmService.getLeads(true);

        // Mostrar resultado
        if (errorCount === 0) {
          this.alertService.alert(`${deletedCount} lead(s) excluído(s) com sucesso!`, 'success');
        } else {
          this.alertService.alert(
            `${deletedCount} lead(s) excluído(s), ${errorCount} erro(s)`,
            'warning'
          );
        }
      } catch (error) {
        this.alertService.alert('Erro ao excluir leads!', 'error');
      }
    }
  }

  // 📋 Exportar leads selecionados
  public exportSelected(): void {
    if (this.selectedLeads.size === 0) {
      this.alertService.alert('Nenhum lead selecionado!', 'warning');
      return;
    }

    // Obter leads selecionados
    const selectedData = this.filteredLeads.filter(lead =>
      this.selectedLeads.has(lead._id)
    );

    // Criar CSV
    const csv = this.generateCSV(selectedData);

    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.alertService.alert(`${selectedData.length} lead(s) exportado(s)!`, 'success');
  }

  // Gerar CSV
  private generateCSV(leads: any[]): string {
    const headers = ['Nome', 'Email', 'Telefone', 'Origem', 'Status', 'Valor', 'Data', 'Observações'];
    const rows = leads.map(lead => [
      lead.name,
      lead.email,
      lead.phone || '',
      lead.source,
      this.getStatusLabel(lead.status),
      this.permissions.canViewValue ? (lead.value || 0).toString() : '***',
      new Date(lead.registerDate).toLocaleDateString('pt-BR'),
      this.permissions.canViewNotes ? (lead.notes || '').replace(/\n/g, ' ') : '***'
    ]);

    // Montar CSV
    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
    ].join('\n');

    return csvContent;
  }

  // Abrir modal para criar
  public openCreateModal(): void {
    if (!this.permissions.canAdd) {
      this.alertService.alert('Você não tem permissão para adicionar leads', 'warning');
      return;
    }

    this.modalMode = 'create';
    this.selectedLead = null;
    this.resetForm();
    this.showModal = true;
  }

  // Abrir modal para editar
  public openEditModal(lead: any): void {
    if (!this.permissions.canEdit) {
      this.alertService.alert('Você não tem permissão para editar leads', 'warning');
      return;
    }

    this.modalMode = 'edit';
    this.selectedLead = lead;
    this.leadForm = {
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      status: lead.status,
      value: lead.value || 0,
      notes: lead.notes || ''
    };
    this.showModal = true;
  }


  // 👁️ NOVO: Visualizar detalhes do lead com modal customizado moderno
  public viewLeadDetails(lead: any): void {
    console.log('🔍 Abrindo detalhes do lead:', lead);

    // Preparar todos os dados do lead de forma estruturada
    this.leadDetails = {
      // Informações básicas
      basic: {
        name: lead.name,
        email: lead.email,
        phone: lead.phone || 'Não informado',
        source: lead.source,
        status: lead.status,
        statusLabel: this.getStatusLabel(lead.status),
        statusColor: this.getStatusColor(lead.status),
        value: lead.value || 0,
        registerDate: lead.registerDate ? new Date(lead.registerDate).toLocaleDateString('pt-BR') : 'Não informado'
      },

      // Produtos
      products: this.extractProductsFromLead(lead).map(p => ({
        ...p,
        formattedTotal: this.formatProductTotal(p)
      })),

      // Serviços
      services: this.extractServicesFromLead(lead).map(s => ({
        ...s,
        formattedTotal: this.formatServiceTotal(s)
      })),

      // Ordem de serviço
      serviceOrder: this.extractServiceOrderData(lead),

      // Pagamento
      payment: this.extractPaymentMethods(lead),

      // Observações
      notes: (this.permissions.canViewNotes && lead.notes) ? lead.notes : null,

      // Permissões
      canViewValue: this.permissions.canViewValue,
      canViewNotes: this.permissions.canViewNotes
    };

    // Abrir modal customizado
    this.showDetailsModal = true;
    document.body.classList.add('modal-open');
  }

  // 🆕 MÉTODO AUXILIAR: Fechar modal de detalhes
  public closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.leadDetails = null;
    document.body.classList.remove('modal-open');
  }

  // 🆕 MÉTODO AUXILIAR: Formatar total do produto
  private formatProductTotal(product: any): string {
    if (!product.total) return 'N/A';

    let totalValue = 0;
    if (typeof product.total === 'string') {
      totalValue = parseFloat(product.total.replace(/\./g, '').replace(',', '.'));
    } else {
      totalValue = product.total;
    }

    return totalValue ? this.formatCurrency(totalValue) : 'N/A';
  }

  // 🆕 MÉTODO AUXILIAR: Formatar total do serviço
  private formatServiceTotal(service: any): string {
    if (!service.total) return 'N/A';

    let totalValue = 0;
    if (typeof service.total === 'string') {
      totalValue = parseFloat(service.total.replace(/\./g, '').replace(',', '.'));
    } else {
      totalValue = service.total;
    }

    return totalValue ? this.formatCurrency(totalValue) : 'N/A';
  }

  // Salvar lead
  public async saveLead(): Promise<void> {
    // Validação
    if (!this.leadForm.name || !this.leadForm.email) {
      this.alertService.alert('Nome e email são obrigatórios!', 'warning');
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.leadForm.email)) {
      this.alertService.alert('Email inválido!', 'warning');
      return;
    }

    // 📝 VALIDAÇÃO DA ATIVIDADE (se estiver habilitada)
    if (this.createActivityWithLead) {
      if (!this.activityForm.title || !this.activityForm.scheduledDate) {
        this.alertService.alert('Ao criar uma atividade, título e data são obrigatórios!', 'warning');
        return;
      }
    }

    try {
      let createdLeadId: string | null = null;

      if (this.modalMode === 'create') {
        console.log('🔍 DEBUG: Iniciando criação de lead');
        console.log('🔍 DEBUG: createActivityWithLead =', this.createActivityWithLead);
        console.log('🔍 DEBUG: activityForm =', this.activityForm);

        // Criar o lead
        const createdLead = await this.crmService.createLead(this.leadForm);
        // O createLead retorna diretamente o ID como string
        createdLeadId = createdLead;

        console.log('🔍 DEBUG: Lead criado, ID =', createdLeadId);
        console.log('🔍 DEBUG: Lead retornado =', createdLead);
        console.log('🔍 DEBUG: Tipo do retorno =', typeof createdLead);

        // 🆕 SE MARCOU PARA CRIAR ATIVIDADE, CRIAR AGORA
        if (this.createActivityWithLead && createdLeadId) {
          console.log('🔍 DEBUG: Vai criar atividade para o lead');
          await this.createActivityForLead(createdLeadId);
        } else {
          console.log('🔍 DEBUG: NÃO vai criar atividade. Motivos:');
          console.log('🔍 DEBUG: - createActivityWithLead:', this.createActivityWithLead);
          console.log('🔍 DEBUG: - createdLeadId:', createdLeadId);
        }

        this.alertService.alert(
          this.createActivityWithLead
            ? 'Lead criado com atividade agendada!'
            : 'Lead criado com sucesso!',
          'success'
        );
      } else {
        // Atualizar lead
        await this.crmService.updateLead(this.selectedLead._id, this.leadForm);

        // Se mudou para fechado e ainda não existe venda registrada, registrar venda
        if (
          this.selectedLead.status !== 'closed' &&
          this.leadForm.status === 'closed' &&
          (!this.selectedLead.saleIds || this.selectedLead.saleIds.length === 0)
        ) {
          this.crmService.closeLeadAsSale({ ...this.selectedLead, ...this.leadForm });
        }

        this.alertService.alert('Lead atualizado com sucesso!', 'success');
      }

      this.showModal = false;
      this.resetActivityForm(); // Limpar formulário de atividade
      this.crmService.getLeads(true); // Forçar refresh
    } catch (error) {
      console.error('Erro ao salvar lead:', error);
      this.alertService.alert('Erro ao salvar lead!', 'error');
    }
  }

  // 🆕 MÉTODO AUXILIAR: Criar atividade para o lead
  private async createActivityForLead(leadId: string): Promise<void> {
    try {
      console.log('🔍 DEBUG: Entrando em createActivityForLead');
      console.log('🔍 DEBUG: leadId recebido:', leadId);
      console.log('🔍 DEBUG: this.activityForm:', this.activityForm);
      console.log('🔍 DEBUG: this.leadForm:', this.leadForm);

      // Preparar dados da atividade
      const activityData = {
        title: this.activityForm.title || `Follow-up: ${this.leadForm.name}`,
        type: this.activityForm.type,
        leadId: leadId,
        leadName: this.leadForm.name,
        leadPhone: this.leadForm.phone,
        leadEmail: this.leadForm.email,
        description: this.activityForm.description || `Atividade criada automaticamente ao cadastrar o lead ${this.leadForm.name}`,
        scheduledDate: this.activityForm.scheduledDate,
        scheduledTime: this.activityForm.scheduledTime || '09:00',
        priority: this.activityForm.priority,
        status: 'pending'
      };

      console.log('🔍 DEBUG: Dados da atividade preparados:', activityData);
      console.log('🔍 DEBUG: Verificando se crmService existe:', !!this.crmService);
      console.log('🔍 DEBUG: Verificando se createActivity existe:', !!this.crmService.createActivity);

      // Chamar o serviço para criar a atividade
      console.log('🔍 DEBUG: Chamando crmService.createActivity...');
      const result = await this.crmService.createActivity(activityData);
      console.log('✅ Atividade criada com sucesso! Resultado:', result);
    } catch (error) {
      console.error('❌ Erro detalhado ao criar atividade:');
      console.error('❌ Tipo do erro:', typeof error);
      console.error('❌ Mensagem:', error?.message || error);
      console.error('❌ Stack:', error?.stack);
      console.error('❌ Objeto completo:', error);

      // Não vamos lançar o erro para não impedir a criação do lead
      this.alertService.alert('Lead criado, mas houve erro ao criar a atividade: ' + (error?.message || error), 'warning');
    }
  }

  // 🆕 MÉTODO AUXILIAR: Resetar formulário de atividade
  private resetActivityForm(): void {
    this.createActivityWithLead = false;
    this.activityForm = {
      title: '',
      type: 'call',
      description: '',
      scheduledDate: '',
      scheduledTime: '',
      priority: 'medium'
    };
  }

  // 🆕 MÉTODO AUXILIAR: Obter data de hoje formatada para o campo de data
  public getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // 🆕 MÉTODO: Toggle para mostrar/ocultar campos de atividade
  public toggleActivityCreation(): void {
    this.createActivityWithLead = !this.createActivityWithLead;

    // Se ativou, definir valores padrão
    if (this.createActivityWithLead) {
      this.activityForm.scheduledDate = this.getTodayDate();
      this.activityForm.scheduledTime = '09:00'; // Hora padrão
      // Sugerir título baseado no nome do lead se já preenchido
      this.updateActivityTitle();
    }
  }

  // 🆕 MÉTODO AUXILIAR: Atualizar título da atividade baseado no nome do lead
  public updateActivityTitle(): void {
    if (this.createActivityWithLead && this.leadForm.name && !this.activityForm.title) {
      this.activityForm.title = `Primeiro contato - ${this.leadForm.name}`;
    }
  }

  // Deletar lead
  public deleteLead(lead: any, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (!this.permissions.canDelete) {
      this.alertService.alert('Você não tem permissão para excluir leads', 'warning');
      return;
    }

    this.alertService.confirm(
      'Deseja realmente excluir este lead?',
      `${lead.name} - ${lead.email}`
    ).then(result => {
      if (result.isConfirmed) {
        this.crmService.deleteLead(lead._id).then(() => {
          this.alertService.alert('Lead excluído com sucesso!', 'success');
          this.crmService.getLeads(true); // Forçar refresh
        }).catch(() => {
          this.alertService.alert('Erro ao excluir lead!', 'error');
        });
      }
    });
  }

  // Resetar formulário
  private resetForm(): void {
    this.leadForm = {
      name: '',
      email: '',
      phone: '',
      source: 'Website',
      status: 'new',
      value: 0,
      notes: ''
    };
    // Resetar também o formulário de atividade
    this.resetActivityForm();
  }

  // Obter cor do status
  public getStatusColor(status: string): string {
    const option = this.statusOptions.find(opt => opt.value === status);
    return option ? option.color : 'secondary';
  }

  // Obter label do status
  public getStatusLabel(status: string): string {
    const option = this.statusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  }


  // Formatar valor (respeitando permissão)
  public formatCurrency(value: number): string {
    if (!this.permissions.canViewValue) {
      return '***';
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  }

  // Formatar notas (respeitando permissão)
  public formatNotes(notes: string): string {
    if (!this.permissions.canViewNotes) {
      return 'Sem permissão para visualizar';
    }
    return notes || 'Sem observações';
  }

  // Abrir importador de clientes
  public openCustomerImport(): void {
    this.showImportModal = true;
  }

  // Fechar importador
  public closeCustomerImport(): void {
    this.showImportModal = false;
  }

  // Quando a importação for concluída
  public onImportComplete(count: number): void {
    this.showImportModal = false;

    // Recarregar leads
    this.crmService.getLeads(true);

    // Mostrar mensagem de sucesso
    this.alertService.alert(
      `${count} cliente(s) importado(s) com sucesso!`,
      'success'
    );
  }

  // ========== MÉTODOS DE EXTRAÇÃO DE DADOS ==========

  /**
  * 🛍️ Extrair produtos das notas do lead - VERSÃO CORRIGIDA
  */
  public extractProductsFromLead(lead: any): any[] {
    try {
      // Primeiro, tentar pegar do customData
      if (lead.customData && lead.customData.products) {
        return lead.customData.products.map(p => {
          // Garantir que todos os valores sejam números
          const product = { ...p };

          // Converter total para número se for string
          if (product.total) {
            if (typeof product.total === 'string') {
              product.total = parseFloat(product.total.replace(/\./g, '').replace(',', '.'));
            }
          } else {
            product.total = 0;
          }

          // Converter unitPrice para número se for string
          if (product.unitPrice) {
            if (typeof product.unitPrice === 'string') {
              product.unitPrice = parseFloat(product.unitPrice.replace(/\./g, '').replace(',', '.'));
            }
          } else {
            product.unitPrice = 0;
          }

          // Se não tiver total mas tiver unitPrice, calcular
          if (product.total === 0 && product.unitPrice > 0 && product.quantity) {
            product.total = product.unitPrice * product.quantity;
          }

          // Se não tiver unitPrice mas tiver total, calcular
          if (product.unitPrice === 0 && product.total > 0 && product.quantity) {
            product.unitPrice = product.total / product.quantity;
          }

          return product;
        });
      }

      // Se não tiver customData, tentar extrair das notas
      if (!lead.notes) return [];

      const notes = lead.notes;
      const products = [];

      // Procurar por diferentes formatos de produtos nas notas
      // Formato 1: 📦 PRODUTOS (X itens):
      let productsMatch = notes.match(/📦 PRODUTOS.*?\((\d+).*?\):\n((?:•.*\n)*)/);

      // Formato 2: 📦 Produtos (X):
      if (!productsMatch) {
        productsMatch = notes.match(/📦 Produtos.*?\((\d+)\):\n((?:•.*\n)*)/);
      }

      // Formato 3: 📦 PRODUTOS:
      if (!productsMatch) {
        productsMatch = notes.match(/📦 PRODUTOS.*?:\n((?:•.*\n)*)/);
        if (productsMatch) {
          // Ajustar para ter o mesmo formato
          productsMatch = [productsMatch[0], '0', productsMatch[1]];
        }
      }

      if (productsMatch && productsMatch[2]) {
        const productLines = productsMatch[2].split('\n').filter(line => line.trim().startsWith('•'));

        productLines.forEach(line => {
          // Remover o bullet point
          const cleanLine = line.replace('• ', '').trim();

          // Formato mais comum: 1x iPhone 14 Pro 512GB - R$ 5.500,00
          const match = cleanLine.match(/(\d+)x\s+(.+?)\s+-\s+R\$\s*([\d.,]+)/);

          if (match) {
            const quantity = parseInt(match[1]);
            const name = match[2].trim();
            const totalStr = match[3];
            const total = parseFloat(totalStr.replace(/\./g, '').replace(',', '.'));

            products.push({
              quantity: quantity,
              name: name,
              unitPrice: total / quantity, // Calcular preço unitário
              total: total
            });
          }
        });
      }

      return products;
    } catch (error) {
      console.error('Erro ao extrair produtos:', error);
      return [];
    }
  }

  /**
   * 🔧 Extrair serviços das notas do lead
   */
  public extractServicesFromLead(lead: any): any[] {
    try {
      // Primeiro, tentar pegar do customData
      if (lead.customData && lead.customData.services) {
        return lead.customData.services.map(s => {
          // Garantir que o total seja um número
          if (s.total && typeof s.total === 'string') {
            s.total = parseFloat(s.total.replace(/\./g, '').replace(',', '.'));
          }
          return s;
        });
      }

      // Se não tiver customData, tentar extrair das notas
      if (!lead.notes) return [];

      const notes = lead.notes;
      const services = [];

      // Procurar pela seção de serviços nas notas
      const servicesMatch = notes.match(/🔧 SERVIÇOS.*?\n((?:•.*\n)*)/);
      if (servicesMatch && servicesMatch[1]) {
        const serviceLines = servicesMatch[1].split('\n').filter(line => line.trim().startsWith('•'));

        serviceLines.forEach(line => {
          // Formato esperado: • 1x Instalação LED - R$ 40,00/un = R$ 40,00
          const match = line.match(/• (\d+)x (.+?) - R\$ ([\d.,]+)\/un = R\$ ([\d.,]+)/);
          if (match) {
            const totalStr = match[4];
            const total = parseFloat(totalStr.replace(/\./g, '').replace(',', '.'));
            services.push({
              quantity: parseInt(match[1]),
              name: match[2].trim(),
              unitPrice: match[3],
              total: total
            });
          } else {
            // Formato alternativo
            const altMatch = line.match(/• (\d+)x (.+?) - R\$ ([\d.,]+)/);
            if (altMatch) {
              const totalStr = altMatch[3];
              const total = parseFloat(totalStr.replace(/\./g, '').replace(',', '.'));
              services.push({
                quantity: parseInt(altMatch[1]),
                name: altMatch[2].trim(),
                unitPrice: '-',
                total: total
              });
            }
          }
        });
      }

      return services;
    } catch (error) {
      console.error('Erro ao extrair serviços:', error);
      return [];
    }
  }

  /**
   * 📋 Extrair dados da ordem de serviço
   */
  public extractServiceOrderData(lead: any): any {
    try {
      // Primeiro, tentar pegar do customData
      if (lead.customData && lead.customData.serviceData) {
        return lead.customData.serviceData;
      }

      // Se não tiver customData, tentar extrair das notas
      if (!lead.notes) return null;

      const notes = lead.notes;
      const serviceData: any = {};

      // Procurar código da OS
      const codeMatch = notes.match(/• Código: #(.+?)\n/);
      if (codeMatch) {
        serviceData.serviceOrderCode = codeMatch[1];
      }

      // Procurar equipamento
      const equipmentMatch = notes.match(/• Equipamento: (.+?)\n/);
      if (equipmentMatch) {
        serviceData.equipment = equipmentMatch[1];
      }

      // Procurar responsável
      const responsibleMatch = notes.match(/• Responsável: (.+?)\n/);
      if (responsibleMatch) {
        serviceData.responsible = responsibleMatch[1];
      }

      // Procurar detalhes de serviços
      // Aceita variações com "Serviços" ou "Serviços Realizados",
      // com ou sem acentuação e diferentes marcadores de lista
      const servicesMatch =
        notes.match(/[•-]\s*Servi[cç]os(?: Realizados)?:\s*(.+?)(?:\n|$)/i);
      if (servicesMatch) {
        serviceData.servicesDetails = servicesMatch[1];
      }

      // Se encontrou algum dado, retornar
      return Object.keys(serviceData).length > 0 ? serviceData : null;
    } catch (error) {
      console.error('Erro ao extrair dados da OS:', error);
      return null;
    }
  }

  /**
   * 🎯 Verificar se o lead tem ordem de serviço
   */
  public hasServiceOrder(lead: any): boolean {
    // Verificar customData
    if (lead.customData && lead.customData.serviceData) {
      return true;
    }

    // Verificar tags
    if (lead.tags && lead.tags.includes('ordem-servico')) {
      return true;
    }

    // Verificar notas
    if (lead.notes && lead.notes.includes('ORDEM DE SERVIÇO')) {
      return true;
    }

    return false;
  }

  /**
  * 💳 Extrair formas de pagamento - VERSÃO CORRIGIDA
  */
  public extractPaymentMethods(lead: any): string {
    try {
      // Tentar pegar do customData primeiro
      if (lead.customData && lead.customData.paymentMethods) {
        return lead.customData.paymentMethods
          .map(p => {
            const value = typeof p.value === 'number' ? p.value :
              parseFloat(String(p.value).replace(/\./g, '').replace(',', '.'));
            return `${p.name}: ${this.formatCurrency(value)}`;
          })
          .join(', ');
      }

      // Se não tiver, extrair das notas
      if (!lead.notes) return 'Não informado';

      const notes = lead.notes;

      // Procurar por diferentes formatos
      // Formato 1: 💳 FORMAS DE PAGAMENTO:
      let paymentMatch = notes.match(/💳 FORMAS? DE PAGAMENTO:\n((?:•.*\n)*)/);

      // Formato 2: 💳 FORMA DE PAGAMENTO:
      if (!paymentMatch) {
        paymentMatch = notes.match(/💳 FORMA DE PAGAMENTO:\n((?:•.*\n)*)/);
      }

      // Formato 3: 💳 Pagamento:
      if (!paymentMatch) {
        paymentMatch = notes.match(/💳 Pagamento:\n((?:•.*\n)*)/);
      }

      // Formato 4: 💳 PAGAMENTO:
      if (!paymentMatch) {
        paymentMatch = notes.match(/💳 PAGAMENTO:\n((?:•.*\n)*)/);
      }

      if (paymentMatch && paymentMatch[1]) {
        const payments = paymentMatch[1]
          .split('\n')
          .filter(line => line.trim().startsWith('•'))
          .map(line => {
            // Remover bullet e espaços
            const cleanLine = line.replace('• ', '').trim();
            return cleanLine;
          })
          .join(', ');

        return payments || 'Não informado';
      }

      // Formato antigo (inline)
      const inlineMatch = notes.match(/💳 Forma de pagamento: (.+?)\n/);
      if (inlineMatch) {
        return inlineMatch[1];
      }

      return 'Não informado';
    } catch (error) {
      console.error('Erro ao extrair pagamentos:', error);
      return 'Erro ao carregar';
    }
  }

  /**
   * 📝 Formatar notas resumidas (sem produtos/serviços) - VERSÃO CORRIGIDA
   * Agora prioriza o status atual do lead sobre o conteúdo das notas
   */
  public formatNotesShort(notes: string, status?: string): string {
    // Se não tem observações, retorna mensagem padrão
    if (!notes) return 'Sem observações';

    // Remover seções detalhadas das notas
    let shortNotes = notes
      .replace(/📦 PRODUTOS.*?(?=\n\n|📅|🔧|💳|🎯|✅|🚫|$)/s, '')
      .replace(/🔧 SERVIÇOS.*?(?=\n\n|📅|💳|🎯|✅|🚫|$)/s, '')
      .replace(/🔧 ORDEM DE SERVIÇO.*?(?=\n\n|📅|💳|🎯|✅|🚫|$)/s, '')
      .replace(/💳 FORMAS? DE PAGAMENTO.*?(?=\n\n|📅|🎯|✅|🚫|$)/s, '')
      .replace(/=== DADOS COMPLETOS ===.*?(?=\n\n|✅|🚫|$)/s, '')
      .trim();

    // Array para guardar informações importantes
    const importantInfo = [];

    // IMPORTANTE: Verificar o status ATUAL do lead primeiro!
    // Isso garante que a mensagem sempre reflita o status real
    if (status) {
      switch (status) {
        case 'closed':
          importantInfo.push('✅ Venda Concluída');
          break;
        case 'canceled':
          importantInfo.push('🚫 Venda Cancelada');
          break;
        case 'negotiation':
          importantInfo.push('⏳ Venda Pendente - Requer Follow-up');
          break;
        case 'new':
          importantInfo.push('🆕 Novo Lead');
          break;
        case 'contacted':
          importantInfo.push('📞 Lead Contactado');
          break;
        case 'qualified':
          importantInfo.push('⭐ Lead Qualificado');
          break;
        case 'lost':
          importantInfo.push('❌ Lead Perdido');
          break;
        default:
          // Se o status não for reconhecido, tenta buscar nas notas
          if (notes.includes('VENDA CONCLUÍDA') || notes.includes('VENDA FINALIZADA')) {
            importantInfo.push('✅ Venda Concluída');
          } else if (notes.includes('VENDA CANCELADA')) {
            importantInfo.push('🚫 Venda Cancelada');
          } else if (notes.includes('VENDA PENDENTE') || notes.includes('PENDENTE - Requer follow-up')) {
            importantInfo.push('⏳ Venda Pendente - Requer Follow-up');
          }
      }
    } else {
      // Se não foi passado o status, tenta descobrir pelas notas (fallback)
      if (notes.includes('VENDA CONCLUÍDA') || notes.includes('VENDA FINALIZADA')) {
        importantInfo.push('✅ Venda Concluída');
      } else if (notes.includes('VENDA CANCELADA')) {
        importantInfo.push('🚫 Venda Cancelada');
      } else if (notes.includes('VENDA PENDENTE') || notes.includes('PENDENTE - Requer follow-up')) {
        importantInfo.push('⏳ Venda Pendente - Requer Follow-up');
      }
    }

    // Buscar origem do lead nas notas
    const originMatch = notes.match(/🎯 Origem: (.+?)(\n|$)/);
    if (originMatch) {
      importantInfo.push(`📍 ${originMatch[1]}`);
    }

    // Buscar ação necessária (somente para status não finalizados)
    const actionMatch = notes.match(/📞 AÇÃO[^\n]*: (.+?)(\n|$)/);
    const isFinalStatus = ['closed', 'lost', 'canceled'].includes(status || '');
    if (actionMatch && !isFinalStatus) {
      importantInfo.push(`⚡ ${actionMatch[1]}`);
    }

    // Se encontrou informações importantes, retorna elas
    if (importantInfo.length > 0) {
      return importantInfo.join(' | ');
    }

    // Se não encontrou nada importante, pega as primeiras linhas relevantes
    const lines = shortNotes.split('\n').filter(line => {
      const trimmed = line.trim();
      return trimmed &&
        !trimmed.startsWith('📅') &&
        !trimmed.startsWith('🆔') &&
        !trimmed.match(/^[•\-]/) &&
        trimmed.length > 10;
    });

    return lines.slice(0, 2).join(' | ') || 'Lead do sistema';
  }

  /**
   * 🎨 Obter ícone do status
   */
  public getStatusIcon(status: string): string {
    const option = this.statusOptions.find(opt => opt.value === status);
    return option ? option.icon : 'radio-button-off-outline';
  }

  /**
   * 💰 Formatar valor total dos produtos
   */
  public getTotalProductsValue(lead: any): number {
    const products = this.extractProductsFromLead(lead);
    return products.reduce((total, product) => {
      if (product.total) {
        // Se já for número, usar diretamente
        if (typeof product.total === 'number') {
          return total + product.total;
        }
        // Se for string, converter
        if (typeof product.total === 'string') {
          const value = parseFloat(product.total.replace(/\./g, '').replace(',', '.'));
          return total + (isNaN(value) ? 0 : value);
        }
      }
      return total;
    }, 0);
  }

  /**
   * 🔧 Formatar valor total dos serviços
   */
  public getTotalServicesValue(lead: any): number {
    const services = this.extractServicesFromLead(lead);
    return services.reduce((total, service) => {
      if (service.total) {
        // Se já for número, usar diretamente
        if (typeof service.total === 'number') {
          return total + service.total;
        }
        // Se for string, converter
        if (typeof service.total === 'string') {
          const value = parseFloat(service.total.replace(/\./g, '').replace(',', '.'));
          return total + (isNaN(value) ? 0 : value);
        }
      }
      return total;
    }, 0);
  }

  /**
   * 📊 Obter resumo de vendas do lead
   */
  public getLeadSummary(lead: any): string {
    const products = this.extractProductsFromLead(lead);
    const services = this.extractServicesFromLead(lead);

    const parts = [];

    if (products.length > 0) {
      parts.push(`${products.length} produto${products.length > 1 ? 's' : ''}`);
    }

    if (services.length > 0) {
      parts.push(`${services.length} serviço${services.length > 1 ? 's' : ''}`);
    }

    if (this.hasServiceOrder(lead)) {
      const orderData = this.extractServiceOrderData(lead);
      if (orderData?.serviceOrderCode) {
        parts.push(`OS #${orderData.serviceOrderCode}`);
      }
    }

    return parts.join(' • ') || 'Sem itens';
  }

  /**
   * 📊 Obter estatísticas dos leads
   */
  public getLeadsStats(): any {
    const stats = {
      total: this.leads.length,
      withProducts: 0,
      withServices: 0,
      withOrders: 0,
      pending: 0,
      concluded: 0,
      totalValue: 0
    };

    this.leads.forEach(lead => {

      if (this.extractProductsFromLead(lead).length > 0) stats.withProducts++;
      if (this.extractServicesFromLead(lead).length > 0 || this.hasServiceOrder(lead)) stats.withServices++;
      if (this.hasServiceOrder(lead)) stats.withOrders++;

      // CORRIGIDO: Não contar cancelados como pendentes
      if (lead.status !== 'canceled' && lead.status !== 'lost') {
        if (lead.notes && lead.notes.includes('VENDA PENDENTE') || lead.status === 'negotiation') {
          stats.pending++;
        }
      }

      if (lead.notes && lead.notes.includes('VENDA CONCLUÍDA') || lead.status === 'closed') {
        stats.concluded++;
      }

      stats.totalValue += lead.value || 0;
    });

    return stats;
  }
}