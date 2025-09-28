import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, OnDestroy } from '@angular/core';

// Services
import { PaymentMethodsService } from '../../../../registers/paymentMethods/paymentMethods.service';

// Utilties
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';

@Component({
  selector: 'payment-methods-selector',
  templateUrl: './selector.component.html',
  styleUrls: ['./selector.component.scss']
})
export class PaymentMethodsSelectorComponent implements OnInit, OnDestroy {

  @Output() callback: EventEmitter<any> = new EventEmitter();
  @ViewChild('searchBar', { static: true }) searchBar: ElementRef;

  public static shared: PaymentMethodsSelectorComponent;

  public isGroupPaymentMehords: boolean = false;
  public loading: boolean = true;
  public settings: any = [];
  public recordsData: any = [];
  public searchData: any = [];
  public methodsSelected: any = [];

  constructor(
    private paymentMethodsService: PaymentMethodsService
  ) {
    PaymentMethodsSelectorComponent.shared = this;
  }

  public ngOnInit() {

    this.paymentMethodsService.getPaymentMethods('PaymentMethodsSelectorComponent', (data: any) => {

      const paymentMethods = [];

      $$(data).map((_, item) => {

        if (!item.providers || (item.providers.length > 0)) {

          const providers = [];

          if (item.providers) {

            $$(item.providers).map((_, item) => {
              if (!item._isDisabled) { providers.push(item) }
            });
          }

          if (!item._isDisabled) {

            if (item.providers) {
              item.providers = providers
            }

            paymentMethods.push(item);
          }
        }
      });

      this.recordsData = paymentMethods;
      this.loading = false;
    });

    this.callback.emit({ instance: this });
  }

  // Initialize Method

  public bootstrap() {
    $$(this.searchBar.nativeElement).find('input')[0].focus();
  }

  // User Interface Actions - Filters

  public onSearch() {

    const value = $$(this.searchBar.nativeElement).find('input').val().toLowerCase();
    const searchResult = [];

    if (value != '') {

      $$(this.recordsData).map((_, method) => {

        this.isGroupPaymentMehords = true;

        if (String(method.name).toLowerCase().search(value) != -1) {
          searchResult.push(method);
        }

        if (method.providers) {

          method = Utilities.deepClone(method);

          $$(method.providers).map((_, provider) => {

            if (String(provider.name).toLowerCase().search(value) != -1) {
              method.providers = [provider];
              searchResult.push(method);
            }
          });
        }
      });
    } else {

      this.isGroupPaymentMehords = false;
    }

    this.searchData = searchResult;
  }

  public onCheckSearchBar(value: string) {

    if (value == '') {
      setTimeout(() => { this.searchData = [] }, 1500);
    }
  }

  // User Interface Actions - Common

  public onResetSearchBar() {
    $$(this.searchBar.nativeElement).find('input').val('');
    this.searchData = [];
  }

  public onSelectPaymentMethod(event: Event, data: any, parent: any = null) {

    event.stopPropagation();

    if (!data.providers) {

      if (this.methodsSelected.length > 0) {

        let index = -1;
        let c = 0;

        for (const item of this.methodsSelected) {
          if (item.code == data.code) { index = c }
          c++;
        }

        if (index == -1) {

          data.selected = true;

          if (((data.code > 4000 && data.code < 5000) || String(data.code) === '9000') && Array.isArray(data.fees) && data.fees.length > 0) {
            data.fees[0].selected = true;
          }

          if (parent) {
            data.alternateName = `${parent.name} - ${data.name}`;
            data.methodCode = parent.code;
          }

          this.methodsSelected.push(data);
        } else {
          this.methodsSelected.splice(index, 1);
          data.selected = false;
        }
      } else {

        data.selected = true;

        if (((data.code > 4000 && data.code < 5000) || String(data.code) === '9000') && Array.isArray(data.fees) && data.fees.length > 0) {
          data.fees[0].selected = true;
        }

        if (parent) {
          data.alternateName = `${parent.name} - ${data.name}`;
          data.methodCode = parent.code;
        }

        this.methodsSelected.push(data);
      }
    }
  }

  public onConfirmSelect() {
    this.callback.emit({ data: this.methodsSelected, close: true });
  }

  public onTogglePayment(code: string) {
    if ($$($$("#payment-methods-selector .method" + code)[0]).hasClass("hidden")) {
      $$("#payment-methods-selector .method").addClass("hidden")
      $$("#payment-methods-selector .method" + code).removeClass("hidden");
    } else {
      $$("#payment-methods-selector .method" + code).addClass("hidden");
    }
  }


  // Auxiliary Methods

  public selectMethods(data: any[]) {

    const arrData = [];

    if (data && (data.length > 0)) {

      const methodsSelected = ((data) => {
        const obj = {}; $$(data).map((_, v) => { obj[v.code] = v }); return obj;
      })(data);

      for (const item of this.recordsData) {

        item.selected = false;

        if (!item.providers) {

          const data = methodsSelected[item.code];

          if (data) {

            item.value = (data.value || 0);
            item.selected = true;
            item.history = data.history || [];

            arrData.push(item);
          }
        } else {

          for (const provider of item.providers) {

            const data = methodsSelected[provider.code];

            provider.selected = false;

            if (data) {

              if (data.fees && provider.fees) {

                $$(provider.fees).map((_, fee) => {
                  if (fee.parcel == data.fees.parcel) {
                    fee.selected = true; return true;
                  }
                });

                provider.parcelChecked = data.fees.parcel;
              }

              provider.history = data.history || [];

              provider.alternateName = `${item.name} - ${provider.name}`;
              provider.methodCode = item.code;
              provider.value = (data.value || 0);
              provider.selected = true;

              arrData.push(provider);
            }
          }
        }
      }
    }

    this.methodsSelected = arrData;

    this.onConfirmSelect();
  }

  public deselectMethod(data: any) {

    $$(this.methodsSelected).map((k, item) => {
      if (item.code == data.code) {
        this.methodsSelected.splice(k, 1);
      }
    });

    for (const method of this.recordsData) {

      if (method.code == data.code) {

        if (method.hasOwnProperty('value')) {
          delete method.value;
        }

        if (method.hasOwnProperty('selected')) {
          delete method.selected;
        }
      }

      if (method.providers) {

        for (const provider of method.providers) {

          if (provider.code == data.code) {

            if (provider.hasOwnProperty('value')) {
              delete provider.value;
            }

            if (provider.hasOwnProperty('parcelChecked')) {
              delete provider.parcelChecked;
            }

            if (provider.hasOwnProperty('selected')) {
              delete provider.selected;
            }
            if (provider.hasOwnProperty('methodCode')) {
              delete provider.methodCode;
            }
          }
        }
      }
    }
  }

  // Utility Methods

  public reset() {

    for (const method of this.recordsData) {

      if (method.hasOwnProperty('value')) {
        delete method.value;
      }

      if (method.hasOwnProperty('selected')) {
        delete method.selected;
      }

      if (method.hasOwnProperty('history')) {
        method.history = [];
      }

      if (method.providers) {

        for (const provider of method.providers) {

          if (provider.hasOwnProperty('value')) {
            delete provider.value;
          }

          if (provider.hasOwnProperty('parcelChecked')) {
            delete provider.parcelChecked;
          }

          if (provider.hasOwnProperty('selected')) {
            delete provider.selected;
          }

          if (provider.hasOwnProperty('history')) {
            provider.history = [];
          }
          if (provider.hasOwnProperty('methodCode')) {
            delete provider.methodCode;
          }
        }
      }
    }

    this.methodsSelected = [];
  }

  // Destruction Methods

  public ngOnDestroy() {

    this.settings = {};
    this.recordsData = [];
    this.methodsSelected = [];

    this.paymentMethodsService.removeListeners('records', 'PaymentMethodsSelectorComponent');
  }

}
