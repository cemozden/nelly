import { sep, join } from "path";
import { platform } from "os";

const homeDir = platform() === 'win32' ? process.env.HOMEPATH as string : process.env.HOME as string;
const isDockerEnvironment = process.env.DOCKER_ENVIRONMENT && process.env.DOCKER_ENVIRONMENT === 'true';
const dockerConfigDir = '/mnt/nelly/';

process.env.CONFIG_DIR = isDockerEnvironment ? dockerConfigDir : `${homeDir}${sep}.nelly${sep}`;
process.env.LOGS_DIR = `${process.env.CONFIG_DIR}logs${sep}`;
process.env.DATABASE_FOLDER = `${process.env.CONFIG_DIR}${sep}`;
process.env.THEMES_DIR = join(__dirname, 'assets', 'css', 'themes');

import express, { static as expStatic } from "express";
import { ConfigManager } from "./config/ConfigManager";
import JSONConfigManager from "./config/JSONConfigManager";
import { SettingsManager } from "./config/SettingsManager";
import general_logger, { http_logger } from "./utils/Logger";
import { createServer } from "http";
import socketIO, { Namespace } from "socket.io";
import initAPIs from "./api/APIs";
import { FeedScheduler } from "./scheduler/FeedScheduler";
import CronFeedScheduler from "./scheduler/CronFeedScheduler";
import initRoutes from "./routes/Routes";
import { FeedItemArchiveService } from "./archive/FeedItemArchiveService";
import SQLiteFeedItemArchiveService from "./archive/SQLiteFeedItemArchiveService";
import { TimeUnit } from "./time/TimeUnit";

console.log(`Nelly RSS Feeder${isDockerEnvironment ? ' on Docker' : ''}, Version: ${process.env.npm_package_version}`);
general_logger.info('[Nelly] Application started.');

const ASSETS_PATH = join(__dirname, 'assets');

const exp = express();
const httpServerInstance = createServer(exp);
const io = socketIO(httpServerInstance);

const configManager: ConfigManager = new JSONConfigManager(process.env.CONFIG_DIR);
const settingsManager : SettingsManager = configManager.getSettingsManager();

const socketList : Namespace[] = [];

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

const feedScheduler : FeedScheduler = new CronFeedScheduler(socketList);
const feedItemArchiveService : FeedItemArchiveService = new SQLiteFeedItemArchiveService();

console.log('Initializing APIs..');
initAPIs(exp, configManager, feedScheduler, socketList);
console.log('Initialization completed.');

console.log('Initializing ExpressJS Routes..');
initRoutes(exp, expressURL, systemLocale, configManager);
console.log('Initialization completed.');

const numberOfCleanedItems = feedItemArchiveService.cleanFeedItems(systemSettings.archiveCleaningPeriod);
const archiveCleaningMessage = `${numberOfCleanedItems} item(s) cleaned from archive due to archive cleaning period. Archive Cleaning Period: ${systemSettings.archiveCleaningPeriod.value} ${TimeUnit[systemSettings.archiveCleaningPeriod.unit]}`;
console.log(archiveCleaningMessage);
general_logger.info(archiveCleaningMessage);

const feedConfigs = configManager.getFeedConfigManager().getFeedConfigs();
feedConfigs.forEach(fc => feedScheduler.addFeedToSchedule(fc));

httpServerInstance.listen(serverPort, () => {
    general_logger.info(`[Nelly] HTTP Server has started listening on localhost:${serverPort}.`);
    console.log(`Nelly HTTP Server has started listening on http://localhost:${serverPort}`);
});

io.on('connection', socket => {
    console.log('Socket.IO connection successful. Client: ' + socket.client.id);

    const feedCollectorNamespace = io.of('/feedCollector');
        
    feedCollectorNamespace.on('connection', nsSocket => {
        if (!socketList.includes(feedCollectorNamespace)) {
            socketList.push(feedCollectorNamespace);
            console.log(`A new Socket.IO server has been added. Socket ID: ${nsSocket.id}`);
        }
    });

    feedCollectorNamespace.on('disconnect', () => {
        const socketIndex = socketList.indexOf(feedCollectorNamespace);
        socketList.splice(socketIndex, 1);
        console.log(`Socket removed.`);
    });

});