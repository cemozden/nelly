import { RSSParser } from "./RSSParser";
import { Feed } from "../specifications/RSS20";

export default class RSS20Parser implements RSSParser<Feed> {
    
    parseRSS(rssString : any): Promise<Feed> {
        const parseRSSPromise = new Promise<Feed>((resolve, reject) => {
            resolve(null);
        });

        return parseRSSPromise;
    }
    
}