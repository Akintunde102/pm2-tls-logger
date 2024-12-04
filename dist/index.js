"use strict";
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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const io = __importStar(require("@pm2/io"));
const pm2 = __importStar(require("pm2"));
const logger_1 = __importDefault(require("./logger"));
const lib_1 = require("./lib");
const METRICS = {
    processes: io.metric({ name: "Attached Processes", value: () => 0 })
};
const TRANSPORTS = {};
let PM2_CONFIG = {};
function routeLog(packet, level = "info") {
    const processName = packet.process.name.trim();
    if ((processName === PM2_CONFIG.module_name) && level === "error")
        return;
    if (!TRANSPORTS[processName]) {
        const systemName = PM2_CONFIG.hostname;
        const appName = processName;
        TRANSPORTS[processName] = new logger_1.default(systemName, appName);
        METRICS.processes.set(Object.keys(TRANSPORTS).length);
        console.log(`Created new logger for process: ${processName}`);
    }
    return TRANSPORTS[processName].log(level, packet.data);
}
io.init().initModule(false, (error) => {
    const isInitError = (0, lib_1.handleInitError)(error);
    if (isInitError)
        return;
    const { configIsValid, moduleConfig } = (0, lib_1.handleModuleConfig)(io);
    if (!configIsValid)
        return;
    PM2_CONFIG = moduleConfig;
    PM2_CONFIG.hostname = (0, lib_1.getHostName)(moduleConfig);
    pm2.connect(() => {
        console.log(`
            Started and forwarding log outputs to ${PM2_CONFIG.host}:${PM2_CONFIG.port} as ${`system name '${PM2_CONFIG.hostname}'`}.`);
        pm2.launchBus((busError, bus) => {
            if (busError) {
                console.error("Error launching pm2 bus:", busError);
                return;
            }
            bus.on("log:out", (packet) => routeLog(packet, "info"));
            bus.on("log:err", (packet) => routeLog(packet, "error"));
            bus.on("process:event", (packet) => {
                if (packet.event === "exit" && TRANSPORTS[packet.process.name]) {
                    delete TRANSPORTS[packet.process.name];
                    METRICS.processes.set(Object.keys(TRANSPORTS).length);
                    console.log(`Closed transport pipeline for exiting process '${packet.process.name}'.`);
                }
            });
        });
    });
});
io.action("show-attached-processes", (callback) => __awaiter(void 0, void 0, void 0, function* () {
    const total = Object.keys(TRANSPORTS).length;
    if (total === 0) {
        console.log("[Attached Processes] Found no attached processes, a process will be attached when it logs for the first time.");
        return callback({ success: true });
    }
    console.log(`[Attached Processes] Showing ${total} attached processes:`);
    for (const processName in TRANSPORTS) {
        console.log(`\t- ${processName}`);
    }
    return callback({ success: true });
}));
