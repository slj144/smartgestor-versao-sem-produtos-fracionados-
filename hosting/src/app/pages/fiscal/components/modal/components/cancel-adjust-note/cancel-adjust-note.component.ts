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
  selector: 'cancel-adjust-note',
  templateUrl: './cancel-adjust-note.component.html',
  styleUrls: ['./cancel-adjust-note.component.scss']
})
export class CancelAdjustNfComponent implements OnInit, OnDestroy {

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

    const data = this.form.value;

    if (this.settings.activeComponent == "Fiscal/Cancel"){
      this.fiscalService.cancelNote(<any>data.type, data.idNota, data.justificativa, true).then(()=>{
        this.callback.emit({ close: true });
      }).catch((error)=>{

      });
    }else{
      this.fiscalService.adjustNfe(data.idNota, data.correcao).then(()=>{
        this.callback.emit({ close: true });
      }).catch((error)=>{

      });
    }
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
      idNota: [data.id || '', [Validators.required]],
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
    this.layerComponent = null;
    this.form = null;
  }

}
