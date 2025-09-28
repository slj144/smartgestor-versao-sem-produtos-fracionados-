import { Component, Output, EventEmitter, OnInit } from '@angular/core';

// Services
import { PartnersService } from '../../partners.service';

// Translate
import { PartnersTranslate } from '../../partners.translate';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Dispatch } from '@shared/utilities/dispatch';

@Component({
  selector: 'partners-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class PartnersModalComponent implements OnInit {

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  public translate = PartnersTranslate.get()['modal'];

  public settings: any = {};
  public purchasesData: any = {};
  public searchPostCode: boolean = false;

  private modalComponent: any;
  private filtersComponent: any;
  private registerComponent: any;
  private dataExportComponent: any;

  constructor(
    private partnersService: PartnersService
  ) {}

  public ngOnInit() {
    this.callback.emit({ instance: this });    
  }

  // User Interface Actions

  public onDelete() {

    const data = this.settings.data;

    this.partnersService.deletePartner(data).then(() => {
      this.onClose();
    });
  } 

  // Modal Actions

  public onOpen(settings: any) {

    this.settings = settings;
    this.settings.data = (settings.data || {});

    const config = { mode: 'fullscreen' };

    if (this.settings.activeComponent === 'Partners/Filters') {
      config.mode = 'sidescreen';
    }

    this.modalComponent.onOpen(config);

    // Checks the component's response and initializes them

    const timer = setInterval(() => {

      if (          
        (this.settings.activeComponent === 'Partners/Read') ||
        (this.settings.activeComponent === 'Partners/Filters' && this.filtersComponent) ||
        ((this.settings.activeComponent === 'Partners/Create') || (this.settings.activeComponent === 'Partners/Update') && this.registerComponent)
      ) { clearInterval(timer) }
      
      if (this.settings.activeComponent === 'Partners/Filters' && this.filtersComponent) {
        this.filtersComponent.bootstrap(settings);
      }

      if ((this.settings.activeComponent === 'Partners/Create') || (this.settings.activeComponent === 'Partners/Update') && this.registerComponent) {
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

    Dispatch.removeListeners('languageChange', 'PartnersModalComponent');
  }

  // Event Listeners

  public onModalResponse(event: any) {
    
    if (event.instance) {
      this.modalComponent = event.instance;
    }
  }

  public onRegisterResponse(event: any) {
    
    if (event.instance) {
      this.registerComponent = event.instance;
    }

    if (event.close) { 
      this.onClose() 
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

        if (this.settings.activeComponent == 'Partners/Filters') {
          this.modalComponent.title = this.translate.filters.title;
        }       

        if (this.settings.activeComponent == 'Partners/Create') {
          this.modalComponent.title = this.translate.action.register.type.create.title;
        }
        
        if (this.settings.activeComponent == 'Partners/Read') {
          this.modalComponent.title = this.translate.action.read.title;
        }

        if (this.settings.activeComponent == 'Partners/Update') {
          this.modalComponent.title = this.translate.action.register.type.update.title;
        }

        if (this.settings.activeComponent == 'Partners/Delete') {
          this.modalComponent.title = this.translate.action.delete.title;
        }

        if (this.settings.activeComponent == 'Partners/DataExport') {
          this.modalComponent.title = this.translate.action.others.dataExport.title;
        } 
      }
    };   
       
    Dispatch.onLanguageChange('PartnersModalComponent', () => {
      setTitle();
    });
    
    setTitle();
  }

  // Destruction Methods

  public ngOnDestroy() {

    this.settings = {};

    this.purchasesData = {};
    this.modalComponent = null;
    this.filtersComponent = null;
    this.registerComponent = null;
    this.dataExportComponent = null;

    Dispatch.removeListeners('languageChange', 'PartnersModalComponent');
  }

}
