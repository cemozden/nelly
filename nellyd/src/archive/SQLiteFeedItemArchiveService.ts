import { FeedItemArchiveService, InvalidFeedItemIdError } from "./FeedItemArchiveService";
import logger from "../utils/Logger";
import { FeedItem } from "../rss/specifications/RSS20";
import SQLiteDatabase from "../db/SQLiteDatabase";
import Duration from "../time/Duration";
import { TimeUnit } from "../time/TimeUnit";

/**
 * The archive service implemention that manages archive using SQLite database for feed items.
 * 
 * @author cemozden
 * @see FeedItemArchiveService
 */
export default class SQLiteFeedItemArchiveService implements FeedItemArchiveService {
    
    private readonly itemIdColumn = 'itemId';
    private readonly feedIdColumn = 'feedId';

    /**
     * The method that returns a list of ids of feed items that belongs to a specific feed.
     * @param feedId The id of the feed that feed items have.
     */
    getFeedItemIds(feedId: string): string[] {
        const feedItemQry = `SELECT ${this.itemIdColumn} FROM ${SQLiteDatabase.FEED_ITEMS_TABLE_NAME} WHERE ${this.feedIdColumn} LIKE ?`;
        
        try {
            const rows = SQLiteDatabase.getDatabaseInstance().prepare(feedItemQry).all(feedId);
            const itemIds = rows.map(row => row.itemId);
            return itemIds;
        }
        catch(err) {
            logger.error(`[SQLiteArchiveService->getFeedItemIds] ${err.message}`);
        }
        return [];
    }  

    /**
     * The method that adds the given feed items to the archive.
     * The second parameter "feedId" represents the id of the feed that will own the given feed items. 
     * @param feedItems The feed items that needs to be added.
     * @param feedId The id of the feed that owns the given feed items.
     * @throws InvalidFeedItemIdError if the ids of feed items exist in the database.
     */
    addFeedItems(feedItems: FeedItem[], feedId : string): boolean {
        
        if(feedItems.length === 0) 
            return false;

        // Check whether ids exist in the database.
        const feedItemExistQryPlaceholder = feedItems.map(fi => '?').join(',');
        const feedItemExistQry = `SELECT itemId FROM ${SQLiteDatabase.FEED_ITEMS_TABLE_NAME} WHERE itemId IN (${feedItemExistQryPlaceholder})`;

        const feedItemExistQryResult = SQLiteDatabase.getDatabaseInstance().prepare(feedItemExistQry).all(feedItems.map(fi => fi.itemId));

        if (feedItemExistQryResult.length > 0) {
            const feedItemIdExistErrorMessageValues = feedItemExistQryResult.map(fi => fi.itemId).join(', ');
            const errorMessage = `Unable to add feed items. There is/are feed item id(s) which are already existing in the database. They are "${feedItemIdExistErrorMessageValues}"`;
            throw new InvalidFeedItemIdError(errorMessage);
        }

        let tableValues : any[] = [];

        feedItems.forEach(fi => {
            tableValues.push(fi.itemId);
            tableValues.push(feedId);
            tableValues.push(fi.title);
            tableValues.push(fi.description);
            tableValues.push(fi.link);
            tableValues.push(fi.author);
            tableValues.push(fi.category !== undefined ? JSON.stringify(fi.category) : null);
            tableValues.push(fi.comments);
            tableValues.push(fi.pubDate?.toISOString());
            tableValues.push(fi.enclosure !== undefined ? JSON.stringify(fi.enclosure) : null);
            tableValues.push(fi.guid !== undefined ? JSON.stringify(fi.guid) : null);
            tableValues.push(fi.source !== undefined ? JSON.stringify(fi.source) : null );
            tableValues.push('N');
            tableValues.push(new Date().toISOString());
        });
        
        const placeHolder = feedItems.map(fi => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?, ?, ?)').join(',');
        const addFeedItemsQry = `INSERT INTO ${SQLiteDatabase.FEED_ITEMS_TABLE_NAME} VALUES ${placeHolder}`;
        
        try {
            SQLiteDatabase.getDatabaseInstance().prepare(addFeedItemsQry).run(tableValues);
            return true;
        }
        catch(err) {
            logger.error(`[SQLiteArchiveService->addFeedItems] ${err.message}`);
        }
        return false;
    }

    /**
     * The method that deletes a list of feed items given as parameters.
     * @param itemIds The list of item ids need to be deleted.
     */
    deleteFeedItems(itemIds: string[]): number {
        const deleteFeedItemsQryPlaceHolder = itemIds.map(fi => '?').join(',');
        const deleteFeedItemsQry = `DELETE FROM ${SQLiteDatabase.FEED_ITEMS_TABLE_NAME} WHERE ${this.itemIdColumn} IN (${deleteFeedItemsQryPlaceHolder})`;

        const qryResult = SQLiteDatabase.getDatabaseInstance().prepare(deleteFeedItemsQry).run(itemIds);

        return qryResult.changes;
    }

    cleanFeedItems(duration : Duration): number {
        const timeUnitStr = TimeUnit[duration.unit];
        const sqlDateFilterPattern = `-${duration.value} ${timeUnitStr}`;

        const deleteFeedItemsQry = `DELETE FROM ${SQLiteDatabase.FEED_ITEMS_TABLE_NAME} WHERE strftime('%Y-%m-%d %H:%M:%S', insertedAt) < datetime('now','${sqlDateFilterPattern}');`;
        
        return SQLiteDatabase.getDatabaseInstance().prepare(deleteFeedItemsQry).run().changes;
    }

}