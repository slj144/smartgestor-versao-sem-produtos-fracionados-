import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

// Translate
import { CollaboratorsTranslate } from '../../../../collaborators.translate';

@Component({
  selector: 'collaborators-modal-layer',
  templateUrl: './layer.component.html',
  styleUrls: ['./layer.component.scss']
})
export class CollaboratorsModalLayerComponent implements OnInit {

  @Output() callback: EventEmitter<any> = new EventEmitter();
  
  public model: FormGroup;
  
  public settings: any = {};

  public servicesLoading: boolean = true;

  public level: number = -1;
  public currentLevelData: any = {};
  public reportsPermissions: any = {};
  
  private layerComponent: any;
  private profilesComponent: any;

  constructor() {}

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // User Interface Actions

  public onComponentResponse(data: any) {

    if (data.close) { this.layerComponent.onClose(); }
    this.callback.emit(data);    
  }

  // Layer Actions 

  public onOpen(settings: any) {
    
    this.settings = settings;
    this.layerComponent.onOpen(settings);
    this.config(settings);
  }

  public onClose() {
    this.layerComponent.onClose();
  }

  // Event Listeners

  public onLayerReponse(event: any){

    if (event.instance) { 
      this.layerComponent = event.instance; 
    }
  }  

  public onCollaboratorProfilesReponse(event){

    if (event.instance) {
      this.profilesComponent = event.instance;
    }

    if (event.close) {
      this.onClose();
    }    
  }

  // Setting Methods

  public config(settings) {

    if (settings.type == "collaboratorProfiles") {

      this.settings.title = CollaboratorsTranslate.get().mainModal.addTitle;

      const timer = setInterval(() => {

        if (this.profilesComponent) {

          console.log(this.profilesComponent);

          this.layerComponent.title = CollaboratorsTranslate.get().profilesModal.addTitle;

          this.profilesComponent.bootstrap();

          clearInterval(timer);
        }
      }, 0);
    }
  }

}