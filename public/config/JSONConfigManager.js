"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ConfigManager_1 = require("./ConfigManager");
var fs_1 = require("fs");
var path_1 = require("path");
var JSONSettingsManager_1 = __importDefault(require("./JSONSettingsManager"));
var JSONLanguageManager_1 = __importDefault(require("./JSONLanguageManager"));
var JSONFeedConfigManager_1 = __importDefault(require("./JSONFeedConfigManager"));
var Logger_1 = __importDefault(require("../utils/Logger"));
/**
 * A config manager class that is providing Nelly config functionality in JSON format.
 * All config related operations are being processed via this class. That is, It behaves
 * as a master of all different types of configurations.
 *
 * The class provides references to
 * - SettingsManager, A JSON based implementation which is intended to handle general settings of the application.
 * - LanguageManager, A JSON based implementation which is intented to be used for application language.
 * - FeedConfigManager, A JSON based implementation which is intented to be handling feed configurations of users.
 *
 * @see JSONFeedConfigManager
 * @see JSONLanguageManager
 * @see JSONSettingsManager
 * @author cemozden
 */
var JSONConfigManager = /** @class */ (function () {
    /**
     * @throws ConfigPathNotAvailableError
     */
    function JSONConfigManager(configPath) {
        this.LANGUAGE_FOLDER_NAME = 'lang';
        this.FEED_CONFIG_FOLDER_NAME = 'feeds';
        // If the config path is not a string then throw the ConfigPathNotAvailableError error.
        if (configPath === undefined)
            throw new ConfigManager_1.ConfigPathNotAvailableError('Configuration folder path is not a string.');
        // Check for existance of config folder.
        if (!fs_1.existsSync(configPath)) {
            Logger_1.default.info("Configuration folder does not exist! Creating the configuration folder...");
            fs_1.mkdirSync(configPath);
            Logger_1.default.info("Configuration Folder created. Folder Path: " + configPath);
        }
        var configPathStr = configPath;
        try {
            this.SETTINGS_MANAGER = new JSONSettingsManager_1.default(configPath);
            this.LANGUAGE_MANAGER = new JSONLanguageManager_1.default("" + configPathStr + path_1.sep + this.LANGUAGE_FOLDER_NAME);
            this.FEED_CONFIG_MANAGER = new JSONFeedConfigManager_1.default("" + configPathStr + path_1.sep + this.FEED_CONFIG_FOLDER_NAME);
        }
        catch (err) {
            Logger_1.default.error("[JSONConfigManager] " + err.message);
            process.exit(-1);
        }
    }
    JSONConfigManager.prototype.getFeedConfigManager = function () {
        return this.FEED_CONFIG_MANAGER;
    };
    JSONConfigManager.prototype.getLanguageManager = function () {
        return this.LANGUAGE_MANAGER;
    };
    JSONConfigManager.prototype.getSettingsManager = function () {
        return this.SETTINGS_MANAGER;
    };
    return JSONConfigManager;
}());
exports.default = JSONConfigManager;
//# sourceMappingURL=JSONConfigManager.js.map