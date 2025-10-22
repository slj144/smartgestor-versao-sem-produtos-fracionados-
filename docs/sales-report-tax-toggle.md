# Relatórios de vendas – imposto opcional

## Contexto
Alguns clientes querem acompanhar o resultado "limpo", com os impostos dos produtos abatidos do total, enquanto outros preferem ver os valores brutos. Até então o sistema sempre subtraía os impostos ao calcular a Receita Final dos relatórios de vendas, o que gerava divergências.

## Comportamento
- **Nova opção**: na tela de filtros dos relatórios de vendas foi adicionada a caixa "Abater impostos dos produtos".
- A opção vem marcada por padrão, mantendo o comportamento anterior (impostos abatidos).
- Ao desmarcar, a Receita Final e os totais exibem os valores brutos, sem descontar os impostos. As colunas de impostos continuam mostrando o valor devido para referência.

## Onde está disponível
- Relatório de Vendas (Sintético/Analítico).
- Relatório de Vendas por Colaborador (Sintético/Analítico).

## Teste manual sugerido
1. Gerar um relatório de vendas com a opção marcada e anotar Receita Final e coluna de impostos.
2. Gerar o mesmo relatório desmarcando a opção e conferir que a Receita Final aumenta exatamente no valor dos impostos, enquanto a coluna de impostos permanece igual.

Assim cada cliente consegue ajustar o relatório ao próprio processo fiscal sem impacto para os demais.
