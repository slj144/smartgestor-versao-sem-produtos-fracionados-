import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { iTools } from '../../../../../../assets/tools/iTools';

// Services
import { CashierFrontControlService } from './cashier-control.service';

// Translate
import { CashierFrontControlTranslate } from './cashier-control.translate';

// Interfaces
import { ICashierControl } from '@shared/interfaces/ICashierControl';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { FieldMask } from '@shared/utilities/fieldMask';

@Component({
  selector: 'cashier-front-control',
  templateUrl: './cashier-control.component.html',
  styleUrls: ['./cashier-control.component.scss']
})
export class CashierFrontControlComponent implements OnInit {
  
  @Input() settings: any = {};
  @Input() permissions: any = {};

  public translate = CashierFrontControlTranslate.get();

  public formCash: FormGroup;
  public username: string = Utilities.operator.name.split(' ')[0];

  public isAdmin = Utilities.isAdmin;

  constructor(
    private formBuilder: FormBuilder,
    private cashierFrontControlService: CashierFrontControlService
  ) {

  }

  public ngOnInit() {
    this.formSettings();
  }

  // Getter and Setter Methods

  public get formControls() {
    return this.formCash.controls;
  }

  // User Interface Actions

  public onConfirmOpening() {

    const formData = this.formCash.value;

    const data: ICashierControl = {
      opening: { 
        value: (() => {
          return parseFloat(((formData.balance || 0).toString()).replace(/\./g,'').replace(',','.'));
        })(), 
        date: iTools.FieldValue.date(Utilities.timezone)
      }
    };

    this.cashierFrontControlService.openCashier(data);
  }

  public onConfirmClosing() {

    const data: ICashierControl = this.settings.cashierControl;
    data.closing.date = iTools.FieldValue.date(Utilities.timezone);

    this.cashierFrontControlService.closeCashier(data).then(() => {
      this.formSettings();
      this.settings.callback({ closed: true });
    });
  }

  public onBack() {
    this.settings.callback({ back: true });
  }

  // Auxiliary Methods

  public onApplyPriceMask(event: Event, control: AbstractControl) {
    control.setValue(FieldMask.priceFieldMask($$(event.target)[0].value));
  }

  private formSettings() {

    this.formCash = this.formBuilder.group({
      balance: ['0,00']      
    });

    if (this.settings && this.settings.cashierControl && this.settings.cashierControl.closing) {
      const value = FieldMask.priceFieldMask(Number(this.settings.cashierControl.closing.value).toFixed(2).replace('.', ','));
      this.formCash.controls.balance.setValue(value);
    }
  }

}
