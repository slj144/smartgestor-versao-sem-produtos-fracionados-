import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// Services
import { SettingsService } from '@pages/settings/settings.service';

// Tools
import { AngularEditorConfig,  } from '@kolkov/angular-editor';

@Component({
  selector: 'settings-cashier',
  templateUrl: './cashier.component.html',
  styleUrls: ['./cashier.component.scss']
})
export class SettingsCashierComponent implements OnInit {

  @Output() callback: EventEmitter<any> = new EventEmitter();

  public formOperationalMode: FormGroup;
  public formDiscountLock: FormGroup;

  public settings: any = {};
  public operationalModes: any[] = [];
  public warrantyTerm: string = "";
  public lockDiscounts = false;

  constructor(
    private formBuilder: FormBuilder,
    private settingsService: SettingsService
  ) {}

  public ngOnInit() {
    this.callback.emit({ instance: this });
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
      ],
      // toolbarHiddenButtons: [
      //   [ 'strikeThrough'],
      //   [ 
      //      ]
      // ],
      // customClasses: [{
      //   name: "img",
      //   class: "img"
      // }]
    };

    return settings;
  }
  
  public get formLanguageControls() {
    return this.formOperationalMode.controls;
  }

  // Initialize Method

  public bootstrap(settings: any = {}) {    

    this.settings = settings;

    if (this.settings.activeComponent == 'Cashier/OperationalMode') {

      this.operationalModes = [
        { value: 'shared', label: settings.translate.modal.section.cashier.operationalMode.options.shared },
        { value: 'individual', label: settings.translate.modal.section.cashier.operationalMode.options.individual }
      ];
    }

    this.settingsService.getSettings('SettingsCashierComponent/bootstrap', (data) => {

      if (data.cashier) {
      
        if (data.cashier.warrantyTerm) {
          this.warrantyTerm = data.cashier.warrantyTerm;
        }

        this.lockDiscounts = !!data.cashier.lockDiscounts;

        if (this.settings.activeComponent == 'Cashier/DiscountLock' && this.formDiscountLock) {
          this.formDiscountLock.patchValue({ lock: this.lockDiscounts });
        }
      }
    });

    this.formSettings(settings);    
  }

  // User Interface Actions

  public onSubmitOperationalMode() {

    const data = this.formOperationalMode.value;

    this.settingsService.updateCashierOperationalMode(data.mode).then(() => {
      this.callback.emit({ close: true });
    });
  }

  public onSubmitWarrantyTerm() {

    // console.log(this.)

    this.settingsService.updateCashierWarrantyTerm(this.warrantyTerm).then(() => {
      this.callback.emit({ close: true });
    });
  }

  public onSubmitDiscountLock() {

    const value = !!this.formDiscountLock?.value?.lock;

    this.settingsService.updateCashierDiscountLock(value).then(() => {
      this.callback.emit({ close: true });
    });
  }

  // Setting Methods

  private formSettings(data: any = {}) {
 
    if (this.settings.activeComponent == 'Cashier/OperationalMode') {

      this.formOperationalMode = this.formBuilder.group({
        mode: [(window.localStorage.getItem('cashierMode') || 'shared'), Validators.required]
      });
    }

    if (this.settings.activeComponent == 'Cashier/DiscountLock') {
      this.formDiscountLock = this.formBuilder.group({
        lock: [this.lockDiscounts]
      });
    }
  }
    
  // Auxiliary Methods

  public reset() {
    this.warrantyTerm = '';    
    this.lockDiscounts = false;
    this.settingsService.removeListeners('SettingsCashierComponent/bootstrap');
  }  

}
