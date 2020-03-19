import { format } from "logform";
import { LoggerOptions, transports, createLogger } from "winston";
import { sep } from "path";

const logFormat = format.combine(
    format.timestamp(),
    format.printf(info => `${info.timestamp} [${info.level}]: ${info.message}`)
  );

const consoleLogFormat = format.combine(
    format.timestamp(),
    format.colorize(),
    format.printf(info => `${info.timestamp} [${info.level}]: ${info.message}`)
  );

const logsDir = process.env.LOGS_DIR

const generalLoggerOptions : LoggerOptions = {
  level : 'debug', 
  format : logFormat,
  transports : [
      new transports.File({
          filename : `${logsDir}${sep}nelly.log`, 
          level : 'info',
          maxsize : 20971520,
      })
  ]
};

const httpLoggerOptions : LoggerOptions = {
  level : 'debug', 
  format : logFormat,
  transports : [
      new transports.File({
          filename : `${logsDir}${sep}http.log`, 
          level : 'info',
          maxsize : 20971520,
      })
  ]
};

const general_logger = createLogger(generalLoggerOptions);

export const http_logger = createLogger(httpLoggerOptions);

if (process.env.NODE_ENV !== 'production') {
  general_logger.add(new transports.Console({ format : consoleLogFormat}));
  http_logger.add(new transports.Console({ format : consoleLogFormat}));
}

export default general_logger;