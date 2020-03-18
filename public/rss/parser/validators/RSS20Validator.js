"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Validator_1 = require("./Validator");
var RSSVersion_1 = require("../../specifications/RSSVersion");
/**
 * The class that validates xml objects according to RSS 2.0 specification.
 * @author cemozden
 * @see RSSValidator
 */
var RSS20Validator = /** @class */ (function () {
    function RSS20Validator() {
    }
    /** @throws RSSValidationError */
    RSS20Validator.prototype.validate = function (obj) {
        if (obj.rss === undefined)
            throw new Validator_1.RSSValidationError('The RSS tag (<rss>) is not existing in the XML document!');
        if (obj.rss.$ === undefined || obj.rss.$.version === undefined || obj.rss.$.version !== '2.0')
            throw new Validator_1.RSSValidationError('The version attribute of rss tag is missing!');
        if (obj.rss.channel === undefined)
            throw new Validator_1.RSSValidationError('Channel tag <channel> does not exist between <rss> tags!');
        if (obj.rss.channel.title === undefined)
            throw new Validator_1.RSSValidationError('Title tag <title> does not exist between <channel> tags!');
        if (obj.rss.channel.link === undefined)
            throw new Validator_1.RSSValidationError('Link tag <link> does not exist between <channel> tags!');
        if (obj.rss.channel.description === undefined)
            throw new Validator_1.RSSValidationError('Description tag <description> does not exist between <channel> tags!');
        // If there is a item tag, make sure the item tag contains either title or description tag.
        if (obj.rss.channel.item !== undefined) {
            if (Array.isArray(obj.rss.channel.item)) {
                obj.rss.channel.item.forEach(function (item, index) {
                    if (item.title === undefined && item.description === undefined)
                        throw new Validator_1.RSSValidationError("Neither title nor description tags exist in one of the item list. Item Index: " + index);
                });
            }
            else if (obj.rss.channel.item.title === undefined && obj.rss.channel.item.description === undefined)
                throw new Validator_1.RSSValidationError('The item tag must have either title or description tag!');
        }
        return RSSVersion_1.RSSVersion.RSS_20;
    };
    return RSS20Validator;
}());
exports.default = RSS20Validator;
//# sourceMappingURL=RSS20Validator.js.map