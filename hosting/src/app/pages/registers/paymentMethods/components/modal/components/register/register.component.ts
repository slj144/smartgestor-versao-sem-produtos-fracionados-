import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// Services
import { PaymentMethodsService } from '../../../../paymentMethods.service';
import { BankAccountsService } from '../../../../../../financial/bank-accounts/bank-accounts.service';

// Translate
import { PaymentMethodsTranslate } from '../../../../paymentMethods.translate';

// Interfaces
import { IRegistersPaymentMethod } from '@shared/interfaces/IRegistersPaymentMethod';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { FieldMask } from '@shared/utilities/fieldMask';

@Component({
  selector: 'payment-methods-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class PaymentMethodsRegisterComponent implements OnInit, OnDestroy {

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  public translate = PaymentMethodsTranslate.get()['modal']['action']['register'];

  public formPayment: FormGroup;
  public settings: any = {};

  public bankAccountsData: any = [];

  public checkBootstrap: boolean = false;
  public checkAccounts: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private paymentMethodsService: PaymentMethodsService,
    private bankAccountsService: BankAccountsService
  ) { }

  public ngOnInit() {

    this.bankAccountsService.getAccounts('PaymentMethodsRegisterComponent', (data) => {
      this.bankAccountsData = data;
      this.checkAccounts = true;
    });

    this.callback.emit({ instance: this });
  }

  // Initialize Method

  public bootstrap(settings: any = {}) {

    this.settings = settings;
    this.settings.data = (settings.data || {});
    this.settings.source = (settings.source || {});

    const timer = setInterval(() => {

      if (this.checkAccounts) {

        this.formSettings(this.settings.data);
        this.checkBootstrap = true;

        clearInterval(timer);
      }
    }, 0);
  }

  // Getter and Setter Methods

  public get formControls() {
    return this.formPayment.controls;
  }

  // User Interface Actions   

  public onCreateFee(parcelInput: any, feeInput: any) {

    const value = (this.formControls.fees.value || []);

    if (parcelInput.value && feeInput.value) {

      value.push({
        parcel: parcelInput.value,
        fee: feeInput.value
      });

      value.sort((a, b) => {
        return ((parseInt(a.parcel) < parseInt(b.parcel)) ? -1 : ((parseInt(a.parcel) > parseInt(b.parcel)) ? 1 : 0));
      });

      parcelInput.value = (value.length > 0 ? (parseInt((value[value.length - 1]).parcel) + 1) : 1);
      feeInput.value = '0,00';

      this.formControls.fees.setValue(value);
    }
  }

  public onDeleteFee(index: number) {

    const value = this.formControls.fees.value;
    value.splice(index, 1);

    this.formControls.fees.setValue(value);
  }

  public onSubmit() {

    const formData = this.formPayment.value;
    const source = this.settings.source;

    const bankAccount = (() => {

      let data: any = {};

      $$(this.bankAccountsData).map((_, item) => {

        if (item.code == formData.bankAccount) {

          data = {
            _id: item._id,
            code: item.code,
            name: item.name,
            agency: item.agency,
            account: item.account
          };

          return true;
        }
      });

      return data;
    })();

    let data: any = {};
    data.name = formData.name;

    Utilities.forceAlloc(formData);

    if (this.settings.type == 'Method/Create' || this.settings.type == 'Method/Update') {

      data = <IRegistersPaymentMethod>{
        _id: source._id,
        code: source.code,
        name: (formData.name || source.name)
      };

      if (formData.bankAccount) {

        if (Utilities.isMatrix) {
          data.bankAccount = bankAccount;
        } else {
          data['branches'] = (data['branches'] || {});
          data['branches'][Utilities.storeID] = { bankAccount };
        }
      }

      if (formData.fee) {
        data.fee = (formData.fee ? parseFloat(formData.fee.toString().replace(',', '.')) : 0.0);
      }
      if (this.settings.data?.code == '9000' && formData.fees) {
        for (const item of formData.fees) {
          item.parcel = parseInt(item.parcel);
          item.fee = (item.fee ? parseFloat(item.fee.toString().replace(',', '.')) : 0.0);
        }
        data.fees = formData.fees;
      }
      if (formData.uninvoiced != null) {
        data.uninvoiced = formData.uninvoiced;
      }

      if (formData.disabled != null) {
        data._isDisabled = formData.disabled;
      }

      this.paymentMethodsService.registerPaymentMethod(data).then(() => {
        this.callback.emit({ close: true });
      });
    }

    if (this.settings.type == 'Provider/Create' || this.settings.type == 'Provider/Update') {

      const code = this.settings.data.code;

      data = <IRegistersPaymentMethod>{
        _id: source._id,
        code: source.code,
        providers: {}
      };

      data.providers[code] = {
        code: code,
        name: formData.name
      };

      if (formData.bankAccount) {

        if (Utilities.isMatrix) {
          data.providers[code]['bankAccount'] = bankAccount;
        } else {
          data.providers[code]['branches'] = (data.providers[code]['branches'] || {});
          data.providers[code]['branches'][Utilities.storeID] = { bankAccount };
        }
      }

      if (formData.fee) {
        data.providers[code].fee = parseFloat(formData.fee.toString().replace(',', '.'));
      } else {
        data.providers[code].fee = 0.0;
      }

      if (formData.fees) {

        for (const item of formData.fees) {
          item.parcel = parseInt(item.parcel);
          item.fee = (item.fee ? parseFloat(item.fee.toString().replace(',', '.')) : 0.0);
        }

        data.providers[code].fees = formData.fees;
      }

      if (this.settings.type == 'Provider/Create') {
        data.providers[code].owner = Utilities.storeID;
      }

      if (formData.uninvoiced != null) {
        data.providers[code].uninvoiced = formData.uninvoiced;
      }

      if (formData.disabled != null) {
        data.providers[code]._isDisabled = formData.disabled;
      }

      this.paymentMethodsService.registerPaymentMethod(data, true).then(() => {
        this.callback.emit({ close: true });
      });
    }
  }

  // Auxiliary methods

  public onApplyNumberMask(event: any, item?: any, target?: string) {

    const value = FieldMask.numberFieldMask($$(event.target)[0].value);

    $$(event.target).val(value);

    if (item && target) {
      item[target] = value;
    }
  }

  public onApplyPercentageMask(event: any, item?: any, target?: string) {

    const value = FieldMask.percentageFieldMask($$(event.target)[0].value);

    $$(event.target).val(value);

    if (item && target) {
      item[target] = value;
    } else {
      if (target == 'fee') {
        this.formControls.fee.setValue(value);
      }
    }
  }

  private formSettings(data: any) {

    const checkType = (this.settings.type == 'Method/Update' || this.settings.type == 'Provider/Update');

    if (data.fees) {
      for (const item of data.fees) {
        item.fee = (parseFloat(item.fee).toFixed(2)).replace('.', ',');
      }
    }

    this.formPayment = this.formBuilder.group({
      name: [(checkType ? data.name : ''), Validators.required],
      fee: [(data.fee ? (parseFloat(data.fee).toFixed(2)).replace('.', ',') : '')],
      fees: [(data.fees ? data.fees : [])],
      bankAccount: [(data.bankAccount ? data.bankAccount.code : '@0001'), Validators.required],
      uninvoiced: [data.uninvoiced],
      disabled: [data._isDisabled],
      accountReceivable: [data.accountReceivable]
    });
  }

  // Destruction Method

  public ngOnDestroy() {
    this.bankAccountsService.removeListeners('records', 'PaymentMethodsRegisterComponent');
  }

}
