import { FeedConfig, FeedCategory, MANDATORY_FEED_CONFIG_PARAMS } from "./FeedConfigManager";

/**
 * FeedConfig type guard that is used to check that parameter obj is a FeedConfig instance.
 * @param obj The object that is going to be checked.
 */
export function isFeedConfig(obj : any) : obj is FeedConfig {
    
    const objectKeys = Object.keys(obj);

    return MANDATORY_FEED_CONFIG_PARAMS
        .filter(k => !objectKeys.includes(k)).length === 0;
}

/**
 * The function that returns true if the given category id exist in the given feed category tree.

 * @param categoryId The category id that will be searched
 * @param feedCategory The category tree that id will be searched in
 * @see JSONFeedConfigManager
 */
export function categoryIdExist(categoryId : string, feedCategory : FeedCategory) : boolean {
    if (feedCategory.categoryId === categoryId) return true;

    for (const fc of feedCategory.childCategories) {
        if (categoryIdExist(categoryId, fc)) return true;
    }

    return false;
}

/**
 * The function that deletes a given feed category from a feed category tree.
 * @param feedCategoryToDelete The feed category that will be deleted from the tree
 * @param categoryTree The category tree that the given feed category will be looked and deleted.
 * @see JSONFeedConfigManager
 */
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