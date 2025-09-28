import { Component, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

// Services
import { CollaboratorProfilesService } from '../../../../profiles.service';

// Translate
import { CollaboratorsTranslate } from '../../../../../../../../../collaborators.translate';

// Utilities
import { Utilities } from '@shared/utilities/utilities';

@Component({
  selector: 'collaborator-profiles-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.scss']
})
export class CollaboratorProfilesUpdateComponent implements OnInit {

  public translate = CollaboratorsTranslate.get();

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  public settings: any = {};
  public model: FormGroup;
  public submited: boolean = false;
  public blur: any = {};
  public profiles: any[] = [];
  public JSON = JSON;
  public currentUserType: string = Utilities.operator.usertype; 
  public currentUsername: string = Utilities.operator.username;
  public eventDataPermissions: any = null;

  public permissionsCoponent: any;
  public layerComponent: any;


  // FormControls
  
  public formControls;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private collaboratorProfilesService: CollaboratorProfilesService
  ){

    this.collaboratorProfilesService.getProfiles('CollaboratorProfilesComponent', (data: any[]) => {

      this.profiles = data;
    });
   }

   public ngAfterContentChecked() : void {
    this.changeDetector.detectChanges();
  }

  public ngOnInit() {  this.callback.emit({ instance: this }); }

  // User Interface Actions

  public onConfirmDelete() {
    if (this.settings.data.action == "delete"){

      this.submited = true;

      const value = Utilities.deepClone(this.model.value);
      value.permissions = this.eventDataPermissions.permissions;
      value.name = value.name.toUpperCase();

      this.collaboratorProfilesService.deleteProfile(value, () =>{
        this.onCloseLayer();
      }).catch(()=>{ });
    }
  } 

  // Modal Actions

  public bootstrap(settings: any = {}) {

    this.settings = settings ? settings : {};
    this.settings.data = this.settings.data ? this.settings.data : {};
    this.settings.data.action = this.settings.data.action ? this.settings.data.action : "add";
    this.settings.data.action = this.settings.data.action ? this.settings.data.action.toLowerCase() : "";
    const layerSettings = Utilities.deepClone(settings);
    layerSettings.hideHeader = true;

    // console.log(this.settings);

    this.layerComponent.onOpen(layerSettings);
    this.config();
  }

  public onCloseLayer() {

    if (this.permissionsCoponent){ this.permissionsCoponent.reset(); }
    this.settings = {};
    this.eventDataPermissions = null;
    this.submited = false;
    this.callback.emit({ close: true });    
  } 


  private config(){

    let data = this.settings["data"];

    if (!this.settings.callback){ this.settings.callback = (event, data, model)=>{}; }

    if (data.selectedData && data.action !== "add"){

      data["originalData"] = {...data.selectedData};

      this.settings.data = data;

      this.model = this.formBuilder.group(
        {
          _id: [data.selectedData._id, Validators.required],
          code: [data.selectedData.code, Validators.required],
          name: [data.selectedData.name, Validators.required],
          cloneProfile: [""]
        }
      );
    }else{

      this.settings.data = data;

      this.model = this.formBuilder.group(
        {
          code: [],
          name: ["", Validators.required],
          cloneProfile: [""]
        }
      );

    }

    this.formControls = this.model.controls;
  }

  // Modal Response
  
  public onLayerResponse(event: any) {

    if (event.close) { this.onCloseLayer(); }
  
    if (event.instance) { this.layerComponent = event.instance; }
  }

  // Permission Response

  public onPermissionsReponse(event){

    if (event.data){

      this.eventDataPermissions = event.data;
    }

    if (event.instance){

      this.permissionsCoponent = event.instance;
    }
  }

  // Check if has some permissions selected 
  
  public checkEnableButton(){

    return !this.isSelectedPermissions() || this.model.invalid;
  }

  public isSelectedPermissions(){

    let status: boolean = this.eventDataPermissions ? this.eventDataPermissions.isSelected : false;
    return status;
  }

  // Select Profile to Clone

  public onChangeClone(event: any){

    const value = event.target.value;

    if (value.trim()){

      this.profiles.forEach(item => {
        if (item.code == value){
  
          const permissions = Utilities.deepClone(item.permissions);
          const settings = Utilities.deepClone(this.settings);
          settings.data.profiles = this.profiles;
          settings.data.selectedData = {permissions: permissions};
          settings.data.action = "edit";
  
          this.settings = settings;
        }
      });
    }else{

      const settings = Utilities.deepClone(this.settings);
      settings.data.profiles = this.profiles;
      settings.data.selectedData = {};
      settings.data.action = "add";
      this.settings = settings;
    }
  }

  // Confirm Submit

  public onConfirmSubmit(){

    this.submited = true;

    Utilities.loading();
    
    const value = Utilities.deepClone(this.model.value);
    value.permissions = this.eventDataPermissions.permissions;
    value.name = value.name.toUpperCase();

    delete value.cloneProfile;

    // console.log(value);

    // return;

    if (this.settings.data.action == "add" || this.settings.data.action == "edit"){

      this.collaboratorProfilesService.updateProfile(value).then(()=>{

        this.onCloseLayer();
      }).catch(()=>{ Utilities.loading(false); });
    }
  }

}
