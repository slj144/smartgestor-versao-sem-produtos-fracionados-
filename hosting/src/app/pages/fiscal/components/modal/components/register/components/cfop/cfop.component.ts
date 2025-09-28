import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';

// Services

// Utilties
import { $$ } from '@shared/utilities/essential';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'nf-cfop',
  templateUrl: './cfop.component.html',
  styleUrls: ['./cfop.component.scss']
})
export class NfCFOPComponent implements OnInit, OnDestroy, OnChanges {

  @Output() callback: EventEmitter<any> = new EventEmitter();
  @Input() data: string = "";
  @Input() required: boolean = true;
  @Input() general: boolean = true;
  @ViewChild("cfopComponent", {static: false}) addressElement: ElementRef;

  public form: FormGroup;
  public checkSearchPostCode: boolean = false;
  public loading: boolean = true;  
  // public data: any = {};


  get formControls(){
    return this.form.controls;
  }

  constructor(
    private formBuilder: FormBuilder
  ) {}

  public ngOnInit() {
    this.callback.emit({ instance: this });
    this.config();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.config();
  }

  // Initialize Method

  public bootstrap(data: any) {
    this.data = data;
    this.config();
  }

  private config(){

    this.form = this.formBuilder.group({
      cfop: [this.data, this.required ? [Validators.required] : []],
    });

    this.loading = false;

    this.callback.emit({ data: this.form.value.cfop });

    const it = setInterval(()=>{
      if ($$("#cfop-component").length){

        clearInterval(it);

        $$(this.addressElement.nativeElement).add("select").on("change", (evt)=>{
          this.callback.emit({ data: this.form.value.cfop });
        });
      }
    }, 100);

  }


  // Masks

  // Auxiliary Methods

  // Utility Methods
  
  public reset() {
  }

  // Destruction Methods

  public ngOnDestroy() {

    this.data = "";
  }

}
