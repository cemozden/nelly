import { RSSParser } from "./RSSParser";
import { Feed, FeedMetadata, FeedItem } from "../specifications/RSS20";
import { crc32 } from "crc";

/**
 * The RSS parser class that parses RSS feeds that is designed according to RSS 2.0 Specification.
 * @author cemozden
 * @see RSSParser
 */
export default class RSS20Parser implements RSSParser<Feed> {
    
    private parseFeedMedata(channel : any) : FeedMetadata {

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

    private parseFeedItems(items : any) : FeedItem[] {
        const feedItems : FeedItem[] = [];

        function parseItem(item : any) : FeedItem {
            const feedItem : FeedItem = {
                itemId : crc32(item.title + item.description).toString(16),
                title : item.title,
                description : item.description
            };

            return feedItem;
        }

        if (items === undefined) 
            return feedItems;
        else if (Array.isArray(items)) 
            items.forEach(item => feedItems.push(parseItem(item)));
        else 
            feedItems.push(parseItem(items));
        
        return feedItems;
    }

    parseRSS(rssObject : any): Feed {
        rssObject = rssObject.rss;

        // Create feed id from 3 mandatory fields by concatenating them and generate crc32 result. 
        const feedId = crc32(rssObject.channel.title + rssObject.channel.link + rssObject.channel.description).toString(16);
        
        const feed : Feed = {
            feedId : feedId,
            feedMetadata : this.parseFeedMedata(rssObject.channel),
            items : this.parseFeedItems(rssObject.item)
        };

        return feed;
    }
    
}