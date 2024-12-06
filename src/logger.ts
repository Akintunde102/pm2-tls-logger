import os from "os";
import winston from "winston";

const SYSTEM_TRANSPORT = new winston.transports.Http({
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

const LOGGER = winston.createLogger({
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.json(),
		winston.format.printf(({ timestamp, message }) => `[${timestamp}] ${message}`)
	),
	level: "info",
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
				console.error(`Discarding log from '${this.process}' as transport is not ready.`);
				return;
			}

			console.log({ message, level }, this.name, this.appName, this.process)

			LOGGER.info(level, `${this.name} - ${this.appName}: ${message}`);
		} catch (error) {
			console.error(`[ERROR] Failed to log message to remote server for process '${this.process}' with level ${level}:`);
			console.error(error);
		}
	}
}
