# Vehicles – Busca em Instâncias de Oficina

## Contexto
- Ticket: ajuste solicitado para instâncias de oficina (perfis `Mechanics`/`Mechanics/Fiscal`) permitindo localizar veículos pelo proprietário ou pelo modelo.
- Objetivo: ampliar o filtro sem alterar o comportamento das demais instâncias.

## Escopo da Mudança
- **Veículos (cadastro):** Quando o perfil atual contém `Mechanics`/`Oficina` no `profile.name` **ou** possui simultaneamente veículos e serviços/ordens de serviço ativos, o filtro rápido passa a aceitar textos que cruzam `placa`, `model` e `proprietary.name` usando cláusulas `OR`, mantendo a busca numérica por `code`.
- **Ordens de Serviço:** O mesmo critério de detecção habilita buscas por `customer.name`, `vehicle.plate`, `vehicle.model` e `vehicle.proprietary.name` no filtro rápido das OS.
- Para os demais perfis, nada muda: buscas textuais continuam seguindo o comportamento original (placa no cadastro e cliente nas OS).

## Implementação
- Novo helper `Utilities.isWorkshopInstance` concentra a heurística (`profile.name`, `vehicles`, `services`, `serviceOrders`) e evita duplicação.
- `hosting/src/app/pages/registers/vehicles/vehicles.component.ts`
  - Busca consulta `Utilities.isWorkshopInstance` diretamente para definir quando expandir os filtros.
  - `onSearch` mantém o early return para códigos e ativa o modo flex quando estamos em oficina.
- `hosting/src/app/pages/services/serviceOrders/serviceOrders.component.ts`
  - Busca consulta o helper diretamente antes de empilhar as cláusulas extras.
  - `onSearch` reaproveita o helper para decidir quando empilhar cláusulas em `customer/vehicle` e consulta o serviço com `flex = true`.
  - Mantivemos o early return para códigos e passamos o filtro `filterDataPerOperator` ao serviço para preservar a lógica pré-existente.
- `hosting/src/app/pages/registers/vehicles/components/selector/selector.component.ts`
  - Selector usado na criação de OS herdou a mesma heurística (código ou OR entre placa/modelo/proprietário) e agora decide dinamicamente quando usar `flex`.
  - Busca do selector responde a código ou OR entre placa/modelo/proprietário conforme a heurística do helper.
- `hosting/src/app/pages/services/serviceOrders/serviceOrders.service.ts`
  - O `collRef` agora respeita `settings.or`, permitindo que consultas com `flex = true` realmente gerem cláusulas `OR` no banco (antes eram ignoradas).

### Rollback / Remoção
1. **Front (componentes):**
   - Reverter chamadas ao helper `Utilities.isWorkshopInstance` e restaurar a busca antiga que consultava apenas por placa (veículos/selector) ou cliente (OS).
2. **ServiceOrdersService:** Restaurar `collRef` para não chamar `collection.or`, caso a camada de dados não deva aceitar OR.
3. **Documentação:** voltar este arquivo para a versão anterior (git revert ou checkout).
4. **Smoke test:** garantir que buscas por código e placa continuam operando como antes.

> Dica: como tudo está isolado em commits que tocam arquivos específicos (`vehicles.component.ts`, `serviceOrders.component.ts`, `selector.component.ts`, `Utilities`, `serviceOrders.service.ts`), um rollback parcial é simples via `git checkout HEAD~1 -- <arquivo>` se necessário.

## Testes Recomendados
1. Acessar uma instância `Mechanics`/`Mechanics/Fiscal`.
2. No registro de veículos:
   - buscar por parte do nome do proprietário → veículo listado.
   - buscar por parte do modelo → veículo listado.
   - buscar por parte da placa → comportamento inalterado.
   - digitar código numérico → pesquisa exata por código continua funcionando.
3. Repetir o fluxo em uma instância que não seja de oficina → somente placa deve ser utilizada na busca textual (mesmo comportamento anterior).
4. Em Ordens de Serviço:
   - pesquisar pelo nome do cliente em geral → funcionamento normal.
   - pesquisar pelo nome do proprietário vinculado ao veículo ou pelo modelo/placa → resultado listado em instâncias de oficina; em outros perfis permanece apenas por cliente.
5. No modal de criação/edição de OS (selector de veículos):
   - repetir as buscas acima (código, placa, modelo, proprietário).
   - verificar no console os logs `[WorkshopSearch][vehicles:selector]` confirmando quando `flex` está `true`.

## Observações
- Nenhum endpoint ou schema foi alterado; a mudança é inteiramente front-end.
- O uso de `RegExp` segue o padrão existente nos demais módulos.
