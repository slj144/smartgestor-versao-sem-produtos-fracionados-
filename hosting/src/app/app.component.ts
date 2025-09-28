import { Component } from '@angular/core';

// Services
import { IToolsService } from './@shared/services/iTools.service';

// Utilities
import { DateTime } from '@shared/utilities/dateTime';
import { environment } from '@env';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>'
})
export class AppComponent {
  
  constructor(
    private itoolsService: IToolsService
  ) {
    this.initializeSettings();
    this.initializeSystem();
  }

  private initializeSystem() {
    new DateTime(environment.timezone, this.itoolsService);
  }

  private initializeSettings() {
    
  }

}
