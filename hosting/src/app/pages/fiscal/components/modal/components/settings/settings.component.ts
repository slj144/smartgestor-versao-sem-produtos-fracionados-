import { Component, EventEmitter, OnInit, Output, OnDestroy, Input } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

// Components


// Services
import { SettingsService } from '../../../../../settings/settings.service';
import { FiscalService } from '../../../../fiscal.service';

// Translate
import { FiscalTranslate } from '../../../../fiscal.translate';

// Interfaces

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { FieldMask } from '@shared/utilities/fieldMask';
import { CEPService } from '@shared/services/cep.service';
import { ENotificationStatus } from '@shared/interfaces/ISystemNotification';
import { NotificationService } from '@shared/services/notification.service';

@Component({
  selector: 'settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsNfComponent implements OnInit, OnDestroy {

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  @Input() settings: any = {};

  public translate = FiscalTranslate.get()['modal']['action']['register'];

  public loading: boolean = true;
  public data: any = {};

  public form: FormGroup;
  public formAdditionalSettings: FormGroup;
  public formCertificate: FormGroup;

  private layerComponent: any;
  private checkSearchPostCode: boolean = false;

  private storeModel = {
    "endereco": {
      "codigoPais": "1058",
      "descricaoPais": "Brasil",
      "tipoLogradouro": "",
      "logradouro": "",
      "numero": "",
      "complemento": "",
      "tipoBairro": "Zona",
      "bairro": "",
      "codigoCidade": "",
      "descricaoCidade": "",
      "estado": "",
      "cep": ""
    },
    "telefone": {
      "ddd": "44",
      "numero": "999999999"
    },
    "logotipo": {
      "fileName": ""
    },
    "nfse": {
      "ativo": false,
      "tipoContrato": 0,
      "config": {
        "producao": false,
        "nfseNacional": true,
        "rps": {
          "lote": 0,
          "numeracao": [
            // {
            // "numero": 1,
            // "serie": "RPS"
            // }
          ]
        },
        "prefeitura": {
          "login": "",
          "senha": "",
          "receitaBruta": 0,
          "lei": "",
          "dataInicio": ""
        },
        "email": {
          "envio": true
        },
        "calculoAutomaticoIbpt": {
          "ativo": false
        }
      }
    },
    "nfe": {
      "config": {
        "producao": false,
        "impressaoFcp": false,
        "impressaoPartilha": false,
        "versaoManual": "6.0",
        "versaoEsquema": "pl_009",
        "email": {
          "envio": true
        },
        "dfe": {
          "ativo": true
        },
        "calculoAutomaticoIbpt": {
          "ativo": true
        },
        "numeracao": [
          // {
          //   "serie": 1,
          //   "numero": 1
          // }
        ]
      },
      "ativo": false,
      "tipoContrato": 0
    },
    "nfce": {
      "ativo": false,
      "tipoContrato": 0,
      "config": {
        "producao": false,
        "email": {
          "envio": true
        },
        "sefaz": {
          "idCodigoSegurancaContribuinte": "",
          "codigoSegurancaContribuinte": ""
        },
        "numeracao": [
          // {
          // "numero": 1,
          // "serie": 1
          // }
        ],
        "integracoes": {
          "plugStorage": {
            "ativo": false,
            "email": "",
            "senha": "",
          }
        },
        "calculoAutomaticoIbpt": {
          "ativo": true
        }
      }
    },
    "incentivoFiscal": false,
    "incentivadorCultural": false,
    "cpfCnpj": Utilities.storeInfo.cnpj,
    "inscricaoEstadual": "",
    "inscricaoMunicipal": "",
    "razaoSocial": "",
    "nomeFantasia": "",
    "simplesNacional": false,
    "regimeTributario": 0,
    "regimeTributarioEspecial": 0,
    "email": "email@email.com.br",
    "certificado": "",
  };

  constructor(
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private cepService: CEPService,
    private fiscalService: FiscalService,
    private settingsService: SettingsService
  ) {
  }

  public ngOnInit() {
    this.callback.emit({ instance: this });
    this.formSettings();
  }

  get logotipoUrl() {
    return "";//this.fiscalService.getLogotipoUrl();
  }

  get formAddressControls() {
    return (<any>this.form.controls).endereco.controls;
  }

  get formPhoneControls() {
    return (<any>this.form.controls).telefone.controls;
  }

  get formCertificateControls() {
    return (<any>this.formCertificate.controls);
  }

  public bootstrap(settings: any = {}) {

    settings.states = Utilities.states;

    this.settings = settings;
    this.data = Utilities.deepClone(this.settings ? this.settings.data : {});

    console.log(this.data.certificado);

    this.settingsService.getSettings("FiscalSettings", (data) => {
      this.settingsService.removeListeners("FiscalSettings");

      const fiscalAdditionalSettings = data.fiscal;

      if (this.data.certificado != undefined) {
        this.fiscalService.getCertificates(this.data.certificado).then((res) => {

          this.formCertificate = this.formBuilder.group({
            id: [res.id],
            nome: [res.email],
            hash: [res.hash],
            vencimento: [res.vencimento],
            email: [res.email],
            senha: [],
            file: [],
          });

          this.data.settings = fiscalAdditionalSettings;
          this.formSettings(this.data);
        }).catch((error) => {

          console.log("certificado-erro: ", error);

          this.formCertificate = this.formBuilder.group({
            senha: ["", [Validators.required, Validators.minLength(3)]],
            file: [],
          });

          this.data.settings = fiscalAdditionalSettings;
          this.formSettings(this.data);
        });
      } else {

        this.formCertificate = this.formBuilder.group({
          senha: ["", [Validators.required, Validators.minLength(3)]],
          file: [],
        });

        this.data.settings = fiscalAdditionalSettings;
        this.formSettings(this.data);
      }

    });


    // this.fiscalService.getLogotipoUrl().then((res)=>{

    //   console.log(res);
    // }).catch((error)=>{

    //   console.log(error);
    // });

  }

  // Getter and Setter Methods

  public get formControls() {
    return this.form.controls;
  }

  // User Interface Actions - General

  public onRegister() {

    const data = this.form.value;


    const filterNumeration = (data) => {
      console.log(data);
      return (data || []).filter((item, index) => {

        item.numero = parseInt(item.numero || 0);

        return !!item.serie;
      });
    };


    if (data.nfe && data.nfe.config && data.nfe.config.numeracao) {
      data.nfe.config.numeracao = filterNumeration(data.nfe.config.numeracao.value);
    }

    if (data.nfce && data.nfe.config && data.nfce.config.numeracao) {
      data.nfce.config.numeracao = filterNumeration(data.nfce.config.numeracao.value);

      // if (data.nfce.config.sefaz.idCodigoSegurancaContribuinte){
      //   data.nfce.config.sefaz.idCodigoSegurancaContribuinte = parseInt(data.nfce.config.sefaz.idCodigoSegurancaContribuinte);
      // }
    }

    if (data.nfse && data.nfse.config && data.nfse.config.rps) {

      console.log(data.nfse.config);

      if ((data.nfse.config.rps.numeracao || []).length > 0) {
        data.nfse.config.rps.numeracao = filterNumeration(data.nfse.config.rps.numeracao.value);
      } else {
        delete data.nfse
      }
    }

    data._certificate = this.formCertificate.value;
    data._logotipo = this.settings.data._logotipo;

    data.regimeTributario = parseInt(data.regimeTributario.toString() || 0);
    data.regimeTributarioEspecial = parseInt(data.regimeTributarioEspecial.toString() || 0);

    // console.log(data.nfse.config.rps)

    // console.log(data);

    // return;

    const additionalSettings = this.formAdditionalSettings.value;

    additionalSettings.percentual = Utilities.parsePercentualToNumber(additionalSettings.percentual);
    additionalSettings.valor = Utilities.parseCurrencyToNumber(additionalSettings.valor);

    this.fiscalService.updateSettings(data).then(async () => {
      await this.settingsService.updateFiscalSettings(additionalSettings);
      this.callback.emit({ close: true, });
    }).catch((error) => {

    });
  }

  // positivaeletronicos2009@hotmail.com

  // Mask Methods


  public onApplyNumberMask(event: Event, control: AbstractControl) {

    const value = FieldMask.numberFieldMask($$(event.target)[0].value, 0, null, true);

    $$(event.currentTarget).val(value);
    control.setValue(value, 0);
  }

  public onCustomApplyPhoneMask(event: Event) {

    $$(event.currentTarget).val(FieldMask.phoneFieldMask($$(event.currentTarget).val()));

    if ($$(event.currentTarget).val().length == 16) {

      const parts = $$(event.currentTarget).val().split(")");
      const ddd = parts[0].split("(")[1].trim();
      const number = parts[1].replace(/[\- ]/ig, "").replace(" ", "").trim();

      this.formPhoneControls.ddd.patchValue(ddd);
      this.formPhoneControls.numero.patchValue(number);
    }
  }

  public onApplyPhoneMask(event: Event, control: AbstractControl) {
    control.setValue(FieldMask.phoneFieldMask($$(event.target)[0].value));
  }

  public onApplyPostalCodeMask(event: Event, control: AbstractControl) {

    control.setValue(FieldMask.postalCodeFieldMask($$(event.target)[0].value));

    const clearValue = FieldMask.clearMask($$(event.target)[0].value);

    if (clearValue.length == 8) {
      this.onCEPData(event)
    }
  }

  public onApplyPriceMask(event: Event, control: AbstractControl) {
    control.setValue(FieldMask.priceFieldMask($$(event.target)[0].value));
  }


  // Layer Actions

  public onOpenLayer(type: string) {
    this.layerComponent.onOpen({ activeComponent: type });
  }

  // Auxiliary Methods

  private formSettings(data: any = {}) {

    data = Object.values(data).length > 0 ? data : this.storeModel;
    data.telefone = { ...this.storeModel.telefone, ...(data.telefone || {}) };
    data.endereco = { ...this.storeModel.endereco, ...(data.endereco || {}) };
    data.nfe = { ...this.storeModel.nfe, ...(data.nfe || {}) };
    data.nfe.config = { ...this.storeModel.nfe.config, ...(data.nfe?.config || {}) };
    data.nfce = { ...this.storeModel.nfce, ...(data.nfce || {}) };
    data.nfce.config = { ...this.storeModel.nfce.config, ...(data.nfce?.config || {}) };
    data.nfse = { ...this.storeModel.nfse, ...(data.nfse || {}) };
    data.nfse.config = { ...this.storeModel.nfse.config, ...(data.nfse?.config || {}) };
    data.logotipo = { ...this.storeModel.logotipo, ...(data.logotipo || {}) };
    data.email = (data.email || '').trim();

    // console.log(data);

    this.form = this.formBuilder.group({
      _id: [data._id, []],
      cpfCnpj: [data.cpfCnpj, [Validators.required]],
      email: [data.email, [Validators.required]],
      incentivadorCultural: [data.incentivadorCultural || false, [Validators.required]],
      incentivoFiscal: [data.incentivoFiscal || false, [Validators.required]],
      inscricaoMunicipal: [data.inscricaoMunicipal, []],
      inscricaoEstadual: [data.inscricaoEstadual, []],

      certificado: [data.certificado],

      razaoSocial: [data.razaoSocial, [Validators.required]],
      nomeFantasia: [data.nomeFantasia, [Validators.required]],

      regimeTributario: [data.regimeTributario, [Validators.required]],
      regimeTributarioEspecial: [data.regimeTributarioEspecial, [Validators.required]],
      simplesNacional: [data.simplesNacional, [Validators.required]],


      telefone: this.formBuilder.group({
        ddd: [data.telefone.ddd, [Validators.required]],
        numero: [data.telefone.numero, [Validators.required]],
      }),

      logotipo: this.formBuilder.group({
        fileName: [data.logotipo?.fileName || "", []],
      }),

      endereco: this.formBuilder.group({
        codigoPais: [data.endereco.codigoPais || '', [Validators.required]],
        descricaoPais: [data.endereco.descricaoPais || '', [Validators.required]],
        tipoLogradouro: [data.endereco.tipoLogradouro || '', [Validators.required]],
        logradouro: [data.endereco.logradouro || '', [Validators.required]],
        numero: [data.endereco.numero || '', [Validators.required]],
        complemento: [data.endereco.complemento || '', []],
        tipoBairro: [data.endereco.tipoBairro || '', []],
        bairro: [data.endereco.bairro || '', [Validators.required]],
        codigoCidade: [data.endereco.codigoCidade || '', [Validators.required]],
        descricaoCidade: [data.endereco.descricaoCidade || '', [Validators.required]],
        estado: [data.endereco.estado || '', [Validators.required]],
        cep: [data.endereco.cep || '', [Validators.required]],
      }),


      nfe: this.formBuilder.group({
        ativo: [data.nfe.ativo || false, [Validators.required]],
        tipoContrato: [data.nfe.tipoContrato || 0, [Validators.required]],
        config: this.formBuilder.group({
          producao: [data.nfe.config.producao || false, []],
          impressaoFcp: [data.nfe.config.impressaoFcp || false, []],
          impressaoPartilha: [data.nfe.config.impressaoPartilha || false, []],
          versaoManual: [data.nfe.config.versaoManual, []],
          versaoEsquema: [data.nfe.config.versaoEsquema, []],
          dfe: this.formBuilder.group({
            ativo: [data.nfe && data.nfe.config && data.nfe.config.dfe ? !!data.nfe.config.dfe.ativo : false, []],
          }),
          email: this.formBuilder.group({
            envio: [data.nfe && data.nfe.config && data.nfe.config.email ? !!data.nfe.config.email.envio : false, []],
          }),
          calculoAutomaticoIbpt: this.formBuilder.group({
            ativo: [data.nfe && data.nfe.config && data.nfe.config.calculoAutomaticoIbpt ? !!data.nfe.config.calculoAutomaticoIbpt.ativo : false, []],
          }),
          numeracao: [this.formBuilder.array([]), this.formBuilder.array([])],
        })
      }),


      nfce: this.formBuilder.group({
        ativo: [data.nfce.ativo || false, [Validators.required]],
        tipoContrato: [data.nfce.tipoContrato || 0, [Validators.required]],
        config: this.formBuilder.group({
          producao: [data.nfce.config.producao || false, []],
          sefaz: this.formBuilder.group({
            idCodigoSegurancaContribuinte: [data.nfce && data.nfce.config && data.nfce.config.sefaz ? data.nfce.config.sefaz.idCodigoSegurancaContribuinte : "", []],
            codigoSegurancaContribuinte: [data.nfce && data.nfce.config && data.nfce.config.sefaz ? data.nfce.config.sefaz.codigoSegurancaContribuinte : "", []],
          }),
          email: this.formBuilder.group({
            envio: [data.nfce && data.nfce.config && data.nfce.config.email ? !!data.nfce.config.email.envio : false, []],
          }),
          calculoAutomaticoIbpt: this.formBuilder.group({
            ativo: [data.nfce && data.nfce.config && data.nfce.config.calculoAutomaticoIbpt ? !!data.nfce.config.calculoAutomaticoIbpt.ativo : false, []],
          }),
          numeracao: [this.formBuilder.array([]), this.formBuilder.array([])],
        })
      }),

      nfse: this.formBuilder.group({
        ativo: [data.nfe.ativo || false, [Validators.required]],
        tipoContrato: [data.nfe.tipoContrato || 0, [Validators.required]],
        config: this.formBuilder.group({
          producao: [data.nfse.config.producao || false, []],
          nfseNacional: [data.nfse.config.nfseNacional || false, []],
          email: this.formBuilder.group({
            envio: [data.nfse && data.nfse.config && data.nfse.config.email ? !!data.nfse.config.email.envio : false, []],
          }),
          calculoAutomaticoIbpt: this.formBuilder.group({
            ativo: [data.nfse && data.nfe.config && data.nfse.config.calculoAutomaticoIbpt ? !!data.nfse.config.calculoAutomaticoIbpt.ativo : false, []],
          }),
          rps: this.formBuilder.group({
            lote: [data.nfse && data.nfse.config && data.nfse.config.lote ? !!data.nfse.config.rps.lote : 0, []],
            numeracao: [this.formBuilder.array([]), this.formBuilder.array([])]
          }),
          prefeitura: this.formBuilder.group({
            login: [data.nfse && data.nfse.config && data.nfse.config.prefeitura ? data.nfse.config.prefeitura.login : "", []],
            senha: [data.nfse && data.nfse.config && data.nfse.config.prefeitura ? data.nfse.config.prefeitura.senha : "", []],
            lei: [data.nfse && data.nfse.config && data.nfse.config.prefeitura ? data.nfse.config.prefeitura.lei : "", []],
            receitaBruta: [data.nfse && data.nfse.config && data.nfse.config.prefeitura ? data.nfse.config.prefeitura.receitaBruta : 0, []],
            dataInicio: [data.nfse && data.nfse.config && data.nfse.config.prefeitura ? data.nfse.config.prefeitura.dataInicio : "", []],
          }),
        })
      }),



    });

    const formartPercentual = (value) => {
      return parseFloat(value).toFixed(2).replace(".", ",");
    };

    const formatPrice = (value) => {
      return (FieldMask.priceFieldMask((value || 0).toFixed(2).replace('.', ',')));
    }

    this.formAdditionalSettings = this.formBuilder.group({
      percentual: [formartPercentual(data.settings?.percentual ?? 0), []],
      valor: [formatPrice(data.settings?.valor ?? 0), []],
    });

    // setInterval(()=>{
    //     console.log(this.form.errors);
    // }, 1000);

    // this.form.patchValue(data);


    if (data.nfe.config && data.nfe.config.numeracao) {
      this.setNumerationArrayForm("nfe", data.nfe.config.numeracao);
    }

    if (data.nfce.config && data.nfce.config.numeracao) {
      this.setNumerationArrayForm("nfce", data.nfce.config.numeracao);
    }


    if (data.nfse.config && data.nfse.config.rps && data.nfse.config.rps.numeracao) {
      this.setNumerationArrayForm("nfse", data.nfse.config.rps.numeracao);
    }


    setTimeout(() => {
      $$(".container-components-one .phone").val(FieldMask.phoneFieldMask(data.telefone.ddd + "" + data.telefone.numero));

      // console.log((<any>this.form).controls.nfce.controls.config.controls.numeracao);
    }, 200);

  }

  // Utility Methods

  public onChangeBoolean(event, control: AbstractControl) {
    control.setValue(control.value == "true");
  }

  public setNumerationArrayForm(type: "nfe" | "nfce" | "nfse", data: Array<string>) {
    data.forEach((item: any) => {

      // console.log(item);

      let formFroup = this.formBuilder.group({
        serie: [],
        numero: [],
      });

      formFroup.patchValue(item);

      if (type == "nfse") {
        (this.form.controls as any)[type].controls.config.controls.rps.controls.numeracao.value.push(formFroup);
      } else {
        (this.form.controls as any)[type].controls.config.controls.numeracao.value.push(formFroup);
      }
    });
  }

  public onAddNumeration(control, serieInput, numerInput) {

    let serie = $$(serieInput).val().trim();
    serie = isNaN(parseInt(serie)) ? serie : parseInt(serie);

    const number = parseInt($$(numerInput).val().trim());

    if (isNaN(number)) {

      return;
    }

    control.value.push(this.formBuilder.group({
      serie: [serie],
      numero: [number]
    }));

    $$(serieInput).val("");
    $$(numerInput).val("");
  }

  public onDeleteNumeration(control, formFroup) {

    control.value.controls.forEach((item, index) => {
      if (item === formFroup) {
        control.value.controls.splice(index, 1);
      }
    });

  }

  public onClickInputFile(event, type?: string) {

    if (!this.formCertificate) { return; }

    const container = $$(event.currentTarget).parent();
    const inputFile = container.find("input[type=file]");

    inputFile.trigger("click");

    inputFile.change((event) => {

      const reader = new FileReader();

      reader.onloadend = () => {
        // this.formCertificate.get("file").setValue(reader.result);
        container.find("img").attr("src", reader.result);
      };

      // event.currentTarget.files[0].arrayBuffer().then((res)=>{
      //   this.formCertificate.get("file").setValue(res);
      // });

      if (type == "logotipo") {
        this.settings.data._logotipo = event.currentTarget.files[0];
        reader.readAsDataURL(event.currentTarget.files[0]);
      } else {
        this.formCertificate.get("file").setValue(event.currentTarget.files[0])
      }



    });
  }

  public onCEPData(event: Event = null) {

    if (event) {
      event.preventDefault();
    }

    if ((this.formAddressControls.cep.value && this.formAddressControls.cep.value.length == 9) && this.formAddressControls.cep.valid) {

      this.checkSearchPostCode = true;

      this.cepService.search(this.formAddressControls.cep.value).subscribe((data: any) => {

        if (!data.erro) {

          this.formAddressControls.logradouro.patchValue(data.logradouro);
          this.formAddressControls.complemento.patchValue(data.complemento);
          this.formAddressControls.bairro.patchValue(data.bairro);
          this.formAddressControls.descricaoCidade.patchValue(data.localidade);
          this.formAddressControls.codigoCidade.patchValue(data.ibge);
          this.formAddressControls.estado.patchValue(data.uf);


          // codigoCidade
          this.notificationService.create({
            title: "Consulta CEP",
            description: "Dados CEP consultados com sucesso.",
            status: ENotificationStatus.success,
            icon: 'close-outline'
          }, false);
        } else {

          this.notificationService.create({
            title: "Consulta CEP",
            description: "Algo deu errado, Não foi possível realizar a operação.",
            status: ENotificationStatus.danger,
            icon: 'close-outline'
          }, false);
        }

        this.checkSearchPostCode = false;
      });
    }

  }

  public onChangeRegTrib(select: any) {
    const value = select.value;
    if (value == "1" || value == "2") {
      this.formControls.simplesNacional.patchValue(true);
    } else {
      this.formControls.simplesNacional.patchValue(false);
    }
  }

  // Destruction Method

  public ngOnDestroy() {

    this.data = {};
    this.layerComponent = null;
    this.form = null;
    this.settingsService.removeListeners("FiscalSettings");
  }

}
