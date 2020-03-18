"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Logger_1 = __importDefault(require("../utils/Logger"));
var crc_1 = require("crc");
var SQLiteFeedArchiveService_1 = __importDefault(require("../archive/SQLiteFeedArchiveService"));
var SQLiteFeedItemArchiveService_1 = __importDefault(require("../archive/SQLiteFeedItemArchiveService"));
function FeedAPI(express, configManager, feedScheduler) {
    var _this = this;
    express.get('/getfeeds', function (req, res) {
        res.json(configManager.getFeedConfigManager().getFeedConfigs());
    });
    /**
     *
     * Required Parameters
     * categoryId : string
     * name : string
     * url : string
     * fetchPeriod: object
     * iconUrl : string (optional)
     * enabled : boolean
     *  */
    express.get('/addfeed', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var params, categoryId, name, url, fetchPeriod, enabled, iconURL, errorMessage, errorMessage, errorMessage, errorMessage, feedConfigManager, feedConfig, feedConfigAdded, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    params = req.query;
                    categoryId = params.categoryId;
                    name = params.name;
                    url = params.url;
                    fetchPeriod = params.fetchPeriod !== undefined ? JSON.parse(params.fetchPeriod) : {};
                    enabled = params.enabled !== undefined && params.enabled === 'true';
                    iconURL = params.iconURL !== undefined ? params.iconURL : '';
                    if (categoryId === undefined || categoryId.length === 0) {
                        errorMessage = 'Category id is not a valid id! Please provide a valid id to add a new feed.';
                        res.status(400).json({ added: false, message: errorMessage });
                        Logger_1.default.error("[AddFeed] " + errorMessage + ", Request params: " + JSON.stringify(params));
                        return [2 /*return*/];
                    }
                    if (name === undefined || name.length === 0) {
                        errorMessage = 'Feed name is not valid! Please provide a valid name to add a new feed.';
                        res.status(400).json({ added: false, message: errorMessage });
                        Logger_1.default.error("[AddFeed] " + errorMessage + ", Request params: " + JSON.stringify(params));
                        return [2 /*return*/];
                    }
                    if (url === undefined || url.length === 0) {
                        errorMessage = 'Feed URL is not valid! Please provide a valid URL to add a new feed.';
                        res.status(400).json({ added: false, message: errorMessage });
                        Logger_1.default.error("[AddFeed] " + errorMessage + ", Request params: " + JSON.stringify(params));
                        return [2 /*return*/];
                    }
                    if (fetchPeriod === undefined || fetchPeriod.unit === undefined || fetchPeriod.value === undefined) {
                        errorMessage = 'Fetch period is not valid! Please provide a valid fetch period to add a new feed.';
                        res.status(400).json({ added: false, message: errorMessage });
                        Logger_1.default.error("[AddFeed] " + errorMessage + ", Request params: " + JSON.stringify(params));
                        return [2 /*return*/];
                    }
                    feedConfigManager = configManager.getFeedConfigManager();
                    feedConfig = {
                        categoryId: categoryId,
                        enabled: enabled,
                        feedConfigId: crc_1.crc32(Math.random().toString(36).substring(2, 9)).toString(16),
                        fetchPeriod: fetchPeriod,
                        name: name,
                        url: url,
                        iconURL: iconURL
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, feedConfigManager.addFeedConfig(feedConfig)];
                case 2:
                    feedConfigAdded = _a.sent();
                    if (feedConfigAdded) {
                        Logger_1.default.info("[AddFeed] A new feed added! New Feed : " + JSON.stringify(feedConfig));
                        feedScheduler.addFeedToSchedule(feedConfig);
                        res.json({ added: true, feedObject: feedConfig, feeds: feedConfigManager.getFeedConfigs() });
                    }
                    else {
                        Logger_1.default.error("[AddFeed] An error occured while adding the feed! Request Params: " + JSON.stringify(params));
                        res.json({ added: false, message: 'An error occured while adding feed!' });
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    Logger_1.default.error("[AddFeed] " + err_1.message + ", Request Params: " + JSON.stringify(params));
                    res.status(500).json({ added: false, message: err_1.message });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    /**
     *
     * Required Parameters
     * feedId : string
     * categoryId : string
     * name : string
     * url : string
     * fetchPeriod: object
     * iconUrl : string (optional)
     * enabled : boolean
     *  */
    express.get('/updatefeed', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var params, feedId, categoryId, name, url, fetchPeriod, enabled, iconURL, errorMessage, errorMessage, errorMessage, errorMessage, errorMessage, feedConfigManager, oldFeed, updatedFeed, feedConfigUpdated, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    params = req.query;
                    feedId = params.feedId;
                    categoryId = params.categoryId;
                    name = params.name;
                    url = params.url;
                    fetchPeriod = params.fetchPeriod !== undefined ? JSON.parse(params.fetchPeriod) : {};
                    enabled = params.enabled !== undefined && params.enabled === 'true';
                    iconURL = params.iconURL !== undefined ? params.iconURL : '';
                    if (feedId === undefined || feedId.length === 0) {
                        errorMessage = 'Feed id is not a valid id! Please provide a valid id to update a new feed.';
                        res.status(400).json({ updated: false, message: errorMessage });
                        Logger_1.default.error("[UpdateFeed] " + errorMessage + ", Request params: " + JSON.stringify(params));
                        return [2 /*return*/];
                    }
                    if (categoryId === undefined || categoryId.length === 0) {
                        errorMessage = 'Category id is not a valid id! Please provide a valid id to update a new feed.';
                        res.status(400).json({ updated: false, message: errorMessage });
                        Logger_1.default.error("[UpdateFeed] " + errorMessage + ", Request params: " + JSON.stringify(params));
                        return [2 /*return*/];
                    }
                    if (name === undefined || name.length === 0) {
                        errorMessage = 'Feed name is not valid! Please provide a valid name to update a new feed.';
                        res.status(400).json({ updated: false, message: errorMessage });
                        Logger_1.default.error("[UpdateFeed] " + errorMessage + ", Request params: " + JSON.stringify(params));
                        return [2 /*return*/];
                    }
                    if (url === undefined || url.length === 0) {
                        errorMessage = 'Feed URL is not valid! Please provide a valid URL to update a new feed.';
                        res.status(400).json({ updated: false, message: errorMessage });
                        Logger_1.default.error("[UpdateFeed] " + errorMessage + ", Request params: " + JSON.stringify(params));
                        return [2 /*return*/];
                    }
                    if (fetchPeriod === undefined || fetchPeriod.unit === undefined || fetchPeriod.value === undefined) {
                        errorMessage = 'Fetch period is not valid! Please provide a valid fetch period to update a new feed.';
                        res.status(400).json({ updated: false, message: errorMessage });
                        Logger_1.default.error("[UpdateFeed] " + errorMessage + ", Request params: " + JSON.stringify(params));
                        return [2 /*return*/];
                    }
                    feedConfigManager = configManager.getFeedConfigManager();
                    oldFeed = feedConfigManager.getFeedConfig(feedId);
                    updatedFeed = {
                        categoryId: categoryId,
                        enabled: enabled,
                        feedConfigId: feedId,
                        fetchPeriod: fetchPeriod,
                        name: name,
                        url: url,
                        iconURL: iconURL
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, feedConfigManager.updateFeedConfig(feedId, updatedFeed)];
                case 2:
                    feedConfigUpdated = _a.sent();
                    feedScheduler.deleteScheduledTask(feedId);
                    if (feedConfigUpdated) {
                        Logger_1.default.info("[UpdateFeed] A feed is successfully updated! Old Feed: " + JSON.stringify(oldFeed) + ",  Updated Feed : " + JSON.stringify(updatedFeed));
                        feedScheduler.addFeedToSchedule(updatedFeed);
                        res.json({ updated: true, updatedFeedObject: updatedFeed, feeds: feedConfigManager.getFeedConfigs() });
                    }
                    else {
                        Logger_1.default.error("[UpdateFeed] An error occured while updating the feed! Request Params: " + JSON.stringify(params));
                        res.json({ updated: false, message: 'An error occured while updating the feed!' });
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    Logger_1.default.error("[UpdateFeed] " + err_2.message + ", Request Params: " + JSON.stringify(params));
                    res.status(500).json({ updated: false, message: err_2.message });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    /**
     *
     * Required Parameters
     * feedId : string
     *
     *  */
    express.get('/deletefeed', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var params, feedId, errorMessage, feedConfigManager, archiveService, oldFeed, feedDeleted, archiveCleaned, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    params = req.query;
                    feedId = params.feedId;
                    if (feedId === undefined || feedId.length === 0) {
                        errorMessage = 'Feed id is not a valid id! Please provide a valid id to update a new feed.';
                        res.status(400).json({ deleted: false, message: errorMessage });
                        Logger_1.default.error("[DeleteFeed] " + errorMessage + ", Request params: " + JSON.stringify(params));
                        return [2 /*return*/];
                    }
                    feedConfigManager = configManager.getFeedConfigManager();
                    archiveService = new SQLiteFeedArchiveService_1.default();
                    oldFeed = feedConfigManager.getFeedConfig(feedId);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, feedConfigManager.deleteFeedConfig(feedId)];
                case 2:
                    feedDeleted = _a.sent();
                    if (feedDeleted) {
                        Logger_1.default.info("[DeleteFeed] A feed is successfully deleted! Old Feed: " + JSON.stringify(oldFeed));
                        feedScheduler.deleteScheduledTask(feedId);
                        archiveCleaned = archiveService.deleteFeed(feedId);
                        if (archiveCleaned)
                            Logger_1.default.info("[DeleteFeed] Items of the feed are cleared from the archive.");
                        else
                            Logger_1.default.error("[DeleteFeed] Unable to delete feed items on the archive!");
                        res.json({ deleted: true, deletedObject: oldFeed, feeds: feedConfigManager.getFeedConfigs() });
                    }
                    else {
                        Logger_1.default.error("[DeleteFeed] An error occured while deleting the feed! Request Params: " + JSON.stringify(params));
                        res.json({ deleted: false, message: 'An error occured while deleting the feed!' });
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_3 = _a.sent();
                    Logger_1.default.error("[DeleteFeed] " + err_3.message + ", Request Params: " + JSON.stringify(params));
                    res.status(500).json({ deleted: false, message: err_3.message });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    express.get('/getarchiveitems', function (req, res) {
        var params = req.query;
        var feedId = params.feedId;
        var startDateISOStr = params.startDate;
        var endDateISOStr = params.endDate;
        var allItems = params.allItems === 'true';
        if (feedId === undefined || feedId.length === 0) {
            var errorMessage = 'Feed id is not a valid id! Please provide a valid id to update a new feed.';
            res.status(400).json({ retrieved: false, message: errorMessage });
            Logger_1.default.error("[GetArchiveItems] " + errorMessage + ", Request params: " + JSON.stringify(params));
            return;
        }
        if (startDateISOStr === undefined || startDateISOStr.length === 0) {
            var errorMessage = 'Start date is not a valid date string! Please provide a valid start date string to retrieve the feeds.';
            res.status(400).json({ retrieved: false, message: errorMessage });
            Logger_1.default.error("[GetArchiveItems] " + errorMessage + ", Request params: " + JSON.stringify(params));
            return;
        }
        if (endDateISOStr === undefined || endDateISOStr.length === 0) {
            var errorMessage = 'End date is not a valid date string! Please provide a valid end date string to retrieve the feeds.';
            res.status(400).json({ retrieved: false, message: errorMessage });
            Logger_1.default.error("[GetArchiveItems] " + errorMessage + ", Request params: " + JSON.stringify(params));
            return;
        }
        var feedItemArchive = new SQLiteFeedItemArchiveService_1.default();
        try {
            var feedItems = feedItemArchive.getFeedItems(feedId, new Date(startDateISOStr), new Date(endDateISOStr), allItems);
            res.json({ retrieved: true, itemCount: feedItems.length, items: feedItems });
        }
        catch (err) {
            Logger_1.default.error("[GetArchiveItems] " + err.message + ", Request Params: " + JSON.stringify(params));
            res.status(500).json({ retrieved: false, message: err.message });
        }
    });
}
exports.default = FeedAPI;
//# sourceMappingURL=FeedAPIs.js.map