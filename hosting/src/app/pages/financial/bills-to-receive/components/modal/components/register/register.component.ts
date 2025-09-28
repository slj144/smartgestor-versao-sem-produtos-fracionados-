import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// Components
import { PaymentMethodsSelectorComponent } from '../../../../../../registers/paymentMethods/components/selector/selector.component';

// Services
import { BillsToReceiveService } from '../../../../bills-to-receive.service';

// Translate
import { BillsToReceiveTranslate } from '../../../../bills-to-receive.translate';

// Interfaces
import { IFinancialBillToReceive, EFinancialBillToReceiveDebtorType, EFinancialBillToReceiveOrigin, EFinancialBillToReceiveStatus, EFinancialBillToReceiveInstallmentStatus } from '@shared/interfaces/IFinancialBillToReceive';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { FieldMask } from '@shared/utilities/fieldMask';
import { DateTime } from '@shared/utilities/dateTime';

@Component({
  selector: 'bills-to-receive-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class BillsToReceiveRegisterComponent implements OnInit {

  @Output() public callback: EventEmitter<any> = new EventEmitter(); 
 
  @Input() data: any = {};
  @Input() embed: boolean = false;

  public translate = BillsToReceiveTranslate.get()['modal']['action']['register'];  

  public settings: any = {};
  public toastSettings: any = {};
  public checkBootstrap: boolean = false;

  public formBills: FormGroup;

  private layerComponent: any;
  private toastComponent: any;

  constructor(
    private formBuilder: FormBuilder,
    private billsToReceiveService: BillsToReceiveService
  ) {}

  public ngOnInit() {
    this.callback.emit({ instance: this });     
  }

  // Initialize Methods

  public bootstrap(settings: any = {}) {

    this.settings = settings;
    this.settings.data = (settings.data || {});

    if (this.settings.data && this.settings.data.debtor) {

      if (
        this.settings.data.debtor.phone || this.settings.data.debtor.email
      ) {
        this.settings.data.debtor.contacts = {};
      }

      if (this.settings.data.debtor.phone) {
        this.settings.data.debtor.contacts.phone = this.settings.data.debtor.phone;
        delete this.settings.data.debtor.phone;
      }

      if (this.settings.data.debtor.email) {
        this.settings.data.debtor.contacts.email = this.settings.data.debtor.email;
        delete this.settings.data.debtor.email;
      }
    }

    if (this.settings.data && this.settings.data.installments) {

      for (const parcel of this.settings.data.installments) {
        parcel.dueDate = DateTime.formatDate(parcel.dueDate, 'string', 'BR', 'D');
        parcel.amount = FieldMask.priceFieldMask(String(parseFloat(parcel.amount).toFixed(2)));
        parcel.receivedAmount = FieldMask.priceFieldMask(String(parseFloat(parcel.receivedAmount).toFixed(2)));
      }
    }

    this.formSettings(this.settings.data);
    this.checkBootstrap = true;
  }

  // Getter and Setter Methods

  public get formControls() {
    return this.formBills.controls;
  }  

  public get receivedInstallments() {

    let result = 0;

    if (this.formControls.installments.value) {
      $$(this.formControls.installments.value).map((_, item) => {
        result += ((item.status == EFinancialBillToReceiveInstallmentStatus.CONCLUDED) ? 1 : 0);
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

  public get received() {

    let result = 0;

    $$(this.formControls.installments.value).map((_, item) => {
      result += parseFloat(item.receivedAmount.toString().replace(/\./g,'').replace(',','.'));
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
      receivedAmount: FieldMask.priceFieldMask(String(parseFloat('0').toFixed(2))),
      amount: FieldMask.priceFieldMask(String(lastParcel && lastParcel.amount ? lastParcel.amount : 0))
    });

    this.formControls.installments.setValue(installments);
  }
  
  public onOpenParcel(data: any) {

    data = Utilities.deepClone(data);

    data.dueDate = DateTime.formatDate(data.dueDate, 'string', 'US', 'D');
    data.amount = (parseFloat(data.amount.replace(/\./g,'').replace(',','.')) || 0);
    data.receivedAmount = (parseFloat(String(data.paidAmount).replace(/\./g,'').replace(',','.')) || 0);

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

  // User Interface Actions - Register

  public onConfirmReceipt() {

    $$(this.formControls.installments.value).map((_, item) => {

      if (item.parcel == this.toastSettings.parcel) {
        
        item.paymentMethods = Utilities.deepClone(this.toastSettings.paymentMethods);

        item.discount = FieldMask.priceFieldMask(String(parseFloat(this.toastSettings.balance.discount || '0').toFixed(2)));
        item.interest = FieldMask.priceFieldMask(String(parseFloat(this.toastSettings.balance.interest || '0').toFixed(2)));
        item.receivedAmount = FieldMask.priceFieldMask(String(parseFloat(this.toastSettings.balance.receivedAmount || '0').toFixed(2)));

        const amount = parseFloat(item.amount.toString().replace(/\./g,'').replace(',','.'));
        const discount = parseFloat(item.discount.toString().replace(/\./g,'').replace(',','.'));
        const interest = parseFloat(item.interest.toString().replace(/\./g,'').replace(',','.'));
        const receivedAmount = parseFloat(item.receivedAmount.toString().replace(/\./g,'').replace(',','.'));

        const value = (amount - discount + interest);

        item.status = ((value == receivedAmount) ? EFinancialBillToReceiveInstallmentStatus.CONCLUDED : EFinancialBillToReceiveInstallmentStatus.PENDENT);

        if (item.status == EFinancialBillToReceiveInstallmentStatus.CONCLUDED) {
          item.receiptDate = DateTime.getDate('D');
        }
      }
    });

    this.toastComponent.onClose();

    PaymentMethodsSelectorComponent.shared.reset();
  }

  public onFixInstallment(event, item){

    const value = parseFloat($$(event.target)[0].value.toString().replace(/\./g,'').replace(',','.'));
    const receivedAmount = parseFloat(item.receivedAmount.toString().replace(/\./g,'').replace(',','.'));

    if(receivedAmount >= value){
      item.status = EFinancialBillToReceiveInstallmentStatus.CONCLUDED;
    }else{
      item.status = EFinancialBillToReceiveInstallmentStatus.PENDENT;
    }
  }

  public onSubmit() {       
    
    const formData = Utilities.deepClone(this.formBills.value);
    const source = Utilities.deepClone(this.settings.data);

    const debtor = (() => {

      const debtor: any = formData.debtor;

      const result: any = {
        _id: debtor._id, 
        code: debtor.code, 
        name: debtor.name,
        type: EFinancialBillToReceiveDebtorType.CUSTOMER,
        address: debtor.address
      };

      if (debtor.contacts && debtor.contacts.email) {
        result.email = debtor.contacts.email;
      }

      if (debtor.contacts && debtor.contacts.phone) {
        result.phone = debtor.contacts.phone;
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

        item.dueDate = DateTime.formatDate(item.dueDate, 'string', 'US', 'D');
        item.discount = parseFloat(String(item.discount).replace(/\./g,'').replace(',','.'));
        item.interest = parseFloat(String(item.interest).replace(/\./g,'').replace(',','.'));
        item.receivedAmount = parseFloat(String(item.receivedAmount).replace(/\./g,'').replace(',','.'));
        item.amount = parseFloat(String(item.amount).replace(/\./g,'').replace(',','.'));

        result.push(item);
      });

      return result;
    })();

    const currentInstallment = (() => {

      let result = 0;
      let checkParcel = false;

      $$(formData.installments).map((k, item) => {
        if ((item.receivedAmount != undefined) && (item.receivedAmount != item.amount)) {
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

      let result = (source.status || EFinancialBillToReceiveStatus.PENDENT);

      if (this.receivedInstallments == this.totalInstallments) {
        result = EFinancialBillToReceiveStatus.CONCLUDED;
      }
      
      return result;
    })();

    const data: IFinancialBillToReceive = {
      _id: source._id,
      code: source.code,
      debtor: debtor,
      category: category,
      installments: installments,
      origin: (source.origin || EFinancialBillToReceiveOrigin.FINANCIAL),
      status: status,
      description: formData.description,
      receivedInstallments: this.receivedInstallments,
      totalInstallments: this.totalInstallments,
      currentInstallment: currentInstallment,
      received: this.received,
      amount: this.amount
    };

    if (source.referenceCode) {
      data.referenceCode = source.referenceCode;
    }

    if (!this.embed) { 

      this.billsToReceiveService.registerBill(data).then(() => {
        this.callback.emit({ close: true });
      });
    } else {
      this.callback.emit({ data });
    }
  }

  // Layer Actions

  public onOpenLayer(type: string) {
    
    this.layerComponent.onOpen({ 
      activeComponent: type, selectItem: { code: this.formControls.category.value }
    });
  }

  // Event Listeners

  public onLayerResponse(event: any) {

    if (event.instance) {
      this.layerComponent = event.instance;
    }

    if (event.debtor) {
      this.formControls.debtor.setValue(event.debtor);
    }

    if (event.category) {
      this.formControls.category.setValue(event.category);
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
          item.receivedAmount = FieldMask.priceFieldMask(paidAmount.toFixed(2).toString());
        }else{
          item.receivedAmount = "0,0";
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

      let totalReceived = 0;

      for (const item of this.toastSettings.paymentMethods) {       
        totalReceived += (item.value || 0);
      }
      
      this.toastSettings.balance.receivedAmount = totalReceived;
    }
  }

  // Setting Methods

  private formSettings(data: any = {}) {

    this.formBills = this.formBuilder.group({
      debtor: [(data.debtor || ''), Validators.required],
      category: [(data.category || ''), Validators.required],      
      installments: [(data.installments || [])],
      description: [(data.description || '')],
      amount: [(data.amount || 0)]
    });
  }

}
