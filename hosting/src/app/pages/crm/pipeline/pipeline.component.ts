// Arquivo: pipeline.component.ts
// Localização: src/app/pages/crm/pipeline/pipeline.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

// Serviços
import { CrmService } from '../crm.service';
import { AlertService } from '@shared/services/alert.service';

// 🔧 NOTA IMPORTANTE:
// Se você receber erro de tipo sobre 'cancelled' não ser válido,
// certifique-se de substituir TODO o arquivo crm.service.ts
// pelo arquivo completo fornecido anteriormente.
// O status 'cancelled' precisa estar na interface ICRMLead.

@Component({
  selector: 'app-pipeline',
  templateUrl: './pipeline.component.html',
  styleUrls: ['./pipeline.component.scss']
})
export class PipelineComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  // Dados
  public leads: any[] = [];
  public loading = true;

  // 🆕 ADICIONADA COLUNA DE CANCELADOS
  // Colunas do Pipeline
  public pipelineColumns = [
    {
      id: 'new',
      title: 'Novos Leads',
      color: '#667eea',
      leads: [],
      value: 0
    },
    {
      id: 'contacted',
      title: 'Contactados',
      color: '#00b8d9',
      leads: [],
      value: 0
    },
    {
      id: 'qualified',
      title: 'Qualificados',
      color: '#ffab00',
      leads: [],
      value: 0
    },
    {
      id: 'negotiation',
      title: 'Em Negociação',
      color: '#48bb78',
      leads: [],
      value: 0
    },
    {
      id: 'closed',
      title: 'Fechados',
      color: '#38b2ac',
      leads: [],
      value: 0
    },
    // 🆕 NOVA COLUNA DE CANCELADOS
    {
      id: 'cancelled',
      title: 'Cancelados',
      color: '#e53e3e', // Vermelho para indicar cancelamento
      leads: [],
      value: 0
    }
  ];

  // Totais (com novo total de cancelados)
  public totals = {
    leads: 0,
    value: 0,
    conversion: 0,
    cancelled: 0, // 🆕 Total de cancelados
    cancelledValue: 0 // 🆕 Valor total perdido
  };

  // Modal de detalhes
  public showDetailsModal = false;
  public selectedLead: any = null;

  // 🆕 Modal de cancelamento
  public showCancelModal = false;
  public leadToCancel: any = null;
  public cancelReason = {
    type: '',
    description: '',
    canRecover: false
  };

  // 🆕 Opções de motivos de cancelamento
  public cancelReasons = [
    { value: 'price', label: 'Preço muito alto', icon: 'trending-up-outline' },
    { value: 'competitor', label: 'Escolheu concorrente', icon: 'people-outline' },
    { value: 'no_need', label: 'Não precisa mais', icon: 'close-circle-outline' },
    { value: 'no_budget', label: 'Sem orçamento', icon: 'wallet-outline' },
    { value: 'bad_timing', label: 'Momento inadequado', icon: 'clock-outline' },
    { value: 'poor_service', label: 'Atendimento ruim', icon: 'thumbs-down-outline' },
    { value: 'other', label: 'Outro motivo', icon: 'help-circle-outline' }
  ];

  constructor(
    private crmService: CrmService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.loadLeads();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Carregar leads
  private loadLeads(): void {
    this.crmService.leads$
      .pipe(takeUntil(this.destroy$))
      .subscribe(leads => {
        this.leads = leads;
        this.organizePipeline();
        this.calculateTotals();
        this.loading = false;
      });

    this.crmService.getLeads();
  }

  // Organizar leads nas colunas
  private organizePipeline(): void {
    // Limpar colunas
    this.pipelineColumns.forEach(column => {
      column.leads = [];
      column.value = 0;
    });

    // Distribuir leads nas colunas
    this.leads.forEach(lead => {
      // 🔧 DEBUG: Ver o status de cada lead
      console.log('Lead:', lead.name, 'Status:', lead.status);

      // 🔧 CORREÇÃO: Verificar variações do status cancelado
      let columnId = lead.status;

      // Normalizar status para corresponder às colunas
      if (lead.status === 'canceled' || lead.status === 'CANCELED' || lead.status === 'CANCELLED') {
        columnId = 'cancelled';
      }

      const column = this.pipelineColumns.find(col => col.id === columnId);
      if (column) {
        column.leads.push(lead);
        column.value += lead.value || 0;
      } else {
        console.warn('⚠️ Coluna não encontrada para status:', lead.status);
      }
    });

    // 🔧 DEBUG: Ver o resultado final
    this.pipelineColumns.forEach(col => {
      console.log(`Coluna ${col.title}: ${col.leads.length} leads, R$ ${col.value}`);
    });
  }

  // Calcular totais (atualizado com cancelados)
  private calculateTotals(): void {
    this.totals.leads = this.leads.length;
    this.totals.value = this.leads.reduce((sum, lead) => sum + (lead.value || 0), 0);

    const closedLeads = this.leads.filter(lead => lead.status === 'closed').length;
    this.totals.conversion = this.totals.leads > 0
      ? Math.round((closedLeads / this.totals.leads) * 100)
      : 0;

    // 🆕 Calcular totais de cancelados
    // ✅ CORRETO - verificar todas as variações
    const cancelledLeads = this.leads.filter(lead =>
      lead.status === 'cancelled' ||
      lead.status === 'canceled' ||
      lead.status === 'CANCELED' ||
      lead.status === 'CANCELLED'
    );
    this.totals.cancelled = cancelledLeads.length;
    this.totals.cancelledValue = cancelledLeads.reduce((sum, lead) => sum + (lead.value || 0), 0);
  }

  // Drag and Drop (atualizado)
  public drop(event: CdkDragDrop<any[]>, targetStatus: string): void {
    if (event.previousContainer === event.container) {
      // Movendo dentro da mesma coluna
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Movendo entre colunas
      const lead = event.previousContainer.data[event.previousIndex];

      // 🆕 Se movendo PARA cancelados, abrir modal
      if (targetStatus === 'cancelled') {
        this.leadToCancel = lead;
        this.showCancelModal = true;
        return; // Não mover ainda, esperar confirmação
      }

      // 🆕 Se movendo DE cancelados para outra coluna
      if (lead.status === 'cancelled') {
        // Perguntar se quer reativar o lead
        if (!confirm('Deseja reativar este lead cancelado?')) {
          return;
        }
        // Limpar informações de cancelamento
        lead.cancelReason = null;
        lead.cancelDate = null;
        lead.previousStatus = null;
      }

      // Atualizar status do lead localmente
      lead.status = targetStatus;

      // Mover item
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Salvar mudança
      this.updateLeadStatus(lead, targetStatus);

      // Recalcular valores
      this.organizePipeline();
      this.calculateTotals();
    }
  }

  // 🆕 Confirmar cancelamento
  public confirmCancel(): void {
    if (!this.cancelReason.type) {
      this.alertService.alert('Por favor, selecione um motivo', 'warning');
      return;
    }

    const lead = this.leadToCancel;

    // Guardar status anterior para possível recuperação
    lead.previousStatus = lead.status;
    lead.status = 'cancelled';
    lead.cancelReason = this.cancelReason;
    lead.cancelDate = new Date();

    // Encontrar coluna anterior e nova
    const previousColumn = this.pipelineColumns.find(col => col.id === lead.previousStatus);
    const cancelColumn = this.pipelineColumns.find(col => col.id === 'cancelled');

    if (previousColumn && cancelColumn) {
      // Remover da coluna anterior
      const index = previousColumn.leads.findIndex(l => l._id === lead._id);
      if (index > -1) {
        previousColumn.leads.splice(index, 1);
      }

      // Adicionar na coluna de cancelados
      cancelColumn.leads.unshift(lead); // Adicionar no topo
    }

    // Salvar no backend (usando any para evitar conflito de tipos)
    const updates: any = {
      status: 'cancelled',
      cancelReason: lead.cancelReason,
      cancelDate: lead.cancelDate,
      previousStatus: lead.previousStatus
    };

    this.crmService.updateLead(lead._id, updates);

    // Recalcular
    this.organizePipeline();
    this.calculateTotals();

    // Fechar modal e limpar
    this.showCancelModal = false;
    this.leadToCancel = null;
    this.cancelReason = {
      type: '',
      description: '',
      canRecover: false
    };

    // Notificar
    this.alertService.alert(
      `Lead "${lead.name}" foi cancelado. Motivo: ${this.getCancelReasonLabel(this.cancelReason.type)}`,
      'warning'
    );
  }

  // 🆕 Obter label do motivo de cancelamento
  private getCancelReasonLabel(value: string): string {
    const reason = this.cancelReasons.find(r => r.value === value);
    return reason ? reason.label : value;
  }

  // Atualizar status do lead (atualizado)
  private updateLeadStatus(lead: any, newStatus: string): void {
    // 🔧 CORREÇÃO TEMPORÁRIA: Usar 'any' para evitar conflito de tipos
    // enquanto o crm.service.ts não é atualizado
    const updates: any = {
      status: newStatus,
      ...(newStatus === 'cancelled' ? {
        cancelReason: lead.cancelReason,
        cancelDate: lead.cancelDate,
        previousStatus: lead.previousStatus
      } : {})
    };

    // Salvar no backend
    this.crmService.updateLead(lead._id, updates).then(() => {
      if (
        newStatus === 'closed' &&
        (!lead.saleIds || lead.saleIds.length === 0)
      ) {
        // Registrar venda e pós-venda apenas se ainda não houver venda
        this.crmService.closeLeadAsSale(lead);
      }
    });

    // Notificação apropriada
    if (newStatus === 'closed') {
      this.celebrate();
      this.alertService.alert(
        `🎉 Parabéns! Lead "${lead.name}" foi fechado com sucesso!`,
        'success'
      );
    } else if (newStatus !== 'cancelled') {
      this.alertService.alert(
        `Lead "${lead.name}" movido para ${this.getStatusName(newStatus)}`,
        'success'
      );
    }
  }

  // Obter nome do status
  private getStatusName(status: string): string {
    const column = this.pipelineColumns.find(col => col.id === status);
    return column ? column.title : status;
  }

  // Abrir detalhes do lead
  public openLeadDetails(lead: any): void {
    this.selectedLead = lead;
    this.showDetailsModal = true;
  }

  // Formatar moeda
  public formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  }

  // Obter iniciais do nome
  public getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  // Celebração quando fecha negócio
  private celebrate(): void {
    // TODO: Adicionar confetti ou animação
    console.log('🎉 Negócio fechado!');
  }

  // Obter lista de IDs para o drag and drop
  public getConnectedList(): string[] {
    return this.pipelineColumns.map(col => `list-${col.id}`);
  }
}