import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

// Translate 
import { CollaboratorsTranslate } from '../../../../../../../collaborators.translate';

// Utilities
import { Utilities } from '@shared/utilities/utilities';

@Component({
  selector: 'collaborator-profiles-layer',
  templateUrl: './layer.component.html',
  styleUrls: ['./layer.component.scss']
})
export class CollaboratorProfilesLayerComponent implements OnInit {

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  public modalComponent;

  public settings: any = {};
  public model: FormGroup;
  public submited: boolean = false;
  public blur: any = {};
  public JSON = JSON;
  public currentUserType: string = Utilities.operator.usertype; 
  public currentUsername: string = Utilities.operator.username;
  public eventDataPermissions: any = null;

  public updateComponent: any;

  // FormControls

  public formConstrols;

  constructor(){}

  public ngOnInit() { this.callback.emit({ instance: this }); }

  // Initialize Method

  public bootstrap(settings: any = {}) {

    this.settings = settings;
    this.settings.data = {};
    this.settings.data.action = "add";
    
    const layerSettings = Utilities.deepClone(settings);
    this.modalComponent.onOpen(layerSettings);
    this.config();
  }

  // User Interface Actions

  public onConfirmSubmit() {
  
    const value = Utilities.deepClone(this.model.value);
    value.permissions = this.eventDataPermissions.permissions;
    value.name = value.name.toUpperCase();

    this.settings.callback(value);
  }

  public onConfirmDelete() {
    this.settings.callback({ data: this.settings.data });
  }

  // Modal Actions

  public onOpen(settings: any) {

    this.settings = settings;
    this.settings.data = this.settings.data ? this.settings.data : {};
    this.settings.data.action = this.settings.data.action ? this.settings.data.action.toLowerCase() : "";

    const layerSettings = Utilities.deepClone(settings);
    this.modalComponent.onOpen(layerSettings);

    this.config();
  }

  public onClose() {

    if (this.updateComponent && this.updateComponent.permissionsCoponent) {
      this.updateComponent.permissionsCoponent.reset();
    }

    this.modalComponent.onClose();
    this.eventDataPermissions = null;
  }

  // Event Listeners

  public onLayerResponse(event: any) {
    
    if (event.close){ }

    if (event.instance) {
      this.modalComponent = event.instance;
    }
  }
  
  public onUpdateComponentReponse(event){

    if (event.instance) {
      this.updateComponent = event.instance;
    }

    if (event.close) {
      this.callback.emit({ close: true }); 
    }
  }

  // Setting Methods

  private config(){

    if (!this.settings.callback){ this.settings.callback = (event, data, model)=>{}; }

    if (this.settings.activeComponent == "Profile/View" || this.settings.activeComponent == "Profile/Edit" || this.settings.activeComponent == "Profile/Add" || this.settings.activeComponent == "Profile/Delete") {
      
      const timer = setInterval(()=>{
        
        if (this.updateComponent) {
          this.updateComponent.bootstrap(this.settings);
          clearInterval(timer);
        }
      }, 0);
    }
  } 

}
