import winston from 'winston';
import 'winston-daily-rotate-file';

const logFormat = winston.format.combine(winston.format.timestamp(), winston.format.json());

const transportOptions = {
  dirname: 'logs',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxFiles: '30d',
};

const infoTransport = new winston.transports.DailyRotateFile({
  ...transportOptions,
  level: 'info',
  filename: 'info-%DATE%.log',
});

const errorTransport = new winston.transports.DailyRotateFile({
  ...transportOptions,
  level: 'error',
  filename: 'error-%DATE%.log',
});

const warningTransport = new winston.transports.DailyRotateFile({
  ...transportOptions,
  level: 'warn',
  filename: 'warning-%DATE%.log',
});

const transports: winston.transport[] = [infoTransport, errorTransport, warningTransport];

transports.push(new winston.transports.Console());

export const logger = winston.createLogger({
  format: logFormat,
  transports,
});
