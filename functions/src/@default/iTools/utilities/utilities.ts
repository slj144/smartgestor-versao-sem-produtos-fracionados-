import { EventEmitter } from 'events';
import * as cryptojs from "crypto-js";
const jsonTimezones = require("../json/timezones.json");

export class Utilities{

  public static deepClone(object: any) {
  
    const recurseObj = ((x) => typeof x === 'object' ? Utilities.deepClone(x) : x);
    const cloneObj = ((y, k) => { y[k] = recurseObj(object[k]); return y; });

    if (!object) { return object }

    if (Array.isArray(object)) { return object.map(recurseObj); }

    return Object.keys(object).reduce(cloneObj, {});
  } 


  // Event Emitters

  public static onEmitterListener(emitter: EventEmitter, emitterId: string, listenerId: string, listener: ((_: any)=>void)) {
    (listener as any).ListenerID = listenerId;
    emitter.on(emitterId, listener);
  }

  public static offEmitterListener(emitter: EventEmitter, emitterId: string = null, listenerId: string | string[] = null) {

    if(emitterId) {
      
      emitter.listeners(emitterId).forEach((listener: any) => {

        if(listenerId) {

          if(typeof listenerId == "string") {

            if((<any>listener).ListenerID == listenerId) {
              emitter.removeListener(emitterId, listener);
            }
          } else {

            listenerId.forEach((id) => {              
              if((<any>listener).ListenerID == id) {
                emitter.removeListener(emitterId, listener);
              }
            });
          }
        } else {
          emitter.removeListener(emitterId, listener);
        }       
      });
    } else {
      emitter.removeAllListeners();
    }
  }

  public static mountMatchAggregate = (where: any, test: boolean = false)=>{

    const obj: any = {$and: [], $or: []};

    let hasAndOrOr = false;

    const exec = (key: string, v: any, or: boolean = false)=>{

      if(v instanceof Array){
        if(v.length > 0){
          obj[key] = [];
          hasAndOrOr = true;
          v.forEach((v1)=>{ exec(key, v1, true) });
        }
      }else{

        const item = {};
        const isArrayField = !!(v.arrayField);
      
        switch(v.operator){
          case "like": {
            if(isArrayField){

              item[v.arrayField] = {$elemMatch: {}}; 
              item[v.arrayField]["$elemMatch"][v.field] = {$regex: v.value instanceof RegExp ? v.value.source : v.value, $options: v.value instanceof RegExp ? v.value.flags: ""};
            }else{

              v.value  = v.value instanceof RegExp ? v.value : new RegExp(v.value);
              item[v.field] = {$regex: v.value.source, $options: v.value.flags};
            }
            break;
          }
          case "=": {
            if(isArrayField){

              item[v.arrayField] = {$elemMatch: {}}; 
              item[v.arrayField]["$elemMatch"][v.field] = v.value;
            }else{

              if(v.field == "$and" || v.field == "$or"){


                item[v.field] = v.value; 
              }else{

                item[v.field] = v.value; 
              }

              
            }
            break;
          }
          case "<": {
            if(isArrayField){

              item[v.arrayField] = {$elemMatch: {}}; 
              item[v.arrayField]["$elemMatch"][v.field] = {"$lt": v.value};;
            }else{

              item[v.field] = {"$lt": v.value};
            }
            break
          }
          case "<=": {
            if(isArrayField){

              item[v.arrayField] = {$elemMatch: {}}; 
              item[v.arrayField]["$elemMatch"][v.field] = {"$lte": v.value};
            }else{
              
              item[v.field] = {"$lte": v.value};
            }
            break
          }
          case ">": {
            if(isArrayField){

              item[v.arrayField] = {$elemMatch: {}}; 
              item[v.arrayField]["$elemMatch"][v.field] = {"$gt": v.value};
            }else{
              
              item[v.field] = {"$gt": v.value};
            }
            break
          }
          case ">=": {
            if(isArrayField){

              item[v.arrayField] = {$elemMatch: {}}; 
              item[v.arrayField]["$elemMatch"][v.field] = {"$gte": v.value};
            }else{
             
              item[v.field] = {"$gte": v.value};
            }
            break
          }
          case "!=": {
            if(!(v.value instanceof RegExp) && typeof v.value == "object"){
              if(isArrayField){

                item[v.arrayField] = {$elemMatch: {}}; 
                item[v.arrayField]["$elemMatch"][v.field] = {$not: v.value};
              }else{
                
                item[v.field] = {$not: v.value};
              }
            }else{

              const isRegexp = typeof v.value == "string" || v.value instanceof RegExp;

              if(isArrayField){

                item[v.arrayField] = {$elemMatch: {}}; 
                item[v.arrayField]["$elemMatch"][v.field] = isRegexp ? {__$not: v.value instanceof RegExp ? v.value.source : v.value, __$options: v.value instanceof RegExp ? v.value.flags : "", __$type: "regexp"} : {$ne: v.value};
              }else{
               
                item[v.field] = isRegexp ? {__$not: v.value instanceof RegExp ? v.value.source : v.value, __$options: v.value instanceof RegExp ? v.value.flags : "", __$type: "regexp"} : {$ne: v.value};
              }
            }
            break;
          }
          case "in": {

            const value: any[] = v.value instanceof Array ? v.value : [v.value];
            item[v.field] = v.value instanceof RegExp ? {$in: v.value.source} : {$in: value}; 
            break;
          }
          case "elemMatch": {

            item[v.arrayField] = {$elemMatch: {}}; 
            item[v.arrayField]["$elemMatch"][v.field] = {$gt: v.value};
            break;
          }
          case "exists": {

            item[v.field] = {$exists: v.value};
            break;
          }
          case "typeof": {

            item[v.field] = {$type: v.value};
            break;
          }
        }

        if(Object.values(item).length > 0){

          if(test){

            // console.log(obj, [key], item);
            // console.log(hasAndOrOr, obj, item);
            // console.log(hasAndOrOr, key, obj, item);
          }

          if(hasAndOrOr){
            obj[key].push(item);
          }else{
            obj["$and"].push(item);
          }
        }
      }
    };

    for(let i in where){ exec(i, where[i]); }

    if(obj["$or"] && obj["$or"].length == 0){
      delete obj["$or"];
    }

    if(obj["$and"] && obj["$and"].length == 0){
      delete obj["$and"];
    }

    return obj;
  };
  
  public static getAggregateObject(_aggregate: any, test: boolean = false){
    const aggregate: any = {};

    if(_aggregate){

      if(_aggregate.match){

        aggregate.match = Utilities.mountMatchAggregate(_aggregate.match, test);
      }

      if(_aggregate.limit){

        aggregate.limit = _aggregate.limit;
      }else{

        aggregate.limit = 1000;
      }

      if(_aggregate.sort){

        aggregate.sort = _aggregate.sort;
      }

      if(_aggregate.count){

        aggregate.count = _aggregate.count;
      }

      if(_aggregate.group){

        aggregate.group = _aggregate.group;
      }

      if(_aggregate.addFields){

        aggregate.addFields = _aggregate.addFields;
      }

      if(_aggregate.project){

        aggregate.project = _aggregate.project;
      }

      if(_aggregate.skip){

        aggregate.skip = _aggregate.skip;
      }
    }

    return aggregate;
  }


  public static sendRequest(connection: WebSocket, data, secretKey: string, isCrypt: boolean = true, origin: string = null){
    try{

      connection.send(JSON.stringify(data)); 

      // if(isCrypt && secretKey){

      //   connection.send(cryptojs.AES.encrypt(JSON.stringify(data), secretKey).toString());  
      // }else if(!isCrypt){
  
      //   connection.send(JSON.stringify(data));  
      // }
    }catch(e){
    }
  }

  public static encode(obj: any){
    return JSON.stringify(obj);
  }

  public static urlEncode(obj: any){
    if(typeof obj === 'object'){
      let str = '';
      for(let k in obj){ 
        if(obj.hasOwnProperty(k)){
          str += k + '=';
          if(typeof obj[k] === 'object'){

            str += Utilities.encode(obj[k])+'&';
          }else{

            str += obj[k] +'&';
          }
        } 
      }
      return str.substr(0,str.length-1);
    } else if(typeof obj === 'string'){
      return obj;
    }
  }

  public static request(settings){

    if(typeof settings !== 'object'){throw TypeError('O argumento deve ser um objeto.')}

    let xhr = new XMLHttpRequest(),
      url = settings.url,
      type = settings.type ? settings.type.toUpperCase() : 'GET',
      data = settings.data ? settings.data : null,
      adp = settings.addProps ? settings.addProps : false,
      success = settings.success ? settings.success : function(){},
      errorr = settings.error ? settings.error : function(){},
      complete = settings.complete ? settings.complete : function(){},
      beforeSend = settings.beforeSend ? settings.beforeSend : function(){},
      timeout = settings.timeout ? settings.timeout : function(){},
      progess = settings.progress ? settings.progress : function(){},
      formD = settings.formData && typeof settings.formData !== 'function' && settings.formData !== undefined ? settings.formData : false,
      headers = settings.headers ? settings.headers.split(',') : false,
      cache = settings.cache === true ? 'public' :(settings.cache === false) ? 'no-cache' : null;
      formD = data && data.$files && data.$files.length > 0 ? true : formD;
      const files = data && data.$files ? data.$files : [];

    if(type === "GET" && typeof data === "object"){

      if(url.indexOf("?") !== -1){

        url+= "&"+typeof data === 'object' ? Utilities.urlEncode(data) : data;
      }else{

        if(url[url.length - 1] === "/"){

          url = url.substring(0,url.length-1);
          url+= typeof data === 'object' ? "?"+ Utilities.urlEncode(data) : data;
        }else{

          url+= typeof data === 'object' ? "?"+ Utilities.urlEncode(data) : data;
        }
      }

      data = null;
    }

    xhr.open(type,url);

    if(headers){ for(let i in headers){ xhr.setRequestHeader(i,headers[i]); } }

    if(cache === 'public'){xhr.setRequestHeader('Cache-control','public');}else{xhr.setRequestHeader('Cache-Control','no-cache');}

    if(formD){
      if((data instanceof HTMLElement)){

        data = new FormData(data as HTMLFormElement);
      }else if(!(data instanceof FormData) && typeof data === 'object'){

        const d = data ? data : {};
        data = new FormData();

        for(let i in d){ 

          if(i.toLowerCase() != "$files"){

            data.append(i,typeof d[i] == "string" ? d[i] : JSON.stringify(d[i])); 
          }
        }
      }

      if(!(data instanceof FormData)){return'';}

      if(adp){

        for(let i in adp){ data.append(i,adp[i]); }
      }
      xhr.setRequestHeader('Content-Disposition','form-data');
    }else{

      xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
      data = typeof data === 'object' ? Utilities.urlEncode(data) : data;
    }

    files.forEach((file)=>{
      data.append(file.name,  new File([file.data], file.name, {type: "application/octet-stream"}));
    });

    xhr.send(data);

    xhr.onprogress = function(event){progess(event);};

    xhr.onerror = function(event){errorr(event);};

    beforeSend();

    xhr.ontimeout = (event)=>{ timeout(); };

    xhr.onreadystatechange = function(){
      if(xhr.readyState <= 2){}
      if(xhr.readyState === 4 && xhr.status === 200){

        success(xhr.responseText);
      }
      if(xhr.readyState === 4){complete(xhr);

        data = null;
        xhr = null;
      }
    };
  }

  public static isAuthResponse(event){
    try{
      const data = JSON.parse(event.data);
      return data.connection.isAuthenticate || data.connection.isLogout;
      // return true;
    }catch(e){ return false; }
  }

  public static get isServer(){
    try{
      return !localStorage; 
    }catch(e){
      return true;
    }
  }


  // Date

  public static applyTimezone(timezone: string, date: Date = null): Date{

    const timezoneData: any = ((timezone: string)=>{
      let timezoneData = null;
      jsonTimezones.forEach((region) => {
        if(region.utc.indexOf(timezone) != -1 && region.abbr != "BST") {
          timezoneData = region;
        }
      });
      return timezoneData;
    })(timezone);

    const offset = new Date().getTimezoneOffset() / 60;

    date = new Date(Date.parse(date ? date.toISOString() : new Date().toISOString()));

    date.setHours((date.getHours() + offset + timezoneData.offset));
    return date;
  }

  public static formatDate(timezone: string, returnMode: string = 'object', locale: string = 'US', format: string = "DH") {   

    format = format.toUpperCase();
    locale = locale.toUpperCase();

    const date: Date = timezone ? Utilities.applyTimezone(timezone) : new Date();

    if(date.toDateString() == 'Invalid Date'){
      return false;
    }

    const year = date.getFullYear();
    const month = ((date.getMonth() + 1) <= 9 ? ( '0' + (date.getMonth() + 1) ) : (date.getMonth() + 1));
    const day = (date.getDate() <= 9 ? ( '0' + date.getDate() ) : date.getDate());
  
    const hours = (date.getHours() <= 9 ? ( '0' + date.getHours() ) : date.getHours() );
    const minutes = (date.getMinutes() <= 9 ? ( '0' + date.getMinutes() ) : date.getMinutes() );
    const seconds = (date.getSeconds() <= 9 ? ( '0' + date.getSeconds() ) : date.getSeconds() );
  
    let result: any;
  
    switch(returnMode.toLowerCase()) {
      case 'string':

        if(format == "DH") {
          result = (locale == 'BR' ? `${day}/${month}/${year}` : `${year}-${month}-${day}`) + ` ${hours}:${minutes}:${seconds}`;
        } else if(format == "D") {
          result = (locale == 'BR' ? `${day}/${month}/${year}` : `${year}-${month}-${day}`);
        } else {
          result = `${hours}:${minutes}:${seconds}`;
        }
        break;
      case 'array':

        result = [
          (locale == 'BR' ? `${day}/${month}/${year}` : `${year}-${month}-${day}`), 
          `${hours}:${minutes}:${seconds}`
        ];

        break;
      case 'object':

        result = {
          date: (locale == 'BR' ? `${day}/${month}/${year}` : `${year}-${month}-${day}`),
          hours: `${hours}:${minutes}:${seconds}`
        };

        break;
    }
  
    return result;
  }

}