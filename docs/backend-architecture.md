# 🏗️ Documentação da Arquitetura Backend - SmartGestor

**Versão:** 1.0.0
**Data:** 23/09/2025
**Última Atualização:** 23/09/2025

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura de Pastas](#estrutura-de-pastas)
3. [iTools Database API](#itools-database-api)
4. [Sistema de Functions](#sistema-de-functions)
5. [Padrões de Desenvolvimento](#padrões-de-desenvolvimento)
6. [Exemplos Práticos](#exemplos-práticos)
7. [Guia de Desenvolvimento](#guia-de-desenvolvimento)

---

## 🌟 Visão Geral

O backend do SmartGestor utiliza uma **arquitetura própria** baseada no **iTools**, que é um sistema customizado similar ao Firebase, mas com funcionalidades específicas para nosso domínio.

### Principais Características:
- **iTools Database**: Sistema de banco NoSQL próprio
- **Functions System**: Sistema de funções server-side
- **TypeScript**: Linguagem principal
- **Babel**: Compilador (não TypeScript nativo)
- **WebSocket**: Comunicação em tempo real

---

## 📁 Estrutura de Pastas

```
functions/
├── src/
│   ├── @default/                 # Core do sistema
│   │   ├── iTools/              # API do banco de dados
│   │   │   ├── index.ts         # Classe principal iTools
│   │   │   ├── interfaces/      # Interfaces TypeScript
│   │   │   ├── utilities/       # Utilitários
│   │   │   └── enums/          # Enumerações
│   │   └── functions/          # Sistema de functions
│   │       └── functions.ts    # Classe Functions
│   ├── index.ts                # Ponto de entrada principal
│   ├── project-instance/       # Gerenciamento de instâncias
│   ├── fiscal/                 # Módulo fiscal
│   ├── email/                  # Sistema de email
│   └── fractional-products/    # NOVO: Produtos fracionados
├── build/                      # Código compilado
├── package.json               # Dependências
└── babel.config.js           # Configuração do Babel
```

---

## 🛠️ iTools Database API

### Inicialização
```typescript
import { Functions } from '../@default/functions/functions';

// Sempre inicializar assim nas functions
export const minhaFunction = async (request: any, response: any) => {
  // 1. Processar body
  Functions.parseRequestBody(request);

  // 2. Inicializar iTools
  const itools = Functions.initITools(request.body.instanceId);

  // 3. Usar o banco
  // ... código aqui
};
```

### ✅ Operações de Documento (CORRETAS)

#### Buscar Documento
```typescript
// Buscar um documento específico
const result = await itools.database().collection('StockProducts').doc('productId').get();
const data = result.data();

// Verificar se existe
if (!data) {
  // Documento não existe
  return response.status(404).json({ error: 'Produto não encontrado' });
}

// Usar os dados
console.log(data.name, data.quantity);
```

#### Criar/Atualizar Documento
```typescript
// CORRETO - Criar ou atualizar documento
await itools.database().collection('StockProducts').doc('productId').update({
  name: 'Produto Teste',
  quantity: 10,
  modifiedDate: new Date().toISOString()
});

// Com merge (preservar campos existentes)
await itools.database().collection('StockProducts').doc('productId').update({
  quantity: 15
}, { merge: true });
```

#### Gerar ID Único
```typescript
// Gerar ID simples e único
const newId = Date.now().toString() + Math.random().toString(36).substr(2, 9);

// Exemplo: "1695483762847abc123def"
```

### ✅ Queries (Consultas)

#### Buscar Múltiplos Documentos
```typescript
// Buscar com filtros
const result = await itools.database().collection('CashierSales')
  .where([
    { field: 'instanceId', operator: '==', value: instanceId },
    { field: 'date', operator: '>=', value: startDate },
    { field: 'date', operator: '<=', value: endDate },
    { field: 'status', operator: '==', value: 'completed' }
  ])
  .get();

// Processar resultados
const sales = result.docs.map((doc: any) => doc.data());
```

#### Operadores Disponíveis
- `==` - Igual
- `!=` - Diferente
- `>` - Maior que
- `>=` - Maior ou igual
- `<` - Menor que
- `<=` - Menor ou igual
- `in` - Está em array
- `array-contains` - Array contém valor

### ❌ O que NÃO Existe (Erros Comuns)

```typescript
// ❌ ERRADO - Estes métodos NÃO existem
result.exists                    // Não existe
collection().add()              // Não existe
doc().set()                     // Não existe
Utilities.generateUUID()        // Não existe
itools.newId()                  // Não existe

// ✅ CORRETO - Use estes
result.data()                   // Para verificar existência
doc().update()                  // Para criar/atualizar
Date.now() + Math.random()      // Para gerar ID
```

---

## ⚡ Sistema de Functions

### Estrutura de uma Function

```typescript
// Exemplo de function completa
const minhaFunctionInterna = async (request: any, response: any) => {
  try {
    // 1. Processar requisição
    Functions.parseRequestBody(request);

    // 2. Inicializar iTools
    const itools = Functions.initITools(request.body.instanceId);

    // 3. Validar dados de entrada
    const { param1, param2, operatorId } = request.body;

    if (!param1 || !param2) {
      return response.status(400).json({
        success: false,
        error: 'Parâmetros obrigatórios não fornecidos'
      });
    }

    // 4. Lógica de negócio
    const resultado = await processarAlgumaCoisa(itools, param1, param2);

    // 5. Retornar resposta
    return response.json({
      success: true,
      data: resultado,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro na function:', error);
    return response.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Configurar acesso e exportar
Functions.setAccess(minhaFunctionInterna, "PRIVATE");
export const minhaFunction = minhaFunctionInterna;
```

### Registro no index.ts

```typescript
// functions/src/index.ts

// 1. Importar o módulo
import * as meuModulo from "./meu-modulo";

// 2. Adicionar aos packages exportados
export const __exported_packages__ = {
  fiscal: fiscal,
  fractionalProducts: fractionalProducts,
  meuModulo: meuModulo  // Novo módulo
};

// 3. Registrar functions individuais
export const minhaFunction = meuModulo.minhaFunction;
```

### Níveis de Acesso

```typescript
// Configurar acesso da function
Functions.setAccess(minhaFunction, "PUBLIC");   // Acesso público
Functions.setAccess(minhaFunction, "PRIVATE");  // Acesso privado (padrão)
```

---

## 🎯 Padrões de Desenvolvimento

### 1. Nomenclatura de Arquivos
```
meu-modulo/
├── index.ts           # Functions principais
├── interfaces.ts      # Interfaces específicas (opcional)
└── utils.ts          # Utilitários (opcional)
```

### 2. Estrutura de Resposta Padrão
```typescript
// ✅ Sucesso
return response.json({
  success: true,
  data: resultado,
  timestamp: new Date().toISOString()
});

// ❌ Erro de validação
return response.status(400).json({
  success: false,
  error: 'Mensagem descritiva do erro'
});

// ❌ Erro interno
return response.status(500).json({
  success: false,
  error: 'Erro interno do servidor'
});
```

### 3. Validação de Dados
```typescript
// Validar campos obrigatórios
const { instanceId, productId, quantity, operatorId } = request.body;

if (!instanceId || !productId || quantity === undefined || !operatorId) {
  return response.status(400).json({
    success: false,
    error: 'Campos obrigatórios: instanceId, productId, quantity, operatorId'
  });
}
```

### 4. Logs e Auditoria
```typescript
// Sempre logar erros
catch (error) {
  console.error('❌ Erro em minhaFunction:', error);
  // ... retornar erro
}

// Criar logs de auditoria para ações críticas
const auditLog = {
  _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  timestamp: new Date().toISOString(),
  operatorId: request.body.operatorId,
  action: 'ACTION_NAME',
  entityId: entityId,
  details: { /* dados relevantes */ }
};

await itools.database().collection('AuditLogs').doc(auditLog._id).update(auditLog);
```

---

## 💡 Exemplos Práticos

### Exemplo 1: Buscar e Atualizar Produto
```typescript
export const updateProductPrice = async (request: any, response: any) => {
  try {
    Functions.parseRequestBody(request);
    const itools = Functions.initITools(request.body.instanceId);

    const { productId, newPrice } = request.body;

    // Buscar produto
    const productResult = await itools.database().collection('StockProducts').doc(productId).get();
    const product = productResult.data();

    if (!product) {
      return response.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }

    // Atualizar preço
    await itools.database().collection('StockProducts').doc(productId).update({
      salePrice: newPrice,
      modifiedDate: new Date().toISOString()
    });

    return response.json({
      success: true,
      data: { productId, oldPrice: product.salePrice, newPrice }
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar preço:', error);
    return response.status(500).json({
      success: false,
      error: 'Erro interno'
    });
  }
};
```

### Exemplo 2: Relatório com Query Complexa
```typescript
export const getSalesReport = async (request: any, response: any) => {
  try {
    Functions.parseRequestBody(request);
    const itools = Functions.initITools(request.body.instanceId);

    const { startDate, endDate, productId } = request.body;

    // Query com múltiplos filtros
    const salesResult = await itools.database().collection('CashierSales')
      .where([
        { field: 'instanceId', operator: '==', value: request.body.instanceId },
        { field: 'date', operator: '>=', value: startDate },
        { field: 'date', operator: '<=', value: endDate },
        { field: 'status', operator: '==', value: 'completed' }
      ])
      .get();

    const sales = salesResult.docs.map((doc: any) => doc.data());

    // Processar dados
    let totalRevenue = 0;
    const productSales = new Map();

    for (const sale of sales) {
      for (const item of sale.products || []) {
        if (!productId || item.productId === productId) {
          totalRevenue += item.totalPrice;

          if (!productSales.has(item.productId)) {
            productSales.set(item.productId, {
              productName: item.name,
              quantity: 0,
              revenue: 0
            });
          }

          const stats = productSales.get(item.productId);
          stats.quantity += item.quantity;
          stats.revenue += item.totalPrice;
        }
      }
    }

    return response.json({
      success: true,
      data: {
        period: { start: startDate, end: endDate },
        totalRevenue,
        productSales: Array.from(productSales.values()),
        totalTransactions: sales.length
      }
    });

  } catch (error) {
    console.error('❌ Erro no relatório:', error);
    return response.status(500).json({
      success: false,
      error: 'Erro ao gerar relatório'
    });
  }
};
```

---

## 🚀 Guia de Desenvolvimento

### Para Criar um Novo Módulo:

1. **Criar diretório**
   ```bash
   mkdir functions/src/meu-novo-modulo
   ```

2. **Criar index.ts**
   ```typescript
   // functions/src/meu-novo-modulo/index.ts
   import { Functions } from '../@default/functions/functions';

   const minhaNovaFunction = async (request: any, response: any) => {
     // Implementação aqui
   };

   Functions.setAccess(minhaNovaFunction, "PRIVATE");
   export const minhaNovaFunction = minhaNovaFunction;
   ```

3. **Registrar no index principal**
   ```typescript
   // functions/src/index.ts
   import * as meuNovoModulo from "./meu-novo-modulo";

   export const __exported_packages__ = {
     // ... outros módulos
     meuNovoModulo: meuNovoModulo
   };

   export const minhaNovaFunction = meuNovoModulo.minhaNovaFunction;
   ```

4. **Testar compilação**
   ```bash
   npm run build
   ```

### Para Debugar Problemas:

1. **Verificar logs no console**
2. **Usar console.log estratégico**
3. **Verificar se iTools está inicializado**
4. **Validar estrutura de dados**

### Para Fazer Queries Eficientes:

1. **Use índices compostos quando necessário**
2. **Limite o número de documentos retornados**
3. **Faça queries específicas, evite buscar tudo**
4. **Use cache quando apropriado**

---

## 📚 Coleções Padrão do Sistema

### Principais Coleções:
- `StockProducts` - Produtos do estoque
- `CashierSales` - Vendas do caixa
- `StockLogs` - Logs de movimentação de estoque
- `Instances` - Configurações da instância
- `Stores` - Lojas/filiais
- `#SYSTEM_AUTHENTICATE#` - Autenticação do sistema

### Coleções Específicas (Novos Módulos):
- `FractionalAuditLogs` - Logs de auditoria fracionados
- (Adicionar novas coleções aqui conforme módulos)

---

## ⚠️ Pontos de Atenção

### 1. **Sempre Inicializar iTools**
```typescript
// ✅ SEMPRE fazer isso no início da function
const itools = Functions.initITools(request.body.instanceId);
```

### 2. **Verificar Existência de Dados**
```typescript
// ✅ SEMPRE verificar se data() retorna algo
const result = await itools.database().collection('Products').doc(id).get();
const data = result.data();

if (!data) {
  // Tratar caso não existe
}
```

### 3. **Tratar Erros Adequadamente**
```typescript
// ✅ SEMPRE usar try/catch
try {
  // código
} catch (error) {
  console.error('❌ Erro:', error);
  return response.status(500).json({ success: false, error: 'Erro interno' });
}
```

### 4. **Usar IDs Únicos**
```typescript
// ✅ Gerar ID único para novos documentos
const newId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
```

---

## 🔄 Workflow de Desenvolvimento

1. **Análise** - Entender o requisito
2. **Design** - Planejar a estrutura das functions
3. **Implementação** - Codificar seguindo os padrões
4. **Teste** - `npm run build` para verificar erros
5. **Documentação** - Atualizar esta documentação se necessário

---

*Este documento deve ser consultado sempre que houver dúvidas sobre a arquitetura do backend ou ao desenvolver novos módulos.*

**Última atualização:** 23/09/2025 - Módulo de produtos fracionados implementado