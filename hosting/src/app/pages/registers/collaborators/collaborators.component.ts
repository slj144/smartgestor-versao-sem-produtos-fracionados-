import { Component, OnInit } from '@angular/core';

// Components
import { CollaboratorsModalComponent } from './components/modal/modal.component';
import { CollaboratorProfilesComponent } from './components/modal/components/others/profiles/profiles.component';

// Services
import { CollaboratorsService } from './collaborators.service';
import { IToolsService } from '@shared/services/iTools.service';

// Translate
import { CollaboratorsTranslate } from './collaborators.translate';

// Interfaces
import { IRegistersCollaborator } from '@shared/interfaces/IRegistersCollaborator';
import { IPermissions } from '@shared/interfaces/_auxiliaries/IPermissions';

// Utilities
import { Utilities } from '@shared/utilities/utilities';
import { Dispatch } from '@shared/utilities/dispatch';
import { ScrollMonitor } from '@shared/utilities/scrollMonitor';

@Component({
  selector: 'registers-collaborators',
  templateUrl: './collaborators.component.html',
  styleUrls: ['./collaborators.component.scss']
})
export class CollaboratorsComponent implements OnInit {

  public translate = CollaboratorsTranslate.get();

  public userPermissionsPagesNames: Array<string> = [];
  public originalUserPermissionsPagesNames: Array<string> = [];
  public userPermissionsPagesDatas: Array<{ actions?: Array<string>, widdgets?: Array<string>, fields?: Array<string>, sections?: Array<string> }> = [];
  public userPermissions: IPermissions;

  public loading: boolean = true;
  public recordsData: Array<IRegistersCollaborator> = [];
  public queryClauses: any = [];
  public countData: any = {};
  public filtersBadge: number = 0;

  public currentUsername: string = Utilities.operator.username;
  public isAdd: boolean = false;
  public isEdit: boolean = false;
  public isDelete: boolean = false;
  public hasCollaboratorProfiles: boolean = false;

  public isAdmin = Utilities.isAdmin;

  private modalComponent: CollaboratorsModalComponent;
  private collaboratorProfilesComponent: CollaboratorProfilesComponent;

  constructor(
    private collaboratorService: CollaboratorsService,
    private iToolsService: IToolsService, // ⬅️ ADICIONE ESTA LINHA
  ) { }

  // Class Init

  public ngOnInit() {
    ScrollMonitor.reset();
    this.setupPermissions();
    this.getCollaborators();
    this.scrollSettings();
  }

  private setupPermissions(event: boolean = true) {

    const setupPermissions = () => {

      if (Utilities.isAdmin) {

        this.isAdd = true;
        this.isEdit = true;
        this.isDelete = true;
        this.hasCollaboratorProfiles = true;
      } else {

        const permissions = Utilities.permissions as IPermissions;

        if (permissions.registers) {
          this.isAdd = permissions.registers.collaborators.actions.indexOf("add") !== -1;
          this.isEdit = permissions.registers.collaborators.actions.indexOf("edit") !== -1;
          this.isDelete = permissions.registers.collaborators.actions.indexOf("delete") !== -1;
          this.hasCollaboratorProfiles = permissions.registers.collaborators.sections.indexOf("collaboratorProfiles") !== -1;
        }
      }
    };

    if (event) {
      Dispatch.onRefreshCurrentUserPermissions("CollaboratorsComponent-refresh-user-permissions", () => {
        setupPermissions();
      });
    }

    setupPermissions();
  }

  public prefixCode(code: string) {
    return Utilities.prefixCode(code);
  }
  // Verifica se pode criar mais usuários
  private async verificarLimiteUsuarios(): Promise<boolean> {
    try {
      // Busca informações da loja matriz
      const storeData = await this.iToolsService.database()
        .collection("Stores")
        .doc("matrix")
        .get();

      const limitUsers = storeData.data()?.limitUsers || 10; // Padrão: 10 usuários

      // Conta usuários ativos (allowAccess = true)
      const usuarios = await this.iToolsService.database()
        .collection("RegistersCollaborators")
        .where([{ field: "allowAccess", operator: "=", value: true }])
        .get();

      const totalUsuarios = usuarios.docs.length;

      console.log(`👥 Limite de usuários: ${totalUsuarios}/${limitUsers}`);

      if (totalUsuarios >= limitUsers) {
        // Mostra mensagem de erro
        alert(`⚠️ Limite de usuários atingido!\n\nSua licença permite apenas ${limitUsers} usuários ativos.\nPara adicionar mais usuários, entre em contato com o suporte.`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao verificar limite:', error);
      return true; // Em caso de erro, permite continuar
    }
  }
  // Filter

  public onFilter(event: any) {

    this.modalComponent.onOpen({
      activeComponent: 'Collaborator/Filters',
      fields: [
        { label: 'Código', property: 'code', combination: 'full', type: 'text', checked: false },
        { label: 'Nome', property: 'name', combination: 'full', type: 'text', checked: false },
        { label: 'Usuário', property: 'username', combination: 'full', type: 'text', checked: false },
      ],
      callback: (filters: any[]) => {

        this.filtersBadge = (filters.length || 0);

        const query: any[] = [];

        filters.forEach((filter) => {

          const field = Object.keys(filter.filter)[0].split(".");

          query.push({
            field: Object.keys(filter.filter)[0],
            operator: filter.settings.combination === "full" ? "=" : "like",
            value: field[field.length - 1] == "code" ? parseInt(new String(Object.values(filter.filter)[0]).valueOf()) : new RegExp((<any>Object.values(filter.filter)[0]), "")
          });
        });

        query.push({
          field: "owner",
          operator: "=",
          value: Utilities.storeID
        });

        query.push({
          field: "source",
          operator: "!=",
          value: "root"
        });

        this.queryClauses = query;

        this.collaboratorService.query(query, true).then(() => { }).catch((error) => { });
      }
    });

  }

  public onSearch(event: any) {

    const value = event.value;
    const query: any[] = [];

    value.split(";").forEach((item: string) => {
      item = item.trim();

      if (!isNaN(parseInt(item))) {

        query.push({
          field: "code",
          operator: "=",
          value: parseInt(item)
        });
      } else {

        query.push({
          field: "name",
          operator: "like",
          value: item
        });
      }
    });

    this.collaboratorService.query(query, true).then(() => { }).catch(error => { });
  }

  // Data Export

  public onDataExport() {

  }

  // Get Collaborators

  private getCollaborators() {

    this.collaboratorService.getCollaborators("collaborators-main-collaborators", (data) => {
      this.setupPermissions(false);
      this.recordsData = data;
      this.loading = false;
    });

    this.collaboratorService.getCollaboratorsCount("collaborators-main-collaborators", (data) => {
      this.countData = data;
    });
  }

  // Modal Response

  public onModalResponse(event) {

    if (event.instance instanceof CollaboratorsModalComponent) {
      this.modalComponent = event.instance;
    }

    if (event.instance instanceof CollaboratorProfilesComponent) {
      this.collaboratorProfilesComponent = event.instance;
    }
  }

  // Show Modais

  public async onShowModal(event, collaborator = null, type) {

    event?.stopPropagation();

    if (!this.modalComponent) { return; }
    // ⭐ NOVA VERIFICAÇÃO - se está criando novo (type === 'add'), verifica limite
    if (type === 'add') {
      const podeAdicionar = await this.verificarLimiteUsuarios();
      if (!podeAdicionar) {
        return; // Não abre o modal se atingiu o limite
      }
    }

    if (type) {

      type = (<string>type).trim().toLowerCase();

      this.modalComponent.onOpen({
        activeComponent: type === "read" ? 'Collaborator/View' : (type === "add") ? "Collaborator/Add" : (type === "edit") ? "Collaborator/Edit" : "Collaborator/Delete",
        data: {
          selectedData: collaborator,
          action: type,
          userPermissions: {},
        }
      });
    }
  }

  public onShowCollaboratorsProfilesModal(event) {
    event?.stopPropagation();
    this.collaboratorProfilesComponent.onOpenModal();
  }

  // ScroolSettings

  private scrollSettings() {

    ScrollMonitor.start({
      target: '#infiniteScroll',
      bottom: () => {

        if (this.countData.total > this.collaboratorService.limit) {

          Utilities.loading();

          const query: any = (this.queryClauses.length > 0 ? this.queryClauses : null);
          const reset: boolean = false;
          const flex: boolean = (this.filtersBadge == 0);
          const scrolling: boolean = (this.queryClauses.length > 0);

          this.collaboratorService.query(query, reset, flex, scrolling).then(() => {
            Utilities.loading(false);
          }).catch((error) => {
            Utilities.loading(false);
          });
        }
      }
    });
  }

  // Class Destructor

  public ngDestroy() {

    this.collaboratorService.query([]);
    this.collaboratorService.removeListeners("collaborators", "collaborators-main-collaborators");
    this.collaboratorService.removeListeners("count", "collaborators-main-collaborators");

    Dispatch.removeListeners("refresh-menu", "CollaboratorsComponent-refresh-user-permissions");
  }

}
