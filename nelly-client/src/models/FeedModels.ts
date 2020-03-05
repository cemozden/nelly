import Duration from "../time/Duration";

export interface FeedConfig {

    feedConfigId : string,
    categoryId : string,
    name : string,
    url : string,
    fetchPeriod : Duration,
    iconURL? : string,
    enabled : boolean

}

export interface FeedCategory {
    categoryId : string,
    name : string,
    childCategories : FeedCategory[],
    visible? : boolean
}


export interface FeedItem {

}

export const DEFAULT_ROOT_CATEGORY : FeedCategory = {
    categoryId : 'root',
    childCategories : [],
    name : 'Root',
    visible : true
};