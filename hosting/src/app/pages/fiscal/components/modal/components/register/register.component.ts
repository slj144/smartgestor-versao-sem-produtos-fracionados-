import { Component, EventEmitter, OnInit, Output, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup } from '@angular/forms';

// Components
import { ServicesSelectorComponent } from '../../../../../registers/services/components/selector/selector.component';
import { ProductsSelectorComponent } from '../../../../../stock/products/components/selector/selector.component';

// Services
import { SettingsService } from '../../../../../settings/settings.service';
import { FiscalService } from '../../../../fiscal.service';

// Translate
import { FiscalTranslate } from '../../../../fiscal.translate';

// Interfaces
import { EServiceOrderPaymentStatus, EServiceOrderStatus, IServiceOrder } from '@shared/interfaces/IServiceOrder';

const nfseServicesJson: any = require("../../../../../../../assets/json/nfse-services-list.json");

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { FieldMask } from '@shared/utilities/fieldMask';
import { DateTime } from '@shared/utilities/dateTime';
import { ENFeImpresionFileType } from '@shared/enum/EFiscal';
import { NfPaymentMethodsSelectorComponent } from './components/selector/selector.component';
import { CustomersService } from '../../../../../registers/customers/customers.service';
import { CashierFrontReceiptsComponent } from '../../../../../cashier/cashier-front/components/cashier-receipts/cashier-receipts.component';
import { ProductsService } from '../../../../../stock/products/products.service';
import { Dispatch } from '@shared/utilities/dispatch';
import { ServicesService } from '../../../../../registers/services/services.service';
import { CEPService } from '@shared/services/cep.service';
import { AlertService } from '@shared/services/alert.service';

@Component({
  selector: 'register-nf',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterNfComponent implements OnInit, OnDestroy, OnChanges {

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  @Input() public embed: any = false;
  @Input() data: any = {};

  public translate = FiscalTranslate.get()['modal']['action']['register'];

  public static shared: RegisterNfComponent;
  public formNf: FormGroup;
  public formGeneralSettings: FormGroup;

  public loading: boolean = true;
  // public data: any = {};
  public fiscalSettings: any = {};
  public settings: any = {};
  public cfop: string = "";
  public nfSeries: any = {
    NFE: [],
    NFCE: [],
    NFSE: []
  };

  public storeAddress: any = [];
  public states = Utilities.states;
  private originalData = {};

  private layerComponent: any;

  get maxParcels() {
    return Array(12).fill(null).map((x, i) => i + 1);
  }

  public get cashier() {
    return this.embed == 'cashier';
  }

  public get serviceOrders() {
    return this.embed == 'serviceOrders';
  }

  public onlyNFSE = false;

  // public get onlyNFSE(){ 
  //   return !!(this.embed && this.data && this.data.products && this.data.products.length == 0 && this.data.service && this.data.service.types && this.data.service.types.length > 0);
  // }

  constructor(
    private formBuilder: FormBuilder,
    private customersService: CustomersService,
    private settingsService: SettingsService,
    private fiscalService: FiscalService,
    private servicesService: ServicesService,
    private productsService: ProductsService,
    private cepService: CEPService,
    private alertService: AlertService
  ) {
    RegisterNfComponent.shared = this;
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.originalData = this.data;


    if (this.serviceOrders) {
      Dispatch.cashierFrontPDVService.getSale(parseInt(this.data.saleCode)).then((res) => {
        this.data = res;
        this.bootstrap({ data: this.data });
      }).catch(() => { });
    } else {

      // this.data.balance.subtotal.discount = 409.9;
      // this.data.products = this.data.products.map((item)=>{
      //   item.unitaryPrice = item.salePrice;
      //   return item;
      // });

      this.bootstrap({ data: this.data });
    }

  }

  public ngOnInit() {
    this.callback.emit({ instance: this });
    this.formSettings();
  }


  public async bootstrap(settings: any = {}) {

    // console.log(this.data);


    if (this.data) {
      this.data.products = [];
      // console.log(settings.data.products);
    }


    this.onResetPanel();


    this.data = Utilities.deepClone(settings.data);

    Utilities.loading();

    if (settings.data.nf) {

      const emissionWithSucess = settings.data.nf.status.nf == "CONCLUIDO";

      if (emissionWithSucess) {
        this.onlyNFSE = this.data.products && this.data.products.length == 0 && this.data.service && this.data.service.types && this.data.service.types.length > 0 ? true : !!(settings.data.nf.id.nf && !settings.data.nf.conjugated);
      } else {

        this.onlyNFSE = false;
      }

    } else {
      this.onlyNFSE = !!(this.embed && this.data && this.data.products && this.data.products.length == 0 && this.data.service && this.data.service.types && this.data.service.types.length > 0);
    }


    if (this.data && this.data.service) {
      this.data.services = this.data.service.types;
    }

    this.fiscalService.removeListeners("store-settings", "RegisterNfComponent");
    this.fiscalService.getStoreSettings("RegisterNfComponent", (data) => {
      this.fiscalSettings = data;
    });


    const timer = setInterval(() => {
      if (this.fiscalSettings) {
        clearInterval(timer);

        this.getServices(this.data, () => {
          this.getNfSeries(async () => {

            settings.cfop = this.cfop ? this.cfop : "";

            this.settings = settings;

            if (this.embed && settings.data.customer) {

              await this.customersService.query([{ field: "code", "operator": "=", value: parseInt(settings.data.customer.code) }], false, false, false, false).then((res) => {

                const remoteCustomer: any = res.length > 0 ? res[0] : {};

                this.settings.data.customer = this.settings.data.customer || {};
                this.settings.data.customer.addressCustom = this.settings.data.customer.address;
                this.settings.data.customer.address = remoteCustomer.address || {};

                if (remoteCustomer.stateInscription) {
                  this.settings.data.customer.stateInscription = remoteCustomer.stateInscription;
                }

                if (remoteCustomer.municipalInscription) {
                  this.settings.data.customer.municipalInscription = remoteCustomer.municipalInscription;
                }

              }).catch(e => { });
            }


            settings.data.destinatario = this.data.destinatario || settings.data.destinatario;
            this.data.customer = settings.data.customer;
            // this.data = Utilities.deepClone(settings.data);

            this.data.cfop = this.settings.cfop;

            this.data._paymentMethods = this.data.paymentMethods;
            this.data.paymentMethods = [];

            this.mapPaymentMethods(this.data._paymentMethods);

            if (
              (this.data.customer && this.data.customer.phone) ||
              (this.data.customer && this.data.customer.email)
            ) {

              settings.data.customer.contacts = {};

              if (this.data.customer.phone) {

                this.data.customer.contacts = this.data.customer.contacts || {};

                this.data.customer.contacts.phone = this.data.customer.phone;
                delete this.data.customer.phone;
              }

              if (this.data.customer.email) {
                this.data.customer.contacts.email = this.data.customer.email;
                delete this.data.customer.email;
              }
            }

            if (this.data.products && (this.data.products.length > 0)) {
              ProductsSelectorComponent.shared.selectProducts(this.data.products);
            }

            this.formSettings(this.data);
            this.generateBalance();


            if (!this.data.services || this.data.services?.length == 0) {
              setTimeout(() => {
                Utilities.loading(false);
              }, 500);
            }

          });
        });
      }
    });
  }

  private getNfSeries(callback: any) {

    this.fiscalService.removeListeners("store-settings", "FiscalRegister")
    this.fiscalService.getStoreSettings("FiscalRegister", (data) => {

      JSON.stringify(data);

      const obj = {
        NFE: (() => {

          let obj = [];

          if (data.nfe && data.nfe.config && data.nfe.config.numeracao) {
            obj = data.nfe.config.numeracao;
          }

          return obj;
        })(),
        NFCE: (() => {

          let obj = [];

          if (data.nfce && data.nfce.config && data.nfce.config.numeracao) {
            obj = data.nfce.config.numeracao;
          }

          return obj;
        })(),
        NFSE: (() => {

          let obj = [];

          if (data.nfse && data.nfse.config && data.nfse.config.rps && data.nfse.config.rps.numeracao) {
            obj = data.nfse.config.rps.numeracao;
          }

          return obj;
        })(),
      }

      this.nfSeries = obj;

      callback();
    });
  }

  private getServices(data, callback: any) {

    data.services = data.services || [];

    if (data.services.length == 0) {
      callback();
      return;
    }

    const query = data.services.map((item) => { return { field: 'code', operator: "=", value: parseInt(item.code) }; });

    this.servicesService.query(query, false, true, false, false,).then((res) => {

      data.remoteServices = (() => {

        const obj = {}

        res.forEach(item => {
          obj[parseInt(<any>item.code)] = item;
        });

        return obj;
      })();

      this.treatServices(data, callback);
    }).catch(() => {
      callback()
    });

  }

  // Getter and Setter Methods

  public get formControls() {
    return this.formNf.controls;
  }

  public get formSettingsControls() {
    return this.formGeneralSettings.controls;
  }

  // User Interface Action - Common

  public onApplyPrice(data: any, inputField: any, type: string) {

    const value = FieldMask.priceFieldMask(inputField.value);

    if (type == 'product') {
      data.unitaryPrice = (parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0);
      inputField.value = value;
    }

    if (type == 'service') {
      data.customPrice = (parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0);
      inputField.value = value;
    }

    this.generateBalance();
  }

  // User Interface Actions - Services

  public onDeleteServiceItem(index: number) {

    ServicesSelectorComponent.shared.deselectService(this.data.services[index]);
    this.data.services.splice(index, 1);

    this.generateBalance();
  }

  // User Interface Actions - Products

  public onQuickSearch(event: Event) {

    const value = $$(event.currentTarget).val();

    if (value != '') {

      Utilities.loading();

      ProductsSelectorComponent.shared.onSearch({
        where: [
          { field: 'code', operator: '=', value: parseInt(value) }
        ]
      }, true).then(() => {
        $$('.container-products .quick-search input').val('');
        Utilities.loading(false);
      });
    }
  }

  public onDeleteProductItem(index: number) {

    ProductsSelectorComponent.shared.onDeselectProduct(this.data.products[index]);
    this.generateBalance();
  }

  public onApplyQuantity(data: any, inputField: any) {

    // data.quantity

    const value = inputField.value;
    const quantity = FieldMask.numberFieldMask(value, 1);

    inputField.value = quantity;
    data.selectedItems = quantity;

    this.generateBalance();
  }

  public onApplyQuantityCorretion(data: any, inputField: any) {

    if (inputField.value == '') {

      inputField.value = 1;
      data.selectedItems = 1;

      this.generateBalance();
    }
  }

  // User Interface Actions - General

  public onRegister() {

    if (this.checkSubmit()) { return; }
    this.composeData();
  }

  public onResetPanel() {

    this.settings = {};
    this.data = {};

    if (ProductsSelectorComponent.shared) {
      ProductsSelectorComponent.shared.reset();
    }

    if (ServicesSelectorComponent.shared) {
      ServicesSelectorComponent.shared.reset();
    }

    if (NfPaymentMethodsSelectorComponent.shared) {
      NfPaymentMethodsSelectorComponent.shared.reset();
    }

    if ($$('#container-request-register').length > 0) {
      $$('#container-request-register')[0].scrollTop = 0;
    }
  }


  // Mask Methods

  public onApplyQuantityMask(event: Event, control?: FormControl, frationaned?: boolean) {

    const value = frationaned ? FieldMask.quantityFieldMask($$(event.currentTarget).val()) : FieldMask.numberFieldMask($$(event.currentTarget).val());
    $$(event.currentTarget).val(value);

    if (control) {
      control.patchValue(frationaned ? Utilities.parsePercentualToNumber(value) : parseInt(value));
    }

  }

  public onApplyCpfCnpjMask(event: Event) {
    let value = $$(event.currentTarget).val();

    value = FieldMask.cpfCnpjFieldMask(value);
    $$(event.currentTarget).val(value);
    this.data.customer.cpfCnpj = FieldMask.clearMask(value);
  }

  public onApplyCpfMask(event: Event) {
    const value = FieldMask.cpfFieldMask($$(event.currentTarget).val());
    $$(event.currentTarget).val(value);
    this.data.customer.personalDocument = FieldMask.clearMask(value);
  }

  public onApplyCnpjMask(event: Event) {
    const value = FieldMask.cnpjFieldMask($$(event.currentTarget).val());
    $$(event.currentTarget).val(value);
    this.data.customer.businessDocument = FieldMask.clearMask(value);
  }


  public onApplyIE(event) {
    const value = FieldMask.numberFieldMask($$(event.currentTarget).val());
    $$(event.currentTarget).val(value);
    this.data.customer.stateInscription = value;
  }

  public onApplyIM(event) {
    const value = FieldMask.numberFieldMask($$(event.currentTarget).val());
    $$(event.currentTarget).val(value);
    this.data.customer.municipalInscription = value;
  }
  public onApplyCarrierCpfCnpj(event: Event, control: FormControl) {
    let value = $$(event.currentTarget).val();
    value = FieldMask.cpfCnpjFieldMask(value);
    $$(event.currentTarget).val(value);
    control.patchValue(value);
  }

  public onApplyCarrierIE(event: Event, control: FormControl) {
    const value = FieldMask.numberFieldMask($$(event.currentTarget).val());
    $$(event.currentTarget).val(value);
    control.patchValue(value);
  }
  public onUpdateEmail(event: Event) {
    this.data.customer.contacts = this.data.customer.contacts || {};
    this.data.customer.contacts.email = $$(event.currentTarget).val().trim().toLowerCase();
  }

  // Layer Actions

  public onOpenLayer(type: string) {
    this.layerComponent.onOpen({ activeComponent: type });
  }

  // Event Listeners

  public onLayerResponse(event: any) {

    // Instance Capture

    if (event.instance) {
      this.layerComponent = event.instance;
    }

    // Data Capture

    if (event.customer) {
      this.data.customer = event.customer;
      const destinyType = (() => {
        if (event.customer?.personalDocument?.type == "GENERAL") { return "3"; }
        if (event.customer?.businessDocument?.type == "GENERAL") { return "3"; }
        return "0";
      })();
      this.formGeneralSettings.controls.destinyType.patchValue(destinyType);
    }

    if (event.services) {
      this.data.services = event.services;
      this.getServices(this.data, () => { });
    }

    if (event.products) {
      this.data.products = event.products;
    }

    if (event.paymentMethods) {
      this.data.paymentMethods = event.paymentMethods;
    }

    // Perform the Calculations

    this.generateBalance();
  }

  public onAddressResponse(event) {
    if (event.data) {
      this.data.destinatario = event.data;
      this.loading = false;
    }
  }

  public onResponseCFOP(event) {
    if (event.data) {
      this.cfop = event.data;
    }
  }

  public onChangeNfType() {
    const type = this.formGeneralSettings.get("type").value;
    this.formGeneralSettings.get("serie").setValue(this.nfSeries[type][0] ? this.nfSeries[type][0].serie : "");
    this.generateBalance();
    this.configProductsService();
  }

  public onChangeConjugated(control: AbstractControl) {
    control.setValue(control.value == "true");
    this.generateBalance();
    this.configProductsService();
  }

  private configProductsService() {
    const type = this.formGeneralSettings.get("type").value;
    const conjugated = this.formGeneralSettings.get("nfWithISSQN").value;
    const service = this.data.services ? this.data.services[0] : null;

    if (service && service.code) {
      (this.data.products || []).forEach((product) => {
        if (type == "NFSE") {
          this.onSelectServiceProduct({ value: service.code }, product);
        } else {
          if (conjugated) {
            // this.onChangeISSQN({value: service.code}, product, 'default');
            // console.log(type, conjugated, service, product)
          } else {
            product.serviceCode = "";
            if (product.tributes && product.tributes.issqn) {
              delete product.tributes.issqn;
            }
          }
        }
      });
    }
  }

  // ISSQN

  public onChangeISSQN(element, item, type) {

    const serviceCode = parseInt(element.value);

    if (isNaN(serviceCode)) {
      item.serviceCode = "";
      if (item.tributes && item.tributes.issqn) {
        delete item.tributes.issqn;
      }
      return;
    }

    const service = this.data.remoteServices[serviceCode];
    const localService = (this.data.services || []).filter((item) => { return parseInt(service.code) == parseInt(item.code) })[0];

    // console.log(service,this.data, localService)

    // console.log(element, " - ",serviceCode, service, this.data.remoteServices)

    if (service && localService) {

      service.tributes = service.tributes || {};
      service.tributes.iss = service.tributes.iss || {};

      const hasServiceInProducts = (code: any) => {
        let status: boolean = false;
        this.data.products.forEach(item => {
          if (parseInt((item.serviceCode || 0).toString()) == parseInt(code.toString())) {
            status = true;
          }
        });
        return status;
      };

      if (type == 'default') {

        let quantity = item.reserve;
        if (!quantity) {
          quantity = item.selectedItems ? parseFloat(item.selectedItems) : quantity;
        }

        let aliquota = parseFloat(service.tributes.iss.aliquota.toString() || '0');

        if (aliquota == 0) {
          const serviceInfo = this.getServiceInfoFromServiceCode(service.codigo, FieldMask.clearMask(service.cnae));
          if (serviceInfo) {
            aliquota = serviceInfo["ALIQUOTA"] || 0;
          }
        }

        // console.log(service.code, hasServiceInProducts(service.code), service )

        const servicePrice = (localService.executionPrice > 0 ? localService.executionPrice : localService.customPrice) || 0;

        const issqn: any = {
          aliquota: aliquota,
          baseCalculo: hasServiceInProducts(service.code) ? 0 : servicePrice,
          codigoServico: service.codigo,
          codigoMunicipioFatoGerador: RegisterNfComponent.shared.storeAddress.ibge,
          codigoExigibilidade: service.tributes.iss.exigibilidade ? service.tributes.iss.exigibilidade.toString() : ""
        };

        item.serviceCode = Utilities.prefixCode(parseInt(service.code.toString()));
        item.tributes.issqn = issqn;
      }
    }

    // this.generateBalance();



  }

  public onChangeAddProductsInService(element) {

    if (element.value == "false") {
      this.data.services.forEach((item) => {
        delete item.products;
      });
    }

    this.generateBalance();
  }

  public onSelectServiceProduct(element, product) {

    let service = null;

    this.data.services.forEach((item) => {
      if (parseInt(item.code) == parseInt(element.value)) {
        service = item
      }
    });

    const deselectProduct = () => {

      this.data.services.forEach((item) => {
        if (parseInt(item.code) != parseInt(element.value) && item.products && item.products[parseInt(product.code)]) {
          delete item.products[parseInt(product.code)];
        }
      });
    }

    if (service) {

      product.serviceCode = Utilities.prefixCode(parseInt(service.code.toString()));

      service.products = service.products || {};
      service.products[parseInt(product.code)] = product;

      let index = -1;

      this.data.services.forEach((item, i) => {
        if (parseInt(item.code) == parseInt(element.value)) {
          index = i;
        }
      });

      if (index != -1) {
        this.data.services[index] = service;
      }

      deselectProduct();
    }
  }

  public treatServices(data, callback) {

    const obj = {};

    if (data && data.remoteServices && Object.values(data.remoteServices || []).length > 0) {

      Object.values(data.remoteServices || []).forEach((item: any) => {
        obj[item.codigo] = obj[item.codigo] || [];

        let value = item.tributes && item.tributes.iss && item.tributes.iss.aliquota ? parseInt(item.tributes.iss.aliquota) : 0;

        if (value == 0) {
          const serviceInfo = this.getServiceInfoFromServiceCode(item.codigo, FieldMask.clearMask(item.cnae));
          if (serviceInfo) {
            value = serviceInfo["ALIQUOTA"] || 0;
          }
        }


        if (obj[item.codigo].indexOf(value) == -1) {
          obj[item.codigo].push(value);
        }

      });

      data.remoteServicesAliquotas = obj;

      data.servicesISSQNList = Object.values(data.remoteServices).map((item: any) => { return { codigo: item.codigo, cnae: item.cnae } });

      this.cepService.search(Utilities.storeInfo.address.postalCode).subscribe((cepData) => {

        if (!data.erro) {
          this.storeAddress = cepData;
        } else {
          this.storeAddress = {};
        }

        callback();
      });
    } else {

      callback();
    }
  }

  // Predicates

  public isEnableSubmitButton() {
    if (!this.data.member && !this.data.customer && this.formSettingsControls.type.value == 'NFE' && !this.loading || !this.data.member && !this.data.customer && this.formSettingsControls.type.value == 'NFSE' && !this.loading) { return true }
    return false;
  }

  // Balance

  public getReceivedPayment() {

    let value = 0;

    this.data.paymentMethods.forEach((item) => {
      value += item.value || 0;
    });

    return value;
  }

  public getReceivedPaymentClass() {
    return this.getReceivedPayment() <= this.data.balance.totalSale ? "ok" : "error";
  }

  // Auxiliary Methods

  private checkSubmit(value: boolean = null) {

    if (value != null) {
      this.settings._isSubmited = value;
      return !this.settings._isSubmited;
    }

    if (this.settings._isSubmited) {
      return true;
    }

    this.settings._isSubmited = true;

    return false;
  }

  private configType() {

    return "NFE";

    let type;

    if (this.onlyNFSE) {
      type = "NFSE";
    } else {
      type = (this.cashier ? "NFCE" : "NFE");
    }
    return type;
  }

  private formSettings(data: any = {}) {

    const type = this.configType();

    const hasIssqn = (() => {
      if (this.onlyNFSE) {
        return false;
      } else {
        return !!(this.data.service && this.data.service.types.length > 0 && this.data.products.length > 0);
      }
    })();

    const idIntegracao = (() => {
      let value = "";
      if (data.customer && data.customer.personalDocument && data.customer.personalDocument.type == "GENERAL") {
        return data.customer.personalDocument.value;
      }

      if (data.customer && data.customer.businessDocument && data.customer.businessDocument.type == "GENERAL") {
        return data.customer.businessDocument.value;
      }

      return value;
    })();

    const destinyType = (() => {
      if (data?.customer?.personalDocument?.type == "GENERAL") { return "3"; }
      if (data?.customer?.businessDocument?.type == "GENERAL") { return "3"; }
      return "0";
    })();

    this.formGeneralSettings = this.formBuilder.group({
      type: [type],
      presential: [true],
      finalConsumer: [true],
      operationNature: ["VENDA"],
      finality: ["1"],
      enviaremail: [true],
      destinyType: [destinyType],
      serie: [this.nfSeries[type][0] ? this.nfSeries[type][0].serie : ""],
      // ipressionType: [(this.cashier ? "4" : "1")],
      // emissionType: ["1"],
      codigoEstrangeiro: [idIntegracao],
      informacoesComplementares: [data.informacoesComplementares ?? ""],
      updateTributes: [false],
      hasCustomer: [true],
      nfWithISSQN: [hasIssqn],
      addProductsInService: [true],
      waitSefaz: [true],
      modalidadeFrete: ["9"],
      intermediador: [0],
      saida: [true],
      notaReferenciada: "",
      export: this.formBuilder.group({
        estadoEmbarque: [Utilities.storeInfo && Utilities.storeInfo.address ? Utilities.storeInfo.address.state.trim().toUpperCase() : ''],
        descricaoLocalEmbarque: [Utilities.storeInfo && Utilities.storeInfo.address ? Utilities.storeInfo.address.city : ''],
        descricaoLocalDespacho: [''],
      }),
      volumes: this.formBuilder.group({
        quantidade: [0],
        especie: [''],
        marca: [''],
        numeracao: [''],
        pesoLiquido: [0],
        pesoBruto: [0],
      }),
      carrier: this.formBuilder.group({
        cpfCnpj: [''],
        razaoSocial: [''],
        inscricaoEstadual: [''],
        endereco: [''],
        municipio: [''],
        uf: ['']
      }),
      parcelas: this.formBuilder.array([
        this.formBuilder.group({
          numero: ["001"],
          dataVencimento: [DateTime.getDate("D")],
          valor: [],
        })
      ])
    });

    if (this.data && this.data.services) {

      if (!!this.embed) {
        setTimeout(() => {
          this.configProductsService();
          Utilities.loading(false);
        }, 3500);
      } else {
        this.configProductsService();
        Utilities.loading(false);
      }


    } else {
    }


  }

  private generateBalance() {

    this.data.balance = (this.data.balance || {});

    this.data.balance.totalProducts = 0;
    this.data.balance.totalServices = 0;
    this.data.balance.totalDiscount = 0;
    this.data.balance.totalFee = 0;

    this.data.balance.totalPartial = 0;
    this.data.balance.totalSale = 0;

    // Perform Calculations    

    // console.log(this.data.services.length, this.formSettingsControls.nfWithISSQN.value, this.formSettingsControls.type.value);

    if (this.data.services && this.data.services.length > 0 && this.formSettingsControls.nfWithISSQN.value && this.formSettingsControls.type.value != 'NFSE' || this.data.services && this.data.services.length > 0 && this.formSettingsControls.type.value == 'NFSE') {

      for (const item of this.data.services) {

        if (item.customPrice > item.executionPrice) {
          this.data.balance.totalServices += item.customPrice;
        } else {
          this.data.balance.totalServices += item.executionPrice;
        }

        this.data.balance.totalDiscount += (() => {
          return ((item.customPrice < item.executionPrice) ? (item.executionPrice - item.customPrice) : 0);
        })();
      }

      this.data.balance.totalPartial += this.data.balance.totalServices;
      this.data.balance.totalSale += this.data.balance.totalServices;
    }

    if (this.data.products && this.data.products.length > 0 && this.formSettingsControls.type.value != 'NFSE' || this.data.products && this.data.products.length > 0 && this.formSettingsControls.type.value == 'NFSE' && this.formSettingsControls.addProductsInService.value) {

      for (const item of this.data.products) {

        if (item.unitaryPrice > item.salePrice) {
          this.data.balance.totalProducts += (item.selectedItems * item.unitaryPrice);
        } else {
          this.data.balance.totalProducts += (item.selectedItems * item.salePrice);
        }

        this.data.balance.totalDiscount += (() => {

          const value = (item.unitaryPrice < item.salePrice) ? (item.salePrice - item.unitaryPrice) * item.selectedItems : 0;
          return isNaN(value) ? 0 : value;
        })();
      }


      this.data.balance.totalPartial += this.data.balance.totalProducts;
      this.data.balance.totalSale += this.data.balance.totalProducts;
    }


    // Apply Values

    if (this.data.balance.subtotal?.discount) {
      this.data.balance.totalDiscount = this.data.balance.subtotal?.discount;
    }

    if (this.data.balance.totalDiscount > 0) {

      this.data.balance.totalPartial -= this.data.balance.totalDiscount;
      this.data.balance.totalSale -= this.data.balance.totalDiscount;
    }

    if (this.data.balance?.subtotal?.fee > 0) {
      this.data.balance.totalFee = this.data.balance.subtotal.fee;
    }

    if (this.data.balance.totalFee > 0) {
      this.data.balance.totalSale += this.data.balance.totalFee;
    }

    // console.log(this.data.balance);
  }

  private composeData() {

    Utilities.loading(true);

    const sourceData = Utilities.deepClone(this.data);

    function round(valor, casasDecimais) {
      const fator = Math.pow(10, casasDecimais);
      return Math.round(valor * fator) / fator;
    }

    this.settingsService.getSettings("FiscalRegisterComponent", (settings) => {
      this.settingsService.removeListeners("FiscalRegisterComponent");

      const fiscalSettings = settings.fiscal;

      const settingsData = this.formGeneralSettings.value;

      // console.log(settingsData);

      // return;

      const prefix = Utilities.projectId + '_' + (this.cashier ? "CASHIER" : "FISCAL");
      const posFix = this.cashier ? `${sourceData.code}-${sourceData._id}-${Utilities.uuid()}` : `${Utilities.uuid()}`;

      const response: any = {
        idIntegracao: `${prefix}-${settingsData.type}-${posFix}`,
        pagamentos: ([] as any),

        // responsavelTecnico: (()=>{

        //   const obj = {
        //     "cpfCnpj": "08187168000160",
        //     "nome": "Tecnospeed",
        //     "email": "contato@tecnospeed.com.br",
        //     "telefone": {
        //       "ddd": "44",
        //       "numero": "30379500"
        //     }
        //   };

        //   return obj 
        // })()
        informacoesComplementares: (settingsData.informacoesComplementares ?? "").trim().replace(/\n/g, '|')

      };

      const isExport = settingsData.destinyType == '3';
      const totalTaxes: any = {};
      let statusProducts = true;
      let statusServices = true;
      let error: any = false;
      const isNfseNacinal = !!this.fiscalSettings?.nfse?.config?.nfseNacional;
      const isMEI = this.fiscalSettings.regimeTributarioEspecial == 5;

      // console.log(isMEI);
      // return;

      // NFType

      if (settingsData.type == "NFE" || settingsData.type == "NFCE") {

        response.emitente = { cpfCnpj: Utilities.cnpjFiscal };

        if (settingsData.destinyType != "0") {
          response.codigoIdentificacaoDestino = settingsData.destinyType;
        }


        if (settingsData.modalidadeFrete && settingsData.modalidadeFrete != "9") {
          response.transporte = {
            modalidadeFrete: settingsData.modalidadeFrete || "9"
          };
          const carrier = settingsData.carrier || {};

          if (carrier.cpfCnpj && carrier.razaoSocial) {
            response.transporte.transportadora = {
              cpfCnpj: FieldMask.clearMask(carrier.cpfCnpj),
              razaoSocial: carrier.razaoSocial.trim()
            };

            if (carrier.inscricaoEstadual) {
              response.transporte.transportadora.inscricaoEstadual = carrier.inscricaoEstadual.trim();
            }

            if (carrier.endereco) {
              response.transporte.transportadora.endereco = carrier.endereco.trim();
            }

            if (carrier.municipio) {
              response.transporte.transportadora.municipio = carrier.municipio.trim();
            }

            if (carrier.uf) {
              response.transporte.transportadora.uf = carrier.uf.trim();
            }
          }

          response.intermediador = parseInt(settingsData.intermediador) || 0;
        }

        if (settingsData.volumes.quantidade > 0 && settingsData.volumes.pesoLiquido > 0 && settingsData.volumes.pesoBruto > 0) {
          response.transporte.volumes = [settingsData.volumes];
        }

        if (settingsData.operationNature == "COMPRA" || settingsData.operationNature == "DEVOLUÇÃO" || settingsData.finality == "4") {
          response.saida = false;
          response.notaReferenciada = { nfe: [{ chave: settingsData.notaReferenciada.replaceAll(" ", "") }] };

          const devolutionCFOP = ["1.201", "1.202", "2.201", "2.202", "3.301", "3.302", "5.201", "5.202", "5.209", "5.210"];

          if (settingsData.finality == "4") {
            settingsData.operationNature = "DEVOLUÇÃO"
          }

          if (settingsData.operationNature == "DEVOLUÇÃO") {
            settingsData.finality = "4";
            if (!devolutionCFOP.includes(this.settings.cfop)) {
              this.settings.cfop = "1.202";
              sourceData.cfop = this.settings.cfop;
            }
          }
        }

        // volumes
      }

      // Prestador

      if (settingsData.type == "NFSE") {
        response.prestador = { cpfCnpj: FieldMask.clearMask(Utilities.storeInfo.cnpj.toString()) };
        // response.emitente = {
        //   "tipo": 1,
        //   "codigoCidade": "5201108"
        // };
      }


      // General

      if (settingsData.type == "NFE") {
        response.presencial = settingsData.presential;
        response.consumidorFinal = settingsData.finalConsumer;
        response.natureza = settingsData.operationNature;
        response.finalidade = settingsData.finality;
        response.serie = parseInt(settingsData.serie);
        // response.tipoImpressao = settingsData.ipressionType;
      }

      if (settingsData.type == "NFCE") {
        response.natureza = "VENDA";
        response.serie = parseInt(settingsData.serie);
      }

      // Export Settings

      if (isExport) {
        response.exportacao = settingsData.export;
      }

      response.enviaremail = !!settingsData.enviaremail;

      // Settings Destinatário

      if (sourceData.customer && settingsData.hasCustomer) {
        const data: any = {
          cpfCnpj: (() => {
            let value = "";

            if (sourceData.customer.personalDocument) {
              value = FieldMask.clearMask(sourceData.customer.personalDocument.value);
            }

            if (sourceData.customer.businessDocument) {
              value = FieldMask.clearMask(sourceData.customer.businessDocument.value);
            }

            if (sourceData.customer.cpfCnpj) {
              value = FieldMask.clearMask(sourceData.customer.cpfCnpj);
            }

            return value;
          })(),
          razaoSocial: sourceData.customer.name.trim(),
          endereco: sourceData.destinatario,
          email: null
        };


        if (sourceData.customer.contacts && sourceData.customer.contacts.email) {
          data.email = sourceData.customer.contacts.email.trim();
        } else {
          delete data.email
        }



        if (isExport) {
          delete data.cpfCnpj;
          data.codigoEstrangeiro = settingsData.codigoEstrangeiro.trim();
          data.endereco = {
            codigoPais: data.endereco.codigoPais.trim(),
            descricaoPais: data.endereco.descricaoPais.trim(),
            codigoCidade: "9999999",
            descricaoCidade: "EXTERIOR",
            estado: "EX",
            bairro: "9999999",
            logradouro: "9999999",
            numero: "9999999"
          };
        } else {

          data.endereco.cep = data.endereco.cep ? FieldMask.clearMask(data.endereco.cep) : '';

          if (sourceData.customer.municipalInscription) {
            data.inscricaoMunicipal = sourceData.customer.municipalInscription;
          }

          if (sourceData.customer.stateInscription && settingsData.type != 'NFCE') {
            data.inscricaoEstadual = sourceData.customer.stateInscription;
          }

        }


        if (settingsData.type == "NFE" || settingsData.type == "NFCE") {
          response.destinatario = data;
        }

        if (settingsData.type == "NFSE") {
          response.tomador = data;
        }
      }


      // Settings 

      let totalPayed = 0;
      let totalWithoutDiscount = 0;
      let total = 0;
      let totalTax = 0;
      let totalDiscount = 0;

      // Montagem dos pagamentos
      // OBS: Não forçamos booleano em aVista aqui; deixamos undefined quando desconhecido
      // para que a decisão de enviar/omitir "cobranca" considere apenas casos explicitamente parcelados.
      response.pagamentos = settingsData.finality == '4' ?
        (() => {

          (sourceData.paymentMethods || []).forEach((item) => {
            totalPayed += item.value || 0;
          });

          return [
            {
              "meio": "90"
            }
          ]

        })()
        : (() => {
          let value = [];

          (sourceData.paymentMethods || []).forEach((item) => {
            value.push({
              meio: item.code,
              valor: item.value || 0,
              // aVista somente quando conhecido. Não coagir para boolean para evitar falsos negativos.
              aVista: item.aVista,
              descricaoMeio: item.descricaoMeio || "",
              cartao: item.cartao
            });
            totalPayed += item.value || 0;
          });

          return value;
        })();


      // Settings Items

      console.log(this.settings, Utilities.deepClone(sourceData));

      if (settingsData.type != "NFSE") {

        response.itens = [];

        totalTaxes.icms = 0;
        totalTaxes.pis = 0;
        totalTaxes.cofins = 0;
        totalTaxes.issqn = 0;

        statusProducts = false;

        const discountUnitary = Utilities.getDiscountUnitary(sourceData.products);
        const discount = this.embed ? ((sourceData.balance?.subtotal?.discount || 0) - discountUnitary) : ((sourceData.balance?.totalDiscount || 0) - discountUnitary);
        // const dicountPorcentage = ( discount / ((sourceData.balance.total || 0) + discount)) * 100;

        const dicountPorcentage = discount > 0 ? (discount / ((sourceData.balance.total || 0) + discount)) * 100 : 0;


        const taxUnitary = Utilities.getTaxUnitary(sourceData.products);
        const tax = (sourceData.balance?.subtotal?.fee || 0);//< taxUnitary ? sourceData.balance.subtotal.fee : sourceData.balance.subtotal.fee - taxUnitary);
        const taxPorcentage = Math.abs(tax / ((sourceData.balance.total || 0) - tax) * 100);

        // console.log("dicountPorcentage: ",dicountPorcentage, ' - ', sourceData.balance?.subtotal?.discount, discountUnitary, sourceData.balance?.total)
        // console.log("taxPorcentage: ",taxPorcentage, ' - ', sourceData.balance.subtotal.fee, taxUnitary, sourceData.balance.total)

        // console.log(sourceData, discount, discountUnitary, dicountPorcentage, tax," - ", taxPorcentage);


        const configProduct = (item) => {

          const rawNcm = item.ncm ? `${item.ncm}` : "";
          const sanitizedNcm = rawNcm.replace(/\D+/g, "");
          const hasValidNcm = sanitizedNcm.length === 8;

          let quantity = item.reserve;
          if (!quantity) {
            quantity = item.selectedItems ? parseFloat(item.selectedItems) : quantity;
          }

          const hasIssqn = !!(item.tributes && item.tributes.issqn);

          // console.log("## ", Utilities.deepClone(item));

          // item.unitaryPrice = hasIssqn ? item.unitaryPrice + item.tributes.issqn.baseCalculo : item.unitaryPrice;
          const issqnBaseCalculo = hasIssqn ? item.tributes.issqn.baseCalculo : 0;
          item.unitaryPrice = hasIssqn ? (item.unitaryPrice + (issqnBaseCalculo / quantity)) : item.unitaryPrice;

          const producValue = dicountPorcentage > 0 ? item.unitaryPrice * quantity : item.unitaryPrice;
          // const dicountPorcentage = ( discount / ((sourceData.balance.total || 0) + discount)) * 100;
          // const discountItemValue = round((producValue) / sourceData.balance.total * discount, 2);
          const discountItemValue = dicountPorcentage > 0 ? round((producValue / 100 * dicountPorcentage), 2) : 0;

          // console.log("discountItemValue: ",dicountPorcentage ,item.code, item.unitaryPrice, discountItemValue)
          // console.log("discountItemValue: ",dicountPorcentage ,item.code, item.unitaryPrice,  discountItemValue, producValue, round(item.unitaryPrice - (item.unitaryPrice / 100 * dicountPorcentage), 10))

          const tributes = item.tributes || {};

          const cstst = ["500", "60"];
          const cststall = ["500", "60", "10", "30", "70", "201", "202", "203"];

          const hasSubstituicaoTributaria = cstst.includes(tributes?.icms?.cst?.toString());
          const hasAnySubstituicaoTributaria = cststall.includes(tributes?.icms?.cst?.toString());

          // console.log("product: ", item, " - taxPorcentage: ",taxPorcentage);
          // console.log(dicountPorcentage);

          if (taxPorcentage) {
            totalTax += parseFloat(((item.unitaryPrice / 100 * taxPorcentage)).toFixed(4));
            item.unitaryPrice += parseFloat(((item.unitaryPrice / 100 * taxPorcentage)).toFixed(4));
            // console.log((item.unitaryPrice / 100 * taxPorcentage)).toFixed(4))
          }

          const obj: any = {
            codigo: (() => {
              const candidate = [item.code, item.productCode, item.barcode, item.id, item._id].find(value => {
                if (value === null || value === undefined) {
                  return false;
                }
                const stringValue = `${value}`.trim();
                return stringValue.length > 0;
              });
              return candidate ? `${candidate}` : Utilities.uuid();
            })(),
            descricao: item.name,
            cfop: (() => {
              if (item.cfop) { return item.cfop.replaceAll(".", ""); }
              if (hasSubstituicaoTributaria && settingsData.type == "NFCE" && !hasIssqn) {
                return "5405";
              } else if (hasIssqn && settingsData.type == "NFCE") {
                return "5933";
              } else {
                return this.settings.cfop.replaceAll(".", "")
              }
            })(),
            ncm: hasValidNcm ? sanitizedNcm : "00000000",
            cest: item.cest,
            codigoBeneficioFiscal: item.codigoBeneficioFiscal || "",
            quantidade: {
              comercial: quantity,
              tributavel: quantity
            },
            valorUnitario: {
              comercial: item.unitaryPrice,
              tributavel: item.unitaryPrice
            },
            valor: item.unitaryPrice * quantity,
            tributos: (() => {

              try {

                const obj: any = {
                  icms: (() => {

                    const obj = tributes && tributes.icms ? tributes.icms : {};
                    const credSimplesNacional = ["101", "201"];
                    const noHasBaseCalculo = ["30", "40", "41", "50", "60"];
                    const baseCalculo = obj.baseCalculo?.valor || item.unitaryPrice;

                    // obj.aliquota = 7;
                    // obj.cst = '900';

                    // console.log(Utilities.deepClone(obj));

                    // obj.baseCalculo = obj.baseCalculo || { };
                    // obj.baseCalculo.valor = obj.baseCalculo.valor || item.salePrice;
                    // obj.baseCalculo.modalidadeDeterminacao = obj.baseCalculo.modalidadeDeterminacao || 0;

                    // obj.aliquota = 17;
                    // obj.aliquota = 0;
                    // obj.valor = 0;
                    // obj.origem = "0";
                    // obj.cst = "102";


                    if (credSimplesNacional.includes(obj.cst)) {
                      obj.creditoSimplesNacional = {
                        percentual: fiscalSettings.percentual ?? 0,
                        valor: fiscalSettings.valor ?? 0
                      };
                    }

                    if (obj.cst && parseInt(obj.cst) > 100 && isExport) {
                      obj.cst = "300";
                    }

                    if (obj.cst && parseInt(obj.cst) < 100 && isExport) {
                      obj.cst = "41";
                    }

                    if (obj.substituicaoTributaria && !obj.substituicaoTributaria.aliquota) {
                      delete obj.substituicaoTributaria;
                    }

                    if (obj.fundoCombatePobreza && !obj.fundoCombatePobreza.aliquota) {
                      delete obj.fundoCombatePobreza;
                    }

                    if (!obj.valor) {
                      delete obj.valor;
                    }

                    if (obj.valor) {
                      obj.valor = parseFloat(obj.valor);
                    }

                    if (obj.aliquota) {
                      obj.aliquota = parseFloat(obj.aliquota);
                    }

                    if (obj.baseCalculo) {
                      obj.baseCalculo.valor = parseFloat(obj.baseCalculo.valor > 0 ? obj.baseCalculo.valor : baseCalculo);
                    }


                    if (obj.cst && parseInt(obj.cst) > 100 && obj.cst && parseInt(obj.cst) < 900) {

                      // delete obj.baseCalculo;
                      // delete obj.aliquota;
                      // delete obj.valor;

                      if (parseInt(obj.cst) == 102 && !isMEI && obj.aliquota || parseInt(obj.cst) == 202 && !isMEI && obj.aliquota) {
                        delete obj.baseCalculo;
                      } else {
                        delete obj.baseCalculo;
                        delete obj.aliquota;
                        delete obj.valor;
                      }
                    }

                    if (noHasBaseCalculo.includes(obj.cst)) {
                      delete obj.baseCalculo;
                      delete obj.aliquota;
                    }

                    if (!hasAnySubstituicaoTributaria) {
                      delete obj.substituicaoTributaria;
                    }

                    if (obj.substituicaoTributaria && obj.substituicaoTributaria.fundoCombatePobreza && !obj.substituicaoTributaria.fundoCombatePobreza.aliquota) {
                      delete obj.substituicaoTributaria.fundoCombatePobreza;
                    }

                    if (obj.cst == '60') {
                      if (obj.substituicaoTributaria) {
                        delete obj.substituicaoTributaria.margemValorAdicionado;
                      }
                      if (obj.substituicaoTributaria?.baseCalculo) {
                        delete obj.substituicaoTributaria.baseCalculo.percentualReducao;
                        delete obj.substituicaoTributaria.baseCalculo.modalidadeDeterminacao;
                      }

                    }

                    return obj.cst ? obj : {};
                  })(),
                  pis: (() => {

                    let obj = tributes && tributes.cofins ? tributes.cofins : {};
                    obj.baseCalculo = obj.baseCalculo || {};
                    obj.baseCalculo.valor = obj.baseCalculo.valor || item.unitaryPrice;

                    const baseCalculo = obj.baseCalculo;

                    const clearProps = ["quantidadeVendida", "aliquotaReais"];
                    const others = [49, 50, 51, 52, 53, 54, 55, 56, 60, 61, 62, 63, 64, 65, 66, 67, 70, 71, 72, 73, 74, 75, 98, 99];
                    const notTributed = [4, 5, 6, 7, 8, 9];
                    const withAliq = [1, 2];

                    // obj.aliquota = 7.6;

                    // obj.aliquota = 7.6;
                    // obj.aliquota = 0;
                    // obj.valor = 0;
                    // obj.cst = "07";
                    // obj.cst = "08";

                    if (!obj?.substituicaoTributaria?.aliquota && !obj?.substituicaoTributaria?.aliquotaReais) {
                      delete obj.substituicaoTributaria;
                    }

                    // ST COM ALIQUOTA EM PRECENTUAL E EM REAIS

                    if (obj?.substituicaoTributaria?.aliquotaReais) {
                      delete obj.substituicaoTributaria?.aliquota;
                      delete obj.substituicaoTributaria?.baseCalculo;
                      obj.substituicaoTributaria.quantidadeVendida = quantity;
                    }

                    if (obj?.substituicaoTributaria?.aliquota) {
                      obj.substituicaoTributaria.baseCalculo = baseCalculo;
                      delete obj.substituicaoTributaria?.quantidadeVendida;
                      delete obj.substituicaoTributaria?.aliquotaReais
                    }

                    // CST 01 E 02

                    if (!withAliq.includes(parseInt(obj.cst))) {
                      delete obj.baseCalculo;
                      delete obj.substituicaoTributaria?.quantidadeVendida;
                    }

                    // CST 03

                    if (obj.cst == "03") {
                      delete obj.baseCalculo;
                      obj.quantidadeVendida = quantity;
                    }


                    // EXPORTAÇÃO

                    if (isExport) { obj.cst = "07"; }


                    // VALIDAÇÃO VALOR

                    if (obj.valor) {
                      obj.valor = parseFloat(obj.valor);
                    }

                    // VALIDAÇÃO ALIQUOTA

                    if (obj.aliquota) {
                      obj.aliquota = parseFloat(obj.aliquota);
                      obj.baseCalculo = baseCalculo;
                    }

                    // VALIDAÇÃO BASE DE CAUCULO

                    if (obj.baseCalculo && obj.baseCalculo.valor) {
                      obj.baseCalculo.valor = parseFloat(obj.baseCalculo.valor);
                    }

                    // LIMPA ALIQUOTA E VALOR PARA NÃO TRIBUTADO

                    if (notTributed.includes(parseInt(obj.cst))) {
                      delete obj.aliquota;
                      delete obj.valor;
                      obj = { cst: obj.cst };
                    }

                    if (others.includes(parseInt(obj.cst))) {

                      if (obj.substituicaoTributaria?.aliquota) {
                        delete obj.substituicaoTributaria.quantidadeVendida;
                        delete obj.substituicaoTributaria.aliquotaReais;

                        delete obj.substituicaoTributaria?.aliquota;
                        // obj.substituicaoTributaria.quantidadeVendida = quantity;
                        obj.substituicaoTributaria.baseCalculo = baseCalculo;
                      } else if (obj.substituicaoTributaria?.aliquotaReais) {
                        delete obj.substituicaoTributaria.baseCalculo;
                        delete obj.substituicaoTributaria.aliquota;
                        obj.substituicaoTributaria.quantidadeVendida = quantity;
                      } else {
                        delete obj.substituicaoTributaria?.quantidadeVendida;
                        delete obj.substituicaoTributaria?.aliquotaReais;
                        if (obj.substituicaoTributaria) {
                          obj.substituicaoTributaria.baseCalculo = baseCalculo;
                        }
                      }

                      if (obj.aliquota) {
                        delete obj.quantidadeVendida;
                        delete obj.aliquotaReais;
                        obj.baseCalculo = baseCalculo;
                      } else if (obj.aliquotaReais) {
                        delete obj.baseCalculo;
                        delete obj.aliquota;
                        obj.quantidadeVendida = quantity;
                      } else {
                        delete obj.quantidadeVendida;
                        delete obj.aliquotaReais;
                        obj.baseCalculo = baseCalculo;
                      }
                    }

                    // clear props undefined

                    clearProps.forEach(prop => {
                      if (!obj[prop]) { delete obj[prop]; }
                      if (obj?.substituicaoTributaria) {
                        if (!obj.substituicaoTributaria[prop]) { delete obj.substituicaoTributaria[prop]; }
                      }
                    });

                    return obj.cst ? obj : {};
                  })(),
                  cofins: (() => {

                    let obj = tributes && tributes.cofins ? tributes.cofins : {};
                    obj.baseCalculo = obj.baseCalculo || {};
                    obj.baseCalculo.valor = obj.baseCalculo.valor || item.unitaryPrice;

                    const baseCalculo = obj.baseCalculo;

                    // "valor"
                    const clearProps = ["quantidadeVendida", "aliquotaReais"];
                    const others = [49, 50, 51, 52, 53, 54, 55, 56, 60, 61, 62, 63, 64, 65, 66, 67, 70, 71, 72, 73, 74, 75, 98, 99];
                    const notTributed = [4, 5, 6, 7, 8, 9];
                    const withAliq = [1, 2];

                    // obj.aliquota = 7.6;

                    // obj.aliquota = 7.6;
                    // obj.aliquota = 0;
                    // obj.valor = 0;
                    // obj.cst = "07";
                    // obj.cst = "08";

                    if (!obj?.substituicaoTributaria?.aliquota && !obj?.substituicaoTributaria?.aliquotaReais) {
                      delete obj.substituicaoTributaria;
                    }

                    // ST COM ALIQUOTA EM PRECENTUAL E EM REAIS

                    if (obj?.substituicaoTributaria?.aliquotaReais) {
                      delete obj.substituicaoTributaria?.aliquota;
                      delete obj.substituicaoTributaria?.baseCalculo;
                      obj.substituicaoTributaria.quantidadeVendida = quantity;
                    }

                    if (obj?.substituicaoTributaria?.aliquota) {
                      obj.substituicaoTributaria.baseCalculo = baseCalculo;
                      delete obj.substituicaoTributaria?.quantidadeVendida;
                      delete obj.substituicaoTributaria?.aliquotaReais
                    }

                    // CST 01 E 02

                    if (!withAliq.includes(parseInt(obj.cst))) {
                      delete obj.baseCalculo;
                      delete obj.substituicaoTributaria?.quantidadeVendida;
                    }

                    // CST 03

                    if (obj.cst == "03") {
                      delete obj.baseCalculo;
                      obj.quantidadeVendida = quantity;
                    }


                    // EXPORTAÇÃO

                    if (isExport) { obj.cst = "07"; }


                    // VALIDAÇÃO VALOR

                    if (obj.valor) {
                      obj.valor = parseFloat(obj.valor);
                    }

                    // VALIDAÇÃO ALIQUOTA

                    if (obj.aliquota) {
                      obj.aliquota = parseFloat(obj.aliquota);
                      obj.baseCalculo = baseCalculo;
                    }

                    // VALIDAÇÃO BASE DE CAUCULO

                    if (obj.baseCalculo && obj.baseCalculo.valor) {
                      obj.baseCalculo.valor = parseFloat(obj.baseCalculo.valor);
                    }

                    // LIMPA ALIQUOTA E VALOR PARA NÃO TRIBUTADO

                    if (notTributed.includes(parseInt(obj.cst))) {
                      delete obj.aliquota;
                      delete obj.valor;
                      obj = { cst: obj.cst };
                    }


                    if (others.includes(parseInt(obj.cst))) {

                      if (obj.substituicaoTributaria?.aliquota) {
                        delete obj.substituicaoTributaria.quantidadeVendida;
                        delete obj.substituicaoTributaria.aliquotaReais;

                        delete obj.substituicaoTributaria.aliquota
                        // obj.substituicaoTributaria.quantidadeVendida = quantity;
                        obj.substituicaoTributaria.baseCalculo = baseCalculo;
                      } else if (obj.substituicaoTributaria?.aliquotaReais) {
                        delete obj.substituicaoTributaria.baseCalculo;
                        delete obj.substituicaoTributaria.aliquota;
                        obj.substituicaoTributaria.quantidadeVendida = quantity;
                      } else {
                        delete obj.substituicaoTributaria?.quantidadeVendida;
                        delete obj.substituicaoTributaria?.aliquotaReais;

                        if (obj.substituicaoTributaria) {
                          obj.substituicaoTributaria.baseCalculo = baseCalculo;
                        }
                      }

                      if (obj.aliquota) {
                        delete obj.quantidadeVendida;
                        delete obj.aliquotaReais;

                        // delete obj.aliquota;
                        obj.baseCalculo = baseCalculo;
                      } else if (obj.aliquotaReais) {
                        delete obj.baseCalculo;
                        delete obj.aliquota;
                        obj.quantidadeVendida = quantity;
                      } else {
                        delete obj.quantidadeVendida;
                        delete obj.aliquotaReais;
                        obj.baseCalculo = baseCalculo;
                      }
                    }

                    // clear props undefined

                    clearProps.forEach(prop => {
                      if (!obj[prop]) { delete obj[prop]; }
                      if (obj?.substituicaoTributaria) {
                        if (!obj.substituicaoTributaria[prop]) { delete obj.substituicaoTributaria[prop]; }
                      }
                    });

                    return obj.cst ? obj : {};
                  })()
                };

                return obj;
              } catch (error) {

                console.log(error)
                return {};
              }
            })()
          };

          if (item.specialization) {
            switch (item.specialization) {
              case "fuel": {
                obj.combustivel = item.fuel;
                break;
              }
              case "remedy": {
                obj.medicamentos = item.remedy;
                break;
              }
            }
          }

          if (!obj.ncm) { delete obj.ncm; }
          if (!obj.cest) { delete obj.cest; }

          if (item.tributes && item.tributes.issqn) {

            // issqn.valor = issqn.baseCalculo * (issqn.aliquota / 100);

            item.tributes.issqn.baseCalculo = obj.valor;
            item.tributes.issqn.valor = item.tributes.issqn.baseCalculo * (item.tributes.issqn.aliquota / 100);
            obj.tributos.issqn = item.tributes.issqn;

            response.total = response.total ? response.total : {
              servico: {
                baseCalculo: 0,
                dataPrestacao: this.settings.data.registerDate,
                valor: 0,
                valorIss: 0
              }
            };

            response.total.servico.baseCalculo += obj.tributos.issqn.baseCalculo;
            response.total.servico.valor += obj.valor;
            response.total.servico.valorIss += obj.tributos.issqn.baseCalculo * (obj.tributos.issqn.aliquota / 100);

            delete obj.tributos.icms;
          }

          if (discountItemValue > 0) {
            obj.valorDesconto = discountItemValue;
            totalDiscount += obj.valorDesconto;
            // obj.valorDesconto = parseFloat((( obj.valor / 100 * dicountPorcentage)).toFixed(4));
            // console.log("CODE: ", item.code," valor: ",  obj.valorUnitario.tributavel, " dicount: ", obj.valorDesconto * obj.quantidade.tributavel, " - ",dicountPorcentage)
          }

          total += (obj.valor || 0) - ((obj.valorDesconto || 0));
          totalWithoutDiscount += (obj.valor || 0);
          // total += (obj.valor || 0) - ((obj.valorDesconto || 0) * obj.quantidade.tributavel);

          response.itens.push(obj);
        };

        if (settingsData.updateTributes) {

          const query = [];
          const currentProducts: any = {};

          (sourceData.products || []).forEach((item) => {
            query.push({
              field: "code",
              operator: "=",
              value: parseInt(item.code.toString())
            });
            currentProducts[parseInt(item.code)] = item;
          });

          this.productsService.query(query, false, false, false, false).then((res) => {

            // console.log(res);

            for (let i in res) {

              const item: any = res[i];
              const matrixTributes = currentProducts[parseInt(<any>item.code.toString())].tributes || {};

              if (currentProducts[parseInt(<any>item.code.toString())]) {

                const issqn = currentProducts[parseInt(<any>item.code)].tributes.issqn;

                // console.log(issqn);

                if (!Utilities.isMatrix) {
                  const branch = currentProducts[parseInt(<any>item.code.toString())].branches[Utilities.storeID] || {};
                  const branchTributes = branch.tributes || matrixTributes;
                  currentProducts[parseInt(<any>item.code.toString())].tributes = branchTributes;

                  if (item.specialization) {
                    switch (item.specialization) {
                      case "fuel": {
                        currentProducts[parseInt(<any>item.code.toString())].fuel = item.fuel;
                        break;
                      }
                      case "remedy": {
                        currentProducts[parseInt(<any>item.code.toString())].remedy = item.remedy;
                        break;
                      }
                    }
                  }
                } else {
                  currentProducts[parseInt(<any>item.code.toString())].tributes = matrixTributes;
                }

                if (item.ncm) {
                  currentProducts[parseInt(<any>item.code.toString())].ncm = item.ncm;
                }

                if (item.codigoBeneficioFiscal) {
                  currentProducts[parseInt(<any>item.code.toString())].codigoBeneficioFiscal = item.codigoBeneficioFiscal;
                }

                if (item.cest) {
                  currentProducts[parseInt(<any>item.code.toString())].cest = item.cest;
                }

                if (Object.values(issqn || {}).length > 0) {
                  currentProducts[parseInt(<any>item.code.toString())].tributes.issqn = issqn;
                }
              } else {
                error = { message: 'Alguns produtos foram removidos e não podem ser consultados.' };
                break;
              }
            }

            // console.log(error, currentProducts)

            if (!error) {
              sourceData.products = Object.values(currentProducts);
              (sourceData.products || []).forEach(configProduct);
              statusProducts = true;
            }

          }).catch((e) => {

            statusProducts = true;
            error = { message: e.message };
          });

        } else {

          (sourceData.products || []).forEach(configProduct);
          statusProducts = true;
        }

        console.log("total: ", total, totalTax, totalPayed, totalWithoutDiscount, totalWithoutDiscount - totalPayed);
      }


      function configDiff(totalPayed, total) {
        let diff = totalPayed - total;
        console.log(diff)

        if (settingsData.type != "NFSE") {
          response.itens[0].valorDesconto = response.itens[0].valorDesconto ?? 0;
          if (diff > 0) {
            // diff = round(diff, 2);
            // console.log(diff)
            if (response.itens[0].valorDesconto > 0) {
              response.itens[0].valorDesconto -= diff;
              totalDiscount -= diff;
            } else if (totalTax > 0) {

            }
          } else if (diff < 0) {
            response.itens[0].valorDesconto -= diff;
            totalDiscount -= diff;
          }
        }

      }


      // Seeting Fatura

      function configFatura() {
        // Regra SEFAZ: Para pagamento à vista NÃO enviar dados de cobrança (fatura/duplicata)
        // Somente incluir "cobranca" quando houver pagamento parcelado.
        if (settingsData.type == "NFE") {

          // Detecta se há algum pagamento explicitamente parcelado (aVista === false)
          const pagamentos = response.pagamentos || [];
          const temParcelado = pagamentos.some(p => p && p.aVista === false);

          // Usuário pode configurar mais de uma parcela manualmente (quando UI suportar)
          const parcelasForm = Array.isArray(settingsData.parcelas) ? settingsData.parcelas : [];
          const temMultiplasParcelas = parcelasForm.length > 1;

          // Se não for parcelado e não há múltiplas parcelas, omite "cobranca"
          if (!temParcelado && !temMultiplasParcelas) {
            // Não incluir response.cobranca para evitar rejeição: "Dados de cobrança não devem ser informados para pagamento à vista"
            return;
          }

          // Caso contrário (há parcelamento), montar fatura/duplicatas
          const discount = totalWithoutDiscount - totalPayed;
          const amount = totalWithoutDiscount - discount;

          // Construção da cobrança mínima (1 parcela) quando não vier detalhamento de parcelas do formulário
          const billing: any = {
            numero: Utilities.uuid(),
            valorTotal: round(totalWithoutDiscount, 2),
            valorDesconto: round(discount, 2),
            valorLiquido: round(amount, 2),
            parcelas: [{
              numero: "001",
              dataVencimento: settingsData.parcelas[0]?.dataVencimento || DateTime.getDate("D"),
              valor: round(amount, 2)
            }]
          };

          response.cobranca = billing;
        }
      }




      // Settings Serviços

      if (settingsData.type == "NFSE") {

        response.servico = [];
        totalTaxes.iss = 0;

        statusServices = false;

        const nfseServiceItems: Array<{ obj: any; baseValue: number }> = [];
        let nfseTotalBaseValue = 0;

        const getBalanceDiscountValue = () => {
          const subtotalDiscount = Number(sourceData.balance?.subtotal?.discount || 0);
          const totalDiscount = Number(sourceData.balance?.totalDiscount || 0);
          if (this.embed) {
            return subtotalDiscount > 0 ? subtotalDiscount : totalDiscount;
          }
          return totalDiscount > 0 ? totalDiscount : subtotalDiscount;
        };

        const applyNfseDiscount = () => {
          const discountValue = round(getBalanceDiscountValue(), 2);
          if (!(discountValue > 0)) {
            return;
          }

          const saleTotal = Number(sourceData.balance?.total ?? sourceData.balance?.totalSale ?? 0);
          if (!(saleTotal > 0)) {
            return;
          }

          let currentTotal = 0;
          nfseServiceItems.forEach((entry) => {
            currentTotal += Number(entry.obj?.valor?.servico || 0);
          });

          currentTotal = round(currentTotal, 2);
          const expectedTotal = round(saleTotal, 2);

          let difference = round(currentTotal - expectedTotal, 2);
          if (!(difference > 0)) {
            return;
          }

          difference = Math.min(difference, round(discountValue, 2));

          const baseTotal = nfseTotalBaseValue > 0 ? nfseTotalBaseValue : currentTotal;
          if (!(baseTotal > 0)) {
            return;
          }

          nfseServiceItems.forEach((entry, index) => {
            if (!(difference > 0)) {
              return;
            }

            const currentValue = Number(entry.obj?.valor?.servico || 0);
            if (!(currentValue > 0)) {
              return;
            }

            const baseValue = entry.baseValue > 0 ? entry.baseValue : currentValue;

            let discountShare = index === (nfseServiceItems.length - 1)
              ? round(difference, 2)
              : round(difference * (baseValue / baseTotal), 2);

            if (discountShare > currentValue) {
              discountShare = currentValue;
            }

            if (!(discountShare > 0)) {
              return;
            }

            difference = round(difference - discountShare, 2);

            entry.obj.valorDesconto = round((entry.obj.valorDesconto || 0) + discountShare, 2);
            if (!entry.obj.valor) {
              entry.obj.valor = {};
            }

            const newValue = round(currentValue - discountShare, 2);
            entry.obj.valor.servico = newValue;

            if (entry.obj.tributos && entry.obj.tributos.issqn) {
              entry.obj.tributos.issqn.baseCalculo = newValue;
              entry.obj.tributos.issqn.valor = round(newValue * (entry.obj.tributos.issqn.aliquota / 100), 2);
            }
          });

          // Recalcular totais e impostos após ajustes
          totalTaxes.iss = 0;

          if (response.total && response.total.servico) {
            response.total.servico.baseCalculo = 0;
            response.total.servico.valor = 0;
            response.total.servico.valorIss = 0;
          }

          nfseServiceItems.forEach((entry) => {
            const serviceValue = Number(entry.obj?.valor?.servico || 0);

            if (entry.obj.tributos && entry.obj.tributos.issqn) {
              totalTaxes.iss += entry.obj.tributos.issqn.valor;

              if (response.total && response.total.servico) {
                response.total.servico.baseCalculo += entry.obj.tributos.issqn.baseCalculo;
                response.total.servico.valor += serviceValue;
                response.total.servico.valorIss += entry.obj.tributos.issqn.valor;
              }
            } else if (response.total && response.total.servico) {
              response.total.servico.valor += serviceValue;
            }
          });
        };

        // console.log(settingsData.updateTributes, sourceData.services);

        if (!sourceData.services && sourceData.service || sourceData.services && sourceData.services.length == 0 && sourceData.service) {
          sourceData.services = sourceData.service.types;
        }

        // sourceData.services = sourceData.service ? sourceData.service.types : sourceData.services;
        sourceData.services = sourceData.services || [];


        const configService = (item) => {

          console.log("service: ", item);

          let issAliquota = 0;
          item.codigo = item.codigo || "";
          const serviceInfo = this.getServiceInfoFromServiceCode(item.codigo, FieldMask.clearMask(item.cnae));

          const obj: any = {
            codigo: isNfseNacinal ? FieldMask.clearMask(item.codigo) : item.codigo,
            // codigo: FieldMask.clearMask(item.codigo),
            discriminacao: item.name,
            cnae: item.cnae,
            iss: (() => {

              const obj = item.tributes && item.tributes.iss ? item.tributes.iss : {};

              obj.tipoTributacao = obj.tipoTributacao ? parseInt(obj.tipoTributacao) : 7;
              obj.exigibilidade = obj.exigibilidade ? parseInt(obj.exigibilidade) : 1;
              obj.aliquota = obj.aliquota ? parseInt(obj.aliquota.toString()) : 0;

              if (obj.aliquota == 0 && serviceInfo) {
                obj.aliquota = serviceInfo["ALIQUOTA"] || 0;
              }

              if (obj.fundoCombatePobreza && obj.fundoCombatePobreza.aliquota == 0) {
                delete obj.fundoCombatePobreza;
              }

              if (!obj.valor) {
                delete obj.valor;
              }

              if (!obj.valorRetido) {
                delete obj.valorRetido;
              }

              if (obj.aliquota) {
                obj.aliquota = parseInt(obj.aliquota);
                issAliquota = obj.aliquota;
              }

              if (this.fiscalSettings.regimeTributarioEspecial == 5) {
                obj.aliquota = 0;
              }

              return obj;
            })(),
            valor: (() => {

              const obj = item.tributes && item.tributes.valor ? item.tributes.valor : {};

              const products = (() => {
                let value = 0;

                if (this.formSettingsControls.addProductsInService.value) {
                  Object.values(item.products || {}).forEach((product: any) => {
                    value += (product.unitaryPrice != undefined ? product.unitaryPrice : product.salePrice) * (product.selectedItems);
                  });
                }

                return value;
              })();

              item.customPrice = (item.customPrice != undefined ? item.customPrice : item.executionPrice) || 0;

              obj.servico = item.customPrice + products;

          return obj;
        })()
          };

          if (item.codigoTributacao || serviceInfo["XML_CodigoTributacaoMunicipio"]) {
            obj.codigoTributacao = item.codigoTributacao || serviceInfo["XML_CodigoTributacaoMunicipio"];
          }

          const productsValue = (() => {
            if (!this.formSettingsControls.addProductsInService.value) {
              return 0;
            }

            let value = 0;
            Object.values(item.products || {}).forEach((product: any) => {
              const quantity = product.selectedItems || product.quantity || 1;
              const unitary = product.unitaryPrice != undefined ? product.unitaryPrice : product.salePrice;
              value += (unitary || 0) * quantity;
            });

            return value;
          })();

          const executionValue = (item.executionPrice != undefined ? item.executionPrice : item.customPrice) || 0;
          const baseValue = executionValue + productsValue;

          // console.log(obj.valor.servico * (obj.iss.aliquota / 100));

          if (this.fiscalSettings.regimeTributarioEspecial == 5) {
          } else {
            totalTaxes.iss += issAliquota > 0 ? obj.valor.servico * (issAliquota / 100) : 0;
          }

          response.servico.push(obj);
          nfseServiceItems.push({ obj, baseValue });
          nfseTotalBaseValue += baseValue;
        }


        if (settingsData.updateTributes) {

          const query = [];
          const currentServices: any = {};

          (sourceData.services || []).forEach((item) => {
            query.push({
              field: "code",
              operator: "=",
              value: parseInt(item.code)
            });
            currentServices[parseInt(item.code)] = item;
          });

          this.servicesService.query(query, false, false, false, false).then((res) => {

            res.forEach((item) => {
              if (currentServices[parseInt(<any>item.code)]) {
                currentServices[parseInt(<any>item.code)].codigo = item.codigo;
                currentServices[parseInt(<any>item.code)].codigoTributacao = item.codigoTributacao || "";
                currentServices[parseInt(<any>item.code)].cnae = item.cnae;
                currentServices[parseInt(<any>item.code)].tributes = Utilities.deepClone(item.tributes);
                console.log("item.tributes: ", item.tributes);
              } else {
                error = { message: 'Alguns produtos foram removidos e não podem ser consultados.' }
              }
            });

            if (!error) {
              sourceData.products = Object.values(currentServices);
              (sourceData.products || []).forEach(configService);
              applyNfseDiscount();
              statusServices = true;
            }

          }).catch((e) => {

            statusServices = true;
            error = { message: e.message };
          });

        } else {


          (sourceData.services || []).forEach(configService);
          applyNfseDiscount();
          statusServices = true;
        }


        response.rps = {
          competencia: DateTime.getDate("D"),
          dataEmissao: DateTime.getDateObject().toISOString(),
          serie: settingsData.serie
        };
      }

      const taxes = sourceData.nf && sourceData.nf.taxes ? sourceData.nf.taxes : {};

      const nf = sourceData.nf;

      // console.log(sourceData.nf);

      for (let index in totalTaxes) {

        const formatedType = settingsData.type != "NFSE" ? "nf" : "nfse";

        // if (nf && nf.status[formatedType] != "")
        // taxes[index] ? taxes[index] + totalTaxes[index] : 
        taxes[index] = totalTaxes[index];
      }

      const docInfo = this.embed ? {
        code: sourceData.code,
        owner: sourceData.owner,
        taxes: taxes,
        conjugated: settingsData.type != "NFSE" ? settingsData.nfWithISSQN : false,
        source: {
          embed: !!this.embed,
          // serviceOrders: this.serviceOrders
        }
      } : null;

      // valorTroco

      // console.log(settingsData);
      // console.log(this.fiscalSettings, docInfo, settingsData, sourceData, response);

      // return;

      const it = setInterval(() => {
        if (statusProducts && statusServices) {
          clearInterval(it);

          configDiff(totalPayed, total);
          configFatura();

          Utilities.forceAlloc(response);

          // console.log("error---> ",error);

          // Utilities.loading(false);
          // console.log(settingsData, sourceData, response, JSON.stringify(response));
          console.log(settingsData, sourceData, response);

          // JSON.stringify(response);
          // this.checkSubmit(false)
          // return;

          // error = {message: 'Alguns produtos foram removidos e não podem ser consultados.'};

          if (error && error.message) {
            this.alertService.alert("Emissão de Nota Fiscal", null, error.message);
            Utilities.loading(false);
          } else {
            const formatedType = settingsData.type != "NFSE" ? "nf" : "nfse";

            this.fiscalService.emitNote(settingsData.type, response, docInfo, settingsData.waitSefaz, false).then((res) => {
              if (res) {
                const nf: any = { id: {}, type: {}, status: {} };
                nf.id[formatedType] = res.id;
                nf.type[formatedType] = res.type;
                nf.status[formatedType] = res.status;

                this.originalData['nf'] = nf;
              }
              //   if (this.cashier) {
              //     CashierFrontReceiptsComponent.shared.onOpen({ data: this.originalData });
              //     this.callback.emit({ close: true });
              //   } else {
              //     this.callback.emit({ print: { data: this.originalData } });
              //   }
              // } else {
              if (this.cashier) {
                // Abre o modal de recibos com autoPrint para NF (apenas 1 vez)
                CashierFrontReceiptsComponent.shared.onOpen({ data: this.originalData });
                this.callback.emit({ close: true });
              } else {
                // Para uso fora do caixa, manter o comportamento original
                this.callback.emit({ print: { data: this.originalData } });
              }

              Utilities.loading(false);
            }).catch((error) => {
              this.settings._isSubmited = false
              console.log("--", error);
              Utilities.loading(false);
            }).finally(() => {
              this.checkSubmit(false)
            })
          }

        }
      }, 100);

    });

    // return response;
  }

  public onChangeBoolean(event, control: AbstractControl) {
    control.setValue(control.value == "true");
  }

  public onChangeDestinyType() {

    const idIntegracao = (() => {
      let value = "";
      if (this.data.customer && this.data?.customer?.personalDocument?.type == "GENERAL") {
        return this.data.customer.personalDocument.value;
      }

      if (this.data.customer && this.data?.customer?.businessDocument?.type == "GENERAL") {
        return this.data.customer.businessDocument.value;
      }

      return value;
    })();

    this.formGeneralSettings.get("codigoEstrangeiro").setValue(idIntegracao);
  }

  public mapPaymentMethods(data) {

    // console.log(data);

    const selectPaymentMethods = {};

    (data || []).forEach(item => {

      // console.log(item);

      if (item.code === 1000) {

        selectPaymentMethods["01"] = { code: "01", value: item.value };
      } else if (item.code === 2000) {

        selectPaymentMethods["15"] = { code: "15", value: item.value };
      } else if (item.code >= 3000 && item.code < 4000) {

        selectPaymentMethods["04"] = selectPaymentMethods["04"] || { code: "04", value: 0 };
        selectPaymentMethods["04"].value += item.value;
      } else if (item.code >= 4000 && item.code < 5000) {

        selectPaymentMethods["03"] = selectPaymentMethods["03"] || { code: "03", value: 0, aVista: item.fees.parcel == 1 };
        selectPaymentMethods["03"].value += item.value;
      } else if (item.code === 5000) {

        selectPaymentMethods["02"] = { code: "02", value: item.value };
      } else if (item.nfPaymentMethodCode) {

        selectPaymentMethods[item.nfPaymentMethodCode] = selectPaymentMethods[item.nfPaymentMethodCode] || { code: item.nfPaymentMethodCode, value: 0, aVista: item.fees ? item.fees.parcel == 1 : true };
        selectPaymentMethods[item.nfPaymentMethodCode].value += item.value;
      } else {

        selectPaymentMethods["99"] = selectPaymentMethods["99"] || { code: "99", value: 0 };
        selectPaymentMethods["99"].value += item.value;
      }

    });

    // console.log("selectPaymentMethods: ", selectPaymentMethods);

    if (this.layerComponent) {
      this.layerComponent.paymentMethodsComponent?.selectMethods(Object.values(selectPaymentMethods || {}));
    }
  }

  public onResponseCFOPProduct(event, item) {
    item.cfop = event.data;
  }

  public onChangeNfFreteMod(modalidadeFreteSelect) {
    const { value } = modalidadeFreteSelect;

    console.log(value);

  }

  private getServiceInfoFromServiceCode(code, cnae) {
    let result;
    nfseServicesJson?.Relacionamentos?.forEach((item) => {
      if (item['XML_ItemListaServico'] == code && item["XML_CodigoCnae"] == cnae) {
        result = item;
      }
    });
    return result;
  }

  // Utility Methods

  // Destruction Method

  public ngOnDestroy() {

    this.cfop = "5.102";
    this.data = {};
    this.layerComponent = null;

    console.clear();

    if (this.originalData && this.embed) {
      this.data = this.originalData;
    }

    this.onResetPanel();
  }

  public reset() {
    this.ngOnDestroy();
  }

}
