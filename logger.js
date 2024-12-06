"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const winston_1 = __importDefault(require("winston"));
const SYSTEM_TRANSPORT = new winston_1.default.transports.Http({
    host: process.env.host,
    port: process.env.port ? parseInt(process.env.port, 10) : undefined,
    ssl: false,
    path: '/log',
});
SYSTEM_TRANSPORT.on('error', (err) => {
    console.error("[ERROR] Transport failed:", err);
});
SYSTEM_TRANSPORT.on("finish", () => {
    console.log("[FINISH] Transport finished.");
});
const LOGGER = winston_1.default.createLogger({
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json(), winston_1.default.format.printf(({ timestamp, message }) => `[${timestamp}] ${message}`)),
    level: "info",
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
                console.error(`Discarding log from '${this.process}' as transport is not ready.`);
                return;
            }
            console.log({ message, level }, this.name, this.appName, this.process);
            LOGGER.info(`${this.name} - ${this.appName}: ${message}`);
        }
        catch (error) {
            console.error(`[ERROR] Failed to log message to remote server for process '${this.process}' with level ${level}:`);
            console.error(error);
        }
    }
}
exports.Logger = Logger;
