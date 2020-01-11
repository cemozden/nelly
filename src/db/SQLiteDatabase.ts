import * as sqlite3 from "sqlite3";
import { sep } from "path";
import { existsSync, mkdirSync } from "fs";
import logger from "../utils/Logger";
import { dialog, BrowserWindow } from "electron";


function getDatabaseObject(databaseFolderPath : string) : sqlite3.Database {
    
    if (process.env.NODE_ENV !== 'production')
        databaseFolderPath = typeof process.env.DATABASE_FOLDER === 'string' ? process.env.DATABASE_FOLDER : '';

    if (!existsSync(databaseFolderPath)) 
        mkdirSync(databaseFolderPath);
    
    const sqliteObj = sqlite3.verbose();

    return new sqliteObj.Database(`${databaseFolderPath}nelly.db`, err => {
        if (err) {
            logger.error('[SQLiteDatabase] An error occured while trying to connect to the database!');
            logger.error(`[SQLiteDatabase] ${err?.message}`);
            
            if (process.env.CI === undefined) {
                const options = {
                    type: 'error',
                    buttons: ['Ok'],
                    title: 'Nelly',
                    message: err.message
                };
                dialog.showMessageBox(null as unknown as BrowserWindow, options);
            }

            process.exit(-1);
        } 

    });
}

export const DATABASE_INSTANCE : sqlite3.Database = process.env.HOME !== undefined 
    ? getDatabaseObject(`${process.env.HOME}${sep}.nelly${sep}`) 
    : getDatabaseObject(`${process.env.APPLICATION_DIR}${sep}.nelly${sep}`);