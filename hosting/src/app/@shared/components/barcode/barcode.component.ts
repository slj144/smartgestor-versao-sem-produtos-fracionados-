import { Component, Input, ViewChild, ElementRef, OnChanges } from '@angular/core';

import * as JsBarcode from 'jsbarcode';

@Component({
  selector: 'barcode',
  template: `<svg #renderer></svg>`
})
export class BarcodeComponent implements OnChanges {

  @ViewChild('renderer', { static: true }) renderer: ElementRef;

  @Input() value: string = '';
  @Input() format: string = 'CODE128';
  @Input() text: string = undefined;
  @Input() width: number = 2;
  @Input() height: number = 80;
  @Input() margin: number = 10;
  @Input() marginTop: number = undefined;
  @Input() marginBottom: number =	undefined;
  @Input() marginLeft: number =	undefined;
  @Input() marginRight: number = undefined;
  @Input() font: string = 'monospace';
  @Input() fontSize: number = 18;
  @Input() fontOptions: string = '';
  @Input() textMargin: number = 2;
  @Input() textAlign: string = 'center';
  @Input() textPosition: string = 'bottom';
  @Input() background: string = "#ffffff";
  @Input() lineColor: string = "#000000";
  @Input() displayValue: boolean = true;
  @Input() flat: boolean = false;

  public ngOnChanges() {
    JsBarcode(this.renderer.nativeElement, this.value, this.settings);
  }

  public get settings() {

    return {
      format: this.format,
      text: this.text,
      width: this.width,
      height: this.height,
      margin: this.margin,
      marginTop: this.marginTop,
      marginBottom: this.marginBottom,
      marginLeft: this.marginLeft,
      marginRight: this.marginRight,
      font: this.font,
      fontSize: this.fontSize,
      fontOptions: this.fontOptions,
      textMargin: this.textMargin,
      textAlign: this.textAlign,
      textPosition: this.textPosition,
      background: this.background,
      lineColor: this.lineColor,
      displayValue: this.displayValue,
      flat: (this.format == 'EAN8' || this.format == 'EAN13' ? this.flat : false),
      valid: (status: boolean) => {
        if (!status) { 
          throw(`Error: The value (${this.value}) is invalid for the chosen format (${this.format}).`);
        }
      }
    };
  }

}
