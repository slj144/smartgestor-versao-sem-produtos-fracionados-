/**
 * =====================================================
 * COMPONENTE: ChartComponent (Chart.js Moderno)
 * CAMINHO: src/app/@shared/components/chart/chart.component.ts
 * =====================================================
 *
 * DESCRIÇÃO:
 * Componente moderno para gráficos usando Chart.js v4
 * Substitui NgxCharts com melhor performance e UX
 *
 * TIPOS SUPORTADOS:
 * - pie: Gráfico de pizza com gradientes
 * - doughnut: Donut moderno
 * - bar: Barras animadas
 * - line: Linhas suaves
 *
 * FEATURES:
 * ✅ Animações suaves
 * ✅ Hover effects
 * ✅ Responsivo
 * ✅ Gradientes modernos
 * ✅ Performance otimizada
 * =====================================================
 */

import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';

import {
  Chart,
  ChartConfiguration,
  ChartType,
  registerables,
  ChartData,
  TooltipItem
} from 'chart.js';

// Registrar todos os componentes do Chart.js
Chart.register(...registerables);

export interface ChartDataItem {
  name: string;
  value: number;
  percentage?: number;
  color?: string;
}

@Component({
  selector: 'smart-chart',
  template: `
    <div class="chart-container" [style.height]="height || '300px'">
      <canvas
        #chartCanvas>
      </canvas>

      <!-- Loading overlay -->
      <div class="chart-loading" *ngIf="loading">
        <div class="spinner"></div>
        <span>Carregando gráfico...</span>
      </div>

      <!-- No data overlay -->
      <div class="chart-no-data" *ngIf="!loading && (!data || data.length === 0)">
        <span>📊</span>
        <span>Nenhum dado disponível</span>
      </div>
    </div>
  `,
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  // ✅ INPUTS
  @Input() type: ChartType = 'pie';
  @Input() data: ChartDataItem[] = [];
  @Input() loading: boolean = false;
  @Input() width?: string;
  @Input() height?: string;
  @Input() gradient: boolean = true;
  @Input() scheme: { domain: string[] } = {
    domain: [
      '#667eea',  // Azul roxo
      '#10b981',  // Verde esmeralda
      '#ef4444',  // Vermelho moderno
      '#8b5cf6',  // Roxo
      '#f59e0b',  // Amber
      '#06b6d4'   // Cyan
    ]
  };

  // ✅ OUTPUTS
  @Output() chartClick = new EventEmitter<any>();
  @Output() chartHover = new EventEmitter<any>();

  // ✅ PROPRIEDADES
  private chart?: Chart;
  private resizeObserver?: ResizeObserver;

  constructor() {}

  ngOnInit(): void {
    // Inicialização aqui se necessário
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !changes['data'].firstChange) {
      if (this.chartCanvas?.nativeElement) {
        this.createChart();
      }
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.createChart();
      this.setupResizeObserver();
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroyChart();
    this.resizeObserver?.disconnect();
  }

  /**
   * ✅ CRIAR GRÁFICO
   */
  private createChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    if (!this.data || this.data.length === 0) {
      return;
    }

    // Verifica se todos os valores são zero - cria gráfico cinza
    const allZero = this.data.every(item => item.value === 0);
    if (allZero) {
      this.createEmptyChart();
      return;
    }

    const canvas = this.chartCanvas?.nativeElement;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const chartData = this.buildChartData();
    const config = this.buildChartConfig(chartData);

    try {
      this.chart = new Chart(ctx, config);
    } catch (error) {
      console.error('❌ Erro ao criar gráfico:', error);
    }
  }

  /**
   * ✅ CONSTRUIR DADOS DO GRÁFICO
   */
  private buildChartData(): ChartData {
    const labels = this.data.map(item => item.name);
    const values = this.data.map(item => item.value);
    const colors = this.generateColors();

    return {
      labels,
      datasets: [{
        data: values,
        backgroundColor: this.gradient ? this.createGradients(colors) : colors,
        borderColor: colors.map(color => this.adjustBrightness(color, -20)),
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverBorderColor: '#ffffff'
      }]
    };
  }

  /**
   * ✅ CONSTRUIR CONFIGURAÇÃO DO GRÁFICO
   */
  private buildChartConfig(chartData: ChartData): ChartConfiguration {
    const isBarChart = this.type === 'bar';

    return {
      type: this.type,
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: isBarChart ? {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(108, 114, 147, 0.1)'
            },
            ticks: {
              color: '#6c7293',
              font: {
                size: 11,
                family: 'Inter, sans-serif'
              },
              callback: (value) => {
                return 'R$ ' + Number(value).toLocaleString('pt-BR', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                });
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#6c7293',
              font: {
                size: 12,
                family: 'Inter, sans-serif'
              }
            }
          }
        } : undefined,
        plugins: {
          legend: {
            display: !isBarChart, // Esconde legenda em gráficos de barra
            position: 'bottom',
            labels: {
              padding: 15,
              usePointStyle: true,
              font: {
                size: 11,
                family: 'Inter, sans-serif'
              },
              generateLabels: (chart) => {
                const data = chart.data;
                if (data.labels && data.datasets && data.datasets[0]) {
                  return data.labels.map((label, i) => {
                    const dataset = data.datasets[0];
                    const value = dataset.data[i] as number;
                    const total = (dataset.data as number[]).reduce((a, b) => a + b, 0);
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';

                    return {
                      text: `${label} (${percentage}%)`,
                      fillStyle: Array.isArray(dataset.backgroundColor)
                        ? dataset.backgroundColor[i]
                        : dataset.backgroundColor,
                      index: i
                    };
                  });
                }
                return [];
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(26, 26, 46, 0.95)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: 'rgba(102, 126, 234, 0.3)',
            borderWidth: 1,
            cornerRadius: 8,
            padding: 12,
            titleFont: {
              size: 13,
              weight: 'bold'
            },
            bodyFont: {
              size: 12
            },
            callbacks: {
              label: (context: TooltipItem<any>) => {
                const label = context.label || '';
                let value: number;

                if (isBarChart) {
                  value = context.parsed.y;
                } else {
                  value = context.parsed || 0;
                }

                return `${label}: R$ ${value.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}`;
              }
            }
          }
        },
        animation: {
          duration: 1200,
          easing: 'easeInOutQuart'
        },
        hover: {
          mode: 'nearest',
          intersect: false
        },
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const element = elements[0];
            const index = element.index;
            this.chartClick.emit({
              index,
              data: this.data[index],
              event
            });
          }
        },
        onHover: (event, elements) => {
          const canvas = this.chartCanvas.nativeElement;
          canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';

          if (elements.length > 0) {
            const element = elements[0];
            const index = element.index;
            this.chartHover.emit({
              index,
              data: this.data[index],
              event
            });
          }
        }
      }
    };
  }

  /**
   * ✅ GERAR CORES
   */
  private generateColors(): string[] {
    const colors: string[] = [];
    const domain = this.scheme.domain;

    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i].color) {
        colors.push(this.data[i].color!);
      } else {
        colors.push(domain[i % domain.length]);
      }
    }

    return colors;
  }

  /**
   * ✅ CRIAR GRADIENTES
   */
  private createGradients(colors: string[]): CanvasGradient[] {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return colors as any;

    return colors.map(color => {
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 200);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, this.adjustBrightness(color, -30));
      return gradient;
    });
  }

  /**
   * ✅ AJUSTAR BRILHO DA COR
   */
  private adjustBrightness(color: string, amount: number): string {
    // Remove # se presente
    color = color.replace(/^#/, '');

    // Converte para RGB
    const num = parseInt(color, 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));

    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }

  /**
   * ✅ SETUP RESIZE OBSERVER
   */
  private setupResizeObserver(): void {
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.chart) {
          this.chart.resize();
        }
      });

      this.resizeObserver.observe(this.chartCanvas.nativeElement.parentElement!);
    }
  }

  /**
   * ✅ DESTRUIR GRÁFICO
   */
  private destroyChart(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = undefined;
    }
  }

  /**
   * ✅ ATUALIZAR DADOS
   */
  public updateData(newData: ChartDataItem[]): void {
    this.data = newData;
    this.createChart();
  }

  /**
   * ✅ REDIMENSIONAR
   */
  public resize(): void {
    if (this.chart) {
      this.chart.resize();
    }
  }

  /**
   * ✅ CRIAR GRÁFICO VAZIO (CINZA)
   */
  private createEmptyChart(): void {
    const canvas = this.chartCanvas?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const emptyData: ChartData = {
      labels: ['Sem movimentação'],
      datasets: [{
        data: [1], // Valor único para criar a pizza
        backgroundColor: ['#e5e7eb'], // Cinza claro
        borderColor: ['#d1d5db'], // Cinza um pouco mais escuro
        borderWidth: 2,
        hoverBorderWidth: 2,
        hoverBorderColor: '#9ca3af'
      }]
    };

    const config: ChartConfiguration = {
      type: this.type,
      data: emptyData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false // Esconde a legenda para gráfico vazio
          },
          tooltip: {
            enabled: false // Desabilita tooltip para gráfico vazio
          }
        },
        animation: {
          duration: 800,
          easing: 'easeInOutQuart'
        }
      }
    };

    try {
      this.chart = new Chart(ctx, config);
    } catch (error) {
      console.error('❌ Erro ao criar gráfico vazio:', error);
    }
  }

}