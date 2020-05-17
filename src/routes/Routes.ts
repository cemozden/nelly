import Express from "express";
import Index from "./Index";
import FeedContent from "./FeedContent";
import FeedDetails from "./FeedDetails";
import Dialogs from "./Dialogs";
import { ConfigManager } from "../config/ConfigManager";

export interface ExpressSettings {
   expressObject : Express.Application,
   url : string
}

export default function initRoutes(exp : Express.Application, expressURL : string, systemLocale : string, configManager : ConfigManager) {
        const expressSettings : ExpressSettings = {
                expressObject : exp,
                url : expressURL
        };
        
        Index(expressSettings, systemLocale, configManager.getThemeManager().getThemeById(configManager.getSettingsManager().getSettings().theme));
        FeedContent(expressSettings, systemLocale, configManager.getFeedConfigManager());
        FeedDetails(expressSettings, systemLocale);
        Dialogs(expressSettings, configManager);
}