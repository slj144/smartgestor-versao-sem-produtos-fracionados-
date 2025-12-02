# Relatório de Comissões – impacto de ajustes de preço no PDV

## Contexto
- As documentações existentes (`docs/sales-reports-discount.md` e `docs/pdv-discount-lock.md`) já descrevem como descontos impactam receita e travas de autorização, porém não abordam a relação direta com o cálculo de comissões.
- O problema reportado ocorre quando, no PDV, o operador altera manualmente o valor unitário de um produto. Mesmo configurando a comissão em porcentagem no cadastro do item, o relatório de comissões continua calculando sobre o valor original do cadastro e não sobre o valor final cobrado.

## Fluxo atual (visão ponta a ponta)
1. **Cadastro de Produto**
   - Em `hosting/src/app/pages/stock/products/components/modal/components/register/register.component.ts:631-639` o produto salva `commission { enabled, type, value }`, permitindo valores fixos ou percentuais.
2. **Venda no PDV / Ajuste de preço**
   - Durante a geração do balanço (`cashier-pdv.component.ts:1295-1312`) o PDV calcula `totalProducts` usando `salePrice` (preço de tabela) ou `unitaryPrice` (preço editado). Qualquer redução manual incrementa `balance.totalDiscount`; aumentos apenas sobreescrevem o total dos produtos.
   - No momento do envio da venda (`cashier-pdv.component.ts:1560-1632`), cada item recebe `salePrice`, `unitaryPrice`, `quantity` e o bloco `commission` copiado do cadastro. Não há normalização adicional para descontos/aportes manuais neste payload.
3. **Persistência / `CashierSales`**
   - Conforme descrito em `docs/backend-architecture.md`, os dados do PDV são gravados em `CashierSales` via functions, preservando `balance.subtotal.discount`, `products[]` e `commission`.
4. **Relatórios**
   - O relatório de Caixa → Comissões (`cashier.service.ts:229-420`) chama `normalizeCommissionBases` para tentar redistribuir descontos globais. Contudo, essa rotina (`cashier.service.ts:1794-1835`) prioriza `salePrice` como base (`prod?.salePrice ?? prod?.unitaryPrice`).
   - Em seguida, tanto `CashierReportsService` quanto `FinancialReportsService` (`financial.service.ts:929-1033`) calculam `lineTotal` usando `prod.__commissionBase` ou `paymentAmount`, mas a base continua presa ao valor original se `__commissionBase` não refletir o ajuste manual.

## Pontos observados
- **Aumentos de preço**: quando `unitaryPrice > salePrice`, não existe registro de desconto ou acréscimo específico; assim, `normalizeCommissionBases` considera `salePrice` como base e não enxerga o novo valor unitário.
- **Reduções de preço**: reduções funcionam parcialmente porque o método `generateBalance` alimenta `balance.totalDiscount`, permitindo que `normalizeCommissionBases` redistribua esse desconto proporcionalmente.
- **Relatórios impactados**: ambos os relatórios de caixa (`Comissões Analítico/Sintético`) e o relatório financeiro (aba Comissões) compartilham a mesma lógica de base, portanto todos exibem a comissão percentual antiga quando há aumento manual.
- **Serviços**: os serviços enviam `commission` já transformada em valor fixo (`cashier-pdv.component.ts:1533-1549`). Isso explica por que apenas produtos percentuais sofrem o problema.

## Recomendações (sem alterar comportamento atual)
1. **Documentar o fluxo** (feito neste arquivo) para que todos entendam as dependências entre PDV, `CashierSales` e relatórios.
2. **Definir critérios de normalização**: alinhar com o time de produto se aumentos manuais devem ser tratados como “adicional” no contexto de comissão ou se devem somente atualizar a base de cálculo.
3. **Plano de correção futura**:
   - Ao serializar os itens (PDV), persistir um campo explícito de `finalUnitPrice` ou `commissionBase`, evitando depender de deduções posteriores.
   - Atualizar `normalizeCommissionBases` para considerar `unitaryPrice` (valor final) mesmo na ausência de desconto registrado, garantindo que porcentagens incidem sobre o preço efetivamente praticado.
   - Validar o impacto com testes manuais descritos em `docs/sales-reports-discount.md`, assegurando que Receita Final continue abatendo apenas `productCommission`.

## Próximos passos sugeridos
1. **Workshops rápidos com suporte/financeiro** para confirmar como a comissão deve reagir em cada cenário (desconto, aumento, troca de quantidade).
2. **Criação de casos de teste no relatório de comissões** cobrindo: (a) desconto manual; (b) aumento manual; (c) preço intacto; (d) comissão fixa x percentual.
3. **Monitoria de dados históricos**: extrair amostras de `CashierSales` (produtos com `unitaryPrice` diferente de `salePrice`) para mensurar o impacto antes de qualquer alteração futura.

## Cenário exemplificado
- Produto cadastrado a R$ 100 com comissão de 10% (percentual).
- No PDV, operador altera `unitaryPrice` para R$ 120 para cobrir frete extra.
- O registro enviado mantém `salePrice = 100`, `unitaryPrice = 120`, `commission.value = 10` e **não** preenche nenhum campo adicional indicando acréscimo.
- `normalizeCommissionBases` calcula `gross = salePrice * quantity = 100`, não identifica desconto e define `__commissionBase = 100`.
- No relatório (`cashier.service.ts:334-349` e `financial.service.ts:944-1027`) o `lineTotal` utilizado para a comissão é 100, portanto a comissão fica R$ 10 em vez de R$ 12 esperados.

## Causa raiz técnica detalhada
1. **Ausência de campo “final unit price” para comissionamento**: o PDV envia somente `salePrice` (catálogo) e `unitaryPrice` (final). Porém, `normalizeCommissionBases` usa `salePrice ?? unitaryPrice`, privilegiando `salePrice` sempre que existir (`cashier.service.ts:1812-1836`), o que acontece em todos os produtos cadastrados.
2. **Redistribuição depende de `balance.subtotal.discount`**: acréscimos não alimentam esse campo (`cashier-pdv.component.ts:1295-1359`), logo não há trigger para recalcular bases maioradas.
3. **Relatórios compartilham a mesma base**: tanto `CashierReportsService` quanto `FinancialReportsService` leem `__commissionBase`/`paymentAmount` (`cashier.service.ts:334-346`, `financial.service.ts:944-958`). Como o valor nunca foi ajustado para acréscimo, todos os pontos de consumo retornam a comissão original.

Sem intervenção no comportamento atual, a única forma de justificar a discrepância é explicitar que “comissão percentual segue sempre o preço cadastrado quando há aumento manual”. Caso o produto precise respeitar o valor final, será necessário implementar uma das recomendações listadas.

## Correção aplicada
- `normalizeCommissionBases` (tanto em `cashier.service.ts` quanto em `financial.service.ts`) agora calcula `gross`/`__commissionBase` com o **maior** valor entre `salePrice` e `unitaryPrice`. Assim:
  - Descontos continuam respeitando `salePrice` porque, quando `unitaryPrice` é menor, o maior valor segue sendo `salePrice` e o campo `discount` já reduz a base.
  - Acréscimos passam a ser considerados automaticamente, pois `unitaryPrice` torna-se o maior valor e é usado na base de comissão.
- Nenhum outro fluxo do PDV foi alterado; apenas o cálculo dentro dos relatórios foi ajustado para refletir o preço efetivo quando há aumento manual.

## Teste manual recomendado
1. Cadastre um produto com `salePrice = 100` e comissão de 10% (percentual).
2. No PDV:
   - Caso A (desconto): reduza o unitário para 80, finalize a venda e gere o relatório de comissões → a comissão deve continuar 8 (tal como antes).
   - Caso B (acréscimo): aumente o unitário para 120 e finalize a venda → o relatório deve exibir comissão de 12, confirmando que o ajuste foi aplicado.
3. Compare os resultados nas abas **Caixa > Comissões (Analítico/Sintético)** e **Financeiro > Comissões** para garantir consistência.
