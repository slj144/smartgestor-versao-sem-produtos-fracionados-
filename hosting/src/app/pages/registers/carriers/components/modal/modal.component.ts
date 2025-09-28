import { Component, Output, EventEmitter, OnInit } from '@angular/core';

// Services
import { CarriersService } from '../../carriers.service';

// Translate
import { CarriersTranslate } from '../../carriers.translate';

// Utilities
import { Dispatch } from '@shared/utilities/dispatch';

@Component({
  selector: 'carriers-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class CarriersModalComponent implements OnInit {

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  public translate = CarriersTranslate.get()['modal'];

  public settings: any = {};
  public searchPostCode: boolean = false;

  private modalComponent: any;
  private filtersComponent: any;
  private registerComponent: any;
  private dataExportComponent: any;

  constructor(
    private carriersService: CarriersService
  ) {}

  public ngOnInit() {
    this.callback.emit({ instance: this });    
  }
  
  // User Interface Actions

  public onDelete() {

    const data = this.settings.data;

    this.carriersService.deleteCarrier(data).then(() => {
      this.onClose();
    });
  } 

  // Modal Actions

  public onOpen(settings: any) {

    this.settings = settings;
    this.settings.data = (settings.data || {});

    const config = { mode: 'fullscreen' };

    if (this.settings.activeComponent === 'Carriers/Filters') {
      config.mode = 'sidescreen';
    }

    this.modalComponent.onOpen(config);

    // Checks the component's response and initializes them

    const timer = setInterval(() => {

      if (
        (this.settings.activeComponent === 'Carriers/Read') ||
        (this.settings.activeComponent === 'Carriers/Filters' && this.filtersComponent) ||
        ((this.settings.activeComponent === 'Carriers/Create') || (this.settings.activeComponent === 'Carriers/Update') && this.registerComponent) ||
        ((this.settings.activeComponent === 'Carriers/DataExport') && this.dataExportComponent)
      ) { clearInterval(timer) }
      
      if (this.settings.activeComponent === 'Carriers/Filters' && this.filtersComponent) {
        this.filtersComponent.bootstrap(settings);
      }

      if ((this.settings.activeComponent === 'Carriers/Create') || (this.settings.activeComponent === 'Carriers/Update') && this.registerComponent) {
        this.registerComponent.bootstrap({ action: settings.activeComponent, data: settings.data });
      }

      if (this.settings.activeComponent === 'Carriers/DataExport' && this.dataExportComponent) {
        this.dataExportComponent.bootstrap();
      }
    }, 0);
    
    // Check when the translation changes

    this.checkTranslationChange();
  }  

  public onClose(standard: boolean = false) {

    if (!standard) {
      this.modalComponent.onClose();
    }

    Dispatch.removeListeners('languageChange', 'CarriersModalComponent');
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

  public onFiltersResponse(event: any) {
    
  }
    
  // Auxiliary Methods

  private checkTranslationChange() {

    const setTitle = () => {

      if (this.modalComponent) {

        if (this.settings.activeComponent == 'Carriers/Filters') {
          this.modalComponent.title = this.translate.filters.title;
        }       

        if (this.settings.activeComponent == 'Carriers/Create') {
          this.modalComponent.title = this.translate.action.register.type.create.title;
        }
        
        if (this.settings.activeComponent == 'Carriers/Read') {
          this.modalComponent.title = this.translate.action.read.title;
        }

        if (this.settings.activeComponent == 'Carriers/Update') {
          this.modalComponent.title = this.translate.action.register.type.update.title;
        }

        if (this.settings.activeComponent == 'Carriers/Delete') {
          this.modalComponent.title = this.translate.action.delete.title;
        }

        if (this.settings.activeComponent == 'Carriers/DataExport') {
          this.modalComponent.title = this.translate.action.others.dataExport.title;
        } 
      }
    };   
       
    Dispatch.onLanguageChange('CarriersModalComponent', () => {
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

    Dispatch.removeListeners('languageChange', 'CarriersModalComponent');
  }

}
