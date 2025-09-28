import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// Services
import { SettingsService } from '../../../../settings.service';

// Utilities
import { Utilities } from '@shared/utilities/utilities';

@Component({
  selector: 'settings-registers',
  templateUrl: './registers.component.html',
  styleUrls: ['./registers.component.scss']
})
export class SettingsRegistersComponent implements OnInit {

  @Output() callback: EventEmitter<any> = new EventEmitter();

  public form: FormGroup;
  public settings: any = {};

  constructor(
    private formBuilder: FormBuilder,
    private settingsService: SettingsService
  ) {}

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // Getter and Setter Methods

  public get formControls() {
    return this.form.controls;
  }
  
  // Initialize Method

  public bootstrap(settings: any = {}) {
    this.settings = settings;
    this.formSettings(settings);
  }

  // User Interface Actions

  public onSubmit() {

    const data = this.form.value;

    this.settingsService.updateRegistersRestrictCustomerRegistration(data).then(() => {
      this.callback.emit({ close: true });
    });
  }

  // Setting Methods

  private formSettings(data: any = {}) {
 
    if (this.settings.activeComponent == 'Registers/RestrictCustomerRegistration') {

      try{
        data = JSON.parse(Utilities.localStorage('RegistersRestrictCustomerRegistration'));
      }catch(e){}

      this.form = this.formBuilder.group({
        document: [!!data.document],
        birthDate: [!!data.birthDate],
        email: [!!data.email],
        phone: [!!data.phone],
      });
    }    
  }

}
