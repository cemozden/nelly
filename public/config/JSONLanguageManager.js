"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var LanguageManager_1 = require("./LanguageManager");
var Language_1 = require("./Language");
var fs_1 = require("fs");
var path_1 = require("path");
var Logger_1 = __importDefault(require("../utils/Logger"));
/**
 * The language manager class that manages Nelly UI language by using loadLanguage method.
 * The class also provides getLanguageCount() method to retrieve the number of languages available in the system.
 * @author cemozden
 * @see LanguageManager
 */
var JSONLanguageManager = /** @class */ (function () {
    function JSONLanguageManager(languageFolderPath) {
        var _this = this;
        this.ENGLISH_LANGUAGE_FILE_NAME = 'lang_en.json';
        this.LANGUAGE_FILE_PATTERN = 'lang_[a-z]{2}\\.json';
        this.LOG_LABEL = 'LanguageManager';
        if (!fs_1.existsSync(languageFolderPath))
            fs_1.mkdirSync(languageFolderPath);
        var englishLanguageFilePath = "" + languageFolderPath + path_1.sep + this.ENGLISH_LANGUAGE_FILE_NAME;
        // If there is no "lang_*.json" file in the language folder then create default english language file.
        if (fs_1.readdirSync(languageFolderPath)
            .filter(function (fileName) { return fileName.match(_this.LANGUAGE_FILE_PATTERN) !== null; }).length === 0) {
            Logger_1.default.info("[" + this.LOG_LABEL + "] No language file exist! Creating the english language file.");
            fs_1.writeFileSync(englishLanguageFilePath, JSON.stringify(Language_1.DEFAULT_ENGLISH_LANGUAGE));
            Logger_1.default.info("[" + this.LOG_LABEL + "] English language file created. Path: " + englishLanguageFilePath);
        }
        this.LANGUAGE_FOLDER_PATH = languageFolderPath;
    }
    /**
     * The method that returns the language according to the language alias provided as parameter.
     * @param langAlias The alias of the language to be loaded. Such as "en" for lang_en.json file.
     * @throws InvalidLanguageFileError when the language file does not exist according to the language alias.
     * @returns Language object that contains the specific language statements.
     */
    JSONLanguageManager.prototype.loadLanguage = function (langAlias) {
        var langFilePath = "" + this.LANGUAGE_FOLDER_PATH + path_1.sep + "lang_" + langAlias + ".json";
        if (!fs_1.existsSync(langFilePath))
            throw new LanguageManager_1.InvalidLanguageFileError("The language file does not exist! Language File Path: " + langFilePath);
        var language = JSON.parse(fs_1.readFileSync(langFilePath).toString());
        return language;
    };
    /**
     * Returns the number of languages available in the system by checking the lang folder according to the language file pattern.
     * @returns number of languages available.
     */
    JSONLanguageManager.prototype.getLanguageCount = function () {
        var _this = this;
        return fs_1.readdirSync(this.LANGUAGE_FOLDER_PATH)
            .filter(function (fileName) { return fileName.match(_this.LANGUAGE_FILE_PATTERN); }).length;
    };
    return JSONLanguageManager;
}());
exports.default = JSONLanguageManager;
//# sourceMappingURL=JSONLanguageManager.js.map