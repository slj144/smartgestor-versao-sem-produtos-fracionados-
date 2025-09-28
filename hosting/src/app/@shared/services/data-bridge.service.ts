import { Injectable } from '@angular/core';
import { Utilities } from '../utilities/utilities';

@Injectable({ providedIn: 'root' })
export class DataBridgeService {

  private data: any = {};

  public getData(id: string) {

    let data = null;

    if (id && this.data[id]) {
      data = Utilities.deepClone(this.data[id]);
    }
    
    if (!id) {
      data = Utilities.deepClone(this.data);
    }

    return data;
  }
  
  public setData(id: string, data: any) {    
    if (id) {
      this.data[id] = Utilities.deepClone(data);
    }    
  }

  public clearData(id?: string) {

    if (id && this.data[id]) {
      delete this.data[id];
    }
    
    if (!id) {
      this.data = {};
    }    
  }

}
