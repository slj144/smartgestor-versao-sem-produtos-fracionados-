import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { Utilities } from '@shared/utilities/utilities';
import { FiscalService } from '../../fiscal.service';
import { CancelAdjustNfComponent } from './components/cancel-adjust-note/cancel-adjust-note.component';
import { RegisterNfComponent } from './components/register/register.component';
import { SettingsNfComponent } from './components/settings/settings.component';
import { InutilizationNfComponent } from './components/inutilization/inutilization.component';

@Component({
  selector: 'fiscal-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class FiscalModalComponent implements OnInit {

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  public settings: any = {};

  private modalComponent: any;
  private registerComponent: any;
  private cancelAndAdjustComponent: any;
  private settingsComponent: any;
  private printComponent: any;
  private inutilizationComponent: any;

  private pdfUrl: string;

  constructor(
    private fiscalServicce: FiscalService
  ) {}

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // Modal Actions

  public onOpen(settings: any) {

    this.settings = settings;
    this.settings.data = (this.settings.data || {});

    this.clearPdfUrl();

    const it = setInterval(()=>{
      if (
        this.registerComponent || this.cancelAndAdjustComponent || this.settingsComponent
      ){

        clearInterval(it);

        if (this.registerComponent && settings.activeComponent == "Fiscal/Add"){
          this.registerComponent.bootstrap(settings);
        }

        if (this.cancelAndAdjustComponent && settings.activeComponent == "Fiscal/Cancel" || this.cancelAndAdjustComponent && settings.activeComponent == "Fiscal/Edit"){
          this.cancelAndAdjustComponent.bootstrap(settings);
        }

        if (this.settingsComponent && settings.activeComponent == "Fiscal/Settings"){
          this.settingsComponent.bootstrap(settings);
        }


      }
    });

    this.modalComponent.onOpen({ title: this.settings.title });
  }  

  public onClose() {
    this.settings = {};
    this.settingsComponent = null;
    this.cancelAndAdjustComponent = null;
    this.registerComponent = null;
    this.modalComponent.onClose();
    this.clearPdfUrl();
  }


  public onPrintResponse(event: any) {

    console.log(event);

    if (event.instance) {
      this.printComponent = event.instance;
    }    
  }

  public onDownload(data, type, note = null){
    data = Utilities.deepClone(this.settings.data);
    const isPdf = (type == "PDF");


    if(note == 'cce'){
      this.fiscalServicce.downloadAdjuNote(type, data.id, isPdf).then((res)=>{ 

        console.log(res)

        if(type == "PDF"){
          this.pdfUrl = window.URL.createObjectURL(res);
          const iframe = document.getElementById("nfPreview");
          iframe.setAttribute("src", this.pdfUrl);
        }
  
      }).catch((error)=>{
        console.log("error: ", error);
      });

    }else{
      this.fiscalServicce.downloadNote(data.type, type, data.id, isPdf).then((res)=>{ 

        if(type == "PDF"){
          this.pdfUrl = window.URL.createObjectURL(res);
          const iframe = document.getElementById("nfPreview");
          iframe.setAttribute("src", this.pdfUrl);
        }
  
      }).catch((error)=>{
        console.log("error: ", error);
      });
    }

    
  }

  public onViewInfo(){
    this.clearPdfUrl();
  }

  public formatDate(value: any): Date | null {
    if (!value) {
      return null;
    }

    if (value instanceof Date) {
      return value;
    }

    if (typeof value === 'number') {
      const dateFromNumber = new Date(value);
      return isNaN(dateFromNumber.getTime()) ? null : dateFromNumber;
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();

      if (!trimmed) {
        return null;
      }

      if (trimmed.includes('T')) {
        const isoDate = new Date(trimmed);
        return isNaN(isoDate.getTime()) ? null : isoDate;
      }

      const parts = trimmed.split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts.map((part) => parseInt(part, 10));
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          const dateFromBr = new Date(year, month - 1, day);
          return isNaN(dateFromBr.getTime()) ? null : dateFromBr;
        }
      }

      const fallback = new Date(trimmed);
      return isNaN(fallback.getTime()) ? null : fallback;
    }

    return null;
  }

  private clearPdfUrl(){
    window.URL.revokeObjectURL(this.pdfUrl ?? '');
    this.pdfUrl = '';
  }


  // Event Listeners

  public onModalResponse(event) {
    
    if (event.instance) {
      this.modalComponent = event.instance;
    }
  }

  public onResponse(event) {
    
    if (event.instance instanceof RegisterNfComponent) {
      this.registerComponent = event.instance;
    }

    if (event.instance instanceof CancelAdjustNfComponent) {
      this.cancelAndAdjustComponent = event.instance;
    }

    if (event.instance instanceof SettingsNfComponent) {
      this.settingsComponent = event.instance;
    }

    if (event.instance instanceof InutilizationNfComponent) {
      this.inutilizationComponent = event.instance;
    }

    if (event.print){
      this.printComponent.onOpen({
        activeComponent: 'Fiscal/Receipt',
        data: event.print.data
      });
    }

    if (event.close){
      this.onClose();
    }
  }

}
