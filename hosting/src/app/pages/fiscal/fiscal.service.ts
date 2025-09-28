import { Injectable } from "@angular/core";
import { EventEmitter } from 'events';
import { iTools } from '../../../assets/tools/iTools';

// Translate
import { FiscalTranslate } from "./fiscal.translate";

// Services
import { IToolsService } from '@shared/services/iTools.service';
import { CashierFrontPDVService } from '../cashier/cashier-front/components/cashier-pdv/cashier-pdv.service';
import { NotificationService } from '@shared/services/notification.service';
import { SystemLogsService } from '@shared/services/system-logs.service';
import { AlertService } from "@shared/services/alert.service";

// Interfaces
import { IBatch } from '@itools/interfaces/IBatch';
import { ICollection } from '@itools/interfaces/ICollection';
import { IFiscalSettings, INfceSettings, INfeSettings, INfseSettings } from "@shared/interfaces/IFiscal";
import { ESystemLogAction, ESystemLogType } from "@shared/interfaces/ISystemLog";
import { ENotificationStatus } from "@shared/interfaces/ISystemNotification";

// Types
import { query } from '@shared/types/query';

// Utilities
import { $$ } from '@shared/utilities/essential';
import { Utilities } from '@shared/utilities/utilities';
import { DateTime } from '@shared/utilities/dateTime';
import { ENFeImpresionFileType, ENFeType } from "@shared/enum/EFiscal";
import { PlugNotasApiService } from "@shared/utilities/plugNotas";
import { SettingsService } from "@pages/settings/settings.service";
import { environment } from "src/environments/environment.prod";

@Injectable({ providedIn: 'root' })
export class FiscalService {

  public translate = FiscalTranslate.get();

  private notesData: { [_id: string]: INfeSettings | INfceSettings | INfseSettings } = {};

  private storeSettings: any = {};

  private inutilizationNotes: any = [];

  private _checkRequest: boolean = false;
  private _checkProcess: boolean = false;
  private _dataMonitors: EventEmitter = new EventEmitter();

  private _checkSettingsData: boolean = false;

  private _reemissionCount: number = 0;

  // private notesApi: PlugNotasApi;

  private firstScrolling = false;
  private settings: any = { start: 0, limit: 60, count: 0, snapshotRef: null };

  private get cnpj(): string {
    return Utilities.cnpjFiscal;
  }

  constructor(
    private notificationService: NotificationService,
    private systemLogsService: SystemLogsService,
    private iToolsService: IToolsService,
    private settingsService: SettingsService,
    private notesApi: PlugNotasApiService,
    private cashierFrontPDVService: CashierFrontPDVService,
    private alertService: AlertService
  ) {

    this.getSystemSettings();
  }

  private getSystemSettings() {

    this.notesApi.ready("FiscalService", () => {
      this.query();

      // 24.085.211/0001-32
      // 24085211000132
    });

  }

  // Getter and Setter Methods

  public get limit() {
    return this.settings.limit;
  }

  // Query Methods

  public query(where?: query['where'], reset: boolean = true, flex: boolean = false, scrolling: boolean = false, strict: boolean = true) {

    return (new Promise<any>((resolve) => {

      const queryObject: query = {
        start: (this.settings.start * this.settings.limit),
        limit: this.settings.limit
      };

      if (where) {

        if (strict && !scrolling) {
          this.storeSettings = {};
          this.notesData = {};
          this.settings.start = 0;
          queryObject.start = 0
        } else if (!scrolling) {
          queryObject.start = 0;
        }

        if (!flex) {
          queryObject.where = where;
        } else {
          queryObject.or = where;
        }

      }

      if (reset) {
        this.storeSettings = {};
        this.notesData = {};
        this.firstScrolling = false;
        this.settings.start = queryObject.start = 0;
      }

      if (!reset && !this.firstScrolling) {
        this.settings.start = 1;
        this.firstScrolling = true;
        queryObject.start = (this.settings.start * this.settings.limit);
      }

      this.requestData(queryObject, strict).then((data) => {
        if (!reset) { this.settings.start++; }
        resolve(data);
      });
    }));
  }

  // CRUD Methods - Service Orders

  public getNotes(listenerId: string, listener: (_: any) => void) {

    const emitterId = 'records';

    Utilities.onEmitterListener(this._dataMonitors, emitterId, listenerId, listener);

    if (this._checkRequest) {
      this._dataMonitors.emit(emitterId, this.treatData(emitterId));
    }
  }


  public getCertificates(id?: string) {
    return new Promise<any>((resolve, reject) => {
      this.notesApi.getCertificates(id).then((res) => {
        resolve(res);
      }).catch((error) => {
        reject(error);
      });
    });
  }

  public getStoreSettings(listenerId: string, listener: (_: any) => void) {

    const emitterId = 'store-settings';

    Utilities.onEmitterListener(this._dataMonitors, emitterId, listenerId, listener);

    if (this._checkRequest) {
      this._dataMonitors.emit(emitterId, this.treatData(emitterId));
    }
  }

  public getInutilizatonNotes(listenerId: string, listener: (_: any) => void) {

    const emitterId = 'inutilization-notes';

    Utilities.onEmitterListener(this._dataMonitors, emitterId, listenerId, listener);

    if (this._checkRequest) {
      this._dataMonitors.emit(emitterId, this.treatData(emitterId));
    }
  }

  public getLogotipo() {
    return this.notesApi.getStoreImage(this.cnpj);
  }


  public getTributesFromXml(xmlString, docInfo = null, nfResume = null, nfInfo: any = null, callback = () => { }) {

    // let taxes = {};

    if (xmlString) {

      xmlString.toString();

      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");

        const containerTotal = xmlDoc.getElementsByTagName("nfeProc").item(0).getElementsByTagName("NFe").item(0).getElementsByTagName("infNFe").item(0).getElementsByTagName("total").item(0).getElementsByTagName("ICMSTot").item(0);
        const containerTotalISSQN = xmlDoc.getElementsByTagName("nfeProc").item(0).getElementsByTagName("NFe").item(0).getElementsByTagName("infNFe").item(0).getElementsByTagName("total").item(0).getElementsByTagName("ISSQNtot").item(0);

        // const containerProducts = xmlDoc.querySelectorAll("NFe infNFe det") || [];


        const taxes: any = {
          icms: containerTotal.getElementsByTagName("vICMS").item(0) ? parseFloat(containerTotal.getElementsByTagName("vICMS").item(0).textContent) : 0,
          icmsDeson: containerTotal.getElementsByTagName("vICMSDeson").item(0) ? parseFloat(containerTotal.getElementsByTagName("vICMSDeson").item(0).textContent) : 0,
          st: containerTotal.getElementsByTagName("vST").item(0) ? parseFloat(containerTotal.getElementsByTagName("vST").item(0).textContent) : 0,
          ii: containerTotal.getElementsByTagName("vII").item(0) ? parseFloat(containerTotal.getElementsByTagName("vII").item(0).textContent) : 0,
          ipi: containerTotal.getElementsByTagName("vIPI").item(0) ? parseFloat(containerTotal.getElementsByTagName("vIPI").item(0).textContent) : 0,
          ipidevol: containerTotal.getElementsByTagName("vIPIDevol").item(0) ? parseFloat(containerTotal.getElementsByTagName("vIPIDevol").item(0).textContent) : 0,
          pis: containerTotal.getElementsByTagName("vPIS").item(0) ? parseFloat(containerTotal.getElementsByTagName("vPIS").item(0).textContent) : 0,
          cofins: containerTotal.getElementsByTagName("vCOFINS").item(0) ? parseFloat(containerTotal.getElementsByTagName("vCOFINS").item(0).textContent) : 0,
          fcp: containerTotal.getElementsByTagName("vFCP").item(0) ? parseFloat(containerTotal.getElementsByTagName("vFCP").item(0).textContent) : 0,
          fcpst: containerTotal.getElementsByTagName("vFCPST").item(0) ? parseFloat(containerTotal.getElementsByTagName("vFCPST").item(0).textContent) : 0,
          fcpstret: containerTotal.getElementsByTagName("vFCPSTRet").item(0) ? parseFloat(containerTotal.getElementsByTagName("vFCPSTRet").item(0).textContent) : 0,
          total: containerTotal.getElementsByTagName("vTotTrib").item(0) ? parseFloat(containerTotal.getElementsByTagName("vTotTrib").item(0).textContent) : 0,
        };

        if (containerTotalISSQN) {
          taxes.iss = containerTotalISSQN.getElementsByTagName("vISS").item(0) ? parseFloat(containerTotalISSQN.getElementsByTagName("vISS").item(0).textContent) : 0;
        }

        // containerProducts.forEach(det=>{
        //   const tax = det.querySelector("imposto");
        //   const totalTax = parseFloat(tax.querySelector('vTotTrib')?.textContent || "0");
        // });

        if (docInfo) {
          docInfo.taxes = docInfo.taxes || {};

          for (let index in taxes) {
            docInfo.taxes[index] = docInfo.taxes[index] ? docInfo.taxes[index] + taxes[index] : taxes[index];
          }

          if (nfResume) {
            nfResume.taxes = docInfo.taxes;
          }

          if (nfInfo) {
            nfInfo.nf.taxes = docInfo.taxes;
          }

          callback();
          return docInfo.taxes;
        } else {
          callback();
          return taxes;
        }
      } catch (error) {
        console.log("error: ", error);
        callback();
        return {};
      }

      // status = true;
      // callback();

      // return {};
    } else {
      return {};
    }
  }

  // notaReferenciada
  public emitNote(type: ENFeType, data: any, docInfo?: { code: string, owner?: string, taxes?: any, source: any, conjugated: boolean }, wait: boolean = true, loading: boolean = true) {
    return new Promise<any>((resolve, reject) => {

      if (loading) {
        Utilities.loading(true);
      }


      // this.notesApi.preview(type, data).then((res)=>{
      //   console.log(res);
      // })
      // return;

      this.notesApi.emitNote(type, [data]).then(async (res) => {

        this._reemissionCount = 0;

        const isProduction = !!(this.storeSettings[type.toLowerCase()]?.config?.producao);

        const batch = this.iToolsService.database().batch();

        const formatedType = type != "NFSE" ? "nf" : "nfse";

        const nfInfo: any = {
          nf: {
            idIntegracao: {},
            id: {},
            type: {},
            status: {},
            emitente: res.documents[0].Emitente,
            conjugated: docInfo ? !!docInfo.conjugated : false
          }
        };

        nfInfo.nf.type[formatedType] = type;
        nfInfo.nf.id[formatedType] = res.documents[0].id;
        nfInfo.nf.idIntegracao[formatedType] = res.documents[0].idIntegracao;

        let nfResume: any = null;
        let status = false;


        const getResumeNf = (callback: (res: any) => {}) => {
          this.getResumeNf(type, nfInfo.nf.id[formatedType]).then((res) => {
            if (res[0]) {
              callback(res)
            } else {
              status = true;
            }
          }).catch((error) => {
            status = true;
          });
        };

        const checkStatus = (nfInfo: any) => {

          getResumeNf(async (res) => {
            if (res[0].status && res[0].status == 'PROCESSANDO' || res[0].situacao && res[0].situacao == 'PROCESSANDO') {
              checkStatus(nfInfo);
            } else {

              nfResume = res[0];
              nfInfo.nf.status[formatedType] = res[0].status;
              nfResume.type = type;

              const key = formatedType == "nf" ? nfResume.chave : nfResume.chaveAcessoNfse;

              const uploadXML = (tributes: any = null) => {

                // console.log(type, ENFeImpresionFileType.XML, "emmit", nfInfo.nf.id[formatedType], key);

                this.uploadXML(type, ENFeImpresionFileType.XML, "emmit", nfInfo.nf.id[formatedType], key).then(async (response: any) => {

                  if (!tributes && formatedType != "nfse") {
                    const xmlString = await (response.blob).text().catch(() => { });
                    tributes = this.getTributesFromXml(xmlString);
                  }

                  batch.update({ collName: "FiscalNotesXML", docName: nfResume.id }, {
                    "idIntegration": nfResume.idIntegracao,
                    "emissionDate": nfResume.emissao,
                    "status": nfResume.status,
                    number: nfResume.numero,
                    serie: nfResume.serie,
                    file: response.file,
                    tributes: tributes || {},
                    protocol: formatedType == "nf" ? nfResume.protocolo : nfResume.protocoloPrefeitura,
                    key: nfResume.chave,
                    registerDate: iTools.FieldValue.date(environment.timezone, "DH"),
                    idPlugNotas: nfResume.id
                  }, { upsert: true });

                  // console.log({
                  //   "idIntegration": nfResume.idIntegracao,
                  //   "emissionDate": nfResume.emissao,
                  //   "status": nfResume.status,
                  //   number: nfResume.numero,
                  //   serie: nfResume.serie,
                  // tributes: tributes || {},
                  //   file: response.file,
                  //   protocol: formatedType == "nf" ? nfResume.protocolo : nfResume.protocoloPrefeitura,
                  //   key: nfResume.chave,
                  //   idPlugNotas: nfResume.id
                  // }, nfResume);

                  await batch.commit().catch();
                  status = true;

                  // }
                }).catch(() => {
                  status = true;
                });
              }

              if (type.toString().toUpperCase() != "NFSE") {

                const downloadXML = () => {
                  this.downloadNote(type, <any>"XML", nfInfo.nf.id[formatedType], true).then(async (res) => {

                    const xmlString = await (res).text().catch(() => { });

                    try {
                      const json = JSON.parse(xmlString);
                      if (json.message) {
                        downloadXML();
                      }
                    } catch (e) {

                      this.getTributesFromXml(xmlString, docInfo, nfResume, nfInfo, () => {
                        uploadXML();
                      });

                    }
                  }).catch((error) => {

                    status = true;
                    console.log("error: ", error);
                  });
                };

                // console.log("docInfo: ", docInfo);

                if (docInfo) {
                  downloadXML();
                } else {
                  uploadXML();
                }
              } else {
                if (docInfo && res[0].situacao && res[0].situacao == 'CONCLUIDO') {
                  nfInfo.nf.taxes = docInfo.taxes;
                  uploadXML(docInfo.taxes);
                } else {
                  uploadXML();
                  nfInfo.nf.taxes = {};
                  status = true;
                }
              }
            }
          });

        };


        this.notificationService.create({
          description: "Aguadando Processamento de Nota Fiscal",
          status: ENotificationStatus.info,
          title: "Emissão de Nota Fiscal",
          duration: 20000
        }, false);


        if (res.documents && docInfo && docInfo.code) {

          nfInfo.code = docInfo.code;

          if (wait) {
            setTimeout(() => {
              checkStatus(nfInfo);
            }, 4000);
          } else {
            status = true;
          }


          const it = setInterval(async () => {
            if (status) {

              clearInterval(it);

              const checkNfFinalStatus = (nfResume) => {
                if (nfResume && nfResume.cStat && nfResume.cStat != 100 || nfResume && nfResume.situacao == "REJEITADO" || nfResume && nfResume.status == "EXCEPTION") {

                  // console.log("nfResume: ",nfResume);

                  this.notificationService.create({
                    description: nfResume.mensagem || nfResume.erro,
                    status: ENotificationStatus.danger,
                    title: "Emissão de Nota Fiscal",
                  }, false);
                } else {

                  this.notifications("register", "success");
                }
              }

              if (isProduction) {
                this.cashierFrontPDVService.registerSale(nfInfo, null, false, batch);
                if (nfResume && nfResume.situacao == "CONCLUIDO" || nfResume && nfResume.status == "CONCLUIDO") {
                  await this.settingCountNf({ id: nfInfo.nf.id[formatedType], code: docInfo && docInfo.code ? docInfo.code : null }, type, batch);
                }

                nfResume.isProduction = true;

                // console.log(Utilities.deepClone(batch.getOperations()));

                batch.commit().then(() => {

                  this.query();
                  if (!loading) {
                    Utilities.loading(false);
                  }
                  resolve(nfResume);
                  checkNfFinalStatus(nfResume);
                }).catch((error) => {

                  if (!loading) {
                    Utilities.loading(false);
                  }
                  reject(error);
                  this.notifications("register", "error");
                });

              } else {

                nfResume.isProduction = false;

                this.query();
                resolve(nfResume);
                checkNfFinalStatus(nfResume);
              }
            }
          }, 0);
        } else {

          if (wait) {
            setTimeout(() => {
              checkStatus(nfInfo);
            }, 4000);
          } else {
            status = true;
          }

          const it = setInterval(() => {
            if (status) {
              clearInterval(it);

              setTimeout(() => {
                this.query();

                if (nfResume) {
                  nfResume.isProduction = false;
                }

                resolve(nfResume);

                const afterCommit = () => {

                  if (nfResume) {
                    if (wait) {
                      if (nfResume && nfResume.cStat && nfResume.cStat != 100 || nfResume && nfResume.situacao == "REJEITADO") {

                        this.notificationService.create({
                          description: nfResume.mensagem,
                          status: ENotificationStatus.danger,
                          title: "Emissão de Nota Fiscal",
                        }, false);
                      } else {

                        this.notifications("register", "success");
                      }
                    } else {

                      this.notifications("register", "success");
                    }
                  } else {
                    this.notificationService.create({
                      description: nfResume.mensagem,
                      status: ENotificationStatus.danger,
                      title: "Emissão de Nota Fiscal",
                    }, false);
                  }

                  this.query();

                  if (!loading) {
                    Utilities.loading(false);
                  }
                }

                batch.commit().then(() => {
                  afterCommit();
                }).catch((error) => {
                  afterCommit();
                });

              }, 500);
            }
          }, 100);

        }

      }).catch((error) => {

        if (!loading) {
          Utilities.loading(false);
        }

        this._reemissionCount = 0;

        const formatFields = () => {
          let res = []

          if (error.error) {
            for (let i in error.error.data.fields) {
              res.push({ field: i, value: error.error.data.fields[i] })
            }
          }

          return res;
        }

        console.log(error);

        const title = error.error ? error.error.message : error.message;

        this.alertService.custom({
          confirmButtonText: "Ok",
          title: title || "Emissão de Nota Fiscal",
          html: formatFields().length > 0 ? `
            <ul class='list-group'>
              ${formatFields().map((item) => { return `<li class="list-group-item">${item.field}: ${item.value}</li>` })}
            </ul>
          ` :
            ``
        });

        reject(error);

        // this.notifications("register", "error");
      });
    });
  }

  public cancelNote(type: ENFeType, id: string, justify: string, waitProcessing: boolean = false, loading = false) {
    return new Promise<any>((resolve, reject) => {

      Utilities.loading(true);
      this.notesApi.cancelNote(type, id, justify).then((res) => {

        console.log(res);

        if (waitProcessing) {

          let count = 0;

          const batch = this.iToolsService.database().batch();

          const formatedType = type != "NFSE" ? "nf" : "nfse";

          const exec = () => {
            count++;
            this.getResumeNf(type, id).then((res) => {
              console.log(res);
              const nfResume = res[0];
              if (res[0].status != "CANCELADO" && count < 60) {
                exec();
              } else if (res[0].status == "CANCELADO") {

                const key = formatedType == "nf" ? nfResume.chave : nfResume.chaveAcessoNfse;

                const uploadXML = () => {
                  this.uploadXML(type, ENFeImpresionFileType.XML, "cancel", id, key).then(async (response: any) => {


                    // "idIntegration": nfResume.idIntegracao,
                    // "emissionDate": nfResume.emissao,
                    // "status": nfResume.status,
                    // number: nfResume.numero,
                    // serie: nfResume.serie,
                    // file: response.file,
                    // protocol: formatedType == "nf" ? nfResume.protocolo : nfResume.protocoloPrefeitura,
                    // key: nfResume.chave,
                    // registerDate: iTools.FieldValue.date(environment.timezone, "DH"),
                    // idPlugNotas: nfResume.id

                    batch.update({ collName: "FiscalNotesXML", docName: nfResume.id }, {
                      "idIntegration": nfResume.idIntegracao,
                      "emissionDate": nfResume.emissao,
                      "status": nfResume.status,
                      number: nfResume.numero,
                      idPlugNotas: nfResume.id,
                      registerDate: iTools.FieldValue.date(environment.timezone, "DH"),
                      serie: nfResume.serie,
                      file: response.file,
                      protocol: formatedType == "nf" ? nfResume.protocolo : nfResume.protocoloPrefeitura,
                      key: key
                    });

                    // const isCashier: any = this.isCashier(nfResume.idIntegracao) || {};

                    // if(isCashier.status && isCashier.saleCode){

                    //   const objNf = {status: {}};
                    //   objNf.status[formatedType] = "CANCELADO";

                    //     batch.update({collName: "CashierSales", where: [{field: 'code', operator: '=', value: isCashier.saleCode}]}, {
                    //       nf: objNf
                    //     });
                    // }

                    // await sale = 

                    await batch.commit().catch();
                    this.query();
                    resolve(res);

                  }).catch(() => {
                    resolve(res);
                  });
                }

                uploadXML();

                // resolve(res)

              } else {

                this.query();
                resolve(res)
              }
            }).catch(error => {
              if (count < 20) { exec(); } else {
                resolve(res);
              }
            });
          };

          exec()


          Utilities.loading(loading);
          this.notifications("register", "success");
        } else {

          this.query();
          resolve(res);
          Utilities.loading(loading);
          this.notifications("register", "success");
        }
      }).catch((error) => {

        console.log(error);

        Utilities.loading(loading);
        reject(error);
        this.notifications("register", "error");
      });
    });
  }

  public adjustNfe(id: string, adjust: string) {
    return new Promise<any>((resolve, reject) => {
      Utilities.loading(true);
      this.notesApi.adjustNfe(id, adjust).then((res) => {

        this.query();
        Utilities.loading(false);
        resolve(res);
        this.notifications("register", "success");
      }).catch((error) => {

        Utilities.loading(false);
        reject(error);
        this.notifications("register", "error");
      });
    });
  }

  public inutulizationNote(data: any) {
    return new Promise<any>((resolve, reject) => {
      Utilities.loading(true);
      this.notesApi.inutulizationNote(data).then((res) => {

        if (res.protocol) {
          this.iToolsService.database().collection("Inutilization").doc().update({
            code: iTools.FieldValue.control('SystemControls', Utilities.storeID, 'Inutilization.code'),
            protocol: res.protocol,
            data: data
          });

        }

        this.query();
        Utilities.loading(false);
        resolve(res);
        this.notifications("register", "success");
      }).catch((error) => {
        console.log(error);

        Utilities.loading(false);
        reject(error);
        this.notifications("register", "error");
      });
    });
  }

  public getResumeNf(type: ENFeType, id: string, cnpj: boolean = false) {
    return new Promise<void>((resolve, reject) => {
      Utilities.loading(true);

      cnpj = <any>(cnpj ? this.cnpj : undefined);

      this.notesApi.getNoteResume(type, id, <any>cnpj).then((res) => {

        res = this.treatData("records", res);

        resolve(res);
        Utilities.loading(false);
        resolve();
      }).catch((error) => {

        Utilities.loading(false);
        reject(error);
      });
    });
  }

  public downloadNote(type: ENFeType, dtype: ENFeImpresionFileType, id: string, getData: boolean = false) {
    return new Promise<any>((resolve, reject) => {
      Utilities.loading(true);

      this.notesApi.downloadNote(type, dtype, id).then((res) => {
        if (getData) {
          Utilities.loading(false);
          resolve(res);
        } else {
          this.downloadBlob(res, type, dtype, id, resolve);
        }
      }).catch((error) => {

        console.log("error: ", error);
        Utilities.loading(false);
        reject(error);
      });
    });
  }

  public downloadAdjuNote(dtype: ENFeImpresionFileType, id: string, getData: boolean = false) {
    return new Promise<any>((resolve, reject) => {
      Utilities.loading(true);

      console.log(dtype, id, getData)

      this.notesApi.downloadAdjustNote(dtype, id).then((res) => {
        console.log(res);
        if (getData) {
          Utilities.loading(false);
          resolve(res);
        } else {
          this.downloadBlob(res, 'NFE', dtype, id, resolve);
        }
      }).catch(() => {

        Utilities.loading(false);
        reject();
      })
    });
  }

  public downloadCancelNoteXml(id: string) {
    return new Promise<void>((resolve, reject) => {
      Utilities.loading(true);
      this.notesApi.downloadXmlCancel(id).then((res) => {
        this.downloadBlob(res, "NFE", "XML", id, resolve);
      }).catch(() => {

        Utilities.loading(false);
        reject();
      });
    });
  }


  public async updateSettings(
    data: IFiscalSettings,
    batch: IBatch = null
  ) {
    return new Promise<any>(async (resolve, reject) => {

      Utilities.loading(true);

      const certificate = (<any>data)._certificate;
      const logotipo = (<any>data)._logotipo;

      if (certificate && certificate.file) {

        await (this.notesApi.uploadCertificate(certificate.file, certificate.senha, certificate.email, certificate.id)).then((res) => {
          if (res.data.id) {
            data.certificado = res.data.id;
            this.settingsService.updateFiscalSettings({ certificate: data.certificado }).catch((e) => { });
          }
        }).catch((error) => {

          console.log(error);

          reject(error);
          this.notifications("register", "error", { error: error?.error?.message });
          Utilities.loading(false);
          throw (error.message);
        });
      }

      if (logotipo) {

        await (this.notesApi.uploadStoreImage(this.cnpj, logotipo)).then((res) => {

          console.log(res);
        }).catch((error) => {

          console.error("logotipo: ", error);

          reject(error);
          this.notifications("register", "error", { error: error?.error?.message });
          Utilities.loading(false);
          throw (error.message);
        });
      }


      // clear temporary objects;

      delete (<any>data)._certificate;
      delete (<any>data)._logotipo;

      // console.log(data);

      this.notesApi.setStore(data).then((res) => {

        // console.log("res: ",res);

        this.getSystemSettings();
        Utilities.loading(false);
        this.query();
        this.notifications("register", "success");
        resolve(res);
      }).catch((error) => {

        console.error("Save Settings: ", error);

        this.query();
        Utilities.loading(false);
        this.notifications("register", "error", { error: error?.error?.message });
        reject(error);
      });

    });
  }


  // Count Methods


  private async uploadXML(type: ENFeType, dtype: ENFeImpresionFileType, mode: "emmit" | "import" | "cancel", id: string, key: string) {
    return new Promise((resolve, reject) => {

      const exec = () => {

        this.downloadNote(type, dtype, id, true).then((data) => {
          try {
            if (data.type == "application/json") {
              exec();
            } else {
              throw new Error("OK");
            }
          } catch (e) {

            console.log(data);

            const reader = new FileReader();
            reader.onload = () => {

              const path = `FiscalNotesXML/${mode == 'emmit' ? "emitted" : (mode == 'cancel') ? 'canceled' : "imported"}/${type.toLowerCase()}/${key}.xml`;

              this.iToolsService.storage().path(path).upload((<ArrayBuffer>reader.result)).then((response) => {
                response.file = path;
                response.blob = data;
                resolve(response);
              }).catch((error) => {
                reject(error);
              });
            };

            reader.readAsArrayBuffer(data);
          }

        }).catch((error) => {
          reject(error);
        });
      };

      exec();

    });

  }

  private downloadBlob(blob, type, dtype, id, resolve) {

    const data = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = data;
    link.target = "_blank";

    if (dtype == "XML") {
      link.download = `${type}-${id}.${dtype.toString().toLowerCase()}`;
    }

    link.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      })
    );

    setTimeout(() => {
      setTimeout((data) => {
        window.URL.revokeObjectURL(data);
      }, 120000, data);
      link.remove();
      Utilities.loading(false);
      resolve(null);
    }, 100);
  }

  public getNotesCount(listenerId: string, listener: ((_: any) => void)) {

    const emitterId = 'count';

    Utilities.onEmitterListener(this._dataMonitors, emitterId, listenerId, listener);

    if (this._dataMonitors) {
      this._dataMonitors.emit(emitterId, this.treatData(emitterId));
    }
  }

  private notifications(action: string, result: string, message: any = {}, storage: boolean = false, duration = 10000) {

    const settings: any = {
      title: this.translate.pageTitle,
      duration: duration || 10000
    };

    message = message ?? {};

    if (result == 'success') {

      if (action == 'register') {
        settings.description = this.translate.notification.register;
      }

      if (action == 'update') {
        settings.description = this.translate.notification.update;
      }

      if (action == 'delete') {
        settings.description = this.translate.notification.delete;
      }

      settings.status = ENotificationStatus.success;
    }

    if (result == 'error') {
      settings.description = message.error ?? this.translate.notification.error;
      settings.status = ENotificationStatus.danger;
    }

    this.notificationService.create(settings, storage);
  }

  private systemLogs(data: any[], batch: IBatch) {

    this.systemLogsService.registerLogs({
      data: data,
      registerDate: DateTime.getDate("DH"),
      owner: Utilities.storeID,
      operator: Utilities.operator,
    }, batch);
  }

  private async settingCountNf(data: any, nfType: string, batch: IBatch) {

    const updateObj = {};

    updateObj[DateTime.getCurrentYear() - 1] = iTools.FieldValue.unset();
    updateObj[DateTime.getCurrentYear()] = {};
    updateObj[DateTime.getCurrentYear()][DateTime.getCurrentMonth()] = { emissions: { default: {}, exceeded: {} } };

    updateObj[DateTime.getCurrentYear()][DateTime.getCurrentMonth()].emissions['default'][nfType] = {};
    updateObj[DateTime.getCurrentYear()][DateTime.getCurrentMonth()].emissions['default'][nfType] = iTools.FieldValue.inc(1);

    // {collName: "Emissions", where: [{field: "_id", operator: "=", value: Utilities.storeID}] }

    batch.update(this.iToolsService.database().collection("Emissions").doc(Utilities.storeID), updateObj, { upsert: true });

    const log = [{
      referenceCode: data.code,
      type: ESystemLogType.Fiscal,
      action: ESystemLogAction.REGISTER,
      note: ""
    }];

    this.systemLogs(log, batch);
  }

  // Data processing

  public removeListeners(emitterId: ("records" | "count" | "store-settings" | "inutilization-notes"), listernId: string | string[] = "") {
    Utilities.offEmitterListener(this._dataMonitors, emitterId, listernId);
  }

  private requestData(settings: any = {}, strict: boolean) {
    return new Promise<any | void>(async (resolve, reject) => {

      if (!this._checkProcess) {

        this._checkProcess = true;

        // console.log("1");

        // this.cnpj = "";

        // let cnpj = this.cnpj.toString().substring(0, this.cnpj.toString().length - 2) + "2";
        // cnpj[0] = "9";

        // console.log(cnpj);

        const queryObj: { period: { dataInicial?: string, dataFinal?: string, hashProximaPagina?: string }, type: ENFeType } = (() => {

          settings.where = settings.where || [];
          let type = ENFeType.NFE;
          const period: any = {};

          console.log(settings.where);

          settings.where.forEach(item => {
            switch (item.field.toString().toLowerCase()) {
              case "type": type = item.value.toUpperCase(); break;
              case "datainicial": period.dataInicial = item.value; break;
              case "datafinal": period.dataFinal = item.value; break;
              case "hashproximapagina": period.hashProximaPagina = item.value; break;
            }
          });

          // console.log(period);

          return { period: period, type: type };
        })();

        // await this.notesApi.getStoreImage(this.cnpj).then((res)=>{
        //   // console.log(res);
        // }).catch((error)=>{
        //   // console.log(error);
        // });

        await this.notesApi.getStore(this.cnpj).then((res) => {
          this.storeSettings = res;

          // console.log(res);

          this._dataMonitors.emit("store-settings", this.treatData("store-settings", res));
        }).catch((error) => {
          this._dataMonitors.emit("store-settings", {});
        });

        await this.notesApi.getNotes(this.cnpj, queryObj.type, queryObj.period.dataInicial, queryObj.period.dataFinal, queryObj.period.hashProximaPagina).then((res: any) => {
          this.notesData = res.notas;
          this.settings.start = res.hashProximaPagina;
          this._dataMonitors.emit("records", this.treatData("records", res.notas));
        }).catch((error) => {
          // console.log("error: ", error);
          this._dataMonitors.emit("records", {});
        })


        this.iToolsService.database().collection("Inutilization").orderBy({ code: -1 }).limit(30).get().then((res) => {

          let count = res.docs.length;
          this.inutilizationNotes = [];


          res.docs.forEach(async (doc) => {

            const data = doc.data();
            this.inutilizationNotes.push(data);
            const index = this.inutilizationNotes.length - 1;

            await this.notesApi.inutulizationNoteStatus(data.protocol).then((res) => {
              this.inutilizationNotes[index].query = res;
              count--;
            });

          });

          const timer = setInterval(() => {
            if (count == 0) {
              clearInterval(timer);
              // this.inutilizationNotes.sort((a, b) => {
              //   return ((a.code < b.code) ? -1 : ((a.code > b.code) ? 1 : 0));
              // });
              this._dataMonitors.emit('inutilization-notes', this.inutilizationNotes);
            }
          }, 0)


        });

        // this.collRef(settings).count().get().then((res) => {
        //   this.settings.count = (res.docs.length > 0 ? res.docs[0].data().count : 0);
        //   this._dataMonitors.emit('count', this.treatData('count'));
        // });

        this._checkRequest = true;
        this._checkSettingsData = true;
        this._checkProcess = false;

        resolve(this.treatData('records', Object.values(this.notesData)));
      }

    });
  }

  private isCashier(idIntegracao: string, situacao: string = null) {

    const parts = idIntegracao.split("_")[idIntegracao.split("_").length == 1 ? 0 : 1].split("-");

    // const type = situacao != undefined ?  "NFSE" : parts[1];

    if (parts.length == 5 && parts[0] == "CASHIER") {
      return {
        status: true,
        saleCode: parseInt(parts[2]),
        saleId: parseInt(parts[3])
      }
    } else {
      return {
        status: false
      }
    }
  }

  private treatData(id: string, data?: any[]) {

    if (id == 'count') {

      const result: any = {
        current: $$(data || this.notesData).length, total: this.settings.count
      };

      return result;
    }

    if (id == 'records') {

      let records = [];

      $$(Utilities.deepClone(data || this.notesData)).map((_: any, item: any) => {

        const parts = item.idIntegracao.split("_")[item.idIntegracao.split("_").length == 1 ? 0 : 1].split("-");

        item.type = item.situacao != undefined ? "NFSE" : parts[1];

        if (parts.length == 5 && parts[0] == "CASHIER") {
          item.saleCode = parts[2];
          item.saleId = parts[3];
        }

        if (item.type == "NFSE") {
          item.status = item.situacao;

          if (item.padrao == "NACIONAL") {
            item.messagem = item.retorno.situacao;
          }
        }

        records.push(item);
      });

      JSON.stringify(records);

      // console.log(records);

      // records.sort((a, b) => {
      //   return ((a.serviceStatus <= b.serviceStatus && a.code < b.code) ? 1 : ((a.serviceStatus >= b.serviceStatus && a.code > b.code) ? -1 : 0));
      // });

      return records;
    }

    if (id == 'store-settings') {

      let records = data || this.storeSettings;

      // records.sort((a, b) => {
      //   return ((a.serviceStatus <= b.serviceStatus && a.code < b.code) ? 1 : ((a.serviceStatus >= b.serviceStatus && a.code > b.code) ? -1 : 0));
      // });

      return records;
    }
  }

}


// const onj = {"nf":{"Emitente":"24085211000132","id":"63dc677291f57d6b06bdd20b","idIntegracao":"CASHIER-NFCE-0041-63dc674db5965be02eb20797","status":"CONCLUIDO","type":"NFCE","taxes": {"icms":0, "icmsst": 0,"pis":0,"cofins":0,"iss":0,"issqn":0, "ii": 0, "total": 0}}}