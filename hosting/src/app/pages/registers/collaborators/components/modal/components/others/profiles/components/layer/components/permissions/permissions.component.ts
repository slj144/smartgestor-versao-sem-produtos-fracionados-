// permissions.component.ts
// LOCALIZAÇÃO: src/app/pages/registers/collaborators/.../permissions/permissions.component.ts
// FUNÇÃO: Componente de permissões com tratamento especial para CRM

import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges, OnDestroy, ChangeDetectionStrategy, AfterContentChecked, ChangeDetectorRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { isBoolean } from 'util';

// Translate
import { CollaboratorsTranslate } from '../../../../../../../../../collaborators.translate';

// Services
import { PermissionsService } from './permissions.service';

// Interfaces
import { IPermissions } from '../../../../../../../../../../../../@shared/interfaces/_auxiliaries/IPermissions';

// Utilities
import { $$ } from '../../../../../../../../../../../../@shared/utilities/essential';
import { Utilities } from '../../../../../../../../../../../../@shared/utilities/utilities';

@Component({
  selector: 'collaborators-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollaboratorsPermissionsComponent implements OnInit, OnDestroy {

  public translate = CollaboratorsTranslate.get();

  @Input() public settings: any = {};

  @Output() public callback: EventEmitter<any> = new EventEmitter();

  public model: FormGroup;
  public submited: boolean = false;
  public blur: any = {};
  public currentUserType: string = Utilities.operator.usertype;
  public pagesWithSubpages = PermissionsService.pageWithSubpages;

  public usersPermissionsModel = null;
  public currentUsername: string = Utilities.operator.username;

  public originalModalSettings: any;

  // FormControls

  public formControls;

  constructor(
    private permissionsService: PermissionsService
  ) {

  }

  public ngOnInit() {
    this.callback.emit({ instance: this });
  }

  public ngOnDestroy() {
    this.reset();
  }

  public reset() {
    this.settings = {};
    this.originalModalSettings = {};
  }

  // Watch property changes

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.settings) {

      const settings = changes.settings.currentValue ? changes.settings.currentValue : {};
      settings.data = settings.data ? settings.data : {};
      settings.data.selectedData = settings.data.selectedData ? settings.data.selectedData : {};
      settings.data.action = settings.data.action.toLowerCase();
      settings.data.userPermissions = { allPermissions: Utilities.localStorage("allPermissions") };
      this.originalModalSettings = Utilities.deepClone(settings);
      this.config();
    }
  }


  // Config

  public config() {

    let data = this.settings["data"];

    const allPermissions = PermissionsService.getDefaultAllUserPermission();
    Utilities.localStorage("allPermissions", allPermissions)

    data.userPermissions.allPermissions = allPermissions;

    if (!this.settings.callback) { this.settings.callback = (event, data, model) => { }; }

    const defaultPerms = {};
    const startpagesNames = data.action === "add" ? defaultPerms : data.selectedData.permissions;
    const pagesNames = this.permissionsService.getPermissionPages(startpagesNames, data.action === "view" || data.action === "delete" ? false : true);
    const originalUserPermissionsPagesNames = pagesNames.originalPagesNames;
    const userPermissionsPagesNames = pagesNames.pagesNames;
    const userPermissionsPagesDatas = pagesNames.pagesData;

    data.userPermissions = { allPermissions: data.userPermissions.allPermissions, originalpagesNames: originalUserPermissionsPagesNames, pagesNames: userPermissionsPagesNames, pagesDatas: userPermissionsPagesDatas, subPagesNames: pagesNames.subPagesNames, originalSubPagesNames: pagesNames.originalSubPagesNames, subPagesDatas: pagesNames.subPagesDatas, reportsPagesDatas: pagesNames.reportsPagesDatas };

    const hasPermissions = data.selectedData && data.selectedData.permissions && data.action != "add" ? true : false;
    let perms = hasPermissions ? data.selectedData.permissions : defaultPerms;


    this.mountDefaultPermissionsModel(data.userPermissions.allPermissions, hasPermissions);
    this.mountPermissionsModel(perms);
    this.settings.data = data;

    this.callback.emit({
      data: {
        isSelected: this.isSelectedPermissions(),
        permissions: this.permissionsService.mountPermissionsObj(this.usersPermissionsModel)
      }
    });

    // console.log(perms);

    // this.model.controls

    // console.log(this.settings.data.userPermissions);

    // setInterval(()=>{


    //   console.log(this.usersPermissionsModel, this.permissionsService.mountPermissionsObj(this.usersPermissionsModel));
    // }, 2000);

    // setTimeout(()=>{


    //     // console.log(this.usersPermissionsModel);
    // }, 2000);
  }

  // Check if has Section and optionally return Section Data

  public hasSection(section: string = null, i1: number, i2: number = -1, resturnData: boolean = false): boolean | any[] {
    if (section) {
      if (i1 != -1 && i2 != -1) {

        const i = i1;
        const settings = this.settings;
        const status = !!(settings.data.userPermissions.subPagesDatas[settings.data.userPermissions.originalpagesNames[i]][settings.data.userPermissions.originalSubPagesNames[settings.data.userPermissions.originalpagesNames[i]][i2]][section] && Object.values(settings.data.userPermissions.subPagesDatas[settings.data.userPermissions.originalpagesNames[i]][settings.data.userPermissions.originalSubPagesNames[settings.data.userPermissions.originalpagesNames[i]][i2]][section]).length > 0);

        if (resturnData) {
          return status ? settings.data.userPermissions.subPagesDatas[settings.data.userPermissions.originalpagesNames[i]][settings.data.userPermissions.originalSubPagesNames[settings.data.userPermissions.originalpagesNames[i]][i2]][section] : [];
        } else {
          return status;
        }
      } else if (i1 != -1) {

        const i = i1;
        const status = !!(this.settings.data.userPermissions.pagesDatas[i] && this.settings.data.userPermissions.pagesDatas[i][section] && Object.values(this.settings.data.userPermissions.pagesDatas[i][section]).length > 0);

        if (resturnData) {
          return status ? this.settings.data.userPermissions.pagesDatas[i][section] : [];
        } else {
          return status;
        }
      } else {
        return false;
      }
    } else {
      if (resturnData) {
        return [];
      } else {
        return false;
      }
    }
  }


  public checkIfHasData(section: string = null, object: any, returnData: boolean = false) {
    if (object && object[section] && Object.values(object[section]).length > 0) {
      return returnData ? object[section] : true;
    } else {
      return returnData ? [] : false;
    }
  }


  // Translate Utilities

  public translateReportsSectionName(sectionName: string) {
    return this.permissionsService.translateReportsSectionName(sectionName);
  }

  public translateReportsSubSectionName(sectionName: string) {
    return this.permissionsService.translateReportsSubSectionName(sectionName);
  }

  public translateReportsTypeName(sectionName: string) {
    return this.permissionsService.translateReportsTypeName(sectionName);
  }

  public translateFieldsAndAction(type: string, data: any, history: any = null) {
    return this.permissionsService.translateFieldsAndActions(type, data, history);
  }

  // Check if has some permissions selected 

  public isSelectedPermissions() {
    return this.usersPermissionsModel ? $$(this.permissionsService.mountPermissionsObj(this.usersPermissionsModel)).length > 0 : false;
  }

  public checkEnableButton() {
    if (this.formControls.usertype.value != "admin") {
      return !this.isSelectedPermissions() || this.model.invalid;
    } else {
      return this.model.invalid;
    }
  }

  // Mount permissions Model

  public mountPermissionsModel(permissions: IPermissions) {

    $$(permissions).map((pageName, pageData) => {
      if (pageData != undefined) {

        if (PermissionsService.pageWithSubpages.indexOf(pageName) == -1 && $$(pageData).length == 0) {
          if (this.usersPermissionsModel[pageName]) {
            this.usersPermissionsModel[pageName]._status = true;
          }
        }

        $$(pageData).map((option, optionValue) => {
          if (PermissionsService.pageWithSubpages.indexOf(pageName) != -1) {

            // TRATAMENTO ESPECIAL PARA CRM
            if (pageName === "crm") {
              if (!Utilities.isBoolean(this.usersPermissionsModel[pageName])) {
                if (this.usersPermissionsModel[pageName] != undefined) {
                  this.usersPermissionsModel[pageName]._status = true;
                }
              }

              if (this.usersPermissionsModel[pageName] != undefined) {
                if (this.usersPermissionsModel[pageName][option] == undefined) {
                  this.usersPermissionsModel[pageName]._status = false;
                }

                if (this.usersPermissionsModel[pageName][option] != undefined) {
                  this.usersPermissionsModel[pageName][option]._status = true;

                  // Processar actions, fields, etc do CRM
                  $$(optionValue).map((option2, optionValue2) => {
                    if (option2 === "actions" || option2 === "fields") {
                      if (this.usersPermissionsModel[pageName][option][option2]) {
                        $$(this.usersPermissionsModel[pageName][option][option2]).map((k) => {
                          if (!Utilities.isBoolean(k)) {
                            this.usersPermissionsModel[pageName][option][option2][k] = false;
                          }
                        });

                        if (optionValue2 && optionValue2.length > 0) {
                          $$(optionValue2).map((_, v) => {
                            if (!Utilities.isBoolean(v)) {
                              this.usersPermissionsModel[pageName][option][option2][v] = true;
                            }
                          });
                        }
                      }
                    }
                  });
                }
              }
            } else {
              // PROCESSAMENTO NORMAL PARA OUTRAS PÁGINAS COM SUBPAGES
              $$(optionValue).map((option2, optionValue) => {

                if (!Utilities.isBoolean(this.usersPermissionsModel[pageName])) {
                  if (this.usersPermissionsModel[pageName] != undefined) {
                    this.usersPermissionsModel[pageName]._status = true;
                  }
                }

                if (this.usersPermissionsModel[pageName] != undefined) {

                  if (this.usersPermissionsModel[pageName][option] == undefined) {
                    this.usersPermissionsModel[pageName]._status = false;
                  }

                  if (this.usersPermissionsModel[pageName][option] != undefined) {

                    this.usersPermissionsModel[pageName][option]._status = true;

                    if (option2 == "sections" && !(optionValue instanceof Array) && PermissionsService.pageWithSectionsMap.indexOf(pageName) != -1 || option2 == "sections" && (optionValue instanceof Array && !(this.usersPermissionsModel[pageName][option][option2] instanceof Array)) && PermissionsService.pageWithSectionsMap.indexOf(pageName) != -1) {

                      if (optionValue instanceof Array) {
                        this.usersPermissionsModel[pageName][option][option2] = {};
                      }

                      $$(optionValue).map((sectionKey, sectionValue) => {

                        if (optionValue instanceof Array) {
                          this.usersPermissionsModel[pageName][option][option2][sectionValue] = true;
                        } else {
                          this.usersPermissionsModel[pageName][option][option2][sectionKey] = {};
                          this.usersPermissionsModel[pageName][option][option2][sectionKey]["actions"] = {};

                          $$(sectionValue.actions ? sectionValue.actions : []).map((key, value) => {
                            this.usersPermissionsModel[pageName][option][option2][sectionKey]["actions"][value] = true;
                          });
                        }

                      });
                    } else if (option2 == "sections" && PermissionsService.pageWithSectionsMap.indexOf(pageName) == -1) {
                      this.usersPermissionsModel[pageName][option][option2] = {};

                      $$(optionValue).map((key, value) => {
                        this.usersPermissionsModel[pageName][option][option2][value] = true;
                      });
                    } else {

                      $$(this.usersPermissionsModel[pageName][option][option2]).map((k) => {
                        if (!Utilities.isBoolean(k)) {
                          this.usersPermissionsModel[pageName][option][option2][k] = false;
                        }
                      });

                      if ($$(optionValue).length > 0) {
                        $$(optionValue).map((_, v) => {
                          if (!Utilities.isBoolean(v)) {
                            this.usersPermissionsModel[pageName][option][option2][v] = true;
                          }
                        });
                      }
                    }
                  }
                }
              });
            }
          } else if (pageName == "reports") {

            this.usersPermissionsModel.reports._status = true;

            const sectionData = optionValue;
            const sectionName = option;

            if (!Utilities.isBoolean(this.usersPermissionsModel.reports[sectionName]) && this.usersPermissionsModel.reports[sectionName]) {
              this.usersPermissionsModel.reports[sectionName]._status = true;
            }

            $$(sectionData.sections).map((subSectionName, subSectionData) => {
              if (subSectionData) {

                if (this.usersPermissionsModel.reports[sectionName]) {
                  if (this.usersPermissionsModel.reports[sectionName].sections[subSectionName]) {

                    if (!Utilities.isBoolean(this.usersPermissionsModel.reports[sectionName].sections[subSectionName])) {
                      this.usersPermissionsModel.reports[sectionName].sections[subSectionName]._status = true;
                    }

                    $$(subSectionData).map((typeName, typeData) => {
                      if (typeData && typeName != "_status") {
                        if (this.usersPermissionsModel.reports[sectionName].sections[subSectionName]) {
                          if (this.usersPermissionsModel.reports[sectionName].sections[subSectionName][typeName]) {

                            if (!Utilities.isBoolean(this.usersPermissionsModel.reports[sectionName].sections[subSectionName][typeName])) {
                              this.usersPermissionsModel.reports[sectionName].sections[subSectionName][typeName]._status = true;
                            }

                            $$(this.usersPermissionsModel.reports[sectionName].sections[subSectionName][typeName].fields).map((fieldName, fieldValue) => {
                              this.usersPermissionsModel.reports[sectionName].sections[subSectionName][typeName].fields[fieldName] = false;
                            });

                            $$(this.usersPermissionsModel.reports[sectionName].sections[subSectionName][typeName].actions || []).map((action) => {
                              this.usersPermissionsModel.reports[sectionName].sections[subSectionName][typeName].actions[action] = false;
                            });

                            // console.log("this.usersPermissionsModel.reports[sectionName].sections[subSectionName][typeName].actions: ", this.usersPermissionsModel.reports[sectionName].sections[subSectionName][typeName].actions)

                            $$(typeData.fields).map((fieldName, fieldValue) => {
                              this.usersPermissionsModel.reports[sectionName].sections[subSectionName][typeName].fields[fieldValue] = true;
                            });

                            // console.log("", sectionName, subSectionName, typeName, typeData.actions)

                            $$(typeData.actions || []).map((_, action) => {
                              this.usersPermissionsModel.reports[sectionName].sections[subSectionName][typeName].actions[action] = true;
                            });

                          }
                        }
                      }
                    });
                  }
                } else {
                  delete this.usersPermissionsModel.reports[sectionName];
                }
              }
            });
          } else {
            if (this.usersPermissionsModel[pageName] != undefined) {

              if (!Utilities.isBoolean(this.usersPermissionsModel[pageName])) {
                this.usersPermissionsModel[pageName]._status = true;
              }

              if (this.usersPermissionsModel[pageName][option]) {
                $$(this.usersPermissionsModel[pageName][option]).map((k) => {
                  if (!Utilities.isBoolean(this.usersPermissionsModel[pageName][option])) {
                    this.usersPermissionsModel[pageName][option][k] = false;
                  }
                });

                $$(optionValue).map((_, v) => {
                  if (!Utilities.isBoolean(v)) {
                    this.usersPermissionsModel[pageName][option][v] = true;
                  }
                });
              }
            }
          }
        });
      }
    });

    console.log("this.usersPermissionsModel: ", this.usersPermissionsModel)

    // setTimeout(()=>{

    // }, 3000);
  }

  public mountDefaultPermissionsModel(permissions: IPermissions, hasPermissions: boolean) {

    this.usersPermissionsModel = {};

    $$(Utilities.deepClone(permissions)).map((pageName, pageData) => {

      if (pageData != undefined) {
        this.usersPermissionsModel[pageName] = pageData;

        $$(pageData).map((option, optionValue) => {
          if (PermissionsService.pageWithSubpages.indexOf(pageName) != -1) {
            $$(optionValue).map((option2, optionValue) => {
              if (!Utilities.isBoolean(optionValue)) {

                this.usersPermissionsModel[pageName][option] = this.usersPermissionsModel[pageName][option] instanceof Array ? {} : this.usersPermissionsModel[pageName][option];
                this.usersPermissionsModel[pageName][option][option2] = this.usersPermissionsModel[pageName][option][option2] instanceof Array ? {} : this.usersPermissionsModel[pageName][option][option2];

                if (option2 == "sections" && !(optionValue instanceof Array) && PermissionsService.pageWithSectionsMap.indexOf(pageName) != -1 || option2 == "sections" && (optionValue instanceof Array && !(this.usersPermissionsModel[pageName][option][option2] instanceof Array)) && PermissionsService.pageWithSectionsMap.indexOf(pageName) != -1) {

                  if (optionValue instanceof Array) {
                    this.usersPermissionsModel[pageName][option][option2] = {};
                    // this.usersPermissionsModel[pageName][option][option2]["sections"] = {};
                  }

                  $$(optionValue).map((sectionKey, sectionValue) => {

                    if ((optionValue instanceof Array)) {
                      // if(optionValue instanceof Array){
                      // $$(sectionValue ? sectionValue : []).map((key, value)=>{
                      if (this.settings["data"].action == "add") {
                        this.usersPermissionsModel[pageName][option][option2][sectionValue] = true;
                      } else {
                        this.usersPermissionsModel[pageName][option][option2][sectionValue] = false;
                      }
                      // });
                      // }
                    } else {
                      this.usersPermissionsModel[pageName][option][option2][sectionKey] = {};
                      this.usersPermissionsModel[pageName][option][option2][sectionKey]["actions"] = {};


                      // console.log(option, option2, optionValue)

                      $$(sectionValue.actions ? sectionValue.actions : []).map((key, value) => {
                        if (this.settings["data"].action == "add") {
                          this.usersPermissionsModel[pageName][option][option2][sectionKey]["actions"][value] = true;
                        } else {
                          this.usersPermissionsModel[pageName][option][option2][sectionKey]["actions"][value] = false;
                        }
                      });
                    }

                  });
                } else if (option2 == "sections" && PermissionsService.pageWithSectionsMap.indexOf(pageName) == -1) {
                  this.usersPermissionsModel[pageName][option][option2] = {};

                  $$(optionValue).map((key, value) => {
                    if (this.settings["data"].action == "add") {
                      this.usersPermissionsModel[pageName][option][option2][value] = true;
                    } else {
                      this.usersPermissionsModel[pageName][option][option2][value] = false;
                    }
                  });
                } else {

                  $$(optionValue).map((k, v) => {
                    if (!Utilities.isBoolean(v)) {
                      if (this.settings["data"].action == "add") {
                        this.usersPermissionsModel[pageName][option][option2][v] = true;
                      } else {
                        this.usersPermissionsModel[pageName][option][option2][v] = false;
                      }
                    }
                  });
                }
              }
            });
          } else if (pageName == "reports") {

            const sectionData = optionValue;
            const sectionName = option;

            this.usersPermissionsModel.reports[sectionName]._status = !hasPermissions;

            $$(sectionData.sections).map((subSectionName, subSectionData) => {
              if (subSectionData) {
                if (this.usersPermissionsModel.reports[sectionName].sections[subSectionName]) {

                  this.usersPermissionsModel.reports[sectionName].sections[subSectionName]._status = !hasPermissions;

                  $$(subSectionData).map((typeName, typeData) => {
                    if (typeData && typeName != "_status") {

                      const actions = this.usersPermissionsModel.reports[sectionName].sections[subSectionName][typeName].actions;
                      const fields = this.usersPermissionsModel.reports[sectionName].sections[subSectionName][typeName].fields;

                      this.usersPermissionsModel.reports[sectionName].sections[subSectionName][typeName].actions = this.usersPermissionsModel.reports[sectionName].sections[subSectionName][typeName].actions instanceof Array ? {} : this.usersPermissionsModel.reports[sectionName].sections[subSectionName][typeName].actions;

                      this.usersPermissionsModel.reports[sectionName].sections[subSectionName][typeName].fields = this.usersPermissionsModel.reports[sectionName].sections[subSectionName][typeName].fields instanceof Array ? {} : this.usersPermissionsModel.reports[sectionName].sections[subSectionName][typeName].fields;
                      this.usersPermissionsModel.reports[sectionName].sections[subSectionName][typeName]._status = !hasPermissions;

                      $$(actions).map((_, action) => {
                        if (!Utilities.isBoolean(action)) {
                          this.usersPermissionsModel.reports[sectionName].sections[subSectionName][typeName].actions[action] = true;
                        }
                      });

                      $$(fields).map((_, fieldValue) => {
                        if (!Utilities.isBoolean(fieldValue)) {
                          this.usersPermissionsModel.reports[sectionName].sections[subSectionName][typeName].fields[fieldValue] = true;
                        }
                      });
                    }
                  });
                }
              }
            });
          } else {

            const options = this.usersPermissionsModel[pageName][option];

            if (!Utilities.isBoolean(optionValue)) {
              this.usersPermissionsModel[pageName][option] = this.usersPermissionsModel[pageName][option] instanceof Array ? {} : this.usersPermissionsModel[pageName][option];
            }

            $$(options).map((k, v) => {
              if (!Utilities.isBoolean(v)) {
                if (this.settings["data"].action == "add") {
                  this.usersPermissionsModel[pageName][option][v] = true;
                } else {
                  this.usersPermissionsModel[pageName][option][v] = false;
                }
              }
            });

            $$(optionValue).map((_, v) => {
              if (v) {

                if (this.settings["data"].action == "add") {

                  this.usersPermissionsModel[pageName][option][v] = true;
                } else {

                  this.usersPermissionsModel[pageName][option][v] = true;
                }

              }
            });
          }
        });
      }
    });

  }

  // Action Events

  public onSelectPagePermissionClearClickPropagation(event) { event.stopPropagation(); }

  public onSelectPagePermission(event: Event, pageName: string, rootPage: string) {

    if (rootPage !== pageName && (<any>event.target).checked) {

      this.usersPermissionsModel[rootPage]._status = true;
    }

    if (rootPage !== pageName && !(<any>event.target).checked) {
      if (!this.permissionsService.mountPermissionsObj(this.usersPermissionsModel)[rootPage]) {

        this.usersPermissionsModel[rootPage]._status = false;
      }
    }

    event.stopPropagation();

    // DEBUG CRM
    if (rootPage === 'crm' || pageName === 'crm') {
      console.log('=== CRM Permission Changed ===');
      console.log('RootPage:', rootPage);
      console.log('PageName:', pageName);
      console.log('Checked:', (<any>event.target).checked);
      console.log('Model CRM:', this.usersPermissionsModel.crm);
    }

    const result = this.permissionsService.mountPermissionsObj(this.usersPermissionsModel);
    console.log('Permissions Result:', result);

    this.callback.emit({
      data: {
        isSelected: this.isSelectedPermissions(),
        permissions: result
      }
    });
  }

  public onSelectActionsAnfIeldsPermission(event) {

    event.stopPropagation();

    this.callback.emit({
      data: {
        isSelected: this.isSelectedPermissions(),
        permissions: this.permissionsService.mountPermissionsObj(this.usersPermissionsModel)
      }
    });

    // console.log(this.permissionsService.mountPermissionsObj(this.usersPermissionsModel));

  }

  // Utilities

  public typeof(item: any) { return typeof item; }

  public checkIfIsSectionMap(item) {
    if (typeof item == "object" && Object.values(item) && typeof Object.values(item)[0] == "object") {
      return true;
    } else {
      return false;
    }
  }

}