import { SettingsManager } from "./SettingsManager";
import { LanguageManager } from "./LanguageManager";
import { FeedConfigManager } from "./FeedConfigManager";

/**
 * The interface that represents management of all configurations of Nelly.
 * Classes that implement this interface should be used to handle the whole configuration of Nelly.
 *
 * @see JSONConfigManager
 */
export interface ConfigManager {
    
    getSettingsManager() : SettingsManager,
    getLanguageManager() : LanguageManager,
    getFeedConfigManager() : FeedConfigManager
   
}

/**
 * The class which is thrown in case the configuration path of the application is not a valid string.
 * @see JSONConfigManager
 */
export class ConfigPathNotAvailableError extends Error {
    
    constructor(message : string) {
        super(message);
    }

}