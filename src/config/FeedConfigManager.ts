import Duration from "../time/Duration";

/**
 * The interface that represents a specific RSS feed configuration.
 */
export interface FeedConfig {
    feedConfigId : string,
    categoryId : string,
    name : string,
    url : string,
    fetchPeriod : Duration,
    iconURL? : string,
    enabled : boolean
}

/** Mandatory feed config parameters to be checked during runtime.
  * @see ConfigUtil
*/
export const MANDATORY_FEED_CONFIG_PARAMS = ['feedConfigId', 'categoryId', 'name', 'url', 'fetchPeriod', 'enabled'];

/**
 * A tree that represents the feed categories in Nelly.
 */
export interface FeedCategory {
    categoryId : string,
    name : string,
    childCategories : FeedCategory[],
    visible? : boolean
}

/**
 * The root category of Nelly.
 * This category is written to category.json file if no category.json file is existing. 
 * @see JSONFeedConfigManager
 */
export const DEFAULT_ROOT_CATEGORY : FeedCategory = {
    categoryId : 'root',
    childCategories : [],
    name : 'Root',
    visible : true
};

/**
 * The interface that represents the operations regarding feed configurations.
 * All classes that implement this interface is considered as managers of feed configurations.
 * @see JSONFeedConfigManager
 */
export interface FeedConfigManager {
    addFeedConfig(feedConfig : FeedConfig) : Promise<boolean>,
    updateFeedConfig(feedId : string, feedConfig : FeedConfig) : Promise<boolean>,
    deleteFeedConfig(feedId : string) : Promise<boolean>,
    
    addFeedCategory(feedCategory : FeedCategory, parent : FeedCategory) : Promise<boolean>,
    updateFeedCategory(newFeedCategory : FeedCategory, oldFeedCategory : FeedCategory) : Promise<boolean>,
    deleteFeedCategory(feedCategory : FeedCategory) : Promise<boolean>,
    getRootCategory() : FeedCategory,

    getFeedConfigs() : FeedConfig[],
    getFeedConfig(feedId : string) : FeedConfig | null,
    getFeedConfigCount() : number    
}

export class InvalidFeedConfigIdError extends Error {
    constructor(message : string) {
        super(message);
    }
}

export class NotUniqueFeedConfigIdError extends Error {
    constructor(message : string) {
        super(message);
    }
}

export class NotExistFeedCategoryError extends Error {
    constructor(message : string) {
        super(message);
    }
}

export class InvalidFeedCategoryIdError extends Error {
    constructor(message : string) {
        super(message);
    }
}

export class InvalidFeedCategoryError extends Error {
    constructor(message: string) {
        super(message);
    }
}