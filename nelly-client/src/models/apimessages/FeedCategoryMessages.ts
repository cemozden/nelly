import { FeedCategory } from "../FeedCategoryModels";

export interface FeedCategoryDeleteSucceedMessage {
    deleted : boolean,
    deletedCategory : FeedCategory
    rootCategory : FeedCategory
}

export interface FeedCategoryDeleteFailedMessage {
    deleted : boolean,
    message : string
}

export interface FeedCategoryAddSucceedMessage {
    added : boolean,
    rootCategory : FeedCategory
}

export interface FeedCategoryAddFailedMessage {
    added : boolean,
    message : string
}

export interface FeedCategoryUpdateSucceedMessage {
    added : boolean,
    rootCategory : FeedCategory
}

export interface FeedCategoryUpdateFailedMessage {
    added : boolean,
    message : string
}

export function isFeedCategoryDeleteSucceedMessage(obj : any) : obj is FeedCategoryDeleteSucceedMessage {
    if (obj.deleted === undefined) return false;
    if (obj.rootCategory === undefined) return false;

    return obj.deleted;
}

export function isFeedCategoryDeleteFailedMessage(obj : any) : obj is FeedCategoryDeleteFailedMessage {
    if (obj.deleted === undefined) return false;
    if (obj.message === undefined) return false;

    return !obj.deleted;
}

export function isFeedCategoryAddSucceedMessage(obj : any) : obj is FeedCategoryAddSucceedMessage {
    if (obj.added === undefined) return false;
    if (obj.rootCategory === undefined) return false;

    return obj.added;
}

export function isFeedCategoryAddFailedMessage(obj : any) : obj is FeedCategoryAddFailedMessage {
    if (obj.added === undefined) return false;
    if (obj.message === undefined) return false;

    return !obj.added;
}

export function isFeedCategoryUpdateSucceedMessage(obj : any) : obj is FeedCategoryUpdateSucceedMessage {
    if (obj.updated === undefined) return false;
    if (obj.rootCategory === undefined) return false;

    return obj.updated;
}

export function isFeedCategoryUpdateFailedMessage(obj : any) : obj is FeedCategoryUpdateFailedMessage {
    if (obj.updated === undefined) return false;
    if (obj.message === undefined) return false;

    return !obj.updated;
}