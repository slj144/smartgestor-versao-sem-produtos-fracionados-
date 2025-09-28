// // Arquivo: camera-scanner.service.ts
// // Localização: src/app/shared/services/camera-scanner.service.ts
// // Este serviço controla a câmera do celular para ler códigos de barras

// import { Injectable } from '@angular/core';
// import { Subject } from 'rxjs';

// // Importa a biblioteca QuaggaJS
// declare var Quagga: any;

// @Injectable({ providedIn: 'root' })
// export class CameraScannerService {

//     // Este é o "canal" que avisa quando um código foi lido
//     public onBarcodeScanned = new Subject<string>();

//     // Guarda se a câmera está ligada ou não
//     private isScanning = false;

//     constructor() { }

//     /**
//      * Inicia a câmera para ler código de barras
//      * @param targetElement - O lugar na tela onde a câmera vai aparecer
//      */
//     public startScanner(targetElement: string): Promise<void> {
//         return new Promise((resolve, reject) => {

//             // Se já está escaneando, não faz nada
//             if (this.isScanning) {
//                 resolve();
//                 return;
//             }

//             // Configurações da câmera
//             const config = {
//                 // Onde a imagem da câmera vai aparecer
//                 inputStream: {
//                     name: "Live",
//                     type: "LiveStream",
//                     target: document.querySelector(targetElement), // Elemento HTML onde aparece a câmera
//                     constraints: {
//                         width: { min: 640 },
//                         height: { min: 480 },
//                         facingMode: "environment" // Usa a câmera de trás do celular
//                     }
//                 },

//                 // Configurações do leitor
//                 decoder: {
//                     // Tipos de código de barras que vamos ler
//                     readers: [
//                         "ean_reader",        // Código EAN (mais comum no Brasil)
//                         "ean_8_reader",      // Código EAN-8
//                         "code_128_reader",   // Código 128
//                         "code_39_reader",    // Código 39
//                         "upc_reader",        // Código UPC
//                         "upc_e_reader"       // Código UPC-E
//                     ]
//                 },

//                 // Área onde o código deve estar para ser lido
//                 locator: {
//                     patchSize: "medium",
//                     halfSample: true
//                 },

//                 // Quantas vezes por segundo tenta ler
//                 frequency: 10,

//                 // Número de trabalhadores (deixa 0 para o navegador decidir)
//                 numOfWorkers: 0,

//                 // Localiza códigos de barras automaticamente
//                 locate: true
//             };

//             // Inicia o Quagga
//             Quagga.init(config, (err: any) => {
//                 if (err) {
//                     console.error('Erro ao iniciar câmera:', err);
//                     reject(err);
//                     return;
//                 }

//                 // Liga a câmera
//                 Quagga.start();
//                 this.isScanning = true;

//                 // Fica "escutando" quando um código é detectado
//                 Quagga.onDetected((result: any) => {
//                     if (result && result.codeResult && result.codeResult.code) {
//                         // Pega o código que foi lido
//                         const barcode = result.codeResult.code;

//                         // Avisa que um código foi lido
//                         this.onBarcodeScanned.next(barcode);

//                         // Para a câmera automaticamente após ler
//                         this.stopScanner();
//                     }
//                 });

//                 resolve();
//             });
//         });
//     }

//     /**
//      * Para a câmera e limpa tudo
//      */
//     public stopScanner(): void {
//         if (this.isScanning) {
//             Quagga.stop();
//             this.isScanning = false;

//             // Remove os "ouvintes" de eventos
//             Quagga.offDetected();
//             Quagga.offProcessed();
//         }
//     }

//     /**
//      * Verifica se o dispositivo é móvel
//      * Retorna true se for celular ou tablet
//      */
//     public isMobileDevice(): boolean {
//         // Lista de palavras que aparecem em celulares e tablets
//         const mobileKeywords = [
//             'Android', 'webOS', 'iPhone', 'iPad', 'iPod',
//             'BlackBerry', 'IEMobile', 'Opera Mini'
//         ];

//         // Verifica se alguma palavra está no navegador
//         return mobileKeywords.some(keyword =>
//             navigator.userAgent.includes(keyword)
//         );
//     }

//     /**
//      * Verifica se o navegador suporta câmera
//      */
//     public hasCamera(): boolean {
//         return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
//     }
// }