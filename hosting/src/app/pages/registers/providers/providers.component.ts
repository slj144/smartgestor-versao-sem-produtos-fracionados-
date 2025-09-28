import { Component, OnDestroy, OnInit } from '@angular/core';

// Services
import { ProvidersService } from './providers.service';

// Translate
import { ProvidersTranslate } from './providers.translate';

// Interfaces
import { IPermissions } from '@shared/interfaces/_auxiliaries/IPermissions';

// Utilities
import { Utilities } from '@shared/utilities/utilities';
import { Dispatch } from '@shared/utilities/dispatch';
import { ScrollMonitor } from '@shared/utilities/scrollMonitor';

// Settings
import { ProjectSettings } from '@assets/settings/company-settings';

@Component({
  selector: 'registers-providers',
  templateUrl: './providers.component.html',
  styleUrls: ['./providers.component.scss']
})
export class ProvidersComponent implements OnInit, OnDestroy {

  public translate = ProvidersTranslate.get();

  public loading: boolean = true;
  public filtersBadge: number = 0;
  public countData: any = {};
  public recordsData: any = [];
  public queryClauses: any = [];
  public permissions: any = {};

  public isAdmin = Utilities.isAdmin;
  public isBrazil = (ProjectSettings.companySettings().country == 'BR');
  public order = 1;

  private modalComponent: any;

  constructor(
    private providersService: ProvidersService
  ) { 
    ScrollMonitor.reset();
    this.permissionsSettings();
  }

  public ngOnInit() {

    this.providersService.getProviders('ProvidersComponent', (data) => {
      this.recordsData = data;
      this.loading = false;
    });

    this.providersService.getProvidersCount('ProvidersComponent', (data) => {
      this.countData = data;
    });

    this.scrollSettings();
  }

  // User Interface Actions - Filters

  public onFilter(event: any) {

    // this.modalComponent.onOpen({
    //   activeComponent: 'Providers/Filters'
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

      this.providersService.query(this.queryClauses, true);
    } else {
      this.queryClauses = [];
      this.providersService.query(null, true, false, true, true, {orderBy: this.order});
    }
  }

  public onChangeOrderBy(event){
    this.order = event.order;
    this.providersService.query(null, true, false, true, true, {orderBy: this.order});
  }

  // User Interface Actions - CRUD   

  public onCreate() {
     
    this.modalComponent.onOpen({
      activeComponent: 'Providers/Create'
    });
  }
  
  public onRead(data: any) {
    
    this.modalComponent.onOpen({
      activeComponent: 'Providers/Read',
      data: data
    });
  }  

  public onUpdate(event: Event, data: any) {

    event.stopPropagation(); 

    this.modalComponent.onOpen({
      activeComponent: 'Providers/Update',
      data: Utilities.deepClone(data)
    });
  }

  public onDelete(event: Event, data: any) {

    event.stopPropagation();

    this.modalComponent.onOpen({
      activeComponent: 'Providers/Delete',      
      data: Utilities.deepClone(data)
    }); 
  }  

  // User Interface Actions - Others

  public onDataExport() {

    this.modalComponent.onOpen({
      activeComponent: 'Providers/DataExport'
    });
  }

  // Auxiliary Methods

  public checkOwner(value: string) {
    return (Utilities.storeID == value);
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

        const permissions = Utilities.permissions('registers')['providers'] as IPermissions['registers']['providers'];

        this.permissions = {
          actions: {
            add: (permissions.actions.indexOf("add") !== -1),
            edit: (permissions.actions.indexOf("edit") !== -1),
            delete: (permissions.actions.indexOf("delete") !== -1)
          }
        };
      }
    };

    Dispatch.onRefreshCurrentUserPermissions("ProvidersComponent", () => {
      setupPermissions();
    });

    setupPermissions();
  }

  private scrollSettings() {

    ScrollMonitor.start({
      target: '#infiniteScroll',
      bottom: () => {

        if (this.countData.total > this.providersService.limit) {
          
          Utilities.loading();

          const query: any = (this.queryClauses.length > 0 ? this.queryClauses : null);
          const reset: boolean = false;
          const flex: boolean = (this.filtersBadge == 0);
          const scrolling: boolean = (this.queryClauses.length > 0);

          const orderBy = query && query.length > 0 ? null : {orderBy:  this.order};

          this.providersService.query(query, reset, flex, scrolling, true, orderBy).then(() => {
            Utilities.loading(false);
          });
        }       
      }
    });
  }

  // Destruction Method

  public ngOnDestroy() {

    this.providersService.query([]);
    this.providersService.removeListeners('records', 'ProvidersComponent');
    this.providersService.removeListeners('count', 'ProvidersComponent');
    ScrollMonitor.reset();
    Dispatch.removeListeners('refeshCurrentUserPermissions', 'ProvidersComponent');
  }

}
