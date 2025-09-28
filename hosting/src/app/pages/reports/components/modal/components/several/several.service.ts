import { Injectable } from "@angular/core";

// Services
import { IToolsService } from '@shared/services/iTools.service';

// Interfaces
import { ICollection } from "@itools/interfaces/ICollection";

// Types
import { query } from '@shared/types/query';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';

@Injectable({ providedIn: 'root' })
export class SeveralReportsService {

  constructor(
    private iToolsService: IToolsService
  ) {}  

  public getSystemLogs(settings: { where: query['where'], orderBy: query['orderBy'], start?: number, limit?: number, data?: any }) {

    return (new Promise<any>((resolve, reject) => {

      const collection = this.iToolsService.database().collection('SystemLogs');
      collection.orderBy(settings.orderBy);
      collection.where(settings.where);

      this.batchDataSearch(collection, settings).then((result) => {

        const logs = [];

        for (const item of result) {

          item.code = Utilities.prefixCode(item.code);

          if (item.data) {
          
            for (const info of item.data) {  

              if (info.referenceCode) {
                item.referenceCode = Utilities.prefixCode(info.referenceCode);
              }

              item.type = info.type;
              item.action = info.action;
              item.note = info.note;

              logs.push(Utilities.deepClone(item));
            }
          }
        }

        resolve(logs);
      }).catch((error) => {
        reject(error);
      });

      // collection.get().then((response) => {    

      //   const arrData = [];

      //   for (const doc of response.docs) {          

      //     const logData = doc.data();
      //     logData.code = Utilities.prefixCode(logData.code);

      //     if (logData.data) {
          
      //       for (const item of logData.data) {  

      //         if (item.referenceCode) {
      //           logData.referenceCode = Utilities.prefixCode(item.referenceCode);
      //         }

      //         logData.type = item.type;
      //         logData.action = item.action;
      //         logData.note = item.note;

      //         arrData.push(Utilities.deepClone(logData));
      //       }
      //     }
      //   }
        
      //   resolve(arrData);
      // });
    }));
  }
  
  // Auxiliaries Methods

  private async batchDataSearch(collection: ICollection, settings: query) {

    return (new Promise<any>((resolve, reject) => {

      settings.where = (settings.where.length > 0 ? settings.where : []);
      settings.start = (settings.start >= 0 ? settings.start : 0);
      settings.limit = (settings.limit > 0 ? settings.limit : 500);
  
      collection.count().get().then((res) => {
            
        const count = (res.docs.length > 0 ? res.docs[0].data().count : 0);
        const requestsCount = Math.ceil(count / settings.limit);
  
        let data = [];
        let control = 1;
        let success = null;
        let error = null;
  
        const requestRecursive = (settings: query) => {
  
          try {
  
            collection.where(settings.where);
            collection.startAfter(settings.start);
            collection.limit(settings.limit);

            collection.get().then((res) => {
  
              for (const doc of res.docs) {
                data.push(doc.data());
              }
   
              if (requestsCount > 1) {

                if (control <= requestsCount) {
    
                  settings.start = (settings.limit * control);
                  control++;
    
                  setTimeout(() => {
                    if (control < (requestsCount + 1)) {
                      requestRecursive(settings);
                    }
                  }, 200);
                }
    
                if (control == (requestsCount + 1)) {
                  success = true;
                }
              } else {
                success = true;
              }
            }).catch((e) => {
              throw new Error(e);
            });
          } catch(e) {
            error = e;
          }                      
        };        
  
        if (count > 0) {
          requestRecursive(settings);
        } else {
          success = true;
        }
        
        const timer = setInterval(() => {
  
          if (success) {  
            clearInterval(timer);    
            resolve(data);
          }
  
          if (error) {
            clearInterval(timer);
            reject(error);
          }
        }, 200);
      });
    }));    
  }

}