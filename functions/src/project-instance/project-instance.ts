// Arquivo: project-instance.ts
// Localização: src/functions/project-instance/project-instance.ts

import { Functions } from "../@default/functions/functions";
import { iTools } from "../@default/iTools";
import { CompanyProfile } from "./company-profiles";

const json = {
  "secretKey": "1da392a6-89d2-3304-a8b7-959572c7e44e",
  "companyName": "iPartts",
  "projectId": "bm-test",
  "language": "pt_BR",
  "currency": "BRL",
  "timezone": "America/Sao_Paulo",
  "profile": {
    "name": "Commerce",
    "data": {}
  },
  "stores": [{
    "_id": "matrix",
    "name": "Matriz / Filial01 (iSystem Anps)",
    "billingName": "iSytem Aparelhos",
    "limitUsers": 10,
    "limitBranches": 0,
    "limitDevices": 1,
    "contacts": {
      "whatsapp": "(62) 9 9275-6065",
      "email": "iparttsdeveloper@gmail.com",
      "phone": "(62) 3702-3772"
    },
    "address": {
      "postalCode": "75110-810",
      "city": "Anápolis",
      "country": "Brazil",
      "state": "GO",
      "addressLine": "Av São Francisco de Assis Nº 278 Bairro Jundiaí"
    },
    "cnpj": "31.126.304/0001-23"
  }]
};

export class ProjectInstance {

  public static createProjectInstance(request: any, response: any) {

    Functions.parseRequestBody(request);

    const body = request.body;

    const secretKey = body.secretKey;

    if (secretKey != "1da392a6-89d2-3304-a8b7-959572c7e44e") {
      response.send({ error: "SecretKey is Invalid" });
      return;
    }


    const managerInstance = new iTools();
    managerInstance.initializeApp({
      projectId: "projects-manager"
    });


    const projectId = (body.projectId + "").toString().trim().toLowerCase();

    const language = body.language ?? "pt_BR";
    const currency = body.currency ?? "BRL";
    const timezone = body.timezone ?? "America/Sao_Paulo";
    const country = body.country ?? "BR";

    const stores = body.stores || [];

    // console.log(stores.length);

    if (stores.length == 0) {
      response.send({
        status: false,
        message: "Nehuma loja foi definida"
      });
      return;
    }


    const adminEmail = stores[0]?.contacts?.email || "iparttsdeveloper@gmail.com";

    try {
      managerInstance.database().collection("Projects").doc(projectId).get().then(async (res) => {

        const sourceProjectInfo = res.data();

        if (sourceProjectInfo && sourceProjectInfo._id) {
          response.send({ error: "Já existe um projeto com esse id", status: false });
          return;
        }


        const project = {
          companyName: body.companyName,
          functionsContext: "default",
          database: {
            name: projectId,
            isLocked: false
          },
          uploadKey: "d3c4b5e5394q3adf521",
          adminKey: {
            type: "customer",
            key: "0asc4b5e78994q3ad90235"
          },
          profile: (() => {
            body.profile = body.profile || {};

            let profileName = body.profile.name ? body.profile.name.toString() : "";
            profileName = profileName[0].toUpperCase() + profileName.substring(1);

            let obj = CompanyProfile[profileName] || {};

            obj = { ...obj, ...(body.profile.data || {}) }

            return obj;
          })(),
          profileName: body.profile.name || "Commerce/Fiscal", // SALVA O NOME DO PROFILE
          currency: currency,
          language: language,
          timezone: timezone,
          country: country,
          workshop: (() => {
            if (!body.workshop || typeof body.workshop !== "object") {
              return {};
            }
            return body.workshop;
          })(),
          createdAt: iTools.FieldValue.date("America/Sao_Paulo") // DATA DE CRIAÇÃO
        };

        const codes: any[] = [];

        const generateBrancheCode = () => {

          const generateCode = (length: number = 4) => {

            let randOrd = () => { return (Math.round(Math.random()) - 0.5); };

            let hexDec = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", 'a', 'b', 'c', 'd', 'e', 'f'];
            let code = "";

            for (let i = 0; i < length; i++) {

              hexDec = hexDec.sort(randOrd);
              code += hexDec[0];
            }

            return code;
          }

          const codes: Array<string> = [];

          let code = "branch-" + generateCode(4);

          while (codes.indexOf(code) !== -1) {

            code = "branch-" + generateCode(4);
          }

          return code;
        }


        const SYSTEM_AUTHENTICATE = [
          {
            "_id": iTools.ObjectId(),
            "email": "iparttsdefault@gmail.com",
            "password": "88b741816ab376e3c7f9fd2337ec67494efe9e0e5b92aaa14991048be0e995d2"
          },
          {
            "_id": iTools.ObjectId(),
            "email": adminEmail,
            "password": "f83c3465e24ea02276cd5b696ee9bba95854ab43dd02f0a91b152f4c715ccd17"
          }
        ]


        // const Collaborators = [];

        const RegistersPaymentMethods = [
          {
            "_id": iTools.ObjectId(),
            "name": language == "en" ? "CASH" : "DINHEIRO",
            "code": 1000,
            "owner": "matrix",
            "registerDate": iTools.FieldValue.date("America/Sao_Paulo"),
            "modifiedDate": iTools.FieldValue.date("America/Sao_Paulo"),
            "_isDefault": true,
            "bankAccount": { "_id": "60f1a68f6df8abf0ed39eb25", "code": "@0001", "name": language == "en" ? "COMPANY CASHIER" : "Caixa da Empresa", "account": "000000", "agency": "0000" }
          },
          {
            "_id": iTools.ObjectId(),
            "code": 2000,
            "name": language == "en" ? "BANK SLIP" : "BOLETO",
            "owner": "matrix",
            "registerDate": iTools.FieldValue.date("America/Sao_Paulo"),
            "modifiedDate": iTools.FieldValue.date("America/Sao_Paulo"),
            "_isDefault": true,
            "bankAccount": { "_id": "60f1a68f6df8abf0ed39eb25", "code": "@0001", "name": language == "en" ? "COMPANY CASHIER" : "Caixa da Empresa", "account": "000000", "agency": "0000" }
          },
          {
            "_id": iTools.ObjectId(),
            "code": 3000,
            "providers": {}, "_lastProviderCode": "",
            "name": language == "en" ? "DEBIT CARD" : "CARTÂO DE DÉBITO",
            "owner": "matrix",
            "registerDate": iTools.FieldValue.date("America/Sao_Paulo"),
            "modifiedDate": iTools.FieldValue.date("America/Sao_Paulo"),
            "_isDefault": true
          },
          {
            "_id": iTools.ObjectId(),
            "_lastProviderCode": "",
            "providers": {},
            "name": language == "en" ? "CREDIT CARD" : "CARTÂO DE CRÉDITO",
            "code": 4000,
            "owner": "matrix",
            "registerDate": iTools.FieldValue.date("America/Sao_Paulo"),
            "modifiedDate": iTools.FieldValue.date("America/Sao_Paulo"),
            "_isDefault": true
          },
          {
            "_id": iTools.ObjectId(),
            "code": 5000, "name": language == "en" ? "CHECK" : "CHEQUE",
            "owner": "matrix",
            "registerDate": iTools.FieldValue.date("America/Sao_Paulo"),
            "modifiedDate": iTools.FieldValue.date("America/Sao_Paulo"),
            "_isDefault": true,
            "bankAccount": { "_id": "60f1a68f6df8abf0ed39eb25", "code": "@0001", "name": language == "en" ? "COMPANY CASHIER" : "Caixa da Empresa", "account": "000000", "agency": "0000" }
          },
          {
            "_id": iTools.ObjectId(),
            "code": 6000,
            "uninvoiced": true,
            "name": language == "en" ? "EXCHANGE" : "PERMUTA",
            "owner": "matrix",
            "registerDate": iTools.FieldValue.date("America/Sao_Paulo"),
            "modifiedDate": iTools.FieldValue.date("America/Sao_Paulo"),
            "_isDefault": true,
            "bankAccount": { "_id": "60f1a68f6df8abf0ed39eb25", "code": "@0001", "name": language == "en" ? "COMPANY CASHIER" : "Caixa da Empresa", "account": "000000", "agency": "0000" }
          },
          {
            "_id": iTools.ObjectId(),
            "_lastProviderCode": "",
            "providers": {},
            "name": language == "en" ? "TRANFER" : "TRANSFERÊNCIA",
            "code": 7000,
            "owner": "matrix",
            "registerDate": iTools.FieldValue.date("America/Sao_Paulo"),
            "modifiedDate": iTools.FieldValue.date("America/Sao_Paulo"),
            "_isDefault": true
          },
          {
            "_id": iTools.ObjectId(),
            "_lastProviderCode": "",
            "providers": {},
            "name": language == "en" ? "PIX" : "PIX",
            "code": 8000,
            "owner": "matrix",
            "registerDate": iTools.FieldValue.date("America/Sao_Paulo"),
            "modifiedDate": iTools.FieldValue.date("America/Sao_Paulo"),
            "_isDefault": true
          },
          {
            "_id": iTools.ObjectId(),
            "_lastProviderCode": "",
            "providers": {},
            "name": language == "en" ? "STORE CREDIT" : "CREDIÁRIO",
            "code": 9000,
            "owner": "matrix",
            "registerDate": iTools.FieldValue.date("America/Sao_Paulo"),
            "modifiedDate": iTools.FieldValue.date("America/Sao_Paulo"),
            "_isDefault": true
          },
        ];

        const FinancialBillToPayCategories = [
          { "_id": iTools.ObjectId(), "code": "@0002", "name": language == "en" ? "TRANSFER" : "TRANSFERÊNCIA", "owner": "matrix", "registerDate": iTools.FieldValue.date("America/Sao_Paulo"), "modifiedDate": iTools.FieldValue.date("America/Sao_Paulo"), "_isDefault": true },
          { "_id": iTools.ObjectId(), "name": language == "en" ? "PURCHASE OF MERCHANDISE" : "COMPRA DE MERCADORIA", "code": "@0001", "owner": "matrix", "registerDate": iTools.FieldValue.date("America/Sao_Paulo"), "modifiedDate": iTools.FieldValue.date("America/Sao_Paulo"), "_isDefault": true }
        ];

        const FinancialBillToReceiveCategories = [
          { "_id": iTools.ObjectId(), "name": language == "en" ? "PAYMENT METHOD" : "MEIO DE PAGAMENTO", "code": "@0002", "owner": "matrix", "registerDate": iTools.FieldValue.date("America/Sao_Paulo"), "modifiedDate": iTools.FieldValue.date("America/Sao_Paulo"), "_isDefault": true },
          { "_id": iTools.ObjectId(), "name": language == "en" ? "TRANSFER" : "TRANSFERÊNCIA", "code": "@0003", "owner": "matrix", "registerDate": iTools.FieldValue.date("America/Sao_Paulo"), "modifiedDate": iTools.FieldValue.date("America/Sao_Paulo"), "_isDefault": true },
          { "_id": iTools.ObjectId(), "allowSelection": false, "allowModification": false, "code": "@0001", "name": language == "en" ? "PENDENT SALE" : "VENDA PENDENTE", "owner": "matrix", "registerDate": iTools.FieldValue.date("America/Sao_Paulo"), "modifiedDate": iTools.FieldValue.date("America/Sao_Paulo"), "_isDefault": true }
        ];

        const FinancialBankAccounts = [
          { "_id": iTools.ObjectId(), "_isDefault": true, "account": "000000", "agency": "0000", "balance": 0, "code": "@0001", "modifiedDate": iTools.FieldValue.date("America/Sao_Paulo"), "name": language == "en" ? "COMPANY CASHIER" : "Caixa da Empresa", "owner": "matrix", "registerDate": iTools.FieldValue.date("America/Sao_Paulo") }
        ];


        const RegistersCollaborators = [
          { "_id": iTools.ObjectId(), "username": "matrixadmin", "allowAccess": true, "image": "", "email": adminEmail, "usertype": "admin", "name": "Matrix Admin", "registerDate": iTools.FieldValue.date("America/Sao_Paulo"), "modifiedDate": iTools.FieldValue.date("America/Sao_Paulo"), "owner": "matrix", "code": "@1", "source": "root" }
        ];


        if (stores && stores.length > 0) {
          if (!stores[0]._id) {
            stores[0]._id = "matrix";
          }
        }

        const logins: any[] = [];

        stores.forEach((item, index) => {

          item._id = item._id ? item._id : generateBrancheCode();

          codes.push(item._id);

          if (item._id == "matrix") {
            item.isPaid = true;
            logins.push([{ username: "matrixadmin", password: 21211212, store: item.name }])
          } else {

            FinancialBillToPayCategories.push({ "_id": iTools.ObjectId(), "code": "@0002", "name": language == "en" ? "TRANSFER" : "TRANSFERÊNCIA", "owner": item._id, "registerDate": iTools.FieldValue.date("America/Sao_Paulo"), "modifiedDate": iTools.FieldValue.date("America/Sao_Paulo"), "_isDefault": true });
            FinancialBillToPayCategories.push({ "_id": iTools.ObjectId(), "name": language == "en" ? "PURCHASE OF MERCHANDISE" : "COMPRA DE MERCADORIA", "code": "@0001", "owner": item._id, "registerDate": iTools.FieldValue.date("America/Sao_Paulo"), "modifiedDate": iTools.FieldValue.date("America/Sao_Paulo"), "_isDefault": true });

            FinancialBillToReceiveCategories.push({ "_id": iTools.ObjectId(), "name": language == "en" ? "PAYMENT METHOD" : "MEIO DE PAGAMENTO", "code": "@0002", "owner": item._id, "registerDate": iTools.FieldValue.date("America/Sao_Paulo"), "modifiedDate": iTools.FieldValue.date("America/Sao_Paulo"), "_isDefault": true });
            FinancialBillToReceiveCategories.push({ "_id": iTools.ObjectId(), "name": language == "en" ? "TRANSFER" : "TRANSFERÊNCIA", "code": "@0003", "owner": item._id, "registerDate": iTools.FieldValue.date("America/Sao_Paulo"), "modifiedDate": iTools.FieldValue.date("America/Sao_Paulo"), "_isDefault": true });
            FinancialBillToReceiveCategories.push({ "_id": iTools.ObjectId(), "allowSelection": false, "allowModification": false, "code": "@0001", "name": language == "en" ? "PENDENT SALE" : "VENDA PENDENTE", "owner": item._id, "registerDate": iTools.FieldValue.date("America/Sao_Paulo"), "modifiedDate": iTools.FieldValue.date("America/Sao_Paulo"), "_isDefault": true });

            FinancialBankAccounts.push({ "_id": iTools.ObjectId(), "_isDefault": true, "account": "000000", "agency": "0000", "balance": 0, "code": "@0001", "modifiedDate": iTools.FieldValue.date("America/Sao_Paulo"), "name": language == "en" ? "COMPANY CASHIER" : "Caixa da Empresa", "owner": item._id, "registerDate": iTools.FieldValue.date("America/Sao_Paulo") });

            const branchadminEmail = item?.contacts?.email || "iparttsdeveloper@gmail.com";

            SYSTEM_AUTHENTICATE.push({
              "_id": iTools.ObjectId(),
              "email": branchadminEmail,
              "password": "f83c3465e24ea02276cd5b696ee9bba95854ab43dd02f0a91b152f4c715ccd17"
            });



            const storeCode = item._id.split("-")[1];
            const username = stores.length > 2 ? `branchadmin${index}-${storeCode}` : `branchadmin-${storeCode}`;


            logins.push({ username: username, password: 21211212, store: item.name });

            RegistersCollaborators.push(
              { "_id": iTools.ObjectId(), "username": username, "allowAccess": true, "image": "", "email": branchadminEmail, "usertype": "admin", "name": "Branch Admin", "registerDate": iTools.FieldValue.date("America/Sao_Paulo"), "modifiedDate": iTools.FieldValue.date("America/Sao_Paulo"), "owner": item._id, "code": "@1", "source": "root" }
            );

          }
        });



        const SystemControls = [
          {
            _id: "common",
            "RegistersPaymentMethods": { "code": 8000 }
          }
        ];

        const Settings = [{
          "_id": "serviceOrders",
          "scheme": "technicalAssistance"
        }, {
          // Store-scoped settings (defaults). Frontend reads Settings/{storeId}
          "_id": stores[0]?._id || "matrix",
          "stock": { "allowNegativeSale": false }
        }];


        const Stores = stores;


        const importData = {
          "#SYSTEM_AUTHENTICATE#": SYSTEM_AUTHENTICATE,
          RegistersCollaborators: RegistersCollaborators,
          RegistersPaymentMethods: RegistersPaymentMethods,
          FinancialBillToPayCategories: FinancialBillToPayCategories,
          FinancialBillToReceiveCategories: FinancialBillToReceiveCategories,
          FinancialBankAccounts: FinancialBankAccounts,
          SystemControls: SystemControls,
          Settings: Settings,
          Stores: Stores
        };


        managerInstance.database().collection("Projects").doc(projectId).update(project).then(() => {

          const instance = new iTools();
          instance.initializeApp({
            projectId: projectId
          });

          const batch = instance.database().batch();

          SYSTEM_AUTHENTICATE.forEach((item) => {
            batch.update({ docName: item._id, collName: "#SYSTEM_AUTHENTICATE#" }, item);
          });

          RegistersPaymentMethods.forEach((item) => {
            batch.update({ docName: item._id, collName: "RegistersPaymentMethods" }, item);
          });

          FinancialBillToPayCategories.forEach((item) => {
            batch.update({ docName: item._id, collName: "FinancialBillToPayCategories" }, item);
          });

          FinancialBillToReceiveCategories.forEach((item) => {
            batch.update({ docName: item._id, collName: "FinancialBillToReceiveCategories" }, item);
          });

          FinancialBankAccounts.forEach((item) => {
            batch.update({ docName: item._id, collName: "FinancialBankAccounts" }, item);
          });

          Settings.forEach((item) => {
            batch.update({ docName: item._id, collName: "Settings" }, item);
          });

          Stores.forEach((item) => {
            batch.update({ docName: item._id, collName: "Stores" }, item);
          });

          SystemControls.forEach((item) => {
            batch.update({ docName: item._id, collName: "SystemControls" }, item);
          });

          RegistersCollaborators.forEach((item) => {
            batch.update({ docName: item._id, collName: "RegistersCollaborators" }, item);
          });


          batch.commit().then(async (res) => {

            await managerInstance.database().collection("Projects").doc(projectId).update({
              database: {
                isLocked: true
              },
            }, { merge: true });

            response.send({ data: { logins: logins, url: `https://smartgestor.ipartts.com/${projectId}` }, status: true });
            managerInstance.close();
            instance.close();
          }).catch(error => {
            response.send({ error: error.message, status: false });
            managerInstance.close();
            instance.close();
          });

          // response.send({data: {url: `https://smartgestor.ipartts.com/${projectId}`}, status: true});
          // instance.database().importData(importData).then((res)=>{
          //   instance.close();
          //   response.send({data: {username: "matrixadmin", password: "21211212", url: `https://smartgestor.ipartts.com/${projectId}`}, status: true});
          // }).catch((error)=>{
          //   instance.close();
          //   response.send({error: error.message, status: false});
          // });
        }).catch(error => {

          response.send({ error: error.message, status: false });
          managerInstance.close();
        });

      }).catch(error => {
        // console.log(error);

        response.send({
          status: false,
          message: error.message
        });

        managerInstance.close();
      });

    } catch (error) {

      // console.log(error);

      response.send({
        status: false,
        message: error.message
      });

      managerInstance.close();
    }
  };

  public static updateInstanceStatus(request: any, response: any) {
    // Parse do body da requisição
    Functions.parseRequestBody(request);

    const body = request.body;
    const secretKey = body.secretKey;

    // Validação da chave secreta
    if (secretKey != "1da392a6-89d2-3304-a8b7-959572c7e44e") {
      response.send({
        status: false,
        error: "SecretKey is Invalid"
      });
      return;
    }

    // Validação dos campos obrigatórios
    const projectId = body.projectId;
    const isPaid = body.isPaid;

    if (!projectId || typeof isPaid !== 'boolean') {
      response.send({
        status: false,
        error: "Missing required fields: projectId and isPaid (boolean)"
      });
      return;
    }

    console.log(`Updating instance ${projectId} - isPaid: ${isPaid}`);

    try {

      const managerInstance = new iTools();
      managerInstance.initializeApp({
        projectId: "projects-manager"
      });

      // Atualiza no projects-manager para manter sincronizado
      managerInstance.database().collection("Projects").doc(projectId).update({
        database: {
          isLocked: false
        },
        isPaid: isPaid,  // SALVA O isPaid NO PROJECTS-MANAGER
        lastStatusUpdate: iTools.FieldValue.date("America/Sao_Paulo")
      }, { merge: true }).then(() => {

        // Conecta na instância específica do projeto
        const instance = new iTools();
        instance.initializeApp({
          projectId: projectId
        });

        // Atualiza o campo isPaid no documento matrix da coleção Stores
        instance.database().collection("Stores").doc("matrix").update({
          isPaid: isPaid,
          lastStatusUpdate: iTools.FieldValue.date("America/Sao_Paulo"),
        }, { merge: true }).then(async () => {

          // Também atualiza no projects-manager para manter sincronizado
          await managerInstance.database().collection("Projects").doc(projectId).update({
            database: {
              isLocked: false
            },
            lastStatusUpdate: iTools.FieldValue.date("America/Sao_Paulo")
          }, { merge: true });

          // Sucesso - fecha as conexões e retorna

          response.send({
            status: true,
            message: "Instance status updated successfully",
            data: {
              projectId: projectId,
              isPaid: isPaid,
              updatedAt: new Date().toISOString()
            }
          });

          instance.close();
          managerInstance.close();
        }).catch((error) => {

          instance.close();
          managerInstance.close();
          console.error('Error updating instance:', error);
          response.send({
            status: false,
            error: "Failed to update instance: " + error.message
          });
        });

      }).catch((error) => {
        managerInstance.close();
        console.error('Error connect projects-manager:', error);
        response.send({
          status: false,
          error: "Failed to connect projects-manager: " + error.message
        });
      });

    } catch (error) {
      console.error('Error in updateInstanceStatus:', error);
      response.send({
        status: false,
        error: "Internal error: " + error.message
      });
    }
  }

  public static updateInstanceSettings(request: any, response: any) {

    Functions.parseRequestBody(request);

    const body = request.body || {};
    const secretKey = body.secretKey;

    if (secretKey != "1da392a6-89d2-3304-a8b7-959572c7e44e") {
      response.send({
        status: false,
        error: "SecretKey is Invalid"
      });
      return;
    }

    const projectId = body.projectId;
    if (!projectId) {
      response.send({
        status: false,
        error: "Missing required field: projectId"
      });
      return;
    }

    const updates: any = {};

    const allowedFields = ["currency", "language", "timezone", "country"];
    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    });

    if (body.workshop && typeof body.workshop === "object") {
      updates.workshop = body.workshop;
    }

    if (Object.keys(updates).length === 0) {
      response.send({
        status: false,
        error: "No fields provided to update"
      });
      return;
    }

    const managerInstance = new iTools();
    managerInstance.initializeApp({
      projectId: "projects-manager"
    });

    managerInstance.database().collection("Projects").doc(projectId).update(updates, { merge: true }).then(() => {
      managerInstance.close();
      response.send({
        status: true,
        data: {
          projectId,
          updates
        }
      });
    }).catch((error) => {
      managerInstance.close();
      response.send({
        status: false,
        error: error.message
      });
    });
  }

  public static getProjectSettings(request: any, response: any, projectId: string) {

    const itools = new iTools();
    itools.initializeApp({
      projectId: "projects-manager"
    });

    itools.database().collection("Projects").doc(projectId).get().then((res) => {
      itools.close();
      response.send({ data: res.data(), status: true, projectId: projectId });
    }).catch((error) => {
      itools.close();
      response.send({ error: error.message, status: false, projectId: projectId });
    });

  };
}
