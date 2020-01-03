/**
 * The metedata interface that contains information regarding the RSS feed.
 * Usually this information is collected from the channel tag of the RSS feed.
 */
export interface FeedMetadata {
    title : string,
    link : string,
    description : string,
    language? : string,
    copyright? : string,
    managingEditor? : string,
    webMaster? : string,
    pubDate? : Date,
    lastBuildDate? : Date,
    category? : string[],
    generator? : string,
    docs? : string,
    cloud? : string,
    ttl? : number,
    image? : string,
    rating? : string,
    textInput? : string,
    skipHours? : number,
    skipDays? : number
}

/**
 * A specific item of the feed. Tends for <item> tags in the RSS feed.
 * An itemId is the id that will be represeting the specific feed item of the RSS feed item.
 * The id will be used to identify whether the feed item is a read item already.
 */
export interface FeedItem {
    itemId : string,
    title : string,
    description : string
}

/**
 * The interface that covers the whole RSS feed read from the server.
 */
export interface Feed {
    feedId : string,
    feedMetadata : FeedMetadata,
    items : FeedItem[]
}