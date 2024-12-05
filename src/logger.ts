import os from "os";
import winston from "winston";
import "winston-syslog";

const SYSTEM_TRANSPORT = new (winston.transports as any).Syslog({
	host: process.env.host,
	port: process.env.port ? parseInt(process.env.port, 10) : undefined,
	localhost: process.env.hostname || os.hostname(),
	app_name: process.env.module_name || "pm2-pp-logger",
	protocol: "tls4",
	eol: "\n",
});

const LOGGER = winston.createLogger({
	format: winston.format.printf(({ message }) => message),
	levels: winston.config.syslog.levels,
	transports: [SYSTEM_TRANSPORT],
});

export class Logger {
	private name: string;
	private appName: string;
	private process: string;


	constructor(systemName: string, programName: string) {
		this.name = systemName;
		this.appName = programName;
		this.process = programName;
	}


	log(level: string, message: string): void {
		try {
			console.log({ level, message });
			if (!SYSTEM_TRANSPORT || !LOGGER) {
				console.error(`Discarding log from '${this.process}' astransport is not ready.`);
				return;
			}

			SYSTEM_TRANSPORT.localhost = this.name;
			SYSTEM_TRANSPORT.appName = this.appName;

			LOGGER.log(level, message);
		} catch (error) {
			console.error(`[ERROR] Failed to log message to remote server for process '${this.process}' with level ${level}:`);
			console.error(error);
		}
	}
}