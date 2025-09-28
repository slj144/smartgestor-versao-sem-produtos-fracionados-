import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { iTools } from '../../../../../../../../../../assets/tools/iTools';

// Services
import { ProductsService } from '../../../../../../products.service';
import { StockAjustmentTypesService } from '../../../../../../../../registers/_aggregates/stock/stock-adjustment-types/stock-adjustment-types.service';

// Interfaces
import { EStockLogOperation, EStockLogAction, IStockLog } from '@shared/interfaces/IStockLog';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { FieldMask } from '@shared/utilities/fieldMask';
import { Utilities } from '@shared/utilities/utilities';

@Component({
  selector: 'stock-adjustment-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class StockAdjustmentRegisterComponent implements OnInit, OnDestroy {

  @Output() public callback: EventEmitter<any> = new EventEmitter();
 
  public loading: boolean = true;
  public settings: any = {};

  public adjustmentForm: FormGroup;

  public productData: any;
  public adjustmentTypes: any = []; 
  public checkTypes: boolean = false;

  private layerComponent: any;

  constructor(
    private formBuilder: FormBuilder, 
    private productsService: ProductsService,
    private stockAjustmentTypesService: StockAjustmentTypesService    
  ) {}

  public ngOnInit() {

    this.stockAjustmentTypesService.getTypes('StockAdjustmentRegisterComponent', (data) => {

      if (this.layerComponent) {
        this.layerComponent.adjustmentTypes = data;
      }

      this.adjustmentTypes = data;
      this.checkTypes = true;
    });

    this.callback.emit({ instance: this });
  }

  // Getters and Setters Methods

  public get formControls() {
    return this.adjustmentForm.controls;
  }

  // Initialize Method

  public bootstrap(settings: any = {}) {

    this.loading = true;

    let processPeding = 0;   

    const timer = setInterval(() => {

      if (processPeding == 0) {
        clearInterval(timer);

        this.loading = false;
        this.settings = settings;

        this.formSettings(settings);
      }
    }, 200);
  }

  // User Interface Actions

  public onSearchProduct(code: string) {

    this.productsService.query([
      { field: 'code', operator: '=', value: parseInt(code) }
    ], false, false, false, false).then((data) => {
     
      let productFound: boolean = false;

      if (data.length > 0){
        this.productData = data[0];
        productFound = true;
      }

      if (!productFound) {
        this.productData = null;
      }
    });
  }

  public onSubmit() {
    
    const formData: any = this.adjustmentForm.value;

    const data: any = {
      _id: this.productData._id,
      code: this.productData.code,
      stockAdjustment: ((): IStockLog => {

        const adjustmentType = (() => {

          let data: any = {};

          $$(this.adjustmentTypes).map((_, item) => {
            if (item.code == formData.type) {
              data = { _id: item._id, code: item.code, name: item.name };
            }
          });

          return data;
        })();

        const info: IStockLog = {
          data: [{
            referenceCode: parseInt(this.productData.code),
            adjustmentType: adjustmentType,
            quantity: parseInt(formData.quantity),
            operation: formData.operation,
            note: formData.note
          }]
        };

        return info;
      })()
    }; 

    if (Utilities.isMatrix){
      data.quantity = iTools.FieldValue.inc(formData.operation == EStockLogOperation.INPUT ? formData.quantity : (formData.quantity * -1));
    }else{
      const branches: any = {};
      branches[Utilities.storeID] = {quantity: iTools.FieldValue.inc(formData.operation == EStockLogOperation.INPUT ? formData.quantity : (formData.quantity * -1))}
      data.branches = branches;
    }

    this.productsService.registerProducts([data], null, {action: EStockLogAction.ADJUSTMENT}).then(() => {
      this.productData = null;
      this.callback.emit({ close: true });
    });
  }

  // Layer Actions

  public onOpenLayer(type: string) {

    let title = '';
    let selectedItem = '';

    switch (type) {
      case 'AdjustmentTypes':
        title = 'Tipos';
        selectedItem = this.formControls.type.value;
        break;      
    }

    this.layerComponent.adjustmentTypes = this.adjustmentTypes;
    this.layerComponent.onOpen({ title, activeComponent: type, selectedItem });

    this.callback.emit({ headerVisibility: 'hidden' });
  }

  // Event Listeners

  public onLayerResponse(event: any) {

    if (event.instance) {
      this.layerComponent = event.instance;
    }    

    if (event.shutdown) {

      const selectedItem = (event.selectedItem || '');

      if (event.type == 'AdjustmentTypes') {
        this.formControls.type.setValue(selectedItem);
      }

      this.callback.emit({ headerVisibility: 'visible' });
    }
  }

  // Auxiliary Methods

  public onApplyNumberMask(event: Event, control: AbstractControl) {
    control.setValue(FieldMask.numberFieldMask($$(event.target)[0].value, 1));
  }

  private formSettings(data: any) {

    this.adjustmentForm = this.formBuilder.group({
      productCode: [(data.productCode || ''), Validators.required],
      operation: [(data.operation || 'INPUT'), Validators.required],
      quantity: [(data.quantity || 1), Validators.required],
      type: [(data.type || ''), Validators.required],
      note: [(data.note || ''), Validators.required]
    });
  } 

  // Auxiliary Methods

  public resetComponent() {
    this.productData = null;
  }
  
  // Destruction Method

  public ngOnDestroy() {
    this.stockAjustmentTypesService.removeListeners('records', 'StockAdjustmentRegisterComponent');
  }

}
