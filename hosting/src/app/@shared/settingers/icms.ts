
export const origem = {
  '0' : 'Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8',
  '1' : 'Estrangeira - Importação direta, exceto a indicada no código 6',
  '2' : 'Estrangeira - Adquirida no mercado interno, exceto a indicada no código 7',
  '3' : 'Nacional, mercadoria ou bem com Conteúdo de Importação superior a 40% e inferior ou igual a 70%',
  '4' : 'Nacional, cuja produção tenha sido feita em conformidade com os processos produtivos básicos de que tratam as legislações citadas nos Ajustes',
  '5' : 'Nacional, mercadoria ou bem com Conteúdo de Importação inferior ou igual a 40%',
  '6' : 'Estrangeira - Importação direta, sem similar nacional, constante em lista da CAMEX e gás natural',
  '7' : 'Estrangeira - Adquirida no mercado interno, sem similar nacional, constante lista CAMEX e gás natural',
  '8' : 'Nacional, mercadoria ou bem com Conteúdo de Importação superior a 70%',
};

export const cst = {

  'REGIME NORMAL' : {
    '00' : 'Tributada integralmente',
    '10' : 'Tributada e com cobrança do ICMS por substituição tributária',
    '20' : 'Com redução da BC',
    '30' : 'Isenta / não tributada e com cobrança do ICMS por substituição tributária',
    '40' : 'Isenta',
    '41' : 'Não tributada',
    '50' : 'Com suspensão',
    '51' : 'Com diferimento',
    '60' : 'ICMS cobrado anteriormente por substituição tributária',
    '70' : 'Com redução da BC e cobrança do ICMS por substituição tributária',
    '90' : 'Outras',
  },

  'SIMPLES NACIONAL' : {
    '101' : 'Tributação pelo Simples com Permissão de Crédito',
    '102' : 'Tributação pelo Simples sem Permissão de Crédito',
    '103' : 'Isenção do ICMS no Simples para receita bruta',
    '201' : 'Simples Nacional com Permissão de Crédito e ICMS por Substituição Tributária',
    '202' : 'Simples Nacional sem Permissão de crédito e com cobrança de ICMS por substituição tributária',
    '203' : 'Isenção do ICMS no Simples para faixa da Receita Bruta e com cobrança de ICMS por substituição tributária',
    '300' : 'Imunidade',
    '400' : 'Não tributado pelo Simples',
    '500' : 'ICMS cobrado anteriormente por substituição',
    '900' : 'Outros. (neste código estão todas as operações que não se encaixam nos demais já citados).',
  }

};

export const baseCalculo = {

  'modalidadeDeterminacao' : {
    '0' : 'Margem Valor Agregado (%)',
    '1' : 'Pauta (Valor)',
    '2' : 'Preço Tabelado Máx. (valor)',
    '3' : 'Valor da operação',
  }

};

export const substituicaoTributaria = {

  'baseCalculo' : {

    'modalidadeDeterminacao' : {
      '0' : 'Preço tabelado ou máximo sugerido',
      '1' : 'Lista Negativa (valor)',
      '2' : 'Lista Positiva (valor)',
      '3' : 'Lista Neutra (valor)',
      '4' : 'Margem Valor Agregado (%)',
      '5' : 'Pauta (valor)',
      '6' : 'Valor da Operação (NT 2019.001)',
    }
  
  }

};
