import { FeedConfig } from "../config/FeedConfigManager";
import request from "request";
import RSSParserFactory from "../rss/parser/RSSParserFactory";
import { parseString, OptionsV2 } from "xml2js";
import { Feed } from "../rss/specifications/RSS20";
import logger from "../utils/Logger";
import { FeedArchiveService } from "../archive/FeedArchiveService";
import SQLiteFeedArchiveService from "../archive/SQLiteFeedArchiveService";
import { FeedItemArchiveService } from "../archive/FeedItemArchiveService";
import SQLiteFeedItemArchiveService from "../archive/SQLiteFeedItemArchiveService";

const xmlParseOptions : OptionsV2 = {
    cdata : true,
    explicitArray : false
};

const feedArchiveService : FeedArchiveService = new SQLiteFeedArchiveService();
const feedItemArchiveService : FeedItemArchiveService = new SQLiteFeedItemArchiveService();

/**
 * The method that adds a new feed into the archive.
 * @param feed The feed that needs to be added to the archive.
 * @param feedId The id of the feed.
 */
function prepareNewFeed(feed : Feed, feedId : string) {
    try {
        const feedAdded = feedArchiveService.addFeed(feed, feedId);
        
        if (!feedAdded) {
            const message = `Unable to add the feed into the archive. Feed Info: ${JSON.stringify(feed)}`;
            logger.error(`[CollectFeed->prepareNewFeed] ${message}`);
            throw new FeedFetchError(message);
        }

        const feedItemsAdded = feedItemArchiveService.addFeedItems(feed.items, feedId);

        if (!feedItemsAdded) {
            const message = ``;
            logger.error(`[CollectFeed->prepareNewFeed] Unable to add feed items into the archive.`);
            throw new FeedFetchError(message);
        }
        //TODO: Send new feed items and feed info to the UI using Socket.IO
    }
    catch (err) {
        logger.error(`[CollectFeed->prepareNewFeed] ${err.message}`);
        throw err;
    }
}

/**
 * The method that updates the given feed according to the newly received data.
 * @param feed The feed that needs to be updated.
 * @param feedId The id of the feed.
 */
function updateExistingFeed(feed : Feed, feedId : string) {
    const feedUpdated = feedArchiveService.updateFeed(feedId, feed);

    if (feedUpdated) {
        const existingFeedItemsOfFeed = feedItemArchiveService.getFeedItemIds(feedId);
        const itemsToBeAddedToArchive = feed.items.filter(i => !existingFeedItemsOfFeed.includes(i.itemId));
        
        if (itemsToBeAddedToArchive.length > 0) {
            const feedItemsAdded = feedItemArchiveService.addFeedItems(itemsToBeAddedToArchive, feedId);
            
            if (!feedItemsAdded) {
                const message = `Unable to add feed items.`;
                logger.error(`[CollectFeed->updateExistingFeed] ${message}`);
                throw new FeedFetchError(message);
            }
            /*else {
                //TODO: Add socket io message sender to UI for the new fresh feed data and feed items.
            }*/
        }
        
    }
}
/**
 * The method that returns a Promise with a value of parsed feed read from given URL in the feed configuration. 
 * If any case of failure happens during collecting of feeds (such as no internet connection, parsing problems etc.) it will reject with a specific error.
 * @param feedConfig The configuration object of a specific feed defined in the system. The URL should be valid url.
 */
export function collectFeed(feedConfig : FeedConfig) : Promise<Feed> {
    const feedCollectorPromise = new Promise<Feed>((resolve, reject) => {
        logger.info(`Started Collecting feeds from the feed "${feedConfig.name}"`);
        request(feedConfig.url, function(error, response, body) {

            if (error) {
                if (error.code === 'ENOTFOUND') {
                    logger.error(`[CollectFeed] Unable to fetch the feed. (${feedConfig.url}) Please check that the feed url is valid or an internet connection is available.`);
                    reject(new FeedFetchError(`Unable to fetch the feed. (${feedConfig.url}) Please check that the feed url is valid or an internet connection is available.`));
                }
                else {
                    logger.error(`[CollectFeed] ${error.message} :: Feed URL: ${feedConfig.url}`);
                    reject(error);
                }

                return;
            }
            //Parse XML to JavaScript object.
            parseString(body, xmlParseOptions, (err, rssObject) => {
                if (err) {
                    logger.error(`[CollectFeed->ParsingXML] ${err.message}`);
                    reject(err);
                    return;
                }

                try {
                    const feed = RSSParserFactory.generateRSSParser(rssObject).parseRSS(rssObject);
                    const feedInDb = feedArchiveService.getFeed(feedConfig.feedConfigId);
                    
                    if (feedInDb === undefined) 
                        prepareNewFeed(feed, feedConfig.feedConfigId);
                    else 
                        updateExistingFeed(feed, feedConfig.feedConfigId);

                    logger.info(`Collecting feeds from the feed "${feedConfig.name}" has completed.`);
                    resolve(feed);
                }
                catch (err) {
                    logger.error(`[CollectFeed] ${err.message}`);
                    reject(err);
                }
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