import Express from "express";
import { ConfigManager } from "../config/ConfigManager";
import { FeedScheduler } from "../scheduler/FeedScheduler";
import logger from "../utils/Logger";
import Duration from "../time/Duration";
import { FeedConfig } from "../config/FeedConfigManager";
import { crc32 } from "crc";

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
        const fetchPeriod : Duration = JSON.parse(params.fetchPeriod);
        const enabled = params.enabled !== undefined && params.enabled === 'true';
        const iconURL = params.iconURL !== undefined ? params.iconURL : '';

        if (categoryId === undefined || categoryId.length === 0) {
            const errorMessage =  'Category id is not a valid id! Please provide a valid id to add a new feed.';
            
            res.status(400).json({ message : errorMessage});
            logger.error(`[AddFeed] ${errorMessage}, Request params: ${JSON.stringify(params)}`);
            
            return;
        }

        if (name === undefined || name.length === 0) {
            const errorMessage =  'Feed name is not valid! Please provide a valid name to add a new feed.';
            
            res.status(400).json({ message : errorMessage});
            logger.error(`[AddFeed] ${errorMessage}, Request params: ${JSON.stringify(params)}`);
            
            return;
        }

        if (url === undefined || url.length === 0) {
            const errorMessage =  'Feed URL is not valid! Please provide a valid URL to add a new feed.';
            
            res.status(400).json({ message : errorMessage});
            logger.error(`[AddFeed] ${errorMessage}, Request params: ${JSON.stringify(params)}`);
            
            return;
        }

        if (fetchPeriod === undefined || fetchPeriod.unit === undefined || fetchPeriod.value === undefined) {
            const errorMessage =  'Fetch period is not valid! Please provide a valid fetch period to add a new feed.';
            
            res.status(400).json({ message : errorMessage});
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
                logger.error(`[AddFeedCategory] An error occured while adding the category! Request Params: ${JSON.stringify(params)}`);
                res.json({added : false, errorMessage : 'An error occured while adding the category!'});
            }

        }
        catch(err) {
            logger.error(`[AddFeed] ${err.message}, Request Params: ${JSON.stringify(params)}`);
            res.status(500).json({message : err.message});
        }


    });

    express.get('/updatefeed', (req, res) => {
        
    });

}