"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var SettingsManager_1 = require("./SettingsManager");
var fs_1 = require("fs");
var path_1 = require("path");
var Logger_1 = __importDefault(require("../utils/Logger"));
/**
 * The settings manager class that manages the general settings of the application.
 * It allows access over settings defined in the settings.json file by calling getSettings() merhod.
 * It also provides functionality to write the settings into settings.json file.
 *
 * @author cemozden
 * @see SettingsManager
 */
var JSONSettingsManager = /** @class */ (function () {
    function JSONSettingsManager(configPath) {
        this.SETTINGS_FILE_NAME = 'settings.json';
        this.LOG_LABEL = 'SettingsManager';
        this.SETTINGS_FILE_PATH = "" + configPath + path_1.sep + this.SETTINGS_FILE_NAME;
        // If the settings file does not exist then create default settings
        if (!fs_1.existsSync(this.SETTINGS_FILE_PATH)) {
            Logger_1.default.info("[" + this.LOG_LABEL + "] Settings file does not exist! Creating one.");
            fs_1.writeFileSync(this.SETTINGS_FILE_PATH, JSON.stringify(SettingsManager_1.DEFAULT_SYSTEM_SETTINGS));
            Logger_1.default.info("[" + this.LOG_LABEL + "] Settings file created. Path: " + this.SETTINGS_FILE_PATH);
            this.SYSTEM_SETTINGS = SettingsManager_1.DEFAULT_SYSTEM_SETTINGS;
        }
        else
            this.SYSTEM_SETTINGS = JSON.parse(fs_1.readFileSync(this.SETTINGS_FILE_PATH).toString());
    }
    JSONSettingsManager.prototype.getSettings = function () {
        return this.SYSTEM_SETTINGS;
    };
    JSONSettingsManager.prototype.writeSettings = function (newSettings) {
        var _this = this;
        var writeSettingsPromise = new Promise(function (resolve, reject) {
            fs_1.writeFile(_this.SETTINGS_FILE_PATH, JSON.stringify(newSettings), function (err) {
                if (err)
                    reject(err);
                else {
                    resolve(true);
                    Logger_1.default.info("[" + _this.LOG_LABEL + "] Settings saved. New Settings " + JSON.stringify(newSettings));
                }
            });
        });
        return writeSettingsPromise;
    };
    return JSONSettingsManager;
}());
exports.default = JSONSettingsManager;
//# sourceMappingURL=JSONSettingsManager.js.map