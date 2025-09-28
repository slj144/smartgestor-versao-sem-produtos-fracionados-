import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// Translate
import { BankAccountsTranslate } from '@pages/financial/bank-accounts/bank-accounts.translate';

// Services
import { BankAccountsService } from '@pages/financial/bank-accounts/bank-accounts.service';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { FieldMask } from '@shared/utilities/fieldMask';

@Component({
  selector: 'bank-accounts-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.scss']
})
export class BankAccountsTransferComponent implements OnInit, OnDestroy {

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  public translate = BankAccountsTranslate.get()['modal']['action']['transfer'];

  public settings: any = {};
  public checkBootstrap: boolean = false;

  public formTransfer: FormGroup;
  public accounts: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private bankAccountsService: BankAccountsService
  ) {}

  public ngOnInit(): void {
    this.callback.emit({ instance: this });
  }

  /**
   * Initializes component with provided context
   * settings: { sourceAccountCode?: string }
   */
  public bootstrap(settings: any = {}): void {
    this.settings = settings || {};

    // Load accounts list on bootstrap (non-reactive snapshot to avoid listeners)
    this.bankAccountsService.query(null, true, false, false, false).then((records) => {
      this.accounts = records || [];
      this.formSettings();
      this.checkBootstrap = true;
    });
  }

  public get formControls() {
    return this.formTransfer.controls;
  }

  public onPriceFieldMask(event: any, control: any) {
    control.setValue(FieldMask.priceFieldMask($$(event.target)[0].value));
  }

  public onSubmit(): void {
    if (this.formTransfer.invalid) { return; }

    const formData = this.formTransfer.value;

    const amount = parseFloat(formData.amount.toString().replace(/\./g, '').replace(',', '.'));
    const description = (formData.description || '').trim();

    this.bankAccountsService
      .transferBetweenAccounts(formData.fromCode, formData.toCode, amount, description)
      .then(() => this.callback.emit({ success: true, payload: { fromCode: formData.fromCode, toCode: formData.toCode, amount } }))
      .catch((e) => {
        // surfaced by notification service; keep console for maintenance
        console.error('Bank transfer error:', e?.message || e);
      });
  }

  private formSettings(): void {
    const prefilledFrom = this.settings?.sourceAccountCode ? String(this.settings.sourceAccountCode) : '';

    this.formTransfer = this.formBuilder.group({
      fromCode: [prefilledFrom, Validators.required],
      toCode: ['', Validators.required],
      amount: ['', Validators.required],
      description: ['']
    });

    // Mantém a lista completa; validação de origem=destino é feita no serviço
  }

  public ngOnDestroy(): void {
    this.settings = {};
    this.accounts = [];
  }
}
