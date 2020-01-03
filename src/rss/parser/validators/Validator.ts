import { RSSVersion } from "../../specifications/RSSVersion";

/**
 * The interface that express the validation strategy of RSS feeds.
 * The classes that implement this interface are responsible to validate XML RSS objects
 * that was read from the RSSParser instances.
 * 
 * It returns the RSS version detected from the obj parameter.
 */
export interface RSSValidator {
    validate(obj : any) : RSSVersion
}

/* The general error class that will be thrown in case object is not a standard RSS feed.*/
export class RSSValidationError extends Error {
    constructor(message : string) {
        super(message);
    }
}