# Service Orders – Etapas personalizáveis

## Situação atual
- As etapas possíveis são definidas estaticamente em `IServiceOrder.ts`, classe `CServiceScheme`, com dois esquemas em uso:
  - `technicalAssistance`: [`BUDGET`, `AUTORIZATION`, `PARTS`, `REPAIR`, `CONCLUDED`, `WITHDRAWAL`]
  - `mechanic`: [`BUDGET`, `AUTORIZATION`, `PARTS`, `CONCLUDED`]
- Cada etapa é tratada como **código fixo**. Diversos pontos da aplicação assumem esses valores e/ou ordem:
  - `ServiceOrdersStatusComponent` (`status.component.ts/.html`):
    - Renderiza botões por etapa, define ícones específicos (`PARTS`, `REPAIR`, `WITHDRAWAL`).
    - Controla fluxo de alocação de peças (`allocProducts`) comparando índices específicos.
    - Permite finalizar pagamento após última etapa.
  - `ServiceOrdersRegisterComponent` (`canEditExecutor`) limita edição de executor às três primeiras etapas (índices 0–2).
  - `ServiceOrdersService` (`registerService`, `checkProducts`, `updateStatus`…) usa `scheme.allocProducts`, `scheme.data.status` e compara com strings como `'PARTS'` e `'CONCLUDED'` para decidir reser­va/liberação de estoque.
  - Traduções (`serviceOrders.translate.ts`) possuem labels hard-coded por esquema.
- Configuração carregada via `Settings/serviceOrders` atualmente contém checklist e termos (garantia/entrega), mas **não** permite alterar etapas.
- UI de status apresenta dois `<table>` distintos (assistência x mecânica). Não há lógica para esquemas adicionais.

## O que o cliente pediu
Permitir que o próprio usuário “edite as etapas” sem alterar a lógica existente.

### Implicações
- Alterar a **quantidade**, **ordem** ou **identificadores** das etapas quebraria a lógica atual (alocação de estoque, restrições de edição, ícones, etc.).
- Continua viável permitir que o usuário **renomeie** as etapas (labels) mantendo os códigos fixos.

## Estratégia sugerida
Focar em 
**customização de rótulos** (labels) por esquema, preservando os códigos e o fluxo interno.

1. **Persistência**
   - Estender o documento `Settings/serviceOrders` com um bloco `stagesLabels`, por esquema:
     ```json
     {
       "technicalAssistance": {
         "BUDGET": "Pré-diagnóstico",
         "AUTORIZATION": "Autorização",
         ...
       },
       "mechanic": { ... }
     }
     ```
   - Expor métodos no `SettingsService` (`getSOSettings`, `updateServiceOrderStagesLabels`) para ler/escrever esse bloco.

2. **Interface de Configuração**
   - Na tela **Configurações → Ordens de Serviço**, acrescentar seção “Etapas do fluxo”:
     - Combobox para selecionar esquema atual (`technicalAssistance` / `mechanic`).
     - Inputs inline para cada código, com placeholder no label padrão.
     - Botão salvar que grava no Settings e atualiza `localStorage` (espelhando comportamento feito para departamentos/negative stock).

3. **Consumo na aplicação**
   - Criar utilitário (ex.: `ServiceOrderStagesLabels.getLabel(scheme, code)`) que retorne
     `settings.stagesLabels[scheme][code] || translate.scheme.<scheme>[code]`.
   - Atualizar lugares que exibem nomes (status buttons, tooltips, tabelas, modais) para usar o helper.
   - Manter ícones e condicionais baseadas em códigos (`PARTS`, `REPAIR` etc.) intocadas.

4. **Compatibilidade**
   - Ao carregar dados, cachear labels em `localStorage` para refletir imediatamente (seguindo padrão de outras configs).
   - Se não houver override, continuar exibindo as traduções atuais → comportamento legacy preservado.

5. **Documentação & UX**
   - Atualizar help/changelog explicando que a edição altera apenas o texto exibido, não a lógica. Informar que novos nomes devem manter o sentido das etapas originais.

## Riscos / Dificuldades
- Usuário pode renomear para algo sem sentido → é responsabilidade dele; lógica seguirá funcionando.
- Se futuramente for necessário adicionar/remover etapas de verdade, será preciso refatorar grande parte da camada de serviço e componentes.
- Henry: Funções como `canEditExecutor` dependerem de índices 0–2; se o cliente quiser “pular” etapas, esse comportamento continuará travando conforme a ordem original.

## Próximos passos se aprovado
1. Modelar `stagesLabels` no Firestore (script/migração inicial para criar estrutura vazia).
2. Implementar UI de edição na modal de configurações.
3. Ajustar serviço (`SettingsService`) e utilitário de labels.
4. Refatorar componentes de status/relatórios para usar helper de labels.
5. Atualizar docs e release notes.
