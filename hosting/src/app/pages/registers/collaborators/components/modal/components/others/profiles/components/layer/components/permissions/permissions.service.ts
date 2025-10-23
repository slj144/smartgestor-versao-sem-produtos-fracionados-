// permissions.service.ts
// LOCALIZAÇÃO: src/app/pages/registers/collaborators/.../permissions/permissions.service.ts
// FUNÇÃO: Define todas as permissões disponíveis no sistema

import { Injectable } from '@angular/core';

// Services
import { IToolsService } from '../../../../../../../../../../../../@shared/services/iTools.service';

// Translate
import { CollaboratorsTranslate } from '../../../../../../../../../collaborators.translate';

// Interfaces
import { IPermissions } from '../../../../../../../../../../../../@shared/interfaces/_auxiliaries/IPermissions';

// Utilities
import { $$ } from '../../../../../../../../../../../../@shared/utilities/essential';
import { Utilities } from '../../../../../../../../../../../../@shared/utilities/utilities';

// Settings
import { ProjectSettings } from '../../../../../../../../../../../../../assets/settings/company-settings';

@Injectable({ providedIn: "root" })
export class PermissionsService {

  get language() { return window.localStorage.getItem('Language') ? window.localStorage.getItem('Language') : ProjectSettings.companySettings().language; }

  // CORREÇÃO: Adicionado "crm" na lista
  public static pageWithSubpages = ["dashboard", "cashier", "stock", "financial", "registers", "crm"];

  public static pageWithSectionsMap = ["cashier"];

  public static pageWithWidgets = ["dashboard"];

  constructor(
    private iToolsService: IToolsService
  ) { }


  public async getAllUserPermissions(filter: boolean = true, projectInfo: any = null): Promise<IPermissions> {
    return new Promise<IPermissions>(async (resolve) => {

      let data: IPermissions;

      await this.iToolsService.database().collection("Settings").doc("permissions").get().then((res) => {
        if (res.data()) {
          data = res.data().data as any;
          if (filter) {
            PermissionsService.filterPermissions(data, projectInfo);
          }
        }
      });

      resolve(data);
    });
  }

  public translateReportsSectionName(sectionName: string) {
    return CollaboratorsTranslate.get().permissions._reports.sections[sectionName] ? CollaboratorsTranslate.get().permissions._reports.sections[sectionName] : sectionName;
  }

  public translateReportsSubSectionName(subSectionName: string) {
    return CollaboratorsTranslate.get().permissions._reports.subSections[subSectionName] ? CollaboratorsTranslate.get().permissions._reports.subSections[subSectionName] : subSectionName;
  }

  public translateReportsTypeName(typeName: string) {
    return CollaboratorsTranslate.get().permissions._reports.types[typeName] ? CollaboratorsTranslate.get().permissions._reports.types[typeName] : typeName;
  }

  public translateFieldsAndActions(type: string, data: any, history: any[]) {

    type = type.toLowerCase();
    let translateObj: any = CollaboratorsTranslate.get().permissions;
    let returnObj = [];
    const length = history.length;

    if (type == "fields" || type == "widgets" || type == "sections") {
      $$(history).map((index, value) => {
        if (value) {
          if (length < 4) {
            translateObj = translateObj ? translateObj[value.currentPermission] : null;
          } else {
            if (translateObj) {
              translateObj = index == 2 ? translateObj.sections[value.currentPermission] : translateObj[value.currentPermission];
            }
          }
        }
      });
    } else if (type == "actions") { }

    $$(data).map((_, value) => {

      let item = value;
      if (translateObj && translateObj[type]) { item = translateObj[type][value] ? translateObj[type][value] : value; }
      returnObj.push(item);
    });

    return returnObj;
  }

  public formatPageName(pageName: string): { original: string, formated: string } {
    return { formated: CollaboratorsTranslate.get().pages[pageName] ? CollaboratorsTranslate.get().pages[pageName] : pageName, original: pageName };
  }

  public mountPermissionsObj(obj) {

    const permissions = Utilities.deepClone(obj);

    $$(obj).map((pageName, pageData) => {
      if (pageData) {
        if (permissions[pageName]._status) {
          $$(pageData).map((option, optionValue) => {
            if (PermissionsService.pageWithSubpages.indexOf(pageName) != -1) {
              if (permissions[pageName] && permissions[pageName][option]._status) {
                $$(optionValue).map((option2, optionValue) => {
                  permissions[pageName][option][option2] = [];
                  if (option2 == "sections" && optionValue && Object.values(optionValue).length && typeof Object.values(optionValue)[0] == "object" && PermissionsService.pageWithSectionsMap.indexOf(pageName) != -1) {
                    permissions[pageName][option][option2] = {};

                    $$(optionValue).map((sectionKey, sectionValue) => {

                      permissions[pageName][option][option2][sectionKey] = {};
                      permissions[pageName][option][option2][sectionKey]["actions"] = [];

                      $$(sectionValue.actions ? sectionValue.actions : []).map((key, value) => {
                        if (value && typeof value == "boolean") {
                          permissions[pageName][option][option2][sectionKey]["actions"].push(key);
                        }
                      });
                    });
                  } else if (option2 == "sections" && PermissionsService.pageWithSectionsMap.indexOf(pageName) == -1) {

                    permissions[pageName][option][option2] = [];

                    $$(optionValue).map((key, value) => {
                      if (value && typeof value == "boolean") {
                        permissions[pageName][option][option2].push(key);
                      }
                    });
                  } else {
                    if ($$(optionValue).length > 0) {
                      if (!Utilities.isArray(optionValue)) {
                        $$(optionValue).map((k, v) => {
                          if (v && permissions[pageName][option][option2].indexOf(k) === -1) {

                            permissions[pageName][option][option2].push(k);
                          }
                        });
                      }
                    }
                  }
                });

                delete permissions[pageName][option]._status;
              } else {
                if (permissions[pageName]) {
                  delete permissions[pageName][option];
                  if ($$(permissions[pageName]).length == 0) {

                    delete permissions[pageName];
                  }
                }
              }
            } else if (pageName == "reports") {

              const sectionName = option;
              const sectionData = optionValue;

              if (permissions[pageName] && permissions[pageName][sectionName]._status) {

                delete permissions[pageName][sectionName]._status;
                let hasCompleteObject = false;

                $$(sectionData.sections).map((subSectionName, subSectionData) => {

                  if (!permissions.reports[sectionName].sections[subSectionName]) {

                    delete permissions.reports[sectionName].sections[subSectionName];
                  } else {

                    if (permissions.reports[sectionName].sections[subSectionName]._status) {

                      delete permissions.reports[sectionName].sections[subSectionName]._status;

                      $$(subSectionData).map((typeName, typeData) => {
                        if (permissions.reports[sectionName].sections[subSectionName][typeName] != undefined) {
                          if (permissions.reports[sectionName].sections[subSectionName][typeName]._status) {

                            hasCompleteObject = true;
                            permissions.reports[sectionName].sections[subSectionName][typeName].fields = [];

                            permissions.reports[sectionName].sections[subSectionName][typeName].actions = [];

                            $$(typeData.fields).map((k, v) => {
                              if (v) {

                                permissions.reports[sectionName].sections[subSectionName][typeName].fields.push(k);
                              }
                            });

                            $$(typeData.actions || []).map((k, v) => {
                              if (v) {
                                permissions.reports[sectionName].sections[subSectionName][typeName].actions.push(k);
                              }
                            });

                            delete permissions.reports[sectionName].sections[subSectionName][typeName]._status;
                          } else {

                            delete permissions.reports[sectionName].sections[subSectionName][typeName];
                          }
                        }
                      });
                    } else {

                      delete permissions.reports[sectionName].sections[subSectionName];
                    }
                  }

                });

                if (!hasCompleteObject) {

                  delete permissions[pageName][sectionName];
                }
              } else {
                if (permissions[pageName]) {
                  delete permissions[pageName][sectionName];
                  if ($$(permissions[pageName]).length == 0) {

                    delete permissions[pageName];
                  }
                }
              }
            } else if (pageName == "crm") {
              // TRATAMENTO ESPECIAL PARA CRM
              // Estrutura final do CRM
              const crmResult = {
                actions: [],
                modules: [],
                fields: []
              };

              // Processar cada módulo do CRM
              $$(pageData).map((moduleName, moduleData) => {
                if (moduleData && moduleData._status) {
                  // Adicionar módulo à lista
                  crmResult.modules.push(moduleName);

                  // Processar actions e fields do módulo
                  $$(moduleData).map((key, value) => {
                    if (key === "actions" && value) {
                      $$(value).map((action, isActive) => {
                        if (isActive && typeof isActive === "boolean" && crmResult.actions.indexOf(action) === -1) {
                          crmResult.actions.push(action);
                        }
                      });
                    } else if (key === "fields" && value) {
                      $$(value).map((field, isActive) => {
                        if (isActive && typeof isActive === "boolean" && crmResult.fields.indexOf(field) === -1) {
                          crmResult.fields.push(field);
                        }
                      });
                    }
                  });
                }
              });

              // Se a página CRM estiver selecionada porém nenhum módulo foi
              // marcado individualmente, devemos interpretar como acesso
              // completo ao CRM. Isso evita que o usuário veja apenas itens
              // com permissão "view" (Dashboard, Aniversários e Link Público)
              // mesmo após marcar o CRM como ativo no formulário de permissões.

              if (crmResult.modules.length > 0 || crmResult.actions.length > 0) {
                // Existem módulos selecionados normalmen
                permissions[pageName] = crmResult;
              } else if (pageData && pageData._status) {
                permissions[pageName] = crmResult;
              } else {
                delete permissions[pageName];
              }
            } else {

              permissions[pageName][option] = []

              if (!Utilities.isArray(optionValue)) {
                $$(optionValue).map((k, v) => {
                  if (v && permissions[pageName][option].indexOf(k) == -1) {

                    permissions[pageName][option].push(k);
                  }
                });
              }
            }
          });

          if (permissions[pageName]) { delete permissions[pageName]._status; }
        } else {

          delete permissions[pageName];
        }
      }
    });

    delete (<any>permissions).help;
    return permissions;
  }

  public getPermissionPages(permissions: IPermissions = null, all: boolean = false): { originalPagesNames: Array<string>, pagesNames: Array<string>, pagesData: Array<any>, subPagesNames: { [key: string]: Array<string> }, originalSubPagesNames: { [key: string]: Array<string> }, subPagesDatas: { [key: string]: any }, reportsPagesDatas: { [key: string]: any } } {

    let pagesNames: Array<string> = [];
    let originalPagesNames: Array<string> = [];
    let pagesDatas: Array<any> = [];

    let originalSubPagesNames: { [key: string]: Array<string> } = {};
    let subPagesNames: { [key: string]: Array<string> } = {};
    let subPagesDatas: { [key: string]: any } = {};

    let reportsPagesDatas: { [key: string]: any } = {};

    if (all) {
      permissions = Utilities.localStorage("allPermissions") as IPermissions;
    } else {
      permissions = permissions ? Utilities.deepClone(permissions) : (Utilities.localStorage("permissions")) ? Utilities.localStorage("permissions") : {} as IPermissions;
    }

    delete (<any>permissions).help;

    $$(permissions).map((k, value) => {
      const pageName = this.formatPageName(k);

      if (pageName.original === "branches") {
        if (localStorage.getItem("storeType") === "matrix") {
          if (originalPagesNames.indexOf(pageName.original) == -1) {

            originalPagesNames.push(pageName.original);
            pagesNames.push(pageName.formated);
            pagesDatas.push(value);
          }
        }
      } else if (PermissionsService.pageWithSubpages.indexOf(pageName.original) != -1) {
        if (originalPagesNames.indexOf(pageName.original) == -1) {

          pagesNames.push(pageName.formated);
          originalPagesNames.push(pageName.original);
          pagesDatas.push(value);
          subPagesNames[k] = [];
          subPagesDatas[k] = [];
          originalSubPagesNames[k] = [];

          $$(value).map((k2, value2) => {

            const pageName2 = this.formatPageName(k2);
            subPagesNames[k].push(pageName2.formated);
            originalSubPagesNames[k].push(pageName2.original);
            subPagesDatas[k][pageName2.original] = value2;
          });
        }
      } else if (pageName.original == "reports") {
        if (originalPagesNames.indexOf(pageName.original) == -1) {

          pagesNames.push(pageName.formated);
          originalPagesNames.push(pageName.original);
          pagesDatas.push(value);
          reportsPagesDatas = value;
        }
      } else {

        if (originalPagesNames.indexOf(pageName.original) == -1) {
          originalPagesNames.push(pageName.original);
          pagesNames.push(pageName.formated);
          pagesDatas.push(value);
        }
      }
    });

    return { originalPagesNames: originalPagesNames, pagesNames: pagesNames, pagesData: pagesDatas, subPagesNames: subPagesNames, originalSubPagesNames: originalSubPagesNames, subPagesDatas: subPagesDatas, reportsPagesDatas: reportsPagesDatas };
  }

  private static filterPermissions(data: any, projectSettings: any = null) {
    $$(data).map((key, value) => {

      projectSettings = projectSettings || ProjectSettings.companySettings();


      if (projectSettings.profile[key] == undefined) {

        delete data[key];
      } else if (PermissionsService.pageWithSubpages.includes(key) && !PermissionsService.pageWithWidgets.includes(key)) {

        const l = key[0].toUpperCase();

        key = key.substring(1);
        key = l + key;

        $$(value).map((key2) => {

          const components = (projectSettings.profile[key] && projectSettings.profile[key].components ? projectSettings.profile[key].components : {});
          const hasCompoents = !!(projectSettings.profile[key] && projectSettings.profile[key].components);

          if (!hasCompoents || hasCompoents && !components[key2] || !!(hasCompoents && components[key2]) && components[key2].status == false) {

            if (data[key] && data[key][key2] != undefined) {

              delete data[key][key2];
            }
          }
        });
      }
    });
    return data;
  }

  public static getDefaultAllUserPermission(filter: boolean = true, projectSettings: any = null): IPermissions {

    const data: any = {
      dashboard: {
        counters: {
          actions: [],
          fields: ["customers", "products"]
        },
        cashierResume: {
          actions: ["filterDataPerOperator"],
          fields: ["revenue", "sales", "inputs", "outputs", "costs"]
        },
        bestSellers: {
          actions: [],
          fields: []
        },
        stockAlert: {
          actions: [],
          fields: []
        },
        billsToPay: {
          actions: [],
          fields: []
        },
        requests: {
          actions: ["filterDataPerOperator"],
          fields: []
        },
        serviceOrders: {
          actions: ["filterDataPerOperator"],
          fields: []
        },
        billsToReceive: {
          actions: [],
          fields: []
        }
      },
      cashier: {
        cashierFront: {
          actions: ["openCashier", "closeCashier", "cashierResume"],
          fields: ["showOpeningValue", "editOpeningValue"],
          sections: {
            inputs: {
              actions: ["add", "delete", "cancel"],
              sections: []
            },
            outputs: {
              actions: ["add", "delete", "cancel"],
              sections: []
            },
            sales: {
              actions: ["edit", "cancel", "applyDiscount", "applyTax"]
            }
          }
        },
        cashierRegisters: {
          actions: [
            "changeOperator",
            "duplicateSales",
            // Novos toggles
            "viewAll",
            "editSales",
            "closeSales"
          ],
          fields: ["filterDataPerOperator"],
          sections: ["sales", "inputs", "outputs"]
        }
      },
      agenda: {
        actions: ["add", "edit", "delete", "filterDataPerOperator"], fields: []
      },
      requests: {
        actions: ["add", "edit", "delete", "filterDataPerOperator"], fields: []
      },
      serviceOrders: {
        actions: ["add", "edit", "delete", "cancel", "editPrice", "editServiceCostPrice", "assignTechnician", "filterDataPerOperator"], fields: []
      },
      socialDemands: {
        actions: ["add", "edit", "delete", "filterDataPerOperator"], fields: []
      },
      projects: {
        actions: ["add", "edit", "delete", "filterDataPerOperator"], fields: []
      },
      crafts: {
        actions: ["add", "edit", "delete", "filterDataPerOperator"], fields: []
      },
      groups: {
        actions: ["add", "edit", "delete", "filterDataPerOperator"], fields: []
      },
      classrooms: {
        actions: ["add", "edit", "delete", "filterDataPerOperator"], fields: []
      },
      tithes: {
        actions: ["add", "edit", "delete", "filterDataPerOperator"], fields: []
      },
      donations: {
        actions: ["add", "edit", "delete", "filterDataPerOperator"], fields: []
      },
      kitchen: {
        actions: ["add", "edit", "delete", "filterDataPerOperator"], fields: []
      },
      menu: {
        actions: ["add", "edit", "delete", "filterDataPerOperator"], fields: []
      },
      informations: {
        actions: ["edit"], sections: []
      },
      stock: {
        products: {
          actions: ["add", "edit", "delete"],
          fields: ["code", "name", "quantity", "salePrice", "costPrice", "alert", "category", "type", "thumbnail"],
          sections: ["stockAdjustment", "generateTickets", "dataImport"]
        },
        purchases: {
          actions: ["add", "edit", "cancel", "delete"],
          fields: ["filterDataPerOperator"]
        },
        transfers: {
          actions: ["add", "edit", "accept", "cancel", "delete", "filterDataPerOperator"],
          fields: ["costPrice"]
        }
      },
      financial: {
        billsToPay: {
          actions: ["add", "edit", "delete"],
          fields: []
        },
        billsToReceive: {
          actions: ["add", "edit", "delete"],
          fields: []
        },
        bankAccounts: {
          actions: ["add", "edit", "delete"],
          fields: []
        },
      },
      registers: {
        customers: {
          actions: ["add", "edit", "delete"],
          fields: []
        },
        members: {
          actions: ["add", "edit", "delete"],
          fields: []
        },
        voters: {
          actions: ["add", "edit", "delete"],
          fields: []
        },
        collaborators: {
          actions: ["add", "edit", "delete"],
          fields: [],
          sections: ["collaboratorProfiles"]
        },
        providers: {
          actions: ["add", "edit", "delete"],
          fields: []
        },
        carriers: {
          actions: ["add", "edit", "delete"],
          fields: []
        },
        partners: {
          actions: ["add", "edit", "delete"],
          fields: []
        },
        branches: {
          actions: ["add", "edit", "delete"],
          fields: []
        },
        services: {
          actions: ["add", "edit", "delete"],
          fields: []
        },
        paymentMethods: {
          actions: ["add", "edit", "delete"],
          fields: []
        },
      },
      // CORREÇÃO: ADICIONADO CRM AQUI
      // CORREÇÃO: ADICIONADO CRM AQUI COM ANIVERSÁRIOS
      crm: {
        leads: {
          actions: ["add", "edit", "delete", "view"],
          fields: ["value", "notes", "assignedTo"]
        },
        activities: {
          actions: ["add", "edit", "delete", "view"],
          fields: ["description", "scheduledDate", "priority"]
        },
        pipeline: {
          actions: ["view", "edit"],
          fields: []
        },
        dashboard: {
          actions: ["view"],
          fields: []
        },
        aniversarios: {
          actions: ["view", "send"],
          fields: ["customerData", "phoneNumber"]
        }
      },
      reports: {
        cashier: {
          sections: {
            resume: {
              default: {
                actions: ["filterDataPerOperator", "downloadReport", "filterPersonalized", "filterWeek", "filterMonth", "filterLastMonth"],
                fields: ["sales", "inputs", "outputs", "servicesCosts", "productsCosts", "paymentsCosts", "totalCosts", "partialRevenue", "finalRevenue"]
              }
            },
            sales: {
              salesReportSynthetic: {
                actions: ["filterDataPerOperator", "downloadReport", "filterPersonalized", "filterWeek", "filterMonth", "filterLastMonth"],
                fields: ["number", "billed", "salesTotal", "servicesCosts", "productsCosts", "paymentsCosts", "totalCosts", "totalUnbilled", "partialRevenue", "finalRevenue"]
              },
              salesReportAnalytical: {
                actions: ["filterDataPerOperator", "downloadReport", "filterPersonalized", "filterWeek", "filterMonth", "filterLastMonth"],
                // 🎯 ADICIONE "commission" NO FINAL DA LISTA DE FIELDS:
                fields: ["serviceCode", "customer", "collaborator", "services", "products", "paymentMethods", "discount", "fee", "saleValue", "unbilledValue", "servicesCosts", "productsCosts", "paymentsCosts", "totalCosts", "partialRevenue", "finalRevenue", "commission"]
              },
              paymentMethodsSynthetic: {
                actions: ["filterDataPerOperator", "downloadReport", "filterPersonalized", "filterWeek", "filterMonth", "filterLastMonth"],
                fields: ["paymentMethod", "cost", "value", "revenue"]
              },
              paymentMethodsAnalytical: {
                actions: ["filterDataPerOperator", "downloadReport", "filterPersonalized", "filterWeek", "filterMonth", "filterLastMonth"],
                fields: ["saleCode", "paymentMethod", "note", "fee", "cost", "value", "revenue"]
              },
              salesPerUserSynthetic: {
                actions: ["filterDataPerOperator", "downloadReport", "filterPersonalized", "filterWeek", "filterMonth", "filterLastMonth", "filterPerProvider", 'filterPerCategory', 'filterPerProducts',],
                fields: []
              },
              salesPerUserAnalytical: {
                actions: ["filterDataPerOperator", "downloadReport", "filterPersonalized", "filterWeek", "filterMonth", "filterLastMonth", 'filterPerProvider', 'filterPerCategory', 'filterPerProducts'],
                fields: []
              }
            },
            inflows: {
              inflowsReportSynthetic: {
                actions: ["filterDataPerOperator", "downloadReport", "filterPersonalized", "filterWeek", "filterMonth", "filterLastMonth"],
                fields: ["outputsQuantity", "total"]
              },
              inflowsReportAnalytical: {
                actions: ["filterDataPerOperator", "downloadReport", "filterPersonalized", "filterWeek", "filterMonth", "filterLastMonth"],
                fields: ["code", "referenceCode", "collaborator", "category", "note", "value"]
              }
            },
            outflows: {
              outflowsReportSynthetic: {
                actions: ["filterDataPerOperator", "downloadReport", "filterPersonalized", "filterWeek", "filterMonth", "filterLastMonth"],
                fields: ["outputsQuantity", "total"]
              },
              outflowsReportAnalytical: {
                actions: ["filterDataPerOperator", "downloadReport", "filterPersonalized", "filterWeek", "filterMonth", "filterLastMonth"],
                fields: ["code", "referenceCode", "collaborator", "category", "note", "value"]
              }
            },
            afterSales: {
              default: {
                actions: ["filterDataPerOperator", "downloadReport", "filterPersonalized", "filterWeek", "filterMonth", "filterLastMonth"],
                fields: ["saleCode", "serviceCode", "customer", "collaborator", "phone", 'email', "services", "products", "value"]
              }
            },
            historic: {}
          }
        },
        servicesOrders: {
          sections: {
            resume: {
              default: {
                actions: ["filterDataPerOperator", "downloadReport", "filterPersonalized", "filterWeek", "filterMonth", "filterLastMonth"],
                fields: ["servicesCosts", "productsCosts", "totalCosts", "partialRevenue", "finalRevenue"]
              }
            },
            internal: {
              servicesInternalReportSynthetic: {
                actions: ["filterDataPerOperator", "downloadReport", "filterPersonalized", "filterWeek", "filterMonth", "filterLastMonth"],
                fields: ["servicesCosts", "productsCosts", "totalCosts", "partialRevenue", "finalRevenue"]
              },
              servicesInternalReportAnalytical: {
                actions: ["filterDataPerOperator", "downloadReport", "filterPersonalized", "filterWeek", "filterMonth", "filterLastMonth"],
                fields: ["collaborator", "customer", "services", "products", "discount", "fee", "servicesCosts", "productsCosts", "totalCosts", "partialRevenue", "finalRevenue"]
              }
            },
            external: {
              servicesExternalReportSynthetic: {
                actions: ["filterDataPerOperator", "downloadReport", "filterPersonalized", "filterWeek", "filterMonth", "filterLastMonth"],
                fields: ["servicesCosts", "productsCosts", "totalCosts", "partialRevenue", "finalRevenue"]
              },
              servicesExternalReportAnalytical: {
                actions: ["filterDataPerOperator", "downloadReport", "filterPersonalized", "filterWeek", "filterMonth", "filterLastMonth"],
                fields: ["collaborator", "customer", "services", "products", "discount", "fee", "servicesCosts", "productsCosts", "totalCosts", "partialRevenue", "finalRevenue"]
              }
            },
            curveABC: {
              default: {
                actions: ["filterDataPerOperator", "downloadReport", "filterPersonalized", "filterWeek", "filterMonth", "filterLastMonth"],
                fields: ["averageCost", "averagePrice", "revenue"]
              }
            }
          }
        },
        stock: {
          sections: {
            products: {
              default: {
                actions: ["downloadReport"],
                fields: ["category", "provider", "quantity", "alert", "costPrice", "salePrice", "totalCost", "totalSale", "contributionMargin"]
              }
            },
            validity: {
              default: {
                actions: ["downloadReport"],
                fields: ["code", "name", "batch", "expirationDate", "quantity"]
              }
            },
            purchases: {
              completedPurchases: {
                actions: ["filterDataPerOperator", "downloadReport", "filterPersonalized", "filterWeek", "filterMonth", "filterLastMonth"],
                fields: ["provider", "products", "purchaseAmount", "totalCost", "totalSale", "contributionMargin"]
              },
              pendingPurchases: {
                actions: ["filterDataPerOperator", "downloadReport", "filterPersonalized", "filterWeek", "filterMonth", "filterLastMonth"],
                fields: ["provider", "products", "purchaseAmount", "totalCost", "totalSale", "contributionMargin"]
              },
              purchasedProducts: {
                actions: ["filterDataPerOperator", "downloadReport", "filterPersonalized", "filterWeek", "filterMonth", "filterLastMonth"],
                fields: ["provider", "category", "quantity", "costPrice", "salePrice", "totalCost", "totalSale", "contributionMargin"]
              }
            },
            transfers: {
              completedTransfers: {
                actions: ["filterDataPerOperator", "downloadReport", "filterPersonalized", "filterWeek", "filterMonth", "filterLastMonth"],
                fields: ["origin", "destination", "products", "transferAmount", "totalCost", "totalSale"]
              },
              pendingTransfers: {
                actions: ["filterDataPerOperator", "downloadReport", "filterPersonalized", "filterWeek", "filterMonth", "filterLastMonth"],
                fields: ["origin", "destination", "products", "transferAmount", "totalCost", "totalSale"]
              },
              transferedProducts: {
                actions: ["filterDataPerOperator", "downloadReport", "filterPersonalized", "filterWeek", "filterMonth", "filterLastMonth"],
                fields: ["origin", "destination", "name", "category", "quantity", "costPrice", "salePrice", "totalCost", "totalSale"]
              }
            },
            stockLogs: {
              default: {
                actions: ["filterDataPerOperator", "downloadReport", "filterPersonalized", "filterWeek", "filterMonth", "filterLastMonth"],
                fields: ["productCode", "collaborator", "type", "note", "operation", "quantity", "action"]
              }
            },
            curveABC: {
              default: {
                actions: ["filterDataPerOperator", "downloadReport", "filterPersonalized", "filterWeek", "filterMonth", "filterLastMonth"],
                fields: ["averageCost", "averagePrice", "revenue"]
              }
            }
          }
        },
        financial: {
          sections: {
            cashFlow: {
              default: {
                actions: ["filterDataPerOperator", "downloadReport", "filterPersonalized", "filterWeek", "filterMonth", "filterLastMonth"],
                fields: []
              }
            },
            billsToPay: {
              paidAccounts: {
                actions: ["downloadReport", "filterPersonalized", "filterWeek", "filterMonth", "filterLastMonth"],
                fields: []
              },
              pendentAccounts: {
                actions: ["downloadReport", "filterPersonalized", "filterWeek", "filterMonth", "filterLastMonth"],
                fields: []
              },
              expireAccounts: {
                actions: ["downloadReport", "filterPersonalized", "filterWeek", "filterMonth", "filterLastMonth"],
                fields: []
              }
            },
            billsToReceive: {
              receivedAccounts: {
                actions: ["downloadReport", "filterPersonalized", "filterWeek", "filterMonth", "filterLastMonth"],
                fields: []
              },
              pendentAccounts: {
                actions: ["downloadReport", "filterPersonalized", "filterWeek", "filterMonth", "filterLastMonth"],
                fields: []
              },
              expireAccounts: {
                actions: ["downloadReport", "filterPersonalized", "filterWeek", "filterMonth", "filterLastMonth"],
                fields: []
              }
            },
            bankTransactions: {
              default: {
                actions: ["downloadReport", "filterPersonalized", "filterWeek", "filterMonth", "filterLastMonth"],
                fields: []
              }
            }
          }
        },
        several: {
          sections: {
            systemLogs: {
              default: {
                actions: ["filterDataPerOperator"],
                fields: ["code", "referenceCode", "collaborator", "origin", "description", "action"]
              }
            }
          }
        }
      },
      fiscal: {
        actions: ["edit"],
        fields: []
      },
      settings: {
        actions: ["add", "edit", "delete"],
        sections: ["general", "servicesOrders", "cashier"]
      }
    };

    if (filter) {
      PermissionsService.filterPermissions(data, projectSettings);
    }

    return data;
  }

}
