# Restaurante – Plano de Implementação (MVP)

## 1) Objetivos e Decisões

- Objetivo: Adaptar o sistema para restaurantes sem quebrar módulos existentes e mantendo performance.
- Decisões de MVP:
  - Pagamento online: fora do escopo (pagar no balcão/entrega/retirada).
  - Taxa de serviço: configurável por filial (branch).
  - Abordagem de pratos: iniciar por "sob demanda" (abate insumos no fechamento do pedido). Produção em lote entra na fase 2.
  - KDS (cozinha): começar com 1 estação unificada. Estações por setor (bar, chapa, fria) entram na fase 2.
  - Modificadores/adicionais: começar com observações simples e itens adicionais como produtos separados (sem combinatória complexa). Modificadores estruturados entram na fase 2.
  - Integração com `Requests`/PDV: converter pedidos restaurante para `Request` apenas no fechamento (checkout), reaproveitando estoque/financeiro/relatórios existentes.

Não objetivos do MVP:
- Split/merge de contas avançado (rateio por pessoa), impressoras de cozinha, integrações com iFood e pagamentos online.

## 2) Arquitetura (visão geral)

- Frontend Angular (lazy): novos módulos `Restaurants` independentes.
- Backend Functions: novos handlers `restaurants.*` (sem alterar endpoints legados).
- Dados (Firestore/iTools): novas coleções: `Recipes`, `RestaurantTables`, `RestaurantOrders`.
- Estoque: abate de insumos no fechamento (sob demanda) ou na produção (lote – fase 2).
- Requests/PDV: `RestaurantOrder` -> `Request` na conclusão. PDV/Financeiro seguem inalterados.

## 3) Novos Módulos e Rotas (Frontend)

- Menu (mostrar somente para perfil Restaurant):
  - Cozinha (KDS): `/restaurante/cozinha`
  - Receitas: `/restaurante/receitas`
  - Mesas: `/restaurante/mesas`
  - Cardápio (config interno): `/restaurante/cardapio`

- Público (por tenant/loja):
  - Cardápio Digital: `/:tenantId/cardapio` (listagem, detalhe, carrinho, checkout)

- Implementação Angular:
  - Criar `RestaurantsModule` com child modules lazy: `kitchen`, `menu`, `tables`, `catalog` (interno).
  - Ajustar `pages.translation.ts` para títulos/rotas (somente quando `CompanyProfile['Restaurant']`).
  - Reaproveitar guards existentes (Auth/PagesGuard) para módulos internos e rota pública livre (apenas leitura/criação de order com token do tenant).

## 4) Modelos de Dados (Firestore)

### 4.1) Recipes
```
Recipes: {
  _id, tenantId, branchId,
  productId, productName,
  yield: number,         // rendimento do prato
  lossPct: number,       // percentual de perda
  ingredients: [         // insumos por rendimento
    { productId, name, qty, unit }
  ],
  createdAt, updatedAt
}
```

### 4.2) RestaurantTables
```
RestaurantTables: {
  _id, tenantId, branchId,
  code, name, capacity: number,
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED',
  qrToken: string,      // para QR da mesa (futuro)
  createdAt, updatedAt
}
```

### 4.3) RestaurantOrders
```
RestaurantOrders: {
  _id, tenantId, branchId,
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY',
  tableId?: string,
  waiter?: { _id, name },
  status: 'OPEN' | 'READY' | 'CLOSED' | 'CANCELED',
  items: [{
    productId, name,
    qty: number, unitPrice: number,
    notes?: string,                // observações
    addons?: [{ productId, name, qty, unitPrice }],
    station?: 'DEFAULT',           // fase 1
    status: 'NEW' | 'IN_PROGRESS' | 'DONE' | 'SERVED'
  }],
  serviceChargePct: number,        // por filial (preenchido no client via settings)
  subtotal: number,
  discounts?: number,
  fees?: number,
  total: number,
  createdAt, updatedAt,
  closedAt?: string,
  requestCode?: number             // preenchido ao fechar (vinculo com Requests)
}
```

Índices recomendados:
- RestaurantOrders: `(tenantId, branchId, status)`, `(tenantId, branchId, tableId, status)`.
- RestaurantTables: `(tenantId, branchId, status)`.
- Recipes: `(tenantId, branchId, productId)`.

## 5) Fluxos do MVP

### 5.1) Garçom/Mesas (Dine-in)
1) Abrir mesa: cria `RestaurantOrder` (OPEN) com `tableId` e itens.
2) Enviar à cozinha: itens entram como `NEW`.
3) Cozinha atualiza status dos itens: `IN_PROGRESS` -> `DONE`.
4) Garçom marca como `SERVED` (opcional) e adiciona/edita itens.
5) Fechamento: aplica taxa de serviço por filial, calcula total e converte para `Request`.
6) `RequestsService`/PDV processam venda conforme regra atual (sem pagamento online).

### 5.2) Balcão/Retirada (Takeaway)
1) Cria `RestaurantOrder` (OPEN) sem `tableId`.
2) Mesma jornada KDS.
3) Fechamento -> `Request` e pagamento no balcão.

### 5.3) Entrega (Delivery)
1) Cria `RestaurantOrder` com dados do cliente e endereço (futuro, MVP pode usar observação).
2) KDS igual.
3) Fechamento -> `Request`; pagamento na entrega (sem online).

### 5.4) Cardápio Digital Público
1) `/:tenantId/cardapio`: lista categorias e itens.
2) Carrinho e checkout criam `RestaurantOrder` (TAKEAWAY/DELIVERY) com status OPEN.
3) Painel interno trata como pedido normal; pagamento no local/entrega.

## 6) Integração com Estoque

- Sob demanda (MVP):
  - Ao fechar o `RestaurantOrder` (converter para `Request`), abater insumos da `Recipe` proporcionalmente ao `qty` de cada item do pedido.
  - Logs de estoque: usar `EStockLogAction` já existente.

- Produção em lote (Fase 2):
  - Tela de produção: consumir ingredientes e creditar produto final (prato) em estoque.
  - Vendas passam a debitar produto final.

## 7) Backend – Cloud Functions (handlers)

- Namespace: `functions/src/restaurants/`
  - `orders.ts`
    - `createOrder`, `updateOrder`, `addItem`, `updateItemStatus`, `closeOrderToRequest`, `cancelOrder`.
  - `recipes.ts`
    - `getRecipe`, `saveRecipe`, `produceBatch` (fase 2), `computeIngredientsForQty`.
  - `public.ts`
    - `getPublicMenu`, `createPublicOrder`.

Pontos de atenção:
- Autorização PUBLIC apenas para leitura do cardápio e criação de `RestaurantOrder` público associado ao tenant (sem dados sensíveis). Escritas administrativas privadas.
- `closeOrderToRequest` faz:
  - cálculo de totais + taxa serviço;
  - geração de `Request`/`saleCode` como em `RequestsService` (reuso das mesmas rotinas onde possível);
  - abatimento de insumos via batch.

## 8) Frontend – Telas (MVP)

- Mesas:
  - Grid/lista de mesas (status, capacidade) e pedidos abertos.
  - Abertura de pedido por mesa, adicionar itens, observações, taxa serviço.

- Cozinha (KDS):
  - Lista por status: NEW, IN_PROGRESS, DONE (filtrar por filial/tenant). Ações: iniciar, concluir, desfazer.

- Receitas:
  - CRUD de receitas e vinculação ao produto final (prato). Relatório de custo (futuro).

- Cardápio Público:
  - Listagem/categorias, detalhe do prato, carrinho, checkout (TAKEAWAY/DELIVERY), confirmação.

## 9) Performance

- Angular:
  - Módulos lazy, change detection otimizada, unsubscribe nos Observables.
  - Paginação/scroll apenas onde necessário (KDS e listas com filtros por status/filial).

- Firestore/iTools:
  - Índices conforme seção 4.
  - Snapshots por `tenantId`, `branchId`, `status`; evitar watchers amplos.
  - Batches para fechamento/produção.

- Functions:
  - Validações leves e pré-cálculo de totais para minimizar operações.

## 10) Rollout por Fases

Fase 1 – Estrutura e Contratos
- Criar coleções e interfaces TS (front/shared) para Recipes, Tables, Orders.
- Novo namespace de Functions `restaurants.*` com stubs e validações básicas.
- Ajustes de tradução/menu/rotas (lazy) sem telas ainda.

Fase 2 – Mesas + KDS + Fechamento
- CRUD simples de mesas.
- Tela de criação/edição de pedido (itens, observações, taxa serviço).
- KDS unificado com mudança de status por item.
- Função `closeOrderToRequest` e integração estoque (sob demanda).

Fase 3 – Cardápio Público
- Rota pública `/:tenantId/cardapio` com listagem/detalhes/carrinho/checkout.
- Função `createPublicOrder`.

Fase 4 – Produção em Lote e Melhorias
- Tela de produção (consume insumos/credita prato).
- Estações de cozinha, modificadores estruturados, relatórios.

## 11) Critérios de Aceite (MVP)

- Abrir/editar/fechar pedido de mesa/balcão/entrega.
- KDS atualiza status por item, refletindo na tela do garçom.
- Fechamento converte para `Request`, abatendo insumos (sob demanda) e aplicando taxa de serviço por filial.
- Cardápio público cria pedidos OPEN sem pagamento online.
- Sem regressões em PDV/Requests/Estoque.

## 12) Riscos e Mitigações

- Sincronia KDS x Garçom: usar eventos/snapshots por status e batch para estados.
- Cálculo de insumos: cache leve por receita e validação de estoque mínimo.
- Concorrência no fechamento: bloquear duplo fechamento via flag/transaction.

## 13) Próximos Passos (após aprovação)

1) Scaffolding dos módulos Angular e rotas (sem lógica complexa).
2) Interfaces compartilhadas e services base (Orders/Tables/Recipes).
3) Endpoints `restaurants.*` (stubs) e índices.
4) Implementar Fase 2 conforme Rollout.

---
Observação: Este documento guia a implementação. Podemos iniciar a Fase 1 quando autorizado.

