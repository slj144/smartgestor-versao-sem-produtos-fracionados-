import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { EventEmitter } from "events";
import { SettingsService } from "../../pages/settings/settings.service";
import { ENFeImpresionFileType, ENFeType } from "../enum/EFiscal";
import { IFiscalSettings } from "../interfaces/IFiscal";
import { $$ } from "./essential";
import { Utilities } from "./utilities";
import * as axios from "axios";


export enum EEnvrounment {
  SANDBOX = "SANDBOX",
  PRODUCTION = "PRODUCTION"
}

@Injectable({ providedIn: "root" })
export class PlugNotasApiService {

  public _envirounment: EEnvrounment = EEnvrounment.SANDBOX;
  private _apiLey: string;

  public get envrounment() { return this._envirounment; }
  public get apiKey() { return this._apiLey; }
  public set apiKey(key: string) { this._apiLey = key; }

  private _checkRequest: boolean = false;


  private _dataMonitors = new EventEmitter();

  public set envrounment(value: EEnvrounment) {

    this._envirounment = value;
    const isSandBox = value.toString().toUpperCase() == EEnvrounment.SANDBOX.toString().toUpperCase();
    this.endPoint = isSandBox ? "https://api.sandbox.plugnotas.com.br" : "https://api.plugnotas.com.br";
  }

  public endPoint: string = "";


  public ready(listenerId: string, listener: (_: any) => void) {

    const emitterId = 'ready';

    Utilities.onEmitterListener(this._dataMonitors, emitterId, listenerId, listener);

    if (this._checkRequest) {
      this._dataMonitors.emit(emitterId, true);
    }
  }

  constructor(
    private settingsService: SettingsService,
    private httpClient: HttpClient
  ) {


    this.settingsService.getSettings("FiscalService", (res) => {
      const fiscal = res?.fiscal?.apiKey ? res?.fiscal : { envrounment: "PRODUCTION", apiKey: "f9c89e6e-8df8-4a52-ad19-8cc4d748e246" };

      this.envrounment = fiscal.envrounment || EEnvrounment.SANDBOX;
      this.apiKey = fiscal.apiKey || "2da392a6-79d2-4304-a8b7-959572c7e44d";

      this._checkRequest = true;

      this._dataMonitors.emit("ready", true);
    });
  }


  public httpRequest(url: string, type: any, data: any = {}, headers: any = {}) {
    const isSendData = type == "post" || type == "put";
    headers = {
      headers: {
        "X-API-KEY": this.apiKey,
        'Access-Control-Allow-Origin': '*',
        // "Content-Type": "application/json",
        ...headers
      }
    };
    return isSendData ? this.httpClient[type](`${url}`, JSON.stringify(data), headers) : this.httpClient[type](`${url}`, headers);
  }


  private context(callback: () => any) {
    const it = setInterval(() => {
      if (this._checkRequest) {
        clearInterval(it);
        callback();
      }
    })
  }


  private async request(url: string, type: string, data: any = {}, headers: any = {}, responseType: "arraybuffer" | "blob" | "document" | "json" | "text" = "text") {
    return new Promise<any>((resolve, reject) => {

      const toObject = (value) => {
        if (typeof value == "string") {
          try { return JSON.parse(value); } catch (e) {
            return value;
          }
        } else {
          return value;
        }
      };


      // this.httpRequest(url, type, data, headers).subscribe({
      //   error(error) {
      //     reject(error);
      //   },
      //   next(value) {
      //     resolve(value);
      //   },
      // });

      // return;

      if (headers["Content-Type"] === false) {
        delete headers["Content-Type"];
      } else {
        headers["Content-Type"] = "application/json";
      }

      // console.log({
      //   headers: {
      //     "X-API-KEY": this.apiKey,
      //     ...headers
      //   },
      //   data: data,
      // })

      // console.log(data);

      return $$().ajax({
        test: true,
        url: url,
        type: type,
        headers: {
          "X-API-KEY": this.apiKey,
          ...headers
        },
        responseType: responseType,
        data: data,
        formData: !!(data instanceof FormData),
        success: (res) => {
          res = toObject(res);
          resolve(res);
        },
        error: (error) => {
          error = toObject(error);
          reject(error);
        }
      });
    });
  }

  // Store

  public async getStore(cpfCnpj?: string) {
    return new Promise<any>((resolve, reject) => {
      this.context(() => {

        const url = cpfCnpj ? `${this.endPoint}/empresa/${cpfCnpj}` : `${this.endPoint}/empresa`;
        this.request(url, "get").then((res) => { resolve(res) }).catch((error) => { reject(error) });
      })
    });

    // return this.request(url, "get");
  }

  public async setStore(data: IFiscalSettings) {
    return new Promise<IFiscalSettings>(async (resolve, reject) => {
      try {

        const store = await this.getStore(data.cpfCnpj).catch(() => { });
        const method = store ? "patch" : "post";
        const url = store ? `${this.endPoint}/empresa/${data.cpfCnpj}` : `${this.endPoint}/empresa`;

        // console.log(url, method, data);

        this.request(url, method, data).then((res) => {
          resolve(res);
        }).catch((error) => {
          reject(error);
        });
      } catch (error) {

        console.error(error.message);
        reject(error);
      }
    });
  }


  // Store Image

  public async getStoreImage(cpfCnpj: string) {
    return this.request(`${this.endPoint}/empresa/${cpfCnpj}/logotipo`, "get", {}, { "Content-Type": false }, "blob");
  }

  public async uploadStoreImage(cpfCnpj: string, image: any) {
    return new Promise<IFiscalSettings>(async (resolve, reject) => {
      try {

        const method = "post";

        const form = new FormData();
        form.append("arquivo", image);

        this.request(`${this.endPoint}/empresa/${cpfCnpj}/logotipo`, method, form, { "Content-Type": false }).then((res) => {
          resolve(res);
        }).catch((error) => {
          reject(error);
        });
      } catch (error) {

        console.error(error.message);
        reject(error);
      }
    });
  }

  public async deleteStoreImage(cpfCnpj: string) {
    return this.request(`${this.endPoint}/empresa/${cpfCnpj}/logotipo`, "delete");
  }


  // Certificates

  public async getCertificates(id: string = null) {
    return this.request(`${this.endPoint}/certificado${id ? "/" + id : ""}`, "get");
  }

  public async uploadCertificate(file: any, password: string, email?: string, id?: string) {
    return new Promise<{ message: string, data: { id: string } }>(async (resolve, reject) => {
      try {

        const hasCertificate = await this.getCertificates(id).catch(() => { });

        const certificate = id ? hasCertificate : null;
        const method = certificate ? "put" : "post";
        const url = certificate ? `${this.endPoint}/certificado/${id}` : `${this.endPoint}/certificado/`;
        const data = { arquivo: file, senha: password };

        if (email) { data["email"] = email; }

        // const certFile = new File([file], "arquivo", {type: "application/octet-stream"});

        const form = new FormData();
        form.append("arquivo", file);
        form.append("senha", data.senha);

        // return;

        // let headers = {headers: {
        //   "X-API-KEY": this.apiKey,
        //   // "Accept": "*/*",
        //   // "Content-Type": "multipart/form-data",
        //  }};

        // this.httpClient.post(url, f, headers).subscribe({
        //   next(value) {

        //     console.log(value);
        //   },
        //   error(error) {
        //     console.log(error)
        //   },
        // })


        // console.log(url);

        // axios.default.post(url, f, {
        //   headers: {
        //     "X-API-KEY": this.apiKey,
        //     "Content-Type": "multipart/form-data" 
        //   }
        // }).then((res)=>{

        //   console.log(res);
        //   resolve(<any>res.data);
        // }).catch((error)=>{

        //   console.log(error);
        // });

        // return;

        // return $$().ajax({
        //   test: true,
        //   url: url,
        //   type: method,
        //   headers: {
        //     "X-API-KEY": this.apiKey,
        //   },
        //   data: data,
        //   formData: true,
        //   success: (res)=>{
        //     try{
        //       res = JSON.parse(res);
        //     }catch(e){};

        //     resolve(res);
        //   },
        //   error: (error)=>{

        //     console.error(error);

        //     error = toObject(error);
        //     reject(error);
        //   }
        // });


        this.request(url, method, form, { "Content-Type": false }).then((res) => {
          resolve(res);
        }).catch((error) => {
          reject(error);
        });
      } catch (error) {

        console.error(error.message);
        reject(error);
      }
    });
  }

  public async deleteCertificate(id: string) {
    return this.request(`${this.endPoint}/certificado/${id}`, "delete");
  }


  // Nf

  public async emitNote(type: ENFeType, data: any[]) {
    return this.request(`${this.endPoint}/${type.toString().toLowerCase()}`, "post", data);
  }

  public async preview(type: ENFeType, data: any) {
    return this.request(`${this.endPoint}/${type.toString().toLowerCase()}/preview`, "post", data);
  }

  public async getNoteResume(type: ENFeType, id: string, cnpj?: string) {

    const base = `${this.endPoint}/${type.toString().toLowerCase()}`;

    const urlMap = {
      NFE: cnpj ? `${base}/${cnpj}/${id}/resumo` : `${base}/${id}/resumo`,
      NFCE: cnpj ? `${base}/${cnpj}/${id}/resumo` : `${base}/${id}/resumo`,
      NFSE: cnpj ? `${base}/consultar/${id}/${cnpj}` : `${base}/consultar/${id}`
    };

    const url = urlMap[type.toString().toUpperCase()];

    return this.request(url, "get");
  }

  public async getNoteCancelStatus(type: ENFeType, id: string) {
    return this.request(`${this.endPoint}/${type.toString().toLowerCase()}/${id}/cancelamento/status`, "get");
  }

  public async getNoteAdjustStatus(type: ENFeType, id: string) {
    return this.request(`${this.endPoint}/${type.toString().toLowerCase()}/${id}/cce/status`, "get");
  }

  public async cancelNote(type: ENFeType, id: string, justify: string) {
    const url = `${this.endPoint}/${type.toString().toLowerCase()}` + (type != "NFSE" ? `/${id}/cancelamento` : `/cancelar/${id}`);
    return this.request(url, "post", { justificativa: justify });
  }

  public async adjustNfe(id: string, adjust: string) {
    return this.request(`${this.endPoint}/nfe/${id}/cce`, "post", { correcao: adjust });
  }

  public async inutulizationNote(data) {
    return this.request(`${this.endPoint}/nfe/inutilizacao`, "post", data);
  }

  public async inutulizationNoteStatus(protocol) {
    return this.request(`${this.endPoint}/nfe/inutilizacao/${protocol}/status`, "get");
  }

  public async sendNfEmail(type: ENFeType, id: string, data: { reenvio: boolean, destinatarios: string[] }) {
    return this.request(`${this.endPoint}/${type.toString().toLowerCase()}/${id}/email`, "post", data);
  }

  public async downloadXmlCancel(id: string) {
    const url = `${this.endPoint}/nfe/${id}/cancelamento/xml`;
    this.request(url, "get", {}, {}, "blob");
  }

  public async downloadAdjustNote(type: ENFeImpresionFileType, id: string) {
    const url = `${this.endPoint}/nfe/${id}/cce/${type.toString().toLowerCase()}`;
    return this.request(url, "get", {}, {}, "blob");
  }

  public async downloadNote(type: ENFeType, format: ENFeImpresionFileType, id: string) {
    const url = type === "NFSE" ? `${this.endPoint}/${type.toString().toLowerCase()}/${format.toString().toLowerCase()}/${id}` : `${this.endPoint}/${type.toString().toLowerCase()}/${id}/${format.toString().toLowerCase()}`;
    return this.request(url, "get", {}, {}, "blob");
  }

  public async downloadPreview(protocol: string) {
    const url = `${this.endPoint}/nfe/${protocol}/preview`;
    return this.request(url, "get", {}, {}, "blob");
  }

  public async getNotes(cpfCnpj: string, type: ENFeType, startDate?: string, endDate?: string, idNextPage?: string) {
    return new Promise<IFiscalSettings>(async (resolve, reject) => {
      try {

        const data = { cpfCnpj: cpfCnpj };

        if (startDate) { data["dataInicial"] = startDate; }
        if (endDate) { data["dataFinal"] = endDate; }
        if (idNextPage) { data["hashProximaPagina"] = idNextPage; }

        const params = new URLSearchParams(data);
        const queryPath = type.toString().toUpperCase() === ENFeType.NFSE ? "consultar" : "consulta";

        this.request(`${this.endPoint}/${type.toString().toLowerCase()}/${queryPath}/periodo?${params}`, "get", data).then((res) => {
          resolve(res);
        }).catch((error) => {
          reject(error);
        });
      } catch (error) {

        console.error(error.message);
        reject(error);
      }
    });
  }

  public async getNotesAgainstCPFCNPJ(cpfCnpj: string, manifested: boolean = false, startDate?: string, endDate?: string, idNextPage?: string) {
    return new Promise<IFiscalSettings>(async (resolve, reject) => {
      try {

        const data = { cpfCnpj: cpfCnpj };

        if (startDate) { data["dataInicial "] = startDate; }
        if (endDate) { data["dataFinal "] = endDate; }
        if (idNextPage) { data["hashProximaPagina "] = idNextPage; }
        if (manifested) { data["manifestada "] = manifested; }

        const params = new URLSearchParams(data);

        this.request(`${this.endPoint}/empresa/${cpfCnpj}/logotipo`, "get", data).then((res) => {
          resolve(res);
        }).catch((error) => {
          reject(error);
        });
      } catch (error) {

        console.error(error.message);
        reject(error);
      }
    });
  }


  // Reports

  public async getNfeReport(cnpj: string = null, from?: string, to?: string) {
    const url = cnpj ? `${this.endPoint}/nfe/${cnpj}/relatorio` : `${this.endPoint}/nfe/relatorio`;
    const data = {};
    if (from) { data["from"] = from; }
    if (to) { data["to"] = to; }
    return this.request(url, "get");
  }

  public async getNfseReport(cnpj: string = null, from?: string, to?: string) {
    const url = cnpj ? `${this.endPoint}/nfse/${cnpj}/relatorio` : `${this.endPoint}/nfe/relatorio`;
    const data = {};
    if (from) { data["from"] = from; }
    if (to) { data["to"] = to; }
    return this.request(url, "get");
  }

  public async getNotesReportResume(year: string, month: string) {
    return this.request(`${this.endPoint}/relatorio/${year}/${month}`, "get");
  }
}
