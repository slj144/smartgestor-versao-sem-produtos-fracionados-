import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';

// Services

// Utilties
import { $$ } from '@shared/utilities/essential';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NfPaymentMethodsSelectorComponent } from '../selector/selector.component';
import { FieldMask } from '@shared/utilities/fieldMask';

@Component({
  selector: 'nf-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class NfPaymentsComponent implements OnInit, OnDestroy, OnChanges {

  @Output() callback: EventEmitter<any> = new EventEmitter();
  @Input() data: any = {};
  @ViewChild("paymentsComponent", {static: false}) containerElement: ElementRef;

  public form: FormGroup;
  public checkSearchPostCode: boolean = false;
  public loading: boolean = true;  

  get formControls(){
    return this.form.controls;
  }

  constructor(
    private formBuilder: FormBuilder
  ) {}

  public ngOnInit() {
    this.callback.emit({ instance: this });
    this.config();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.config();
  }

  // Initialize Method

  public bootstrap(data: any) {
    this.data = data;
    this.config();
  }


  private config(){

    this.form = this.formBuilder.group({   });

    this.loading = false;

    this.callback.emit({ data: this.data.paymentMethods });
  }

  // Masks

  // User Interface Actions Payments

  private checkPayment() {

    // if (this.data.paymentMethods && (this.data.paymentMethods).length > 0) {

    //   let value = 0;

      // for (const method of this.data.paymentMethods) {
      //   if (!method.value) { method.value = 0; }
      // }

    //   if (value <= this.data.balance.totalSale) {

    //     this.settings.paymentMethods = {
    //       status: 'ACCEPTED',
    //       value: value
    //     };
    //   } else {

    //     this.settings.paymentMethods = {
    //       status: 'REFUSED',
    //       value: value
    //     };
    //   }
    // }

    this.getReceivedPayment();
    this.callback.emit({data: this.data.paymentMethods});
  }

  public onDeletePaymentItem(index: number) {
    NfPaymentMethodsSelectorComponent.shared.deselectMethod(this.data.paymentMethods[index]);
    this.checkPayment();
  }

  public onPaymentValue(data: any, inputField: any) {

    inputField.value = FieldMask.priceFieldMask(inputField.value);
    data.value = parseFloat(inputField.value != '' ? inputField.value.replace(/\./g,'').replace(',','.') : 0);

    this.checkPayment();    
  }

  public onAvista(data, inputField: any){
    data.aVista = inputField.value == "true";
    this.callback.emit({data: this.data.paymentMethods});
  }
  
  public onloadPaymentMethod(item, className){

    if(!this.containerElement) { return; }

    $$(this.containerElement.nativeElement).find(className).val(item.aVista);

    if (item.aVista == undefined){
      item.aVista = !!parseInt($$(this.containerElement.nativeElement).find(className).val());

      $$(this.containerElement.nativeElement).find(className).val(item.aVista);
    }
  }

  public getReceivedPayment(){

    let value = 0;

    this.data.paymentMethods.forEach((item)=>{
      value += item.value || 0;
    });

    return value;
  }

  public getReceivedPaymentClass(){

    if (!this.data.balance){ return this.getReceivedPayment() > 0 ? "error" : "ok"; }

    const total = this.data.balance.totalSale;

    return this.getReceivedPayment() <= total  ? "ok" : "error";
  }


  // Auxiliary Methods

  // Utility Methods

  // Balance

 
  
  public reset() {
  }

  // Destruction Methods

  public ngOnDestroy() {

    this.data = {};
  }

}
