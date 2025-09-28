import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Services
import { PublicDonationsService } from './donations.service';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { PublicDonationsTranslate } from './donations.translate';
import { FieldMask } from '@shared/utilities/fieldMask';

@Component({
  selector: 'public-donations',
  templateUrl: './donations.component.html',
  styleUrls: ['./donations.component.scss']
})

export class PublicDonationsComponent {

  public form: FormGroup;

  redirectDelay: number = 0;
  
  showMessages: any = {
    error: true,
    success: true,
  };

  strategy: string;
  errors: string[] = [];
  messages: string[] = [];
  user: any;
  submitted: boolean = false;
  rememberMe: boolean;

  public get translate(){ return PublicDonationsTranslate.get(); }

  public get formControls(){ return this.form.controls; }

  constructor(
    private service: PublicDonationsService,
    private formBuilder: FormBuilder
  ){
    this.user = {};
  }

  public ngOnInit() {

    $$("#global-spinner").css({"display": "none"});
    this.setupLoadingTask();
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


}
