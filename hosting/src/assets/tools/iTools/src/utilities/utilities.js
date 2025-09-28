"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utilities = void 0;
var jsonTimezones = require("../json/timezones.json");
var Utilities = /** @class */ (function () {
    function Utilities() {
    }
    Utilities.deepClone = function (object) {
        var recurseObj = (function (x) { return typeof x === 'object' ? Utilities.deepClone(x) : x; });
        var cloneObj = (function (y, k) { y[k] = recurseObj(object[k]); return y; });
        if (!object) {
            return object;
        }
        if (Array.isArray(object)) {
            return object.map(recurseObj);
        }
        return Object.keys(object).reduce(cloneObj, {});
    };
    // Event Emitters
    Utilities.onEmitterListener = function (emitter, emitterId, listenerId, listener) {
        listener.ListenerID = listenerId;
        emitter.on(emitterId, listener);
    };
    Utilities.offEmitterListener = function (emitter, emitterId, listenerId) {
        if (emitterId === void 0) { emitterId = null; }
        if (listenerId === void 0) { listenerId = null; }
        if (emitterId) {
            emitter.listeners(emitterId).forEach(function (listener) {
                if (listenerId) {
                    if (typeof listenerId == "string") {
                        if (listener.ListenerID == listenerId) {
                            emitter.removeListener(emitterId, listener);
                        }
                    }
                    else {
                        listenerId.forEach(function (id) {
                            if (listener.ListenerID == id) {
                                emitter.removeListener(emitterId, listener);
                            }
                        });
                    }
                }
                else {
                    emitter.removeListener(emitterId, listener);
                }
            });
        }
        else {
            emitter.removeAllListeners();
        }
    };
    Utilities.getAggregateObject = function (_aggregate, test) {
        if (test === void 0) { test = false; }
        var aggregate = {};
        if (_aggregate) {
            if (_aggregate.match) {
                aggregate.match = Utilities.mountMatchAggregate(_aggregate.match, test);
            }
            if (_aggregate.limit) {
                aggregate.limit = _aggregate.limit;
            }
            else {
                aggregate.limit = 1000;
            }
            if (_aggregate.sort) {
                aggregate.sort = _aggregate.sort;
            }
            if (_aggregate.count) {
                aggregate.count = _aggregate.count;
            }
            if (_aggregate.group) {
                aggregate.group = _aggregate.group;
            }
            if (_aggregate.addFields) {
                aggregate.addFields = _aggregate.addFields;
            }
            if (_aggregate.project) {
                aggregate.project = _aggregate.project;
            }
            if (_aggregate.skip) {
                aggregate.skip = _aggregate.skip;
            }
        }
        return aggregate;
    };
    Utilities.sendRequest = function (connection, data, secretKey, isCrypt, origin) {
        if (isCrypt === void 0) { isCrypt = true; }
        if (origin === void 0) { origin = null; }
        try {
            connection.send(JSON.stringify(data));
            // if(isCrypt && secretKey){
            //   connection.send(cryptojs.AES.encrypt(JSON.stringify(data), secretKey).toString());  
            // }else if(!isCrypt){
            //   connection.send(JSON.stringify(data));  
            // }
        }
        catch (e) {
        }
    };
    Utilities.encode = function (obj) {
        return JSON.stringify(obj);
    };
    Utilities.urlEncode = function (obj) {
        if (typeof obj === 'object') {
            var str = '';
            for (var k in obj) {
                if (obj.hasOwnProperty(k)) {
                    str += k + '=';
                    if (typeof obj[k] === 'object') {
                        str += Utilities.encode(obj[k]) + '&';
                    }
                    else {
                        str += obj[k] + '&';
                    }
                }
            }
            return str.substr(0, str.length - 1);
        }
        else if (typeof obj === 'string') {
            return obj;
        }
    };
    Utilities.request = function (settings) {
        if (typeof settings !== 'object') {
            throw TypeError('O argumento deve ser um objeto.');
        }
        var xhr = new XMLHttpRequest(), url = settings.url, type = settings.type ? settings.type.toUpperCase() : 'GET', data = settings.data ? settings.data : null, adp = settings.addProps ? settings.addProps : false, success = settings.success ? settings.success : function () { }, errorr = settings.error ? settings.error : function () { }, complete = settings.complete ? settings.complete : function () { }, beforeSend = settings.beforeSend ? settings.beforeSend : function () { }, timeout = settings.timeout ? settings.timeout : function () { }, progess = settings.progress ? settings.progress : function () { }, formD = settings.formData && typeof settings.formData !== 'function' && settings.formData !== undefined ? settings.formData : false, headers = settings.headers ? settings.headers.split(',') : false, cache = settings.cache === true ? 'public' : (settings.cache === false) ? 'no-cache' : null;
        formD = data && data.$files && data.$files.length > 0 ? true : formD;
        var files = data && data.$files ? data.$files : [];
        if (type === "GET" && typeof data === "object") {
            if (url.indexOf("?") !== -1) {
                url += "&" + typeof data === 'object' ? Utilities.urlEncode(data) : data;
            }
            else {
                if (url[url.length - 1] === "/") {
                    url = url.substring(0, url.length - 1);
                    url += typeof data === 'object' ? "?" + Utilities.urlEncode(data) : data;
                }
                else {
                    url += typeof data === 'object' ? "?" + Utilities.urlEncode(data) : data;
                }
            }
            data = null;
        }
        xhr.open(type, url);
        if (headers) {
            for (var i in headers) {
                xhr.setRequestHeader(i, headers[i]);
            }
        }
        if (cache === 'public') {
            xhr.setRequestHeader('Cache-control', 'public');
        }
        else {
            xhr.setRequestHeader('Cache-Control', 'no-cache');
        }
        if (formD) {
            if ((data instanceof HTMLElement)) {
                data = new FormData(data);
            }
            else if (!(data instanceof FormData) && typeof data === 'object') {
                var d = data ? data : {};
                data = new FormData();
                for (var i in d) {
                    if (i.toLowerCase() != "$files") {
                        data.append(i, typeof d[i] == "string" ? d[i] : JSON.stringify(d[i]));
                    }
                }
            }
            if (!(data instanceof FormData)) {
                return '';
            }
            if (adp) {
                for (var i in adp) {
                    data.append(i, adp[i]);
                }
            }
            xhr.setRequestHeader('Content-Disposition', 'form-data');
        }
        else {
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            data = typeof data === 'object' ? Utilities.urlEncode(data) : data;
        }
        files.forEach(function (file) {
            data.append(file.name, new File([file.data], file.name, { type: "application/octet-stream" }));
        });
        xhr.send(data);
        xhr.onprogress = function (event) { progess(event); };
        xhr.onerror = function (event) { errorr(event); };
        beforeSend();
        xhr.ontimeout = function (event) { timeout(); };
        xhr.onreadystatechange = function () {
            if (xhr.readyState <= 2) { }
            if (xhr.readyState === 4 && xhr.status === 200) {
                success(xhr.responseText);
            }
            if (xhr.readyState === 4) {
                complete(xhr);
                data = null;
                xhr = null;
            }
        };
    };
    Utilities.isAuthResponse = function (event) {
        try {
            var data = JSON.parse(event.data);
            return data.connection.isAuthenticate || data.connection.isLogout;
            // return true;
        }
        catch (e) {
            return false;
        }
    };
    Object.defineProperty(Utilities, "isServer", {
        get: function () {
            try {
                return !localStorage;
            }
            catch (e) {
                return true;
            }
        },
        enumerable: false,
        configurable: true
    });
    // Date
    Utilities.applyTimezone = function (timezone, date) {
        if (date === void 0) { date = null; }
        var timezoneData = (function (timezone) {
            var timezoneData = null;
            jsonTimezones.forEach(function (region) {
                if (region.utc.indexOf(timezone) != -1 && region.abbr != "BST") {
                    timezoneData = region;
                }
            });
            return timezoneData;
        })(timezone);
        var offset = new Date().getTimezoneOffset() / 60;
        date = new Date(Date.parse(date ? date.toISOString() : new Date().toISOString()));
        date.setHours((date.getHours() + offset + timezoneData.offset));
        return date;
    };
    Utilities.formatDate = function (timezone, returnMode, locale, format) {
        if (returnMode === void 0) { returnMode = 'object'; }
        if (locale === void 0) { locale = 'US'; }
        if (format === void 0) { format = "DH"; }
        format = format.toUpperCase();
        locale = locale.toUpperCase();
        var date = timezone ? Utilities.applyTimezone(timezone) : new Date();
        if (date.toDateString() == 'Invalid Date') {
            return false;
        }
        var year = date.getFullYear();
        var month = ((date.getMonth() + 1) <= 9 ? ('0' + (date.getMonth() + 1)) : (date.getMonth() + 1));
        var day = (date.getDate() <= 9 ? ('0' + date.getDate()) : date.getDate());
        var hours = (date.getHours() <= 9 ? ('0' + date.getHours()) : date.getHours());
        var minutes = (date.getMinutes() <= 9 ? ('0' + date.getMinutes()) : date.getMinutes());
        var seconds = (date.getSeconds() <= 9 ? ('0' + date.getSeconds()) : date.getSeconds());
        var result;
        switch (returnMode.toLowerCase()) {
            case 'string':
                if (format == "DH") {
                    result = (locale == 'BR' ? "".concat(day, "/").concat(month, "/").concat(year) : "".concat(year, "-").concat(month, "-").concat(day)) + " ".concat(hours, ":").concat(minutes, ":").concat(seconds);
                }
                else if (format == "D") {
                    result = (locale == 'BR' ? "".concat(day, "/").concat(month, "/").concat(year) : "".concat(year, "-").concat(month, "-").concat(day));
                }
                else {
                    result = "".concat(hours, ":").concat(minutes, ":").concat(seconds);
                }
                break;
            case 'array':
                result = [
                    (locale == 'BR' ? "".concat(day, "/").concat(month, "/").concat(year) : "".concat(year, "-").concat(month, "-").concat(day)),
                    "".concat(hours, ":").concat(minutes, ":").concat(seconds)
                ];
                break;
            case 'object':
                result = {
                    date: (locale == 'BR' ? "".concat(day, "/").concat(month, "/").concat(year) : "".concat(year, "-").concat(month, "-").concat(day)),
                    hours: "".concat(hours, ":").concat(minutes, ":").concat(seconds)
                };
                break;
        }
        return result;
    };
    Utilities.mountMatchAggregate = function (where, test) {
        if (test === void 0) { test = false; }
        var obj = { $and: [], $or: [] };
        var hasAndOrOr = false;
        var exec = function (key, v, or) {
            if (or === void 0) { or = false; }
            if (v instanceof Array) {
                if (v.length > 0) {
                    obj[key] = [];
                    hasAndOrOr = true;
                    v.forEach(function (v1) { exec(key, v1, true); });
                }
            }
            else {
                var item = {};
                var isArrayField = !!(v.arrayField);
                switch (v.operator) {
                    case "like": {
                        if (isArrayField) {
                            item[v.arrayField] = { $elemMatch: {} };
                            item[v.arrayField]["$elemMatch"][v.field] = { $regex: v.value instanceof RegExp ? v.value.source : v.value, $options: v.value instanceof RegExp ? v.value.flags : "" };
                        }
                        else {
                            v.value = v.value instanceof RegExp ? v.value : new RegExp(v.value);
                            item[v.field] = { $regex: v.value.source, $options: v.value.flags };
                        }
                        break;
                    }
                    case "=": {
                        if (isArrayField) {
                            item[v.arrayField] = { $elemMatch: {} };
                            item[v.arrayField]["$elemMatch"][v.field] = v.value;
                        }
                        else {
                            if (v.field == "$and" || v.field == "$or") {
                                item[v.field] = v.value;
                            }
                            else {
                                item[v.field] = v.value;
                            }
                        }
                        break;
                    }
                    case "<": {
                        if (isArrayField) {
                            item[v.arrayField] = { $elemMatch: {} };
                            item[v.arrayField]["$elemMatch"][v.field] = { "$lt": v.value };
                            ;
                        }
                        else {
                            item[v.field] = { "$lt": v.value };
                        }
                        break;
                    }
                    case "<=": {
                        if (isArrayField) {
                            item[v.arrayField] = { $elemMatch: {} };
                            item[v.arrayField]["$elemMatch"][v.field] = { "$lte": v.value };
                        }
                        else {
                            item[v.field] = { "$lte": v.value };
                        }
                        break;
                    }
                    case ">": {
                        if (isArrayField) {
                            item[v.arrayField] = { $elemMatch: {} };
                            item[v.arrayField]["$elemMatch"][v.field] = { "$gt": v.value };
                        }
                        else {
                            item[v.field] = { "$gt": v.value };
                        }
                        break;
                    }
                    case ">=": {
                        if (isArrayField) {
                            item[v.arrayField] = { $elemMatch: {} };
                            item[v.arrayField]["$elemMatch"][v.field] = { "$gte": v.value };
                        }
                        else {
                            item[v.field] = { "$gte": v.value };
                        }
                        break;
                    }
                    case "!=": {
                        if (!(v.value instanceof RegExp) && typeof v.value == "object") {
                            if (isArrayField) {
                                item[v.arrayField] = { $elemMatch: {} };
                                item[v.arrayField]["$elemMatch"][v.field] = { $not: v.value };
                            }
                            else {
                                item[v.field] = { $not: v.value };
                            }
                        }
                        else {
                            var isRegexp = typeof v.value == "string" || v.value instanceof RegExp;
                            if (isArrayField) {
                                item[v.arrayField] = { $elemMatch: {} };
                                item[v.arrayField]["$elemMatch"][v.field] = isRegexp ? { __$not: v.value instanceof RegExp ? v.value.source : v.value, __$options: v.value instanceof RegExp ? v.value.flags : "", __$type: "regexp" } : { $ne: v.value };
                            }
                            else {
                                item[v.field] = isRegexp ? { __$not: v.value instanceof RegExp ? v.value.source : v.value, __$options: v.value instanceof RegExp ? v.value.flags : "", __$type: "regexp" } : { $ne: v.value };
                            }
                        }
                        break;
                    }
                    case "in": {
                        var value = v.value instanceof Array ? v.value : [v.value];
                        item[v.field] = v.value instanceof RegExp ? { $in: v.value.source } : { $in: value };
                        break;
                    }
                    case "elemMatch": {
                        item[v.arrayField] = { $elemMatch: {} };
                        item[v.arrayField]["$elemMatch"][v.field] = { $gt: v.value };
                        break;
                    }
                    case "exists": {
                        item[v.field] = { $exists: v.value };
                        break;
                    }
                    case "typeof": {
                        item[v.field] = { $type: v.value };
                        break;
                    }
                }
                if (Object.values(item).length > 0) {
                    if (test) {
                        // console.log(obj, [key], item);
                        // console.log(hasAndOrOr, obj, item);
                        // console.log(hasAndOrOr, key, obj, item);
                    }
                    if (hasAndOrOr) {
                        obj[key].push(item);
                    }
                    else {
                        obj["$and"].push(item);
                    }
                }
            }
        };
        for (var i in where) {
            exec(i, where[i]);
        }
        if (obj["$or"] && obj["$or"].length == 0) {
            delete obj["$or"];
        }
        if (obj["$and"] && obj["$and"].length == 0) {
            delete obj["$and"];
        }
        return obj;
    };
    return Utilities;
}());
exports.Utilities = Utilities;
