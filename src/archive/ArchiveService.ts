import { FeedItem, Feed } from "../rss/specifications/RSS20";

/**
 * The Service interface that manages operations related SQLite database tables.
 * Since database is being used as the archive of the application. The classes that implements this interface,
 * will be responsible of managing the archive as well.
 * 
 * @author cemozden
 */
export interface ArchiveService {

    getFeedItemIds(feedId : string) : Promise<string[]>,
    
    getFeed(feedId : string): Feed | null,
    addFeed(feed : Feed, feedId : string) : Promise<boolean>,
    updateFeed(feedId : string, feed : Feed) : Promise<boolean>,
    deleteFeed(feedId : string) : Promise<boolean>,

    addFeedItems(feedItems : FeedItem[], feedId : string) : Promise<boolean>;
    deleteFeedItems(itemIds : string[])  : Promise<boolean>
}