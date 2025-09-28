import { Injectable } from '@angular/core';
import { EventEmitter } from 'events';

// API
import onScan from 'onscan.js';

// Utilities
import { Utilities } from '@itools/utilities/utilities';

@Injectable({ providedIn: 'root' })
export class ScannerService {

  private _checkInitialize: boolean = false;
  private _dataMonitors: EventEmitter = new EventEmitter();

  public get isInitialized(){ return this._checkInitialize; }

  // Receives the event values from the scanner

  public getShot(listenerId: string, listener: ((_: any)=>void)) {
    Utilities.onEmitterListener(this._dataMonitors, 'global', listenerId, listener);
  }

  // Performs the Scanner Settings

  public initialize() {
    
    try {

      if (!this._checkInitialize) {

        onScan.attachTo(document, {
          reactToPaste: false,
          ignoreIfFocusOn: true,
          onKeyDetect: (_, event) => {

            if (isNaN(parseInt(event.key))) {
              if (event.ctrlKey) {
                if (event.key == "j") {
                  event.preventDefault(); 
                }
              }
            }            
          },
          onScan: (barcode: string) => {
            this._dataMonitors.emit('global', barcode);
          }
        });

        this._checkInitialize = true;
      } else {
        throw new Error('The scanner has already been initialized');
      }      
    } catch(error) {
      console.error(`Error: ${error.message}`);
    }
  }

  // Data Processing

  public removeListeners(listenerId: (string | string[])) {
    Utilities.offEmitterListener(this._dataMonitors, 'global', listenerId);
  }

}
