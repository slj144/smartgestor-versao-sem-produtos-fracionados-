import { iTools } from "../iTools";

export class Functions{

  public static setAccess(fn: any, status: "PUBLIC" | "PRIVATE"){
    fn.access = status;
  };

  public static parseRequestBody(request: any) {

    if (request.body instanceof Buffer) {
      request.body = JSON.parse(request.body.toString("utf-8"));
    }

    if (typeof request.body == 'string') {

      try {
        request.body = JSON.parse(request.body);
      }
      catch(e) {}
    }
  }

  public static initITools(projectId: string): iTools {

    const itools = new iTools();

    itools.initializeApp({ 
      projectId: projectId,
      email: "iparttsdefault@gmail.com",
      password: "ipartts123"
    });

    return itools;
  }

}
