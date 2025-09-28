import { Component, OnInit, Output, ViewChild, EventEmitter, ElementRef } from '@angular/core';

// Utilities
import { $$ } from '@shared/utilities/essential';

@Component({
  selector: 'tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent implements OnInit {
  
  @Output() public callback: EventEmitter<any> = new EventEmitter();
  @ViewChild('tabs', { static: false }) private tabs: ElementRef;
  
  private _settings: any = {};
  private _activeTab: (number | string) = null;

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  public get settings() {
    return this._settings;
  }

  public get activeTab() {
    return this._activeTab;
  }  

  public onTabItem(event: any, id: (number | string)) {

    const tab = event.currentTarget;
    const tabsSiblings = tab.parentNode.children;

    const target = $$(this.tabs.nativeElement).find(`#container-tab-content div[target=${id}]`)[0];
    const targetSiblings = target.parentNode.children;

    for (let i = 0; i < tabsSiblings.length; i++) {

      if (tabsSiblings[i] != tab) {
        $$(tabsSiblings[i]).removeClass('active');       
      } else {

        this._activeTab = id;

        $$(tabsSiblings[i]).addClass('active');
        
        for (let j = 0; j < targetSiblings.length; j++) {

          if (targetSiblings[j] != target) {
            $$(targetSiblings[j]).removeClass('active');
          } else {
            $$(targetSiblings[j]).addClass('active');
          }
        }
      }
    }  

    this.callback.emit({ activeTab: this.activeTab });
  }

  // Tabs Actions

  public initialize(
    settings: { items: { id: string, name: string }[], activate: string }
  ) {

    this._settings = settings;
    this._activeTab = settings.activate;

    const timer = setInterval(() => {
      
      const tab = $$(this.tabs.nativeElement).find(`#container-tab-options button.${settings.activate}`);

      if (tab.length > 0) {
        clearInterval(timer);
        tab.trigger('click');
      }
    }, 0);

    this.callback.emit({ activeTab: this.activeTab });
  }

}
