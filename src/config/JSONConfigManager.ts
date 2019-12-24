import { ConfigManager, ConfigPathNotAvailableError } from "./ConfigManager";

import { sep } from "path";

export default class JSONConfigManager implements ConfigManager {

    private readonly SETTINGS_FILE_NAME = 'settings.json';
    private readonly SETTINGS_FILE_PATH : string;
    
    constructor(configPath : string | undefined) {

        if (typeof configPath === 'undefined') 
            throw new ConfigPathNotAvailableError('Configuration folder path is not a string.');

        const configPathStr = configPath as string;

        this.SETTINGS_FILE_PATH = `${configPathStr}${sep}${this.SETTINGS_FILE_NAME}`;
    }

}