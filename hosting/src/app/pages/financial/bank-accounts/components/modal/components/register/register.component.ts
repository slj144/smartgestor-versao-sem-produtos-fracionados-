import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { iTools } from '@itools/index';

// Translate
import { BankAccountsTranslate } from '@pages/financial/bank-accounts/bank-accounts.translate';

// Services
import { BankAccountsService } from '@pages/financial/bank-accounts/bank-accounts.service';

// Interfaces
import { IFinancialBankAccount } from '@shared/interfaces/IFinancialBankAccount';
import { EFinancialBankTransactionType } from '@shared/interfaces/IFinancialBankTransaction';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { FieldMask } from '@shared/utilities/fieldMask';

@Component({
  selector: 'bank-accounts-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class BankAccountsRegisterComponent implements OnInit {

  @Output() public callback: EventEmitter<any> = new EventEmitter(); 
 
  public translate = BankAccountsTranslate.get()['modal']['action']['register'];

  public settings: any = {};
  public checkBootstrap: boolean = false;
  
  public formBankAccount: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private bankAccountsService: BankAccountsService
  ) {}

  public ngOnInit() {   
    this.callback.emit({ instance: this });     
  }

  // Initialize Method

  public bootstrap(settings: any = {}) {

    this.settings = settings;
    this.formSettings(this.settings.data);  
    
    this.checkBootstrap = true;
  }

  // Getter and Setter Methods

  public get formControls() {
    return this.formBankAccount.controls;
  }  
  
  // User Interface Actions

  public onSubmit() {
    
    const formData = this.formBankAccount.value;
    const source = this.settings.data;

    const data: IFinancialBankAccount = {
      _id: (source._id || null),
      code: formData.code,
      name: formData.name,
      account: formData.account,
      agency: formData.agency,
      balance: parseFloat(formData.balance.toString().replace(/\./g,'').replace(',','.')),
      owner: Utilities.storeID,
      modifiedDate: iTools.FieldValue.date(Utilities.timezone)
    }

    const transactionValue = (!source.balance ? <number>data.balance : (<number>data.balance - source.balance));

    if (transactionValue != 0) {

      data.transaction = {
        type: (transactionValue > 0 ? EFinancialBankTransactionType.DEPOSIT : EFinancialBankTransactionType.WITHDRAW),
        bankAccount: {
          code: formData.code,
          name: formData.name
        },
        value: (transactionValue >= 0 ? transactionValue : (transactionValue * -1))
      };
    }

    this.bankAccountsService.registerAccount(data).then(() => {
      this.callback.emit({ close: true });
    });
  } 

  // Auxiliary Methods - Public

  public onNumberFieldMask(event: any, control: AbstractControl) {
    control.setValue(FieldMask.numberFieldMask($$(event.target)[0].value, null, null, true));
  } 

  public onPriceFieldMask(event: any, control: AbstractControl) {
    control.setValue(FieldMask.priceFieldMask($$(event.target)[0].value));
  }
 
  // Auxiliary Methods - Private

  private formSettings(data: any = {}) {

    this.formBankAccount = this.formBuilder.group({
      code: [(data.code || '')],
      name: [(data.name || ''), Validators.required],
      agency: [(data.agency || ''), Validators.required],
      account: [(data.account || ''), Validators.required],
      balance: [(FieldMask.priceFieldMask((data.balance | 0).toFixed(2).replace('.', ','))), Validators.required]
    });
  }  

  // Destruction Methods

  public ngOnDestroy() {
    
  }

}
