import { DATABASE_INSTANCE } from "./SQLiteDatabase";
import { FEEDS_TABLE_NAME, FEED_ITEMS_TABLE_NAME, initializeDb } from "./DatabaseInitializer";
describe('DatabaseInitializer', () => {
/**WTFFFFFFFFFFF */
   it('should create feeds table', async () => {
    const feedTableCreationPromise = new Promise<boolean>((resolve, reject) => {
        
        DATABASE_INSTANCE.run(`DROP TABLE IF EXISTS ${FEEDS_TABLE_NAME};`, err => {
            if (err) {
                reject(err);
                return;
            }
            initializeDb();

            DATABASE_INSTANCE.all('SELECT name FROM sqlite_master WHERE type = "table"', (err, rows) => {
                if(err) reject(err);
                else resolve(rows.filter(row => row.name === FEEDS_TABLE_NAME).length > 0);
            });

        });

    }); 

    expect(feedTableCreationPromise).resolves.toBe(true);
   }); 

   it('should create feedItems folder', () => {
    const feedItemsTableCreationPromise = new Promise<boolean>((resolve, reject) => {
        
        DATABASE_INSTANCE.run(`DROP TABLE IF EXISTS ${FEED_ITEMS_TABLE_NAME};`, err => {
            if (err) {
                reject(err);
                return;
            }
            initializeDb();

            DATABASE_INSTANCE.all('SELECT name FROM sqlite_master WHERE type = "table"', (err, rows) => {
                if(err) reject(err);
                else resolve(rows.filter(row => row.name === FEED_ITEMS_TABLE_NAME).length > 0);
            });

        });

    }); 

    expect(feedItemsTableCreationPromise).resolves.toBe(true);
   });

   afterAll(() => {
       initializeDb();
   });
});