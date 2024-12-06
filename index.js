"use strict";
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
const io_1 = __importDefault(require("@pm2/io"));
const pm2_1 = __importDefault(require("pm2"));
const logger_1 = require("./logger");
const lib_1 = require("./lib");
const METRICS = io_1.default.metric({
    name: "Attached Processes"
});
const TRANSPORTS = {};
let PM2_CONFIG = {};
function routeLog(packet, level = "info") {
    const processName = packet.process.name.trim();
    if ((processName === PM2_CONFIG.module_name) && level === "error")
        return;
    if (!TRANSPORTS[processName] && processName !== "pm2-tls-logger") {
        const systemName = PM2_CONFIG.hostname;
        const appName = processName;
        TRANSPORTS[processName] = new logger_1.Logger(systemName, appName);
        METRICS.set(Object.keys(TRANSPORTS).length);
        console.log(`Created new logger for process: ${processName}`);
    }
    return TRANSPORTS[processName].log(level, packet.data);
}
io_1.default.init().initModule(false, (error) => {
    const isInitError = (0, lib_1.handleInitError)(error);
    if (isInitError)
        return;
    const { configIsValid, moduleConfig } = (0, lib_1.handleModuleConfig)(io_1.default);
    if (!configIsValid)
        return;
    PM2_CONFIG = moduleConfig;
    PM2_CONFIG.hostname = (0, lib_1.getHostName)(moduleConfig);
    pm2_1.default.connect(() => {
        console.log(`
            Started and forwarding log outputs to ${PM2_CONFIG.host}:${PM2_CONFIG.port} as ${`system name '${PM2_CONFIG.hostname}'`}.`);
        pm2_1.default.launchBus((busError, bus) => {
            if (busError) {
                console.error("Error launching pm2 bus:", busError);
                return;
            }
            bus.on("log:out", (packet) => routeLog(packet, "info"));
            bus.on("log:err", (packet) => routeLog(packet, "error"));
            bus.on("process:event", (packet) => {
                if (packet.event === "exit" && TRANSPORTS[packet.process.name]) {
                    delete TRANSPORTS[packet.process.name];
                    METRICS.set(Object.keys(TRANSPORTS).length);
                    console.log(`Closed transport pipeline for exiting process '${packet.process.name}'.`);
                }
            });
        });
    });
});
io_1.default.action("show-attached-processes", (callback) => __awaiter(void 0, void 0, void 0, function* () {
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
