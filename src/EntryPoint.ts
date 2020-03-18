import { sep } from "path";

process.env.CONFIG_DIR = `${process.env.HOME}${sep}.nelly${sep}`;
process.env.LOGS_DIR = `${process.env.CONFIG_DIR}logs${sep}`;
process.env.DATABASE_FOLDER = `${process.env.CONFIG_DIR}${sep}`;

import express from "express";
import { ConfigManager } from "./config/ConfigManager";
import JSONConfigManager from "./config/JSONConfigManager";
import { SettingsManager } from "./config/SettingsManager";
import logger from "./utils/Logger";
import { createServer } from "http";
import socketIO from "socket.io";
import initAPIs from "./api/APIs";
import { FeedScheduler } from "./scheduler/FeedScheduler";
import CronFeedScheduler from "./scheduler/CronFeedScheduler";
import cors from "cors";

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
    if (Object.keys(request.query).length > 0) logger.info(`[APIRequest] Params: ${JSON.stringify(request.query)}`);
    
    next();
}

const serverPort = settingsManager.getSettings().serverPort;

const whileList = [`http://localhost:3000`];

exp.use(requestLoggerMiddleware);
exp.use(cors({
    origin : (origin, callback) => {
        
        if (!origin) return callback(null, true);

        if (whileList.indexOf(origin) === -1) {
            const message = 'The CORS policy for this origin doesn`t ' +
                'allow access from the particular origin.';
            
            return callback(new Error(message), false);
        }

        return callback(null, true);
    }
}));

const feedScheduler : FeedScheduler = new CronFeedScheduler();
initAPIs(exp, configManager, feedScheduler);

const feedConfigs = configManager.getFeedConfigManager().getFeedConfigs();

feedConfigs.forEach(fc => feedScheduler.addFeedToSchedule(fc));

httpServerInstance.listen(serverPort, () => {
    logger.info(`[nellyd] HTTP Server has started listening on localhost:${serverPort}.`);
});

io.on('connection', socket => {
    logger.info(`[Socket.IO] Socket.IO connected!`);
});