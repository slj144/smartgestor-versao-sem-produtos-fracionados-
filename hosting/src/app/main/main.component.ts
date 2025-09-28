import { Component } from '@angular/core';

// Services

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { MainTranslate } from './main.translate';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})

export class MainComponent {

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

  public get translate(){ return MainTranslate.get(); }

  constructor(
  ){
    this.user = {};
  }

  public ngOnInit() {

    $$("#global-spinner").css({"display": "none"});
    this.setupLoadingTask();
  }
  
  public login(){

  }

  public getConfigValue(config) {

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
