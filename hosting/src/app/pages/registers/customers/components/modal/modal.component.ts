import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';

// Services
import { CustomersService } from '../../customers.service';

// Translate
import { CustomersTranslate } from '../../customers.translate';

// Utilities
import { Dispatch } from '@shared/utilities/dispatch';

@Component({
  selector: 'customers-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class CustomersModalComponent implements OnInit, OnDestroy {

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  public translate = CustomersTranslate.get()['modal'];

  public settings: any = {};

  private modalComponent: any;
  private filtersComponent: any;
  private registerComponent: any;
  private dataImportComponent: any;
  private dataExportComponent: any;

  constructor(
    private customersService: CustomersService
  ) { }

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // User Interface Actions

  public onDelete() {

    const data = this.settings.data;

    this.customersService.deleteCustomer(data).then(() => {
      this.onClose();
    });
  }

  // Modal Actions

  public onOpen(settings: any) {

    this.settings = settings;
    this.settings.data = (settings.data || {});

    const config = { mode: 'fullscreen' };

    if (this.settings.activeComponent === 'Customers/Filters') {
      config.mode = 'sidescreen';
    }

    this.modalComponent.onOpen(config);

    // Checks the component's response and initializes them

    const timer = setInterval(() => {

      if (
        (this.settings.activeComponent === 'Customers/Read') ||
        (this.settings.activeComponent === 'Customers/Filters' && this.filtersComponent) ||
        ((this.settings.activeComponent === 'Customers/Create') || (this.settings.activeComponent === 'Customers/Update') && this.registerComponent) ||
        ((this.settings.activeComponent === 'Customers/DataImport') && this.dataImportComponent) ||
        ((this.settings.activeComponent === 'Customers/DataExport') && this.dataExportComponent)
      ) { clearInterval(timer) }

      if (this.settings.activeComponent === 'Customers/Filters' && this.filtersComponent) {
        this.filtersComponent.bootstrap(settings);
      }

      if ((this.settings.activeComponent === 'Customers/Create') || (this.settings.activeComponent === 'Customers/Update') && this.registerComponent) {
        this.registerComponent.bootstrap({ action: settings.activeComponent, data: settings.data });
      }
      if (this.settings.activeComponent === 'Customers/DataImport' && this.dataImportComponent) {
        this.dataImportComponent.bootstrap();
      }
      if (this.settings.activeComponent === 'Customers/DataExport' && this.dataExportComponent) {
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

    Dispatch.removeListeners('languageChange', 'CustomersModalComponent');
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
      this.onClose()
    }
  }
  public onDataImportResponse(event: any) {

    if (event.instance) {
      this.dataImportComponent = event.instance;
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

        if (this.settings.activeComponent == 'Customers/Filters') {
          this.modalComponent.title = this.translate.filters.title;
        }

        if (this.settings.activeComponent == 'Customers/Create') {
          this.modalComponent.title = this.translate.action.register.type.create.title;
        }

        if (this.settings.activeComponent == 'Customers/Read') {
          this.modalComponent.title = this.translate.action.read.title;
        }

        if (this.settings.activeComponent == 'Customers/Update') {
          this.modalComponent.title = this.translate.action.register.type.update.title;
        }

        if (this.settings.activeComponent == 'Customers/Delete') {
          this.modalComponent.title = this.translate.action.delete.title;
        }

        if (this.settings.activeComponent == 'Customers/DataImport') {
          this.modalComponent.title = this.translate.action.others.dataImport.title;
        }

        if (this.settings.activeComponent == 'Customers/DataExport') {
          this.modalComponent.title = this.translate.action.others.dataExport.title;
        }
      }
    };

    Dispatch.onLanguageChange('CustomersModalComponent', () => {
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
    this.dataImportComponent = null;
    this.dataExportComponent = null;

    Dispatch.removeListeners('languageChange', 'CustomersModalComponent');
  }

}
