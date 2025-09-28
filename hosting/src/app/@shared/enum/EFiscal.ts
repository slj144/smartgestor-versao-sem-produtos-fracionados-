export enum ENFeType{
  NFE="NFE",
  NFCE="NFCE",
  NFSE="NFSE",
}

export enum ENFeImpresionFileType{
  PDF="PDF",
  XML="XML",
}

export enum ENFeFinaliity{
  "NF-e Normal" = 1,
  "NF-e Complementar" = 2,
  "NF-e de AJuste" = 3,
  "NF-e de Devolução de Mercadoria" = 4
}



export enum ENFeImpressionType{
  "Sem geração de DANFE" = 0,
  "Modelo Retrato" = 1,
  "Modelo Paisagem" = 2,
  "Modelo Simplificado" = 3
}


export enum ENFeEmissionType{
  "Emissão normal" = 1,
  "Contingência FS-IA, com impressão do DANFE em formulário de segurança" = 2,
  "Contingência SCAN (Sistema de Contingência do Ambiente Nacional)" = 3,
  "Contingência DPEC (Declaração Prévia da Emissão em Contingência)" = 4,
  "Contingência FS-DA, com impressão do DANFE em formulário de segurança" = 5,
  "Contingência SVC-AN (SEFAZ Virtual de Contingência do AN)" = 6,
  "Contingência SVC-RS (SEFAZ Virtual de Contingência do RS)" = 7
}


export enum ENFeDestinyType{
  "Operação Interna" = 1,
  "Operação Interestadual" = 2,
  "Operação com Exterior" = 3
}