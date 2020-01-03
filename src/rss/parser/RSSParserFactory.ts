import { RSSParser, RSSParserError } from "./RSSParser";
import { RSSValidator } from "./validators/Validator";
import RSS20Validator from "./validators/RSS20Validator";
import { RSSVersion } from "../specifications/RSSVersion";
import RSS20Parser from "./RSS20Parser";
import { parseStringPromise, OptionsV2 } from "xml2js";

export default class RSSParserFactory {

    private constructor() {}
    private static readonly rssValidators : RSSValidator[] = [
        new RSS20Validator()
    ];
    private static readonly parsers : Map<RSSVersion, RSSParser<any>> = new Map([
        [RSSVersion.RSS_20, new RSS20Parser()]
    ]);

    private static readonly xml2jsProps : OptionsV2 = {
        cdata : true,
        explicitArray : false
    };

    private static isRSSParser(parser : RSSParser<any> | undefined) : parser is RSSParser<any> {
        return parser !== undefined;
    }
    
    static generateRSSParser(rssObject : any) : RSSParser<any> {
           
        for (const validator of this.rssValidators) {
            try {
                const rssVersion = validator.validate(rssObject);
                const rssParser = this.parsers.get(rssVersion);

                if (this.isRSSParser(rssParser))
                    return rssParser;
            }
            catch (err) {
                //TODO: Log this on console in dev mode.
            }
            
        }

        throw new RSSParserError('Given RSS source is not a RSS specification defined in Nelly.');
    }

}