/**
 * The system settings interface that represents the core settings of Nelly application.
 * Instances of this interface can be used to determine the core concept of the application such as the system language of the application, window maximized etc.
 */
export interface SystemSettings {
    language : string,
    windowMaximized : boolean
}

export interface SettingsManager {
    getSettings() : SystemSettings,
    writeSettings(newSettings : SystemSettings) : Promise<boolean>,
} 