import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';

// Components
import { FiltersComponent } from '@shared/components/filters/filters.component';

// Services
import { SeveralReportsService } from './several.service';

// Translate
import { SeveralReportsTranslate } from './several.translate';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { DateTime } from '@shared/utilities/dateTime';

@Component({
  selector: 'several-report',
  templateUrl: './several.component.html',
  styleUrls: ['./several.component.scss']
})
export class SeveralReportsComponent implements OnInit {

  @Output() callback: EventEmitter<any> = new EventEmitter();
  @Input() settings: any = {};

  public translate = SeveralReportsTranslate.get();

  public loading: boolean = true;
  public typeActived: string = '';
  public filtersData: any = [];

  public formFilters: FormGroup;
  public formControls: any;

  public isMatrix = Utilities.isMatrix;

  private modalComponent: any;
  private layerComponent: any;

  constructor(
    private formBuilder: FormBuilder,
    private severalReportsService: SeveralReportsService
  ) {}

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // Initialize Method

  public bootstrap() {

    if (this.settings.model.id == 'systemLogs') {

      const translate = this.translate.systemLogs

      this.settings['fields'] = {
        default: [
          { label: translate.fields['default'].code.external, field: 'code', disabled: this.checkPermissions('default', 'code') },
          { label: translate.fields['default'].referenceCode.external, field: 'referenceCode', disabled: this.checkPermissions('default', 'referenceCode') },
          { label: translate.fields['default'].collaborator.external, field: 'collaborator', disabled: this.checkPermissions('default', 'collaborator') },
          { label: translate.fields['default'].origin.external, field: 'origin', disabled: this.checkPermissions('default', 'origin') },
          { label: translate.fields['default'].description.external, field: 'description', disabled: this.checkPermissions('default', 'description') },
          { label: translate.fields['default'].action.external, field: 'action', disabled: this.checkPermissions('default', 'action') }
        ]
      };
    }   

    this.formSettings();

    setTimeout(() => { this.loading = false }, 1000);
  }

  // User Interface Actions 
  
  public onTypesChange(id: string) {
    this.typeActived = id;
    this.toggleFields();
  }

  public onGenerateReport() {
    
    this.loading = true;

    const model = this.settings.model; 
    const filter = this.captureFilters();

    const where: any = [
      { field: 'registerDate', operator: '>=', value: filter.period.start },
      { field: 'registerDate', operator: '<=', value: filter.period.end },
      { field: 'owner', operator: '=', value: filter.store._id }
    ];

    if (!Utilities.isAdmin && this.checkPermissions(this.typeActived, null, "filterDataPerOperator")){
      where.push({ field: 'operator.username', operator: '=', value: Utilities.operator.username })
    }

    if (model.id == 'systemLogs') {

      this.severalReportsService.getSystemLogs({
        where: where,
        orderBy: { code: -1 }
      }).then((data) => {
        this.launchReport('Logs do Sistema', model, filter, data);
      });
    }     
  }

  // Filter Actions

  public onAddFilter(event: any) {

    let fieldSet = [];

    this.modalComponent.onOpen({
      title: 'Filtros',
      activeComponent: 'SeveralReports/Filters',
      fields: fieldSet,
      callback: (filters: any[]) => {
        this.filtersData = filters;
      }
    });
  }

  public onRemoveFilter(index: number) {
    FiltersComponent.shared.onRemoveFilter(index);
  }

  // Event Listeners

  public onModalResponse(event: any) {

    if (event.instance) {
      this.modalComponent = event.instance;      
    }   
  }

  // Event Listeners

  public onLayerResponse(event: any) {

    if (event.instance) {
      this.layerComponent = event.instance;
    }   
  }
  
  // Setting Methods

  private formSettings() {

    this.typeActived = '';

    this.formFilters = this.formBuilder.group({
      store: [Utilities.storeID],
      period: ['today'],
      startDate: [`${DateTime.getCurrentYear()}-${DateTime.getCurrentMonth()}-01`],
      endDate: [`${DateTime.getCurrentYear()}-${DateTime.getCurrentMonth()}-${DateTime.getCurrentDay()}`],
      fields: this.formBuilder.array([])
    });
    
    if (this.settings.types) {
      this.typeActived = this.settings.types[0].id;
      this.formFilters.addControl('types', new FormControl(this.settings.types[0].id, Validators.required));
    }
    
    if (this.typeActived == '' && this.settings.fields['default']) {
      this.typeActived = 'default';
    }

    this.formControls = this.formFilters.controls;

    this.toggleFields();
  }

  // Utility Methods

  private checkPermissions(type: string, field: string = null, action = null){

    if (!action) {
      return (this.settings.permissions && this.settings.permissions[type] ? (this.settings.permissions[type].fields.indexOf(field) == -1) : false);
    } else {

      if (Utilities.isAdmin) {
        return false;
      }

      return (this.settings.permissions && this.settings.permissions[type] && this.settings.permissions[type].actions ? this.settings.permissions[type].actions.includes(action) : false);
    }
    
  }

  private launchReport(title: string, model: any, filter: any, data: any) {

    this.layerComponent.onOpen({
      id: model.id,
      title: title,
      store: filter.store,
      download: this.settings.model.download,
      period: {
        start: filter.period.start,
        end: filter.period.end
      },
      type: this.typeActived,
      fields: filter.fields,
      data: data,
      date: DateTime.formatDate(DateTime.getDateObject().toISOString(), 'string')
    });

    setTimeout(() => this.loading = false, 500);
  }

  private captureFilters() {

    const filter = this.formFilters.value;

    filter.store = (() => {
    
      const store = (this.isMatrix ? filter.store : Utilities.storeID);

      for (const item of this.settings.stores) {
        if (item._id == store) {
          return item;
        }
      }
    })();

    filter.period = (() => {

      let period: any = {};
      let startDate: string = '';
      let endDate: string = '';

      if (filter.period == 'today') {
        startDate = DateTime.getDate('D');
        endDate = DateTime.getDate('D');
      }
      else if (filter.period == 'currentWeek') {
        startDate = DateTime.formatDate(DateTime.getStartWeek(new Date(DateTime.getDate())).toISOString()).date;
        endDate = DateTime.formatDate(DateTime.getEndWeek(new Date(DateTime.getDate())).toISOString()).date;
      }
      else if (filter.period == 'currentMonth') {
        startDate = `${DateTime.getCurrentYear()}-${DateTime.getCurrentMonth()}-01`;
        endDate = `${DateTime.getCurrentYear()}-${DateTime.getCurrentMonth()}-${DateTime.getCurrentDay()}`;
      }
      else if (filter.period == 'lastMonth') {

        let year = DateTime.getCurrentYear();
        let month = DateTime.getCurrentMonth();
        
        if (month == 1) {
          month = 12;
          year -= 1;
        }else{
          month = (parseInt(month.toString()) - 1) > 9 ? (parseInt(month.toString()) - 1) : `0${(parseInt(month.toString()) - 1)}`;
        }

        let lastDayOfMonth = (new Date(year, (<number>month), 0)).getDate();

        startDate = `${year}-${month}-01`;
        endDate = `${year}-${month}-${lastDayOfMonth}`;
      }

      period.start = (() => {
        const date = (filter.period == 'custom' ? filter.startDate : startDate);
        return DateTime.formatDate(date instanceof Date ? (<Date>date).toISOString() : date).date + ' 00:00:00';
      })();

      period.end = (() => {
        const date = (filter.period == 'custom' ? filter.endDate : endDate);
        return DateTime.formatDate(date instanceof Date ? (<Date>date).toISOString() : date).date + ' 23:59:59';
      })();

      delete filter.startDate;
      delete filter.endDate;

      return period;
    })();
    
    filter.fields = (() => {

      const arr = [];

      for (const i in filter.fields) {

        if (filter.fields[i]) {

          arr.push(this.settings.fields[this.typeActived][i].field);

          $$(this.settings.fields[this.typeActived][i].sub).map((_, item) => {
            if (!item.disabled) {
              arr.push(`${this.settings.fields[this.typeActived][i].field}/${item.field}`);
            }              
          });          
        }
      }

      return arr;
    })();

    return filter;
  }

  private toggleFields() {

    (this.formControls.fields as FormArray).clear();

    if (this.settings.fields && this.settings.fields[this.typeActived]) {

      for (const _ of this.settings.fields[this.typeActived]) {
        (this.formControls.fields as FormArray).push(new FormControl(true));
      }
    }    
  }

}
