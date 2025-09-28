import { Component, OnDestroy, OnInit } from '@angular/core';

// Services
import { FiscalService } from './fiscal.service';
import { Utilities } from '@shared/utilities/utilities';
import { IPermissions } from '@shared/interfaces/_auxiliaries/IPermissions';
import { Dispatch } from '@shared/utilities/dispatch';
import { ENFeType } from '@shared/enum/EFiscal';
import { ScrollMonitor } from '@shared/utilities/scrollMonitor';
import { FieldMask } from '@shared/utilities/fieldMask';

@Component({
  selector: 'fiscal',
  templateUrl: './fiscal.component.html',
  styleUrls: ['./fiscal.component.scss']
})
export class FiscalComponent implements OnInit, OnDestroy{

  public loading: boolean = false;

  public currentNfType = "NFE";

  public _checkSettings: boolean = false;
  
  public fiscalNotes: any = [];
  public inutilizationfiscalNotes: any = [];
  public settings: any = {};
  public permissions: any = {};

  private modalComponent: any;
  private paginationComponent: any;  
  private hashNexpPage = "";
  private hashPreviousPage = "";
  private hashPreviousPages = [];

  constructor(
    private fiscalService: FiscalService
  ) {
    ScrollMonitor.reset();
    this.permissionsSettings();
  }    

  public ngOnInit(): void {

    this.loading = true;
    this.hashNexpPage = "";

    this.fiscalService.getStoreSettings("Fiscal", (data)=>{

      JSON.stringify(data);

      this.settings = data;
      this._checkSettings = true;
    });

    this.fiscalService.getInutilizatonNotes("Fiscal/InutilizationNotes", (data)=>{

      JSON.stringify(data);

      console.log(data);

      this.inutilizationfiscalNotes = data;

      // this.settings = data;
      // this._checkSettings = true;
    });

    // query

    // console.log(FieldMask.quantityFieldMask('555'));


    this.fiscalService.getNotes("Fiscal", (data)=>{


      // console.log(data);

      // data = [
      //   {
      //   "id": "5adf347aa679c716ea3c5234",
      //   "idIntegracao": "9228980",
      //   "emissao": "07/05/2018",
      //   "tipoAutorizacao": "WEBSERVICE",
      //   "situacao": "CONCLUIDO",
      //   "prestador": "18189174000160",
      //   "tomador": "18189174000160",
      //   "valorServico": 10.5,
      //   "numeroNfse": "3960",
      //   "serie": "1",
      //   "lote": 173283,
      //   "codigoVerificacao": "54D1D813E",
      //   "autorizacao": "07/05/2018",
      //   "mensagem": "RPS Autorizada com sucesso",
      //   "pdf": "https://api.sandbox.plugnotas.com.br/nfse/imprimir/5afb267d9b0a890277ee08fe",
      //   "xml": "https://api.sandbox.plugnotas.com.br/nfse/xml/5afb267d9b0a890277ee08fe",
      //   "cancelamento": "08/05/2018",
      //   "numero": 123
      //   }
      //   ]

      if(data.length >= 1){
        this.hashNexpPage = data[data.length - 1].id;
      }

      this.fiscalNotes = data;
      this.loading = false;
    });

    this.fiscalService.query([]);

    return;

    const store = [
      {
        "endereco": {
        "codigoPais": "1058",
        "descricaoPais": "Brasil",
        "tipoLogradouro": "Rua",
        "logradouro": "AV DUQUE DE CAXIAS",
        "numero": "882",
        "complemento": "SALA 1708 TORRE II",
        "tipoBairro": "Zona",
        "bairro": "CENTRO",
        "codigoCidade": "4115200",
        "descricaoCidade": "MARINGÁ",
        "estado": "PR",
        "cep": "87111520"
        },
        "telefone": {
          "ddd": "44",
          "numero": "999999999"
        },
        "logotipo": {
          "fileName": "logotecno.jpeg"
        },
        "nfse": {},
        "nfe": {
          "config": {
            "producao": false,
            "impressaoFcp": false,
            "impressaoPartilha": false,
            "versaoManual": "6.0",
            "versaoEsquema": "pl_009",
            "calculoAutomaticoIbpt": {},
            "numeracao": [
              {
                "serie": 1,
                "numero": 1
              }
            ]
          },
          "ativo": true,
          "tipoContrato": 0
        },
        "nfce": {},
        "incentivoFiscal": false,
        "incentivadorCultural": false,
        "_id": "5cc75e53cc446f3dccdbxxxx",
        "cpfCnpj": "08187168000160",
        "inscricaoEstadual": "9044016688",
        "inscricaoMunicipal": "716",
        "razaoSocial": "TECNOSPEED S/A",
        "simplesNacional": false,
        "regimeTributario": 1,
        "regimeTributarioEspecial": 1,
        "email": "teste@tecnospeed.com.br",
        "certificado": "5f18b5d18c862d6452fxxxx",
        "createdAt": "2019-04-29T20:28:04.018Z",
        "updatedAt": "2020-07-27T18:24:40.993Z",
        "nomeFantasia": "TECNOSPEED"
        }
      ]

      // this.fiscalService.updateSettings(store[0]);
  }

  // User Interface Actions  

  public onFilter(event: any){

  }

  public async onSearch(event: any) {

    let value = event.value.trim();
    let searchResult = [];

    if (value != "") {

      await this.fiscalService.getResumeNf(ENFeType.NFE, value).then((res: any)=>{
        searchResult = [...searchResult, ...res];
      }).catch(e=>{});

      await this.fiscalService.getResumeNf(ENFeType.NFE, value, true).then((res: any)=>{
        searchResult = [...searchResult, ...res];
      }).catch(e=>{});

      await this.fiscalService.getResumeNf(ENFeType.NFCE, value).then((res: any)=>{
        searchResult = [...searchResult, ...res];
      }).catch(e=>{});

      await this.fiscalService.getResumeNf(ENFeType.NFCE, value, true).then((res: any)=>{
        searchResult = [...searchResult, ...res];
      }).catch(e=>{});

      await this.fiscalService.getResumeNf(ENFeType.NFSE, value).then((res: any)=>{
        searchResult = [...searchResult, ...res];
      }).catch(e=>{});

      await this.fiscalService.getResumeNf(ENFeType.NFSE, value, true).then((res: any)=>{
        searchResult = [...searchResult, ...res];
      }).catch(e=>{});
    }

    if (searchResult.length > 0) {
      this.fiscalNotes = searchResult;
    } else {
      this.fiscalService.query([
        {field: "type", operator: "=", value: this.currentNfType}
      ], true, false, true, true);
    }
  } 

  public onRead(data: any) {

    // console.log(data);
    
    this.modalComponent.onOpen({
      title: 'Detalhes da Nota',
      activeComponent: 'Fiscal/View',
      data: data
    });
  }

  public onChangeNfType(event){
    const value = event.target.value;
    this.currentNfType = value;
    
    this.fiscalService.query([
      {field: "type", operator: "=", value: value}
    ], true, false, true, true).finally(()=>{

      this.hashPreviousPages = [];
    });
  }


  public onSettings(event: Event) {

    if (!this._checkSettings){ return; }

    this._checkSettings = false;

    this.fiscalService.getStoreSettings("FiscalOnSettings", (data)=>{
      this.fiscalService.removeListeners("store-settings", 'FiscalOnSettings');

      JSON.stringify(data);

      this.settings = data;
      this._checkSettings = true;

      this.modalComponent.onOpen({
        title: 'Configurações de Emissão',
        activeComponent: 'Fiscal/Settings',      
        data: Utilities.deepClone(this.settings)
      }); 
    });

    // console.log("this.settings: ",this.settings);
  
  }

  public onEmitNf(event: Event) {
    this.modalComponent.onOpen({
      title: 'Emitir Nota Fiscal',
      activeComponent: 'Fiscal/Add'
    });
  }

  public onAdjustNf(event: Event, data: any = null) {

    event.stopPropagation();

    if (data && data.type == 'NFCE'){ return; }

    this.modalComponent.onOpen({
      title: 'Corrigir Nota Fiscal',
      activeComponent: 'Fiscal/Edit',
      data: Utilities.deepClone(data)
    });
  }

  public onCancelNf(event: Event, data: any = null) {

    event.stopPropagation();

    if (data && this.checkCancel(data)){ return; }

    this.modalComponent.onOpen({
      title: 'Cancelar Nota Fiscal',
      activeComponent: 'Fiscal/Cancel',      
      data: Utilities.deepClone(data)
    }); 
  }

  public onInutlizationNf(event: Event, data: any = null) {

    event.stopPropagation();

    this.modalComponent.onOpen({
      title: 'Inutilizar Nota Fiscal',
      activeComponent: 'Fiscal/Inutilization',      
      data: Utilities.deepClone({})
    }); 
  }

  

  public onDonwloadXML(event: Event, data: any) {

    // this.fiscalService.downloadNote().then((res)=>{

    // }).catch((error)=>{

    // });
  }

  // Utilities
    
  private permissionsSettings() {

    const setupPermissions = () => {

      if (Utilities.isAdmin) {

        this.permissions = {
          actions: { add: true, edit: true, delete: true }
        } 
      } else {

        const permissions = (Utilities.permissions('fiscal') as IPermissions['fiscal']);
        
        this.permissions = {
          actions: {
            add: (permissions.actions.indexOf('add') !== -1),
            edit: (permissions.actions.indexOf('edit') !== -1),
            delete: (permissions.actions.indexOf('delete') !== -1)
          }
        }
      }
    };

    Dispatch.onRefreshCurrentUserPermissions('FiscalComponent', () => {
      setupPermissions();
    });

    setupPermissions();
  }

  // PiPers

  public checkCancel(item){

    const status = item.situacao || item.status;

    if (status == "PROCESSANDO" || status == 'AGUARDANDO_CANCELAMENTO' || status == 'CANCELADO' || status == "REJEITADO"){
      return true;
    }

    return false;
  }

  // Event Listeners

  public onPaginationResponse(event: any) {

    if (event.instance) {
      this.paginationComponent = event.instance;
    }   

    if (event.data) {
      this.fiscalNotes = event.data;
    }
  }

  public onModalResponse(event: any) {

    if (event.instance) { 
      this.modalComponent = event.instance;
    }   
  }

  public onPreviousPage(event){
    event.preventDefault();
    event.target.disabled = true;

    if(this.hashPreviousPage){

      this.hashPreviousPages.pop();
      this.hashPreviousPage = this.hashPreviousPages[this.hashPreviousPages.length - 1];

      this.hashNexpPage = this.fiscalNotes[this.fiscalNotes.length - 1].id;
      this.fiscalService.query([
        {field: "type", operator: "=", value: this.currentNfType},
        {field: "hashProximaPagina", operator: "=", value: this.hashPreviousPage}]
      ).finally(()=>{
        event.target.disabled = false;
      });
 
    }else{
      event.target.disabled = false;
    }

  }

  public onNextPage(event){
    event.preventDefault();
    event.target.disabled = true;

    if(!this.hashPreviousPages.includes(this.fiscalNotes[0].id)){
      this.hashPreviousPages.push(this.fiscalNotes[0].id);
      this.hashPreviousPage = this.hashPreviousPages[this.hashPreviousPages.length - 1];
    }

    this.fiscalService.query([
      {field: "type", operator: "=", value: this.currentNfType},
      {field: "hashProximaPagina", operator: "=", value: this.hashNexpPage}]
    ).finally(()=>{
      event.target.disabled = false;
    });
  }

  ngOnDestroy(): void {
    this.hashNexpPage = "";
    this.hashPreviousPages = [];
    this.fiscalService.removeListeners("store-settings", "Fiscal");
    this.fiscalService.removeListeners("records", "Fiscal");
    this.fiscalService.removeListeners("inutilization-notes", "Fiscal/InutilizationNotes");
  }

}
