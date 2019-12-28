import { FeedConfigManager, FeedConfig, FeedCategory, InvalidFeedConfigIdError, NotUniqueFeedConfigIdError, DEFAULT_ROOT_CATEGORY, NotExistFeedCategoryError, InvalidFeedCategoryIdError, InvalidFeedCategoryError } from "./FeedConfigManager";
import { existsSync, mkdirSync, writeFile, readdirSync, readFileSync, writeFileSync, } from "fs";
import { sep } from "path";
import { sync } from "rimraf";
import { isFeedConfig, feedCategoryExist, categoryIdExist, deleteFeedCategoryFromCategoryTree} from "./ConfigUtil";

export default class JSONFeedConfigManager implements FeedConfigManager {
       
    private readonly FEED_CONFIG_FILE_PATTERN : string = '[a-zA-Z0-9]{8}\.json';
    private readonly CATEGORY_LIST_FILE_NAME = 'category.json';

    private readonly FEEDS_FOLDER : string;
    private readonly CATEGORY_LIST_FILE_PATH : string;
    
    private readonly FEED_CONFIGS : FeedConfig[];
    private readonly ROOT_CATEGORY : FeedCategory;

    constructor(feedsFolderPath : string) {
        this.FEED_CONFIGS = [];
        this.FEEDS_FOLDER = feedsFolderPath;
        this.CATEGORY_LIST_FILE_PATH = `${this.FEEDS_FOLDER}${sep}${this.CATEGORY_LIST_FILE_NAME}`;
        
        if (!existsSync(feedsFolderPath))
            mkdirSync(feedsFolderPath);

        const feedConfigFiles = readdirSync(feedsFolderPath)
            .filter(fileName => fileName.match(this.FEED_CONFIG_FILE_PATTERN));

        feedConfigFiles.forEach(feedConfigFile => {
            const fileAbsolutePath = `${this.FEEDS_FOLDER}${sep}${feedConfigFile}`;
            const fcObject = JSON.parse(readFileSync(fileAbsolutePath).toString())

            if (isFeedConfig(fcObject))
                this.FEED_CONFIGS.push(fcObject);

        });
        
        if (!existsSync(this.CATEGORY_LIST_FILE_PATH)) {
            writeFileSync(this.CATEGORY_LIST_FILE_PATH, JSON.stringify(DEFAULT_ROOT_CATEGORY));
            this.ROOT_CATEGORY = DEFAULT_ROOT_CATEGORY;
        }
        else this.ROOT_CATEGORY = JSON.parse(readFileSync(this.CATEGORY_LIST_FILE_PATH).toString());

    }

    addFeedConfig(feed : FeedConfig) : Promise<boolean> {
        const addFeedPromise : Promise<boolean> = new Promise((resolve, reject) => {
            if (this.FEED_CONFIGS.map(fc => fc.feedId).includes(feed.feedId)) {
                reject(new NotUniqueFeedConfigIdError(`The feed config id is not unique. There is already a feed config which has the same feed config id ${feed.feedId}`));
                return;
            }
            
            const feedJSON = JSON.stringify(feed);
            writeFile(`${this.FEEDS_FOLDER}${sep}${feed.feedId}.json`, feedJSON, (err) => {
                if (err) reject(err);
                else{
                   this.FEED_CONFIGS.push(feed);
                   resolve(true);
                } 
            });
        });

        return addFeedPromise;
    }

    updateFeedConfig(feedId : string, feed: FeedConfig): Promise<boolean> {
        const updatePromise = new Promise<boolean>((resolve, reject) => {
            const feedIdIndex = this.FEED_CONFIGS.map(fc => fc.feedId).indexOf(feedId);
            
            if (feedIdIndex === -1) 
                reject(new InvalidFeedConfigIdError(`Update failed. There is no feed config with the id "${feedId}".`));
            else {
                this.FEED_CONFIGS[feedIdIndex] = feed;
                
                const feedConfigFilePath = `${this.FEEDS_FOLDER}${sep}${feedId}.json`;
                writeFile(feedConfigFilePath, JSON.stringify(feed), err => {
                    if (err) reject(err);
                    else resolve(true);
                });
            }
            
        });

        return updatePromise;
    }
    
    deleteFeedConfig(feedId : string): Promise<boolean> {
        const deletePromise = new Promise<boolean>((resolve, reject) => {
            const feedIdIndex = this.FEED_CONFIGS.map(fc => fc.feedId).indexOf(feedId);
            
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

    addFeedCategory(feedCategory: FeedCategory, parent : FeedCategory): Promise<boolean> {
        const addFeedCategoryPromise = new Promise<boolean>((resolve, reject) => {
            
            if (!feedCategoryExist(parent, this.ROOT_CATEGORY)){
                reject(new NotExistFeedCategoryError(`The feed category provided is not existing the category tree!`));
                return;
            }

            if (categoryIdExist(feedCategory.categoryId, this.ROOT_CATEGORY)) {
                reject(new InvalidFeedCategoryIdError(`The feed category id "${feedCategory.categoryId}" is already existing in the category tree!`));
                return;
            }

            parent.childCategories.push(feedCategory);
            
            writeFile(this.CATEGORY_LIST_FILE_PATH, JSON.stringify(this.ROOT_CATEGORY), err => {
                if (err) reject(err);
                else resolve(true);
            });

        });

        return addFeedCategoryPromise;
    }

    updateFeedCategory(newFeedCategory: FeedCategory, oldFeedCategory : FeedCategory): Promise<boolean> {
        const updateFeedCategoryPromise = new Promise<boolean>((resolve, reject) => {
        const feedCategoryToUpdate = feedCategoryExist(oldFeedCategory, this.ROOT_CATEGORY); 
            
            if (!feedCategoryToUpdate) {
                reject(new NotExistFeedCategoryError(`The feed category to be updated is not existing in the category tree!`));
                return;
            }

            if(categoryIdExist(newFeedCategory.categoryId, this.ROOT_CATEGORY)) {
                reject(new InvalidFeedCategoryIdError(`The updated feed category has a category id which is already existing in the category tree!`));
                return;
            }
            
            Object.assign(feedCategoryToUpdate, newFeedCategory);
            
            writeFile(this.CATEGORY_LIST_FILE_PATH, JSON.stringify(this.ROOT_CATEGORY), err => {
                if(err) reject(err);
                else resolve(true);
            });

        });

        return updateFeedCategoryPromise;
    }

    deleteFeedCategory(feedCategory: FeedCategory): Promise<boolean> {

        const deleteFeedCategoryPromise = new Promise<boolean>((resolve, reject) => {
            if (feedCategory === this.ROOT_CATEGORY) {
                reject(new InvalidFeedCategoryError(`The root category cannot be deleted!`));
                return;
            }

            if (!feedCategoryExist(feedCategory, this.ROOT_CATEGORY)) {
                resolve(false);
                return;
            }

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
        const filteredFeedConfig = this.FEED_CONFIGS.filter(fc => fc.feedId === feedId);
        return filteredFeedConfig.length !== 0 ? filteredFeedConfig[0] : null;
    }

    getFeedConfigCount() : number {
        return this.FEED_CONFIGS.length;
    }

}

