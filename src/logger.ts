import os from "os";
import winston from "winston";

const SYSTEM_TRANSPORT = new winston.transports.Http({
	host: process.env.host,
	port: process.env.port ? parseInt(process.env.port, 10) : undefined,
	// localhost: process.env.hostname || os.hostname(),
	// app_name: process.env.module_name || "pm2-pp-logger",
	ssl: false,
});

const LOGGER = winston.createLogger({
	format: winston.format.printf(({ message }) => message),
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
			if (!SYSTEM_TRANSPORT || !LOGGER) {
				console.error(`Discarding log from '${this.process}' astransport is not ready.`);
				return;
			}

			// SYSTEM_TRANSPORT.localhost = this.name;
			// SYSTEM_TRANSPORT.appName = this.appName;

			LOGGER.log(level, message);
		} catch (error) {
			console.error(`[ERROR] Failed to log message to remote server for process '${this.process}' with level ${level}:`);
			console.error(error);
		}
	}
}