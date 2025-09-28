import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// Utilities
import { Utilities } from '@shared/utilities/utilities';
import { IToolsService } from '@shared/services/iTools.service';

@Injectable({ providedIn: 'root' })
export class DataImportService {

  constructor(
    private itoolsService: IToolsService
  ) {}

  public getFileUrl(): Observable<any> {

    return new Observable((subscribe) => {

      let fileName = '';

      if (Utilities.storeID == 'matrix') {
        fileName = 'Planilha de Importacao - Matriz.xlsx';
        // this.itoolsService.storage().path("_Models/e05ab3f43b5344b792dd425db668f14f16916345931578.xlsx").getDownloadUrl().then((data)=>{

          const data = {
            url: "https://storage.ipartts.com/bm-iparttsdev/file?token=69f8146cf82c6703315a18dbd3bd3d71f6671442bda29947593375606d007f52&path=_Models/e05ab3f43b5344b792dd425db668f14f16916345931578.xlsx"
          };

          // console.log(data);


          // if(data.status){
            subscribe.next(data.url+ "&download="+ fileName);
          // }
        // });
      } else {
        fileName = 'Planilha de Importacao - Filial.xlsx';
        // this.itoolsService.storage().path("_Models/e05ab3f43b5344b792dd425db668f14f16916345931579.xlsx").getDownloadUrl().then((data)=>{

          // console.log(data);

          const data = {
            url: "https://storage.ipartts.com/bm-iparttsdev/file?token=69f8146cf82c6703315a18dbd3bd3d71f6671442bda29947593375606d007f53&path=_Models/e05ab3f43b5344b792dd425db668f14f16916345931579.xlsx"
          };

          // if(data.status){
            subscribe.next(data.url+ "&download="+ fileName);
          // }
        // });
      }
    });
  }
  
}