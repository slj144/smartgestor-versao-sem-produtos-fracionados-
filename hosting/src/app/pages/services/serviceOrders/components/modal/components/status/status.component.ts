import { Component, Output, EventEmitter, OnInit, Input, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

// Services
import { ProductsService } from '@pages/stock/products/products.service';
import { DataBridgeService } from '@shared/services/data-bridge.service';
import { NotificationService } from '@shared/services/notification.service';

// Translate
import { ServiceOrdersTranslate } from '@pages/services/serviceOrders/serviceOrders.translate';

// Interfaces
import { IServiceOrder, EServiceOrderStatus, EServiceOrderPaymentStatus } from '@shared/interfaces/IServiceOrder';
import { ENotificationStatus } from '@shared/interfaces/ISystemNotification';

// Ultilities
import { Utilities } from '@shared/utilities/utilities';
import { ServiceOrdersService } from '@pages/services/serviceOrders/serviceOrders.service';
import { IToolsService } from '@shared/services/iTools.service';

@Component({
  selector: 'service-order-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss']
})
export class ServiceOrdersStatusComponent implements OnInit {

  @Output() callback: EventEmitter<any> = new EventEmitter();
  @Input() serviceData: IServiceOrder;

  public translate = ServiceOrdersTranslate.get();

  public currentStatusIndex: number = -1;
  private originalStatusIndex;

  public settings: any = {};
  public servicesLoading: boolean = true;

  public modalComponent: any;

  constructor(
    private route: Router,
    private dataBridge: DataBridgeService,
    private itoolsService: IToolsService,
    private productsService: ProductsService,
    private notificationService: NotificationService,
    private serviceOrdersService: ServiceOrdersService
  ) { }

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  public ngOnChanges(changes: SimpleChanges) {

    this.currentStatusIndex = changes.serviceData.currentValue.scheme.data.status.indexOf(changes.serviceData.currentValue.scheme.status);
    this.originalStatusIndex = this.currentStatusIndex;
  }

  public onModalResponse(event: any) {

    if (event.instance) {
      this.modalComponent = event.instance;
    }
  }

  // Listeners

  private treatProductsData(data?: any[], order: 1 | -1 = 1): any {

    const records: any[] = [];

    // Iterate directly on snapshots to avoid heavy cloning
    for (const doc of (data || [])) {
      const item = doc.data();

      if (item.barcode === item.code || !item.barcode) {
        item.barcode = `${Utilities.prefixCode(item.code)}${item.registerDate.split(' ')[0].split('-')[0]}`;
      }

      item.code = Utilities.prefixCode(item.code);

      if (item.category && item.category.code) {
        item.category.code = Utilities.prefixCode(item.category.code);
      }

      if (item.commercialUnit && item.commercialUnit.code) {
        item.commercialUnit.code = Utilities.prefixCode(item.commercialUnit.code);
      }

      if (item.provider && item.provider.code) {
        item.provider.code = Utilities.prefixCode(item.provider.code);
      }

      if (!Utilities.isMatrix) {
        if (item.branches) {
          const branchData = (item.branches[Utilities.storeID] || {});

          item.matrix = {
            costPrice: item.costPrice,
            salePrice: item.salePrice
          };

          item.quantity = (branchData.quantity || 0);
          item.costPrice = (!isNaN(branchData.costPrice) ? branchData.costPrice : item.costPrice);
          item.salePrice = (!isNaN(branchData.salePrice) ? branchData.salePrice : item.salePrice);
          item.alert = (!isNaN(branchData.alert) ? branchData.alert : item.alert);

          const matrixTributes = item.tributes;
          const branchTributes = branchData.tributes;
          item.tributes = branchTributes ? branchTributes : matrixTributes;
        } else {
          item.quantity = 0;
        }
      } else {
        delete item.branches;
      }

      item.unitaryPrice = item.salePrice;
      item.unitaryCost = item.costPrice;

      records.push(item);
    }

    return records;
  }

  public async onClickStatus(event: Event, button, status: string, scheme: any) {

    event.stopPropagation();

    if (this.checkSubmit()) { return; }

    const serviceData = Utilities.deepClone(this.serviceData);
    const sourceData = Utilities.deepClone(serviceData);

    const startTime = new Date().getTime();

    if (button.classList.contains('pendent') && this.currentStatusIndex != serviceData.scheme.data.status.length - 1) {

      Utilities.loading(true);

      serviceData.scheme.status = status;
      let currentStatusIndex = serviceData.scheme.data.status.indexOf(status);

      let isAllocProducts = !(serviceData.scheme.data.status.indexOf(status) < serviceData.scheme.data.status.indexOf(serviceData.scheme.allocProducts));
      let isAllocProductsOnlyThisStep = (serviceData.scheme.data.status.indexOf(status) == serviceData.scheme.data.status.indexOf(serviceData.scheme.allocProducts));
      const isWaitParts = (serviceData.scheme.data.status.indexOf(status) == serviceData.scheme.data.status.indexOf("PARTS"));

      const onOpenModal = (fullData) => {
        delete fullData.instance;
        this.callback.emit({ open: fullData });
        this.checkSubmit(true);
      };

      if (isAllocProductsOnlyThisStep || isWaitParts) {

        const productsQuery = [];
        (serviceData.products).forEach((product) => {
          productsQuery.push({
            field: "code",
            operator: "=",
            value: parseInt(product.code.toString())
          });
        });

        const remoteServiceOrderData = (await this.serviceOrdersService.query([{ field: "_id", "operator": "=", value: serviceData._id }], false, false, false, false))[0];

        if (!remoteServiceOrderData) {
          Utilities.loading(false);
          this.checkSubmit(true);
          return;
        }

        const removeStatusIndex = serviceData.scheme.data.status.indexOf(remoteServiceOrderData.scheme.status);

        if (removeStatusIndex >= currentStatusIndex) {
          Utilities.loading(false);
          this.checkSubmit(true);
          return;
        }

        if (productsQuery.length > 0) {

          this.itoolsService.database().collection("StockProducts").or(productsQuery).get().then((res) => {

            console.log(productsQuery, res);

            const products = this.treatProductsData(res.docs);

            // Index products by normalized numeric code for O(1) lookups
            const norm = (code: any) => parseInt(code?.toString() || '0');
            const productByCode = new Map<number, any>();
            for (const p of products) { productByCode.set(norm(p.code), p); }

            let hasZeroQuantity: boolean = false;
            let hasProductsInStock: boolean = true;

            if (serviceData.products) {
              for (const serviceProduct of serviceData.products) {
                const product = productByCode.get(norm(serviceProduct.code));
                if (product) {
                  hasZeroQuantity = serviceProduct.quantity <= 0;
                  const hasProdInStock = product.quantity >= serviceProduct.quantity;
                  if (!hasProdInStock && !serviceData.isAllocProducts) { hasProductsInStock = false; }
                }
              }
            
              if (!hasProductsInStock) {

                if (isWaitParts) {

                  currentStatusIndex -= 1;

                  Utilities.loading(false);
                  this.checkSubmit(true);

                  this.notificationService.create({
                    title: this.translate.pageTitle,
                    description: this.translate.notification.noStock,
                    status: ENotificationStatus.danger
                  }, false);
                } else if (isAllocProductsOnlyThisStep) {

                  isAllocProducts = false;
                  isAllocProductsOnlyThisStep = false;

                  onOpenModal({
                    instance: this,
                    status: this.setupServiceStatusName(status),
                    data: serviceData,
                    sourceData: sourceData,
                    isAllocProducts: isAllocProducts,
                    isAllocProductsThisStep: isAllocProductsOnlyThisStep
                  });
                } else {

                  currentStatusIndex -= 1;

                  Utilities.loading(false);
                  this.checkSubmit(true);

                  this.notificationService.create({
                    title: this.translate.pageTitle,
                    description: this.translate.notification.noStock,
                    status: ENotificationStatus.danger
                  }, false);
                }
              } else {

                if (isAllocProducts && !serviceData.isAllocProducts) { isAllocProductsOnlyThisStep = true; }

                onOpenModal({
                  instance: this,
                  status: this.setupServiceStatusName(status),
                  data: serviceData,
                  sourceData: sourceData,
                  isAllocProducts: isAllocProducts,
                  isAllocProductsThisStep: isAllocProductsOnlyThisStep
                });
              }
            } else {

              onOpenModal({
                instance: this,
                status: this.setupServiceStatusName(status),
                data: serviceData,
                sourceData: sourceData,
                isAllocProducts: isAllocProducts,
                isAllocProductsThisStep: isAllocProductsOnlyThisStep
              });
            }

            const time = (new Date().getTime() - startTime) / 1000;
            console.log("---3,1---", time, products);
          });
        } else {

          onOpenModal({
            instance: this,
            status: this.setupServiceStatusName(status),
            data: serviceData,
            sourceData: sourceData,
            isAllocProducts: isAllocProducts,
            isAllocProductsThisStep: isAllocProductsOnlyThisStep
          });
        }

      } else {

        onOpenModal({
          instance: this,
          status: this.setupServiceStatusName(status),
          data: serviceData,
          sourceData: sourceData,
          isAllocProducts: isAllocProducts,
          isAllocProductsThisStep: isAllocProductsOnlyThisStep
        });
      }
    }
  }

  public trackByStatus(index: number, status: string) {
    return status;
  }

  public setupServiceStatus(i: number) {

    const statusLength = this.serviceData.scheme.data.status.length;
    const isPayed = i == statusLength && this.currentStatusIndex == statusLength - 1 && this.serviceData.paymentStatus == EServiceOrderPaymentStatus.CONCLUDED;
    const isPendent = i == this.currentStatusIndex + 1 && this.currentStatusIndex + 1 <= statusLength - 1 || i == statusLength && this.currentStatusIndex == statusLength - 1 && this.serviceData.paymentStatus == EServiceOrderPaymentStatus.PENDENT;
    const isFinished = i <= this.currentStatusIndex || this.currentStatusIndex == -1 && this.serviceData.scheme.status == EServiceOrderStatus.CONCLUDED || isPayed;

    if (this.currentStatusIndex == -1 && i == 0) {
      return "pendent cursor-pointer";
    } else if (isFinished) {
      return "checked";
    } else if (isPendent) {
      return i == statusLength && this.currentStatusIndex == statusLength - 1 ? "pendent cursor-default" : "pendent cursor-pointer";
    } else {
      return "";
    }
  }

  public setupServiceStatusName(name: string, isToltip: Boolean = false) {

    switch (name) {
      case 'BUDGET': {
        return this.translate.scheme.technicalAssistance[name];
      }
      case 'AUTORIZATION': {
        return this.translate.scheme.technicalAssistance[name];
      }
      case 'PARTS': {
        return this.translate.scheme.technicalAssistance[name];
      }
      case 'REPAIR': {
        return this.translate.scheme.technicalAssistance[name];
      }
      case 'WITHDRAWAL': {
        return this.translate.scheme.technicalAssistance[name];
      }
      case 'CONCLUDED': {
        return this.translate.scheme.technicalAssistance[name];
      }
      default: {
        return "";
      }
    }
  }

  public onCompletePayment(event: Event) {

    event.stopPropagation();

    const indexConcluded = this.serviceData.scheme.data.status.length - 1;
    const currentStatusIndex = this.serviceData.scheme.data.status.indexOf(this.serviceData.scheme.status);

    if (
      (this.serviceData.serviceStatus == EServiceOrderStatus.CONCLUDED) &&
      (indexConcluded == currentStatusIndex)
    ) {
      this.dataBridge.setData('ServiceOrder', { serviceCode: this.serviceData.code, saleCode: parseInt(this.serviceData.saleCode.toString()) });
      this.route.navigateByUrl('/' + Utilities.currentLoginData.projectId + '/caixa');
    }
  }

  public rollback() {
    this.currentStatusIndex = this.originalStatusIndex;
  }

  private checkSubmit(reset: boolean = false) {
    if (reset) {
      (<any>this)._isSubmited = false;
      return false;
    } else {
      if ((<any>this)._isSubmited) { return true; }
      (<any>this)._isSubmited = true;
      return false;
    }
  }

}
