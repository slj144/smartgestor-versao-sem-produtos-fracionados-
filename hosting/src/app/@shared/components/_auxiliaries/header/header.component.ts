import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';

// Translate
import { HeaderTranslate } from './header.translate';

@Component({
  selector: 'custom-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  @ViewChild('inputSearch') inputSearch: ElementRef;

  @Input() loading: boolean = true;
  @Input() filtersBadge: number = 0;
  @Input() countData: any = {};
  @Input() orderSettings: any = {order: 1, enabled: false};

  @Output() filter: EventEmitter<any> = new EventEmitter();
  @Output() search: EventEmitter<any> = new EventEmitter();
  @Output() changeOrder: EventEmitter<any> = new EventEmitter();
  

  protected translate = HeaderTranslate.get();

  protected onFilter() {
    this.filter.emit();
  }

  protected onSearch() {
    this.search.emit({ value: this.inputSearch.nativeElement.value });
  }

  protected onChangeOrderBy(){
    this.orderSettings.order = this.orderSettings.order == 1 ? -1 : 1;
    this.changeOrder.emit({order: this.orderSettings.order});
  }
 
}
