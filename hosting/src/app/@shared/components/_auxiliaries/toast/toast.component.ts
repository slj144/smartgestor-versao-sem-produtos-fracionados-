import { Component, OnInit, Output, ViewChild, EventEmitter, ElementRef, OnDestroy } from '@angular/core';

// Utilities
import { $$ } from '@shared/utilities/essential';

@Component({
  selector: 'toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit, OnDestroy {
  
  @Output() public callback: EventEmitter<any> = new EventEmitter();
  @ViewChild('toast', { static: false }) private toast: ElementRef;
  
  private _settings: any = {};
  private listeners: any = {};

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

  // Layer Actions

  public onOpen(
    settings: { title: string, subtitle?: string },
    style?: { width?: (number | string) }
  ) {   
    
    this._settings = (settings || {});

    this.attachEvents();

    if (style?.width) {
      $$(this.toast.nativeElement).find('.drawer').css({ width: style.width });
    }
    
    $$(this.toast.nativeElement).addClass('active');   
    this.callback.emit({ open: true });
  }  

  public onClose() {
    $$(this.toast.nativeElement).removeClass('active');
    this.callback.emit({ close: true });
  }  

  // Utility Methods

  private attachEvents() {

    const layer = $$(this.toast.nativeElement);
    const drawer = $$(this.toast.nativeElement).add('.drawer');

    if (!this.listeners.toast) {

      this.listeners.toast = (e: Event) => {
        this.onClose();
      };
    }

    if (!this.listeners.drawer) {

      this.listeners.drawer = (e: Event) => {
        e.stopPropagation();
      };
    }

    layer.off('click', this.listeners.toast).on('click', this.listeners.toast);
    drawer.off('click', this.listeners.drawer).on('click', this.listeners.drawer);
  }

  // Destruction Methods

  public ngOnDestroy() {
    this.onClose();
  }

}
