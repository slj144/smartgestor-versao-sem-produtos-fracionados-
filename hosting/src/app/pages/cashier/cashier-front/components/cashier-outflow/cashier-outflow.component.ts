import { Component, EventEmitter, Output, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';

// Services
import { CashierFrontOutflowService } from './cashier-outflow.service';
import { CashierOutflowCategoriesService } from '../../../../registers/_aggregates/cashier/cashier-outflow-categories/cashier-outflow-categories.service';

// Translate
import { CashierFrontOutflowTranslate } from './cashier-outflow.translate';

// Interfaces
import { ECashierOutflowStatus, ICashierOutflow } from '@shared/interfaces/ICashierOutflow';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { FieldMask } from '@shared/utilities/fieldMask';

@Component({
  selector: 'cashier-front-outflow',
  templateUrl: './cashier-outflow.component.html',
  styleUrls: ['./cashier-outflow.component.scss']
})
export class CashierFrontOutflowComponent implements OnInit, OnDestroy {

  @Output() callback: EventEmitter<any> = new EventEmitter();

  @ViewChild('modal', { static: false }) modal: ElementRef;

  public static shared: CashierFrontOutflowComponent;

  public translate = CashierFrontOutflowTranslate.get();

  public loading: boolean = true;
  public settings: any = {};
  public categories: any = [];
  public formCashierOutflow: FormGroup; 

  private modalComponent: any;
  private layerComponent: any;

  constructor(
    private formBuilder: FormBuilder,
    private cashierFrontOutflowService: CashierFrontOutflowService,
    private cashierOutflowCategoriesService: CashierOutflowCategoriesService
  ) {
    CashierFrontOutflowComponent.shared = this;
  }

  public ngOnInit() {
    this.formSettings(); 
    this.callback.emit({ instance: this });
  }

  public bootstrap() {

    this.loading = true;
    
    this.cashierOutflowCategoriesService.getCategories('CashierFrontOutflowComponent', (data) => {

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
    return this.formCashierOutflow.controls;
  }

  // User Interface Actions
  
  public onSubmit() {

    const formData = this.formCashierOutflow.value;

    const data: ICashierOutflow = {
      category: (() => {

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
      status: ECashierOutflowStatus.CONCLUDED
    };

    this.cashierFrontOutflowService.registerOutflow(data).then(() => {      
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

    this.formCashierOutflow = this.formBuilder.group({
      category: ['', Validators.required ],
      value: ['', Validators.required ],
      note: ['']
    });
  }

  // Destruction Method

  public ngOnDestroy() {
    this.cashierOutflowCategoriesService.removeListeners('records', 'CashierFrontOutflowComponent');
  }

}
