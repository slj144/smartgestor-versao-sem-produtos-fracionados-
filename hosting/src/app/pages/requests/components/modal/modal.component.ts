import { Component, Output, EventEmitter, OnInit } from '@angular/core';

// Services
import { RequestsService } from '../../requests.service';

// Translate
import { RequestsTranslate } from '../../requests.translate';

// Utilities
import { Utilities } from '@shared/utilities/utilities';
import { Dispatch } from '@shared/utilities/dispatch';

@Component({
  selector: 'requests-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class RequestsModalComponent implements OnInit {

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  public translate = RequestsTranslate.get()['modal'];

  public settings: any = {};

  private modalComponent: any;
  private filtersComponent: any;
  private registerComponent: any;
  private printComponent: any;

  constructor(
    private requestsService: RequestsService
  ) {}

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // User Interface Actions

  public onCancel() {

    const data = this.settings.data;

    this.requestsService.cancelRequest(data).then(() => {
      this.onClose();
    });
  }

  public onPrint() {

    const data = Utilities.deepClone(this.settings.data);
    data.products = this.settings.data.products;
    
    // this.printComponent.onLaunchPrint({
    //   activeComponent: 'Requests/receipt',
    //   data: data
    // });
  }

  // Modal Actions

  public onOpen(settings: any = {}) {

    this.settings = settings;
    this.settings.data = (settings.data || {});

    const config: any = { mode: 'fullscreen' };
    const style: any = {};

    if (settings.activeComponent === 'Requests/filters') {
      config.mode = 'sidescreen';
    }

    if ((this.settings.activeComponent === 'Requests/create') || (this.settings.activeComponent === 'Requests/edit')) {
      style.backgroundImage = false;
    }

    this.modalComponent.onOpen(config, style);

    // Checks the component's response and initializes them

    const timer = setInterval(() => {

      if (
        (this.settings.activeComponent === 'Requests/filters' && this.filtersComponent) ||
        (this.settings.activeComponent === 'Requests/read') ||
        ((this.settings.activeComponent === 'Requests/create') || (this.settings.activeComponent === 'Requests/edit') && this.registerComponent) ||
        (this.settings.activeComponent === 'Requests/cancel')
      ) { clearInterval(timer) }
      
      if (this.settings.activeComponent === 'Requests/filters' && this.filtersComponent) {
        this.filtersComponent.bootstrap(settings);
      }

      if ((this.settings.activeComponent === 'Requests/create') || (this.settings.activeComponent === 'Requests/edit') && this.registerComponent) {
        this.registerComponent.bootstrap({ action: settings.activeComponent, data: settings.data });
      }
    }, 0);

    // Check when the translation changes

    this.checkTranslationChange();
  }  

  public onClose(standard: boolean = false) {

    if (!standard) {
      this.modalComponent.onClose();
    }

    Dispatch.removeListeners('languageChange', 'RequestsModalComponent');
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

  public onPrintResponse(event: any) {

    if (event.instance) {
      this.printComponent = event.instance;
    }

    if (event.close) {
      this.onClose();
    }
  }

  // Auxiliary Methods

  private checkTranslationChange() {
    
    const setTitle = () => {

      if (this.modalComponent) {

        if (this.settings.activeComponent == 'Requests/filters') {
          this.modalComponent.title = this.translate.filters.title;
        }

        if (this.settings.activeComponent == 'Requests/create') {
          this.modalComponent.title = this.translate.action.register.type.create.title;
        }

        if (this.settings.activeComponent == 'Requests/read') {
          this.modalComponent.title = this.translate.action.read.title;
        }

        if (this.settings.activeComponent == 'Requests/edit') {
          this.modalComponent.title = this.translate.action.register.type.update.title;
        } 

        if (this.settings.activeComponent == 'Requests/cancel') {
          this.modalComponent.title = this.translate.action.cancel.title;
        }

        if (this.settings.activeComponent == 'Requests/delete') {
          this.modalComponent.title = this.translate.action.delete.title;
        }
      }
    };   
       
    Dispatch.onLanguageChange('RequestsModalComponent', () => {
      setTitle();
    });
    
    setTitle();
  }

  // Destruction Method

  public ngOnDestroy() {
    Dispatch.removeListeners('languageChange', 'RequestsModalComponent');
  }

}
