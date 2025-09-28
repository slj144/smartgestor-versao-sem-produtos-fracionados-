import { ENFeDestinyType } from "../enum/EFiscal";

export interface IFiscalSettings {
  _id?: string;
  id?: string;
  cpfCnpj: string;
  inscricaoMunicipal: string;
  inscricaoEstadual: string;
  razaoSocial: string;
  nomeFantasia: string;
  certificado: string;
  simplesNacional: boolean;
  regimeTributario: number;
  incentivoFiscal: boolean;
  incentivadorCultural: boolean;
  regimeTributarioEspecial: number;
  endereco: IAddress;
  nfse?: INfseSettings | {};
  nfe?: INfeSettings | {};
  nfce?: INfceSettings | {};
  telefone: { numero: string, ddd: string },
}


export interface IAddress {
  bairro: string;
  cep: string;
  codigoCidade: string;
  estado: string;
  logradouro: string;
  numero: string;
  tipoLogradouro: string;
  codigoPais: string;
  complemento: string;
  descricaoCidade: string;
  descricaoPais: string;
  tipoBairro: string;
}

export interface IRecipient {
  cpfCnpj: string;
  razaoSocial: string;
  email: string;
  endereco: IAddress
}


export interface INfe {
  idIntegracao: string;
  presencial: boolean;
  consumidorFinal: boolean;
  natureza: ENFeDestinyType;
  emitente: {
    cpfCnpj: string
  },
}


export interface INfeSettings {
  ativo: boolean,
  tipoContrato: number,
  config: {
    producao: boolean;
    impressaoFcp: boolean;
    impressaoPartilha: boolean;
    dfe: {
      ativo: boolean
    },
    email: {
      envio: boolean
    },
    numeracao: [
      {
        numero: number;
        serie: number
      }
    ],
    integracoes: {
      plugStorage: {
        ativo: boolean
        email: string;
        senha: string;
        token: string
      }
    },
    calculoAutomaticoIbpt: { ativo: boolean }
  }
}

export interface INfceSettings {
  ativo: boolean;
  tipoContrato: number;
  config: {
    producao: boolean;
    email: {
      envio: boolean
    },
    sefaz: {
      idCodigoSegurancaContribuinte: string;
      codigoSegurancaContribuinte: string;
    },
    numeracao: [{ numero: number, serie: number }],
    integracoes: {
      plugStorage: {
        ativo: boolean
        email: string;
        senha: string;
      }
    },
    calculoAutomaticoIbpt: { ativo: boolean }
  }
}

export interface INfseSettings {
  ativo: boolean;
  tipoContrato: number;
  config: {
    producao: boolean;
    rps: {
      lote: number;
      numeracao: [
        { numero: number, serie: string }
      ]
    };
    prefeitura: {
      login: string;
      senha: string;
      receitaBruta: number;
      lei: string;
      dataInicio: string;
    };
    email: {
      envio: boolean;
    };
    calculoAutomaticoIbpt: { ativo: boolean; }
  }
}


export interface IFiscalNotesXml {
  _id?: string;
  key: string;
  idPlugNotas?: string;
  idIntegration?: string;
  protocol?: string;
  emmitDate?: string;
  number?: number;
  serie?: number;
  type: "NFE" | "NFCE" | "NFSE";
  status?: "CONCLUIDO" | "REJEITADO" | "ENCERRADO" | "CANCELADO" | "PROCESSANDO",
  xmlFile?: string;
  resumeComplete: any;
}