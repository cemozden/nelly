import { RSSValidator, RSSValidationError } from "./Validator";
import { RSSVersion } from "../../specifications/RSSVersion";

/**
 * The class that validates xml objects according to RSS 2.0 specification.
 * @author cemozden
 * @see RSSValidator
 */
export default class RSS20Validator implements RSSValidator {
    /** @throws RSSValidationError */
    validate(obj: any): RSSVersion {
        if (obj.rss === undefined) 
            throw new RSSValidationError('The RSS tag (<rss>) is not existing in the XML document!');

        if(obj.rss.$ === undefined || obj.rss.$.version === undefined || obj.rss.$.version !== '2.0')
            throw new RSSValidationError('The version attribute of rss tag is missing!');

        if(obj.rss.channel === undefined)
            throw new RSSValidationError('Channel tag <channel> does not exist between <rss> tags!');

        if (obj.rss.channel.title === undefined)
            throw new RSSValidationError('Title tag <title> does not exist between <channel> tags!');
        
        if (obj.rss.channel.link === undefined)
            throw new RSSValidationError('Link tag <link> does not exist between <channel> tags!');
        
        if (obj.rss.channel.description === undefined)
            throw new RSSValidationError('Description tag <description> does not exist between <channel> tags!');

        // If there is a item tag, make sure the item tag contains either title or description tag.
        if (obj.rss.channel.item !== undefined) {
            if (Array.isArray(obj.rss.channel.item)) {
                obj.rss.channel.item.forEach((item : any, index : number) => {
                    if (item.title === undefined && item.description === undefined)
                        throw new RSSValidationError(`Neither title nor description tags exist in one of the item list. Item Index: ${index}`);
                });

            }
            else if (obj.rss.channel.item.title === undefined && obj.rss.channel.item.description === undefined)
                throw new RSSValidationError('The item tag must have either title or description tag!');
        }

        return RSSVersion.RSS_20;
    }
    
}