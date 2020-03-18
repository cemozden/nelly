"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var crc_1 = require("crc");
var RSSVersion_1 = require("../specifications/RSSVersion");
/**
 * The RSS parser class that parses RSS feeds that is designed according to RSS 2.0 Specification.
 * @author cemozden
 * @see RSSParser
 */
var RSS20Parser = /** @class */ (function () {
    function RSS20Parser() {
    }
    RSS20Parser.prototype.parseFeedMedata = function (channel) {
        function getCategories(category) {
            if (category === undefined)
                return [];
            if (Array.isArray(category))
                return category;
            else
                return new Array(1).fill(category);
        }
        var feedMetadata = {
            title: channel.title,
            link: channel.link,
            description: channel.description,
            language: channel.language,
            copyright: channel.copyright,
            managingEditor: channel.managingEditor,
            webMaster: channel.webMaster,
            pubDate: typeof channel.pubDate === 'string' ? new Date(channel.pubDate) : undefined,
            lastBuildDate: typeof channel.lastBuildDate === 'string' ? new Date(channel.lastBuildDate) : undefined,
            category: getCategories(channel.category),
            generator: channel.generator,
            docs: channel.docs,
            cloud: channel.cloud !== undefined && channel.cloud.$ !== undefined ? {
                domain: channel.cloud.$.domain,
                path: channel.cloud.$.path,
                port: channel.cloud.$.port,
                protocol: channel.cloud.$.protocol,
                registerProcedure: channel.cloud.$.registerProcedure
            } : undefined,
            ttl: channel.ttl,
            rating: channel.rating,
            skipDays: channel.skipDays,
            skipHours: channel.skipHours,
            image: channel.image !== undefined ? {
                link: channel.image.link,
                title: channel.image.title,
                url: channel.image.url,
                width: channel.image.width,
                height: channel.image.height
            } : undefined,
            textInput: channel.textInput !== undefined ? {
                description: channel.textInput.description,
                link: channel.textInput.link,
                name: channel.textInput.name,
                title: channel.textInput.title
            } : undefined
        };
        return feedMetadata;
    };
    RSS20Parser.prototype.parseFeedItems = function (items) {
        var feedItems = [];
        function getFeedCategories(category) {
            if (category === undefined)
                return [];
            if (Array.isArray(category))
                return category;
            else
                return new Array(1).fill(category);
        }
        function parseItem(item) {
            var itemId = item.guid !== undefined
                ? crc_1.crc32(item.guid._).toString(16)
                : crc_1.crc32(item.title + item.description).toString(16);
            var feedItem = {
                itemId: itemId,
                title: item.title,
                description: item.description,
                link: item.link,
                author: item.author,
                comments: item.comments,
                pubDate: typeof item.pubDate === 'string' ? new Date(item.pubDate) : undefined,
                category: getFeedCategories(item.category),
                enclosure: item.enclosure !== undefined && item.enclosure.$ !== undefined ? {
                    url: item.enclosure.$.url,
                    length: item.enclosure.$.length,
                    type: item.enclosure.$.type
                } : undefined,
                guid: item.guid !== undefined ? {
                    value: item.guid._,
                    permaLink: item.guid.$.isPermaLink === 'true'
                } : undefined,
                source: item.source !== undefined ? {
                    url: item.source.$.url,
                    value: item.source._
                } : undefined
            };
            return feedItem;
        }
        if (items === undefined)
            return feedItems;
        else if (Array.isArray(items))
            return items.map(function (item) { return parseItem(item); });
        else
            feedItems.push(parseItem(items));
        return feedItems;
    };
    RSS20Parser.prototype.parseRSS = function (rssObject) {
        rssObject = rssObject.rss;
        var feed = {
            version: RSSVersion_1.RSSVersion.RSS_20,
            feedMetadata: this.parseFeedMedata(rssObject.channel),
            items: this.parseFeedItems(rssObject.channel.item)
        };
        return feed;
    };
    return RSS20Parser;
}());
exports.default = RSS20Parser;
//# sourceMappingURL=RSS20Parser.js.map