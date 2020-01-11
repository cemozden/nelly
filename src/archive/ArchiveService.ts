/**
 * The Service interface that manages operations related SQLite database tables.
 * Since database is being used as the archive of the application. The classes that implements this interface,
 * will be responsible of managing the archive as well. 
 */
export interface ArchiveService {

    getFeedItemIds(feedId : string) : Promise<string[]>;

}