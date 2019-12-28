import { FeedConfig, FeedCategory, MANDATORY_FEED_CONFIG_PARAMS } from "./FeedConfigManager";

export function isFeedConfig(obj : any) : obj is FeedConfig {
    
    const objectKeys = Object.keys(obj);

    return MANDATORY_FEED_CONFIG_PARAMS
        .filter(k => !objectKeys.includes(k)).length === 0;
}

export function feedCategoryExist(objToSearch: FeedCategory, objToLookFor : FeedCategory): boolean {
    
    if (JSON.stringify(objToSearch) === JSON.stringify(objToLookFor)) return true;
    
    for (const cc of objToLookFor.childCategories)
        if(feedCategoryExist(objToSearch, cc)) return true;
    
    return false;
}

export function categoryIdExist(categoryId : string, feedCategory : FeedCategory) : boolean {
    if (feedCategory.categoryId === categoryId) return true;

    for (const fc of feedCategory.childCategories) {
        if (categoryIdExist(categoryId, fc)) return true;
    }

    return false;
}