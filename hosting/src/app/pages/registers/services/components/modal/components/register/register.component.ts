import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

// Services
import { ServicesService } from '../../../../services.service';

// Translate
import { ServicesTranslate } from '../../../../services.translate';

// Interfaces
import { IRegistersService } from '@shared/interfaces/IRegistersService';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { FieldMask } from '@shared/utilities/fieldMask';

@Component({
  selector: 'services-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class ServicesRegisterComponent implements OnInit {

  @Output() public callback: EventEmitter<any> = new EventEmitter(); 

  public translate = ServicesTranslate.get()['modal']['action']['register'];

  public formService: FormGroup;
  public settings: any = {};
  public checkBootstrap: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private servicesService: ServicesService
  ) {}

  public ngOnInit() {  
    this.callback.emit({ instance: this });
  }

  // Getter and Setter Methods

  public get isAdmin() {
    return Utilities.isAdmin;
  }  

  public get isFiscal() {
    return Utilities.isFiscal;
  }

  public get formControl() {
    return this.formService.controls;
  }

  // Initialize Method

  public bootstrap(settings: any = {}) {

    this.settings = Utilities.deepClone(settings);
    this.settings.data = (this.settings.data || {});

    this.formSettings(this.settings.data);

    this.checkBootstrap = true;
  }

  // User Interface Actions   

  public onSubmit() {
    
    const formData = this.formService.value;
    const source = this.settings.data;

    const data: IRegistersService = {
      _id: source._id,
      code: source.code,
      name: formData.name,
      costPrice: parseFloat(String(formData.costPrice || 0).replace(/\./g,'').replace(',','.')),
      executionPrice: parseFloat(String(formData.executionPrice || 0).replace(/\./g,'').replace(',','.')),
      cnae: formData.cnae,
      codigo: formData.codigo,
      codigoTributacao: formData.codigoTributacao?.toString() || ""
    };

    if (formData.description) {
      data.description = formData.description;
    }

    if (formData.tributes && this.isFiscal) {

      this.treatTributes(formData);

      if (Utilities.storeID == 'matrix'){
        data.tributes = formData.tributes;
      }else if (!Utilities.compareObject(formData.tributes, this.settings.data.tributes || {})){
        data.branches = data.branches || {};
        data.branches[Utilities.storeID] = <any>{};
        data.branches[Utilities.storeID].tributes = formData.tributes;
      }
    }

    if (formData.isDisabled != data._isDisabled) {
      data._isDisabled = formData.isDisabled;
    }

    this.servicesService.registerService(data).then(() => {
      this.callback.emit({ data: data, close: true });
    });
  }

  // Mask Methods

  public onApplyPriceMask(event: Event, control: AbstractControl) {
    control.setValue(FieldMask.priceFieldMask($$(event.target)[0].value));
  }

  public onApplyNumberMask(event: Event, control: AbstractControl) {
    control.setValue(FieldMask.numberFieldMask($$(event.target)[0].value));
  }

  // Auxiliary Methods

  private formSettings(data: any = {}) {

    this.treatData(data);

    this.formService = this.formBuilder.group({
      code: [],
      name: ['', [ Validators.required ]],
      description: [],
      costPrice: [],
      executionPrice: [],

      cnae: [data.cnae, Utilities.isFiscal ? [ Validators.required ] : []],
      codigo: [data.codigo, Utilities.isFiscal ? [ Validators.required ] : []],
      codigoTributacao: [data.codigoTributacao, Utilities.isFiscal ? [  ] : []],

      tributes: this.formBuilder.group({
        iss: this.formBuilder.group({
          tipoTributacao: [6, [ Validators.required ]],
          exigibilidade: [1, [ Validators.required ]],
          aliquota: [0, [ Validators.required ]],
          valor: [0, [ ]],
          valorRetido: [0, [ ]],
          processoSuspensao: ["", [ ]],
          retido: [false, []]
        })
      }),
      isDisabled: [data._isDisabled]
    });

    this.formService.patchValue(data);
  }

  private treatData(data) {

    data.name = data.name || '';
    data.code = data.code || '';
    data.description = data.description || '';
    data.costPrice = data.costPrice ? FieldMask.priceFieldMask(data.costPrice.toFixed(2).replace('.', ',')) : '0,00';
    data.executionPrice = data.executionPrice ? FieldMask.priceFieldMask(data.executionPrice.toFixed(2).replace('.', ',')) : '0,00';
    
    data.tributes = data.tributes || {};
    data.tributes.iss = data.tributes.iss || {};

    this.treatTributes(data, true);
  }

  private treatTributes(data, format = false) {

    
    const formartPercentual = (value)=>{
      return parseFloat(value).toFixed(2).replace(".",",");
    };

    const formatPrice = (value)=>{
      return (FieldMask.priceFieldMask((value || 0).toFixed(2).replace('.', ',')));
    }

    data.tributes = data.tributes || {};
    data.tributes.iss = data.tributes.iss || {};
    data.tributes.iss.tipoTributacao = parseInt(data.tributes.iss.tipoTributacao || 6);
    data.tributes.iss.exigibilidade = parseInt(data.tributes.iss.exigibilidade || 1);
    data.tributes.iss.aliquota = format ? formartPercentual(data.tributes.iss.aliquota || 0) : Utilities.parsePercentualToNumber(data.tributes.iss.aliquota || 0);
    data.tributes.iss.valor = format ? formatPrice(data.tributes.iss.valor || 0) : Utilities.parseCurrencyToNumber(data.tributes.iss.valor || 0);
    data.tributes.iss.valorRetido = format ? formatPrice(data.tributes.iss.valorRetido || 0) : Utilities.parseCurrencyToNumber(data.tributes.iss.valorRetido || 0);
    data.tributes.iss.retido = data.tributes.iss.valorRetido > 0;
  }

}

