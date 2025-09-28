import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Services
import { VehiclesService } from '@pages/registers/vehicles/vehicles.service';

// Translate
import { VehiclesTranslate } from '@pages/registers/vehicles/vehicles.translate';

// Interfaces
import { IRegistersVehicles } from '@shared/interfaces/IRegistersVehicles';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { FieldMask } from '@shared/utilities/fieldMask';
import { Utilities } from '@shared/utilities/utilities';

@Component({
  selector: 'vehicles-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class VehiclesRegisterComponent implements OnInit {

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  public formVehicle: FormGroup;
  public translate: any;
  public settings: any = {};
  public checkBootstrap: boolean = false;

  private layerComponent: any;

  constructor(
    private formBuilder: FormBuilder,
    private vehiclesService: VehiclesService
  ) { }

  public ngOnInit() {

    this.translate = VehiclesTranslate.get()['modal']['action']['register'];

    this.callback.emit({ instance: this });
  }

  // Getter and Setter Methods

  public get formControls() {
    return this.formVehicle.controls;
  }

  // Initialize Method

  public bootstrap(settings: any = {}) {

    this.settings = Utilities.deepClone(settings);
    this.settings.data = (this.settings.data ?? {});

    if (this.settings.data && this.settings.data.beneficiary) {

      if (this.settings.data.beneficiary.phone || this.settings.data.beneficiary.email) {
        this.settings.data.beneficiary.contacts = {};
      }

      if (this.settings.data.beneficiary.phone) {
        this.settings.data.beneficiary.contacts.phone = this.settings.data.beneficiary.phone;
        delete this.settings.data.beneficiary.phone;
      }

      if (this.settings.data.beneficiary.email) {
        this.settings.data.beneficiary.contacts.email = this.settings.data.beneficiary.email;
        delete this.settings.data.beneficiary.email;
      }
    }

    this.formSettings(this.settings.data);
    this.checkBootstrap = true;
  }

  // User Interface Actions   

  public onApplyPlateMask(event: Event, control: AbstractControl) {
    control.setValue(FieldMask.plateFieldMask($$(event.target)[0].value));
  }

  public onApplyMileageMask(event: Event, control: AbstractControl) {
    control.setValue(FieldMask.numberFieldMask($$(event.target)[0].value));
  }

  public onSubmit() {

    const formData = this.formVehicle.value;
    const source = this.settings.data;

    const data: IRegistersVehicles = {
      _id: source._id,
      code: source.code,
      proprietary: formData.proprietary,
      plate: Utilities.removeExtraSpaces(String(formData.plate).toUpperCase()),
      model: Utilities.removeExtraSpaces(String(formData.model).toUpperCase()),
      color: Utilities.removeExtraSpaces(String(formData.color).toUpperCase()),
      mileage: formData.mileage,
      chassis: Utilities.removeExtraSpaces(formData.chassis)
    };

    this.vehiclesService.registerVehicle(data).then(() => {
      this.callback.emit({ data: data, close: true });
    });
  }

  // Layer Actions

  public onOpenLayer(type: string) {

    this.layerComponent.onOpen({
      activeComponent: type, selectItem: { code: this.formControls.model.value }
    });
  }

  // Event Listeners

  public onLayerResponse(event: any) {

    if (event.instance) {
      this.layerComponent = event.instance;
    }

    if (event.owner) {
      this.formControls.proprietary.setValue(event.owner);
    }

    if (event.model) {
      this.formControls.model.setValue(event.model);
    }
  }

  // Auxiliary Methods

  private formSettings(data: any = {}) {

    this.formVehicle = this.formBuilder.group({
      code: [(data.code ?? '')],
      proprietary: [(data.proprietary || ''), [Validators.required]],
      plate: [(data.plate ?? ''), [Validators.required]],
      model: [(data.model ?? ''), [Validators.required]],
      color: [(data.color ?? ''), [Validators.required]],
      mileage: [(data.mileage ?? ''), [Validators.required]],
      chassis: [(data.chassis ?? '')]
    });
  }

}
