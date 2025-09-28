import { Component, Input } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Services
import { PublicDonationsService } from '../../donations.service';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { PublicDonationsTranslate } from '../../donations.translate';
import { FieldMask } from '@shared/utilities/fieldMask';

@Component({
  selector: 'register-donation',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})

export class RegisterDonationsComponent {

  public form: FormGroup;

  @Input('origin') public origin;

  showMessages: any = {
    error: true,
    success: true,
  };

  errors: string[] = [];
  messages: string[] = [];
  submitted: boolean = false;

  public get translate(){ return PublicDonationsTranslate.get(); }

  public get formControls(){ return this.form.controls; }

  constructor(
    private service: PublicDonationsService,
    private formBuilder: FormBuilder
  ){
  }

  public ngOnInit() {

    $$("#global-spinner").css({"display": "none"});
    this.setupLoadingTask();
    this.formSettings();
  }
  
  public submit(){

    Utilities.loading(true);

    const timer = setInterval(()=>{
      if (this.origin){
        clearInterval(timer);

        const value = this.form.value;
        value.origin = this.origin;

        if (value.amount){
          value.amount = parseFloat(value.amount.toString().replaceAll(".", "").replaceAll(",", "."));
        }
    
        this.errors.splice(0);
        this.messages.splice(0);
    
        this.service.makeDonation(value).then(() => {
    
          this.messages = this.translate.register.success;
          Utilities.loading(false);
          this.formSettings();
        }).catch(()=>{
    
          this.errors = this.translate.register.error.default;
          Utilities.loading(false);
        });
      }
    }, 0);

  }

  public getConfigValue(config) {

    if (config === "forms.validation.username.required") {
      return true;
    }
    
    if (config === "forms.validation.password.required") {
      return true;
    }

    if (config === "forms.validation.password.minLength") {
      return 4;
    }

    if (config === "forms.validation.password.maxLength") {
      return 10;
    }
  }
  
  private setupLoadingTask(){
    Utilities.loadingObserver.on(null, (status) => {

      if (status) {
        document.getElementById("mainLoadingTaskAuth").classList.add("loadingTaskActive");
      } else {
        document.getElementById("mainLoadingTaskAuth").classList.remove("loadingTaskActive");
      }
    });
  }

  public onApplyPriceMask(event: Event, control: AbstractControl) {
    control.setValue(FieldMask.priceFieldMask($$(event.target)[0].value));
  }

  public formSettings(){

    this.form = this.formBuilder.group({
      donorName: [""],
      type: ["", Validators.required],
      deliveryMode: ["", Validators.required],
      amount: [""],
      description: [""]
    });
  }

}
