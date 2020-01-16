import { Feed } from "../rss/specifications/RSS20";

export interface FeedArchiveService {
    getFeed(feedId : string): Feed | undefined,
    addFeed(feed : Feed, feedId : string) : boolean,
    updateFeed(feedId : string, feed : Feed) : boolean,
    deleteFeed(feedId : string) : boolean,
}

export class InvalidFeedIdError extends Error {
    constructor(message : string) {
        super(message);
    }
}