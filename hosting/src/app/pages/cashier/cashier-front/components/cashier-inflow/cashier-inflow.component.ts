import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';

// Services
import { CashierFrontInflowService } from './cashier-inflow.service';
import { CashierInflowCategoriesService } from '../../../../registers/_aggregates/cashier/cashier-inflow-categories/cashier-inflow-categories.service';

// Translate
import { CashierFrontInflowTranslate } from './cashier-inflow.translate';

// Interfaces
import { ECashierInflowStatus, ICashierInflow } from '@shared/interfaces/ICashierInflow';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { FieldMask } from '@shared/utilities/fieldMask';

@Component({
  selector: 'cashier-front-inflow',
  templateUrl: './cashier-inflow.component.html',
  styleUrls: ['./cashier-inflow.component.scss']
})
export class CashierFrontInflowComponent implements OnInit, OnDestroy {

  @Output() callback: EventEmitter<any> = new EventEmitter();

  public static shared: CashierFrontInflowComponent;

  public translate = CashierFrontInflowTranslate.get();
    
  public loading: boolean = true;
  public settings: any = {};
  public categories: any = [];
  
  public formCashierInflow: FormGroup;

  private modalComponent: any;
  private layerComponent: any;

  constructor(
    private formBuilder: FormBuilder,
    private cashierFrontInflowService: CashierFrontInflowService,
    private cashierInflowCategoriesService: CashierInflowCategoriesService
  ) {
    CashierFrontInflowComponent.shared = this;
  }

  public ngOnInit() {
    this.formSettings(); 
    this.callback.emit({ instance: this });
  }

  public bootstrap() {

    this.loading = true;
    
    this.cashierInflowCategoriesService.getCategories('CashierFrontInflowComponent', (data) => {

      const arrData = [];

      $$(data).map((_, item) => { // Temporary
        if (String(item.code).search('@') == -1) {
          arrData.push(item);
        }
      });

      this.categories = arrData;
      this.loading = false;
    });     
  }

  // Getter and Setter Methods

  public get formControls() {
    return this.formCashierInflow.controls;
  }

  // User Interface Actions
  
  public onSubmit() {

    const formData = this.formCashierInflow.value;

    const data: ICashierInflow = {
      category: ((): ICashierInflow['category'] => {

        let category = Utilities.parseArrayToObject(this.categories, 'code');       
        category = category[formData.category];
        
        return {
          _id: category._id, code: category.code, name: category.name 
        };
      })(),
      value: (() => {
        return parseFloat(formData.value.replace(/\./g,'').replace(',','.'));
      })(),
      note: formData.note,
      status: ECashierInflowStatus.CONCLUDED
    };

    this.cashierFrontInflowService.registerInflow(data).then(() => {
      this.onCloseModal();
    });
  }

  // Modal Actions

  public onOpenModal(settings: any = {}) {

    this.bootstrap();

    this.settings = settings; 

    this.modalComponent.onOpen({ title: this.translate.modalTitle, mode: 'fullscreen' });
  }

  public onCloseModal() {

    if (this.layerComponent) {
      this.layerComponent.onClose();
    }

    this.formSettings();
  }

  // Layer Actions
  
  public onOpenLayer() {

    this.layerComponent.onOpen({
      activeComponent: 'categories',
      selectedItem: { 
        code: this.formControls.category.value
      }
    });
  }

  // Event Listeners

  public onModalResponse(event: any) {

    if (event.instance) {
      this.modalComponent = event.instance;
    }

    if (event.close) {
      this.onCloseModal();    
    }
  }

  public onLayerResponse(event: any) {

    if (event.instance) {
      this.layerComponent = event.instance;
    }

    if (event.category) {
      this.formControls.category.setValue(event.category.code);
    }
  }

  // Auxiliary Methods

  public onApplyPriceMask(event: Event, control: AbstractControl) {
    control.setValue(FieldMask.priceFieldMask($$(event.target)[0].value));
  }

  private formSettings() {

    this.formCashierInflow = this.formBuilder.group({
      category: ['', Validators.required ],
      value: ['', Validators.required ],
      note: ['']
    });  
  }

  // Destruction Method

  public ngOnDestroy() {
    this.cashierInflowCategoriesService.removeListeners();
  }

}
