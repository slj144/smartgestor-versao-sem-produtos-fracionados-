import { EventEmitter } from "events";

// Utilities
import { Utilities } from "@itools/utilities/utilities";

export class Dispatch {

  public static cashierFrontPDVService;
  public static requestsService;
  public static serviceOrdersService;
  public static collaboratorsService;
  public static fiscalService;

  private static data: any = {};

  private static emitter: EventEmitter = (() => {

    const emiiter = new EventEmitter();
    emiiter.setMaxListeners(100);

    return emiiter;
  })();

  public static emit(id: string, data: any) {
    Dispatch.data[id] = data;
    Dispatch.emitter.emit(id, data);
  }

  public static onCurrentUserChange(listenerId: string, listener: (_:any)=> void = ()=>{}) {
    
    Utilities.onEmitterListener(Dispatch.emitter, "current-user", listenerId, listener);
    
    if (Dispatch.data["current-user"]) {
      Dispatch.emit("current-user", Dispatch.data["current-user"]);
    }
  }

  public static onUserRootChange(listenerId: string, listener: (_:any)=> void = ()=>{}) {

    Utilities.onEmitterListener(Dispatch.emitter, "user-root", listenerId, listener);

    if (Dispatch.data["user-root"]) {
      Dispatch.emit("user-root", Dispatch.data["user-root"]);
    }
  }

  public static onMatrixChange(listenerId: string, listener: (_:any)=> void = ()=>{}) {

    Utilities.onEmitterListener(Dispatch.emitter, "matrixStore", listenerId, listener);
    
    if (Dispatch.data["matrixStore"]) {
      Dispatch.emit("matrixStore", Dispatch.data["matrixStore"]);
    }
  }

  public static onLanguageChange(listenerId: string, listener: (_:any) => void = ()=>{}) {
    
    Utilities.onEmitterListener(Dispatch.emitter, "languageChange", listenerId, listener);
    
    if (Dispatch.data["languageChange"]) {
      Dispatch.emit("languageChange", Dispatch.data["languageChange"]);
    }
  }

  public static onRefreshCurrentUserPermissions(listenerId: string, listener: (_:any)=> void = ()=>{}) {
    Utilities.onEmitterListener(Dispatch.emitter, "refresh-menu", listenerId, listener);
  }

  public static emitChangeMatrixStore(data) {
    Dispatch.data["matrixStore"] = data;
    Dispatch.emitter.emit("matrixStore", data);
  }

  public static removeListeners(emitterId: string = null, listenerId: string | string[] = null) {    
    Utilities.offEmitterListener(Dispatch.emitter, emitterId, listenerId);
  }

}