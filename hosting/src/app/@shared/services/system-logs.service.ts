import { Injectable } from '@angular/core';
import { iTools } from '../../../assets/tools/iTools';

// Services
import { IToolsService } from './iTools.service';

// Interfaces
import { IBatch } from '@itools/interfaces/IBatch';
import { ICollection } from '@itools/interfaces/ICollection';
import { ISystemLog } from '../interfaces/ISystemLog';

// Utilities
import { Utilities } from '../utilities/utilities';

@Injectable({ providedIn: 'root' })
export class SystemLogsService {

  constructor(
    private iToolsService: IToolsService
  ) {}

  // CRUD Methods

  public async registerLogs(data: ISystemLog, batch: IBatch) {
    
    return (new Promise<any>((resolve, reject) => {      

      if (data && batch) {
      
        data.code = iTools.FieldValue.control('SystemControls', Utilities.storeID, 'SystemLogs.code');
        data.owner = Utilities.storeID;        
        data.operator = Utilities.operator;
        data.registerDate = iTools.FieldValue.date(Utilities.timezone);

        const batchRef = batch.update(this.collRef().doc(), data);

        resolve({ batchRef });
      } else {
        reject();
      }              
    }));   
  }

  // Auxiliary Methods
  
  private collRef(): ICollection {
    return this.iToolsService.database().collection("SystemLogs");
  }

}
