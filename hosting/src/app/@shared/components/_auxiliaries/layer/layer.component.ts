import { Component, OnInit, Output, ViewChild, EventEmitter, ElementRef, OnDestroy } from '@angular/core';

// Utilities
import { $$ } from '@shared/utilities/essential';

@Component({
  selector: 'layer',
  templateUrl: './layer.component.html',
  styleUrls: ['./layer.component.scss']
})
export class LayerComponent implements OnInit, OnDestroy {
  
  @Output() public callback: EventEmitter<any> = new EventEmitter();
  @ViewChild('layer', { static: false }) private layer: ElementRef;
  
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
    settings: { title?: string, subtitle?: string, mode?: ('middlescreen' | 'fullscreen') }
  ) {
    
    this._settings = (settings || {});

    if (this._settings.mode) {

      switch (this._settings.mode) {
        case 'middlescreen':
          // $$(this.layer.nativeElement).find('nb-card').addClass('middlescreen');
          break;
        case 'fullscreen':
          // $$(this.layer.nativeElement).find('nb-card').addClass('fullscreen');
          break;
      }
    } else {
      // $$(this.layer.nativeElement).find('nb-card').addClass('middlescreen');
    }   

    this.attachEvents();

    $$(this.layer.nativeElement).addClass('active');
    $$(this.layer.nativeElement).animate({ opacity: 1 }, { duration: 800 });
  }  

  public onClose() {
    $$(this.layer.nativeElement).removeClass('active');
    this.callback.emit({ close: true });
  }  

  // Utility Methods

  private attachEvents() {

    const layer = $$(this.layer.nativeElement);
    const drawer = $$(this.layer.nativeElement).add('.drawer');

    if (!this.listeners.layer) {
      
      this.listeners.layer = (e: Event) => {
        this.onClose();
      };
    }

    if (!this.listeners.drawer) {

      this.listeners.drawer = (e: Event) => {
        e.stopPropagation();
      };
    }

    layer.off('click', this.listeners.layer).on('click', this.listeners.layer);
    drawer.off('click', this.listeners.drawer).on('click', this.listeners.drawer);
  }

  // Destruction Methods

  public ngOnDestroy() {
    this.onClose();
  }

}
