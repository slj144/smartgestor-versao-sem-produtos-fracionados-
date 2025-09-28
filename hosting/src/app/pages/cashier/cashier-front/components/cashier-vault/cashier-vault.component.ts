import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CashierFrontOutflowService } from '../cashier-outflow/cashier-outflow.service';
import { CashierFrontInflowService } from '../cashier-inflow/cashier-inflow.service';
import { BankAccountsService } from '../../../../financial/bank-accounts/bank-accounts.service';
import { $$ } from '@shared/utilities/essential';
import { FieldMask } from '@shared/utilities/fieldMask';

@Component({
  selector: 'cashier-front-vault',
  templateUrl: './cashier-vault.component.html',
  styleUrls: ['./cashier-vault.component.scss']
})
export class CashierFrontVaultComponent implements OnInit {
  @Output() callback: EventEmitter<any> = new EventEmitter();
  public static shared: CashierFrontVaultComponent;
  public form: FormGroup;
  public settings: any = {};
  private modalComponent: any;

  constructor(
    private formBuilder: FormBuilder,
    private outflowService: CashierFrontOutflowService,
    private inflowService: CashierFrontInflowService,
    private bankAccountsService: BankAccountsService
  ) { CashierFrontVaultComponent.shared = this; }

  public ngOnInit(): void {
    this.form = this.formBuilder.group({
      direction: ['TO_VAULT', Validators.required],
      amount: ['', Validators.required],
      note: ['']
    });
    this.callback.emit({ instance: this });
  }

  public onOpenModal(settings?: { direction?: 'TO_VAULT'|'FROM_VAULT' }): void {
    this.settings = settings || {};
    if (this.settings.direction) {
      this.form.controls.direction.setValue(this.settings.direction);
    }
    this.modalComponent.onOpen({ title: 'Cofre', mode: 'fullscreen' });
  }

  public onModalResponse(event: any) {
    if (event.instance) { this.modalComponent = event.instance; }
    if (event.close) { this.onCloseModal(); }
  }

  public onCloseModal(): void { this.form.reset({ direction: 'TO_VAULT', amount: '', note: '' }); }

  public onPriceMask(event: any) { this.form.controls.amount.setValue(FieldMask.priceFieldMask($$(event.target)[0].value)); }

  public async onSubmit() {
    if (this.form.invalid) { return; }
    const dir = this.form.value.direction as 'TO_VAULT'|'FROM_VAULT';
    const value = parseFloat(this.form.value.amount.toString().replace(/\./g,'').replace(',','.'));
    const note = (this.form.value.note || '').trim();

    await this.bankAccountsService.ensureDefaultVaultAccount();

    if (dir === 'TO_VAULT') {
      await this.outflowService.registerOutflow({
        category: { code: null, _id: null, name: 'Cofre' } as any,
        value,
        note: (note || 'Retirada para Cofre'),
        status: 1 as any
      } as any);
      const vault = await this.bankAccountsService.getVaultAccount();
      if (vault) {
        await this.bankAccountsService.registerAccount({
          code: vault.code,
          transaction: {
            bankAccount: { _id: vault._id, code: String(vault.code), name: vault.name },
            type: 'DEPOSIT' as any,
            value,
            // @ts-ignore
            description: note || 'Caixa → Cofre'
          }
        } as any);
      }
    } else {
      await this.inflowService.registerInflow({
        category: { code: null, _id: null, name: 'Cofre' } as any,
        value,
        note: (note || 'Reforço de troco (Cofre)'),
        status: 1 as any
      } as any);
      const vault = await this.bankAccountsService.getVaultAccount();
      if (vault) {
        await this.bankAccountsService.registerAccount({
          code: vault.code,
          transaction: {
            bankAccount: { _id: vault._id, code: String(vault.code), name: vault.name },
            type: 'WITHDRAW' as any,
            value,
            // @ts-ignore
            description: note || 'Cofre → Caixa'
          }
        } as any);
      }
    }
    this.modalComponent.onClose();
  }
}
