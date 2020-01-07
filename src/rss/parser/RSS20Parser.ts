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
            language : typeof channel.language === 'string' ? channel.language : undefined,
            copyright : typeof channel.copyright === 'string' ? channel.copyright : undefined,
            managingEditor : typeof channel.managingEditor === 'string' ? channel.managingEditor : undefined,
            webMaster : typeof channel.webMaster === 'string' ? channel.webMaster : undefined,
            pubDate : typeof channel.pubDate === 'string' ? new Date(channel.pubDate) : undefined,
            lastBuildDate : typeof channel.lastBuildDate === 'string' ? new Date(channel.lastBuildDate) : undefined,
            category : getCategories(channel.category),
            generator : typeof channel.generator === 'string' ? channel.generator : undefined,
            docs : typeof channel.docs === 'string' ? channel.docs : undefined,
            cloud : channel.cloud !== undefined && channel.cloud.$ !== undefined ? {
                domain : channel.cloud.$.domain,
                path : channel.cloud.$.path,
                port : channel.cloud.$.port,
                protocol : channel.cloud.$.protocol,
                registerProcedure : channel.cloud.$.registerProcedure
            } : undefined,
            ttl : channel.ttl !== undefined ? channel.ttl : undefined,
            rating : typeof channel.rating === 'string' ? channel.rating : undefined,
            skipDays : channel.skipDays !== undefined ? channel.skipDays : undefined,
            skipHours : channel.skipHours !== undefined ? channel.skipHours : undefined,
            image : channel.image !== undefined ? {
                link : channel.image.link,
                title : channel.image.title,
                url : channel.image.url,
                width : channel.image.width !== undefined ? channel.image.width : undefined,
                height : channel.image.height !== undefined ? channel.image.height : undefined
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