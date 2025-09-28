import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

// Settings
import { FiltersTranslate } from './filters.translate';

// Types
import { filter } from '../../types/filter';

// Utilities
import { $$ } from '../../utilities/essential';
import { FieldMask } from '../../utilities/fieldMask';
import { DateTime } from '../../utilities/dateTime';

@Component({
  selector: 'filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit {

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  public static shared: FiltersComponent;

  public settings: any = {};
  public activeFilters: filter[] = [];
  public selectedOption: any;
  public toastSettings: any = {};

  public formFilter: FormGroup;

  constructor(
    private formBuilder: FormBuilder
  ) {
    FiltersComponent.shared = this;
  }

  public ngOnInit() {    
    this.callback.emit({ instance: this });
  }

  public bootstrap(settings: any = {}) {
    this.settings = settings;
    this.formSettings();
  }

  // Getters and Setters Methods

  public get translate() {
    return FiltersTranslate.get();
  }
  
  public get formControls() {
    return this.formFilter.controls;
  }

  // User Interface Actions

  public onAtiveOption(data: any, optionIndex: number = null) {

    $$(this.settings.fields).map((_, item) => {

      item.checked = false;      

      if (item.options) {

        item.collapsed = false;

        $$(item.options).map((_, option) => {
          option.checked = false;
        });     
      }

      this.selectedOption = null;
    });

    data.checked = true;    

    if (data.options) {

      data.collapsed = true;

      if (optionIndex != null) {

        const option = data.options[optionIndex];
        option.checked = true;

        this.selectedOption = option;
      }      
    } else {
      this.selectedOption = data;
    }    
  }

  public onAddFilter() {

    const data = this.formFilter.value;
    const option = this.selectedOption;

    const obj: any = {
      filter: {},
      info: {
        label: (option.path || option.label), 
        value: (() => {

          if ((option.type == 'text') || (option.type == 'date')) {

            if (option.combination == 'partial') {
              data.operator = 'like';
            } else if (option.combination == 'full') {
              data.operator = '=';
            }
            return data.value;
          } else if ((option.type == 'number/integer') || (option.type == 'number/float')) {

            let value = '';

            switch (data.operator) {
              case '<=': value = `<=${data.value}`; break;
              case '<': value = `<${data.value}`; break;
              case '=': value = `=${data.value}`; break;
              case '>': value = `>${data.value}`; break;
              case '>=': value = `>=${data.value}`; break;
            }

            return value;
          } else if (option.type == 'select') {

            let value = '';

            $$(option.list).map((_, item) => {
              if (item.value == data.value) {
                value = item.label;
                return true;
              }
            });

            return value;
          }else if ((option.type == 'phone')) {
            if (option.combination == 'partial' && data.value.length >= 4) {
              data.operator = 'like';
            } else {
              data.operator = '=';
            }
          } else {
            return data.value;
          }
        })()
      },      
      settings: {
        combination: option.combination,
        type: option.type
      }
    };
    
    obj.filter[option.property] = (() => {

      if (option.type == 'number/integer') {
        return parseInt(data.value);
      } else if (option.type == 'number/float') {
        return parseFloat(String(data.value).replace(/\./g,'').replace(',','.'));
      } else if (option.type == 'date') {

        const date = data.value;
        const slice = date.split('/').slice('-');

        if (slice.length == 3) {
          return DateTime.formatDate(date).date;
        } else {
          return (slice[1] <= 12 ? `${slice[1]}-${slice[0]}` : `${slice[0]}-${slice[1]}`);
        }        
      } else {
        return data.value;
      }
    })();

    if (data.operator) {
      obj.settings.operator = data.operator;
    }
    
    if (option.nested) {
      obj.settings.nested = true;
    }

    this.activeFilters.push(obj);
    this.onCloseToast();

    this.settings.callback(this.activeFilters);
  }

  public onRemoveFilter(index: number) {
    this.activeFilters.splice(index, 1);
    this.settings.callback(this.activeFilters);
  } 

  // Toast Actions 

  public onOpenToast(event: Event, action: string, data: any = {}) {
    
    event.stopPropagation();

    $$('.container-floating-overlay').css({ display: 'block' }).animate({ opacity: 1 }, { duration: 1000 });

    this.toastSettings.title = (() => {
      return (action == 'add' ? 'Adicionar Filtro' : (action == 'edit' ? 'Editar Filtro' : ''));
    })();
    
    this.toastSettings.action = action;
    this.toastSettings.data = data;

    this.formSettings();
  }

  public onCloseToast() {

    $$('.container-floating-overlay').animate({ opacity: 0 }, { duration: 1000, complete: () => {
      $$('.container-floating-overlay').css({ display: 'none' });
    }});

    this.toastSettings.action = null;
    this.formSettings();
  }

  // Mask methods
  
  public onApplyDateMask(event: Event, control: AbstractControl) {
    control.setValue(FieldMask.dateFieldMask($$(event.target)[0].value));
  }
  
  public onApplyNumberMask(event: Event, control: AbstractControl) {
    control.setValue(FieldMask.numberFieldMask($$(event.target)[0].value));
  }
  
  public onApplyPriceMask(event: Event, control: AbstractControl) {
    control.setValue(FieldMask.priceFieldMask($$(event.target)[0].value));
  }

  public onApplyCPFMask(event: Event, control: AbstractControl) {
    control.setValue(FieldMask.cpfFieldMask($$(event.target)[0].value));
  }

  public onApplyCNPJMask(event: Event, control: AbstractControl) {
    control.setValue(FieldMask.cnpjFieldMask($$(event.target)[0].value));
  }

  public onApplyPhoneMask(event: Event, control: AbstractControl) {
    control.setValue(FieldMask.phoneFieldMask($$(event.target)[0].value));
  }

  // Auxiliary methods

  private formSettings() {

    this.formFilter = this.formBuilder.group({
      operator: ['=', Validators.required],
      value: ['', Validators.required]
    });
  }

}
