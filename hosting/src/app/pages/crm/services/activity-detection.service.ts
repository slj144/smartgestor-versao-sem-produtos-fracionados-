// =====================================================
// 🤖 SERVIÇO DE DETECÇÃO INTELIGENTE DE ATIVIDADES
// ARQUIVO: activity-detection.service.ts
// CAMINHO: src/app/pages/crm/services/activity-detection.service.ts
// =====================================================

import { Injectable } from '@angular/core';

export interface IDetectionResult {
    category: string;
    businessType: 'celular' | 'oficina' | 'varejo' | 'geral';
    isService: boolean;
    isProduct: boolean;
    confidence: number;
    suggestedTags: string[];
}

@Injectable({
    providedIn: 'root'
})
export class ActivityDetectionService {

    // =====================================================
    // 📋 PALAVRAS-CHAVE POR CATEGORIA
    // =====================================================

    // Palavras que indicam SERVIÇO
    private serviceKeywords = {
        geral: [
            'manutenção', 'reparo', 'conserto', 'instalação', 'configuração',
            'serviço', 'mão de obra', 'atendimento', 'suporte', 'assistência',
            'revisão', 'limpeza', 'ajuste', 'regulagem', 'diagnóstico'
        ],
        celular: [
            'troca de tela', 'troca de bateria', 'troca de display',
            'desbloqueio', 'formatação', 'atualização', 'backup',
            'reparo placa', 'solda', 'conector de carga', 'botão',
            'câmera', 'alto falante', 'microfone', 'sensor'
        ],
        oficina: [
            'troca de óleo', 'alinhamento', 'balanceamento', 'revisão',
            'freio', 'suspensão', 'embreagem', 'motor', 'injeção',
            'escapamento', 'radiador', 'ar condicionado', 'elétrica',
            'funilaria', 'pintura', 'polimento', 'lavagem'
        ],
        outros: [
            'corte de cabelo', 'manicure', 'pedicure', 'massagem',
            'consulta', 'exame', 'tratamento', 'terapia', 'aula',
            'curso', 'treinamento', 'consultoria', 'projeto'
        ]
    };

    // Palavras que indicam PRODUTO
    private productKeywords = {
        geral: [
            'produto', 'item', 'peça', 'equipamento', 'aparelho',
            'dispositivo', 'acessório', 'material', 'mercadoria'
        ],
        celular: [
            'celular', 'smartphone', 'iphone', 'samsung', 'xiaomi',
            'motorola', 'lg', 'nokia', 'capinha', 'película',
            'carregador', 'fone', 'cabo', 'adaptador', 'power bank',
            'suporte veicular', 'caixa de som', 'smartwatch'
        ],
        oficina: [
            'pneu', 'bateria', 'filtro', 'óleo', 'fluido', 'pastilha',
            'disco', 'correia', 'vela', 'lâmpada', 'fusível',
            'amortecedor', 'mola', 'rolamento', 'junta', 'retentor'
        ],
        varejo: [
            'roupa', 'calçado', 'bolsa', 'relógio', 'joia', 'perfume',
            'eletrônico', 'eletrodoméstico', 'móvel', 'decoração',
            'livro', 'brinquedo', 'alimento', 'bebida', 'cosmético'
        ]
    };

    // Palavras específicas de GARANTIA
    private warrantyKeywords = {
        servico: [
            'garantia do serviço', 'garantia de serviço', 'garantia mão de obra',
            'garantia do reparo', 'garantia da manutenção', 'garantia do conserto',
            'serviço em garantia', 'prazo de garantia do serviço'
        ],
        produto: [
            'garantia do produto', 'garantia de fábrica', 'garantia do fabricante',
            'garantia estendida', 'certificado de garantia', 'termo de garantia',
            'produto em garantia', 'prazo de garantia', 'garantia legal'
        ]
    };

    // =====================================================
    // 🔍 MÉTODO PRINCIPAL DE DETECÇÃO
    // =====================================================

    public detectActivityType(activity: any, businessContext?: any): IDetectionResult {
        const description = (activity.description || '').toLowerCase();
        const title = (activity.title || '').toLowerCase();
        const tags = activity.tags || [];
        const combinedText = `${title} ${description} ${tags.join(' ')}`.toLowerCase();

        console.log('🔍 Analisando atividade:', {
            title: activity.title,
            description: activity.description?.substring(0, 100)
        });

        // Detectar tipo de negócio
        const businessType = this.detectBusinessType(combinedText, businessContext);

        // Detectar se é serviço ou produto
        const serviceScore = this.calculateServiceScore(combinedText, businessType);
        const productScore = this.calculateProductScore(combinedText, businessType);

        // Detectar categoria específica
        const category = this.detectCategory(combinedText, serviceScore > productScore);

        // Gerar tags sugeridas
        const suggestedTags = this.generateSuggestedTags(combinedText, category, businessType);

        // Calcular confiança
        const confidence = Math.max(serviceScore, productScore) / 100;

        return {
            category,
            businessType,
            isService: serviceScore > productScore,
            isProduct: productScore > serviceScore,
            confidence,
            suggestedTags
        };
    }

    // =====================================================
    // 🏪 DETECTAR TIPO DE NEGÓCIO
    // =====================================================

    private detectBusinessType(text: string, context?: any): 'celular' | 'oficina' | 'varejo' | 'geral' {
        // Verificar contexto primeiro
        if (context?.businessType) {
            return context.businessType;
        }

        // Pontuação para cada tipo
        let scores = {
            celular: 0,
            oficina: 0,
            varejo: 0
        };

        // Analisar palavras-chave de produtos
        Object.entries(this.productKeywords).forEach(([type, keywords]) => {
            if (type !== 'geral') {
                keywords.forEach(keyword => {
                    if (text.includes(keyword)) {
                        scores[type] += 10;
                    }
                });
            }
        });

        // Analisar palavras-chave de serviços
        if (this.serviceKeywords.celular.some(kw => text.includes(kw))) {
            scores.celular += 15;
        }
        if (this.serviceKeywords.oficina.some(kw => text.includes(kw))) {
            scores.oficina += 15;
        }

        // Determinar tipo com maior pontuação
        const maxScore = Math.max(scores.celular, scores.oficina, scores.varejo);

        if (maxScore === 0) return 'geral';

        if (scores.celular === maxScore) return 'celular';
        if (scores.oficina === maxScore) return 'oficina';
        if (scores.varejo === maxScore) return 'varejo';

        return 'geral';
    }

    // =====================================================
    // 📊 CALCULAR PONTUAÇÃO DE SERVIÇO
    // =====================================================

    private calculateServiceScore(text: string, businessType: string): number {
        let score = 0;

        // Verificar palavras de garantia de serviço
        this.warrantyKeywords.servico.forEach(keyword => {
            if (text.includes(keyword)) {
                score += 30;
            }
        });

        // Verificar palavras gerais de serviço
        this.serviceKeywords.geral.forEach(keyword => {
            if (text.includes(keyword)) {
                score += 10;
            }
        });

        // Verificar palavras específicas do tipo de negócio
        if (businessType !== 'geral' && this.serviceKeywords[businessType]) {
            this.serviceKeywords[businessType].forEach(keyword => {
                if (text.includes(keyword)) {
                    score += 15;
                }
            });
        }

        // Verificar palavras de outros serviços
        this.serviceKeywords.outros.forEach(keyword => {
            if (text.includes(keyword)) {
                score += 8;
            }
        });

        // Indicadores fortes de serviço
        if (text.includes('mão de obra')) score += 25;
        if (text.includes('ordem de serviço') || text.includes('os ')) score += 20;
        if (text.includes('orçamento')) score += 15;
        if (text.includes('diagnóstico')) score += 15;
        if (text.includes('prazo de execução')) score += 15;

        return Math.min(score, 100);
    }

    // =====================================================
    // 📦 CALCULAR PONTUAÇÃO DE PRODUTO
    // =====================================================

    private calculateProductScore(text: string, businessType: string): number {
        let score = 0;

        // Verificar palavras de garantia de produto
        this.warrantyKeywords.produto.forEach(keyword => {
            if (text.includes(keyword)) {
                score += 30;
            }
        });

        // Verificar palavras gerais de produto
        this.productKeywords.geral.forEach(keyword => {
            if (text.includes(keyword)) {
                score += 10;
            }
        });

        // Verificar palavras específicas do tipo de negócio
        if (businessType !== 'geral' && this.productKeywords[businessType]) {
            this.productKeywords[businessType].forEach(keyword => {
                if (text.includes(keyword)) {
                    score += 15;
                }
            });
        }

        // Indicadores fortes de produto
        if (text.includes('nota fiscal')) score += 20;
        if (text.includes('número de série')) score += 20;
        if (text.includes('código de barras')) score += 15;
        if (text.includes('modelo')) score += 10;
        if (text.includes('marca')) score += 10;
        if (text.includes('embalagem')) score += 10;

        return Math.min(score, 100);
    }

    // =====================================================
    // 🏷️ DETECTAR CATEGORIA
    // =====================================================

    private detectCategory(text: string, isService: boolean): string {
        // GARANTIAS
        if (text.includes('garantia')) {
            if (isService) {
                return 'garantia-servico';
            } else {
                return 'garantia-produto';
            }
        }

        // PÓS-VENDA
        if (text.includes('pós-venda') || text.includes('pos-venda') ||
            text.includes('pós venda') || text.includes('pos venda') ||
            text.includes('satisfação') || text.includes('feedback')) {
            if (isService) {
                return 'pos-venda-servico';
            } else {
                return 'pos-venda-produto';
            }
        }

        // FOLLOW-UP
        if (text.includes('follow-up') || text.includes('follow up') ||
            text.includes('retornar contato') || text.includes('venda pendente') ||
            text.includes('negociação') || text.includes('proposta')) {
            return 'follow-up';
        }

        // RECUPERAÇÃO
        if (text.includes('recuperação') || text.includes('recuperacao') ||
            text.includes('venda cancelada') || text.includes('cliente perdido') ||
            text.includes('win back') || text.includes('reconquistar')) {
            return 'recuperacao';
        }

        // ORDEM DE SERVIÇO
        if (text.includes('ordem de serviço') || text.includes('os ') ||
            text.includes('orçamento') || text.includes('diagnóstico')) {
            return 'ordem-servico';
        }

        // AGENDAMENTO
        if (text.includes('agendar') || text.includes('agendamento') ||
            text.includes('marcar') || text.includes('horário') ||
            text.includes('data disponível')) {
            return 'agendamento';
        }

        // COBRANÇA
        if (text.includes('cobrança') || text.includes('pagamento') ||
            text.includes('débito') || text.includes('fatura') ||
            text.includes('boleto') || text.includes('vencimento')) {
            return 'cobranca';
        }

        // PROMOÇÃO
        if (text.includes('promoção') || text.includes('promocao') ||
            text.includes('oferta') || text.includes('desconto') ||
            text.includes('queima') || text.includes('liquidação')) {
            return 'promocao';
        }

        // ANIVERSÁRIO
        if (text.includes('aniversário') || text.includes('aniversario') ||
            text.includes('parabéns') || text.includes('feliz ani')) {
            return 'aniversario';
        }

        // RELACIONAMENTO
        if (text.includes('relacionamento') || text.includes('fidelidade') ||
            text.includes('cliente vip') || text.includes('programa de pontos')) {
            return 'relacionamento';
        }

        // GENÉRICO
        return 'generico';
    }

    // =====================================================
    // 🏷️ GERAR TAGS SUGERIDAS
    // =====================================================

    private generateSuggestedTags(text: string, category: string, businessType: string): string[] {
        const tags = new Set<string>();

        // Adicionar categoria
        tags.add(category);

        // Adicionar tipo de negócio se não for geral
        if (businessType !== 'geral') {
            tags.add(businessType);
        }

        // Tags baseadas em palavras-chave encontradas
        if (text.includes('urgente')) tags.add('urgente');
        if (text.includes('importante')) tags.add('importante');
        if (text.includes('retorno')) tags.add('retorno');
        if (text.includes('novo')) tags.add('novo-cliente');
        if (text.includes('vip')) tags.add('cliente-vip');
        if (text.includes('reclamação')) tags.add('reclamacao');
        if (text.includes('elogio')) tags.add('elogio');

        // Tags específicas por categoria
        switch (category) {
            case 'garantia-servico':
            case 'garantia-produto':
                tags.add('garantia');
                if (text.includes('acionamento')) tags.add('acionamento-garantia');
                break;

            case 'pos-venda-servico':
            case 'pos-venda-produto':
                tags.add('pos-venda');
                if (text.includes('48h') || text.includes('48 horas')) tags.add('pos-venda-48h');
                break;

            case 'ordem-servico':
                if (text.includes('aberta')) tags.add('os-aberta');
                if (text.includes('finalizada')) tags.add('os-finalizada');
                if (text.includes('aprovação')) tags.add('os-aprovacao');
                break;
        }

        return Array.from(tags);
    }

    // =====================================================
    // 🔮 SUGERIR PRÓXIMA AÇÃO
    // =====================================================

    public suggestNextAction(detectionResult: IDetectionResult): string {
        const { category, isService, businessType } = detectionResult;

        // Sugestões por categoria
        const suggestions = {
            'garantia-servico': 'Verificar prazo de garantia e agendar revisão do serviço',
            'garantia-produto': 'Confirmar número de série e validade da garantia',
            'pos-venda-servico': 'Fazer contato em 48h para verificar satisfação com o serviço',
            'pos-venda-produto': 'Enviar pesquisa de satisfação e oferecer suporte',
            'follow-up': 'Retomar negociação com oferta especial',
            'recuperacao': 'Oferecer condições especiais para reconquistar cliente',
            'ordem-servico': 'Acompanhar status e manter cliente informado',
            'agendamento': 'Confirmar horário e enviar lembrete',
            'cobranca': 'Enviar lembrete amigável de pagamento',
            'promocao': 'Divulgar oferta com prazo limitado',
            'aniversario': 'Enviar felicitações com benefício especial',
            'relacionamento': 'Fazer check-in periódico com cliente',
            'generico': 'Fazer contato personalizado conforme necessidade'
        };

        return suggestions[category] || suggestions['generico'];
    }
}