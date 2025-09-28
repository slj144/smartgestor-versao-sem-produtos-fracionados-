import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

// Services
import { StoreService } from '../../informations.service';

// Translate
import { StoresSelectorTranslate } from './selector.translate';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';

@Component({
  selector: 'stores-selector',
  templateUrl: './selector.component.html',
  styleUrls: ['./selector.component.scss']
})
export class StoresSelectorComponent implements OnInit {

  @Output() callback: EventEmitter<any> = new EventEmitter();
  @ViewChild('searchBar', { static: true }) searchBar: ElementRef;

  public translate = StoresSelectorTranslate.get();

  public loading: boolean = true;
  public filtersBadge: number = 0;
  public settings: any = {};  
  public recordsData: any = [];
  public searchData: any = [];
  public searchText: string = '';

  constructor(
    private storeService: StoreService
  ) {}

  public ngOnInit() {

    this.storeService.getStores('StoresSelectorComponent', (data) => {

      const arrData = [];

      $$(data).map((_, item) => {
        if (item._id != Utilities.storeID) {
          arrData.push(item);
        }
      });

      this.recordsData = arrData;
      this.loading = false;
    });

    this.callback.emit({ instance: this });
  }

  // Initialize Method

  public bootstrap() {
    $$(this.searchBar.nativeElement).find('input')[0].focus();
  }

  // User Interface Actions - Filters

  public onFilter() {

  }

  public onSearch() {

    const value = $$(this.searchBar.nativeElement).find('input').val().toLowerCase();
    const searchResult = [];

    this.loading = true;

    if (value != '') {

      $$(this.recordsData).map((_, item) => {

        if (item._id != Utilities.storeID) {

          if (
            (String(item._id).toLowerCase().search(value) != -1) || (String(item.cnpj).toLowerCase().search(value) != -1) ||
            (String(item.name).toLowerCase().search(value) != -1) || (String(item.billingName).toLowerCase().search(value) != -1)
          ) {
            searchResult.push(item);
          }
        }
      });

      this.searchText = value;
    } else {
      this.searchText = '';
    }

    setTimeout(() => {
      this.loading = false;
      this.searchData = searchResult;
    }, 1000);
  }
  
  public onCheckSearchBar(value: string) {

    if (value == '') {

      setTimeout(() => { 
        this.searchData = [];
        this.searchText = '';
      }, 1000);      
    }
  }
  
  // User Interface Actions - Common

  public onResetSearchBar() {
    $$(this.searchBar.nativeElement).find('input').val('');
    this.searchData = [];
  }

  public onSelectStore(data: any) {

    if (data.address) {
      const address = data.address;
      data.address = `${address.addressLine}, ${address.city} - ${address.state}`;
    }

    this.onResetSearchBar();

    this.callback.emit({ instance: this, data: data, close: true });
  }

  // Destruction Methods

  public ngOnDestroy() {

    this.settings = {};
    this.filtersBadge = 0;
    this.recordsData = [];
    this.searchData = [];

    this.storeService.removeListeners('stores', 'StoresSelectorComponent');
  }

}
