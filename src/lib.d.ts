import PMX from "@pm2/io/build/main/pmx";
export declare function getHostName(pm2Config: Record<string, any>): string;
export declare function validateModuleConfig(pm2Config: Record<string, any>): boolean;
export declare const handleInitError: (error?: Error | null) => boolean;
export declare const getModuleConfig: (io: PMX) => import("@pm2/io/build/main/pmx").IOConfig;
export declare const handleModuleConfig: (io: PMX) => {
    configIsValid: boolean;
    moduleConfig: import("@pm2/io/build/main/pmx").IOConfig;
};
