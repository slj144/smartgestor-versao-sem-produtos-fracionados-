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
    this.restoreWindowID();
    this.initializeSettings();
    this.initializeSystem();
  }

  private initializeSystem() {
    new DateTime(environment.timezone, this.itoolsService);
  }

  private initializeSettings() {

  }

  /**
   * Restaura o window.id do localStorage após reload
   * Isso evita que company-settings.ts receba undefined e cause loops
   */
  private restoreWindowID() {
    const savedWindowID = localStorage.getItem("reloadWindowID");
    if (savedWindowID && savedWindowID !== 'undefined') {
      (<any>window).id = savedWindowID;
      console.log('✅ [AppComponent] Window ID restaurado:', savedWindowID);
    } else {
      console.log('⚠️ [AppComponent] Nenhum Window ID salvo encontrado');
    }
  }

}
