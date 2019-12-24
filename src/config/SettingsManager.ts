export interface SystemSettings {
    language : string,
    windowMaximized : boolean
}

export interface SettingsManager {
    getSettings() : SystemSettings,
    writeSettings(newSettings : SystemSettings) : void,
}