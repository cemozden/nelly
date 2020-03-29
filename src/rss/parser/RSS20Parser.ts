import { RSSParser } from "./RSSParser";
import { Feed, FeedMetadata, FeedItem } from "../specifications/RSS20";
import { crc32 } from "crc";
import { RSSVersion } from "../specifications/RSSVersion";

/**
 * The RSS parser class that parses RSS feeds that is designed according to RSS 2.0 Specification.
 * @author cemozden
 * @see RSSParser
 */
export default class RSS20Parser implements RSSParser<Feed> {
    
    private readonly AVAILABLE_NAMESPACES : Map<string, string> = new Map();

    constructor() {
        this.AVAILABLE_NAMESPACES.set('dc', 'http://purl.org/dc/elements/1.1/');
    }


    private parseFeedMedata(channel : any, namespaces : string[]) : FeedMetadata {

        function getCategories(category : any) : string[] {
            if (category === undefined) return [];

            if (Array.isArray(category)) return category;
            else return new Array(1).fill(category);
        }

        const feedMetadata : FeedMetadata = {
            title : channel.title,
            link : channel.link,
            description : channel.description,
            language : channel.language,
            copyright : channel.copyright,
            managingEditor : channel.managingEditor,
            webMaster : channel.webMaster,
            pubDate : typeof channel.pubDate === 'string' ? new Date(channel.pubDate) : undefined,
            lastBuildDate : typeof channel.lastBuildDate === 'string' ? new Date(channel.lastBuildDate) : undefined,
            category : getCategories(channel.category),
            generator : channel.generator,
            docs : channel.docs,
            cloud : channel.cloud !== undefined && channel.cloud.$ !== undefined ? {
                domain : channel.cloud.$.domain,
                path : channel.cloud.$.path,
                port : channel.cloud.$.port,
                protocol : channel.cloud.$.protocol,
                registerProcedure : channel.cloud.$.registerProcedure
            } : undefined,
            ttl : channel.ttl,
            rating : channel.rating,
            skipDays : channel.skipDays,
            skipHours : channel.skipHours,
            image : channel.image !== undefined ? {
                link : channel.image.link,
                title : channel.image.title,
                url : channel.image.url,
                width : channel.image.width,
                height : channel.image.height
            } : undefined,
            textInput : channel.textInput !== undefined ? {
                description : channel.textInput.description,
                link : channel.textInput.link,
                name : channel.textInput.name,
                title : channel.textInput.title
            } : undefined
        };

        return feedMetadata;
    }

    private parseFeedItems(items : any, namespaces : string[]) : FeedItem[] {
        const feedItems : FeedItem[] = [];

        function getFeedCategories(category : any) : string[] {
            if (category === undefined) return [];

            if (Array.isArray(category)) return category;
            else return new Array(1).fill(category);
        }

        function parseItem(item : any) : FeedItem {

            const itemId = item.guid !== undefined 
                ? crc32(item.guid._).toString(16) 
                : crc32(item.title + item.description).toString(16);

            const feedItem : FeedItem = {
                itemId : itemId,
                title : item.title,
                description : item.description,
                link : item.link,
                author : item.author,
                comments : item.comments,
                pubDate : typeof item.pubDate === 'string' ? new Date(item.pubDate) : new Date(),
                category : getFeedCategories(item.category),
                enclosure : item.enclosure !== undefined  && item.enclosure.$ !== undefined ? {
                    url : item.enclosure.$.url,
                    length : item.enclosure.$.length,
                    type : item.enclosure.$.type
                } : undefined,
                guid : item.guid !== undefined ? {
                    value : item.guid._,
                    permaLink : item.guid.$.isPermaLink === 'true'
                } : undefined,
                source : item.source !== undefined ? {
                    url : item.source.$.url,
                    value : item.source._
                } : undefined,
                read : false,
                _NS_DC : namespaces.includes('dc') ? {
                    contributor : item['dc:contributor'],
                    coverage : item['dc:coverage'],
                    creator : item['dc:creator'],
                    dcDate : item['dc:date'] !== undefined ? new Date(item['dc:date']) : undefined,
                    description : item['dc:description'],
                    format : item['dc:format'],
                    identifier : item['dc:identifier'],
                    language : item['dc:language'],
                    publisher : item['dc:publisher'],
                    relation : item['dc:relation'],
                    rights : item['dc:rights'],
                    source : item['dc:source'],
                    subject : item['dc:subject'],
                    title : item['dc:title'],
                    type : item['dc:type']
                } : undefined
            };

            return feedItem;
        }

        if (items === undefined) 
            return feedItems;
        else if (Array.isArray(items)) 
            return items.map(item => parseItem(item));
        else 
            feedItems.push(parseItem(items));
        
        return feedItems;
    }

    parseRSS(rssObject : any): Feed {
        rssObject = rssObject.rss;

        const feedNamespaces = Object.keys(rssObject.$)
            .filter(key => key.startsWith('xmlns:'))
            .map(ns => ns.substring(6, ns.length))
            .filter(ns => this.AVAILABLE_NAMESPACES.get(ns) !== undefined && rssObject.$[`xmlns:${ns}`] === this.AVAILABLE_NAMESPACES.get(ns));

        const feedMetadata = this.parseFeedMedata(rssObject.channel, feedNamespaces);

        const feed : Feed = {
            namespaces : feedNamespaces,
            insertedAt : new Date(),
            version : RSSVersion.RSS_20,
            feedMetadata,
            items : this.parseFeedItems(rssObject.channel.item, feedNamespaces)
        };

        return feed;
    }
    
}