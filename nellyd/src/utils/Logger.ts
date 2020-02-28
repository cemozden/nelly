import { format } from "logform";
import { LoggerOptions, transports, createLogger } from "winston";
import { isString } from "util";
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

const logsDir = process.env.LOGS_DIR;

const options : LoggerOptions = {
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

const logger = createLogger(options);

if (process.env.NODE_ENV !== 'production') 
    logger.add(new transports.Console({ format : consoleLogFormat}));

export default logger;