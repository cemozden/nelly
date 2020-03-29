import { Feed } from "../rss/specifications/RSS20";

export interface FeedArchiveService {
    getFeed(feedId : string): Feed | undefined,
    addFeed(feed : Feed, feedId : string) : boolean,
    updateFeed(feedId : string, feed : Feed) : boolean,
    deleteFeed(feedId : string) : boolean,
    /**
     * The method that returns the namespaces of a specific feed.
     * @param feedId The id of the feed in which namespaces will be fetched.
     */
    getNamespaces(feedId : string) : string[]
}

export class InvalidFeedIdError extends Error {}