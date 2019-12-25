import { ConfigManager, ConfigPathNotAvailableError } from "./ConfigManager";
import { existsSync, mkdirSync } from "fs";
import { sep } from "path";

export default class JSONConfigManager implements ConfigManager {

    private readonly SETTINGS_FILE_NAME = 'settings.json';
    private readonly LANGUAGE_FOLDER_NAME = 'lang';

    private readonly SETTINGS_FILE_PATH : string;

    constructor(configPath : string | undefined) {
        // If the config path is not a string then throw the error.
        if (typeof configPath === 'undefined') 
            throw new ConfigPathNotAvailableError('Configuration folder path is not a string.');

        // Check for existance of config folder.
        if (!existsSync(configPath)) 
            mkdirSync(configPath);

        const configPathStr = configPath as string;

        this.SETTINGS_FILE_PATH = `${configPathStr}${sep}${this.SETTINGS_FILE_NAME}`;
    }

}