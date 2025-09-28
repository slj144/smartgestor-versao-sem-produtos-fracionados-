import { Component, OnDestroy, OnInit } from '@angular/core';

// Services
import { CarriersService } from './carriers.service';

// Translate
import { CarriersTranslate } from './carriers.translate';

// Interfaces
import { IPermissions } from '@shared/interfaces/_auxiliaries/IPermissions';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { Dispatch } from '@shared/utilities/dispatch';
import { ScrollMonitor } from '@shared/utilities/scrollMonitor';

// Settings
import { ProjectSettings } from '@assets/settings/company-settings';

@Component({
  selector: 'registers-carriers',
  templateUrl: './carriers.component.html',
  styleUrls: ['./carriers.component.scss']
})
export class CarriersComponent implements OnInit, OnDestroy {

  public translate = CarriersTranslate.get();

  public loading: boolean = true;
  public filtersBadge: number = 0;
  public countData: any = {};
  public recordsData: any = [];
  public queryClauses: any = [];
  public permissions: any = {};

  private modalComponent: any;

  public isAdmin = Utilities.isAdmin;

  constructor(
    private carriersService: CarriersService
  ) {
    ScrollMonitor.reset();
    this.permissionsSettings();
  }

  public ngOnInit() {

    this.carriersService.getCarriers('CarriersComponent', (data) => {
      this.recordsData = data;
      this.loading = false;
    });

    this.carriersService.getCarriersCount('CarriersComponent', (data) => {
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
    //   activeComponent: 'Carriers/Filters'
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

      this.carriersService.query(this.queryClauses, true, true);
    } else {
      this.queryClauses = [];
      this.carriersService.query(null, true);
    }
  }

  // User Interface Actions - CRUD

  public onCreate() {
     
    this.modalComponent.onOpen({
      activeComponent: 'Carriers/Create'
    });
  }  
  
  public onRead(data: any) {
    
    this.modalComponent.onOpen({
      activeComponent: 'Carriers/Read',
      data: Utilities.deepClone(data)
    });
  } 

  public onUpdate(data: any) {

    this.modalComponent.onOpen({
      activeComponent: 'Carriers/Update',
      data: Utilities.deepClone(data)
    });
  }

  public onDelete(data: any) {

    this.modalComponent.onOpen({
      activeComponent: 'Carriers/Delete',      
      data: Utilities.deepClone(data)
    }); 
  }

  // User Interface Actions - Others

  public onDataExport() {

    this.modalComponent.onOpen({
      activeComponent: 'Carriers/DataExport'
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
  
        const permissions = Utilities.permissions('registers')['carriers'] as IPermissions['registers']['carriers'];
          
        this.permissions = {
          actions: { 
            add: (permissions.actions.indexOf("add") !== -1),
            edit: (permissions.actions.indexOf("edit") !== -1),
            delete: (permissions.actions.indexOf("delete") !== -1)
          }
        };        
      }
    };

    Dispatch.onRefreshCurrentUserPermissions('CarriersComponent', () => {
      setupPermissions();
    });

    setupPermissions();
  }

  private scrollSettings() {

    ScrollMonitor.start({
      target: '#infiniteScroll',
      bottom: () => {

        if (this.countData.total > this.carriersService.limit) {
          
          Utilities.loading();

          const query: any = (this.queryClauses.length > 0 ? this.queryClauses : null);
          const reset: boolean = false;
          const flex: boolean = (this.filtersBadge == 0);
          const scrolling: boolean = (this.queryClauses.length > 0);

          this.carriersService.query(query, reset, flex, scrolling).then(() => {
            Utilities.loading(false);
          });
        }
      }
    });
  }

  // Destruction Method

  public ngOnDestroy() {

    this.carriersService.query([]);
    this.carriersService.removeListeners('records', 'CarriersComponent');
    this.carriersService.removeListeners('count', 'CarriersComponent');
    ScrollMonitor.reset();
    Dispatch.removeListeners('refeshCurrentUserPermissions', 'CarriersComponent');
  }

}
