/**
 * The interface that express the RSS parsers of Nelly.
 * The classes that implements this interface are responsible of parsing the XML RSS feeds.
 * Throw errors in the case of failure of RSS feed.
 */
export interface RSSParser<T> {
    parseRSS(rssObject : any) : T
}

export class RSSParserError extends Error {}