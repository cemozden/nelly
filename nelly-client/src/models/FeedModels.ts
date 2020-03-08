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

export interface FeedItem {

}

