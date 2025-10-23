# Trava de Descontos no PDV

## Visão geral
- Configuração opcional (`Configurações > Caixa > Bloquear descontos no PDV`).
- Quando ativa, apenas usuários administradores podem autorizar descontos globais ou por item.
- Solicita usuário e senha de um administrador diretamente no PDV; sem aprovação, a operação é bloqueada.

## Fluxo
1. Usuário aplica um desconto (global, por item ou ajustando o preço unitário/customizado).
2. Nada acontece imediatamente; o operador segue editando a venda normalmente.
3. Ao clicar em **Registrar** (ou atalho F4), se houver desconto e o usuário não for admin, o modal de autorização aparece.
4. O operador pode: (a) informar usuário/senha de um administrador; ou (b) usar **Salvar como pendente** para que a venda fique aguardando aprovação.
5. As credenciais são validadas contra a coleção `#SYSTEM_AUTHENTICATE#` sem trocar a sessão ativa.
6. A decisão (aprovada ou pendente) é registrada em `discountApproval` junto com a venda.
7. Sem autorização e sem marcar como pendente, `CashierFrontPDVService.registerSale` bloqueia o salvamento da venda.

## Observações técnicas
- `SettingsService.updateCashierDiscountLock` persiste a flag em `cashier.lockDiscounts`.
- O estado local é espelhado via `Utilities.localStorage('CashierLockDiscounts')` e exposto pelo getter `Utilities.cashierLockDiscounts`.
- Somente comissões de produtos são abatidas da Receita Final; comissões de serviços já integram o custo.
- A coluna "Pago" permanece baseada em `product.paymentAmount` (`unitaryPrice * quantity`).
- Qualquer redução manual de preço (unitário do produto, customPrice do serviço ou adicional negativo) também conta como desconto e exige aprovação.
- A autorização expira assim que o operador altera novamente o valor do desconto ou o preço editado.
- Se o operador salvar como pendente, o status da venda permanece `PENDENT`, `discountApproval.status = 'pending'` recebe o usuário que solicitou e o backend permite a gravação apenas nesse cenário.
- As comissões dos relatórios já levam em conta o desconto líquido (inclusive global), evitando pagar comissão cheia sobre valores abatidos.
- Ao reabrir a venda, os campos de desconto e o total já aparecem sincronizados com o abatimento anterior (não é necessário redigitar o valor).

## Testes sugeridos
1. **Flag desativada**: aplicar descontos e concluir venda normalmente (nenhum prompt deve aparecer).
2. **Flag ativada + usuário comum**:
   - Aplicar desconto, tentar registrar e cancelar o modal → venda continua bloqueada.
   - Usar **Salvar como pendente** → venda gravada com status `PENDENT` e `discountApproval.status = 'pending'`; conferir no painel de vendas.
   - Inserir credenciais inválidas no modal → mensagem de erro e bloqueio mantido.
   - Inserir credenciais válidas → venda liberada e Receita Final ajustada.
3. **Alteração manual de preço**: reduzir o preço unitário/customizado de um item e tentar registrar. O modal deve aparecer mesmo sem preencher o campo "desconto".
4. **Fluxo de aprovação posterior**: abrir a venda pendente com um administrador. O total já deve exibir o desconto aplicado; ao registrar novamente a venda deve ser concluída e `discountApproval.status` atualizado para `approved` (mantendo quem solicitou).
5. **Flag ativada + usuário admin logado**: concluir venda com desconto sem exigir modal.
6. Conferir após aprovação se `CashierSales.discountApproval` contém `approvedBy` e, quando pendente, `requestedBy`.
