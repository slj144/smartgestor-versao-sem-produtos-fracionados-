# Alíquota Global de ISS nos Serviços

## Visão geral
- Acesso pelo menu lateral `Registros > Serviços` → botão de opções → **Configurar alíquota padrão de ISS** (visível para perfis fiscais/admin).
- Slider + campo numérico para definir uma alíquota global de ISS (0%–15%).
- Botão "Aplicar alíquota em todos os serviços" executa atualização em lote, preservando demais campos de cada serviço.
- Fluxos individuais de cadastro/edição permanecem inalterados; a funcionalidade é complementar.

## Fluxo
1. Abrir o módulo `Registros > Serviços` e clicar no ícone de lista (`…`).
2. Selecionar **Configurar alíquota padrão de ISS**.
3. Ajustar o slider ou digitar o percentual desejado (0 ≤ X ≤ 15).
4. Confirmar com **Aplicar alíquota em todos os serviços**; o botão entra em modo de carregamento até o término.
5. A notificação confirma o resultado e a listagem é atualizada automaticamente via listeners ativos.

## Observações técnicas
- `ServicesIssConfigComponent` trabalha com `FormGroup` dedicado, sanitizando o valor (0‒15) e sincronizando slider/número sem warnings de formulário.
- `ServicesService.applyIssAliquotaToAllServices` pagina todos os documentos via `fetchAllServices`, aplica `FieldValue.date` como `modifiedDate` e atualiza até 400 registros por batch para respeitar limites do Firestore.
- A escrita sempre atinge `tributes.iss.aliquota`; para filiais, replica em `branches.<storeId>.tributes.iss.aliquota`, mantendo particularidades locais.
- Feedback visual usa `Utilities.loading` + `NotificationService`, com mensagens dedicadas em `services.translate.ts` (pt_BR/en_US).

## Testes sugeridos
1. **Atualização simples**: definir 5% e confirmar → reabrir um serviço e verificar `ISS > alíquota = 5,00`.
2. **Limite superior**: informar 20% → valor deve ser clampado para 15% e refletir no campo após blur.
3. **Loja filial**: aplicar uma alíquota diferente e validar que os dados ficam em `branches.<storeId>.tributes.iss.aliquota` (Firestore) e aparecem no formulário.
4. **Erro em lote**: forçar perda de conexão antes de confirmar → o loading deve encerrar e a notificação de erro ser exibida sem alterar os registros.
