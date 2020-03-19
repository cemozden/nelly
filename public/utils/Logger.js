"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var logform_1 = require("logform");
var winston_1 = require("winston");
var path_1 = require("path");
var logFormat = logform_1.format.combine(logform_1.format.timestamp(), logform_1.format.printf(function (info) { return info.timestamp + " [" + info.level + "]: " + info.message; }));
var consoleLogFormat = logform_1.format.combine(logform_1.format.timestamp(), logform_1.format.colorize(), logform_1.format.printf(function (info) { return info.timestamp + " [" + info.level + "]: " + info.message; }));
var logsDir = process.env.LOGS_DIR;
var options = {
    level: 'debug',
    format: logFormat,
    transports: [
        new winston_1.transports.File({
            filename: "" + logsDir + path_1.sep + "nelly.log",
            level: 'info',
            maxsize: 20971520,
        })
    ]
};
var logger = winston_1.createLogger(options);
if (process.env.NODE_ENV !== 'production')
    logger.add(new winston_1.transports.Console({ format: consoleLogFormat }));
exports.default = logger;
//# sourceMappingURL=Logger.js.map