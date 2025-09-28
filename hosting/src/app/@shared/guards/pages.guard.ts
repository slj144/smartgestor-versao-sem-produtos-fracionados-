/**
 * pages.guard.ts
 * Localização: src/app/shared/guards/pages.guard.ts
 * 
 * Guard responsável por controlar o acesso às páginas/módulos da aplicação.
 * Verifica se o usuário está autenticado e se possui permissões para acessar
 * determinadas rotas/módulos baseado no perfil da empresa e permissões do usuário.
 * Redireciona automaticamente para a primeira rota disponível caso o usuário
 * não tenha acesso à rota solicitada.
 */

import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

// Services
import { AuthService } from '../../auth/auth.service';

// Interfaces
import { IPermissions } from '@shared/interfaces/_auxiliaries/IPermissions';
import { Utilities } from '@shared/utilities/utilities';
import { ProjectSettings } from '@assets/settings/company-settings';

@Injectable({ providedIn: 'root' })
export class PagesGuard {

  constructor(
    private authService: AuthService,
    private router: Router,
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

    if (!this.authService.isLogged()) {
      this.router.navigate([Utilities.projectId + "/login"]);
      return false;
    }

    const path = (route.pathFromRoot[route.pathFromRoot.length - 1]["_routerState"]["url"]);
    const currentLogin = Utilities.currentLoginData;

    // if (currentLogin)
    const permissions = currentLogin.permissions as IPermissions;
    // const permissions = JSON.parse(localStorage.getItem("permissions")) as IPermissions;

    this.setupStartRoute(permissions, path);

    return this.authService.isLogged();
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    if (!this.authService.isLogged()) {
      this.router.navigate([Utilities.projectId + "/login"]);
      return false;
    }

    if (Utilities.projectId != Utilities.currentLoginData.projectId) {
      // window.location.href = window.location.protocol + "//" + window.location.host + "/" + Utilities.currentLoginData.projectId;
    }

    if (route.routeConfig.path.trim()) {

      const currentLogin = Utilities.currentLoginData;
      const companyProfile = ProjectSettings.companySettings().profile;
      const isDistributor = companyProfile?.name?.toLowerCase().includes('distributor');
      if (currentLogin.usertype != "admin") {

        const permissions = currentLogin.permissions ? currentLogin.permissions as IPermissions : {};
        let status = true;

        switch (route.routeConfig.path) {
          case "dashboard": {

            const hasModule = companyProfile.dashboard && companyProfile.dashboard.active == true;
            if ((!hasModule) || permissions.dashboard == null) { status = false }
            break;
          }

          case "cozinha": {

            const hasModule = companyProfile.kitchen && companyProfile.kitchen.active == true;
            if ((!hasModule) || permissions.kitchen == null) { status = false }
            break;
          }

          case "grupos": {

            const hasModule = companyProfile.groups && companyProfile.groups.active == true;
            if ((!hasModule) || permissions.groups == null) { status = false }
            break;
          }

          case "salas-de-aula": {

            const hasModule = companyProfile.classrooms && companyProfile.classrooms.active == true;
            if ((!hasModule) || permissions.classrooms == null) { status = false }
            break;
          }

          case "dizimos": {

            const hasModule = companyProfile.tithes && companyProfile.tithes.active == true;
            if ((!hasModule) || permissions.tithes == null) { status = false }
            break;
          }

          case "doacoes": {

            const hasModule = companyProfile.donations && companyProfile.donations.active == true;
            if ((!hasModule) || permissions.donations == null) { status = false }
            break;
          }

          case "cardapio": {

            const hasModule = companyProfile.menu && companyProfile.menu.active == true;
            if ((!hasModule) || permissions.menu == null) { status = false }
            break;
          }

          case "demandas-sociais": {

            const hasModule = companyProfile.socialDemands && companyProfile.socialDemands.active == true;
            if ((!hasModule) || permissions.socialDemands == null) { status = false }
            break;
          }

          case "projetos": {

            const hasModule = companyProfile.projects && companyProfile.projects.active == true;
            if ((!hasModule) || permissions.projects == null) { status = false }
            break;
          }

          case "oficios": {

            const hasModule = companyProfile.crafts && companyProfile.crafts.active == true;
            if ((!hasModule) || permissions.crafts == null) { status = false }
            break;
          }

          case "requerimentos": {

            const hasModule = companyProfile.requirements && companyProfile.requirements.active == true;
            if ((!hasModule) || permissions.requirements == null) { status = false }
            break;
          }

          case "pedidos": {

            const hasModule = companyProfile.requests && companyProfile.requests.active == true;
            if ((!hasModule) || permissions.requests == null) { status = false }
            break;
          }

          case "eventos": {

            const hasModule = companyProfile.events && companyProfile.events.active == true;
            if ((!hasModule) || permissions.events == null) { status = false }
            break;
          }

          case "agenda": {

            const hasModule = companyProfile.agenda && companyProfile.agenda.active == true;
            if ((!hasModule) || permissions.agenda == null) { status = false }
            break;
          }

          case "ordens-servico": {

            const hasModule = companyProfile.serviceOrders && companyProfile.serviceOrders.active == true;
            if ((!hasModule) || permissions.serviceOrders == null || isDistributor) { status = false }
            break;
          }

          // Stock

          case "produtos": {

            const hasModule = companyProfile.stock && companyProfile.stock.active == true;
            const hasComponent = hasModule && companyProfile.stock.components.products ? companyProfile.stock.components.products.active : false;
            if (!hasModule || !hasComponent || permissions.stock && permissions.stock.products == null) { status = false }
            break;
          }
          case "transferencias": {

            const hasModule = companyProfile.stock && companyProfile.stock.active == true;
            const hasComponent = hasModule && companyProfile.stock.components.transfers ? companyProfile.stock.components.transfers.active : false;
            if (!hasModule || !hasComponent || permissions.stock == null || permissions.stock && permissions.stock.transfers == null) { status = false }
            break;
          }
          case "compras": {

            const hasModule = companyProfile.stock && companyProfile.stock.active == true;
            const hasComponent = hasModule && companyProfile.stock.components.purchases ? companyProfile.stock.components.purchases.active : false;
            if (!hasModule || !hasComponent || permissions.stock == null || permissions.stock && permissions.stock.purchases == null) { status = false }
            break;
          }

          // Registers

          case "clientes": {

            const hasModule = companyProfile.registers && companyProfile.registers.active == true;
            const hasComponent = hasModule && companyProfile.registers.components.customers ? companyProfile.registers.components.customers.active : false;
            if (!hasModule || !hasComponent || permissions.registers == null || permissions.registers && permissions.registers.customers == null) { status = false }
            break;
          }
          case "colaboradores": {

            const hasModule = companyProfile.registers && companyProfile.registers.active == true;
            const hasComponent = hasModule && companyProfile.registers.components.customers ? companyProfile.registers.components.customers.active : false;
            if (!hasModule || !hasComponent || permissions.registers == null || permissions.registers && permissions.registers.collaborators == null) { status = false }
            break;
          }
          case "fornecedores": {

            const hasModule = companyProfile.registers && companyProfile.registers.active == true;
            const hasComponent = hasModule && companyProfile.registers.components.providers ? companyProfile.registers.components.providers.active : false;
            if (!hasModule || !hasComponent || permissions.registers == null || permissions.registers && permissions.registers.providers == null) { status = false }
            break;
          }
          case "parceiros": {

            const hasModule = companyProfile.registers && companyProfile.registers.active == true;
            const hasComponent = hasModule && companyProfile.registers.components.partners ? companyProfile.registers.components.partners.active : false;
            if (!hasModule || !hasComponent || permissions.registers == null || permissions.registers && permissions.registers.partners == null) { status = false }
            break;
          }
          case "filiais": {

            const hasModule = companyProfile.registers && companyProfile.registers.active == true;
            const hasComponent = hasModule && companyProfile.registers.components.branches ? companyProfile.registers.components.branches.active : false;
            if (!hasModule || !hasComponent || !permissions.registers || permissions.registers.branches == null || currentLogin.storeType === "branch") { status = false }
            break;
          }
          case "servicos": {

            const hasModule = companyProfile.registers && companyProfile.registers.active == true;
            const hasComponent = hasModule && companyProfile.registers.components.services ? companyProfile.registers.components.services.active : false;
            const hasServiceOrders = companyProfile.serviceOrders && companyProfile.serviceOrders.active == true;
            if (!hasModule || !hasComponent || !hasServiceOrders || isDistributor) { status = false }
            break;
          }
          case "meios-pagamento": {

            const hasModule = companyProfile.registers && companyProfile.registers.active == true;
            const hasComponent = hasModule && companyProfile.registers.components.paymentMethods ? companyProfile.registers.components.paymentMethods.active : false;
            if (!hasModule || !hasComponent || permissions.registers == null || permissions.registers && permissions.registers.paymentMethods == null) { status = false }
            break;
          }

          // Financial

          case "contas-pagar": {

            const hasModule = companyProfile.financial && companyProfile.financial.active == true;
            const hasComponent = hasModule && companyProfile.financial.components.billsToPay ? companyProfile.financial.components.billsToPay.active : false;
            if (!hasModule || !hasComponent || permissions.financial == null || permissions.financial && permissions.financial.billsToPay == null) { status = false }
            break;
          }
          case "contas-receber": {

            const hasModule = companyProfile.financial && companyProfile.financial.active == true;
            const hasComponent = hasModule && companyProfile.financial.components.billsToReceive ? companyProfile.financial.components.billsToReceive.active : false;
            if (!hasModule || !hasComponent || permissions.financial == null || permissions.financial && permissions.financial.billsToReceive == null) { status = false }
            break;
          }
          case "contas-bancarias": {

            const hasModule = companyProfile.financial && companyProfile.financial.active == true;
            const hasComponent = hasModule && companyProfile.financial.components.bankAccounts ? companyProfile.financial.components.bankAccounts.active : false;
            if (!hasModule || !hasComponent || permissions.financial == null || permissions.financial && permissions.financial.bankAccounts == null) { status = false }
            break;
          }

          case "notas-fiscais": {

            const hasModule = companyProfile.fiscal && companyProfile.fiscal.active == true;
            if (!hasModule || permissions.fiscal == null) { status = false }
            break;
          }

          case "relatorios": {

            const hasModule = companyProfile.reports && companyProfile.reports.active == true;
            if (!hasModule || permissions.reports == null) { status = false }
            break;
          }

          case "loja": {

            const hasModule = companyProfile.informations && companyProfile.informations.active == true;
            if (!hasModule || permissions.informations == null) { status = false }
            break;
          }

          case "configuracoes": {

            const hasModule = companyProfile.settings && companyProfile.settings.active == true;
            if (!hasModule || permissions.settings == null) { status = false }
            break;
          }

          case "crm": {

            const hasModule = companyProfile.crm && companyProfile.crm.active == true;
            if (!hasModule || permissions.crm == null) { status = false }
            break;
          }
        }

        if (!status) {
          this.router.navigate([this.setupStartRoute(permissions, route.routeConfig.path.trim())]);
        }

        return status;
      }

    }

    return this.authService.isLogged();
  }

  private setupStartRoute(permissions: any, path: string) {

    let redirectPath = "";

    if (permissions) {

      if (permissions.dashboard != null) {
        redirectPath = "dashboard";
      }
      else if (permissions.cashier != null) {
        redirectPath = "caixa";
      }
      else if (permissions.requests != null) {
        redirectPath = "pedidos";
      }
      else if (permissions.serviceOrders != null) {
        redirectPath = "ordens-servico";
      }
      else if (permissions.informations != null) {
        redirectPath = "loja";
      }
      else if (permissions.fiscal != null) {
        redirectPath = "notas-fiscais";
      }
      else if (permissions.registers != null) {
        redirectPath = "registros";
      }
      else if (permissions.finances != null) {
        redirectPath = "financeiro";
      }
      else if (permissions.reports != null) {
        redirectPath = "relatorios";
      }
      else if (permissions.crm != null) {
        redirectPath = "crm";
      }
    }
    else {
      redirectPath = "dashboard";
    }

    const isRedirect = path.split("/").length === 2;
    let redirectPathString = "";

    if (isRedirect && this.authService.isLogged()) {
      redirectPathString = "/" + Utilities.currentLoginData.projectId + "/" + redirectPath;
      this.router.navigate([redirectPathString]);
    } else if (isRedirect && !this.authService.isLogged()) {
      redirectPathString = "/" + Utilities.projectId + "/login/";
      this.router.navigate([redirectPathString]);
    }

    return redirectPathString;
  }

}