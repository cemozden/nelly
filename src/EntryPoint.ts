import { sep, join } from "path";

process.env.CONFIG_DIR = `${process.env.HOME}${sep}.nelly${sep}`;
process.env.LOGS_DIR = `${process.env.CONFIG_DIR}logs${sep}`;
process.env.DATABASE_FOLDER = `${process.env.CONFIG_DIR}${sep}`;

import express, { static as expStatic } from "express";
import { ConfigManager } from "./config/ConfigManager";
import JSONConfigManager from "./config/JSONConfigManager";
import { SettingsManager } from "./config/SettingsManager";
import general_logger, { http_logger } from "./utils/Logger";
import { createServer } from "http";
import socketIO from "socket.io";
import initAPIs from "./api/APIs";
import { FeedScheduler } from "./scheduler/FeedScheduler";
import CronFeedScheduler from "./scheduler/CronFeedScheduler";
import initRoutes from "./routes/Routes";

console.log(`Nelly RSS Feeder, Version: ${process.env.npm_package_version}`);
general_logger.info('[Nelly] Application started.');

const ASSETS_PATH = join(__dirname, 'assets');

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
    
    const skipPathList = ['/css', '/js', '/img', '/fonts', '/favicon.ico'];

    if (skipPathList.filter(sp => request.url.startsWith(sp)).length > 0) {
        next();
        return;
    }

    http_logger.info(`[HTTPRequest] ${request.method} Endpoint: ${request.url}`);
    if (Object.keys(request.query).length > 0) http_logger.info(`[HTTPRequest] Params: ${JSON.stringify(request.query)}`);
    
    next();
}
const systemSettings = settingsManager.getSettings();
const serverPort = systemSettings.serverPort;
const systemLocale = systemSettings.systemLocale;

const expressURL = `http://localhost:${serverPort}`;

exp.use(requestLoggerMiddleware);
exp.use(expStatic(ASSETS_PATH));
exp.set('view engine', 'ejs');
exp.set('views', ASSETS_PATH);

const feedScheduler : FeedScheduler = new CronFeedScheduler();

console.log('Initializing APIs..');
initAPIs(exp, configManager, feedScheduler);
console.log('Initialization completed.');

console.log('Initializing ExpressJS Routes..');
initRoutes(exp, expressURL, systemLocale, configManager.getFeedConfigManager());
console.log('Initialization completed.');

const feedConfigs = configManager.getFeedConfigManager().getFeedConfigs();

feedConfigs.forEach(fc => feedScheduler.addFeedToSchedule(fc));

httpServerInstance.listen(serverPort, () => {
    general_logger.info(`[Nelly] HTTP Server has started listening on localhost:${serverPort}.`);
});

io.on('connection', socket => {
    console.log('Socket.IO connection successful. Client: ' + socket.client.id);

    feedScheduler.addSocket(io);
});

io.on('disconnect', () => {
    //feedScheduler.removeSocket(io);
    console.log('blablabal');
});