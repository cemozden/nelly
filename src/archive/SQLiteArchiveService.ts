import { ArchiveService } from "./ArchiveService";

/**
 * The archive service implemention that manages archive using SQLite database.
 */
export default class SQLiteArchiveService implements ArchiveService {

    getFeedItemIds(feedId: string): Promise<string[]> {
        throw new Error("Method not implemented.");
    }

}