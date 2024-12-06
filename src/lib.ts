
import PMX from "@pm2/io/build/main/pmx";
import * as os from "os";

export function getHostName(pm2Config: Record<string, any>): string {
    return pm2Config?.hostname?.trim() || os.hostname();
}

export function validateModuleConfig(pm2Config: Record<string, any>) {
    if (!pm2Config.host || !pm2Config.port) {
        console.error(
            `You are missing required configuration values!\n` +
            `Please run the following commands to setup your server source:\n` +
            `$ pm2 set ${pm2Config.module_name}:host <host>\n` +
            `$ pm2 set ${pm2Config.module_name}:port <port>\n\n` +
            `Optionally, you can also set the hostname to use for this source:\n` +
            `$ pm2 set ${pm2Config.module_name}:hostname <hostname>`
        );
        return false;
    }

    return true;
}

export const handleInitError = (error?: Error | null) => {
    if (error) {
        console.error("Error initializing module:", error);
        return true;
    }

    return false;
}

export const getModuleConfig = (io: PMX) => io.getConfig();

export const handleModuleConfig = (io: PMX) => {
    const moduleConfig = getModuleConfig(io);

    // const isValidConfig = validateModuleConfig(moduleConfig);

    return {
        configIsValid: true,
        moduleConfig
    }
}
