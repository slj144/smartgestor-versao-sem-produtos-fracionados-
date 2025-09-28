import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

// Components
import { BranchesModalComponent } from './components/modal/modal.component';

// Services
import { BranchesService } from './branches.service';

// Interfaces
import { IStore } from '@shared/interfaces/IStore';
import { IPermissions } from '@shared/interfaces/_auxiliaries/IPermissions';

// Utilities
import { Utilities } from '@shared/utilities/utilities';
import { Dispatch } from '@shared/utilities/dispatch';
import { ScrollMonitor } from '@shared/utilities/scrollMonitor';
import { BranchesTranslate } from './branches.translate';
import { $$ } from '@shared/utilities/essential';

@Component({
  selector: 'registers-branches',
  templateUrl: './branches.component.html',
  styleUrls: ['./branches.component.scss']
})
export class BranchesComponent implements OnInit{

  public loading: boolean = true;
  public recordsData: Array<IStore> = [];
  public filtersData: Array<IStore> = [];
  public countData: any = [];
  public queryClauses: any = [];
  public filtersBadge: number = 0;
  public permissions: any = {};

  public translate = BranchesTranslate.get();

  private modalComponent: BranchesModalComponent;

  constructor(
    private branchesService: BranchesService
  ) {  

    ScrollMonitor.reset();
  }

  public ngOnInit(){

    this.branchesService.getBranches("BranchesComponent", (data) => {
      this.recordsData = data;
      this.loading = false;
    });

    this.branchesService.getBranchesCount("BranchesComponent", (data) => {
      this.countData = data;
    });

    this.setupPermissions();
    this.scrollSettings();
  }

  private scrollSettings() {

    ScrollMonitor.start({
      target: '#infiniteScroll',
      bottom: () => {

        if (this.countData.total > this.branchesService.limit) {
          
          Utilities.loading();

          const query: any = (this.queryClauses.length > 0 ? this.queryClauses : null);
          const reset: boolean = false;
          const flex: boolean = (this.filtersBadge == 0);
          const scrolling: boolean = (this.queryClauses.length > 0);

          this.branchesService.query(query, reset, flex, scrolling).then(() => {
            Utilities.loading(false);
          }).catch((error)=>{
            Utilities.loading(false);
          });
        }
      }
    });
  }

  private setupPermissions(){
    const setupPermissions = ()=>{
      if (Utilities.isAdmin) {
      
        this.permissions = {
          add: true,
          edit: true,
          delete: true
        };
      } else {
  
        const permissions = Utilities.permissions('registers')["branches"] as IPermissions["registers"]["branches"];
         
        if (permissions){
          this.permissions = {
            add:  permissions.actions.indexOf("add") !== -1,
            edit: permissions.actions.indexOf("edit") !== -1,
            delete: permissions.actions.indexOf("delete") !== -1
          };
        }
      }
    };

    Dispatch.onRefreshCurrentUserPermissions("BranchesComponent-refresh-user-permissions", ()=>{

      setupPermissions();
    });

    setupPermissions();
  }

  public onShowModal(event, branch = null, type){

    if (event){ event.stopPropagation(); }
    if (!this.modalComponent){return;}

    if (type){
      type = (<string>type).trim().toLowerCase();
      let component = "";
      switch(type){
        case "read": {
          component = 'Branch/View';
          break;
        }
        case "add": {
          component = 'Branch/Add';
          break;
        }
        case "edit": {
          component = 'Branch/Edit';
          break;
        }
        case "delete": {
          component = 'Branch/Delete';
          break;
        }
      }

      this.modalComponent.onOpen({
        activeComponent: component,
        data: {
          selectedData: branch,
          action: type
        }
      });
    }
  }

  public onFilter(event: any){}

  public onSearch(event: any) {

    const value = event.value;
    const query: any[] = [];

    value.split(";").forEach((item: string) => {
      item = item.trim();

        query.push({
          field: "name",
          operator: "like",
          value: new RegExp(item, "ig")
        });
    });

    this.branchesService.query(query, true).then(()=>{}).catch(error=>{ });
  }

  // Modal Response

  public onModalResponse(event) {

    if (event.instance) {
      this.modalComponent = event.instance;
    }
  }

  public ngDestroy() {
        
    this.branchesService.query([]);
    this.branchesService.removeListeners('count', 'BranchesComponent');
    this.branchesService.removeListeners("branches", "BranchesComponent");

    Dispatch.removeListeners("refresh-menu","BranchesComponent-refresh-user-permissions");
  }
 
}
