import { Component, OnDestroy, Output, EventEmitter } from '@angular/core';

// Services
import { CollaboratorProfilesService } from './profiles.service';

// Translate
import { CollaboratorsTranslate } from '../../../../../collaborators.translate';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';

@Component({
  selector: 'collaborator-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.scss']
})
export class CollaboratorProfilesComponent implements OnDestroy {

  public translate = CollaboratorsTranslate.get();

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  public settings: any = {};

  public loading: boolean = true;
  public permissions: any = {};

  // Data
  
  public profilesData: any = [];
  public filtersData: any = [];

  private modalComponent: any;
  private profilesLayerComponent: any;

  constructor(
    private collaboratorProfilesService: CollaboratorProfilesService
  ) {  }

  public prefixCode(code: string){
    return Utilities.prefixCode(code);
  }

  public ngOnInit() {

    this.collaboratorProfilesService.getProfiles('CollaboratorProfilesComponent', (data: any[]) => {

      this.profilesData = data;
      this.loading = false;
    });

    
    //// Check Permissions

    this.permissions = {
      actions: { add: true, edit: true, delete: true }
    };

    this.callback.emit({ instance: this });    
  }

  public onOpenModal(settings: any = {}) {

    this.settings = settings;
    this.settings.title = CollaboratorsTranslate.get().mainModal.collaboratorProfilesTitle
    this.settings.data = this.settings.data ? this.settings.data : {};
    this.modalComponent.onOpen(settings);
    this.config();
  }

  public onCloseModal() {
    this.modalComponent.onClose();
    if (this.profilesLayerComponent){ this.profilesLayerComponent.onClose(); }
  } 

  public config(){ }

  // User Interface Actions - Filters

  public onFilter(){ }

  public onSearch(event: any) {

    if (event){ event.preventDefault(); }

    const value = $$(event.target).serialize().search;
    const query: any[] = [];

    value.split(";").forEach((item: string) => {
      item = item.trim();
      if (!isNaN(parseInt(item))){

        query.push({
          field: "code",
          operator: "=",
          value: parseInt(item)
        });
      }else{

        query.push({
          field: "name",
          operator: "like",
          value: item.toUpperCase(),
        });
      }
    });

    this.collaboratorProfilesService.query(query, false, true).then((data)=>{}).catch(error=>{ });
  }  

  // User Interface Actions - CRUD

  public onCreate() {
     
    this.profilesLayerComponent.onOpen({
      title: this.translate.profilesModal.addTitle,
      activeComponent: 'Profile/Add',
      data: {
        action: "add",
      },
    });
  }
  
  public onRead(data: any) {
    
    this.profilesLayerComponent.onOpen({
      title: this.translate.profilesModal.viewTitle,
      activeComponent: 'Profile/View',
      data: {
        selectedData: data,
        action: "view",
      }
    });
  }

  public onUpdate(event: Event, data: any) {

    if (event){ event.stopPropagation(); }

    if (data.onlyRead){ return; }

    this.profilesLayerComponent.onOpen({
      title: this.translate.profilesModal.editTitle,
      activeComponent: 'Profile/Edit',
      data: {
        selectedData: data,
        action: "edit",
      }
    });
  }

  public onDelete(event: Event, data: any) {

    event.stopPropagation();

    if (data.onlyRead){ return; }

    this.profilesLayerComponent.onOpen({
      title: this.translate.profilesModal.deleteTitle,
      activeComponent: 'Profile/Delete',      
      data: {
        selectedData: data,
        action: "delete",
      }
    }); 
  }  

  // Event Listeners

  public onModalResponse(event: any) {

    if (event.instance) {
      this.modalComponent = event.instance;
    }

    if (event.close) {
      this.filtersData = [];
      if (this.profilesLayerComponent){ this.profilesLayerComponent.onClose(); }
    }
  }

  public onProfilesLayerResponse(event: any) {

    if (event.close) {
      this.profilesLayerComponent.onClose();
    }

    if (event.instance) {
      this.profilesLayerComponent = event.instance;
    }
  }

  // Destruction Method

  public ngOnDestroy() {
    this.collaboratorProfilesService.removeListeners('records', 'CollaboratorProfilesComponent');
  }

}
