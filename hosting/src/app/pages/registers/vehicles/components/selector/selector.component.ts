import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, OnDestroy } from '@angular/core';

// Services
import { VehiclesService } from '../../vehicles.service';

// Translate
import { VehiclesSelectorTranslate } from './selector.translate';

// Interfaces
import { IRegistersVehicles } from '@shared/interfaces/IRegistersVehicles';

// Types
import { query } from '@shared/types/query';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';

@Component({
  selector: 'vehicles-selector',
  templateUrl: './selector.component.html',
  styleUrls: ['./selector.component.scss']
})
export class VehiclesSelectorComponent implements OnInit, OnDestroy {

  public translate = VehiclesSelectorTranslate.get();

  @Output() callback: EventEmitter<any> = new EventEmitter();
  @ViewChild('searchBar', { static: true }) searchBar: ElementRef;

  public static shared: VehiclesSelectorComponent;

  private registerComponent: any;
  private toastComponent: any;

  public loading: boolean = false;
  public settings: any = {};
  public recordsData: any = [];
  public searchData: any = [];
  public searchText: string = '';
  public searchBy: string = '';
  public servicesPreSelected: any = [];
  public servicesSelected: any = [];

  constructor(
    private vehiclesService: VehiclesService
  ) {
    VehiclesSelectorComponent.shared = this;
  }

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  public bootstrap() {
    $$(this.searchBar.nativeElement).find('input')[0].focus();
  }

  // Filter Methods

  public onSearch(settings?: { where: query['where'] }) {

    return (new Promise<IRegistersVehicles[]>((resolve, reject) => {

      const value = $$(this.searchBar.nativeElement).find('input').val().toLowerCase(); 

      if (value != '') {

        if (!settings) {
          settings = { where: [] };
        }
        
        if (this.searchBy == 'PLATE') {
          settings.where.push({ field: 'plate', operator: 'like', value: new RegExp(value, 'gi') });
        }

        if (this.searchBy == 'CODE') {
          settings.where.push({ field: 'code', operator: '=', value: parseInt(value) });
        }

        this.loading = true;

        this.vehiclesService.query(settings.where, false, false, false, false).then((data) => {

          $$(data).map((key, item) => {
            if (item._isDisabled) { data.splice(key, 1) }
          });

          this.recordsData = data;
          this.searchText = value;
    
          this.loading = false;
          resolve(data);
        }).catch((error) => {
          this.reset();
          reject(error);
        });
      } else {
        this.reset();
        reject(new Error(''));
      }
    }));
  }

  public onCheckSearchBar(value: string) {

    value = value.replace(/\.|\/|\-/g,'');
    
    if (!isNaN(parseInt(value))) {
      this.searchBy = 'CODE';
    }
    
    if (isNaN(parseInt(value))) {
      this.searchBy = 'PLATE';
    }    
  }
  
  // Operating Actions

  public onResetSearchBar() {

    this.recordsData = [];
    this.searchText = '';

    $$(this.searchBar.nativeElement).find('input').val('');    
  }

  public onSelectVehicle(data: any) {

    this.onResetSearchBar();
    this.callback.emit({ instance: this, data: data, close: true });

    setTimeout(() => { this.reset() }, 800);
  }

  public onRegisterVehicle(data: IRegistersVehicles = null) {

    const settings: any = {
      title: this.translate.toast.register.title,
      type: (!data ? 'add' : 'edit'),
      data: Utilities.deepClone(data)
    };

    const timer = setInterval(() => {
      if (this.registerComponent) {
        this.registerComponent.bootstrap({ data });
        clearInterval(timer);
      }
    }, 0);

    this.toastComponent.onOpen(settings);
  }

  public onConfirmSelect() {

    const services = this.servicesSelected;

    $$(services).map((_, item) => {
      item.customPrice = (item.customPrice || item.executionPrice);
    });

    this.onResetSearchBar();

    this.callback.emit({ data: services, close: true });
  }
  
  // Event Listeners

  public onToastResponse(event: any) {

    if (event.instance) {
      this.toastComponent = event.instance;
    }

    if (event.data) {
      this.onSearch();
    }

  }
  
  public onRegisterResponse(event: any) {

    if (event.instance) {
      this.registerComponent = event.instance;
    }

    if (event.data) {
      this.onSearch();
    }

    if (event.close) {
      this.toastComponent.onClose();
    }
  }
  
  // Utility Methods

  public reset() {
    this.searchText = '';
  }

  // Destruction Methods

  public ngOnDestroy() {

    this.loading = true;

    this.settings = {};
    this.recordsData = [];
    this.searchText = '';
  }

}
