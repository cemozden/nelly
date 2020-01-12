import { FeedConfig } from "../config/FeedConfigManager";
import request from "request";
import RSSParserFactory from "../rss/parser/RSSParserFactory";
import { parseString, OptionsV2 } from "xml2js";
import { Feed } from "../rss/specifications/RSS20";
import logger from "../utils/Logger";

const xmlParseOptions : OptionsV2 = {
    cdata : true,
    explicitArray : false
};

export function collectFeed(feedConfig : FeedConfig) : Promise<Feed> {
    const feedCollectorPromise = new Promise<Feed>((resolve, reject) => {
        logger.verbose(`Collecting feeds from the feed "${feedConfig.name}"`);
        request(feedConfig.url, function(error, response, body) {

            if (error) {
                if (error.code === 'ENOTFOUND') {
                    //TODO: Send a message through socket.io to the UI regarding no internet connection.
                    
                    logger.error(`[CollectFeed] Unable to fetch the feed. (${feedConfig.url}) Please check that the feed url is valid or an internet connection is available.`);
                    reject(new FeedFetchError(`Unable to fetch the feed. (${feedConfig.url}) Please check that the feed url is valid or an internet connection is available.`));
                }
                else {
                    logger.error(`[CollectFeed] ${error.message} :: Feed URL: ${feedConfig.url}`);
                    reject(error);
                }

                return;
            }
           
            parseString(body, xmlParseOptions, (err, rssObject) => {
                if (err) {
                    logger.error(`[CollectFeed] [ParsingXML] ${err.message}`);
                    reject(err);
                    return;
                }

                const feed = RSSParserFactory.generateRSSParser(rssObject).parseRSS(rssObject);

                //TODO: Add archive check to add new rss feeds into the database.
                resolve(feed);
            });
        
        });
    });

    return feedCollectorPromise;
}

export class FeedFetchError extends Error {
    constructor(message : string) {
        super(message);
    }
}