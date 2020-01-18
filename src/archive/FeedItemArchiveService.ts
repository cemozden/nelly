import { FeedItem, Feed } from "../rss/specifications/RSS20";
import Duration from "../time/Duration";

/**
 * The Service interface that manages operations related SQLite database tables.
 * Since database is being used as the archive of the application. The classes that implements this interface,
 * will be responsible of managing the archive as well.
 * 
 * @author cemozden
 */
export interface FeedItemArchiveService {

    getFeedItemIds(feedId : string) : string[],
    addFeedItems(feedItems : FeedItem[], feedId : string) : boolean;
    deleteFeedItems(itemIds : string[])  : number,
    /**
     * The method that cleans the feed items according to the given duration
     * It's used to clean the feed items in the archive that their insert date is before than given duration. 
     * @returns number of deleted feed items.
     */
    cleanFeedItems(duration : Duration) : number
}

export class InvalidFeedItemIdError extends Error {
    constructor(message : string) {
        super(message);
    }
}