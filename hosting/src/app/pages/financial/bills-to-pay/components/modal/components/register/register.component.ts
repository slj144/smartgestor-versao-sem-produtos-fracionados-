import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// Components
import { PaymentMethodsSelectorComponent } from '@pages/registers/paymentMethods/components/selector/selector.component';

// Services
import { BillsToPayService } from '@pages/financial/bills-to-pay/bills-to-pay.service';
import { ProductDepartmentsService } from '@pages/registers/_aggregates/stock/product-departments/product-departments.service';

// Translate
import { BillsToPayTranslate } from '@pages/financial/bills-to-pay/bills-to-pay.translate';

// Interfaces
import {
  IFinancialBillToPay,
  EFinancialBillToPayBeneficiaryType,
  EFinancialBillToPayOrigin,
  EFinancialBillToPayStatus,
  EFinancialBillToPayInstallmentStatus
} from '@shared/interfaces/IFinancialBillToPay';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { FieldMask } from '@shared/utilities/fieldMask';
import { DateTime } from '@shared/utilities/dateTime';

@Component({
  selector: 'bills-to-pay-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class BillsToPayRegisterComponent implements OnInit, OnDestroy {

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  @Input() data: any = {};
  @Input() embed: boolean = false;

  public translate = BillsToPayTranslate.get()['modal']['action']['register'];

  public settings: any = {};
  public toastSettings: any = {};
  public checkBootstrap: boolean = false;

  public formBills: FormGroup;
  public departmentsData: any[] = [];

  private layerComponent: any;
  private toastComponent: any;
  private readonly departmentsListenerId = 'BillsToPayRegisterDepartments';

  constructor(
    private formBuilder: FormBuilder,
    private billsToPayService: BillsToPayService,
    private productDepartmentsService: ProductDepartmentsService
  ) {}

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  public ngOnDestroy(): void {
    // Refresh listener to avoid duplications when the modal is reopened
    this.productDepartmentsService.removeListeners('records', this.departmentsListenerId);
  }

  // Initialize Methods

  public bootstrap(settings: any = {}) {

    this.settings = settings;
    this.settings.data = (settings.data || {});

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

    if (this.settings.data && this.settings.data.installments) {

      for (const parcel of this.settings.data.installments) {
        parcel.dueDate = DateTime.formatDate(parcel.dueDate, 'string', 'BR', 'D');
        parcel.amount = FieldMask.priceFieldMask(String(parseFloat(parcel.amount).toFixed(2)));
        parcel.paidAmount = FieldMask.priceFieldMask(String(parseFloat(parcel.paidAmount).toFixed(2)));
      }
    }

    this.formSettings(this.settings.data);
    this.loadDepartments();
    this.checkBootstrap = true;
  }

  // Getter and Setter Methods

  public get formControls() {
    return this.formBills.controls;
  }

  public get useDepartments(): boolean {
    return Utilities.stockDepartmentsEnabled;
  }

  public get paidInstallments() {

    let result = 0;

    if (this.formControls.installments.value) {
      $$(this.formControls.installments.value).map((_, item) => {
        result += ((item.status == EFinancialBillToPayInstallmentStatus.CONCLUDED) ? 1 : 0);
      });
    }

    return result;
  }

  public get totalInstallments() {

    if (!this.formControls.installments.value) {
      this.formControls.installments.setValue([]);
    }

    return this.formControls.installments.value.length;
  }

  public get paid() {

    let result = 0;

    $$(this.formControls.installments.value).map((_, item) => {
      result += parseFloat(item.paidAmount.toString().replace(/\./g,'').replace(',','.'));
    });

    return result;
  }

  public get amount() {

    let result = 0;

    $$(this.formControls.installments.value).map((_, item) => {
      result += parseFloat(item.amount.toString().replace(/\./g,'').replace(',','.'));
    });

    return result;
  }

  // User Interface Actions

  public onCreateParcel() {

    const installments = (this.formControls.installments.value || []);
    const firstParcel = installments[0];
    const lastParcel = installments[installments.length - 1];

    const firstDueDate = DateTime.formatDate((firstParcel && firstParcel.dueDate ? firstParcel.dueDate : DateTime.getDate('D')), 'string', 'US', 'DH');
    const lastDueDate = DateTime.formatDate((lastParcel && lastParcel.dueDate ? lastParcel.dueDate : DateTime.getDate('D')), 'string', 'US', 'DH');

    const nextDueDate = new Date(lastDueDate);
    nextDueDate.setDate(nextDueDate.getDate() + 31);

    const compensating = ((new Date(firstDueDate).getDate()) - nextDueDate.getDate());
    nextDueDate.setDate(compensating > 0 ? (nextDueDate.getDate() + compensating) : (nextDueDate.getDate() - (compensating * -1)));

    installments.push({
      parcel: (installments.length + 1),
      dueDate: DateTime.formatDate(nextDueDate.toISOString(), 'string', 'BR', 'D'),
      discount: 0,
      interest: 0,
      paidAmount: FieldMask.priceFieldMask(String(parseFloat('0').toFixed(2))),
      amount: FieldMask.priceFieldMask(String(lastParcel && lastParcel.amount ? lastParcel.amount : 0)),
      status: EFinancialBillToPayInstallmentStatus.PENDENT
    });

    this.formControls.installments.setValue(installments);
  }

  public onOpenParcel(data: any) {

    data = Utilities.deepClone(data);

    data.dueDate = DateTime.formatDate(data.dueDate, 'string', 'US', 'D');
    data.amount = (parseFloat(String(data.amount).replace(/\./g,'').replace(',','.')) || 0);
    data.paidAmount = (parseFloat(String(data.paidAmount).replace(/\./g,'').replace(',','.')) || 0);

    this.toastSettings = data;

    this.toastComponent.onOpen({
      title: this.translate.toast.title,
      width: 700
    });

    PaymentMethodsSelectorComponent.shared.selectMethods(data.paymentMethods);

    this.calcBalance();
  }

  public onDeleteParcel(index: number) {

    const installments = this.formControls.installments.value;
    installments.splice(index, 1);

    $$(installments).map((k, item) => {

      const installments = (this.formControls.installments.value || []);
      const firstParcel = (k > 0 ? installments[0] : null);
      const beforeParcel = (k > 0 && installments.length > 0 ? installments[k - 1] : null);

      const firstDueDate = DateTime.formatDate((firstParcel && firstParcel.dueDate ? firstParcel.dueDate : DateTime.getDate('D')), 'string', 'US', 'DH');
      const lastDueDate = DateTime.formatDate((beforeParcel && beforeParcel.dueDate ? beforeParcel.dueDate : DateTime.getDate('D')), 'string', 'US', 'DH');

      const nextDueDate = new Date(lastDueDate);
      nextDueDate.setDate(nextDueDate.getDate() + 31);

      const compensating = ((new Date(firstDueDate).getDate()) - nextDueDate.getDate());
      nextDueDate.setDate(compensating > 0 ? (nextDueDate.getDate() + compensating) : (nextDueDate.getDate() - (compensating * -1)));

      item.parcel = (k + 1);
      item.dueDate = DateTime.formatDate(nextDueDate.toISOString(), 'string', 'BR', 'D');
    });

    this.formControls.installments.setValue(installments);
  }

  // User Interface Actions - Payment Methods

  public onDeletePaymentMethod(index: number) {
    PaymentMethodsSelectorComponent.shared.deselectMethod(this.toastSettings.paymentMethods[index]);
    this.calcBalance();
  }

  public onPaymentValue(data: any, inputField: any) {

    inputField.value = FieldMask.priceFieldMask(inputField.value);
    data.value = parseFloat(inputField.value != '' ? inputField.value.replace(/\./g,'').replace(',','.') : 0);

    this.calcBalance();
  }

  public onPaymentParcel(data: any, selectField: any) {

    const parcel = selectField.value;

    for (const item of data.fees) {

      if (item.hasOwnProperty('selected')) {
        delete item.selected;
      }

      if (item.parcel == parcel) {
        item.selected = true;
      }
    }
  }

  public onFixInstallment(event, item){

    const value = parseFloat($$(event.target)[0].value.toString().replace(/\./g,'').replace(',','.'));
    const paidAmount = parseFloat(item.paidAmount.toString().replace(/\./g,'').replace(',','.'));

    if(paidAmount >= value){
      item.status = EFinancialBillToPayInstallmentStatus.CONCLUDED;
    }else{
      item.status = EFinancialBillToPayInstallmentStatus.PENDENT;
    }
  }

  // User Interface Actions - Register

  public onConfirmPayment() {

    $$(this.formControls.installments.value).map((_, item) => {

      if (item.parcel == this.toastSettings.parcel) {

        item.paymentMethods = Utilities.deepClone(this.toastSettings.paymentMethods);

        item.discount = FieldMask.priceFieldMask(String(parseFloat(this.toastSettings.balance.discount || '0').toFixed(2)));
        item.interest = FieldMask.priceFieldMask(String(parseFloat(this.toastSettings.balance.interest || '0').toFixed(2)));
        item.paidAmount = FieldMask.priceFieldMask(String(parseFloat(this.toastSettings.balance.paidAmount || '0').toFixed(2)));

        const amount = parseFloat(item.amount.toString().replace(/\./g,'').replace(',','.'));
        const discount = parseFloat(item.discount.toString().replace(/\./g,'').replace(',','.'));
        const interest = parseFloat(item.interest.toString().replace(/\./g,'').replace(',','.'));
        const paidAmount = parseFloat(item.paidAmount.toString().replace(/\./g,'').replace(',','.'));

        const value = (amount - discount + interest);

        item.status = ((paidAmount >= value) ? EFinancialBillToPayInstallmentStatus.CONCLUDED : EFinancialBillToPayInstallmentStatus.PENDENT);

        if (item.status == EFinancialBillToPayInstallmentStatus.CONCLUDED) {
          item.paymentDate = DateTime.getDate('D');
        }
      }
    });

    this.toastComponent.onClose();

    PaymentMethodsSelectorComponent.shared.reset();
  }
  

  public onSubmit() {

    const formData = Utilities.deepClone(this.formBills.value);
    const source = Utilities.deepClone(this.settings.data);

    const beneficiary = (() => {

      const beneficiary: any = formData.beneficiary;

      const result: any = {
        _id: beneficiary._id,
        code: beneficiary.code,
        name: beneficiary.name,
        type: EFinancialBillToPayBeneficiaryType.PROVIDER,
        address: beneficiary.address
      };

      if (beneficiary.contacts && beneficiary.contacts.email) {
        result.email = beneficiary.contacts.email;
      }

      if (beneficiary.contacts && beneficiary.contacts.phone) {
        result.phone = beneficiary.contacts.phone;
      }

      return result;
    })();

    const category = (() => {

      const category = formData.category;

      const result: any = {
        _id: category._id,
        code: category.code,
        name: category.name
      };

      return result;
    })();

    const installments = (() => {

      let result = [];

      $$(formData.installments).map((_, item) => {

        item.dueDate = DateTime.formatDate(item.dueDate).date;
        item.discount = parseFloat(String(item.discount).replace(/\./g,'').replace(',','.'));
        item.interest = parseFloat(String(item.interest).replace(/\./g,'').replace(',','.'));
        item.amount = parseFloat(String(item.amount).replace(/\./g,'').replace(',','.'));
        item.paidAmount = parseFloat(String(item.paidAmount).replace(/\./g,'').replace(',','.'));

        result.push(item);
      });

      return result;
    })();

    const currentInstallment = (() => {

      let result = 0;
      let checkParcel = false;

      $$(formData.installments).map((k, item) => {
        if ((item.paidAmount != undefined) && (item.paidAmount != item.amount)) {
          result = k; checkParcel = true;
          return true;
        }
      });

      if (!checkParcel) {
        result = ($$(formData.installments).length - 1);
      }

      return result;
    })();

    const status = (() => {

      let result = (source.status || EFinancialBillToPayStatus.PENDENT);

      if (this.paidInstallments >= this.totalInstallments) {
        result = EFinancialBillToPayStatus.CONCLUDED;
      }

      return result;
    })();

    const data: IFinancialBillToPay = {
      _id: source._id,
      code: source.code,
      beneficiary: beneficiary,
      category: category,
      installments: installments,
      origin: (source.origin || EFinancialBillToPayOrigin.FINANCIAL),
      status: status,
      description: formData.description,
      paidInstallments: this.paidInstallments,
      totalInstallments: this.totalInstallments,
      currentInstallment: currentInstallment,
      paid: this.paid,
      amount: this.amount
    };

    if (source.referenceCode) {
      data.referenceCode = source.referenceCode;
    }

    const departmentPayload = this.buildDepartmentPayload(formData.department, source.department);

    if (departmentPayload === '$unset') {
      (data as any).department = (<any>'$unset()');
    } else if (departmentPayload) {
      data.department = departmentPayload;
    }

    if (!this.embed) {

      this.billsToPayService.registerBill(data).then(() => {
        this.callback.emit({ close: true });
      });
    } else {
      this.callback.emit({ data });
    }
  }

  // Layer Actions

  public onOpenLayer(type: string) {

    this.layerComponent.onOpen({
      activeComponent: type,
      selectItem: {
        code: (type === 'departments' ? this.formControls.department.value : this.formControls.category.value)
      }
    });
  }

  // Event Listeners

  public onLayerResponse(event: any) {

    if (event.instance) {
      this.layerComponent = event.instance;
    }

    if (event.beneficiary) {
      this.formControls.beneficiary.setValue(event.beneficiary);
    }

    if (event.category) {
      this.formControls.category.setValue(event.category);
    }

    if (event.department) {
      this.formControls.department.setValue(this.normalizeDepartmentPayload(event.department));
    }

    if (event.paymentMethods) {

      if (this.toastSettings) {
        this.toastSettings.paymentMethods = event.paymentMethods
      }

    }
  }

  public onToastResponse(event: any) {

    if (event.instance) {
      this.toastComponent = event.instance;
    }

    if (event.close) {
      const installments = this.formControls.installments.value;

      installments.forEach((item)=>{
        if(item.paymentMethods?.length > 0){
          let paidAmount = 0;
          item.paymentMethods.forEach((method)=>{
            paidAmount += method.value || 0;
          });
          item.paidAmount = FieldMask.priceFieldMask(paidAmount.toFixed(2).toString());
        }else{
          item.paidAmount = "0,0";
        }
      });
    }
  }

  // Auxiliary Methods

  public onApplyDateMask(event: Event, item?: any) {

    const value = FieldMask.dateFieldMask($$(event.target)[0].value);

    $$(event.target).val(value);
    item.dueDate = value;
  }

  public onApplyValueMask(event: Event, item?: any) {

    const value = FieldMask.priceFieldMask($$(event.target)[0].value);

    $$(event.target).val(value);
    item.amount = value;
  }

  // External Methods

  public reset() {
    this.formBills.reset();
    this.layerComponent.onClose();
  }

  // Calc Methods

  private calcBalance() {

    if (!this.toastSettings.balance) {
      this.toastSettings.balance = {};
    }

    if (this.toastSettings.paymentMethods && this.toastSettings.paymentMethods.length > 0) {

      let totalPaid = 0;

      for (const item of this.toastSettings.paymentMethods) {
        totalPaid += (item.value || 0);
      }

      this.toastSettings.balance.paidAmount = totalPaid;
    }
  }

  private buildDepartmentPayload(selected: any, source: any) {

    if (!this.useDepartments) {
      return undefined;
    }

    if (selected) {
      const rawCode = selected.code;
      const stringCode = String(rawCode ?? '').trim();
      const numeric = parseInt(stringCode, 10);

      return {
        _id: selected._id,
        code: (!stringCode.startsWith('@') && !isNaN(numeric)) ? numeric : stringCode,
        name: selected.name
      };
    }

    // When the user clears the field we explicitly remove the stored department
    if (source) {
      return '$unset';
    }

    return null;
  }

  // Setting Methods

  private formSettings(data: any = {}) {

    const currentDepartment = data.department ? this.normalizeDepartmentPayload(data.department) : null;

    this.formBills = this.formBuilder.group({
      beneficiary: [(data.beneficiary || ''), Validators.required],
      category: [(data.category || ''), Validators.required],
      installments: [(data.installments || [])],
      description: [(data.description || '')],
      amount: [(data.amount || 0)],
      department: [currentDepartment]
    });
  }

  private loadDepartments(): void {

    if (!this.useDepartments) {
      this.departmentsData = [];
      this.formBills?.get('department')?.setValue(null);
      return;
    }

    this.productDepartmentsService.removeListeners('records', this.departmentsListenerId);
    this.productDepartmentsService.getDepartments(this.departmentsListenerId, (records) => {

      const formatted = (records || []).map((item) => ({
        ...item,
        displayCode: this.formatDepartmentCode(item.code)
      }));

      this.departmentsData = formatted;

      const control = this.formBills?.get('department');
      if (!control) {
        return;
      }

      const current = control.value;
      if (!current) {
        return;
      }

      const matched = this.departmentsData.find((item) => (
        (current?._id && item._id === current._id) ||
        (item.code === current?.code) ||
        (this.formatDepartmentCode(item.code) === this.formatDepartmentCode(current?.code))
      ));

      if (matched) {
        control.setValue(matched, { emitEvent: false });
      } else {
        control.setValue(null, { emitEvent: false });
      }
    });
  }

  private formatDepartmentCode(code: number | string): string {
    const stringCode = String(code ?? '').trim();
    if (stringCode.startsWith('@')) {
      return stringCode;
    }

    const numeric = parseInt(stringCode, 10);
    return isNaN(numeric) ? stringCode : Utilities.prefixCode(numeric);
  }

  private normalizeDepartmentPayload(department: any) {
    if (!department) {
      return null;
    }

    const matched = this.departmentsData.find((item) => (
      (department._id && item._id === department._id) ||
      (this.formatDepartmentCode(item.code) === this.formatDepartmentCode(department.code))
    ));

    if (matched) {
      return matched;
    }

    return {
      ...department,
      displayCode: this.formatDepartmentCode(department.code)
    };
  }

}
