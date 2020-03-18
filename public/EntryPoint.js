"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
process.env.CONFIG_DIR = "" + process.env.HOME + path_1.sep + ".nelly" + path_1.sep;
process.env.LOGS_DIR = process.env.CONFIG_DIR + "logs" + path_1.sep;
process.env.DATABASE_FOLDER = "" + process.env.CONFIG_DIR + path_1.sep;
var express_1 = __importDefault(require("express"));
var JSONConfigManager_1 = __importDefault(require("./config/JSONConfigManager"));
var Logger_1 = __importDefault(require("./utils/Logger"));
var http_1 = require("http");
var socket_io_1 = __importDefault(require("socket.io"));
var APIs_1 = __importDefault(require("./api/APIs"));
var CronFeedScheduler_1 = __importDefault(require("./scheduler/CronFeedScheduler"));
var cors_1 = __importDefault(require("cors"));
Logger_1.default.info('[nellyd] Application started.');
var exp = express_1.default();
var httpServerInstance = http_1.createServer(exp);
var io = socket_io_1.default(httpServerInstance);
var configManager = new JSONConfigManager_1.default(process.env.CONFIG_DIR);
var settingsManager = configManager.getSettingsManager();
/**
 * The middleware that logs all API requests to the daemon
 * @param request The request object received from express.
 * @param response The response object received from express.
 * @param next Next function
 */
function requestLoggerMiddleware(request, response, next) {
    Logger_1.default.info("[APIRequest] " + request.method + " Endpoint: " + request.url);
    if (Object.keys(request.query).length > 0)
        Logger_1.default.info("[APIRequest] Params: " + JSON.stringify(request.query));
    next();
}
var serverPort = settingsManager.getSettings().serverPort;
var whileList = ["http://localhost:3000"];
exp.use(requestLoggerMiddleware);
exp.use(cors_1.default({
    origin: function (origin, callback) {
        if (!origin)
            return callback(null, true);
        if (whileList.indexOf(origin) === -1) {
            var message = 'The CORS policy for this origin doesn`t ' +
                'allow access from the particular origin.';
            return callback(new Error(message), false);
        }
        return callback(null, true);
    }
}));
var feedScheduler = new CronFeedScheduler_1.default();
APIs_1.default(exp, configManager, feedScheduler);
var feedConfigs = configManager.getFeedConfigManager().getFeedConfigs();
feedConfigs.forEach(function (fc) { return feedScheduler.addFeedToSchedule(fc); });
httpServerInstance.listen(serverPort, function () {
    Logger_1.default.info("[nellyd] HTTP Server has started listening on localhost:" + serverPort + ".");
});
io.on('connection', function (socket) {
    Logger_1.default.info("[Socket.IO] Socket.IO connected!");
});
//# sourceMappingURL=EntryPoint.js.map