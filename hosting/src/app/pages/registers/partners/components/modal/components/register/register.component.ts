import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

// Services
import { PartnersService } from '../../../../partners.service';
import { CEPService } from '@shared/services/cep.service';
import { NotificationService } from '@shared/services/notification.service';

// Translate
import { PartnersTranslate } from '../../../../partners.translate';

// Interfaces
import { IRegistersPartnerCompany } from '@shared/interfaces/IRegistersPartnerCompany';
import { EPersonalDocument } from '@shared/enum/EPersonalDocument';
import { EBusinessDocument } from '@shared/enum/EBusinesslDocument';
import { ENotificationStatus } from '@shared/interfaces/ISystemNotification';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { FieldMask } from '@shared/utilities/fieldMask';

// Settings
import { ProjectSettings } from '../../../../../../../../assets/settings/company-settings';

@Component({
  selector: 'partners-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class PartnersRegisterComponent implements OnInit {

  @Output() public callback: EventEmitter<any> = new EventEmitter(); 

  public translate = PartnersTranslate.get()['modal']['action']['register'];

  public formPartner: FormGroup;
  public settings: any = {};

  public checkBootstrap: boolean = false;
  public checkSearchPostCode: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private cepService: CEPService,
    private partnersService: PartnersService,
    private notificationService: NotificationService
  ) {}

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // Initialize Method

  public bootstrap(settings: any = {}) {

    this.settings = settings;
    this.settings.data = (settings.data || {});

    this.formSettings(this.settings.data);
    this.checkBootstrap = true;
  }

  // Getter and Settter Methods

  public get isBrazil() {
    return (ProjectSettings.companySettings().country == 'BR');
  }

  public get formControls() {
    return this.formPartner.controls;
  }  

  public get formContactsControls() {
    return (this.formControls.contacts as FormGroup).controls;
  }

  public get formAddressControls() {
    return (this.formControls.address as FormGroup).controls;
  } 

  // User Interface Actions 

  public onCEPData(event: Event) {

    event.preventDefault();

    if ((this.formAddressControls.postalCode.value && this.formAddressControls.postalCode.value.length == 9) && this.formAddressControls.postalCode.valid) {

      this.checkSearchPostCode = true;

      this.cepService.search(this.formAddressControls.postalCode.value).subscribe((data: any) => {

        if (!data.erro) {

          this.formAddressControls.local.setValue(data.logradouro);
          this.formAddressControls.complement.setValue(data.complemento);
          this.formAddressControls.neighborhood.setValue(data.bairro);
          this.formAddressControls.city.setValue(data.localidade);
          this.formAddressControls.state.setValue(data.uf);

          this.notificationService.create({
            title: this.translate.form.cepSearch.notification.title,
            description: this.translate.form.cepSearch.notification.status.success,
            status: ENotificationStatus.success
          }, false);
        } else {

          this.notificationService.create({
            title: this.translate.form.cepSearch.notification.title,
            description: this.translate.form.cepSearch.notification.status.error,
            status: ENotificationStatus.danger,
            icon: 'close-outline'
          }, false);
        }

        this.checkSearchPostCode = false;
      });
    }
  }

  public onSubmit() {

    const formData = this.formPartner.value;
    const source = this.settings.data;

    const data: IRegistersPartnerCompany = {
      _id: source._id,
      code: source.code,
      name: Utilities.clearSpaces(formData.name).toUpperCase(),
      type: formData.type
    }

    if (formData.type) {

      if (this.isBrazil) {

        if (formData.type == 'naturalPerson') {

          if (formData.personalDocument) {
            data.personalDocument = { type: EPersonalDocument.CPF, value: formData.personalDocument };
          }          
        } else if (formData.type == 'legalPerson') {

          if (formData.businessDocument) {
            data.businessDocument = { type: EBusinessDocument.CNPJ, value: formData.businessDocument };
          }
        }
      } else {

      }      
    }
    
    if (formData.description) {
      data.description = Utilities.clearSpaces(formData.description);
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

        data.contacts.email = Utilities.clearSpaces(formData.contacts.email);
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

    this.partnersService.registerPartner(data).then(() => {
      this.callback.emit({ close: true });
      this.formSettings();
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

  // Setting Methods

  private formSettings(data: any = {}) {

    this.settings.states = Utilities.states;

    this.formPartner = this.formBuilder.group({
      code: [(data.code ? data.code : ''), []],
      type: [(data.type || 'legalPerson'), Validators.required],
      name: [(data.name ? data.name : ''), [Validators.required]],
      businessDocument: [(data.businessDocument ? data.businessDocument.value : ''), [Validators.minLength(18), Validators.maxLength(18)]],
      personalDocument: [(data.personalDocument ? data.personalDocument.value : ''), [Validators.minLength(14), Validators.maxLength(14)]],
      description: [(data.description ? data.description : ''), []],
      contacts: this.formBuilder.group({
        email: [(data.contacts && data.contacts.email ? data.contacts.email : '')],
        phone: [(data.contacts && data.contacts.phone ? data.contacts.phone : '')]
      }),
      address: this.formBuilder.group({
        postalCode: [(data.address && data.address.postalCode ? data.address.postalCode : ''), [Validators.minLength(9), Validators.maxLength(9)]],
        local: [(data.address && data.address.local ? data.address.local : '')],
        number: [(data.address && data.address.number ? data.address.number : '')],
        complement: [(data.address && data.address.complement ? data.address.complement : '')],
        neighborhood: [(data.address && data.address.neighborhood ? data.address.neighborhood : '')],
        city: [(data.address && data.address.city ? data.address.city : '')],
        state: [(data.address && data.address.state ? data.address.state : '')]        
      })
    });
  }

}
