"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var FeedItemArchiveService_1 = require("./FeedItemArchiveService");
var Logger_1 = __importDefault(require("../utils/Logger"));
var SQLiteDatabase_1 = __importDefault(require("../db/SQLiteDatabase"));
var TimeUnit_1 = require("../time/TimeUnit");
/**
 * The archive service implemention that manages archive using SQLite database for feed items.
 *
 * @author cemozden
 * @see FeedItemArchiveService
 */
var SQLiteFeedItemArchiveService = /** @class */ (function () {
    function SQLiteFeedItemArchiveService() {
        this.itemIdColumn = 'itemId';
        this.feedIdColumn = 'feedId';
    }
    /**
     * The method that returns a list of ids of feed items that belongs to a specific feed.
     * @param feedId The id of the feed that feed items have.
     */
    SQLiteFeedItemArchiveService.prototype.getFeedItemIds = function (feedId) {
        var feedItemQry = "SELECT " + this.itemIdColumn + " FROM " + SQLiteDatabase_1.default.FEED_ITEMS_TABLE_NAME + " WHERE " + this.feedIdColumn + " LIKE ?";
        try {
            var rows = SQLiteDatabase_1.default.getDatabaseInstance().prepare(feedItemQry).all(feedId);
            var itemIds = rows.map(function (row) { return row.itemId; });
            return itemIds;
        }
        catch (err) {
            Logger_1.default.error("[SQLiteArchiveService->getFeedItemIds] " + err.message);
        }
        return [];
    };
    /**
     * The method that retrieves feed items belong to a specific feed.
     * startDate and endDate variables filter the items for a specific time period.
     * If allItems variable is set to true then all feed items in the specific time period will be yielded. by default it's false
     */
    SQLiteFeedItemArchiveService.prototype.getFeedItems = function (feedId, startDate, endDate, allItems) {
        if (allItems === void 0) { allItems = false; }
        var feedItemQry = "SELECT * FROM " + SQLiteDatabase_1.default.FEED_ITEMS_TABLE_NAME + " WHERE feedId LIKE ? AND insertedAt > ? AND insertedAt < ? " + (!allItems ? "AND itemRead = 'N'" : '') + " ORDER BY pubDate DESC, insertedAt DESC";
        try {
            var rows = SQLiteDatabase_1.default.getDatabaseInstance().prepare(feedItemQry).all([feedId, startDate.toISOString(), endDate.toISOString()]);
            var feedItems = rows.map(function (row) {
                var feedItem = {
                    description: row.description,
                    itemId: row.itemId,
                    title: row.title,
                    author: row.author == null ? undefined : row.author,
                    category: row.category != null ? JSON.parse(row.category) : undefined,
                    comments: row.comments == null ? undefined : row.comments,
                    enclosure: row.category != null ? JSON.parse(row.enclosure) : undefined,
                    guid: row.guid != null ? JSON.parse(row.guid) : undefined,
                    link: row.link == null ? undefined : row.link,
                    pubDate: row.pubDate != null ? new Date(row.pubDate) : undefined,
                    source: row.source != null ? JSON.parse(row.source) : undefined
                };
                return feedItem;
            });
            return feedItems;
        }
        catch (err) {
            Logger_1.default.error("[SQLiteArchiveService->getFeedItems] " + err.message);
        }
        return [];
    };
    /**
     * The method that adds the given feed items to the archive.
     * The second parameter "feedId" represents the id of the feed that will own the given feed items.
     * @param feedItems The feed items that needs to be added.
     * @param feedId The id of the feed that owns the given feed items.
     * @throws InvalidFeedItemIdError if the ids of feed items exist in the database.
     */
    SQLiteFeedItemArchiveService.prototype.addFeedItems = function (feedItems, feedId) {
        if (feedItems.length === 0)
            return false;
        // Check whether ids exist in the database.
        var feedItemExistQryPlaceholder = feedItems.map(function (fi) { return '?'; }).join(',');
        var feedItemExistQry = "SELECT itemId FROM " + SQLiteDatabase_1.default.FEED_ITEMS_TABLE_NAME + " WHERE itemId IN (" + feedItemExistQryPlaceholder + ")";
        var feedItemExistQryResult = SQLiteDatabase_1.default.getDatabaseInstance().prepare(feedItemExistQry).all(feedItems.map(function (fi) { return fi.itemId; }));
        if (feedItemExistQryResult.length > 0) {
            var feedItemIdExistErrorMessageValues = feedItemExistQryResult.map(function (fi) { return fi.itemId; }).join(', ');
            var errorMessage = "Unable to add feed items. There is/are feed item id(s) which are already existing in the database. They are \"" + feedItemIdExistErrorMessageValues + "\"";
            throw new FeedItemArchiveService_1.InvalidFeedItemIdError(errorMessage);
        }
        var tableValues = [];
        feedItems.forEach(function (fi) {
            var _a;
            tableValues.push(fi.itemId);
            tableValues.push(feedId);
            tableValues.push(fi.title);
            tableValues.push(fi.description);
            tableValues.push(fi.link);
            tableValues.push(fi.author);
            tableValues.push(fi.category !== undefined ? JSON.stringify(fi.category) : null);
            tableValues.push(fi.comments);
            tableValues.push((_a = fi.pubDate) === null || _a === void 0 ? void 0 : _a.toISOString());
            tableValues.push(fi.enclosure !== undefined ? JSON.stringify(fi.enclosure) : null);
            tableValues.push(fi.guid !== undefined ? JSON.stringify(fi.guid) : null);
            tableValues.push(fi.source !== undefined ? JSON.stringify(fi.source) : null);
            tableValues.push('N');
            tableValues.push(new Date().toISOString());
        });
        var placeHolder = feedItems.map(function (fi) { return '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?, ?, ?)'; }).join(',');
        var addFeedItemsQry = "INSERT INTO " + SQLiteDatabase_1.default.FEED_ITEMS_TABLE_NAME + " VALUES " + placeHolder;
        try {
            SQLiteDatabase_1.default.getDatabaseInstance().prepare(addFeedItemsQry).run(tableValues);
            return true;
        }
        catch (err) {
            Logger_1.default.error("[SQLiteArchiveService->addFeedItems] " + err.message);
        }
        return false;
    };
    /**
     * The method that deletes a list of feed items given as parameters.
     * @param itemIds The list of item ids need to be deleted.
     */
    SQLiteFeedItemArchiveService.prototype.deleteFeedItems = function (itemIds) {
        var deleteFeedItemsQryPlaceHolder = itemIds.map(function (fi) { return '?'; }).join(',');
        var deleteFeedItemsQry = "DELETE FROM " + SQLiteDatabase_1.default.FEED_ITEMS_TABLE_NAME + " WHERE " + this.itemIdColumn + " IN (" + deleteFeedItemsQryPlaceHolder + ")";
        var qryResult = SQLiteDatabase_1.default.getDatabaseInstance().prepare(deleteFeedItemsQry).run(itemIds);
        return qryResult.changes;
    };
    SQLiteFeedItemArchiveService.prototype.cleanFeedItems = function (duration) {
        var timeUnitStr = TimeUnit_1.TimeUnit[duration.unit];
        var sqlDateFilterPattern = "-" + duration.value + " " + timeUnitStr;
        var deleteFeedItemsQry = "DELETE FROM " + SQLiteDatabase_1.default.FEED_ITEMS_TABLE_NAME + " WHERE strftime('%Y-%m-%d %H:%M:%S', insertedAt) < datetime('now','" + sqlDateFilterPattern + "');";
        return SQLiteDatabase_1.default.getDatabaseInstance().prepare(deleteFeedItemsQry).run().changes;
    };
    return SQLiteFeedItemArchiveService;
}());
exports.default = SQLiteFeedItemArchiveService;
//# sourceMappingURL=SQLiteFeedItemArchiveService.js.map