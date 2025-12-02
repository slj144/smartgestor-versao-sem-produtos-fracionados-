# Relatório de Transações Bancárias – filtro por conta

## Contexto
Até agora o relatório `Transações Bancárias` sempre retornava o extrato consolidado de todas as contas da filial. Para conferir apenas os lançamentos de um banco específico era preciso exportar tudo e filtrar manualmente, o que era lento e propenso a erros.

## Comportamento
- A tela de filtros exibe o seletor **Conta Bancária** assim que o relatório de transações é aberto. A opção "Todas as Contas" mantém o comportamento anterior.
- Ao escolher uma conta, o relatório (e a exportação XLS) traz somente os registros cujo `bankAccount.code` corresponde ao código selecionado.
- A lista de contas respeita a loja escolhida no topo da tela: ao trocar de filial o seletor é recarregado automaticamente e volta para "Todas as Contas" caso a conta anterior não pertença à nova loja.

## Implementação
- **Componentes**: `hosting/src/app/pages/reports/components/modal/components/financial/financial.component.{ts,html}` recebem o novo `FormControl` (`bankAccount`), os handlers `onStoreChange`/`onGetBankAccounts` e o `<select>` no formulário. Durante o `onGenerateReport` o filtro é convertido em cláusula `bankAccount.code = X` na chamada `getBankTransactions`.
- **Serviço**: `hosting/src/app/pages/reports/components/modal/components/financial/financial.service.ts` ganhou o método `listBankAccounts(ownerId)` para buscar e ordenar as contas da filial selecionada, evitando mudar o fluxo existente do módulo de Contas Bancárias.
- **Traduções**: `financial.translate.ts` expõe os novos textos em pt_BR/en_US para manter o formulário consistente.

## Teste manual sugerido
1. Abra **Relatórios > Financeiro > Transações Bancárias**, selecione um período curto e gere o relatório com "Todas as Contas" para anotar o total.
2. Selecione uma conta específica, gere novamente e valide que apenas os lançamentos daquela conta aparecem e que o total corresponde ao somatório exibido na tela de Contas Bancárias para o mesmo período.
