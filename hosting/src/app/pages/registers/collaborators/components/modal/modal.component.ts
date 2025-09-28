import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

// Components
import { CollaboratorsModalLayerComponent } from '../modal/components/layer/layer.component';

// Services
import { AuthService } from '../../../../../auth/auth.service';
import { CollaboratorProfilesService } from '../modal/components/others/profiles/profiles.service';
import { NotificationService } from '@shared/services/notification.service';
import { CollaboratorsService } from '../../collaborators.service';

// Translate
import { CollaboratorsTranslate } from '../../collaborators.translate';

// Interfaces
import { IRegistersCollaborator } from '@shared/interfaces/IRegistersCollaborator';
import { ENotificationStatus } from '@shared/interfaces/ISystemNotification';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { FieldMask } from '@shared/utilities/fieldMask';

@Component({
  selector: 'collaborators-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class CollaboratorsModalComponent implements OnInit, OnDestroy {

  public translate = CollaboratorsTranslate.get();

  public settings: any = {};

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  public model: FormGroup;
  public submited: boolean = false;
  public configured: boolean = false;
  public blur: any = {};
  public JSON = JSON;
  public states = Utilities.states;
  
  public currentUserType: string = Utilities.operator.usertype; 
  public currentUsername: string = Utilities.operator.username;
  public isMatrix = Utilities.isMatrix;

  public collaboratorProfiles: any[] = [];
  public currentPermission: any;

  public permissionSettings: any;

  // Components

  private modalComponent: any;
  private layerComponent: any;
  private filtersComponent: any;

  // Properties Acessories

  public formControls;

  public contactsControls;

  public addressControls;

  constructor(
    private formBuilder: FormBuilder,
    private collaboratorProfilesService: CollaboratorProfilesService,
    private service: CollaboratorsService,
    private authService: AuthService,
    private notificationService: NotificationService
  ){
    
    this.collaboratorProfilesService.getProfiles("CollaboratorsModalComponent", (data)=> {
      this.collaboratorProfiles = Utilities.deepClone(data);
    });
  }

  public ngOnInit() { this.callback.emit({ instance: this }); }

  public onOpen(settings: any) {

    this.settings = settings;
    this.settings.data = this.settings.data ? this.settings.data : {};

    if (this.settings.activeComponent == "Collaborator/Filters"){

      this.settings.title = this.translate.mainModal.filtersTitle;
      this.settings.mode = 'sidescreen';
    }else if (this.settings.activeComponent == "Collaborator/Add" || this.settings.activeComponent == "Collaborator/Edit" || this.settings.activeComponent == "Collaborator/Delete" || this.settings.activeComponent == "Collaborator/View"){

      if (this.settings && this.settings.data){

        this.settings.title = this.settings.data.action === "read" ? this.translate.mainModal.viewTitle : (this.settings.data.action === 'add') ? this.translate.mainModal.addTitle : (this.settings.data.action === "edit") ? this.translate.mainModal.editTitle : this.translate.mainModal.deleteTitle
      }

      this.config();
    }


    this.modalComponent.onOpen(this.settings);

    // Checks the component's response and initializes

    const timer = setInterval(() => {     
      
      if (this.settings.activeComponent === 'Collaborator/Filters' && this.filtersComponent) {
        clearInterval(timer);

        this.filtersComponent.bootstrap(this.settings);
      }
    }, 0);

  }

  public onClose() {

    this.modalComponent.onClose();
    this.blur = {}; 

    if (this.layerComponent){ this.layerComponent.onClose(); }
  } 

  // Choice Image

  public choiceImage(event: Event) {
   
    const target = $$(event.target).parents(".image-container");
    const input = $$(target).find("input[type=file]");

    input.trigger("click");

    input.change((evt)=>{

      const reader = new FileReader();
      const readerAsBuffer = new FileReader();

      reader.onloadend = ()=>{

        const r = reader.result;
        target.find("img").attr("src", r);
        this.settings["data"].selectedData.image = r;
      };

      readerAsBuffer.onloadend = ()=>{

        const r = readerAsBuffer.result;
        this.model.get("image").patchValue(r);
      };

      reader.readAsDataURL((input.pos(0) as HTMLInputElement).files[0]);
      readerAsBuffer.readAsArrayBuffer((input.pos(0) as HTMLInputElement).files[0]);
    });

  }

  // Check if submit button is enabled

  public checkEnableButton() {
    return this.model.invalid;
  }

  // Request new Password

  public requestNewPassword(event: Event){
    (<any>event.target).disabled = true;

    this.authService.requestPassword(this.settings.data.selectedData.username, true).then((data)=>{

      setTimeout(()=>{ (<any>event.target).disabled = false; }, 5000);
      this.notificationService.create({
        title: this.translate.titles.main,
        description: this.translate.notifications.requestPassword.success(data.email),
        status:  ENotificationStatus.success,
        path: "",
      }, false);
    }).catch((data)=>{

      setTimeout(()=>{ (<any>event.target).disabled = false; }, 5000);
      this.notificationService.create({
        title:  this.translate.titles.main,
        description: this.translate.notifications.requestPassword.error,
        status:  ENotificationStatus.danger,
        path: "",
      });

      console.log(data);
    });
  }

  
  // Confirm Submit

  public onConfirmSubmit(event){
    
    let type = this.settings["data"].action;
    const source = this.settings["data"].source;
    const value = this.model.value;

    value.image = this.settings["data"].selectedData ? value.image : "";
    value.allowAccess = value.allowAccess == "true" || value.allowAccess === true  ? true : false;
    value.isSendEmailToStore = value.isSendEmailToStore == "true" || value.isSendEmailToStore === true  ? true : false;
    value.permissions = value.usertype == "admin" ? null :(type != "delete") ? value.usertype.toString() : value.usertype;
    value.usertype = value.usertype == "admin" ? value.usertype : "collaborator";

    const collaborator: IRegistersCollaborator = {
      _id: value._id,
      code: value.code ? parseInt(value.code.toString()) : undefined,
      address: value.address,
      contacts: value.contacts,
      email: value.email,
      name: value.name,
      image: value.image,
      username: value.username,
      isSendEmailToStore: value.isSendEmailToStore,
      permissions: value.usertype != "admin" ? value.permissions : null,
      owner: Utilities.storeID,
      usertype: value.usertype,
      allowAccess: value.allowAccess
    };

    if (type !== "delete"){
        
      type = type == "edit" ? "update" : type;

      this.service.saveChanges(event, collaborator, source, type, this).then(()=>{

        this.onClose();
      }).catch(()=>{

        Utilities.loading(false);
      });
    }else if (type == "delete"){

      Utilities.loading(true);

      this.service.removeCollaborator(<any>collaborator).then(()=>{

        this.onClose();
        Utilities.loading(false);
      }).catch(()=>{

        Utilities.loading(false);
      });
    }

  } 

  // Layer Actions

  public onOpenLayer(type: string){
     
    this.layerComponent.onOpen({
      type: type,
      isClose: true,
      callback: (status) => {        
        if (status) { 
          this.layerComponent.onClose();
        }
      }
    });
  }

  // Event Listeners
  
  public onModalResponse(event: any) {
    
    if (event.instance) {
      this.modalComponent = event.instance;
    }
  }

  public onLayerReponse(event){

    if (event.instance && event.instance instanceof CollaboratorsModalLayerComponent) {
      this.layerComponent = event.instance;
    }
  }

  public onFiltersResponse(event: any) {

    if (event.instance) {
      this.filtersComponent = event.instance;
    }
  }

  // Setting Methods

  private config(){

    let data = this.settings["data"];

    if (!this.settings.callback){ this.settings.callback = (event, data, model)=>{}; }

    if (data.selectedData && data.action !== "add"){

      this.settings["data"].source = Utilities.deepClone(data.selectedData);

      this.model = this.formBuilder.group(
        {
          _id: [data.selectedData._id, Validators.required],
          code: [data.selectedData.code, Validators.required],
          image: [data.selectedData.image],
          username: [data.selectedData.username, Validators.required],
          email: [data.selectedData.email, Validators.required],
          name: [data.selectedData.name, Validators.required],
          isSendEmailToStore: [!!data.selectedData.isSendEmailToStore, Validators.required],
          contacts: this.formBuilder.group({
            phone: [data.selectedData.contacts.phone],
            whatsapp: [data.selectedData.contacts.whatsapp],
          }),

          address: this.formBuilder.group({
            addressLine: [data.selectedData.address.addressLine],
            country: [data.selectedData.address.country],
            city: [data.selectedData.address.city],
            state: [data.selectedData.address.state],
            postalCode: [data.selectedData.address.postalCode],
          }),

          allowAccess: [data.selectedData.allowAccess, Validators.required],
          usertype: [data.selectedData.usertype == "admin" ? data.selectedData.usertype : data.selectedData.permissions.code, Validators.required]
        }
      );

      if (data.selectedData.permissions){
        this.permissionSettings = {
          data: {
            selectedData: {
              permissions: data.selectedData.permissions.permissions
            },
            action: this.settings.data.action
          }
        };
      }

      this.settings.data = data;

      this.contactsControls = (<FormGroup>this.model.controls.contacts).controls;
      this.addressControls = (<FormGroup>this.model.controls.address).controls;
      this.formControls = this.model.controls;
    }else{

      this.settings.data = data;
      this.settings["data"].source = null;

      this.model = this.formBuilder.group(
        {
          _id: [""],
          image: [""],
          username: [""],
          email: ["", Validators.required],
          name: ["", Validators.required],
          isSendEmailToStore: ["false", Validators.required],
          contacts: this.formBuilder.group({
            phone: [""],
            whatsapp: [""],
          }),
          
          address: this.formBuilder.group({
            addressLine: [""],
            country: [""],
            city: [""],
            state: [""],
            postalCode: [""],
          }),

          allowAccess: ["true", Validators.required],
          usertype: ["admin", Validators.required],
        }
      );


      this.contactsControls = (<FormGroup>this.model.controls.contacts).controls;
      this.addressControls = (<FormGroup>this.model.controls.address).controls;
      this.formControls = this.model.controls;
    }

    this.configured = true;

    setTimeout(()=>{
      const inputs = $$("input[type=text],input[type=email],input[type=number], select");
      if (inputs.length > 0){

        inputs.blur((evt)=>{ this.blur[($$(evt.target).attr("formControlName"))] = true; });
      }
    },500);

    setTimeout(() => {
      $$('#ContainerCustomModal input[formControlName=cphone]').on('input', (event) => {

        const value = FieldMask.phoneFieldMask($$(event.target)[0].value);
        (<FormGroup>this.model.controls.contacts).controls.phone.setValue(value);
      });

      $$('#ContainerCustomModal input[formControlName=cwhatsapp]').on('input', (event) => {

        const value = FieldMask.phoneFieldMask($$(event.target)[0].value);
        (<FormGroup>this.model.controls.contacts).controls.whatsapp.setValue(value);
      });

      $$('#ContainerCustomModal input[formControlName=postalCode]').on('input', (event) => {
        
        const value = FieldMask.postalCodeFieldMask($$(event.target)[0].value);
        (<FormGroup>this.model.controls.address).controls.postalCode.setValue(value);
      });
    }, 1000);
  }

  // Destruction Method

  public ngOnDestroy() { 
    this.collaboratorProfilesService.removeListeners("records", "CollaboratorsModalComponent");
  }

}
