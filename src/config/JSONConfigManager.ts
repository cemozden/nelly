import { ConfigManager, ConfigPathNotAvailableError } from "./ConfigManager";
import { existsSync, mkdirSync } from "fs";
import { sep } from "path";
import { FeedConfigManager } from "./FeedConfigManager";
import { LanguageManager } from "./LanguageManager";
import { SettingsManager } from "./SettingsManager";
import JSONSettingsManager from "./JSONSettingsManager";
import JSONLanguageManager from "./JSONLanguageManager";
import JSONFeedConfigManager from "./JSONFeedConfigManager";

/**
 * A config manager class that is providing Nelly config functionality in JSON format.
 * All config related operations are being processed via this class. That is, It behaves
 * as a master of all different types of configurations.
 *
 * The class provides references to 
 * - SettingsManager, A JSON based implementation which is intended to handle general settings of the application.
 * - LanguageManager, A JSON based implementation which is intented to be used for application language.
 * - FeedConfigManager, A JSON based implementation which is intented to be handling feed configurations of users.
 * 
 * @see JSONFeedConfigManager
 * @see JSONLanguageManager
 * @see JSONSettingsManager
 * @author cemozden  
 */
export default class JSONConfigManager implements ConfigManager {

    
    private readonly LANGUAGE_FOLDER_NAME : string = 'lang';
    private readonly FEED_CONFIG_FOLDER_NAME : string = 'feeds';
   
    private readonly SETTINGS_MANAGER : SettingsManager;
    private readonly LANGUAGE_MANAGER : LanguageManager;
    private readonly FEED_CONFIG_MANAGER : FeedConfigManager

    /**
     * @throws ConfigPathNotAvailableError
     */
    constructor(configPath : string | undefined) {
        // If the config path is not a string then throw the ConfigPathNotAvailableError error.
        if (typeof configPath === 'undefined') 
            throw new ConfigPathNotAvailableError('Configuration folder path is not a string.');

        // Check for existance of config folder.
        if (!existsSync(configPath)) 
            mkdirSync(configPath);

        const configPathStr = configPath as string;

        
        this.SETTINGS_MANAGER = new JSONSettingsManager(configPath);
        this.LANGUAGE_MANAGER = new JSONLanguageManager(`${configPathStr}${sep}${this.LANGUAGE_FOLDER_NAME}`);
        this.FEED_CONFIG_MANAGER = new JSONFeedConfigManager(`${configPathStr}${sep}${this.FEED_CONFIG_FOLDER_NAME}`);
    }

    getFeedConfigManager() : FeedConfigManager {
        return this.FEED_CONFIG_MANAGER;
    }

    getLanguageManager() : LanguageManager {
        return this.LANGUAGE_MANAGER;
    }

    getSettingsManager() : SettingsManager {
        return this.SETTINGS_MANAGER;
    }

}