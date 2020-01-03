import { RSSParser } from "./RSSParser";
import { Feed } from "../specifications/RSS20";

export default class RSS20Parser implements RSSParser<Feed> {
    
    parseRSS(rssString: string): Promise<Feed> {
        throw new Error('Not implemented yet!');
    }
    
}