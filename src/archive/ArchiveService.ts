import { FeedItem, Feed } from "../rss/specifications/RSS20";

/**
 * The Service interface that manages operations related SQLite database tables.
 * Since database is being used as the archive of the application. The classes that implements this interface,
 * will be responsible of managing the archive as well.
 * 
 * @author cemozden
 */
export interface ArchiveService {

    getFeedItemIds(feedId : string) : string[],
    
    getFeed(feedId : string): Feed | undefined,
    addFeed(feed : Feed, feedId : string) : boolean,
    updateFeed(feedId : string, feed : Feed) : boolean,
    deleteFeed(feedId : string) : boolean,

    addFeedItems(feedItems : FeedItem[], feedId : string) : boolean;
    deleteFeedItems(itemIds : string[])  : boolean
}

export class InvalidFeedIdError extends Error {
    constructor(message : string) {
        super(message);
    }
}