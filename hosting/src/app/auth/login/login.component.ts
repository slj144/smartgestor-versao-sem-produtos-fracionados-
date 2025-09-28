import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// Translate
import { AuthTranslate } from '../auth.translate';

// Services
import { AuthService } from '../auth.service';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  public translate = AuthTranslate.get();
  public projectId = Utilities.projectId;

  public redirectDelay: number = 0;

  public errors: string[] = [];
  public messages: string[] = [];
  public submitted: boolean = false;
  public rememberMe: boolean;

  public form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
  ) { }

  public ngOnInit() {

    this.form = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    })

    this.setupLoadingTask();
  }

  public onSubmit() {

    Utilities.loading(true);

    const data = this.form.value;
    data.password = data.password != null ? data.password.toString() : data.password;

    this.errors.splice(0);
    this.messages.splice(0);

    this.submitted = true;

    this.authService.login(data.username, data.password).then(() => {

      this.messages = AuthTranslate.get().login.success;

    }).catch((res) => {

      if (res.code == 400) {
        this.errors = AuthTranslate.get().login.error.lockedAccess;
      } else if (res.code == 401) {
        this.errors = AuthTranslate.get().login.error.noPaid;
      } else {
        this.errors = AuthTranslate.get().login.error.default;
      }

    }).finally(() => {
      Utilities.loading(false);
      this.submitted = false;
    });
  }

  private setupLoadingTask() {

    Utilities.loadingObserver.on(null, (status) => {
      if (status) {
        document.getElementById("mainLoadingTaskAuth").classList.add("loadingTaskActive");
      } else {
        document.getElementById("mainLoadingTaskAuth").classList.remove("loadingTaskActive");
      }
    });
  }

}
