declare module "pm2" {
    interface ProcessDescription {
        pm_id: string | number;
        name: string;
        pm2_env?: {
            namespace?: string;
        };
    }

    interface PM2 {
        describe(
            processIdentifier: string | number,
            callback: (error: Error | null, process: ProcessDescription[]) => void
        ): void;

        connect(callback: () => void): void;

        launchBus(callback: (error: Error | null, bus: EventBus) => void): void;
    }

    interface EventBus {
        on(event: "log:out" | "log:err" | "process:event", listener: (packet: LogPacket) => void): void;
    }

    interface LogPacket {
        process: {
            name: string;
            pm_id: string | number;
        };
        data: string;
        event?: string;
    }

    const pm2: PM2;
    export = pm2;
}

declare module "os" {
    function hostname(): string;
}
