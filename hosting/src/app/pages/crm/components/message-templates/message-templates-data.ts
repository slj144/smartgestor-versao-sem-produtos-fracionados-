// =====================================================
// 📱 TEMPLATES DE WHATSAPP INTELIGENTES POR TIPO DE COMÉRCIO
// ARQUIVO: message-templates-data.ts
// CAMINHO: src/app/pages/crm/components/message-templates/message-templates-data.ts
// =====================================================

export interface IMessageTemplate {
    id: string;
    name: string;
    category: string;
    content: string;
    variables: string[];
    tags: string[];
    priority: number;
    icon?: string;
    // Tipo de comércio específico
    businessType?: 'celular' | 'oficina' | 'varejo' | 'geral';
}

export const MESSAGE_TEMPLATES: IMessageTemplate[] = [
    // =====================================================
    // 🎁 TEMPLATES DE BOAS-VINDAS COM DESCONTO
    // =====================================================
    {
        id: 'boas-vindas-desconto-cadastro',
        name: '🎁 Boas-vindas com Desconto - Cadastro Público',
        category: 'pos-venda',
        businessType: 'geral',
        content: `Olá {{nome}}! 🎉

Seja muito bem-vindo(a) à {{empresa}}!

Ficamos muito felizes com seu cadastro e queremos começar nossa parceria com um presente especial:

🎁 *CUPOM DE DESCONTO EXCLUSIVO* 🎁
━━━━━━━━━━━━━━━━━━━━━
💳 Código: BEMVINDO{{codigo_desconto}}
💰 Desconto: {{percentual_desconto}}% OFF
📅 Válido por: {{dias_validade}} dias
━━━━━━━━━━━━━━━━━━━━━

✨ *Como usar seu cupom:*
1️⃣ Visite nossa loja
2️⃣ Escolha seus produtos favoritos
3️⃣ Apresente este código no caixa
4️⃣ Aproveite seu desconto!

📍 *Nosso endereço:*
{{endereco_loja}}

⏰ *Horário de funcionamento:*
{{horario_funcionamento}}

📱 Salve nosso contato para receber ofertas exclusivas!

Qualquer dúvida, é só chamar! 
Estamos aqui para você! 😊

{{assinatura_empresa}}`,
        variables: [
            'nome',
            'empresa',
            'codigo_desconto',
            'percentual_desconto',
            'dias_validade',
            'endereco_loja',
            'horario_funcionamento',
            'assinatura_empresa'
        ],
        tags: ['boas-vindas', 'desconto', 'cadastro-publico', 'cupom', 'novo-cliente'],
        priority: 1,
        icon: '🎁'
    },
    // =====================================================
    // 📱 LOJA DE CELULARES - TEMPLATES ESPECÍFICOS
    // =====================================================

    // GARANTIA DE CELULAR
    {
        id: 'garantia-celular-1',
        name: 'Garantia de Celular - Informação',
        category: 'garantia-produto',
        businessType: 'celular',
        content: `Olá {{nome}}! 📱

Sobre a garantia do seu {{produto}}:

✅ Garantia de {{prazo_garantia}}
📋 Número de série: {{numero_serie}}
📅 Válida até: {{data_validade}}

⚠️ A garantia cobre:
• Defeitos de fabricação
• Problemas de software original
• Bateria (primeiros 6 meses)

❌ Não cobre:
• Danos físicos ou queda
• Contato com líquidos
• Uso inadequado

Guarde sua nota fiscal!
Qualquer dúvida, estamos aqui! 😊`,
        variables: ['nome', 'produto', 'prazo_garantia', 'numero_serie', 'data_validade'],
        tags: ['garantia', 'celular', 'produto'],
        priority: 1
    },
    {
        id: 'garantia-celular-2',
        name: 'Acionamento de Garantia - Celular',
        category: 'garantia-produto',
        businessType: 'celular',
        content: `Oi {{nome}}! 

Recebemos sua solicitação de garantia para:
📱 {{produto}}

Para agilizar o atendimento, preciso que me envie:
📸 Foto do aparelho
📄 Foto da nota fiscal
📝 Descrição do problema

Assim que receber, agendo sua visita à loja!

Horários disponíveis:
• Segunda a Sexta: 9h às 18h
• Sábado: 9h às 13h

{{atendente}} - {{empresa}}`,
        variables: ['nome', 'produto', 'atendente', 'empresa'],
        tags: ['garantia', 'celular', 'acionamento'],
        priority: 2
    },

    // CELULAR PRONTO E SERVIÇOS
    {
        id: 'celular-pronto-1',
        name: 'Celular Pronto - Aviso de Retirada',
        category: 'ordem-servico',
        businessType: 'celular',
        content: `Oi {{nome}}! 📱✨

Ótima notícia! Seu {{aparelho}} está pronto!

✅ Serviço realizado: {{servico}}
💰 Valor: R$ {{valor}}
🕐 Horário de retirada: 9h às 18h

Não esqueça de trazer:
• Documento com foto
• Protocolo de atendimento

Te esperamos! 😊
{{empresa}}`,
        variables: ['nome', 'aparelho', 'servico', 'valor', 'empresa'],
        tags: ['celular', 'retirada', 'pronto'],
        priority: 1
    },

    // PROMOÇÕES PARA CELULAR
    {
        id: 'celular-promo-1',
        name: 'Promoção de Acessórios',
        category: 'promocao',
        businessType: 'celular',
        content: `{{nome}}, que tal proteger seu celular? 📱🛡️

🎁 SUPER PROMOÇÃO:
• Película 3D: De R$ 50 por R$ 30
• Capinha Premium: De R$ 40 por R$ 25
• Carregador Turbo: De R$ 80 por R$ 60

✨ Comprando 2 itens = 10% extra de desconto!

Oferta válida até {{data_limite}}!
Venha conferir! 🏃‍♂️💨`,
        variables: ['nome', 'data_limite'],
        tags: ['celular', 'promocao', 'acessorios'],
        priority: 1
    },
    {
        id: 'celular-lancamento-1',
        name: 'Lançamento de Celular',
        category: 'promocao',
        businessType: 'celular',
        content: `{{nome}}, chegou o que você esperava! 🎉📱

🚀 LANÇAMENTO: {{modelo}}

✨ Destaques:
{{caracteristicas}}

💰 Condições especiais de pré-venda:
• À vista: R$ {{valor_vista}}
• Parcelado: {{condicoes_parcelamento}}
• Seu usado vale até: R$ {{valor_usado}}

📅 Disponível a partir de: {{data_disponivel}}

Garanta o seu! Vagas limitadas!`,
        variables: ['nome', 'modelo', 'caracteristicas', 'valor_vista', 'condicoes_parcelamento', 'valor_usado', 'data_disponivel'],
        tags: ['celular', 'lancamento', 'promocao'],
        priority: 1
    },
    // =====================================================
    // 🔧 MANUTENÇÃO GERAL - TEMPLATES ESPECÍFICOS  
    // =====================================================

    // GARANTIA DE MANUTENÇÃO EM GERAL
    {
        id: 'garantia-manutencao-geral-1',
        name: 'Garantia de Manutenção Geral',
        category: 'garantia-servico',
        businessType: 'geral',
        content: `Olá {{nome}}! 🔧

Serviço realizado: {{servico_realizado}}
✅ Garantia: {{prazo_garantia}}
📋 OS: {{numero_os}}
📅 Realizado em: {{data_servico}}

⚠️ COBERTURA DA GARANTIA:
• Defeitos no serviço executado
• Peças instaladas (se houver)
• Mão de obra aplicada

❌ NÃO COBRE:
• Mau uso ou negligência
• Serviços não relacionados
• Desgaste natural

Qualquer problema, estamos aqui!
{{empresa}} 📞`,
        variables: ['nome', 'servico_realizado', 'prazo_garantia', 'numero_os', 'data_servico', 'empresa'],
        tags: ['garantia', 'manutencao', 'servico', 'geral'],
        priority: 1
    },

    // GARANTIA DETECTADA AUTOMATICAMENTE - CELULAR
    {
        id: 'garantia-auto-celular',
        name: 'Garantia Automática - Celular',
        category: 'garantia-produto',
        businessType: 'celular',
        content: `{{nome}}, sua garantia foi registrada! 📱✅

Produto: {{produto}}
Garantia: {{garantia_detectada}}
Vencimento: {{data_vencimento}}

💡 IMPORTANTE:
• Guarde a nota fiscal
• Evite quedas e líquidos
• Use apenas acessórios originais

Salvamos seus dados de garantia!
{{empresa}}`,
        variables: ['nome', 'produto', 'garantia_detectada', 'data_vencimento', 'empresa'],
        tags: ['garantia', 'automatica', 'celular'],
        priority: 1
    },

    // GARANTIA DETECTADA AUTOMATICAMENTE - OFICINA
    {
        id: 'garantia-auto-oficina',
        name: 'Garantia Automática - Oficina',
        category: 'garantia-servico',
        businessType: 'oficina',
        content: `{{nome}}, garantia registrada! 🚗✅

Veículo: {{veiculo}}
Serviço: {{servico}}
Garantia: {{garantia_detectada}}
Vencimento: {{data_vencimento}}

⚡ MANTENHA A GARANTIA:
• Faça as revisões em dia
• Use combustível de qualidade
• Não modifique o serviço

{{empresa}} - Sua oficina de confiança!`,
        variables: ['nome', 'veiculo', 'servico', 'garantia_detectada', 'data_vencimento', 'empresa'],
        tags: ['garantia', 'automatica', 'oficina'],
        priority: 1
    },

    // GARANTIA DETECTADA AUTOMATICAMENTE - GERAL
    {
        id: 'garantia-auto-geral',
        name: 'Garantia Automática - Geral',
        category: 'garantia-servico',
        businessType: 'geral',
        content: `{{nome}}, confirmamos sua garantia! ✅

Serviço/Produto: {{item}}
Garantia: {{garantia_detectada}}
Válida até: {{data_vencimento}}
Código: {{codigo_garantia}}

📌 Lembre-se:
• Guarde este comprovante
• Siga as orientações de uso
• Em caso de problema, nos procure

{{empresa}} agradece a confiança!`,
        variables: ['nome', 'item', 'garantia_detectada', 'data_vencimento', 'codigo_garantia', 'empresa'],
        tags: ['garantia', 'automatica', 'geral'],
        priority: 1
    },

    // LEMBRETE DE GARANTIA EXPIRANDO
    {
        id: 'garantia-expirando-1',
        name: 'Garantia Expirando - Aviso',
        category: 'garantia-servico',
        businessType: 'geral',
        content: `⚠️ {{nome}}, atenção!

Sua garantia está acabando:
📦 {{item}}
📅 Vence em: {{dias_restantes}} dias

Aproveite para:
✅ Fazer uma revisão
✅ Tirar dúvidas
✅ Verificar se está tudo OK

Não perca a garantia!
Agende uma visita: {{contato}}

{{empresa}}`,
        variables: ['nome', 'item', 'dias_restantes', 'contato', 'empresa'],
        tags: ['garantia', 'expirando', 'lembrete'],
        priority: 1
    },
    // =====================================================
    // 🔧 LOJA DE CELULAR – GARANTIA DE SERVIÇOS
    // =====================================================
    {
        id: 'garantia-servico-celular-1',                // identificador único
        name: 'Garantia de Serviço - Celular',           // nome exibido no card
        category: 'garantia-servico',                     // categoria de garantia de serviço
        businessType: 'celular',                          // tipo de comércio: loja de celular
        content: `Olá {{nome}}! 📱🔧

Serviço realizado em seu {{aparelho}}:
✅ {{servico_realizado}}

📋 GARANTIA DO SERVIÇO:
• Mão de obra: {{garantia_mao_obra}}
• Peças: {{garantia_pecas}}
• Prazo de garantia: {{prazo_garantia}}

⚠️ Para manter a garantia:
• Não abra o aparelho
• Use acessórios originais

Qualquer dúvida, estamos à disposição!
{{atendente}} – {{empresa}}`,               // mensagem com variáveis
        variables: [
            'nome',
            'aparelho',
            'servico_realizado',
            'garantia_mao_obra',
            'garantia_pecas',
            'prazo_garantia',
            'atendente',
            'empresa'
        ],
        tags: ['garantia', 'celular', 'servico'],        // palavras-chave para sugestão
        priority: 1                                      // prioridade para ordenação
    },

    // =====================================================
    // 🛠️ SERVIÇOS EM GERAL – GARANTIA DE SERVIÇOS
    // =====================================================
    {
        id: 'garantia-servico-geral-1',                   // identificador único
        name: 'Garantia de Serviço - Geral',             // nome exibido no card
        category: 'garantia-servico',                     // mesma categoria de serviço
        businessType: 'geral',                            // tipo “geral” para qualquer comércio
        content: `Olá {{nome}}! 🛠️

Serviço realizado:
✅ {{servicos_realizados}}

📋 GARANTIA DO SERVIÇO:
• Prazo de garantia: {{prazo_garantia}}
• Condições: {{condicoes_garantia}}

⚠️ Para manter a garantia:
• Siga as instruções de uso
• Entre em contato em caso de dúvidas

Obrigado por escolher nossos serviços!
{{empresa}}`,                                    // corpo da mensagem
        variables: [
            'nome',
            'servicos_realizados',
            'prazo_garantia',
            'condicoes_garantia',
            'empresa'
        ],
        tags: ['garantia', 'servico', 'geral'],          // tags para contexto e sugestão
        priority: 1                                      // prioridade alta
    },

    // =====================================================
    // 🔧 OFICINA MECÂNICA - TEMPLATES ESPECÍFICOS
    // =====================================================

    // GARANTIA DE SERVIÇO
    {
        id: 'garantia-oficina-1',
        name: 'Garantia de Serviço - Oficina',
        category: 'garantia-servico',
        businessType: 'oficina',
        content: `Olá {{nome}}! 🔧

Serviço realizado em seu {{veiculo}}:
✅ {{servicos_realizados}}

📋 GARANTIA DO SERVIÇO:
• Mão de obra: {{garantia_mao_obra}}
• Peças: {{garantia_pecas}}
• OS: {{numero_os}}

⚠️ Para manter a garantia:
• Realizar revisões nos prazos
• Usar combustível de qualidade
• Não alterar o serviço realizado

Km atual: {{km_atual}}
Próxima revisão: {{proxima_revisao}}

Qualquer barulho ou problema, me chame!
{{atendente}} - {{empresa}}`,
        variables: ['nome', 'veiculo', 'servicos_realizados', 'garantia_mao_obra', 'garantia_pecas', 'numero_os', 'km_atual', 'proxima_revisao', 'atendente', 'empresa'],
        tags: ['garantia', 'oficina', 'servico'],
        priority: 1
    },

    // PÓS-VENDA OFICINA
    {
        id: 'pos-venda-oficina-1',
        name: 'Pós-venda 48h - Oficina',
        category: 'pos-venda-servico',
        businessType: 'oficina',
        content: `Oi {{nome}}! 👋

Tudo bem com seu {{veiculo}}?

Já se passaram 48h desde o serviço:
🔧 {{servicos_realizados}}

Como está o desempenho?
✅ Tudo funcionando bem?
🔊 Algum barulho estranho?
⚡ Performance como esperado?

Sua opinião é muito importante!
Me conte como foi sua experiência 😊

{{atendente}}`,
        variables: ['nome', 'veiculo', 'servicos_realizados', 'atendente'],
        tags: ['pos-venda', 'oficina', 'follow-up'],
        priority: 2
    },

    // REVISÕES E MANUTENÇÕES
    {
        id: 'oficina-revisao-1',
        name: 'Lembrete de Revisão',
        category: 'agendamento',
        businessType: 'oficina',
        content: `Olá {{nome}}! 🚗

Seu {{veiculo}} está chegando na hora da revisão!

📊 Km atual estimado: {{km_estimado}}
🔧 Última revisão: {{ultima_revisao}}
📅 Recomendamos agendar até: {{data_recomendada}}

Que tal agendar agora e ganhar:
✅ 10% de desconto na mão de obra
✅ Check-up grátis de 20 itens
✅ Lavagem cortesia

Posso agendar para você? 📲`,
        variables: ['nome', 'veiculo', 'km_estimado', 'ultima_revisao', 'data_recomendada'],
        tags: ['oficina', 'revisao', 'agendamento'],
        priority: 1
    },

    // ORÇAMENTOS
    {
        id: 'oficina-orcamento-1',
        name: 'Envio de Orçamento',
        category: 'ordem-servico',
        businessType: 'oficina',
        content: `{{nome}}, segue o orçamento do seu {{veiculo}} 📋

🔧 SERVIÇOS NECESSÁRIOS:
{{lista_servicos}}

💰 INVESTIMENTO TOTAL: R$ {{valor_total}}
• À vista: 5% de desconto
• Cartão: até 3x sem juros

⏱️ Tempo estimado: {{tempo_estimado}}

✅ Garantia: {{garantia}}

Aprovar orçamento? Responda:
1️⃣ - Sim, pode fazer!
2️⃣ - Quero negociar
3️⃣ - Vou pensar`,
        variables: ['nome', 'veiculo', 'lista_servicos', 'valor_total', 'tempo_estimado', 'garantia'],
        tags: ['oficina', 'orcamento', 'servico'],
        priority: 1
    },

    // VEÍCULO PRONTO
    {
        id: 'oficina-pronto-1',
        name: 'Veículo Pronto para Retirada',
        category: 'ordem-servico',
        businessType: 'oficina',
        content: `{{nome}}, seu {{veiculo}} está pronto! 🚗✨

✅ Serviços realizados:
{{servicos_realizados}}

💰 Valor total: R$ {{valor}}
📋 Garantia: {{garantia}}

🎁 Cortesias incluídas:
• Lavagem completa
• Aromatizador de brinde
• Check-up de segurança

Horário de retirada: 8h às 18h
Documentos necessários: CNH ou RG

Te esperamos! 🔧
{{empresa}}`,
        variables: ['nome', 'veiculo', 'servicos_realizados', 'valor', 'garantia', 'empresa'],
        tags: ['oficina', 'pronto', 'retirada'],
        priority: 1
    },

    // =====================================================
    // 🛍️ VAREJO GERAL - TEMPLATES UNIVERSAIS
    // =====================================================

    // GARANTIA VAREJO
    {
        id: 'garantia-varejo-1',
        name: 'Garantia de Produto - Varejo',
        category: 'garantia-produto',
        businessType: 'varejo',
        content: `Olá {{nome}}! 🛍️

Sua compra tem garantia! ✅

📦 Produto: {{produto}}
📅 Garantia: {{prazo_garantia}}
🔢 Código: {{codigo_produto}}

A garantia cobre defeitos de fabricação.

💡 Dicas para conservação:
{{dicas_conservacao}}

Guarde este comprovante junto com a nota fiscal!

Precisando, é só chamar!
{{empresa}} 💙`,
        variables: ['nome', 'produto', 'prazo_garantia', 'codigo_produto', 'dicas_conservacao', 'empresa'],
        tags: ['garantia', 'varejo', 'produto'],
        priority: 1
    },

    // PÓS-VENDA VAREJO
    {
        id: 'pos-venda-varejo-1',
        name: 'Avaliação Pós-venda - Varejo',
        category: 'pos-venda-produto',
        businessType: 'varejo',
        content: `Oi {{nome}}! 😊

Como está sua experiência com:
📦 {{produtos}}

Sua opinião vale muito! 

Por favor, avalie de 1 a 5:
⭐ Qualidade do produto
⭐ Atendimento
⭐ Entrega/Retirada
⭐ Experiência geral

Tem alguma sugestão? Adoraria ouvir!

{{empresa}} agradece! 🙏`,
        variables: ['nome', 'produtos', 'empresa'],
        tags: ['pos-venda', 'varejo', 'avaliacao'],
        priority: 1
    },

    // RESERVAS E VENDAS
    {
        id: 'varejo-reserva-1',
        name: 'Produto Reservado',
        category: 'generico',
        businessType: 'varejo',
        content: `{{nome}}, reservamos para você! 🛍️

📦 Produto: {{produto}}
💰 Valor: R$ {{valor}}
⏰ Reservado até: {{data_limite}}

Formas de pagamento:
• Dinheiro/Pix: 5% desconto
• Cartão: até 3x sem juros

Confirma a compra? 
Estamos te esperando! 😊`,
        variables: ['nome', 'produto', 'valor', 'data_limite'],
        tags: ['varejo', 'reserva', 'venda'],
        priority: 1
    },

    // PROGRAMA DE FIDELIDADE
    {
        id: 'varejo-vip-1',
        name: 'Benefícios Cliente VIP',
        category: 'relacionamento',
        businessType: 'varejo',
        content: `{{nome}}, você é especial para nós! ⭐

Por ser nosso cliente VIP, você ganhou:

🎁 Benefícios exclusivos:
• 15% de desconto em toda loja
• Frete grátis sempre
• Acesso antecipado às promoções
• Brinde surpresa no aniversário

Código VIP: {{codigo_vip}}
Válido até: {{validade}}

Aproveite! Você merece! 💖`,
        variables: ['nome', 'codigo_vip', 'validade'],
        tags: ['varejo', 'vip', 'fidelidade'],
        priority: 1
    },

    // =====================================================
    // 🛍️ PÓS-VENDA GERAL (TODOS OS TIPOS)
    // =====================================================
    {
        id: 'pos-venda-1',
        name: 'Agradecimento Pós-Venda',
        category: 'pos-venda',
        content: `Olá {{nome}}! 🌟
  
Muito obrigado pela sua compra!

{{produtos}}

Valor total: {{valor}}

Sua satisfação é muito importante para nós. Se precisar de algo, estamos aqui!

Um abraço,
{{empresa}}`,
        variables: ['nome', 'produtos', 'valor', 'empresa'],
        tags: ['pos-venda', 'agradecimento'],
        priority: 1
    },
    {
        id: 'pos-venda-2',
        name: 'Feedback Pós-Venda',
        category: 'pos-venda',
        content: `Oi {{nome}}! 😊

Como está sua experiência com:
{{produtos}}

Adoraríamos ouvir sua opinião! 

⭐ Como você avaliaria nosso atendimento de 1 a 5?

Sua opinião nos ajuda a melhorar!`,
        variables: ['nome', 'produtos'],
        tags: ['pos-venda', 'feedback'],
        priority: 2
    },
    {
        id: 'pos-venda-3',
        name: 'Suporte Pós-Venda',
        category: 'pos-venda',
        content: `Olá {{nome}}!

Passando para verificar se está tudo bem com sua compra:
{{produtos}}

📞 Precisa de ajuda para configurar ou usar?
🔧 Alguma dúvida técnica?
📋 Quer saber sobre garantia?

Estou à disposição!
{{atendente}}`,
        variables: ['nome', 'produtos', 'atendente'],
        tags: ['pos-venda', 'suporte'],
        priority: 3
    },

    // =====================================================
    // 📞 FOLLOW-UP (VENDAS PENDENTES)
    // =====================================================
    {
        id: 'followup-1',
        name: 'Retomar Negociação',
        category: 'follow-up',
        content: `Oi {{nome}}! 👋

Vi que você demonstrou interesse em:
{{produtos}}

Ainda está pensando nisso? 

💰 Valor especial: {{valor}}
✅ {{condicoes}}

Posso te ajudar com alguma dúvida?`,
        variables: ['nome', 'produtos', 'valor', 'condicoes'],
        tags: ['follow-up', 'venda-pendente'],
        priority: 1
    },
    {
        id: 'followup-2',
        name: 'Oferta Limitada',
        category: 'follow-up',
        content: `{{nome}}, tudo bem? 🎯

Lembrei de você! 

Aquela oferta que conversamos:
{{produtos}}

🔥 Últimas unidades!
💰 Mantemos o valor: {{valor}}
🎁 + Brinde surpresa

Válido só hoje! Que tal?`,
        variables: ['nome', 'produtos', 'valor'],
        tags: ['follow-up', 'urgente'],
        priority: 2
    },
    {
        id: 'followup-3',
        name: 'Última Chance',
        category: 'follow-up',
        content: `{{nome}}, última chance! ⏰

{{produtos}}

Consegui uma condição especial para você:
💰 De: {{valor_de}}
✨ Por: {{valor_por}}
📦 + Frete grátis

Oferta expira em 2 horas!

Aceita? Responda com SIM 😊`,
        variables: ['nome', 'produtos', 'valor_de', 'valor_por'],
        tags: ['follow-up', 'ultima-chance'],
        priority: 3
    },

    // =====================================================
    // 🔄 RECUPERAÇÃO (VENDAS CANCELADAS)
    // =====================================================
    {
        id: 'recuperacao-1',
        name: 'Recuperar Venda Cancelada',
        category: 'recuperacao',
        content: `Oi {{nome}}! 

Notei que você cancelou seu pedido de:
{{produtos}}

Aconteceu algo? 🤔

Se foi por causa do valor, tenho uma surpresa:
💰 Desconto especial de {{desconto}}%
🎁 + {{bonus}}

Que tal reconsiderar? 

{{atendente}}`,
        variables: ['nome', 'produtos', 'desconto', 'bonus', 'atendente'],
        tags: ['recuperacao', 'venda-cancelada'],
        priority: 1
    },
    {
        id: 'recuperacao-2',
        name: 'Oferta de Retorno',
        category: 'recuperacao',
        content: `{{nome}}, sentimos sua falta! 💙

Faz tempo que não nos vemos...

Preparei algo especial para você voltar:
🎁 {{oferta_especial}}

Além disso:
✅ {{beneficio1}}
✅ {{beneficio2}}
✅ {{beneficio3}}

Vamos matar a saudade? 😊

{{empresa}}`,
        variables: ['nome', 'oferta_especial', 'beneficio1', 'beneficio2', 'beneficio3', 'empresa'],
        tags: ['recuperacao', 'cliente-inativo'],
        priority: 2
    },

    // =====================================================
    // 🔧 ORDEM DE SERVIÇO
    // =====================================================
    {
        id: 'os-1',
        name: 'OS Aberta',
        category: 'ordem-servico',
        content: `{{nome}}, ordem de serviço aberta! 📋

OS Nº: {{numero_os}}
Serviço: {{servico}}
Previsão: {{previsao}}

Acompanhe o status:
📱 {{link_acompanhamento}}

Qualquer novidade, te aviso!
{{atendente}}`,
        variables: ['nome', 'numero_os', 'servico', 'previsao', 'link_acompanhamento', 'atendente'],
        tags: ['ordem-servico', 'abertura'],
        priority: 1
    },
    {
        id: 'os-2',
        name: 'OS Finalizada',
        category: 'ordem-servico',
        content: `{{nome}}, serviço concluído! ✅

OS Nº: {{numero_os}}
Serviço realizado: {{servico}}
Valor: R$ {{valor}}

✨ Tudo pronto para retirada!

Horário: {{horario_funcionamento}}
Local: {{endereco}}

Obrigado pela confiança!
{{empresa}}`,
        variables: ['nome', 'numero_os', 'servico', 'valor', 'horario_funcionamento', 'endereco', 'empresa'],
        tags: ['ordem-servico', 'finalizada'],
        priority: 2
    },

    // =====================================================
    // 💰 COBRANÇA
    // =====================================================
    {
        id: 'cobranca-1',
        name: 'Lembrete de Pagamento',
        category: 'cobranca',
        content: `Olá {{nome}}! 

Passando para lembrar do pagamento:
📄 {{descricao}}
💰 Valor: R$ {{valor}}
📅 Vencimento: {{vencimento}}

Formas de pagamento:
• PIX: {{chave_pix}}
• Boleto: {{codigo_boleto}}

Já pagou? Me avise para atualizar! 😊
{{atendente}}`,
        variables: ['nome', 'descricao', 'valor', 'vencimento', 'chave_pix', 'codigo_boleto', 'atendente'],
        tags: ['cobranca', 'lembrete'],
        priority: 1
    },
    {
        id: 'cobranca-2',
        name: 'Negociação de Débito',
        category: 'cobranca',
        content: `{{nome}}, temos uma oportunidade! 💳

Débito em aberto: R$ {{valor_total}}

🎯 CONDIÇÃO ESPECIAL HOJE:
• À vista: {{desconto}}% de desconto
• Parcelado: até {{parcelas}}x
• Entrada de R$ {{entrada}} + resto facilitado

Vamos resolver isso juntos?
Responda SIM para eu te ajudar!

{{atendente}}`,
        variables: ['nome', 'valor_total', 'desconto', 'parcelas', 'entrada', 'atendente'],
        tags: ['cobranca', 'negociacao'],
        priority: 2
    },

    // =====================================================
    // 🎂 ANIVERSÁRIO
    // =====================================================

    {
        id: 'aniversario-1',
        name: 'Parabéns Cliente',
        category: 'aniversario',
        content: `{{nome}}, FELIZ ANIVERSÁRIO! 🎂🎉

Que seu dia seja repleto de alegrias!

🎁 Presente especial para você:
{{presente_aniversario}}

Válido durante todo seu mês de aniversário!

Um grande abraço,
{{empresa}} 💙`,
        variables: ['nome', 'presente_aniversario', 'empresa'],
        tags: ['aniversario', 'cliente'],
        priority: 1
    },

    {
        id: 'aniversario-2',
        name: 'Aniversário com Cupom 10%',
        category: 'aniversario',
        content: `🎂 {{nome}}, PARABÉNS PELO SEU ANIVERSÁRIO! 🎉

Preparamos um presente especial para você:

🎁 CUPOM: NIVER10
💰 10% DE DESCONTO em qualquer compra!

📅 Válido por 30 dias
🛍️ Use quantas vezes quiser no seu mês!

Aproveite seu dia especial!
{{empresa}} ❤️`,
        variables: ['nome', 'empresa'],
        tags: ['aniversario', 'cupom', 'desconto'],
        priority: 2
    },

    {
        id: 'aniversario-3',
        name: 'Aniversário VIP - 20% OFF',
        category: 'aniversario',
        content: `✨ {{nome}}, FELIZ ANIVERSÁRIO! ✨

Por ser nosso cliente VIP, seu presente é ainda mais especial:

🎁 SUPER CUPOM: VIPNIVER20
💎 20% DE DESCONTO em toda a loja!
🎂 + Brinde surpresa na primeira compra!

⏰ Válido por 30 dias
✅ Acumula com outras promoções!

Venha comemorar com a gente!
{{empresa}} 🥳`,
        variables: ['nome', 'empresa'],
        tags: ['aniversario', 'vip', 'cupom', 'desconto'],
        priority: 3
    },

    {
        id: 'aniversario-4',
        name: 'Combo Aniversário - Desconto + Frete',
        category: 'aniversario',
        content: `🎊 {{nome}}, é seu ANIVERSÁRIO! 🎊

Olha só o que preparamos:

🎁 CUPOM ESPECIAL: PARABENS15
📦 15% OFF + FRETE GRÁTIS!

Mas não é só isso:
✨ Parcelamento em até 12x sem juros
🎁 Embalagem presente gratuita
⭐ Pontos em dobro no programa de fidelidade

Use o código: PARABENS15
Válido por: 30 dias

Felicidades!
{{empresa}} 🎂`,
        variables: ['nome', 'empresa'],
        tags: ['aniversario', 'cupom', 'frete-gratis'],
        priority: 4
    },

    {
        id: 'aniversario-5',
        name: 'Aniversário - Primeira Compra 25% OFF',
        category: 'aniversario',
        content: `🎂 Oi {{nome}}! MUITAS FELICIDADES! 🎉

No seu mês especial, temos uma surpresa:

🏷️ MEGA CUPOM: NIVER25
💥 25% DE DESCONTO na primeira compra!

Condições especiais:
• Vale para qualquer produto
• Mínimo de R$ {{valor_minimo}}
• Pode ser usado 1 vez no mês

Código: NIVER25

Aproveite e feliz aniversário!
{{empresa}} 🎊`,
        variables: ['nome', 'valor_minimo', 'empresa'],
        tags: ['aniversario', 'primeira-compra', 'cupom'],
        priority: 5
    },

    {
        id: 'aniversario-6',
        name: 'Aniversário Família - Desconto Progressivo',
        category: 'aniversario',
        content: `🎈 {{nome}}, PARABÉNS! 🎈

Mês de aniversário = mês de economia!

🎁 CUPONS PROGRESSIVOS:
• 1ª compra: 10% OFF (código: NIVER10)
• 2ª compra: 15% OFF (código: NIVER15)  
• 3ª compra: 20% OFF (código: NIVER20)

📅 Todos válidos no seu mês!
👨‍👩‍👧‍👦 Pode compartilhar com a família!

Comemore com descontos!
{{empresa}} 💝`,
        variables: ['nome', 'empresa'],
        tags: ['aniversario', 'progressivo', 'familia'],
        priority: 6
    },

    {
        id: 'aniversario-7',
        name: 'Aniversário Premium - 30% + Brindes',
        category: 'aniversario',
        content: `🌟 {{nome}}, FELIZ ANIVERSÁRIO! 🌟

Cliente especial = presente especial!

🎁 OFERTA PREMIUM:
💰 30% DE DESCONTO
🎁 + Kit de brindes exclusivos
📦 + Entrega expressa grátis
🥂 + Taça personalizada de presente

Use o cupom: PREMIUM30
Válido: {{dias_validade}} dias

Reserve já o seu!
{{empresa}} ✨`,
        variables: ['nome', 'dias_validade', 'empresa'],
        tags: ['aniversario', 'premium', 'brindes'],
        priority: 7
    },

    {
        id: 'aniversario-8',
        name: 'Aniversário - Compre 1 Leve 2',
        category: 'aniversario',
        content: `🎉 {{nome}}, QUE DIA ESPECIAL! 🎉

No seu aniversário, a festa é nossa:

🛍️ COMPRE 1, LEVE 2!
Em produtos selecionados*

Como funciona:
1. Escolha seu produto favorito
2. Use o cupom: NIVER2X1
3. Leve outro de graça!

*Válido em {{categorias_validas}}
⏰ Por {{dias_validade}} dias

Parabéns!
{{empresa}} 🎂`,
        variables: ['nome', 'categorias_validas', 'dias_validade', 'empresa'],
        tags: ['aniversario', 'compre-leve', 'promocao'],
        priority: 8
    },

    // =====================================================
    // 🎯 PROMOÇÕES
    // =====================================================
    {
        id: 'promocao-1',
        name: 'Oferta Relâmpago',
        category: 'promocao',
        content: `⚡ OFERTA RELÂMPAGO para {{nome}}! ⚡

{{produtos_promocao}}

💥 Desconto de {{percentual_desconto}}%
⏰ Válido apenas até {{horario_limite}}

🔥 Corre que é por tempo limitado!

{{link_oferta}}`,
        variables: ['nome', 'produtos_promocao', 'percentual_desconto', 'horario_limite', 'link_oferta'],
        tags: ['promocao', 'urgente'],
        priority: 1
    },
    {
        id: 'promocao-2',
        name: 'Promoção Exclusiva',
        category: 'promocao',
        content: `{{nome}}, oferta EXCLUSIVA para você! 🌟

Por ser nosso cliente especial:

{{lista_produtos_promocao}}

💰 Economia total: R$ {{economia}}
🎁 + {{brinde}}

Use o cupom: {{cupom_desconto}}
Válido até: {{data_validade}}

Aproveite! 🛍️`,
        variables: ['nome', 'lista_produtos_promocao', 'economia', 'brinde', 'cupom_desconto', 'data_validade'],
        tags: ['promocao', 'exclusiva'],
        priority: 2
    },

    // =====================================================
    // 📅 AGENDAMENTO
    // =====================================================
    {
        id: 'agendamento-1',
        name: 'Confirmação de Agendamento',
        category: 'agendamento',
        content: `{{nome}}, agendamento confirmado! ✅

📅 Data: {{data}}
🕐 Horário: {{horario}}
📍 Local: {{local}}
👤 Profissional: {{profissional}}

⚠️ Importante:
• Chegue 10 min antes
• {{observacoes}}

Precisa remarcar? Me avise!
{{empresa}}`,
        variables: ['nome', 'data', 'horario', 'local', 'profissional', 'observacoes', 'empresa'],
        tags: ['agendamento', 'confirmacao'],
        priority: 1
    },
    {
        id: 'agendamento-2',
        name: 'Lembrete de Agendamento',
        category: 'agendamento',
        content: `{{nome}}, lembrando seu compromisso! 📌

⏰ AMANHÃ às {{horario}}
📍 Local: {{local}}
🔧 Serviço: {{servico}}

Confirma presença? Responda:
✅ SIM - Confirmar
❌ NÃO - Remarcar

{{atendente}}`,
        variables: ['nome', 'horario', 'local', 'servico', 'atendente'],
        tags: ['agendamento', 'lembrete'],
        priority: 2
    },

    // =====================================================
    // 💬 RELACIONAMENTO
    // =====================================================
    {
        id: 'relacionamento-1',
        name: 'Check-in com Cliente',
        category: 'relacionamento',
        content: `Oi {{nome}}! Como você está? 😊

Faz um tempinho que não conversamos...

Alguma novidade? Precisa de algo?

Ah! Temos novidades na loja:
{{novidades}}

Sempre à disposição!
{{atendente}}`,
        variables: ['nome', 'novidades', 'atendente'],
        tags: ['relacionamento', 'checkin'],
        priority: 2
    },

    // =====================================================
    // 💬 GENÉRICOS
    // =====================================================
    {
        id: 'generico-1',
        name: 'Primeiro Contato',
        category: 'generico',
        content: `Olá {{nome}}! 👋

Me chamo {{atendente}} e sou da {{empresa}}.

{{mensagem_personalizada}}

Posso te ajudar com algo?

Aguardo seu retorno!`,
        variables: ['nome', 'atendente', 'empresa', 'mensagem_personalizada'],
        tags: ['generico', 'primeiro-contato'],
        priority: 1
    },
    {
        id: 'generico-2',
        name: 'Resposta Rápida',
        category: 'generico',
        content: `{{nome}}, obrigado pelo contato! 😊

{{resposta}}

Algo mais que posso ajudar?

{{atendente}}`,
        variables: ['nome', 'resposta', 'atendente'],
        tags: ['generico', 'resposta'],
        priority: 2
    },

    // =====================================================
    // 🔄 RECOMPRA (VENDAS ANTERIORES)
    // =====================================================
    {
        id: 'recompra-15-dias',
        name: '🔄 Recompra - 15 dias',
        category: 'recompra',
        content: `Olá {{nome}}! 👋

Já se passaram 15 dias desde sua última compra!

Que tal aproveitar para repor:
📦 {{produtos}}

💰 Valor especial: {{valor}}
✅ Com desconto de fidelidade!

Aceita? Responda com SIM para eu reservar! 😊`,
        variables: ['nome', 'produtos', 'valor'],
        tags: ['recompra', 'follow-up', '15-dias'],
        priority: 1
    },
    {
        id: 'recompra-30-dias',
        name: '🔄 Recompra - 30 dias',
        category: 'recompra',
        content: `Oi {{nome}}! 

Faz 1 mês que você comprou conosco! 🗓️

Está na hora de renovar seu estoque de:
{{produtos}}

🎁 Oferta especial para clientes fiéis:
💰 10% de desconto
🚚 Frete grátis
📦 Entrega em 24h

Vamos fechar?`,
        variables: ['nome', 'produtos'],
        tags: ['recompra', 'follow-up', '30-dias'],
        priority: 2
    },
    {
        id: 'recompra-oferta-especial',
        name: '🎁 Oferta Especial de Recompra',
        category: 'recompra',
        content: `{{nome}}, tenho uma oferta imperdível! 🎯

Seus produtos favoritos com condições especiais:
{{produtos}}

💰 De: {{valor_de}}
✨ Por: {{valor_por}}
🎁 + Brinde surpresa
🚚 + Frete grátis

Oferta válida só hoje! Aceita?`,
        variables: ['nome', 'produtos', 'valor_de', 'valor_por'],
        tags: ['recompra', 'oferta', 'urgente'],
        priority: 3
    },
    {
        id: 'recompra-satisfacao',
        name: '😊 Satisfação + Recompra',
        category: 'recompra',
        content: `{{nome}}, tudo bem? 😊

Como está sendo sua experiência com:
{{produtos}}?

Se você está satisfeito(a), que tal já garantir a próxima remessa?

📦 Mesmos produtos
💰 15% OFF para clientes satisfeitos
🚚 Entrega prioritária

Posso preparar seu pedido?`,
        variables: ['nome', 'produtos'],
        tags: ['recompra', 'satisfacao', 'feedback'],
        priority: 4
    },
    {
        id: 'recompra-estoque-acabando',
        name: '⚠️ Estoque Acabando',
        category: 'recompra',
        content: `{{nome}}, aviso importante! ⚠️

O estoque de {{produtos}} está acabando!

Como você é nosso cliente especial, estou reservando para você:
✅ Quantidade garantida
💰 Preço especial: {{valor}}
🚀 Envio imediato

Confirma a reserva? Responda SIM ou NÃO.`,
        variables: ['nome', 'produtos', 'valor'],
        tags: ['recompra', 'urgente', 'estoque'],
        priority: 5
    },
    {
        id: 'recompra-combo',
        name: '🎯 Combo de Recompra',
        category: 'recompra',
        content: `{{nome}}, preparei um combo especial! 🎁

Baseado no seu histórico, montei este kit:
{{produtos}}

🎯 Combo completo por: {{valor}}
💰 Economia de: {{economia}}
🚚 Frete único
🎁 + Brinde exclusivo

Que tal? É só confirmar!`,
        variables: ['nome', 'produtos', 'valor', 'economia'],
        tags: ['recompra', 'combo', 'oferta'],
        priority: 6
    },
    {
        id: 'recompra-novidades',
        name: '✨ Recompra + Novidades',
        category: 'recompra',
        content: `Oi {{nome}}! ✨

Além dos seus produtos habituais:
{{produtos}}

Temos NOVIDADES que combinam perfeitamente:
{{novidades}}

💰 Compre tudo junto e ganhe 20% OFF
🚚 Frete grátis no combo
🎁 Brindes exclusivos

Vamos montar seu pedido?`,
        variables: ['nome', 'produtos', 'novidades'],
        tags: ['recompra', 'novidades', 'cross-sell'],
        priority: 7
    },
    {
        id: 'recompra-fidelidade',
        name: '⭐ Programa de Fidelidade',
        category: 'recompra',
        content: `{{nome}}, parabéns! 🎉

Você é um cliente ESPECIAL e merece vantagens:

✅ {{compras}} compras realizadas
⭐ Nível: Cliente {{nivel}}

Benefícios exclusivos na recompra:
{{produtos}}

💰 {{desconto}}% de desconto de fidelidade
🎁 Brinde VIP
🚚 Frete grátis vitalício

Aproveitar agora?`,
        variables: ['nome', 'compras', 'nivel', 'produtos', 'desconto'],
        tags: ['recompra', 'fidelidade', 'vip'],
        priority: 8
    }
];

// =====================================================
// 🏷️ CATEGORIAS DE TEMPLATES
// =====================================================
export const TEMPLATE_CATEGORIES = [
    { value: 'all', label: 'Todos os Templates', icon: 'grid-outline' },

    // Categorias de Garantia
    { value: 'garantia-produto', label: 'Garantia de Produto', icon: 'shield-checkmark-outline' },
    { value: 'garantia-servico', label: 'Garantia de Serviço', icon: 'construct-outline' },

    // Categorias de Pós-venda
    { value: 'pos-venda', label: 'Pós-venda Geral', icon: 'checkmark-circle-outline' },
    { value: 'pos-venda-produto', label: 'Pós-venda Produto', icon: 'cube-outline' },
    { value: 'pos-venda-servico', label: 'Pós-venda Serviço', icon: 'hammer-outline' },

    // Outras categorias
    { value: 'follow-up', label: 'Follow-up', icon: 'refresh-outline' },
    { value: 'recuperacao', label: 'Recuperação', icon: 'arrow-back-outline' },
    { value: 'ordem-servico', label: 'Ordem de Serviço', icon: 'build-outline' },
    { value: 'cobranca', label: 'Cobrança', icon: 'cash-outline' },
    { value: 'aniversario', label: 'Aniversário', icon: 'gift-outline' },
    { value: 'promocao', label: 'Promoções', icon: 'pricetag-outline' },
    { value: 'agendamento', label: 'Agendamento', icon: 'calendar-outline' },
    { value: 'relacionamento', label: 'Relacionamento', icon: 'people-outline' },
    { value: 'generico', label: 'Genéricos', icon: 'chatbubbles-outline' }
];

// =====================================================
// 🏪 TIPOS DE COMÉRCIO
// =====================================================
export const BUSINESS_TYPES = [
    { value: 'geral', label: 'Todos os Tipos', icon: 'business-outline' },
    { value: 'celular', label: 'Loja de Celular', icon: 'phone-portrait-outline' },
    { value: 'oficina', label: 'Oficina Mecânica', icon: 'car-outline' },
    { value: 'varejo', label: 'Varejo Geral', icon: 'storefront-outline' }
];

// =====================================================
// 🛠️ FUNÇÕES AUXILIARES
// =====================================================

/**
 * Buscar templates por categoria
 */
export function getTemplatesByCategory(category: string): IMessageTemplate[] {
    if (category === 'all') {
        return MESSAGE_TEMPLATES;
    }
    return MESSAGE_TEMPLATES.filter(t => t.category === category);
}

/**
 * Buscar templates por tipo de negócio
 */
export function getTemplatesByBusinessType(businessType: string): IMessageTemplate[] {
    if (businessType === 'geral') {
        return MESSAGE_TEMPLATES;
    }
    return MESSAGE_TEMPLATES.filter(t =>
        !t.businessType ||
        t.businessType === businessType ||
        t.businessType === 'geral'
    );
}

/**
 * Buscar template por ID
 */
export function getTemplateById(id: string): IMessageTemplate | undefined {
    return MESSAGE_TEMPLATES.find(t => t.id === id);
}

/**
 * Preencher variáveis do template
 */
export function fillTemplateVariables(template: string, variables: { [key: string]: string }): string {
    let filledTemplate = template;

    // Substituir cada variável no template
    Object.keys(variables).forEach(key => {
        const value = variables[key] || '';
        const regex = new RegExp(`{{${key}}}`, 'g');
        filledTemplate = filledTemplate.replace(regex, value);
    });

    // Remover variáveis não preenchidas
    filledTemplate = filledTemplate.replace(/{{[^}]+}}/g, '[...]');

    return filledTemplate;
}