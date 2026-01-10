Título: Identificação da Instância na Tela de Login

Contexto
- Alguns clientes operam múltiplas instâncias (projetos) do SmartGestor e acessam cada ambiente via URL distinta (`/<projectId>/login`).
- Quando estão no desktop ou em dispositivos compartilhados, não é intuitivo verificar o slug da URL antes de digitar usuário e senha, o que gera acessos feitos no tenant errado.

Objetivo
- Exibir um indicativo claro do tenant atual diretamente na tela de login, sem alterar o fluxo de autenticação existente.
- Priorizar o `companyName` salvo após o último login para mostrar o nome amigável da loja e, caso não exista, exibir o próprio `projectId` (slug da URL) como fallback.
- Evitar ruído visual removendo prefixos técnicos como `bm-` quando for necessário exibir o `projectId`.

Implementação
- Componente `LoginComponent` (`hosting/src/app/auth/login/login.component.ts`)
  - Nova propriedade `storeLabel` extraída no `ngOnInit`.
  - Método `resolveStoreLabel()` consulta `ProjectSettings.companySettings()` (quando houver dados em cache) e retorna o `projectId` como alternativa.
  - Comentário descrevendo a lógica para facilitar futuras customizações.
- Template (`hosting/src/app/auth/login/login.component.html`)
  - Incluído bloco `<div class="instance-hint">` abaixo do logo com o rótulo traduzido.
  - Mostra também o slug (sem prefixos técnicos) quando o nome amigável existe para reforçar o identificador técnico.
- Estilos (`hosting/src/app/auth/login/login.component.scss`)
  - Caixa estilizada com a paleta laranja do logotipo para manter consistência visual e realçar a informação sem destoar da página.
- Traduções (`hosting/src/app/auth/auth.translate.ts`)
  - Novas chaves `instanceLabel` e `projectLabel` para PT-BR e EN-US.

Comportamento
- Caso o usuário nunca tenha feito login naquela máquina, a tela exibirá apenas o slug (`/<projectId>`), ajudando a confirmar a instância.
- Prefixos como `bm-` são automaticamente ocultados para que o identificador fique mais legível.
- Se já houver `projectInfo.companyName` armazenado no `localStorage` (após um login bem-sucedido), o nome da empresa é mostrado automaticamente.
- Nenhuma requisição extra foi introduzida; o comportamento de autenticação continua inalterado.
