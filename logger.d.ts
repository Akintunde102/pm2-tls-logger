export declare class Logger {
    private name;
    private appName;
    private process;
    constructor(systemName: string, programName: string);
    log(level: string, message: string): void;
}
