import { ArchiveService, InvalidFeedIdError } from "./ArchiveService";
import logger from "../utils/Logger";
import { FeedItem, Feed } from "../rss/specifications/RSS20";
import SQLiteDatabase from "../db/SQLiteDatabase";
import { RSSVersion } from "../rss/specifications/RSSVersion";

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
    getFeedItemIds(feedId: string): string[] {
        const feedItemQry = `SELECT ${this.itemIdColumn} FROM ${SQLiteDatabase.FEED_ITEMS_TABLE_NAME} WHERE ${this.feedIdColumn} LIKE ?`;
        
        try {
            const rows = SQLiteDatabase.getDatabaseInstance().prepare(feedItemQry).all(feedId);
            const itemIds = rows.map(row => row.itemId);
            return itemIds;
        }
        catch(err) {
            logger.error(`[SQLiteArchiveService:getFeedItemIds] ${err.message}`);
        }
        return [];
    }  /**
     * The method that adds the given feed into the archive.
     * The second parameter "feedId" must be the id given to the configuration of the feed. @see FeedConfig
     * @param feed The feed that will be added.
     * @param feedId The feed id that will be the id of the feed.
     */
    addFeed(feed: Feed, feedId : string): boolean {
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
            return true;
        }
        catch(err) {
            logger.error(`[SQLiteArchiveService:addFeed] ${err.message}`);
        }
        return false;
    }

    /**
     * The method that adds the given feed items to the archive.
     * The second parameter "feedId" represents the id of the feed that will own the given feed items. 
     * @param feedItems The feed items that needs to be added.
     * @param feedId The id of the feed that owns the given feed items.
     */
    addFeedItems(feedItems: FeedItem[], feedId : string): boolean {
        
        if(feedItems.length === 0) 
            return false;
        
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
        
        const placeHolder = feedItems.map(fi => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?, ?)').join(',');
        const addFeedItemsQry = `INSERT INTO ${SQLiteDatabase.FEED_ITEMS_TABLE_NAME} VALUES ${placeHolder}`;
        
        try {
            SQLiteDatabase.getDatabaseInstance().prepare(addFeedItemsQry).run(tableValues);
            return true;
        }
        catch(err) {
            logger.error(`[SQLiteArchiveService:addFeedItems] ${err.message}`);
        }
        return false;
    }

    /**
     * The method that gives the feed according to the feed id given as a parameter.
     * @returns Feed object if feedId exist in the archive otherwise returns null
     * @param feedId The feed id that will be looked in the archive.
     */
    getFeed(feedId: string): Feed | undefined {
        
        try {
            const sqlFeed = SQLiteDatabase.getDatabaseInstance().prepare(`SELECT * FROM ${SQLiteDatabase.FEEDS_TABLE_NAME} WHERE ${this.feedIdColumn} LIKE ?`).get(feedId);
            
            if (sqlFeed === undefined) return undefined;
            
            sqlFeed.version = parseInt(sqlFeed.version);
            
            //TODO: Problem with initializing feed metadata check this out.
            const feed : Feed = {
                feedMetadata : {
                    title : sqlFeed.title,
                    description : sqlFeed.description,
                    link : sqlFeed.link
                },
                items : [],
                version : sqlFeed.version
            };

            const sqlFeedItems = SQLiteDatabase.getDatabaseInstance().prepare(`SELECT * FROM ${SQLiteDatabase.FEED_ITEMS_TABLE_NAME} WHERE ${this.feedIdColumn} LIKE ?`).all(feedId);
            // convert data read from db to feed item. parse json data to real objects...
            for (const sfi of sqlFeedItems) {
                const feedItem : FeedItem = {
                    description : sfi.description,
                    itemId : sfi.itemId,
                    title : sfi.title,
                    author : sfi.author == null ? undefined : sfi.author,
                    category : sfi.category != null ? JSON.parse(sfi.category) : undefined,
                    comments : sfi.comments == null ? undefined : sfi.comments,
                    enclosure : sfi.category != null ? JSON.parse(sfi.enclosure) : undefined,
                    guid : sfi.guid != null ? JSON.parse(sfi.guid) : undefined,
                    link : sfi.link == null ? undefined : sfi.link,
                    pubDate : sfi.pubDate != null ? new Date(sfi.pubDate) : undefined,
                    source : sfi.source != null ? JSON.parse(sfi.source) : undefined
                }
                feed.items.push(feedItem);
            }
            return feed;
        }
        catch(err) {
            logger.error(`[SQLiteArchiveService:getFeed] ${err.message}`);
            return undefined;
        }
        

        return undefined;
    }

    /**
     * The method that updates a specific feed on the database by getting its feedId
     * @param feedId The id of the feed needs to be updated.
     * @param feed The new feed object that will replace th existing one.
     * @throws InvalidFeedIdError if feedId is not a valid feedId.
     */
    updateFeed(feedId: string, feed: Feed): boolean {
        if (typeof feedId !== 'string' || feedId === '')
            throw new InvalidFeedIdError(`feedId parameter cannot be empty. Parameter value: "${feedId}"`);
        
        const valueMap = new Map<string, any>();

        const feedTableValues : any = {
            feedId : feedId,
            version : feed.version,
            title : feed.feedMetadata.title,
            link : feed.feedMetadata.link,
            description : feed.feedMetadata.description
        };

        const sqlNewValuesStr = Object.keys(feedTableValues)
            .map(k => `${k} = ?`).join(', ');

        let updateQry = `UPDATE ${SQLiteDatabase.FEEDS_TABLE_NAME} SET ${sqlNewValuesStr} WHERE ${this.feedIdColumn} LIKE ?`;
        const qryParams = Object.values(feedTableValues);
        // Push feedId for WHERE condition
        qryParams.push(feedId);

        const numberOfChanges = SQLiteDatabase.getDatabaseInstance().prepare(updateQry).run(qryParams).changes;
        return numberOfChanges == 1;
    }
    deleteFeed(feedId: string): boolean {
        throw new Error("Method not implemented.");
    }
    deleteFeedItems(itemIds: string[]): boolean {
        throw new Error("Method not implemented.");
    }

}