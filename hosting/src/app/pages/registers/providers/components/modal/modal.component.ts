import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';

// Services
import { ProvidersService } from '../../providers.service';

// Translate
import { ProvidersTranslate } from '../../providers.translate';

// Utilities
import { Dispatch } from '@shared/utilities/dispatch';

@Component({
  selector: 'providers-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ProvidersModalComponent implements OnInit, OnDestroy {

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  public translate = ProvidersTranslate.get()['modal'];

  public settings: any = {};

  private modalComponent: any;
  private filtersComponent: any;
  private registerComponent: any;
  private dataExportComponent: any;

  constructor(
    private providersService: ProvidersService
  ) {}

  public ngOnInit() {
    this.callback.emit({ instance: this });    
  }

  // User Interface Actions

  public onDelete() {

    const data = this.settings.data;

    this.providersService.deleteProvider(data).then(() => {
      this.onClose();
    });
  } 

  // Modal Actions

  public onOpen(settings: any) {

    this.settings = settings;
    this.settings.data = (settings.data || {});

    const config = { mode: 'fullscreen' };

    if (this.settings.activeComponent === 'Providers/Filters') {
      config.mode = 'sidescreen';
    }

    this.modalComponent.onOpen(config);

    // Checks the component's response and initializes them

    const timer = setInterval(() => {

      if (          
        (this.settings.activeComponent === 'Providers/Read') ||
        (this.settings.activeComponent === 'Providers/Filters' && this.filtersComponent) ||
        ((this.settings.activeComponent === 'Providers/Create') || (this.settings.activeComponent === 'Providers/Update') && this.registerComponent) ||
        ((this.settings.activeComponent === 'Providers/DataExport') && this.dataExportComponent)
      ) { clearInterval(timer) }
      
      if (this.settings.activeComponent === 'Providers/Filters' && this.filtersComponent) {
        this.filtersComponent.bootstrap(settings);
      }

      if ((this.settings.activeComponent === 'Providers/Create') || (this.settings.activeComponent === 'Providers/Update') && this.registerComponent) {
        this.registerComponent.bootstrap({ action: settings.activeComponent, data: settings.data });
      }

      if (this.settings.activeComponent === 'Providers/DataExport' && this.dataExportComponent) {
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

    Dispatch.removeListeners('languageChange', 'ProvidersModalComponent');
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

        if (this.settings.activeComponent == 'Providers/Filters') {
          this.modalComponent.title = this.translate.filters.title;
        }       

        if (this.settings.activeComponent == 'Providers/Create') {
          this.modalComponent.title = this.translate.action.register.type.create.title;
        }
        
        if (this.settings.activeComponent == 'Providers/Read') {
          this.modalComponent.title = this.translate.action.read.title;
        }

        if (this.settings.activeComponent == 'Providers/Update') {
          this.modalComponent.title = this.translate.action.register.type.update.title;
        }

        if (this.settings.activeComponent == 'Providers/Delete') {
          this.modalComponent.title = this.translate.action.delete.title;
        }

        if (this.settings.activeComponent == 'Providers/DataExport') {
          this.modalComponent.title = this.translate.action.others.dataExport.title;
        } 
      }
    };   
       
    Dispatch.onLanguageChange('ProvidersModalComponent', () => {
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

    Dispatch.removeListeners('languageChange', 'ProvidersModalComponent');
  }

}
