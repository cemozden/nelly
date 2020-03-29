import { ExpressSettings } from "./Routes";
import { FeedConfigManager } from "../config/FeedConfigManager";
import { http_logger } from "../utils/Logger";
import { SettingsManager } from "../config/SettingsManager";

export default function Dialogs(exp : ExpressSettings, feedConfigManager : FeedConfigManager, settingsManager : SettingsManager) {
    exp.expressObject.get('/addnewfeed_dialog', (req, res) => {
        res.render('addfeed');
    });

    exp.expressObject.get('/updatefeed_dialog', (req, res) => {
        const params = req.query;
        const feedId : string = params.feedId;

        if (feedId === undefined || feedId.length === 0) {
            const errorMessage =  'feedId parameter is missing!';
            
            res.status(400).json({ added : false, message : errorMessage });
            http_logger.error(`[FeedContent] ${errorMessage}, Request params: ${JSON.stringify(params)}`);
            
            return;
        }

        const feedConfig = feedConfigManager.getFeedConfig(feedId);
        
        res.render('updatefeed', {
            feedConfig
        });
    });

    exp.expressObject.get('/deletefeed_dialog', (req, res) => {
        const params = req.query;
        const feedId : string = params.feedId;

        if (feedId === undefined || feedId.length === 0) {
            const errorMessage =  'feedId parameter is missing!';

            res.status(400).json({ added : false, message : errorMessage });
            http_logger.error(`[FeedContent] ${errorMessage}, Request params: ${JSON.stringify(params)}`);

            return;
        }

        const feedConfig = feedConfigManager.getFeedConfig(feedId);
        
        res.render('deletefeed', {
            feedConfig
        });
    });

    exp.expressObject.get('/settings', (req, res) => {
        
        const systemSettings = settingsManager.getSettings();

        res.render('settings', {
            systemSettings
        });
    });

}