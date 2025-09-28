import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';

// Components
import { FiltersComponent } from '@shared/components/filters/filters.component';

// Services
import { ServiceOrdersReportsService } from './serviceOrders.service';

// Translate
import { ServiceOrdersReportsTranslate } from './serviceOrders.translate';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { DateTime } from '@shared/utilities/dateTime';
import { CollaboratorsService } from '@pages/registers/collaborators/collaborators.service';

@Component({
  selector: 'service-orders-report',
  templateUrl: './serviceOrders.component.html',
  styleUrls: ['./serviceOrders.component.scss']
})
export class ServiceOrdersReportsComponent implements OnInit {  

  @Output() callback: EventEmitter<any> = new EventEmitter();
  @Input() settings: any = {};

  public translate = ServiceOrdersReportsTranslate.get();

  public loading: boolean = true;  
  public isAdmin: boolean = Utilities.isAdmin;
  public typeActived: string = '';
  public filtersData: any[] = [];

  public collaborators: any[] = [];

  public formFilters: FormGroup;
  public formControls: any;

  public isMatrix = Utilities.isMatrix;

  private modalComponent: any;
  private layerComponent: any;

  constructor(
    private formBuilder: FormBuilder,
    private serviceOrdersReportsService: ServiceOrdersReportsService,
    private collaboratorsService: CollaboratorsService
  ) {}

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // Initialize Method

  public bootstrap() {

    this.onGetCollaborators(Utilities.storeID);

    if (this.settings.model.id == 'resume') {

      const translate = this.translate.resume;

      this.settings.model.filter = {
        weekly: Utilities.isAdmin ? true : !!this.checkPermissions('default', null, "filterWeek"),
        monthly: Utilities.isAdmin ? true : !!this.checkPermissions('default', null, "filterMonth"),
        lastMonth: Utilities.isAdmin ? true : !!this.checkPermissions('default', null, "filterLastMonth"),
        custom: Utilities.isAdmin ? true : !!this.checkPermissions('default', null, "filterPersonalized")
      };
      
      this.settings['fields'] = {
        default: [
          { label: translate.fields['default'].servicesCosts.external, field: 'servicesCosts', disabled: this.checkPermissions('default', 'servicesCosts') },
          { label: translate.fields['default'].productsCosts.external, field: 'productsCosts', disabled: this.checkPermissions('default', 'productsCosts') },
          { label: translate.fields['default'].totalCosts.external, field: 'totalCosts', disabled: this.checkPermissions('default', 'totalCosts') },
          { label: translate.fields['default'].partialRevenue.external, field: 'partialRevenue', disabled: this.checkPermissions('default', 'partialRevenue') },
          { label: translate.fields['default'].finalRevenue.external, field: 'finalRevenue', disabled: this.checkPermissions('default', 'finalRevenue') }
        ]
      };
    }

    if (this.settings.model.id == 'internal') {

      const translate = this.translate.internal;


      this.settings['types'] = [
        { id: 'servicesInternalReportSynthetic', label: translate.types.servicesInternalReportSynthetic },
        { id: 'servicesInternalReportAnalytical', label: translate.types.servicesInternalReportAnalytical }
      ];

      this.settings.model.filter = {
        weekly: Utilities.isAdmin ? true : !!this.checkPermissions(this.settings['types'][0].id, null, "filterWeek"),
        monthly: Utilities.isAdmin ? true : !!this.checkPermissions(this.settings['types'][0].id, null, "filterMonth"),
        lastMonth: Utilities.isAdmin ? true : !!this.checkPermissions(this.settings['types'][0].id, null, "filterLastMonth"),
        custom: Utilities.isAdmin ? true : !!this.checkPermissions(this.settings['types'][0].id, null, "filterPersonalized")
      };

      this.settings['fields'] = {
        servicesInternalReportSynthetic: [
          { label: translate.fields['servicesInternalReportSynthetic'].servicesCosts.external, field: 'servicesCosts', disabled: this.checkPermissions('servicesInternalReportSynthetic', 'servicesCosts') },
          { label: translate.fields['servicesInternalReportSynthetic'].productsCosts.external, field: 'productsCosts', disabled: this.checkPermissions('servicesInternalReportSynthetic', 'productsCosts') },
          { label: translate.fields['servicesInternalReportSynthetic'].totalCosts.external, field: 'totalCosts', disabled: this.checkPermissions('servicesInternalReportSynthetic', 'totalCosts') },
          { label: translate.fields['servicesInternalReportSynthetic'].partialRevenue.external, field: 'partialRevenue', disabled: this.checkPermissions('servicesInternalReportSynthetic', 'partialRevenue') },
          { label: translate.fields['servicesInternalReportSynthetic'].finalRevenue.external, field: 'finalRevenue', disabled: this.checkPermissions('servicesInternalReportSynthetic', 'finalRevenue') }
        ],
        servicesInternalReportAnalytical: [
          { label: translate.fields['servicesInternalReportAnalytical'].collaborator.external, field: 'collaborator', disabled: this.checkPermissions('servicesInternalReportAnalytical', 'collaborator') },
          { label: translate.fields['servicesInternalReportAnalytical'].customer.external, field: 'customer', disabled: this.checkPermissions('servicesInternalReportAnalytical', 'customer') },
          { label: translate.fields['servicesInternalReportAnalytical'].services.external, field: 'services', sub: [
            { field: 'code', disabled: false },
            { field: 'name', disabled: false },
            { field: 'cost', disabled: !Utilities.isAdmin },
            { field: 'price', disabled: false },
            { field: 'discount', disabled: false },
            { field: 'fee', disabled: false }
          ], disabled: this.checkPermissions('servicesInternalReportAnalytical', 'services')},
          { label: translate.fields['servicesInternalReportAnalytical'].products.external, field: 'products', sub: [
            { field: 'code', disabled: false },
            { field: 'name', disabled: false },
            { field: 'quantity', disabled: false },
            { field: 'cost', disabled: !Utilities.isAdmin },
            { field: 'price', disabled: false },
            { field: 'discount', disabled: false },
            { field: 'fee', disabled: false }
          ], disabled: this.checkPermissions('servicesInternalReportAnalytical', 'products')},
          { label: translate.fields['servicesInternalReportAnalytical'].discount.external, field: 'discount', disabled: this.checkPermissions('servicesInternalReportAnalytical', 'discount') },
          { label: translate.fields['servicesInternalReportAnalytical'].fee.external, field: 'fee', disabled: this.checkPermissions('servicesInternalReportAnalytical', 'fee') },
          { label: translate.fields['servicesInternalReportAnalytical'].servicesCosts.external, field: 'servicesCosts', disabled: this.checkPermissions('servicesInternalReportAnalytical', 'servicesCosts') },
          { label: translate.fields['servicesInternalReportAnalytical'].productsCosts.external, field: 'productsCosts', disabled: this.checkPermissions('servicesInternalReportAnalytical', 'productsCosts') },
          { label: translate.fields['servicesInternalReportAnalytical'].totalCosts.external, field: 'totalCosts', disabled: this.checkPermissions('servicesInternalReportAnalytical', 'totalCosts') },
          { label: translate.fields['servicesInternalReportAnalytical'].partialRevenue.external, field: 'partialRevenue', disabled: this.checkPermissions('servicesInternalReportAnalytical', 'partialRevenue') },
          { label: translate.fields['servicesInternalReportAnalytical'].finalRevenue.external, field: 'finalRevenue', disabled: this.checkPermissions('servicesInternalReportAnalytical', 'finalRevenue') }
        ]
      };
    }

    if (this.settings.model.id == 'external') {

      const translate = this.translate.external;


      this.settings['types'] = [
        { id: 'servicesExternalReportSynthetic', label: translate.types.servicesExternalReportSynthetic },
        { id: 'servicesExternalReportAnalytical', label: translate.types.servicesExternalReportAnalytical }
      ];

      this.settings.model.filter = {
        weekly: Utilities.isAdmin ? true : !!this.checkPermissions(this.settings['types'][0].id, null, "filterWeek"),
        monthly: Utilities.isAdmin ? true : !!this.checkPermissions(this.settings['types'][0].id, null, "filterMonth"),
        lastMonth: Utilities.isAdmin ? true : !!this.checkPermissions(this.settings['types'][0].id, null, "filterLastMonth"),
        custom: Utilities.isAdmin ? true : !!this.checkPermissions(this.settings['types'][0].id, null, "filterPersonalized")
      };

      this.settings['fields'] = {
        servicesExternalReportSynthetic: [
          { label: translate.fields['servicesExternalReportSynthetic'].servicesCosts.external, field: 'servicesCosts', disabled: this.checkPermissions('servicesExternalReportSynthetic', 'servicesCosts') },
          { label: translate.fields['servicesExternalReportSynthetic'].productsCosts.external, field: 'productsCosts', disabled: this.checkPermissions('servicesExternalReportSynthetic', 'productsCosts') },
          { label: translate.fields['servicesExternalReportSynthetic'].totalCosts.external, field: 'totalCosts', disabled: this.checkPermissions('servicesExternalReportSynthetic', 'totalCosts') },
          { label: translate.fields['servicesExternalReportSynthetic'].partialRevenue.external, field: 'partialRevenue', disabled: this.checkPermissions('servicesExternalReportSynthetic', 'partialRevenue') },
          { label: translate.fields['servicesExternalReportSynthetic'].finalRevenue.external, field: 'finalRevenue', disabled: this.checkPermissions('servicesExternalReportSynthetic', 'finalRevenue') }
        ],
        servicesExternalReportAnalytical: [
          { label: translate.fields['servicesExternalReportAnalytical'].collaborator.external, field: 'collaborator', disabled: this.checkPermissions('servicesExternalReportAnalytical', 'collaborator') },
          { label: translate.fields['servicesExternalReportAnalytical'].customer.external, field: 'customer', disabled: this.checkPermissions('servicesExternalReportAnalytical', 'customer') },
          { label: translate.fields['servicesExternalReportAnalytical'].services.external, field: 'services', sub: [
            { field: 'code', disabled: false },
            { field: 'name', disabled: false },
            { field: 'cost', disabled: false },
            { field: 'price', disabled: false },
            { field: 'discount', disabled: false },
            { field: 'fee', disabled: false }
          ], disabled: this.checkPermissions('servicesExternalReportAnalytical', 'services')},
          { label: translate.fields['servicesExternalReportAnalytical'].products.external, field: 'products', sub: [
            { field: 'code', disabled: false },
            { field: 'name', disabled: false },
            { field: 'quantity', disabled: false },
            { field: 'cost', disabled: false },
            { field: 'price', disabled: false },
            { field: 'discount', disabled: false },
            { field: 'fee', disabled: false }
          ], disabled: this.checkPermissions('servicesExternalReportAnalytical', 'products')},
          { label: translate.fields['servicesExternalReportAnalytical'].discount.external, field: 'discount', disabled: this.checkPermissions('servicesExternalReportAnalytical', 'discount') },
          { label: translate.fields['servicesExternalReportAnalytical'].fee.external, field: 'fee', disabled: this.checkPermissions('servicesExternalReportAnalytical', 'fee') },
          { label: translate.fields['servicesExternalReportAnalytical'].servicesCosts.external, field: 'servicesCosts', disabled: this.checkPermissions('servicesExternalReportAnalytical', 'servicesCosts') },
          { label: translate.fields['servicesExternalReportAnalytical'].productsCosts.external, field: 'productsCosts', disabled: this.checkPermissions('servicesExternalReportAnalytical', 'productsCosts') },
          { label: translate.fields['servicesExternalReportAnalytical'].totalCosts.external, field: 'totalCosts', disabled: this.checkPermissions('servicesExternalReportAnalytical', 'totalCosts') },
          { label: translate.fields['servicesExternalReportAnalytical'].partialRevenue.external, field: 'partialRevenue', disabled: this.checkPermissions('servicesExternalReportAnalytical', 'partialRevenue') },
          { label: translate.fields['servicesExternalReportAnalytical'].finalRevenue.external, field: 'finalRevenue', disabled: this.checkPermissions('servicesExternalReportAnalytical', 'finalRevenue') }
        ]
      };
    }

    if (this.settings.model.id == 'curveABC') {

      const translate = this.translate.curveABC;

      this.settings.model.filter = {
        weekly: Utilities.isAdmin ? true : !!this.checkPermissions("default", null, "filterWeek"),
        monthly: Utilities.isAdmin ? true : !!this.checkPermissions("default", null, "filterMonth"),
        lastMonth: Utilities.isAdmin ? true : !!this.checkPermissions("default", null, "filterLastMonth"),
        custom: Utilities.isAdmin ? true : !!this.checkPermissions("default", null, "filterPersonalized")
      };

      this.settings['fields'] = {
        default: [
          { label: translate.fields['default'].averageCost.external, field: 'averageCost', disabled: this.checkPermissions('default', 'averageCost') },
          { label: translate.fields['default'].averagePrice.external, field: 'averagePrice', disabled: this.checkPermissions('default', 'averagePrice') },
          { label: translate.fields['default'].revenue.external, field: 'revenue', disabled: this.checkPermissions('default', 'revenue') }
        ]
      };
    }

    this.formSettings();
    setTimeout(() => { this.loading = false }, 1000);
  } 

  // User Interface Actions  
  
  public onTypesChange(id: string) {

    this.settings.model.filter = {
      weekly: Utilities.isAdmin ? true : !!this.checkPermissions(id, null, "filterWeek"),
      monthly: Utilities.isAdmin ? true : !!this.checkPermissions(id, null, "filterMonth"),
      lastMonth: Utilities.isAdmin ? true : !!this.checkPermissions(id, null, "filterLastMonth"),
      custom: Utilities.isAdmin ? true : !!this.checkPermissions(id, null, "filterPersonalized")
    };

    this.typeActived = id;
    this.toggleFields();
  }

  public onGenerateReport() {

    this.loading = true;

    const model = this.settings.model;
    const filter = this.captureFilters();

    this.settings.model.download = Utilities.isAdmin ? true : !!this.checkPermissions(this.typeActived, null, "downloadReport");

    const where: any = [
      { field: 'registerDate', operator: '>=', value: filter.period.start },
      { field: 'registerDate', operator: '<=', value: filter.period.end },
      { field: 'owner', operator: '=', value: filter.store._id },
      { field: 'serviceStatus', operator: '=', value: "CONCLUDED" }
    ];

    if (!Utilities.isAdmin && this.checkPermissions(this.typeActived, null, "filterDataPerOperator")){
      where.push({ field: 'operator.username', operator: '=', value: Utilities.operator.username })
    }else{
      if(filter.collaborator){
        where.push({ field: 'operator.username', operator: '=', value: filter.collaborator })
      }
    }

    if (model.id == 'resume') {

      this.serviceOrdersReportsService.getResume({
        where: where,
        orderBy: { code: -1 },
        data: { type: 'resumeReportSynthetic' }
      }).then((data) => {
        this.launchReport('Resumo', model, filter, data);
      });
    }

    if (model.id == 'internal') {

      this.serviceOrdersReportsService.getServicesInternal({
        where: where,
        orderBy: { code: -1 },
        data: { type: this.typeActived }
      }).then((data) => {
        this.launchReport('Internas', model, filter, data);
      });
    }

    if (model.id == 'external') {

      this.serviceOrdersReportsService.getServicesExternal({
        where: where,
        orderBy: { code: -1 },
        data: { type: this.typeActived }
      }).then((data) => {
        this.launchReport('Externas', model, filter, data);
      });
    }

    if (model.id == 'curveABC') {

      this.serviceOrdersReportsService.getCurveABC({
        where: where,
        orderBy: { code: -1 },
        data: { type: this.typeActived }
      }).then((data) => {
        this.launchReport('Curva ABC', model, filter, data);
      });
    }
  }

  public onGetCollaborators(store: string = null) {

    const timer = setInterval(() => {

      if (this.formFilters) {

        clearInterval(timer);

        store = store ?? this.formFilters.value.store;

        this.collaboratorsService.query([
          {field: "owner", "operator": "=", value: store}
        ], false, false, false, false).then((res)=>{
          this.collaborators = res;
          this.formFilters.get("collaborator").setValue("##all##");
        });
      }
    })
  }

  // Filter Actions

  public onAddFilter(event: any) {

    let fieldSet = [];

    this.modalComponent.onOpen({
      title: 'Filtros',
      activeComponent: 'ServiceOrdersReports/Filters',
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

  public onLayerResponse(event: any) {

    if (event.instance) {
      this.layerComponent = event.instance;
    }   
  }

  // Auxiliary Methods

  public reset() {
    this.loading = true;    
    this.layerComponent.onClose();
  }
  
  // Setting Methods

  private formSettings() {

    this.typeActived = '';

    this.formFilters = this.formBuilder.group({
      store: [Utilities.storeID],
      period: ['today'],
      startDate: [`${DateTime.getCurrentYear()}-${DateTime.getCurrentMonth()}-01`],
      endDate: [`${DateTime.getCurrentYear()}-${DateTime.getCurrentMonth()}-${DateTime.getCurrentDay()}`],
      fields: this.formBuilder.array([]),
      collaborator: ["##all##"],
      executor: ["##all##"]
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

    const allowedTypes = ['servicesInternalReportSynthetic', 'servicesInternalReportAnalytical', 'servicesExternalReportSynthetic', 'servicesExternalReportAnalytical']

    if(filter.collaborator != "##all##"){
      if (!allowedTypes.includes(this.typeActived)) {
        delete filter.collaborator;
        delete filter.executor;  
      }
    }else{
      delete filter.collaborator;
      delete filter.executor;
    }

    return filter;
  }

  private toggleFields() {

    (this.formControls.fields as FormArray).clear();

    if (this.settings.fields && this.settings.fields[this.typeActived]) {

      let fields = [];

      for (const field of this.settings.fields[this.typeActived]) {

        if (!field.disabled) { 
          (this.formControls.fields as FormArray).push(new FormControl(field.value || true));
          fields.push(field);
        }
      }

      this.settings.fields[this.typeActived] = fields;
    }    
  }

}
