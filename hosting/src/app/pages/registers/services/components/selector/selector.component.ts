import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, OnDestroy } from '@angular/core';

// Services
import { ServicesService } from '../../services.service';

// Translate
import { ServicesSelectorTranslate } from './selector.translate';

// Interfaces
import { IRegistersService } from '@shared/interfaces/IRegistersService';

// Types
import { query } from '@shared/types/query';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';

@Component({
  selector: 'services-selector',
  templateUrl: './selector.component.html',
  styleUrls: ['./selector.component.scss']
})
export class ServicesSelectorComponent implements OnInit, OnDestroy {

  public translate = ServicesSelectorTranslate.get();

  @Output() callback: EventEmitter<any> = new EventEmitter();
  @ViewChild('searchBar', { static: true }) searchBar: ElementRef;

  public static shared: ServicesSelectorComponent;

  private registerComponent: any;
  private toastComponent: any;

  public loading: boolean = false;
  public notFound: boolean = false;
  public settings: any = {};
  public recordsData: any = [];
  public searchData: any = [];
  public searchText: string = '';
  public searchBy: string = '';
  public servicesPreSelected: any = [];
  public servicesSelected: any = [];

  constructor(
    private servicesService: ServicesService
  ) {
    ServicesSelectorComponent.shared = this;
  }

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  public bootstrap() {
    $$(this.searchBar.nativeElement).find('input')[0].focus();
  }

  // Filter Methods

  public onSearch(settings?: { where: query['where'] }) {

    return (new Promise<IRegistersService[]>((resolve, reject) => {

      const value = $$(this.searchBar.nativeElement).find('input').val().toLowerCase(); 

      if (!settings || !settings.where) {
        if (value != '') {

          if (!settings) {
            settings = { where: [] };
          }
          
          if (this.searchBy == 'NAME') {
            settings.where.push({ field: 'name', operator: 'like', value: new RegExp(value, 'gi') });
          }
  
          if (this.searchBy == 'CODE') {
            settings.where.push({ field: 'code', operator: '=', value: parseInt(value) });
          }
  
          this.loading = true;
        } else {}
      }

      this.servicesService.query(settings?.where ?? [], false, true, false, false).then((data) => {

      // console.log(settings?.where ?? [], value, data)

        if(data.length > 0){

          if(value.length != ''){
            $$(data).map((key, item) => {
              if (item._isDisabled) { 
                data.splice(key, 1) 
              }else{
                $$(this.servicesSelected).map((_, service) => {        
                  if(item.code == service.code){
                    (<any>data[key]).selected = true;
                  }
                }); 
              }
            });

            this.recordsData = data;
          }

          this.notFound = false;
        }else{
          this.notFound = true;
          if(this.servicesSelected.length == 0){
            this.reset();
          }
          this.recordsData = data;
        }

        this.searchText = value;
        this.loading = false;
        resolve(data);
      }).catch((error) => {
        this.reset();
        reject(error);
      });

    }));
  }

  public onCheckSearchBar(value: string) {

    value = value.replace(/\.|\/|\-/g,'');
    
    if (!isNaN(parseInt(value))) {
      this.searchBy = 'CODE';
    }
    
    if (isNaN(parseInt(value))) {
      this.searchBy = 'NAME';
    }    
  }
  
  // Operating Actions

  public onResetSearchBar() {

    this.recordsData = [];
    this.searchText = '';

    $$(this.searchBar.nativeElement).find('input').val('');    
  }

  public onSelectService(data: any, preSelect: boolean = false, toggle: boolean = true) {

    if (preSelect) {
      data.reserve = data.selectedItems;
    } else {
      if (!this.settings.selectAll && (data.quantity == 0)) { return }
    }

    if (this.servicesSelected.length > 0) {
      
      let index = -1;
      let c = 0;

      for(const item of this.servicesSelected) {
        if (item.code == data.code) { index = c }
        c++;
      }

      if (index == -1) {
        this.servicesSelected.push(data);
        data.selected = true;
      } else {

        if (toggle) {
          this.servicesSelected.splice(index, 1);
          data.selected = false;
        }
      }      
    } else {
      this.servicesSelected.push(data);
      data.selected = true;
    }

  }

  public onRegisterService(data: IRegistersService = null) {

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
      item.customCostPrice = (item.customCostPrice != undefined ? item.customCostPrice : item.costPrice) || 0;
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

  // Auxiliary Methods

  public selectServices(data: any[]) {
    
    const settings: { where: query['where'] } = { where: [] };

    $$(data).map((_, item) => {
      settings.where.push({ field: 'code', operator: '=', value: parseInt(item.code) });
    });

    this.onSearch(settings).then((result) => {

      const services = (() => {
        let obj = {}; $$(data).map((_, v) => { obj[v.code] = v }); return obj;
      })();

      $$(result).map((_, item) => {

        const service = services[item.code];

        item.customPrice = service.customPrice != undefined ? service.customPrice : service.executionPrice;
        item.customCostPrice = service.customCostPrice != undefined ? service.customCostPrice : service.costPrice;
        item.selectedItems = service.quantity;

        // Preserve previously selected executor (so edit reopens with technician selected)
        if (service.executor) {
          item.executor = {
            code: service.executor.code,
            name: service.executor.name,
            username: service.executor.username,
            usertype: service.executor.usertype
          };
        }

        // Preserve commission meta if present
        if (service.commission) {
          item.commission = {
            enabled: !!service.commission.enabled,
            type: service.commission.type,
            value: service.commission.value
          };
        }

        this.onSelectService(item, true);
      });

      this.onConfirmSelect();
    });
  }

  public deselectService(data: any) {
      
    $$(this.servicesSelected).map((k, item) => {
      if (item.code == data.code) {
        this.servicesSelected.splice(k, 0);
      }
    });
  }
  
  // Utility Methods

  public reset() {
    this.servicesSelected = [];
    this.searchText = '';
  }

  // Destruction Methods

  public ngOnDestroy() {

    this.loading = true;

    this.settings = {};
    this.recordsData = [];
    this.servicesSelected = [];
    this.searchText = '';
  }

}
