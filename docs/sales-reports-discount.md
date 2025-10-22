# Relatórios de Vendas x Descontos

## Problema histórico
- As vendas concluídas no PDV salvavam o total líquido (já com desconto manual) em `balance.total`.
- Durante a geração dos relatórios de caixa (`cashier.service`), o fluxo reconstruía o total a partir dos itens, zerando os descontos e somando apenas o valor cheio dos produtos/serviços.
- Resultado: relatórios "Vendas" e "Vendas por Colaborador" exibiam o preço cheio, ignorando o desconto concedido ao cliente.

## Correção implementada
- Mantemos os descontos existentes em cada produto/serviço e apenas agregamos diferenças de preço quando necessário.
- Os descontos manuais (armazenados apenas em `balance.subtotal.discount`) são preservados e aplicados novamente após eventuais filtros por departamento.
- O valor utilizado para `balance.total`, `totalAmountBilled`, `partialRevenue` e demais métricas volta a ser o total líquido original da venda.
- A coluna "Pago" dos relatórios consome `product.paymentAmount` (`unitaryPrice * quantity`), já
  com descontos aplicados. Esse comportamento está documentado em `cashier.service.ts` junto ao
  cálculo dos itens para evitar regressões.
- Comissões de produtos são abatidas na Receita Final (e passam a ser expostas em
  `balance.productCommission`). Comissões de serviços já estavam representadas no custo do serviço,
  portanto não são descontadas novamente.

## Impacto
- Colunas de desconto, receita parcial/final e totais dos relatórios passam a refletir exatamente o que foi cobrado do cliente.
- Comissionamento e análises financeiras voltam a considerar o valor com desconto.

## Teste manual sugerido
1. Registrar uma venda no PDV com desconto manual (por exemplo, 10% no total).
2. Reabrir o modal de relatórios financeiros > Caixa > Vendas por Colaborador (Sintético e Analítico).
3. Validar que `Valor de Vendas`, `Receita Parcial`, `Receita Final` e `Desconto` exibem o valor líquido.
4. Conferir que a coluna "Pago" apresenta o valor efetivamente cobrado (após desconto), batendo com o registro bruto da venda.
