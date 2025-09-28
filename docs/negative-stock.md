Título: Permitir venda com estoque negativo

Resumo
- Novo parâmetro de configuração: `Estoque > Permitir venda com estoque negativo`.
- Quando ativado, o PDV permite vender itens mesmo sem saldo disponível (estoque pode ficar negativo).
- Comportamento padrão permanece inalterado (opção desativada por padrão).

Onde configurar
- Ir em `Configurações` > seção `Estoque` > opção `Permitir venda com estoque negativo`.
- Ativar a opção e confirmar.

Efeito prático
- PDV (CashierFrontPDV):
  - Campo de quantidade deixa de limitar pelo saldo disponível.
  - Leitura por scanner incrementa a quantidade mesmo quando o saldo já foi atingido.
  - Alerta “Fora de Estoque” no seletor de produtos deixa de bloquear a seleção.

 Escopo atual
- Implementado no PDV e no seletor de produtos.
- Ordens de Serviço: quantidade de itens de produtos deixa de ser limitada pelo saldo disponível quando a opção está ativa.
- Outros fluxos (ex.: Transferências, Compras) continuam com o comportamento atual de bloqueio por saldo.

Persistência e cache
- O valor é salvo em `Settings/{storeId}.stock.allowNegativeSale`.
- Também é espelhado no cache local (`Utilities.localStorage('StockAllowNegativeSale')`) para leitura rápida no cliente.

Super Admin / Nova Instância
- Recomendação: no ato da criação de instância (função `createProjectInstance`), criar opcionalmente o documento `Settings/{storeId}` com `stock.allowNegativeSale = false` por padrão (ou verdadeiro se selecionado via UI do Super Admin no futuro).

Principais pontos no código
- UI:
  - `hosting/src/app/pages/settings/settings.component.html`: seção Estoque reativada e nova opção adicionada.
  - `hosting/src/app/pages/settings/components/modal/components/stock/stock.component.html|ts`: novo bloco para a opção.
  - `hosting/src/app/pages/settings/settings.translate.ts`: textos em pt_BR e en_US.
- Serviço:
  - `hosting/src/app/pages/settings/settings.service.ts`: método `updateStockAllowNegativeSale`, e espelhamento para cache local no `treatData`.
- PDV / Seleção:
  - `hosting/src/app/pages/cashier/cashier-front/components/cashier-pdv/cashier-pdv.component.ts`: quantidade deixa de ser limitada pelo saldo quando a opção está ativa.
  - `hosting/src/app/pages/stock/products/components/selector/selector.component.ts`: não bloqueia alerta de fora de estoque e permite incrementos via scanner quando a opção está ativa.

Notas de manutenção
- Comentários foram adicionados nos pontos críticos para orientar futuras alterações.
- Caso deseje estender para Ordens de Serviço, replicar a leitura do flag nas telas de item e remover o limite superior do `FieldMask.numberFieldMask` de forma análoga.
