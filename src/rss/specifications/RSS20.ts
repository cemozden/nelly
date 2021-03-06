import { RSSVersion } from "./RSSVersion";

export interface FeedMetadataCloud {
    domain : string,
    port : number,
    path : string,
    registerProcedure : string,
    protocol : string
}

export interface FeedMetadataImage {
    url : string,
    title : string,
    link : string,
    width? : number,
    height? : number
}

export interface FeedMetadataTextInput {
    title : string,
    description : string,
    name : string,
    link : string
}

export interface FeedItemEnclosure {
    url : string,
    length : number,
    type : string
}

export interface FeedItemGuid {
    value : string,
    permaLink? : boolean
}

export interface FeedItemSource {
    url : string,
    value : string
}

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
    cloud? : FeedMetadataCloud,
    ttl? : number,
    image? : FeedMetadataImage,
    rating? : string,
    textInput? : FeedMetadataTextInput,
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
    feedId? : string,
    title : string,
    description : string,
    link? : string,
    _NS_DC? : NAMESPACE_DC,
    _NS_CONTENT? : NAMESPACE_CONTENT,
    author? : string,
    category? : string[],
    comments? : string,
    pubDate : Date,
    enclosure? : FeedItemEnclosure,
    guid? : FeedItemGuid,
    source? : FeedItemSource,
    read : boolean
}

export interface NAMESPACE_DC {
	contributor? : string,
	coverage? : string,
	creator? : string,
	dcDate? : Date,
	description? : string,
	format? : string,
	identifier? : string,
	language? : string,
	publisher? : string,
	relation? : string,
	rights? : string,
	source? : string,
	subject? : string,
	title? : string,
	type? : string,
}

export interface NAMESPACE_CONTENT {
    encoded? : string
}

/**
 * The interface that covers the whole RSS feed read from the server.
 */
export interface Feed {
    version : RSSVersion,
    insertedAt : Date,
    namespaces : string[],
    feedMetadata : FeedMetadata,
    items : FeedItem[]
}