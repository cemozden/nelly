import express from "express";
import { ConfigManager } from "./config/ConfigManager";
import JSONConfigManager from "./config/JSONConfigManager";
import { sep } from "path";
import { SettingsManager } from "./config/SettingsManager";
import logger from "./utils/Logger";
import { createServer } from "http";
import socketIO from "socket.io";
import initAPIs from "./api/APIs";
import { FeedScheduler } from "./scheduler/FeedScheduler";
import CronFeedScheduler from "./scheduler/CronFeedScheduler";

process.env.CONFIG_DIR = `${process.env.HOME}${sep}`;
process.env.LOGS_DIR = `${process.env.APPLICATION_DIR}${sep}logs${sep}`;
process.env.DATABASE_FOLDER = `${process.env.APPLICATION_DIR}${sep}`;

logger.info('[nellyd] Application started.');

const exp = express();
const httpServerInstance = createServer(exp);
const io = socketIO(httpServerInstance);

const configManager: ConfigManager = new JSONConfigManager(process.env.CONFIG_DIR);
const settingsManager : SettingsManager = configManager.getSettingsManager();

/**
 * The middleware that logs all API requests to the daemon
 * @param request The request object received from express.
 * @param response The response object received from express.
 * @param next Next function
 */
function requestLoggerMiddleware(request : express.Request, response : express.Response, next : () => void) {
    
    logger.info(`[APIRequest] ${request.method} Endpoint: ${request.url}`);
    logger.info(`[APIRequest] Params: ${JSON.stringify(request.query)}`);
    next();
}

exp.use(requestLoggerMiddleware);
initAPIs(exp, configManager);

const feedConfigs = configManager.getFeedConfigManager().getFeedConfigs();
const feedScheduler : FeedScheduler = new CronFeedScheduler();

feedConfigs.forEach(fc => feedScheduler.addFeedToSchedule(fc));

const serverPort = settingsManager.getSettings().serverPort;

httpServerInstance.listen(serverPort, () => {
    logger.info(`[nellyd] HTTP Server has started listening on localhost:${serverPort}.`);
});

io.on('connection', socket => {
    logger.info(`[Socket.IO] Socket.IO connected!`);
});