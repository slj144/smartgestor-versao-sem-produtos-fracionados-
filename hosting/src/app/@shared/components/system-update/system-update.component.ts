import { Component, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';

// Translate
import { SystemUpdateTranslation } from './system-update.translation';

// Utilities
import { $$ } from '../../utilities/essential';
import { Utilities } from '../../utilities/utilities';
import { DateTime } from '../../utilities/dateTime';
import { AuthService } from '../../../auth/auth.service';
import { ProjectSettings } from '@assets/settings/company-settings';

@Component({
  selector: 'system-update',
  templateUrl: './system-update.component.html',
  styleUrls: ['./system-update.component.scss']
})
export class SystemUpdateComponent implements OnInit {  

  @Output() callback: EventEmitter<any> = new EventEmitter();

  public static shared: SystemUpdateComponent;

  public data: any = {};

  private modalComponent: any;

  constructor(
  ) {
    SystemUpdateComponent.shared = this;
  }

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // Getter and Setter Methods

  public get translation() {
    return SystemUpdateTranslation.get();
  }

  // User Interface Actions

  public onReloadSystem() {

    if (this.data.clearLocalStorage) {
      // AuthService.clearAuthData();
    } else {
      Utilities.localStorage("updateVersion", this.data.version);
    }
    
    Utilities.clearCache(true);
  }

  // Modal Actions

  public onOpen(data: any = {}) {

    const info: any = (() => {
      const language = (window.localStorage.getItem('Language') || ProjectSettings.companySettings().language);
      return {}; //(data.info[language] || data.info);
    })();

    this.data.title = (info.title ?? null);
    this.data.description = (info.description ?? null);
    this.data.list = (info.list ? (<string[]>info.list).reverse() : null);    
    this.data.version = data.version;

    if (data.date) {

      const obj = DateTime.formatDate(data.date);

      this.data.date = obj.date;
      this.data.hours = obj.hours;
    }
    
    if (data.settings && data.settings.clearLocalStorage) {
      this.data.clearLocalStorage = data.settings.clearLocalStorage;
    }

    this.modalComponent.onOpen({ hideHeader: true, blockKeyESC: true });

    $$(window).on('unload', () => this.onReloadSystem());
  }

  // Event Listener

  public onModalResponse(event: any) {

    if (event.instance) {
      this.modalComponent = event.instance;
    }
  }
 
}
