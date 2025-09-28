import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, Input } from '@angular/core';

// Services
import { CustomersService } from '../../../../registers/customers/customers.service';

// Translate
import { CustomerSelectorTranslate } from './selector.translate';

// Interfaces
import { IRegistersCustomer } from '@shared/interfaces/IRegistersCustomer';

// Types
import { query } from '@shared/types/query';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { FieldMask } from '@shared/utilities/fieldMask';

@Component({
  selector: 'customers-selector',
  templateUrl: './selector.component.html',
  styleUrls: ['./selector.component.scss']
})
export class CustomersSelectorComponent implements OnInit {

  @Output() callback: EventEmitter<any> = new EventEmitter();
  @Input() defaultAddress: boolean = false;
  @ViewChild('searchBar', { static: true }) searchBar: ElementRef;

  public static shared: CustomersSelectorComponent;

  public translate = CustomerSelectorTranslate.get();

  public loading: boolean = false;  
  public settings: any = {};
  public filtersBadge: number = 0;
  public recordsData: any = [];
  public searchText: string = '';
  public searchBy: string = 'name';

  private toastComponent: any;
  private registerComponent: any;

  constructor(
    private customersService: CustomersService
  ) {
    CustomersSelectorComponent.shared = this;
  } 

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }
  
  // Initialize Method

  public bootstrap() {
    $$(this.searchBar.nativeElement).find('input')[0].focus();
  }

  // User Interface Actions - Filters

  public onFilter() {

  }

  public onSearch() {

    const value = $$(this.searchBar.nativeElement).find('input').val().trim().toLowerCase();


    if (value != '') {

      const settings: query = { where: [] };
      
      if (this.searchBy == 'NAME') {
        settings.where.push({ field: 'name', operator: 'like', value: new RegExp(value, 'gi') });
      }

      if (this.searchBy == 'CODE') {
        settings.where.push({ field: 'code', operator: '=', value: parseInt(value) });
      }

      if (this.searchBy == 'CPF') {
        settings.where.push({ field: 'personalDocument.value', operator: '=', value: value });
      }

      if (this.searchBy == 'CNPJ') {
        settings.where.push({ field: 'businessDocument.value', operator: '=', value: value });
      }

      this.loading = true;

      this.customersService.query(settings.where, false, false, false, false).then((data) => {

        $$(data).map((_, item) => {
          if (item.address) {
            item.addressCustom = `${item.address.local ? (item.address.local + ' ') : ''}${item.address.number ? ('Nº ' + item.address.number) : ''}${item.address.complement ? (' ' + item.address.complement) : ''}${item.address.neighborhood ? (', ' + item.address.neighborhood) : ''}${item.address.city ? (', ' + item.address.city) : ''}${item.address.state ? (' - ' + item.address.state) : ''}`;
          }
        });

        this.recordsData = data;
        this.searchText = value;
  
        this.loading = false;
      }).catch(() => {
        this.reset();
      });
    } else {
      this.reset();
    }   
  }

  public onCheckSearchBar(value: string) {

    value = value.replace(/\.|\/|\-/g,'');
    
    if (!isNaN(parseInt(value))) {

      if (value.length < 11) {
        this.searchBy = 'CODE';
      }

      if (value.length == 11) {
        $$(this.searchBar.nativeElement).find('input').val(FieldMask.cpfFieldMask(value));
        this.searchBy = 'CPF';
      }

      if (value.length >= 12 && value.length <= 14) {
        $$(this.searchBar.nativeElement).find('input').val(FieldMask.cnpjFieldMask(value));
        this.searchBy = 'CNPJ';
      }

      if (value.length > 14) {
        $$(this.searchBar.nativeElement).find('input').val(value);
        this.searchBy = 'NAME';
      }
    }
    
    if (isNaN(parseInt(value))) {
      this.searchBy = 'NAME';
    }    


    // console.log("okkkk");
    //   console.log(this.searchBy);


  }
  
  // User Interface Actions - Common

  public onResetSearchBar() {
    
    this.recordsData = [];
    this.searchText = '';

    $$(this.searchBar.nativeElement).find('input').val('');    
  }

  public onRegisterCustomer(data: any = null) {

    data = data || {};

    if (!data.code){

      if (this.searchBy == "NAME"){
        data.name = this.searchText;
      }
  
      if (this.searchBy == "CPF"){
        data.personalDocument = {type: "CPF", value: this.searchText};
      }
      
      if (this.searchBy == "CNPJ"){
        data.businessDocument = {type: "CNPJ", value: this.searchText};
      }
    }

    const settings: any = {
      title: data.code ? this.translate.toast.update.title : this.translate.toast.register.title,
      type: data.code ? "edit" : 'add',
      data: Utilities.deepClone(data)
    };

    const timer = setInterval(() => {
      if (this.registerComponent) {
        this.registerComponent.bootstrap({ data });
        clearInterval(timer);
      }
    }, 0);

    this.toastComponent.onOpen(settings);
  }

  public onSelectCustomer(data: any) {

    if (data.address) {

      if (this.defaultAddress){
        data.addressCustom = data.addressCustom;
      }else{
        data.address = data.addressCustom;
      }
    }

    this.onResetSearchBar();
    this.callback.emit({ instance: this, data: data, close: true });

    setTimeout(() => { this.reset() }, 800);
  }

  // Event Listeners

  public onToastResponse(event: any) {

    if (event.instance) {
      this.toastComponent = event.instance;
    }
  }
  
  public onRegisterResponse(event: any) {

    if (event.instance) {
      this.registerComponent = event.instance;
    }

    if (event.data) {
      this.onSearch();
    }

    if (event.close) {
      this.toastComponent.onClose();
    }
  }
  
  // Utility Methods

  public reset() {
    this.recordsData = [];
    this.searchText = '';
  }

  // Destruction Methods

  public ngOnDestroy() {

    this.settings = {};
    this.filtersBadge = 0;
    this.recordsData = [];
    this.searchText = '';

    this.toastComponent = null;
  }

}
