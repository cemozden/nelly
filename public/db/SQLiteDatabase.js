"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var better_sqlite3_1 = __importDefault(require("better-sqlite3"));
var path_1 = require("path");
var fs_1 = require("fs");
var Logger_1 = __importDefault(require("../utils/Logger"));
/**
 * The class that generates the SQLite database instance of the application.
 * If any error occurs while trying to create/access the file, then the function shows up messages box with the error and exits the applcation.
 * @author cemozden
 */
var SQLiteDatabase = /** @class */ (function () {
    function SQLiteDatabase() {
    }
    SQLiteDatabase.initializeDb = function () {
        try {
            this.getDatabaseInstance().exec("CREATE TABLE IF NOT EXISTS " + this.FEEDS_TABLE_NAME + "(\n                feedId char(8) PRIMARY KEY NOT NULL,\n                version char(1) NOT NULL,\n                title varchar(255) NOT NULL,\n                link varchar(255) NOT NULL,\n                description varchar(255) NOT NULL,\n                imageURL varchar(255) NULL,\n                insertedAt datetime\n            );");
            this.getDatabaseInstance().exec("CREATE TABLE IF NOT EXISTS " + this.FEED_ITEMS_TABLE_NAME + " (\n                itemId char(8) NOT NULL,\n                feedId char(8) NOT NULL,\n                title TEXT,\n                description TEXT,\n                link varchar(255),\n                author varchar(150),\n                category TEXT,\n                comments varchar(250),\n                pubDate datetime,\n                enclosure TEXT,\n                guid TEXT,\n                source TEXT,\n                itemRead char(1) NOT NULL,\n                insertedAt datetime NOT NULL,\n                FOREIGN KEY(feedId) REFERENCES feeds(feedId) ON DELETE CASCADE\n            );");
        }
        catch (err) {
            Logger_1.default.error("[initializeDb] " + err.message);
            process.exit(-1);
        }
    };
    SQLiteDatabase.getDatabaseInstance = function () {
        if (this.dbInstance === undefined) {
            if (!fs_1.existsSync(this.databaseFolderPath))
                fs_1.mkdirSync(this.databaseFolderPath);
            try {
                var dbOptions = {
                    verbose: Logger_1.default.verbose
                };
                // Activate verbose if the environment is not production.
                this.dbInstance = new better_sqlite3_1.default(this.databaseFolderPath + "nelly.db", process.env.NODE_ENV === 'production' ? undefined : dbOptions);
                this.initializeDb();
            }
            catch (err) {
                Logger_1.default.error("[SQLiteDatabase->getDatabaseInstance()] " + err.message);
                process.exit(-1);
            }
            return this.dbInstance;
        }
        else
            return this.dbInstance;
    };
    SQLiteDatabase.databaseFolderPath = process.env.NODE_ENV === 'test' ? "" + process.env.PWD + path_1.sep + "testresources" + path_1.sep : process.env.DATABASE_FOLDER;
    SQLiteDatabase.FEEDS_TABLE_NAME = 'feeds';
    SQLiteDatabase.FEED_ITEMS_TABLE_NAME = 'feedItems';
    return SQLiteDatabase;
}());
exports.default = SQLiteDatabase;
//# sourceMappingURL=SQLiteDatabase.js.map