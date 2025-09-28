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
