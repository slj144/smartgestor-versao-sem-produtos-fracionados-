import { Component, Output, EventEmitter, OnInit } from '@angular/core';

// Services
import { ProductsService } from '../../products.service';

// Translate
import { ProductsTranslate } from '../../products.translate';

// Utilities
import { Utilities } from '@shared/utilities/utilities';
import { Dispatch } from '@shared/utilities/dispatch';
import { ECashierSaleStatus } from '@shared/interfaces/ICashierSale';
import { CashierRecordsService } from '@pages/cashier/cashier-records/cashier-records.service';

@Component({
  selector: 'products-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ProductsModalComponent implements OnInit {

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  public translate = ProductsTranslate.get()['modal'];

  public loadingHistoric = true;
  public historic: any[] = [];

  public settings: any = {};

  private modalComponent: any;
  private filtersComponent: any;
  private registerComponent: any;
  private stockAdjustmentComponent: any;
  private generateTicketsComponent: any;
  private dataImportComponent: any;
  private dataExportComponent: any;
  private xmlImportComponent: any;

  constructor(
    private productsService: ProductsService,
    private cashierRecordsService: CashierRecordsService
  ) { }

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // Getter and Setter Methods

  public get isMatrix() {
    return Utilities.isMatrix;
  }

  // Modal Actions

  public onOpen(settings: any = {}) {

    this.settings = settings;
    this.settings.data = (settings.data || {});

    const config: any = { mode: 'fullscreen' };
    const style: any = {};

    if (this.settings.activeComponent === 'Products/Filters') {
      config.mode = 'sidescreen';
    }

    if (
      ((this.settings.activeComponent === 'Products/Create') || (this.settings.activeComponent === 'Products/Update')) ||
      (this.settings.activeComponent === 'Products/StockAdjustment')
    ) {
      style.backgroundColor = 'white';
      style.backgroundImage = false;
    }

    this.modalComponent.onOpen(config, style);

    // Checks the component's response and initializes them

    const timer = setInterval(() => {

      if (
        (this.settings.activeComponent === 'Products/Read') ||
        ((this.settings.activeComponent === 'Products/Filters') && this.filtersComponent) ||
        ((this.settings.activeComponent === 'Products/Create') || (this.settings.activeComponent === 'Products/Update') && this.registerComponent) ||
        ((this.settings.activeComponent === 'Products/StockAdjustment') && this.stockAdjustmentComponent) ||
        ((this.settings.activeComponent === 'Products/GenerateTickets') && this.generateTicketsComponent) ||
        ((this.settings.activeComponent === 'Products/DataImport') && this.dataImportComponent) ||
        ((this.settings.activeComponent === 'Products/DataExport') && this.dataExportComponent) ||
        ((this.settings.activeComponent === 'Products/XMLImport') && this.xmlImportComponent)
      ) { clearInterval(timer) }

      if ((this.settings.activeComponent === 'Products/Filters') && this.filtersComponent) {
        this.filtersComponent.bootstrap(settings);
      }

      if ((this.settings.activeComponent === 'Products/Create') || (this.settings.activeComponent === 'Products/Update') && this.registerComponent) {
        this.registerComponent.bootstrap({ action: this.settings.activeComponent, data: (settings.data || {}) });
      }

      if ((this.settings.activeComponent === 'Products/StockAdjustment') && this.stockAdjustmentComponent) {
        this.stockAdjustmentComponent.bootstrap();
      }

      if ((this.settings.activeComponent === 'Products/GenerateTickets') && this.generateTicketsComponent) {
        this.generateTicketsComponent.bootstrap();
      }

      if ((this.settings.activeComponent === 'Products/DataImport') && this.dataImportComponent) {
        this.dataImportComponent.bootstrap();
      }

      if ((this.settings.activeComponent === 'Products/DataExport') && this.dataExportComponent) {
        this.dataExportComponent.bootstrap();
      }

      if ((this.settings.activeComponent === 'Products/XMLImport') && this.xmlImportComponent) {
        this.xmlImportComponent.bootstrap();
      }
    }, 0);

    // Check when the translation changes

    this.checkTranslationChange();
    this.searchHistoric();
  }

  public onClose(standard: boolean = false) {

    this.settings = {};
    this.loadingHistoric = true;
    this.historic = [];

    if (!standard) {
      this.modalComponent.onClose();
    }

    // if (this.generateTicketsComponent) {
    //   this.generateTicketsComponent.resetComponent();
    // }

    // if (this.stockAdjustmentComponent) {
    //   this.stockAdjustmentComponent.resetComponent();
    // }

    this.callback.emit({ close: true });
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

  public onStockAdjustmentResponse(event: any) {

    if (event.instance) {
      this.stockAdjustmentComponent = event.instance;
    }
  }

  public onGenerateTicketsResponse(event: any) {

    if (event.instance) {
      this.generateTicketsComponent = event.instance;
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

  public onXMLImportResponse(event: any) {

    if (event.instance) {
      this.xmlImportComponent = event.instance;
    }

    if (event.close) {
      this.onClose();
    }
  }

  private searchHistoric() {

    // if (this.settings.activeComponent === 'Vehicles/Read') {

    this.cashierRecordsService.query("sales", [
      { field: 'status', operator: '!=', value: ECashierSaleStatus.CANCELED },
      { field: 'products.code', operator: '=', value: this.settings.data.code }
    ], false, false, false, false, false, 50).then((data: any[]) => {

      // console.log(data);

      for (const item of data) {
        for (const product of item.products) {
          if (product.code == this.settings.data.code) {
            this.historic.push({
              code: item.code,
              customer: item.customer.name,
              quantity: product.quantity,
              price: product.unitaryPrice,
              date: item.registerDate,
            });
          }
        }
      }

      // console.log(this.historic)

      this.loadingHistoric = false;
    })
  }

  // Auxiliary Methods

  private checkTranslationChange() {

    const setTitle = () => {

      if (this.modalComponent) {

        if (this.settings.activeComponent == 'Products/Filters') {
          this.modalComponent.title = this.translate.filters.title;
        }

        if (this.settings.activeComponent == 'Products/Read') {
          this.modalComponent.title = this.translate.action.read.title;
        }

        if (this.settings.activeComponent == 'Products/Create') {
          this.modalComponent.title = this.translate.action.register.type.create.title;
        }

        if (this.settings.activeComponent == 'Products/Update') {
          this.modalComponent.title = this.translate.action.register.type.update.title;
        }

        if (this.settings.activeComponent == 'Products/StockAdjustment') {
          this.modalComponent.title = this.translate.action.others.stockAdjustment.title;
        }

        if (this.settings.activeComponent == 'Products/GenerateTickets') {
          this.modalComponent.title = this.translate.action.others.generateTickets.title;
        }

        if (this.settings.activeComponent == 'Products/DataImport') {
          this.modalComponent.title = this.translate.action.others.dataImport.title;
        }


        if (this.settings.activeComponent == 'Products/XMLImport') {
          this.modalComponent.title = this.translate.action.others.XMLImport.title;
        }

        if (this.settings.activeComponent == 'Products/DataExport') {
          this.modalComponent.title = this.translate.action.others.dataExport.title;
        }
      }
    };

    Dispatch.onLanguageChange('ProductsModalComponent', () => {
      setTitle();
    });

    setTitle();
  }

  // Destruction Methods

  public ngOnDestroy() {
    Dispatch.removeListeners('languageChange', 'ProductsModalComponent');
  }

}
