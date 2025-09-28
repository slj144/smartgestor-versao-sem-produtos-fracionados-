import { Functions } from "../@default/functions/functions";
import * as https from "https";

class Fiscal{

	public static onPlugNotasAPIWebhook(request: any, response: any) {

		Functions.parseRequestBody(request);

		try {
			request.body = typeof request.body == 'string' ? JSON.parse(request.body) : request.body;
		} catch(error) {}
	}

	public static plugNotasRegisterWebhook(request: any, response: any) {

		Functions.parseRequestBody(request);

		try{

			request.body = typeof request.body == 'string' ? JSON.parse(request.body) : request.body;

			const postData = {};

			const requestHttps = https.request({
				method: "POST",
				hostname: "api.plugnotas.com.br",
				path: `/webhook`,
				rejectUnauthorized: false,
				headers: {
					'Content-Type': 'application/json',
					'x-api-key': 'f9c89e6e-8df8-4a52-ad19-8cc4d748e246'
				}
			}, (res)=> {

				let data: string = "";

				const handlerError = (error)=>{ request.off("error", handlerError); };
		
				const handlerEnd = ()=>{
					requestHttps.off("data", handlerData);
					requestHttps.off("error", handlerError);
					handlerData("", true);
				};
	
				const handlerData = (eventData: any, final: boolean = false)=>{
					data += eventData.toString();
					if(!final){return;}
					response.send({status: true });
				};
		
				requestHttps.on("data", handlerData);
				requestHttps.on("error", handlerError);
				requestHttps.on("end", handlerEnd);

				requestHttps.write(postData);
				requestHttps.end();
			});
		} catch(error) {
			response.send({status: false});
		}		
	}

	public static plugNotasRemoveWebhook(request: any, response: any) {

		Functions.parseRequestBody(request);

		try {

			request.body = typeof request.body == 'string' ? JSON.parse(request.body) : request.body;

			const requestHttps = https.request({
				method: "DELETE",
				hostname: "api.plugnotas.com.br",
				path: `/webhook`,
				rejectUnauthorized: false,
				headers: {
					'Content-Type': 'application/json',
					'x-api-key': 'f9c89e6e-8df8-4a52-ad19-8cc4d748e246'
				}
			}, (res)=>{

				let data: string = "";

				const handlerError = (error)=>{ request.off("error", handlerError); };
		
				const handlerEnd = ()=>{
					requestHttps.off("data", handlerData);
					requestHttps.off("error", handlerError);
					handlerData("", true);
				};
	
				const handlerData = (eventData: any, final: boolean = false)=>{
					data += eventData.toString();
					if(!final){return;}
					response.send({status: true, data });
				};
		
				requestHttps.on("data", handlerData);
				requestHttps.on("error", handlerError);
				requestHttps.on("end", handlerEnd);
			});
		} catch(error) {
			response.send({status: false});
		}
	}

	public static plugNotasGetWebhook(request: any, response: any) {

		Functions.parseRequestBody(request);

		try {

			request.body = typeof request.body == 'string' ? JSON.parse(request.body) : request.body;
			
			const requestHttps = https.request({
				method: "GET",
				hostname: "api.plugnotas.com.br",
				path: `/webhook`,
				rejectUnauthorized: false,
				headers: {
					'Content-Type': 'application/json',
					'x-api-key': 'f9c89e6e-8df8-4a52-ad19-8cc4d748e246'
				}
			}, (res)=>{

				let data: string = "";

				const handlerError = (error)=>{ request.off("error", handlerError); };
		
				const handlerEnd = ()=>{
					requestHttps.off("data", handlerData);
					requestHttps.off("error", handlerError);
					handlerData("", true);
				};
	
				const handlerData = (eventData: any, final: boolean = false)=>{
					data += eventData.toString();
					if(!final){return;}
					response.send({status: true, data });
				};
		
				requestHttps.on("data", handlerData);
				requestHttps.on("error", handlerError);
				requestHttps.on("end", handlerEnd);
			});
		} catch(error) {
			response.send({status: false});
		}
	}

	public static plugNotasTestWebhook(request: any, response: any) {

		Functions.parseRequestBody(request);

		try {

			request.body = typeof request.body == 'string' ? JSON.parse(request.body) : request.body;

			const postData = {};

			const requestHttps = https.request({
				method: "POST",
				hostname: "api.plugnotas.com.br",
				path: `/webhook/verify`,
				rejectUnauthorized: false,
				headers: {
					'Content-Type': 'application/json',
					'x-api-key': 'f9c89e6e-8df8-4a52-ad19-8cc4d748e246'
				}
			}, (res)=>{

				let data: string = "";

				const handlerError = (error)=>{ request.off("error", handlerError); };
		
				const handlerEnd = ()=>{
					requestHttps.off("data", handlerData);
					requestHttps.off("error", handlerError);
					handlerData("", true);
				};
	
				const handlerData = (eventData: any, final: boolean = false)=>{
					data += eventData.toString();
					if(!final){return;}
					response.send({status: true, data });
				};
		
				requestHttps.on("data", handlerData);
				requestHttps.on("error", handlerError);
				requestHttps.on("end", handlerEnd);
				
				requestHttps.write(postData);
				requestHttps.end();
			});
		} catch(error) {
			response.send({status: false});
		}
	}

}

export const onPlugNotasAPIWebhook = Fiscal.onPlugNotasAPIWebhook;
export const plugNotasRegisterWebhook = Fiscal.plugNotasRegisterWebhook;
export const plugNotasRemoveWebhook = Fiscal.plugNotasRemoveWebhook;
export const plugNotasGetWebhook = Fiscal.plugNotasGetWebhook;
export const plugNotasTestWebhook = Fiscal.plugNotasTestWebhook;

Functions.setAccess(onPlugNotasAPIWebhook, "PUBLIC");
Functions.setAccess(plugNotasRegisterWebhook, "PUBLIC");
Functions.setAccess(plugNotasRemoveWebhook, "PUBLIC");
Functions.setAccess(plugNotasGetWebhook, "PUBLIC");
Functions.setAccess(plugNotasTestWebhook, "PUBLIC");
