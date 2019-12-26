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

const mandatoryFeedConfigParams = ['feedId', 'categoryId', 'name', 'url', 'fetchPeriod', 'enabled'];

export interface FeedCategory {
    categoryId : string,
    parentCategory : FeedCategory | null,
    name : string,
    childCategories : FeedCategory[],
    visible? : boolean
}

export interface FeedConfigManager {
    addFeedConfig(feedConfig : FeedConfig) : Promise<boolean>,
    updateFeedConfig(feedId : string, feedConfig : FeedConfig) : Promise<boolean>,
    deleteFeedConfig(feedId : string) : Promise<boolean>,
    addFeedCategory(feedCategory : FeedCategory) : void,
    updateFeedCategory(feedCategory : FeedCategory) : void,
    deleteFeedCategory(feedCategory : FeedCategory) : void,
    getFeedConfigs() : FeedConfig[],
    getFeedConfig(feedId : string) : FeedConfig | null;
}

export class InvalidFeedConfigIdError extends Error {
    constructor(message : string) {
        super(message);
    }
}

export function isFeedConfig(obj : any) : obj is FeedConfig {
    
    const objectKeys = Object.keys(obj);

    return mandatoryFeedConfigParams
        .filter(k => !objectKeys.includes(k)).length === 0;
}