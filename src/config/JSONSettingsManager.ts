import { SettingsManager, SystemSettings } from "./SettingsManager";
import { existsSync, writeFile, readFileSync, writeFileSync } from "fs";

export default class JSONSettingsManager implements SettingsManager {
    
    private systemSettings : SystemSettings;
    private readonly settingsFilePath : string;

    constructor(settingsFilePath : string) {

        // If the settings file does not exist then create default settings
        if (!existsSync(settingsFilePath)) {
            const defaultSystemSettings : SystemSettings = {
                language : "en",
                windowMaximized : false
            }

            writeFileSync(settingsFilePath, JSON.stringify(defaultSystemSettings));
            this.systemSettings = defaultSystemSettings;
        }
        else 
            this.systemSettings = JSON.parse(readFileSync(settingsFilePath).toString());
        
        this.settingsFilePath = settingsFilePath;
    }
    
    getSettings() : SystemSettings {
        return this.systemSettings;
    }

    writeSettings(newSettings : SystemSettings) {
        writeFile(this.settingsFilePath, newSettings, (err) => {
            //TODO: Write error log to logs.
        });
    }
    
}