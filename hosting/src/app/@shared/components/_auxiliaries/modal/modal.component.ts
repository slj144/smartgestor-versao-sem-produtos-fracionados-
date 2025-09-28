import { Component, OnInit, Output, ViewChild, EventEmitter, ElementRef } from '@angular/core';

// Utilities
import { $$ } from '@shared/utilities/essential';

@Component({
  selector: 'modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
  
  @ViewChild('modal') private modal: ElementRef;
  @Output() callback: EventEmitter<any> = new EventEmitter();

  private _settings: any = {};
  private stackIntances = [];

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  // Getter and Setter Methods

  public get settings() {
    return this._settings;
  }

  public set title(value: string) {
    this._settings.title = value;
  }

  public set subtitle(value: string) {
    this._settings.subtitle = value;
  }

  // Modal Actions

  public onOpen(
    settings: { title: string, subtitle?: string, mode?: ('auto' | 'sidescreen' | 'fullscreen') }, 
    style?: { width?: (number | string), height?: (number | string), backgroundColor?: string }
  ) {

    this._settings = (settings || {});

    if (style?.backgroundColor) {

      $$(this.modal.nativeElement).find('div[slot=content]').css({
        'background-color': style.backgroundColor
      });

      delete style.backgroundColor;
    }

    if (this._settings?.mode) {

      const removeAllClasses = (exclude: string)=>{
        const classes = ['auto', 'sidescreen', 'fullscreen'];
        classes.forEach((className)=>{
          if(className != exclude){
            $$(this.modal.nativeElement).find('.modal-container').removeClass(className);
          }
        });
      };

      switch (this._settings.mode) {
        case 'auto':
          removeAllClasses('auto');
          $$(this.modal.nativeElement).find('.modal-container').addClass('auto').css(style);
          break;
        case 'sidescreen':
          removeAllClasses('sidescreen');
          $$(this.modal.nativeElement).find('.modal-container').addClass('sidescreen').css(style);
          break;
        case 'fullscreen':
          removeAllClasses('fullscreen');
          $$(this.modal.nativeElement).find('.modal-container').addClass('fullscreen');
          break;
      }
    } else {
      $$(this.modal.nativeElement).find('.modal-container').addClass('fullscreen');
    }
    
    this.attachShortcut();

    $$(this.modal.nativeElement).addClass('active');
  }  

  public onClose() {

    $$(this.modal.nativeElement).removeClass('active');

    $$(this.modal.nativeElement).find('nb-card').removeClass('auto');
    $$(this.modal.nativeElement).find('nb-card').removeClass('sidescreen');
    $$(this.modal.nativeElement).find('nb-card').removeClass('fullscreen');

    this.callback.emit({ close: true });
  }

  // Utility Methods

  private attachShortcut() {

    this.stackIntances.push(this.modal.nativeElement);

    const handler = (e) => {
      
      if (e.keyCode == 27) {
        this.onClose();
        this.stackIntances.pop();
      }

      $$(window).off('keydown', handler);
    };

    $$(window).on('keydown', handler);
  }

}
