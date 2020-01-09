import * as sqlite3 from "sqlite3";
import { sep } from "path";
import { existsSync, mkdirSync } from "fs";
import logger from "../utils/Logger";



function getDatabaseObject(databaseFolderPath : string) : sqlite3.Database {
    
    if (!existsSync(databaseFolderPath)) 
        mkdirSync(databaseFolderPath);
    
    const sqliteObj = sqlite3.verbose();

    return new sqliteObj.Database(`${databaseFolderPath}nelly.db`, err => {
        if (err) {
            logger.error('[SQLiteDatabase] An error occured while trying to connect to the database!');
            logger.error(`[SQLiteDatabase] ${err?.message}`);
            return;
        }

        //TODO: Create database tables if they don't exist!
        

    });
}

export const DATABASE_INSTANCE : sqlite3.Database = process.env.HOME !== undefined 
    ? getDatabaseObject(`${process.env.HOME}${sep}.nelly${sep}`) 
    : getDatabaseObject(`${process.env.APPLICATION_DIR}${sep}.nelly${sep}`);