import { SettingsManager, SystemSettings } from "./SettingsManager";
import { existsSync, writeFile, readFileSync, writeFileSync } from "fs";
import { sep } from "path";

/**
 * The settings manager class that manages the general settings of the application.
 * It allows access over settings defined in the settings.json file by calling getSettings() merhod.
 * It also provides functionality to write the settings into settings.json file.
 * 
 * @author cemozden
 * @see SettingsManager
 */
export default class JSONSettingsManager implements SettingsManager {
    
    private systemSettings : SystemSettings;
    private readonly SETTINGS_FILE_PATH : string;
    private readonly SETTINGS_FILE_NAME : string = 'settings.json';

    constructor(configPath : string) {
        this.SETTINGS_FILE_PATH = `${configPath}${sep}${this.SETTINGS_FILE_NAME}`;

        // If the settings file does not exist then create default settings
        if (!existsSync(this.SETTINGS_FILE_PATH)) {
            const defaultSystemSettings : SystemSettings = {
                language : "en",
                windowMaximized : false
            }

            writeFileSync(this.SETTINGS_FILE_PATH, JSON.stringify(defaultSystemSettings));
            this.systemSettings = defaultSystemSettings;
        }
        else 
            this.systemSettings = JSON.parse(readFileSync(this.SETTINGS_FILE_PATH).toString());
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