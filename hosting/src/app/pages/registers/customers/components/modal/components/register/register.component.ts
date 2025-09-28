import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormControl } from '@angular/forms';

// Services
import { CustomersService } from '../../../../customers.service';
import { CEPService } from '@shared/services/cep.service';
import { NotificationService } from '@shared/services/notification.service';
import { SettingsService } from '../../../../../../settings/settings.service';

// Translate
import { CustomersTranslate } from '../../../../customers.translate';

// Interfaces
import { IRegistersCustomer } from '@shared/interfaces/IRegistersCustomer';
import { EPersonalDocument } from '@shared/enum/EPersonalDocument';
import { EBusinessDocument } from '@shared/enum/EBusinesslDocument';
import { ENotificationStatus } from '@shared/interfaces/ISystemNotification';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { DateTime } from '@shared/utilities/dateTime';
import { FieldMask } from '@shared/utilities/fieldMask';

// Settings
import { ProjectSettings } from '../../../../../../../../assets/settings/company-settings';

@Component({
  selector: 'customers-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  styles: [`
    /* Remove APENAS botões vazios dentro do cadastro de clientes */
    :host ::ng-deep .container-document button:empty:not([type="submit"]) {
      display: none !important;
    }
    
    :host ::ng-deep .container-cep button:empty:not([type="submit"]) {
      display: none !important;
    }
    
    /* Remove botões fantasmas específicos sem afetar asteriscos */
    :host ::ng-deep fieldset > button:not(.valid):not(.invalid):not([type]):empty {
      display: none !important;
    }
  `]
})
export class CustomersRegisterComponent implements OnInit {
  // ... resto do código continua igual

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  public companyProfile = ProjectSettings.companySettings().profile;
  public translate = CustomersTranslate.get()['modal']['action']['register'];

  public formCustomer: FormGroup;
  public settings: any = {};
  public documentValidator: any = {};
  public postalCodeValidator: any = {};

  public checkBootstrap: boolean = false;
  public restrictRegistration: boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    private cepService: CEPService,
    private customersService: CustomersService,
    private notificationService: NotificationService,
    private settingsService: SettingsService
  ) { }

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  public bootstrap(settings: any = {}) {

    this.settings = settings;
    this.settings.data = (settings.data || {});

    this.settingsService.getSettings('CustomersRegisterComponent', (data) => {

      if (data.customers && (data.customers.restrictRegistration === false)) {
        this.restrictRegistration = false;
      }

      this.formSettings(this.settings.data);

      setTimeout(() => {
        this.checkBootstrap = true;
      }, 500);
    });
  }

  // Getter and Setter Methods

  public get isBrazil() {
    return (ProjectSettings.companySettings().country == 'BR');
  }

  public get formControls() {
    return this.formCustomer.controls;
  }

  public get formContactsControls() {
    return (this.formControls.contacts as FormGroup).controls;
  }

  public get formAddressControls() {
    return (this.formControls.address as FormGroup).controls;
  }

  // User Interface Actions

  public onCheckType() {

    const data = (this.settings.data || {});
    let restrict: any = {};

    try {
      restrict = JSON.parse(Utilities.localStorage('RegistersRestrictCustomerRegistration'));
    } catch (e) { }

    if (!this.formControls.foreigner.value) {
      this.formCustomer.removeControl('foreignerDocument');
    } else {
      if (this.formControls.type.value == 'naturalPerson') {
        this.formCustomer.addControl('foreignerDocument', new FormControl((data.personalDocument ? data.personalDocument.value : ''), restrict.document ? [Validators.required, Validators.minLength(5), Validators.maxLength(18)] : [Validators.minLength(5), Validators.maxLength(18)]));
      } else {
        this.formCustomer.addControl('foreignerDocument', new FormControl((data.businessDocument ? data.businessDocument.value : ''), restrict.document ? [Validators.required, Validators.minLength(5), Validators.maxLength(18)] : [Validators.minLength(5), Validators.maxLength(18)]));
      }
    }

    if (this.formControls.type.value == 'naturalPerson') {
      this.formCustomer.removeControl('businessDocument');
      this.formCustomer.addControl('personalDocument', new FormControl((data.personalDocument ? data.personalDocument.value : ''), restrict.document ? [Validators.required, Validators.minLength(14), Validators.maxLength(14)] : []));
      this.formCustomer.addControl('birthDate', new FormControl((data.birthDate || ''), restrict.birthDate ? [Validators.required, Validators.minLength(10), Validators.maxLength(10)] : []));
      this.settings.data.businessDocument = {
        value: this.formCustomer.get('personalDocument').value
      };
    }

    if (this.formControls.type.value == 'legalPerson') {
      this.formCustomer.removeControl('personalDocument');
      this.formCustomer.removeControl('birthDate');
      this.formCustomer.addControl('businessDocument', new FormControl((data.businessDocument ? data.businessDocument.value : ''), restrict.document ? [Validators.required, Validators.minLength(18), Validators.maxLength(18)] : []));

      this.settings.data.businessDocument = {
        value: this.formCustomer.get('businessDocument').value
      };
    }

    this.onCheckDocument();
  }

  public onCheckDocument(event?: Event, type?: string) {

    let value = '';
    let data = (this.settings.data || {});

    if (event) {
      value = $$(event.currentTarget).val();
    } else {

      let personalDocument = (data.personalDocument ? data.personalDocument.value : '');
      let businessDocument = (data.businessDocument ? data.businessDocument.value : '');

      if (!this.formControls.foreigner.value) {
        value = (this.formControls.type.value == 'naturalPerson' ? personalDocument : businessDocument);
      } else {
        value = this.formControls.foreignerDocument.value;
      }

    }

    type = (type || (this.formControls.type.value == 'naturalPerson' ? 'personalDocument' : 'businessDocument'));

    if ((type == 'personalDocument') || (type == 'businessDocument')) {

      if (
        ((value?.length > 0) && (this.documentValidator.value != value)) &&
        (this.formControls.personalDocument && this.formControls.personalDocument.valid) ||
        (this.formControls.businessDocument && this.formControls.businessDocument.valid) ||

        (this.formControls.foreignerDocument && this.formControls.foreignerDocument.valid)
      ) {

        this.documentValidator.blockSubmit = true;
        this.documentValidator.loading = true;
        this.documentValidator.valid = false;

        this.customersService.checkDocument(value, data.code, type).then((response) => {

          if (response.result == 0) {
            this.documentValidator.blockSubmit = false;
            this.documentValidator.valid = true;
          }

          this.documentValidator.loading = false;
        }).catch(() => {

          this.notificationService.create({
            title: this.translate.form.notification.documentValidator.title,
            description: this.translate.form.notification.documentValidator.status.error,
            status: ENotificationStatus.danger,
            icon: 'close-outline'
          }, false);

          this.documentValidator.loading = false;
        });

        this.documentValidator.value = value;
      }
    } else {

      this.notificationService.create({
        title: this.translate.form.notification.documentValidator.title,
        description: this.translate.form.notification.documentValidator.status.invalidType,
        status: ENotificationStatus.danger,
        icon: 'close-outline'
      }, false);
    }
  }

  public onCheckCEP(event?: Event, applySearch: boolean = true) {

    let value = '';
    let data = (this.settings.data || {});

    if (event) {
      value = $$(event.currentTarget).val();
    } else {
      value = (data.address && data.address.postalCode ? data.address.postalCode : '');
    }

    if (
      ((value.length > 0) && (this.postalCodeValidator.value != value)) &&
      (this.formAddressControls.postalCode.value && this.formAddressControls.postalCode.value.length == 9) &&
      this.formAddressControls.postalCode.valid
    ) {

      this.postalCodeValidator.blockSubmit = true;
      this.postalCodeValidator.loading = true;
      this.postalCodeValidator.valid = false;

      this.cepService.search(value).subscribe((data: any) => {

        if (!data.erro) {

          if (applySearch) {
            this.formAddressControls.local.setValue(data.logradouro);
            this.formAddressControls.complement.setValue(data.complemento);
            this.formAddressControls.neighborhood.setValue(data.bairro);
            this.formAddressControls.city.setValue(data.localidade);
            this.formAddressControls.state.setValue(data.uf);
          }

          this.postalCodeValidator.blockSubmit = false;
          this.postalCodeValidator.valid = true;
        } else {

          this.formAddressControls.local.setValue('');
          this.formAddressControls.complement.setValue('');
          this.formAddressControls.neighborhood.setValue('');
          this.formAddressControls.city.setValue('');
          this.formAddressControls.state.setValue('');
        }

        this.postalCodeValidator.loading = false;
      });

      this.postalCodeValidator.value = value;
    }
  }

  public onSubmit() {

    const formData = this.formCustomer.value;
    const source = this.settings.data;

    const data: IRegistersCustomer = {
      _id: source._id,
      code: source.code,
      description: formData.description.trim() || '',
      name: Utilities.clearSpaces(formData.name).toUpperCase(),
      type: formData.type
    }

    if (formData.type) {

      if (formData.type == 'naturalPerson') {
        if (formData.birthDate) {

          data.birthDate = (() => {
            return DateTime.formatDate(formData.birthDate instanceof Date ? (<Date>formData.birthDate).toISOString() : formData.birthDate).date;
          })();
        }
      }

      if (this.isBrazil) {

        if (formData.type == 'naturalPerson') {

          if (formData.foreigner) {
            data.personalDocument = { type: EPersonalDocument.GENERAL, value: formData.foreignerDocument };
          } else {
            data.personalDocument = { type: EPersonalDocument.CPF, value: formData.personalDocument };
          }

        } else if (formData.type == 'legalPerson') {
          if (formData.foreigner) {
            data.businessDocument = { type: EBusinessDocument.GENERAL, value: formData.foreignerDocument };
          } else {
            data.businessDocument = { type: EBusinessDocument.CNPJ, value: formData.businessDocument };
          }

          data.stateInscription = formData.stateInscription;
          data.municipalInscription = formData.municipalInscription;
        }
      } else {

        if (formData.type == 'naturalPerson') {
          data.personalDocument = { type: EPersonalDocument.GENERAL, value: formData.foreignerDocument };
        } else if (formData.type == 'legalPerson') {
          data.businessDocument = { type: EBusinessDocument.GENERAL, value: formData.foreignerDocument };
          data.stateInscription = formData.stateInscription;
          data.municipalInscription = formData.municipalInscription;
        }

      }
    }

    if (formData.contacts) {

      if (formData.contacts.phone) {
        data.contacts = {};
        data.contacts.phone = Utilities.clearSpaces(formData.contacts.phone);
      }

      if (formData.contacts.email) {

        if (!data.contacts) {
          data.contacts = {};
        }

        data.contacts.email = Utilities.clearSpaces(formData.contacts.email.toLowerCase());
      }
    }

    if (formData.address) {

      if (
        formData.address.postalCode || formData.address.local ||
        formData.address.number || formData.address.complement ||
        formData.address.neighborhood || formData.address.city ||
        formData.address.state
      ) {
        data.address = (<any>{});
      }

      if (formData.address.postalCode) {
        data.address.postalCode = Utilities.clearSpaces(formData.address.postalCode);
      }

      if (formData.address.local) {
        data.address.local = Utilities.clearSpaces(formData.address.local);
      }

      if (formData.address.number) {
        data.address.number = Utilities.clearSpaces(formData.address.number);
      }

      if (formData.address.complement) {
        data.address.complement = Utilities.clearSpaces(formData.address.complement);
      }

      if (formData.address.neighborhood) {
        data.address.neighborhood = Utilities.clearSpaces(formData.address.neighborhood);
      }

      if (formData.address.city) {
        data.address.city = Utilities.clearSpaces(formData.address.city);
      }

      if (formData.address.state) {
        data.address.state = Utilities.clearSpaces(formData.address.state);
      }
    }


    this.customersService.registerCustomer(data).then(() => {
      this.callback.emit({ data: data, close: true });
      this.formReset();
    });
  }

  // Auxiliary Methods

  public onApplyCpfMask(event: Event, control: AbstractControl) {
    control.setValue(FieldMask.cpfFieldMask($$(event.target)[0].value));
  }

  public onApplyCnpjMask(event: Event, control: AbstractControl) {
    control.setValue(FieldMask.cnpjFieldMask($$(event.target)[0].value));
  }

  public onApplyPhoneMask(event: Event, control: AbstractControl) {
    control.setValue(FieldMask.phoneFieldMask($$(event.target)[0].value));
  }

  public onApplyPostalCodeMask(event: Event, control: AbstractControl) {
    control.setValue(FieldMask.postalCodeFieldMask($$(event.target)[0].value));
  }

  public onApplyDateMask(event: Event, control: AbstractControl) {
    control.setValue(FieldMask.dateFieldMask($$(event.target)[0].value));
  }

  public onApplyNumberMask(event: Event, control: AbstractControl) {
    control.setValue(FieldMask.numberFieldMask($$(event.target)[0].value));
  }

  // Setting Methods

  private formSettings(data: any = {}) {

    let restrict: any = {}

    try {
      restrict = JSON.parse(Utilities.localStorage('RegistersRestrictCustomerRegistration'));
    } catch (e) { }

    const phoneBR = this.isBrazil ? [Validators.minLength(14), Validators.maxLength(16)] : [];

    this.formCustomer = this.formBuilder.group({
      code: [(data.code || '')],
      description: [(data.description || '')],
      type: [(data.type || 'naturalPerson'), Validators.required],
      name: [(data.name || ''), Validators.required],
      foreigner: [false],
      contacts: this.formBuilder.group({
        email: [(data.contacts && data.contacts.email ? data.contacts.email : ''), (restrict.email ? [Validators.required] : [])],
        phone: [(data.contacts && data.contacts.phone ? data.contacts.phone : ''), (restrict.phone ? [...phoneBR, ...[Validators.required]] : phoneBR)]
      }),
      stateInscription: [(data.stateInscription || '')],
      municipalInscription: [(data.municipalInscription || '')],
      address: this.formBuilder.group({
        postalCode: [(data.address && data.address.postalCode ? data.address.postalCode : ''), this.isBrazil ? [Validators.minLength(9), Validators.maxLength(9)] : [Validators.minLength(2)]],
        local: [(data.address && data.address.local ? data.address.local : '')],
        number: [(data.address && data.address.number ? data.address.number : '')],
        complement: [(data.address && data.address.complement ? data.address.complement : '')],
        neighborhood: [(data.address && data.address.neighborhood ? data.address.neighborhood : '')],
        city: [(data.address && data.address.city ? data.address.city : '')],
        state: [(data.address && data.address.state ? data.address.state : '')]
      })
    });

    data.birthDate = (() => {
      return (data.birthDate ? DateTime.formatDate((data.birthDate instanceof Date ? (<Date>data.birthDate).toISOString() : data.birthDate), 'object', 'BR').date : null);
    })();

    this.settings.states = Utilities.states;

    this.onCheckType();
    this.onCheckDocument();
    this.onCheckCEP(null, false);
  }

  public onChangeType(event, control: AbstractControl) {
    control.setValue(control.value == "true");
    this.onCheckType();
  }

  private formReset() {

    this.formCustomer.reset();

    this.documentValidator = {};
    this.postalCodeValidator = {};

    if ($$('#container-register-customer').length > 0) {
      $$('#container-register-customer')[0].scrollTop = 0;
    }
  }

}
