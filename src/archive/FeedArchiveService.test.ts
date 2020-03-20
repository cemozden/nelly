import { RSSVersion } from "../rss/specifications/RSSVersion";
import SQLiteFeedArchiveService from "./SQLiteFeedArchiveService";
import { Feed } from "../rss/specifications/RSS20";
import { InvalidFeedIdError } from "./FeedArchiveService";
import SQLiteDatabase from "../db/SQLiteDatabase";
import SQLiteFeedItemArchiveService from "./SQLiteFeedItemArchiveService";

describe('FeedArchiveService', () => {

    describe('SQLiteFeedArchiveService', () => {

        beforeEach(() => {
            SQLiteDatabase.getDatabaseInstance().prepare(`DELETE FROM ${SQLiteDatabase.FEED_ITEMS_TABLE_NAME};`).run();
            SQLiteDatabase.getDatabaseInstance().prepare(`DELETE FROM ${SQLiteDatabase.FEEDS_TABLE_NAME};`).run();
        });

        afterAll(() => {
            SQLiteDatabase.getDatabaseInstance().prepare(`DELETE FROM ${SQLiteDatabase.FEED_ITEMS_TABLE_NAME};`).run();
            SQLiteDatabase.getDatabaseInstance().prepare(`DELETE FROM ${SQLiteDatabase.FEEDS_TABLE_NAME};`).run();
        });

        const feed : Feed = { 
            feedMetadata : {
                title : 'Feed Title 1',
                description : 'Feed Description 1',
                link : 'https://example.com'
            },
            items : [],
            version : RSSVersion.RSS_20
        }

        describe('#addFeed(feed: Feed, feedId : string)', () => {

            it('should throw an error if the feed id is already existing in the table', () => {
                const archiveService = new SQLiteFeedArchiveService();
                const exampleFeedId = '14725856';

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

                expect(() => archiveService.addFeed(feeds, exampleFeedId)).toThrowError(new InvalidFeedIdError(`Given feed id "${exampleFeedId} is already existing in the archive!"`));
            });
            
            it('should add feeds successfully',  () => {
                const archiveService = new SQLiteFeedArchiveService();
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

        describe('#getFeed(feedId: string)', () => {
            it('should return null if feed id does not exist in the archive', () => {
                const feedItemArchiveService = new SQLiteFeedArchiveService();
                const notExistFeedId = 'xxxxxxxx';

                const feed = feedItemArchiveService.getFeed(notExistFeedId);

                expect(feed).toBeUndefined();
            });

            it('should return Feed object if feed object exists in the archive',  () => {
                const feedArchiveService = new SQLiteFeedArchiveService();
                const feedItemArchiveService = new SQLiteFeedItemArchiveService();

                const exampleFeedId = '01472583';

                const feed : Feed = {
                    version : RSSVersion.RSS_20,
                    feedMetadata : {
                        title : 'Example Title',
                        description : 'Example Description',
                        link : 'https://example.com',
                        image : {
                            link : '',
                            title: '',
                            url :''
                        }
                    },
                    items : []
                };

                const feedAdded = feedArchiveService.addFeed(feed, exampleFeedId);
                expect(feedAdded).toBe(true);

                const getFeed = feedArchiveService.getFeed(exampleFeedId);

                expect(getFeed).not.toBeNull();
                expect(getFeed).toEqual(feed);
            });

        });

        describe('#updateFeed(feedId: string, feed: Feed)', () => {

            it('should throw an error if feed id is not a valid string or empty string', () => {
                const feedArchiveService = new SQLiteFeedArchiveService();

                expect(() => {feedArchiveService.updateFeed('', {
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
                const feedArchiveService = new SQLiteFeedArchiveService();
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

                expect(feedArchiveService.updateFeed(feedId, updatedFeed)).toBe(false);

            });

            it('should return true if feed is updated', () => {
                const feedArchiveService = new SQLiteFeedArchiveService();
                const feedId = '13698521';
                
                const feedAdded = feedArchiveService.addFeed(feed, feedId);
                expect(feedAdded).toBe(true);

                const updatedFeed : Feed = {
                    feedMetadata : {
                        title : 'Updated Feed Title 1',
                        description : 'Updated Feed Description 1',
                        link : 'https://example.com',
                        image : {
                            link : '',
                            title : '',
                            url : ''
                        }                     
                    },
                    items : [],
                    version : RSSVersion.RSS_20
                }

                expect(feedArchiveService.updateFeed(feedId, updatedFeed)).toBe(true);
                const updatedFeedFromDb = feedArchiveService.getFeed(feedId);

                expect(updatedFeedFromDb).not.toBeUndefined();
                expect(updatedFeedFromDb?.feedMetadata).not.toBeUndefined();
                expect(updatedFeedFromDb?.feedMetadata).toEqual(updatedFeed.feedMetadata);
                
            });

        });

        describe('#deleteFeed(feedId: string)', () => {
            it('should return false if no feed is deleted', () => {
                const feedArchiveService = new SQLiteFeedArchiveService();

                expect(feedArchiveService.deleteFeed('no_exist')).toBe(false);
            });

            it('should return true if feed is deleted', () => {
                const feedArchiveService = new SQLiteFeedArchiveService();
                const newFeedId = 'abcdefgh';

                const newFeed : Feed = {
                    feedMetadata : {
                        title : 'Updated Feed Title 1',
                        description : 'Updated Feed Description 1',
                        link : 'https://example.com'
                    },
                    items : [],
                    version : RSSVersion.RSS_20
                }
                expect(feedArchiveService.addFeed(newFeed, newFeedId)).toBe(true);
                expect(feedArchiveService.deleteFeed(newFeedId)).toBe(true);
            });

            it('should delete items of the feed', () => {
                const feedArchiveService = new SQLiteFeedArchiveService();
                const feedItemArchiveService = new SQLiteFeedItemArchiveService();

                const exampleFeedId = '01472585';

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
                            },
                            read : false
                        }
                    ]
                };
                
                expect(feedArchiveService.addFeed(feed, exampleFeedId)).toBe(true);
                expect(feedItemArchiveService.addFeedItems(feed.items, exampleFeedId)).toBe(true);
                expect(feedArchiveService.deleteFeed(exampleFeedId));

                const feedIds = feedItemArchiveService.getFeedItemIds(exampleFeedId);
                expect(feedIds.length).toBe(0);
            });

        });

    });

});