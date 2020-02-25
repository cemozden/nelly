import { RSSParser, RSSParserError } from "./RSSParser";
import { RSSValidator } from "./validators/Validator";
import RSS20Validator from "./validators/RSS20Validator";
import { RSSVersion } from "../specifications/RSSVersion";
import RSS20Parser from "./RSS20Parser";
import logger from "../../utils/Logger";
import { Feed } from "../specifications/RSS20";

export default class RSSParserFactory {

    private static readonly LOG_LABEL : string = 'RSSParserFactory'; 

    private constructor() {}
    private static readonly rssValidators : RSSValidator[] = [
        new RSS20Validator()
    ];
    private static readonly parsers : Map<RSSVersion, RSSParser<any>> = new Map([
        [RSSVersion.RSS_20, new RSS20Parser()]
    ]);

    private static isRSSParser(parser : RSSParser<Feed> | undefined) : parser is RSSParser<any> {
        return parser !== undefined;
    }
    
    static generateRSSParser(rssObject : any) : RSSParser<Feed> {
           
        for (const validator of this.rssValidators) {
            try {
                const rssVersion = validator.validate(rssObject);
                const rssParser = this.parsers.get(rssVersion);

                if (this.isRSSParser(rssParser))
                    return rssParser;
            }
            catch (err) {
                logger.error(`[${this.LOG_LABEL}] ${err.message}`);
            }
            
        }

        throw new RSSParserError('Given RSS source is not a RSS specification defined in Nelly.');
    }

}