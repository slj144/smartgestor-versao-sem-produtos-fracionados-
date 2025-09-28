import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

// Services
import { SchemesService } from '../../../schemes.service';

// Translate
import { SchemesTranslate } from '../../../schemes.translate';

// Interfaces
import { IRegistersScheme } from '@shared/interfaces/IRegistersScheme';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { FieldMask } from '@shared/utilities/fieldMask';
import { Utilities } from '@shared/utilities/utilities';
import { ProductsSelectorComponent } from '@pages/stock/products/components/selector/selector.component';

@Component({
  selector: 'schemes-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class SchemesRegisterComponent implements OnInit {

  @Output() public callback: EventEmitter<any> = new EventEmitter(); 

  public formScheme: FormGroup;
  public translate: any;
  public settings: any = {};
  public data: any = {};
  public checkBootstrap: boolean = false;

  private layerComponent: any;

  constructor(
    private formBuilder: FormBuilder,
    private schemesService: SchemesService
  ) {}

  public ngOnInit() {

    this.translate = SchemesTranslate.get()['modal']['action']['register'];

    this.callback.emit({ instance: this });
  }

  // Getter and Setter Methods

  public get formControls() {
    return this.formScheme.controls;
  }

  // Initialize Method

  public bootstrap(settings: any = {}) {

    this.settings = Utilities.deepClone(settings);
    this.settings.data = (this.settings.data ?? {});
    this.data = this.settings.data;

    if(this.data.products?.length){
      const timer = setInterval(()=>{
        if(ProductsSelectorComponent.shared){
          clearInterval(timer);
          ProductsSelectorComponent.shared.selectProducts(this.data.products || []);
        }
      }, 0);
    }


    this.formSettings(this.settings.data);
    this.checkBootstrap = true;
  }

  // User Interface Actions   

  public onQuickSearch(input: any) {

    const value = $$(input).val();

    if (value != '') {
      
      Utilities.loading();
  
      ProductsSelectorComponent.shared.onSearch({
        where: [
          { field: 'code', operator: '=', value: parseInt(value) }
        ]
      }, true, false).then(() => {
        $$('.container-products .quick-search input').val('');
        Utilities.loading(false);
      });
    }
  }

  public onDeleteProductItem(index: number) {

    ProductsSelectorComponent.shared.onDeselectProduct(this.data.products[index]);
  } 

  public onSubmit() {

    if(this.checkSubmit()){ return; }
    
    const formData = this.formScheme.value;
    const source = this.settings.data;

    const data: IRegistersScheme = {
      _id: source._id,
      code: source.code,
      name: Utilities.clearSpaces(formData.name).toUpperCase(),
      quantity: parseInt(formData.quantity || 1),
      products: []
    };

    if(this.data.products){
      this.data.products.forEach(prod => {
        const obj: any = {
          _id: prod._id,
          code: prod.code,
          name: prod.name,
          costPrice: prod.costPrice,
          salePrice: prod.salePrice,
          unitaryPrice: prod.unitaryPrice || prod.salePrice,
          quantity: parseInt(prod.selectedItems)
        };

        data.products.push(obj);
      });
    }

    this.schemesService.registerScheme(data).then(() => {
      this.callback.emit({ data: data, close: true });
    }).catch(()=>{
      this.checkSubmit(false)
    })
  }

  // Layer Actions

  public onOpenLayer(type: string) {

    this.layerComponent.onOpen({
      activeComponent: type
    });
  }

  // Event Listeners

  public onLayerResponse(event: any) {

    if (event.instance) {
      this.layerComponent = event.instance;
    }

    if (event.products) {
      this.data.products = event.products;
    }
  }

   // Mask Methods

   public onApplyPrice(data: any, inputField: any) {

    const value = FieldMask.priceFieldMask(inputField.value);

    data.unitaryPrice = (parseFloat(value.replace(/\./g,'').replace(',','.')) || 0);
    inputField.value = value;
  }
  
  public onApplyQuantity(data: any, inputField: any) {

    const value = inputField.value;
    const quantity = FieldMask.numberFieldMask(value, 1);

    inputField.value = quantity;
    data.selectedItems = quantity;    
  }

   public onApplyNumberMask(event: Event, formControl: FormControl = null) {

    const value = (FieldMask.numberFieldMask($$(event.currentTarget).val(), null, null, true));

    $$(event.currentTarget).val(value);

    if(formControl){
      formControl.patchValue(value);
    }

  }

  // Auxiliary Methods

  private formSettings(data: any = {}) {

    this.formScheme = this.formBuilder.group({
      code: [(data.code ?? '')],
      name: [(data.name || ''), [ Validators.required ]],
      quantity: [(data.quantity || 1), [ Validators.required ]],
    });
  }

  private checkSubmit(value?: any){

    if(value != undefined){
      (<any>this).settings._isSubmited = value;
      return !!value;
    }

    if((<any>this).settings._isSubmited){ return true; }
    (<any>this).settings._isSubmited = true;
    return false;
  }
}
