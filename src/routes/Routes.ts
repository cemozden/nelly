import Express from "express";
import Index from "./Index";
import FeedContent from "./FeedContent";
import FeedDetails from "./FeedDetails";
import Dialogs from "./Dialogs";
import { FeedConfigManager } from "../config/FeedConfigManager";
import { SettingsManager } from "../config/SettingsManager";

export interface ExpressSettings {
   expressObject : Express.Application,
   url : string
}

export default function initRoutes(exp : Express.Application, expressURL : string, systemLocale : string, feedConfigManager : FeedConfigManager, settingsManager : SettingsManager) {
        const expressSettings : ExpressSettings = {
                expressObject : exp,
                url : expressURL
        };

        Index(expressSettings, systemLocale);
        FeedContent(expressSettings, systemLocale, feedConfigManager);
        FeedDetails(expressSettings, systemLocale);
        Dialogs(expressSettings, feedConfigManager, settingsManager);
}