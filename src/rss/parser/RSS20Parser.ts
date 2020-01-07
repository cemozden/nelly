import { RSSParser } from "./RSSParser";
import { Feed, FeedMetadata } from "../specifications/RSS20";
import { crc32 } from "crc";

export default class RSS20Parser implements RSSParser<Feed> {
    
    private parseFeedMedata(rssObject : any) : FeedMetadata {
        const feedMetadata : FeedMetadata = {
            title : rssObject.channel.title,
            link : rssObject.channel.link,
            description : rssObject.channel.description
        };

        return feedMetadata;
    }

    parseRSS(rssObject : any): Promise<Feed> {
        rssObject = rssObject.rss;
        const parseRSSPromise = new Promise<Feed>((resolve, reject) => {
            const feedId = crc32(rssObject.channel.title + rssObject.channel.link + rssObject.channel.description).toString(16);
            
            const feed : Feed = {
                feedId : feedId,
                feedMetadata : this.parseFeedMedata(rssObject),
                items : []
            };

            resolve(feed);
        });

        return parseRSSPromise;
    }
    
}