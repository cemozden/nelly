import { FeedConfig } from "../FeedModels";

export interface AddFeedSucceedMessage {
    added : boolean,
    feedObject : FeedConfig,
    feeds : FeedConfig[]
}

export interface AddFeedFailedMessage {
    added : boolean,
    message : string
}

export interface DeleteFeedSucceedMessage {
    deleted : boolean,
    deletedObject : FeedConfig,
    feeds : FeedConfig[]
}

export interface DeleteFeedFailedMessage {
    deleted : boolean,
    message : string
}

export function isAddFeedSucceedMessage(obj : any) : obj is AddFeedSucceedMessage {

    if (obj.added === undefined) return false;
    if (obj.feedObject === undefined) return false;
    if (obj.feeds === undefined) return false;

    return obj.added;
}

export function isAddFeedFailedMessage(obj : any) : obj is AddFeedFailedMessage {

    if (obj.added === undefined) return false;
    if (obj.message === undefined) return false;

    return !obj.added;
}

export function isDeleteFeedSucceedMessage(obj : any) : obj is DeleteFeedSucceedMessage {

    if (obj.deleted === undefined) return false;
    if (obj.deletedObject === undefined) return false;
    if (obj.feeds === undefined) return false;

    return obj.deleted;
}

export function isDeleteFeedFailedMessage(obj : any) : obj is DeleteFeedFailedMessage {

    if (obj.deleted === undefined) return false;
    if (obj.message === undefined) return false;

    return !obj.added;
}