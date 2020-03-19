import { SettingsManager, SystemSettings, DEFAULT_SYSTEM_SETTINGS } from "./SettingsManager";
import { existsSync, writeFile, readFileSync, writeFileSync } from "fs";
import { sep } from "path";
import general_logger from "../utils/Logger";

/**
 * The settings manager class that manages the general settings of the application.
 * It allows access over settings defined in the settings.json file by calling getSettings() merhod.
 * It also provides functionality to write the settings into settings.json file.
 * 
 * @author cemozden
 * @see SettingsManager
 */
export default class JSONSettingsManager implements SettingsManager {
    
    private readonly SYSTEM_SETTINGS : SystemSettings;
    private readonly SETTINGS_FILE_PATH : string;
    private readonly SETTINGS_FILE_NAME : string = 'settings.json';
    private readonly LOG_LABEL : string = 'SettingsManager';

    constructor(configPath : string) {
        this.SETTINGS_FILE_PATH = `${configPath}${sep}${this.SETTINGS_FILE_NAME}`;

        // If the settings file does not exist then create default settings
        if (!existsSync(this.SETTINGS_FILE_PATH)) {
            

            general_logger.info(`[${this.LOG_LABEL}] Settings file does not exist! Creating one.`);
            writeFileSync(this.SETTINGS_FILE_PATH, JSON.stringify(DEFAULT_SYSTEM_SETTINGS));
            general_logger.info(`[${this.LOG_LABEL}] Settings file created. Path: ${this.SETTINGS_FILE_PATH}`);

            this.SYSTEM_SETTINGS = DEFAULT_SYSTEM_SETTINGS;
        }
        else 
            this.SYSTEM_SETTINGS = JSON.parse(readFileSync(this.SETTINGS_FILE_PATH).toString());
    }
    
    getSettings() : SystemSettings {
        return this.SYSTEM_SETTINGS;
    }

    writeSettings(newSettings : SystemSettings) : Promise<boolean> {
        const writeSettingsPromise = new Promise<boolean>((resolve, reject) => {
            writeFile(this.SETTINGS_FILE_PATH, JSON.stringify(newSettings), err => {
                if (err) reject(err);
                else {
                    resolve(true);
                    general_logger.info(`[${this.LOG_LABEL}] Settings saved. New Settings ${JSON.stringify(newSettings)}`);
                }
            });
        });
        return writeSettingsPromise;
    }
    
}