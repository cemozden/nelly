"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var request_1 = __importDefault(require("request"));
var RSSParserFactory_1 = __importDefault(require("../rss/parser/RSSParserFactory"));
var xml2js_1 = require("xml2js");
var Logger_1 = __importDefault(require("../utils/Logger"));
var SQLiteFeedArchiveService_1 = __importDefault(require("../archive/SQLiteFeedArchiveService"));
var SQLiteFeedItemArchiveService_1 = __importDefault(require("../archive/SQLiteFeedItemArchiveService"));
var xmlParseOptions = {
    cdata: true,
    explicitArray: false
};
var feedArchiveService = new SQLiteFeedArchiveService_1.default();
var feedItemArchiveService = new SQLiteFeedItemArchiveService_1.default();
/**
 * The method that adds a new feed into the archive.
 * @param feed The feed that needs to be added to the archive.
 * @param feedId The id of the feed.
 */
function prepareNewFeed(feed, feedId) {
    try {
        var feedAdded = feedArchiveService.addFeed(feed, feedId);
        if (!feedAdded) {
            var message = "Unable to add the feed into the archive. Feed Info: " + JSON.stringify(feed);
            Logger_1.default.error("[CollectFeed->prepareNewFeed] " + message);
            throw new FeedFetchError(message);
        }
        var feedItemsAdded = feedItemArchiveService.addFeedItems(feed.items, feedId);
        if (!feedItemsAdded) {
            var message = "";
            Logger_1.default.error("[CollectFeed->prepareNewFeed] Unable to add feed items into the archive.");
            throw new FeedFetchError(message);
        }
        //TODO: Send new feed items and feed info to the UI using Socket.IO
    }
    catch (err) {
        Logger_1.default.error("[CollectFeed->prepareNewFeed] " + err.message);
        throw err;
    }
}
/**
 * The method that updates the given feed according to the newly received data.
 * @param feed The feed that needs to be updated.
 * @param feedId The id of the feed.
 */
function updateExistingFeed(feed, feedId) {
    var feedUpdated = feedArchiveService.updateFeed(feedId, feed);
    if (feedUpdated) {
        var existingFeedItemsOfFeed_1 = feedItemArchiveService.getFeedItemIds(feedId);
        var itemsToBeAddedToArchive = feed.items.filter(function (i) { return !existingFeedItemsOfFeed_1.includes(i.itemId); });
        if (itemsToBeAddedToArchive.length > 0) {
            var feedItemsAdded = feedItemArchiveService.addFeedItems(itemsToBeAddedToArchive, feedId);
            if (!feedItemsAdded) {
                var message = "Unable to add feed items.";
                Logger_1.default.error("[CollectFeed->updateExistingFeed] " + message);
                throw new FeedFetchError(message);
            }
            /*else {
                //TODO: Add socket io message sender to UI for the new fresh feed data and feed items.
            }*/
        }
    }
}
/**
 * The method that returns a Promise with a value of parsed feed read from given URL in the feed configuration.
 * If any case of failure happens during collecting of feeds (such as no internet connection, parsing problems etc.) it will reject with a specific error.
 * @param feedConfig The configuration object of a specific feed defined in the system. The URL should be valid url.
 */
function collectFeed(feedConfig) {
    var feedCollectorPromise = new Promise(function (resolve, reject) {
        Logger_1.default.info("Started Collecting feeds from the feed \"" + feedConfig.name + "\"");
        request_1.default(feedConfig.url, function (error, response, body) {
            if (error) {
                if (error.code === 'ENOTFOUND') {
                    Logger_1.default.error("[CollectFeed] Unable to fetch the feed. (" + feedConfig.url + ") Please check that the feed url is valid or an internet connection is available.");
                    reject(new FeedFetchError("Unable to fetch the feed. (" + feedConfig.url + ") Please check that the feed url is valid or an internet connection is available."));
                }
                else {
                    Logger_1.default.error("[CollectFeed] " + error.message + " :: Feed URL: " + feedConfig.url);
                    reject(error);
                }
                return;
            }
            //Parse XML to JavaScript object.
            xml2js_1.parseString(body, xmlParseOptions, function (err, rssObject) {
                if (err) {
                    Logger_1.default.error("[CollectFeed->ParsingXML] " + err.message);
                    reject(err);
                    return;
                }
                try {
                    var feed = RSSParserFactory_1.default.generateRSSParser(rssObject).parseRSS(rssObject);
                    var feedInDb = feedArchiveService.getFeed(feedConfig.feedConfigId);
                    if (feedInDb === undefined)
                        prepareNewFeed(feed, feedConfig.feedConfigId);
                    else
                        updateExistingFeed(feed, feedConfig.feedConfigId);
                    Logger_1.default.info("Finished collecting feeds from the feed \"" + feedConfig.name + "\" successfully.");
                    resolve(feed);
                }
                catch (err) {
                    Logger_1.default.error("[CollectFeed] " + err.message);
                    reject(err);
                }
            });
        });
    });
    return feedCollectorPromise;
}
exports.collectFeed = collectFeed;
var FeedFetchError = /** @class */ (function (_super) {
    __extends(FeedFetchError, _super);
    function FeedFetchError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return FeedFetchError;
}(Error));
exports.FeedFetchError = FeedFetchError;
//# sourceMappingURL=FeedCollector.js.map