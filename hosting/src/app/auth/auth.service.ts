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
import { AuthCredentialSyncService } from '@shared/services/auth-credential-sync.service';
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
    private authCredentialSync: AuthCredentialSyncService,
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
      console.log('🔄 [AuthService] Buscando Project Settings...');

      // 🔥 Criar instância do iTools conectada ao banco "projects-manager"
      const managerInstance = new iTools();
      try {
        await managerInstance.initializeApp({
          projectId: "projects-manager",
          email: environment.loginSettings.email,
          password: environment.loginSettings.password,
          encrypted: false
        });
        console.log('✅ [AuthService] Conectado ao projects-manager');

        // Buscar o projeto pelo _id
        const projectDoc: any = await managerInstance.database()
          .collection("Projects")
          .doc(ProjectSettings.companyID())
          .get();

        console.log('🔍 [AuthService] projectDoc do projects-manager:', projectDoc);

        if (projectDoc && projectDoc.data && projectDoc.data()) {
          const projectData = projectDoc.data();
          console.log('✅ [AuthService] projectData encontrado:', projectData);

          projectInfo = {
            companyName: projectData.companyName,
            projectId: projectData.projectId || projectData._id,
            country: projectData.country || "BR",
            currency: projectData.currency || 'BRL',
            language: projectData.language || "pt_BR",
            timezone: projectData.timezone || "America/Sao_Paulo",
            profile: projectData.profile,
            workshop: projectData.workshop || {}
          };

          // 🔥 Sincronizar CRM de profile.data.crm para profile.crm
          if (projectInfo.profile?.data?.crm !== undefined && projectInfo.profile.data.crm !== null) {
            projectInfo.profile.crm = projectInfo.profile.data.crm;
            console.log('✅ [AuthService] CRM sincronizado de profile.data.crm');
          } else if (projectInfo.profile?.crm === null) {
            delete projectInfo.profile.crm;
            console.log('🗑️ [AuthService] profile.crm era null, foi removido');
          }

          console.log('✅ [AuthService] ProjectInfo carregado do projects-manager:', projectInfo);
          console.log('🔍 [AuthService] Profile.crm:', projectInfo.profile?.crm);
          console.log('🔍 [AuthService] Profile.data.crm:', projectInfo.profile?.data?.crm);
        } else {
          console.error('❌ [AuthService] Projeto não encontrado no projects-manager:', ProjectSettings.companyID());
        }

        // Fechar a conexão com projects-manager
        managerInstance.close();
      } catch (error) {
        console.error('❌ [AuthService] Erro ao buscar do projects-manager:', error);

        // Fechar a conexão em caso de erro
        try {
          managerInstance.close();
        } catch (e) {
          // ignore
        }
      }

      // FALLBACK antigo comentado (não é mais necessário)
      /*
      try {
        const res = await this.iToolsService.functions().call("getProjectSettings");
        console.log('📦 [AuthService] Resposta getProjectSettings:', res);

        if (res.status && res.data?.data) {
          projectInfo = {
            companyName: res.data.data.companyName,
            projectId: res.data.data._id,
            country: res.data.data.country || "BR",
            currency: res.data.data.currency || 'BRL',
            language: res.data.data.language || "pt_BR",
            timezone: res.data.data.timezone || "America/Sao_Paulo",
            profile: res.data.data.profile,
            workshop: res.data.data.workshop || {}
          };

          console.log('✅ [AuthService] ProjectInfo carregado via função:', projectInfo);
        } else {
          console.warn('⚠️ [AuthService] Função falhou ou retornou vazio, usando FALLBACK direto do banco...');
          console.log('🔍 [AuthService] CompanyID:', ProjectSettings.companyID());

          // ⭐ DEBUG: Listar todos os projetos para ver a estrutura
          console.log('📋 [AuthService] Listando TODOS os projetos para debug...');
          const allProjects = await this.iToolsService.database()
            .collection("Projects")
            .limit(10)
            .get();

          console.log('📋 [AuthService] Resposta completa da query:', allProjects);

          if (allProjects && allProjects.docs) {
            console.log('📋 [AuthService] Total de projetos encontrados:', allProjects.docs.length);

            if (allProjects.docs.length === 0) {
              console.error('⚠️ [AuthService] NENHUM projeto encontrado! Verifique:');
              console.error('   1. iTools está conectado ao banco correto?');
              console.error('   2. A coleção "Projects" existe?');
              console.error('   3. Há permissões para ler a coleção?');
            } else {
              allProjects.docs.forEach((doc: any) => {
                const data = doc.data();
                console.log('📋 [AuthService] Projeto:', {
                  _id: data._id,
                  projectId: data.projectId,
                  companyName: data.companyName
                });
              });
            }
          } else {
            console.error('❌ [AuthService] allProjects.docs não existe!', allProjects);
          }

          // ⭐ FALLBACK: Buscar direto pelo _id
          console.log('🔍 [AuthService] Tentando buscar por _id:', ProjectSettings.companyID());
          let projectDoc: any = await this.iToolsService.database()
            .collection("Projects")
            .doc(ProjectSettings.companyID())
            .get();

          console.log('🔍 [AuthService] projectDoc (busca por _id):', projectDoc);

          // Se não encontrou por _id, tentar por where com projectId
          if (!projectDoc || !projectDoc.data()) {
            console.log('🔍 [AuthService] Não encontrado por _id, tentando where com projectId...');
            const projectsQuery: any = await this.iToolsService.database()
              .collection("Projects")
              .where([{ field: 'projectId', operator: '=', value: ProjectSettings.companyID() }])
              .limit(1)
              .get();

            console.log('🔍 [AuthService] projectsQuery do fallback:', projectsQuery);

            if (projectsQuery && projectsQuery.docs && projectsQuery.docs.length > 0) {
              projectDoc = projectsQuery.docs[0];
            }
          }

          // iTools retorna { docs: [...] }, não um array direto
          if (projectDoc && projectDoc.data && projectDoc.data()) {
            const projectData = projectDoc.data();
            console.log('🔍 [AuthService] projectData encontrado:', projectData);

            projectInfo = {
              companyName: projectData.companyName,
              projectId: projectData.projectId || projectData._id,
              country: projectData.country || "BR",
              currency: projectData.currency || 'BRL',
              language: projectData.language || "pt_BR",
              timezone: projectData.timezone || "America/Sao_Paulo",
              profile: projectData.profile,
              workshop: projectData.workshop || {}
            };

            // 🔥 Sincronizar CRM se necessário
            if (projectInfo.profile?.data?.crm !== undefined && projectInfo.profile.data.crm !== null) {
              projectInfo.profile.crm = projectInfo.profile.data.crm;
              console.log('✅ [AuthService] CRM sincronizado de profile.data.crm (fallback 1)');
            } else if (projectInfo.profile?.crm === null) {
              delete projectInfo.profile.crm;
              console.log('🗑️ [AuthService] profile.crm era null, foi removido (fallback 1)');
            }

            console.log('✅ [AuthService] ProjectInfo carregado via FALLBACK (função vazia):', projectInfo);
          } else {
            console.error('❌ [AuthService] Projeto não encontrado com projectId:', ProjectSettings.companyID());
          }
        }

        if (projectInfo) {
          console.log('🔍 [AuthService] Profile.crm:', projectInfo.profile?.crm);
          console.log('🔍 [AuthService] Profile.data.crm:', projectInfo.profile?.data?.crm);
        }
      } catch (error) {
        console.error('❌ [AuthService] Erro ao buscar ProjectSettings:', error);

        // Mesmo com erro, tentar o fallback
        try {
          console.warn('⚠️ [AuthService] Tentando FALLBACK após erro...');
          console.log('🔍 [AuthService] CompanyID:', ProjectSettings.companyID());

          // ⭐ BUSCAR PRIMEIRO PELO _ID, DEPOIS POR PROJECTID
          console.log('🔍 [AuthService] Tentando buscar por _id:', ProjectSettings.companyID());
          let projectDoc: any = await this.iToolsService.database()
            .collection("Projects")
            .doc(ProjectSettings.companyID())
            .get();

          console.log('🔍 [AuthService] projectDoc (busca por _id):', projectDoc);

          // Se não encontrou por _id, tentar por where com projectId
          if (!projectDoc || !projectDoc.data()) {
            console.log('🔍 [AuthService] Não encontrado por _id, tentando where com projectId...');
            const projectsQuery: any = await this.iToolsService.database()
              .collection("Projects")
              .where([{ field: 'projectId', operator: '=', value: ProjectSettings.companyID() }])
              .limit(1)
              .get();

            console.log('🔍 [AuthService] projectsQuery:', projectsQuery);

            if (projectsQuery && projectsQuery.docs && projectsQuery.docs.length > 0) {
              projectDoc = projectsQuery.docs[0];
            }
          }

          // iTools retorna { docs: [...] }, não um array direto
          if (projectDoc && projectDoc.data && projectDoc.data()) {
            const projectData = projectDoc.data();
            console.log('🔍 [AuthService] projectData encontrado via where():', projectData);

            projectInfo = {
              companyName: projectData.companyName,
              projectId: projectData.projectId || projectData._id,
              country: projectData.country || "BR",
              currency: projectData.currency || 'BRL',
              language: projectData.language || "pt_BR",
              timezone: projectData.timezone || "America/Sao_Paulo",
              profile: projectData.profile,
              workshop: projectData.workshop || {}
            };

            // 🔥 Sincronizar CRM se necessário
            if (projectInfo.profile?.data?.crm !== undefined && projectInfo.profile.data.crm !== null) {
              projectInfo.profile.crm = projectInfo.profile.data.crm;
              console.log('✅ [AuthService] CRM sincronizado de profile.data.crm (fallback 2)');
            } else if (projectInfo.profile?.crm === null) {
              delete projectInfo.profile.crm;
              console.log('🗑️ [AuthService] profile.crm era null, foi removido (fallback 2)');
            }

            console.log('✅ [AuthService] ProjectInfo carregado via FALLBACK após erro:', projectInfo);
          } else {
            console.error('❌ [AuthService] Projeto não encontrado com projectId:', ProjectSettings.companyID());
          }
        } catch (fallbackError) {
          console.error('❌ [AuthService] FALLBACK falhou:', fallbackError);
        }
      }
      */

      const exec = async () => {

        await this.authCredentialSync.ensureSupportAccount(
          environment.loginSettings.email,
          environment.loginSettings.password
        );

        let collaboratorSnapshot: any;

        try {
          collaboratorSnapshot = await this.iToolsService.database().collection('RegistersCollaborators').where([
            { field: 'username', operator: '=', value: username }
          ]).limit(1).get();
        } catch (error) {
          console.error('[AuthService] Erro ao buscar colaborador:', error);
          reject({ code: -1, status: false, message: error.message });
          return;
        }

        if (!collaboratorSnapshot.docs.length) {
          reject({ code: 0, status: false });
          return;
        }

        const user = collaboratorSnapshot.docs[0].data();

        if (!user.allowAccess) {
          reject({ code: 400, status: false });
          return;
        }

        let storeSnapshot: any;

        try {
          storeSnapshot = await this.iToolsService.database().collection('Stores').where([
            { field: '_id', operator: '=', value: user.owner }
          ]).limit(1).get();
        } catch (error) {
          console.error('[AuthService] Erro ao buscar loja:', error);
          reject({ code: 1, status: false });
          return;
        }

        if (!storeSnapshot.docs.length) {
          reject({ code: 2, status: false });
          return;
        }

        const store = storeSnapshot.docs[0].data();

        const info = {
          status: true,
          data: { ...user },
          store,
          usertype: user.usertype,
          storeType: store._id == 'matrix' ? 'matrix' : 'branch'
        };

        const finalizeLogin = async (profile: any = null) => {
          try {
            await this.iToolsService.auth().login(user.email.toLowerCase(), password);
          } catch (error) {
            try {
              await this.iToolsService.auth().login(environment.loginSettings.email, environment.loginSettings.password);
            } catch (fallbackError) {
              console.log(fallbackError);
            }
            reject({ code: 300 });
            return;
          }

          await this.authCredentialSync.persistAuthHash(user.email, password);

          console.log('📝 [AuthService] Criando loginData...');
          console.log('📦 [AuthService] projectInfo que será salvo:', projectInfo);

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
            storeInfo: {
              name: info.store.name,
              billingName: info.store.billingName,
              address: info.store.address,
              cnpj: info.store.cnpj,
              image: info.store.image,
              contacts: info.store.contacts
            },
            storeType: info.storeType,
            isLogged: true,
            expireDate: 'noexpire',
            projectId: window.location.pathname.split('/')[1],
            projectInfo: projectInfo
          };

          console.log('✅ [AuthService] loginData criado:', {
            userId: loginData.userId,
            hasProjectInfo: !!loginData.projectInfo,
            projectInfo: loginData.projectInfo
          });

          const allSessions = window.localStorage.getItem('logins') ? JSON.parse(window.localStorage.getItem('logins')) : {};

          console.log('💾 [AuthService] Salvando loginData no localStorage...');
          console.log('💾 [AuthService] userId:', loginData.userId);
          console.log('💾 [AuthService] loginData.projectInfo:', loginData.projectInfo);

          allSessions[loginData.userId] = loginData;

          window.localStorage.setItem('logins', JSON.stringify(allSessions));

          console.log('✅ [AuthService] Salvo! Verificando...');
          const verificacao = JSON.parse(window.localStorage.getItem('logins'));
          console.log('🔍 [AuthService] Verificação - projectInfo salvo:', verificacao[loginData.userId]?.projectInfo);

          if (projectInfo && projectInfo.profile) {
            console.log('🔄 Sincronizando configurações do projeto...');

            if (projectInfo.profile.data?.crm !== undefined && projectInfo.profile.data.crm !== null) {
              projectInfo.profile.crm = projectInfo.profile.data.crm;
              console.log('✅ CRM sincronizado de profile.data.crm para profile.crm');
            } else if (projectInfo.profile.crm === null) {
              delete projectInfo.profile.crm;
              console.log('🗑️ profile.crm era null, foi removido');
            }

            const logins = localStorage.getItem('logins') ? JSON.parse(localStorage.getItem('logins')) : {};
            if (logins[loginData.userId]) {
              logins[loginData.userId].projectInfo = projectInfo;
              localStorage.setItem('logins', JSON.stringify(logins));
              console.log('✅ Configurações sincronizadas e salvas!');
              console.log('📦 ProjectInfo final:', {
                'profile.crm': projectInfo.profile.crm,
                'profile.data.crm': projectInfo.profile.data?.crm
              });
            }
          }

          (<any>window).id = info.data._id;
          localStorage.setItem('reloadWindowID', (<any>window).id);

          resolve(null);

          setTimeout(() => {
            window.location.reload();
          }, 500);
        };

        if (user.permissions) {
          try {
            const profileSnapshot = await this.iToolsService.database().collection('RegistersCollaboratorProfiles').where([
              { field: 'owner', operator: '=', value: 'matrix' },
              { field: 'code', operator: '=', value: parseInt(user.permissions) }
            ]).limit(1).get();

            if (!profileSnapshot.docs.length) {
              reject({ code: 4, status: false });
              return;
            }

            await finalizeLogin(profileSnapshot.docs[0].data());
          } catch (error) {
            console.error('[AuthService] Erro ao buscar perfil do colaborador:', error);
            reject({ code: 3, status: false });
          }
        } else {
          await finalizeLogin();
        }
      };

      await this.permissionsService.getAllUserPermissions(true, projectInfo).then((data) => {

        if (data) {

          allUserPermissions = data;
          return exec();
        } else {

          allUserPermissions = PermissionsService.getDefaultAllUserPermission(true, projectInfo);

          return this.iToolsService.database().collection('Settings').doc('permissions').update({ data: allUserPermissions }).then(() => {

            return exec();
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

  /**
   * 🔄 RECARREGAR CONFIGURAÇÕES DO PROJETO
   * Atualiza o projectInfo no localStorage sem precisar fazer logout
   */
  public async reloadProjectSettings(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        console.log('🔄 [AuthService] Recarregando configurações do projeto...');

        // Buscar configurações atualizadas
        const res = await this.iToolsService.functions().call("getProjectSettings");

        if (res.status) {
          const projectInfo = {
            companyName: res.data.data.companyName,
            projectId: res.data.data._id,
            country: res.data.data.country || "BR",
            currency: res.data.data.currency || 'BRL',
            language: res.data.data.language || "pt_BR",
            timezone: res.data.data.timezone || "America/Sao_Paulo",
            profile: res.data.data.profile,
            workshop: res.data.data.workshop || {}
          };

          console.log('📦 [AuthService] ProjectInfo atualizado:', projectInfo);

          // Normalizar profile.data.crm para profile.crm
          if (projectInfo.profile?.data?.crm !== undefined && projectInfo.profile.data.crm !== null) {
            projectInfo.profile.crm = projectInfo.profile.data.crm;
            console.log('✅ [AuthService] CRM sincronizado de profile.data.crm');
          } else if (projectInfo.profile?.crm === null) {
            delete projectInfo.profile.crm;
            console.log('🗑️ [AuthService] profile.crm era null, foi removido');
          }

          // Atualizar localStorage
          const logins = localStorage.getItem("logins") ? JSON.parse(localStorage.getItem("logins")) : {};
          const userId = (<any>window).id;

          if (logins[userId]) {
            logins[userId].projectInfo = projectInfo;
            localStorage.setItem("logins", JSON.stringify(logins));
            console.log('✅ [AuthService] Configurações atualizadas no localStorage');

            // Recarregar a página para aplicar as mudanças
            console.log('🔄 [AuthService] Recarregando página...');
            setTimeout(() => {
              window.location.reload();
            }, 500);

            resolve();
          } else {
            console.error('❌ [AuthService] Usuário não encontrado no localStorage');
            reject(new Error('Usuário não encontrado'));
          }
        } else {
          console.error('❌ [AuthService] Falha ao buscar configurações');
          reject(new Error('Falha ao buscar configurações'));
        }
      } catch (error) {
        console.error('❌ [AuthService] Erro ao recarregar configurações:', error);
        reject(error);
      }
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
