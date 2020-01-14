import { ArchiveService } from "./ArchiveService";
import logger from "../utils/Logger";
import { FeedItem, Feed } from "../rss/specifications/RSS20";
import SQLiteDatabase from "../db/SQLiteDatabase";

/**
 * The archive service implemention that manages archive using SQLite database.
 * 
 * @author cemozden
 * 
 * @see ArchiveService
 */
export default class SQLiteArchiveService implements ArchiveService {
    
    private readonly itemIdColumn = 'itemId';
    private readonly feedIdColumn = 'feedId';

    /**
     * The method that returns a list of ids of feed items that belongs to a specific feed.
     * @param feedId The id of the feed that feed items have.
     */
    getFeedItemIds(feedId: string): Promise<string[]> {
        const feedItemPromise = new Promise<string[]>((resolve, reject) => {
            const feedItemQry = `SELECT ${this.itemIdColumn} FROM ${SQLiteDatabase.FEED_ITEMS_TABLE_NAME} WHERE ${this.feedIdColumn} LIKE ?`;
            try {
                const rows = SQLiteDatabase.getDatabaseInstance().prepare(feedItemQry).all(feedId);
                const itemIds = rows.map(row => row.itemId);

                resolve(itemIds);
            }
            catch(err) {
                logger.error(`[SQLiteArchiveService:getFeedItemIds] ${err.message}`);
                    reject(err);
                    return;
            }
        
        });

        return feedItemPromise;
    }

    /**
     * The method that adds the given feed into the archive.
     * The second parameter "feedId" must be the id given to the configuration of the feed. @see FeedConfig
     * @param feed The feed that will be added.
     * @param feedId The feed id that will be the id of the feed.
     */
    addFeed(feed: Feed, feedId : string): Promise<boolean> {
        const addFeedPromise = new Promise<boolean>((resolve, reject) => {
            const tableData = [
                feedId,
                feed.version,
                feed.feedMetadata.title,
                feed.feedMetadata.link,
                feed.feedMetadata.description
            ];
            
            // Create placeholders according to the size of tableData
            const placeHolder = tableData.map(td => '?').join(',');
            const addFeedQry = `INSERT INTO ${SQLiteDatabase.FEEDS_TABLE_NAME} VALUES (${placeHolder})`;

            try {
                SQLiteDatabase.getDatabaseInstance().prepare(addFeedQry).run(tableData);
                resolve(true);
            }
            catch(err) {
                logger.error(`[SQLiteArchiveService:addFeed] ${err.message}`);
                reject(err);
                return;
            }
       
        });

        return addFeedPromise;
    }

    /**
     * The method that adds the given feed items to the archive.
     * The second parameter "feedId" represents the id of the feed that will own the given feed items. 
     * @param feedItems The feed items that needs to be added.
     * @param feedId The id of the feed that owns the given feed items.
     */
    addFeedItems(feedItems: FeedItem[], feedId : string): Promise<boolean> {
        const addFeedItemsPromise = new Promise<boolean>((resolve, reject) => {
            
            if(feedItems.length === 0) {
                resolve(false);
                return;
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
            });
            
            console.log(tableValues);

            const placeHolder = feedItems.map(fi => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?, ?)').join(',');
            const addFeedItemsQry = `INSERT INTO ${SQLiteDatabase.FEED_ITEMS_TABLE_NAME} VALUES ${placeHolder}`;
            
            try {
                SQLiteDatabase.getDatabaseInstance().prepare(addFeedItemsQry).run(tableValues);
                resolve(true);
            }
            catch(err) {
                logger.error(`[SQLiteArchiveService:addFeedItems] ${err.message}`);
                reject(err);
                return;
            }

        });

        return addFeedItemsPromise;
    }

    /**
     * The method that gives the feed according to the feed id given as a parameter.
     * @returns Feed object if feedId exist in the archive otherwise returns null
     * @param feedId The feed id that will be looked in the archive.
     */
    getFeed(feedId: string): Feed | null {
        throw new Error("Method not implemented.");
    }
    updateFeed(feedId: string, feed: Feed): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    deleteFeed(feedId: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    deleteFeedItems(itemIds: string[]): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

}