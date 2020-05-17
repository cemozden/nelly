import { ExpressSettings } from "./Routes";
import { http_logger } from "../utils/Logger";
import { ConfigManager } from "../config/ConfigManager";

export default function Dialogs(exp : ExpressSettings, configManager : ConfigManager) {
    exp.expressObject.get('/addnewfeed_dialog', (req, res) => {
        res.render('addfeed');
    });

    exp.expressObject.get('/updatefeed_dialog', (req, res) => {
        const params = req.query;
        const feedId : string = params.feedId as string;

        if (feedId === undefined || feedId.length === 0) {
            const errorMessage =  'feedId parameter is missing!';
            
            res.status(400).json({ added : false, message : errorMessage });
            http_logger.error(`[FeedContent] ${errorMessage}, Request params: ${JSON.stringify(params)}`);
            
            return;
        }

        const feedConfig = configManager.getFeedConfigManager().getFeedConfig(feedId);
        
        res.render('updatefeed', {
            feedConfig
        });
    });

    exp.expressObject.get('/deletefeed_dialog', (req, res) => {
        const params = req.query;
        const feedId : string = params.feedId as string;

        if (feedId === undefined || feedId.length === 0) {
            const errorMessage =  'feedId parameter is missing!';

            res.status(400).json({ added : false, message : errorMessage });
            http_logger.error(`[FeedContent] ${errorMessage}, Request params: ${JSON.stringify(params)}`);

            return;
        }

        const feedConfig = configManager.getFeedConfigManager().getFeedConfig(feedId);
        
        res.render('deletefeed', {
            feedConfig
        });
    });

    exp.expressObject.get('/settings', (req, res) => {
        
        const systemSettings = configManager.getSettingsManager().getSettings();
        const themes = configManager.getThemeManager().getThemes();

        res.render('settings', {
            systemSettings,
            themes
        });
    });

}