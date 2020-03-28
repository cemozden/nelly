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
    getFeedItems(feedId : string, startDate : Date, endDate : Date, allItems : boolean, numOfEntries : number) : FeedItem[],
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
    getUnreadFeedItemCount() : FeedItemCountStatistics[],

    /**
     * Returns the date of the next feed item after the given date parameter.
     * It yields undefined if there is no next item after the specific date.
     */
    getNextItemDate(feedId : string, dateToLookAfter : Date) : Date | undefined,

    /**
     * The method that retrieves a specific feed item from the archive by asking the id of it.
     * @param itemId The id of the specific item
     */
    getFeedItem(itemId : string) : FeedItem | undefined,

    /**
     * The method that sets a specific item
     * @param itemRread The boolean value sets the item to be read or notTrue is read False is not.
     */
    setFeedItemRead(itemRead : boolean, itemId : string) : void

    /**
     * The method that sets a specific item
     * @param itemRead The boolean value sets the item to be read or notTrue is read False is not.
     */
    setFeedItemsRead(itemRead : boolean, itemIds : string[]) : void

}

export interface FeedItemCountStatistics {
    feedId : string,
    itemCount : number
}

export class InvalidFeedItemIdError extends Error {}