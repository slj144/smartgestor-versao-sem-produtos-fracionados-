import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { FieldMask } from '@shared/utilities/fieldMask';
import { IStore } from '@shared/interfaces/IStore';
import { InformationsTranslate } from '../../informations.translate';
import { StoreService } from '../../informations.service';

@Component({
  selector: 'my-store-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class InformationsModalComponent implements OnInit {

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  public translate = InformationsTranslate.get();

  public title: string;
  public model: FormGroup;
  public submited: boolean;
  public blur: any = {};

  public states = Utilities.states;

  get isFiscal(){
    return Utilities.isFiscal
  }
  
  get isMatrix(){
    return Utilities.isMatrix
  }

  get matrixData(){
    return Utilities.currentLoginData && Utilities.currentLoginData.matrixInfo ? Utilities.currentLoginData.matrixInfo : {};
  }

  private modalComponent: any;

  get formControls(){ return this.model ? this.model.controls : undefined; }

  get contactsControls(){ return this.model ? (<FormGroup>this.model.controls.contacts).controls : undefined; }

  get rootUserControls(){ return this.model ? (<FormGroup>this.model.controls.rootUser).controls : undefined; }

  get addressControls(){ return this.model ? (<FormGroup>this.model.controls.address).controls : undefined; }


  constructor(
    private formBuilder: FormBuilder,
    private service: StoreService
  ) {}

  public settings: any = {};

  public ngOnInit() {    
    this.callback.emit({ instance: this });
  }

  public onOpen(settings: any) {

    this.title = (()=>{
      if (settings && settings.data.action == "edit"){
        return this.translate.mainModal.editTitle;
      }
    })();

    settings.title = this.title;
    this.settings = settings

    this.modalComponent.onOpen(settings);
    this.config();
  }

  public onClose() {
    this.modalComponent.onClose();
  }
  
  private config(){

    let data = this.settings["data"];

    if (!this.settings.callback){

      this.settings.callback = (event, data, model)=>{};
    }

    if (data.selectedData){

      data.selectedData = Utilities.deepClone(data.selectedData);
      this.settings["data"] = data;
      this.settings["data"]["source"] = Utilities.deepClone(data.selectedData);

      this.model = this.formBuilder.group(
        {
          _id: [data.selectedData._id],
          image: [data.selectedData.image],
          name: [data.selectedData.name, [Validators.required]],
          billingName: [data.selectedData.billingName ? data.selectedData.billingName : "", [Validators.required]],
          cnpj: [data.selectedData.cnpj, [Validators.required]],
          cnpjFiscal: [data.selectedData.cnpjFiscal || this.matrixData.cnpj, this.isFiscal && !this.isMatrix ? [Validators.required] : []],

          rootUser: this.formBuilder.group({
            _id: [data.selectedData.rootUser._id, Validators.required],
            code: [data.selectedData.rootUser.code, Validators.required],
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
    }

    setTimeout(()=>{
      let inputs = $$("input[type=text],input[type=email],input[type=number], select");
      if (inputs.length > 0){

        inputs.blur((evt)=>{ this.blur[($$(evt.target).attr("formControlName"))] = true; });
      }
    },500);


    setTimeout(() => {
      $$('#ContainerCustomModal input[formControlName=cnpj]').on('input', (event) => {
        const value = FieldMask.cnpjFieldMask($$(event.target)[0].value);
        this.model.controls.cnpj.setValue(value);
      });

      $$('#ContainerCustomModal input[formControlName=cphone]').on('input', (event) => {
        const value = FieldMask.phoneFieldMask($$(event.target)[0].value);
        this.contactsControls.phone.setValue(value);
      });

      $$('#ContainerCustomModal input[formControlName=cwhatsapp]').on('input', (event) => {
        const value = FieldMask.phoneFieldMask($$(event.target)[0].value);
        this.contactsControls.whatsapp.setValue(value);
      });

      $$('#ContainerCustomModal input[formControlName=postalCode]').on('input', (event) => {
        const value = FieldMask.postalCodeFieldMask($$(event.target)[0].value);
        this.addressControls.postalCode.setValue(value);
      });
    }, 1000);  
   
  }

  public choiceImage(event: Event, type: string){
   
    const target = $$(event.target).parents(type == 'store' ? ".image-container" : '.imgc-admin');

    if (!$$(target).length){ return; }

    const input = $$(target).find("input[type=file]");

    input.trigger("click");

    input.change((evt)=>{
      const reader = new FileReader();
      const readerAsBuffer = new FileReader();

      reader.onloadend = ()=>{

        const r = reader.result;
        target.find("img").attr("src", r);
        this.settings["data"].selectedData[type == 'store' ? 'image' : 'adminImage'] = r as string;
      };

      readerAsBuffer.onloadend = ()=>{

        const r = readerAsBuffer.result;

        if (type == 'store'){

          this.model.get('image').patchValue(r);
        }else{

          this.rootUserControls.image.patchValue(r);
        }
      };

      reader.readAsDataURL((input.pos(0) as HTMLInputElement).files[0]);
      readerAsBuffer.readAsArrayBuffer((input.pos(0) as HTMLInputElement).files[0]);
    });

  }

  public onConfimrSubmit(event: Event){

    const modelData = this.model.value;

    const store: IStore = {
      _id: modelData._id,
      name: modelData.name,
      billingName: modelData.billingName,
      cnpj: modelData.cnpj,
      cnpjFiscal: modelData.cnpjFiscal,
      image: modelData.image,
      address: {
        addressLine: modelData.address.addressLine.trim(),
        city: modelData.address.city.trim(),
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
        email: modelData.rootUser.email ? modelData.rootUser.email.trim() : null,
        image: modelData.rootUser.image,
        username: modelData.rootUser.username.trim(),
      }
    };


    const source = this.settings["data"]["source"];
    let type = this.settings.data.action;

    if (type !== "delete"){
      type = type === "edit" ? "update" : type;
      if (type == "update"){
        Utilities.loading(true);

        this.submited = true;
        this.service.saveChanges(event, source, store, type,  this).then(()=>{

          Utilities.loading(false);
          this.submited = false;
          this.onClose();
        }).catch(()=>{

          this.submited = false;
          Utilities.loading(false);
        });
      }
    }
  }

  // Modal Response

  public onModalResponse(event: any) {

    if (event.instance) {
      this.modalComponent = event.instance;
    }

    if (event.close) { }
  }

}
