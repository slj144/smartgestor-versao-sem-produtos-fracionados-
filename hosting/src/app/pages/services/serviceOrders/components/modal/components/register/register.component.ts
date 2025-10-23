import { Component, EventEmitter, OnInit, Output, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

// Components
import { ServicesSelectorComponent } from '@pages/registers/services/components/selector/selector.component';
import { ProductsSelectorComponent } from '@pages/stock/products/components/selector/selector.component';

// Services
import { ServiceOrdersService } from '@pages/services/serviceOrders/serviceOrders.service';
import { PartnersService } from '@pages/registers/partners/partners.service';
import { SettingsService } from '@pages/settings/settings.service';

// Translate
import { ServiceOrdersTranslate } from '@pages/services/serviceOrders/serviceOrders.translate';

// Interfaces
import { EServiceOrderPaymentStatus, EServiceOrderStatus, IServiceOrder } from '@shared/interfaces/IServiceOrder';
import { IPermissions } from '@shared/interfaces/_auxiliaries/IPermissions';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { FieldMask } from '@shared/utilities/fieldMask';
import { DateTime } from '@shared/utilities/dateTime';
import { ProjectSettings } from '@assets/settings/company-settings';
import { Dispatch } from '@shared/utilities/dispatch';
import { IOperator } from '@shared/interfaces/_auxiliaries/IOperator';

@Component({
  selector: 'service-orders-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class ServiceOrdersRegisterComponent implements OnInit, OnDestroy {

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  public static shared: ServiceOrdersRegisterComponent;

  public loading: boolean = true;
  public settings: any = {};
  public translate: any;
  public formServiceOrder: FormGroup;
  public companyProfile: any;
  public permissions: any;
  public collaborators: any[] = [];
  public data: any = { photosBefore: [], photosAfter: [] };
  public isAdmin = Utilities.isAdmin;
  public camera = {
    active: false,
    mode: null as 'before' | 'after' | null,
    stream: null as MediaStream | null,
    facingMode: 'environment' as 'environment' | 'user'
  };
  @ViewChild('video') public videoElement!: ElementRef<HTMLVideoElement>;

  private layerComponent: any;

  constructor(
    private formBuilder: FormBuilder,
    private partnersService: PartnersService,
    private settingsService: SettingsService,
    private serviceOrdersService: ServiceOrdersService
  ) {
    ServiceOrdersRegisterComponent.shared = this;
  }

  public ngOnInit() {

    this.translate = ServiceOrdersTranslate.get()['modal']['action']['register'];
    this.companyProfile = ProjectSettings.companySettings().profile;

    this.callback.emit({ instance: this });

    this.onResetPanel();

    this.permissionsSettings();
    this.formSettings();
  }

  public bootstrap(settings: any = {}) {

    // 🔍 DEBUG: Verificar dados vindos do banco
    console.log('📥 CARREGANDO - Dados recebidos do banco (settings.data):', settings.data);
    if (settings.data?.services) {
      console.log('📥 CARREGANDO - Serviços recebidos:', settings.data.services);
      settings.data.services.forEach((service, index) => {
        if (service.executor) {
          console.log(`📥 CARREGANDO - Serviço ${index} (${service.name}) TEM executor:`, service.executor);
        } else {
          console.log(`📥 CARREGANDO - Serviço ${index} (${service.name}) SEM executor`);
        }
      });
    }

    this.data = Utilities.deepClone(settings.data);
    this.data.photosBefore = this.data.photosBefore || [];
    this.data.photosAfter = this.data.photosAfter || [];

    this.settings.action = settings.action;
    this.settings.originalData = Utilities.deepClone(this.data);

    this.partnersService.getPartners('ServiceOrdersRegisterComponent', (data) => {
      this.settings.technicalAssistance = (data || []);
    });

    this.settingsService.getSOSettings('ServiceOrdersRegisterComponent', (data) => {
      this.settings.checklist = this.restructureChecklist(data.checklist);
      this.markChecklist(this.data.checklist);
    });

    Dispatch.collaboratorsService.query([{ field: "owner", operator: "=", value: Utilities.storeID }], false, false, false, false).then((collaborators) => {
      this.collaborators = collaborators || [];
    });


    if (
      (this.data.customer && this.data.customer.phone) ||
      (this.data.customer && this.data.customer.email)
    ) {

      settings.data.customer.contacts = {};

      if (this.data.customer.phone) {

        this.data.customer.contacts = this.data.customer.contacts || {};

        this.data.customer.contacts.phone = this.data.customer.phone;
        delete this.data.customer.phone;
      }

      if (this.data.customer.email) {
        this.data.customer.contacts.email = this.data.customer.email;
        delete this.data.customer.email;
      }

      if (this.data && this.data.vehicle) {
        this.data.vehicle.proprietary = this.data.customer;
      }
    }

    if (this.data.products && (this.data.products.length > 0)) {
      ProductsSelectorComponent.shared.selectProducts(this.data.products);
    }

    if (this.data.services && (this.data.services.length > 0)) {
      ServicesSelectorComponent.shared.selectServices(this.data.services);
    }

    this.formSettings(this.data);
    this.generateBalance();
  }

  // Getter and Setter Methods

  public get formControls() {
    return this.formServiceOrder.controls;
  }

  // User Interface Action - Common

  public onApplyPrice(data: any, inputField: any, type: string) {

    const value = FieldMask.priceFieldMask(inputField.value);

    if (type == 'product') {
      data.unitaryPrice = (parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0);
      inputField.value = value;
    }

    if (type == 'service') {
      data.customPrice = (parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0);
      inputField.value = value;
    }

    if (type == 'service-cost') {
      data.customCostPrice = (parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0);
      inputField.value = value;
    }

    this.generateBalance();
  }

  // User Interface Actions - Services

  public onDeleteServiceItem(index: number) {

    ServicesSelectorComponent.shared.deselectService(this.data.services[index]);
    this.data.services.splice(index, 1);

    this.generateBalance();
  }

  // Método para alterar o executor de um serviço específico
  public onChangeServiceExecutor(serviceIndex: number, executorUsername: string) {
    console.log(`🔄 MUDANDO EXECUTOR - Serviço ${serviceIndex}, novo executor: ${executorUsername}`);

    if (this.data.services && this.data.services[serviceIndex]) {
      const selectedCollaborator = this.collaborators.find(c => c.username === executorUsername);

      if (selectedCollaborator) {
        this.data.services[serviceIndex].executor = {
          code: selectedCollaborator.code,
          name: selectedCollaborator.name,
          username: selectedCollaborator.username,
          usertype: selectedCollaborator.usertype
        };
      } else {
        // Se selecionou "padrão" ou valor inválido, remove o executor específico
        delete this.data.services[serviceIndex].executor;
      }
    }
  }


  // Método para verificar se pode editar executor baseado na etapa da OS
  public canEditExecutor(): boolean {
    // Se não há dados de esquema, permite edição (OS nova)
    if (!this.data?.scheme?.data?.status || !this.data?.scheme?.status) {
      return true;
    }

    const currentStatus = this.data.scheme.status;
    const statusList = this.data.scheme.data.status;
    const currentIndex = statusList.indexOf(currentStatus);

    // Permite edição apenas nas primeiras 3 etapas (índices 0, 1, 2)
    // 0: BUDGET, 1: AUTORIZATION, 2: PARTS
    return currentIndex <= 2;
  }

  // User Interface Actions - Products

  public onQuickSearch(event: Event) {

    const value = $$(event.currentTarget).val();

    if (value != '') {

      Utilities.loading();

      ProductsSelectorComponent.shared.onSearch({
        where: [
          { field: 'code', operator: '=', value: parseInt(value) }
        ]
      }, true).then(() => {
        $$('.container-products .quick-search input').val('');
        Utilities.loading(false);
      });
    }
  }

  public onDeleteProductItem(index: number) {

    ProductsSelectorComponent.shared.onDeselectProduct(this.data.products[index]);
    this.generateBalance();
  }

  public onApplyQuantity(data: any, inputField: any) {

    const value = inputField.value;

    // const maxQuantity = (()=>{
    //   if(this.data.code){
    //     if(this.data.isAllocProducts){
    //       return parseInt((data.selectedItems || 0)) + data.quantity
    //     }else{
    //       return (data.selectedItems)
    //     }
    //   }else{
    //     return data.quantity;
    //   }
    // })();

    // Respeita configuração de venda com estoque negativo: se ativo, remove limite superior
    const allowNegative = (() => { try { return !!JSON.parse(String(Utilities.localStorage('StockAllowNegativeSale') || 'false')); } catch { return !!Utilities.localStorage('StockAllowNegativeSale'); } })();
    const quantity = allowNegative
      ? FieldMask.numberFieldMask(value, 1, null)
      : FieldMask.numberFieldMask(value, 1, data.quantity);

    // console.log(quantity, maxQuantity, data);

    inputField.value = quantity;
    data.selectedItems = quantity;

    this.generateBalance();
  }

  public onApplyQuantityCorretion(data: any, inputField: any) {

    if (inputField.value == '') {

      inputField.value = 1;
      data.selectedItems = 1;

      this.generateBalance();
    }
  }

  // User Interface Actions - Photos

  public canEditPhotos(): boolean {
    const status = this.data?.scheme?.status;
    return !this.data?.code || (status !== 'CONCLUDED' && status !== 'WITHDRAWAL');
  }

  public onSelectPhotos(event: Event, type: 'before' | 'after') {
    const input = event.target as HTMLInputElement;
    if (!input.files) { return; }
    const max = 4;
    Array.from(input.files).forEach(file => {
      this.compressImage(file).then(result => {
        if (type === 'before' && this.data.photosBefore.length < max) {
          this.data.photosBefore.push(result);
        } else if (type === 'after' && this.data.photosAfter.length < max) {
          this.data.photosAfter.push(result);
        }
      });
    });
    input.value = '';
  }

  public onRemovePhoto(index: number, type: 'before' | 'after') {
    const targetArray = type === 'before' ? this.data.photosBefore : this.data.photosAfter;
    targetArray.splice(index, 1);
  }

  public onOpenCamera(type: 'before' | 'after') {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      this.camera.mode = type;
      this.camera.active = true;
      this.loadCameraStream();
    }
  }
  private loadCameraStream() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { return; }

    if (this.camera.stream) {
      this.camera.stream.getTracks().forEach(t => t.stop());
    }

    const constraints: MediaStreamConstraints = {
      video: { facingMode: this.camera.facingMode }
    };

    setTimeout(() => {
      navigator.mediaDevices!.getUserMedia(constraints)
        .then(stream => {
          this.camera.stream = stream;
          if (this.videoElement && this.videoElement.nativeElement) {
            this.videoElement.nativeElement.srcObject = stream;
          }
        })
        .catch(() => {
          this.onCloseCamera();
        });
    });
  }

  public onToggleCameraFacing() {
    this.camera.facingMode = this.camera.facingMode === 'environment' ? 'user' : 'environment';
    if (this.camera.active && this.camera.mode) {
      this.loadCameraStream();
    }
  }

  public onCapturePhoto() {
    if (!this.camera.active || !this.camera.stream) { return; }
    const video = this.videoElement.nativeElement;
    const maxWidth = 1024;
    const maxHeight = 1024;
    let width = video.videoWidth;
    let height = video.videoHeight;
    if (width > height && width > maxWidth) {
      height = height * maxWidth / width;
      width = maxWidth;
    } else if (height > maxHeight) {
      width = width * maxHeight / height;
      height = maxHeight;
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      const targetArray = this.camera.mode === 'before' ? this.data.photosBefore : this.data.photosAfter;
      if (targetArray.length < 4) {
        targetArray.push(dataUrl);
      }
    }
    this.onCloseCamera();
  }
  private compressImage(file: File, maxWidth: number = 1024, maxHeight: number = 1024, quality: number = 0.7): Promise<string> {
    return new Promise(resolve => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e: any) => {
        img.src = e.target.result;
      };
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxWidth) {
          height = height * maxWidth / width;
          width = maxWidth;
        } else if (height > maxHeight) {
          width = width * maxHeight / height;
          height = maxHeight;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        }
      };
      reader.readAsDataURL(file);
    });
  }
  public onCloseCamera() {
    if (this.camera.stream) {
      this.camera.stream.getTracks().forEach(t => t.stop());
    }
    this.camera.active = false;
    this.camera.stream = null;
    this.camera.mode = null;
  }

  // Método melhorado para capturar foto com qualidade otimizada
  public onCapturePhotoImproved() {
    if (!this.camera.active || !this.camera.stream) { return; }

    const video = this.videoElement.nativeElement;
    const canvas = document.createElement('canvas');

    // Define tamanho ideal para fotos (mantendo proporção)
    const maxWidth = 1200;
    const maxHeight = 1200;
    let width = video.videoWidth;
    let height = video.videoHeight;

    // Calcula novo tamanho mantendo proporção
    if (width > height) {
      if (width > maxWidth) {
        height = height * (maxWidth / width);
        width = maxWidth;
      }
    } else {
      if (height > maxHeight) {
        width = width * (maxHeight / height);
        height = maxHeight;
      }
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Desenha imagem com qualidade melhorada
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(video, 0, 0, width, height);

      // Converte para JPEG com qualidade de 85%
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

      // Adiciona à array correta
      const targetArray = this.camera.mode === 'before' ?
        this.data.photosBefore : this.data.photosAfter;

      if (targetArray.length < 4) {
        targetArray.push(dataUrl);

        // Feedback visual de sucesso
        this.showPhotoAddedFeedback();
      }
    }

    this.onCloseCamera();
  }

  // Método para mostrar feedback visual quando foto é adicionada
  private showPhotoAddedFeedback() {
    // Você pode adicionar uma notificação toast aqui
    // Por exemplo: this.toastr.success('Foto adicionada com sucesso!');
    console.log('✅ Foto adicionada com sucesso!');
  }

  // Método melhorado para seleção de fotos com validação
  public onSelectPhotosImproved(event: any, type: 'before' | 'after') {
    const input = event.target;
    const targetArray = type === 'before' ?
      this.data.photosBefore : this.data.photosAfter;
    const maxPhotos = 4;
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    // Validações
    const files = Array.from(input.files) as File[];
    const remainingSlots = maxPhotos - targetArray.length;

    if (files.length > remainingSlots) {
      alert(`Você pode adicionar apenas mais ${remainingSlots} foto(s).`);
      input.value = '';
      return;
    }

    // Processa cada arquivo
    files.forEach((file: File) => {
      // Valida tamanho
      if (file.size > maxFileSize) {
        alert(`A foto "${file.name}" é muito grande. Máximo: 5MB`);
        return;
      }

      // Valida tipo
      if (!file.type.startsWith('image/')) {
        alert(`O arquivo "${file.name}" não é uma imagem válida.`);
        return;
      }

      // Lê e adiciona a foto
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const result = e.target.result;

        // Redimensiona imagem se necessário antes de adicionar
        this.resizeImage(result, (resizedImage: string) => {
          if (targetArray.length < maxPhotos) {
            targetArray.push(resizedImage);
            this.showPhotoAddedFeedback();
          }
        });
      };
      reader.readAsDataURL(file);
    });

    input.value = '';
  }

  // Método auxiliar para redimensionar imagens grandes
  private resizeImage(dataUrl: string, callback: (result: string) => void) {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxSize = 1200;
      let width = img.width;
      let height = img.height;

      // Só redimensiona se for maior que o máximo
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL('image/jpeg', 0.85));
      } else {
        callback(dataUrl); // Retorna original se falhar
      }
    };
    img.src = dataUrl;
  }

  // Método para lidar com drag and drop (opcional)
  public onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    // Adiciona classe visual para feedback
    const target = event.currentTarget as HTMLElement;
    target.classList.add('drag-over');
  }

  public onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    // Remove classe visual
    const target = event.currentTarget as HTMLElement;
    target.classList.remove('drag-over');
  }

  public onDrop(event: DragEvent, type: 'before' | 'after') {
    event.preventDefault();
    event.stopPropagation();

    // Remove classe visual
    const target = event.currentTarget as HTMLElement;
    target.classList.remove('drag-over');

    // Processa arquivos dropados
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const mockEvent = { target: { files: event.dataTransfer.files } };
      this.onSelectPhotosImproved(mockEvent, type);
    }
  }
  // User Interface Actions - Checklist

  public onChangeChecklist(value: string, parent: string) {

    $$(this.settings.checklist).map((_, item) => {

      if (!parent && !item.subchecklist) {

        if (item.name == value) {
          item.checked = !item.checked;
        }
      } else {

        if (item.name == parent) {

          let subActive = 0;

          $$(item.subchecklist).map((_, sub) => {

            if (value == sub.name) {
              sub.checked = !sub.checked;
            }

            if (sub.checked) {
              subActive += 1;
            }
          });

          item.checked = (subActive > 0);
        }
      }
    });
  }

  // User Interface Actions - General

  public onRegister() {

    if (this.checkSubmit()) { return; }

    const data = this.composeData();

    // 🔍 DEBUG: Verificar dados sendo enviados para salvamento
    console.log('🚀 SALVANDO - Dados completos enviados para o banco:', data);
    if (data.services) {
      console.log('🚀 SALVANDO - Serviços com executores:', data.services);
      data.services.forEach((service, index) => {
        if (service.executor) {
          console.log(`🚀 SALVANDO - Serviço ${index} (${service.name}) TEM executor:`, service.executor);
        } else {
          console.log(`🚀 SALVANDO - Serviço ${index} (${service.name}) SEM executor`);
        }
      });
    }

    // return; // ← TESTE: para ver os dados sem salvar

    this.serviceOrdersService.registerService({ data }).then(() => {
      this.callback.emit({ close: true });
      this.onResetPanel();
    }).catch(() => {
      // handle rejection gracefully
      this.callback.emit({ close: true });
      this.onResetPanel();
    });
  }

  public onResetPanel() {

    this.data = { photosBefore: [], photosAfter: [] };

    if (ProductsSelectorComponent.shared) {
      ProductsSelectorComponent.shared.reset();
    }

    if (ServicesSelectorComponent.shared) {
      ServicesSelectorComponent.shared.reset();
    }

    if ($$('#container-request-register').length > 0) {
      $$('#container-request-register')[0].scrollTop = 0;
    }
  }

  // Mask Methods

  public onApplyNumberMask(event: Event) {
    $$(event.currentTarget).val(FieldMask.numberFieldMask($$(event.currentTarget).val(), null, null, true));
  }

  // Layer Actions

  public onOpenLayer(type: string) {
    this.layerComponent.onOpen({ activeComponent: type });
  }

  // Event Listeners

  public onLayerResponse(event: any) {

    // Instance Capture

    if (event.instance) {
      this.layerComponent = event.instance;
    }

    // Data Capture

    if (event.customer) {
      this.data.customer = event.customer;
    }

    if (event.vehicle) {
      this.data.vehicle = event.vehicle;
      this.data.customer = this.data.vehicle.proprietary;
    }

    if (event.services) {
      this.data.services = event.services;
    }

    if (event.products) {
      this.data.products = event.products;
    }

    // Perform the Calculations

    this.generateBalance();
  }

  // Auxiliary Methods

  private formSettings(data: any = {}) {

    this.formServiceOrder = this.formBuilder.group({
      _id: [data._id],
      code: [data.code],
      equipment: this.formBuilder.group({
        model: [data.equipment && data.equipment.model ? data.equipment.model : ''],
        brand: [data.equipment && data.equipment.brand ? data.equipment.brand : ''],
        password: [data.equipment && data.equipment.password ? data.equipment.password : ''],
        serialNumber: [data.equipment && data.equipment.serialNumber ? data.equipment.serialNumber : '']
      }),
      settings: this.formBuilder.group({
        executor: [data?.executor?.username ?? Utilities.operator.username],
        serviceExecution: [data.execution && data.execution.type ? data.execution.type : 'INTERNAL'],
        technicalAssistance: [data.execution && data.execution.provider ? data.execution.provider.code : ''],
        entryDate: [data.entryDate ?? DateTime.getDate('D')],
        deliveryDate: [data.deliveryDate ?? DateTime.getDate('D')]
      }),
      description: [data.description ?? ''],
      checklist: [data.hasChecklist ?? true]
    });

    this.generateBalance();

    if (this.settings.action) {
      if (this.settings.action.toLowerCase() == "create") {
        this.loading = false;
      } else if (this.settings.action.toLowerCase() == "update") {

        setTimeout(() => {
          this.loading = false;
        }, data?.products.length > 0 ? 3000 : 500);

        // const timer = setInterval(()=>{

        //   let totalSale: any = document.querySelector("#balanceTotalSale")?.textContent.match(/[0-9\.\,]+/)

        //   if(totalSale && !isNaN(data.balance.totalSale)){

        //     totalSale = (totalSale[0] || "").replace(".","").replace(",",".");

        //     if(parseFloat(totalSale), data.balance.totalSale){
        //       clearInterval(timer);
        //       this.loading = false;
        //     }

        //   }
        // });
      }
    }

  }

  private generateBalance() {

    this.data.balance = (this.data.balance || {});

    this.data.balance.totalProducts = 0;
    this.data.balance.totalServices = 0;
    this.data.balance.totalDiscount = 0;
    this.data.balance.totalFee = 0;

    this.data.balance.totalPartial = 0;
    this.data.balance.totalSale = 0;

    // Perform Calculations    

    if (this.data.services && this.data.services.length > 0) {

      for (const item of this.data.services) {

        if (item.customPrice > item.executionPrice) {
          this.data.balance.totalServices += item.customPrice;
        } else {
          this.data.balance.totalServices += item.executionPrice;
        }

        this.data.balance.totalDiscount += (() => {
          return ((item.customPrice < item.executionPrice) ? (item.executionPrice - item.customPrice) : 0);
        })();
      }

      this.data.balance.totalPartial += this.data.balance.totalServices;
      this.data.balance.totalSale += this.data.balance.totalServices;
    }

    if (this.data.products && this.data.products.length > 0) {

      for (const item of this.data.products) {

        if (item.unitaryPrice > item.salePrice) {
          this.data.balance.totalProducts += (item.selectedItems * item.unitaryPrice);
        } else {
          this.data.balance.totalProducts += (item.selectedItems * item.salePrice);
        }

        this.data.balance.totalDiscount += (() => {

          const value = (item.unitaryPrice < item.salePrice) ? (item.salePrice - item.unitaryPrice) * item.selectedItems : 0;
          return isNaN(value) ? 0 : value;
        })();
      }

      this.data.balance.totalPartial += this.data.balance.totalProducts;
      this.data.balance.totalSale += this.data.balance.totalProducts;
    }


    // Apply Values

    if (this.data.balance.totalDiscount > 0) {
      this.data.balance.totalPartial -= this.data.balance.totalDiscount;
      this.data.balance.totalSale -= this.data.balance.totalDiscount;
    }

    if (this.data.balance.totalFee > 0) {
      this.data.balance.totalSale += this.data.balance.totalFee;
    }
  }

  private composeData() {

    const formData = this.formServiceOrder.value;

    const response: IServiceOrder = {
      _id: this.data._id,
      code: this.data.code,
      entryDate: '',
      deliveryDate: '',
      description: '',
      execution: ({} as any),
      customer: ({} as any),
      services: ([] as any),
      products: ([] as any),
      equipment: ({} as any),
      balance: ({} as any),
      paymentStatus: EServiceOrderPaymentStatus.PENDENT,
      serviceStatus: (this.data.serviceStatus || EServiceOrderStatus.PENDENT),
      hasChecklist: (this.data.hasChecklist || formData.checklist),
      isAllocProducts: (this.data.isAllocProducts || false)
    };

    if (this.data.customer) {

      response.customer = ({} as any);

      response.customer._id = this.data.customer._id;
      response.customer.code = this.data.customer.code;
      response.customer.name = this.data.customer.name;

      if (this.data.customer.personalDocument) {
        response.customer.personalDocument = this.data.customer.personalDocument;
      }

      if (this.data.customer.businessDocument) {
        response.customer.businessDocument = this.data.customer.businessDocument;
      }

      if (this.data.customer.address) {
        response.customer.address = this.data.customer.address;
      }

      if (this.data.customer.contacts && this.data.customer.contacts.phone) {
        response.customer.phone = this.data.customer.contacts.phone;
      }

      if (this.data.customer.contacts && this.data.customer.contacts.email) {
        response.customer.email = this.data.customer.contacts.email;
      }
    }

    if (this.data.vehicle) {
      delete this.data.vehicle.proprietary;
      response.vehicle = this.data.vehicle;
    }

    if (this.data.services) {

      $$(this.data.services).map((_, item) => {

        // Configuração de comissão baseada no customCostPrice
        const commissionValue = item.customCostPrice != undefined ? item.customCostPrice : item.costPrice;
        const commission = {
          enabled: commissionValue > 0,
          type: 'fixed' as const,
          value: commissionValue
        };

        // Técnico responsável do serviço (apenas executor específico)
        const serviceExecutor = item.executor || null;

        const serviceData: any = {
          _id: item._id,
          code: item.code,
          name: item.name,
          costPrice: item.costPrice,
          executionPrice: item.executionPrice,
          customCostPrice: item.customCostPrice != undefined ? item.customCostPrice : item.costPrice,
          customPrice: item.customPrice,
          executor: serviceExecutor ? {
            code: serviceExecutor.code,
            name: serviceExecutor.name,
            username: serviceExecutor.username,
            usertype: serviceExecutor.usertype
          } : undefined,
          commission: commission,
          cnae: item.cnae,
          codigo: item.codigo,
          codigoTributacao: item.codigoTributacao || "",
          tributes: item.tributes
        };

        if (item.department) {
          serviceData.department = {
            _id: item.department._id,
            code: typeof item.department.code === 'string' ? parseInt(item.department.code, 10) : item.department.code,
            name: item.department.name
          };
        }


        response.services.push(serviceData);
      });
    }

    if (this.data.products) {

      for (const item of this.data.products) {

        const obj: any = {
          _id: item._id,
          code: item.code,
          name: item.name,
          costPrice: item.costPrice,
          salePrice: item.salePrice,
          unitaryPrice: item.unitaryPrice,
          quantity: parseInt(item.selectedItems),
          tributes: item.tributes
        };

        if (item.serialNumber) {
          obj.serialNumber = item.serialNumber;
        }

        if (item.type) {
          obj.type = {
            _id: item.type._id, code: item.type.code, name: item.type.name
          };
        }

        if (item.category) {
          obj.category = {
            _id: item.category._id, code: item.category.code, name: item.category.name
          };
        }

        if (item.department) {
          obj.department = {
            _id: item.department._id,
            code: typeof item.department.code === 'string' ? parseInt(item.department.code, 10) : item.department.code,
            name: item.department.name
          };
        }

        if (item.discount) {
          obj.discount = item.discount;
        }

        response.products.push(obj);
      }
    }

    if (formData.description) {
      response.description = formData.description;
    }
    if (this.data.photosBefore && this.data.photosBefore.length > 0) {
      response.photosBefore = this.data.photosBefore;
    }

    if (this.data.photosAfter && this.data.photosAfter.length > 0) {
      response.photosAfter = this.data.photosAfter;
    }
    if (formData.equipment) {
      response.equipment.model = (formData.equipment.model || '');
      response.equipment.brand = (formData.equipment.brand || '');
      response.equipment.password = (formData.equipment.password || '');
      response.equipment.serialNumber = (formData.equipment.serialNumber || '');
    }

    if (formData.checklist) {

      const checklist: any = [];

      $$(this.settings.checklist).map((_, item) => {

        if (item.checked) {

          const obj: any = {
            name: item.name
          };

          if (item.subchecklist) {

            const arr: any = [];

            $$(item.subchecklist).map((_, sub) => {

              if (sub.checked) {
                arr.push(sub.name);
              }
            });

            obj.subchecklist = arr;
          }

          checklist.push(obj);
        }
      });

      response.checklist = checklist;
    }

    if (formData.settings) {


      if (formData.settings.serviceExecution) {

        response.execution.type = formData.settings.serviceExecution;

        if (formData.settings.serviceExecution == 'EXTERNAL' && formData.settings.technicalAssistance) {

          const obj: any = {};
          const code = formData.settings.technicalAssistance;

          $$(this.settings.technicalAssistance).map((_, item) => {

            if (item.code == code) {

              obj._id = item._id;
              obj.code = item.code;
              obj.name = item.name;

              if (item.contacts && item.contacts.email) {
                obj.email = item.contacts.email;
              }

              if (item.contacts && item.contacts.phone) {
                obj.phone = item.contacts.phone;
              }

              if (item.address) {

                const local = item.address.local;
                const number = (item.address.number ? (' Nº' + item.address.number) : '');
                const complement = (item.address.complement ? (' ' + item.address.complement) : '');
                const neighborhood = (item.address.neighborhood ? (', ' + item.address.neighborhood) : '');
                const city = (item.address.city ? (', ' + item.address.city) : '');
                const state = (item.address.state ? (' - ' + item.address.state) : '');

                obj.address = `${local}${number}${complement}${neighborhood}${city}${state}`;
              }
            }
          });

          response.execution.provider = obj;
        }
      }

      if (formData.settings.entryDate) {
        response.entryDate = formData.settings.entryDate;
      }

      if (formData.settings.deliveryDate) {
        response.deliveryDate = formData.settings.deliveryDate;
      }
    }

    if (this.data.balance) {

      response.balance.subtotal = ({} as any);

      if (this.data.balance.totalServices > 0) {
        response.balance.subtotal.services = this.data.balance.totalServices;
      }

      if (this.data.balance.totalProducts > 0) {
        response.balance.subtotal.products = this.data.balance.totalProducts;
      }

      if (this.data.balance.totalDiscount > 0) {
        response.balance.subtotal.discount = this.data.balance.totalDiscount;
      }

      if (this.data.balance.totalFee > 0) {
        response.balance.subtotal.fee = this.data.balance.totalFee;
      }

      response.balance.total = this.data.balance.totalSale;
    }

    return response;
  }

  // Utility Methods

  private restructureChecklist(data: any) {

    const checklist = Utilities.deepClone(data);

    $$(checklist).map((_, item) => {

      item.checked = false;

      if (item.subchecklist && item.subchecklist.length > 0) {

        const subchecklist: any = [];

        $$(item.subchecklist).map((_, item) => {
          subchecklist.push({ name: item, checked: false });
        });

        item.disabled = true;
        item.subchecklist = subchecklist;
      } else {
        delete item.subchecklist;
      }
    });

    return (checklist || []);
  }

  private markChecklist(data: any) {

    if (data) {

      $$(this.settings.checklist).map((_, itemNV1) => {

        $$(data).map((_, itemNV2) => {

          if (itemNV1.name == itemNV2.name) {

            itemNV1.checked = true;

            if (itemNV1.subchecklist) {
              $$(itemNV1.subchecklist).map((_, sub) => {
                sub.checked = (itemNV2.subchecklist.indexOf(sub.name) != -1);
              });
            }
          }
        });
      });
    }
  }

  private permissionsSettings() {

    const setupPermissions = () => {

      if (Utilities.isAdmin) {

        this.permissions = {
          add: true,
          edit: true,
          delete: true,
          cancel: true,
          filterDataPerOperator: false,
          editPrice: true,
          editServiceCostPrice: true,
          assignTechnician: true
        };
      } else {

        const permissions = Utilities.permissions("serviceOrders") as IPermissions["serviceOrders"];

        if (permissions) {

          this.permissions = {
            filterDataPerOperator: (permissions.actions.indexOf('filterDataPerOperator') !== -1),
            add: permissions.actions.indexOf("add") !== -1,
            edit: permissions.actions.indexOf("edit") !== -1,
            delete: permissions.actions.indexOf("delete") !== -1,
            cancel: permissions.actions.indexOf("cancel") !== -1,
            editPrice: permissions.actions.indexOf("editPrice") !== -1,
            editServiceCostPrice: permissions.actions.indexOf("editServiceCostPrice") !== -1,
            assignTechnician: permissions.actions.indexOf("assignTechnician") !== -1
          };
        } else {
          this.permissions = {
            filterDataPerOperator: false,
            add: false,
            edit: false,
            delete: false,
            cancel: false,
            editPrice: false,
            editServiceCostPrice: false,
            assignTechnician: false
          };
        }
      }
    };

    setupPermissions();
  }

  private checkSubmit() {

    if (this.settings._isSubmited) { return true; }

    this.settings._isSubmited = true;
    return false;
  }

  // Destruction Method

  public ngOnDestroy() {

    this.data = {};
    this.layerComponent = null;
    this.onCloseCamera();
    this.onResetPanel();
  }

}
