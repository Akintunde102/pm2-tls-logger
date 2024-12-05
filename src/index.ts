import io from "@pm2/io";
import pm2 from "pm2";
import Logger from "./logger";
import { handleInitError, getHostName, handleModuleConfig } from "./lib";


const METRICS = io.metric({
    name: "Attached Processes"
});


const TRANSPORTS: Record<string, Logger> = {};
let PM2_CONFIG: Record<string, any> = {};


function routeLog(packet: any, level: string = "info"): void {
    const processName = packet.process.name.trim();

    if ((processName === PM2_CONFIG.module_name) && level === "error") return;

    if (!TRANSPORTS[processName]) {
        const systemName = PM2_CONFIG.hostname;
        const appName = processName;

        TRANSPORTS[processName] = new Logger(systemName, appName);
        console.log({ a: METRICS })
        METRICS.set(Object.keys(TRANSPORTS).length);

        console.log(`Created new logger for process: ${processName}`);
    }

    return TRANSPORTS[processName].log(level, packet.data);
}


io.init().initModule(false, (error: Error | null) => {

    const isInitError = handleInitError(error);
    if (isInitError) return;

    const { configIsValid, moduleConfig } = handleModuleConfig(io);
    if (!configIsValid) return;

    PM2_CONFIG = moduleConfig;
    PM2_CONFIG.hostname = getHostName(moduleConfig);

    pm2.connect(() => {
        console.log(`
            Started and forwarding log outputs to ${PM2_CONFIG.host}:${PM2_CONFIG.port} as ${`system name '${PM2_CONFIG.hostname}'`
            }.`);

        pm2.launchBus((busError, bus) => {

            if (busError) {
                console.error("Error launching pm2 bus:", busError);
                return;
            }

            bus.on("log:out", (packet: any) => routeLog(packet, "info"));
            bus.on("log:err", (packet: any) => routeLog(packet, "error"));
            bus.on("process:event", (packet: any) => {
                if (packet.event === "exit" && TRANSPORTS[packet.process.name]) {
                    delete TRANSPORTS[packet.process.name];
                    METRICS.set(Object.keys(TRANSPORTS).length);
                    console.log(`Closed transport pipeline for exiting process '${packet.process.name}'.`);
                }
            });
        });
    });
});

io.action("show-attached-processes", async (callback: (response: { success: boolean }) => void) => {
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
});
