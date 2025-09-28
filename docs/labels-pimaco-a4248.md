Título: Suporte a etiquetas Pimaco A4248 (A4)

Resumo
- Adicionado novo formato de impressão para folhas Pimaco A4248.
- Tamanho da etiqueta: 17,0mm x 31,0mm.
- Quantidade por folha A4: 96 (6 colunas x 16 linhas).
- Não altera formatos existentes.

Como usar
- Vá em: Produtos > Gerar Etiquetas.
- Selecione o formato: “Pimaco - A4248 (17,0 x 31,0 mm) - 96 etiquetas”.
- Marque os campos desejados (nome, preço, código de barras) e gere o PDF.

Detalhes técnicos
- Formato registrado em:
  - hosting/src/app/pages/stock/products/components/modal/components/generateTickets/generateTickets.component.ts
    - Adicionada entrada em `formats` com columns: 6, rows: 16, quantityPerSheet: 96
    - cssPath: `/assets/css/tickets/tickets-pimaco-a4248.css`
- CSS específico do formato (31mm (largura) x 17mm (altura)):
  - hosting/src/assets/css/tickets/tickets-pimaco-a4248.css
  - Ajusta dimensões das etiquetas e espaçamentos (margens/gutters) para o grid 8x12
- Carregamento dinâmico de CSS na impressão:
  - hosting/src/app/pages/stock/products/components/modal/components/generateTickets/components/print/print.component.html
  - Mantém `<link href="/assets/css/tickets/tickets.css">` no HTML e troca o href dinamicamente no handler quando necessário
- Redução do barcode somente para A4248:
  - hosting/src/app/pages/stock/products/components/modal/components/generateTickets/components/print/print.component.ts|html
  - Para A4248, `width` ~ 0.9, `height` ~ 18, `fontSize` ~ 8; demais formatos continuam com dimensões padrão

Observações
- Em etiquetas 17x31mm, o conteúdo é compacto. Ajustamos fontes, padding e espaçamentos (0,05cm) para caber 6x16 em 1 A4. Por padrão, o nome do produto é desativado nesse formato para privilegiar preço e código de barras (pode ser reativado manualmente se desejar).
