// Arquivo: cancellation-report.component.ts
// Localização: src/app/pages/crm/reports/cancellation-report.component.ts
// 🆕 NOVO COMPONENTE para análise de cancelamentos

import { Component, OnInit } from '@angular/core';
import { CrmService } from '../crm.service';

@Component({
    selector: 'app-cancellation-report',
    template: `
    <div class="cancellation-report">
      <h3>Relatório de Cancelamentos</h3>
      
      <!-- Resumo Geral -->
      <div class="report-summary">
        <div class="summary-card">
          <h4>Total Cancelado</h4>
          <p class="value">{{ formatCurrency(totalCancelled) }}</p>
          <small>{{ cancelledCount }} leads</small>
        </div>
        
        <div class="summary-card">
          <h4>Taxa de Cancelamento</h4>
          <p class="value">{{ cancellationRate }}%</p>
          <small>do total de leads</small>
        </div>
        
        <div class="summary-card recoverable">
          <h4>Recuperáveis</h4>
          <p class="value">{{ recoverableCount }}</p>
          <small>{{ formatCurrency(recoverableValue) }}</small>
        </div>
      </div>
      
      <!-- Gráfico por Motivo -->
      <div class="reason-chart">
        <h4>Principais Motivos de Cancelamento</h4>
        <div class="reason-item" *ngFor="let reason of reasonStats">
          <div class="reason-info">
            <icon [name]="reason.icon" pack="eva"></icon>
            <span>{{ reason.label }}</span>
            <strong>({{ reason.count }})</strong>
          </div>
          <div class="reason-bar">
            <div class="bar-fill" [style.width.%]="reason.percentage"></div>
          </div>
          <span class="reason-value">{{ formatCurrency(reason.value) }}</span>
        </div>
      </div>
      
      <!-- Lista de Cancelados Recuperáveis -->
      <div class="recoverable-list" *ngIf="recoverableLeads.length > 0">
        <h4>Leads Recuperáveis (Prioridade)</h4>
        <table class="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Valor</th>
              <th>Motivo</th>
              <th>Cancelado há</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let lead of recoverableLeads">
              <td>{{ lead.name }}</td>
              <td>{{ formatCurrency(lead.value) }}</td>
              <td>{{ getCancelReasonLabel(lead.cancelReason.type) }}</td>
              <td>{{ getDaysAgo(lead.cancelDate) }} dias</td>
              <td>
                <button class="btn btn-sm btn-success" 
                        (click)="attemptRecovery(lead)">
                  Tentar Recuperar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
    styles: [`
    .cancellation-report {
      padding: 20px;
      
      .report-summary {
        display: flex;
        gap: 20px;
        margin-bottom: 30px;
        
        .summary-card {
          flex: 1;
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          
          h4 {
            margin: 0 0 10px;
            color: #666;
            font-size: 14px;
          }
          
          .value {
            font-size: 28px;
            font-weight: 700;
            color: #e53e3e;
            margin: 0;
          }
          
          &.recoverable .value {
            color: #48bb78;
          }
          
          small {
            color: #999;
            font-size: 12px;
          }
        }
      }
      
      .reason-chart {
        background: white;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 30px;
        
        h4 {
          margin-bottom: 20px;
        }
        
        .reason-item {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
          
          .reason-info {
            width: 200px;
            display: flex;
            align-items: center;
            gap: 8px;
            
            icon {
              color: #666;
            }
          }
          
          .reason-bar {
            flex: 1;
            height: 24px;
            background: #f0f0f0;
            border-radius: 4px;
            margin: 0 15px;
            overflow: hidden;
            
            .bar-fill {
              height: 100%;
              background: #e53e3e;
              transition: width 0.3s ease;
            }
          }
          
          .reason-value {
            font-weight: 600;
            color: #333;
            min-width: 100px;
            text-align: right;
          }
        }
      }
      
      .recoverable-list {
        background: white;
        padding: 20px;
        border-radius: 8px;
        
        h4 {
          margin-bottom: 20px;
          color: #48bb78;
        }
      }
    }
  `]
})
export class CancellationReportComponent implements OnInit {
    // Dados do relatório
    public totalCancelled = 0;
    public cancelledCount = 0;
    public cancellationRate = 0;
    public recoverableCount = 0;
    public recoverableValue = 0;
    public recoverableLeads: any[] = [];

    // Estatísticas por motivo
    public reasonStats: any[] = [];

    // Mapeamento de motivos
    private reasonMap = {
        price: { label: 'Preço muito alto', icon: 'trending-up-outline' },
        competitor: { label: 'Escolheu concorrente', icon: 'people-outline' },
        no_need: { label: 'Não precisa mais', icon: 'close-circle-outline' },
        no_budget: { label: 'Sem orçamento', icon: 'wallet-outline' },
        bad_timing: { label: 'Momento inadequado', icon: 'clock-outline' },
        poor_service: { label: 'Atendimento ruim', icon: 'thumbs-down-outline' },
        other: { label: 'Outro motivo', icon: 'help-circle-outline' }
    };

    constructor(private crmService: CrmService) { }

    ngOnInit(): void {
        this.loadCancellationData();
    }

    // Carregar dados de cancelamento
    private loadCancellationData(): void {
        this.crmService.leads$.subscribe(leads => {
            // Filtrar apenas cancelados
            const cancelled = leads.filter(lead => lead.status === 'cancelled');
            const total = leads.length;

            // Calcular totais
            this.cancelledCount = cancelled.length;
            this.totalCancelled = cancelled.reduce((sum, lead) => sum + (lead.value || 0), 0);
            this.cancellationRate = total > 0 ? Math.round((this.cancelledCount / total) * 100) : 0;

            // Filtrar recuperáveis
            this.recoverableLeads = cancelled
                .filter(lead => lead.cancelReason?.canRecover)
                .sort((a, b) => (b.value || 0) - (a.value || 0)); // Ordenar por valor

            this.recoverableCount = this.recoverableLeads.length;
            this.recoverableValue = this.recoverableLeads.reduce((sum, lead) => sum + (lead.value || 0), 0);

            // Calcular estatísticas por motivo
            this.calculateReasonStats(cancelled);
        });
    }

    // Calcular estatísticas por motivo
    private calculateReasonStats(cancelledLeads: any[]): void {
        const reasonCounts: any = {};

        // Contar por motivo
        cancelledLeads.forEach(lead => {
            const reason = lead.cancelReason?.type || 'other';
            if (!reasonCounts[reason]) {
                reasonCounts[reason] = { count: 0, value: 0 };
            }
            reasonCounts[reason].count++;
            reasonCounts[reason].value += lead.value || 0;
        });

        // Converter para array de estatísticas
        this.reasonStats = Object.entries(reasonCounts)
            .map(([reason, data]: [string, any]) => ({
                type: reason,
                label: this.reasonMap[reason]?.label || reason,
                icon: this.reasonMap[reason]?.icon || 'help-circle-outline',
                count: data.count,
                value: data.value,
                percentage: (data.count / cancelledLeads.length) * 100
            }))
            .sort((a, b) => b.count - a.count); // Ordenar por quantidade
    }

    // Tentar recuperar lead
    public attemptRecovery(lead: any): void {
        // Implementar lógica de recuperação
        console.log('Tentando recuperar lead:', lead);

        // Exemplo: criar atividade de recuperação
        const recoveryActivity = {
            title: `Tentativa de recuperação - ${lead.name}`,
            type: 'call',
            status: 'pending',
            priority: 'high',
            description: `Lead cancelado por: ${this.getCancelReasonLabel(lead.cancelReason.type)}. Tentar recuperar com oferta especial.`,
            scheduledDate: new Date(),
            leadId: lead._id
        };

        // TODO: Implementar criação de atividade
        // this.crmService.createActivity(recoveryActivity);
    }

    // Helpers
    public formatCurrency(value: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    }

    public getCancelReasonLabel(type: string): string {
        return this.reasonMap[type]?.label || type;
    }

    public getDaysAgo(date: any): number {
        if (!date) return 0;
        const cancelDate = new Date(date);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - cancelDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
}