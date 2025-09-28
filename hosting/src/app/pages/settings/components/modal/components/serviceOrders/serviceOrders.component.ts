import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { Utilities } from '@shared/utilities/utilities';

// Services
import { SettingsService } from '../../../../settings.service';

// Translate
import { SettingsTranslate } from '../../../../settings.translate';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'settings-service-orders',
  templateUrl: './serviceOrders.component.html',
  styleUrls: ['./serviceOrders.component.scss']
})
export class SettingsServiceOrdersComponent implements OnInit {

  @Output() callback: EventEmitter<any> = new EventEmitter();

  public translate = SettingsTranslate.get();

  public loading: boolean = true;
  public settings: any = {};
  public operationalModes: any[] = [];
  public warrantyTerm: string = "";
  public deliveryTerm: string = "";
  public serviceSettings: any;
  public layerComponent: any;

  constructor(
    private settingsService: SettingsService,
    private sanitizer: DomSanitizer
  ) {}

  public ngOnInit() {

    this.callback.emit({ instance: this });

    this.settingsService.getSOSettings("Settings/ServiceOrders", (data) => {
      this.serviceSettings = data;
      this.loading = false;
    });
  }

  // Getter and Setter Methods

  public get editorConfig() {

    const settings: AngularEditorConfig = {
      editable: true,
      spellcheck: true,
      height: '300px',
      minHeight: '300px',
      maxHeight: '300px',
      width: 'auto',
      minWidth: '0',
      enableToolbar: true,
      showToolbar: true, 
      placeholder: '',
      defaultParagraphSeparator: '',
      defaultFontName: '',
      defaultFontSize: '',
      sanitize: false,
      toolbarPosition: 'top',
      toolbarHiddenButtons: [
        [ 'strikeThrough', 'heading', 'fontName' ],
        [ 'fontSize', 'textColor', 'backgroundColor', 'link', 'unlink', 
          'insertImage', 'insertVideo', 'insertHorizontalRule', 'removeFormat', 'toggleEditorMode' ]
      ]
    };

    return settings;
  }


  public safeHTML(unsafe: string) {
    return this.sanitizer.bypassSecurityTrustHtml(unsafe);
  }

  // Initialize Method

  public bootstrap(settings: any = {}) {

    this.settings = settings;   

    this.settingsService.getSettings('SettingsServiceOrdersComponent/bootstrap', (data) => {

      if (data.serviceOrders) {

        if (data.serviceOrders.checklist) {}
      
        if (data.serviceOrders.warrantyTerm) {
          this.warrantyTerm = data.serviceOrders.warrantyTerm;
        }

        if (data.serviceOrders.deliveryTerm) {
          this.deliveryTerm = data.serviceOrders.deliveryTerm;
        }
      }      
    });

    // setInterval(()=>{

    // }, 1000);
  }

  // User Interface Actions

  public onSubmitWarrantyTerm() {

    this.settingsService.updateServiceOrdersWarrantyTerm(this.warrantyTerm).then(() => {
      this.callback.emit({ close: true });
    });
  }

  public onSubmitDeliveryTerm() {

    this.settingsService.updateServiceOrdersDeliveryTerm(this.deliveryTerm).then(() => {
      this.callback.emit({ close: true });
    });;
  }
  
  // Checklist Actions

  public onShowChecklistLayer(event: Event, action: string, data: any = null){

    if (event){ event.stopPropagation(); }

    this.layerComponent.onOpen({
      action: action,
      activeComponent: "Checklist/" + (action == "add" ? "Add" :(action == "edit") ? "Edit" :  "Delete"),
      data: data,
      callback: (newData: any, oldData: any)=>{

        Utilities.loading(true);

        if (action == "add"){
          this.settingsService.addChecklist(newData).then(()=>{

            this.layerComponent.onClose();
            Utilities.loading(false);
          }).catch((error)=>{

            this.layerComponent.onClose();
            Utilities.loading(false);
          });
        }else if (action == "edit"){
          this.settingsService.updateChecklist(newData, oldData).then(()=>{

            this.layerComponent.onClose();
            Utilities.loading(false);
          }).catch((error)=>{

            this.layerComponent.onClose();
            Utilities.loading(false);
          });
        }else if (action == "delete"){
          this.settingsService.deleteChecklist(data).then(()=>{

            this.layerComponent.onClose();
            Utilities.loading(false);
          }).catch((error)=>{

            this.layerComponent.onClose();
            Utilities.loading(false);
          });
        }
      }
    });
  }

  // Layer Response

  public onLayerResponse(event) {

    if (event.instance) {
      this.layerComponent = event.instance;
    }
  }
      
  // Auxiliary Methods

  public reset() {

    this.warrantyTerm = '';
    this.deliveryTerm = '';

    this.settingsService.removeListeners('SettingsServiceOrdersComponent/bootstrap');
  }

  public ngOnDestroy() {
    this.settingsService.removeListeners("Settings/ServiceOrders", "service-orders-settings");
  }

}
