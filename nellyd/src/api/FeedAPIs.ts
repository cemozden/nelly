import Express from "express";
import { ConfigManager } from "../config/ConfigManager";
import { FeedScheduler } from "../scheduler/FeedScheduler";
import logger from "../utils/Logger";
import Duration from "../time/Duration";
import { FeedConfig } from "../config/FeedConfigManager";
import { crc32 } from "crc";
import { FeedArchiveService } from "../archive/FeedArchiveService";
import SQLiteFeedArchiveService from "../archive/SQLiteFeedArchiveService";

export default function FeedAPI(express : Express.Application, configManager : ConfigManager, feedScheduler : FeedScheduler) {

    express.get('/getfeeds', (req, res) => {
        res.json(configManager.getFeedConfigManager().getFeedConfigs());
    });

    /**
     * 
     * Required Parameters
     * categoryId : string
     * name : string
     * url : string
     * fetchPeriod: object
     * iconUrl : string (optional)
     * enabled : boolean
     *  */ 
    express.get('/addfeed', async (req, res) => {
        const params = req.query;

        const categoryId = params.categoryId;
        const name = params.name;
        const url = params.url;
        const fetchPeriod : Duration = params.fetchPeriod !== undefined ? JSON.parse(params.fetchPeriod) : {};
        const enabled = params.enabled !== undefined && params.enabled === 'true';
        const iconURL = params.iconURL !== undefined ? params.iconURL : '';

        if (categoryId === undefined || categoryId.length === 0) {
            const errorMessage =  'Category id is not a valid id! Please provide a valid id to add a new feed.';
            
            res.status(400).json({ message : errorMessage });
            logger.error(`[AddFeed] ${errorMessage}, Request params: ${JSON.stringify(params)}`);
            
            return;
        }

        if (name === undefined || name.length === 0) {
            const errorMessage =  'Feed name is not valid! Please provide a valid name to add a new feed.';
            
            res.status(400).json({ message : errorMessage });
            logger.error(`[AddFeed] ${errorMessage}, Request params: ${JSON.stringify(params)}`);
            
            return;
        }

        if (url === undefined || url.length === 0) {
            const errorMessage =  'Feed URL is not valid! Please provide a valid URL to add a new feed.';
            
            res.status(400).json({ message : errorMessage });
            logger.error(`[AddFeed] ${errorMessage}, Request params: ${JSON.stringify(params)}`);
            
            return;
        }

        if (fetchPeriod === undefined || fetchPeriod.unit === undefined || fetchPeriod.value === undefined) {
            const errorMessage =  'Fetch period is not valid! Please provide a valid fetch period to add a new feed.';
            
            res.status(400).json({ message : errorMessage });
            logger.error(`[AddFeed] ${errorMessage}, Request params: ${JSON.stringify(params)}`);
            
            return;
        }

        const feedConfigManager = configManager.getFeedConfigManager();

        const feedConfig : FeedConfig = {
            categoryId : categoryId,
            enabled : enabled,
            feedConfigId : crc32(Math.random().toString(36).substring(2, 9)).toString(16),
            fetchPeriod : fetchPeriod,
            name : name,
            url : url,
            iconURL : iconURL
        };

        try {
            const feedConfigAdded = await feedConfigManager.addFeedConfig(feedConfig);

            if (feedConfigAdded) {
                logger.info(`[AddFeed] A new feed added! New Feed : ${JSON.stringify(feedConfig)}`);
                feedScheduler.addFeedToSchedule(feedConfig);
                res.json({ added : true, feedObject : feedConfig, feeds : feedConfigManager.getFeedConfigs() });
            }
            else {
                logger.error(`[AddFeed] An error occured while adding the feed! Request Params: ${JSON.stringify(params)}`);
                res.json({ added : false, errorMessage : 'An error occured while adding feed!'});
            }

        }
        catch(err) {
            logger.error(`[AddFeed] ${err.message}, Request Params: ${JSON.stringify(params)}`);
            res.status(500).json({message : err.message});
        }


    });


    /**
     * 
     * Required Parameters
     * feedId : string
     * categoryId : string
     * name : string
     * url : string
     * fetchPeriod: object
     * iconUrl : string (optional)
     * enabled : boolean
     *  */ 
    express.get('/updatefeed', async (req, res) => {
        const params = req.query;

        const feedId = params.feedId;
        const categoryId = params.categoryId;
        const name = params.name;
        const url = params.url;
        const fetchPeriod : Duration = params.fetchPeriod !== undefined ? JSON.parse(params.fetchPeriod) : {};
        const enabled = params.enabled !== undefined && params.enabled === 'true';
        const iconURL = params.iconURL !== undefined ? params.iconURL : '';

        if (feedId === undefined || feedId.length === 0) {
            const errorMessage =  'Feed id is not a valid id! Please provide a valid id to update a new feed.';
            
            res.status(400).json({ message : errorMessage });
            logger.error(`[UpdateFeed] ${errorMessage}, Request params: ${JSON.stringify(params)}`);
            
            return;
        }

        if (categoryId === undefined || categoryId.length === 0) {
            const errorMessage =  'Category id is not a valid id! Please provide a valid id to update a new feed.';
            
            res.status(400).json({ message : errorMessage });
            logger.error(`[UpdateFeed] ${errorMessage}, Request params: ${JSON.stringify(params)}`);
            
            return;
        }

        if (name === undefined || name.length === 0) {
            const errorMessage =  'Feed name is not valid! Please provide a valid name to update a new feed.';
            
            res.status(400).json({ message : errorMessage });
            logger.error(`[UpdateFeed] ${errorMessage}, Request params: ${JSON.stringify(params)}`);
            
            return;
        }

        if (url === undefined || url.length === 0) {
            const errorMessage =  'Feed URL is not valid! Please provide a valid URL to update a new feed.';
            
            res.status(400).json({ message : errorMessage });
            logger.error(`[UpdateFeed] ${errorMessage}, Request params: ${JSON.stringify(params)}`);
            
            return;
        }

        if (fetchPeriod === undefined || fetchPeriod.unit === undefined || fetchPeriod.value === undefined) {
            const errorMessage =  'Fetch period is not valid! Please provide a valid fetch period to update a new feed.';
            
            res.status(400).json({ message : errorMessage });
            logger.error(`[UpdateFeed] ${errorMessage}, Request params: ${JSON.stringify(params)}`);
            
            return;
        }

        const feedConfigManager = configManager.getFeedConfigManager();
        const oldFeed = feedConfigManager.getFeedConfig(feedId);

        const updatedFeed : FeedConfig = {
            categoryId : categoryId,
            enabled: enabled,
            feedConfigId : feedId,
            fetchPeriod : fetchPeriod,
            name : name,
            url : url,
            iconURL : iconURL
        };

        try {
            const feedConfigUpdated = await feedConfigManager.updateFeedConfig(feedId, updatedFeed);
            feedScheduler.deleteScheduledTask(feedId);

            if (feedConfigUpdated) {
                logger.info(`[UpdateFeed] A feed is successfully updated! Old Feed: ${JSON.stringify(oldFeed)},  Updated Feed : ${JSON.stringify(updatedFeed)}`);
                feedScheduler.addFeedToSchedule(updatedFeed);
                res.json({ updated : true, updatedFeedObject : updatedFeed, feeds : feedConfigManager.getFeedConfigs() });
            }
            else {
                logger.error(`[UpdateFeed] An error occured while updating the feed! Request Params: ${JSON.stringify(params)}`);
                res.json({ updated : false, errorMessage : 'An error occured while updating the feed!'});
            }

        }
        catch (err) {
            logger.error(`[UpdateFeed] ${err.message}, Request Params: ${JSON.stringify(params)}`);
            res.status(500).json({message : err.message});
        }
        
    });

    /**
     * 
     * Required Parameters
     * feedId : string
     *
     *  */ 
    express.get('/deletefeed', async (req, res) => {
        const params = req.query;

        const feedId = params.feedId;

        if (feedId === undefined || feedId.length === 0) {
            const errorMessage =  'Feed id is not a valid id! Please provide a valid id to update a new feed.';
            
            res.status(400).json({ message : errorMessage });
            logger.error(`[DeleteFeed] ${errorMessage}, Request params: ${JSON.stringify(params)}`);
            
            return;
        }

        const feedConfigManager = configManager.getFeedConfigManager();
        const archiveService : FeedArchiveService = new SQLiteFeedArchiveService();

        const oldFeed = feedConfigManager.getFeedConfig(feedId);

        try {
            const feedDeleted = await feedConfigManager.deleteFeedConfig(feedId);

            if (feedDeleted) {
                logger.info(`[DeleteFeed] A feed is successfully deleted! Old Feed: ${JSON.stringify(oldFeed)}`);
                feedScheduler.deleteScheduledTask(feedId);
                const archiveCleaned = archiveService.deleteFeed(feedId);

                if (archiveCleaned) logger.info(`[DeleteFeed] Items of the feed are cleared from the archive.`);
                else logger.error(`[DeleteFeed] Unable to delete feed items on the archive!`);

                res.json({ deleted : true, deletedObject : oldFeed, feeds : feedConfigManager.getFeedConfigs() });
            }
            else {
                logger.error(`[DeleteFeed] An error occured while deleting the feed! Request Params: ${JSON.stringify(params)}`);
                res.json({ deleted : false, errorMessage : 'An error occured while deleting the feed!'});
            }

        }
        catch (err) {
            logger.error(`[DeleteFeed] ${err.message}, Request Params: ${JSON.stringify(params)}`);
            res.status(500).json({ message : err.message });
        }
        
    });

}