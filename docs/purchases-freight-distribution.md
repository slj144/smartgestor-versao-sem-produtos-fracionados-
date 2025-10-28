# Rateio de Frete nas Compras

## Contexto
- Em muitas NF-e o frete chega junto com os produtos, mas o custo real acaba sendo ajustado manualmente.
- Criamos um campo de frete no modal de compras para diluir automaticamente esse valor no custo unitário de cada item, mantendo o comportamento atual para quem não usa o recurso.

## Como funciona
1. Informe o valor do frete no novo campo localizado abaixo do balanço financeiro.
2. O sistema normaliza os custos de cada produto (armazenando o custo base sem frete) e rateia o frete proporcionalmente ao valor total de cada item.
   - Se todos os itens estiverem com custo zero, usamos a quantidade como fallback para o rateio.
3. O custo unitário exibido na tabela passa a incluir a parcela de frete, enquanto o subtotal mostra o custo dos produtos sem frete e o quadro Total soma a parcela rateada.
4. Na geração da conta a pagar e no depósito do estoque, o custo utilizado já é o custo ajustado com frete.
5. Ao editar uma compra, preservamos `freight`, `freightShare` e `freightShareUnit` para recomputar o rateio sem perdas.

## Detalhes técnicos
- `PurchasesRegisterComponent` agora mantém `item.baseCostPrice`, `freightShare` e `freightShareUnit` para evitar reprocessamento acumulativo.
- `generateBalance()` chama `applyFreightDistribution()` antes de calcular totais, garantindo sincronia com parcelas e contas a pagar.
- O parser de XML (`Utilities.parseXMLNfe`) lê `vFrete` quando disponível e pré-preenche o campo.
- No `composeData()` o frete é persistido em `purchase.freight` e cada produto guarda sua fração (`freightShare`, `freightShareUnit`).

## Pontos de atenção
- Frete zero mantém o fluxo intacto (custos e totais seguem como antes).
- Ajustes manuais no custo unitário recalculam o custo base automático antes do novo rateio.
- O rateio sempre fecha com o valor informado de frete; o último item absorve diferenças de arredondamento.

## Testes sugeridos
- Importar uma NF-e com `vFrete`, validar preenchimento automático e custo final.
- Informar frete manual em uma compra nova, editar custos e quantidades e confirmar que o total acompanha.
- Concluir a compra e verificar o custo final do produto no estoque, além das parcelas geradas na conta a pagar.
