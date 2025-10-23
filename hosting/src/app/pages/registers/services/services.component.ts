import { Component, OnDestroy, OnInit } from '@angular/core';

// Services
import { ServicesService } from './services.service';

// Translate
import { ServicesTranslate } from './services.translate';

// Interfaces
import { IPermissions } from '@shared/interfaces/_auxiliaries/IPermissions';

// Utilities
import { Utilities } from '@shared/utilities/utilities';
import { Dispatch } from '@shared/utilities/dispatch';
import { ScrollMonitor } from '@shared/utilities/scrollMonitor';

@Component({
  selector: 'registers-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements OnInit, OnDestroy {

  public translate = ServicesTranslate.get();

  public loading: boolean = true;
  public filtersBadge: number = 0;
  public countData: any = {};
  public recordsData: any = [];
  public queryClauses: any = [];
  public permissions: any = {};
  public order = 1;

  private modalComponent: any;

  public isAdmin = Utilities.isAdmin;
  public isFiscal = Utilities.isFiscal;
  public canConfigureIss = (Utilities.isAdmin || Utilities.isFiscal);

  constructor(
    private servicesService: ServicesService
  ) {
    ScrollMonitor.reset();
    this.permissionsSettings();
  }

  public ngOnInit() {
    
    this.servicesService.getServices('ServicesComponent', (data) => {

      this.recordsData = data;
      this.loading = false;     
    });

    this.servicesService.getServicesCount('ServicesComponent', (data) => {
      this.countData = data;
    });

    this.scrollSettings();
  }

  // User Interface Actions - Filters

  public onFilter(event: any) {

    // this.modalComponent.onOpen({
    //   activeComponent: 'Services/Filters'
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

      this.servicesService.query(this.queryClauses, true, false);
    } else {
      this.queryClauses = [];
      this.servicesService.query(null, true, false, true, true,  {orderBy: this.order});
    }
  }

  public onChangeOrderBy(){
    this.order = this.order == -1 ? 1 : -1;
    this.servicesService.query(null, true, false, true, true, {orderBy: this.order});
  }

  // User Interface Actions - CRUD

  public onCreate() {
     
    this.modalComponent.onOpen({
      activeComponent: 'Services/Create'
    });
  }

  public onRead(data: any) {
     
    this.modalComponent.onOpen({
      activeComponent: 'Services/Read',
      data: Utilities.deepClone(data)
    });
  }

  public onUpdate(data: any) {

    this.modalComponent.onOpen({
      activeComponent: 'Services/Update',
      data: Utilities.deepClone(data)
    });
  }

  public onDelete(data: any) {

    this.modalComponent.onOpen({
      activeComponent: 'Services/Delete',
      data: Utilities.deepClone(data)
    }); 
  }
  
  // User Interface Actions - Others

  public onDataExport() {

    this.modalComponent.onOpen({
      activeComponent: 'Services/DataExport'
    });
  }

  public onIssConfig(): void {

    this.modalComponent.onOpen({
      activeComponent: 'Services/IssConfig'
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
        }      
      } else {

        const permissions = (Utilities.permissions('registers')['services'] as IPermissions['registers']['services']);
        
        this.permissions = {
          actions: { 
            add: (permissions.actions.indexOf('add') !== -1),
            edit: (permissions.actions.indexOf('edit') !== -1),
            delete: (permissions.actions.indexOf('delete') !== -1)
          }
        }
      }     

      this.canConfigureIss = (Utilities.isAdmin || Utilities.isFiscal);
    };

    Dispatch.onRefreshCurrentUserPermissions('ServicesComponent', () => {
      setupPermissions();
    });

    setupPermissions();
  }

  private scrollSettings() {

    ScrollMonitor.start({
      target: '#infiniteScroll',
      bottom: () => {

        if (this.countData.total > this.servicesService.limit) {
          
          Utilities.loading();

          const query: any = (this.queryClauses.length > 0 ? this.queryClauses : null);
          const reset: boolean = false;
          const flex: boolean = (this.filtersBadge == 0);
          const scrolling: boolean = (this.queryClauses.length > 0);

          const orderBy = query && query.length > 0 ? null : {orderBy:  this.order};

          this.servicesService.query(query, reset, flex, scrolling, true, orderBy).then(() => {
            Utilities.loading(false);
          });
        }
      }
    });
  }

  // Destruction Method

  public ngOnDestroy() {

    this.servicesService.query([]);
    this.servicesService.removeListeners('records', 'ServicesComponent');
    this.servicesService.removeListeners('count', 'ServicesComponent');
    ScrollMonitor.reset();
    Dispatch.removeListeners('refeshCurrentUserPermissions', 'ServicesComponent');
  }

}
