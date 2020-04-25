import { ExpressSettings } from "./Routes";
import { http_logger } from "../utils/Logger";
import { FeedItemArchiveService } from "../archive/FeedItemArchiveService";
import SQLiteFeedItemArchiveService from "../archive/SQLiteFeedItemArchiveService";
import { renderFile } from "ejs";
import { join } from "path";
import moment from "moment";

interface FeedDetailsResult {
    html : string,
    itemAlreadyRead : boolean
}

const feedItemArchiveService : FeedItemArchiveService = new SQLiteFeedItemArchiveService();

export default function FeedDetails(exp : ExpressSettings, systemLocale : string) {

    exp.expressObject.post('/feeddetails', async (req, res) => {
        const params = req.query;
        const itemId : string = params.itemId as string;

        if (itemId === undefined || itemId.length === 0) {
            const errorMessage =  'feedId parameter is missing!';
            
            res.status(400).json({ added : false, message : errorMessage });
            http_logger.error(`[FeedContent] ${errorMessage}, Request params: ${JSON.stringify(params)}`);
            
            return;
        }
        const feedItem = feedItemArchiveService.getFeedItem(itemId);
        const itemAlreadyRead = feedItem.read;
        
        // Make feed item to be read if its'not.
        if (!feedItem.read) feedItemArchiveService.setFeedItemRead(true, itemId);
        
        const renderedHTML = await renderFile(join(__dirname, '..', '..', 'assets', 'feeddetails.ejs'), {
            feedItem,
            systemLocale,
            moment,
            feedId : feedItem.feedId
        });

        const result : FeedDetailsResult = {
            html : renderedHTML,
            itemAlreadyRead
        } ;

        res.json(result);
    });

}