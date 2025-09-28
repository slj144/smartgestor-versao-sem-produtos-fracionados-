import { Component, EventEmitter, OnInit, Output, OnDestroy, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

// Components
import { ServicesSelectorComponent } from '../../../../../registers/services/components/selector/selector.component';
import { ProductsSelectorComponent } from '../../../../../stock/products/components/selector/selector.component';
import { PartnersService } from '../../../../../registers/partners/partners.service';

// Services
import { SettingsService } from '../../../../../settings/settings.service';
import { FiscalService } from '../../../../fiscal.service';

// Translate
import { FiscalTranslate } from '../../../../fiscal.translate';

// Interfaces
import { EServiceOrderPaymentStatus, EServiceOrderStatus, IServiceOrder } from '@shared/interfaces/IServiceOrder';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { FieldMask } from '@shared/utilities/fieldMask';

@Component({
  selector: 'inutilization-note',
  templateUrl: './inutilization.component.html',
  styleUrls: ['./inutilization.component.scss']
})
export class InutilizationNfComponent implements OnInit, OnDestroy {

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  @Input() settings: any = {};

  public translate = FiscalTranslate.get()['modal']['action']['register'];

  public loading: boolean = true;  
  public data: any = {};
  
  public form: FormGroup;

  private layerComponent: any;   

  constructor(
    private formBuilder: FormBuilder,
    private fiscalService: FiscalService
  ) { }

  public ngOnInit() {
    this.callback.emit({ instance: this });
    this.formSettings(this.settings ? this.settings.data : {});
  }

  public bootstrap(settings: any = {}) {

    this.settings = settings;
    this.data = Utilities.deepClone(settings.data);

    this.formSettings(this.data);
  }

  // Getter and Setter Methods

  public get formControls() {
    return this.form.controls;
  }

  // User Interface Actions - General

  public onRegister() {

    if(this.checkSubmit()){ return; }

    const data = this.form.value;

    data.ano = parseInt(data.ano.toString());
    data.numeracao.inicial = parseInt(data.numeracao.inicial);
    data.numeracao.final = parseInt(data.numeracao.final);
    data.serie = parseInt(data.serie);
    data.justificativa = data.justificativa.trim();

    this.fiscalService.getStoreSettings("Fiscal/Initulization", (fiscalSettings)=>{
      this.fiscalService.removeListeners("store-settings", "Fiscal/Initulization");

      data.cpfCnpj = fiscalSettings.cpfCnpj;

      this.fiscalService.inutulizationNote(data).then((res)=>{
        console.log(res);
        this.callback.emit({ close: true });
      }).catch((error)=>{

      });
    });

  
  }

  private checkSubmit() {

    if (this.settings._isSubmited) { return true; }

    this.settings._isSubmited = true;
    return false;
  }


  // Mask Methods

  public onApplyNumberMask(event: Event) {
    $$(event.currentTarget).val(FieldMask.numberFieldMask($$(event.currentTarget).val(), null, null, true));
  }

  // Layer Actions

  public onOpenLayer(type: string) {
    this.layerComponent.onOpen({ activeComponent: type });
  }

  // Auxiliary Methods

  private formSettings(data: any = {}) {

    this.form = this.formBuilder.group({
      numeracao: this.formBuilder.group({
        inicial: ['', [Validators.required]],
        final: ['', [Validators.required]]
      }),
      serie: ["", [Validators.required]],
      ano: [new Date().getFullYear(), [Validators.required]],
      justificativa: ['', [Validators.required, Validators.minLength(15)]],
    });


    if (this.settings.activeComponent == "Fiscal/Cancel"){
      
      this.form.addControl("justificativa", new FormControl("", [Validators.required, Validators.minLength(15)]));
      this.form.addControl("type", new FormControl(data.type || "NFE", [Validators.required]));
    }

    if (this.settings.activeComponent == "Fiscal/Edit"){
      this.form.addControl("correcao", new FormControl("", [Validators.required, Validators.minLength(15), Validators.required]));
    }

  }

  // Utility Methods

  // Destruction Method

  public ngOnDestroy() {
    
    this.data = {};
    this.settings._isSubmited = false;
    this.layerComponent = null;
    this.form = null;
  }

}
