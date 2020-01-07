import { RSSParser } from "./RSSParser";
import { Feed, FeedMetadata, FeedItem } from "../specifications/RSS20";
import { crc32 } from "crc";

export default class RSS20Parser implements RSSParser<Feed> {
    
    private parseFeedMedata(channel : any) : FeedMetadata {
        const feedMetadata : FeedMetadata = {
            title : channel.title,
            link : channel.link,
            description : channel.description
        };

        return feedMetadata;
    }

    private parseFeedItems(items : any) : FeedItem[] {
        const feedItems : FeedItem[] = [];

        return feedItems;
    }

    parseRSS(rssObject : any): Promise<Feed> {
        rssObject = rssObject.rss;

        const parseRSSPromise = new Promise<Feed>((resolve, reject) => {
            // Create feed id from 3 mandatory fields by concatenating them and generate crc32 result. 
            const feedId = crc32(rssObject.channel.title + rssObject.channel.link + rssObject.channel.description).toString(16);
            
            const feed : Feed = {
                feedId : feedId,
                feedMetadata : this.parseFeedMedata(rssObject.channel),
                items : this.parseFeedItems(rssObject.item)
            };

            resolve(feed);
        });

        return parseRSSPromise;
    }
    
}