# PDV — Atalhos de Teclado

Objetivo: acelerar a operação de vendas sem alterar a lógica de negócio existente.

Atalhos implementados:

- F1 (ou Ctrl+1 no macOS): Abre o modal de quantidade para definir rapidamente a quantidade do último produto adicionado ao carrinho. Enter confirma; Esc cancela.
- F2 (ou Ctrl+2 no macOS): Abre o seletor de formas de pagamento (mesma ação do botão “Adicionar pagamento”).
- F3 (ou Ctrl+3 no macOS): Abre o seletor de produtos (adicionar/selecionar produtos).
- F4 (ou Ctrl+4 no macOS): Conclui a venda, respeitando as mesmas validações do botão (cliente/produtos/pagamento). Em caso de pendências, uma notificação informa o que falta.

Notas de comportamento:

- O atalho F1 aplica a quantidade no último item do carrinho. Se não houver produtos, uma notificação informa que é preciso adicionar um item antes.
- Os atalhos não disparam quando o foco está em um campo de texto, select ou textarea, para não atrapalhar a digitação.
- Nenhuma regra de negócio foi alterada; os atalhos apenas invocam fluxos já existentes (ex.: `onOpenLayer('paymentMethods')`).

macOS (MacBook):

- Por padrão, as teclas F1/F2/F4 podem estar mapeadas para funções do sistema (brilho/volume). Você pode:
  - Segurar a tecla Fn ao pressionar F1/F2/F4; ou
  - Usar os atalhos alternativos: Ctrl+1 / Ctrl+2 / Ctrl+4.

Arquivos alterados:

- `hosting/src/app/pages/cashier/cashier-front/components/cashier-pdv/cashier-pdv.component.ts`: listener global de teclado (F1/F2) e métodos do modal de quantidade.
- `hosting/src/app/pages/cashier/cashier-front/components/cashier-pdv/cashier-pdv.component.html`: estrutura do modal de quantidade e dicas de atalho em botões de pagamento.
- `hosting/src/app/pages/cashier/cashier-front/components/cashier-pdv/cashier-pdv.component.scss`: estilos do modal de quantidade.

Exibição das dicas na UI:

- Faixa no topo do PDV (header), ao lado dos botões principais: mostra F1/Ctrl+1 (Quantidade), F2/Ctrl+2 (Pagamento), F3/Ctrl+3 (Adicionar produtos), F4/Ctrl+4 (Concluir). Visível em desktop.

- No topo do PDV (header do caixa): faixa única com os três atalhos (Quantidade, Pagamento, Concluir) exibida à direita dos botões “Registros”, “Nova entrada”, “Nova saída”, “Resumo” e “Fechar caixa” em telas desktop.

Manutenção/Extensão:

- Para adicionar novos atalhos, use o mesmo `@HostListener('window:keydown')` no componente do PDV e garanta que não haja conflito com campos em foco.
- Para alterar o alvo padrão do F1 (ex.: aplicar na “próxima leitura” em vez do último item), considere adicionar um estado de quantidade pendente e consumi-lo na rotina que recebe os produtos selecionados.
