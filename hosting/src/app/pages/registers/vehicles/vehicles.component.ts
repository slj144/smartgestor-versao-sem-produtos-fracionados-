import { Component, OnDestroy, OnInit } from '@angular/core';

// Vehicles
import { VehiclesService } from './vehicles.service';

// Translate
import { VehiclesTranslate } from './vehicles.translate';

// Interfaces
import { IPermissions } from '@shared/interfaces/_auxiliaries/IPermissions';

// Utilities
import { Utilities } from '@shared/utilities/utilities';
import { Dispatch } from '@shared/utilities/dispatch';
import { ScrollMonitor } from '@shared/utilities/scrollMonitor';

@Component({
  selector: 'registers-vehicles',
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.scss']
})
export class VehiclesComponent implements OnInit, OnDestroy {

  public translate = VehiclesTranslate.get();

  public loading: boolean = true;
  public filtersBadge: number = 0;
  public countData: any = {};
  public recordsData: any = [];
  public queryClauses: any = [];
  public permissions: any = {};
  public order = 1;

  private modalComponent: any;

  public isAdmin = Utilities.isAdmin;

  constructor(
    private vehiclesService: VehiclesService
  ) {
    ScrollMonitor.reset();
    this.permissionsSettings();
  }

  public ngOnInit() {
    
    this.vehiclesService.getVehicles('VehiclesComponent', (data) => {

      this.recordsData = data;
      this.loading = false;     
    });

    this.vehiclesService.getVehiclesCount('VehiclesComponent', (data) => {
      this.countData = data;
    });

    this.scrollSettings();
  }

  // User Interface Actions - Filters

  public onFilter(event: any) {

    // this.modalComponent.onOpen({
    //   activeComponent: 'Vehicles/Filters'
    // });
  }

  public onSearch(event: any) {

    const value = event.value;
    
    if (value != '') {

      this.queryClauses = [];
      
      if (!isNaN(parseInt(value))) {
        this.queryClauses.push({ field: 'code', operator: '=', value: parseInt(value) });
      } else {
        this.queryClauses.push({ field: 'plate', operator: 'like', value: new RegExp(value, 'gi') });
      }

      this.vehiclesService.query(this.queryClauses, true, false);
    } else {
      this.queryClauses = [];
      this.vehiclesService.query(null, true, false, true, true,  { orderBy: this.order });
    }
  }

  public onChangeOrderBy() {
    this.order = this.order == -1 ? 1 : -1;
    this.vehiclesService.query(null, true, false, true, true, {orderBy: this.order});
  }

  // User Interface Actions - CRUD

  public onCreate() {
     
    this.modalComponent.onOpen({
      activeComponent: 'Vehicles/Create'
    });
  }

  public onRead(data: any) {
     
    this.modalComponent.onOpen({
      activeComponent: 'Vehicles/Read',
      data: Utilities.deepClone(data)
    });
  }

  public onUpdate(data: any) {

    this.modalComponent.onOpen({
      activeComponent: 'Vehicles/Update',
      data: Utilities.deepClone(data)
    });
  }

  public onDelete(data: any) {

    this.modalComponent.onOpen({
      activeComponent: 'Vehicles/Delete',
      data: Utilities.deepClone(data)
    }); 
  }
  
  // User Interface Actions - Others

  public onDataExport() {

    this.modalComponent.onOpen({
      activeComponent: 'Vehicles/DataExport'
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

        const permissions = (Utilities.permissions('registers')['vehicles'] as IPermissions['registers']['vehicles']);
        
        this.permissions = {
          actions: { 
            add: (permissions.actions.indexOf('add') !== -1),
            edit: (permissions.actions.indexOf('edit') !== -1),
            delete: (permissions.actions.indexOf('delete') !== -1)
          }
        }
      }     
    };

    Dispatch.onRefreshCurrentUserPermissions('VehiclesComponent', () => {
      setupPermissions();
    });

    setupPermissions();
  }

  private scrollSettings() {

    ScrollMonitor.start({
      target: '#infiniteScroll',
      bottom: () => {

        if (this.countData.total > this.vehiclesService.limit) {
          
          Utilities.loading();

          const query: any = (this.queryClauses.length > 0 ? this.queryClauses : null);
          const reset: boolean = false;
          const flex: boolean = (this.filtersBadge == 0);
          const scrolling: boolean = (this.queryClauses.length > 0);

          const orderBy = query && query.length > 0 ? null : {orderBy:  this.order};

          this.vehiclesService.query(query, reset, flex, scrolling, true, orderBy).then(() => {
            Utilities.loading(false);
          });
        }
      }
    });
  }

  // Destruction Method

  public ngOnDestroy() {

    this.vehiclesService.query([]);
    this.vehiclesService.removeListeners('records', 'VehiclesComponent');
    this.vehiclesService.removeListeners('count', 'VehiclesComponent');
    ScrollMonitor.reset();
    Dispatch.removeListeners('refeshCurrentUserPermissions', 'VehiclesComponent');
  }

}

