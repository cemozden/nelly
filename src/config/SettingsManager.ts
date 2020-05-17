import Duration from "../time/Duration";
import { TimeUnit } from "../time/TimeUnit";

/**
 * The system settings interface that represents the core settings of Nelly application.
 * Instances of this interface can be used to determine the core concept of the application such as the system language of the application, window maximized etc.
 */
export interface SystemSettings {
    language : string,
    archiveCleaningPeriod : Duration,
    serverPort : number,
    systemLocale : string,
    theme : string
}

export const DEFAULT_SYSTEM_SETTINGS : SystemSettings = {
    language : "en",
    archiveCleaningPeriod : {unit : TimeUnit.MONTHS, value : 6},
    serverPort : 6150,
    systemLocale : 'en-US',
    theme : "dark_purple"
}

export interface SettingsManager {
    getSettings() : SystemSettings,
    writeSettings(newSettings : SystemSettings) : Promise<boolean>,
} 

export class ConfigFileNotFoundError extends Error {}