import { Component, OnInit } from '@angular/core';

// Components
import { InformationsModalComponent } from './components/modal/modal.component';

// Services
import { StoreService } from './informations.service';

// Interfaces
import { IStore } from '@shared/interfaces/IStore';
import { IPermissions } from '@shared/interfaces/_auxiliaries/IPermissions';

// Utilities
import { Utilities } from '@shared/utilities/utilities';
import { Dispatch } from '@shared/utilities/dispatch';
import { InformationsTranslate } from './informations.translate';
import { ScrollMonitor } from '@shared/utilities/scrollMonitor';

@Component({
  selector: 'store',
  templateUrl: './informations.component.html',
  styleUrls: ['./informations.component.scss']
})
export class InformationsComponent implements OnInit {

  public translate = InformationsTranslate.get();

  public loading: boolean = true;
  public store: IStore;
  public isEdit: boolean = false;
  private modal: InformationsModalComponent;

  constructor(
    private storeService: StoreService
  ) {}

  public ngOnInit() {
    this.getStore();
    ScrollMonitor.reset();
  }

  // Get Branches

  private getStore(){

    this.storeService.getCurrentStore("store", (data) => {
      this.loading = false;
      this.store = data;
    });

     // Check Permissions

    this.setupPermissions();     
  }

  // Config Permissions

  private setupPermissions(){
    const permissions = ()=>{

      const permissions: any = Utilities.permissions(); //as IPermissions;
      
      if (Utilities.isAdmin){

        this.isEdit = true;
      }else{
        if (permissions && permissions.store){

          this.isEdit = permissions.store.actions.indexOf("edit") !== -1;
        }  
      }
    };

    Dispatch.onRefreshCurrentUserPermissions("InformationsComponent-refresh-user-permissions", ()=>{ permissions(); });
    permissions();
  }

  public onModalResponse(event){

    this.modal = (event.instance as InformationsModalComponent);

    let it = setInterval(()=>{
      if (this.store){
        clearInterval(it);
      }
    },0);
  }
 
  public onShowModal(event, type){

    if (event){ event.stopPropagation(); }

    if (!this.modal || !this.store){return;}

    const store = Utilities.deepClone(this.store);

    if (type){
      type = (<string>type).trim().toLowerCase();
      this.modal.onOpen({
        activeComponent:  "Store/Edit",
        data: {
          selectedData: store,
          action: type
        }
      });
    }
  }

  public requestNewPassword(event){
    (<any>event.target).disabled = true;
    this.storeService.requestNewPassword(Utilities.operator.username).then(()=>{
      setTimeout(()=>{ (<any>event.target).disabled = false; }, 5000);
    }).catch(()=>{
      setTimeout(()=>{ (<any>event.target).disabled = false; }, 5000);
    });
  }

  public ngDestroy(){
    this.storeService.removeListeners("store", "MyInformationsComponent");
    Dispatch.removeListeners("refresh-menu","InformationsComponent-refresh-user-permissions");
  }
 
}