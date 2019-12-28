import { FeedConfig, FeedCategory, MANDATORY_FEED_CONFIG_PARAMS } from "./FeedConfigManager";

export function isFeedConfig(obj : any) : obj is FeedConfig {
    
    const objectKeys = Object.keys(obj);

    return MANDATORY_FEED_CONFIG_PARAMS
        .filter(k => !objectKeys.includes(k)).length === 0;
}

export function feedCategoryExist(objToSearch: FeedCategory, objToLookFor : FeedCategory) : FeedCategory | null {
    const param1Json = JSON.stringify(objToSearch);
    const param2Json = JSON.stringify(objToLookFor);

    if (param1Json === param2Json) return objToLookFor;
    
    for (const cc of objToLookFor.childCategories)
        if(feedCategoryExist(objToSearch, cc)) return cc;
    
    return null;
}

export function categoryIdExist(categoryId : string, feedCategory : FeedCategory) : boolean {
    if (feedCategory.categoryId === categoryId) return true;

    for (const fc of feedCategory.childCategories) {
        if (categoryIdExist(categoryId, fc)) return true;
    }

    return false;
}

export function deleteFeedCategoryFromCategoryTree(feedCategoryToDelete : FeedCategory, categoryTree : FeedCategory) : boolean {
    const categoryIndex = categoryTree.childCategories.indexOf(feedCategoryToDelete);
    if (categoryIndex !== -1) {
        categoryTree.childCategories.splice(categoryIndex, 1);
        return true;
    }
    else {
        for (const cc of categoryTree.childCategories) {
            if (deleteFeedCategoryFromCategoryTree(feedCategoryToDelete, cc)) return true;
        }
    }

    return false;
}