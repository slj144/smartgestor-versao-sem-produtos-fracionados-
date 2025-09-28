// // Arquivo: camera-scanner-modal.component.ts
// // Localização: src/app/shared/components/camera-scanner-modal/camera-scanner-modal.component.ts
// // Este componente mostra a tela da câmera para ler código de barras

// import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
// import { CameraScannerService } from '@shared/services/camera-scanner.service';
// import { Subscription } from 'rxjs';

// // Utilities
// import { Utilities } from '@shared/utilities/utilities';

// @Component({
//     selector: 'camera-scanner-modal',
//     templateUrl: './camera-scanner-modal.component.html',
//     styleUrls: ['./camera-scanner-modal.component.scss']
// })
// export class CameraScannerModalComponent implements OnInit, OnDestroy {

//     // Evento que avisa quando um código foi lido
//     @Output() public onBarcodeRead = new EventEmitter<string>();

//     // Evento para fechar o modal
//     @Output() public onClose = new EventEmitter<void>();

//     // Controla se está carregando
//     public loading = true;

//     // Mensagem de erro (se houver)
//     public errorMessage = '';

//     // Guarda a inscrição do scanner
//     private scannerSubscription: Subscription;

//     constructor(
//         private cameraScannerService: CameraScannerService
//     ) { }

//     ngOnInit() {
//         // Inicia a câmera quando o modal abrir
//         this.startCamera();
//     }

//     ngOnDestroy() {
//         // Para a câmera quando o modal fechar
//         this.stopCamera();
//     }

//     /**
//      * Inicia a câmera para leitura
//      */
//     private startCamera(): void {
//         // Verifica se o navegador tem suporte para câmera
//         if (!this.cameraScannerService.hasCamera()) {
//             this.errorMessage = 'Seu navegador não suporta acesso à câmera!';
//             this.loading = false;
//             return;
//         }

//         // Mostra loading
//         this.loading = true;
//         this.errorMessage = '';

//         // Espera um pouquinho para o modal aparecer completamente
//         setTimeout(() => {
//             // Inicia o scanner
//             this.cameraScannerService.startScanner('#camera-viewport')
//                 .then(() => {
//                     // Deu certo! Remove o loading
//                     this.loading = false;

//                     // Fica "escutando" quando um código for lido
//                     this.scannerSubscription = this.cameraScannerService.onBarcodeScanned
//                         .subscribe((barcode: string) => {
//                             // Vibra o celular (se suportar)
//                             if (navigator.vibrate) {
//                                 navigator.vibrate(200);
//                             }

//                             // Avisa que leu o código
//                             this.onBarcodeRead.emit(barcode);

//                             // Fecha o modal
//                             this.close();
//                         });
//                 })
//                 .catch((error) => {
//                     // Deu erro!
//                     console.error('Erro ao iniciar câmera:', error);
//                     this.loading = false;

//                     // Mostra mensagem amigável dependendo do erro
//                     if ((error.name === 'NotAllowedError' || error.name === 'SecurityError') &&
//                         window.location.protocol !== 'https:' &&
//                         window.location.hostname !== 'localhost') {
//                         // Navegador bloqueia a câmera se não estiver em HTTPS
//                         this.errorMessage = 'A câmera só pode ser acessada em conexões seguras (HTTPS).';
//                     } else if (error.name === 'NotAllowedError') {
//                         this.errorMessage = 'Você precisa permitir o acesso à câmera!';
//                     } else if (error.name === 'NotFoundError') {
//                         this.errorMessage = 'Nenhuma câmera foi encontrada no dispositivo!';
//                     } else {
//                         this.errorMessage = 'Erro ao acessar a câmera. Tente novamente!';
//                     }
//                 });
//         }, 100);
//     }

//     /**
//      * Para a câmera
//      */
//     private stopCamera(): void {
//         // Cancela a inscrição se existir
//         if (this.scannerSubscription) {
//             this.scannerSubscription.unsubscribe();
//         }

//         // Para o scanner
//         this.cameraScannerService.stopScanner();
//     }

//     /**
//      * Fecha o modal
//      */
//     public close(): void {
//         this.stopCamera();
//         this.onClose.emit();
//     }
// }