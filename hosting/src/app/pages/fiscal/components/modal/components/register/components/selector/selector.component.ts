import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, OnDestroy } from '@angular/core';

// Services
import { PaymentMethodsService } from '../../../../../../../registers/paymentMethods/paymentMethods.service';

// Utilties
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';

@Component({
  selector: 'nf-payment-methods-selector',
  templateUrl: './selector.component.html',
  styleUrls: ['./selector.component.scss']
})
export class NfPaymentMethodsSelectorComponent implements OnInit, OnDestroy {

  @Output() callback: EventEmitter<any> = new EventEmitter();
  @ViewChild('searchBar', { static: true }) searchBar: ElementRef;

  public static shared: NfPaymentMethodsSelectorComponent;

  public loading: boolean = true;
  public settings: any = [];
  public recordsData: any = [];
  public searchData: any = [];
  public methodsSelected: any = [];

  constructor(
    private paymentMethodsService: PaymentMethodsService
  ) {
    NfPaymentMethodsSelectorComponent.shared = this;
  }

  public ngOnInit() {

//     Administradora de Cartões Sicredi Ltda	03106213000271
// Alelo S.A	04740876000125
// Banco Bradesco Cartões S/A	59438325000101
// Banestes administradora de cartões de crédito e serviços ltda	27054261000140
// Banco CIFRA S/A	62421979000129
// Banco Safra S/A	58160789000128
// Banco Topázio S/A	07679404000100
// Banco Triângulo S/A	17351180000159
// BIGCARD Adm. de Convênios e Serviços	04627085000193
// BOURBON Adm. de Cartões de Crédito	01418852000166
// CABAL Brasil Ltda	03766873000106
// CETELEM Brasil S/A- CFI	03722919000187
// CIELO S/A	01027058000191
// CREDI 21 Participações Ltda	03529067000106
// ECX CARD Adm. e Processadora de Cartões S/A	71225700000122
// EMPÓRIO CARD LTDA	04432048000120
// FREEDDOM e Tecnologia e Serviços S/A	07953674000150
// FUNCIONAL CARD LTDA	03322366000175
// Green Card S/A Refeições comercio e serviços	92559830001224
// HIPERCARD Banco Multiplo S/A	03012230000169
// MAPA Admin. Conv. e Cartões Ltda	03966317000175
// Novo Pag Adm. e Proc. de Meios Eletrônicos de Pagto. Ltda	00163051000134
// PERNAMBUCANAS Financiadora S/A Crédito, Fin. e Invest	43180355000112
// POLICARD Systems e Serviços Ltda	00904951000195
// PROVAR Negócios de Varejo Ltda	33098658000137
// REDECARD S/A	
// 01425787000104
// RENNER Adm. Cartões de Crédito Ltda	90055609000150
// SODEXO Pass do Brasil Serviços e Comércio S/A	69034668000156
// SOROCRED Meios de Pagamentos Ltda	60114865000100
// TICKET Serviços S/A	47866934000174
// TRIVALE Administração Ltda	00604122000197
// Unicard Banco Múltiplo S/A - TRICARD	61071387000161
// VR Benefícios e serviços de processamento S.A	02535864000133



// 60.419.645/0001-95 BANCO BANKPAR S/A
// 59.438.325/0001-01 BANCO BRADESCO CARTOES S.A
// 02.038.232/0001-64 BANCO COOPERATIVO DO BRASIL S/A - BANCOOB BIN / SIPAG
// 90.400.888/0001-42 BANCO SANTANDER (BRASIL) S.A.
// 17.351.180/0001-59 BANCO TRIANGULO S.A. TRIBANCO
// 28.127.603/0148-02 BANESTES S/A - BANCO DO ESTADO DO E AGENCIA CENTRAL (MATRIZ)
// 08.965.639/0001-13 BCASH INTERMEDIAÇÃO DE NEGÓCIOS BCASH
// 04.627.085/0001-93 BIGCARD ADM. DE CONVENIOS E SERV. BIGCARD
// 07.502.395/0001-70 BIGGOLD CARTAO CREDITO MULT. EMPR. BIGCARD SOCIEDADE DE CREDITO AO MICROEMPREENDEDOR
// 03.130.170/0001-89 BRASIL CARD ADMINISTRADORA DE CARTÃO
// 03.817.702/0001-50 BRASILCARD ADMINISTRADORA CARTOES BRASILCARD
// 03.766.873/0001-06 CABAL BRASIL LTDA CABAL BRASIL
// 04.740.876/0001-25 CIA BRASILEIRA SOLUCOES E SERVICOS
// 01.027.058/0001-91 CIELO S.A.
// 07.599.577/0001-00 CREDPAR
// 07.599.577/0004-53 CREDPAR PROM DE NEG DE CREDITO LTDA CREDPAR
// 71.225.700/0001-22 ECX CARD ADMINISTRADORA E PROCESSAD ECX CARD
// 12.592.831/0001-89 ELAVON BRASIL SOLUCOES PAGTO SA ELAVON
// 04.432.048/0001-20 EMPORIO CARD LTDA
// 03.506.307/0001-57 EMPRESA BRAS TEC ADM CONV HOM LTDA ECOFROTAS
// 02.732.968/0001-38 FORTBRASIL ADM DE CARTOES DE CRED
// 03.322.366/0001-75 FUNCIONAL CARD LTDA
// 10.440.482/0001-54 GETNET ADQUIRENCIA E SERVICOS PARA MEIOS DE PAG GETNET S.A.
// 17.887.874/0001-05 GLOBAL PAYMENTS - SERVICOS DE PAGAMENTOS S.A.
// 10.256.528/0001-80 GOIASCARD CREDPAR
// 03.012.230/0001-69 HIPERCARD BCO MULTIP S A
// 23.560.368/0001-00 JETCARD PROMOTORA DE NEGÓCIOS DE CRÉDITO JETCARD
// 12.886.711/0002-75 JETPAR JETPAR
// 33.200.056/0001-49 LOJAS RIACHUELO S.A. LOJAS RIACHUELO
// 10.573.521/0001-91 MERCADOPAGO.COM REPRESENTACOES LTDA.
// 08.718.431/0001-08 MOIP PAGAMENTOS S.A. MOIP
// 08.011.683/0001-94 NACIONAL S/A ADMINISTRADORA DE CART USACARD
// 00.904.951/0001-95 POLICARD SYSTEMS E SERVIÇOS LTDA POLICARD SYSTEM
// 33.098.658/0001-37 PROVAR NEGOCIOS DE VAREJO LTDA
// 01.425.787/0001-04 REDECARD S/A REDE
// 65.697.260/0001-03 REPOM S/A REPOM
// 03.877.288/0001-75 SENFFNET LTDA SENFFNET
// 04.966.359/0001-79 SIGA CRED ADMINISTRADORA LTDA SIGA CRED
// 69.034.668/0001-56 SODEXO PASS DO BRASIL SERV E COM SA SODEXO
// 16.501.555/0001-57 STONE PAGAMENTOS S.A. STONE
// 47.866.934/0001-74 TICKET SERVICOS S.A. TICKET
// 02.561.118/0001-14 TRIPAR BSB ADMINISTRADORA DE CARTÕES LTDA VALESHOP
// 00.604.122/0001-97 TRIVALE ADMINISTRACAO LTDA


    const flags = [
      {name: "Mastercard",  cnpj: "01248201000175", value: 0},
      {name: "Visa",  cnpj: "01027058000191", value: 0},
      {name: "Elo",  cnpj: "9227084000175", value: 0},
      {name: "American Express",  cnpj: "58503129001093", value: 0},
      {name: "Hipercard", cnpj: "03012230000169", value: 0},
//       Diners	Bandeira de cartão de crédito Diners
// 93	ELO	Bandeira de cartão de crédito Elo
// 94	Hiper	Bandeira de cartão de crédito Hiper
// 8	BancoDoBrasil	Débito em conta Banco do Brasil
// 22	Bradesco	Débito em conta banco Bradesco
// 13	Itau	Débito em conta banco Itau
// 73	BoletoBancario	Boleto bancário gerado pela instituição financeira Bradesco
// 75	Hipercard	Bandeira de cartão de crédito Hipercard
// 76	Paggo	Cobrança em conta Oi Paggo
// 88	Banrisul	Débito em conta banco Banrisul
    ];

    const paymentMethods = [
      {code: "01", name: "01 = Dinheiro", value: 0, aVista: true},
      {code: "02", name: "02 = Cheque", aVista: true, value: 0},
      {code: "03", name: "03 = Cartão de Crédito", aVista: true, flags: flags, value: 0, cartao: { tipoIntegracao: 2 }},
      {code: "04", name: "04 = Cartão de Débito", aVista: true, flags: flags, value: 0, cartao: { tipoIntegracao: 2 }},
      {code: "05", name: "05 = Crédito Loja",aVista: true, flags, value: 0},
      {code: "10", name: "10 = Vale Alimentação",aVista: true, value: 0},
      {code: "11", name: "11 = Vale Refeição",aVista: true, value: 0},
      {code: "12", name: "12 = Vale Presente",aVista: true, value: 0},
      {code: "13", name: "13 = Vale Combustível",aVista: true, value: 0},
      {code: "15", name: "15 = Boleto Bancário",aVista: true, value: 0},
      {code:"16", name:"16 = Depósito Bancário", aVista: true, value: 0},
      {code:"17", name:"17 = Pagamento Instantâneo (PIX)", aVista: true, value: 0},
      {code:"18", name:"18 = Transferência bancária, Carteira Digital", aVista: true, value: 0},
      {code:"19", name:"19 = Programa de fidelidade, Cashback, Crédito Virtual", aVista: true, value: 0},
      {code: "90", name: "90 = Sem pagamento (apenas para NFe", aVista: true, value: 0},
      {code: "99", name: "99 = Outros",  aVista: true,value: 0, descricaoMeio: "Outra(s) forma(s) de pagamento"},
    ];
    

    this.recordsData = paymentMethods;
    this.loading = false;

    this.callback.emit({ instance: this });
  }

  // Initialize Method

  public bootstrap() {
    $$(this.searchBar.nativeElement).find('input')[0].focus();
  }

  // User Interface Actions - Filters

  public onSearch() {

    const value = $$(this.searchBar.nativeElement).find('input').val().toLowerCase();
    const searchResult = [];    

    if (value != '') {
      
      $$(this.recordsData).map((_, method) => {

        if (String(method.name).toLowerCase().search(value) != -1) {
          searchResult.push(method);
        }

        if (method.providers) {

          method = Utilities.deepClone(method);

          $$(method.providers).map((_, provider) => {

            if (String(provider.name).toLowerCase().search(value) != -1) {
              method.providers = [ provider ];
              searchResult.push(method);
            }
          });
        }
      });
    }
    
    this.searchData = searchResult;
  }

  public onCheckSearchBar(value: string) {

    if (value == '') {
      setTimeout(() => { this.searchData = [] }, 1500);      
    }
  }

  // User Interface Actions - Common

  public onResetSearchBar() {
    $$(this.searchBar.nativeElement).find('input').val('');
    this.searchData = [];
  }

  public onSelectPaymentMethod(event: Event, data: any, parent: any = null) {

    event.stopPropagation();
 
    if (!data.providers) {

      if (this.methodsSelected.length > 0) {
      
        let index = -1;
        let c = 0;
  
        for (const item of this.methodsSelected) {
          if (item.code == data.code) { index = c }
          c++;
        }
  
        if (index == -1) {

          data.selected = true;

          if (data.code > 4000 && data.code < 5000) {
            data.fees[0].selected = true;
          }

          if (parent) {
            data.alternateName = `${parent.name} - ${data.name}`;
          }
          
          this.methodsSelected.push(data);
        } else {          
          this.methodsSelected.splice(index, 1);
          data.selected = false;
        }      
      } else {
               
        data.selected = true;

        if (data.code > 4000 && data.code < 5000) {
          data.fees[0].selected = true;
        }
        
        if (parent) {
          data.alternateName = `${parent.name} - ${data.name}`;
        }
        
        this.methodsSelected.push(data); 
      }
    }
  }

  public onConfirmSelect() {
    this.callback.emit({ data: this.methodsSelected, close: true });
  }  

  // Auxiliary Methods

  public selectMethods(data: any[]) {

    const arrData = [];

    if (data && (data.length > 0)) {

      const findPaymentMethod = (code: string)=>{
        const response = {index: -1, data: null};

        this.recordsData.forEach((value, index)=>{
          if (value.code == code){
            response.index = index;
            response.data = value;
          }
        });
        return response;
      }

      const methodsSelected = ((data) => {
        const obj = {};
        
        $$(data).map((_, v) => { 
          if (v.code){
            obj[v.code] = findPaymentMethod(v.code);
            obj[v.code].value = v.value || 0;
            obj[v.code].aVista = v.aVista != undefined ? v.aVista : !obj[v.code].aVista;
            obj[v.code].descricaoMeio = v.descricaoMeio || "";
          }
        }); 
        
        return obj;
      })(data);      

      for (let item of this.recordsData) {
        
        item.selected = false;

        const data = methodsSelected[item.code];

        if (data) {
          
          item.value = (data.value || 0);
          item.selected = true;
          item.aVista = !!data.aVista;
          item.descricaoMeio = item.descricaoMeio;

          arrData.push(item);
        }
      }
    }

    // console.log("arrData: ",arrData);

    this.methodsSelected = arrData;

    this.onConfirmSelect();
  }

  public deselectMethod(data: any) {

    $$(this.methodsSelected).map((k, item) => {
      if (item.code == data.code) {
        this.methodsSelected.splice(k, 1);
      }
    });

    for (const method of this.recordsData) {      

      if (method.code == data.code) {

        if (method.hasOwnProperty('value')) {
          delete method.value;
        }

        if (method.hasOwnProperty('selected')) {
          delete method.selected;
        }
      }

      if (method.providers) {

        for (const provider of method.providers) {

          if (provider.code == data.code) {

            if (provider.hasOwnProperty('value')) {
              delete provider.value;
            }

            if (provider.hasOwnProperty('parcelChecked')) {
              delete provider.parcelChecked;
            }

            if (provider.hasOwnProperty('selected')) {
              delete provider.selected;
            }
          }
        }
      }
    }
  }

  // Utility Methods
  
  public reset() {

    for (const method of this.recordsData) {      

      if (method.hasOwnProperty('value')) {
        delete method.value;
      }

      if (method.hasOwnProperty('selected')) {
        delete method.selected;
      }

      if (method.providers) {

        for (const provider of method.providers) {

          if (provider.hasOwnProperty('value')) {
            delete provider.value;
          }

          if (provider.hasOwnProperty('parcelChecked')) {
            delete provider.parcelChecked;
          }

          if (provider.hasOwnProperty('selected')) {
            delete provider.selected;
          }
        }
      }
    }

    this.methodsSelected = [];
  }

  // Destruction Methods

  public ngOnDestroy() {

    this.settings = {};
    this.recordsData = [];
    this.methodsSelected = [];

    this.paymentMethodsService.removeListeners('records', 'PaymentMethodsSelectorComponent');
  }

}
