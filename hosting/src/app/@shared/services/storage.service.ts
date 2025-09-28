import { Injectable } from '@angular/core';

// Interfaces
import { IStorage } from '@itools/interfaces/IStorage';

// Types
import { uploadFIle } from '../types/upload-file';
import { DateTime } from '../utilities/dateTime';

// Utitilies
import { $$ } from '../utilities/essential';
import { Utilities } from '../utilities/utilities';

@Injectable({ providedIn: 'root' })
export class StorageService {

  public static async uploadFile(settings: uploadFIle) {
    
    return new Promise<any>((resolve, reject)=>{
      DateTime.context(()=>{
        const storageRef = settings.storageRef;
        let extension: any;

        const deleteFiles = [];
        const uploadFiles = [];

        settings.settings.forEach((fileSettings)=>{

          if (fileSettings.file) {  
            fileSettings.file = fileSettings.file instanceof FileList ? fileSettings.file[0] : fileSettings.file;
            extension = fileSettings.file.name.split(".");
            extension = extension[extension.length - 1].trim();
            fileSettings.name = fileSettings.name ? fileSettings.name : fileSettings.file.name;
          }

          fileSettings.name ? fileSettings.name : Utilities.uuid() + "." + extension

          const filePath = fileSettings.path ? fileSettings.path + "/" : "";
          const fileName = fileSettings.name;

                  
          if (fileSettings.sourceUrl){
            const url = fileSettings.sourceUrl.trim();      

            if (url && url.substring(0, 4) == "http") {
              deleteFiles.push({ storageRef, url });
            }
          }
            
          if (fileSettings.bindData && fileSettings.bindData.img){
      
            $$(fileSettings.bindData.img).css("opacity", 0.5);
          }

          const obj = fileSettings.file ? {file: fileSettings.file, name: filePath + fileName} : {data: fileSettings.dataFile, name: filePath + fileName};
          uploadFiles.push(obj);
        });

        storageRef.upload(uploadFiles).then((res)=>{

          deleteFiles.forEach((file)=>{
            this.removeFile(file);
          });

          let count = res.uploadedUrls.length;
          let uploadedFiles = [];

          try{
            res.uploadedUrls.forEach(async (file)=>{
              uploadedFiles.push((await file.getDownloadUrl()).url);
              count--;
            });
          }catch(e){

            reject({status: false, error: e.message});
            return;
          }

          const timer = setInterval(()=>{
            if (count == 0){
              settings.settings.forEach((fileSettings, index)=>{
                if (fileSettings.bindData && fileSettings.bindData.img){

                  $$(fileSettings.bindData && fileSettings.bindData.img).attr("src", uploadedFiles[index]);
                  $$(fileSettings.bindData && fileSettings.bindData.img).css("opacity",1);
                }
              });
              clearInterval(timer);
              resolve(uploadedFiles);
            }
          }, 0);
        });
   
      });
    });
  }

  public static async removeFile(settings: { storageRef: IStorage, url: string }) {

    return (new Promise<void>(async (resolve, reject) => {

      try {

        const storageRef = settings.storageRef;
        const path = decodeURIComponent(settings.url.split("?")[1].split("&")[1].split("=")[1]);

        if (path.split("/")[0].trim() != "General"){
          await storageRef.path(path).delete();
        }

        resolve();
      } catch(error) {
        reject(error);
      }      
    }));
  }

  // Auxiliary Methods

  private static async base64toBlob(b64Data, contentType = '', sliceSize = 512) {

    return (new Promise<any>((resolve) => {

      const byteCharacters = atob(b64Data);
      const byteArrays = [];
    
      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {

        const slice = byteCharacters.slice(offset, offset + sliceSize);    
        const byteNumbers = new Array(slice.length);

        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
    
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
    
      resolve(new Blob(byteArrays, {type: contentType}));
    }));   
  }

}