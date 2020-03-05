import { FeedConfigManager, FeedConfig, FeedCategory, InvalidFeedConfigIdError, NotUniqueFeedConfigIdError, DEFAULT_ROOT_CATEGORY, NotExistFeedCategoryError, InvalidFeedCategoryIdError, InvalidFeedCategoryError, feedCategoryExist, getCategoryById, InvalidFeedConfigError } from "./FeedConfigManager";
import { existsSync, mkdirSync, writeFile, readdirSync, readFileSync, writeFileSync, } from "fs";
import { sep } from "path";
import { sync } from "rimraf";
import { isFeedConfig, categoryIdExist, deleteFeedCategoryFromCategoryTree} from "./ConfigUtil";
import logger from "../utils/Logger";
import { isDuration } from "../time/Duration";

/**
 * The feed configuration manager class that represents how feed configurations are dealt in Nelly via JSON format. 
 * @author cemozden
 * @see FeedConfigManager
 */
export default class JSONFeedConfigManager implements FeedConfigManager {
       
    private readonly FEED_CONFIG_FILE_PATTERN : string = '[a-zA-Z0-9]{8}\\.json';
    private readonly CATEGORY_LIST_FILE_NAME = 'category.json';

    private readonly FEEDS_FOLDER : string;
    private readonly CATEGORY_LIST_FILE_PATH : string;
    private readonly LOG_LABEL = 'FeedConfig';

    private readonly FEED_CONFIGS : FeedConfig[];
    private readonly ROOT_CATEGORY : FeedCategory;

    /**
     * @param feedsFolderPath A folder path that will be used to place and read feed configurations as well as the feed categories.
     */
    constructor(feedsFolderPath : string) {
        this.FEED_CONFIGS = [];
        this.FEEDS_FOLDER = feedsFolderPath;
        this.CATEGORY_LIST_FILE_PATH = `${this.FEEDS_FOLDER}${sep}${this.CATEGORY_LIST_FILE_NAME}`;
        
        if (!existsSync(feedsFolderPath)){
            logger.info(`[${this.LOG_LABEL}] Feeds folder does not exist.`);
            mkdirSync(feedsFolderPath);
            logger.info(`[${this.LOG_LABEL}] Feeds folder created. Path: ${feedsFolderPath}`);
        }
        /* Read existing feed configurations and place them into FEED_CONFIGS array.
           The file format is a string which is 8 length. with .json extension
        */
        const feedConfigFiles = readdirSync(feedsFolderPath)
            .filter(fileName => fileName.match(this.FEED_CONFIG_FILE_PATTERN));

        feedConfigFiles.forEach(feedConfigFile => {
            const fileAbsolutePath = `${this.FEEDS_FOLDER}${sep}${feedConfigFile}`;
            const fcObject = JSON.parse(readFileSync(fileAbsolutePath).toString())
            
            // If the read object is only a FeedConfig object then add it.
            // Skip other files that matches the given pattern. 
            if (isFeedConfig(fcObject)) {

                // If the read id is already existing in the feed config list then throw error.
                // Because all ids must be unique.
                if (this.FEED_CONFIGS.map(fc => fc.feedConfigId).includes(fcObject.feedConfigId))
                    throw new NotUniqueFeedConfigIdError('Unable to load feed configurations. All feed configurations must have unique ids!');

                this.FEED_CONFIGS.push(fcObject);
                logger.verbose(`[${this.LOG_LABEL}] ${feedConfigFile} is loaded.`);
            }
        });
        
        // If category.json file is not existing, then create it and write the root category into the file.
        // Otherwise directly read it from category.json file
        if (!existsSync(this.CATEGORY_LIST_FILE_PATH)) {
            writeFileSync(this.CATEGORY_LIST_FILE_PATH, JSON.stringify(DEFAULT_ROOT_CATEGORY));
            this.ROOT_CATEGORY = DEFAULT_ROOT_CATEGORY;
            logger.info(`[${this.LOG_LABEL}] category.json is created. Path: ${this.CATEGORY_LIST_FILE_PATH}`);
        }
        else this.ROOT_CATEGORY = JSON.parse(readFileSync(this.CATEGORY_LIST_FILE_PATH).toString());

    }

    /**
     * The method that adds the given feed configuration into the system.
     * it makes sure that all feed configurations have unique ids.
     * If the given feed config has an id that is alreadt existing, it throws NotUniqueFeedConfigIdError error.
     * @returns A promise that yields true if feed config is added successfully. Otherwise it might throw an error. 
     * @throws NotUniqueFeedConfigIdError
     */
    addFeedConfig(feedConfig : FeedConfig) : Promise<boolean> {
        const addFeedPromise : Promise<boolean> = new Promise((resolve, reject) => {
            // If feed config list has a feed that has the same id with the given parameter then throw NotUniqueFeedConfigIdError.
            if (this.FEED_CONFIGS.map(fc => fc.feedConfigId).includes(feedConfig.feedConfigId)) {
                reject(new NotUniqueFeedConfigIdError(`The feed config id is not unique. There is already a feed config which has the same feed config id ${feedConfig.feedConfigId}`));
                return;
            }

            // If the category does not exist in the category tree then reject feed addition.
            if(!categoryIdExist(feedConfig.categoryId, this.ROOT_CATEGORY)) {
                reject(new InvalidFeedCategoryIdError(`The given category id "${feedConfig.categoryId}" does not exist!`));
                return;
            }
            // If the given URL already exists in the system then reject feed addition.
            if (this.FEED_CONFIGS.map(fc => fc.url).includes(feedConfig.url)) {
                reject(new InvalidFeedConfigError(`The given URL "${feedConfig.url}" is already existing in the system!`));
                return;
            }

            // If the given Fetch Period is not a valid Duration object then reject the addition.
            if(!isDuration(feedConfig.fetchPeriod)) {
                reject(new InvalidFeedConfigError(`The given Fetch Period "${JSON.stringify(feedConfig.fetchPeriod)}" is not a valid fetch period!!`));
                return;
            }

            // Write the feed config into the file and add it into FEED_CONFIGS list.
            const feedJSON = JSON.stringify(feedConfig);
            writeFile(`${this.FEEDS_FOLDER}${sep}${feedConfig.feedConfigId}.json`, feedJSON, (err) => {
                if (err) reject(err);
                else{
                   this.FEED_CONFIGS.push(feedConfig);
                   resolve(true);
                } 
            });
        });

        return addFeedPromise;
    }

    /**
     * The method that updates a specific feed configuration defined already in the system.
     * The method makes sure that a given feed id is already existing in the feed configuration.
     * @param feedConfigId The id of a feed configuration which will be updated
     * @param feedConfig The feed that will be replaced.
     * @throws InvalidFeedConfigIdError if the given feed id is not existing.
     * @returns a promise with a true value if update operation succeeds otherwise it might 
     */
    updateFeedConfig(feedConfigId : string, feedConfig: FeedConfig): Promise<boolean> {
        const updatePromise = new Promise<boolean>((resolve, reject) => {
            const feedIdIndex = this.FEED_CONFIGS.map(fc => fc.feedConfigId).indexOf(feedConfigId);
            
            if (feedIdIndex === -1) 
                reject(new InvalidFeedConfigIdError(`Update failed. There is no feed config with the id "${feedConfigId}".`));
            else if (feedConfigId !== feedConfig.feedConfigId)
                reject(new InvalidFeedConfigIdError(`The feed configuration id of a specific feed configuration cannot be updated`));
            else if(!categoryIdExist(feedConfig.categoryId, this.ROOT_CATEGORY)) 
                reject(new InvalidFeedCategoryIdError(`The given category id "${feedConfig.categoryId}" does not exist!`));
            else if(!isDuration(feedConfig.fetchPeriod))
                reject(new InvalidFeedConfigError(`The given Fetch Period "${JSON.stringify(feedConfig.fetchPeriod)}" is not a valid fetch period!!`));
            else {
                this.FEED_CONFIGS[feedIdIndex] = feedConfig;
                
                const feedConfigFilePath = `${this.FEEDS_FOLDER}${sep}${feedConfigId}.json`;
                writeFile(feedConfigFilePath, JSON.stringify(feedConfig), err => {
                    if (err) reject(err);
                    else resolve(true);
                });
            }
            
        });

        return updatePromise;
    }
    
    /**
     * The method that deletes a specific feed configuration by receiving its id as a parameter.
     * The method makes sure that the given feed id is already existing in the system.
     * @param feedId The feed id of a specific feed configuration that needs to be deleted.
     * @throws InvalidFeedConfigIdError if the given feed config is not existing.
     * @returns a promise with a value of true if the deletion succeeds otherwise it might yield an error.
     */
    deleteFeedConfig(feedId : string): Promise<boolean> {
        const deletePromise = new Promise<boolean>((resolve, reject) => {
            const feedIdIndex = this.FEED_CONFIGS.map(fc => fc.feedConfigId).indexOf(feedId);
            
            if (feedIdIndex === -1) 
                reject(new InvalidFeedConfigIdError(`Deletion failed. There is no feed config with the id "${feedId}".`));
            else {
                this.FEED_CONFIGS.splice(feedIdIndex, 1);
                
                const feedConfigFilePath = `${this.FEEDS_FOLDER}${sep}${feedId}.json`;
                sync(feedConfigFilePath);
                
                resolve(true);
            }
        });

        return deletePromise;
    }

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
    addFeedCategory(feedCategory: FeedCategory, parentCategoryId : string): Promise<boolean> {
        const addFeedCategoryPromise = new Promise<boolean>((resolve, reject) => {
            
            if (!feedCategoryExist(parentCategoryId, this.ROOT_CATEGORY)){
                reject(new NotExistFeedCategoryError(`The feed category provided is not existing the category tree!`));
                return;
            }

            if (categoryIdExist(feedCategory.categoryId, this.ROOT_CATEGORY)) {
                reject(new InvalidFeedCategoryIdError(`The feed category id "${feedCategory.categoryId}" is already existing in the category tree!`));
                return;
            }

            if (feedCategory.name.length === 0) {
                reject(new InvalidFeedCategoryError(`The category name cannot be empty!`));
                return;
            }

            // Add the given new category into the child category list of its parent.
            const parentCategory = getCategoryById(parentCategoryId, this.ROOT_CATEGORY);
            parentCategory.childCategories.push(feedCategory);
            
            writeFile(this.CATEGORY_LIST_FILE_PATH, JSON.stringify(this.ROOT_CATEGORY), err => {
                if (err) reject(err);
                else resolve(true);
            });

        });

        return addFeedCategoryPromise;
    }

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
    updateFeedCategory(newFeedCategory: FeedCategory, oldFeedCategoryId : string): Promise<boolean> {
        const updateFeedCategoryPromise = new Promise<boolean>((resolve, reject) => {
        const feedCategoryToUpdate = feedCategoryExist(oldFeedCategoryId, this.ROOT_CATEGORY); 
            
            if (!feedCategoryToUpdate) {
                reject(new NotExistFeedCategoryError(`The feed category to be updated is not existing in the category tree!`));
                return;
            }

            /*if(categoryIdExist(newFeedCategory.categoryId, this.ROOT_CATEGORY)) {
                reject(new InvalidFeedCategoryIdError(`The updated feed category has a category id which is already existing in the category tree!`));
                return;
            }
            */
            Object.assign(feedCategoryToUpdate, newFeedCategory);
            
            writeFile(this.CATEGORY_LIST_FILE_PATH, JSON.stringify(this.ROOT_CATEGORY), err => {
                if(err) reject(err);
                else resolve(true);
            });

        });

        return updateFeedCategoryPromise;
    }

    /**
     * The method that deletes a given feed category from a category tree.
     * It makes sure that the root category is not being deleted.
     * @param feedCategoryId The feed category that needs to be deleted.
     * @throws InvalidFeedCategoryError if root category is intented to be deleted.
     * @returns a promise with a value of true if the deletion of feed category succeeds otherwise it might throw an error.
     */
    deleteFeedCategory(feedCategoryId: string): Promise<boolean> {

        const deleteFeedCategoryPromise = new Promise<boolean>((resolve, reject) => {
            const feedCategory = getCategoryById(feedCategoryId, this.ROOT_CATEGORY);
            if (feedCategory === this.ROOT_CATEGORY) {
                reject(new InvalidFeedCategoryError(`The root category cannot be deleted!`));
                return;
            }
            // If the given feed category is not existing in the category tree at all, then return resolved with false value.
            if (!feedCategoryExist(feedCategoryId, this.ROOT_CATEGORY)) {
                resolve(false);
                return;
            }

            // Delete the object from the memory representation of the tree.
            const feedCategoryDeletedFromTree = deleteFeedCategoryFromCategoryTree(feedCategory, this.ROOT_CATEGORY);

            if (!feedCategoryDeletedFromTree) {
                resolve(false);
                return;
            }

            writeFile(this.CATEGORY_LIST_FILE_PATH, JSON.stringify(this.ROOT_CATEGORY), err => {
                if (err) reject(err);
                else resolve(true);
            });

        });

        return deleteFeedCategoryPromise;
    }

    getRootCategory() : FeedCategory {
        return this.ROOT_CATEGORY;
    }

    getFeedConfigs(): FeedConfig[] {
        return this.FEED_CONFIGS;
    }

    getFeedConfig(feedId: string): FeedConfig | null {
        const filteredFeedConfig = this.FEED_CONFIGS.filter(fc => fc.feedConfigId === feedId);
        return filteredFeedConfig.length !== 0 ? filteredFeedConfig[0] : null;
    }

    getFeedConfigCount() : number {
        return this.FEED_CONFIGS.length;
    }

}

