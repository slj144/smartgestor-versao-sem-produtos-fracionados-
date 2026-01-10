Título: Relatório de Vendas por Colaborador – filtro por produto respeitando período

Resumo do problema
- Ao gerar “Relatório de Vendas por Colaborador (Analítico/Sintético)” informando um ou mais códigos de produto, o período selecionado (ex.: Hoje) podia ser ignorado e retornar vendas de todos os tempos para aquele(s) produto(s).

Causa raiz
- No componente de UI do relatório (`cashier.component.ts`), quando havia lista de produtos filtrados, era feito `where.push(filter.products)`, inserindo um array dentro do array de cláusulas. Isso interferia na composição de consultas, causando perda efetiva dos filtros de data em alguns cenários.

Correção aplicada
- Removido o `where.push(filter.products)` e mantido apenas o uso do array `or` para os produtos (válido para Analítico e Sintético).
- A filtragem detalhada por produtos continua sendo aplicada em `cashier.service.ts` na fase de tratamento dos registros retornados, preservando os filtros de período definidos.

Arquivos impactados
- hosting/src/app/pages/reports/components/modal/components/cashier/cashier.component.ts
  - Comentário de bloco no topo com propósito e a nota da correção.
  - Seção de geração do relatório de vendas ajustada para não inserir `filter.products` dentro de `where`.

Comportamento após a correção
- “Hoje” retorna somente vendas do dia, mesmo com produto(s) filtrado(s), tanto no Analítico quanto no Sintético.
- Mesma regra para “Esta semana”, “Este mês”, “Mês anterior” e “Personalizado”.

Observação técnica
- No serviço (`cashier.service.ts`), o campo `date` das cláusulas é mapeado para `paymentDate` durante a consulta e o agrupamento pode usar `registerDate` ou `paymentDate` conforme o tipo de relatório. Este comportamento é intencional e foi mantido.

---

Atualização de 2024-XX-XX – Coluna “Receita Líquida (s/ Taxas)”

Motivação
- Algumas empresas liquidam comissões usando o relatório de vendas por colaborador. Os colaboradores recebem sobre o valor que de fato chega após a operadora de cartão descontar as taxas, não sobre a receita bruta/ parcial.
- O relatório já demonstrava “Receita Parcial” e “Receita Final” (parcial menos custos de serviços/produtos), porém não havia nenhuma coluna evidenciando o total líquido pós taxas de pagamento. Isso obrigava o gestor a exportar o CSV e recalcular manualmente.

Solução implementada
- Criado o campo `netRevenue` no processamento dos relatórios “Vendas por Colaborador (Sintético)” e “(Analítico)”.
  - O serviço (`cashier.service.ts`) agora calcula o custo total de meios de pagamento (`balance.paymentsCosts`) por venda, aplica rateio proporcional quando o usuário filtra por produtos e armazena esse valor por colaborador.
  - `netRevenue` é definido como `partialRevenue - paymentCosts`. No modo filtrado por produto, tanto `partialRevenue` quanto `paymentCosts` são proporcionalmente recortados.
  - Os totais acumulados (`balance.netRevenue`) foram adicionados tanto para o modo sintético quanto analítico, preservando as demais métricas e a margem de contribuição.
- A camada de visualização (`layer.component.html`) ganhou a nova coluna entre “Receita Parcial” e “Receita Final” e o rodapé passou a exibir o somatório da receita líquida.
- Traduções PT/EN foram ampliadas para que o campo apareça com os rótulos “Receita Líquida (s/ Taxas)” / “Net Revenue (no fees)” nos dois relatórios.

Arquivos impactados
- `hosting/src/app/pages/reports/components/modal/components/cashier/cashier.service.ts`
  - Adicionada a derivação de `paymentCosts` e `netRevenue` por venda/colaborador.
  - Ajustados os objetos de balance sintético e analítico para armazenar os totais.
- `hosting/src/app/pages/reports/components/modal/components/cashier/cashier.translate.ts`
  - Inclusão das chaves `netRevenue` nas seções `salesPerUserSynthetic` e `salesPerUserAnalytical` para PT/EN.
- `hosting/src/app/pages/reports/components/modal/components/cashier/layer/layer.component.html`
  - Atualizado o layout das tabelas sintética e analítica para exibir a nova coluna e o somatório.

Considerações de uso
- Nenhum filtro ou permissão adicional foi criado: qualquer usuário que já visualiza “Receita Parcial” verá a coluna “Receita Líquida”.
- O valor continua compatível com a exportação CSV, pois os dados usados no layer são exatamente os retornados pelo serviço.
- O cálculo respeita vendas com múltiplos meios de pagamento; cada taxa é somada antes de aplicar o rateio por colaborador/produto.
