import { Component, Output, EventEmitter, OnInit, ViewChild, OnChanges, ElementRef, AfterViewInit, ChangeDetectorRef, AfterViewChecked, SimpleChanges } from '@angular/core';

// Services
import { ServiceOrdersService } from '../../serviceOrders.service';
import { SettingsService } from '@pages/settings/settings.service';

// Translate
import { ServiceOrdersTranslate } from '../../serviceOrders.translate';

// Interfaces
import { EServiceOrderStatus } from '@shared/interfaces/IServiceOrder';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from "@shared/utilities/utilities";
import { Dispatch } from '@shared/utilities/dispatch';

@Component({
  selector: 'service-orders-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ServiceOrdersModalComponent implements OnInit {

  @Output() callback: EventEmitter<any> = new EventEmitter();

  public translate = ServiceOrdersTranslate.get()['modal'];

  public settings: any = {};

  @ViewChild("registerComponent", { static: false }) registerComponent;
  @ViewChild("filtersComponent", { static: false }) filtersComponent;
  @ViewChild("printComponent", { static: false }) printComponent;

  // ADICIONAR: Propriedades para fotos no modal
  public modalPhotosAfter: string[] = [];
  public modalCamera = {
    active: false,
    stream: null as MediaStream | null,
    facingMode: 'environment' as 'environment' | 'user'
  };
  @ViewChild('modalVideo') public modalVideoElement: ElementRef;
  @ViewChild('modalAfterInput') public modalAfterInput: ElementRef;

  private modalComponent: any;

  constructor(
    private cdr: ChangeDetectorRef,
    private settingsService: SettingsService,
    private serviceOrdersService: ServiceOrdersService
  ) { }

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  public ngOnChanges(changes: SimpleChanges): void {

    // console.log(changes);
  }

  public ngAfterViewInit() {

  }


  // User Interface Actions - General  

  public onCancel() {

    if (this.checkSubmit()) { return; }

    this.serviceOrdersService.registerService({ data: this.settings.data, isCancel: true }).then(() => {
      this.onClose();
    });
  }

  public onUpdateStatus() {

    if (this.checkSubmit()) { return; }

    const data = this.settings.data;

    data.data.serviceStatus = data.data.serviceStatus == EServiceOrderStatus.CANCELED ? EServiceOrderStatus.PENDENT : (data.data.scheme.status == EServiceOrderStatus.CONCLUDED) ? EServiceOrderStatus.CONCLUDED : data.data.serviceStatus;

    const isAllocProducts = data.isAllocProductsThisStep || data.data.serviceStatus == EServiceOrderStatus.CANCELED ? true : false;

    // ADICIONAR: Atualiza as fotos em qualquer etapa
    data.data.photosAfter = [...this.modalPhotosAfter];
    if (this.modalPhotosAfter.length > 0) {
      console.log(`📸 Atualizando ${this.modalPhotosAfter.length} fotos ao atualizar status`);
    }

    this.serviceOrdersService.updateStatus(data.data, isAllocProducts, data).then(() => {

      this.onClose();
    }).catch((error) => {

      this.onClose();
      console.error(error);
    });
  }

  public onEmitNf() {
    this.settings.activeComponent = 'ServiceOrders/EmitNf';
    this.modalComponent.title = 'Emitir Nota Fiscal de Serviço';
  }

  // public checkNf(){
  //   return Utilities.isFiscal && !this.settings.data.nf;
  // }

  // ADICIONAR: Métodos para fotos no modal de status

  /**
   * Abre a câmera no modal de status
   */
  public onOpenModalCamera() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      this.startModalCamera();
    } else {
      alert('Seu navegador não suporta acesso à câmera.');
    }
  }
  private startModalCamera() {
    if (this.modalCamera.stream) {
      this.modalCamera.stream.getTracks().forEach(track => track.stop());
    }

    const constraints = {
      video: {
        facingMode: { ideal: this.modalCamera.facingMode },
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    };

    navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        this.modalCamera.stream = stream;
        this.modalCamera.active = true;

        setTimeout(() => {
          if (this.modalVideoElement && this.modalVideoElement.nativeElement) {
            this.modalVideoElement.nativeElement.srcObject = stream;
          }
        }, 100);
      })
      .catch(error => {
        console.error('Erro ao acessar câmera:', error);
        navigator.mediaDevices.getUserMedia({ video: true })
          .then(stream => {
            this.modalCamera.stream = stream;
            this.modalCamera.active = true;

            setTimeout(() => {
              if (this.modalVideoElement && this.modalVideoElement.nativeElement) {
                this.modalVideoElement.nativeElement.srcObject = stream;
              }
            }, 100);
          })
          .catch(finalError => {
            console.error('Não foi possível acessar nenhuma câmera:', finalError);
            alert('Não foi possível acessar a câmera. Verifique as permissões.');
          });
      });
  }

  public onToggleModalCameraFacing() {
    this.modalCamera.facingMode = this.modalCamera.facingMode === 'environment' ? 'user' : 'environment';
    if (this.modalCamera.active) {
      this.startModalCamera();
    }
  }

  /**
   * Captura foto da câmera no modal
   */
  public onCaptureModalPhoto() {
    if (!this.modalCamera.active || !this.modalCamera.stream) { return; }

    const video = this.modalVideoElement.nativeElement;
    const canvas = document.createElement('canvas');

    // Define tamanho ideal para fotos
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
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(video, 0, 0, width, height);

      // Converte para JPEG com qualidade
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

      if (this.modalPhotosAfter.length < 4) {
        this.modalPhotosAfter.push(dataUrl);
        console.log('✅ Foto capturada com sucesso!');
      }
    }

    this.onCloseModalCamera();
  }

  /**
   * Fecha a câmera do modal
   */
  public onCloseModalCamera() {
    if (this.modalCamera.stream) {
      this.modalCamera.stream.getTracks().forEach(track => track.stop());
    }
    this.modalCamera.active = false;
    this.modalCamera.stream = null;
  }

  /**
   * Seleciona fotos do dispositivo
   */
  public onSelectModalPhotos(event: any) {
    const input = event.target;
    const maxPhotos = 4;
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    // Validações
    const files = Array.from(input.files) as File[];
    const remainingSlots = maxPhotos - this.modalPhotosAfter.length;

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

        if (this.modalPhotosAfter.length < maxPhotos) {
          this.modalPhotosAfter.push(result);
          console.log('✅ Foto adicionada:', file.name);
        }
      };
      reader.readAsDataURL(file);
    });

    input.value = '';
  }

  /**
   * Remove uma foto do modal
   */
  public onRemoveModalPhoto(index: number) {
    this.modalPhotosAfter.splice(index, 1);
    console.log('❌ Foto removida');
  }

  // Print Actions

  public onOpenPrinter() {

    const data = Utilities.deepClone(this.settings.data);
    data.products = this.settings.data.products;

    this.printComponent.onOpen({
      activeComponent: 'ServiceOrders/Receipt',
      data: data
    });
  }


  // Modal Actions

  public onOpen(settings: any = {}) {

    this.settings = settings;
    this.settings.data = (settings.data || {});

    // ADICIONAR: Limpa as fotos temporárias ao abrir
    this.modalPhotosAfter = [];

    // Se já existirem fotos "depois" na ordem, carrega elas
    if (settings.activeComponent === 'ServiceOrders/UpdateStatus' &&
      settings.data?.data?.photosAfter) {
      // Copia as fotos existentes (se houver)
      this.modalPhotosAfter = [...settings.data.data.photosAfter];
    }

    const config: any = { mode: 'fullscreen' };
    const style: any = {};

    this.cdr.detectChanges();

    if (settings.activeComponent === 'ServiceOrders/Filters') {
      config.mode = settings.activeComponent === 'ServiceOrders/Filters' ? 'sidescreen' : 'fullscreen';
    }

    if ((this.settings.activeComponent === 'ServiceOrders/Create') || (this.settings.activeComponent === 'ServiceOrders/Update')) {
      style.backgroundImage = false;
    }

    if ((this.settings.activeComponent === 'ServiceOrders/Read') || (this.settings.activeComponent === 'ServiceOrders/Cancel')) {

      this.settingsService.getSOSettings('ServiceOrdersModalComponent', (data) => {

        this.settings.checklist = this.restructureChecklist(data.checklist);

        if (this.settings.data && this.settings.data.checklist) {
          this.markChecklist(this.settings.data.checklist);
        }
      });
    }

    if (this.settings.data.saleCode) {

      Dispatch.cashierFrontPDVService.getSale(parseInt(this.settings.data.saleCode)).then((res) => {
        this.settings.sale = res;
        this.modalComponent.onOpen(config, style);
        this.checkTranslationChange();
      }).catch(() => { });

    } else {

      this.modalComponent.onOpen(config, style);
      this.checkTranslationChange();
    }

    // Checks the component's response and initializes them

    if (
      (this.settings.activeComponent === 'ServiceOrders/Filters' && this.filtersComponent) ||
      ((this.settings.activeComponent === 'ServiceOrders/Create') && this.registerComponent) ||
      (this.settings.activeComponent === 'ServiceOrders/Read') ||
      ((this.settings.activeComponent === 'ServiceOrders/Update') && this.registerComponent) ||
      ((this.settings.activeComponent === 'ServiceOrders/Cancel'))
    ) {

      if (this.settings.activeComponent === 'ServiceOrders/Filters' && this.filtersComponent) {
        this.filtersComponent.bootstrap(settings);
      }

      if (
        ((this.settings.activeComponent === 'ServiceOrders/Create') && this.registerComponent) ||
        ((this.settings.activeComponent === 'ServiceOrders/Update') && this.registerComponent)
      ) {
        this.registerComponent.bootstrap({ data: settings.data, action: this.settings.activeComponent.split("/")[1] });
      }
    }

    // Check when the translation changes

    Utilities.loading(false);
  }

  public onClose(standard: boolean = false) {

    // ADICIONAR: Limpa as fotos temporárias do modal
    this.modalPhotosAfter = [];

    // Fecha a câmera se estiver aberta
    if (this.modalCamera.active) {
      this.onCloseModalCamera();
    }

    if (!standard) {
      this.modalComponent.onClose();
    }

    this.settings = {};

    this.settingsService.removeListeners("ServiceOrdersModalComponent", "service-orders-settings");
    Dispatch.removeListeners('languageChange', 'ServiceOrdersModalComponent');
  }

  public checkNf() {

    const item = this.settings.sale;

    if (Utilities.isFiscal && item) {

      if (item.nf) {

        const hasService = item.service && item.service.types ? item.service.types.length > 0 : false;
        const hasProducts = item.products ? item.products.length > 0 : false;

        if (typeof item.nf.status == "object") {
          if (item.nf && item.nf.status.nf && item.nf.status.nf != "CONCLUIDO") {
            return true;
          }

          if (item.nf && item.nf.status.nfse && item.nf.status.nfse != "CONCLUIDO") {
            return true;
          }

          if (item.nf && item.nf.status.nfse && item.nf.status.nfse == "CONCLUIDO" && item.nf.status.nf && item.nf.status.nf == "CONCLUIDO") {
            return false;
          }

          if (item.nf && !item.nf.conjugated && hasService && !item.nf.id.nfse) {
            return true
          }
        } else {

          return false;
        }

      } else if (this.settings.data.paymentStatus == "CONCLUDED") {
        return true;
      } else {
        return false;
      }

      // return  this.permissions.emitNf && !item.nf || this.permissions.emitNf && item.nf && ;
    } else {
      return false;
    }
  }

  // Event Listeners

  public onModalResponse(event: any) {

    if (event.instance) {
      this.modalComponent = event.instance;
    }

    if (event.close) {
      this.onClose(true);
    }
  }

  public onFiltersResponse(event: any) { }

  public onRegisterResponse(event: any) {
    if (event.close) {
      this.onClose();
    }
  }

  public onPrintResponse(event: any) { }

  public onResponseRegisterNf(event) {
    if (event.print) {
      this.onClose();
    }
  }

  // Auxiliary Methods

  private restructureChecklist(data: any) {
    const list = [];
    const groups = {};

    // Verifica se data é um array válido
    if (!data || !Array.isArray(data)) {
      console.warn('Dados do checklist não são um array:', data);
      return list;
    }

    $$(data).map((_, item) => {
      // Se item for uma string, converte para objeto
      if (typeof item === 'string') {
        item = { name: item, group: null };
      }

      // Verifica se item é um objeto válido
      if (typeof item !== 'object' || item === null) {
        console.warn('Item do checklist inválido:', item);
        return;
      }

      if (item.group) {
        groups[item.group] = groups[item.group] || [];
        groups[item.group].push(item);
      } else {
        list.push(item);
      }
    });

    $$(groups).map((group, items) => {
      list.push({
        name: group,
        subchecklist: items
      });
    });

    return list;
  }
  private markChecklist(data: any) {
    if (data) {
      // Verifica se settings.checklist existe e é um array
      if (!this.settings.checklist || !Array.isArray(this.settings.checklist)) {
        console.warn('Checklist não está no formato esperado:', this.settings.checklist);
        return;
      }

      $$(this.settings.checklist).map((_, itemNV1) => {
        // Verifica se itemNV1 é um objeto válido
        if (typeof itemNV1 !== 'object' || itemNV1 === null) {
          console.warn('Item do checklist não é um objeto:', itemNV1);
          return;
        }

        $$(data).map((_, itemNV2) => {
          // Se itemNV2 for uma string simples, converte para objeto
          if (typeof itemNV2 === 'string') {
            itemNV2 = { name: itemNV2, checked: true };
          }

          // Verifica se itemNV2 é um objeto válido
          if (typeof itemNV2 !== 'object' || itemNV2 === null) {
            console.warn('Item de dados não é um objeto:', itemNV2);
            return;
          }

          // Compara os nomes e marca como checked
          if (itemNV1.name == itemNV2.name && itemNV2.checked == undefined || itemNV1.name == itemNV2.name && itemNV2.checked) {
            itemNV1.checked = true;

            // Processa subchecklist se existir
            if (itemNV1.subchecklist && Array.isArray(itemNV1.subchecklist)) {
              $$(itemNV1.subchecklist).map((_, sub) => {
                // Verifica se sub é um objeto válido
                if (typeof sub !== 'object' || sub === null) {
                  console.warn('Subitem do checklist não é um objeto:', sub);
                  return;
                }

                // Verifica se itemNV2.subchecklist existe e é um array
                if (itemNV2.subchecklist && Array.isArray(itemNV2.subchecklist)) {
                  sub.checked = (itemNV2.subchecklist.indexOf(sub.name) != -1);
                } else if (itemNV2.subchecklist && typeof itemNV2.subchecklist === 'string') {
                  // Se subchecklist for string, verifica se é igual ao nome
                  sub.checked = (itemNV2.subchecklist === sub.name);
                } else {
                  sub.checked = false;
                }
              });
            }
          }
        });
      });

      this.settings.data.checklist = this.settings.checklist;
      delete this.settings.checklist;
    }
  }

  private checkTranslationChange() {

    const setTitle = () => {

      if (this.modalComponent) {

        if (this.settings.activeComponent == 'ServiceOrders/Filters') {
          this.modalComponent.title = this.translate.filters.title;
        }

        if (this.settings.activeComponent == 'ServiceOrders/Create') {
          this.modalComponent.title = this.translate.action.register.type.create.title;
        }

        if (this.settings.activeComponent == 'ServiceOrders/Read') {
          this.modalComponent.title = this.translate.action.read.title;
        }

        if (this.settings.activeComponent == 'ServiceOrders/Update') {
          this.modalComponent.title = this.translate.action.register.type.update.title;
        }

        if (this.settings.activeComponent == 'ServiceOrders/Cancel') {
          this.modalComponent.title = this.translate.action.cancel.title;
        }

        if (this.settings.activeComponent == 'ServiceOrders/Delete') {
          this.modalComponent.title = this.translate.action.delete.title;
        }

        if (this.settings.activeComponent === 'ServiceOrders/UpdateStatus') {
          this.modalComponent.title = this.translate.action.updateStatus.title;
        }
      }
    };

    Dispatch.onLanguageChange('ServiceOrdersModalComponent', () => {
      setTitle();
    });

    setTitle();
  }


  private checkSubmit() {
    if ((<any>this).settings._isSubmited) { return true; }
    (<any>this).settings._isSubmited = true;
    return false;
  }

  // Destruction Method

  public ngOnDestroy() {

    this.settings = {};

    this.modalComponent = null;
    this.filtersComponent = null;
    this.registerComponent = null;
    this.printComponent = null;

    // ADICIONAR: Limpa recursos de fotos
    this.modalPhotosAfter = [];
    if (this.modalCamera.active) {
      this.onCloseModalCamera();
    }

    Dispatch.removeListeners('languageChange', 'ServiceOrdersModalComponent');
  }

}
