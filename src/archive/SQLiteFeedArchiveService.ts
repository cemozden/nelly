import { FeedArchiveService, InvalidFeedIdError } from "./FeedArchiveService";
import { Feed, FeedItem } from "../rss/specifications/RSS20";
import SQLiteDatabase from "../db/SQLiteDatabase";
import general_logger from "../utils/Logger";

/**
 * The archive service implemention that manages archive using SQLite database for feeds.
 * 
 * @author cemozden
 * @see FeedArchiveService
 */
export default class SQLiteFeedArchiveService implements FeedArchiveService {
    
    private readonly feedIdColumn = 'feedId';

    /**
     * The method that adds the given feed into the archive.
     * The second parameter "feedId" must be the id given to the configuration of the feed. @see FeedConfig
     * @param feed The feed that will be added.
     * @param feedId The feed id that will be the id of the feed.
     * @throws InvalidFeedIdError if the given feed id is already existing in the database.
     */
    addFeed(feed: Feed, feedId : string): boolean {

        // Check whether feedId is existing
        const feedQryCheckQry = `SELECT feedId FROM ${SQLiteDatabase.FEEDS_TABLE_NAME} WHERE feedId LIKE ?`;
        const feedQryCheckResult = SQLiteDatabase.getDatabaseInstance().prepare(feedQryCheckQry).all(feedId);

        if (feedQryCheckResult.length > 0)
            throw new InvalidFeedIdError(`Given feed id "${feedId} is already existing in the archive!"`);

        const tableData = [
            feedId,
            feed.version,
            feed.feedMetadata.title,
            feed.feedMetadata.link,
            feed.feedMetadata.description,
            feed.feedMetadata.image !== undefined  && feed.feedMetadata.image.url !== undefined ? feed.feedMetadata.image.url : null,
            feed.feedMetadata.image !== undefined  && feed.feedMetadata.image.link !== undefined ? feed.feedMetadata.image.link : null,
            feed.feedMetadata.image !== undefined  && feed.feedMetadata.image.title !== undefined ? feed.feedMetadata.image.title : null,
            feed.insertedAt.toISOString()
        ];
        
        // Create placeholders according to the size of tableData
        const placeHolder = tableData.map(td => '?').join(',');
        const addFeedQry = `INSERT INTO ${SQLiteDatabase.FEEDS_TABLE_NAME} VALUES (${placeHolder})`;

        try {
            SQLiteDatabase.getDatabaseInstance().prepare(addFeedQry).run(tableData);
            return true;
        }
        catch(err) {
            general_logger.error(`[SQLiteArchiveService->addFeed] ${err.message}`);
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
            const sqlFeed = SQLiteDatabase.getDatabaseInstance().prepare(`SELECT feedId, version, title, link, description, imageURL, imageLink, imageTitle, insertedAt FROM ${SQLiteDatabase.FEEDS_TABLE_NAME} WHERE ${this.feedIdColumn} LIKE ?`).get(feedId);
            
            if (sqlFeed === undefined) return undefined;
            
            sqlFeed.version = parseInt(sqlFeed.version);
            
            const feed : Feed = {
                insertedAt : new Date(sqlFeed.insertedAt),
                feedMetadata : {
                    title : sqlFeed.title,
                    description : sqlFeed.description,
                    link : sqlFeed.link,
                    image: {
                        link : sqlFeed.imageLink,
                        title : sqlFeed.imageTitle,
                        url : sqlFeed.imageURL,
                    }
                },
                items : [],
                version : sqlFeed.version
            };

            return feed;
        }
        catch(err) {
            general_logger.error(`[SQLiteArchiveService->getFeed] ${err.message}`);
            return undefined;
        }
        
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

        const feedTableValues : any = {
            feedId : feedId,
            version : feed.version,
            title : feed.feedMetadata.title,
            link : feed.feedMetadata.link,
            imageURL : feed.feedMetadata.image !== undefined  && feed.feedMetadata.image.url !== undefined ? feed.feedMetadata.image.url : null,
            imageLink : feed.feedMetadata.image !== undefined  && feed.feedMetadata.image.link !== undefined ? feed.feedMetadata.image.link : null,
            imageTitle : feed.feedMetadata.image !== undefined  && feed.feedMetadata.image.title !== undefined ? feed.feedMetadata.image.title : null,
            description : feed.feedMetadata.description
        };

        const sqlNewValuesStr = Object.keys(feedTableValues)
            .map(k => `${k} = ?`).join(', ');

        let updateQry = `UPDATE ${SQLiteDatabase.FEEDS_TABLE_NAME} SET ${sqlNewValuesStr} WHERE ${this.feedIdColumn} LIKE ?`;
        const qryParams = Object.values(feedTableValues);
        // Push feedId for WHERE condition
        qryParams.push(feedId);

        const numberOfChanges = SQLiteDatabase.getDatabaseInstance().prepare(updateQry).run(qryParams).changes;
        return numberOfChanges === 1;
    }

    /**
     * The method that deletes a specific feed according to the given parameter.
     * 
     * @param feedId The id of the feed which needs to be deleted.
     */
    deleteFeed(feedId: string): boolean {
        
        try {
            const qryResult = SQLiteDatabase.getDatabaseInstance().prepare(`DELETE FROM ${SQLiteDatabase.FEEDS_TABLE_NAME} WHERE ${this.feedIdColumn} LIKE ?`).run(feedId);
            return qryResult.changes > 0;
        }
        catch (err) {
            general_logger.error(`[SQLiteArchiveService->deleteFeed] ${err.message}`);   
        }

        return false;
    }
}