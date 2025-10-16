# Stock Product Departments Feature

## Objetivo
Adicionar a noção de **Departamento** ao módulo de estoque para atender lojas com múltiplos setores operando sob o mesmo CNPJ. O campo deve ficar disponível no cadastro de produtos, ser transportado para compras e relatórios, e não impactar tenants que não desejarem usar o recurso.

## Ativação por Tenant
- O campo só aparece quando `ProjectSettings.profile.stock.components.departments.active === true`.
- Tenants sem essa flag continuam com o comportamento atual (campo oculto, dados não persistidos).
- Valores existentes ficam intactos; novos tenants podem ativar posteriormente sem migração adicional.

## Modelo de Dados
- Nova coleção: `StockProductDepartments` (mesmo padrão de Categorias/Unidades), contendo `{ _id, code, name, owner, registerDate, modifiedDate }`.
- `IStockProduct` recebe campo opcional `department?: { _id, code, name }`.
- `IStockPurchase.products[]` passa a carregar `department` para manter o histórico das compras.
- Exportação/Importação de produtos incluem coluna opcional de departamento (por código).

## Fluxos Atualizados
1. **Cadastro/Edição de Produto**
   - Novo select "Departamento" controlado pelo `ProductDepartmentsService` e pelo `general-selector`.
   - Persistência automática no documento do produto e, quando aplicável, na filial.
2. **Compras**
   - Produtos selecionados trazem departamento; novos cadastros via compra também exigem seleção quando ativo.
   - `PurchasesService` persiste o campo nos itens da compra (inclusive registrando novos produtos).
3. **Relatórios de Estoque**
   - Filtros de Departamento (produtos) e colunas adicionais nas listagens relevantes (produtos, produtos comprados, produtos transferidos).
   - Exportação XLS inclui coluna.
4. **Selectores e Camadas**
   - `ProductsSelector` e modal de leitura exibem o departamento quando disponível.
   - `general-selector` ganha a opção `Products/Departments` para CRUD simplificado.

## Compatibilidade e Riscos
- Flag de ativação garante zero impacto visual/funcional para tenants antigos.
- Campanha de dados: produtos existentes continuam sem departamento; departamentos podem ser atribuídos manualmente.
- Relatórios que agregam por categoria continuam válidos; departamento surge como informação adicional.
- O serviço utiliza os mesmos padrões de notificação/log já existentes (SystemControls, SystemLogs).

## Próximos Passos de Implementação
1. Criar serviço/translate de departamentos, atualizar `general-selector`.
2. Estender interfaces (`IStockProduct`, `IStockPurchase`) e serviços principais.
3. Atualizar componentes de cadastro/listagem/selector e traduções.
4. Ajustar relatórios, import/export e compras.
5. Documentar testes e atualizar changelog conforme necessário.
