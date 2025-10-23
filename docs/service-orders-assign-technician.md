# Permissão para alterar responsável na Ordem de Serviço

## Visão geral
- Fluxo acessível no modal **Ordens de Serviço > Registrar/Editar**.
- A coluna "Técnico" (responsável) aparece quando:
  - o usuário é administrador; ou
  - o perfil possui a nova permissão `serviceOrders > assignTechnician`.
- Mantém a regra existente de edição apenas nas três primeiras etapas do fluxo (BUDGET, AUTORIZATION, PARTS).

## Como habilitar
1. Acessar `Registros > Colaboradores` e abrir o perfil desejado.
2. Na aba **Permissões > Ordens de Serviço**, marcar **Alterar responsável**.
3. Salvar o perfil. Usuários associados passam a ver o seletor de responsável na próxima abertura da OS.

## Detalhes técnicos
- `ServiceOrdersRegisterComponent.permissionsSettings` lê `assignTechnician` de `Utilities.permissions('serviceOrders')` e fornece fallback seguro (false) quando ausente.
- O template (`register.component.html`) já condicionava a coluna a `(isAdmin || permissions.assignTechnician)`; bastou expor a permissão no gerenciador global.
- `PermissionsService` adicionou `assignTechnician` ao dataset padrão de ações de `serviceOrders`, o que torna o toggle visível na modal de perfis.
- Traduções atualizadas em `collaborators.translate.ts` garantem rótulos amigáveis (“Alterar responsável” / “Assign technician”).

## Testes sugeridos
1. **Perfil sem permissão**: remover a permissão, abrir uma OS existente → coluna de técnico não deve aparecer.
2. **Perfil com permissão**: habilitar a permissão, reabrir a OS → coluna aparece e permite trocar o responsável.
3. **Etapas avançadas**: com permissão ativa, testar uma OS na etapa `REPAIR` ou superior → coluna permanece oculta respeitando `canEditExecutor()`.
4. **Persistência**: após alterar o responsável, salvar a OS e reabrir para garantir que `service.executor` permanece associado ao colaborador escolhido.
