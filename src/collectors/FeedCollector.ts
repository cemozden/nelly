import { FeedConfig } from "../config/FeedConfigManager";
import request from "request";
import RSSParserFactory from "../rss/parser/RSSParserFactory";
import { parseString, OptionsV2 } from "xml2js";
import { Feed, FeedItem } from "../rss/specifications/RSS20";
import general_logger from "../utils/Logger";
import { FeedArchiveService } from "../archive/FeedArchiveService";
import SQLiteFeedArchiveService from "../archive/SQLiteFeedArchiveService";
import { FeedItemArchiveService } from "../archive/FeedItemArchiveService";
import SQLiteFeedItemArchiveService from "../archive/SQLiteFeedItemArchiveService";
import { Namespace } from "socket.io";

interface FeedUpdateMessage {
    feedId : string,
    feedName : string,
    items : FeedItem[]
}

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
function prepareNewFeed(feed : Feed, feedId : string, socketList : Namespace[]) {
    try {
        const feedAdded = feedArchiveService.addFeed(feed, feedId);
        
        if (!feedAdded) {
            const message = `Unable to add the feed into the archive. Feed Info: ${JSON.stringify(feed)}`;
            general_logger.error(`[CollectFeed->prepareNewFeed] ${message}`);
            throw new FeedFetchError(message);
        }

        const feedItemsAdded = feedItemArchiveService.addFeedItems(feed.items, feedId);

        if (!feedItemsAdded) {
            const message = `[CollectFeed->prepareNewFeed] Unable to add feed items into the archive.`;
            general_logger.error(message);
            throw new FeedFetchError(message);
        }
        socketList.forEach(s => {
            const feedUpdateMessage : FeedUpdateMessage = {
                feedId,
                feedName : feed.feedMetadata.title,
                items: feed.items.sort((a, b) => a.pubDate.getTime() - b.pubDate.getTime()).reverse()
            };
            s.emit('feedUpdate', feedUpdateMessage);
        });

    }
    catch (err) {
        general_logger.error(`[CollectFeed->prepareNewFeed] ${err.message}`);
        throw err;
    }
}

/**
 * The method that updates the given feed according to the newly received data.
 * @param feed The feed that needs to be updated.
 * @param feedId The id of the feed.
 */
function updateExistingFeed(feed : Feed, feedId : string, socketList : Namespace[]) {
    const feedUpdated = feedArchiveService.updateFeed(feedId, feed);

    if (feedUpdated) {
        const existingFeedItemsOfFeed = feedItemArchiveService.getFeedItemIds(feedId);
        const itemsToBeAddedToArchive = feed.items.filter(i => !existingFeedItemsOfFeed.includes(i.itemId));
        
        if (itemsToBeAddedToArchive.length > 0) {
            const feedItemsAdded = feedItemArchiveService.addFeedItems(itemsToBeAddedToArchive, feedId);
            
            if (!feedItemsAdded) {
                const message = `Unable to add feed items.`;
                general_logger.error(`[CollectFeed->updateExistingFeed] ${message}`);
                throw new FeedFetchError(message);
            }
            else {
                socketList.forEach(s => {
                    const feedUpdateMessage : FeedUpdateMessage = {
                        feedId,
                        feedName : feed.feedMetadata.title,
                        items: itemsToBeAddedToArchive.sort((a, b) => a.pubDate.getTime() - b.pubDate.getTime()).reverse()
                    };
                    s.emit('feedUpdate', feedUpdateMessage);
                });
            }
        }
        
    }
}
/**
 * The method that returns a Promise with a value of parsed feed read from given URL in the feed configuration. 
 * If any case of failure happens during collecting of feeds (such as no internet connection, parsing problems etc.) it will reject with a specific error.
 * @param feedConfig The configuration object of a specific feed defined in the system. The URL should be valid url.
 */
export function collectFeed(feedConfig : FeedConfig, socketList : Namespace[]) : Promise<Feed> {
    const feedCollectorPromise = new Promise<Feed>((resolve, reject) => {
        general_logger.info(`Started Collecting feeds from the feed "${feedConfig.name}"`);
        request(feedConfig.url, function(error, response, body) {

            if (error) {
                if (error.code === 'ENOTFOUND') {
                    general_logger.error(`[CollectFeed] Unable to fetch the feed. (${feedConfig.url}) Please check that the feed url is valid or an internet connection is available.`);
                    reject(new FeedFetchError(`Unable to fetch the feed. (${feedConfig.url}) Please check that there is an stable internet connection available or the feed source URL "${feedConfig.url}" is valid.`));
                }
                else {
                    general_logger.error(`[CollectFeed] ${error.message} :: Feed URL: ${feedConfig.url}`);
                    reject(error);
                }

                return;
            }
            //Parse XML to JavaScript object.
            parseString(body, xmlParseOptions, (err, rssObject) => {
                if (err) {
                    general_logger.error(`[CollectFeed->ParsingXML] ${err.message}`);
                    reject(err);
                    return;
                }

                try {
                    const feed = RSSParserFactory.generateRSSParser(rssObject).parseRSS(rssObject);
                    const feedInDb = feedArchiveService.getFeed(feedConfig.feedConfigId);
                    
                    if (feedInDb === undefined) 
                        prepareNewFeed(feed, feedConfig.feedConfigId, socketList);
                    else 
                        updateExistingFeed(feed, feedConfig.feedConfigId, socketList);

                    general_logger.info(`Finished collecting feeds from the feed "${feedConfig.name}" successfully.`);
                    resolve(feed);
                }
                catch (err) {
                    general_logger.error(`[CollectFeed] ${err.message}`);
                    reject(err);
                }
            });
        
        });
    });

    return feedCollectorPromise;
}

export class FeedFetchError extends Error {}