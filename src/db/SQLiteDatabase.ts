import * as sqlite3 from "sqlite3";
import { sep } from "path";
import { existsSync, mkdirSync } from "fs";
import { dialog, BrowserWindow } from "electron";

/**
 * The function that generates the SQLite database instance of the application.
 * If any error occurs while trying to create/access the file, then the function shows up messages box with the error and exits the applcation.
 * @param databaseFolderPath The folder path where the database file will be located.
 */
function getDatabaseObject() : sqlite3.Database {
    
    const databaseFolderPath = process.env.NODE_ENV === 'test' ? `${process.env.PWD}${sep}testresources${sep}` : `${process.env.HOME}${sep}.nelly${sep}`;

    if (!existsSync(databaseFolderPath))
        mkdirSync(databaseFolderPath);
    
    const sqliteObj = sqlite3.verbose();

    return new sqliteObj.Database(`${databaseFolderPath}nelly.db`, err => {
        if (err) {
            
            // If the error occurs in a CI server then don't show up the messagebox.
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

export const DATABASE_INSTANCE : sqlite3.Database = getDatabaseObject();