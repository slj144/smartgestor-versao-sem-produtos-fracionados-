"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.iTools = void 0;
var events_1 = require("events");
var EOperation_1 = require("./enums/EOperation");
var utilities_1 = require("./utilities/utilities");
var cryptojs = __importStar(require("crypto-js"));
var EServiceTypes_1 = require("./enums/EServiceTypes");
var ws_1 = __importDefault(require("ws"));
if (utilities_1.Utilities.isServer) {
    var WS = ws_1.default;
}
else {
    var WS = WebSocket;
}
var iTools = /** @class */ (function () {
    function iTools() {
        var _this = this;
        this.connection = null;
        this.CRPYPTO_SECRET_KEY = function () { return null; }; //this.currentToken ? cryptojs.SHA256(this.currentToken).toString() : null; };
        this.connectTryCount = 0;
        this.isLocalMachine = false;
        this.isConnected = false;
        this.isConnecting = false;
        this.currentUser = null;
        this.currentToken = null;
        this.initializeAppPromise = {
            promise: null,
            resolve: null,
            reject: null,
            data: null
        };
        // Utilities for check and notify app state
        this.NOT_INITIALIZED_APP_MESSAGE = "APP NOT INITIALIZED.";
        this.connectionObject = function (options) {
            if (options === void 0) { options = {}; }
            var email = function () {
                if (_this.currentUser) {
                    return _this.currentUser.email;
                }
                else {
                    return _this.initializeAppOptions.email && _this.initializeAppOptions.email.trim() ? _this.initializeAppOptions.email : null;
                }
            };
            var password = function () {
                if (_this.currentUser) {
                    return _this.currentUser.password;
                }
                else {
                    if (_this.initializeAppOptions.encrypted) {
                        return _this.initializeAppOptions.password && _this.initializeAppOptions.password.trim() ? _this.initializeAppOptions.password.trim() : null;
                    }
                    else {
                        return _this.initializeAppOptions.password && _this.initializeAppOptions.password.trim() ? cryptojs.SHA256(_this.initializeAppOptions.password).toString() : null;
                    }
                }
            };
            var obj = __assign({ requestId: _this.initializeAppOptions.requestId ? _this.initializeAppOptions.requestId : iTools.requestId(), email: email(), password: password(), projectId: _this.initializeAppOptions.projectId ? _this.initializeAppOptions.projectId : null, isAuthenticate: false, isLogout: false, adminKey: _this.initializeAppOptions.adminKey ? _this.initializeAppOptions.adminKey : null, token: _this.currentToken }, options);
            // console.log(obj);
            return obj;
        };
        this.execAfterConnecting = function (callback) {
            var timer = setInterval(function () {
                if (!_this.isConnecting) {
                    clearInterval(timer);
                    if (!_this.isConnected) {
                        _this.reconnect(_this, _this.initializeAppOptions);
                        var timer2_1 = setInterval(function () {
                            if (!_this.isConnecting) {
                                clearInterval(timer2_1);
                                callback();
                            }
                        });
                    }
                    else {
                        callback();
                    }
                }
            });
        };
    }
    iTools.prototype.app = function (appName, initializeAppOptions) {
        if (appName === void 0) { appName = null; }
        if (initializeAppOptions === void 0) { initializeAppOptions = null; }
        if (iTools.initializedApps[appName ? appName : "__default__"]) {
            return iTools.initializedApps[appName ? appName : "__default__"];
        }
        else if (initializeAppOptions) {
            this.initializeApp(initializeAppOptions, appName).catch(function () { });
        }
    };
    iTools.prototype.initializeAppMesageHandler = function (event) {
        this.root.connection.removeEventListener("message", this.root.initializeAppMesageHandler);
        var eventData = null;
        try {
            eventData = typeof JSON.parse(event.data) == "object" ? JSON.parse(event.data) : JSON.parse(JSON.parse(event.data));
        }
        catch (e) {
            console.error("Invalid Data");
            return;
        }
        this.root.initializeAppPromise.data = eventData.connection;
        this.root.isConnected = eventData.connection.status;
        if (eventData.connection.status) {
            if (eventData.connection.email) {
                this.root.currentUser = {
                    email: eventData.connection.email,
                    password: eventData.connection.password,
                    _id: eventData.connection.userId,
                    encrypted: true
                };
                if (!utilities_1.Utilities.isServer) {
                    var users = localStorage.getItem("itoolsAuthenticate") ? JSON.parse(localStorage.getItem("itoolsAuthenticate")) : {};
                    users[this.root.currentUser.email] = this.root.currentUser;
                    localStorage.setItem("itoolsAuthenticate", JSON.stringify(users));
                }
            }
            this.root.currentToken = eventData.connection.token;
            this.root.isConnecting = false;
            if (this.root._database) {
                (this.root._database).config();
            }
            this.root.connectTryCount = 0;
            this.root.initializeAppPromise.resolve({
                status: true,
                message: eventData.connection.message
            });
        }
        else {
            this.root.connection.close(3000);
            this.root.isConnecting = false;
            this.root.initializeAppPromise.reject({
                status: false,
                message: eventData.connection.message
            });
        }
    };
    iTools.prototype.initializeApp = function (settings_1) {
        return __awaiter(this, arguments, void 0, function (settings, appName) {
            var _this = this;
            if (appName === void 0) { appName = null; }
            return __generator(this, function (_a) {
                return [2 /*return*/, this.initializeAppPromise.promise = new Promise(function (resolve, reject) {
                        var self = appName ? new iTools() : _this;
                        settings = utilities_1.Utilities.deepClone(settings);
                        settings.encrypted = settings.encrypted != undefined ? settings.encrypted : false;
                        self.currentUser = null;
                        self.currentToken = null;
                        self.isLocalMachine = settings.developerMode != undefined ? settings.developerMode : false;
                        // self.isLocalMachine = true;
                        self.isConnecting = true;
                        self.initializeAppOptions = settings;
                        var host = self.isLocalMachine ? 'localhost:2000' : 'itools.ipartts.com';
                        var protocol = self.isLocalMachine ? "ws://" : "wss://";
                        try {
                            self.connection = new WS(protocol + host);
                        }
                        catch (error) {
                            self.isConnecting = false;
                            reject({
                                status: false,
                                message: error.message
                            });
                            return;
                        }
                        self.initializeAppPromise = {
                            promise: null,
                            resolve: null,
                            data: null
                        };
                        iTools.initializedApps[appName ? appName : "__default__"] = self;
                        var obj = { connection: self.connectionObject({ isAuthenticate: true, token: null }) };
                        self.connection.addEventListener("open", function () { utilities_1.Utilities.sendRequest(self.connection, obj, null, false); });
                        self.connection.handler = self.initializeAppMesageHandler;
                        self.connection.root = self;
                        self.connection.removeEventListener("message", self.initializeAppMesageHandler);
                        self.connection.addEventListener("message", self.initializeAppMesageHandler);
                        self.connection.onclose = function (event) {
                            // console.log(event);
                            self.isConnected = false;
                            self.isConnecting = false;
                            // self.connectTryCount <= 50 && 
                            if (self.connectTryCount <= 50 && self.connection.readyState > 1) {
                                // console.log(self.connectTryCount);
                                if (!event.code || event.code === 1000 || event.code === 1006) {
                                    setTimeout(function () {
                                        _this.reconnect(self, settings);
                                    }, 3000);
                                }
                                self.connectTryCount++;
                            }
                        };
                        self.initializeAppPromise.resolve = resolve;
                        self.initializeAppPromise.reject = reject;
                    })];
            });
        });
    };
    iTools.prototype.close = function (appName) {
        if (appName === void 0) { appName = null; }
        try {
            iTools.initializedApps[appName ? appName : "__default__"].connection.close();
        }
        catch (e) { }
    };
    iTools.prototype.database = function () {
        var _a;
        if (this._database) {
            return this._database;
        }
        var root = this;
        return this._database = new (_a = /** @class */ (function () {
                function Database() {
                    this.onChangesEmitter = new events_1.EventEmitter();
                    this.onSnapshotCollectionCallbacks = {};
                    this.onSnapshotDocCallbacks = {};
                    this.onSnapshotReleaseCallbacks = {};
                    _a.shared = this;
                    this.config();
                }
                Database.prototype.handlerRouterChanger = function (event) {
                    // if(Utilities.isAuthResponse(event)){ return; }
                    var data = null;
                    try {
                        // Crypto
                        // data = cryptojs.AES.decrypt(event.data, root.CRPYPTO_SECRET_KEY()).toString(cryptojs.enc.Utf8);
                        data = event.data;
                    }
                    catch (e) {
                        console.error("Invalid Secret Key");
                        return;
                    }
                    data = JSON.parse(data);
                    _a.shared.onChangesEmitter.setMaxListeners(10000000);
                    if (data.connection.status) {
                        if (data.releaseInfo) {
                            Object.values(_a.shared.onSnapshotReleaseCallbacks ? _a.shared.onSnapshotReleaseCallbacks : {}).forEach(function (item) {
                                if (data.releaseInfo.data._id == item.variation) {
                                    _a.shared.onChangesEmitter.emit(item.listenerID, data.releaseInfo);
                                }
                            });
                        }
                        if (data.changes) {
                            data.changes.data.forEach(function (change) {
                                _a.shared.onChangesEmitter.emit(change.listenerID, [change.data]);
                            });
                        }
                        if (data.actionResult) {
                            _a.shared.onChangesEmitter.emit(data.connection.requestId, data);
                        }
                        if (data.snapshotActionResult) {
                            _a.shared.onChangesEmitter.emit(data.connection.requestId, data);
                        }
                    }
                };
                Database.prototype.config = function () {
                    if (root.connection) {
                        root.connection.removeEventListener("message", this.handlerRouterChanger);
                        root.connection.addEventListener("message", this.handlerRouterChanger);
                    }
                };
                // LIST DATABASES
                Database.prototype.getDatabases = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_b) {
                            return [2 /*return*/, new Promise(function (resolve, reject) {
                                    root.execAfterConnecting(function () {
                                        var obj = {
                                            connection: root.connectionObject(),
                                            action: {
                                                type: EOperation_1.EOperationDB.LISTDATABASES,
                                                service: EServiceTypes_1.EServiceTypes.DATABASE,
                                            }
                                        };
                                        var handler = function (data) {
                                            _this.onChangesEmitter.removeListener(obj.connection.requestId, handler);
                                            if (!data.actionResult.status) {
                                                reject(data.actionResult);
                                                return;
                                            }
                                            data = data.actionResult;
                                            resolve(data);
                                        };
                                        _this.onChangesEmitter.on(obj.connection.requestId, handler);
                                        utilities_1.Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
                                    });
                                })];
                        });
                    });
                };
                Database.prototype.deleteDatabase = function () {
                    return __awaiter(this, arguments, void 0, function (dbName) {
                        var _this = this;
                        if (dbName === void 0) { dbName = null; }
                        return __generator(this, function (_b) {
                            return [2 /*return*/, new Promise(function (resolve, reject) {
                                    root.execAfterConnecting(function () {
                                        var obj = {
                                            connection: root.connectionObject(),
                                            action: {
                                                type: EOperation_1.EOperationDB.DELETEDATABASE,
                                                service: EServiceTypes_1.EServiceTypes.DATABASE,
                                                data: {
                                                    dbName: dbName
                                                }
                                            }
                                        };
                                        var handler = function (data) {
                                            _this.onChangesEmitter.removeListener(obj.connection.requestId, handler);
                                            if (!data.actionResult.status) {
                                                reject(data.actionResult);
                                                return;
                                            }
                                            data = data.actionResult;
                                            resolve(data);
                                        };
                                        _this.onChangesEmitter.on(obj.connection.requestId, handler);
                                        utilities_1.Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
                                    });
                                })];
                        });
                    });
                };
                // LIST COLLECTIONS
                Database.prototype.getCollections = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_b) {
                            return [2 /*return*/, new Promise(function (resolve, reject) {
                                    root.execAfterConnecting(function () {
                                        if (!root.isConnected) {
                                            reject({
                                                message: root.NOT_INITIALIZED_APP_MESSAGE
                                            });
                                            return;
                                        }
                                        var obj = {
                                            connection: root.connectionObject(),
                                            action: {
                                                type: EOperation_1.EOperationDB.LISTCOLLECTIONS,
                                                service: EServiceTypes_1.EServiceTypes.DATABASE
                                            }
                                        };
                                        var handler = function (data) {
                                            _this.onChangesEmitter.removeListener(obj.connection.requestId, handler);
                                            if (!data.actionResult.status) {
                                                return reject(data.actionResult);
                                            }
                                            data = data.actionResult.data;
                                            resolve(data);
                                        };
                                        _this.onChangesEmitter.on(obj.connection.requestId, handler);
                                        utilities_1.Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
                                    });
                                })];
                        });
                    });
                };
                // SYSTEM LOGS
                Database.prototype.registerLog = function (data) {
                    return __awaiter(this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_b) {
                            return [2 /*return*/, new Promise(function (resolve, reject) {
                                    root.execAfterConnecting(function () {
                                        if (!root.isConnected) {
                                            reject({
                                                message: root.NOT_INITIALIZED_APP_MESSAGE
                                            });
                                            return;
                                        }
                                        var obj = {
                                            connection: root.connectionObject(),
                                            action: {
                                                type: EOperation_1.EOperationDB.SYSTEMLOGS,
                                                service: EServiceTypes_1.EServiceTypes.DATABASE,
                                                mode: "add",
                                                data: data
                                            }
                                        };
                                        var handler = function (data) {
                                            _this.onChangesEmitter.removeListener(obj.connection.requestId, handler);
                                            if (!data.actionResult.status) {
                                                return reject(data.actionResult);
                                            }
                                            data = data.actionResult.data;
                                            resolve(data);
                                        };
                                        _this.onChangesEmitter.on(obj.connection.requestId, handler);
                                        utilities_1.Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
                                    });
                                })];
                        });
                    });
                };
                // TRANSACTIONS
                Database.prototype.batch = function () {
                    return new /** @class */ (function () {
                        function Batch() {
                            this.operations = [];
                        }
                        Batch.prototype.read = function (settings) {
                            settings.operation = EOperation_1.EOperationDB.READ;
                            this.operations.push(settings);
                        };
                        Batch.prototype.update = function (settings, data, options) {
                            if (options === void 0) { options = null; }
                            var type = settings.collection && settings.collection.id ? "document" : "query";
                            options = options && Object.values(options).length > 0 ? options : { merge: true, returnData: false };
                            options.merge = options.merge == undefined ? true : options.merge;
                            return this.operations.push({
                                collName: type == "document" ? settings.collection.id : settings.collName,
                                docName: type == "document" ? settings.id : settings.docName,
                                operation: EOperation_1.EOperationDB.UPSERT,
                                query: settings.where && type == "query" ? utilities_1.Utilities.mountMatchAggregate(settings.where) : null,
                                data: data,
                                options: options
                            }) - 1;
                        };
                        Batch.prototype.delete = function (settings) {
                            settings.mode = settings.mode ? settings.mode : "document";
                            var type = settings.collection && settings.collection.id ? "document" : "query";
                            if (!settings.where && type == "query" && settings.mode == "document" || settings.where && Object.values(settings.where).length == 0 && type == "query" && settings.mode == "document") {
                                console.error("where can't be undefined.");
                                return;
                            }
                            if (settings.mode == "collection") {
                                if (type == "document") {
                                    console.error("Document is not valid object for delete collection.");
                                    return;
                                }
                                if (!settings.collName) {
                                    console.error("collName not defined.");
                                    return;
                                }
                                this.operations.push({
                                    collName: settings.collName,
                                    docName: null,
                                    query: null,
                                    operation: EOperation_1.EOperationDB.DELETECOLLECTION
                                });
                            }
                            else {
                                this.operations.push({
                                    collName: type == "document" ? settings.collection.id : settings.collName,
                                    docName: type == "document" ? settings.id : settings.docName,
                                    query: settings.where && type == "query" ? utilities_1.Utilities.mountMatchAggregate(settings.where) : null,
                                    operation: EOperation_1.EOperationDB.DELETE
                                });
                            }
                        };
                        Batch.prototype.commit = function () {
                            return __awaiter(this, void 0, void 0, function () {
                                var _this = this;
                                return __generator(this, function (_b) {
                                    return [2 /*return*/, new Promise(function (resolve, reject) {
                                            root.execAfterConnecting(function () {
                                                if (!root.isConnected) {
                                                    reject({
                                                        message: root.NOT_INITIALIZED_APP_MESSAGE
                                                    });
                                                    return;
                                                }
                                                if (_this.operations.length == 0) {
                                                    reject({
                                                        message: "Not has operatios to commit."
                                                    });
                                                }
                                                else {
                                                    var obj_1 = {
                                                        connection: root.connectionObject(),
                                                        action: {
                                                            data: _this.operations,
                                                            type: EOperation_1.EOperationDB.TRANSACTION,
                                                            service: EServiceTypes_1.EServiceTypes.DATABASE
                                                        }
                                                    };
                                                    // console.log(obj);
                                                    _this.operations = [];
                                                    var handler_1 = function (data) {
                                                        _a.shared.onChangesEmitter.removeListener(obj_1.connection.requestId, handler_1);
                                                        if (data.actionResult.status) {
                                                            resolve({
                                                                places: data.actionResult.places ? data.actionResult.places : {},
                                                                controls: data.actionResult.controls ? data.actionResult.controls : {},
                                                                duration: data.actionResult.duration,
                                                                data: {
                                                                    return: data.actionResult.returnData ? data.actionResult.returnData : {},
                                                                    query: data.actionResult.queryData ? data.actionResult.queryData : {},
                                                                }
                                                            });
                                                        }
                                                        else {
                                                            reject({
                                                                message: data.actionResult.message
                                                            });
                                                        }
                                                    };
                                                    _a.shared.onChangesEmitter.on(obj_1.connection.requestId, handler_1);
                                                    utilities_1.Utilities.sendRequest(root.connection, obj_1, root.CRPYPTO_SECRET_KEY());
                                                }
                                            });
                                        })];
                                });
                            });
                        };
                        Batch.prototype.commitsLength = function () {
                            return this.operations.length;
                        };
                        Batch.prototype.getOperations = function () {
                            return this.operations;
                        };
                        return Batch;
                    }());
                };
                // BACKUP
                Database.prototype.backup = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, new Promise(function (resolve, reject) {
                                        root.execAfterConnecting(function () {
                                            var obj = {
                                                connection: root.connectionObject(),
                                                action: {
                                                    type: EOperation_1.EOperationDB.BACKUP,
                                                    service: EServiceTypes_1.EServiceTypes.DATABASE,
                                                    data: {
                                                        type: "ADD"
                                                    }
                                                }
                                            };
                                            var handler = function (data) {
                                                _this.onChangesEmitter.removeListener(obj.connection.requestId, handler);
                                                if (!data.actionResult.status) {
                                                    reject(data.actionResult);
                                                    return;
                                                }
                                                data = data.actionResult;
                                                resolve(data);
                                            };
                                            _this.onChangesEmitter.on(obj.connection.requestId, handler);
                                            utilities_1.Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
                                        });
                                    })];
                                case 1: return [2 /*return*/, _b.sent()];
                            }
                        });
                    });
                };
                Database.prototype.deleteBackup = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, new Promise(function (resolve, reject) {
                                        root.execAfterConnecting(function () {
                                            var obj = {
                                                connection: root.connectionObject(),
                                                action: {
                                                    type: EOperation_1.EOperationDB.BACKUP,
                                                    service: EServiceTypes_1.EServiceTypes.DATABASE,
                                                    data: {
                                                        type: "DELETE"
                                                    }
                                                }
                                            };
                                            var handler = function (data) {
                                                _this.onChangesEmitter.removeListener(obj.connection.requestId, handler);
                                                if (!data.actionResult.status) {
                                                    reject(data.actionResult);
                                                    return;
                                                }
                                                data = data.actionResult;
                                                resolve(data);
                                            };
                                            _this.onChangesEmitter.on(obj.connection.requestId, handler);
                                            utilities_1.Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
                                        });
                                    })];
                                case 1: return [2 /*return*/, _b.sent()];
                            }
                        });
                    });
                };
                Database.prototype.importData = function (collectionsData_1) {
                    return __awaiter(this, arguments, void 0, function (collectionsData, collections) {
                        var _this = this;
                        if (collections === void 0) { collections = []; }
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, new Promise(function (resolve, reject) {
                                        root.execAfterConnecting(function () {
                                            var obj = {
                                                connection: root.connectionObject(),
                                                action: {
                                                    type: EOperation_1.EOperationDB.BACKUP,
                                                    service: EServiceTypes_1.EServiceTypes.DATABASE,
                                                    data: {
                                                        type: "IMPORT",
                                                        collections: collections ? collections : [],
                                                        collectionsData: collectionsData ? collectionsData : {},
                                                    }
                                                }
                                            };
                                            var handler = function (data) {
                                                _this.onChangesEmitter.removeListener(obj.connection.requestId, handler);
                                                if (!data.actionResult.status) {
                                                    reject(data.actionResult);
                                                    return;
                                                }
                                                data = data.actionResult;
                                                resolve(data);
                                            };
                                            _this.onChangesEmitter.on(obj.connection.requestId, handler);
                                            utilities_1.Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
                                        });
                                    })];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                };
                Database.prototype.restoreBackup = function (mode_1) {
                    return __awaiter(this, arguments, void 0, function (mode, collections) {
                        var _this = this;
                        if (collections === void 0) { collections = []; }
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, new Promise(function (resolve, reject) {
                                        root.execAfterConnecting(function () {
                                            var obj = {
                                                connection: root.connectionObject(),
                                                action: {
                                                    type: EOperation_1.EOperationDB.BACKUP,
                                                    service: EServiceTypes_1.EServiceTypes.DATABASE,
                                                    data: {
                                                        type: "RESTORE",
                                                        mode: mode,
                                                        collections: collections ? collections : [],
                                                    }
                                                }
                                            };
                                            var handler = function (data) {
                                                if (!data.actionResult.status) {
                                                    reject(data.actionResult);
                                                    return;
                                                }
                                                _this.onChangesEmitter.removeListener(obj.connection.requestId, handler);
                                                data = data.actionResult;
                                                resolve(data);
                                            };
                                            _this.onChangesEmitter.on(obj.connection.requestId, handler);
                                            utilities_1.Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
                                        });
                                    })];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                };
                // ReleaseInfo
                Database.prototype.getReleaseInfo = function (variation_1) {
                    return __awaiter(this, arguments, void 0, function (variation, callback) {
                        var _this = this;
                        if (callback === void 0) { callback = null; }
                        return __generator(this, function (_a) {
                            return [2 /*return*/, new Promise(function (resolve, reject) {
                                    root.execAfterConnecting(function () {
                                        var obj = {
                                            connection: root.connectionObject(),
                                            action: {
                                                type: EOperation_1.EOperationDB.RELEASEINFO,
                                                service: EServiceTypes_1.EServiceTypes.DATABASE,
                                                variation: variation,
                                            }
                                        };
                                        var handler = function (data) {
                                            _this.onChangesEmitter.removeListener(obj.connection.requestId, handler);
                                            if (!data.actionResult.status) {
                                                reject(data.actionResult);
                                                return;
                                            }
                                            data = data.actionResult;
                                            resolve(data);
                                        };
                                        _this.onChangesEmitter.on(obj.connection.requestId, handler);
                                        utilities_1.Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
                                    });
                                })];
                        });
                    });
                };
                Database.prototype.onReleaseInfo = function (variation, callback) {
                    if (callback === void 0) { callback = null; }
                    var listenerId = "release-lid-" + iTools.requestId();
                    this.getReleaseInfo(variation).then(function (res) { _a.shared.onChangesEmitter.emit(listenerId, res.data); });
                    this.onSnapshotReleaseCallbacks[listenerId] = {
                        callback: callback,
                        status: false,
                        listenerID: listenerId,
                        variation: variation,
                        collName: "Releases",
                        aggregate: { $match: { $and: [{ _id: variation }] } }
                    };
                    this.onChangesEmitter.addListener(listenerId, callback);
                    return listenerId;
                };
                Database.prototype.clearReleaseInfo = function (listenerId) {
                    this.onChangesEmitter.removeAllListeners(listenerId);
                };
                // COLLECTION
                Database.prototype.collection = function (collName, scheme) {
                    if (scheme === void 0) { scheme = null; }
                    return new /** @class */ (function () {
                        function Collection() {
                            this.database = _a.shared;
                            this._aggregate = {};
                            this.scheme = scheme;
                            this.setupScheme(this.scheme);
                        }
                        Object.defineProperty(Collection.prototype, "id", {
                            get: function () { return collName; },
                            enumerable: false,
                            configurable: true
                        });
                        // Utilities
                        Collection.prototype.setupScheme = function (scheme) {
                            var _this = this;
                            if (!scheme) {
                                this.schemeResult = {
                                    message: "No scheme",
                                    status: true
                                };
                                return;
                            }
                            root.execAfterConnecting(function () {
                                var exec = function () {
                                    var obj = {
                                        connection: root.connectionObject(),
                                        action: {
                                            collName: _this.id,
                                            type: EOperation_1.EOperationDB.SETUPCOLLECTIONSCHEME,
                                            service: EServiceTypes_1.EServiceTypes.DATABASE,
                                            data: scheme
                                        }
                                    };
                                    var handler = function (data) {
                                        _this.database.onChangesEmitter.removeListener(obj.connection.requestId, handler);
                                        _this.schemeResult = data.actionResult;
                                    };
                                    _this.database.onChangesEmitter.on(obj.connection.requestId, handler);
                                    utilities_1.Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
                                };
                                if (!root.isConnected) {
                                }
                                else {
                                    exec();
                                }
                            });
                        };
                        Collection.prototype.execAfterSetupScheme = function (callback) {
                            var _this = this;
                            var timer = setInterval(function () {
                                if (_this.schemeResult) {
                                    clearInterval(timer);
                                    if (_this.schemeResult.status) {
                                        callback();
                                    }
                                    else {
                                        console.error("Error in scheme setup: ", _this.schemeResult.message);
                                    }
                                }
                            }, 0);
                        };
                        // Collection Actions
                        Collection.prototype.get = function () {
                            return __awaiter(this, void 0, void 0, function () {
                                var _this = this;
                                return __generator(this, function (_b) {
                                    return [2 /*return*/, new Promise(function (resolve, reject) {
                                            root.execAfterConnecting(function () {
                                                if (!root.isConnected) {
                                                    reject({
                                                        message: root.NOT_INITIALIZED_APP_MESSAGE
                                                    });
                                                    return;
                                                }
                                                if (_this._aggregate.test) {
                                                    console.log(utilities_1.Utilities.getAggregateObject(_this._aggregate, true));
                                                    return;
                                                }
                                                var obj = {
                                                    connection: root.connectionObject(),
                                                    action: {
                                                        collName: _this.id,
                                                        type: "READ",
                                                        service: EServiceTypes_1.EServiceTypes.DATABASE,
                                                        filterFn: _this._filterFn,
                                                        aggregate: _this._filterFn ? null : utilities_1.Utilities.getAggregateObject(_this._aggregate)
                                                    }
                                                };
                                                var handler = function (data) {
                                                    _this.database.onChangesEmitter.removeListener(obj.connection.requestId, handler);
                                                    if (!data.actionResult.status) {
                                                        return reject(data.actionResult);
                                                    }
                                                    data = data.actionResult.data;
                                                    var result = [];
                                                    data.forEach(function (item) {
                                                        result.push({
                                                            data: function () { return item; },
                                                            ref: _this.doc(item._id),
                                                            id: item._id
                                                        });
                                                    });
                                                    resolve({
                                                        docs: result,
                                                        changes: function () { return []; },
                                                        ref: _this
                                                    });
                                                };
                                                _this._filterFn = null;
                                                _this._aggregate = {};
                                                _this.database.onChangesEmitter.on(obj.connection.requestId, handler);
                                                utilities_1.Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
                                            });
                                        })];
                                });
                            });
                        };
                        Collection.prototype.onSnapshot = function (callback, error) {
                            var _this = this;
                            if (error === void 0) { error = function () { }; }
                            var aggregate = utilities_1.Utilities.getAggregateObject(this._aggregate);
                            var filterFn = this._filterFn;
                            var snapshotId = "listener-" + iTools.requestId();
                            root.execAfterConnecting(function () {
                                if (!root.isConnected) {
                                    return null;
                                }
                                var obj = {
                                    connection: root.connectionObject(),
                                    action: {
                                        collName: _this.id,
                                        type: "READ",
                                        service: EServiceTypes_1.EServiceTypes.DATABASE,
                                        filterFn: filterFn,
                                        aggregate: filterFn ? null : aggregate
                                    }
                                };
                                var objSnapshot = {
                                    connection: root.connectionObject(),
                                    action: {
                                        collName: _this.id,
                                        type: "SNAPSHOT",
                                        service: EServiceTypes_1.EServiceTypes.DATABASE,
                                        data: {
                                            on: {
                                                id: snapshotId,
                                                filterFn: filterFn,
                                                aggregate: filterFn ? null : aggregate
                                            }
                                        }
                                    }
                                };
                                _this.database.onSnapshotCollectionCallbacks[snapshotId].requestObject = utilities_1.Utilities.deepClone(objSnapshot);
                                var handler = function (data) {
                                    _this.database.onChangesEmitter.removeListener(obj.connection.requestId, handler);
                                    if (!data.actionResult.status) {
                                        if (error) {
                                            error(data.actionResult);
                                        }
                                        return;
                                    }
                                    var handlerSnapshotActionResult = function (data) {
                                        _this.database.onChangesEmitter.removeListener(objSnapshot.connection.requestId, handlerSnapshotActionResult);
                                        data = data.snapshotActionResult;
                                        if (!data) {
                                            return;
                                        }
                                        if (data.status) {
                                            data.listenerID = objSnapshot.action.data.on.id;
                                            _this.database.onSnapshotCollectionCallbacks[data.listenerID].status = true;
                                        }
                                    };
                                    data = data.actionResult.data;
                                    var docs = [];
                                    data.forEach(function (item) {
                                        docs.push({
                                            data: function () { return item; },
                                            ref: _this.doc(item._id),
                                            id: item._id
                                        });
                                    });
                                    _this.database.onChangesEmitter.on(objSnapshot.action.data.on.id, handlerChanges);
                                    _this.database.onChangesEmitter.on(objSnapshot.connection.requestId, handlerSnapshotActionResult);
                                    utilities_1.Utilities.sendRequest(root.connection, objSnapshot, root.CRPYPTO_SECRET_KEY());
                                    callback({
                                        id: _this.id,
                                        changes: function () { return []; },
                                        docs: docs,
                                        ref: _this
                                    });
                                };
                                var handlerChanges = function (data) {
                                    var changes = [];
                                    data.forEach(function (change) {
                                        if (change.operationType == "invalidate" || change.operationType == "drop") {
                                            return;
                                        }
                                        var changeType = change.operationType == "insert" ? "ADD" : (change.operationType == "replace" || change.operationType == "update") ? "UPDATE" : "DELETE";
                                        if (changeType == "UPDATE" || changeType == "ADD") {
                                            if (!change.fullDocument) {
                                                return;
                                            }
                                        }
                                        changes.push({
                                            id: change.operationType == "delete" ? change.documentKey._id : change.fullDocument._id,
                                            data: function () { return change.operationType == "delete" ? change.documentKey : change.fullDocument; },
                                            ref: _this,
                                            type: change.operationType == "insert" ? "ADD" : (change.operationType == "replace" || change.operationType == "update") ? "UPDATE" : "DELETE"
                                        });
                                    });
                                    if (!changes.length) {
                                        return;
                                    }
                                    var obj = {
                                        connection: root.connectionObject(),
                                        action: {
                                            collName: _this.id,
                                            type: "READ",
                                            service: EServiceTypes_1.EServiceTypes.DATABASE,
                                            aggregate: aggregate
                                        }
                                    };
                                    var handler = function (data) {
                                        _this.database.onChangesEmitter.removeListener(obj.connection.requestId, handler);
                                        if (!data.actionResult.status) {
                                            if (error) {
                                                error(data.actionResult);
                                            }
                                            return;
                                        }
                                        data = data.actionResult.data;
                                        var docs = [];
                                        // console.log("...... ",changes, data);
                                        data.forEach(function (item) {
                                            docs.push({
                                                data: function () { return item; },
                                                ref: _this.doc(item._id),
                                                id: item._id
                                            });
                                        });
                                        callback({
                                            id: _this.id,
                                            changes: function () {
                                                return changes;
                                            },
                                            docs: docs,
                                            ref: _this
                                        });
                                    };
                                    _this.database.onChangesEmitter.on(obj.connection.requestId, handler);
                                    utilities_1.Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
                                };
                                _this.database.onChangesEmitter.on(obj.connection.requestId, handler);
                                utilities_1.Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
                            });
                            // this.database.onChangesEmitter.on("");
                            this._filterFn = null;
                            this._aggregate = {};
                            this.database.onSnapshotCollectionCallbacks[snapshotId] = {
                                callback: callback,
                                status: false,
                                listenerID: snapshotId,
                                aggregate: aggregate,
                            };
                            return snapshotId;
                        };
                        Collection.prototype.clearSnapshot = function (id) {
                            var _this = this;
                            root.execAfterConnecting(function () {
                                if (!root.isConnected) {
                                    return null;
                                }
                                var exec = function () {
                                    var objSnapshot = {
                                        connection: root.connectionObject(),
                                        action: {
                                            collName: _this.id,
                                            type: "SNAPSHOT",
                                            service: EServiceTypes_1.EServiceTypes.DATABASE,
                                            data: {
                                                off: {
                                                    id: id
                                                }
                                            }
                                        }
                                    };
                                    var handler = function (data) {
                                        data = data.snapshotActionResult;
                                        var watchInfo = _this.database.onSnapshotCollectionCallbacks[id];
                                        if (watchInfo) {
                                            _this.database.onChangesEmitter.removeListener(objSnapshot.connection.requestId, watchInfo.callback);
                                            delete _this.database.onSnapshotCollectionCallbacks[data.listenerID];
                                        }
                                    };
                                    _this.database.onChangesEmitter.on(objSnapshot.connection.requestId, handler);
                                    utilities_1.Utilities.sendRequest(root.connection, objSnapshot, root.CRPYPTO_SECRET_KEY());
                                };
                                if (_this.database.onSnapshotCollectionCallbacks) {
                                    var timer_1 = setInterval(function () {
                                        if (_this.database.onSnapshotCollectionCallbacks[id]) {
                                            if (_this.database.onSnapshotCollectionCallbacks[id].status) {
                                                exec();
                                                clearInterval(timer_1);
                                            }
                                        }
                                        else {
                                            clearInterval(timer_1);
                                        }
                                    }, 200);
                                }
                            });
                        };
                        // Aggregate Params
                        Collection.prototype.limit = function (limit) {
                            if (limit <= 0) {
                                console.error("Limit must be great than 0.");
                            }
                            if (!this._aggregate) {
                                this._aggregate = {
                                    limit: limit
                                };
                            }
                            else {
                                this._aggregate.limit = limit;
                            }
                            return this;
                        };
                        Collection.prototype.startAt = function (startAt) {
                            if (startAt <= 0) {
                                console.error("StartAt must be great than 0.");
                            }
                            this._aggregate["skip"] = startAt == 1 ? 0 : startAt;
                            return this;
                        };
                        Collection.prototype.startAfter = function (startAfter) {
                            if (startAfter < 0) {
                                console.error("StartAfter must be great than or equal 0.");
                            }
                            this._aggregate["skip"] = startAfter;
                            return this;
                        };
                        Collection.prototype.endAt = function (endAt) {
                            if (this._aggregate["skip"] == null) {
                                console.error("StartAt or StartAfter must be defined before endAt.");
                                return;
                            }
                            this._aggregate["limit"] = endAt - this._aggregate["skip"] + 1;
                            return this;
                        };
                        Collection.prototype.orderBy = function (orderBy) {
                            if (!orderBy && Object.entries(orderBy).length == 0) {
                                console.error("Define some column to order.");
                                return this;
                            }
                            this._aggregate['sort'] = orderBy;
                            return this;
                        };
                        Collection.prototype.where = function (and, test) {
                            if (test === void 0) { test = null; }
                            if (and && Object.values(and).length == 0) {
                                return this;
                            }
                            if (!this._aggregate['match']) {
                                this._aggregate['match'] = { $and: [] };
                            }
                            if (!this._aggregate['match']["$and"]) {
                                this._aggregate["match"]["$and"] = [];
                            }
                            if (test) {
                                this._aggregate.test = true;
                            }
                            for (var i in and) {
                                this._aggregate["match"]["$and"].push(and[i]);
                            }
                            return this;
                        };
                        Collection.prototype.or = function (or) {
                            if (or && Object.values(or).length == 0) {
                                return this;
                            }
                            if (!this._aggregate['match']) {
                                this._aggregate['match'] = { $and: [] };
                            }
                            if (!this._aggregate['match']["$or"]) {
                                this._aggregate["match"]["$or"] = [];
                            }
                            for (var i in or) {
                                this._aggregate["match"]["$or"].push(or[i]);
                            }
                            return this;
                        };
                        Collection.prototype.groupBy = function (groupBy, project) {
                            if (project === void 0) { project = {}; }
                            if (this._aggregate["count"]) {
                                console.error("Can only define one these: group or count.");
                            }
                            if (project && Object.values(project).length) {
                                for (var i in project) {
                                    project[i] = project[i] ? 1 : 0;
                                }
                                this._aggregate["project"] = project;
                            }
                            this._aggregate["group"] = groupBy;
                            return this;
                        };
                        Collection.prototype.count = function () {
                            if (this._aggregate["count"]) {
                                console.error("Can only define one these: group or count.");
                            }
                            this._aggregate["count"] = "count";
                            return this;
                        };
                        Collection.prototype.filter = function (fn) {
                            this._filterFn = fn.toString();
                            return this;
                        };
                        // Rename
                        Collection.prototype.rename = function (newName) {
                            return __awaiter(this, void 0, void 0, function () {
                                var _this = this;
                                return __generator(this, function (_b) {
                                    return [2 /*return*/, new Promise(function (resolve, reject) {
                                            root.execAfterConnecting(function () {
                                                var obj = {
                                                    connection: root.connectionObject(),
                                                    action: {
                                                        type: EOperation_1.EOperationDB.RENAMECOLLECTION,
                                                        service: EServiceTypes_1.EServiceTypes.DATABASE,
                                                        collName: _this.id,
                                                        data: {
                                                            newName: newName
                                                        }
                                                    }
                                                };
                                                if (!_this.id || _this.id && !_this.id.trim()) {
                                                    reject({
                                                        status: false,
                                                        message: "CollName is undefined."
                                                    });
                                                    return;
                                                }
                                                if (!newName || newName && !newName.trim()) {
                                                    reject({
                                                        status: false,
                                                        message: "Collection new name is undefined."
                                                    });
                                                    return;
                                                }
                                                var handler = function (data) {
                                                    _this.database.onChangesEmitter.removeListener(obj.connection.requestId, handler);
                                                    if (!data.actionResult.status) {
                                                        reject(data.actionResult);
                                                        return;
                                                    }
                                                    data = data.actionResult;
                                                    resolve(data);
                                                };
                                                _this.database.onChangesEmitter.on(obj.connection.requestId, handler);
                                                utilities_1.Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
                                            });
                                        })];
                                });
                            });
                        };
                        // Delete
                        Collection.prototype.delete = function () {
                            return __awaiter(this, arguments, void 0, function (mode) {
                                var _this = this;
                                if (mode === void 0) { mode = "document"; }
                                return __generator(this, function (_b) {
                                    return [2 /*return*/, new Promise(function (resolve, reject) {
                                            root.execAfterConnecting(function () {
                                                if (!root.isConnected) {
                                                    reject({
                                                        message: root.NOT_INITIALIZED_APP_MESSAGE
                                                    });
                                                    return;
                                                }
                                                var obj = {
                                                    connection: root.connectionObject(),
                                                    action: {
                                                        collName: _this.id,
                                                        docName: null,
                                                        type: "DELETE",
                                                        service: EServiceTypes_1.EServiceTypes.DATABASE,
                                                        mode: mode,
                                                        query: mode == "document" ? utilities_1.Utilities.getAggregateObject(_this._aggregate).match : null
                                                    }
                                                };
                                                if (!obj.action.query && mode == "document") {
                                                    reject({
                                                        message: "Deletion condition not defined."
                                                    });
                                                    return;
                                                }
                                                var handler = function (data) {
                                                    _a.shared.onChangesEmitter.removeListener(obj.connection.requestId, handler);
                                                    if (data.actionResult.status) {
                                                        resolve(data.actionResult);
                                                    }
                                                    else {
                                                        reject(data.actionResult);
                                                    }
                                                };
                                                _a.shared.onChangesEmitter.on(obj.connection.requestId, handler);
                                                utilities_1.Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
                                            });
                                        })];
                                });
                            });
                        };
                        // INDEXES
                        Collection.prototype.getIndexes = function () {
                            return __awaiter(this, void 0, void 0, function () {
                                var _this = this;
                                return __generator(this, function (_b) {
                                    return [2 /*return*/, new Promise(function (resolve, reject) {
                                            root.execAfterConnecting(function () {
                                                if (!root.isConnected) {
                                                    reject({
                                                        message: root.NOT_INITIALIZED_APP_MESSAGE
                                                    });
                                                    return;
                                                }
                                                var obj = {
                                                    connection: root.connectionObject(),
                                                    action: {
                                                        collName: _this.id,
                                                        docName: null,
                                                        type: EOperation_1.EOperationDB.INDEXES,
                                                        mode: "read",
                                                        service: EServiceTypes_1.EServiceTypes.DATABASE
                                                    }
                                                };
                                                var handler = function (data) {
                                                    _a.shared.onChangesEmitter.removeListener(obj.connection.requestId, handler);
                                                    if (data.actionResult.status) {
                                                        resolve(data.actionResult);
                                                    }
                                                    else {
                                                        reject(data.actionResult);
                                                    }
                                                };
                                                _a.shared.onChangesEmitter.on(obj.connection.requestId, handler);
                                                utilities_1.Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
                                            });
                                        })];
                                });
                            });
                        };
                        Collection.prototype.createIndexes = function (data) {
                            return __awaiter(this, void 0, void 0, function () {
                                var _this = this;
                                return __generator(this, function (_b) {
                                    return [2 /*return*/, new Promise(function (resolve, reject) {
                                            root.execAfterConnecting(function () {
                                                if (!root.isConnected) {
                                                    reject({
                                                        message: root.NOT_INITIALIZED_APP_MESSAGE
                                                    });
                                                    return;
                                                }
                                                var obj = {
                                                    connection: root.connectionObject(),
                                                    action: {
                                                        collName: _this.id,
                                                        docName: null,
                                                        type: EOperation_1.EOperationDB.INDEXES,
                                                        mode: "add",
                                                        service: EServiceTypes_1.EServiceTypes.DATABASE,
                                                        data: {
                                                            indexes: data
                                                        }
                                                    }
                                                };
                                                var handler = function (data) {
                                                    _a.shared.onChangesEmitter.removeListener(obj.connection.requestId, handler);
                                                    if (data.actionResult.status) {
                                                        resolve(data.actionResult);
                                                    }
                                                    else {
                                                        reject(data.actionResult);
                                                    }
                                                };
                                                _a.shared.onChangesEmitter.on(obj.connection.requestId, handler);
                                                utilities_1.Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
                                            });
                                        })];
                                });
                            });
                        };
                        Collection.prototype.deleteIndex = function (name) {
                            return __awaiter(this, void 0, void 0, function () {
                                var _this = this;
                                return __generator(this, function (_b) {
                                    return [2 /*return*/, new Promise(function (resolve, reject) {
                                            root.execAfterConnecting(function () {
                                                if (!root.isConnected) {
                                                    reject({
                                                        message: root.NOT_INITIALIZED_APP_MESSAGE
                                                    });
                                                    return;
                                                }
                                                var obj = {
                                                    connection: root.connectionObject(),
                                                    action: {
                                                        collName: _this.id,
                                                        docName: null,
                                                        type: EOperation_1.EOperationDB.INDEXES,
                                                        mode: "delete",
                                                        service: EServiceTypes_1.EServiceTypes.DATABASE,
                                                        data: {
                                                            name: name
                                                        }
                                                    }
                                                };
                                                var handler = function (data) {
                                                    _a.shared.onChangesEmitter.removeListener(obj.connection.requestId, handler);
                                                    if (data.actionResult.status) {
                                                        resolve(data.actionResult);
                                                    }
                                                    else {
                                                        reject(data.actionResult);
                                                    }
                                                };
                                                _a.shared.onChangesEmitter.on(obj.connection.requestId, handler);
                                                utilities_1.Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
                                            });
                                        })];
                                });
                            });
                        };
                        // DOCUMENT
                        Collection.prototype.doc = function (docName) {
                            if (docName === void 0) { docName = null; }
                            var collection = this;
                            return new /** @class */ (function () {
                                function Document() {
                                }
                                Object.defineProperty(Document.prototype, "collection", {
                                    get: function () { return collection; },
                                    enumerable: false,
                                    configurable: true
                                });
                                ;
                                Object.defineProperty(Document.prototype, "id", {
                                    get: function () { return docName && docName.trim() ? docName.trim() : null; },
                                    enumerable: false,
                                    configurable: true
                                });
                                // Document Actions
                                Document.prototype.get = function () {
                                    return __awaiter(this, void 0, void 0, function () {
                                        var _this = this;
                                        return __generator(this, function (_b) {
                                            return [2 /*return*/, new Promise(function (resolve, reject) {
                                                    root.execAfterConnecting(function () {
                                                        if (!root.isConnected) {
                                                            reject({
                                                                message: root.NOT_INITIALIZED_APP_MESSAGE
                                                            });
                                                            return;
                                                        }
                                                        if (_this.id == undefined) {
                                                            setTimeout(function () {
                                                                reject({
                                                                    message: "DocumentId is not defined."
                                                                });
                                                            }, 200);
                                                        }
                                                        else {
                                                            var handler_2 = function (data) {
                                                                _this.collection.database.onChangesEmitter.removeListener(obj_2.connection.requestId, handler_2);
                                                                if (!data.actionResult.status) {
                                                                    return reject(data.actionResult);
                                                                }
                                                                var result = data.actionResult.data ? data.actionResult.data[0] : null;
                                                                resolve({
                                                                    data: function () { return result; },
                                                                    ref: _this,
                                                                    id: result ? result._id : result
                                                                });
                                                            };
                                                            var obj_2 = {
                                                                connection: root.connectionObject(),
                                                                action: {
                                                                    collName: _this.collection.id,
                                                                    docName: _this.id,
                                                                    type: "READ",
                                                                    service: EServiceTypes_1.EServiceTypes.DATABASE,
                                                                }
                                                            };
                                                            _this.collection.database.onChangesEmitter.on(obj_2.connection.requestId, handler_2);
                                                            utilities_1.Utilities.sendRequest(root.connection, obj_2, root.CRPYPTO_SECRET_KEY());
                                                        }
                                                    });
                                                })];
                                        });
                                    });
                                };
                                Document.prototype.onSnapshot = function (callback, error, test) {
                                    var _this = this;
                                    if (error === void 0) { error = function () { }; }
                                    if (test === void 0) { test = null; }
                                    var snapshotId = "listener-" + iTools.requestId();
                                    root.execAfterConnecting(function () {
                                        if (!root.isConnected || !_this.id) {
                                            return null;
                                        }
                                        var obj = {
                                            connection: root.connectionObject(),
                                            action: {
                                                collName: _this.collection.id,
                                                docName: _this.id,
                                                service: EServiceTypes_1.EServiceTypes.DATABASE,
                                                type: "READ"
                                            }
                                        };
                                        var objSnapshot = {
                                            connection: root.connectionObject(),
                                            action: {
                                                collName: _this.collection.id,
                                                type: "SNAPSHOT",
                                                service: EServiceTypes_1.EServiceTypes.DATABASE,
                                                data: {
                                                    on: {
                                                        id: snapshotId,
                                                        aggregate: {
                                                            match: { "_id": _this.id }
                                                        }
                                                    }
                                                }
                                            }
                                        };
                                        _this.collection.database.onSnapshotDocCallbacks[snapshotId].requestObject = utilities_1.Utilities.deepClone(objSnapshot);
                                        var handler = function (data) {
                                            _this.collection.database.onChangesEmitter.removeListener(obj.connection.requestId, handler);
                                            if (!data.actionResult.status) {
                                                if (error) {
                                                    error(data.actionResult);
                                                }
                                                return;
                                            }
                                            data = data.actionResult.data;
                                            var result = data[0];
                                            var handlerSnapshotActionResult = function (data) {
                                                _this.collection.database.onChangesEmitter.removeListener(objSnapshot.connection.requestId, handlerSnapshotActionResult);
                                                data = data.snapshotActionResult;
                                                if (data.status) {
                                                    data.listenerID = objSnapshot.action.data.on.id;
                                                    _this.collection.database.onSnapshotDocCallbacks[data.listenerID].status = true;
                                                }
                                            };
                                            _this.collection.database.onChangesEmitter.on(objSnapshot.action.data.on.id, handlerChanges);
                                            _this.collection.database.onChangesEmitter.on(objSnapshot.connection.requestId, handlerSnapshotActionResult);
                                            utilities_1.Utilities.sendRequest(root.connection, objSnapshot, root.CRPYPTO_SECRET_KEY());
                                            callback({
                                                id: result ? result._id : undefined,
                                                data: function () { return result; },
                                                ref: _this,
                                                type: "ADD"
                                            });
                                        };
                                        var handlerChanges = function (data) {
                                            var change = data[0];
                                            if (!change) {
                                                return;
                                            }
                                            if (change.operationType == "invalidate" || change.operationType == "drop") {
                                                return;
                                            }
                                            callback({
                                                id: change.operationType == "delete" ? change.documentKey._id : change.fullDocument._id,
                                                data: function () { return change.operationType == "delete" ? change.documentKey : change.fullDocument; },
                                                ref: _this,
                                                type: change.operationType == "insert" ? "ADD" : (change.operationType == "replace" || change.operationType == "update") ? "UPDATE" : "DELETE"
                                            });
                                        };
                                        _this.collection.database.onChangesEmitter.on(obj.connection.requestId, handler);
                                        utilities_1.Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
                                    });
                                    this.collection.database.onSnapshotDocCallbacks[snapshotId] = {
                                        callback: callback,
                                        snapshotId: snapshotId,
                                        docName: this.id,
                                    };
                                    return snapshotId;
                                };
                                Document.prototype.clearSnapshot = function (id) {
                                    var _this = this;
                                    root.execAfterConnecting(function () {
                                        if (!root.isConnected) {
                                            return null;
                                        }
                                        var exec = function () {
                                            var objSnapshot = {
                                                connection: root.connectionObject(),
                                                action: {
                                                    collName: _this.collection.id,
                                                    type: "SNAPSHOT",
                                                    service: EServiceTypes_1.EServiceTypes.DATABASE,
                                                    data: {
                                                        off: {
                                                            id: id
                                                        }
                                                    }
                                                }
                                            };
                                            var handler = function (data) {
                                                data = data.snapshotActionResult;
                                                var watchInfo = _this.collection.database.onSnapshotDocCallbacks[id];
                                                if (watchInfo) {
                                                    _this.collection.database.onChangesEmitter.removeListener(objSnapshot.connection.requestId, watchInfo.callback);
                                                    delete _this.collection.database.onSnapshotDocCallbacks[data.listenerID];
                                                }
                                            };
                                            _this.collection.database.onChangesEmitter.on(objSnapshot.connection.requestId, handler);
                                            utilities_1.Utilities.sendRequest(root.connection, objSnapshot, root.CRPYPTO_SECRET_KEY());
                                        };
                                        if (_this.collection.database.onSnapshotDocCallbacks) {
                                            var timer_2 = setInterval(function () {
                                                if (_this.collection.database.onSnapshotDocCallbacks[id]) {
                                                    if (_this.collection.database.onSnapshotDocCallbacks[id].status) {
                                                        exec();
                                                        clearInterval(timer_2);
                                                    }
                                                }
                                                else {
                                                    clearInterval(timer_2);
                                                }
                                            }, 200);
                                        }
                                    });
                                };
                                Document.prototype.update = function (data, options) {
                                    var _this = this;
                                    if (options === void 0) { options = null; }
                                    return new Promise(function (resolve, reject) {
                                        root.execAfterConnecting(function () {
                                            var exec = function () {
                                                if (!data && !options || data && Object.entries(data).length == 0 && !options) {
                                                    reject({
                                                        status: false,
                                                        message: "Data is null"
                                                    });
                                                    return;
                                                }
                                                if (_this.collection.id.toLowerCase().trim() === "authenticate") {
                                                    reject({
                                                        message: "Entity reserved to the system."
                                                    });
                                                    return;
                                                }
                                                var obj = {
                                                    connection: root.connectionObject(),
                                                    action: {
                                                        collName: _this.collection.id,
                                                        docName: _this.id && _this.id.trim() ? _this.id.trim() : null,
                                                        type: "UPDATE",
                                                        service: EServiceTypes_1.EServiceTypes.DATABASE,
                                                        data: data,
                                                        options: options
                                                    }
                                                };
                                                var handler = function (data) {
                                                    _this.collection.database.onChangesEmitter.removeListener(obj.connection.requestId, handler);
                                                    if (data.actionResult.status) {
                                                        resolve(data.actionResult);
                                                    }
                                                    else {
                                                        reject(data.actionResult);
                                                    }
                                                };
                                                _this.collection.database.onChangesEmitter.on(obj.connection.requestId, handler);
                                                utilities_1.Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
                                            };
                                            if (!root.isConnected) {
                                                reject({
                                                    message: root.NOT_INITIALIZED_APP_MESSAGE
                                                });
                                            }
                                            else {
                                                _this.collection.execAfterSetupScheme(function () {
                                                    exec();
                                                });
                                            }
                                        });
                                    });
                                };
                                Document.prototype.delete = function () {
                                    return __awaiter(this, void 0, void 0, function () {
                                        var _this = this;
                                        return __generator(this, function (_b) {
                                            return [2 /*return*/, new Promise(function (resolve, reject) {
                                                    root.execAfterConnecting(function () {
                                                        if (!root.isConnected) {
                                                            reject({
                                                                message: root.NOT_INITIALIZED_APP_MESSAGE
                                                            });
                                                            return;
                                                        }
                                                        var exec = function () {
                                                            if (_this.collection.id.toLowerCase().trim() === "authenticate") {
                                                                reject({
                                                                    message: "Entity reserved to the system."
                                                                });
                                                                return;
                                                            }
                                                            if (!_this.id || _this.id && !_this.id.trim()) {
                                                                reject({
                                                                    message: "DocumentId is not defined."
                                                                });
                                                                return;
                                                            }
                                                            var obj = {
                                                                connection: root.connectionObject(),
                                                                action: {
                                                                    collName: _this.collection.id,
                                                                    docName: _this.id,
                                                                    service: EServiceTypes_1.EServiceTypes.DATABASE,
                                                                    mode: "document",
                                                                    type: "DELETE"
                                                                }
                                                            };
                                                            var handler = function (data) {
                                                                _a.shared.onChangesEmitter.removeListener(obj.connection.requestId, handler);
                                                                if (data.actionResult.status) {
                                                                    resolve(data.actionResult);
                                                                }
                                                                else {
                                                                    reject(data.actionResult);
                                                                }
                                                            };
                                                            _a.shared.onChangesEmitter.on(obj.connection.requestId, handler);
                                                            utilities_1.Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
                                                        };
                                                        exec();
                                                    });
                                                })];
                                        });
                                    });
                                };
                                return Document;
                            }());
                        };
                        return Collection;
                    }());
                };
                return Database;
            }()),
            _a.shared = null,
            _a);
    };
    iTools.prototype.auth = function () {
        if (this._authenticate) {
            return this._authenticate;
        }
        var root = this;
        return this._authenticate = new /** @class */ (function () {
            function class_1() {
            }
            class_1.prototype.createUser = function () {
                return __awaiter(this, arguments, void 0, function (user, secretKey) {
                    var _this = this;
                    if (user === void 0) { user = null; }
                    if (secretKey === void 0) { secretKey = null; }
                    return __generator(this, function (_a) {
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                root.execAfterConnecting(function () {
                                    if (!user || user && Object.values(user).length == 0) {
                                        reject({
                                            status: false,
                                            message: "User data can't be empty."
                                        });
                                    }
                                    user.password = cryptojs.SHA256(user.password).toString();
                                    if (!root.isConnected) {
                                        reject({
                                            message: root.NOT_INITIALIZED_APP_MESSAGE
                                        });
                                        return;
                                    }
                                    var obj = {
                                        connection: root.connectionObject(),
                                        action: {
                                            type: "VALIDATE_SECRET_KEY",
                                            service: EServiceTypes_1.EServiceTypes.DATABASE,
                                            secretKey: secretKey
                                        }
                                    };
                                    user.email = user.email.toLowerCase();
                                    var callback = function (data) {
                                        if (secretKey) {
                                            if (!data.status) {
                                                reject(data);
                                                return;
                                            }
                                            user.type = "root";
                                        }
                                        root.database().collection("#SYSTEM_AUTHENTICATE#").where([
                                            { field: "email", operator: "=", "value": user.email }
                                        ]).get().then(function (data) {
                                            if (data.docs.length > 0) {
                                                reject({
                                                    status: false,
                                                    message: "User already registered.",
                                                    code: "user-already-registered"
                                                });
                                            }
                                            else {
                                                _this.update(null, user).then(function () {
                                                    resolve({
                                                        status: true,
                                                        message: "User was created with success."
                                                    });
                                                }).catch(function (error) {
                                                    reject({
                                                        status: false,
                                                        message: "Error in create user.",
                                                        code: "user-can-not-register"
                                                    });
                                                });
                                            }
                                        }).catch(function (data) {
                                            reject({
                                                status: false,
                                                message: "Error in read users.",
                                                code: "can-not-read-users"
                                            });
                                        });
                                    };
                                    var handler = function (event) {
                                        // if(Utilities.isAuthResponse(event)){ return; }
                                        var data = null;
                                        try {
                                            // data = cryptojs.AES.decrypt(event.data, root.CRPYPTO_SECRET_KEY()).toString(cryptojs.enc.Utf8);
                                            data = event.data;
                                        }
                                        catch (e) {
                                            console.error("Invalid projectId");
                                            return;
                                        }
                                        data = JSON.parse(data);
                                        if (data.actionResult && data.connection.requestId === obj.connection.requestId) {
                                            if (data.actionResult.status) {
                                                callback(data.actionResult);
                                            }
                                            else {
                                                callback(data.actionResult);
                                            }
                                            root.connection.removeEventListener("message", handler);
                                        }
                                    };
                                    root.connection.addEventListener("message", handler);
                                    utilities_1.Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
                                });
                            })];
                    });
                });
            };
            class_1.prototype.updateUser = function () {
                return __awaiter(this, arguments, void 0, function (user) {
                    var _this = this;
                    if (user === void 0) { user = null; }
                    return __generator(this, function (_a) {
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                root.execAfterConnecting(function () {
                                    if (!root.isConnected) {
                                        reject({
                                            message: root.NOT_INITIALIZED_APP_MESSAGE
                                        });
                                        return;
                                    }
                                    user = user ? user : root.currentUser;
                                    if (!user || user && Object.values(user).length == 0 || !user && !root.currentUser || user && Object.values(user).length == 0 && !root.currentUser) {
                                        reject({
                                            status: false,
                                            message: "User data can't be empty.",
                                            code: "user-data-is-empty"
                                        });
                                    }
                                    if (!user._id && !user.email) {
                                        reject({
                                            status: false,
                                            message: "_id and email can't be undefined.",
                                            code: "email-is-undefined"
                                        });
                                    }
                                    if (user.password) {
                                        user.password = cryptojs.SHA256(user.password).toString();
                                    }
                                    user.email = user.email.toLowerCase();
                                    root.database().collection("#SYSTEM_AUTHENTICATE#").where([
                                        { field: "email", "operator": "=", "value": user.email }
                                    ]).get().then(function (data) {
                                        if (data.docs.length > 0) {
                                            _this.update(data.docs[0].data()._id, user).then(function () {
                                                resolve({
                                                    status: true,
                                                    message: "User was updated with success."
                                                });
                                            }).catch(function () {
                                                reject({
                                                    status: false,
                                                    message: "Error in updated user.",
                                                    code: "can-not-update-user"
                                                });
                                            });
                                        }
                                        else {
                                            reject({
                                                status: false,
                                                message: "User not found.",
                                                code: "can-not-find-user"
                                            });
                                        }
                                    });
                                });
                            })];
                    });
                });
            };
            class_1.prototype.deleteUser = function () {
                return __awaiter(this, arguments, void 0, function (user) {
                    var _this = this;
                    if (user === void 0) { user = null; }
                    return __generator(this, function (_a) {
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                root.execAfterConnecting(function () {
                                    if (!root.isConnected) {
                                        reject({
                                            message: root.NOT_INITIALIZED_APP_MESSAGE
                                        });
                                        return;
                                    }
                                    user = user ? user : root.currentUser;
                                    if (!user || user && Object.values(user).length == 0) {
                                        reject({
                                            status: false,
                                            message: "User data can't be empty."
                                        });
                                    }
                                    if (!user._id && !user.email) {
                                        reject({
                                            status: false,
                                            message: "_id and email can't be undefined."
                                        });
                                    }
                                    root.database().collection("#SYSTEM_AUTHENTICATE#").where([
                                        { field: "email", operator: "=", "value": user.email }
                                    ]).get().then(function (data) {
                                        if (data.docs.length > 0) {
                                            _this.delete(data.docs[0].data()._id).then(function (data) {
                                                resolve({
                                                    status: true,
                                                    message: "User was deleted with success."
                                                });
                                            }).catch(function () {
                                                reject({
                                                    status: false,
                                                    message: "Error in delete user."
                                                });
                                            });
                                        }
                                        else {
                                            reject({
                                                status: false,
                                                message: "User already deleted."
                                            });
                                        }
                                    });
                                });
                            })];
                    });
                });
            };
            class_1.prototype.login = function (email_1, password_1) {
                return __awaiter(this, arguments, void 0, function (email, password, adminKey) {
                    if (adminKey === void 0) { adminKey = null; }
                    return __generator(this, function (_a) {
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                if (!email || email && !email.trim() || !password || password && !password.trim()) {
                                    reject({
                                        status: false,
                                        message: "The fields: email and password can't be null."
                                    });
                                    return;
                                }
                                root.initializeApp({
                                    email: email,
                                    password: password,
                                    projectId: root.initializeAppOptions.projectId,
                                    adminKey: adminKey,
                                    encrypted: false
                                }).then(function (data) {
                                    if (data.status) {
                                        resolve({
                                            status: true,
                                            message: "User was logged with success."
                                        });
                                    }
                                    else {
                                        reject({
                                            status: false,
                                            message: "Error in realized user login."
                                        });
                                    }
                                }).catch(function (error) {
                                    reject({
                                        status: false,
                                        message: error.message
                                    });
                                });
                            })];
                    });
                });
            };
            class_1.prototype.logout = function () {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                root.execAfterConnecting(function () {
                                    if (!root.isConnected) {
                                        reject({
                                            message: root.NOT_INITIALIZED_APP_MESSAGE
                                        });
                                        return;
                                    }
                                    if (!root.currentUser) {
                                        reject({
                                            status: false,
                                            message: "No has user logged."
                                        });
                                        return;
                                    }
                                    var obj = { connection: root.connectionObject({ isLogout: true }) };
                                    var handler = function (event) {
                                        // if(Utilities.isAuthResponse(event)){ return; }
                                        var data = null;
                                        try {
                                            // data = cryptojs.AES.decrypt(event.data, root.CRPYPTO_SECRET_KEY()).toString(cryptojs.enc.Utf8);
                                            data = event.data;
                                        }
                                        catch (e) {
                                            console.error("Invalid projectId");
                                            return;
                                        }
                                        data = JSON.parse(data);
                                        if (data.actionResult && data.connection.requestId === obj.connection.requestId) {
                                            if (data.actionResult.status) {
                                                root.currentUser = null;
                                                root.currentToken = null;
                                                resolve(data.actionResult);
                                            }
                                            else {
                                                reject(data.actionResult);
                                            }
                                            root.connection.removeEventListener("message", handler);
                                        }
                                    };
                                    root.connection.addEventListener("message", handler);
                                    utilities_1.Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
                                });
                            })];
                    });
                });
            };
            class_1.prototype.recoverPassword = function () {
                return __awaiter(this, arguments, void 0, function (email, receiveEmail, language) {
                    if (email === void 0) { email = null; }
                    if (receiveEmail === void 0) { receiveEmail = null; }
                    if (language === void 0) { language = "en_US"; }
                    return __generator(this, function (_a) {
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                root.execAfterConnecting(function () {
                                    if (!root.isConnected) {
                                        reject({ message: root.NOT_INITIALIZED_APP_MESSAGE });
                                        return;
                                    }
                                    email = email ? email : root.currentUser.email;
                                    receiveEmail = receiveEmail ? receiveEmail : email;
                                    var obj = {
                                        connection: root.connectionObject(),
                                        action: {
                                            type: "RESETPASSWORD",
                                            data: { email: email, receiveEmail: receiveEmail },
                                            language: language,
                                            service: EServiceTypes_1.EServiceTypes.DATABASE
                                        }
                                    };
                                    var handler = function (event) {
                                        // if(Utilities.isAuthResponse(event)){ return; }
                                        var data = null;
                                        try {
                                            // data = cryptojs.AES.decrypt(event.data, root.CRPYPTO_SECRET_KEY()).toString(cryptojs.enc.Utf8);
                                            data = event.data;
                                            data = JSON.parse(data);
                                        }
                                        catch (e) {
                                            try {
                                                data = JSON.parse(event.data);
                                            }
                                            catch (e) {
                                                console.error("Invalid Data");
                                            }
                                            return;
                                        }
                                        if (data.actionResult && data.connection.requestId === obj.connection.requestId) {
                                            if (data.actionResult.status) {
                                                resolve(data.actionResult);
                                            }
                                            else {
                                                reject(data.actionResult);
                                            }
                                            root.connection.removeEventListener("message", handler);
                                        }
                                    };
                                    root.connection.addEventListener("message", handler);
                                    utilities_1.Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
                                });
                            })];
                    });
                });
            };
            class_1.prototype.update = function (id, data, options) {
                if (id === void 0) { id = null; }
                if (options === void 0) { options = null; }
                return new Promise(function (resolve, reject) {
                    root.execAfterConnecting(function () {
                        if (!root.isConnected) {
                            reject({ message: root.NOT_INITIALIZED_APP_MESSAGE });
                        }
                        if (!data && !options || data && Object.entries(data).length == 0 && !options) {
                            reject({
                                status: false,
                                message: "Data is null"
                            });
                            return;
                        }
                        var obj = {
                            connection: root.connectionObject(),
                            action: {
                                collName: "#SYSTEM_AUTHENTICATE#",
                                docName: id,
                                type: "UPDATE",
                                service: EServiceTypes_1.EServiceTypes.DATABASE,
                                data: data,
                                options: options
                            }
                        };
                        var handler = function (event) {
                            // if(Utilities.isAuthResponse(event)){ return; }
                            var data = null;
                            try {
                                // data = cryptojs.AES.decrypt(event.data, root.CRPYPTO_SECRET_KEY()).toString(cryptojs.enc.Utf8);
                                data = event.data;
                            }
                            catch (e) {
                                console.error("Invalid projectId");
                                return;
                            }
                            data = JSON.parse(data);
                            if (data.actionResult && data.connection.requestId === obj.connection.requestId) {
                                if (data.actionResult.status) {
                                    resolve(data.actionResult);
                                }
                                else {
                                    reject(data.actionResult);
                                }
                                root.connection.removeEventListener("message", handler);
                            }
                        };
                        root.connection.addEventListener("message", handler);
                        utilities_1.Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
                    });
                });
            };
            class_1.prototype.delete = function (id) {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                root.execAfterConnecting(function () {
                                    if (!root.isConnected) {
                                        reject({ message: root.NOT_INITIALIZED_APP_MESSAGE });
                                        return;
                                    }
                                    var obj = {
                                        connection: root.connectionObject(),
                                        action: {
                                            collName: "#SYSTEM_AUTHENTICATE#",
                                            docName: id,
                                            mode: "document",
                                            type: "DELETE",
                                            service: EServiceTypes_1.EServiceTypes.DATABASE
                                        }
                                    };
                                    var handler = function (event) {
                                        // if(Utilities.isAuthResponse(event)){ return; }
                                        var data = null;
                                        try {
                                            // data = cryptojs.AES.decrypt(event.data, root.CRPYPTO_SECRET_KEY()).toString(cryptojs.enc.Utf8);
                                            data = event.data;
                                        }
                                        catch (e) {
                                            console.error("Invalid projectId");
                                            return;
                                        }
                                        data = JSON.parse(data);
                                        if (data.actionResult && data.connection.requestId === obj.connection.requestId) {
                                            if (data.actionResult.status) {
                                                resolve(data.actionResult);
                                            }
                                            else {
                                                reject(data.actionResult);
                                            }
                                            root.connection.removeEventListener("message", handler);
                                        }
                                    };
                                    root.connection.addEventListener("message", handler);
                                    utilities_1.Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
                                });
                            })];
                    });
                });
            };
            return class_1;
        }());
    };
    iTools.prototype.functions = function () {
        if (this._functions) {
            return this._functions;
        }
        var root = this;
        return this._functions = new /** @class */ (function () {
            function class_2() {
            }
            class_2.prototype.call = function (fn_1) {
                return __awaiter(this, arguments, void 0, function (fn, data) {
                    if (data === void 0) { data = null; }
                    return __generator(this, function (_a) {
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                root.execAfterConnecting(function () {
                                    if (!fn || fn && !fn.trim()) {
                                        reject({
                                            status: false,
                                            message: "Function name can't be null."
                                        });
                                        return;
                                    }
                                    var obj = {
                                        connection: root.connectionObject(),
                                        action: {
                                            functionName: fn,
                                            service: EServiceTypes_1.EServiceTypes.FUNCTIONS,
                                            data: data ? data : null
                                        }
                                    };
                                    var handler = function (event) {
                                        // if(Utilities.isAuthResponse(event)){ return; }
                                        var data = null;
                                        try {
                                            // data = cryptojs.AES.decrypt(event.data, root.CRPYPTO_SECRET_KEY()).toString(cryptojs.enc.Utf8);
                                            data = event.data;
                                            data = JSON.parse(data);
                                        }
                                        catch (e) {
                                            try {
                                                data = JSON.parse(event.data);
                                            }
                                            catch (e) {
                                                console.error("Invalid Data");
                                            }
                                            return;
                                        }
                                        if (data.actionResult && data.connection.requestId === obj.connection.requestId) {
                                            if (typeof data.actionResult.data == "string") {
                                                try {
                                                    var response = JSON.parse(data.actionResult.data);
                                                    if (response) {
                                                        data.actionResult.data = response;
                                                    }
                                                }
                                                catch (error) { }
                                            }
                                            if (data.actionResult.status) {
                                                resolve(data.actionResult);
                                            }
                                            else {
                                                reject(data.actionResult);
                                            }
                                            root.connection.removeEventListener("message", handler);
                                        }
                                    };
                                    root.connection.addEventListener("message", handler);
                                    utilities_1.Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
                                });
                            })];
                    });
                });
            };
            return class_2;
        }());
    };
    iTools.prototype.storage = function () {
        if (this._storage) {
            return this._storage;
        }
        var root = this;
        return this._storage = new /** @class */ (function () {
            function class_3() {
                this.host = root.isLocalMachine ? "localhost:3003" : "storage.ipartts.com";
            }
            class_3.prototype.delete = function (paths) {
                return __awaiter(this, void 0, void 0, function () {
                    var _this = this;
                    return __generator(this, function (_a) {
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                root.execAfterConnecting(function () {
                                    if (!root.isConnected) {
                                        reject({ message: root.NOT_INITIALIZED_APP_MESSAGE });
                                        return;
                                    }
                                    _this.getAthorization(function (data) {
                                        if (data.status) {
                                            var objStorage = {
                                                connection: __assign(__assign({}, data.data.connection), { secretKey: data.data.secretKey }),
                                                paths: paths
                                            };
                                            utilities_1.Utilities.request({
                                                url: "https://".concat(_this.host, "/delete"),
                                                type: "POST",
                                                data: objStorage,
                                                formData: false,
                                                success: function (data) {
                                                    data = JSON.parse(data);
                                                    resolve(data);
                                                },
                                                error: function (data) {
                                                    reject({
                                                        status: false,
                                                        message: "Error in send Request"
                                                    });
                                                }
                                            });
                                        }
                                        else {
                                            reject(data);
                                        }
                                    });
                                });
                            })];
                    });
                });
            };
            class_3.prototype.upload = function (data) {
                return __awaiter(this, void 0, void 0, function () {
                    var _this = this;
                    return __generator(this, function (_a) {
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                root.execAfterConnecting(function () {
                                    if (!root.isConnected) {
                                        reject({ message: root.NOT_INITIALIZED_APP_MESSAGE });
                                        return;
                                    }
                                    var settings = data;
                                    var handlerFile = function (data) { return __awaiter(_this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            return [2 /*return*/, new Promise(function (resolve, reject) {
                                                    var file = data.file instanceof FileList ? data.file[0] : data.file;
                                                    var name = (function () {
                                                        if (data.name && data.name.lastIndexOf(".") == -1) {
                                                            var ext = data.file.name ? data.file.name.substring(data.file.name.lastIndexOf(".") - 1) : "";
                                                            data.name = data.name + ext;
                                                        }
                                                        return data.name ? data.name : data.file.name;
                                                    })();
                                                    var reader = new FileReader();
                                                    reader.onloadend = function () {
                                                        resolve({
                                                            data: reader.result,
                                                            name: name,
                                                        });
                                                    };
                                                    reader.readAsArrayBuffer(file);
                                                })];
                                        });
                                    }); };
                                    var handlerStorage = function (data) {
                                        var fileCount = settings.length;
                                        var objStorage = {
                                            connection: __assign(__assign({}, data.data.connection), { secretKey: data.data.secretKey }),
                                            $files: []
                                        };
                                        settings.forEach(function (file) {
                                            if (file.file) {
                                                handlerFile(file).then(function (res) {
                                                    objStorage.$files.push({
                                                        name: res.name,
                                                        data: res.data
                                                    });
                                                    fileCount--;
                                                });
                                            }
                                            else {
                                                objStorage.$files.push({
                                                    name: file.name,
                                                    data: file.data
                                                });
                                                fileCount--;
                                            }
                                        });
                                        var timer = setInterval(function () {
                                            if (fileCount <= 0) {
                                                clearInterval(timer);
                                                utilities_1.Utilities.request({
                                                    url: "https://".concat(_this.host, "/upload"),
                                                    type: "POST",
                                                    data: objStorage,
                                                    formData: true,
                                                    success: function (data) {
                                                        data = JSON.parse(data);
                                                        var files = [];
                                                        data.uploadedUrls.forEach(function (file) {
                                                            files.push({
                                                                path: file,
                                                                getDownloadUrl: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                                                    return [2 /*return*/, this.getDownloadUrl(file)];
                                                                }); }); }
                                                            });
                                                        });
                                                        resolve({
                                                            status: true,
                                                            uploadedUrls: files,
                                                            notUploadedUrls: data.notUploadedUrls
                                                        });
                                                    },
                                                    error: function (data) {
                                                        reject({
                                                            status: false,
                                                            message: "Error in send Request"
                                                        });
                                                    }
                                                });
                                            }
                                        }, 0);
                                    };
                                    _this.getAthorization(function (data) {
                                        if (data.status) {
                                            handlerStorage(data);
                                        }
                                        else {
                                            reject(data);
                                        }
                                    });
                                });
                            })];
                    });
                });
            };
            class_3.prototype.listDir = function (dir) {
                return __awaiter(this, void 0, void 0, function () {
                    var _this = this;
                    return __generator(this, function (_a) {
                        return [2 /*return*/, new Promise(function (res, rej) {
                                root.execAfterConnecting(function () {
                                    if (!root.isConnected) {
                                        rej({ message: root.NOT_INITIALIZED_APP_MESSAGE });
                                        return;
                                    }
                                    _this.getAthorization(function (data) {
                                        if (data.status) {
                                            var objStorage = {
                                                connection: __assign(__assign({}, data.data.connection), { secretKey: data.data.secretKey }),
                                                dir: dir
                                            };
                                            utilities_1.Utilities.request({
                                                url: "https://".concat(_this.host, "/listDir"),
                                                type: "POST",
                                                data: objStorage,
                                                formData: false,
                                                success: function (data) {
                                                    data = JSON.parse(data);
                                                    res(data);
                                                },
                                                error: function (data) {
                                                    rej({
                                                        status: false,
                                                        message: "Error in send Request"
                                                    });
                                                }
                                            });
                                        }
                                        else {
                                            rej(data);
                                        }
                                    });
                                });
                            })];
                    });
                });
            };
            class_3.prototype.path = function (path) {
                var _this = this;
                return {
                    path: path,
                    getDownloadUrl: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, this.getDownloadUrl(path)];
                    }); }); },
                    delete: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, this.delete([path])];
                    }); }); },
                    upload: function (data) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            data = (function () {
                                if (data instanceof ArrayBuffer) {
                                    return data;
                                }
                                else if (data instanceof File) {
                                    return data;
                                }
                                else if (data instanceof FileList) {
                                    return data[0];
                                }
                            })();
                            return [2 /*return*/, this.upload([data instanceof File ? { file: data, name: path } : { data: data, name: path }])];
                        });
                    }); }
                };
            };
            /// UTILITIES
            class_3.prototype.getAthorization = function (callback) {
                var obj = {
                    connection: root.connectionObject(),
                    action: {
                        type: "AUTHORIZATION",
                        service: EServiceTypes_1.EServiceTypes.STORAGE
                    }
                };
                var handler = function (event) {
                    // if(Utilities.isAuthResponse(event)){ return; }
                    var data = null;
                    try {
                        // data = cryptojs.AES.decrypt(event.data, root.CRPYPTO_SECRET_KEY()).toString(cryptojs.enc.Utf8);
                        data = event.data;
                        data = JSON.parse(data);
                    }
                    catch (e) {
                        try {
                            data = JSON.parse(event.data);
                        }
                        catch (e) {
                            console.error("Invalid Data");
                        }
                        return;
                    }
                    if (data.actionResult && data.connection.requestId === obj.connection.requestId) {
                        if (data.actionResult.status) {
                            callback(data.actionResult);
                        }
                        else {
                            callback(data.actionResult);
                        }
                        root.connection.removeEventListener("message", handler);
                    }
                };
                root.connection.addEventListener("message", handler);
                utilities_1.Utilities.sendRequest(root.connection, obj, root.CRPYPTO_SECRET_KEY());
            };
            class_3.prototype.getDownloadUrl = function (path) {
                return __awaiter(this, void 0, void 0, function () {
                    var _this = this;
                    return __generator(this, function (_a) {
                        return [2 /*return*/, new Promise(function (res, rej) {
                                root.execAfterConnecting(function () {
                                    if (!root.isConnected) {
                                        rej({ message: root.NOT_INITIALIZED_APP_MESSAGE });
                                        return;
                                    }
                                    _this.getAthorization(function (data) {
                                        if (data.status) {
                                            utilities_1.Utilities.request({
                                                url: "https://".concat(_this.host, "/getDownloadUrl"),
                                                type: "POST",
                                                data: { path: path, connection: __assign(__assign({}, data.data.connection), { secretKey: data.data.secretKey }) },
                                                formData: false,
                                                headers: 'Content-Type: apllication/json',
                                                success: function (data) {
                                                    data = JSON.parse(data);
                                                    res(data);
                                                },
                                                error: function (data) {
                                                    rej({
                                                        status: false,
                                                        message: "Error in send Request"
                                                    });
                                                }
                                            });
                                        }
                                        else {
                                            rej(data);
                                        }
                                    });
                                });
                            })];
                    });
                });
            };
            return class_3;
        }());
    };
    // Utilities
    iTools.prototype.reconnect = function (self, settings) {
        self.initializeApp(settings).then(function () {
            // console.clear();
            // console.log("***** recconected *****");
            var cs = [];
            settings.auoReconnect = true;
            Object.values(self.database().onSnapshotCollectionCallbacks).forEach(function (item) { cs.push(item.requestObject); });
            Object.values(self.database().onSnapshotDocCallbacks).forEach(function (item) { cs.push(item.requestObject); });
            var objSnapshot = {
                connection: self.connectionObject(),
                action: {
                    type: "SNAPSHOT",
                    service: EServiceTypes_1.EServiceTypes.DATABASE,
                    mode: "RECONNECT",
                    data: cs
                }
            };
            self.database().onChangesEmitter.emit("recconect", {});
            utilities_1.Utilities.sendRequest(self.connection, objSnapshot, self.CRPYPTO_SECRET_KEY());
        });
    };
    iTools.requestId = function () {
        return ('xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        }) + new Date().getTime().toString());
    };
    iTools.ObjectId = function () {
        var timestamp = (new Date().getTime() / 1000 | 0).toString(16);
        return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function () {
            return (Math.random() * 16 | 0).toString(16);
        }).toLowerCase();
    };
    ;
    iTools.initializedApps = {};
    iTools.FieldValue = new /** @class */ (function () {
        function class_4() {
        }
        class_4.prototype.control = function (collName, docName, propertyName, step) {
            if (propertyName === void 0) { propertyName = null; }
            if (step === void 0) { step = 1; }
            if (!step || step <= 0) {
                console.error("step must be great than 0.");
                return undefined;
            }
            return propertyName && propertyName.trim() ? "$control(".concat(collName, ",").concat(docName, ",").concat(step, ",").concat(propertyName.trim(), ")") : "$control(".concat(collName, ",").concat(docName, ",").concat(step, ")");
        };
        class_4.prototype.bindBatchData = function (index, propertyName) {
            return "$bindBatchData(".concat(index, ",").concat(propertyName, ")");
        };
        class_4.prototype.replace = function (propertyName, prefixCode, trim, batchRef) {
            if (prefixCode === void 0) { prefixCode = false; }
            if (trim === void 0) { trim = false; }
            if (batchRef === void 0) { batchRef = -1; }
            if (batchRef != -1) {
                return "$replace(".concat(propertyName, ",").concat(batchRef, ",").concat(trim, ",").concat(prefixCode, ")");
            }
            else {
                return "$replace(".concat(propertyName, ",").concat(trim, ",").concat(prefixCode, ")");
            }
        };
        class_4.prototype.date = function (timezone, format) {
            var str = "$date(";
            if (timezone) {
                str += timezone.trim();
            }
            str += ", ";
            if (format && format.trim()) {
                str += format.trim();
            }
            else {
                str += timezone ? "DH" : "";
            }
            str += ")";
            return timezone ? str.trim() : "$date()";
        };
        class_4.prototype.inc = function (value) {
            if (value === void 0) { value = 1; }
            return "$inc(".concat(value != undefined ? value : 0, ")");
        };
        class_4.prototype.unset = function () {
            return "$unset()";
        };
        return class_4;
    }());
    return iTools;
}());
exports.iTools = iTools;
