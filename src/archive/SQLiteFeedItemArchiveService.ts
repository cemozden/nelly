import { FeedItemArchiveService, InvalidFeedItemIdError, FeedItemCountStatistics } from "./FeedItemArchiveService";
import general_logger from "../utils/Logger";
import { FeedItem } from "../rss/specifications/RSS20";
import SQLiteDatabase from "../db/SQLiteDatabase";
import Duration from "../time/Duration";
import { TimeUnit } from "../time/TimeUnit";
import { FeedArchiveService } from "./FeedArchiveService";
import SQLiteFeedArchiveService from "./SQLiteFeedArchiveService";

/**
 * The archive service implemention that manages archive using SQLite database for feed items.
 * 
 * @author cemozden
 * @see FeedItemArchiveService
 */
export default class SQLiteFeedItemArchiveService implements FeedItemArchiveService {
    
    private readonly itemIdColumn = 'itemId';
    private readonly feedIdColumn = 'feedId';
    private readonly feedItemTableColumns = 'itemId, feedId, title, description, link, author, category, comments, pubDate, enclosure, guid, source, itemRead, insertedAt';
    private readonly feedArchiveService : FeedArchiveService = new SQLiteFeedArchiveService();

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
            general_logger.error(`[SQLiteArchiveService->getFeedItemIds] ${err.message}`);
        }
        return [];
    }  

    private collectNamespace(itemIds : string[], namespace : string) : any[] {

        const itemInQry = itemIds.map(i => `'${i}'`).join(', ');
        const namespaceQry = `SELECT * FROM ns_${namespace} WHERE itemId IN (${itemInQry})`;
        
        const namespaceObjects = SQLiteDatabase.getDatabaseInstance().prepare(namespaceQry).all();

        return namespaceObjects;
    }

    /**
     * The method that retrieves feed items belong to a specific feed.
     * startDate and endDate variables filter the items for a specific time period.
     * If allItems variable is set to true then all feed items in the specific time period will be yielded. by default it's false
     * numOfEntries represents how many rows will be fetched. if it's -1 then all rows will be fetched.
     */
    getFeedItems(feedId: string, startDate: Date, endDate: Date, allItems : boolean = false, numOfEntries : number = -1): FeedItem[] {
        const limitQry = numOfEntries === -1 ? '' : `LIMIT ${numOfEntries}`;
        const feedItemQry = `SELECT ${this.feedItemTableColumns} FROM ${SQLiteDatabase.FEED_ITEMS_TABLE_NAME} WHERE feedId LIKE ? AND insertedAt > ? AND insertedAt < ? ${!allItems ? "AND itemRead = 'N'" : '' } ORDER BY pubDate DESC, insertedAt DESC ${limitQry}`;
        try {
            const itemNamespaces = this.feedArchiveService.getNamespaces(feedId);
            const rows = SQLiteDatabase.getDatabaseInstance().prepare(feedItemQry).all([feedId, startDate.toISOString(), endDate.toISOString()]);
            const dcNamespaceMap : Map<string, any> = new Map();
            const contentNamespaceMap : Map<string, any> = new Map();

            // dc namespace setup...
            this.collectNamespace(rows.map((row : any) => row.itemId), 'dc').forEach(item => dcNamespaceMap.set(item.itemId, item));

            //content namespace setup
            this.collectNamespace(rows.map((row : any) => row.itemId), 'content').forEach(item => contentNamespaceMap.set(item.itemId, item));

            const feedItems : FeedItem[] = rows.map((row : any) => {
                const feedItem : FeedItem = {
                    description : row.description !== null ? row.description : undefined,
                    itemId : row.itemId,
                    feedId : row.feedId,
                    title : row.title,
                    author : row.author == null ? undefined : row.author,
                    category : row.category != null ? JSON.parse(row.category) : undefined,
                    comments : row.comments == null ? undefined : row.comments,
                    enclosure : row.category != null ? JSON.parse(row.enclosure) : undefined,
                    guid : row.guid != null ? JSON.parse(row.guid) : undefined,
                    link : row.link == null ? undefined : row.link,
                    pubDate : row.pubDate != null ? new Date(row.pubDate) : undefined,
                    source : row.source != null ? JSON.parse(row.source) : undefined,
                    read : row.itemRead != null && row.itemRead === 'Y',
                    _NS_DC : itemNamespaces.includes('dc') ? dcNamespaceMap.get(row.itemId) : undefined,
                    _NS_CONTENT : itemNamespaces.includes('content') ? dcNamespaceMap.get(row.itemId) : undefined
                }

                return feedItem;
            });

            return feedItems;
        }
        catch(err) {
            general_logger.error(`[SQLiteArchiveService->getFeedItems] ${err.message}`);
        }

        return [];
    }

    getFeedItem(itemId: string): FeedItem | undefined {
        const qry = `SELECT ${this.feedItemTableColumns} FROM ${SQLiteDatabase.FEED_ITEMS_TABLE_NAME} WHERE itemId LIKE ?`;

        try {
            
            const row = SQLiteDatabase.getDatabaseInstance().prepare(qry).get(itemId);
            const itemNamespaces = this.feedArchiveService.getNamespaces(row.feedId);

            const feedItem : FeedItem = {
                description : row.description,
                itemId : row.itemId,
                feedId : row.feedId,
                title : row.title,
                author : row.author == null ? undefined : row.author,
                category : row.category != null ? JSON.parse(row.category) : undefined,
                comments : row.comments == null ? undefined : row.comments,
                enclosure : row.category != null ? JSON.parse(row.enclosure) : undefined,
                guid : row.guid != null ? JSON.parse(row.guid) : undefined,
                link : row.link == null ? undefined : row.link,
                pubDate : row.pubDate != null ? new Date(row.pubDate) : undefined,
                source : row.source != null ? JSON.parse(row.source) : undefined,
                read : row.itemRead != null && row.itemRead === 'Y',
                _NS_DC : itemNamespaces.includes('dc') ? this.collectNamespace([row.itemId], 'dc')[0] : undefined,
                _NS_CONTENT : itemNamespaces.includes('content') ? this.collectNamespace([row.itemId], 'content')[0] : undefined
            }

            return feedItem;
        }
        catch(err) {
            general_logger.error(`[SQLiteArchiveService->getFeedItem] ${err.message}`);
        }

        return undefined;
    }

    getNextItemDate(feedId : string, dateToLookAfter : Date) : Date | undefined {
        const firstItemQry = `SELECT insertedAt FROM ${SQLiteDatabase.FEED_ITEMS_TABLE_NAME} WHERE feedId LIKE ? AND insertedAt < ? ORDER BY insertedAt DESC LIMIT 1`;
        const rows = SQLiteDatabase.getDatabaseInstance().prepare(firstItemQry).all([feedId, dateToLookAfter.toISOString()]);
        
        if (rows !== undefined && rows.length !== undefined && rows[0] !== undefined && rows[0].insertedAt !== undefined) return new Date(rows[0].insertedAt);
        
        return undefined;        
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
        
        const placeHolder = feedItems.map(fi => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?, ?, ?)').join(',');
        const addFeedItemsQry = `INSERT INTO ${SQLiteDatabase.FEED_ITEMS_TABLE_NAME} VALUES ${placeHolder}`;
        
        try {
            SQLiteDatabase.getDatabaseInstance().prepare(addFeedItemsQry).run(tableValues);

            //Namespace dc archive insert.
            feedItems.filter(fi => fi._NS_DC !== undefined).forEach(fi => {
                const qryColumns = ['itemId'];
                const qryValues = [fi.itemId];

                // Get all defined dc columns from the object.
                const definedKeys = Object.keys(fi._NS_DC).filter(k => fi._NS_DC[k] !== undefined);
                
                // If no keys presented then we dont need to add anyting... should we?
                if (definedKeys.length === 0) return true;

                definedKeys.forEach(k => {
                    qryColumns.push(k);
                    qryValues.push(fi._NS_DC[k]);
                });
                
                const nsDcQry = `INSERT INTO ${SQLiteDatabase.NS_DC_TABLE_NAME} (${qryColumns.join(', ')}) VALUES (${qryValues.map(v => `'${v}'`).join(', ')})`;
                SQLiteDatabase.getDatabaseInstance().prepare(nsDcQry).run();
            });

            //Namespace content archive insert.
            feedItems.filter(fi => fi._NS_CONTENT !== undefined).forEach(fi => {
                const nsContentQry = `INSERT INTO ${SQLiteDatabase.NS_CONTENT_TABLE_NAME} VALUES (?, ?);`;
                if (fi._NS_CONTENT.encoded !== undefined)
                    SQLiteDatabase.getDatabaseInstance().prepare(nsContentQry).run(fi.itemId, fi._NS_CONTENT.encoded);
            });

            return true;
        }
        catch(err) {
            general_logger.error(`[SQLiteArchiveService->addFeedItems] ${err.message}`);
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

    getUnreadFeedItemCount(): FeedItemCountStatistics[] {

        const feedItemQry = `SELECT feedId, count(*) AS itemCount FROM feedItems WHERE itemRead LIKE 'N' GROUP BY feedId`;
        
        try {
            const rows = SQLiteDatabase.getDatabaseInstance().prepare(feedItemQry).all();
            const feedItemCountStatistics = rows.map(row => {
                const fics : FeedItemCountStatistics = {
                    feedId : row.feedId,
                    itemCount : row.itemCount
                };

                return fics;
            });

            return feedItemCountStatistics;
        }
        catch(err) {
            general_logger.error(`[SQLiteArchiveService->getUnreadFeedItemCount] ${err.message}`);
        }
        
        return [];
    }

    setFeedItemRead(itemRead: boolean, itemId: string): void {
        const qry = `UPDATE ${SQLiteDatabase.FEED_ITEMS_TABLE_NAME} SET itemRead = ? WHERE itemId LIKE ?`;
        SQLiteDatabase.getDatabaseInstance().prepare(qry).run([itemRead ? 'Y' : 'N', itemId]);
    }

    setFeedItemsRead(itemRead: boolean, itemIds: string[]): void {
        const sqlInCondition = itemIds.map(id => `'${id}'`).join(', ')
        const qry = `UPDATE ${SQLiteDatabase.FEED_ITEMS_TABLE_NAME} SET itemRead = ? WHERE itemId IN (${sqlInCondition});`;
        SQLiteDatabase.getDatabaseInstance().prepare(qry).run([itemRead ? 'Y' : 'N']);
    }

}