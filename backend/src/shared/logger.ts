import winston from "winston";
import { isProd } from "../config/env.js";

const { combine, timestamp, printf, colorize, json } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: "HH:mm:ss" }),
  printf(({ level, message, timestamp: ts }) => `${ts} ${level}: ${message}`),
);

const prodFormat = combine(timestamp(), json());

export const logger = winston.createLogger({
  level: isProd ? "info" : "debug",
  format: isProd ? prodFormat : devFormat,
  transports: [new winston.transports.Console()],
});

// Flux compatible avec morgan (retire le \n final)
export const morganStream = {
  write: (message: string) => logger.http(message.trim()),
};
