# Correção: Botão "Emitir Nota Fiscal" no Registro de Caixa

## Problema
O botão "Emitir Nota Fiscal" no registro de caixa estava causando página branca e não abria o formulário de emissão de nota fiscal.

## Causa Raiz
O componente `<register-nf>` (RegisterNfComponent) estava declarado apenas no `FiscalModule`, mas estava sendo usado no `CashierModule`. Como o `CashierModule` não importava o `FiscalModule`, o componente não estava disponível, causando erro de renderização.

## Solução Implementada
Movemos os componentes fiscais relacionados à emissão de nota fiscal do `FiscalModule` para o `SharedModule`, tornando-os disponíveis globalmente.

### Componentes Movidos:
- `RegisterNfComponent` - Componente principal de registro de NF
- `RegisterNfLayerComponent` - Layer do registro de NF
- `NfPaymentMethodsSelectorComponent` - Seletor de métodos de pagamento
- `AddressComponent` - Componente de endereço
- `NfCFOPComponent` - Componente de CFOP
- `NfPaymentsComponent` - Componente de pagamentos
- `NfReceiptsComponent` - Componente de recibos

### Arquivos Modificados:

#### 1. `/src/app/@shared/shared.module.ts`
- **Adicionado**: Imports e declarações dos componentes fiscais
- **Motivo**: Tornar os componentes disponíveis globalmente

#### 2. `/src/app/pages/fiscal/fiscal.module.ts`
- **Removido**: Declarações dos componentes movidos para SharedModule
- **Adicionado**: Comentário explicativo sobre a mudança

#### 3. `/src/app/pages/cashier/cashier-records/components/modal/modal.component.html`
- **Adicionado**: Comentário explicativo no template

#### 4. `/src/app/pages/cashier/cashier-records/cashier-records.component.ts`
- **Adicionado**: Comentário explicativo no método `onEmitNf`

## Fluxo Corrigido
1. Usuário clica no botão "Emitir Nota Fiscal" (linha 125-128 em cashier-records.component.html)
2. Método `onEmitNf()` é executado (linha 413-422 em cashier-records.component.ts)
3. Modal é aberto com `activeComponent: 'Fiscal/Add'`
4. Componente `<register-nf>` é renderizado corretamente (linha 10 em modal.component.html)
5. Formulário de emissão de nota fiscal é exibido com dados da venda

## Verificação
- ✅ Aplicação compila sem erros
- ✅ Nenhum erro de diagnóstico nos módulos
- ✅ Componentes fiscais disponíveis onde necessário
- ✅ Sem dependência circular entre módulos

## Manutenção Futura
- Os componentes fiscais agora estão no `SharedModule`
- Qualquer módulo que precise usar emissão de NF deve importar apenas o `SharedModule`
- **IMPORTANTE**: Não mover estes componentes de volta para o `FiscalModule` sem criar solução alternativa para o problema de dependência circular

## Data da Correção
28/09/2025 - Corrigido por Claude Code Assistant