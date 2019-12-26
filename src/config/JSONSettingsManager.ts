import { SettingsManager, SystemSettings } from "./SettingsManager";
import { existsSync, writeFile, readFileSync, writeFileSync } from "fs";

export default class JSONSettingsManager implements SettingsManager {
    
    private systemSettings : SystemSettings;
    private readonly SETTINGS_FILE_PATH : string;

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
        
        this.SETTINGS_FILE_PATH = settingsFilePath;
    }
    
    getSettings() : SystemSettings {
        return this.systemSettings;
    }

    writeSettings(newSettings : SystemSettings) : Promise<boolean> {
        const writeSettingsPromise = new Promise<boolean>((resolve, reject) => {
            writeFile(this.SETTINGS_FILE_PATH, JSON.stringify(newSettings), err => {
                if (err) reject(err);
                else resolve(true);
            });
        });
        return writeSettingsPromise;
    }
    
}