"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var FeedArchiveService_1 = require("./FeedArchiveService");
var SQLiteDatabase_1 = __importDefault(require("../db/SQLiteDatabase"));
var Logger_1 = __importDefault(require("../utils/Logger"));
/**
 * The archive service implemention that manages archive using SQLite database for feeds.
 *
 * @author cemozden
 * @see FeedArchiveService
 */
var SQLiteFeedArchiveService = /** @class */ (function () {
    function SQLiteFeedArchiveService() {
        this.feedIdColumn = 'feedId';
    }
    /**
     * The method that adds the given feed into the archive.
     * The second parameter "feedId" must be the id given to the configuration of the feed. @see FeedConfig
     * @param feed The feed that will be added.
     * @param feedId The feed id that will be the id of the feed.
     * @throws InvalidFeedIdError if the given feed id is already existing in the database.
     */
    SQLiteFeedArchiveService.prototype.addFeed = function (feed, feedId) {
        // Check whether feedId is existing
        var feedQryCheckQry = "SELECT feedId FROM " + SQLiteDatabase_1.default.FEEDS_TABLE_NAME + " WHERE feedId LIKE ?";
        var feedQryCheckResult = SQLiteDatabase_1.default.getDatabaseInstance().prepare(feedQryCheckQry).all(feedId);
        if (feedQryCheckResult.length > 0)
            throw new FeedArchiveService_1.InvalidFeedIdError("Given feed id \"" + feedId + " is already existing in the archive!\"");
        var tableData = [
            feedId,
            feed.version,
            feed.feedMetadata.title,
            feed.feedMetadata.link,
            feed.feedMetadata.description,
            feed.feedMetadata.image !== undefined && feed.feedMetadata.image.url !== undefined ? feed.feedMetadata.image.url : null,
            new Date().toISOString()
        ];
        // Create placeholders according to the size of tableData
        var placeHolder = tableData.map(function (td) { return '?'; }).join(',');
        var addFeedQry = "INSERT INTO " + SQLiteDatabase_1.default.FEEDS_TABLE_NAME + " VALUES (" + placeHolder + ")";
        try {
            SQLiteDatabase_1.default.getDatabaseInstance().prepare(addFeedQry).run(tableData);
            return true;
        }
        catch (err) {
            Logger_1.default.error("[SQLiteArchiveService->addFeed] " + err.message);
        }
        return false;
    };
    /**
     * The method that gives the feed according to the feed id given as a parameter.
     * @returns Feed object if feedId exist in the archive otherwise returns null
     * @param feedId The feed id that will be looked in the archive.
     */
    SQLiteFeedArchiveService.prototype.getFeed = function (feedId) {
        try {
            var sqlFeed = SQLiteDatabase_1.default.getDatabaseInstance().prepare("SELECT feedId, version, title, link, description, imageURL, insertedAt FROM " + SQLiteDatabase_1.default.FEEDS_TABLE_NAME + " WHERE " + this.feedIdColumn + " LIKE ?").get(feedId);
            if (sqlFeed === undefined)
                return undefined;
            sqlFeed.version = parseInt(sqlFeed.version);
            var feed = {
                feedMetadata: {
                    title: sqlFeed.title,
                    description: sqlFeed.description,
                    link: sqlFeed.link,
                    image: {
                        link: '',
                        title: '',
                        url: sqlFeed.imageURL,
                    }
                },
                items: [],
                version: sqlFeed.version
            };
            var sqlFeedItems = SQLiteDatabase_1.default.getDatabaseInstance().prepare("SELECT itemId, feedId, title, description, link, author, category, comments, pubDate, enclosure, guid, source, itemRead, insertedAt FROM " + SQLiteDatabase_1.default.FEED_ITEMS_TABLE_NAME + " WHERE " + this.feedIdColumn + " LIKE ?")
                .all(feedId);
            // convert data read from db to feed item. parse json data to real objects...
            for (var _i = 0, sqlFeedItems_1 = sqlFeedItems; _i < sqlFeedItems_1.length; _i++) {
                var sfi = sqlFeedItems_1[_i];
                var feedItem = {
                    description: sfi.description,
                    itemId: sfi.itemId,
                    title: sfi.title,
                    author: sfi.author == null ? undefined : sfi.author,
                    category: sfi.category != null ? JSON.parse(sfi.category) : undefined,
                    comments: sfi.comments == null ? undefined : sfi.comments,
                    enclosure: sfi.category != null ? JSON.parse(sfi.enclosure) : undefined,
                    guid: sfi.guid != null ? JSON.parse(sfi.guid) : undefined,
                    link: sfi.link == null ? undefined : sfi.link,
                    pubDate: sfi.pubDate != null ? new Date(sfi.pubDate) : undefined,
                    source: sfi.source != null ? JSON.parse(sfi.source) : undefined
                };
                feed.items.push(feedItem);
            }
            return feed;
        }
        catch (err) {
            Logger_1.default.error("[SQLiteArchiveService->getFeed] " + err.message);
            return undefined;
        }
    };
    /**
     * The method that updates a specific feed on the database by getting its feedId
     * @param feedId The id of the feed needs to be updated.
     * @param feed The new feed object that will replace th existing one.
     * @throws InvalidFeedIdError if feedId is not a valid feedId.
     */
    SQLiteFeedArchiveService.prototype.updateFeed = function (feedId, feed) {
        if (typeof feedId !== 'string' || feedId === '')
            throw new FeedArchiveService_1.InvalidFeedIdError("feedId parameter cannot be empty. Parameter value: \"" + feedId + "\"");
        var feedTableValues = {
            feedId: feedId,
            version: feed.version,
            title: feed.feedMetadata.title,
            link: feed.feedMetadata.link,
            imageURL: feed.feedMetadata.image !== undefined && feed.feedMetadata.image.url !== undefined ? feed.feedMetadata.image.url : null,
            description: feed.feedMetadata.description
        };
        var sqlNewValuesStr = Object.keys(feedTableValues)
            .map(function (k) { return k + " = ?"; }).join(', ');
        var updateQry = "UPDATE " + SQLiteDatabase_1.default.FEEDS_TABLE_NAME + " SET " + sqlNewValuesStr + " WHERE " + this.feedIdColumn + " LIKE ?";
        var qryParams = Object.values(feedTableValues);
        // Push feedId for WHERE condition
        qryParams.push(feedId);
        var numberOfChanges = SQLiteDatabase_1.default.getDatabaseInstance().prepare(updateQry).run(qryParams).changes;
        return numberOfChanges === 1;
    };
    /**
     * The method that deletes a specific feed according to the given parameter.
     *
     * @param feedId The id of the feed which needs to be deleted.
     */
    SQLiteFeedArchiveService.prototype.deleteFeed = function (feedId) {
        try {
            var qryResult = SQLiteDatabase_1.default.getDatabaseInstance().prepare("DELETE FROM " + SQLiteDatabase_1.default.FEEDS_TABLE_NAME + " WHERE " + this.feedIdColumn + " LIKE ?").run(feedId);
            return qryResult.changes > 0;
        }
        catch (err) {
            Logger_1.default.error("[SQLiteArchiveService->deleteFeed] " + err.message);
        }
        return false;
    };
    return SQLiteFeedArchiveService;
}());
exports.default = SQLiteFeedArchiveService;
//# sourceMappingURL=SQLiteFeedArchiveService.js.map