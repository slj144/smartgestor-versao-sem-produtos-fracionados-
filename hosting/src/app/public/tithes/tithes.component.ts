import { Component} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Services
import { PublicTithesService } from './tithes.service';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { FieldMask } from '@shared/utilities/fieldMask';
import { Utilities } from '@shared/utilities/utilities';
import { PublicTithesTranslate } from './tithes.translate';
// import { IToolsService } from '@shared/services/iTools.service';

@Component({
  selector: 'public-tithes',
  templateUrl: './tithes.component.html',
  styleUrls: ['./tithes.component.scss']
})
export class PublicTithesComponent {

  public form: FormGroup;

  public redirectDelay: number;
  public strategy: string;
  public submitted: boolean;
  
  public errors: string[] = [];
  public messages: string[] = [];
  public user: any = {};
  public showMessages: any = {
    error: true, success: true
  };  

  public get translate(){ return PublicTithesTranslate.get(); }

  public get formControls(){ return this.form.controls; }

  constructor(
    private service: PublicTithesService,
    private formBuilder: FormBuilder,
    // private itooService: IToolsService
    ) {
    this.user = {}




    
  }

  public ngOnInit() {    
    $$("#global-spinner").css({"display": "none"});
    this.setupLoadingTask();
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

}
