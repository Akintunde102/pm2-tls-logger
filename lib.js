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
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleModuleConfig = exports.getModuleConfig = exports.handleInitError = void 0;
exports.getHostName = getHostName;
exports.validateModuleConfig = validateModuleConfig;
const os = __importStar(require("os"));
function getHostName(pm2Config) {
    var _a;
    return ((_a = pm2Config === null || pm2Config === void 0 ? void 0 : pm2Config.hostname) === null || _a === void 0 ? void 0 : _a.trim()) || os.hostname();
}
function validateModuleConfig(pm2Config) {
    if (!pm2Config.host || !pm2Config.port) {
        console.error(`You are missing required configuration values!\n` +
            `Please run the following commands to setup your server source:\n` +
            `$ pm2 set ${pm2Config.module_name}:host <host>\n` +
            `$ pm2 set ${pm2Config.module_name}:port <port>\n\n` +
            `Optionally, you can also set the hostname to use for this source:\n` +
            `$ pm2 set ${pm2Config.module_name}:hostname <hostname>`);
        return false;
    }
    return true;
}
const handleInitError = (error) => {
    if (error) {
        console.error("Error initializing module:", error);
        return true;
    }
    return false;
};
exports.handleInitError = handleInitError;
const getModuleConfig = (io) => io.getConfig();
exports.getModuleConfig = getModuleConfig;
const handleModuleConfig = (io) => {
    const moduleConfig = (0, exports.getModuleConfig)(io);
    // const isValidConfig = validateModuleConfig(moduleConfig);
    return {
        configIsValid: true,
        moduleConfig
    };
};
exports.handleModuleConfig = handleModuleConfig;
