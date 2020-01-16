import SQLiteArchiveService from "./SQLiteArchiveService";
import { FeedItem, Feed } from "../rss/specifications/RSS20";
import { RSSVersion } from "../rss/specifications/RSSVersion";
import SQLiteDatabase from "../db/SQLiteDatabase";
import { InvalidFeedIdError } from "./ArchiveService";

describe('ArchiveService', () => {

    describe('SQLiteArchiveService', () => {

        beforeEach(() => {
            SQLiteDatabase.getDatabaseInstance().prepare(`DELETE FROM ${SQLiteDatabase.FEED_ITEMS_TABLE_NAME};`).run();
            SQLiteDatabase.getDatabaseInstance().prepare(`DELETE FROM ${SQLiteDatabase.FEEDS_TABLE_NAME};`).run();
        });

        afterAll(() => {
            //SQLiteDatabase.getDatabaseInstance().prepare(`DELETE FROM ${SQLiteDatabase.FEED_ITEMS_TABLE_NAME};`).run();
            //SQLiteDatabase.getDatabaseInstance().prepare(`DELETE FROM ${SQLiteDatabase.FEEDS_TABLE_NAME};`).run();
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
            
            it('should return empty array if no feed item is found for the given feed',  () => {
                const archiveService = new SQLiteArchiveService();
                const feedItemIdList = archiveService.getFeedItemIds('12345678');

                expect(feedItemIdList.length).toBe(0);
            });

            it('should return an array of feed item ids if given feedId is found',  () => {
                const archiveService = new SQLiteArchiveService();

                const feedAdded = archiveService.addFeed(feed, exampleFeedId);
                expect(feedAdded).toBe(true);

                const feedItemsAdded = archiveService.addFeedItems(feedItems, exampleFeedId);
                
                expect(feedItemsAdded).toBe(true);
                expect(archiveService.getFeedItemIds(exampleFeedId)).toEqual(feedItems.map(fi => fi.itemId));
            });

        });

        describe('#addFeed(feeds : Feed[])', () => {

            it('should add feeds successfully',  () => {
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

                const feedAdded = archiveService.addFeed(feeds, exampleFeedId);
                
                expect(feedAdded).toBe(true);
            });
        });

        describe('#addFeedItems(feedItems : FeedItem[])', () => {
            beforeEach(() => {
                SQLiteDatabase.getDatabaseInstance().prepare(`DELETE FROM ${SQLiteDatabase.FEED_ITEMS_TABLE_NAME};`);
                SQLiteDatabase.getDatabaseInstance().prepare(`DELETE FROM ${SQLiteDatabase.FEEDS_TABLE_NAME};`);
            });

            it('should add feed items successfully',  () => {
                const archiveService = new SQLiteArchiveService();

                const feedAdded = archiveService.addFeed(feed, exampleFeedId);
                expect(feedAdded).toBe(true);

                const feedItemsAdded = archiveService.addFeedItems(feedItems, exampleFeedId);
                
                expect(feedItemsAdded).toBe(true);
                expect(archiveService.getFeedItemIds(exampleFeedId)).toEqual(feedItems.map(fi => fi.itemId));
            });

        });

        describe('#getFeed(feedId: string)', () => {
            it('should return null if feed id does not exist in the archive', () => {
                const archiveService = new SQLiteArchiveService();
                const notExistFeedId = 'xxxxxxxx';

                const feed = archiveService.getFeed(notExistFeedId);

                expect(feed).toBeUndefined();
            });

            it('should return Feed object if feed object exists in the archive',  () => {
                const archiveService = new SQLiteArchiveService();
                const exampleFeedId = '01472583';

                const feed : Feed = {
                    version : RSSVersion.RSS_20,
                    feedMetadata : {
                        title : 'Example Title',
                        description : 'Example Description',
                        link : 'https://example.com'
                    },
                    items : [
                        {
                            description : 'Feed Item description',
                            itemId : '36925814',
                            title : 'Feed Item Title',
                            pubDate : new Date(),
                            category : ['testCategory1', 'testCategory2'],
                            enclosure : {
                                length: 5,
                                type : 'enclosure_type',
                                url : 'https://example.com'
                            },
                            guid : {
                                value : 'xyz',
                                permaLink : false
                            },
                            source : {
                                url : 'https://example.com',
                                value : 'dsad'
                            }
                        }
                    ]
                };

                const feedAdded = archiveService.addFeed(feed, exampleFeedId);
                expect(feedAdded).toBe(true);

                const feedItemsAdded = archiveService.addFeedItems(feed.items, exampleFeedId);
                expect(feedItemsAdded).toBe(true);

                const getFeed = archiveService.getFeed(exampleFeedId);

                expect(getFeed).not.toBeNull();
                expect(getFeed).toEqual(feed);
            });

            it('should return feed with items', () => {
                const archiveService = new SQLiteArchiveService();
                const exampleFeedId = '01472583';

                const feed : Feed = {
                    version : RSSVersion.RSS_20,
                    feedMetadata : {
                        title : 'Example Title',
                        description : 'Example Description',
                        link : 'https://example.com'
                    },
                    items : [
                        {
                            description : 'Feed Item description',
                            itemId : '36925814',
                            title : 'Feed Item Title',
                            pubDate : new Date(),
                            category : ['testCategory1', 'testCategory2'],
                            enclosure : {
                                length: 5,
                                type : 'enclosure_type',
                                url : 'https://example.com'
                            },
                            guid : {
                                value : 'xyz',
                                permaLink : false
                            },
                            source : {
                                url : 'https://example.com',
                                value : 'dsad'
                            }
                        }
                    ]
                };

                const feedAdded = archiveService.addFeed(feed, exampleFeedId);
                expect(feedAdded).toBe(true);

                const feedItemsAdded = archiveService.addFeedItems(feed.items, exampleFeedId);
                expect(feedItemsAdded).toBe(true);

                const getFeed = archiveService.getFeed(exampleFeedId);

                expect(getFeed).not.toBeNull();
                expect(getFeed?.items).toEqual(feed.items);
            });

        });

        describe('#updateFeed(feedId: string, feed: Feed)', () => {

            it('should throw an error if feed id is not a valid string or empty string', () => {
                const archiveService = new SQLiteArchiveService();

                expect(() => {archiveService.updateFeed('', {
                    feedMetadata : {
                        description : 'Example description',
                        link : 'https://example.com',
                        title : 'Example Title'
                    },
                    items : [],
                    version : RSSVersion.RSS_20
                })}).toThrowError(new InvalidFeedIdError(`feedId parameter cannot be empty. Parameter value: ""`));

            });

            it('should return false if no feed is updated', () => {
                const archiveService = new SQLiteArchiveService();
                const feedId = '13698521';
                
                const updatedFeed : Feed = {
                    feedMetadata : {
                        title : 'Updated Feed Title 1',
                        description : 'Updated Feed Description 1',
                        link : 'https://example.com'
                    },
                    items : [],
                    version : RSSVersion.RSS_20
                }

                expect(archiveService.updateFeed(feedId, updatedFeed)).toBe(false);

            });

            it('should return true if feed is updated', () => {
                const archiveService = new SQLiteArchiveService();
                const feedId = '13698521';
                
                const feedAdded = archiveService.addFeed(feed, feedId);
                expect(feedAdded).toBe(true);

                const updatedFeed : Feed = {
                    feedMetadata : {
                        title : 'Updated Feed Title 1',
                        description : 'Updated Feed Description 1',
                        link : 'https://example.com'
                    },
                    items : [],
                    version : RSSVersion.RSS_20
                }

                expect(archiveService.updateFeed(feedId, updatedFeed)).toBe(true);
                const updatedFeedFromDb = archiveService.getFeed(feedId);

                expect(updatedFeedFromDb).not.toBeUndefined();
                expect(updatedFeedFromDb?.feedMetadata).not.toBeUndefined();
                expect(updatedFeedFromDb?.feedMetadata).toEqual(updatedFeed.feedMetadata);
                
            });

        });

    });
});