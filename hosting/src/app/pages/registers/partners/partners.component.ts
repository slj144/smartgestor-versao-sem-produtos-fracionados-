import { Component, OnDestroy, OnInit } from '@angular/core';

// Services
import { PartnersService } from './partners.service';

// Translate
import { PartnersTranslate } from './partners.translate';

// Interfaces
import { IPermissions } from '@shared/interfaces/_auxiliaries/IPermissions';

// Utilities
import { Utilities } from '@shared/utilities/utilities';
import { Dispatch } from '@shared/utilities/dispatch';
import { ScrollMonitor } from '@shared/utilities/scrollMonitor';

// Settings
import { ProjectSettings } from '@assets/settings/company-settings';

@Component({
  selector: 'registers-partners',
  templateUrl: './partners.component.html',
  styleUrls: ['./partners.component.scss']
})
export class PartnersComponent implements OnInit, OnDestroy {

  public translate = PartnersTranslate.get();

  public loading: boolean = true;
  public filtersBadge: number = 0;
  public countData: any = {};
  public recordsData: any = [];
  public queryClauses: any = [];
  public permissions: any = {};

  private modalComponent: any;

  public isAdmin = Utilities.isAdmin;

  constructor(
    private partnersService: PartnersService
  ) {
    ScrollMonitor.reset();
    this.permissionsSettings();    
  }

  public ngOnInit() {

    this.partnersService.getPartners('PartnersComponent', (data) => {
      this.recordsData = data;
      this.loading = false;
    });

    this.partnersService.getPartnersCount('PartnersComponent', (data) => {
      this.countData = data;
    });

    this.scrollSettings();
  }

  // Getter and Setter Methods

  public get isBrazil() {
    return (ProjectSettings.companySettings().country == 'BR');
  }

  // User Interface Actions - Filters

  public onFilter(event: any) {

    // this.modalComponent.onOpen({
    //   activeComponent: 'Partners/Filters'
    // });
  }

  public onSearch(event: any) {

    const value = event.value;    
    
    if (value != '') {

      this.queryClauses = [];
      
      if (!isNaN(parseInt(value))) {
        this.queryClauses.push({ field: 'code', operator: '=', value: parseInt(value) });
      } else {
        this.queryClauses.push({ field: 'name', operator: 'like', value: new RegExp(value, 'gi') });
      }

      this.partnersService.query(this.queryClauses, true, true);
    } else {
      this.queryClauses = [];
      this.partnersService.query(null, true);
    }    
  }

  // User Interface Actions - CRUD

  public onCreate() {
     
    this.modalComponent.onOpen({
      activeComponent: 'Partners/Create'
    });
  }  
  
  public onRead(data: any) {
    
    this.modalComponent.onOpen({
      activeComponent: 'Partners/Read',
      data: Utilities.deepClone(data)
    });
  } 

  public onUpdate(data: any) {

    this.modalComponent.onOpen({
      activeComponent: 'Partners/Update',
      data: Utilities.deepClone(data)
    });
  }

  public onDelete(data: any) {

    this.modalComponent.onOpen({
      activeComponent: 'Partners/Delete',      
      data: Utilities.deepClone(data)
    }); 
  }
  
  // User Interface Actions - Others

  public onDataExport() {

    this.modalComponent.onOpen({
      activeComponent: 'Partners/DataExport'
    });
  }

  // Event Listeners

  public onModalResponse(event: any) {

    if (event.instance) {
      this.modalComponent = event.instance;
    }   
  }

  // Utility Methods

  private permissionsSettings() {

    const setupPermissions = () => {

      if (Utilities.isAdmin) {
        
        this.permissions = {
          actions: { add: true, edit: true, delete: true }
        };
      } else {

        const permissions = Utilities.permissions('registers')['partners'] as IPermissions['registers']['partners'];
          
        this.permissions = {
          actions: { 
            add: (permissions.actions.indexOf("add") !== -1),
            edit: (permissions.actions.indexOf("edit") !== -1),
            delete: (permissions.actions.indexOf("delete") !== -1)
          }
        };
      }
    };
    
    Dispatch.onRefreshCurrentUserPermissions('PartnersComponent', () => {
      setupPermissions();
    });

    setupPermissions();
  }

  private scrollSettings() {

    ScrollMonitor.start({
      target: '#infiniteScroll',
      bottom: () => {

        if (this.countData.total > this.partnersService.limit) {
          
          Utilities.loading();

          const query: any = (this.queryClauses.length > 0 ? this.queryClauses : null);
          const reset: boolean = false;
          const flex: boolean = (this.filtersBadge == 0);
          const scrolling: boolean = (this.queryClauses.length > 0);

          this.partnersService.query(query, reset, flex, scrolling).then(() => {
            Utilities.loading(false);
          });
        }
      }
    });
  }

  // Destruction Method

  public ngOnDestroy() {

    this.partnersService.query([]);
    this.partnersService.removeListeners('records', 'PartnersComponent');
    this.partnersService.removeListeners('count', 'PartnersComponent');
    ScrollMonitor.reset();
    Dispatch.removeListeners('refeshCurrentUserPermissions', 'PartnersComponent');
  }

}
