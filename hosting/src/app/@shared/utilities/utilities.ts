// Arquivo: utilities.ts
// Localização: src/app/shared/utilities/utilities.ts
// Utilities com método formatCurrency adicionado e prefixCode corrigido

import { EventEmitter } from 'events';
import { getCurrencySymbol } from '@angular/common';

// Interfaces
import { IPermissions } from '../interfaces/_auxiliaries/IPermissions';

// Types
import { filter } from '../types/filter';

// Settings
import { ProjectSettings } from '@assets/settings/company-settings';

// Utilities
import { $$ } from './essential';
import { DateTime } from './dateTime';
import { query } from '../types/query';

export class Utilities {

  public static loadingObserver: EventEmitter = new EventEmitter();

  // Shared Services

  public static collaboratorsService: any;

  // Getter Methods - Common 

  public static get windowID() {
    return (<any>window).id;
  }

  public static get projectId() {
    return window.location.pathname.split("/")[1];
  }

  public static get currentLoginData() {
    return Utilities.logins[Utilities.windowID] ? Utilities.logins[Utilities.windowID] : {};
  }

  public static get logins() {
    return window.localStorage.getItem("logins") ? JSON.parse(window.localStorage.getItem("logins")) : {};
  }

  public static get companyProfile() {
    return ProjectSettings.companySettings().profile;
  }

  public static get stockDepartmentsEnabled() {
    const storedValue = Utilities.localStorage('StockDepartmentsEnabled');

    if (storedValue !== undefined && storedValue !== null) {
      if (typeof storedValue === 'string') {
        return storedValue === 'true';
      }
      return !!storedValue;
    }

    return !!ProjectSettings.companySettings().profile?.stock?.components?.departments?.active;
  }

  public static get cashierLockDiscounts(): boolean {
    const storedValue = Utilities.localStorage('CashierLockDiscounts');

    if (storedValue !== undefined && storedValue !== null) {
      if (typeof storedValue === 'string') {
        return storedValue === 'true';
      }
      return !!storedValue;
    }

    const profileValue = ProjectSettings.companySettings()?.cashier?.lockDiscounts;
    return !!profileValue;
  }

  public static get isFiscal() {
    return ProjectSettings.companySettings().profile && ProjectSettings.companySettings().profile.fiscal ? ProjectSettings.companySettings().profile.fiscal.active : false;
  }

  public static get operator() {

    const data = {
      code: (() => {
        if (typeof Utilities.currentLoginData.usercode == "string" && Utilities.currentLoginData.usercode[0] == "@") {
          return Utilities.currentLoginData.usercode;
        } else {
          return (parseInt(new String(Utilities.currentLoginData.usercode).valueOf() ? new String(Utilities.currentLoginData.usercode).valueOf() : "-1"));
        }
      })(),
      name: Utilities.currentLoginData.name,
      username: Utilities.currentLoginData.username,
      usertype: Utilities.currentLoginData.usertype
    };

    return data;
  }

  public static get storeID() {

    let storeId = Utilities.currentLoginData.storeId;
    storeId = (storeId ? storeId : '_default_');

    return storeId;
  }

  public static get storeInfo() {

    let storeInfo: any = Utilities.currentLoginData.storeInfo ? Utilities.currentLoginData.storeInfo : {};
    storeInfo._id = Utilities.localStorage('storeId');

    return (<any>storeInfo);
  }

  public static get states() {

    const data = [
      'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO',
      'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
      'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ];

    return data;
  }

  public static get timezone() {
    return ProjectSettings.companySettings().timezone;
  }

  static get ibgeCountries() {
    return [
      { code: 132, name: "AFEGANISTAO" },
      { code: 7560, name: "AFRICA DO SUL" },
      { code: 175, name: "ALBANIA, REPUBLICA DA" },
      { code: 230, name: "ALEMANHA" },
      { code: 370, name: "ANDORRA" },
      { code: 400, name: "ANGOLA" },
      { code: 418, name: "ANGUILLA" },
      { code: 434, name: "ANTIGUA E BARBUDA" },
      { code: 477, name: "ANTILHAS HOLANDESAS" },
      { code: 531, name: "ARABIA SAUDITA" },
      { code: 590, name: "ARGELIA" },
      { code: 639, name: "ARGENTINA" },
      { code: 647, name: "ARMENIA, REPUBLICA DA" },
      { code: 655, name: "ARUBA" },
      { code: 698, name: "AUSTRALIA" },
      { code: 728, name: "AUSTRIA" },
      { code: 736, name: "AZERBAIJAO, REPUBLICA DO" },
      { code: 779, name: "BAHAMAS, ILHAS" },
      { code: 809, name: "BAHREIN, ILHAS" },
      { code: 817, name: "BANGLADESH" },
      { code: 833, name: "BARBADOS" },
      { code: 850, name: "BELARUS, REPUBLICA DA" },
      { code: 876, name: "BELGICA" },
      { code: 884, name: "BELIZE" },
      { code: 2291, name: "BENIN" },
      { code: 906, name: "BERMUDAS" },
      { code: 973, name: "BOLIVIA" },
      { code: 981, name: "BOSNIA-HERZEGOVINA (REPUBLICA DA)" },
      { code: 1015, name: "BOTSUANA" },
      { code: 1058, name: "BRASIL" },
      { code: 1082, name: "BRUNEI" },
      { code: 1112, name: "BULGARIA, REPUBLICA DA" },
      { code: 310, name: "BURKINA FASO" },
      { code: 1155, name: "BURUNDI" },
      { code: 1198, name: "BUTAO" },
      { code: 1279, name: "CABO VERDE, REPUBLICA DE" },
      { code: 1457, name: "CAMAROES" },
      { code: 1414, name: "CAMBOJA" },
      { code: 1490, name: "CANADA" },
      { code: 1511, name: "CANARIAS, ILHAS" },
      { code: 1546, name: "CATAR" },
      { code: 1376, name: "CAYMAN, ILHAS" },
      { code: 1538, name: "CAZAQUISTAO, REPUBLICA DO" },
      { code: 7889, name: "CHADE" },
      { code: 1589, name: "CHILE" },
      { code: 1600, name: "CHINA, REPUBLICA POPULAR" },
      { code: 1635, name: "CHIPRE" },
      { code: 5118, name: "CHRISTMAS,ILHA (NAVIDAD)" },
      { code: 7412, name: "CINGAPURA" },
      { code: 1651, name: "COCOS(KEELING),ILHAS" },
      { code: 1694, name: "COLOMBIA" },
      { code: 1732, name: "COMORES, ILHAS" },
      { code: 1775, name: "CONGO" },
      { code: 8885, name: "CONGO, REPUBLICA DEMOCRATICA DO" },
      { code: 1830, name: "COOK, ILHAS" },
      { code: 1872, name: "COREIA, REP.POP.DEMOCRATICA" },
      { code: 1902, name: "COREIA, REPUBLICA DA" },
      { code: 1937, name: "COSTA DO MARFIM" },
      { code: 1961, name: "COSTA RICA" },
      { code: 1988, name: "COVEITE" },
      { code: 1953, name: "CROACIA (REPUBLICA DA)" },
      { code: 1996, name: "CUBA" },
      { code: 2321, name: "DINAMARCA" },
      { code: 7838, name: "DJIBUTI" },
      { code: 2356, name: "DOMINICA,ILHA" },
      { code: 2402, name: "EGITO" },
      { code: 6874, name: "EL SALVADOR" },
      { code: 2445, name: "EMIRADOS ARABES UNIDOS" },
      { code: 2399, name: "EQUADOR" },
      { code: 2437, name: "ERITREIA" },
      { code: 2470, name: "ESLOVACA, REPUBLICA" },
      { code: 2461, name: "ESLOVENIA, REPUBLICA DA" },
      { code: 2453, name: "ESPANHA" },
      { code: 2496, name: "ESTADOS UNIDOS" },
      { code: 2518, name: "ESTONIA, REPUBLICA DA" },
      { code: 2534, name: "ETIOPIA" },
      { code: 2550, name: "FALKLAND (ILHAS MALVINAS)" },
      { code: 2593, name: "FEROE, ILHAS" },
      { code: 8702, name: "FIJI" },
      { code: 2674, name: "FILIPINAS" },
      { code: 2712, name: "FINLANDIA" },
      { code: 1619, name: "FORMOSA (TAIWAN)" },
      { code: 2755, name: "FRANCA" },
      { code: 2810, name: "GABAO" },
      { code: 2852, name: "GAMBIA" },
      { code: 2895, name: "GANA" },
      { code: 2917, name: "GEORGIA, REPUBLICA DA" },
      { code: 2933, name: "GIBRALTAR" },
      { code: 2976, name: "GRANADA" },
      { code: 3018, name: "GRECIA" },
      { code: 3050, name: "GROENLANDIA" },
      { code: 3093, name: "GUADALUPE" },
      { code: 3131, name: "GUAM" },
      { code: 3174, name: "GUATEMALA" },
      { code: 1504, name: "GUERNSEY, ILHA DO CANAL (INCLUI ALDERNEY E SARK)" },
      { code: 3379, name: "GUIANA" },
      { code: 3255, name: "GUIANA FRANCESA" },
      { code: 3298, name: "GUINE" },
      { code: 3344, name: "GUINE-BISSAU" },
      { code: 3310, name: "GUINE-EQUATORIAL" },
      { code: 3417, name: "HAITI" },
      { code: 3450, name: "HONDURAS" },
      { code: 3514, name: "HONG KONG" },
      { code: 3557, name: "HUNGRIA, REPUBLICA DA" },
      { code: 3573, name: "IEMEN" },
      { code: 3611, name: "INDIA" },
      { code: 3654, name: "INDONESIA" },
      { code: 3727, name: "IRA, REPUBLICA ISLAMICA DO" },
      { code: 3697, name: "IRAQUE" },
      { code: 3751, name: "IRLANDA" },
      { code: 3794, name: "ISLANDIA" },
      { code: 3832, name: "ISRAEL" },
      { code: 3867, name: "ITALIA" },
      { code: 3913, name: "JAMAICA" },
      { code: 3999, name: "JAPAO" },
      { code: 1508, name: "JERSEY, ILHA DO CANAL" },
      { code: 3964, name: "JOHNSTON, ILHAS" },
      { code: 4030, name: "JORDANIA" },
      { code: 4111, name: "KIRIBATI" },
      { code: 4200, name: "LAOS, REP.POP.DEMOCR.DO" },
      { code: 4235, name: "LEBUAN,ILHAS" },
      { code: 4260, name: "LESOTO" },
      { code: 4278, name: "LETONIA, REPUBLICA DA" },
      { code: 4316, name: "LIBANO" },
      { code: 4340, name: "LIBERIA" },
      { code: 4383, name: "LIBIA" },
      { code: 4405, name: "LIECHTENSTEIN" },
      { code: 4421, name: "LITUANIA, REPUBLICA DA" },
      { code: 4456, name: "LUXEMBURGO" },
      { code: 4472, name: "MACAU" },
      { code: 4499, name: "MACEDONIA, ANT.REP.IUGOSLAVA" },
      { code: 4502, name: "MADAGASCAR" },
      { code: 4525, name: "MADEIRA, ILHA DA" },
      { code: 4553, name: "MALASIA" },
      { code: 4588, name: "MALAVI" },
      { code: 4618, name: "MALDIVAS" },
      { code: 4642, name: "MALI" },
      { code: 4677, name: "MALTA" },
      { code: 3595, name: "MAN, ILHA DE" },
      { code: 4723, name: "MARIANAS DO NORTE" },
      { code: 4740, name: "MARROCOS" },
      { code: 4766, name: "MARSHALL,ILHAS" },
      { code: 4774, name: "MARTINICA" },
      { code: 4855, name: "MAURICIO" },
      { code: 4880, name: "MAURITANIA" },
      { code: 4885, name: "MAYOTTE (ILHAS FRANCESAS)" },
      { code: 4936, name: "MEXICO" },
      { code: 930, name: "MIANMAR (BIRMANIA)" },
      { code: 4995, name: "MICRONESIA" },
      { code: 4901, name: "MIDWAY, ILHAS" },
      { code: 5053, name: "MOCAMBIQUE" },
      { code: 4944, name: "MOLDAVIA, REPUBLICA DA" },
      { code: 4952, name: "MONACO" },
      { code: 4979, name: "MONGOLIA" },
      { code: 4985, name: "MONTENEGRO" },
      { code: 5010, name: "MONTSERRAT,ILHAS" },
      { code: 5070, name: "NAMIBIA" },
      { code: 5088, name: "NAURU" },
      { code: 5177, name: "NEPAL" },
      { code: 5215, name: "NICARAGUA" },
      { code: 5258, name: "NIGER" },
      { code: 5282, name: "NIGERIA" },
      { code: 5312, name: "NIUE,ILHA" },
      { code: 5355, name: "NORFOLK,ILHA" },
      { code: 5380, name: "NORUEGA" },
      { code: 5428, name: "NOVA CALEDONIA" },
      { code: 5487, name: "NOVA ZELANDIA" },
      { code: 5568, name: "OMA" },
      { code: 5665, name: "PACIFICO,ILHAS DO (POSSESSAO DOS EUA)" },
      { code: 5738, name: "PAISES BAIXOS (HOLANDA)" },
      { code: 5754, name: "PALAU" },
      { code: 5780, name: "PALESTINA" },
      { code: 5800, name: "PANAMA" },
      { code: 5452, name: "PAPUA NOVA GUINE" },
      { code: 5762, name: "PAQUISTAO" },
      { code: 5860, name: "PARAGUAI" },
      { code: 5894, name: "PERU" },
      { code: 5932, name: "PITCAIRN,ILHA" },
      { code: 5991, name: "POLINESIA FRANCESA" },
      { code: 6033, name: "POLONIA, REPUBLICA DA" },
      { code: 6114, name: "PORTO RICO" },
      { code: 6076, name: "PORTUGAL" },
      { code: 6238, name: "QUENIA" },
      { code: 6254, name: "QUIRGUIZ, REPUBLICA" },
      { code: 6289, name: "REINO UNIDO" },
      { code: 6408, name: "REPUBLICA CENTRO-AFRICANA" },
      { code: 6475, name: "REPUBLICA DOMINICANA" },
      { code: 6602, name: "REUNIAO, ILHA" },
      { code: 6700, name: "ROMENIA" },
      { code: 6750, name: "RUANDA" },
      { code: 6769, name: "RUSSIA, FEDERACAO DA" },
      { code: 6858, name: "SAARA OCIDENTAL" },
      { code: 6781, name: "SAINT KITTS E NEVIS" },
      { code: 6777, name: "SALOMAO, ILHAS" },
      { code: 6904, name: "SAMOA" },
      { code: 6912, name: "SAMOA AMERICANA" },
      { code: 6971, name: "SAN MARINO" },
      { code: 7102, name: "SANTA HELENA" },
      { code: 7153, name: "SANTA LUCIA" },
      { code: 6955, name: "SAO CRISTOVAO E NEVES,ILHAS" },
      { code: 7005, name: "SAO PEDRO E MIQUELON" },
      { code: 7200, name: "SAO TOME E PRINCIPE, ILHAS" },
      { code: 7056, name: "SAO VICENTE E GRANADINAS" },
      { code: 7285, name: "SENEGAL" },
      { code: 7358, name: "SERRA LEOA" },
      { code: 7370, name: "SERVIA" },
      { code: 7315, name: "SEYCHELLES" },
      { code: 7447, name: "SIRIA, REPUBLICA ARABE DA" },
      { code: 7480, name: "SOMALIA" },
      { code: 7501, name: "SRI LANKA" },
      { code: 7544, name: "SUAZILANDIA" },
      { code: 7595, name: "SUDAO" },
      { code: 7600, name: "SUDAO DO S" },
      { code: 7641, name: "SUECIA" },
      { code: 7676, name: "SUICA" },
      { code: 7706, name: "SURINAME" },
      { code: 7722, name: "TADJIQUISTAO, REPUBLICA DO" },
      { code: 7765, name: "TAILANDIA" },
      { code: 7803, name: "TANZANIA, REP.UNIDA DA" },
      { code: 7919, name: "TCHECA, REPUBLICA" },
      { code: 7820, name: "TERRITORIO BRIT.OC.INDICO" },
      { code: 7951, name: "TIMOR LESTE" },
      { code: 8001, name: "TOGO" },
      { code: 8109, name: "TONGA" },
      { code: 8052, name: "TOQUELAU,ILHAS" },
      { code: 8150, name: "TRINIDAD E TOBAGO" },
      { code: 8206, name: "TUNISIA" },
      { code: 8230, name: "TURCAS E CAICOS,ILHAS" },
      { code: 8249, name: "TURCOMENISTAO, REPUBLICA DO" },
      { code: 8273, name: "TURQUIA" },
      { code: 8281, name: "TUVALU" },
      { code: 8311, name: "UCRANIA" },
      { code: 8338, name: "UGANDA" },
      { code: 8451, name: "URUGUAI" },
      { code: 8478, name: "UZBEQUISTAO, REPUBLICA DO" },
      { code: 5517, name: "VANUATU" },
      { code: 8486, name: "VATICANO, EST.DA CIDADE DO" },
      { code: 8508, name: "VENEZUELA" },
      { code: 8583, name: "VIETNA" },
      { code: 8630, name: "VIRGENS,ILHAS (BRITANICAS)" },
      { code: 8664, name: "VIRGENS,ILHAS (E.U.A.)" },
      { code: 8737, name: "WAKE, ILHA" },
      { code: 8907, name: "ZAMBIA" },
      { code: 6653, name: "ZIMBABUE" },
      { code: 8958, name: "ZONA DO CANAL DO PANAMA}" }
    ];
  }

  // Getter Methods - currency

  public static get currencySymbol() {

    let _currency = (window.localStorage.getItem('Currency') || ProjectSettings.companySettings().currency);
    let _format: ('wide' | 'narrow') = 'narrow';
    let _locale = (window.localStorage.getItem('Language') || ProjectSettings.companySettings().language);

    const getCurrencySymbol = (locale, currency) => {
      return (0).toLocaleString(
        locale,
        {
          style: 'currency',
          currency: currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }
      ).replace(/\d/g, '').trim();
    }

    return getCurrencySymbol(_locale.replace("_", "-"), _currency);
    // return getCurrencySymbol(_currency, _format, _locale);
  }

  // ⭐ MÉTODO NOVO ADICIONADO AQUI ⭐
  // Formatar valor monetário
  public static formatCurrency(value: number): string {
    const currency = ProjectSettings.companySettings().currency || 'BRL';
    const locale = (ProjectSettings.companySettings().language || 'pt_BR').replace('_', '-');

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
  }

  // Getter Methods - Verification

  public static get isMatrix(): boolean {
    return (Utilities.storeID == 'matrix');
  }

  public static get isAdmin(): boolean {
    return (Utilities.operator.usertype == 'admin');
  }

  public static get cnpjFiscal(): string {

    if (!Utilities.currentLoginData || !Utilities.storeInfo) {
      return "_cnpj";
    }

    const sanitize = (value: string) => {
      return value ? value.toString().replace(/\D+/g, "") : "";
    };

    if (Utilities.isMatrix) {
      const cnpj = sanitize(Utilities.storeInfo.cnpj);
      return cnpj || "_cnpj";
    } else if (Utilities.currentLoginData && Utilities.currentLoginData.matrixInfo) {
      const cnpj = sanitize(Utilities.storeInfo.cnpjFiscal || Utilities.currentLoginData.matrixInfo.cnpj);
      return cnpj || "_cnpj";
    } else {
      return "_cnpj";
    }
  };

  public static parseCurrencyToNumber(value: string | number) {
    if (typeof value === 'number') {
      return value;
    }

    let str = value.toString().trim();

    // Remove all whitespace characters
    str = str.replace(/\s/g, '');

    const lastComma = str.lastIndexOf(',');
    const lastDot = str.lastIndexOf('.');

    if (lastComma > lastDot) {
      // Treat comma as decimal separator
      str = str.replace(/\./g, '');
      str = str.replace(/,/g, '.');
    } else {
      // Treat dot as decimal separator
      str = str.replace(/,/g, '');
    }

    const result = parseFloat(str);
    return isNaN(result) ? 0 : result;
  }

  public static parsePercentualToNumber(value: string) {
    return parseFloat(value.toString().replace(/\,/g, '.'));
  }


  // Loading Method

  public static loading(status = true) {
    Utilities.loadingObserver.emit(null, status);
  }

  // Codes Manager Method  

  public static checkCode(code: string, input: Array<any>, target?: string) {

    const arrCodes = [];

    for (const item of input) {
      if (typeof item == 'string') {
        arrCodes.push(item);
      } else if (typeof item == 'object') {
        arrCodes.push(item[target]);
      }
    }

    return (arrCodes.indexOf(code) === -1);
  }

  // 🔧 FUNÇÃO CORRIGIDA - Linha 455
  // Adiciona prefixo aos códigos com proteção contra undefined/null
  // 🔧 FUNÇÃO CORRIGIDA - Substituir a função prefixCode existente por esta
  public static prefixCode(value: (string | number)): string {
    try {
      // 🛡️ PROTEÇÃO: Verificar se o valor existe e não é undefined/null
      if (value === undefined || value === null) {
        console.warn('⚠️ UTILITIES: prefixCode recebeu valor undefined/null:', value);
        return ''; // Retorna string vazia em vez de quebrar
      }

      // 🛡️ PROTEÇÃO: Se já é uma string vazia, retornar vazia
      if (value === '' || String(value).trim() === '') {
        return '';
      }

      // ✅ CORREÇÃO PRINCIPAL: Detectar códigos especiais (começam com @)
      const stringValue = String(value);
      if (stringValue.startsWith('@')) {
        // Para códigos especiais como @0001, @0002, etc., retornar como estão
        // Esses são códigos especiais do sistema e não precisam ser processados
        return stringValue;
      }

      // ✅ CORREÇÃO: Detectar outros códigos alfanuméricos (não numéricos puros)
      // Se contém letras ou símbolos, é um código especial
      if (stringValue.match(/[a-zA-Z@#$%&*]/)) {
        // É um código alfanumérico válido, retornar sem warning
        return stringValue;
      }

      // 🔧 LÓGICA ORIGINAL: Processar apenas números puros
      let result = value;

      // Verificar se consegue converter para número
      const numberValue = parseInt(stringValue);

      // Se não é um número válido, retornar como string (com warning apenas para casos estranhos)
      if (isNaN(numberValue)) {
        // Só mostrar warning se realmente parece que deveria ser um número
        if (stringValue.match(/^[0-9\.\,\-\+\s]+$/)) {
          console.warn('⚠️ UTILITIES: prefixCode - valor parece numérico mas não conseguiu converter:', value);
        }
        return stringValue;
      }

      // 🔧 LÓGICA ORIGINAL: Aplicar zero-padding se menor que 999
      if (numberValue <= 999) {
        result = ('000' + String(numberValue)).substr(-4);
      } else {
        result = String(numberValue);
      }

      return String(result);

    } catch (error) {
      // 🚨 LOG: Capturar qualquer erro
      console.error('❌ ERRO na função prefixCode:', error);
      console.error('❌ Valor recebido:', value);

      // 🔄 FALLBACK: Retornar o valor original como string em caso de erro
      return String(value || '');
    }
  }

  public static generateCode(input: (string | Array<any>), target?: string, increment?: number) {

    let code: string;
    let value: number;

    increment = (increment > 1 ? increment : 1);

    if (typeof input == 'string') {

      const currentCode = parseInt(input);
      value = (currentCode + increment);
    }

    if (typeof input == 'object') {

      const arrCodes = [];

      for (const item of input) {

        if (typeof item == 'string') {
          arrCodes.push(item);
        } if (typeof item == 'object') {
          arrCodes.push(item[target]);
        }
      }

      arrCodes.sort((a: any, b: any) => {
        return ((a > b) ? 1 : ((a < b) ? -1 : 0));
      });

      value = (parseInt(arrCodes.length > 0 ? arrCodes[arrCodes.length - 1] : '0000') + increment);
    }

    if (value < 9999) {
      code = ('000' + String(value)).substr(-4);
    } else {
      code = String(value);
    }

    return code;
  }

  // Unique ID Generator

  public static uuid() {
    return ('xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    }) + DateTime.getDateObject().getTime().toString());
  }

  public static randomCode() {
    return parseInt(String(Math.random() * 978574789475017)).toString().replace('\.|\,', '').substring(0, 13);
  }

  // String Treat

  public static clearSpaces(str: string) {
    return String(str).trim().replace(/\s{2,}/g, ' ');
  }

  // Event Emitters

  public static onEmitterListener(emitter: EventEmitter, emitterId: string, listenerId: string, listener: ((_: any) => void)) {
    (listener as any).ListenerID = listenerId;
    emitter.on(emitterId, listener);
  }

  public static offEmitterListener(emitter: EventEmitter, emitterId: string = null, listenerId: string | string[] = null) {

    if (emitterId) {

      emitter.listeners(emitterId).forEach((listener: any) => {

        if (listenerId) {

          if (typeof listenerId == "string") {

            if ((<any>listener).ListenerID == listenerId) {
              emitter.removeListener(emitterId, listener);
            }
          } else {

            listenerId.forEach((id) => {
              if ((<any>listener).ListenerID == id) {
                emitter.removeListener(emitterId, listener);
              }
            });
          }
        } else {
          emitter.removeListener(emitterId, listener);
        }
      });
    } else {
      emitter.removeAllListeners();
    }
  }

  // Deep Clone of Objects

  public static deepClone(object: any) {

    const recurseObj = ((x) => typeof x === 'object' && !(x instanceof RegExp) ? Utilities.deepClone(x) : x);
    const cloneObj = ((y, k) => { y[k] = recurseObj(object[k]); return y; });

    if (!object) { return object }

    if (Array.isArray(object)) {
      return object.map(recurseObj);
    }

    return Object.keys(object).reduce(cloneObj, {});
  }

  // Object Ordering

  public static objectSorter(obj: any, config: { orderBy: string, nameKey?: string }, sort: 'ASC' | 'DESC' = 'ASC') {

    const result = [];

    $$(obj).map((k: string, v: any) => {
      if (config.nameKey) { v[config.nameKey] = k }
      result.push(v);
    });

    result.sort((a, b) => {
      if (sort == 'ASC') {
        return ((a[config.orderBy] < b[config.orderBy]) ? -1 : ((a[config.orderBy] > b[config.orderBy]) ? 1 : 0));
      } else if (sort == 'DESC') {
        return ((a[config.orderBy] < b[config.orderBy]) ? 1 : ((a[config.orderBy] > b[config.orderBy]) ? -1 : 0));
      }
    });

    return result;
  }

  public static parseArrayToObject(data: any[], key: string, setIndexIfUndefined: boolean = false) {

    const obj: any = {};

    $$(data).map((index, item) => {

      if (setIndexIfUndefined) {
        obj[item[key] != undefined ? item[key] : "_" + index] = item;
      } else {
        obj[item[key]] = item;
      }

    });

    return obj;
  };

  // Performs the XLS file export

  public static exportXSL(data: { name: string, html: string }, download: boolean = true) {

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <!--[if gte mso 9]>
            <xml>
              <x:ExcelWorkbook>
                <x:ExcelWorksheets>
                  <x:ExcelWorksheet>
                    <x:Name></x:Name>
                    <x:WorksheetOptions>
                      <x:DisplayGridlines/>
                    </x:WorksheetOptions>
                  </x:ExcelWorksheet>
                </x:ExcelWorksheets>
              </x:ExcelWorkbook>
            </xml>
          <![endif]-->
        </head>
        <body>
          <table>${data.html}</table>
        </body>
      </html>`;

    const blob = new Blob(['\ufeff' + html], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);

    if (download) {

      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = data.name;

      anchor.click();
    }

    return url;
  }

  public static permissions(module: string = null) {

    let permissions = (Utilities.currentLoginData && Utilities.currentLoginData.permissions ? (Utilities.currentLoginData.permissions as IPermissions) : {});

    if (module && permissions) {
      permissions = (permissions[module] || {});
    }

    return permissions;
  }

  public static filters(data: any[], filterItems: filter[]) {

    let records = Utilities.deepClone(data);

    $$(filterItems).map((_, item: filter) => {

      let arr = [];

      const filter = Object.entries(item.filter)[0];
      const property = filter[0];
      const value = filter[1];
      const keys = property.split('.');

      const combination = (data, target) => {

        let check = false;

        if (!item.settings || !item.settings.combination || (item.settings.combination == 'full')) {

          if (item.settings.operator) {

            if (item.settings.operator == '<=') {
              if (target <= value) { arr.push(data); check = true; }
            }

            if (item.settings.operator == '<') {
              if (target < value) { arr.push(data); check = true; }
            }

            if (item.settings.operator == '=') {
              if (target == value) { arr.push(data); check = true; }
            }

            if (item.settings.operator == '>') {
              if (target > value) { arr.push(data); check = true; }
            }

            if (item.settings.operator == '>=') {
              if (target >= value) { arr.push(data); check = true; }
            }
          } else {

            if (String(target).toLowerCase() == String(value).toLowerCase()) {
              arr.push(data); check = true;
            }
          }
        } else if (item.settings || item.settings.combination || (item.settings.combination == 'partial')) {

          if (String(target).toLowerCase().search(String(value).toLowerCase()) !== -1) {
            arr.push(data); check = true;
          }
        }

        return check;
      }

      $$(records).map((_, record) => {

        if (item.settings && item.settings.nested) {

          if (record[keys[0]]) {

            $$(Utilities.dotNotation(record[keys[0]], keys[0])).map((k, v) => {

              if (property == String(k).replace(/.[0-9]/g, '')) {

                let check = combination(record, v);

                if (check) {
                  return true;
                }
              }
            });
          }
        } else {
          combination(record, record[property]);
        }
      });

      records = arr;
    });

    return records;
  }

  public static composeClausures(filters: any) {

    const where: query['where'] = [];

    $$(filters).map((_, item) => {

      let field: any = Object.keys(item.filter)[0];
      const value: any = Object.values(item.filter)[0];
      const operator: any = item.settings.operator;
      let arrayField: string = null;

      if (item.settings && item.settings.nested && field.includes('.')) {
        const parts = field.split('.');
        const root = parts.shift();

        if (root === 'service' && parts[0] === 'types') {
          arrayField = 'service.types';
          field = parts.slice(1).join('.');
        } else if (['products', 'paymentMethods'].includes(root)) {
          arrayField = root;
          field = parts.join('.');
        }
      }

      if ((item.settings.type == 'text') || (item.settings.type == 'date')) {
        if ((operator == '=') && !isNaN(parseInt(value)) && (new RegExp('code', 'gi')).test(field)) {
          // For numeric codes stored as numbers we should query using integer value
          where.push({ field, operator, value: parseInt(value.toString()), ...(arrayField ? { arrayField } : {}) });
        } else if (operator == 'like') {
          where.push({ field, operator, value: new RegExp(value, 'gi'), ...(arrayField ? { arrayField } : {}) });
        } else {
          where.push({ field, operator, value, ...(arrayField ? { arrayField } : {}) });
        }
      } else if ((item.settings.type == 'phone') && value.length >= 4) {
        where.push({ field, operator, value: new RegExp("[\d\\w\\W\\s]*" + value, ''), ...(arrayField ? { arrayField } : {}) });
      } else {
        where.push({ field, operator, value, ...(arrayField ? { arrayField } : {}) });
      }
    });

    return where;
  }

  public static clearCache(reloadAfterClear = true) {

    if ('caches' in window) {

      caches.keys().then((names) => {
        names.forEach(async (name) => {
          await caches.delete(name);
        })
      })

      if (reloadAfterClear) {
        window.location.reload();
      }
    }
  }

  public static compareObject(obj1, obj2) {
    return [...JSON.stringify(obj1 || {})].sort((a, b) => a.localeCompare(b)).join() == [...JSON.stringify(obj2 || {})].sort((a, b) => a.localeCompare(b)).join();
  }

  // Utilitary Methods

  public static getDaysInMonth(month: number, year: number) {
    return month === 2 ? year & 3 || !(year % 25) && year & 15 ? 28 : 29 : 30 + (month + (month >> 3) & 1);
  }

  public static localStorage(property?: string, value: any = undefined, currentUser: boolean = true): any {

    if (property) {

      if (value != undefined) {
        if (currentUser) {


          const logins = Utilities.deepClone(Utilities.logins);
          const currentLoginData = Utilities.deepClone(this.currentLoginData);

          currentLoginData[property] = value;

          logins[Utilities.windowID] = Utilities.deepClone(currentLoginData);
          window.localStorage.setItem("logins", JSON.stringify(logins));
        } else {
          window.localStorage.setItem(property, value);
        }
      } else {
        return currentUser ? this.currentLoginData[property] : window.localStorage.getItem(property);
      }
    } else {
      return (currentUser ? this.currentLoginData : window.localStorage);
    }
  }

  public static generateInstallments(dueDay: number, installments: number, total: number) {

    const response: any[] = [];

    const amount = (total / installments);
    const date = new Date();

    for (let parcel = 1; parcel <= installments; parcel++) {

      let dueDate = dueDay;

      date.setMonth(date.getMonth() + 1);

      let month = (date.getMonth() + 1);
      let year = date.getFullYear();
      let lastDayOfMonth = Utilities.getDaysInMonth(month, year);

      if ((dueDate - lastDayOfMonth) > 0) {
        dueDate = lastDayOfMonth;
      }

      response.push({
        parcel,
        dueDate: new Date(`${year}-${month}-${dueDate} 00:00:00`).toISOString().split('T')[0],
        paidAmount: 0,
        amount,
        status: 'PENDENT'
      });
    }

    return response;
  }

  public static grupByPaymentDate(records) {

    let returnRecords = {};

    records.forEach((item) => {

      // console.log(item)

      if (item.date == DateTime.getDate('D')) {
        const date = item.date;
        returnRecords[date] = returnRecords[date] || { date: date, data: {} }
      }


      $$(item.records && item.records.sales ? item.records.sales : []).map((index, record) => {


        const paymentDate = record.paymentDate.split(" ")[0];

        const isToday = item.date == record.date.split(" ")[0];

        returnRecords[paymentDate] = returnRecords[paymentDate] || { date: paymentDate, data: {} }
        const day = returnRecords[paymentDate];


        if (paymentDate == day.date) {

          // console.log(record.code, paymentDate ,isToday, item.date , record.date.split(" ")[0]);

          day.balance = day.balance || {};

          day.balance.sales = day.balance.sales || 0;
          day.balance.productsCosts = day.balance.productsCosts || 0;
          day.balance.paymentsCosts = day.balance.paymentsCosts || 0;
          day.balance.servicesCosts = day.balance.servicesCosts || 0;
          day.balance.totalCosts = day.balance.totalCosts || 0;
          day.balance.totalCosts = day.balance.totalCosts || 0;
          day.balance.partialRevenue = day.balance.partialRevenue || 0;
          day.balance.finalRevenue = day.balance.finalRevenue || 0;
          day.balance.totalTaxes = day.balance.totalTaxes || 0;
          day.balance.additional = day.balance.additional || 0;


          day.balance.sales += record.balance.total || 0;
          day.balance.productsCosts += record.balance.productsCosts || 0;
          day.balance.paymentsCosts += record.balance.paymentsCosts || 0;
          day.balance.servicesCosts += record.balance.servicesCosts || 0;
          day.balance.totalCosts += record.balance.totalCosts || 0;
          day.balance.partialRevenue += record.balance.partialRevenue || 0;
          day.balance.finalRevenue += record.balance.finalRevenue || 0;
          day.balance.totalTaxes += record.balance.totalTaxes || 0;
          day.balance.additional += record.balance.additional || 0;


          day.records = day.records || {};


          day.balance.inflows = record.balance.inflows || 0;
          day.balance.outflows = record.balance.outflows || 0;

          day.records.sales = day.records.sales || [];
          day.records.sales.unshift(record);

        }

      });


      $$(item.records && item.records.inflows ? item.records.inflows : []).map((index, record) => {

        const date = record.registerDate.split(" ")[0];

        returnRecords[date] = returnRecords[date] || { date: date, data: {} }
        const hasSales = !!returnRecords[date];
        const day = returnRecords[date];

        day.balance = day.balance || {};
        day.records = day.records || {};

        if (!hasSales) {
          day.balance.sales = day.balance.sales || 0;
          day.balance.productsCosts = day.balance.productsCosts || 0;
          day.balance.paymentsCosts = day.balance.paymentsCosts || 0;
          day.balance.servicesCosts = day.balance.servicesCosts || 0;
          day.balance.totalCosts = day.balance.totalCosts || 0;
          day.balance.totalCosts = day.balance.totalCosts || 0;
          day.balance.partialRevenue = day.balance.partialRevenue || 0;
          day.balance.finalRevenue = day.balance.finalRevenue || 0;
          day.balance.totalTaxes = day.balance.totalTaxes || 0;
        }

        day.balance.inflows = day.balance.inflows || 0;
        day.balance.inflows = item.balance.inflows || 0;
        day.records.inflows = day.records.inflows || [];
        day.records.inflows.push(record);
      });


      $$(item.records && item.records.outflows ? item.records.outflows : []).map((index, record) => {

        const date = record.registerDate.split(" ")[0];
        const hasSales = !!returnRecords[date];
        returnRecords[date] = returnRecords[date] || { date: date, data: {} }
        const day = returnRecords[date];

        day.balance = day.balance || {};
        day.records = day.records || {};

        if (!hasSales) {
          day.balance.sales = day.balance.sales || 0;
          day.balance.productsCosts = day.balance.productsCosts || 0;
          day.balance.paymentsCosts = day.balance.paymentsCosts || 0;
          day.balance.servicesCosts = day.balance.servicesCosts || 0;
          day.balance.totalCosts = day.balance.totalCosts || 0;
          day.balance.totalCosts = day.balance.totalCosts || 0;
          day.balance.partialRevenue = day.balance.partialRevenue || 0;
          day.balance.finalRevenue = day.balance.finalRevenue || 0;
          day.balance.totalTaxes = day.balance.totalTaxes || 0;
        }

        day.balance.outflows = day.balance.outflows || 0;
        day.balance.outflows = item.balance.outflows || 0;
        day.records.outflows = day.records.outflows || [];
        day.records.outflows.push(record);
      });


    });


    returnRecords = Object.values(returnRecords);

    (<any>(returnRecords || [])).forEach(item => {
      if (item.records) {
        (item.records.sales || []).forEach((sale) => {

          // if (sale.code == "11952"){
          //   console.log(sale);
          // }

          sale.paymentMethods.forEach((method) => {
            if (method.uninvoiced) {
              item.balance.sales -= method.value || 0;
            }
            // else if (method.value == 59.9){
            //   console.log(sale.code, method.value);
            // }
          });
        })
      }

    });

    return returnRecords;
  };

  public static isBoolean(data: any) {
    return (typeof data == 'boolean');
  }

  public static isArray(data: any) {
    return (data instanceof Array);
  }

  public static removeExtraSpaces(str: string) {
    return str.replace(/\s+/g, ' ').trim();
  }

  public static parseXMLNfe(fileReader, simplesNacional: boolean = true) {
    const nfeDocument = new DOMParser().parseFromString(fileReader.result.toString(), "text/xml");
    const detContainer = nfeDocument.querySelectorAll("NFe infNFe det") || [];

    const data = {
      products: [],
      serie: parseInt(nfeDocument.querySelectorAll("NFe infNFe ide serie")[0]?.textContent),
      numero: parseInt(nfeDocument.querySelectorAll("NFe infNFe ide nNF")[0]?.textContent),
      chave: nfeDocument.querySelectorAll("protNFe infProt chNFe")[0]?.textContent
    };

    detContainer.forEach(det => {

      const product: any = {
        xmlCode: (det.querySelector("prod")?.querySelector("cProd")?.textContent || "").trim(),
        barcode: (det.querySelector("prod")?.querySelector("cEANTrib")?.textContent || "").trim(),
        name: (det.querySelector("prod")?.querySelector("xProd")?.textContent || "").trim(),
        ncm: (det.querySelector("prod")?.querySelector("NCM")?.textContent || "").trim(),
        cest: (det.querySelector("prod")?.querySelector("CEST")?.textContent || "").trim(),
        costPrice: parseFloat(det.querySelector("prod").querySelector("vUnTrib")?.textContent),
        unitaryCost: parseFloat(det.querySelector("prod").querySelector("vUnTrib")?.textContent),
        salePrice: parseFloat(det.querySelector("prod").querySelector("vUnTrib")?.textContent),
        quantity: parseFloat(det.querySelector("prod").querySelector("qTrib")?.textContent),
        tributes: {},
        selectedItems: parseFloat(det.querySelector("prod").querySelector("qTrib")?.textContent),
      };

      if (!product.barcode || product.barcode == 'SEM GTIN') {
        delete product.barcode;
      }

      if (!product.ncm || product.ncm == 'SEM GTIN') {
        delete product.ncm;
      }

      if (!product.cest) {
        delete product.cest;
      }


      const tax = det.querySelector("imposto");
      const icms = tax.querySelector("ICMS")?.firstChild;
      const icmsst = tax.querySelector("ICMSST")?.firstChild;
      const pis = tax.querySelector("PIS")?.firstChild;
      const pisst = tax.querySelector("PISST")?.firstChild;
      const cofins = tax.querySelector("COFINS")?.firstChild;
      const cofinsst = tax.querySelector("COFINSST")?.firstChild;

      if (icms) {

        product.tributes.icms = {
          origem: icms.querySelector("orig")?.textContent,
          cst: icms.querySelector("CST")?.textContent || icms.querySelector("CSOSN")?.textContent,
          aliquota: parseFloat(pis.querySelector("pICMS")?.textContent || 0),
          baseCalculo: {
            modalidadeDeterminacao: parseInt(pis.querySelector("modBC")?.textContent || 0),
          },
        };
      }

      if (icmsst) {

        product.tributes.icms = product.tributes.icms || {};
        product.tributes.icms.substituicaoTributaria = {
          aliquota: parseFloat(icms.querySelector("pICMSST")?.textContent || 0),
          baseCalculo: {
            modalidadeDeterminacao: parseInt(icms.querySelector("modBCST")?.textContent || 0),
            valor: parseInt(icms.querySelector("vICMSST")?.textContent || 0)
          },
        };

        product.tributes.icms.cst = simplesNacional ? 500 : 60;
      }

      if (pis) {

        product.tributes.pis = {
          cst: pis.querySelector("CST")?.textContent || pis.querySelector("CSOSN")?.textContent,
          aliquota: parseFloat(pis.querySelector("pPIS")?.textContent || 0)
        };

      }

      if (pisst) {

        product.tributes.pis = product.tributes.pis || {};
        product.tributes.pis.substituicaoTributaria = {
          baseCalculo: parseFloat(cofinsst.querySelector("vBC")?.textContent || 0),
          aliquota: parseFloat(pisst.querySelector("pPIpPISS")?.textContent || 0),
          aliquotaReais: parseFloat(pisst.querySelector("vAliqProd")?.textContent || 0),
          valor: parseFloat(pisst.querySelector("vPIS")?.textContent || 0),
        };

        product.tributes.pis.cst = 75;
      }

      if (cofins) {

        product.tributes.cofins = {
          cst: cofins.querySelector("CST")?.textContent || cofins.querySelector("CSOSN")?.textContent,
          aliquota: parseFloat(pis.querySelector("pCOFINS")?.textContent || 0)
        };
      }

      if (cofinsst) {

        product.tributes.cofins = product.tributes.cofins || {};
        product.tributes.cofins.substituicaoTributaria = {
          baseCalculo: parseFloat(cofinsst.querySelector("vBC")?.textContent || 0),
          aliquota: parseFloat(cofinsst.querySelector("pCOFINS")?.textContent || 0),
          aliquotaReais: parseFloat(cofinsst.querySelector("vAliqProd")?.textContent || 0),
          valor: parseFloat(cofinsst.querySelector("vCOFINS")?.textContent || 0),
        };

        product.tributes.cofins.cst = 75;
      }


      // console.log(product);
      // console.log(product, icms, pis, cofins)


      data.products.push(product);

    });

    return data;
  }


  private static dotNotation(data: any, prefix: string = null) {

    const exec = (data, prefix) => {

      let obj: any = {};

      for (let [key, value] of Object.entries(data)) {

        if (typeof value == 'object') {

          let path: string = (prefix ? `${prefix}.${key}` : key);
          let temp: string = '';

          const checker = (data: any) => {

            if (!data) { return; }

            for (let [key, value] of Object.entries(data)) {

              if (typeof value == 'object') {
                temp += `.${key}`;
                checker(value);
              } else {
                obj[`${(path + temp)}.${key}`] = value;
              }
            }

            temp = temp.substring(0, temp.lastIndexOf('.'));
          };

          checker(value);
        } else {

          if (prefix) {
            obj[(prefix ? `${prefix}.${key}` : key)] = value;
          } else {
            obj[key] = value;
          }
        }
      }

      return obj;
    };

    return exec(data, prefix);
  }

  public static mountCustomerObject = (data: any, type: "serviceOrders" | "cashierSales" | "financialBillsToReceive" | "RegistersVehicles") => {
    const newData: any = {
      name: data.name
    };

    if (type != "RegistersVehicles") {
      if (data.contacts?.phone) { newData.phone = data.contacts.phone }
      if (data.contacts?.email) { newData.email = data.contacts.email }
    }

    if (data.personalDocument) { newData.personalDocument = data.personalDocument }
    if (data.businessDocument) { newData.businessDocument = data.businessDocument }
    if (typeof data.address == "object") {
      newData.address = `${data.address.local ? (data.address.local + ' ') : ''}${data.address.number ? ('Nº ' + data.address.number) : ''}${data.address.complement ? (' ' + data.address.complement) : ''}${data.address.neighborhood ? (', ' + data.address.neighborhood) : ''}${data.address.city ? (', ' + data.address.city) : ''}${data.address.state ? (' - ' + data.address.state) : ''}`;
    }

    if (type == "RegistersVehicles") {
      newData.contacts = {};
      if (data.contacts?.phone) { newData.contacts.phone = data.contacts.phone }
      if (data.contacts?.email) { newData.contacts.email = data.contacts.email }
      data.addressCustom = newData.address ?? "";
    }

    return newData;
  };

  public static getDiscountUnitary(products: any[], services?: any[]) {
    let totalDiscount: number = 0;
    (products || []).forEach((item) => {

      // console.log(item.unitaryPrice < item.salePrice, item.code, item.unitaryPrice, item.salePrice, item)

      totalDiscount += (() => {
        const value = (item.unitaryPrice < item.salePrice) ? (item.salePrice - item.unitaryPrice) * item.selectedItems : 0;
        // console.log(item, value);
        return isNaN(value) ? 0 : value;
      })();
    });

    (services || []).forEach((item) => {
      totalDiscount += (() => {

        let value = 0;

        if (item.customPrice) {
          value = item.customPrice < item.executionPrice ? (item.customPrice - item.executionPrice) : 0;
        }

        console.log(item, value);
        return isNaN(value) ? 0 : value;
      })();
    });

    return totalDiscount;
  };

  public static getTaxUnitary(products: any[]) {
    let totalTax: number = 0;
    (products || []).forEach((item) => {
      totalTax += (() => {
        const value = (item.unitaryPrice > item.salePrice) ? (item.unitaryPrice - item.salePrice) * item.selectedItems : 0;
        return isNaN(value) ? 0 : value;
      })();
    });
    return totalTax;
  }

  public static checkTributes(tributes: any, isSimplesNacional: boolean = true) {

    tributes = tributes || {};
    tributes.icms = tributes.icms || {};

    if (isSimplesNacional) {

      switch (tributes.icms?.cst) {
        case "41": {
          tributes.icms.cst = "300";
          break;
        }
        case "50": {
          tributes.icms.cst = "400";
          break;
        }
        case "60": {
          tributes.icms.cst = "500";
          break;
        }
        case "90": {
          tributes.icms.cst = "900";
          break;
        }
        default: {
          tributes.icms.cst = parseInt(tributes.icms?.cst) > 100 ? tributes.icms?.cst : "102";
          break;
        }
      }
    } else {

      switch (tributes.icms?.cst) {
        case "500": {
          tributes.icms.cst = "60";
          break;
        }
        case "103": {
          tributes.icms.cst = "40";
          break;
        }
        case "201": case "202": {
          tributes.icms.cst = "10";
          break;
        }
        case "203": {
          tributes.icms.cst = "30";
          break;
        }
        default: {
          tributes.icms.cst = parseInt(tributes.icms?.cst) < 100 ? tributes.icms?.cst : "00";
          break;
        }
      }
    }

    return tributes;
  }

  public static forceAlloc(data) {
    JSON.stringify(data);
  }

}
