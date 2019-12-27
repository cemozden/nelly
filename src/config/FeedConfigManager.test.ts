import { join, sep } from "path";
import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from "fs";
import { sync } from "rimraf";
import JSONFeedConfigManager from "./JSONFeedConfigManager";
import { FeedCategory, FeedConfig, isFeedConfig, InvalidFeedConfigIdError, NotUniqueFeedConfigIdError } from "./FeedConfigManager";
import { TimeUnit } from "../time/TimeUnit";

describe('FeedManager', () => {
    const tmpFeedsFolder = join(process.env.CONFIG_DIR as string, 'feeds/');

    beforeAll(() => {
        sync(tmpFeedsFolder);
    });

    describe('#isFeedConfig(obj : any)', () => {
        it('should return false if the object is not FeedConfig object', () => {
            const sample1 = {};
            const sample2 = {feedId : ""};
            const sample3 = {feedId : "", categoryId : ""};
            const sample4 = {feedId : "", categoryId : "", name : ""};
            const sample5 = {feedId : "", categoryId : "", name : "", url : ""};
            const sample6 = {feedId : "", categoryId : "", name : "", url : "", fetchPeriod : null};
            const sample7 = {feedId : "", categoryId : "", name : "", fetchPeriod : null};

            expect(isFeedConfig(sample1)).toBe(false);
            expect(isFeedConfig(sample2)).toBe(false);
            expect(isFeedConfig(sample3)).toBe(false);
            expect(isFeedConfig(sample4)).toBe(false);
            expect(isFeedConfig(sample5)).toBe(false);
            expect(isFeedConfig(sample6)).toBe(false);
            expect(isFeedConfig(sample7)).toBe(false);
        });

        it ('should return true if the object is FeedConfig object', () => {
            const sample = {feedId : "", categoryId : "", name : "", url : "", fetchPeriod : null, enabled : false};

            expect(isFeedConfig(sample)).toBe(true);
        });
    });

    describe('JSONFeedManager', () => {

        it('should create "feeds" folder if feeds folder does not exist', () => {
            sync(tmpFeedsFolder);
            expect(existsSync(tmpFeedsFolder)).toBe(false);

            const feedManager = new JSONFeedConfigManager(tmpFeedsFolder);
            
            expect(existsSync(tmpFeedsFolder)).toBe(true);
        });

        it('should initialize the feed config list empty if there is no configuration file', () => {
            // Delete feed config files before creating the JSONFeedConfigManager object.
            if (existsSync(tmpFeedsFolder)) 
                readdirSync(tmpFeedsFolder)
                    .filter(fileName => fileName.match('[a-zA-Z0-9]{8}\.json'))
                    .forEach(f => sync(`${tmpFeedsFolder}${sep}${f}`));
            

            const feedManager = new JSONFeedConfigManager(tmpFeedsFolder);

            expect(feedManager.getFeedConfigCount()).toBe(0);
        });

        it('should load the feed configurations into the feed configuration list if any exist', () => {
            const feedId = 'eb4d45b1';

            const feedConfig : FeedConfig = {
                categoryId : '',
                enabled : true,
                feedId : feedId,
                fetchPeriod : {value : 5, unit : TimeUnit.MINUTES},
                name : 'Test Feed',
                url : 'https://example.com'
            };

            if (!existsSync(tmpFeedsFolder)) 
                mkdirSync(tmpFeedsFolder);
            
            writeFileSync(`${tmpFeedsFolder}${sep}${feedId}.json`, JSON.stringify(feedConfig));
            
            const feedManager = new JSONFeedConfigManager(tmpFeedsFolder);
            
            expect(feedManager.getFeedConfigCount()).toBeGreaterThan(0);
        });
       
        describe('#addFeedConfig(feed : FeedConfig)', () => {
            
            it('should create the feed config file in the specific category folder', () => {
                const feedId = 'eb4d45b5';
                const configFilePath = `${tmpFeedsFolder}${sep}${feedId}.json`;  
                const feedManager = new JSONFeedConfigManager(tmpFeedsFolder);

                const feedConfig : FeedConfig = {
                    feedId : feedId,
                    categoryId : '',
                    fetchPeriod : { value : 1, unit : TimeUnit.MINUTES },
                    name : 'Example RSS FeedConfig',
                    url : 'https://example.com',
                    enabled : true
                };

                const addFeedPromise = feedManager.addFeedConfig(feedConfig);
                
                return addFeedPromise.then(feedConfigAdded => {
                    expect(existsSync(configFilePath)).toBe(true);
                    expect(feedConfigAdded).toEqual(true);
                });

            });

            it('should not allow to add a feed config if feed config id is already existing', async () => {
                const feedConfigId = '12345678';
                const feedManager = new JSONFeedConfigManager(tmpFeedsFolder);
                
                const feedConfig : FeedConfig = {
                    feedId : feedConfigId,
                    categoryId : '',
                    fetchPeriod : { value : 1, unit : TimeUnit.MINUTES },
                    name : 'Example RSS FeedConfig',
                    url : 'https://example.com',
                    enabled : true
                };

                const firstFeedAdded = await feedManager.addFeedConfig(feedConfig);
                expect(firstFeedAdded).toBe(true);

                return expect(feedManager.addFeedConfig(feedConfig)).rejects.toThrowError(new NotUniqueFeedConfigIdError(`The feed config id is not unique. There is already a feed config which has the same feed config id ${feedConfigId}`));
            });

            it('should add the feed into the feeds config list', () => {
                
                const feedId = 'ab4d45b1';
                
                const feedManager = new JSONFeedConfigManager(tmpFeedsFolder);

                const feed : FeedConfig = {
                    feedId : feedId,
                    categoryId : '',
                    fetchPeriod : { value : 1, unit : TimeUnit.MINUTES },
                    name : 'Example RSS FeedConfig',
                    url : 'https://example.com',
                    enabled : true
                };

                const feedConfigCount = feedManager.getFeedConfigCount();
                const addFeedPromise = feedManager.addFeedConfig(feed);
                
                return addFeedPromise.then(feedAdded => {
                    expect(feedAdded).toBe(true);
                    expect(feedManager.getFeedConfigCount()).toEqual(feedConfigCount + 1);
                });
            });
        });

        describe('#updateFeedConfig(feedId : string, feed: FeedConfig)', () => {
            it('should return a "rejected" Promise with an error reason if feedId cannot be found in the feed config list', async () => {
                const feedManager = new JSONFeedConfigManager(tmpFeedsFolder);
                const feedToBeAdded : FeedConfig = {
                    feedId : 'notexist',
                    categoryId : '',
                    fetchPeriod : { value : 1, unit : TimeUnit.MINUTES },
                    name : 'Example RSS FeedConfig',
                    url : 'https://example.com',
                    enabled : true
                };

                const feedConfigAdded = await feedManager.addFeedConfig(feedToBeAdded);
                expect(feedConfigAdded).toBe(true);

                const invalidFeedId = '11111111';
                return expect(feedManager.updateFeedConfig(invalidFeedId, feedToBeAdded)).rejects.toThrowError(new InvalidFeedConfigIdError(`Update failed. There is no feed config with the id "${invalidFeedId}".`));
        });

        it('should update the updated feed config in the feed config list', async () => {
            const feedManager = new JSONFeedConfigManager(tmpFeedsFolder);
            const feedToBeAddedUpdated : FeedConfig = {
                feedId : 'xxxxxxxx',
                categoryId : '',
                fetchPeriod : { value : 1, unit : TimeUnit.MINUTES },
                name : 'Example RSS FeedConfig',
                url : 'https://example.com',
                enabled : true
            };
            
            const feedConfigAdded = await feedManager.addFeedConfig(feedToBeAddedUpdated);

            expect(feedConfigAdded).toBe(true);
            feedToBeAddedUpdated.name = 'Updated RSS Config';

            const feedConfigUpdated = await feedManager.updateFeedConfig('xxxxxxxx', feedToBeAddedUpdated);
            expect(feedConfigUpdated).toBe(true);

            const updatedFeed = feedManager.getFeedConfig(feedToBeAddedUpdated.feedId);
            expect(updatedFeed === feedToBeAddedUpdated);
        });

        it('should update the feed config file with the new values', async () => {
            const feedManager = new JSONFeedConfigManager(tmpFeedsFolder);
            const feedId = 'xaxxxxxx';

            const feedToBeAddedUpdated : FeedConfig = {
                feedId : feedId,
                categoryId : '',
                fetchPeriod : { value : 1, unit : TimeUnit.MINUTES },
                name : 'Example RSS FeedConfig',
                url : 'https://example.com',
                enabled : true
            };
            
            const feedConfigAdded = await feedManager.addFeedConfig(feedToBeAddedUpdated);
            
            expect(feedConfigAdded).toBe(true);
            feedToBeAddedUpdated.name = 'Updated RSS Config';

            const feedConfigUpdated = await feedManager.updateFeedConfig(feedId, feedToBeAddedUpdated);
            expect(feedConfigUpdated).toBe(true);
            
            const updatedFeedConfigFilePath = `${tmpFeedsFolder}${sep}${feedId}.json`;
            const updatedFeedConfigFromFile = JSON.parse(readFileSync(updatedFeedConfigFilePath).toString());
            
            expect(updatedFeedConfigFromFile).toEqual(feedToBeAddedUpdated);
        });
    });

    describe('#deleteFeedConfig(feedId : string)', () => {
        it('should return a "rejected" Promise with an error reason if feedId cannot be found in the feed config list', async () => {
            const feedManager = new JSONFeedConfigManager(tmpFeedsFolder);
            const feedToBeAdded : FeedConfig = {
                    feedId : 'xbxxxxxx',
                    categoryId : '',
                    fetchPeriod : { value : 1, unit : TimeUnit.MINUTES },
                    name : 'Example RSS FeedConfig',
                    url : 'https://example.com',
                    enabled : true
                };

            const feedConfigAdded = await feedManager.addFeedConfig(feedToBeAdded);
            
            expect(feedConfigAdded).toBe(true);

            const invalidFeedId = '11111111';
            return expect(feedManager.deleteFeedConfig(invalidFeedId)).rejects.toThrowError(new InvalidFeedConfigIdError(`Deletion failed. There is no feed config with the id "${invalidFeedId}".`));
        });

        it('should remove the feed config from the feed config list', async () => {
            const feedManager = new JSONFeedConfigManager(tmpFeedsFolder);
            const feedId = 'xcxxxxxx';

            const feedToBeAddedDeleted : FeedConfig = {
                feedId : feedId,
                categoryId : '',
                fetchPeriod : { value : 1, unit : TimeUnit.MINUTES },
                name : 'Example RSS FeedConfig',
                url : 'https://example.com',
                enabled : true
            };
            
            const feedConfigAdded = await feedManager.addFeedConfig(feedToBeAddedDeleted);
            expect(feedConfigAdded).toBe(true);

            const feedConfigDeleted = await feedManager.deleteFeedConfig(feedId);
            
            expect(feedConfigDeleted).toBe(true);
            expect(feedManager.getFeedConfig(feedId)).toBeNull();
        });

        it('should delete the feed config file', async () => {
            const feedManager = new JSONFeedConfigManager(tmpFeedsFolder);
            const feedId = 'xdxxxxxx';
 
            const feedToBeAddedDeleted : FeedConfig = {
                feedId : feedId,
                categoryId : '',
                fetchPeriod : { value : 1, unit : TimeUnit.MINUTES },
                name : 'Example RSS FeedConfig',
                url : 'https://example.com',
                enabled : true
            };
            
            const feedConfigAdded = await feedManager.addFeedConfig(feedToBeAddedDeleted);
            expect(feedConfigAdded).toBe(true);

            const feedConfigDeleted = await feedManager.deleteFeedConfig(feedId);
            const deletedFileConfigFilePath = `${tmpFeedsFolder}${sep}${feedId}.json`;
            
            expect(feedConfigDeleted).toBe(true);
            expect(existsSync(deletedFileConfigFilePath)).toBe(false);
        });

    });

    describe.skip('#addFeedCategory(feedCategory : FeedCategory)', () => {

    });

    describe.skip('#updateFeedCategory(feedCategory : FeedCategory)', () => {

    });

    describe.skip('#deleteFeedCategory(feedCategory : FeedCategory)', () => {

    });

  });

});