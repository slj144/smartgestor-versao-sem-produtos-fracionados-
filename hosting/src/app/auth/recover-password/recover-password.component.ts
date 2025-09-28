import { Component} from '@angular/core';

// Services
import { AuthService } from '../auth.service';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { AuthTranslate } from '../auth.translate';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'ngx-recover-password',
  templateUrl: './recover-password.component.html',
  styleUrls: ['./recover-password.component.scss']
})
export class RecoverPasswordComponent {
  
  public user = { username: "" };

  public submitted: boolean;
  
  public errors: string[] = [];
  public messages: string[] = [];  

  constructor(
    private authService: AuthService
  ) {
  }

  public get translate() { return AuthTranslate.get(); }

  public get projectId() { return Utilities.projectId; }

  public get isLogged() { return this.authService.isLogged(); }

  public ngOnInit() {    
    $$("#global-spinner").css({"display": "none"});
    this.setupLoadingTask();
  }

  public getConfigValue(config) {
    if (config === "forms.validation.username.required") {
      return true;
    }
  }

  public requestPassword(){

    Utilities.loading();

    this.errors.splice(0);
    this.messages.splice(0);

    this.authService.requestPassword(this.user.username).then((res) => {

      this.messages = this.translate.requestPassword.success;
      Utilities.loading(false);
    }).catch(()=>{

      this.errors = this.translate.requestPassword.error.default;
      Utilities.loading(false);
    });
  }

  private setupLoadingTask() {

    Utilities.loadingObserver.on(null,(status) => {

      if (status) {
        document.getElementById("mainLoadingTaskAuth").classList.add("loadingTaskActive");
      } else {
        document.getElementById("mainLoadingTaskAuth").classList.remove("loadingTaskActive");
      }
    });
  }

}
