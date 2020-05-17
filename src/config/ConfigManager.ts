import { SettingsManager } from "./SettingsManager";
import { LanguageManager } from "./LanguageManager";
import { FeedConfigManager } from "./FeedConfigManager";
import { ThemeManager } from "./ThemeManager";

/**
 * The interface that represents management of all configurations of Nelly.
 * Classes that implement this interface should be used to handle the whole configuration of Nelly.
 *
 * @see JSONConfigManager
 */
export interface ConfigManager {
    
    getSettingsManager() : SettingsManager,
    getLanguageManager() : LanguageManager,
    getFeedConfigManager() : FeedConfigManager,
    getThemeManager() : ThemeManager
   
}

/**
 * The class which is thrown in case the configuration path of the application is not a valid string.
 * @see JSONConfigManager
 */
export class ConfigPathNotAvailableError extends Error {}