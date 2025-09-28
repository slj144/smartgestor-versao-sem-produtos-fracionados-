/**
 * Arquivo: auth.service.ts
 * Localização: src/app/@auth/auth.service.ts
 * 
 * Descrição: Serviço de autenticação principal do sistema
 * - Gerencia login e logout de usuários
 * - Controla sessões e permissões
 * - Sincroniza configurações do projeto
 * - Valida credenciais no banco de dados
 * - Mantém dados de autenticação no localStorage
 * - Integra com sistema de recuperação de senha
 */

import { Injectable } from '@angular/core';
import { iTools } from '../../assets/tools/iTools';
import * as cryptojs from "crypto-js";

// Services
import { IToolsService } from '@shared/services/iTools.service';
import { PermissionsService } from '../pages/registers/collaborators/components/modal/components/others/profiles/components/layer/components/permissions/permissions.service';

// Utilities
import { DateTime } from '@shared/utilities/dateTime';

// Settings
import { ProjectSettings } from '@assets/settings/company-settings';
import { environment } from '../../environments/environment.prod';
import { Utilities } from '@shared/utilities/utilities';
import { IRegistersCollaborator } from '@shared/interfaces/IRegistersCollaborator';

@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(
    private iToolsService: IToolsService,
    private permissionsService: PermissionsService,
  ) {
    this.checkLogout();
  }

  public isLogged(): boolean {

    if (!Utilities.windowID) {
      AuthService.clearAuthData();
      return false;
    }

    const currentLogin = Utilities.currentLoginData;

    if (!currentLogin) {
      return false;
    }

    if (currentLogin.storeId == "0" || currentLogin.storeId == "undfined" || !currentLogin.storeId) {
      AuthService.clearAuthData();
      return false;
    }

    if (
      currentLogin.usertype && currentLogin.email && currentLogin.username &&
      currentLogin.isLogged && !currentLogin.firstName && !currentLogin.lastName &&
      window.localStorage.getItem("itoolsAuthenticate")
    ) {
      return true;
    } else {
      AuthService.clearAuthData();
      return false;
    }
  }

  public async requestPassword(username: string, isLogged: boolean = false) {

    return new Promise<any>(async (resolve, reject) => {

      await this.iToolsService.database().collection("RegistersCollaborators").where([{
        field: "username", operator: "=", value: username
      }]).get().then(async (data) => {
        if (data.docs.length) {

          const user: IRegistersCollaborator = data.docs[0].data();
          const storeId = user.owner;
          const isAdmin = user.usertype == "admin";
          const store = (await this.iToolsService.database().collection("Stores").doc(storeId).get())?.data();
          const email = user.isSendEmailToStore ? store.contacts.email : user.email;

          this.iToolsService.auth().recoverPassword(data.docs[0].data().email, email, (window.localStorage.getItem('Language') ?? ProjectSettings.companySettings().language)).then(() => {
            resolve({ email: email });
          }).catch((error) => {
            console.log(error);
            reject(1);
          });
        } else {
          reject(0);
        }
      }).catch((err) => {
        console.log(err);
      });
    });
  }

  public async login(username: string, password: string): Promise<{ status: boolean, code?: number }> {

    return new Promise<any | void>(async (resolve, reject) => {

      username = username.trim();
      password = password != null ? password.toString().trim() : '';
      let matrixData = null;
      let allUserPermissions = null;
      let projectInfo = null;

      await this.iToolsService.database().collection("Stores").doc("matrix").get().then((matrixSnapshot) => {

        matrixData = matrixSnapshot.data();
      }).catch((error) => {

        console.log(error);

        reject({
          code: -1,
          status: false
        });
        return;
      });

      if (!matrixData || !matrixData.isPaid) {

        reject({
          code: matrixData && !matrixData.isPaid ? 401 : -2,
          status: false,
          noPaid: true
        });
        return;
      }


      /// get Project Settings

      await this.iToolsService.functions().call("getProjectSettings").then((res) => {



        if (res.status) {
          projectInfo = {
            companyName: res.data.data.companyName,
            projectId: res.data.data._id,
            country: res.data.data.country || "BR",
            currency: res.data.data.currency || 'BRL',
            language: res.data.data.language || "pt_BR",
            timezone: res.data.data.timezone || "America/Sao_Paulo",
            profile: res.data.data.profile
          };

          // console.log(res);
        } else {
          reject({
            code: 400,
            status: false
          });
          return;
        }
      }).catch((error) => {

        console.log(error);


        reject({
          code: -400,
          status: false
        });
        return;
      });


      const exec = async () => {

        const authInfo = await this.iToolsService.database().collection("#SYSTEM_AUTHENTICATE#").count().get();
        let isConfguredAuthenticate = false;
        let isFail = false;


        if (!authInfo.docs.length || authInfo.docs.length && !authInfo.docs[0].data()) {
          await this.iToolsService.database().collection("RegistersCollaborators").get().then(async (res) => {

            const authData = {};
            const batch = this.iToolsService.database().batch();

            res.docs.forEach((doc) => {

              const data = doc.data();
              authData[data.email] = {
                email: data.email,
                password: cryptojs.SHA256("21211212").toString()
              }
            });

            authData["iparttsdefault@gmail.com"] = {
              email: "iparttsdefault@gmail.com",
              password: cryptojs.SHA256(environment.loginSettings.password).toString()
            };

            Object.values(authData).forEach((data) => {

              batch.update({ collName: "#SYSTEM_AUTHENTICATE#", where: [] }, data);
            });

            await batch.commit();

            const masterDriver = new iTools();

            masterDriver.initializeApp({
              projectId: "projects-manager"
            }).then(() => {

              masterDriver.database().collection("Projects").doc(ProjectSettings.companyID()).update({
                database: {
                  isLocked: true
                }
              }).then(() => {

                isConfguredAuthenticate = true;
              }).catch((error) => {

                isConfguredAuthenticate = true;
                isFail = true;
                console.log(error);
              });
            }).catch((error) => {

              isConfguredAuthenticate = true;
              isFail = true;
              console.log(error);
            });
          }).catch((error) => {

            reject({
              code: -1,
              status: false,
              message: error.message
            });

            isConfguredAuthenticate = true;
            isFail = true;
            return;
          });
        } else {

          isConfguredAuthenticate = true;
        }

        const timer = setInterval(async () => {
          if (isConfguredAuthenticate) {

            clearInterval(timer);

            if (isFail) {

              reject({
                code: -2,
                status: false
              });
              return;
            }

            await this.iToolsService.database().collection("RegistersCollaborators").where([{
              field: "username", operator: "=", value: username
            }]).get().then((data) => {

              if (data.docs.length) {
                const user = data.docs[0].data();

                if (!user.allowAccess) {

                  reject({
                    code: 400,
                    status: false
                  });
                  return;
                }

                this.iToolsService.database().collection("Stores").where([{
                  field: "_id", operator: "=", value: user.owner
                }]).get().then((data) => {
                  if (data.docs.length) {

                    const store = data.docs[0].data();


                    const info = {
                      status: true,
                      data: { ...user },
                      store: store,
                      usertype: user.usertype,
                      storeType: store._id == "matrix" ? "matrix" : "branch"
                    };

                    const exec = (info: any, profile: any = null, projectInfo: any = null) => {

                      this.iToolsService.auth().login(user.email.toLowerCase(), password).then((res) => {

                        const loginData = {
                          userId: info.data._id,
                          email: info.data.email,
                          username: info.data.username,
                          usercode: info.data.code,
                          usertype: info.data.usertype,
                          name: info.data.name,
                          allPermissions: allUserPermissions,
                          permissions: profile ? profile.permissions : null,
                          storeId: info.store._id,
                          storeInfo: { name: info.store.name, billingName: info.store.billingName, address: info.store.address, cnpj: info.store.cnpj, image: info.store.image, contacts: info.store.contacts },
                          storeType: info.storeType,
                          isLogged: true,
                          expireDate: "noexpire",
                          projectId: window.location.pathname.split("/")[1],
                          projectInfo: projectInfo
                        };

                        const allSessions = window.localStorage.getItem("logins") ? JSON.parse(window.localStorage.getItem("logins")) : {};

                        allSessions[loginData.userId] = loginData;

                        window.localStorage.setItem("logins", JSON.stringify(allSessions));

                        // Sincronizar configurações do projeto com o banco
                        if (projectInfo && projectInfo.profile) {
                          console.log('🔄 Sincronizando configurações do projeto...');

                          // Se tem CRM em profile.data, copiar para profile (compatibilidade)
                          if (projectInfo.profile.data?.crm !== undefined) {
                            projectInfo.profile.crm = projectInfo.profile.data.crm;
                            console.log('✅ CRM sincronizado de profile.data.crm');
                          }

                          // Salvar novamente com dados sincronizados
                          const logins = localStorage.getItem("logins") ? JSON.parse(localStorage.getItem("logins")) : {};
                          if (logins[loginData.userId]) {
                            logins[loginData.userId].projectInfo = projectInfo;
                            localStorage.setItem("logins", JSON.stringify(logins));
                            console.log('✅ Configurações sincronizadas e salvas!');
                          }
                        }

                        (<any>window).id = info.data._id;

                        localStorage.setItem("reloadWindowID", (<any>window).id);

                        resolve(null);

                        setTimeout(() => {
                          window.location.reload();
                        }, 500);
                      }).catch(async (error) => {

                        this.iToolsService.auth().login(environment.loginSettings.email, environment.loginSettings.password).then(() => {

                          reject({ code: 300 });
                        }).catch((error) => {

                          console.log(error);
                          reject({ code: 300 });
                        });
                      });
                    };


                    if (user.permissions) {

                      this.iToolsService.database().collection("RegistersCollaboratorProfiles").where([
                        { field: "owner", operator: "=", value: "matrix" },
                        { field: "code", operator: "=", value: parseInt(user.permissions) }
                      ]).get().then((data) => {

                        if (data.docs.length) {

                          exec(info, data.docs[0].data(), projectInfo);
                        } else {

                          reject({ code: 4, status: false });
                        }
                      }).catch(() => {

                        reject({ code: 3, status: false });
                      });
                    } else {

                      exec(info, null, projectInfo);
                    }

                  } else {

                    reject({ code: 2, status: false });
                  }
                }).catch(() => {

                  reject({ code: 1, status: false });
                });
              } else {

                reject({ code: 0, status: false });
              }
            });
          }
        }, 100);

      };

      await this.permissionsService.getAllUserPermissions(true, projectInfo).then((data) => {

        if (data) {

          allUserPermissions = data;
          exec();
        } else {

          allUserPermissions = PermissionsService.getDefaultAllUserPermission(true, projectInfo);

          this.iToolsService.database().collection("Settings").doc("permissions").update({ data: allUserPermissions }).then(() => {

            exec();
          }).catch(() => {

            reject({
              code: -1,
              status: false
            });
            return;
          });
        }
      }).catch((error) => {


        reject({
          code: -1,
          status: false
        });
        return;
      });
    });
  }

  public async logout(): Promise<void> {

    return new Promise<void>((resolve, reject) => {

      this.iToolsService.auth().logout().then(() => {
        AuthService.clearAuthData();
        resolve();
      }).catch(() => {
        AuthService.clearAuthData();
        resolve();
      });
    });
  }

  private checkLogout() {

    if (this.isLogged()) {

      const timer = setInterval(() => {

        if (!Object.values(Utilities.currentLoginData).length) {
          clearInterval(timer);
          (<any>window).id = undefined;
          window.location.href = window.location.href;
        }
      }, 0);
    }
  }

  public static clearAuthData() {
    const logins = Utilities.logins ?? {};
    delete logins[Utilities.currentLoginData.userId];
    window.localStorage.setItem("logins", JSON.stringify(logins));
  }


}