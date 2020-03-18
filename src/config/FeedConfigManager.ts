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
 * The function that checks whether a given FeedCategory object exist in a tree.
 * 
 * @param categoryIdToSearch The object that will be searched on the feed category tree.
 * @param objToLookFor The feed category tree that will be looked for.
 * @see JSONFeedConfigManager
 */
export function feedCategoryExist(categoryIdToSearch: string, objToLookFor : FeedCategory) : FeedCategory | null {

    if (categoryIdToSearch === objToLookFor.categoryId) return objToLookFor;
    
    for (const cc of objToLookFor.childCategories)
        if(feedCategoryExist(categoryIdToSearch, cc)) return cc;
    
    return null;
}

/**
 * The method that returns a specific feed category from the category tree.
 * If the given category id cannot be found then it returns null.
 * @param categoryId The id of the category that will be searched for.
 * @param nodeToLookFor The node of the tree that category id will be looked inside.
 */
export function getCategoryById(categoryId : string, nodeToLookFor : FeedCategory) : FeedCategory | null {
    if (nodeToLookFor.categoryId === categoryId) return nodeToLookFor;

    for (const cc of nodeToLookFor.childCategories) {
        const node = getCategoryById(categoryId, cc);

        if (node !== null) return node;
    }

    return null;
}

/**
 * The interface that represents the operations regarding feed configurations.
 * All classes that implement this interface is considered as managers of feed configurations.
 * @see JSONFeedConfigManager
 */
export interface FeedConfigManager {
    addFeedConfig(feedConfig : FeedConfig) : Promise<boolean>,
    updateFeedConfig(feedId : string, feedConfig : FeedConfig) : Promise<boolean>,
    deleteFeedConfig(feedId : string) : Promise<boolean>,
    
    addFeedCategory(feedCategory : FeedCategory, parentCategoryId : string) : Promise<boolean>,
    updateFeedCategory(newFeedCategory : FeedCategory, oldFeedCategoryId : string) : Promise<boolean>,
    deleteFeedCategory(feedCategoryId : string) : Promise<boolean>,
    getRootCategory() : FeedCategory,

    getFeedConfigs() : FeedConfig[],
    getFeedConfig(feedId : string) : FeedConfig | null,
    getFeedConfigCount() : number    
}

export class InvalidFeedConfigIdError extends Error {}

export class NotUniqueFeedConfigIdError extends Error {}

export class NotExistFeedCategoryError extends Error {}

export class InvalidFeedCategoryIdError extends Error {}

export class InvalidFeedCategoryError extends Error {}

export class InvalidFeedConfigError extends Error {}