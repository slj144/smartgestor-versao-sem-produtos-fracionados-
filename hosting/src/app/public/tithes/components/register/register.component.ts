import { Component, Input} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Services
import { PublicTithesService } from '../../tithes.service';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { FieldMask } from '@shared/utilities/fieldMask';
import { Utilities } from '@shared/utilities/utilities';
import { PublicTithesTranslate } from '../../tithes.translate';
import { IToolsService } from '@shared/services/iTools.service';

@Component({
  selector: 'register-tithes',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterTithesComponent {

  public form: FormGroup;

  @Input("origin") origin;

  public submitted: boolean;
  public errors: string[] = [];
  public messages: string[] = [];
  public showMessages: any = {
    error: true, success: true
  };  

  public get translate(){ return PublicTithesTranslate.get(); }

  public get formControls(){ return this.form.controls; }

  constructor(
    private service: PublicTithesService,
    private formBuilder: FormBuilder,
    private itooService: IToolsService
    ) {
  }

  public ngOnInit() {    
    $$("#global-spinner").css({"display": "none"});
    this.setupLoadingTask();
    this.formSettings();
  }

  
  public getConfigValue(config) {
    // if (config === "forms.validation.username.required") {
    //   return true;
    // }
  }

  public submit(){

    // Utilities.loading();

    // const obj = {
    //   paymentMode: "checkout",
    //   items: [
    //     {
    //       amount: 1200,
    //       currency: "brl",
    //       name: "Ingresso: " + new Date().toLocaleString(),
    //       quantity: 1
    //     }
    //   ],
    //   paymentMethods: ['card'],
    //   customer: {
    //     name: "Weelyson",
    //     email: "wellysonwcr21@gmail.com"
    //   },
    //   cancel_url: "https://functions.ipartts.com/bm-iparttsdev/stripCancel",
    //   success_url: "https://functions.ipartts.com/bm-iparttsdev/stripSuccess",
    //   metadata: {}
    // };

    // this.itooService.functions().call("stripePayment", obj).then((res)=>{

    //   console.log(res);
    // });

    // return;

    const timer = setInterval(()=>{
      if (this.origin){
        clearInterval(timer);

        const value = this.form.value;
        value.origin = this.origin;
        value.amount = parseFloat(value.amount.toString().replaceAll(".", "").replaceAll(",", "."));
    
        this.errors.splice(0);
        this.messages.splice(0);
    
        this.service.makeTithe(value).then(() => {
    
          this.formSettings();
          // this.messages = this.translate.register.success;
          Utilities.loading(false);
        }).catch(()=>{
    
          // this.errors = this.translate.register.error.default;
          Utilities.loading(false);
        });
      }
    }, 0);

  }

  private setupLoadingTask() {
    Utilities.loadingObserver.on(null,(status) => {
      if (status){
        document.getElementById("mainLoadingTaskAuth").classList.add("loadingTaskActive");
      }else{
        document.getElementById("mainLoadingTaskAuth").classList.remove("loadingTaskActive");
      }
    });
  }

  public onApplyPriceMask(event: Event, control: AbstractControl) {
    control.setValue(FieldMask.priceFieldMask($$(event.target)[0].value));
  }


  public formSettings(){

    this.form = this.formBuilder.group({
      memberName: ["", Validators.required],
      paymentMode: ["", Validators.required],
      amount: [""],
      description: [""]
    });
  }

}
