import { DATABASE_INSTANCE } from "./SQLiteDatabase";

export const FEEDS_TABLE_NAME = 'feeds';
export const FEED_ITEMS_TABLE_NAME = 'feedItems';

export function initializeDb() : void {

    DATABASE_INSTANCE.run(`CREATE TABLE IF NOT EXISTS ${FEEDS_TABLE_NAME}(
        feedId char(8) PRIMARY KEY,
        version char(1),
        title varchar(255),
        link varchar(255),
        description varchar(255)
    );`);

    DATABASE_INSTANCE.run(`CREATE TABLE IF NOT EXISTS ${FEED_ITEMS_TABLE_NAME} (
        itemId char(8),
	    feedId char(8),
	    title TEXT,
	    description TEXT,
	    link varchar(255),
	    author varchar(150),
	    category TEXT,
	    comments varchar(250),
	    pubDate datetime,
	    enclosure TEXT,
	    guid TEXT,
	    source TEXT,
	    FOREIGN KEY(feedId) REFERENCES feeds(feedId) ON DELETE CASCADE
    );`);

}