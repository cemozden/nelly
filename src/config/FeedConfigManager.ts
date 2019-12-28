import Duration from "../time/Duration";

export interface FeedConfig {
    feedId : string,
    categoryId : string,
    name : string,
    url : string,
    fetchPeriod : Duration,
    iconURL? : string,
    enabled : boolean
}

export const MANDATORY_FEED_CONFIG_PARAMS = ['feedId', 'categoryId', 'name', 'url', 'fetchPeriod', 'enabled'];

export interface FeedCategory {
    categoryId : string,
    name : string,
    childCategories : FeedCategory[],
    visible? : boolean
}

export const DEFAULT_ROOT_CATEGORY : FeedCategory = {
    categoryId : 'root',
    childCategories : [],
    name : 'Root',
    visible : true
};

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