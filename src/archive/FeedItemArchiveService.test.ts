import SQLiteFeedItemArchiveService from "./SQLiteFeedItemArchiveService";
import { FeedItem, Feed } from "../rss/specifications/RSS20";
import { RSSVersion } from "../rss/specifications/RSSVersion";
import SQLiteDatabase from "../db/SQLiteDatabase";
import { InvalidFeedItemIdError } from "./FeedItemArchiveService";
import SQLiteFeedArchiveService from "./SQLiteFeedArchiveService";
import { TimeUnit } from "../time/TimeUnit";

describe('FeedItemArchiveService', () => {

    describe('SQLiteFeedItemArchiveService', () => {

        beforeEach(() => {
            SQLiteDatabase.getDatabaseInstance().prepare(`DELETE FROM ${SQLiteDatabase.FEED_ITEMS_TABLE_NAME};`).run();
            SQLiteDatabase.getDatabaseInstance().prepare(`DELETE FROM ${SQLiteDatabase.FEEDS_TABLE_NAME};`).run();            
        });

        afterAll(() => {
            SQLiteDatabase.getDatabaseInstance().prepare(`DELETE FROM ${SQLiteDatabase.FEED_ITEMS_TABLE_NAME};`).run();
            SQLiteDatabase.getDatabaseInstance().prepare(`DELETE FROM ${SQLiteDatabase.FEEDS_TABLE_NAME};`).run();            
        });

        const exampleFeedId = '14725836';
        const feedItems : FeedItem[] = [
            {
                title : 'Feed Item 1',
                feedId : exampleFeedId,
                description : 'Description 1',
                itemId : '12345678',
                read : false,
                pubDate : new Date()
            },
            {
                description : 'Description 2',
                title : 'Title 2',
                itemId : '12345679',
                feedId : exampleFeedId,
                pubDate : new Date(),
                read : false
            }
        ];

        const feed : Feed = {
            insertedAt : new Date(),
            feedMetadata : {
                title : 'Feed Title 1',
                description : 'Feed Description 1',
                link : 'https://example.com'
            },
            items : [
                {
                    title:'Test Title',
                    description : 'Test Description',
                    itemId : '01234567',
                    feedId : exampleFeedId,
                    read : false,
                    pubDate : new Date()
                }
            ],
            version : RSSVersion.RSS_20
        }

        describe('#getFeedItemIds(feedId : string)', () => {
            
            it('should return empty array if no feed item is found for the given feed',  () => {
                const archiveService = new SQLiteFeedItemArchiveService();
                const feedItemIdList = archiveService.getFeedItemIds('12345678');

                expect(feedItemIdList.length).toBe(0);
            });

            it('should return an array of feed item ids if given feedId is found',  () => {
                const feedItemArchiveService = new SQLiteFeedItemArchiveService();
                const feedArchiveService = new SQLiteFeedArchiveService();

                const feedAdded = feedArchiveService.addFeed(feed, exampleFeedId);
                expect(feedAdded).toBe(true);

                const feedItemsAdded = feedItemArchiveService.addFeedItems(feedItems, exampleFeedId);
                
                expect(feedItemsAdded).toBe(true);
                expect(feedItemArchiveService.getFeedItemIds(exampleFeedId)).toEqual(feedItems.map(fi => fi.itemId));
            });

        });

        describe('#getFeedItems(feedId: string, startDate: Date, endDate: Date, allItems : boolean = false)', () => {
            it('should return an array of feed items', () => {
                const feedItemArchiveService = new SQLiteFeedItemArchiveService();
                const feedArchiveService = new SQLiteFeedArchiveService();

                const feedAdded = feedArchiveService.addFeed(feed, exampleFeedId);
                expect(feedAdded).toBe(true);

                const feedItemsAdded = feedItemArchiveService.addFeedItems(feedItems, exampleFeedId);
                
                expect(feedItemsAdded).toBe(true);

                const startDate = new Date();
                const endDate = new Date();

                endDate.setMinutes(59);
                endDate.setHours(23);
                endDate.setSeconds(59);

                startDate.setMinutes(0);
                startDate.setHours(0);
                startDate.setSeconds(0);

                const items = feedItemArchiveService.getFeedItems('14725836', startDate, endDate, false, -1);
                
                expect(items.length).toBeGreaterThan(0);
            });
        });

        describe('#addFeedItems(feedItems : FeedItem[])', () => {

            it('should throw an error if any feed items are already existing in the database', () => {
                const feedItemArchiveService = new SQLiteFeedItemArchiveService();
                const feedArchiveService = new SQLiteFeedArchiveService();

                const feedAdded = feedArchiveService.addFeed(feed, exampleFeedId);
                expect(feedAdded).toBe(true);

                const feedItemsAdded = feedItemArchiveService.addFeedItems(feedItems, exampleFeedId);
                
                expect(feedItemsAdded).toBe(true);
                expect(feedItemArchiveService.getFeedItemIds(exampleFeedId)).toEqual(feedItems.map(fi => fi.itemId));
                
                const feedItemIdExistErrorMessageValues = feedItems.map(fi => fi.itemId).join(', ');
                expect(() => feedItemArchiveService.addFeedItems(feedItems, exampleFeedId)).toThrowError(new InvalidFeedItemIdError(`Unable to add feed items. There is/are feed item id(s) which are already existing in the database. They are "${feedItemIdExistErrorMessageValues}"`));
            });

            it('should add feed items successfully',  () => {
                const feedItemArchiveService = new SQLiteFeedItemArchiveService();
                const feedArchiveService = new SQLiteFeedArchiveService();

                const feedAdded = feedArchiveService.addFeed(feed, exampleFeedId);
                expect(feedAdded).toBe(true);

                const feedItemsAdded = feedItemArchiveService.addFeedItems(feedItems, exampleFeedId);
                
                expect(feedItemsAdded).toBe(true);
                expect(feedItemArchiveService.getFeedItemIds(exampleFeedId)).toEqual(feedItems.map(fi => fi.itemId));
            });

        });

        describe('#deleteFeedItems(itemIds: string[])', () => {
            it('should delete given feed items', () => {
                const feedItemArchiveService = new SQLiteFeedItemArchiveService();
                const feedArchiveService = new SQLiteFeedArchiveService();

                const exampleFeedId = 'zaqxswcd';

                expect(feedArchiveService.addFeed(feed, exampleFeedId)).toBe(true);
                expect(feedItemArchiveService.addFeedItems(feedItems, exampleFeedId)).toBe(true);

                expect(feedItemArchiveService.deleteFeedItems(feedItems.map(fi => fi.itemId))).toBeGreaterThan(0);
            });
        });

        describe('#cleanFeedItems(duration : Duration)', () => {
            it('should delete feed items according to the given duration', () => {
                const feedItemArchiveService = new SQLiteFeedItemArchiveService();
                const feedArchiveService = new SQLiteFeedArchiveService();
                const feedId = 'lopiumnb';
                const twoMonthsAgo = new Date();

                twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

                feedArchiveService.addFeed(feed, feedId);

                const qry1Values = ['abc12345', feedId, undefined, undefined, undefined, undefined, undefined, undefined, new Date().toISOString(), undefined, undefined, undefined, 'N', twoMonthsAgo.toISOString()];
                const qry2Values = ['abc12346', feedId, undefined, undefined, undefined, undefined, undefined, undefined, new Date().toISOString(), undefined, undefined, undefined, 'N', twoMonthsAgo.toISOString()];
                
                SQLiteDatabase.getDatabaseInstance().prepare(`INSERT INTO feedItems VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(qry1Values);
                SQLiteDatabase.getDatabaseInstance().prepare(`INSERT INTO feedItems VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(qry2Values);

                expect(feedItemArchiveService.cleanFeedItems({unit : TimeUnit.MONTHS, value : 1})).toBe(2);
            });
        });

        describe('#getFeedItem(itemId: string): FeedItem | undefined', () => {
            it('should return specific feed item', () => {
                const feedItemArchiveService = new SQLiteFeedItemArchiveService();
                const feedArchiveService = new SQLiteFeedArchiveService();

                const feedAdded = feedArchiveService.addFeed(feed, exampleFeedId);
                expect(feedAdded).toBe(true);

                const feedItemsAdded = feedItemArchiveService.addFeedItems(feedItems, exampleFeedId);    
                expect(feedItemsAdded).toBe(true);

                const feedItem = feedItemArchiveService.getFeedItem('12345678');

                expect(feedItem.itemId).toEqual('12345678');
                expect(feedItem).toEqual(feedItems[0]);
            });

        });

        describe('#setFeedItemRead(itemRead: boolean, itemId: string)', () => {
            it('should set itemRead to be Y for a specific feed item', () => {
                const feedItemArchiveService = new SQLiteFeedItemArchiveService();
                const feedArchiveService = new SQLiteFeedArchiveService();

                const feedAdded = feedArchiveService.addFeed(feed, exampleFeedId);
                expect(feedAdded).toBe(true);

                const feedItemsAdded = feedItemArchiveService.addFeedItems(feedItems, exampleFeedId);    
                expect(feedItemsAdded).toBe(true);

                feedItemArchiveService.setFeedItemRead(true, '12345678');

                const feedItem = feedItemArchiveService.getFeedItem('12345678');

                expect(feedItem.read).toBe(true);

            });

            it('should set itemRead to be N for a specific feed item', () => {
                const feedItemArchiveService = new SQLiteFeedItemArchiveService();
                const feedArchiveService = new SQLiteFeedArchiveService();

                const feedAdded = feedArchiveService.addFeed(feed, exampleFeedId);
                expect(feedAdded).toBe(true);

                const feedItemsAdded = feedItemArchiveService.addFeedItems(feedItems, exampleFeedId);    
                expect(feedItemsAdded).toBe(true);

                feedItemArchiveService.setFeedItemRead(false, '12345678');

                const feedItem = feedItemArchiveService.getFeedItem('12345678');

                expect(feedItem.read).toBe(false);
            });

        });

        describe('#setFeedItemsRead(itemRead: boolean, itemId: string[])', () => {
            it('should set itemRead to be Y for specific feed items', () => {
                const feedItemArchiveService = new SQLiteFeedItemArchiveService();
                const feedArchiveService = new SQLiteFeedArchiveService();

                const feedAdded = feedArchiveService.addFeed(feed, exampleFeedId);
                expect(feedAdded).toBe(true);

                const feedItemsAdded = feedItemArchiveService.addFeedItems(feedItems, exampleFeedId);    
                expect(feedItemsAdded).toBe(true);

                feedItemArchiveService.setFeedItemsRead(true, ['12345678', '12345679']);

                const feedItem = feedItemArchiveService.getFeedItem('12345678');
                const feedItem2 = feedItemArchiveService.getFeedItem('12345679');

                expect(feedItem.read).toBe(true);
                expect(feedItem2.read).toBe(true);

            });

            it('should set itemRead to be N for specific feed items', () => {
                const feedItemArchiveService = new SQLiteFeedItemArchiveService();
                const feedArchiveService = new SQLiteFeedArchiveService();

                const feedAdded = feedArchiveService.addFeed(feed, exampleFeedId);
                expect(feedAdded).toBe(true);

                const feedItemsAdded = feedItemArchiveService.addFeedItems(feedItems, exampleFeedId);    
                expect(feedItemsAdded).toBe(true);

                feedItemArchiveService.setFeedItemsRead(false, ['12345678', '12345679']);

                const feedItem = feedItemArchiveService.getFeedItem('12345678');
                const feedItem2 = feedItemArchiveService.getFeedItem('12345679');

                expect(feedItem.read).toBe(false);
                expect(feedItem2.read).toBe(false);
            });

        });

    });
});