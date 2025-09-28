import { Injectable } from "@angular/core";

// Services
import { IToolsService } from '../../services/iTools.service';

// Utilities
import { Utilities } from "../../utilities/utilities";

// Settings
import { environment } from '../../../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class SystemUpdateService {

  constructor(
    private iToolsService: IToolsService
  ) {}

  public updateMonitor(callback: ((status: boolean, data: any)=>void)) {

    this.iToolsService.database().onReleaseInfo("default", (data) => {

      const releaseData = (data || {});
      const updateVersion = releaseData.version;
      const systemVersion = environment.version;
      const localVersion = this.checkLocalData('updateVersion', systemVersion);

      if ((updateVersion > systemVersion) || (updateVersion > localVersion)) {
        callback(true, releaseData);
      } else { 
        callback(false, {});
      }
    });
  }

  // Auxiliary Methods

  private checkLocalData(key: string, value: any) {

    if (Utilities.localStorage(key) == null) {
      Utilities.localStorage(key, value);
    }

    return Utilities.localStorage(key);
  }

}