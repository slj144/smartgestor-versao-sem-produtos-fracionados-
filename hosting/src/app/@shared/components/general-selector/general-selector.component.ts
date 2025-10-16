import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// Services
import { CashierInflowCategoriesService } from '@pages/registers/_aggregates/cashier/cashier-inflow-categories/cashier-inflow-categories.service';
import { CashierOutflowCategoriesService } from '@pages/registers/_aggregates/cashier/cashier-outflow-categories/cashier-outflow-categories.service';
import { ProductCategoriesService } from '@pages/registers/_aggregates/stock/product-categories/product-categories.service';
import { ProductCommercialUnitsService } from '@pages/registers/_aggregates/stock/product-commercial-units/product-commercial-units.service';
import { ProductDepartmentsService } from '@pages/registers/_aggregates/stock/product-departments/product-departments.service';
import { StockAjustmentTypesService } from '@pages/registers/_aggregates/stock/stock-adjustment-types/stock-adjustment-types.service';
import { BillsToPayCategoriesService } from '@pages/registers/_aggregates/financial/bills-to-pay-categories/bills-to-pay-categories.service';
import { BillsToReceiveCategoriesService } from '@pages/registers/_aggregates/financial/bills-to-receive-categories/bills-to-receive-categories.service';

// Translate
import { GeneralSelectorTranslate } from './general-selector.translate';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { Dispatch } from '@shared/utilities/dispatch';

@Component({
  selector: 'general-selector',
  templateUrl: './general-selector.component.html',
  styleUrls: ['./general-selector.component.scss']
})
export class GeneralSelectorComponent implements OnInit {

  @Output() callback: EventEmitter<any> = new EventEmitter();
  @ViewChild('searchBar', { static: true }) searchBar: ElementRef;

  public loading: boolean = true;  

  public settings: any = {};
  public toastSettings: any = {};

  public type: string = '';
  public recordsData: any = [];
  public searchData: any = [];
  public itemSelected: any = [];

  public formRegister: FormGroup;

  private toastComponent: any;

  constructor(
    private formBuilder: FormBuilder,
    private cashierInflowCategoriesService: CashierInflowCategoriesService,
    private cashierOutflowCategoriesService: CashierOutflowCategoriesService,
    private productCategoriesService: ProductCategoriesService,
    private productCommercialUnitsService: ProductCommercialUnitsService,
    private productDepartmentsService: ProductDepartmentsService,
    private stockAjustmentTypesService: StockAjustmentTypesService,
    private billsToPayCategoriesService: BillsToPayCategoriesService,
    private billsToReceiveCategoriesService: BillsToReceiveCategoriesService
  ) {} 

  public ngOnInit() {
    this.callback.emit({ instance: this });
  } 

  // Initialize Method

  public bootstrap(settings: any = {}) {

    this.loading = true;
    this.settings = Utilities.deepClone((settings || {}));

    const callback = (data) => {

      const dataModified = [];

      $$(data).map((_, item) => {
        if (!item._isDefault) {
          dataModified.push(item);
        }
      });

      this.recordsData = dataModified;
      
      if (this.settings.selectItem) {
        this.onSelectItem(this.settings.selectItem, true);
      }

      setTimeout(() => { this.loading = false }, 800);
    };

    if (this.settings.activeComponent == 'CashierInflow/Categories') {
      this.type = 'categories';
      this.cashierInflowCategoriesService.getCategories('GeneralSelectorComponent', callback);
    }

    if (this.settings.activeComponent == 'CashierOutflow/Categories') {
      this.type = 'categories';
      this.cashierOutflowCategoriesService.getCategories('GeneralSelectorComponent', callback);
    }

    if (this.settings.activeComponent == 'Products/Categories') {
      this.type = 'categories';
      this.productCategoriesService.getCategories('GeneralSelectorComponent', callback);
    }

    if (this.settings.activeComponent == 'Products/Departments') {
      this.type = 'departments';
      this.productDepartmentsService.getDepartments('GeneralSelectorComponent', callback);
    }

    if (this.settings.activeComponent == 'Products/CommercialUnits') {
      this.type = 'commercialUnits';
      this.productCommercialUnitsService.getUnits('GeneralSelectorComponent', callback);
    }

    if (this.settings.activeComponent == 'StockMovement/AdjustmentTypes') {
      this.type = 'adjustmentTypes';
      this.stockAjustmentTypesService.getTypes('GeneralSelectorComponent', callback);
    }

    if (this.settings.activeComponent == 'BillsToPay/Categories') {
      this.type = 'categories';
      this.billsToPayCategoriesService.getCategories('GeneralSelectorComponent', callback);
    }

    if (this.settings.activeComponent == 'BillsToReceive/Categories') {
      this.type = 'categories';
      this.billsToReceiveCategoriesService.getCategories('GeneralSelectorComponent', callback);
    }

  }

  // Getter and Setter Methods

  public get translate() {
    return GeneralSelectorTranslate.get();
  }

  // User Interface Actions - Filters

  public onSearch() {

    const value = $$(this.searchBar.nativeElement).find('input').val().toLowerCase();
    const searchResult = [];    

    if (value != '') {

      for (let item of this.recordsData) {
        
        if (
          String(item.code).toLowerCase().search(value) !== -1 || 
          String(item.name).toLowerCase().search(value) !== -1
        ) {
          searchResult.push(item);
        }
      }
    }
    
    this.searchData = searchResult;  
  }

  public onCheckSearchBar(value: string) {

    if (value == '') {
      setTimeout(() => { this.searchData = [] }, 1500);      
    }
  }

  // User Interface Actions - Common

  public onResetSearchBar() {
    $$(this.searchBar.nativeElement).find('input').val('');
    this.searchData = [];
  }

  public onSelectItem(data: any, preSelect: boolean = false) {
 
    let index = -1;

    for (let [key, value] of Object.entries(this.recordsData)) {

      const item = (<any>value);
      item.selected = false;

      if (item.code == data.code) {
        index = parseInt(key);
      }
    }

    if (index >= 0) {
      this.recordsData[index].selected = true;
      this.itemSelected = data;
    }

    if (!preSelect) {

      this.callback.emit({
        target: this.settings.activeComponent,
        data: data,
        close: true
      });
    }   
  }

  // User Interface Actions - Actions

  public onRegister() {

    const formData = this.formRegister.value;
    const source = this.toastSettings.data;

    const data: any = {
      _id: source._id,
      code: formData.code,
      name: formData.name
    };

    const callback = () => {
      this.onCloseToast();
    };

    if (this.settings.activeComponent == 'CashierInflow/Categories') {
      this.cashierInflowCategoriesService.registerCategory(data).then(callback);
    }

    if (this.settings.activeComponent == 'CashierOutflow/Categories') {
      this.cashierOutflowCategoriesService.registerCategory(data).then(callback);
    }

    if (this.settings.activeComponent == 'Products/Categories') {
      this.productCategoriesService.registerCategory(data).then(callback);
    }

    if (this.settings.activeComponent == 'Products/CommercialUnits') {
      this.productCommercialUnitsService.registerUnit(data).then(callback);
    }

    if (this.settings.activeComponent == 'Products/Departments') {
      this.productDepartmentsService.registerDepartment(data).then(callback);
    }

    if (this.settings.activeComponent == 'StockMovement/AdjustmentTypes') {
      this.stockAjustmentTypesService.registerType(data).then(callback);
    }

    if (this.settings.activeComponent == 'BillsToPay/Categories') {
      this.billsToPayCategoriesService.registerCategory(data).then(callback);
    }

    if (this.settings.activeComponent == 'BillsToReceive/Categories') {
      this.billsToReceiveCategoriesService.registerCategory(data).then(callback);
    }

  }

  public onDelete() {

    const data = this.toastSettings.data;

    const callback = () => {
      this.onCloseToast();
    };

    if (this.settings.activeComponent == 'CashierInflow/Categories') {
      this.cashierInflowCategoriesService.deleteCategory(data).then(callback);
    }

    if (this.settings.activeComponent == 'CashierOutflow/Categories') {
      this.cashierOutflowCategoriesService.deleteCategory(data).then(callback);
    }

    if (this.settings.activeComponent == 'Products/Categories') {
      this.productCategoriesService.deleteCategory(data).then(callback);
    }

    if (this.settings.activeComponent == 'Products/CommercialUnits') {
      this.productCommercialUnitsService.deleteUnit(data).then(callback);
    }

    if (this.settings.activeComponent == 'Products/Departments') {
      this.productDepartmentsService.deleteDepartment(data).then(callback);
    }

    if (this.settings.activeComponent == 'Products/StockAdjustmentType') {
      this.stockAjustmentTypesService.deleteType(data).then(callback);
    }

    if (this.settings.activeComponent == 'BillsToPay/Categories') {
      this.billsToPayCategoriesService.deleteCategory(data).then(callback);
    }

    if (this.settings.activeComponent == 'BillsToReceive/Categories') {
      this.billsToReceiveCategoriesService.deleteCategory(data).then(callback);
    }

  }

  // Toast Actions

  public onOpenToast(event: Event, action: string, data: any = {}) {

    event.stopPropagation();

    data = Utilities.deepClone(data || {});
    
    if ((action == 'register') || (action == 'update')) {
      this.formSettings(data);
    }   
    
    this.toastSettings = { action, data };
    this.toastComponent.onOpen();

    // Check when the translation changes

    this.checkTranslationChange();
  }

  public onCloseToast(standard: boolean = false) {

    if (!standard && this.toastComponent) {
      this.toastComponent.onClose();
    }

    if (this.formRegister) {
      this.formRegister.reset();
    }

    Dispatch.removeListeners('languageChange', 'GeneralSelectorComponent');
  }

  // Event Listeners

  public onToastResponse(event: any) {

    if (event.instance) {
      this.toastComponent = event.instance;
    }

    if (event.close) {
      this.onCloseToast(true);
    }
  }

  // Utility Methods

  public reset() {

    this.loading = true;
    this.recordsData = [];

    this.onResetSearchBar();
  }

  // Auxiliary Methods

  private checkTranslationChange() {

    const setTitle = () => {

      if (this.toastComponent) {

        if ((this.toastSettings.action == 'register') || (this.toastSettings.action == 'update')) {
          this.toastComponent.title = this.translate.toast.register.type[this.type].action[this.toastSettings.action].title;
        }
          
        if (this.toastSettings.action == 'delete') {
          this.toastComponent.title = this.translate.toast.delete.type[this.type].title;
        }
      }
    };   
      
    Dispatch.onLanguageChange('GeneralSelectorComponent', () => {
      setTitle();
    });
    
    setTitle();
  }

  // Setting methods

  private formSettings(data: any = {}) {

    this.formRegister = this.formBuilder.group({
      code: [data.code],
      name: [data.name, Validators.required]
    });
  }  

  // Destruction Methods

  public ngOnDestroy() {
    
    this.cashierInflowCategoriesService.removeListeners('records', 'GeneralSelectorComponent');
    this.cashierOutflowCategoriesService.removeListeners('records', 'GeneralSelectorComponent');
    this.productCategoriesService.removeListeners('records', 'GeneralSelectorComponent');
    this.productCommercialUnitsService.removeListeners('records', 'GeneralSelectorComponent');
    this.productDepartmentsService.removeListeners('records', 'GeneralSelectorComponent');
    this.stockAjustmentTypesService.removeListeners('records', 'GeneralSelectorComponent');
    this.billsToPayCategoriesService.removeListeners('records', 'GeneralSelectorComponent');
    this.billsToReceiveCategoriesService.removeListeners('records', 'GeneralSelectorComponent');

    Dispatch.removeListeners('languageChange', 'GeneralSelectorComponent');
  }

}
