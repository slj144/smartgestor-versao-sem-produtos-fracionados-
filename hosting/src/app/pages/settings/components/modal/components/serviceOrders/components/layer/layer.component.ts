import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';


// Ultilities
import { NotificationService } from '@shared/services/notification.service';
import { ENotificationStatus } from '@shared/interfaces/ISystemNotification';
import { SettingsTranslate } from '../../../../../../settings.translate';
import { Utilities } from '@shared/utilities/utilities';

@Component({
  selector: 'settings-service-orders-layer',
  templateUrl: './layer.component.html',
  styleUrls: ['./layer.component.scss']
})
export class SettingsServiceOrdersLayerComponent implements OnInit {

  @Output() callback: EventEmitter<any> = new EventEmitter();

  public translate = SettingsTranslate.get();
  
  public settings: any = {};
  public model: FormGroup;
  public layerComponent: any;

  public servicesProviders: Array<any> = [];
  public servicesLoading: boolean = true;
  private originalServicesProviders: Array<any> = [];

  public servicesProvideersForm: FormGroup;
  public servicesPaginationComponent: any;

  constructor(
    private formBuilder: FormBuilder,
    private notificationsService: NotificationService
  ) {}

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // User Interface Actions

  public onComponentResponse(data: any) {

    if (data.close) {
      this.onClose();
    }

    this.callback.emit(data);    
  }

  // Layer Actions

  public onOpen(settings: any) {
    
    this.settings = settings;

    this.settings.title = (()=>{
      if (this.settings.activeComponent == "Checklist/Add"){

        return SettingsTranslate.get().modal.section.serviceOrders.titles.addTitle;
      }
      if (this.settings.activeComponent == "Checklist/Edit"){
        
        return SettingsTranslate.get().modal.section.serviceOrders.titles.editTitle;
      }
      if (this.settings.activeComponent == "Checklist/Delete"){
        
        return SettingsTranslate.get().modal.section.serviceOrders.titles.deleteTitle;
      }
    })();


    this.layerComponent.onOpen(Utilities.deepClone(this.settings));
    this.config(settings);
  }

  public onClose() {

    this.layerComponent.onClose();
  }


  private isChange(newData, oldData): boolean{
    let isChange: boolean = false;

    if (newData.subchecklist.length != oldData.subchecklist.length || newData.name != oldData.name){

      return true;
    }

    newData.subchecklist.forEach((item, key)=>{
      if (item != oldData.subchecklist[key]){

        isChange = true;
      }
    });

    return isChange;
  }

  public onConfirmSubmit(){

    if (this.model.invalid){ return; }

    const oldValue: any = this.settings.data && typeof this.settings.data ? this.settings.data : {checklistItem: {}};
    const newValue: any = this.model.value;
    oldValue.subchecklist = oldValue.subchecklist ? oldValue.subchecklist : [];
    newValue.subchecklist = newValue.subchecklist ? newValue.subchecklist : [];

    if (oldValue.name !== newValue.name && this.settings.activeComponent == "Checklist/Add" || this.isChange(newValue, oldValue) && this.settings.activeComponent == "Checklist/Edit"){

      this.settings.callback(newValue, oldValue, this.settings.type);
    }else{

      this.onClose();
    }
  }

  public config(settings){

    if (settings.activeComponent === "Checklist/Add" || settings.activeComponent === "Checklist/Edit"){

      this.model = this.formBuilder.group({
        name: [settings.data && typeof settings.data.name === "string" ? settings.data.name : "", Validators.required],
        subchecklist: this.formBuilder.array([])
      });

      this.setSubChecklistArray(settings.data && settings.data.subchecklist ? [...settings.data.subchecklist] : []);
    }
  }

  
  public onCreateCheckList(parentSub, name) {

    if (!this.formControls.subchecklist.value) { 

      this.formControls.subchecklist.setValue([]);
    }

    if (!name.value.trim()){
      
      this.notificationsService.create({
        title: "CheckList",
        description: "O nome do item não pode estar vazio.",
        status: ENotificationStatus.danger,
        path: "",
      },false);
      return;
    }

    
    const checklist = this.formControls.subchecklist.value;

    if (checklist.indexOf(name.value.trim()) === -1){

      (this.model.controls.subchecklist as FormArray).push(new FormControl(name.value.trim()));
      name.value = "";
    }else{

      this.notificationsService.create({
        title: "CheckList",
        description: "Já exite um item com esse nome.",
        status: ENotificationStatus.danger,
        path: "",
      },false);
    }
  }
  
  public onDeleteChecklist(index: number) {
    
    (this.model.controls.subchecklist as FormArray).removeAt(index);
  }

  public setSubChecklistArray(subchecklist: Array<string>){

    subchecklist.forEach((item)=>{
      (this.model.controls.subchecklist as FormArray).push(new FormControl(item));
    });
  }

  public get formControls() {
    return this.model.controls;
  }  


  // Event Listeners

  public onLayerResponse(event: any) {
    if (event.instance) {

      this.layerComponent = event.instance;
    }
  }

   // Event Listeners

  public onSearch(event: any) {

    let value = event.target.value.toLowerCase();
    let searchResult = [];

    // if (value != "" && this.servicesPaginationComponent) {
    //   for (let page of this.servicesPaginationComponent.settings.data) {
    //     for (let item of page) {
    //       if (
    //         item.name.toLowerCase().search(value) !== -1
    //       ) {
    //         searchResult.push(item);
    //       }
    //     }
    //   }
    // }

    // if (searchResult.length > 0) {
    //   // let d = this.paginationComponent.create({ data: searchResult,itemsPerPage: 10 });
    //   this.servicesProviders = searchResult;//d ? d : [];
    // } else {

    //   let d = this.servicesPaginationComponent.create({ data: this.originalServicesProviders,itemsPerPage: 10 });
    //   this.servicesProviders = d ? d : [];
    // }
  }

}