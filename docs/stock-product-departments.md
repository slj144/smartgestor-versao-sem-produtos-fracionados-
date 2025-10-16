# Stock Product Departments Feature

## Objetivo
Adicionar a noção de **Departamento** ao módulo de estoque para atender lojas com múltiplos setores operando sob o mesmo CNPJ. O campo deve ficar disponível no cadastro de produtos, ser transportado para compras e relatórios, e não impactar tenants que não desejarem usar o recurso.

## Ativação por Tenant
- A flag padrão continua em `ProjectSettings.profile.stock.components.departments.active`, porém o operador pode ativar/desativar a qualquer momento via **Configurações → Estoque → Departamentos por produto**.
- Ao habilitar no painel, salvamos `Settings.stock.departmentsEnabled` e refletimos o valor no `localStorage` (`StockDepartmentsEnabled`), garantindo que a UI reaja imediatamente.
- Tenants com a opção desligada permanecem com o comportamento atual (campo oculto, dados não persistidos).
- Valores existentes permanecem intactos ao ligar/desligar a flag; basta preencher departamentos conforme necessidade.

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

## Passo a Passo de Uso
1. **Ative o recurso** em `Configurações → Estoque → Departamentos por produto`. Esse toggle persiste em `Settings.stock.departmentsEnabled` e replica para o `localStorage` (`StockDepartmentsEnabled`).
2. **Cadastre os departamentos** pelo modal padrão (botão `+` do seletor em Produtos/Compras) usando o novo tipo `Products/Departments`.
3. **Edite os produtos** para vincular um departamento quando necessário. Produtos existentes permanecem válidos sem o preenchimento.
4. **Confirme em Compras e Relatórios**: o campo é carregado automaticamente em compras, filtros e colunas ficam disponíveis nos relatórios de estoque, e exportações/importações já transportam o código informado.

## Checklist de Validação
- Alternar o toggle em Configurações reflete imediatamente na UI (mostrar/ocultar campo de departamento).
- Cadastro de departamento via selector funciona (create/update/delete) e novo registro pode ser associado ao produto.
- Compras com produtos novos e existentes preservam o departamento.
- Relatórios exibem filtro/coluna e exportação XLS apresenta os dados esperados.
