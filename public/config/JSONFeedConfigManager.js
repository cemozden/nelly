"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var FeedConfigManager_1 = require("./FeedConfigManager");
var fs_1 = require("fs");
var path_1 = require("path");
var rimraf_1 = require("rimraf");
var ConfigUtil_1 = require("./ConfigUtil");
var Logger_1 = __importDefault(require("../utils/Logger"));
var Duration_1 = require("../time/Duration");
/**
 * The feed configuration manager class that represents how feed configurations are dealt in Nelly via JSON format.
 * @author cemozden
 * @see FeedConfigManager
 */
var JSONFeedConfigManager = /** @class */ (function () {
    /**
     * @param feedsFolderPath A folder path that will be used to place and read feed configurations as well as the feed categories.
     */
    function JSONFeedConfigManager(feedsFolderPath) {
        var _this = this;
        this.FEED_CONFIG_FILE_PATTERN = '[a-zA-Z0-9]{8}\\.json';
        this.CATEGORY_LIST_FILE_NAME = 'category.json';
        this.LOG_LABEL = 'FeedConfig';
        this.FEED_CONFIGS = [];
        this.FEEDS_FOLDER = feedsFolderPath;
        this.CATEGORY_LIST_FILE_PATH = "" + this.FEEDS_FOLDER + path_1.sep + this.CATEGORY_LIST_FILE_NAME;
        if (!fs_1.existsSync(feedsFolderPath)) {
            Logger_1.default.info("[" + this.LOG_LABEL + "] Feeds folder does not exist.");
            fs_1.mkdirSync(feedsFolderPath);
            Logger_1.default.info("[" + this.LOG_LABEL + "] Feeds folder created. Path: " + feedsFolderPath);
        }
        /* Read existing feed configurations and place them into FEED_CONFIGS array.
           The file format is a string which is 8 length. with .json extension
        */
        var feedConfigFiles = fs_1.readdirSync(feedsFolderPath)
            .filter(function (fileName) { return fileName.match(_this.FEED_CONFIG_FILE_PATTERN); });
        feedConfigFiles.forEach(function (feedConfigFile) {
            var fileAbsolutePath = "" + _this.FEEDS_FOLDER + path_1.sep + feedConfigFile;
            var fcObject = JSON.parse(fs_1.readFileSync(fileAbsolutePath).toString());
            // If the read object is only a FeedConfig object then add it.
            // Skip other files that matches the given pattern. 
            if (ConfigUtil_1.isFeedConfig(fcObject)) {
                // If the read id is already existing in the feed config list then throw error.
                // Because all ids must be unique.
                if (_this.FEED_CONFIGS.map(function (fc) { return fc.feedConfigId; }).includes(fcObject.feedConfigId))
                    throw new FeedConfigManager_1.NotUniqueFeedConfigIdError('Unable to load feed configurations. All feed configurations must have unique ids!');
                _this.FEED_CONFIGS.push(fcObject);
                Logger_1.default.verbose("[" + _this.LOG_LABEL + "] " + feedConfigFile + " is loaded.");
            }
        });
        // If category.json file is not existing, then create it and write the root category into the file.
        // Otherwise directly read it from category.json file
        if (!fs_1.existsSync(this.CATEGORY_LIST_FILE_PATH)) {
            fs_1.writeFileSync(this.CATEGORY_LIST_FILE_PATH, JSON.stringify(FeedConfigManager_1.DEFAULT_ROOT_CATEGORY));
            this.ROOT_CATEGORY = FeedConfigManager_1.DEFAULT_ROOT_CATEGORY;
            Logger_1.default.info("[" + this.LOG_LABEL + "] category.json is created. Path: " + this.CATEGORY_LIST_FILE_PATH);
        }
        else
            this.ROOT_CATEGORY = JSON.parse(fs_1.readFileSync(this.CATEGORY_LIST_FILE_PATH).toString());
    }
    /**
     * The method that adds the given feed configuration into the system.
     * it makes sure that all feed configurations have unique ids.
     * If the given feed config has an id that is alreadt existing, it throws NotUniqueFeedConfigIdError error.
     * @returns A promise that yields true if feed config is added successfully. Otherwise it might throw an error.
     * @throws NotUniqueFeedConfigIdError
     */
    JSONFeedConfigManager.prototype.addFeedConfig = function (feedConfig) {
        var _this = this;
        var addFeedPromise = new Promise(function (resolve, reject) {
            // If feed config list has a feed that has the same id with the given parameter then throw NotUniqueFeedConfigIdError.
            if (_this.FEED_CONFIGS.map(function (fc) { return fc.feedConfigId; }).includes(feedConfig.feedConfigId)) {
                reject(new FeedConfigManager_1.NotUniqueFeedConfigIdError("The feed config id is not unique. There is already a feed config which has the same feed config id " + feedConfig.feedConfigId));
                return;
            }
            // If the category does not exist in the category tree then reject feed addition.
            if (!ConfigUtil_1.categoryIdExist(feedConfig.categoryId, _this.ROOT_CATEGORY)) {
                reject(new FeedConfigManager_1.InvalidFeedCategoryIdError("The given category id \"" + feedConfig.categoryId + "\" does not exist!"));
                return;
            }
            // If the given URL already exists in the system then reject feed addition.
            if (_this.FEED_CONFIGS.map(function (fc) { return fc.url; }).includes(feedConfig.url)) {
                reject(new FeedConfigManager_1.InvalidFeedConfigError("The given URL \"" + feedConfig.url + "\" is already existing in the system!"));
                return;
            }
            // If the given Fetch Period is not a valid Duration object then reject the addition.
            if (!Duration_1.isDuration(feedConfig.fetchPeriod)) {
                reject(new FeedConfigManager_1.InvalidFeedConfigError("The given Fetch Period \"" + JSON.stringify(feedConfig.fetchPeriod) + "\" is not a valid fetch period!!"));
                return;
            }
            // Write the feed config into the file and add it into FEED_CONFIGS list.
            var feedJSON = JSON.stringify(feedConfig);
            fs_1.writeFile("" + _this.FEEDS_FOLDER + path_1.sep + feedConfig.feedConfigId + ".json", feedJSON, function (err) {
                if (err)
                    reject(err);
                else {
                    _this.FEED_CONFIGS.push(feedConfig);
                    resolve(true);
                }
            });
        });
        return addFeedPromise;
    };
    /**
     * The method that updates a specific feed configuration defined already in the system.
     * The method makes sure that a given feed id is already existing in the feed configuration.
     * @param feedConfigId The id of a feed configuration which will be updated
     * @param feedConfig The feed that will be replaced.
     * @throws InvalidFeedConfigIdError if the given feed id is not existing.
     * @returns a promise with a true value if update operation succeeds otherwise it might
     */
    JSONFeedConfigManager.prototype.updateFeedConfig = function (feedConfigId, feedConfig) {
        var _this = this;
        var updatePromise = new Promise(function (resolve, reject) {
            var feedIdIndex = _this.FEED_CONFIGS.map(function (fc) { return fc.feedConfigId; }).indexOf(feedConfigId);
            if (feedIdIndex === -1)
                reject(new FeedConfigManager_1.InvalidFeedConfigIdError("Update failed. There is no feed config with the id \"" + feedConfigId + "\"."));
            else if (feedConfigId !== feedConfig.feedConfigId)
                reject(new FeedConfigManager_1.InvalidFeedConfigIdError("The feed configuration id of a specific feed configuration cannot be updated"));
            else if (!ConfigUtil_1.categoryIdExist(feedConfig.categoryId, _this.ROOT_CATEGORY))
                reject(new FeedConfigManager_1.InvalidFeedCategoryIdError("The given category id \"" + feedConfig.categoryId + "\" does not exist!"));
            else if (!Duration_1.isDuration(feedConfig.fetchPeriod))
                reject(new FeedConfigManager_1.InvalidFeedConfigError("The given Fetch Period \"" + JSON.stringify(feedConfig.fetchPeriod) + "\" is not a valid fetch period!!"));
            else {
                _this.FEED_CONFIGS[feedIdIndex] = feedConfig;
                var feedConfigFilePath = "" + _this.FEEDS_FOLDER + path_1.sep + feedConfigId + ".json";
                fs_1.writeFile(feedConfigFilePath, JSON.stringify(feedConfig), function (err) {
                    if (err)
                        reject(err);
                    else
                        resolve(true);
                });
            }
        });
        return updatePromise;
    };
    /**
     * The method that deletes a specific feed configuration by receiving its id as a parameter.
     * The method makes sure that the given feed id is already existing in the system.
     * @param feedId The feed id of a specific feed configuration that needs to be deleted.
     * @throws InvalidFeedConfigIdError if the given feed config is not existing.
     * @returns a promise with a value of true if the deletion succeeds otherwise it might yield an error.
     */
    JSONFeedConfigManager.prototype.deleteFeedConfig = function (feedId) {
        var _this = this;
        var deletePromise = new Promise(function (resolve, reject) {
            var feedIdIndex = _this.FEED_CONFIGS.map(function (fc) { return fc.feedConfigId; }).indexOf(feedId);
            if (feedIdIndex === -1)
                reject(new FeedConfigManager_1.InvalidFeedConfigIdError("Deletion failed. There is no feed config with the id \"" + feedId + "\"."));
            else {
                _this.FEED_CONFIGS.splice(feedIdIndex, 1);
                var feedConfigFilePath = "" + _this.FEEDS_FOLDER + path_1.sep + feedId + ".json";
                rimraf_1.sync(feedConfigFilePath);
                resolve(true);
            }
        });
        return deletePromise;
    };
    /**
     * The method that adds a given feed category into the category tree.
     * The method makes sure that it does not try to add the new feed category to a non-existing feed category node.
     * The method also makes sure that the new feed category does provide a unique category id.
     * @param feedCategory The feed category that needs to be added into the category tree.
     * @param parentCategoryId The id of the feed category that will be the parent node of the new feed category.
     * @throws NotExistFeedCategoryError If the parent is not existing in the category tree.
     * @throws InvalidFeedCategoryIdError if the given category id is already existing in the system.
     * @returns a promise with a value of true if adding a new feed category is successful.
     */
    JSONFeedConfigManager.prototype.addFeedCategory = function (feedCategory, parentCategoryId) {
        var _this = this;
        var addFeedCategoryPromise = new Promise(function (resolve, reject) {
            if (!FeedConfigManager_1.feedCategoryExist(parentCategoryId, _this.ROOT_CATEGORY)) {
                reject(new FeedConfigManager_1.NotExistFeedCategoryError("The feed category provided is not existing the category tree!"));
                return;
            }
            if (ConfigUtil_1.categoryIdExist(feedCategory.categoryId, _this.ROOT_CATEGORY)) {
                reject(new FeedConfigManager_1.InvalidFeedCategoryIdError("The feed category id \"" + feedCategory.categoryId + "\" is already existing in the category tree!"));
                return;
            }
            if (feedCategory.name.length === 0) {
                reject(new FeedConfigManager_1.InvalidFeedCategoryError("The category name cannot be empty!"));
                return;
            }
            // Add the given new category into the child category list of its parent.
            var parentCategory = FeedConfigManager_1.getCategoryById(parentCategoryId, _this.ROOT_CATEGORY);
            parentCategory.childCategories.push(feedCategory);
            fs_1.writeFile(_this.CATEGORY_LIST_FILE_PATH, JSON.stringify(_this.ROOT_CATEGORY), function (err) {
                if (err)
                    reject(err);
                else
                    resolve(true);
            });
        });
        return addFeedCategoryPromise;
    };
    /**
     * The method that updates a specific feed category in the category tree.
     * The method makes sure that the category tree that will be replaced is already existing in the system.
     * The method also makes sure that the new updated feed category id is not existing in the category tree.
     * @param newFeedCategory The new feed category that will take place of the second parameter.
     * @param oldFeedCategory The feed category that will be replaced by the first parameter.
     * @throws NotExistFeedCategoryError if the oldFeedCategory is not existing in the category tree.
     * @deprecated @throws InvalidFeedCategoryIdError if the new feed category has an id that is already defined in the category tree.
     * @returns a promise with a value of true if the update operation succeeds otherwise it might throw an error.
     */
    JSONFeedConfigManager.prototype.updateFeedCategory = function (newFeedCategory, oldFeedCategoryId) {
        var _this = this;
        var updateFeedCategoryPromise = new Promise(function (resolve, reject) {
            var feedCategoryToUpdate = FeedConfigManager_1.feedCategoryExist(oldFeedCategoryId, _this.ROOT_CATEGORY);
            if (!feedCategoryToUpdate) {
                reject(new FeedConfigManager_1.NotExistFeedCategoryError("The feed category to be updated is not existing in the category tree!"));
                return;
            }
            /*if(categoryIdExist(newFeedCategory.categoryId, this.ROOT_CATEGORY)) {
                reject(new InvalidFeedCategoryIdError(`The updated feed category has a category id which is already existing in the category tree!`));
                return;
            }
            */
            Object.assign(feedCategoryToUpdate, newFeedCategory);
            fs_1.writeFile(_this.CATEGORY_LIST_FILE_PATH, JSON.stringify(_this.ROOT_CATEGORY), function (err) {
                if (err)
                    reject(err);
                else
                    resolve(true);
            });
        });
        return updateFeedCategoryPromise;
    };
    /**
     * The method that deletes a given feed category from a category tree.
     * It makes sure that the root category is not being deleted.
     * @param feedCategoryId The feed category that needs to be deleted.
     * @throws InvalidFeedCategoryError if root category is intented to be deleted.
     * @returns a promise with a value of true if the deletion of feed category succeeds otherwise it might throw an error.
     */
    JSONFeedConfigManager.prototype.deleteFeedCategory = function (feedCategoryId) {
        var _this = this;
        var deleteFeedCategoryPromise = new Promise(function (resolve, reject) {
            var feedCategory = FeedConfigManager_1.getCategoryById(feedCategoryId, _this.ROOT_CATEGORY);
            if (feedCategory === _this.ROOT_CATEGORY) {
                reject(new FeedConfigManager_1.InvalidFeedCategoryError("The root category cannot be deleted!"));
                return;
            }
            // If the given feed category is not existing in the category tree at all, then return resolved with false value.
            if (!FeedConfigManager_1.feedCategoryExist(feedCategoryId, _this.ROOT_CATEGORY)) {
                resolve(false);
                return;
            }
            // Delete the object from the memory representation of the tree.
            var feedCategoryDeletedFromTree = ConfigUtil_1.deleteFeedCategoryFromCategoryTree(feedCategory, _this.ROOT_CATEGORY);
            if (!feedCategoryDeletedFromTree) {
                resolve(false);
                return;
            }
            fs_1.writeFile(_this.CATEGORY_LIST_FILE_PATH, JSON.stringify(_this.ROOT_CATEGORY), function (err) {
                if (err)
                    reject(err);
                else
                    resolve(true);
            });
        });
        return deleteFeedCategoryPromise;
    };
    JSONFeedConfigManager.prototype.getRootCategory = function () {
        return this.ROOT_CATEGORY;
    };
    JSONFeedConfigManager.prototype.getFeedConfigs = function () {
        return this.FEED_CONFIGS;
    };
    JSONFeedConfigManager.prototype.getFeedConfig = function (feedId) {
        var filteredFeedConfig = this.FEED_CONFIGS.filter(function (fc) { return fc.feedConfigId === feedId; });
        return filteredFeedConfig.length !== 0 ? filteredFeedConfig[0] : null;
    };
    JSONFeedConfigManager.prototype.getFeedConfigCount = function () {
        return this.FEED_CONFIGS.length;
    };
    return JSONFeedConfigManager;
}());
exports.default = JSONFeedConfigManager;
//# sourceMappingURL=JSONFeedConfigManager.js.map