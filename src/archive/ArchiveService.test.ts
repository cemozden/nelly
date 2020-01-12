import { DATABASE_INSTANCE } from "../db/SQLiteDatabase";
import { FEED_ITEMS_TABLE_NAME, FEEDS_TABLE_NAME } from "../db/DatabaseInitializer";
import SQLiteArchiveService from "./SQLiteArchiveService";
import { FeedItem, Feed } from "../rss/specifications/RSS20";
import { RSSVersion } from "../rss/specifications/RSSVersion";

describe('ArchiveService', () => {
    describe('SQLiteArchiveService', () => {

        afterAll(async () => {
            const deleteTableDataPromise = new Promise<boolean>((resolve, reject) => {
                DATABASE_INSTANCE.run(`DELETE FROM ${FEED_ITEMS_TABLE_NAME};`, async (err) => {
                    if (err) throw err;

                    resolve(true);
                });

                DATABASE_INSTANCE.run(`DELETE FROM ${FEEDS_TABLE_NAME};`, async (err) => {
                    if (err) throw err;

                    resolve(true);
                });

            });

            await deleteTableDataPromise;
        });

        const exampleFeedId = '14725836';
        const feedItems : FeedItem[] = [
            {
                title : 'Feed Item 1',
                description : 'Description 1',
                itemId : '12345678',
            },
            {
                description : 'Description 2',
                title : 'Title 2',
                itemId : '12345679',
                pubDate : new Date()
            }
        ];

        const feed : Feed = {
            feedMetadata : {
                title : 'Feed Title 1',
                description : 'Feed Description 1',
                link : 'https://example.com'
            },
            items : [],
            version : RSSVersion.RSS_20
        }

        describe('#getFeedItemIds(feedId : string)', () => {

            beforeEach(async () => {
                const deleteTableDataPromise = new Promise<boolean>((resolve, reject) => {
                    DATABASE_INSTANCE.run(`DELETE FROM ${FEED_ITEMS_TABLE_NAME};`, async (err) => {
                        if (err) throw err;

                        resolve(true);
                    });

                    DATABASE_INSTANCE.run(`DELETE FROM ${FEEDS_TABLE_NAME};`, async (err) => {
                        if (err) throw err;

                        resolve(true);
                    });

                });

                await deleteTableDataPromise;
            });
            
            it('should return empty array if no feed item is found for the given feed', async () => {
                const archiveService = new SQLiteArchiveService();
                const feedItemIdList = await archiveService.getFeedItemIds('12345678');

                expect(feedItemIdList.length).toBe(0);
            });

            it('should return an array of feed item ids if given feedId is found', async () => {
                const archiveService = new SQLiteArchiveService();

                const feedAdded = await archiveService.addFeed(feed, exampleFeedId);
                expect(feedAdded).toBe(true);

                const feedItemsAdded = await archiveService.addFeedItems(feedItems, exampleFeedId);
                
                expect(feedItemsAdded).toBe(true);
                expect(await archiveService.getFeedItemIds(exampleFeedId)).toEqual(feedItems.map(fi => fi.itemId));
            });

        });

        describe('#addFeed(feeds : Feed[])', () => {
            
            beforeEach(async () => {
                const deleteTableDataPromise = new Promise<boolean>((resolve, reject) => {
                    DATABASE_INSTANCE.run(`DELETE FROM ${FEEDS_TABLE_NAME};`, async (err) => {
                        if (err) throw err;

                        resolve(true);
                    });
                });

                await deleteTableDataPromise;
            });

            it('should add feeds successfully', async () => {
                const archiveService = new SQLiteArchiveService();
                const exampleFeedId = '14725836';

                const feeds : Feed = {
                        feedMetadata : {
                            title : 'Feed Title 1',
                            description : 'Feed Description 1',
                            link : 'https://example.com'
                        },
                        items : [],
                        version : RSSVersion.RSS_20
                }

                const feedAdded = await archiveService.addFeed(feeds, exampleFeedId);
                
                expect(feedAdded).toBe(true);
            });
        });

        describe('#addFeedItems(feedItems : FeedItem[])', () => {
            beforeEach(async () => {
                const deleteTableDataPromise = new Promise<boolean>((resolve, reject) => {
                    DATABASE_INSTANCE.run(`DELETE FROM ${FEED_ITEMS_TABLE_NAME};`, async (err) => {
                        if (err) throw err;

                        resolve(true);
                    });

                    DATABASE_INSTANCE.run(`DELETE FROM ${FEEDS_TABLE_NAME};`, async (err) => {
                        if (err) throw err;

                        resolve(true);
                    });

                });

                await deleteTableDataPromise;
            });

            it('should add feed items successfully', async () => {
                const archiveService = new SQLiteArchiveService();

                const feedAdded = await archiveService.addFeed(feed, exampleFeedId);
                expect(feedAdded).toBe(true);

                const feedItemsAdded = await archiveService.addFeedItems(feedItems, exampleFeedId);
                
                expect(feedItemsAdded).toBe(true);
                expect(await archiveService.getFeedItemIds(exampleFeedId)).toEqual(feedItems.map(fi => fi.itemId));
            });

        });

    });
});