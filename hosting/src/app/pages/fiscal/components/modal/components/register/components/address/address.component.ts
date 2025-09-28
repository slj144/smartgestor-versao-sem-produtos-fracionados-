import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';

// Services

// Utilties
import { $$ } from '@shared/utilities/essential';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ENotificationStatus } from '@shared/interfaces/ISystemNotification';
import { NotificationService } from '@shared/services/notification.service';
import { CEPService } from '@shared/services/cep.service';
import { FieldMask } from '@shared/utilities/fieldMask';
import { Utilities } from '@shared/utilities/utilities';

@Component({
  selector: 'address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss']
})
export class AddressComponent implements OnInit, OnDestroy, OnChanges {

  @Output() callback: EventEmitter<any> = new EventEmitter();
  @Input() data: any = {};
  @Input() isExport: boolean = false;

  @ViewChild("addressComponent", {static: false}) addressElement: ElementRef;

  public ibgeCountries = Utilities.ibgeCountries;

  public static shared: AddressComponent;

  public form: FormGroup;
  public checkSearchPostCode: boolean = false;
  public loading: boolean = true;  
  public states = Utilities.states;

  get formControls(){
    return this.form.controls;
  }

  constructor(
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private cepService: CEPService
  ) {
    AddressComponent.shared = this;
  }

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.config();
  }


  // Initialize Method

  public bootstrap(data: any) {
    this.data = data;
    this.config();
  }

  private config(){

    const data = (()=>{

      this.data = this.data || {};

      this.data = {
        descricaoCidade: this.isExport ? 'EXTERIOR' : this.data.city,
        codigoCidade: this.isExport ? '9999999' : '',
        logradouro: this.data.local,
        bairro: this.data.neighborhood,
        numero: this.data.number,
        cep: this.data.postalCode,
        estado: this.isExport ? 'EX' : this.data.state,
        codigoPais: this.isExport ? '' : "1058",
        descricaoPais: this.isExport ? '' : "Brasil"
      };

      return this.data;
    })();

    data.tipoBairro = data.tipoBairro || "Residencial";
    data.tipoLogradouro = data.tipoLogradouro || "Quadra";

    this.form = this.formBuilder.group({
      codigoPais: ['', [Validators.required]],
      descricaoPais: ['', [Validators.required]],
      tipoLogradouro: ['', [Validators.required]],
      logradouro: ['', [Validators.required]],
      numero: ['', [Validators.required]],
      complemento: ['', []],
      tipoBairro: ['', [Validators.required]],
      bairro: ['', [Validators.required]],
      codigoCidade: ['', [Validators.required]],
      descricaoCidade: ['', [Validators.required]],
      estado: ['', [Validators.required]],
      cep: ['', [Validators.required]],
    });

    this.form.patchValue(data);

    this.loading = false;

    this.callback.emit({ data: this.form.value });

    if (data.cep){
      this.onCEPData(null);
    }

    const it = setInterval(()=>{
      if ($$("#address-component").length){

        clearInterval(it);

        $$(this.addressElement.nativeElement).add("input").on("input", (evt)=>{
          this.callback.emit({ data: this.form.value });
        });

        $$(this.addressElement.nativeElement).add("select").on("change", (evt)=>{
          this.callback.emit({ data: this.form.value });
        });
      }
    }, 0);

  }

  // Masks

  public onApplyPostalCodeMask(event: Event, control: AbstractControl) {
    control.setValue(FieldMask.postalCodeFieldMask($$(event.target)[0].value));
  }

  public onApplyNumberMask(event: Event) {
    $$(event.currentTarget).val(FieldMask.numberFieldMask($$(event.currentTarget).val(), null, null, true));
  }

  public onChangeCountry(select){
    const value = parseInt(select.value);
    const country = this.ibgeCountries.filter((country)=> country.code == value)[0];
    this.formControls.codigoPais.patchValue(country.code);
    this.formControls.descricaoPais.patchValue(country.name);
  }


  // Auxiliary Methods

  public onCEPData(event: Event) {

    if (event){ event.preventDefault(); }


    if ((this.formControls.cep.value && this.formControls.cep.value.length == 9) && this.formControls.cep.valid) {

      this.checkSearchPostCode = true;

      this.cepService.search(this.formControls.cep.value).subscribe((data: any) => {

        if (!data.erro) {

          this.formControls.logradouro.patchValue(data.logradouro);
          this.formControls.complemento.patchValue(data.complemento);
          this.formControls.bairro.patchValue(data.bairro);
          this.formControls.descricaoCidade.patchValue(data.localidade);
          this.formControls.codigoCidade.patchValue(data.ibge);
          this.formControls.estado.patchValue(data.uf);


          this.callback.emit({ data: this.form.value });


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


  // Utility Methods
  
  public reset() {

  
  }

  // Destruction Methods

  public ngOnDestroy() {

    this.data = {};
  }

}
