import Express from "express";
import { FeedArchiveService } from "../archive/FeedArchiveService";
import SQLiteFeedArchiveService from "../archive/SQLiteFeedArchiveService";
import { FeedItemArchiveService } from "../archive/FeedItemArchiveService";
import SQLiteFeedItemArchiveService from "../archive/SQLiteFeedItemArchiveService";
import { http_logger } from "../utils/Logger";
import moment from "moment";
import { renderFile } from "ejs";
import { join } from "path";

const feedArchiveService : FeedArchiveService = new SQLiteFeedArchiveService();
const feedItemArchiveService : FeedItemArchiveService = new SQLiteFeedItemArchiveService();

interface FeedContentResult {
    html : string,
    numberOfEntries : number,
    queryStartDate : Date,
    queryEndDate : Date,
}

export default function FeedContent(exp : Express.Application, expressURL : string, systemLocale : string) {
    exp.post('/feedcontent', async (req, res) => {
        const params = req.query;
        const feedId : string = params.feedId;

        if (feedId === undefined || feedId.length === 0) {
            const errorMessage =  'feedId parameter is missing!';
            
            res.status(400).json({ added : false, message : errorMessage });
            http_logger.error(`[FeedContent] ${errorMessage}, Request params: ${JSON.stringify(params)}`);
            
            return;
        }

        const feed = feedArchiveService.getFeed(feedId);
        
        const startDate = new Date();
        const endDate = new Date();

        startDate.setSeconds(0);
        startDate.setHours(0);
        startDate.setMinutes(0);

        endDate.setSeconds(59);
        endDate.setHours(23);
        endDate.setMinutes(59);
        
        const feedItems = feedItemArchiveService.getFeedItems(feedId, startDate, endDate, true);
        
        // Set locale for date time formatting.
        moment.locale(systemLocale);
        const renderedHTML = await renderFile(join(__dirname, '..', '..', 'assets', 'feedcontent.ejs'), {
            feedInfo : feed.feedMetadata,
            feedItems,
            rssVersion : 'RSS 2.0',
            systemLocale,
            moment,
            queryStartDate : startDate,
            queryEndDate : endDate
        });

        const result : FeedContentResult = {
            html : renderedHTML,
            numberOfEntries : feedItems.length,
            queryStartDate : startDate,
            queryEndDate : endDate
        } ;

        res.json(result);
    });
}