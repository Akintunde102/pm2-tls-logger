"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const winston_1 = __importDefault(require("winston"));
require("winston-syslog");
const SYSTEM_TRANSPORT = new winston_1.default.transports.Http({
    host: process.env.host,
    port: process.env.port ? parseInt(process.env.port, 10) : undefined,
    // localhost: process.env.hostname || os.hostname(),
    // app_name: process.env.module_name || "pm2-pp-logger",
    ssl: false,
});
const LOGGER = winston_1.default.createLogger({
    format: winston_1.default.format.printf(({ message }) => message),
    levels: winston_1.default.config.syslog.levels,
    transports: [SYSTEM_TRANSPORT],
});
class Logger {
    constructor(systemName, programName) {
        this.name = systemName;
        this.appName = programName;
        this.process = programName;
    }
    log(level, message) {
        try {
            if (!SYSTEM_TRANSPORT || !LOGGER) {
                console.error(`Discarding log from '${this.process}' astransport is not ready.`);
                return;
            }
            // SYSTEM_TRANSPORT.localhost = this.name;
            // SYSTEM_TRANSPORT.appName = this.appName;

            LOGGER.log(level, message);
        }
        catch (error) {
            console.error(`[ERROR] Failed to log message to remote server for process '${this.process}' with level ${level}:`);
            console.error(error);
        }
    }
}
exports.Logger = Logger;
