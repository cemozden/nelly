import BetterSQLite3 from "better-sqlite3";
import { sep } from "path";
import { existsSync, mkdirSync } from "fs";
import general_logger from "../utils/Logger";

/**
 * The class that generates the SQLite database instance of the application.
 * If any error occurs while trying to create/access the file, then the function shows up messages box with the error and exits the applcation.
 * @author cemozden
 */
export default class SQLiteDatabase {
    private static dbInstance : BetterSQLite3.Database;
    private static readonly databaseFolderPath =  process.env.NODE_ENV === 'test' ? `${process.env.PWD}${sep}testresources${sep}` : process.env.DATABASE_FOLDER;
    
    static FEEDS_TABLE_NAME = 'feeds';
    static FEED_ITEMS_TABLE_NAME = 'feedItems';

    private static initializeDb() : void {
        try {
            this.getDatabaseInstance().exec(`CREATE TABLE IF NOT EXISTS ${this.FEEDS_TABLE_NAME}(
                feedId char(8) PRIMARY KEY NOT NULL,
                version char(1) NOT NULL,
                title varchar(255) NOT NULL,
                link varchar(255) NOT NULL,
                description varchar(255) NOT NULL,
                imageURL varchar(255) NULL,
                insertedAt datetime
            );`);
    
            this.getDatabaseInstance().exec(`CREATE TABLE IF NOT EXISTS ${this.FEED_ITEMS_TABLE_NAME} (
                itemId char(8) NOT NULL,
                feedId char(8) NOT NULL,
                title TEXT,
                description TEXT,
                link varchar(255),
                author varchar(150),
                category TEXT,
                comments varchar(250),
                pubDate datetime NOT NULL,
                enclosure TEXT,
                guid TEXT,
                source TEXT,
                itemRead char(1) NOT NULL,
                insertedAt datetime NOT NULL,
                FOREIGN KEY(feedId) REFERENCES feeds(feedId) ON DELETE CASCADE
            );`);
        }
        catch(err) {
            general_logger.error(`[initializeDb] ${err.message}`);
            process.exit(-1);
        }
               
    }

    static getDatabaseInstance() : BetterSQLite3.Database {
        
        if (this.dbInstance === undefined) {
            
            if (!existsSync(this.databaseFolderPath))
                mkdirSync(this.databaseFolderPath);

            try {
                const dbOptions = {
                    verbose : general_logger.verbose
                };
                // Activate verbose if the environment is not production.
                this.dbInstance = new BetterSQLite3(`${this.databaseFolderPath}nelly.db`, process.env.NODE_ENV === 'production' ? undefined : dbOptions);
                this.initializeDb();
            }
            catch (err) {
                general_logger.error(`[SQLiteDatabase->getDatabaseInstance()] ${err.message}`);
                process.exit(-1);
            }
            
            return this.dbInstance;
        }
        else return this.dbInstance;
    }

}