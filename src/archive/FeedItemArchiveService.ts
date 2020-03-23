import { FeedItem } from "../rss/specifications/RSS20";
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
    getFeedItems(feedId : string, startDate : Date, endDate : Date, allItems : boolean) : FeedItem[],
    getLimitedFeedItems(feedId : string, itemLimit : number) : FeedItem[],
    addFeedItems(feedItems : FeedItem[], feedId : string) : boolean,
    deleteFeedItems(itemIds : string[])  : number,
    /**
     * The method that cleans the feed items according to the given duration
     * It's used to clean the feed items in the archive that their insert date is before than given duration. 
     * @returns number of deleted feed items.
     */
    cleanFeedItems(duration : Duration) : number,

    /**
     * The method that retrieves the number of unread messages per feed.
     */
    getUnreadFeedItemCount() : FeedItemCountStatistics[] 

}

export interface FeedItemCountStatistics {
    feedId : string,
    itemCount : number
}

export class InvalidFeedItemIdError extends Error {}