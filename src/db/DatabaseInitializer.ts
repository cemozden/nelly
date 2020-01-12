import { DATABASE_INSTANCE } from "./SQLiteDatabase";
import logger from "../utils/Logger";

export const FEEDS_TABLE_NAME = 'feeds';
export const FEED_ITEMS_TABLE_NAME = 'feedItems';

export function initializeDb() : void {

    DATABASE_INSTANCE.run(`CREATE TABLE IF NOT EXISTS ${FEEDS_TABLE_NAME}(
        feedId char(8) PRIMARY KEY NOT NULL,
        version char(1) NOT NULL,
        title varchar(255) NOT NULL,
        link varchar(255) NOT NULL,
        description varchar(255) NOT NULL
    );`, err => {
		if (err) {
			logger.error(`[initializeDb] ${err.message}`);
		};
	});

    DATABASE_INSTANCE.run(`CREATE TABLE IF NOT EXISTS ${FEED_ITEMS_TABLE_NAME} (
        itemId char(8) NOT NULL,
	    feedId char(8) NOT NULL,
	    title TEXT NOT NULL,
	    description TEXT NOT NULL,
	    link varchar(255),
	    author varchar(150),
	    category TEXT,
	    comments varchar(250),
	    pubDate datetime,
	    enclosure TEXT,
	    guid TEXT,
	    source TEXT,
	    FOREIGN KEY(feedId) REFERENCES feeds(feedId) ON DELETE CASCADE
    );`,err => {
		if (err) {
			logger.error(`[initializeDb] ${err.message}`);
		};
	});

}