import { Component, Output, EventEmitter, OnInit } from '@angular/core';

// Vehicles
import { SchemesService } from '../schemes.service';

// Translate
import { SchemesTranslate } from '../schemes.translate';

// Utilities
import { Dispatch } from '@shared/utilities/dispatch';
import { EServiceOrderStatus } from '@shared/interfaces/IServiceOrder';

@Component({
  selector: 'schemes-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class SchemesModalComponent implements OnInit {

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  public translate = SchemesTranslate.get()['modal'];

  public settings: any = {};

  public loadingHistoric = true;
  public historic: any[] = [];

  private modalComponent: any;
  private filtersComponent: any;
  private registerComponent: any; 
  private dataExportComponent: any; 
  
  constructor(
    private schemesService: SchemesService
  ) {}

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // User Interface Actions

  public onDelete() {

    const data = this.settings.data;

    this.schemesService.deleteScheme(data).then(() => {
      this.onClose();
    });
  } 

  // Modal Actions

  public onOpen(settings: any) {

    this.settings = settings;
    this.settings.data = (settings.data || {});

    const config = { mode: 'fullscreen' };

    if (this.settings.activeComponent === 'Schemes/Filters') {
      config.mode = 'sidescreen';
    }

    this.modalComponent.onOpen(config);

    // Checks the component's response and initializes them

    const timer = setInterval(() => {

      if (
        (this.settings.activeComponent === 'Schemes/Read') ||
        (this.settings.activeComponent === 'Schemes/Filters' && this.filtersComponent) ||
        ((this.settings.activeComponent === 'Schemes/Create') || (this.settings.activeComponent === 'Schemes/Update') && this.registerComponent) // ||
        // ((this.settings.activeComponent === 'Schemes/DataExport') && this.dataExportComponent)
      ) { clearInterval(timer) }
      
      if (this.settings.activeComponent === 'Schemes/Filters' && this.filtersComponent) {
        this.filtersComponent.bootstrap(settings);
      }

      if ((this.settings.activeComponent === 'Schemes/Create') || (this.settings.activeComponent === 'Schemes/Update') && this.registerComponent) {
        this.registerComponent.bootstrap({ action: settings.activeComponent, data: settings.data });
      }

      // if (this.settings.activeComponent === 'Schemes/DataExport' && this.dataExportComponent) {
      //   this.dataExportComponent.bootstrap();
      // }
    }, 0);

    // Check when the translation changes

    this.checkTranslationChange();
  }  

  public onClose(standard: boolean = false) {

    this.settings = {};
    this.loadingHistoric = true;
    this.historic = [];

    if (!standard) {
      this.modalComponent.onClose();
    }

    Dispatch.removeListeners('languageChange', 'SchemeModalComponent');
  }

  // Event Listeners

  public onModalResponse(event: any) {
    
    if (event.instance) {
      this.modalComponent = event.instance;
    }

    if (event.close) {
      this.onClose(true);
    }
  }

  public onFiltersResponse(event: any) {
    
    if (event.instance) {
      this.filtersComponent = event.instance;
    }
  }

  public onRegisterResponse(event: any) {
    
    if (event.instance) {
      this.registerComponent = event.instance;
    }

    if (event.close) { 
      this.onClose();
    }
  }

  public onDataExportResponse(event: any) {

    if (event.instance) {
      // this.dataExportComponent = event.instance;
    }

    if (event.close) {
      this.onClose();
    }
  }

  // Auxiliary Methods

  private checkTranslationChange() {

    const setTitle = () => {

      if (this.modalComponent) {

        if (this.settings.activeComponent == 'Schemes/Filters') {
          this.modalComponent.title = this.translate.filters.title;
        }       

        if (this.settings.activeComponent == 'Schemes/Create') {
          this.modalComponent.title = this.translate.action.register.type.create.title;
        }
        
        if (this.settings.activeComponent == 'Schemes/Read') {
          this.modalComponent.title = this.translate.action.read.title;
        }

        if (this.settings.activeComponent == 'Schemes/Update') {
          this.modalComponent.title = this.translate.action.register.type.update.title;
        }

        if (this.settings.activeComponent == 'Schemes/Delete') {
          this.modalComponent.title = this.translate.action.delete.title;
        }
        
        if (this.settings.activeComponent == 'Schemes/DataExport') {
          this.modalComponent.title = this.translate.action.others.dataExport.title;
        }
      }
    };   
        
    Dispatch.onLanguageChange('SchemeModalComponent', () => {
      setTitle();
    });
    
    setTitle();
  }

  private searchHistoric() {

    if (this.settings.activeComponent === 'Schemes/Read') {

      Dispatch.serviceOrdersService.query([
        { field: 'serviceStatus', operator: '=', value: EServiceOrderStatus.CONCLUDED },
        { field: 'vehicle.plate', operator: '=', value: this.settings.data.plate }
      ], false, false, false, false, 30).then((data) => {
      
        setTimeout(() => {

          for (const item of data) {

            for (const service of item.services) {
  
              this.historic.push({
                code: item.code,
                service: service.name.toUpperCase(),
                mileage: item.vehicle.mileage,
                date: item.registerDate,
              });
            }
          }
  
          this.loadingHistoric = false;
        }, 2500);
      });
    }
  }

  // Destruction Methods

  public ngOnDestroy() {

    this.settings = {};

    this.modalComponent = null;
    this.filtersComponent = null;
    this.registerComponent = null;
    this.dataExportComponent = null;

    Dispatch.removeListeners('languageChange', 'SchemeModalComponent');
  }

}
