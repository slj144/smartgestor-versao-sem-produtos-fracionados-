import { Component, Output, EventEmitter, OnInit } from '@angular/core';

// Services
import { ServicesService } from '../../services.service';

// Translate
import { ServicesTranslate } from '../../services.translate';

// Utilities
import { Dispatch } from '@shared/utilities/dispatch';
import { Utilities } from '@shared/utilities/utilities';

@Component({
  selector: 'services-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ServicesModalComponent implements OnInit {

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  public translate = ServicesTranslate.get()['modal'];

  public settings: any = {};

  public get useDepartments(): boolean {
    return Utilities.stockDepartmentsEnabled;
  }

  private modalComponent: any;
  private filtersComponent: any;
  private registerComponent: any; 
  private dataExportComponent: any; 
  
  constructor(
    private servicesService: ServicesService
  ) {}

  public ngOnInit() {
    this.callback.emit({ instance: this });    
  }

  // User Interface Actions

  public onDelete() {

    const data = this.settings.data;

    this.servicesService.deleteService(data).then(() => {
      this.onClose();
    });
  } 

  // Modal Actions

  public onOpen(settings: any) {

    this.settings = settings;
    this.settings.data = (settings.data || {});

    const config = { mode: 'fullscreen' };

    if (this.settings.activeComponent === 'Services/Filters') {
      config.mode = 'sidescreen';
    }

    this.modalComponent.onOpen(config);

    // Checks the component's response and initializes them

    const timer = setInterval(() => {

      if (          
        (this.settings.activeComponent === 'Services/Read') ||
        (this.settings.activeComponent === 'Services/Filters' && this.filtersComponent) ||
        ((this.settings.activeComponent === 'Services/Create') || (this.settings.activeComponent === 'Services/Update') && this.registerComponent) ||
        ((this.settings.activeComponent === 'Services/DataExport') && this.dataExportComponent)
      ) { clearInterval(timer) }
      
      if (this.settings.activeComponent === 'Services/Filters' && this.filtersComponent) {
        this.filtersComponent.bootstrap(settings);
      }

      if ((this.settings.activeComponent === 'Services/Create') || (this.settings.activeComponent === 'Services/Update') && this.registerComponent) {
        this.registerComponent.bootstrap({ action: settings.activeComponent, data: settings.data });
      }

      if (this.settings.activeComponent === 'Services/DataExport' && this.dataExportComponent) {
        this.dataExportComponent.bootstrap();
      }
    }, 0);

    // Check when the translation changes

    this.checkTranslationChange();
  }  

  public onClose(standard: boolean = false) {

    this.settings = {};

    if (!standard) {
      this.modalComponent.onClose();
    }

    Dispatch.removeListeners('languageChange', 'ServicessModalComponent');
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
      this.dataExportComponent = event.instance;
    }

    if (event.close) {
      this.onClose();
    }
  }

  // Auxiliary Methods

  private checkTranslationChange() {

    const setTitle = () => {

      if (this.modalComponent) {

        if (this.settings.activeComponent == 'Services/Filters') {
          this.modalComponent.title = this.translate.filters.title;
        }       

        if (this.settings.activeComponent == 'Services/Create') {
          this.modalComponent.title = this.translate.action.register.type.create.title;
        }
        
        if (this.settings.activeComponent == 'Services/Read') {
          this.modalComponent.title = this.translate.action.read.title;
        }

        if (this.settings.activeComponent == 'Services/Update') {
          this.modalComponent.title = this.translate.action.register.type.update.title;
        }

        if (this.settings.activeComponent == 'Services/Delete') {
          this.modalComponent.title = this.translate.action.delete.title;
        }
        
        if (this.settings.activeComponent == 'Services/DataExport') {
          this.modalComponent.title = this.translate.action.others.dataExport.title;
        }
      }
    };   
        
    Dispatch.onLanguageChange('ServicessModalComponent', () => {
      setTitle();
    });
    
    setTitle();
  }

  // Destruction Methods

  public ngOnDestroy() {

    this.settings = {};

    this.modalComponent = null;
    this.filtersComponent = null;
    this.registerComponent = null;
    this.dataExportComponent = null;

    Dispatch.removeListeners('languageChange', 'ServicessModalComponent');
  }

}
