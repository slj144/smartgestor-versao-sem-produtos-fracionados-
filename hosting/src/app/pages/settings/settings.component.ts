import { Component } from '@angular/core';

// Services
import { SettingsService } from './settings.service';

// Translate
import { SettingsTranslate } from './settings.translate';

// Utilities
import { Utilities } from '@shared/utilities/utilities';
import { ProjectSettings } from '../../../assets/settings/company-settings';
import { ScrollMonitor } from '@shared/utilities/scrollMonitor';

@Component({
  selector: 'settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {

  public translate = SettingsTranslate.get();

  private modalComponent: any;

  constructor(
    private settingsService: SettingsService
  ) {
    ScrollMonitor.reset();
  }

  // Getter and Setter Methods

  public get isAdmin() {
    return Utilities.isAdmin;
  }

  public get companyProfile() {
    return ProjectSettings.companySettings().profile;
  }


  public get isCabinet() {
    const profile = ProjectSettings.companySettings().profile;
    return !!(profile.socialDemands && profile.socialDemands.active);
  }

  // User Interface Actions

  public onOpenModal(section: string, type: string){

    let title: string = '';

    switch (section){
      case 'General':
        title = this.translate.modal.section.general.title;
        break;
      case 'Stock':
        title = this.translate.modal.section.stock.title;
        break;
      case 'Cashier':
        title = this.translate.modal.section.cashier.title;
        break;
      case 'ServiceOrders':
        title = this.translate.modal.section.serviceOrders.title;
        break;
      case 'Registers':
        title = this.translate.modal.section.registers.title;
        break;
    }

    this.modalComponent.onOpen({
      title: title,
      section: section,
      translate: this.translate,
      activeComponent: `${section}/${type}`
    });
  }

  // Event Listeners

  public onModalResponse(event: any) {

    if (event.instance) {
      this.modalComponent = event.instance;
    }   
  }

  // Destruction Method

  public ngOnDestroy() {
    // this.settingsService.removeListeners();
  }

}
