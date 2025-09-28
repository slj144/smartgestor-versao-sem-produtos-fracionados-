import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { FieldMask } from '@shared/utilities/fieldMask';
import { IStore } from '@shared/interfaces/IStore';
import { BranchesTranslate } from '../../branches.translate';
import { BranchesService } from '../../branches.service';

@Component({
  selector: 'branches-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class BranchesModalComponent implements OnInit {

  public translate = BranchesTranslate.get();

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  public model: FormGroup;
  public submited: boolean;
  public blur: any = {};

  public modalComponent: any;

  public states = Utilities.states;

  constructor(
    private formBuilder: FormBuilder,
    private service: BranchesService
  ) {  }

  public settings: any = {};

  public ngOnInit() {    

    this.callback.emit({ instance: this });
  }

  public onOpen(settings: any) {

    settings.title = (()=>{

      return settings.activeComponent === "Branch/View" ? this.translate.mainModal.viewTitle :(settings.activeComponent === "Branch/Edit") ? this.translate.mainModal.editTitle :(settings.activeComponent === "Branch/Add") ? this.translate.mainModal.addTitle : this.translate.mainModal.deleteTitle;
    })();


    this.settings = settings;
    this.modalComponent.onOpen(settings);
    this.config();
  }

  public onClose() {
    
    this.blur = {};
    this.modalComponent.onClose();
  }

  get formControls(){ return this.model.controls; }

  get contactsControls(){ return this.model ? (<FormGroup>this.model.controls.contacts).controls : undefined; }

  get rootUserControls(){ return this.model ? (<FormGroup>this.model.controls.rootUser).controls : undefined; }

  get addressControls(){ return this.model ? (<FormGroup>this.model.controls.address).controls : undefined; }

  public onConfirmSubmit(event: Event){

    const modelData = this.model.value;
    const data = this.settings["data"];

    const branch: IStore = {
      _id: modelData._id,
      name: modelData.name,
      billingName: modelData.billingName,
      cnpj: modelData.cnpj,
      address: {
        addressLine: modelData.address.addressLine.trim(),
        city: modelData.address.city.trim(),
        // country: "Brazil",
        postalCode: modelData.address.postalCode.trim(),
        state: modelData.address.state.trim()
      },
      contacts: {
        email: modelData.contacts.email ? modelData.contacts.email.trim() : "",
        phone: modelData.contacts.phone ? modelData.contacts.phone.trim() : "",
        whatsapp: modelData.contacts.whatsapp ? modelData.contacts.whatsapp.trim() : ""
      },  
      rootUser: <any>{
        _id: modelData.rootUser._id ? modelData.rootUser._id.trim() : null,
        name: modelData.rootUser.name.trim(),
        email: modelData.rootUser.email.trim(),
        image:  data.selectedData && data.selectedData.rootUser && data.selectedData.rootUser.image ? data.selectedData.rootUser.image.trim() : "",
        username: data.action === "add" ? "" : modelData.rootUser.username.trim(),
      },
      image:  modelData.image ? modelData.image : "",
    };


    let type = this.settings["data"].action;

    if (type !== "delete"){
            
      type = type == "edit" ? "update" : type;

      Utilities.loading(true);
      this.service.saveChanges(event, this.settings["data"].source, branch, type, this).then(()=>{

        this.onClose();
        Utilities.loading(false);
        this.submited = false;
      }).catch(()=>{

        Utilities.loading(false);
        this.submited = false;
      });
    }else if (type == "delete"){

      Utilities.loading(true);
      Utilities.deepClone(this.settings["data"].source._id);

      this.service.removeBranch(this.settings["data"].source._id).then(()=>{

        Utilities.loading(false);
        this.onClose();
        this.submited = false;
      }).catch(()=>{

        Utilities.loading(false);
        this.submited = false;
      });
    }
  }

  private config(){

    let data = this.settings["data"];

    if (!this.settings.callback){

      this.settings.callback = (event, data, model)=>{};
    }

    if (data.selectedData){

      data.selectedData = Utilities.deepClone(data.selectedData);
      data.source = Utilities.deepClone(data.selectedData);
      this.settings["data"] = data;

      this.model = this.formBuilder.group(
        {
          _id: [data.selectedData._id, [Validators.required]],
          image: [data.selectedData.image],
          name: [data.selectedData.name, [Validators.required]],
          billingName: [data.selectedData.billingName ? data.selectedData.billingName : "", [Validators.required]],
          cnpj: [data.selectedData.cnpj, [Validators.required, Validators.maxLength(30)]],
          
          rootUser: this.formBuilder.group({
            _id: [data.selectedData.rootUser._id, Validators.required],
            image: [data.selectedData.rootUser.image],
            name: [data.selectedData.rootUser.name, Validators.required],
            email: [data.selectedData.rootUser.email, Validators.required],
            username: [data.selectedData.rootUser.username, Validators.required],
          }),

          contacts: this.formBuilder.group({
            email: [data.selectedData.contacts.email],
            phone: [data.selectedData.contacts.phone, Validators.required],
            whatsapp: [data.selectedData.contacts.whatsapp],
          }),

          address: this.formBuilder.group({
            addressLine: [data.selectedData.address.addressLine, Validators.required],
            country: [data.selectedData.address.country],
            city: [data.selectedData.address.city, Validators.required],
            state: [data.selectedData.address.state, Validators.required],
            postalCode: [data.selectedData.address.postalCode, Validators.required],
          })
        }
      );
    }else{

      data.selectedData = {};
      data.source = null;
      this.settings.data = data;

      this.model = this.formBuilder.group(
        {
          image: [""],
          name: ["", [Validators.required]],
          billingName: ["", [Validators.required]],
          cnpj: ["", [Validators.required, Validators.maxLength(30)]],

          contacts: this.formBuilder.group({
            email: [""],
            phone: ["", Validators.required],
            whatsapp: [""],
          }),

          rootUser: this.formBuilder.group({
            image: [""],
            name: ["", Validators.required],
            email: ["", Validators.required],
          }),

          address: this.formBuilder.group({
            addressLine: ["", Validators.required],
            country: [""],
            city: ["", Validators.required],
            state: ["", Validators.required],
            postalCode: ["", Validators.required]
          })
        }
       );
    }

    setTimeout(()=>{
      let inputs = $$("input[type=text],input[type=email],input[type=number],select");
      if (inputs.length > 0){

        inputs.blur((evt)=>{ this.blur[($$(evt.target).attr("formControlName"))] = true; });
      }
    },500);

    setTimeout(() => {
      $$('#ContainerCustomModal input[formControlName=cnpj]').on('input', (event) => {
        const value = FieldMask.cnpjFieldMask($$(event.target)[0].value);
        this.model.controls.cnpj.setValue(value);
      });

      $$('#ContainerCustomModal input[formControlName=phone]').on('input', (event) => {
        const value = FieldMask.phoneFieldMask($$(event.target)[0].value);
        this.contactsControls.phone.setValue(value);
      });

      $$('#ContainerCustomModal input[formControlName=whatsapp]').on('input', (event) => {
        const value = FieldMask.phoneFieldMask($$(event.target)[0].value);
        this.contactsControls.whatsapp.setValue(value);
      });

      $$('#ContainerCustomModal input[formControlName=postalCode]').on('input', (event) => {
        const value = FieldMask.postalCodeFieldMask($$(event.target)[0].value);
        this.addressControls.postalCode.setValue(value);
      });
    }, 1000);   

  }

  public choiceImage(event: Event){
   
    let target = $$(event.target).parents(".image-container");
    let input = $$(target).find("input[type=file]");

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

  // Modal Response
  
  public onModalResponse(event: any) {
  
    if (event.instance) {
      this.modalComponent = event.instance;
    }
  }

}
